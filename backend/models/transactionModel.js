var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var transactionSchema = new Schema({
    'lockboxID' : String,
    'sellerID' : String,
    'buyerID' : String,
    'itemID' : String,
    'startedSellingTime' : String,
    'finishedSellingTime' : String,
    'transactionTime' : String
});

var Transaction = mongoose.model('transaction', transactionSchema);
module.exports = Transaction;

/*
Model za shranjevanje transakcij
'lockboxID'             -> ID paketnika
'sellerID'              -> ID prodajalca
'buyerID'               -> ID kupca
'itemID'                -> ID predmeta
'startedSellingTime'    -> čas ko je prodajalec vstavil predmet v paketnik
'finishedSellingTime'   -> čas ko je kupec prevzel predmet
'transactionTime'       -> čas ko se je zakljucilo placilo
*/