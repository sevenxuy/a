require(['cs'], function(cs) {
    'use strict';

    cs.initialize();

    var AppRouter = Backbone.Router.extend({
        routes: {
            ':m_code/module': 'getmodule',
            ':m_code/module/(:parent_id)': 'getmodule',
            ':m_code/module/(:parent_id)/(:pn)': 'getmodule',
            ':m_code/schema': 'getschema',
            ':m_code/schema/': 'getschema',
            ':m_code/schema/:schema_code': 'getschemaedit',
            'modulelist': 'getmodulelist',
            'modulelist/': 'getmodulelist',
            'userlist': 'getuserlist',
            'userlist/(:pn)': 'getuserlist',
            'log': 'getlog',
            'log/(:pn)': 'getlog'
        }
    });

    var app_router = new AppRouter;

    app_router.on('route:getmodule', function(m_code, parent_id, pn) {
        var opt = {
            m_code: m_code,
            parent_id: parent_id || 0,
            pn: pn || 1
        };
        if ($('#module').hasClass('hide')) {
            $('div.current').removeClass('current').addClass('hide');
            $('#module').removeClass('hide').addClass('current');
        }
        if ($('#module').data('widgetCreated')) {
            $('#module').module('reRender', opt);
        } else {
            $('#module').module(opt);
        }
    });

    app_router.on('route:getschema', function(m_code) {
        var opt = {
            m_code: m_code
        };
        if ($('#schema').hasClass('hide')) {
            $('div.current').removeClass('current').addClass('hide');
            $('#schema').removeClass('hide').addClass('current');
        }
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
        if ($('#schemaedit').hasClass('hide')) {
            $('div.current').removeClass('current').addClass('hide');
            $('#schemaedit').removeClass('hide').addClass('current');
        }
        if ($('#schemaedit').data('widgetCreated')) {
            $('#schemaedit').schemaedit('reRender', opt);
        } else {
            $('#schemaedit').schemaedit(opt);
        }
    });


    app_router.on('route:getmodulelist', function() {
        if ($('#modulelist').hasClass('hide')) {
            $('div.current').removeClass('current').addClass('hide');
            $('#modulelist').removeClass('hide').addClass('current');
        }
        if ($('#modulelist').data('widgetCreated')) {
            $('#modulelist').modulelist('reRender');
        } else {
            $('#modulelist').modulelist();
        }
    });

    app_router.on('route:getuserlist', function(pn) {
        var opt = {
            pn: pn || 1
        };
        if ($('#userlist').hasClass('hide')) {
            $('div.current').removeClass('current').addClass('hide');
            $('#userlist').removeClass('hide').addClass('current');
        }
        if ($('#userlist').data('widgetCreated')) {
            $('#userlist').userlist('reRender', opt);
        } else {
            $('#userlist').userlist(opt);
        }
    });

    app_router.on('route:getlog', function(pn) {
        var opt = {
            pn: pn || 1
        };
        if ($('#log').hasClass('hide')) {
            $('div.current').removeClass('current').addClass('hide');
            $('#log').removeClass('hide').addClass('current');
        }
        if ($('#log').data('widgetCreated')) {
            $('#log').log('reRender', opt);
        } else {
            $('#log').log(opt);
        }
    });


    Backbone.history.start();
});
