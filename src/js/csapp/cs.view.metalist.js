define(function(require, exports, module) {
    'use strict';
    $.widget('cs.metalist', {
        options: {
            // getMetaDataOptions: '../../data/getMetaDataOptions.json',
            getMetaDataOptions: '/udata/mis/getMetaDataOptions',
            // getdatameta: '../../data/getdatameta.json',
            getdatameta: '/udata/mis/getdatameta',
            app: 'flyflow',
            selectData: ['>', '>=', '<<=', '==', '!=', 'in', 'notin', 'inmc', 'isset', 'notisset', 'v>', 'v<', 'v=', 'v>=', 'v<=']
        },
        _create: function() {
            this.render();
            // this._bindEvents();
            this.element.data('widgetCreated', true);
        },
        render: function() {
            var self = this,
                options = this.options;
            $.ajax({
                url: options.getMetaDataOptions,
                data: {
                    app: options.app
                }
            }).done(function(data) {
                self.element.append(self._createMetalistElem(data.data));
                if (self.element.hasClass('hide')) {
                    self.element.removeClass('hide').addClass('current');
                }
            });
        },
        reRender: function(opt) {
            this.element.addClass('hide').empty();
            this.render(opt);
        },
        _bindEvents: function() {
            this._on(this.element, {});
        },
        _createMetalistElem: function(lists) {
            var h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip" title="Data">Data</div>');
            h.push('<div class="table-tool">');
            h.push('<button class="btn btn-mini btn-danger content-save hide"><i class="fa fa-save"></i> 保存</button>');
            h.push('<button class="btn btn-mini btn-success content-add"><i class="fa fa-plus"></i> 新增</button>');
            h.push('</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12"><table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr><th>key</th><th>title</th><th>operator</th><th>reserved</th><th>operation</th></tr></thead><tbody>');
            _.each(lists, function(item, index) {
                h.push('<tr><td>' + item.key + '</td><td>' + item.title + '</td><td><div class="tags">');
                _.each(item.operator, function(op, index) {
                    h.push('<span class="tag">' + op + '</span>');
                });
                h.push('</div></td><td>');
                if (!_.isEmpty(item.value)) {
                    h.push('<div class="tags">');
                    _.each(item.value, function(val, index) {
                        h.push('<span class="tag">' + val + '</span>');
                    });
                    h.push('</div>');
                }
                h.push('</td><td></td></tr>');
            });
            h.push('</tbody></body></div>')
            return h.join('');

        }
    });
    module.exports = $.cs.metalist;
});
