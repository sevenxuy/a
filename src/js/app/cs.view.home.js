define(function(require, exports, module) {

  'use strict';

  $.widget('cs.home', {
    _create: function() {
      this.element.append('Home Page');
    }
  });
  module.exports = $.cs.home;
});
