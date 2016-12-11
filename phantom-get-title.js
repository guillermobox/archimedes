var args = require('system').args;
var page = require('webpage').create();

page.onError = function () {};

page.open(args[1], function(status) {
  console.log(page.title);
  phantom.exit();
});
