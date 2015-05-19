require(['cs'], function(cs) {
  'use strict';
  cs.initialize();

  var AppRouter = Backbone.Router.extend({
    routes: {
      'datainfo/:id': 'getdatainfo',
      'data/:id/:code': 'getdata',
      'meta/:id': 'getdatameta',
      'schema/:id': 'getschema',
    }
  });

  var app_router = new AppRouter,
    $mainContainer = $('#mainContainer');

  app_router.on('route:getdatainfo', function(id) {
    var opt = {
      id: id
    };
    $mainContainer.children('div.current').removeClass('current').addClass('hide');
    if ($('#contentlist').data('widgetCreated')) {
      $('#contentlist').contentlist('reRender', opt);
    } else {
      $('#contentlist').contentlist(opt);
    }
  });

  app_router.on('route:getdata', function(id, code) {
    var opt = {
      id: id,
      code: code
    };
    $mainContainer.children('div.current').removeClass('current').addClass('hide');
    if ($('#content').data('widgetCreated')) {
      $('#content').content('reRender', opt);
    } else {
      $('#content').content(opt);
    }
  });



  app_router.on('route:getdatameta', function(id) {
    $('#editmeta').editmeta({
      id: id
    });
  });

  app_router.on('route:getschema', function(id) {
    $('#schema').schema({
      id: id
    });
  });

  Backbone.history.start();

});
