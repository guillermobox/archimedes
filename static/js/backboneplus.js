var archimedes = archimedes || {};

Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
};


(function($) {
  'use strict';

  /*
   * ICHView is a base view that only defined the reder
   * element to render a ICH template, and set the result
   * as the element. Nothing is inserted in the DOM. Please
   * define the template to get from ich in the template atribute.
   */
  archimedes.ICHView = Backbone.View.extend({
    initialize: function() {
      if (this.extraevents !== undefined) {
        for (var key in this.extraevents)
          this.events[key] = this.extraevents[key];
      }
      this.selectable = true;
    },

    render: function() {
      var extra_dictionary;
      if (this.prerender !== undefined)
        extra_dictionary = this.prerender();
      else
        extra_dictionary = {};
      var model = this.model.toJSON();
      for (var key in extra_dictionary)
        model[key] = extra_dictionary[key];

      this.setElement(ich[this.template](model));

      for (var action in this.actionfilter) {
        if (!this.actionfilter[action](this.model)) {
          $('[data-action=' + action + ']', this.$el).addClass('inactive-control');
        }
      }

      if (this.selectable && this.model.selected) {
        this.$el.addClass('selected');
      } else {
        this.$el.removeClass('selected');
      };
    },

    rerender: function() {
      var prev = this.$el;
      this.render();
      prev.replaceWith(this.$el);
    },

    events: {
      'click [data-action=delete]': 'actionDelete',
    },

    showArchived: function(state) {
      if (this.model.get('Archived') == state) {
        this.$el.removeClass('archived');
        return true;
      } else {
        this.$el.addClass('archived');
        return false;
      }
    },

    showFavorite: function (state) {
      if (this.model.get('Favorited') == false) {
        this.$el.addClass('unfavorited');
      } else {
        this.$el.removeClass('unfavorited');
      }
    },

    filter: function(filters) {
      var show = true;
      for (var field in filters) {
        if (this.model.get(field).indexOf(filters[field]) !== 0) {
          show = false;
          break;
        }
      }
      if (show == false) {
        this.$el.addClass('filtered');
      } else {
        this.$el.removeClass('filtered');
      }
    },

    unselect: function() {
      this.model.selected = false;
      this.model.trigger('select', this.model);
    },

    select: function() {
      this.model.selected = true;
      this.model.trigger('select', this.model);
    },

    toggleSelect: function(ev) {
      if (this.selectable) {
        ev.stopPropagation();
        if (this.model.selected)
          this.model.selected = false;
        else
          this.model.selected = true;
        this.model.trigger('select', this.model);
      }
    },

    actionDelete: function(ev) {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      this.remove();
      this.model.destroy();
    },

  });

  /*
   * CollectionView is used as a parent class for views in which
   * I want to show a collection of items
   */
  archimedes.CollectionView = Backbone.View.extend({
    initialize: function() {
      this.showFavorites = false;
      this.showArchived = false;
      this.selectedIndex = null;

      this.listenTo(this.collection, 'add', this.collectionAdd);
      this.listenTo(this.collection, 'remove', this.collectionRemove);
      this.listenTo(this.collection, 'change', this.updateChanged);

      this.renderedViews = [];
      this.isEmpty = true;
      if (this.extraevents !== undefined)
        for (var key in this.extraevents)
          this.events[key] = this.extraevents[key];

    },

    updateChanged: function(model, options) {
      for (var index in this.renderedViews) {
        var view = this.renderedViews[index];
        if (view.model == model) {
          view.showArchived(this.showArchived);
        }
      }
    },

    selectNone: function(ev) {
      var prev = this.selectedIndex;
      this.selectedIndex = null;
      if (prev !== null) {
        this.renderedViews[prev].unselect();
      }
    },

    toggleArchived: function() {
      if (!this.showArchived) {
        _.invoke(this.renderedViews, "showArchived", true);
        this.showArchived = true;
      } else {
        _.invoke(this.renderedViews, "showArchived", false);
        this.showArchived = false;
      }
    },

    toggleFavorites: function() {
      if (this.showFavorites == false) {
        _.invoke(this.renderedViews, "showFavorite", true);
        this.$el.addClass('filtering-favorites');
        this.showFavorites = true;
      } else {
        _.invoke(this.renderedViews, "showFavorite", false);
        this.$el.removeClass('filtering-favorites');
        this.showFavorites = false;
      }
    },

    filterByFolder: function(folder) {
      _.invoke(this.renderedViews, "filter", {
        Folder: folder
      });
    },

    collectionAdd: function(model, collection, options) {
      if (this.isEmpty)
        this.modelsList.empty();
      this.isEmpty = false;
      var sortingkey = 'CreationTime';

      for (var i in collection.models) {
        var m = collection.models[i];
        if (m.id === model.id) {
          var newView = new this.ModelView({
            model: model
          });
          newView.render();

          /* insert the element in the right position */

          var i = 0;
          for (i = 0; i < this.renderedViews.length; i++) {
            var view = this.renderedViews[i];
            var othermodel = view.model;
            if (model.get(sortingkey) > othermodel.get(sortingkey)){
              break;
            }
          }

          if (this.renderedViews.length == 0) {
            this.modelsList.append(newView.$el);
            this.renderedViews = this.renderedViews.concat(newView);
          } else {

            if (i == this.renderedViews.length) {
              this.modelsList.append(newView.$el);
            } else {
              $(this.modelsList.children()[i]).before(newView.$el);
            }

            if (i == this.renderedViews.length) {
              this.renderedViews = this.renderedViews.concat(newView);
            } else {
              this.renderedViews = this.renderedViews.slice(0,i).concat(newView).concat(this.renderedViews.slice(i));
            }
          }

          newView.showArchived(false);

          this.listenTo(model, 'change', this.rerenderModel);
          this.listenTo(model, 'select', this.rerenderModel);
          return this;
        }
      }
    },

    collectionRemove: function(model, collection, options) {
      for (var index in this.renderedViews) {
        var view = this.renderedViews[index];
        if (view.model == model) {
          view.remove();
          this.renderedViews.splice(index, 1);
        }
      }
      if (this.renderedViews.length == 0) {
        this.isEmpty = true;
        this.renderEmpty();
      }
    },

    render: function() {
      this.renderCollection();
      this.modelsList = $("[data-role=list]", this.$el);
      if (this.modelsList.length == 0) {
        this.modelsList = this.$el;
      }
      if (this.collection.length) {
        this.collection.forEach(this.renderModel, this);
      } else {
        this.renderEmpty();
      }
      return this;
    },

    renderCollection: function() {
      var dom = ich[this.template]();
      this.setElement(dom);
    },

    renderModel: function(model) {
      this.isEmpty = false;
      var newView = new this.ModelView({
        model: model
      });
      var newDOM = newView.render();
      this.modelsList.append(newView.$el);
      this.renderedViews.push(newView);
      this.listenTo(model, 'change', this.rerenderModel);
      this.listenTo(model, 'select', this.rerenderModel);
      return this;
    },

    renderEmpty: function() {
      if (this.templateEmpty) {
        this.isEmpty = true;
        var newDOM = ich[this.templateEmpty]();
        this.modelsList.append(newDOM);
      }
    },

    rerenderModel: function(model) {
      var modelview = undefined;
      for (var view in this.renderedViews) {
        if (this.renderedViews[view].model.cid == model.cid) {
          modelview = this.renderedViews[view];
          break;
        }
      };
      var prev$el = modelview.$el;
      modelview.render();
      prev$el.replaceWith(modelview.$el);
    },

    getSelectedModels: function() {
      var view, i;
      var models = [];
      for (i in this.renderedViews) {
        view = this.renderedViews[i];
        if (view.model.selected)
          models.push(view.model);
      }
      return models;
    },
  });

})(jQuery);
