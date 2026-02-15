const express = require('express');
const router = express.Router();
const upload = require('../lib/Upload');
const Response = require('../lib/Response');
const auth = require('../lib/auth')();
const Enums = require('../config/Enums');
const CustomError = require('../lib/Error');

router.post('/', auth.authenticate(), (req, res, next) => {
    /*
        #swagger.tags = ['Upload']
        #swagger.summary = 'Upload a file'
        #swagger.description = 'Upload a single file to the server'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.consumes = ['multipart/form-data']
        #swagger.parameters['file'] = {
            in: 'formData',
            type: 'file',
            required: true,
            description: 'File to upload'
        }
        #swagger.responses[200] = {
            description: 'File uploaded successfully'
        }
    */
    
    upload.single('file')(req, res, (err) => {
        if (err) {
            if (err instanceof CustomError) {
                return res.status(err.code).json(Response.errorResponse(err));
            }
            return res.status(Enums.HTTP_CODES.BAD_REQUEST).json(Response.errorResponse(new CustomError(Enums.HTTP_CODES.BAD_REQUEST, "Upload Error", err.message)));
        }

        if (!req.file) {
            return res.status(Enums.HTTP_CODES.BAD_REQUEST).json(Response.errorResponse(new CustomError(Enums.HTTP_CODES.BAD_REQUEST, "Upload Error", "File is required")));
        }

        res.json(Response.successResponse({
            success: true,
            file: {
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size
            },
            url: `/uploads/${req.file.filename}`
        }));
    });
});

module.exports = router;