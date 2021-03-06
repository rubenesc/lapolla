
var mongoose = require('mongoose')
   , util = require('util')
   , async = require('async');



module.exports = function(app, passport, auth, user) {

	// app.get('/', function(req, res){
	// 	res.redirect('index.html');
	// });

	// app.get('/index2', function(req, res){
	// 	res.redirect('index2.html');
	// });	

	//Setup
	var setup = require('../app/controllers/setup');
	app.get('/setup', setup.show);


	
	//User
	var users = require('../app/controllers/users');

	app.get("/login", function(req, res){
		res.render("login");
	});

	app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), users.session);
	
	app.post('/signup', users.create);

	app.get('/logout', auth.requiresLogin, users.logout);

	app.post('/logout', auth.requiresLogin, users.logout);

	app.get('/authenticated', users.isAuthenticated);

	app.get("/register", function(req, res){
		res.render("register");
	});	

	//User Forgot Password
	app.get("/forgot", function(req, res){
		res.render("forgot");
	});	

	app.post("/forgot", users.forgot);

	//Teams
	var teams = require('../app/controllers/teams');
	app.get('/teams', auth.requiresLogin, teams.list);	

	//Games
	var games = require('../app/controllers/games');
	app.get('/games/:username', auth.requiresLogin, games.list);	
	app.post('/games', auth.requiresLogin, games.update);	
	app.put('/games', auth.requiresLogin, games.update);	

	//Admin - Matches
	var matches = require('../app/controllers/matches');

	app.get('/matches', user.can('access admin page'), matches.list);	
	app.post('/matches', user.can('access admin page'),  matches.update);	
	app.post('/matches/reset', user.can('access admin page'), matches.reset);	

	//Admin - Config
	var configs = require('../app/controllers/configs');

	app.get('/config', user.can('access admin page'), configs.show);	
	app.post('/config', user.can('access admin page'),  configs.create);	
	app.put('/config', user.can('access admin page'), configs.update);	

	//Settings
	var settings = require('../app/controllers/settings');
	app.get('/settings', auth.requiresLogin, settings.show);
	app.get('/settings/:username', auth.requiresLogin, settings.show);
	
	app.put('/settings', auth.requiresLogin, settings.update);
	app.put('/settings/:username', auth.requiresLogin, settings.update);

	app.get("/", function(req, res){

		if (req.currentUser){
			return res.redirect("/games/"+req.currentUser.username);		
		} else {
			return res.render("login");
		}

	});

	//Ranking
	app.get("/ranking", auth.requiresLogin, users.ranking);	

	//Rules
	app.get("/rules", auth.requiresLogin, function(req, res){
		return res.render("rules", {loggedIn: req.currentUser.toClient()});
	});	

	//Results
	app.get("/results", auth.requiresLogin, function(req, res){
		return res.render("results", {loggedIn: req.currentUser.toClient()});
	});	

}