define(function(require, exports, module) {
  'use strict';

  var AppRouter = Backbone.Router.extend({
    routes: {
      ':m_code/module': 'getmodule',
      ':m_code/module/': 'getmodule',
      ':m_code/module/:parent_id': 'getmodule',
      ':m_code/schema': 'getschemalist',
      ':m_code/schema/:schema_code': 'getschema',
      ':m_code/schema/:schema_code/edit': 'getschemaedit'
    },
    getmodule: function(m_code, parent_id) {
      if (!parent_id) {
        parent_id = 0;
      }
      var opt = {
        m_code: m_code,
        parent_id: parent_id
      };

      $('div.current').removeClass('current').addClass('hide');
      if ($('#module').data('widgetCreated')) {
        $('#module').module('reRender', opt);
      } else {
        $('#module').module(opt);
      }
    },
    getschemalist: function(m_code) {
      var opt = {
        m_code: m_code
      };
      $('div.current').removeClass('current').addClass('hide');
      if ($('#schema').data('widgetCreated')) {
        $('#schema').schema('reRender', opt);
      } else {
        $('#schema').schema(opt);
      }
    }
  });
  var router = new AppRouter;
  exports.router = $.cs.router;
});
