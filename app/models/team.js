var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TeamSchema = new Schema({
  code: {type: String, index: { unique: true }, required: true, trim: true},
  name: {type: String, required: true, trim: true},
  group: {type: String, required: true, trim: true},
  continent: {type: String, required: true, trim: true},  
  flag: {type: String, required: false, trim: true},
  createdDate  : {type : Date, default : Date.now},
  modifiedDate  : {type : Date}
});

TeamSchema.method('toClient', function() {

    var obj = this.toObject();

	//remove _ from id's
	if (obj._id){
	    obj.id = obj._id;
	    delete obj._id;
	}

    return obj;
});



// pre save hooks
TeamSchema.pre('save', function(next) {

  if(!this.isNew) {
    this.modifiedDate = new Date;
  }
  
  return next();
});


TeamSchema.statics = {

	loadById: function (id, cb) {
		this.findOne({ _id : id })
//		  .populate('user', 'username')
		  .exec(cb);
	},

	loadByCode: function (code, cb) {
		this.findOne({ code : code })
		  .exec(cb);
	},

	// loadByIdAndUser: function (id, userId, cb) {
	// 	this.findOne({ _id : id, user : userId })
	// 	  .populate('user', 'username')
	// 	  .exec(cb);
	// },

	// createTeam: function(userId, team, cb){

	// 	User.findOne({ _id: userId }, function (err, user) {

	// 	  if (err) return callback(err, null);

	// 	  user.categories.push({name: team});

	// 	  user.save(function(err, user){

	// 	    if (err) return callback(err, null);

	// 	    return callback(null, user.categories);

	// 	  });

	// 	}); 
	// },

	list: function(options, cb){
		
		var criteria = options.criteria || {};

		this.find(criteria)
		//	.populate('user', 'username')
			// .sort({'createdDate': -1}) //sort by date, -1 (desc) or 1 (asc)
			.sort({'code': 'asc'}) //sort by date
	//			.sort({'title': 'asc'}) //sort by date
			// .limit(options.limit)
			// .skip(options.limit * options.page)
			.exec(cb);
	}


}
 



module.exports = mongoose.model('Team', TeamSchema);   

