var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var permissionSchema = new Schema({
    'lockboxID' : String,
    'userID' : String,
    'permissionType' : String
});

var permission = mongoose.model('openPermission', permissionSchema);
module.exports = permission;

/*
Model za shranjevanje dovoljenj za odpiranje paketnikov
'lockboxID'         -> ID paketnika
'userID'            -> ID uporabnika ki ima dovoljenje
'permissionType'    -> tip dovoljenja (kupec, prodajalec, administrator)
*/