const express = require('express');
const router = express.Router();
const email = require('../lib/Email');
const Response = require('../lib/Response');
const Enums = require('../config/Enums');

router.post('/test', async (req, res) => {
    /*
        #swagger.tags = ['Email']
        #swagger.summary = 'Test email sending'
        #swagger.description = 'Send a test email to verify email configuration'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Email test parameters',
            required: false,
            schema: {
                to: 'recipient@example.com',
                subject: 'Test Email',
                body: 'This is a test email message'
            }
        }
        #swagger.responses[200] = {
            description: 'Email sent successfully'
        }
    */
    try {
        const { to, subject, body } = req.body;
        
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