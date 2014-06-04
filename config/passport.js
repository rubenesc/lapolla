	var mongoose = require('mongoose')
	, LocalStrategy = require('passport-local').Strategy
  // , TwitterStrategy = require('passport-twitter').Strategy
  // , FacebookStrategy = require('passport-facebook').Strategy
  // , GitHubStrategy = require('passport-github').Strategy
  // , GoogleStrategy = require('passport-google-oauth').Strategy
  , User = mongoose.model('User');

  var util = require('util');

module.exports = function (passport, config) {

	// serialize sessions
	passport.serializeUser(function(user, done) {
		util.debug("--> passport.serializeUser");
		util.debug(util.inspect(user, { showHidden: false, depth: null }));
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		util.debug("--> passport.deserializeUser: " + id);
		User.findOne({ _id: id }, function (err, user) {
			done(err, user);
		});
	});	

  	// use local strategy
	passport.use(new LocalStrategy({
		  usernameField: 'email',
		  passwordField: 'password'
		},

		function(email, password, done) {

		  User.findOne({ email: email.toLowerCase() }, function (err, user) {
		  	
			util.debug("--> passport.findOne: " + email);

		    if (err) { 
		    	return done(err); 
		    }
		    if (!user) {
		      return done(null, false, { message: 'Unknown user' });
		    }

		    if (!user.authenticate(password)) {
		      return done(null, false, { message: 'Invalid password' });
		    }

		    return done(null, user);
		  });
		}

	));	
}





