const express = require('express');
const moment = require('moment');
const Response = require('../lib/Response');
const AuditLogs = require('../db/models/AuditLogs');
const router = express.Router();

router.post('/', async (req, res) => {
    /*
        #swagger.tags = ['AuditLogs']
        #swagger.summary = 'Get audit logs'
        #swagger.description = 'Retrieve audit logs with optional date range filtering and pagination'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Audit log query parameters',
            required: false,
            schema: {
                begin_date: '2024-01-01',
                end_date: '2024-12-31',
                skip: 0,
                limit: 100
            }
        }
        #swagger.responses[200] = {
            description: 'Audit logs retrieved successfully'
        }
    */
    try {
        let body = req.body;
        let query = {};
        let skip = body.skip;
        let limit = body.limit;

        if (typeof skip !== "number") {
            skip = 0;
        }

        if (typeof limit !== "number" || limit > 500) {
            limit = 500;
        }

        if (body.begin_date && body.end_date) {
            query.created_at = {
                $gte: moment(body.begin_date).toDate(),
                $lte: moment(body.end_date).toDate()
            }
        } else {
            query.created_at = {
                $gte: moment().subtract(1, 'day').startOf('day').toDate(),
                $lte: moment().toDate()
            }
        }

        let auditLogs = await AuditLogs.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        res.json(Response.successResponse(auditLogs));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || 500).json(errorResponse);
    }
});

module.exports = router;