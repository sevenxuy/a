define(function(require, exports, module) {
    'use strict';

    var _util = require('cs.util');

    $.widget('cs.log', {
        options: {
            // userlogget: '../../datacms/userlogget.json', //for test
            userlogget: '/ucms/cms/userlogget',
            limit: 60,
            routerstr: 'log'
        },
        _create: function() {
            this.render();
            $(window).resize();
            this.element.data('widgetCreated', true);
        },
        render: function() {
            this._createWrapperElem();
        },
        reRender: function(opt) {
            var options = this.options;
            _.extend(options, opt);
            this.renderTable();
        },
        _createWrapperElem: function() {
            var h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip">Log</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12"><table class="table table-bordered"><thead class="thin-border-bottom">');
            h.push('<tr><th>uname</th><th>real_name</th><th>level</th><th>log_type</th><th>module</th><th>data</th><th>update_time</th></tr>');
            h.push('<thead><tbody id="log-content">');
            h.push('</tbody></table>');
            h.push('<div class="cs-nomoredata hide">没有更多数据</div>');
            h.push('<div id="log-pagingbar"></div>');
            h.push('</div>');
            this.element.append(h.join(''));
            this.renderTable();
            this.element.find('div.breadcrumbs').css({
                'width': this.element.width()
            });
        },
        renderTable: function() {
            var self = this,
                options = this.options;
            $.ajax({
                url: options.userlogget,
                data: {
                    limit: options.limit,
                    offset: (options.pn == 1) ? 0 : parseInt(options.limit, 10) * (parseInt(options.pn, 10) - 1)
                }
            }).done(function(data) {
                var data = data.data;
                options.log_total = data.log_total;
                options.totalpages = Math.ceil(options.log_total / options.limit);
                self._createTableElem(data.log_list);
                if ((options.pn == options.totalpages) || (options.totalpages == 1)) {
                    self.element.find('div.cs-nomoredata').removeClass('hide');
                }
                var setting = {
                    limit: options.limit,
                    totalpages: options.totalpages,
                    pn: parseInt(options.pn, 10),
                    routerstr: options.routerstr
                };
                var $pagingbar = self.element.find('#log-pagingbar');
                if ($pagingbar.data('widgetCreated')) {
                    $pagingbar.pagingbar('reRender', setting);
                } else {
                    $pagingbar.pagingbar(setting);
                }
            }).fail(function(response) {});
        },
        _createTableElem: function(data) {
            var h = [],
                options = this.options;
            if (!_.isEmpty(data)) {
                _.each(data, function(item, index) {
                    h.push('<tr><td>' + item.uname + '</td><td>' + item.real_name + '</td><td>' + item.level + '</td><td>' + item.log_type + '</td><td>' + item.module + '</td><td>' + item.data + '</td><td>' + item.update_time + '</td></tr>');
                });
            }
            this.element.find('#log-content').empty().append(h.join());
        }
    });
    module.exports = $.cs.log;
});
