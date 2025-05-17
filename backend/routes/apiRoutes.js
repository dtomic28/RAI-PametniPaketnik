var express = require('express');
var router = express.Router();
var apiController = require('../controllers/apiController.js');

router.get('/test', apiController.test);

module.exports = router;