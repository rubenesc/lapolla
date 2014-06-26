
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    util = require("util");

var MatchSchema = new Schema({
	matchId: {type: Number, min: 1, max: 64, required: true},
	group: {type: String, trim: true},	
	team1: {type : Schema.ObjectId, ref : 'Team'},
	team2: {type : Schema.ObjectId, ref : 'Team'},
	gol1: {type: Number, min: 0, max: 15, required: true, default: 0},
	gol2: {type: Number, min: 0, max: 15, required: true, default: 0},
	pen1: {type: Number, min: 0, max: 15, required: false, default: 0},
	pen2: {type: Number, min: 0, max: 15, required: false, default: 0},
	played: {type: Boolean, default: false},	
    createdDate  : {type : Date, default : Date.now},
    modifiedDate  : {type : Date}
});

MatchSchema.method('toClient', function() {

    var obj = this.toObject();

	//remove _ from id's
	if (obj._id){
	    obj.id = obj._id;
	    delete obj._id;
	}

	// if (obj.team1){
	// 	obj.team1.flag = "/img/flag.png";
	// }
	// if (obj.team2){
	// 	obj.team2.flag = "/img/flag.png";
	// }

    return obj;
});

// pre save hooks
MatchSchema.pre('save', function(next) {

  if(!this.isNew) {
    this.modifiedDate = new Date;
  }
  
  return next();

});

/*
  static methods
*/
MatchSchema.statics = {

	loadById: function (id, cb) {
		this.findOne({ _id : id })
		  .populate('team1')
		  .populate('team2')
		  .exec(cb);
	},

	findByMatchId: function(matchId, callback) {

		if (!matchId){
		  return callback(new AppError('matchId is required'));
		}

		return this.findOne({matchId: matchId})
			.populate('team1')
			.populate('team2')
			.exec(callback);
	},	

	list: function(options, cb){
		var criteria = options.criteria || {};

		util.debug("Match.list: ");
		console.dir(criteria);
		this.find(criteria)
		  	.populate('team1')
			.populate('team2')
			//.sort({'createdDate': -1}) //sort by date, -1 (desc) or 1 (asc)
			.sort({'matchId': 'asc'}) //sort by date
//			.sort({'title': 'asc'}) //sort by date
			.limit(options.limit)
			.skip(options.limit * options.page)
			.exec(cb);
	}

}

mongoose.model('Match', MatchSchema);