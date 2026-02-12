const express = require('express');
const router = express.Router();
const isAuthenticated = false;

router.all('*', (req, res, next) => {
if (isAuthenticated) {
  next();
} else {
  res.json({success: false, message: "Unauthorized"});
}
})
router.get('/', function(req, res, next) {
  res.json({success: true});
});


module.exports = router;