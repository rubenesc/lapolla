
(function() {
    window.App = {
        Models: {},
        Collections: {},
        Views: {},
        Router: {},
        Helper: {},
        Config: {}
    };

    window.vent = _.extend({}, Backbone.Events);

    window.template = function(id) {
        return _.template( $('#' + id).html() );
    };

})();

