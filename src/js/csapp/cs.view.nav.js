define(function(require, exports, module) {
    'use strict';
    require('cs.view.contentlist');

    $.widget('cs.nav', {
        options: {
            // getcatelist: '../../data/getcatelist.json', //for test
            getcatelist: '/udata/mis/getcatelist',
            app: 'flyflow'
        },
        _create: function() {
            this.render();
            this._bindEvents();
            $(window).resize();

            this.element.data('widgetCreated', true);
        },
        render: function() {
            var self = this,
                options = this.options;
            // nav-list will be renderred at server in smarty, rather than json at client.
            $.ajax({
                url: options.getcatelist,
                data: {
                    app: options.app
                }
            }).done(
                function(data) {
                    var lists = data.data,
                        h = [];
                    _.each(lists, function(item, index) {
                        var hasSubMenu = !_.isEmpty(item.list);
                        h.push('<li class="menu-item" data-id="' + item.id + '" data-code="' + item.code + '" data-name="' + item.name + '">');
                        h.push('<a class="dropdown-toggle"><div class="menu-text"><div>' + item.name + '</div><div class="menu-code">' + item.code + '</div></div>');
                        if (hasSubMenu) {
                            h.push('<b class="arrow fa fa-angle-down" ng-if="item.list"></b>');
                        }
                        h.push('</a>');
                        h.push('<b class="arrow"></b>');
                        if (hasSubMenu) {
                            h.push('<ul class="submenu">');
                            _.each(item.list, function(item, index) {
                                h.push('<li class="submenu-item" data-id="' + item.id + '" data-code="' + item.code + '" data-name="' + item.name + '">');
                                h.push('<a><i class="menu-icon fa fa-caret-right"></i><div><div>' + item.name + '</div><div class="menu-code">' + item.code + '</div></div></a>');
                                h.push('<b class="arrow"></b></li>')
                            });
                            h.push('</ul>');
                        }
                        h.push('</li>');
                    });
                    self.element.append(h.join(''));
                });
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click li.submenu-item': this._gotoContentlist
            });
        },
        _gotoContentlist: function(event) {
            $('li.active').each(function(index) {
                $(this).removeClass('active');
            });
            var $li = $(event.target).closest('li.submenu-item'),
                router = new Backbone.Router;
            $li.addClass('active');
            $li.closest('li.menu-item').addClass('active');
            router.navigate('datainfo/' + $li.attr('data-id'), {
                trigger: true,
            });
            return false;
        }
    });
    module.exports = $.cs.nav;
});
