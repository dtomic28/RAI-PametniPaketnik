var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
	'username' : String,
	'password' : String,
	'email' : String,
    'numberOfTransactions' : Number
});

userSchema.pre('save', function(next){
	var user = this;
	bcrypt.hash(user.password, 10, function(err, hash){
		if(err){
			return next(err);
		}
		user.password = hash;
		next();
	});
});

userSchema.statics.authenticate = async function(username, password, callback) {
    try {
        const user = await this.findOne({ username: username }).exec();
        if (!user) {
            const err = new Error("User not found.");
            err.status = 401;
            return callback(err);
        }
        const result = await bcrypt.compare(password, user.password);
        if (result === true) {
            return callback(null, user);
        } else {
            return callback();
        }
    } catch (err) {
        return callback(err);
    }
};

userSchema.statics.getAllUsernames = async function() {
    try {
        const users = await this.find({}, 'username').exec();
        return users.map(user => user.username);
    }
    catch (err) {
        throw err;
    }
}

var User = mongoose.model('user', userSchema);
module.exports = User;

/*
Model za shranjevanje uporabnikov
'username'              -> uporabniško ime
'password'              -> geslo
'email'                 -> email uporabnika
'numberOfTransactions'  -> število transakcij uporabnika
*/