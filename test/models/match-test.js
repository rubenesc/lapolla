var assert = require('assert');
var should = require('should');
var prettyjson = require('prettyjson');
var util = require('util');
var mongoose = require('mongoose');
var Match = mongoose.model('Match');
var Team = mongoose.model('Team');
var User = mongoose.model('User');
var MatchFactory = require("../helpers/match-factory");
var UserFactory = require("../helpers/user-factory");
var fs = require('fs');


describe("match", function() {

	describe('persistence', function() {

		var match = null;
		var user = null;
		var team1Code = "col";
		var team2Code = "gre";
		var team1 = null;
		var team2 = null;
		var matchList = [];
		var game34 = null;
		var numberOfGames = 64;

		before(function(done) { 

			console.log();
			util.debug('========== start match-test ========== ');

			console.log();
			util.debug('cleaning up the "matches" MongoDB collection');

			Match.collection.remove(function(err){

				if (err) return done(err);

				done();

			});

		});

		it('should find teams', function(done) {

			console.log();
			util.debug("should find teams ["+team1Code+"]["+team2Code+"]");

			Team.loadByCode(team1Code, function(err, data) {

				if (err) return done(err);
				team1 = data;
				util.debug(team1);

				Team.loadByCode(team1Code, function(err, data) {

					if (err) return done(err);
					team2 = data;
					util.debug(team2);
					done();

				});

			});

		});		


		it('should create a new match', function(done) {

			console.log();
			util.debug("should create a new match ");

			match = new Match ({
				matchId: 1,
				group: "c",
				team1: team1,
				team2: team2, 
				gol1: 0,
				gol2: 0,
			});

			util.debug("match: ["+ match +"]");

			match.save(function(err, data) {

				if(err) return done(err);			

				util.debug("should create a new match Response: " + data);

				data.should.have.be.a('object');
				data.should.have.property('_id');
				match = data; 
				done();
			});
		});		


		it('should clean matches collection', function(done){

			console.log();
			util.debug('cleaning up the "matches" MongoDB collection');

			Match.collection.remove(function(err){

				if (err) return done(err);

				done();
			});
			
		});

		it('should populate matches from list', function(done){

			console.log();
			util.debug("should populate matches from list");

  		    var matchesPath = __dirname + "/../../config/fixtures/matches.csv";
  		    util.debug("matches csv file path: [" + matchesPath+"]");

			var lineList = fs.readFileSync(matchesPath).toString().split('\n');
			lineList.shift(); // Shift the headings off the list of records.

			var match  = null;
			var line = null;
			var count = 0;

			//for (var i=0; i<lineList.length; i++){
			var i=0;

			lineList.forEach(function(line){
				i++;

				var arr = line.split(',');
				var codeTeam1 = arr[2];
				var codeTeam2 = arr[3];

				match  = new Match(MatchFactory.create(line));
				util.debug("==line ["+i+"]==> " + line +" []");

				MatchFactory.addTeamsToMatch(match, codeTeam1, codeTeam2, function(err, match){

					if (err) return done(err);

					match.save(function(err, data){

						if(err) return done(err);

						count ++;
						matchList.push(data);
						if (count === lineList.length){
							done();
						}
					});

				});
				
			});			

		});





	});


});