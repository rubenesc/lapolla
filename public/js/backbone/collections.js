
    /*
    |--------------------------------------------------------------------------
    | Collections
    |--------------------------------------------------------------------------
    */
    App.Collections.Games = Backbone.Collection.extend({
        model: App.Models.Game
    });

    App.Collections.Groups = Backbone.Collection.extend({
        model: App.Models.Group
    });

    App.Collections.Teams = Backbone.Collection.extend({
        model: App.Models.Team
    });

    App.Collections.Messages = Backbone.Collection.extend({
        model: App.Models.Message
    });
