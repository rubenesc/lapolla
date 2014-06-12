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

/**
 * List of games
 *
 * @return {"games":[{ link1 }, {link2}, ... ]}
 */
 exports.list = function(req, res, next) {

	var canEdit = false;

	User.findByUsername(req.params.username, function(err, profileUser){

		if (err || !profileUser) next(err);

		if (profileUser.id === req.user.id){
			canEdit = true;
		}

		var now = new Date();
		var limiteDate = new Date(2014,5,13);
		if (now >= limiteDate){
			canEdit = false;
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

					res.render("games", {
						games: data2, 
						currentUser: req.user.username,
						profileUser: profileUser.username,
						canEdit: canEdit,
						users: userList,
				        page: opts.page + 1,
		        		pages: Math.ceil(count / opts.limit)
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
	util.debug('--> req.user: ' + req.user);

	var now = new Date();
	var limiteDate = new Date(2014,5,13);
	if (now >= limiteDate){
		return res.send(403, {msg: "the world cup already started"});
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
		user: req.user
	});

	game.save(function(err, _game){

    	if (err) return next(err);	

		return res.send(201, {game: _game.toClient()});
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
 
	var now = new Date();
	var limiteDate = new Date(2014,5,13);
	if (now >= limiteDate){
		return res.send(403, {msg: "the world cup already started"});
	}

 
	var numberOfMatches = 64;
	var counter = 0;
	for (var i = 1; i <= numberOfMatches; i++){

		var matchId = req.body["matchId_"+i];

		Game.findByMatchId(req.user.id, matchId, function(err, data) {

			if(err || !data) {
				var message = "Resource not found: " + req.url;
				return next(new ApplicationError.ResourceNotFound(message)); //--> return res.send(404, ...);
			}

			var matchId2 = data.matchId;
			var gol1 = req.body["g_"+matchId2+"_1"];
			var gol2 = req.body["g_"+matchId2+"_2"];

			var pen1 = 0;
			var pen2 = 0;

			var codeTeam1 = null; 
			var codeTeam2 = null;

			if (matchId2 > 48) {
				pen1 = req.body["p_"+matchId2+"_1"];
				pen2 = req.body["p_"+matchId2+"_2"];
				codeTeam1 = req.body["team_"+matchId2+"_code_1"];
				codeTeam2 = req.body["team_"+matchId2+"_code_2"];

				//if no teams assigned, reset scores
				if (!codeTeam1){
					gol1 = 0;
					pen1 = 0;
				}

				if (!codeTeam2){
					gol2 = 0;
					pen2 = 0;
				}

				if (matchId2 == 57){
					// console.log("["+matchId2+"z]["+codeTeam1+"]["+codeTeam2+"]["+gol1+"]["+gol2+"]["+pen1+"]["+pen2+"]");
				}

			} else { 
				codeTeam1 = data.team1.code;
				codeTeam2 = data.team2.code;
			}

			data.gol1 = (isNaN(gol1)) ? data.gol1 : gol1;
			data.gol2 = (isNaN(gol2)) ? data.gol2 : gol2;
			data.pen1 = (isNaN(pen1)) ? data.pen1 : pen1;
			data.pen2 = (isNaN(pen2)) ? data.pen2 : pen2;

			if (matchId2 == 57){
				// console.log("["+matchId2+"a]["+codeTeam1+"]["+codeTeam2+"]["+gol1+"]["+gol2+"]["+pen1+"]["+pen2+"]-["+data.gol1 +"]["+ data.gol2+"]");
			}
 
			GameFactory.addTeamsToGame(data, codeTeam1, codeTeam2, function(err, game){

				// console.log(err);
				if (err) return next(err);

				if (matchId2 == 57){
					// console.log("["+game.matchId+"b]["+game.team1+"]["+game.team2+"]["+game.gol1+"]["+game.gol2+"]["+game.pen1+"]["+game.pen2+"]");
					// console.log("["+game.matchId+"b]["+game.team1.code+"]["+game.team2.code+"]["+game.gol1+"]["+game.gol2+"]["+game.pen1+"]["+game.pen2+"]");
				}

				// var errors = validateUpdateRequest(req);

				// if(errors.length){
				// 	var message = "Game could not be created";
				// 	return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
				// }
				
				updateAndSaveGameScore(req, game, gol1, gol2, pen1, pen2, function(err, _data){
					counter ++;

					if (err){
						console.log("fuck error saving score");
						console.log(err);
					}
			    	if (err) return next(err);	

			    	if (counter === numberOfMatches){
						return res.redirect("/games/"+req.user.username);
			    	}

				});
			});
				
		});

	}

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
	util.debug("add som validaiton rues to create a game");

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

	if (req.user) criteria.user = req.user.id;

	return {
		criteria: criteria,
		limit: limit,
		page: page
	}

}



