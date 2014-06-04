var assert = require('assert');
var should = require('should');
var prettyjson = require('prettyjson');
var util = require('util');
var mongoose = require('mongoose');
var Team = mongoose.model('Team');
var fs = require('fs');
var TeamFactory = require("../helpers/team-factory");

var schemaKeyList = ['code', 'name', 'group', 'continent', 'flag'];

describe('team', function() {

	describe('persistence', function() {

		var team = null;
		var teamsPath = null;

		before(function(done) {

			console.log();
			util.debug('========== start team-test ========== ');

  		    teamsPath = __dirname + "/../../config/fixtures/teams.csv";
  		    util.debug("teams csv file path: [" + teamsPath+"]");

			console.log();
			util.debug('cleaning up the "teams" MongoDB collection');

			Team.collection.remove(function(err){

				if (err) return done(err);
				
				done();
			});

		});


		it('should create a new team', function(done) {

			console.log();
			util.debug("should create a new team ");

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

					if(err) return done(err);

					count++;
					util.debug("team created #["+ count +"]["+data.code+"]["+data.name+"]");
					if (count === lineList.length){
						done();

					}	

				});
			}

		});


	});

	after(function(done){

		console.log();
		console.log('========== end team-test ========== ');
		console.log();

		done();
	});	

});