var assert = require('assert');
var should = require('should');
var prettyjson = require('prettyjson');
var util = require("util");
var mongoose = require('mongoose');
var User = mongoose.model('User');
var UserFactory = require("../helpers/user-factory");
var ImageHelper = require("../../app/helpers/imageHelper");
var gm = require("gm");
var im = gm.subClass({ imageMagick: true });


describe('image', function() {

	describe('process', function() {

		var renditions = {
			one: 600,
			two: 300,
			three: 90
		}		


		it('should resize image', function(done) {

			var source = __dirname + "/../fixtures/{0}.jpg".format("worldcup");
			console.log();
			console.log("should resize to square image");
			console.log("source: [" +source +"]");

			var target = ImageHelper.buildTargetPath(source, renditions.three + "_r_");
			console.log("target ["+ target +"]");

			ImageHelper.resizeImage(source, target, renditions.three, true, function(err, sourcePath1, resizeTarget1){

			 	if (err) return done(err); 

			 	//Test that the target is a square image and that its the size of the rendition width.
				im(target).size(function (err, size) {

					if (err) return done(err);

					if (size.width !== size.height){
						return done(new Error("image isn't square w:[" + size.width + "]h:[" + size.height +"]"))
					}

					if (size.width !== renditions.three || 
						size.height !== renditions.three){
						return done(new Error("image sizes don't match [" + renditions.three + "] --> w:[" + size.width + "]h:[" + size.height +"]"))
					}

					return done();
				});
			});

		});


	});

});