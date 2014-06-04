var assert = require('assert');
var request = require('request');
var app = require('../../app');
var should = require('should');
var prettyjson = require('prettyjson');
var mongoose = require('mongoose');
var	Game = mongoose.model('Game');
var GameFactory = require("../helpers/game-factory");
var	User = mongoose.model('User');
var UserFactory = require("../helpers/user-factory");
var util = require("util");
var fs = require('fs');

var env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env];




/**
	tests:
	
	--clean games db
	--clean users db

	create a new user ------------------------ POST 201 
	authenticate user ------------------------ POST 200

	create a new game ------------------------ POST 201               
	find an game by id ----------------------- GET  200
	update an game --------------------------- PUT  200

	--clean games db
//	not create a new game, no image ---------- POST 400
	
	--clean games db
	create 10 games for user1 ---------------- POST 201
	list 10 games for user1 ------------------ GET  200

**/

describe('games controller, ', function() {

	var user;
	var userId;

	describe('controller /api/games', function() {

		var game = null;    		//game Obj 
		var gameObj = null; 		//game Obj returned from create api.
		var gameUpatedObj = null; 	//game Obj returned from update api.

		before(function(done) {

			console.log();
			util.debug('========== start games-test ========== ');

			console.log();
			util.debug('cleaning up the "games" MongoDB collection');

			Game.collection.remove(function(err){

				if (err) return done(err);

				console.log();
				console.log('cleaning up the "users" MongoDB collection for authentication tests');
				User.collection.remove(function(err){

					if (err) return done(err);

					done();

				});
				
			});			

		});
	

		//create test user
		// it("should create a new user", function(done){

		// 	console.log();
		// 	util.debug("should create a new user");

		// 	//test user
		// 	user = UserFactory.create(
		// 		'john.doe@link.com', 'john.DOE',
		// 		'John Doe', '1234');

		// 	var options = {
		// 		url: "http://localhost:" + app.settings.port + "/api/signup",
		// 		form: user
		// 	};

		// 	request.post(options, function(err, _res, _body){

		// 		if (err) return done(err);

		// 		_res.should.have.status(201);
		// 		_res.should.be.json;

		// 		var _obj = JSON.parse(_body).user;
		// 		console.log(_obj);

		// 		_obj.should.have.be.a('object');
		// 		_obj.should.have.property('id');
		// 		userId = _obj.id;

		// 		//The usernames are stored lowercase.
		// 		_obj.username.toLowerCase().should.equal(user.username.toLowerCase());
		// 		done();
				
		// 	});
		// });

		// it('should authenticate user', function(done){

		// 	console.log();
		// 	util.debug("should authenticate user");

		// 	//create test user.
		// 	var options = {
		// 		url: "http://localhost:" + app.settings.port + "/api/login",
		// 		form: {
		// 			email: user.email,
		// 			password: user.password
		// 		}
		// 	};


		// 	// console.log("options:");
		// 	// console.log(util.inspect(options, { showHidden: false, depth: null }));
		// 	request.post(options, function(err, _res, _body){

		// 		if (err) return done(err);

		// 		_res.should.have.status(200);
		// 		_res.should.be.json;

		// 		var _obj = JSON.parse(_body);
		// 		console.log(_obj);
		// 		_obj.should.have.be.a('object');

		// 		done();
		// 	});
		// });

		// it('should create a new item', function(done){

		// 	console.log();
		// 	util.debug("should create a new item");

  // 		    //test image
  // 		    var itemPath = __dirname + "/../fixtures/black_top.jpeg";

		// 	item = ItemFactory.create( 
		// 		null, "black top", "category 1", "tag1, tag2", itemPath);			

		// 	var options = {
		// 		url: "http://localhost:" + app.settings.port + "/api/items",
		// 		form: item
		// 	};

		// 	var req = request.post(options.url, function(err, _res, _body){

		// 		if (err) return done(err);

		// 		console.log("== should create a new item JSON RESPONSE==> " + _body);

		// 		// HTTP/1.1 201 CREATED
		// 		// Location: https://www.googleapis.com/tasks/v1/lists/taskListID/tasks/newTaskID			
		// 		_res.should.have.status(201);
		// 		_res.should.be.json;

		// 		//retrieve the item object.
		// 		itemObj = JSON.parse(_body).item;

		// 		itemObj.should.have.be.a('object');
		// 		itemObj.should.have.property('id');
		// 		itemObj.should.have.property('image');
		// 		itemObj.image.should.have.property('url');


		// 		itemObj.title.should.be.equal(item.title);
		// 		itemObj.category.should.be.equal(item.category);
		// 		itemObj.tags.length.should.be.equal(item.tags.split(',').length);

		// 		done();
				
		// 	});

		// 	//create a form and set the items properties to the form.
		// 	var form = req.form();

		// 	for (var prop in item ){
		// 		if (item.hasOwnProperty(prop)){
		// 			if (item[prop]){
		// 				form.append(prop, item[prop]);
		// 			}
		// 		}
		// 	}

		// });


		// it ('should find an item by id', function(done){

		// 	console.log();
		// 	util.debug("should find an item by id");

		// 	//lets retrive the newly created object
		// 	var options = {
		// 		url: "http://localhost:" + app.settings.port + "/api/items/" + itemObj.id
		// 	};

		// 	request(options, function(err, _res, _body){

		// 		if (err) return done(err);

		// 		console.log("== should find an item by id JSON RESPONSE==> " + _body);

		// 		_res.should.have.status(200);
		// 		_res.should.be.json;
				

		// 		var _itemObj = JSON.parse(_body).item;
				
		// 		_itemObj.should.be.a('object');
		// 		_itemObj.should.have.property('id');

		// 		//Verify that the id and url are the same.
		// 		_itemObj.id.should.equal(itemObj.id);
		// 		_itemObj.image.url.toLowerCase().should.equal(itemObj.image.url.toLowerCase());
		// 		_itemObj.title.should.be.equal(itemObj.title);
		// 		_itemObj.category.should.be.equal(itemObj.category);
		// 		_itemObj.tags.length.should.be.equal(itemObj.tags.length); //itemObj.tags is an array, because we retrieved it from the server

		// 		_itemObj.user.username.should.be.equal(user.username.toLowerCase());

		// 		done();

		// 	});

		// });

		// it ('should update an item', function(done){

		// 	console.log();
		// 	util.debug("should update an item");

		// 	itemObj.title = itemObj.title + " updated";
		// 	itemObj.category = itemObj.category + " updated";
		// 	itemObj.tags = "tag2, tag3, tag1"

		// 	var options = {
		// 		url: "http://localhost:" + app.settings.port + "/api/items/" + itemObj.id,
		// 		form: itemObj
		// 	};

		// 	request.put(options, function(err, res, body){

		// 		if (err) return done(err);

		// 		console.log("== should update an item JSON RESPONSE==> " + body);

		// 		res.should.have.status(200);
		// 		res.should.be.json;

		// 		var respItemObj = JSON.parse(body).item;
				
		// 		respItemObj.should.be.a('object');
		// 		respItemObj.should.have.property('id');

		// 		//Verify that the id and url are the same.
		// 		respItemObj.id.should.equal(itemObj.id);
		// 		respItemObj.image.url.toLowerCase().should.equal(itemObj.image.url.toLowerCase());
		// 		respItemObj.title.should.be.equal(itemObj.title);
		// 		respItemObj.category.should.be.equal(itemObj.category);
		// 		respItemObj.tags.length.should.be.equal(itemObj.tags.split(',').length);

		// 		respItemObj.user.username.should.be.equal(user.username.toLowerCase());

		// 		done();

		// 	});

		// });


		after(function(){

		});

		//end describe
	});

	// describe('controller', function(){

	// 	var item;

	// 	before(function(done){

	// 		console.log();
	// 		console.log('cleaning up the "items" MongoDB collection');
	// 		Item.collection.remove(function(err){

	// 			if (err) return done(err);

	// 			done();
				
	// 		});							

	// 	});


	// 	it('should not create a new item, no image', function(done){

	// 		console.log();
	// 		util.debug("should not create a new item, no image");

	// 		//test item
	// 		var incompleteItem = ItemFactory.create( 
	// 			null, "black top", "category 2", "tag1, tag2", null);			

	// 		var options = {
	// 			url: "http://localhost:" + app.settings.port + "/api/items",
	// 			form: incompleteItem
	// 		};

	// 		request.post(options, function(err, res, body){

	// 			if (err) return done(err);

	// 			console.log("== should not create a new item, no image JSON RESPONSE==> " + body);

	// 			//Bad request
	// 			res.should.have.status(400);
	// 			res.should.be.json;
	// 			var obj = JSON.parse(body);
	// 			console.log(obj);
	// 			done();

	// 		});
	// 	});



	// 	//end describe
	// });


	// describe("list user's items: ", function(){

	// 	var item;
	// 	var numItems = 10;
	// 	var numItems2 = numItems/2; //5
	// 	var numItemsCategory1 = numItems2-1; //4
	// 	var createdItems;

	// 	before(function(done){

	// 		console.log();
	// 		console.log('cleaning up the "items" MongoDB collection');
	// 		Item.collection.remove(function(err){

	// 			if (err) return done(err);
				
	// 			done();
	// 		});							

	// 	});


	// 	it('it should create {0} items for user1'.format(numItems), function(done){

	// 		console.log();
	// 		util.debug("it should create {0} items for user1".format(numItems));

	// 		var count = 0,
	// 			options,
	// 			item;

	// 		var numCategory = 1;  //for "category 1"
	// 		for (var i=1; i <= numItems; i++){

	// 			categoryNum = (i <= numItemsCategory1)?1:2;

	//   		    var itemPath = __dirname + "/../fixtures/item_{0}.jpeg".format(i);

	// 			item = ItemFactory.create( 
	// 				null, "item {0}".format(i), "category {0}".format(categoryNum), "tag {0}".format(i), itemPath);			

	// 			var options = {
	// 				url: "http://localhost:" + app.settings.port + "/api/items",
	// 				form: item
	// 			};

	// 			var req = request.post(options.url, function(err, _res, _body){

	// 				if (err) return done(err);

	// 				_res.should.have.status(201);
	// 				util.debug("created item: " + count + ", out of: " + numItems);
	// 				count++;
	// 				if (count === numItems){
	// 					util.debug( "Done! {0} items created.".format(numItems) );
	// 					done();
	// 				}

	// 			});

	// 			//create a form and set the items properties to the form.
	// 			var form = req.form();

	// 			for (var prop in item ){
	// 				if (item.hasOwnProperty(prop)){
	// 					if (item[prop]){
	// 						form.append(prop, item[prop]);
	// 					}
	// 				}
	// 			}

	// 		}
	// 	});


	// 	it ('should list {0} items for user1'.format(numItems), function(done){

	// 		console.log();
	// 		util.debug("should list {0} items for user1".format(numItems));

	// 		//lets retrive the newly created object
	// 		var options = {
	// 			url: "http://localhost:" + app.settings.port + "/api/items"
	// 		};

	// 		//get
	// 		request(options, function(err, res, body){

	// 			if (err) return done(err);

	// 			// console.log("== should list {0} items for user1 JSON RESPONSE==> ".format(numItems) + body);
	// 			res.should.have.status(200);
	// 			res.should.be.json;

	// 			var data = JSON.parse(body);
	// 			util.debug("retrieved '{0}' items.".format(data.items.length));
	// 			(data.items.length).should.equal(numItems);

	// 			//verify that items belong to user, and that
	// 			//they are ordered in reverse chronological order.
	// 			var previousItemTime;
	// 			data.items.forEach(function(item){
					
	// 				userId.should.equal(item.user.id);
	// 				if (previousItemTime 
	// 					&& (previousItemTime < item.createdDate)){
	// 					done(new Error("list should be in reverse chronological order"));
	// 				} 

	// 				previousItemTime = item.createdDate;
	// 			});

	// 			//save items for future tests
	// 			createdItems = data.items;

	// 			done();
				
	// 		});

	// 	});		





	// 	// end describe
	// });

	after(function(done){

		console.log();
		console.log('========== end games-test ========== ');
		console.log();

		done();
	});	

});

