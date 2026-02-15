const express = require('express');
const router = express.Router();

const Roles = require('../db/models/Roles'); 
const RolePrivileges = require('../db/models/RolePrivileges'); 
const role_privileges = require('../config/role_privileges');

const Response = require('../lib/Response');
const Enums = require('../config/Enums');
const CustomError = require('../lib/Error');
const AuditLogs = require('../lib/AuditLogs'); 

const auth = require('../lib/auth')();
const validate = require('../lib/validate');
const schemas = require('./validations/Roles');

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

/* GET Roles */
router.get('/', auth.checkPrivileges("role_view"), async function(req, res, next) {
    /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Get all roles'
        #swagger.description = 'Retrieve a list of all roles in the system'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.responses[200] = {
            description: 'Roles retrieved successfully'
        }
    */
    try {
        let roles = await Roles.find({});
        res.json(Response.successResponse(roles));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* GET Privileges */
router.get('/permissions', async function(req, res, next) {
    /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Get all available permissions'
        #swagger.description = 'Retrieve all system permissions for role assignment'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.responses[200] = {
            description: 'Permissions retrieved successfully'
        }
    */
    res.json(Response.successResponse(role_privileges));
});

/* GET Role Privileges */
router.get('/role_privileges', auth.authenticate(), auth.checkPrivileges("role_view"), async function(req, res, next) {
    /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Get privileges for a specific role'
        #swagger.description = 'Retrieve all privileges assigned to a role'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['role_id'] = {
            in: 'query',
            description: 'Role ID',
            required: true,
            type: 'string',
            example: '507f1f77bcf86cd799439012'
        }
        #swagger.responses[200] = {
            description: 'Role privileges retrieved successfully'
        }
    */
    try {
        let body = req.query; 

        if (!body.role_id) {
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'role_id field is required');
        }

        let privileges = await RolePrivileges.find({ role_id: body.role_id });
        res.json(Response.successResponse(privileges));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Add Role */
router.post('/add', auth.checkPrivileges("role_add"), validate(schemas.create), async function(req, res, next) {
    /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Add a new role'
        #swagger.description = 'Create a new role with permissions'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Role information',
            required: true,
            schema: {
                role_name: 'Admin',
                is_active: true,
                permissions: ['user_view', 'user_add', 'user_update', 'user_delete']
            }
        }
        #swagger.responses[200] = {
            description: 'Role created successfully'
        }
    */
    let body = req.body;
    try {
        let existingRole = await Roles.findOne({ role_name: body.role_name });
        if (existingRole) {
            throw new CustomError(Enums.HTTP_CODES.CONFLICT, req.t('COMMON.ALREADY_EXIST'), req.t('COMMON.ALREADY_EXIST'));
        }

        let role = new Roles({
            role_name: body.role_name, 
            is_active: body.is_active,
            created_by: req.user?.id 
        });

        await role.save();

        if (body.permissions && Array.isArray(body.permissions)) {
            for (let permission of body.permissions) {
                let priv = new RolePrivileges({
                    role_id: role._id,
                    permission: permission,
                    created_by: req.user?.id
                });
                await priv.save();
            }
        }

        AuditLogs.info(req.user?.email, "Roles", "Add", { _id: role._id, role_name: role.role_name });
        res.json(Response.successResponse(role));

    } catch (err) {
        AuditLogs.error(req.user?.email, "Roles", "Add", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Update Role */
router.post('/update', auth.checkPrivileges("role_update"), validate(schemas.update), async (req, res) => {
    /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Update an existing role'
        #swagger.description = 'Update role information and permissions'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Role update information',
            required: true,
            schema: {
                _id: '507f1f77bcf86cd799439012',
                role_name: 'Super Admin',
                is_active: true,
                permissions: ['user_view', 'user_add', 'user_update', 'user_delete']
            }
        }
        #swagger.responses[200] = {
            description: 'Role updated successfully'
        }
    */
    const body = req.body;
    try {
        let updates = {};
        if (body.role_name) updates.role_name = body.role_name;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

        if (body.role_name) {
             let existingRole = await Roles.findOne({ role_name: body.role_name, _id: { $ne: body._id } });
             if (existingRole) {
                 throw new CustomError(Enums.HTTP_CODES.CONFLICT, req.t('COMMON.ALREADY_EXIST'), req.t('COMMON.ALREADY_EXIST'));
             }
        }

        await Roles.updateOne({ _id: body._id }, { $set: updates });

        if (body.permissions && Array.isArray(body.permissions)) {
            await RolePrivileges.deleteMany({ role_id: body._id }); 
            for (let permission of body.permissions) {
                await RolePrivileges.create({
                    role_id: body._id,
                    permission: permission,
                    created_by: req.user.id
                });
            }
        }

        AuditLogs.info(req.user.email, "Roles", "Update", { _id: body._id, ...updates });
        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        AuditLogs.error(req.user.email, "Roles", "Update", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Delete Role */
router.post('/delete', auth.checkPrivileges("role_delete"), async function(req, res, next) {
    /*
        #swagger.tags = ['Roles']
        #swagger.summary = 'Delete a role'
        #swagger.description = 'Delete a role and its associated privileges'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Role ID to delete',
            required: true,
            schema: {
                _id: '507f1f77bcf86cd799439012'
            }
        }
        #swagger.responses[200] = {
            description: 'Role deleted successfully'
        }
    */
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', '_id field is required');

        await Roles.deleteOne({ _id: body._id });
        await RolePrivileges.deleteMany({ role_id: body._id });

        AuditLogs.info(req.user?.email, "Roles", "Delete", { _id: body._id });
        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        AuditLogs.error(req.user?.email, "Roles", "Delete", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

module.exports = router;