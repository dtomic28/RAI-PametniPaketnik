var express = require('express');
var router = express.Router();
var transactionController = require('../controllers/transactionController.js');

router.get('/', transactionController.default);
router.get('/getCompleted', transactionController.getAllCompletedTransactions);
router.get('/getOpen', transactionController.getAllOpenTransactions);
router.get('/getUnwanted', transactionController.getUnwantedTransactions);
router.get('/getByBoxID/:id', transactionController.getTransactionByID);


module.exports = router;

/*
Backend sistema bo razvit kot REST API, ki podpira naslednje funkcionalnosti:
• Upravljanje uporabnikov, predmetov in rezervacij.
• Povezava z face recognition API-jem iz predmeta ORV
• Povezava z API-jem za odpiranje škatle
• Ogled slik, posnetih iz paketnika
• Spremljanje dogodkov in statusov predala
*/

