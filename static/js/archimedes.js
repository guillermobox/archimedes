var archimedes = archimedes || {};

$(document).ready(function() {
  archimedes.Models = {};
  archimedes.Collections = {};

  archimedes.Models.Resource = Backbone.Model.extend({
    idAttribute: "ID",
    urlRoot: '/resources/',
    url: function () {
      if (this.id)
        return this.urlRoot + this.id;
      else
        return this.urlRoot;
    },
  });

  archimedes.Collections.Resources = Backbone.Collection.extend({
    model: archimedes.Models.Resource,
    url: "/resources/",
  });

});
