
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    util = require("util");

ConfigSchema = new Schema({
	startDate  : {type : Date, required: true},
    createdDate  : {type : Date, default : Date.now},
    modifiedDate  : {type : Date}
});

ConfigSchema.method('toClient', function() {

    var obj = this.toObject();

	//remove _ from id's
	if (obj._id){
	    obj.id = obj._id;
	    delete obj._id;
	}


    return obj;
});

// pre save hooks
ConfigSchema.pre('save', function(next) {

  if(!this.isNew) {
    this.modifiedDate = new Date;
  }
  
  return next();

});

/*
  static methods
*/
ConfigSchema.statics = {

	load: function (cb) {
		this.findOne({})
		  .exec(cb);
	}

}

mongoose.model('Config', ConfigSchema);