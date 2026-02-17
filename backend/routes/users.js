const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const Roles = require('../db/models/Roles');
const RolePrivileges = require('../db/models/RolePrivileges');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enums = require('../config/Enums');
const AuditLogs = require('../lib/AuditLogs'); 
const role_privileges = require('../config/role_privileges');
const Export = require('../lib/Export');

const auth = require('../lib/auth')();
const validate = require('../lib/validate');
const schemas = require('./validations/Users');

/* GET Users Listing - Listeleme ve Filtreleme */
router.get('/', auth.authenticate(), auth.checkPrivileges("user_view"), async function(req, res, next) {
    /*
        #swagger.tags = ['Users']
        #swagger.summary = 'Get all users'
        #swagger.description = 'Retrieve a list of all users with their roles'
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.parameters['page']  = { in: 'query', type: 'integer', example: 1 }
        #swagger.parameters['limit'] = { in: 'query', type: 'integer', example: 10 }
        #swagger.parameters['email'] = { in: 'query', type: 'string', example: 'user@example.com' }
        #swagger.parameters['is_active'] = { in: 'query', type: 'boolean', example: true }
        #swagger.responses[200] = { description: 'Users retrieved successfully', schema: { $ref: '#/definitions/UserListResponse' } }
        #swagger.responses[401] = { description: 'Unauthorized' }
    */
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 1. FİLTRELEME NESNESİNİ OLUŞTUR
        let match = {};

        // Frontend'den gelen 'first_name', 'email' vb. parametreleri match objesine ekle
        if (req.query.first_name) {
            match.first_name = { $regex: req.query.first_name, $options: "i" };
        }
        if (req.query.last_name) {
            match.last_name = { $regex: req.query.last_name, $options: "i" };
        }
        if (req.query.email) {
            match.email = { $regex: req.query.email, $options: "i" };
        }
        if (req.query.is_active !== undefined) {
            match.is_active = req.query.is_active === 'true';
        }

        // 2. AGGREGATION PIPELINE
        // Filtreleme ($match) en başta olmalı ki sayfalama doğru çalışsın
        let users = await Users.aggregate([
            { $match: match }, // <-- KRİTİK EKSİK BURASIYDI
            {
                $lookup: {
                    from: "user_roles",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user_roles"
                }
            },
            {
                $lookup: {
                    from: "roles",
                    localField: "user_roles.role_id",
                    foreignField: "_id",
                    as: "roles"
                }
            },
            {
                $project: {
                    password: 0,
                    user_roles: 0,
                    __v: 0
                }
            },
            { $sort: { created_at: -1 } }, // En yeni kullanıcılar üstte
            { $skip: skip },
            { $limit: limit }
        ]);

        // Toplam sayıyı da filtreye göre almalıyız
        const total = await Users.countDocuments(match); // <-- match nesnesini buraya da verdik

        res.json(Response.successResponse({
            data: users,
            pagination: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Add User - Yeni Kullanıcı Ekleme */
router.post('/add', auth.authenticate(), auth.checkPrivileges("user_add"), validate(schemas.create), async function(req, res, next) {
    /*
        #swagger.tags = ['Users']
        #swagger.summary = 'Add a new user'
        #swagger.description = 'Create a new user account'
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.parameters['body'] = {
            in: 'body', required: true,
            schema: { $ref: '#/definitions/CreateUserRequest' }
        }
        #swagger.responses[200] = { description: 'User created successfully', schema: { $ref: '#/definitions/SuccessResponse' } }
        #swagger.responses[401] = { description: 'Unauthorized' }
        #swagger.responses[409] = { description: 'Email already exists' }
    */
    let body = req.body;
    try {
        let existingUser = await Users.findOne({ email: body.email });
        if (existingUser) {
            return res.status(Enums.HTTP_CODES.CONFLICT).json(
                Response.errorResponse(new CustomError(Enums.HTTP_CODES.CONFLICT, 'Email zaten kullanımda'))
            );
        }

        // Şifre hashleme
        let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(10), null);

        let user = new Users({
            email: body.email,
            password: password,
            is_active: body.isActive !== undefined ? body.isActive : true, // Frontend'den isActive veya is_active gelebilir
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number
        });
        await user.save();

        // Rol Atama İşlemi
        if (body.roles && Array.isArray(body.roles)) {
            for (let roleId of body.roles) {
                // Rol ID'sinin geçerliliğini kontrol etmeyi düşünebilirsin
                await UserRoles.create({ role_id: roleId, user_id: user._id });
            }
        }

        AuditLogs.info(req.user?.email, "Users", "Add", { _id: user._id, email: user.email });
        
        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        AuditLogs.error(req.user?.email, "Users", "Add", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Update User */
router.post('/update', auth.authenticate(), auth.checkPrivileges("user_update"), validate(schemas.update), async function(req, res, next) {
    /*
        #swagger.tags = ['Users']
        #swagger.summary = 'Update an existing user'
        #swagger.description = 'Update user information and roles'
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.parameters['body'] = {
            in: 'body', required: true,
            schema: { $ref: '#/definitions/UpdateUserRequest' }
        }
        #swagger.responses[200] = { description: 'User updated successfully', schema: { $ref: '#/definitions/SuccessResponse' } }
        #swagger.responses[401] = { description: 'Unauthorized' }
    */
    let body = req.body;
    try {
        let updates = {};

        if (body.password && body.password.length >= 6) {
            updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(10), null);
        }
        if (body.first_name) updates.first_name = body.first_name;
        if (body.last_name) updates.last_name = body.last_name;
        if (body.phone_number) updates.phone_number = body.phone_number;
        if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

        await Users.updateOne({ _id: body._id }, { $set: updates });

        // Rolleri güncelleme: Eskileri sil, yenileri ekle
        if (body.roles && Array.isArray(body.roles)) {
            await UserRoles.deleteMany({ user_id: body._id });
            for (let roleId of body.roles) {
                await UserRoles.create({ role_id: roleId, user_id: body._id });
            }
        }

        AuditLogs.info(req.user?.email, "Users", "Update", { _id: body._id });
        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        AuditLogs.error(req.user?.email, "Users", "Update", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Delete User */
router.post('/delete', auth.authenticate(), auth.checkPrivileges("user_delete"), async function(req, res, next) {
    /*
        #swagger.tags = ['Users']
        #swagger.summary = 'Delete a user'
        #swagger.description = 'Delete a user and their role associations'
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.parameters['body'] = {
            in: 'body', required: true,
            schema: { $ref: '#/definitions/DeleteRequest' }
        }
        #swagger.responses[200] = { description: 'User deleted successfully', schema: { $ref: '#/definitions/SuccessResponse' } }
        #swagger.responses[401] = { description: 'Unauthorized' }
    */
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', '_id is required');

        await Users.deleteOne({ _id: body._id });
        await UserRoles.deleteMany({ user_id: body._id });

        AuditLogs.info(req.user?.email, "Users", "Delete", { _id: body._id });
        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        AuditLogs.error(req.user?.email, "Users", "Delete", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Login */
router.post('/login', validate(schemas.login), async (req, res) => {
    /*
        #swagger.tags = ['Users']
        #swagger.summary = 'User login'
        #swagger.description = 'Authenticate user and receive JWT token'
        #swagger.parameters['body'] = {
            in: 'body', required: true,
            schema: { $ref: '#/definitions/LoginRequest' }
        }
        #swagger.responses[200] = { description: 'Login successful', schema: { $ref: '#/definitions/LoginResponse' } }
        #swagger.responses[401] = { description: 'Invalid email or password' }
    */
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({ email: email });
        if (!user) {
            throw new CustomError(Enums.HTTP_CODES.UNAUTHORIZED, "Geçersiz email veya şifre");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new CustomError(Enums.HTTP_CODES.UNAUTHORIZED, "Geçersiz email veya şifre");
        }

        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, config.JWT.SECRET, { expiresIn: config.JWT.EXPIRE_TIME });

        AuditLogs.info(email, "Users", "Login", { _id: user._id });

        res.json(Response.successResponse({
            token: token,
            user: {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        }));

    } catch (err) {
        AuditLogs.error(req.body?.email || "Unknown", "Users", "Login", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Export Users */
router.post('/export', auth.authenticate(), auth.checkPrivileges("user_view"), async function(req, res, next) {
    /*
        #swagger.tags = ['Users']
        #swagger.summary = 'Export users to Excel'
        #swagger.description = 'Download all users as an Excel file'
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.responses[200] = { description: 'Excel file downloaded' }
        #swagger.responses[401] = { description: 'Unauthorized' }
    */
    try {
        let users = await Users.find({}, { password: 0, __v: 0 }).lean(); 

        let columns = [
            { header: 'Email', key: 'email', width: 30 },
            { header: 'First Name', key: 'first_name', width: 20 },
            { header: 'Last Name', key: 'last_name', width: 20 },
            { header: 'Phone', key: 'phone_number', width: 15 },
            { header: 'Active?', key: 'is_active', width: 10 },
            { header: 'Created At', key: 'created_at', width: 25 }
        ];

        await Export.toExcel(columns, users, "Users_List", res);

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Register */
router.post('/register', validate(schemas.create), async function(req, res, next) {
    /*
        #swagger.tags = ['Users']
        #swagger.summary = 'Initial system setup'
        #swagger.description = 'Create the first admin user. Only works on empty database.'
        #swagger.parameters['body'] = {
            in: 'body', required: true,
            schema: { $ref: '#/definitions/CreateUserRequest' }
        }
        #swagger.responses[200] = { description: 'System initialized successfully' }
        #swagger.responses[404] = { description: 'Setup already completed' }
    */
    let body = req.body;
    let createdUser = null; 

    try {
        let userCheck = await Users.findOne({});
        if (userCheck) {
            return res.status(Enums.HTTP_CODES.NOT_FOUND).json(Response.errorResponse({ message: "Initial setup already completed." }));
        }

        let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

        createdUser = new Users({
            email: body.email,
            password: password,
            is_active: true,
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number
        });
        await createdUser.save();

        let roleName = Enums.SUPER_ADMIN;
        let role = await Roles.findOne({ role_name: roleName });

        if (!role) {
            role = new Roles({ role_name: roleName, is_active: true, created_by: createdUser._id });
            await role.save();

            let permissions = role_privileges.privileges.map(p => p.key);
            for (let i = 0; i < permissions.length; i++) {
                await RolePrivileges.create({ role_id: role._id, permission: permissions[i], created_by: createdUser._id });
            }   
        }

        await UserRoles.create({ role_id: role._id, user_id: createdUser._id });

        res.json(Response.successResponse({ success: true, message: "System initialized." }));

    } catch (err) {
        if (createdUser) await Users.deleteOne({ _id: createdUser._id });
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

module.exports = router;