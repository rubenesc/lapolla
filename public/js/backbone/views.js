


	/*
	|--------------------------------------------------------------------------
	| Global App View
	|--------------------------------------------------------------------------
	*/


    App.Views.Base = Backbone.View.extend({

      constructor: function() {
        // Define the subviews object off of the prototype chain

        // Call the original constructor
        Backbone.View.apply(this, arguments);

      }
    });

    App.Views.AppGames = App.Views.Base.extend({

        groupViewsHM: {}, //contains the views of each group, ex: GamesView, TeamsView

        groupTeams: {}, //

        knockoutViewsHM: {}, //contains the views of each group, ex: GameView

        messagesView: null,

        el: '#games-form',

        isMatchesView: null,

        initialize: function(options) {

            //Can the user edit the form or is it read only.
            App.Config["canEdit"] = options.canEdit || false;
            
            this.isMatchesView = options.isMatchesView || false;

            if (!App.Config.canEdit){
                this.$("#save-data").hide();
            }            

            //Initialize Game Helper
            App.Helper.Game.initialize();

            vent.on('render:teams', this.renderTeams, this);
            vent.on('render:knockout', this.processKnockOutStage, this);

			//Initalize the groups HTML place holders
            var groups = App.Helper.Game.groups;

            //Append all the Groups Html Placeholder Markup.
			var groupsCol = new App.Collections.Groups(groups);
			var groupsView = new App.Views.Groups({ collection: groupsCol });
			$("#allGroups").append(groupsView.render().el);

			//Load the Games for every Group A-H
	        var groupGamesHM = App.Helper.Game.buildGroupGamesHM(this.collection);

            //Initialize and Save Views for every Group A-H	        
	        for (var group in groupGamesHM){

                if (App.Helper.Game.isGroupStage(group)){
                    
		             var groupGames = groupGamesHM[group];
    		        //Initialize Games View for group [group]
    		        var gamesCol = new App.Collections.Games(groupGames);
    		        var gamesView = new App.Views.Games({collection: gamesCol, group: group});
    		        
    				//Initialize Teams View for group [group]
    				var groupTeams = App.Helper.Game.buildGroupStandings(gamesCol);
    		        var teamsCol = new App.Collections.Teams(groupTeams);
    		        var teamsView = new App.Views.Teams({collection: teamsCol});


    		        this.groupViewsHM[group] = {games: gamesView, teams: teamsView};

                } else {

                    //Knockout Stage, we are going to go by individual games.

                    //Every Stage has a list on individual games.
                    //Create all the Views for the Knockout stage games.
                    //8th, 4th, 2th, 1th ...
                    var groupGames = groupGamesHM[group];   


                    //Create all the Knock Game PlaceHolders by Stage
                    var gamesCol = new App.Collections.Games(groupGames);
                    var koGamePlaceholdersView = new App.Views.KoGamePlaceholders({ collection: gamesCol });
                    $("#stage-"+group).append(koGamePlaceholdersView.render().el);


                    for (var i in groupGames){

                        var game = groupGames[i];
                        // console.log("---> ["+group+"]["+i+"]["+game+"]");

                        var gameView = new App.Views.Game({model: new App.Models.Game(game)});
                        var matchId = gameView.model.get("matchId");
                        this.knockoutViewsHM[matchId] = {game: gameView};
                    }

                }

	        }


            //Render all Views
	        this.render();

            this.messagesView = new App.Views.Messages({collection: new App.Collections.Messages()});
            this.messagesView.render();

		},


        events: {
            'click button#save-data': 'saveData'
        },        

        saveData: function(e){

            e.preventDefault();

            var gamesCol = new App.Collections.Games();
            for (var i in this.groupViewsHM){

                var gamesGroupCol = this.groupViewsHM[i].games.collection;
                
                gamesGroupCol.forEach(function(game){
                    gamesCol.add(game);    
                });
                
            }

           //console.log("ko Views");
            for (var i in this.knockoutViewsHM){
                var game = this.knockoutViewsHM[i].game.model;
                gamesCol.add(game);    
            }

            var sortedByMatchId = gamesCol.sortBy(function (game) {
            return game.get("matchId"); });

            sortedByMatchId.forEach(function(game){
                // console.log("--> " + game.get("matchId"));
            });



           //Send Data to server
            var gamesSync = new App.Models.GamesSync();
            if (this.isMatchesView){
                gamesSync.url = '/matches/';
            }

            gamesSync.set("games", sortedByMatchId);

            var _this = this;
            gamesSync.save(null, {

                success: function(model,resp){

                    if (resp && resp.messages){
                    
                        var messages = resp.messages;

                        for (var i in messages){
                            messages[i] = {"message": messages[i], "type":"success"};
                        }

                        _this.displayMessages(messages);
                    } 
                    
                },

                error: function(model,resp){

                    var messages;

                    if (resp && resp.responseJSON){

                         messages = resp.responseJSON.messages;
                        
                        for (var i in messages){
                            messages[i] = {"message": messages[i], "type": "danger"};
                        }

                    } else {
                        var message = "An unexpected error has occurred."
                        messages = [{"message": message, "type": "danger"}];
                    }

                    _this.displayMessages(messages);


                },
            });

            //Update Messages if any.

        },

        displayMessages: function(messages){

            var mCol = new App.Collections.Messages(messages);
            this.messagesView.setCollection(mCol);
            this.messagesView.render();            

        },

		render: function(){

            //For every group A-H render the Games View and Teams View
	        for (var group in this.groupViewsHM){
                this.renderGroup(group);
	        }

            this.renderKnockoutStage();

		},

        renderGroup: function(group){

            var gamesView = this.groupViewsHM[group].games;
            $("#group-"+group+ " .games").html(gamesView.render().el);

            var teamsView = this.groupViewsHM[group].teams;
           // $("#xg-"+group).parent().find(".teams").append(teamsView.render().el);
           $("#group-"+group+" .teams").append(teamsView.render().el);

           this.processGroupWinners(group, teamsView.collection);
        },

		renderTeams: function(model) {

            //Only Render the Teams for a mentioned group.
			var group = model.get("group");

			if (group){

                //Retrieve the Games View (it has the updated scores)
	        	var gamesView = this.groupViewsHM[group].games;
	        	var gamesCol = gamesView.collection;

                //Retrieve the Teams view, create the new teams collection
                //based on the games collection, and update the Teams View.
	        	var teamsView = this.groupViewsHM[group].teams;
	        	var groupTeams = App.Helper.Game.buildGroupStandings(gamesCol);
	        	var teamsCol = new App.Collections.Teams(groupTeams);
	        	teamsView.setCollection(teamsCol);

                //Render the Teams View.
		      $("#group-"+group+" .teams").append(teamsView.render().el);
              // this.renderGroup(group);

                this.processGroupWinners(group, teamsView.collection);

			}

           this.processKnockOutStage();  

		},




        renderKnockoutStage: function(){

            // console.log(" --> renderKnockoutStage ...");
            for (var matchId in this.knockoutViewsHM){
                var gameView = this.knockoutViewsHM[matchId].game;
                var matchId = gameView.model.get("matchId");
                // console.log("renderKnockoutStage ==> ["+matchId+"]");
               $("#match-"+matchId+ " .game").html(gameView.render().el);
            }            

        },   


        processGroupWinners: function(group, rankingCol){

           var team1 = rankingCol.at(0).get("team");
           var team2 = rankingCol.at(1).get("team");
           var key = App.Helper.Game.groupKeys[group];

           // console.log("---=-> ["+group+"]["+team1.name+"]["+team2.name+"]["+key+"]");

           //team1 
            if (team1){
                var matchId1 = key.first;
                var gameView = this.knockoutViewsHM[matchId1].game;
                gameView.model.set('team1', team1);
                this.knockoutViewsHM[matchId1].game = gameView;
           }

           if (team2){
                var matchId2 = key.second;
                var gameView = this.knockoutViewsHM[matchId2].game;
                gameView.model.set('team2', team2);
                this.knockoutViewsHM[matchId2].game = gameView;
           }

        },

        processKnockOutStage: function(){

            var key, pos, matchId, advanceResult, nextMatchId, matchData, teamData;

            for (var i in this.knockoutViewsHM){

                key = App.Helper.Game.knockoutKeys[i];
                matchId = key.matchId;                
                pos = key.position; //Position of the advancing team in next match, 1 (home) or 2 (visit) 
                nextMatchId = key.nextMatchId; 
                advanceResult = key.advanceResult; //Is the advancing team the w (winter) or l (loser) of the game.

                // console.log("--> ["+matchId+"]["+pos+"]["+nextMatchId+"]["+advanceResult+"]");

                var gameView = this.knockoutViewsHM[matchId].game;
                
                var advancingTeam = App.Helper.Game.retrieveAdvancingTeam(gameView.model, advanceResult);

                //Update next match with the advancing team.
                var nextGameView = this.knockoutViewsHM[nextMatchId].game;
                nextGameView.model.set("team"+pos, advancingTeam);
                
            }            
        }        

	});        



    App.Views.AppMatches = App.Views.AppGames.extend({

        events : function() {
            return _.extend({},_.result(App.Views.AppGames.prototype, 'events'),{
                'click button#reset': 'resetData'

            });
        },

        resetData: function(e){

            e.preventDefault();

            $('#games-form').attr('action', "/matches/reset").submit();            

        }

    });

    /*
    |--------------------------------------------------------------------------
    | Messages View
    |--------------------------------------------------------------------------
    */

    App.Views.Messages = Backbone.View.extend({

        el: ".info-messages ul",

        initialize: function() {
            this.listenTo(this.collection, 'add', this.addOne);
        },

        render: function() {

            this.$('li').remove();
            this.collection.each( this.addOne, this );
            return this;
        },


        unrender: function() {
            this.remove();
        },

        addOne: function(model) {
            var view = new App.Views.Message({ model: model });
            // console.log(gameView.render().el);
            this.$el.append(view.render().el);

        },

      setCollection: function(collection) {
            // unbind all events
            this.collection.stopListening();        
            this.undelegateEvents();



            // set new collection
            this.collection = collection;


            this.initialize();
        },   



    });


    App.Views.Message = Backbone.View.extend({

        tagName: 'li',

        template: template('app-message-template'),

        initialize: function() {

        },

        render: function() {

            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        },

        unrender: function() {
            this.remove();
        }
        
    });    


    /*
    |--------------------------------------------------------------------------
    | KO Game Placeholder View
    |--------------------------------------------------------------------------
    */

    App.Views.KoGamePlaceholders = Backbone.View.extend({

        tagName: 'div',

        initialize: function() {
            this.collection.on('add', this.addOne, this);
        },

        render: function() {
            this.collection.each( this.addOne, this );
            return this;
        },

        addOne: function(model) {
            var view = new App.Views.KoGamePlaceholder({ model: model });
            // console.log(gameView.render().el);
            this.$el.append(view.render().el);
        }
    });

    App.Views.KoGamePlaceholder = Backbone.View.extend({

        tagName: 'div',

        template: template('ko-game-placeholder-template'),

        initialize: function() {

        },

        render: function() {

            this.model.set("title", App.Helper.Game.koTitles[this.model.get("matchId")]);
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        },

        unrender: function() {
            this.remove();
        }
        
    });           



    /*
    |--------------------------------------------------------------------------
    | Groups View
    |--------------------------------------------------------------------------
    */

    App.Views.Groups = Backbone.View.extend({

        tagName: 'div',

        initialize: function() {
            this.collection.on('add', this.addOne, this);
        },

        render: function() {
            this.collection.each( this.addOne, this );
            return this;
        },

        addOne: function(group) {
            var groupView = new App.Views.Group({ model: group });
            // console.log(gameView.render().el);
            this.$el.append(groupView.render().el);
        }
    });

    App.Views.Group = Backbone.View.extend({

        tagName: 'div',

        template: template('allGroupsTemplate'),

        initialize: function() {

        },

        render: function() {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        },

        unrender: function() {
            this.remove();
        }

    });           

    /*
    |--------------------------------------------------------------------------
    | Teams View
    |--------------------------------------------------------------------------
    */
    App.Views.Teams = Backbone.View.extend({

        tagName: 'div',

        template: template('allTeamsTemplate'),

        initialize: function() {
            this.collection.on('add', this.addOne, this);
        },


	  setCollection: function(collection) {
	        // unbind all events
	        this.collection.stopListening();        
	        this.undelegateEvents();

	        // set new collection
	        this.collection = collection;
	        this.delegateEvents({
	            "click": "onClicked",
	            "mouseover": "onMouseOver"
	        });

	        this.initialize();
	    },   


        render: function() {

        	// console.log("App.Views.Teams render!");
      		this.$el.html(this.template());

            this.collection.each( this.addOne, this );

            return this;

        },

        addOne: function(team) {
//                console.dir("--team--> ["+team.get('team')+"]["+team.get('ga')+"]["+team.get('p')+"]");
            var teamView = new App.Views.Team({ model: team });
            // this.$el.append(teamView.render().el);
            this.$('thead').append(teamView.render().el);
        }
    });

    App.Views.Team = Backbone.View.extend({

        tagName: 'tr',

        template: template('teamTemplate'),

        initialize: function() {
        },

        render: function() {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        },

        unrender: function() {
            this.remove();
        }
    });   


    /*
    |--------------------------------------------------------------------------
    | All Games View
    |--------------------------------------------------------------------------
    */
    App.Views.Games = Backbone.View.extend({

        tagName: 'table',

        className: 'table',

        initialize: function(options) {

        	// http://stackoverflow.com/questions/7803138/backbone-js-how-to-pass-parameters-to-a-view/20930054#20930054
        	_.extend(this, _.pick(options, "group"));

            // this.collection.on('add', this.addOne, this);
            this.listenTo(this.collection, 'add', this.addOne);
        },


        render: function() {
        	// console.log("GamesView.render()");
            this.collection.each( this.addOne, this );
            return this;	
        },

        addOne: function(game) {
            var gameView = new App.Views.Game({ model: game });
            // console.log(gameView.render().el);
            this.$el.append(gameView.render().el);
        }


    });

    /*
    |--------------------------------------------------------------------------
    | Single Game View
    |--------------------------------------------------------------------------
    */
    App.Views.Game = Backbone.View.extend({

        tagName: 'tr',

        template: null,

        canEdit: null,

        initialize: function() {

            this.canEdit = App.Config.canEdit || false;

            if (App.Helper.Game.isGroupStage(this.model.get("group"))){
                this.isGroupStage = true;
                this.template = template('allGamesTemplate');
            } else {

                this.template = template('koGameTemplate');
                this.isGroupStage = false;
            }

            this.listenTo(this.model, 'destroy', this.unrender);
            this.listenTo(this.model, 'change', this.render);

              // _.bindAll(this, "retrieveScoreFromForm");
        },


		events: {
			'keyup input': 'updateScore',
            'click .played': 'togglePlayed',
		},

        togglePlayed: function(){

            this.model.set({played: !this.model.get('played')}, {validate: true});
        },

		updateScore: function(){

            // console.log("updateScore");

            var g1 = this.$("input[name=g_1]").val();
            var g2 = this.$("input[name=g_2]").val();

            // var score = this.retrieveScoreFromForm();

            var score = null;

            if ( this.isGroupStage ){

                score = {gol1: +g1, gol2: +g2};

            } else {

                var p1 = this.$("input[name=p_1]").val();
                var p2 = this.$("input[name=p_2]").val();

                p1 = (isNaN(p1)) ? 0 : p1;
                p2 = (isNaN(p2)) ? 0 : p2;

                if (g1 === g2){

                    this.$("input[name=p_1]").show();
                    this.$("input[name=p_2]").show();

                } else {

                    this.$("input[name=p_1]").hide();
                    this.$("input[name=p_2]").hide();

                    p1 = 0; 
                    p2 = 0;
                }

                score = {gol1: +g1, gol2: +g2, pen1: +p1, pen2: +p2};
            }

		    var isUpdateValid = this.model.set(score, {validate: true});
			
            if (!isUpdateValid){
                 this.render();
            }

            if (this.isGroupStage){
              vent.trigger('render:teams', this.model);
            } else {
              vent.trigger('render:knockout', this.model);
            }


		},

        render: function() {
        	// console.log("GameView.render()");
            this.model.set("canEdit", this.canEdit);

            this.$el.html( this.template( this.model.toJSON() ) );

            return this;
        },

        unrender: function() {
            this.remove();
        },

        retrieveScoreFromForm: function(){

            var g1 = this.$g1.val();
            var g2 = this.$g2.val();

            var score = null;

            if ( this.isGroupStage ){

                score = {gol1: +g1, gol2: +g2};

            } else {

                var p1 = this.$p1.val();
                var p2 = this.$p2.val();

                if (g1 === g2){

                    this.$p1.show();
                    this.$p2.show();

                } else {

                    this.$p1.hide();
                    this.$p2.hide();

                    p1 = 0; 
                    p2 = 0;
                }

                score = {gol1: +g1, gol2: +g2, pen1: +p1, pen2: +p2};
            }

            return score;

        }        



    });        




