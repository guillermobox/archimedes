var args = require('system').args;
var page = require('webpage').create();

page.viewportSize = { width:1090, height: 1080};
page.open(args[1], function() {
  page.render(args[2]);
  phantom.exit();
});
