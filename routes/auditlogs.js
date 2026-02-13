const express = require('express');
const moment = require('moment');
const Response = require('../lib/Response');
const AuditLogs = require('../db/models/AuditLogs');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        let body = req.body;
        let query = {};
        let skip = body.skip;
        let limit = body.limit;

        // Sayfalama için varsayılan değerler
        if (typeof skip !== "number") {
            skip = 0;
        }

        if (typeof limit !== "number" || limit > 500) {
            limit = 500;
        }

        // 1. Tarih Aralığı Filtresi (Begin Date - End Date)
        if (body.begin_date && body.end_date) {
            query.created_at = {
                $gte: moment(body.begin_date).toDate(), // Büyük Eşit
                $lte: moment(body.end_date).toDate()    // Küçük Eşit
            }
        } else {
            // Eğer tarih yoksa son 1 günü getir (Performans için)
            query.created_at = {
                $gte: moment().subtract(1, 'day').startOf('day').toDate(),
                $lte: moment().toDate()
            }
        }

        // 2. Veriyi Çek ve Sırala (Yeniden eskiye)
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