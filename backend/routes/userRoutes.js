var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');

router.get('/', userController.default);

module.exports = router;

/*
Backend sistema bo razvit kot REST API, ki podpira naslednje funkcionalnosti:
• Upravljanje uporabnikov, predmetov in rezervacij.
• Povezava z face recognition API-jem iz predmeta ORV
• Povezava z API-jem za odpiranje škatle
• Ogled slik, posnetih iz paketnika
• Spremljanje dogodkov in statusov predala
*/

