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

function humanFileSize(bytes) {
  var thresh = 1024;
  var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var u = -1;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
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
      d['readable-disk'] = humanFileSize(this.model.attributes['DiskUsage']);

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
      if (this.model.get('Kind') == 'pdf') {
        d['content-icon'] = "fa-file-pdf-o";
      } else if (this.model.get('Kind') == 'video') {
        d['content-icon'] = 'fa-file-video-o';
      } else {
        d['content-icon'] = 'fa-file-o';
      }
      d['readable-creation-time'] = moment(this.model.attributes['CreationTime'], 'X').fromNow();
      d['readable-favorite-color'] = this.model.get('Favorited') == true ? 'green' : 'black';
      d['favorite-icon'] = this.model.get('Favorited') == true ? 'fa-heart' : 'fa-heart-o';
      return d
    },
    extraevents: {
      'click ': 'toggleCollapsible',
      'click [data-action=OpenLink]': 'openLink',
      'click [data-action=Download]': 'download',
      'click [data-action=MarkFavorite]': 'markFavorite',
      'click [data-action=viewFull]': 'showFull',
      'click [data-action=viewImage]': 'showImage',
      'click [data-action=toggleControls]': 'toggleControls',
      'click [data-action=archive]': 'markArchive',
      'click [data-action=unarchive]': 'markUnarchive',
      'click [data-action=edit]': 'edit',
      'mouseleave': 'hideControls',
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

    hideControls: function (ev) {
      $('.Controls', this.$el).removeClass('Expand');
      $('[data-action=toggleControls]', this.$el).addClass('fa-plus-square-o');
      $('[data-action=toggleControls]', this.$el).removeClass('fa-minus-square-o');
      ev.preventDefault();
      return false;
    },

    toggleControls: function(ev) {
      $('.Controls', this.$el).toggleClass('Expand');
      $('[data-action=toggleControls]', this.$el).toggleClass('fa-plus-square-o');
      $('[data-action=toggleControls]', this.$el).toggleClass('fa-minus-square-o');
      ev.preventDefault();
      return false;
    },

    markArchive: function(ev) {
      if (this.model.get('Archived') == false) {
        this.model.set('Archived', true);
      } else {
        this.model.set('Archived', false);
      }
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

    showImage: function(ev) {
      if (this.model.get('Downloaded') == false || this.model.get('Kind') != 'web') {
        ev.preventDefault();
        return false;
      }

      var target = $('#ArchimedesContent')

      var viewer
      viewer = $('<iframe>');
      viewer.css('width', '100%');
      viewer.css('height', '100%');
      viewer.css('background-color', 'white');
      viewer.attr('src', "/screenshot/" + this.model.id + ".png");
      viewer.attr('frameborder', '0');

      target.html(viewer);

      return false;
    },

    toggleCollapsible: function(ev) {
      if (this.model.get('Downloaded') != false) {
        if (ev.ctrlKey) {
          this.showImage(ev)
        } else {
          this.showCollapsible(ev)
        }
      }
    },

    showFull: function (ev) {
      var url = this.model.get('LocalURL');
      open(url);
      ev.preventDefault();
      return false;
    },

    edit: function (ev) {
      var target = $('#ArchimedesContent');
      var viewer = $('<div>');

      viewer.append( $('<h1>').html(this.model.get('URL')));

      $.each(this.model.attributes, function (key, val) {
        var line = $('<div>');
        var label = $('<span>').css('width', '200px').html(key);
        var input = $('<input>').val(val);
        line.append(label);
        line.append(input);
        viewer.append(line);
      });
      target.html(viewer);

      ev.preventDefault();
      return false;
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
    //templateEmpty: 'noresource',
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
    var target = $('#ArchimedesContent');
    var content = ich['NewResource']();
    target.html(content);
    $('#URL', '#newresource').focus();
    $('[data-action=submit]', '#newresource').click(function() {
      $('#addForm').submit();
    });
    $('#addForm').submit(function(ev) {
      var url = $('input#URL').val();
      var folder = $('input#Folder').val();
      var inmediate = $('input#DownloadInmediately').prop('checked');
      console.log(url, folder, inmediate);

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

  });

  $('[data-action=filterFavorites]').click(function(ev) {
    $(ev.currentTarget).toggleClass('active');
    archimedes.v.toggleFavorites();
  });

  $('[data-action=filterArchived]').click(function(ev) {
    $(ev.currentTarget).toggleClass('active');
    archimedes.v.toggleArchived();
  });


  $('input#URL,input#Folder').keyup(function(event) {
    if (event.which == 13) {
      $('#addForm').submit();
    }
  });

  $('input#FolderFilterInput').keyup(function(event) {
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

  $('#ArchimedesHead').click(function(){
    var target = $('#ArchimedesContent').html('Hello there!');
  });

});
