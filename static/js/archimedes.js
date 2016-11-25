var archimedes = archimedes || {};

function getFromPocket() {
	var content = ich['pocket']();
	var target = $('#ArchimedesContent')
	$('#iframepocket', content).attr('src', 'http://localhost:8081/pocket/');
	target.html(content);
	$('#closepocket').click(function(ev){
	$('#ArchimedesContent').html('');
	});

  $('#getpocket').click(function (ev){
    var form = $('#Archimedes').contents().find('form');

    form.each(function (i, element) {
      var $inputs = $(':input', $(element));

      var values = {};
      $inputs.each(function() {
        if ( $(this).attr('type') == 'checkbox')
          values[this.name] = $(this).prop('checked');
        else
          values[this.name] = $(this).val();
      });

      if (values['Retrieve'] == "true") {
        var resource = new archimedes.Models.Resource({
          URL: values['URL'],
          Folder: values['Folder'] || '/pocket',
          Title: "",
        });
        resource.save({}, {
          wait: true,
          success: function(model, response, options) {
            archimedes.res.add(resource);
            /* now remove it from Pocket */
            $.ajax("http://localhost:8081/pocket/remove/" + values["ID"]);
            if (values['Download']) {
              var action = new archimedes.Models.Action();
              action.set("Target", resource.id);
              action.set("Type", "Download");
              action.save();
            }
          }
        });

      };
    });
		$('#ArchimedesContent').html('');
  });

}

function humanFileSize(bytes, si) {
  var thresh = 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

refreshData = function() {
  archimedes.res.fetch();
};

$(document).ready(function() {
  archimedes.Views = new Object();
  archimedes.Collections = new Object();
  archimedes.Models = new Object();

  archimedes.Models.Resource = Backbone.Model.extend({
    idAttribute: "ID",
    urlRoot: '/resources/',
    url: function () {
      if (this.id)
        return this.urlRoot + this.id;
      else
        return this.urlRoot;
    },
    initialize: function() {
      this.on('change', function(model, options) {
        var attr = model.changedAttributes();
        var prevattr = model.previousAttributes();
        if ((attr['Downloaded'] == true && prevattr['Downloaded'] == false) ||
          (prevattr['Downloading'] == true && attr['Downloading'] == false)) {
          var show = this.get('Title') || this.get('URL');
          Materialize.toast('<b>' + show + '</b>&nbsp;&nbsp;finished downloading', 2000);
        }
      });
    },
  });

  archimedes.Models.Action = Backbone.Model.extend({
    idAttribute: "ID",
    url: "/actions/",
  });

  archimedes.Collections.Resources = Backbone.Collection.extend({
    model: archimedes.Models.Resource,
  });

  archimedes.Views.ResourceRow = archimedes.ICHView.extend({
    template: 'resource',
    prerender: function() {
      var d = {};
      d['readable-disk'] = humanFileSize(this.model.attributes['DiskUsage'], true);

      if (this.model.attributes['Archived'] == true) {
        d['icon'] = 'close';
        d['status_msg'] = 'This resource is archived';
      } else if (this.model.attributes['Downloading'] == true) {
        d['icon'] = 'import_export';
        d['status_msg'] = 'Downloading';
      } else if (this.model.attributes['Downloaded'] == true) {
        d['icon'] = 'done';
        d['status_msg'] = 'Downloaded';
      } else {
        d['icon'] = 'bookmark_border';
        d['status_msg'] = 'Bookmarked';
        if (this.model.attributes['ErrorMsg'] != '') {
          d['icon'] = 'error_outline';
          d['status_msg'] = this.model.attributes['ErrorMsg'];
        }
      }

      if (!this.model.attributes['Title'].trim()) {
        d['readable-title'] = this.model.attributes['URL'];
      } else {
        d['readable-title'] = this.model.attributes['Title'];
      }
      d['readable-creation-time'] = moment(this.model.attributes['CreationTime'], 'X').fromNow();
      d['readable-favorite-color'] = this.model.get('Favorited') == true ? 'green' : 'gray';
      d['favorite-icon'] = this.model.get('Favorited') == true ? 'favorite' : 'favorite_border';
      return d
    },
    extraevents: {
      'click .collapsible-header': 'toggleCollapsible',
      'click [data-action=OpenLink]': 'openLink',
      'click [data-action=Download]': 'download',
      'click [data-action=MarkFavorite]': 'markFavorite',
      'click [data-action=viewFull]': 'showFull',
      'click [data-action=viewImage]': 'showImage',
      'click [data-action=ShowControls]': 'toggleControls',
      'click [data-action=archive]': 'markArchive',
      'click [data-action=unarchive]': 'markUnarchive',
      'mouseleave': 'hideControls',
      'mouseenter': 'showControls',
    },

    actionfilter: {
      'archive': function(m) {return m.get('Archived') == false;},
      'unarchive': function(m) {return m.get('Archived') == true;},
      'Download': function(m) {return m.get('Archived') == false;},
      'viewFull': function (m) {return m.get('Downloaded');},
      'viewImage': function (m) {return m.get('Downloaded');},
    },

    download: function(ev) {
      var action = new archimedes.Models.Action();
      action.set("Target", this.model.id);
      action.set("Type", "Download");
      action.save();
      ev.preventDefault();
      return false;
    },

    toggleControls: function(ev) {
      $('span[data-role=controls]', this.$el).toggle();
      $('[data-action=ShowControls]', this.$el).toggleClass('button_selected');
      ev.preventDefault();
      return false;
    },

    markUnarchive: function(ev) {
      this.model.set('Archived', false);
      this.model.save();
      ev.preventDefault();
      return false;
    },

    markArchive: function(ev) {
      this.model.set('Archived', true);
      this.model.save();
      ev.preventDefault();
      return false;
    },

    markFavorite: function(ev) {
      this.model.set('Favorited', this.model.get('Favorited') == true ? false : true);
      this.model.save();
      this.showFavorite();
      ev.preventDefault();
      return false;
    },

    openLink: function(ev) {
      window.open(this.model.get('URL'), '_blank');
      ev.preventDefault();
      return false;
    },

    showControls: function(ev) {
      $('[data-role=normallyHidden]', this.$el).css('visibility', 'visible');
    },

    hideControls: function(ev) {
      $('[data-role=normallyHidden]', this.$el).css('visibility', 'hidden');
      $('span[data-role=controls]', this.$el).hide();
      $('[data-action=ShowControls]', this.$el).removeClass('button_selected');
    },

    showImage: function(ev) {
      if (this.model.get('Downloaded') == false || this.model.get('Kind') != 'web') {
        ev.preventDefault();
        return false;
      }

      var overlay = $('#FullScreenOverlay');

      var viewer
      viewer = $('<iframe>');
      viewer.css('width', '100%');
      viewer.css('height', '100%');
      viewer.css('margin-top', '-10px');
      viewer.attr('src', "/screenshot/" + this.model.id + ".png");
      viewer.attr('frameborder', '0');

      overlay.html(viewer);

      $('Archimedes').hide();
      ev.preventDefault();
      $('#NavigationBar').hide();
      archimedes.nav = new archimedes.Views.ResourceNav({
        model: this.model
      });

      Mousetrap.bind('escape', archimedes.nav.goback.bind(archimedes.nav));

      archimedes.nav.render();
      $('#NavigationBar').before(archimedes.nav.el);

      overlay.show();
      return false;
    },

    toggleCollapsible: function(ev) {
      if (this.model.get('Downloaded') == false) {
        ev.preventDefault();
        return false;
      }
      if (ev.ctrlKey === true) {
        if (ev.shiftKey === true) {
          this.showImage(ev);
        } else {
          this.showFull(ev);
        }
        ev.preventDefault();
        return false;
      }
      if (this.$el.hasClass('active')) {
        this.hideCollapsible(ev)
      } else {
        this.showCollapsible(ev)
      }
    },

    hideCollapsible: function(ev) {
      var target = $('.collapsible-body', this.$el).children();
      target.html("");
    },

    showCollapsible: function(ev) {
      var target = $('#ArchimedesContent')
      var url = this.model.get('LocalURL');
      var viewer

      if (this.model.get('Kind') == 'pdf') {
        viewer = $('<object>');
        viewer.css('width', '100%');
        viewer.css('height', '100%');
        viewer.attr('data', url);
      } else if (this.model.get('Kind') == 'video') {
        viewer = $('<video>');
        viewer.css('width', '100%');
        viewer.css('height', '100%');
        viewer.attr('src', url);
        viewer.prop('controls', true);
        viewer.prop('autoplay', true);
      } else {
        viewer = $('<iframe>');
        viewer.css('width', '100%');
        viewer.css('height', '100%');
        viewer.attr('src', url);
        viewer.attr('frameborder', '0');
        viewer.attr('sandbox', 'allow-scripts allow-popups allow-same-origin allow-forms');
      }

      target.html(viewer);
    },

    showFull: function(ev) {
      if (this.model.get('Downloaded') == false) {
        ev.preventDefault();
        return false;
      }

      var url = this.model.get('LocalURL');
      var overlay = $('#FullScreenOverlay');
      var viewer

      if (this.model.get('Kind') == 'pdf') {
        viewer = $('<object>');
        viewer.css('width', '100%');
        viewer.css('height', '100%');
        viewer.css('margin-top', '-10px');
        viewer.attr('data', url);
      } else if (this.model.get('Kind') == 'video') {
        viewer = $('<video>');
        viewer.css('width', '100%');
        viewer.css('height', '100%');
        viewer.css('margin-top', '-10px');
        viewer.attr('src', url);
        viewer.prop('controls', true);
        viewer.prop('autoplay', true);
      } else {
        viewer = $('<iframe>');
        viewer.css('width', '100%');
        viewer.css('height', '100%');
        viewer.css('margin-top', '-10px');
        viewer.attr('src', url);
        viewer.attr('frameborder', '0');
        viewer.attr('sandbox', 'allow-scripts allow-popups allow-same-origin allow-forms');
      }

      overlay.html(viewer);
      overlay.show();

      $('#Archimedes').hide();
      $('#NavigationBar').hide();
      archimedes.nav = new archimedes.Views.ResourceNav({
        model: this.model
      });
      Mousetrap.bind('escape', archimedes.nav.goback.bind(archimedes.nav));
      archimedes.nav.render();
      $('#NavigationBar').before(archimedes.nav.el);

      ev.preventDefault();
      return false;
    },
  });

  archimedes.Views.ResourceNav = archimedes.ICHView.extend({
    template: 'resourcenav',
    extraevents: {
      'click [data-action=back]': 'goback',
      'click [data-action=add]': 'addresource',
    },
    prerender: function(ev) {
      var d = new Object();
      if (!this.model.attributes['Title'].trim()) {
        d['readable-title'] = this.model.attributes['URL'];
      } else {
        d['readable-title'] = this.model.attributes['Title'];
      }
      d['readable-disk-usage'] = humanFileSize(this.model.attributes['DiskUsage']);
      return d;
    },
    addresource: function(ev) {
      $('#newresource').openModal();
    },
    goback: function(ev) {
      var overlay = $('#FullScreenOverlay');
      overlay.hide();
      this.$el.hide();
      $('#Archimedes').show();
      $("#NavigationBar").show();
      delete this;
    },
  });

  archimedes.Views.ResourceList = archimedes.CollectionView.extend({
    template: 'resourcelist',
    templateEmpty: 'noresource',
    ModelView: archimedes.Views.ResourceRow,
  });

  archimedes.res = new archimedes.Collections.Resources();
  archimedes.res.url = '/resources/'
  archimedes.res.fetch()

  archimedes.v = new archimedes.Views.ResourceList({
    collection: archimedes.res,
  });
  archimedes.v.render();

  $('#Archimedes').append(archimedes.v.$el);

  $('[data-action=add]').click(function(ev) {
    $('#newresource input').val('');
    $('#URL').val('');
    $('#Folder').val('');
    $('#newresource').openModal({
      in_duration: 0,
      out_duration: 0
    });
    $('#URL', '#newresource').focus();
  });

  $('[data-action=filterFavorites]').click(function(ev) {
    $(ev.currentTarget).toggleClass('active');
    archimedes.v.toggleFavorites();
  });

  $('[data-action=filterArchived]').click(function(ev) {
    $(ev.currentTarget).toggleClass('active');
    archimedes.v.toggleArchived();
  });

  $('[data-action=submit]').click(function() {
    $('#addForm').submit();
  });

  $('input#URL,input#Folder').keyup(function(event) {
    if (event.which == 13) {
      $('#addForm').submit();
    }
  });

  $('#FolderFilterInput').blur(function() {
    $('#FolderFilterBox').css('opacity', '0.2');
  });

  $('input#FolderFilterInput').keyup(function(event) {
    $('#FolderFilterBox').css('opacity', '0.7');
    if (event.which == 13) {
      $('#FolderFilterInput').blur();
    } else if (event.which == 27) {
      $('#FolderFilterInput').val('/').blur();
      archimedes.v.filterByFolder('/');
      $('#FolderFilterInput').blur();
    } else {
      var value = $('#FolderFilterInput').val();
      archimedes.v.filterByFolder(value);
    };
  });

  $('#addForm').submit(function(ev) {
    var url = $('input#URL').val();
    var folder = $('input#Folder').val();
    var inmediate = $('input#DownloadInmediately').prop('checked');


    if (folder.indexOf("/") !== 0) {
      folder = "/" + folder;
    };

    var resource = new archimedes.Models.Resource({
      URL: url,
      Folder: folder,
      Title: "",
    });

    resource.save(null, {
      wait: true,
      async: false,
      parse: true,
      success: function(model, response, options) {
        archimedes.res.add(resource);
        $('#newresource').closeModal();
        if (inmediate) {
          var action = new archimedes.Models.Action();
          action.set("Target", resource.id);
          action.set("Type", "Download");
          action.save();
        }
      }
    });

    ev.preventDefault();
    return false;
  });

  archimedes.resfresh = window.setInterval(refreshData, 1000 * 5);


  Mousetrap.bind('ctrl+v', function(e) {
    $('[data-action=add]').click();
  });

  Mousetrap.bind('/', function(e) {
    $('#FolderFilterInput').val('');
    $('#FolderFilterInput').focus();
  });

  Mousetrap.bind('f', function() {
    $('[data-action=filterFavorites]').click();
  });

  Mousetrap.bind('p', function() {
    getFromPocket();
  });

  Mousetrap.bind('z', function() {
    var root = $('iframe')[0].contentDocument;
    var html = root.getElementsByTagName("html")[0];
    var zoom = html.style['zoom'];
    if (zoom == "") {
      zoom = 1.0;
    }
    zoom = zoom * 1 + 0.2;
    html.style['zoom'] = zoom;
  });

  Mousetrap.bind('Z', function() {
    var root = $('iframe')[0].contentDocument;
    var html = root.getElementsByTagName("html")[0];
    var zoom = html.style['zoom'];
    if (zoom == "") {
      zoom = 1.0;
    }
    zoom = zoom * 1 - 0.2;
    html.style['zoom'] = zoom;
  });

  Mousetrap.bind('a', function() {
    $('[data-action=filterArchived]').click();
  });

});
