var mongoose = require('mongoose');
const Transaction = require('./transactionModel');
var Schema   = mongoose.Schema;

var itemSchema = new Schema({
    'name' : String,
    'description' : String,
    'price' : Number,
    'weight' : Number,
    'isSelling' : {
        type: Boolean,
        default: true
    },
    'imageLink': {
        type: String,
        default: 'images/default.jpg'
    }
});

var Item = mongoose.model('item', itemSchema);
module.exports = Item;
/*
model za shranjevanje posameznih predmetov
'name'          -> ime predmeta
'description'   -> opis predmeta
'price'         -> cena predmeta
'weight'        -> teža predmeta
'isSelling'     -> ali je predmet na voljo za prodajo (default: true)
*/