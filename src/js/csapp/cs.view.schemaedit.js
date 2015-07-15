define(function(require, exports, module) {
    'use strict';
    var _util = require('cs.util'),
        notify = require('cs.plugin.notify');

    var i = 0,
        level = 0;
    $.widget('cs.schemaedit', {
        options: {
            // getschema: '../../data/getschema.json',
            getschema: '/udata/mis/getschema',
            saveSchema: '/udata/mis/saveSchema',
            app: 'flyflow',
            typeSelectData: ['text', 'boolean', 'file', 'image', 'select', 'time'],
            schemadata: {}
        },
        _create: function() {
            this.render();
            this._bindEvents();
            this.element.data('widgetCreated', true);
        },
        render: function() {
            var self = this,
                options = this.options;
            $.ajax({
                url: options.getschema,
                data: {
                    app: options.app,
                    id: options.id
                }
            }).done(function(data) {
                var schema = $.parseJSON(data.data);
                self._renderSchemaElem();
                self._renderSchemaItemElem(schema);
                if (self.element.hasClass('hide')) {
                    self.element.removeClass('hide').addClass('current');;
                }
            });
        },
        reRender: function(options) {
            _.extend(this.options, options);
            this.element.addClass('hide').empty();
            this.render();
        },
        _renderSchemaElem: function() {
            var h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip" title="">编辑【Schema ' + this.options.id + '】</div>');
            h.push('<div class="table-tool">');
            h.push('<button class="btn btn-mini btn-danger data-save hide"><i class="fa fa-save"></i> 保存</button>');
            h.push('<button class="btn btn-mini btn-success data-add"><i class="fa fa-plus"></i> 新增 Data Level</button>');
            h.push('</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12" id="schemaContent">');
            h.push('</div>');
            this.element.append(h.join(''));
        },
        _renderSchemaItemElem: function(schema) {
            var h = [],
                self = this,
                options = this.options;
            h.push('<div class="schema-table" data-level="' + level + '"><div class="table-header">Schema Data Level ' + level);
            if (level) {
                h.push('<div class="table-tool">');
                h.push('<a class="btn btn-mini btn-success schema-addprop"><i class="fa fa-plus"></i> 属性</a>');
                h.push('<div class="btn-group">');
                h.push('<a data-toggle="dropdown" class="btn btn-mini btn-danger dropdown-toggle" aria-expanded="false" style="padding: 2px 5px;"><i class="fa fa-trash-o"></i> 删除</a>');
                h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
                h.push('<li><a class="schema-delschema">是，确认删除。</a></li>');
                h.push('</ul>');
                h.push('</div>');
                h.push('</div>');
            }
            h.push('</div>');
            h.push('<table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr>');
            h.push('<th>名称</th><th>Key</th><th>Type</th><th>附加规则</th><th>是否显示</th><th>是否下发</th><th>操作</th>');
            h.push('</tr></thead>');
            h.push('<tbody>');
            _.each(schema.prop, function(item, index) {
                h.push('<tr data-key="' + item.key + '" data-desc="' + item.desc + '" data-type="' + item.type + '" data-regx="' + item.regx + '" data-display="' + (item.display || '0') + '" data-publish="' + (item.publish || '0') + '">');
                h.push('<td data-key="desc"><textarea>' + item.desc + '</textarea></td><td data-key="key"><textarea>' + item.key + '</textarea></td><td data-key="type">');
                h.push(_util.createSelectElem({
                    selectClass: 'select-schematype',
                    data: options.typeSelectData,
                    selected: item.type
                }));
                h.push('</td><td data-key="regx"><textarea>' + item.regx + '</textarea></td><td data-key="display">');
                if (item.display == '1') {
                    h.push('<input checked="checked" type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                } else {
                    h.push('<input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                }
                h.push('</td><td data-key="publish">');
                if (item.publish == '1') {
                    h.push('<input checked="checked" type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                } else {
                    h.push('<input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                }
                h.push('</td><td>');
                h.push('<div class="btn-group">');
                h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
                h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
                h.push('<li><a class="schema-delprop">是，确认删除。</a></li>');
                h.push('</ul>');
                h.push('</div>');
                h.push('</td></tr>');
            });
            h.push('</tbody>');
            h.push('</table></div>');
            this.element.find('#schemaContent').append(h.join(''));
            if (!_.isEmpty(schema.inner)) {
                level++;
                this._renderSchemaItemElem(schema.inner);
            }
        },
        _renderBlankSchemaItemElem: function(level) {
            var h = [],
                self = this;
            h.push('<div class="schema-table" data-level="' + level + '"><div class="table-header">Schema Data Level ' + level);
            h.push('<div class="table-tool">');
            h.push('<a class="btn btn-mini btn-success schema-addprop"><i class="fa fa-plus"></i> 属性</a>');
            h.push('<div class="btn-group">');
            h.push('<a data-toggle="dropdown" class="btn btn-mini btn-danger dropdown-toggle" aria-expanded="false" style="padding: 2px 5px;"><i class="fa fa-trash-o"></i> 删除</a>');
            h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
            h.push('<li><a class="schema-delschema">是，确认删除。</a></li>');
            h.push('</ul>');
            h.push('</div>');
            h.push('</div>');
            h.push('</div>');
            h.push('<table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr>');
            h.push('<th>名称</th><th>Key</th><th>Type</th><th>附加规则</th><th>是否显示</th><th>是否下发</th><th>操作</th>');
            h.push('</tr></thead>');
            h.push('<tbody></tbody>');
            h.push('</table></div>');
            return h.join('');
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click button.data-add': this._addschema,
                'click button.data-save': this._saveschema,
                'click a.schema-addprop': this._addprop,
                'click a.schema-delprop': this._delprop,
                'click a.schema-delschema': this._delschema,
                'change textarea': this._rowpink,
                'change select': this._rowpink
            });
        },
        _saveschema: function(event) {
            var self = this,
                options = this.options,
                $schemaContent = $('#schemaContent'),
                maxlevel = parseInt($schemaContent.children('div.schema-table:last-child').attr('data-level'), 10);

            $schemaContent.find('div.schema-table').each(function() {
                var prop = [],
                    descs = [],
                    keys = [],
                    level = parseInt($(this).attr('data-level'), 10),
                    data = {};

                $(this).find('tbody>tr').each(function() {
                    var $tr = $(this),
                        desc, key, type, regx, display, publish;
                    if ($tr.hasClass('row-pink')) {
                        desc = $tr.children('td[data-key=desc]').children().eq(0).val();
                        key = $tr.children('td[data-key=key]').children().eq(0).val();
                        type = $tr.children('td[data-key=type]').children().eq(0).val();
                        regx = $tr.children('td[data-key=regx]').children().eq(0).val();
                        display = $tr.children('td[data-key=display]').children().eq(0).is(':checked') ? '1' : '0';
                        publish = $tr.children('td[data-key=publish]').children().eq(0).is(':checked') ? '1' : '0';
                        if (desc && key && type) {
                            if (!_util.validateId(key)) {
                                notify({
                                    text: '请确保Key值以字母打头，由任意顺序的大小写字母、数字、下划线组成。'
                                });
                                return false;
                            } else {
                                prop.push({
                                    desc: desc,
                                    key: key,
                                    type: type,
                                    regx: regx,
                                    display: display,
                                    publish: publish
                                });
                                descs.push(desc);
                                keys.push(key);
                            }
                        } else {
                            notify({
                                text: '请确保每一行名称、Key、类型输入完整，或删除不完整行。'
                            });
                            return false;
                        }
                    } else {
                        desc = $tr.attr('data-desc');
                        key = $tr.attr('data-key');
                        type = $tr.attr('data-type');
                        regx = $tr.attr('data-regx');
                        display = $tr.attr('data-display');
                        publish = $tr.attr('data-publish');
                        prop.push({
                            desc: desc,
                            key: key,
                            type: type,
                            regx: regx,
                            display: display,
                            publish: publish
                        });
                        descs.push(desc);
                        keys.push(key);
                    }
                });
                //check if there are duplicate descs or keys.
                if (_.uniq(descs).length !== descs.length) {
                    notify({
                        text: '请确保每个表格中已输入的名称值唯一。'
                    });
                    return false;
                }
                if (_.uniq(keys).length !== keys.length) {
                    notify({
                        text: '请确保每个表格中已输入的Key值唯一。'
                    });
                    return false;
                }
                //set schemadata
                data.prop = prop;
                if (level < maxlevel) {
                    data.type = 'list';
                    data.inner = {};
                } else {
                    data.type = 'item';
                }
                self._saveSchemaData(level, data);
            });

            $.ajax({
                url: options.saveSchema,
                type: 'POST',
                data: { 
                    app: options.app,
                    id: options.id,
                    data: JSON.stringify(options.schemadata)
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
            }).fail(function(response) {});
            return false;
        },
        _saveSchemaData: function(level, data) {
            var schemadata = this.options.schemadata;
            for (var i = 0; i < level; i++) {
                schemadata = schemadata.inner;
            }
            _.extend(schemadata, data);
        },
        _addschema: function(event) {
            var level = $('#schemaContent').children('div.schema-table:last-child').attr('data-level');
            level = parseInt(level, 10) + 1;
            $('#schemaContent').append(this._renderBlankSchemaItemElem(level));
            $('#schemaContent').children('div.schema-table:last-child').find('a.schema-addprop').trigger('click');
            $('html, body').animate({
                scrollTop: $(document).height()
            }, 'slow');
            return false;
        },
        _addprop: function(event) {
            var h = [];
            h.push('<tr><td><textarea></textarea></td><td><textarea></textarea></td><td>');
            h.push(_util.createSelectElem({
                selectClass: 'select-schematype',
                data: this.options.typeSelectData
            }));
            h.push('</td><td><textarea></textarea></td><td><input checked="checked" type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span></td>');
            h.push('<td><input checked="checked" type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span></td><td><a class="btn btn-link schema-delprop">删除</a></td></tr>');
            $(event.target).closest('div.schema-table').find('tbody').append(h.join(''));
            return false;
        },
        _delprop: function(event) {
            var $tr = $(event.target).closest('tr');
            if ($tr.attr('data-key')) {
                this._showSaveBtn();
            }
            $tr.remove();
            return false;
        },
        _delschema: function(event) {
            var $schemaElem = $(event.target).closest('div.schema-table'),
                level = parseInt($schemaElem.attr('data-level'));
            $('div.schema-table').filter(function(index) {
                return index > level - 1
            }).remove();
            this._showSaveBtn();
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
    module.exports = $.cs.schemaedit;
});
