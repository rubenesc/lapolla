var mongoose = require('mongoose')
	, Game = mongoose.model('Game')
 	, Team = mongoose.model('Team')	
 	, User = mongoose.model('User')	
	, _ = require('underscore')
	, prettyjson = require('prettyjson')
	, check = require('validator').check
    , Validator = require('validator').Validator	
    , util = require('util')
	, CacheHelper = require('../helpers/cacheHelper')
    , ApplicationError = require("../helpers/applicationErrors")
    , GameFactory = require("../../test/helpers/game-factory");


/**
 * List of games
 *
 * @return {"games":[{ link1 }, {link2}, ... ]}
 */
 exports.list = function(req, res, next) {

	var canEdit = false;
	var isAdmin = false; 

	CacheHelper.getConfig(function(err, config){

		if (err) return next(err);

		User.findByUsername(req.params.username, function(err, profileUser){


			if (err || !profileUser) return next(err);

			if (req.currentUser.id === profileUser.id){
				canEdit = true;
			}


			if (canEdit && !profileUser.isAdmin()){
				//if I am a normal user, and I am in my profile, verify if
				//the I can still the scores based on the time window.
				
				var now = new Date();
				var limiteDate = config.startDate;

				if (now >= limiteDate){
					canEdit = false;
				}

			}



		 	var opts = retrieveListOptions(req);
		 	
			console.log();
			util.debug("--> games.list ... page: {0}, limit: {1}".format(opts.page, opts.limit));
			util.debug(prettyjson.render(req.body));
			opts.criteria.user  = profileUser;



			User.list({}, function(err, userList){

				Game.list(opts, function(err, data) {

					if (err) return next(err);

					var data2 = [];
					for (var i in data){
						data2.push(data[i].toClient());
					}

				    Game.count().exec(function (err, count) {

						if (err) return next(err);

						res.render("user/games", {
							loggedIn: req.currentUser.toClient(),
							games: JSON.stringify(data2), 
							currentUser: profileUser.toClient(),
							canEdit: JSON.stringify(canEdit),
							users: userList,
					        page: opts.page + 1,
			        		pages: Math.ceil(count / opts.limit)
						});
				    });

				});

			});

		});
	});


//	opts = {};

//	});

}

exports.create = function(req, res, next) {

	console.log();
	util.debug('--> games.create: ' + req.body.url);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	util.debug('--> req.currentUser: ' + req.currentUser);


	CacheHelper.getConfig(function(err, config){

		if (err) return next(err);

		var limiteDate = config.startDate;
		var now = new Date();
		if (now >= limiteDate){
			var message = "the world cup already started";
			req.flash('info', "Data could not be saved" ); 
			req.flash('error', message ); 
			return res.redirect("/games/"+req.currentUser.username);
		}

		//request validation
		var errors = validateCreateRequest(req);

		if(errors.length){
			var message = "Game could not be created";
			return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
		}

		//build obj
		var game = new Game({
			game: req.body.game,
			team1: req.body.team1,
			team2: req.body.team2,
			gol1: req.body.gol1,
			gol2: req.body.gol2,
			pen1: req.body.pen1,
			pen2: req.body.pen2,
			stage: req.body.stage,
			points: req.body.points,
			user: req.currentUser
		});

		game.save(function(err, _game){

	    	if (err) return next(err);	

			return res.send(201, {game: _game.toClient()});
		});


	});



}

exports.show = function(req, res, next) {

	console.log();
	util.debug('--> games.show: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());

	Game.loadById(req.params.id, function(err, data) {

		if(err || !data) {
			
			var message = "Resource not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);

		} else {

			return res.send({game: data.toClient()});
		}
	});
}

exports.update = function(req, res, next) {

	console.log();
	console.log('--> games.update: ');
	console.log('--> req.isAuthenticated(): ' + req.isAuthenticated());
 
 	CacheHelper.getConfig(function(err, config){

		var now = new Date();
		var limiteDate = config.startDate;
		if (now >= limiteDate ){
			var message = "the world cup already started";
			// req.flash('info', "Data could not be saved" ); 
			// req.flash('error', message ); 
			// return res.redirect("/games/"+req.currentUser.username);

    		return res.send(403, {messages: ["Data could not be saved.", message]});
		}


		var gamesArr = req.body.games;

		var game = null;
		var gamesHM = {};
		for (var i = 0; i<gamesArr.length; i++){
			game = gamesArr[i];
			gamesHM[game.matchId] = game;
		}

		var numberOfMatches = gamesArr.length;
		var counter = 0;

		for (var i = 0; i < numberOfMatches; i++){

			var matchId = gamesArr[i].matchId;
			// console.log("---> ["+i+"]["+matchId+"]");
			Game.findByMatchId(req.currentUser.id, matchId, function(err, data) {

				var game = gamesHM[data.matchId];
				// console.log("=====> ["+data.matchId+"]["+game.matchId+"]");
				if(err || !data) { 

					var message = "Resource not found: " + req.url;
					var url = "/games/"+req.currentUser.username;
					return next(new ApplicationError.ResourceNotFound(message, err, url)); //--> return res.send(404, ...);
				}

				var matchId2 = data.matchId;
				var gol1 = game.gol1;
				var gol2 = game.gol2;

				var pen1 = 0;
				var pen2 = 0;

				var codeTeam1 = (game.team1) ? game.team1.code : null;
				var codeTeam2 = (game.team2) ? game.team2.code : null;

				if (matchId2 > 48) {
					pen1 = game.pen1;
					pen2 = game.pen2;


					//if no teams assigned, reset scores
					if (!codeTeam1){
						gol1 = 0;
						pen1 = 0;
					}

					if (!codeTeam2){
						gol2 = 0;
						pen2 = 0;
					}

				}

				data.gol1 = (isNaN(gol1)) ? data.gol1 : gol1;
				data.gol2 = (isNaN(gol2)) ? data.gol2 : gol2;
				data.pen1 = (isNaN(pen1)) ? data.pen1 : pen1;
				data.pen2 = (isNaN(pen2)) ? data.pen2 : pen2;

	
				GameFactory.addTeamsToGame(data, codeTeam1, codeTeam2, function(err, game){

					// console.log(err);
					if (err) return next(err);


					// var errors = validateUpdateRequest(req);

					// if(errors.length){
					// 	var message = "Game could not be created";
					// 	return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
					// }
					
					updateAndSaveGameScore(req, game, gol1, gol2, pen1, pen2, function(err, _data){

						counter ++;

				    	if (err) return next(err);	

				    	if (counter === numberOfMatches){
				    		return res.send(200, {messages: ["Data saved correctly."]});
							// return res.redirect("/games/"+req.currentUser.username);
				    	}

					});
				});
					
			});

		}



 	});

}


exports.del = function(req, res, next) {

	console.log();
	util.debug('--> games.delete: ' + req.params.id);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());

	Game.loadById(req.params.id, function(err, data) {

		if(err || !data) {
			var message = "Game not found: " + req.url;
			return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);
		}

		data.remove(function(err) {

			if (err) return next(err);

			return res.send({});
		});

	});
}



function validateCreateRequest(req){

	var errors = [];

	req.onValidationError(function(msg){
		errors.push(msg);
	});

	var validator = new Validator();

	Validator.prototype.error = function (msg) {
		errors.push(msg);
	    return this;
	}

	//req.check('url', 'Please enter a valid url').isUrl();
	util.debug("add some validaiton rules to create a game");

	return errors;
}

function validateUpdateRequest(req){

	var errors = [];

	req.onValidationError(function(msg){
		errors.push(msg);
	});

	var validator = new Validator();

	Validator.prototype.error = function (msg) {
		errors.push(msg);
	    return this;
	}

	if (req.body.url){
		// req.check('url', 'Please enter a valid url').isUrl();
	}

	return errors;

}

function updateAndSaveGame(req, data, cb){

	data.game = req.body.game || data.game;
	data.team1 = req.body.team1 || data.team1;
	data.team2 = req.body.team2 || data.team2;
	data.gol1 = req.body.gol1 || data.gol1;
	data.gol2 = req.body.gol2 || data.gol2;
	data.pen1 = req.body.pen1 || data.pen1;
	data.pen2 = req.body.pen2 || data.pen2;
	data.stage = req.body.stage || data.stage;
	data.points = req.body.points || data.points;

	data.save(function(err, _data) {

		cb(err, _data);

	});

}

function updateAndSaveGameScore(req, data, gol1, gol2, pen1, pen2, cb){

	data.gol1 = (isNaN(gol1)) ? data.gol1 : gol1;
	data.gol2 = (isNaN(gol2)) ? data.gol2 : gol2;
	data.pen1 = (isNaN(pen1)) ? data.pen1 : pen1;
	data.pen2 = (isNaN(pen2)) ? data.pen2 : pen2;	

	data.save(function(err, _data) {

		cb(err, _data);

	});

}



function retrieveListOptions(req){

	var page = (req.param('page') > 0 ? req.param('page') : 1) - 1

	//number of individual objects that are returned in each page. 
	var limit = (req.param('limit') > 0 && req.param('limit') < 50) 
					? req.param('limit') : 15;

	limit = 65;
	//conditionally add members to object
	var criteria = {};

	if (req.currentUser) criteria.user = req.currentUser.id;

	return {
		criteria: criteria,
		limit: limit,
		page: page
	}

}



