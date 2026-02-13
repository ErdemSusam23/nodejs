const express = require('express');
const router = express.Router();
const Roles = require('../db/models/Roles'); 
const RolePrivileges = require('../db/models/RolePrivileges'); // EKLENDİ
const rolePrivileges = require('../config/role_privileges');
const Response = require('../lib/Response');
const Enums = require('../config/Enums');
const CustomError = require('../lib/Error');

router.get('/', async function(req, res, next) {
    try {
        let roles = await Roles.find({});
        res.json(Response.successResponse(roles));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

router.post('/add', async function(req, res, next) {
    let body = req.body;
    try {
        if (!body.role_name) {
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'role_name field is required');
        }

        if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length == 0) {
             throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'permissions field must be an array');
        }

        let role = new Roles({
            role_name: body.role_name, 
            is_active: body.is_active,
            created_by: req.user?.id 
        });

        await role.save();

        for (let i = 0; i < body.permissions.length; i++) {
            let priv = new RolePrivileges({
                role_id: role._id,
                permission: body.permissions[i],
                created_by: req.user?.id
            });
            await priv.save();
        }

        res.json(Response.successResponse(role));

    } catch (err) {
        if (err.code == 11000) {
            let error = new CustomError(Enums.HTTP_CODES.CONFLICT, 'Conflict', 'Bu isimde bir rol zaten mevcut!');
            let errorResponse = Response.errorResponse(error);
            return res.status(Enums.HTTP_CODES.CONFLICT).json(errorResponse);
        }

        let errorResponse = Response.errorResponse(err);
        res.status(err.status || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

router.post('/update', async function(req, res, next) {
    let body = req.body;
    try {
        if (!body._id) {
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', '_id field is required to update');
        }

        let updates = {};
        if (body.role_name) updates.role_name = body.role_name;
        if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

        await Roles.updateOne({ _id: body._id }, { $set: updates });

        if (body.permissions && Array.isArray(body.permissions) && body.permissions.length > 0) {
            
            await RolePrivileges.deleteMany({ role_id: body._id });

            for (let i = 0; i < body.permissions.length; i++) {
                let priv = new RolePrivileges({
                    role_id: body._id,
                    permission: body.permissions[i],
                    created_by: req.user?.id
                });
                await priv.save();
            }
        }

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

router.post('/delete', async function(req, res, next) {
    let body = req.body;
    try {
        if (!body._id) {
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', '_id field is required to delete');
        }

        // Rolü siliyoruz
        await Roles.deleteOne({ _id: body._id });
        
        // DİKKAT: Rol silindiğinde, ona bağlı yetkilerin de silinmesi gerekir (Veri tutarlılığı için)
        await RolePrivileges.deleteMany({ role_id: body._id });

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        if (err.code == 11000) {
            let error = new CustomError(Enums.HTTP_CODES.CONFLICT, 'Conflict', 'Bu rol ismi zaten kullanımda!');
            let errorResponse = Response.errorResponse(error);
            return res.status(Enums.HTTP_CODES.CONFLICT).json(errorResponse);
        }

        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

router.get('/privileges', async function(req, res, next) {
    res.json(Response.successResponse(rolePrivileges));
});

module.exports = router;