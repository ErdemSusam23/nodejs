const express = require('express');
const router = express.Router();
const Categories = require('../db/models/Categories');
const Response = require('../lib/Response');
const Enums = require('../config/Enums');
const CustomError = require('../lib/Error');
const AuditLogs = require('../lib/AuditLogs'); 
const auth = require('../lib/auth')(); 
const validate = require('../lib/validate');
const schemas = require('./validations/Categories');

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

/* GET Categories */
router.get('/', auth.checkPrivileges("category_view"), async function(req, res, next) {
    /*
        #swagger.tags = ['Categories']
        #swagger.summary = 'Get all categories'
        #swagger.description = 'Retrieve a list of all categories'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.responses[200] = {
            description: 'Categories retrieved successfully'
        }
    */
    try {
        let categories = await Categories.find({});
        res.json(Response.successResponse(categories));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    } 
});

/* POST Add Category */
router.post('/add', auth.checkPrivileges("category_add"), validate(schemas.create), async function(req, res, next) {
    /*
        #swagger.tags = ['Categories']
        #swagger.summary = 'Add a new category'
        #swagger.description = 'Create a new category'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Category information',
            required: true,
            schema: {
                name: 'Electronics',
                is_active: true
            }
        }
        #swagger.responses[200] = {
            description: 'Category created successfully'
        }
    */
    let body = req.body;
    try {
        let category = new Categories({
            name: body.name,
            is_active: body.is_active,
            created_by: req.user?.id
        });

        await category.save();
        AuditLogs.info(req.user?.email, "Categories", "Add", category);
        res.json(Response.successResponse(category));
    } catch (err) {
        AuditLogs.error(req.user?.email, "Categories", "Add", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Update Category */
router.post('/update', auth.checkPrivileges("category_update"), validate(schemas.update), async function(req, res, next) {
    /*
        #swagger.tags = ['Categories']
        #swagger.summary = 'Update an existing category'
        #swagger.description = 'Update category information'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Category update information',
            required: true,
            schema: {
                _id: '507f1f77bcf86cd799439014',
                name: 'Home Electronics',
                is_active: true
            }
        }
        #swagger.responses[200] = {
            description: 'Category updated successfully'
        }
    */
    let body = req.body;
    try {
        let updates = {};
        if (body.name) updates.name = body.name;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

        let result = await Categories.updateOne({ _id: body._id }, { $set: updates });
        
        if (result.matchedCount === 0) {
            throw new CustomError(Enums.HTTP_CODES.NOT_FOUND, 'Update Error', 'Category not found');
        }

        AuditLogs.info(req.user?.email, "Categories", "Update", { _id: body._id, ...updates });
        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        AuditLogs.error(req.user?.email, "Categories", "Update", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Delete Category */
router.post('/delete', auth.checkPrivileges("category_delete"), async function(req, res, next) {
    /*
        #swagger.tags = ['Categories']
        #swagger.summary = 'Delete a category'
        #swagger.description = 'Delete a category from the system'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Category ID to delete',
            required: true,
            schema: {
                _id: '507f1f77bcf86cd799439014'
            }
        }
        #swagger.responses[200] = {
            description: 'Category deleted successfully'
        }
    */
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', '_id is required');

        let result = await Categories.deleteOne({ _id: body._id });
        if (result.deletedCount === 0) {
            throw new CustomError(Enums.HTTP_CODES.NOT_FOUND, 'Delete Error', 'Category not found');
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