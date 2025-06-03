var UserModel = require('../models/userModel.js');
module.exports = {
    default: function (req, res) {
        res.json({ message: 'default function in userController' });
    },

     create: async function (req, res) {
        var user = new UserModel({
			username : req.body.username,
			password : req.body.password,
			email : req.body.email,
            numberOfTransactions : 0
        });

        try {
    	    const savedUser = await user.save();
            return res.json(savedUser);
        } catch (err) {
            next(err);
        }
    },
    login: function(req, res, next){
        UserModel.authenticate(req.body.username, req.body.password, function(err, user){
            if(err || !user){
                var err = new Error('Wrong username or paassword');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;
            //res.redirect('/users/profile');
            return res.json(user);
        });
    },
    logout: function(req, res, next){
        if(req.session){
            req.session.destroy(function(err){
                if(err){
                    return next(err);
                } else{
                    //return res.redirect('/');
                    return res.status(201).json({});
                }
            });
        }
    },
    usernameExists: function(req, res, next) {
        const username = req.params.username;
        if (!username) {
            return res.status(400).json({ error: 'Username not found' });
        }
        UserModel.getAllUsernames()
            .then(usernames => {
                const exists = usernames.includes(username);
                return res.status(200).json({ exists });
            })
            .catch(err => {
                return res.status(401).json({ error: 'Database error' });
            });
    }
}