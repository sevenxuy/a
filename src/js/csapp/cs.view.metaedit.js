define(function(require, exports, module) {
    'use strict';

    var _util = require('cs.util'),
        notify = require('cs.plugin.notify');

    $.widget('cs.metaedit', {
        options: {
            // getdatameta: '../../data/getdatameta.json', //for test
            // getMetaDataOptions: '../../data/getMetaDataOptions.json', //for test
            getdatameta: '/udata/mis/getdatameta',
            getMetaDataOptions: '/udata/mis/getMetaDataOptions',
            savedatameta: '/udata/mis/savedatameta',
            app: 'flyflow',
            metaDataOptions: [],
            keyDataOptions: {}
        },
        _create: function(opt) {
            this._renderMetaDataOptionsElem(opt);
            this._bindEvents();
            this.element.data('widgetCreated', true);
        },
        render: function(opt) {
            _.extend(this.options, opt);
            var self = this,
                options = this.options;
            $.ajax({
                url: options.getdatameta,
                data: {
                    app: options.app,
                    data_id: options.id
                }
            }).done(
                function(data) {
                    var meta = data.data,
                        h = [];
                    h.push('<div class="breadcrumbs">');
                    h.push('<div class="breadcrumbs-content" data-rel="tooltip" title="编辑【Meta ' + options.id + '】" >编辑【Meta ' + options.id + '】</div>');
                    h.push('<div class="table-tool">');
                    h.push('<button class="btn btn-mini btn-danger data-save hide"><i class="fa fa-save"></i> 保存</button>');
                    h.push('<button class="btn btn-mini btn-success data-add"><i class="fa fa-plus"></i> 新增</button>');
                    h.push('</div>');
                    h.push('</div>');
                    h.push('<div class="col-xs-12"><table class="table table-bordered table-hover">');
                    h.push('<thead><tr><th>参数</th><th>操作符</th><th>值</th><th>操作</th></tr></thead><tbody id="meta-content">');
                    _.each(meta, function(item, index) {
                        h.push('<tr data-key="' + item.key + '" data-operator="' + item.operator + '" data-value="' + item.value + '">');
                        h.push('<td class="meta-key">' + _util.createSelectElem({
                            selectClass: 'select-meta-key',
                            data: options.keyDataOptions,
                            selected: item.key
                        }) + '</td>');
                        // h.push('<td class="meta-operator">' + item.operator + '</td>');
                        h.push('<td class="meta-operator">' + self._createCellSelectElem(item.key, 'operator', item.operator) + '</td>');
                        // h.push('<td class="meta-value">' + item.value + '</td>');
                        h.push('<td class="meta-value">' + self._createCellSelectElem(item.key, 'value', item.value) + '</td>');
                        // h.push('<td><a class="btn btn-link meta-del">删除</a></td></tr>');
                        h.push('<td>');
                        h.push('<div class="btn-group">');
                        h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
                        h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
                        h.push('<li><a class="data-del">是，确认删除。</a></li>');
                        h.push('</ul>');
                        h.push('</div>');
                        h.push('</td>');
                    });
                    h.push('</tbody></table></div>');
                    self.element.append(h.join(''));
                    if (self.element.hasClass('hide')) {
                        self.element.removeClass('hide').addClass('current');
                    }
                });
        },
        reRender: function(opt) {
            this.element.addClass('hide').empty();
            this.render(opt);
        },
        _renderMetaDataOptionsElem: function(opt) {
            var self = this,
                options = this.options;
            $.ajax({
                url: options.getMetaDataOptions,
                data: {
                    app: options.app
                }
            }).done(function(data) {
                options.metaDataOptions = data.data;
                _.each(options.metaDataOptions, function(item) {
                    options.keyDataOptions[item.key] = item.title;
                });
                self.render(opt);
            });
        },
        _createCellSelectElem: function(datakey, key, selected) {
            var options = this.options,
                item = _.findWhere(options.metaDataOptions, {
                    key: datakey
                });
            if (!_.isEmpty(item[key])) {
                return _util.createSelectElem({
                    selectClass: 'select-meta' + key,
                    data: item[key],
                    selected: selected
                });
            } else {
                return '<input type="text" placeholder="请输入" value="' + (selected || '') + '">';
            }
        },
        _getListByKey: function(key, subkey) {
            var metaDataOptions = this.options.metaDataOptions;
            return _.findWhere(metaDataOptions, {
                key: key
            })[subkey];
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click button.data-add': this._addMetaItemElem,
                'click button.data-save': this._saveMeta,
                'click a.data-del': this._delMetaItem,
                'change select.select-meta-key': this._changeKey,
                'change textarea': this._rowpink,
                'change select': this._rowpink
            });
        },
        _addMetaItemElem: function(event) {
            var options = this.options,
                h = [];
            h.push('<tr>');
            h.push('<td class="meta-key">' + _util.createSelectElem({
                selectClass: 'select-meta-key',
                data: options.keyDataOptions
            }) + '</td>');
            h.push('<td class="meta-operator"></td>');
            h.push('<td class="meta-value"></td>');
            h.push('<td><a class="btn btn-link data-del">删除</a></td>');
            h.push('</tr>');
            $('#meta-content').prepend(h.join(''));
        },
        _saveMeta: function(event) {
            var self = this,
                options = this.options,
                $content = $('#meta-content'),
                metalist = [],
                keys = [];
            $content.find('tr').each(function() {
                var key = $(this).find('td.meta-key').children().eq(0).val(),
                    operator = $(this).find('td.meta-operator').children().eq(0).val(),
                    value = $(this).find('td.meta-value').children().eq(0).val();

                if (key && operator && value) {
                    keys.push(key);
                    metalist.push({
                        key: key,
                        operator: operator,
                        value: value
                    });
                } else {
                    notify({
                        text: '请确保每一行数据输入完整。'
                    });
                    return false;
                }
            });
            if ((!_.isEmpty(keys)) && (_.uniq(keys).length === keys.length)) {
                $.ajax({
                    url: options.savedatameta,
                    data: {
                        app: options.app,
                        data_id: options.id,
                        metadata: JSON.stringify(_.sortBy(metalist, 'key'))
                    }
                }).done(function(response) {
                    if (!response.errno) {
                        self.reRender({
                            id: options.id
                        });
                    } else {
                        notify({
                            text: response.error
                        });
                    }
                }).fail();
            } else {
                notify({
                    text: '请确保参数列的值唯一。'
                });
                return false;
            }
            return false;
        },
        _delMetaItem: function() {
            var $tr = $(event.target).closest('tr');
            if ($tr.attr('data-key')) {
                this._showSaveBtn();
            }
            $tr.remove();
            return false;
        },
        _changeKey: function(event) {
            var $select = $(event.target),
                $tr = $(event.target).closest('tr'),
                key = $select.val();
            $tr.find('td.meta-operator').empty().append(this._createCellSelectElem(key, 'operator'));
            $tr.find('td.meta-value').empty().append(this._createCellSelectElem(key, 'value'));
            return false;
        },
        _rowpink: function(event) {
            var $row = $(event.target).closest('tr');
            if (!$row.hasClass('row-pink')) {
                $row.addClass('row-pink');
            }
            this._showSaveBtn();
            return false;
        },
        _showSaveBtn: function() {
            var $savebtn = this.element.find('button.data-save');
            if ($savebtn.hasClass('hide')) {
                $savebtn.removeClass('hide');
            }
        }
    });
    module.exports = $.cs.metaedit;
});
