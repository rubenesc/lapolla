

var util = require("util");
var UtilHelper = require("../../app/helpers/utilHelper");
var moment = require("moment");
var validator = require('validator');

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



		it('should parse a date to mm/yy/dddd', function(done) {

			util.log("should parse a date to mm/yy/dddd");

			var DateFormats = {
			       short: "MM/DD/YYYY",
			       long: "dddd DD.MM.YYYY HH:mm"
			};

			var datetime = new Date();
            var f = DateFormats["short"];
            console.log(datetime);
            console.log("formatDate: [{0}][{1}]".format(f, datetime));
            var strDate = moment(datetime).format(f);
            console.log("formatedDate : [{0}] ".format(strDate));
            var arr = strDate.split("/");
            console.log("pieces [{0}][{1}][{2}]".format(arr[0], arr[1], arr[2]));
//            var newDate = moment()
			var newDate = new Date(arr[2], arr[0] - 1, arr[1]);
			console.log(newDate);
			console.log(datetime === newDate);
			console.log(datetime - newDate);


			console.log("[1][" + moment("07/07/2014", f).isValid() + "-"   );
			console.log("[2][" + moment("07a/07/2014", f).isValid() + "-"   );
			console.log("[3][" + moment("13/07/2014", f).isValid() + "-"   );
			console.log("[4][" + moment("12/07/2014", f).isValid() + "-"   );
			console.log("[5][" + moment("12/07/22a014", f).isValid() + "-"   );


			var verifyTimeStamp = function (dateString) {
			    if (dateString && !dateString.slice(-5).match(/\d+:\d\d/)) {
			        dateString += ' 12:00';
			    }
			    return dateString;
			};

			var parseDateFormats = ['DD MMM YY @ HH:mm', 'DD MMM YY HH:mm',
			                        'DD MMM YYYY @ HH:mm', 'DD MMM YYYY HH:mm',
			                        'DD/MM/YY @ HH:mm', 'DD/MM/YY HH:mm',
			                        'DD/MM/YYYY @ HH:mm', 'DD/MM/YYYY HH:mm',
			                        'MM/DD/YYYY @ HH:mm', 'MM/DD/YYYY HH:mm',
			                        'DD-MM-YY @ HH:mm', 'DD-MM-YY HH:mm',
			                        'DD-MM-YYYY @ HH:mm', 'DD-MM-YYYY HH:mm',
			                        'YYYY-MM-DD @ HH:mm', 'YYYY-MM-DD HH:mm',
			                        'DD MMM @ HH:mm', 'DD MMM HH:mm'];
			
            //Parses a string to a Moment
			var parseDateString = function (value) {
			    return value ? moment(verifyTimeStamp(value), parseDateFormats, true) : undefined;
			};



			console.log("--> [{0}][{1}]".format(strDate, verifyTimeStamp(strDate)));
			console.log("--> [{0}]".format( "12:00".match(/\d+:\d\d/) ) ) ;
			console.log("--> [{0}][{1}]".format(strDate, verifyTimeStamp(strDate)));
				
			strDate = "07/18/2014";
			var newStrDate = parseDateString(strDate);
			console.log("--> [{0}][{1}][{2}][{3}]".format(newStrDate, newStrDate.isValid(), strDate, new Date(newStrDate) ));



			return done();



		});		

	});

});
