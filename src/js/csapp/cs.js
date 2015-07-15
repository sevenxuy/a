define(function(require, exports, module) {

    'use strict';
    require('cs.view.nav');
    require('cs.view.content');
    require('cs.view.contentlist');
    require('cs.view.metaedit');
    require('cs.view.schemaedit');
    require('cs.view.metalist');
    require('cs.view.category');
    require('cs.view.userlist');
    require('cs.view.loglist');

    var $nav = $('#nav-list');

    var cs = {
        initialize: function() {
            $nav.nav();
        }
    };
    module.exports = cs;
});
