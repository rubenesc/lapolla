var mongoose = require('mongoose'),
	Game = mongoose.model('Game'),
 	Team = mongoose.model('Team'),	
 	User = mongoose.model('User'),	
	_ = require('underscore'),
	fs = require('fs'),
    TeamFactory = require("../../test/helpers/team-factory"),
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

exports.createTeams = function(teamsPath, cb){

	//http://stackoverflow.com/questions/14203108/import-multiple-entries-to-mongodb-from-csv-file-for-node-js-app
	var lineList = fs.readFileSync(teamsPath).toString().split('\n');
	lineList.shift(); // Shift the headings off the list of records.

	var team  = null;
	var line = null;
	var count = 0;

	for (var i=0; i<lineList.length; i++){
		
		line = lineList[i];

		team  = new Team(TeamFactory.create(line));

		team.save(function(err, data){

			if(err) return cb(err);

			count++;
			// util.debug("team created #["+ count +"]["+data.code+"]["+data.name+"]");
			if (count === lineList.length){
				cb(null);
			}	

		});
	}	


}







