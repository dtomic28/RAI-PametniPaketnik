var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var lockboxSchema = new Schema({
    'boxID' : String,
    'lastOpenedPerson' : String,
    'lastOpenedTime' : Date,
    'storedItem' : {
        type: Schema.Types.ObjectId,
        ref: 'item'
    }
});

var Lockbox = mongoose.model('lockbox', lockboxSchema);
module.exports = Lockbox;

/*
model za shranjevanje posameznih paketnikov
'boxID'             -> ID samega paketnika (ne database ID)
'lastOpenedPerson'  -> ID osebe ki je nazadnje odprla paketnik
'lastOpenedTime'    -> cas ko je bil paketnik nazadnje odprt
'storedItem'        -> ID shranjenega predmeta v paketniku
*/