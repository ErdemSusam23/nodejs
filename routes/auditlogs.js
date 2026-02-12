const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.json({success: true, body: res.body, query: req.query, params: req.params, headers: req.headers });
});


module.exports = router;