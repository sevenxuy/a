define(function(require, exports, module) {

  'use strict';
  require('cs.view.nav');
  require('cs.view.editmeta');

  var $nav = $('#nav-list');

  var cs = {
    initialize: function() {
      $nav.nav();
      $('#editmeta').editmeta();
    }
  };
  module.exports = cs;
});
