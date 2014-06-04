var mongoose = require('mongoose');
var	Game = mongoose.model('Game');
var	Team = mongoose.model('Team');
var fs = require('fs');
var util = require('util');

var GameFactory = {

	create: function(matchId, group, team1, team2, gol1, gol2, pen1, pen2){

		var game = {
			matchId: matchId || 0,
			group: group || "",
			team1: team1 || "",
			team2: team2 || "",
			gol1: gol1 || 0,
			gol2: gol2 || 0,
			pen1: pen1 || 0,
			pen2: pen2 || 0,
		}

		return game;
	},

	create: function(line){

	    var arr = line.split(',');
    
		var game = {
			matchId: arr[0] || 0,
			group: arr[1] || "",
			// team1: arr[2] || "",
			// team2: arr[3] || "",
			gol1: arr[4] || 0,
			gol2: arr[5] || 0,
			pen1: arr[6] || 0,
			pen2: arr[7] || 0,
		}

		return game;
	},

    /*
	*   
	*/
 	addTeamsToGame: function(game, codeTeam1, codeTeam2, cb){

		Team.loadByCode(codeTeam1, function(err, data1) {

			if (err) return cb(err);

			game.team1 = data1;

			Team.loadByCode(codeTeam2, function(err, data2) {

				if (err) return cb(err);
				
				game.team2 = data2;

				cb(null, game);

			});

		});

	}
	
}

module.exports = GameFactory;