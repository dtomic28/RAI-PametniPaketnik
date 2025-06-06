var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var transactionSchema = new Schema({
    'lockboxID' : {
        type: Schema.Types.ObjectId,
        ref: 'lockbox'
    },
    'sellerID' : {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'buyerID' : {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'itemID' : {
        type: Schema.Types.ObjectId,
        ref: 'item'
    },
    'startedSellingTime' : Date,
    'finishedSellingTime' : Date,
});

var Transaction = mongoose.model('transaction', transactionSchema);
module.exports = Transaction;

/*
Model za shranjevanje transakcij
'lockboxID'             -> ID paketnika
'sellerID'              -> ID prodajalca
'buyerID'               -> ID kupca
'itemID'                -> list ID-jev predmetov
'startedSellingTime'    -> čas ko je prodajalec vstavil predmet v paketnik
'finishedSellingTime'   -> čas ko je kupec prevzel predmet
*/