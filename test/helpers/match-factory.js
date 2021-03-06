var mongoose = require('mongoose');
var	Match = mongoose.model('Match');
var	Team = mongoose.model('Team');
var fs = require('fs');
var util = require('util');

var MatchFactory = {

	create: function(matchId, group, team1, team2, gol1, gol2, pen1, pen2, played){

		var match = {
			matchId: matchId || 0,
			group: group || "",
			team1: team1 || "",
			team2: team2 || "",
			gol1: gol1 || 0,
			gol2: gol2 || 0,
			pen1: pen1 || 0,
			pen2: pen2 || 0,
			played: played || false
		}

		return match;
	},

	create: function(line){

	    var arr = line.split(',');
    
		var match = {
			matchId: arr[0] || 0,
			group: arr[1] || "",
			// team1: arr[2] || "",
			// team2: arr[3] || "",
			gol1: arr[4] || 0,
			gol2: arr[5] || 0,
			pen1: arr[6] || 0,
			pen2: arr[7] || 0,
			played: arr[8] || false
		}

		return match;
	},

    /*
	*   
	*/
 	addTeamsToMatch: function(match, codeTeam1, codeTeam2, cb){

		Team.loadByCode(codeTeam1, function(err, data1) {

			if (err) return cb(err);

			match.team1 = data1;

			Team.loadByCode(codeTeam2, function(err, data2) {

				if (err) return cb(err);
				
				match.team2 = data2;

				cb(null, match);

			});

		});

	},

	findWinningTeam: function(game){

		var pos = this.findWinningPosition(game);
		if (pos === 1 ){
			return game.team1;
		} else if (pos === 2){
			return game.team2;
		} 

		return null;
	},
	

    /*
	*   Return positon of the team in game
	*	Posible Values:
	*		   1 = team 1 won
	*          2 = team 2 won
	*          3 = tied match
	*/
	findWinningPosition: function(game){

		var teamPos = 3;

	    if (game.gol1 > game.gol2){
	        teamPos = 1;
	    } else if (game.gol1 < game.gol2) {
	        teamPos = 2;
	    } else if (game.gol1 === game.gol2){
	    	//decide by penalties
	        if (game.pen1 > game.pen2){
	            teamPos = 1;
	        } else if (game.pen1 < game.pen2) {
	            teamPos = 2;
	        }

	    }

	    return teamPos;

	}

	
}

module.exports = MatchFactory;