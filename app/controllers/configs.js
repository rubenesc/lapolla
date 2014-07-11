var mongoose = require('mongoose'),
	Config = mongoose.model('Config'),
 	User = mongoose.model('User'),	
	_ = require('underscore'),
	prettyjson = require('prettyjson'),
	check = require('validator').check;
var Validator = require('validator').Validator;	
var util = require('util');
var ApplicationError = require("../helpers/applicationErrors");
var DateHelper = require("../helpers/dateHelper");

exports.create = function(req, res, next) {

	console.log();
	util.debug('--> configs.create: ');

	//request validation
	var errors = validateCreateRequest(req);

	if(errors.length){
		var message = "Data could not be saved.";
		return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
	}

	var startDate = DateHelper.parseDateString(req.body.startDate);

	//build obj
	var config = new Config({
		startDate: startDate
	});

	//Save data
	config.save(function(err, data){

    	if (err) return next(err);	

		req.flash('info', "Data saved correctly.");
		return res.redirect("admin/config");
	});

}

exports.show = function(req, res, next) {

	console.log();
	util.debug('--> configs.show');

	Config.load(function(err, data) {

		if (err) return next(err);

		if (!data){
			data = {};
		} 
		
		return res.render("admin/config", {
			loggedIn: req.currentUser.toClient(),
			config: data
		}); 

	});
}

exports.update = function(req, res, next) {

	console.log();
	console.log("--> configs.update");

	//request validation
	var errors = validateCreateRequest(req);

	if(errors.length){
		var message = "Data could not be saved.";
		return next(new ApplicationError.Validation(message, errors)); //--> return res.send(400, Validation);
	}
    

	Config.load(function(err, data){

    	if (err) return next(err);	

    	if (!data){
			var data = new Config();
    	}

    	data.startDate = DateHelper.parseDateString(req.body.startDate);

		//Save data
		data.save(function(err, data){

	    	if (err) return next(err);	

			req.flash('info', "Data saved correctly.");
			return res.redirect("/config");
		});

	});

}



//Helper Methods
function validateCreateRequest(req){

	var errors = [];

	req.onValidationError(function(msg){
		errors.push(msg);
	});

	var validator = new Validator();

	Validator.prototype.error = function (msg) {
		errors.push(msg);
	    return this;
	}

	req.check('startDate', 'Please enter a valid Start Date').notEmpty();

	if (req.body.startDate){
		var startDate = DateHelper.parseDateString(req.body.startDate);
		if (!startDate.isValid()){
			errors.push("Invalid start date format.");
		}
	}

	return errors;
}
