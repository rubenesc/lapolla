

var util = require('util')
	, fs = require('fs')
	, Users = require('./users')
	, Teams = require('./teams')
	, mongoose = require('mongoose')
	, User = mongoose.model('User')
	, Config = mongoose.model('Config')
	, Team = mongoose.model('Team')
    , ApplicationError = require("../helpers/applicationErrors");


exports.show = function(req, res, next) {


	//has the setup already been run?

    var initFile = __dirname + "/../../config/seed/initialize.js";
	var initialized = (fs.existsSync(initFile)) ? false : true;

	if (!initialized){

		console.log("Initializing seed file: ["+initFile+"] ...")

		var seed = require("../../config/seed/initialize.js");

		//create user
		var user = new User(seed.user);
		user.role = "admin";

		User.collection.remove(function(err){

			if (err) return next(err);	

			user.save(function(err) {

				if (err) return next(err);	

				Users.initalizeGames(req, user, function(err, req, user){

					if (err) return next(err);	
					
					console.log("--> User ["+user.username+"] initialized");

				});

			});

		});

		//create configuration
		var config = new Config(seed.config);

		Config.collection.remove(function(err){

			if (err) return next(err);	

			config.save(function(err, data){

		    	if (err) return next(err);	

		    	console.log("--> Configuration initialized");
			});		

		});

		//intialize teams
	    var teamsPath = __dirname + "/../../config/fixtures/teams.csv";

		Team.collection.remove(function(err){ 

			if (err) return next(err);

			Teams.createTeams(teamsPath, function(err){
				
				if (err) return next(err);

		    	console.log("--> Teams initialized");
			});

		});

		console.log("--> Renaming seed file ...");
		fs.renameSync(initFile, initFile + ".done");
		console.log("--> Application initialized.")

		res.render("admin/setup"
			, {
			message: "Application initialized, log in with user: " + seed.user.email
			}

		);



	} else {


				res.render("admin/setup"
			, {
			message: "Application initialized, log in with user: " 
			});

		// //dispay 404
		// return next(new ApplicationError.ResourceNotFound()); //--> return res.send(404, ...);

	}




}