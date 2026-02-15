const express = require('express');
const router = express.Router();
const email = require('../lib/Email');
const Response = require('../lib/Response');
const Enums = require('../config/Enums');

router.post('/test', async (req, res) => {
    try {
        const { to, subject, body } = req.body;
        
        // Basit bir HTML maili gönderelim
        let result = await email.send(
            to || "test@example.com", 
            subject || "Test Email", 
            body || "This is a test email", 
            `<h1>Hello!</h1><p>${body || "This is a test email"}</p>`
        );

        res.json(Response.successResponse({ 
            success: true, 
            preview: "Check server console for Preview URL" 
        }));

    } catch (err) {
        res.status(Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(Response.errorResponse(err));
    }
});

module.exports = router;