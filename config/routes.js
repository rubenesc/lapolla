
var mongoose = require('mongoose')
   , util = require('util')
   , async = require('async');


module.exports = function(app, passport, auth) {

	// app.get('/', function(req, res){
	// 	res.redirect('index.html');
	// });

	// app.get('/index2', function(req, res){
	// 	res.redirect('index2.html');
	// });	
	
	//User
	var users = require('../app/controllers/users');
	app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), users.session);
	app.post('/signup', users.create);

	app.get('/logout', auth.requiresLogin, users.logout);
	app.post('/logout', auth.requiresLogin, users.logout);

	app.get('/authenticated', users.isAuthenticated);

	//Teams
	var teams = require('../app/controllers/teams');
	app.get('/teams', auth.requiresLogin, teams.list);	

	//Games
	var games = require('../app/controllers/games');
	app.get('/games/:username', auth.requiresLogin, games.list);	
	app.post('/games', auth.requiresLogin, games.update);	

	//Matches
	var matches = require('../app/controllers/matches');
	app.get('/matches', auth.requiresLogin, matches.list);	
	app.post('/matches', auth.requiresLogin, matches.update);	
	app.post('/matches/reset', auth.requiresLogin, matches.reset);	


	//Settings
	var settings = require('../app/controllers/settings');
	app.get('/settings', auth.requiresLogin, settings.show);
	app.put('/settings', auth.requiresLogin, settings.update);

	app.get('/settings/:username', auth.requiresLogin, settings.show);


	app.get("/", function(req, res){

		console.log("---> get /");
		if (req.user){
			res.redirect("/games/"+req.user.username);		
		} else {
			res.render("login");
		}

	});

	app.get("/login", function(req, res){
		res.render("login");
	});

	app.get("/register", function(req, res){
		res.render("register");
	});

	app.post("/login", function(req, res){

		console.log("---> post /login ["+req.body.email+"]["+req.body.password+"]");

		res.render("index");

			// if ('piechef' == req.body.user &&
			// 	 '12345' == req.body.password){
				
			// 	req.session.currentUser = req.body.user;
			// 	req.flash('info', 'You now are logged in as ' + req.session.currentUser);
			// 	res.redirect('/admin/pies');
			// 	return;
			// } else {
			// 	req.flash('error', 'Invalid user or password.');
			// 	res.redirect('/login');
			// 	return;
			// }


	});



	app.namespace('/api', function(){

		var users = require('../app/controllers/users');
		app.post('/signup', users.create);
		app.get('/users/:username', users.show);
		app.put('/users/:username', users.update);
		app.del('/users/:username', users.del);

		// https://github.com/spumko/boom/blob/master/lib/index.js		
		// http://passportjs.org/guide/login/
		// https://github.com/madhums/nodejs-express-mongoose-demo/blob/master/config/routes.js
		app.post('/login', passport.authenticate('local'), users.session);
		app.post('/logout', auth.requiresLogin, users.logout);
		app.get('/authenticated', users.isAuthenticated);
	});



}