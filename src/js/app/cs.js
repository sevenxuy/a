define(function(require, exports, module) {

  'use strict';
  // require('cs.view.nav');
  // require('cs.view.modulelist');
  require('cs.view.userlist');
  // require('cs.view.log');
  // require('cs.view.schema');

  var $nav = $('#nav-list');

  var cs = {
    initialize: function() {
      // $nav.nav();
      // $('#userlist').userlist();
      // $('#module').module();
      // $('#schema').schema();
    }
  };
  module.exports = cs;
});
