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
const schemas = require('./validations/Roles'); // Bu dosyayı oluşturduğundan emin ol

// 1. Tüm isteklerde Authentication (Token) kontrolü olsun
router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

/* GET Roles - Listeleme */
router.get('/', auth.checkPrivileges("role_view"), async function(req, res, next) {
    try {
        let roles = await Roles.find({});
        res.json(Response.successResponse(roles));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* GET Privileges - Sistemdeki Tüm Yetkileri Listele (Frontend'de Checkbox'ları çizmek için) */
router.get('/permissions', async function(req, res, next) {
    res.json(Response.successResponse(role_privileges));
});

/* GET Role Privileges - Bir Role Ait Yetkileri Listele */
router.get('/role_privileges', auth.authenticate(), auth.checkPrivileges("role_view"), async function(req, res, next) {
    try {
        // GET isteklerinde veriler req.body değil, req.query içindedir
        let body = req.query; 

        if (!body.role_id) {
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'role_id field is required');
        }

        // RolePrivileges tablosundan bu role ait kayıtları çek
        let privileges = await RolePrivileges.find({ role_id: body.role_id });

        // İPUCU: Frontend geliştirici sadece permission stringlerini (örn: ["user_add", "role_view"]) 
        // istiyorsa, veriyi mapleyip de dönebilirsin. Şimdilik obje dönüyoruz.
        res.json(Response.successResponse(privileges));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Add Role - Ekleme */
router.post('/add', auth.checkPrivileges("role_add"), validate(schemas.create), async function(req, res, next) {
    let body = req.body;
    try {
        // Mükerrer Rol İsmi Kontrolü
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

        // Rol Yetkilerini Ekleme
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

/* POST Update Role - Güncelleme */
router.post('/update', auth.checkPrivileges("role_update"), validate(schemas.update), async (req, res) => {
    const body = req.body;
    try {
        let updates = {};
        if (body.role_name) updates.role_name = body.role_name;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

        // Mükerrer İsim Kontrolü (Kendisi hariç)
        if (body.role_name) {
             let existingRole = await Roles.findOne({ role_name: body.role_name, _id: { $ne: body._id } });
             if (existingRole) {
                 throw new CustomError(Enums.HTTP_CODES.CONFLICT, req.t('COMMON.ALREADY_EXIST'), req.t('COMMON.ALREADY_EXIST'));
             }
        }

        await Roles.updateOne({ _id: body._id }, { $set: updates });

        // Yetkileri Güncelle (Sync: Sil ve Yeniden Ekle)
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

/* POST Delete Role - Silme */
router.post('/delete', auth.checkPrivileges("role_delete"), async function(req, res, next) {
    let body = req.body;
    try {
        // Validate Middleware kullanmadık (sadece ID lazım), manuel kontrol veya basit Joi şeması kullanılabilir.
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