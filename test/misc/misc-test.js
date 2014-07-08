

var util = require("util");
var UtilHelper = require("../../app/helpers/utilHelper");


var crypto = require('crypto');


describe('miscellaneous tests', function() {

	describe('persistence', function() {


		it('should generate a random password', function(done) {

			util.log("should generate a random password");

			var passlength = 6;
			var password = UtilHelper.random(passlength);

			if (password && password.length === passlength){
				return done();
			}

			var errorMsg = "Passoword ["+password+"] is not "+passlength+" characters long";
			return done(new Error(errorMsg));

		});

	});

});
