var assert = require('assert');
var should = require('should');
var prettyjson = require('prettyjson');
var util = require('util');
var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var Team = mongoose.model('Team');
var User = mongoose.model('User');
var GameFactory = require("../helpers/game-factory");
var UserFactory = require("../helpers/user-factory");
var fs = require('fs');



describe('game', function() {

	describe('persistence', function() {

		var game = null;
		var user = null;
		var team1Code = "col";
		var team2Code = "gre";
		var team1 = null;
		var team2 = null;
		var gameList = [];
		var game34 = null;
		var numberOfGames = 64;

		before(function(done) {

			console.log();
			console.log('========== start game-test ========== ');

			user = new User(
				UserFactory.create(
				'john.doe@link.com', 'john.DOE',
				'John Doe', '1234'));

			console.log();
			util.debug('cleaning up the "games" MongoDB collection');

			Game.collection.remove(function(err){

				if (err) return done(err);

				console.log();
				util.debug('cleaning up the users collection');
				User.remove(function(err) {

					if(err) return done(err);

					user.save(function(err, data) {

						if(err) return done(err);

						console.log();
						util.debug("creating test user[" + data.username+ "] ");

						data.should.have.be.a('object');
						data.should.have.property('_id');

						done();
					});

				});

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

		it('should create a new game', function(done) {

			console.log();
			util.debug("should create a new game ");

			game = new Game ({
				matchId: 1,
				group: "c",
				team1: team1,
				team2: team2,
				gol1: 0,
				gol2: 0,
				user: user
			});

			util.debug("game: ["+ game +"]");

			game.save(function(err, data) {

				if(err) return done(err);			

				util.debug("should create a new game Response: " + data);

				data.should.have.be.a('object');
				data.should.have.property('_id');
				game = data; 
				done();
			});
		});


		it('should clean games collection', function(done){

			console.log();
			util.debug('cleaning up the "games" MongoDB collection');

			Game.collection.remove(function(err){

				if (err) return done(err);

				done();
			});
			
		});



		it('should populate game list for user', function(done){

			console.log();
			util.debug("should populate game list for user");

  		    var gamesPath = __dirname + "/../../config/fixtures/games.csv";
  		    util.debug("games csv file path: [" + gamesPath+"]");

			var lineList = fs.readFileSync(gamesPath).toString().split('\n');
			lineList.shift(); // Shift the headings off the list of records.

			var game  = null;
			var line = null;
			var count = 0;

			//for (var i=0; i<lineList.length; i++){
			var i=0;

			lineList.forEach(function(line){
				i++;

				var arr = line.split(',');
				var codeTeam1 = arr[2];
				var codeTeam2 = arr[3];

				game  = new Game(GameFactory.create(line));
				game.user = user;
				util.debug("==line ["+i+"]==> " + line +" []");

				GameFactory.addTeamsToGame(game, codeTeam1, codeTeam2, function(err, game){

					if (err) return done(err);

					game.save(function(err, data){

						if(err) return done(err);

						count ++;
						gameList.push(data);
						if (count === lineList.length){
							done();
						}
					});

				});
				
			});			

		});


		it('should list games for user', function(done){

			console.log();
			util.debug('should list games for user');

			var game = null;
			var criteria = {};
			criteria.user = user;

			Game.list(criteria, function(err, data) {

				if (err) return done(err);

				data.should.have.length(numberOfGames);

				for (var i in data){

					var game = data[i];
					game.user._id.should.eql(user._id);

					if (game.matchId === 34){
						util.debug("---game 34-->");
						console.dir(game);
					}

				}

				done();
			});

		});

		it("should update game 34 for user", function(done){

			console.log();
			util.debug('should update game 34 for user');

			var testMatchId = 34;

			Game.findByMatchId(user._id, testMatchId, function(err, data1){

				if (err) return done(err);

				util.debug("---game 34-->");
				console.dir(data1);

				data1.matchId.should.eql(testMatchId);

				util.debug(data1);
				data1.gol1 = 1;
				data1.gol2 = 2;

				data1.save(function(err, data2){
	
					if (err) return done(err);

					data2.user.should.equal(data1.user);
					data2.gol1.should.equal(data1.gol1);
					data2.gol2.should.equal(data1.gol2);

					done();
				});

			});
			
		});


	});

	after(function(done){

		console.log();
		console.log('========== end game-test ========== ');
		console.log();

		done();
	});	

});