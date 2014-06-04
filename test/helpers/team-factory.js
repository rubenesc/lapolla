var mongoose = require('mongoose');
var	Team = mongoose.model('Team');

var TeamFactory = {

	create: function(code, name, group, continent, flag){

		var team = {
			code: code || "",
			name: name || "",
			group: group || "",
			continent: continent || "",
			flag: flag || ""
		}

		return team;
	},

	create: function(line){

        var arr = line.split(',');
        
		var team = {
			code: arr[0] || "",
			name: arr[1] || "",
			group: arr[2] || "",
			continent: arr[3] || "",
			flag: arr[4] || ""
		}

		return team;



	}


	
}

module.exports = TeamFactory;