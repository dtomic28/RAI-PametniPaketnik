var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var itemSchema = new Schema({
    'name' : String,
    'description' : String,
    'price' : Number,
    'weight' : Number
});

var Item = mongoose.model('item', itemSchema);
module.exports = Item;

/*
model za shranjevanje posameznih predmetov
'name'          -> ime predmeta
'description'   -> opis predmeta
'price'         -> cena predmeta
'weight'        -> teža predmeta
*/