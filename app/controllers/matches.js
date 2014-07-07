var mongoose = require('mongoose'),
	Match = mongoose.model('Match'),
	Game = mongoose.model('Game'),
 	Team = mongoose.model('Team'),	
 	User = mongoose.model('User'),	
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
	check = require('validator').check;
var Validator = require('validator').Validator;	
var util = require('util');
var ApplicationError = require("../helpers/applicationErrors");
var MatchFactory = require("../../test/helpers/match-factory");
var UserFactory = require("../../test/helpers/user-factory");
var fs = require('fs');

exports.reset = function(req, res, next) {

	console.log();
	util.debug("--> matches.reset");

	console.log();
	util.debug('cleaning up the "matches" MongoDB collection');

	Match.collection.remove(function(err){

		if (err) return done(err);
		//once everything is removed, populate it again

	    var matchPath = __dirname + "/../../config/fixtures/matches.csv";
	    util.debug("match csv file path: [" + matchPath+"]");

		var lineList = fs.readFileSync(matchPath).toString().split('\n');
		lineList.shift(); // Shift the headings off the list of records.

		var match  = null;
		var line = null;
		var count = 0;
		var matchList = [];

		var i=0;

		lineList.forEach(function(line){
			i++;

			var arr = line.split(',');
			var codeTeam1 = arr[2];
			var codeTeam2 = arr[3];

			match  = new Match(MatchFactory.create(line));
			
			util.debug("==match line ["+i+"]==> [" + line +"]");
	 
			MatchFactory.addTeamsToMatch(match, codeTeam1, codeTeam2, function(err, match){

				if (err) return done(err);

				match.save(function(err, data){

					if(err) return done(err);

					count ++;
					matchList.push(data);
					if (count === lineList.length){

						res.redirect("/matches");

			      	};

				});

			});

		});


	});

}			




/**
 * List of matches
 *
 * @return {"matches":[{ link1 }, {link2}, ... ]}
 */
 exports.list = function(req, res, next) {

	var canEdit = true;
	var isAdmin = false;

	User.findByUsername(req.currentUser.username, function(err, profileUser){

		if (err || !profileUser) next(err);

		if (!profileUser.isAdmin()){
//			return next(new Error("You must be logged in as an admin"));
		}

	 	var opts = retrieveListOptions(req);
	 	opts = {};
		console.log();
		util.debug("--> matches.list ... page: {0}, limit: {1}".format(opts.page, opts.limit));
		util.debug(prettyjson.render(req.body));
		var userList = [];

		console.dir(opts);
			Match.list(opts, function(err, data) {

				console.log(err);
				if (err) return next(err);

				var data2 = [];
				for (var i in data){
					data2.push(data[i].toClient());
				}

			    Match.count().exec(function (err, count) {

					if (err) return next(err);

					res.render("admin/matches", {
						games: data2, 
						loggedIn: req.currentUser.toClient(),
						currentUser: profileUser.toClient(),
						profileUser: profileUser.username,
						canEdit: canEdit,
						users: userList,
				        page: opts.page + 1,
		        		pages: Math.ceil(count / opts.limit)
					});
			    });

			});

//		});

	});

}

exports.create = function(req, res, next) {

	console.log();
	util.debug('--> games.create: ' + req.body.url);
	util.debug('--> req.isAuthenticated(): ' + req.isAuthenticated());
	util.debug('--> req.currentUser: ' + req.currentUser);

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
		user: req.currentUser
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
	console.log('--> matches.update: ');
	console.log('--> req.isAuthenticated(): ' + req.isAuthenticated());
 
	var numberOfMatches = 64;
	var counter = 0;
	for (var i = 1; i <= numberOfMatches; i++){

		var matchId = req.body["matchId_"+i];

		Match.findByMatchId(matchId, function(err, data) {

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
			var played = req.body["played_"+matchId2];

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
			data.played = (played && played === "true") ? true : false; 

			if (matchId2 == 57){
				// console.log("["+matchId2+"a]["+codeTeam1+"]["+codeTeam2+"]["+gol1+"]["+gol2+"]["+pen1+"]["+pen2+"]-["+data.gol1 +"]["+ data.gol2+"]");
			}
 
			MatchFactory.addTeamsToMatch(data, codeTeam1, codeTeam2, function(err, game){

				// console.log(err);
				if (err) return next(err);

				updateAndSaveScore(req, game, gol1, gol2, pen1, pen2, function(err, _data){
					counter ++;

					if (err){
						console.log("fuck error saving score");
						console.log(err);
					}
			    	if (err) return next(err);	

			    	if (counter === numberOfMatches){


			    		updateAllUsersPoints(next, function(err){

							return res.redirect("/matches");

			    		});



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



//Helper Methods
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

function updateAndSaveScore(req, data, gol1, gol2, pen1, pen2, cb){

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


function processUserPoints(next, matchHM, user, cb){

	var criteria = {};
	criteria.user = user;

	Game.list({criteria: criteria}, function(err, gameList) {

		if (err) return next(err);
		//console.log("calculating points for user [" + userList[j].username + "]");
		console.log("");

		var auxGame;
		var auxMatch;
		var points = 0;
		
		console.log("found gamelist ["+ user.username +"], length [" + gameList.length + "] points [" + points +"]");

		for (var k = 0; k < gameList.length; k++){

			auxGame = gameList[k];
			auxMatch = matchHM[auxGame.matchId];

			if (auxMatch.played){

				console.log("match played, id [" + auxMatch.matchId +"]["+auxMatch.team1.code +"]["+auxMatch.team2.code +"]");

				var gamePoints = 0;

				if (didAccertTeams(auxMatch, auxGame)){

					var wTeamMatch = MatchFactory.findWinningTeam(auxMatch);
					var wTeamGame = MatchFactory.findWinningTeam(auxGame);

					if (wTeamMatch === wTeamGame){

						gamePoints = gamePoints + 1;
						console.log("Accerted Winning Team [" + auxGame.matchId + "][" + wTeamMatch + "][" + points +"]");

						if (didAccertGoals(auxMatch, auxGame)){

							gamePoints = gamePoints + 2;
							console.log("Accerted Score [" + auxGame.matchId + "][" + wTeamMatch + "][" + points +"]");
						}
						
					}

				}

				auxGame.points = gamePoints;
				auxGame.save();

				points = points + gamePoints;

			}

		}

		console.log("---> points for user [" + user.username + "][" + points + "]");

		user.points = points;
		user.save(function(err){

			if (err) return next(err);

			cb(null);

		});


	});

}

function didAccertTeams(match, game){
	
	if (match && match.team1 && match.team2 && 
		game && game.team1 && game.team2 && 
		(match.team1.code === game.team1.code) &&
		(match.team2.code === game.team2.code)){
		return true;
	}

	return false;

}

function didAccertGoals(match, game){

	var gols1 = game.gol1 + "," + game.gol2 + "," + game.pen1 + "," + game.pen2;
	var gols2 = match.gol1 + "," + match.gol2 + "," + match.pen1 + "," + match.pen2;

	if (game.gol1 === match.gol1 &&
			game.gol2 === match.gol2 &&
				game.pen1 === match.pen1 &&
					game.pen2 === match.pen2 ){

		return true;
	}

	return false;

}

function updateAllUsersPoints(next, cb){

	Match.list({}, function(err, matchList){

		if (err) return next(err);

		var matchHM = {}; //Match Hashmap based on the match Id
		for (var i =0; i<matchList.length; i++){
			matchHM[matchList[i].matchId] = matchList[i];
		}

		User.list({}, function(err, userList){

			var cont = 0;
			if (err) return next(err);

//			for (var j =0; j<userList.length; j++){
			for (var j in userList){

				var _user = userList[j];
				console.log("");
				console.log("find games for user [" + _user.id + "]");

				processUserPoints(next, matchHM, _user, function(err){

					if (err) next(err);
					
					cont ++;

					if (cont === userList.length){
						cb(null);
					}

				});

			}



		});

	});


}





