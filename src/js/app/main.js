require(['cs'], function(cs) {
  'use strict';

  cs.initialize();

  var AppRouter = Backbone.Router.extend({
    routes: {
      ':m_code/': 'getmodule',
      ':m_code/module': 'getmodule',
      ':m_code/module/': 'getmodule',
      ':m_code/module/:parent_id': 'getmodule',
      ':m_code/schema': 'getschema',
      ':m_code/schema/': 'getschema',
      ':m_code/schema/:schema_code': 'getschemaedit',
      'modulelist': 'getmodulelist',
      'userlist/:limit/:pageid': 'getuserlist',
      'log/:limit/:pageid': 'getlog'
    }
  });

  var app_router = new AppRouter,
    $mainContainer = $('#mainContainer');

  app_router.on('route:getmodule', function(m_code, parent_id) {
    if (!parent_id) {
      parent_id = 0;
    }
    var opt = {
      m_code: m_code,
      parent_id: parent_id
    };

    $mainContainer.children('div.current').removeClass('current').addClass('hide');
    if ($('#module').data('widgetCreated')) {
      $('#module').module('reRender', opt);
    } else {
      $('#module').module(opt);
    }
  });

  app_router.on('route:getschema', function(m_code, schema_code) {
    var opt = {
      m_code: m_code,
      schema_code: schema_code
    };
    $mainContainer.children('div.current').removeClass('current').addClass('hide');
    if ($('#schema').data('widgetCreated')) {
      $('#schema').schema('reRender', opt);
    } else {
      $('#schema').schema(opt);
    }
  });

  app_router.on('route:getschemaedit', function(m_code, schema_code) {
    var opt = {
      m_code: m_code,
      schema_code: schema_code
    };
    $mainContainer.children('div.current').removeClass('current').addClass('hide');
    if ($('#schemaedit').data('widgetCreated')) {
      $('#schemaedit').schemaedit('reRender', opt);
    } else {
      $('#schemaedit').schemaedit(opt);
    }
  });

  app_router.on('route:getmodulelist', function() {
    $mainContainer.children('div.current').removeClass('current').addClass('hide');
    if ($('#modulelist').data('widgetCreated')) {
      $('#modulelist').modulelist('reRender');
    } else {
      $('#modulelist').modulelist();
    }
  });

  app_router.on('route:getuserlist', function(limit, pageid) {
    var opt = {
      limit: limit,
      pageid: pageid
    };
    $mainContainer.children('div.current').removeClass('current').addClass('hide');
    if ($('#userlist').data('widgetCreated')) {
      $('#userlist').userlist('reRender', opt);
    } else {
      $('#userlist').userlist(opt);
    }
  });

  app_router.on('route:getlog', function(limit, pageid) {
    var opt = {
      limit: limit,
      pageid: pageid
    };
    $mainContainer.children('div.current').removeClass('current').addClass('hide');
    if ($('#log').data('widgetCreated')) {
      $('#log').log('reRender', opt);
    } else {
      $('#log').log(opt);
    }
  });


  Backbone.history.start();
});
