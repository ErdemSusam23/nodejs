const express = require('express');
const router = express.Router();
const Categories = require('../db/models/Categories');
const Response = require('../lib/Response');
const Enums = require('../config/Enums');
const CustomError = require('../lib/Error');
const AuditLogs = require('../lib/AuditLogs'); 
const auth = require('../lib/auth')();

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

/* GET Categories - Listeleme */
router.get('/', async function(req, res, next) {
    try {
        let categories = await Categories.find({});
        res.json(Response.successResponse(categories));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    } 
});

/* POST Add Category - Ekleme */
router.post('/add', async function(req, res, next) {
    let body = req.body;
    try {
        if (!body.name) {
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'The name field is required to create a category');
        }

        let category = new Categories({
            name: body.name,
            is_active: body.is_active,
            created_by: req.user?.id
        });

        await category.save();

        // --- 2. BAŞARILI LOG (INFO) ---
        AuditLogs.info(req.user?.email, "Categories", "Add", category);

        res.json(Response.successResponse(category));
    } catch (err) {
        // --- 3. HATA LOGU (ERROR) ---
        AuditLogs.error(req.user?.email, "Categories", "Add", err);

        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Update Category - Güncelleme */
router.post('/update', async function(req, res, next) {
    let body = req.body;
    try {
        if (!body._id) {
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'The _id field is required to update a category');
        }

        let updates = {};
        if (body.name) updates.name = body.name;
        if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

        // DÜZELTME: updateOne sonucunu bir değişkene atıyoruz
        // Eğer hiçbir kayıt eşleşmezse (matchedCount === 0), bu ID yok demektir.
        // NOT: updateOne yerine findByIdAndUpdate de kullanılabilir ama bu yöntem de performanslıdır.
        let result = await Categories.updateOne({ _id: body._id }, { $set: updates });

        if (result.matchedCount === 0) {
            throw new CustomError(Enums.HTTP_CODES.NOT_FOUND, 'Update Error', 'Category not found with this _id');
        }

        AuditLogs.info(req.user?.email, "Categories", "Update", { _id: body._id, ...updates });

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        AuditLogs.error(req.user?.email, "Categories", "Update", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Delete Category - Silme */
router.post('/delete', async function(req, res, next) {
    let body = req.body;
    try {
        if (!body._id) {
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', '_id is required to delete');
        }

        // DÜZELTME: deleteOne sonucunu kontrol ediyoruz
        let result = await Categories.deleteOne({ _id: body._id });

        if (result.deletedCount === 0) {
            throw new CustomError(Enums.HTTP_CODES.NOT_FOUND, 'Delete Error', 'Category not found with this _id');
        }

        AuditLogs.info(req.user?.email, "Categories", "Delete", { _id: body._id });

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        AuditLogs.error(req.user?.email, "Categories", "Delete", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

module.exports = router;