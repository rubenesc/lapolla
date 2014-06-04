var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
	check = require('validator').check;

var util = require('util');
var ErrorHelper = require("../helpers/errorHelper");
var AppError = require("../helpers/appError");
var ApplicationError = require("../helpers/applicationErrors");
var Game = mongoose.model('Game');
var Team = mongoose.model('Team');
var User = mongoose.model('User');
var GameFactory = require("../../test/helpers/game-factory");
var UserFactory = require("../../test/helpers/user-factory");
var fs = require('fs');



exports.create = function(req, res, next) {

	console.log();
	util.debug('--> users.create ... username: ' + req.body.username + ", email: " + req.body.email);

	// util.debug("request body: ");
	// util.debug(prettyjson.render(req.body));
	// console.log();

	//to create a user we need
	// 	email: user.email,
	// //name: user.name,
	// //username: user.username,
	// //password: user.password

	//request validation
	var errors = [];

	req.onValidationError(function(msg){
		errors.push(msg);
	});

	req.check('email', 'Please enter a valid email').isEmail();
	req.check('username', 'Please enter a username').isAlphanumeric();
	req.check('password', 'Please enter a valid password').notEmpty();
	
	if(errors.length){
		var message = "Registration could not be completed";

		req.flash('error', message);
		req.flash('error', errors);
		console.log("error registering, adding flash message: " + message);
		return res.redirect("/register");
//		return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
	}

	//validations passed lets start processing the request
	var user = new User(req.body);

	//local registration
	user.provider = 'local';

	User.findByUniqueFields(req.body, function(err, data, field) {

		if(err) {
			var msg = "Registration could not be completed";
			req.flash('error', msg);
			return res.redirect("/register");
	//		return ErrorHelper.handleError(err, res, next, msg, 400);
		}

		if(data) {
			
			var msg = field ? field + " is already taken" : "user already exists";
			req.flash('error', msg);
			return res.redirect("/register");
//			return ErrorHelper.handleError(err, res, next, msg, 400);
		}


		//finally create the new user
		user.save(function(err) {

			if(err) {

		      	util.error("--server error stack --> " + err);
				var msg = "Registration could not be completed";
				req.flash('error', msg);
				return res.redirect("/register");
	//			return ErrorHelper.handleError(err, res, next, msg, 400);

			} else {

				//
	  		    var gamesPath = __dirname + "/../../config/fixtures/games.csv";
	  		    util.debug("games csv file path: [" + gamesPath+"]");

				var lineList = fs.readFileSync(gamesPath).toString().split('\n');
				lineList.shift(); // Shift the headings off the list of records.

				var game  = null;
				var line = null;
				var count = 0;
				var gameList = [];

				var i=0;

				lineList.forEach(function(line){
					i++;

					var arr = line.split(',');
					var codeTeam1 = arr[2];
					var codeTeam2 = arr[3];

					game  = new Game(GameFactory.create(line));
					game.user = user;
					util.debug("==line ["+i+"]==> " + line +" []");

					GameFactory.addTeamsToGame(game, codeTeam1, codeTeam2, function(err, game){

						if (err) return done(err);

						game.save(function(err, data){

							if(err) return done(err);

							count ++;
							gameList.push(data);
							if (count === lineList.length){

								//if the user is created, also log him in
								req.login(user, function(err) {
						        	if (err) {
					    		        util.error("--server error message --> " + err.message);
										var msg = "Registration could not be completed";
					        			req.flash('error', msg);
										return res.redirect("/register");
							        }

									util.debug('user created! _id: ' + user._id);
									res.redirect("/games/"+user.username);
				//					return res.send(201, {user: user.toClient() });				        
						      	});

							}
						});

					});
					
				});			





			}
		});

	});
}

exports.show = function(req, res, next) {

	console.log();
	util.debug('--> users.show: ' + req.params.username);

	User.findByUsername(req.params.username, function(err, data) {

		if(err || !data) {

			var msg = "Resource not found: " + req.url;
			return ErrorHelper.handleError(err, res, next, msg, 404);

		} else {

			res.send({user: data.toClient()});
		}

	});
}

exports.update = function(req, res, next) {

	console.log();
	util.debug('--> users.update: ' + req.params.username);

	User.findByUsername(req.params.username, function(err, data) {

		if(err || !data) {

			var msg = "Resource not found: " + req.url;
			return ErrorHelper.handleError(err, res, next, msg, 404);

		}

		if(req.body.email) {
			data.email = req.body.email;
		}

		if(req.body.name) {
			data.name = req.body.name;
		}

		if(req.body.username) {
			data.username = req.body.username;
		}

		data.save(function(err) {
			if(err) {

				var msg = "update could not be completed";
				return ErrorHelper.handleError(err, res, next, msg, 400);

			} else {
				res.send({user: data.toClient()});
			}
		});


	});
}

exports.del = function(req, res, next) {

	console.log();
	util.debug('--> users.delete: ' + req.params.username);

	User.findByUsername(req.params.username, function(err, data) {

		if(err || data == null) {

			var msg = "Resource not found: " + req.url;
			return ErrorHelper.handleError(err, res, next, msg, 404);

		}

		data.remove(function(err) {

			if(err) {

				var msg = "Resource could not be deleted";
				return ErrorHelper.handleError(err, res, next, msg, 400);

			} else {
				util.debug('removed: ' + req.url);
				res.send({});
			}
		});

	});
}


exports.session = function(req, res, next){

	console.log();
	util.debug('--> users.session');
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	
	res.redirect("/games/"+req.user.username);
//	return res.send(200, {message: "user authenticated" });
	
}

exports.isAuthenticated = function(req, res, next){

  if ( req.isAuthenticated() ) {
    res.send(200);
  } else {
    res.send(401);
  }

}

exports.logout = function (req, res) {

	console.log();
	util.debug('--> users.logout');
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	req.logout();
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	
	res.redirect("/login");
//	return res.send(200);


}



