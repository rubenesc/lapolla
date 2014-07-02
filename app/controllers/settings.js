var mongoose = require('mongoose'),
	Game = mongoose.model('Game'),
 	Team = mongoose.model('Team'),	
 	User = mongoose.model('User'),	
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
	check = require('validator').check;
var Validator = require('validator').Validator;	
var util = require('util');
var ApplicationError = require("../helpers/applicationErrors");
var GameFactory = require("../../test/helpers/game-factory");
var ImageHelper = require("../helpers/imageHelper");

 
exports.show = function(req, res, next) {

	console.log();
	util.debug('--> settings.show: ');
	util.debug("--> req.isAuthenticated() = [" + req.isAuthenticated() +"]" );

	var isAdmin = (req.user.role === "admin");
	var usernameToFind = (isAdmin && req.params.username) ? req.params.username : req.user.username;

	User.findByUsername(usernameToFind, function(err, profileUser){

		if (err) next(err);

		if (!profileUser){

			req.flash('info', "User: " + usernameToFind +", not found" ); 
			return res.redirect("/settings");
		}

		res.render("settings", {
			loggedIn: req.user.toClient(),
			currentUser: profileUser.toClient()
		});
			


	});

}

exports.update = function(req, res, next) {

	console.log();
	util.debug("--> settings.update: [" + req.user.id + "][" + req.user.username + "]");
 	

	var isAdmin = (req.user.role === "admin");
	var usernameToFind = (isAdmin && req.params.username) ? req.params.username : req.user.username;

	if (req.files && req.files.image){

		//validate Image
		var errors = ImageHelper.validateImageRequest(req);

		if(errors.length){
			// var message = "Item could not be created";
			// return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);

			req.flash('error', errors); 
			return res.redirect("/settings");

		}		

	} else {

	 	//validate
		var errors = [];

		req.onValidationError(function(msg){
			errors.push(msg);
		});

		req.check('email', 'Please enter a valid email').isEmail();
		
		if (req.body.password1 || req.body.password2){
			if (req.body.password1 !== req.body.password2){
				errors.push("Passwords don't match");
			}
		}

		if(errors.length){
			req.flash('error', errors);
			return res.redirect("/settings");
		}

	}

	//ok, find user and update
	User.findByUsername(usernameToFind, function(err, profileUser){

		console.log(util.inspect(req.files));

		if (req.files && req.files.image){

			var isUpdate = (profileUser.avatar);

			ImageHelper.processItem({'request': req, 'isUpdate': isUpdate, 'updateUrl': profileUser.avatar}, function(err, target1, target2){

			 	if (err) return next(err);

			 	profileUser.avatar = target1;

				updateAndSaveUser(req, profileUser, function(err, _data){

			    	if (err) return next(err);	

					req.flash('info', "Data Saved!"); 
					return res.redirect("/settings");

				});

			 });

		} else {

			updateAndSaveUser(req, profileUser, function(err, _data){

		    	if (err) return next(err);	

				req.flash('info', "Data Saved!"); 
				return res.redirect("/settings");

			});

		}		
		
	});
	

}



function updateAndSaveUser(req, data, cb){

	data.name = req.body.name || data.name;
	data.email = req.body.email || data.email;

	if (req.body.password1 && req.body.password2 && 
		req.body.password1 === req.body.password2){
		data.password = req.body.password1;
	}

	data.save(function(err, _data) {
		cb(err, _data);
	});

}
