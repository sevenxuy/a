define(function(require, exports, module) {

    'use strict';
    require('cs.view.nav');
    require('cs.view.module');
    require('cs.view.schema');
    require('cs.view.schemaedit');
    require('cs.view.modulelist');
    require('cs.view.userlist');
    require('cs.view.log');
    require('cs.plugin.pagingbar');
    require('cs.plugin.notify');

    var $nav = $('#nav-list');

    var cs = {
        initialize: function() {
            $nav.nav();
        }
    };
    module.exports = cs;
});
