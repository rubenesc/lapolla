
	/*
	|--------------------------------------------------------------------------
	| Models
	|--------------------------------------------------------------------------
	*/


    App.Models.GamesSync = Backbone.Model.extend({
        url : '/games'
    });

	App.Models.Game = Backbone.Model.extend({

		defaults: {
			gol1: 0,
			gol2: 0,
			pen1: 0,
			pen2: 0
		},

		
		validate: function(attrs){


			if ( !( !isNaN(attrs.gol1) && attrs.gol1 >= 0 && attrs.gol1 <= 20) ){
				return "Invalid goals ["+attrs.gol1+"]";
			}
			
			if ( !( !isNaN(attrs.gol2) && attrs.gol2 >= 0 && attrs.gol2 <= 20) ){
				return "Invalid goals ["+attrs.gol2+"]";
			}

		}

	}); 


	App.Models.Group = Backbone.Model.extend({

	});   

	App.Models.Team = Backbone.Model.extend({
		
	});   

	App.Models.Message = Backbone.Model.extend({
		
	});   


	
