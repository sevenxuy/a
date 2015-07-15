  require(['cs'], function(cs) {
      'use strict';
      cs.initialize();

      var AppRouter = Backbone.Router.extend({
          routes: {
              'datainfo/:id': 'getdatainfo',
              'data/:id/:parent_code': 'getdata',
              'meta/:id': 'getmetaedit',
              'schema/:id': 'getschemaedit',
              'meta': 'getmetalist',
              'cate': 'getcategory',
              'user': 'getuserlist',
              'log': 'getloglist'
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

      app_router.on('route:getdata', function(id, parent_code) {
          var opt = {
              id: id,
              parent_code: parent_code
          };
          $mainContainer.children('div.current').removeClass('current').addClass('hide');
          if ($('#content').data('widgetCreated')) {
              $('#content').content('reRender', opt);
          } else {
              $('#content').content(opt);
          }
      });

      app_router.on('route:getmetaedit', function(id) {
          var opt = {
              id: id
          };
          $mainContainer.children('div.current').removeClass('current').addClass('hide');
          if ($('#metaedit').data('widgetCreated')) {
              $('#metaedit').metaedit('reRender', opt);
          } else {
              $('#metaedit').metaedit(opt);
          }
      });

      app_router.on('route:getschemaedit', function(id) {
          var opt = {
              id: id
          };
          $mainContainer.children('div.current').removeClass('current').addClass('hide');
          if ($('#schemaedit').data('widgetCreated')) {
              $('#schemaedit').schemaedit('reRender', opt);
          } else {
              $('#schemaedit').schemaedit(opt);
          }
      });

      app_router.on('route:getmetalist', function(id) {
          $mainContainer.children('div.current').removeClass('current').addClass('hide');
          if ($('#metalist').data('widgetCreated')) {
              $('#metalist').metalist('reRender');
          } else {
              $('#metalist').metalist();
          }
      });

      app_router.on('route:getcategory', function(id) {
          $mainContainer.children('div.current').removeClass('current').addClass('hide');
          if ($('#category').data('widgetCreated')) {
              $('#category').category('reRender');
          } else {
              $('#category').category();
          }
      });

      app_router.on('route:getuserlist', function(id) {
          $mainContainer.children('div.current').removeClass('current').addClass('hide');
          if ($('#userlist').data('widgetCreated')) {
              $('#userlist').userlist('reRender');
          } else {
              $('#userlist').userlist();
          }
      });

      app_router.on('route:getloglist', function(id) {
          $mainContainer.children('div.current').removeClass('current').addClass('hide');
          if ($('#loglist').data('widgetCreated')) {
              $('#loglist').loglist('reRender');
          } else {
              $('#loglist').loglist();
          }
      });


      Backbone.history.start();

  });
