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


/**
 * List of games
 *
 * @return {"games":[{ link1 }, {link2}, ... ]}
 */
 exports.list = function(req, res, next) {

 	
	console.log();
	util.debug("--> teams.list ... ");
	util.debug(prettyjson.render(req.body));

	Team.list({}, function(err, data) {

		if (err) return next(err);

		var data2 = [];
		for (var i in data){
			data2.push(data[i].toClient());
		}

		return res.send({ teams: data2 });

	});
}







