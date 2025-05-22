var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
console.log("userRoutes.js");
router.get('/', userController.default);

router.post('/register', userController.create);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

module.exports = router;

/*
Backend sistema bo razvit kot REST API, ki podpira naslednje funkcionalnosti:
• Upravljanje uporabnikov, predmetov in rezervacij.
• Povezava z face recognition API-jem iz predmeta ORV
• Povezava z API-jem za odpiranje škatle
• Ogled slik, posnetih iz paketnika
• Spremljanje dogodkov in statusov predala
*/

