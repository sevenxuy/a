define(function(require, exports, module) {
    'use strict';
    var _util = require('cs.util'),
        notify = require('cs.plugin.notify'),
        autosize = require('../lib/autosize.min'),
        _view = require('cs.view');

    $.widget('cs.schemaedit', _view, {
        options: {
            // schemaget: '../../datacms/schemaget.json',
            schemaget: '/ucms/cms/schemaget',
            schemaadd: '/ucms/cms/schemaadd',
            schemaupdate: '/ucms/cms/schemaupdate',
            typeSelectData: ['text', 'link', 'boolean', 'image', 'select', 'time'],
            keysExcept: ['depth', 'list', 'root_id', 'update_time'],
            allContentKeys: [],
            schema_extend: {},
            sum_limit: 60
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
                url: options.schemaget,
                data: {
                    m_code: options.m_code,
                    schema_code: options.schema_code
                }
            }).done(function(response) {
                if (!response.errno) {
                    var data = response.data,
                        use_acl = data.use_acl;
                    if (use_acl && (!_.isEmpty(use_acl))) {
                        options.role = use_acl.role;
                        if (use_acl.module_acl && use_acl.module_acl.length && (use_acl.module_acl != 'null') && (use_acl.module_acl != '{}')) {
                            options.role_current = $.parseJSON(use_acl.module_acl)[options.m_code];
                        }
                        if (((options.role == '1') && (options.role_current == '3')) || (options.role == '5') || (options.role == '9')) {
                            // clear allContentKeys so as to avoid all keys history
                            options.allContentKeys = [];
                            self._createSchemaEditElem(data);
                            $('textarea').each(function() {
                                autosize($(this));
                            });
                        } else {
                            self._createSchemaViewElem(data);
                        }
                    }
                } else {
                    notify({
                        text: response.error
                    });
                }
            }).fail(function() {});
        },
        reRender: function(opt) {
            var options = this.options;
            _.extend(options, opt);
            this.render();
        },
        _createSchemaViewElem: function(data) {
            var self = this,
                options = this.options,
                id = options.id = data.id,
                m_code = options.m_code = data.m_code,
                schema_code = options.schema_code = data.schema_code,
                schema_name = options.schema_name = data.schema_name,
                h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip">Schema ' + options.schema_code + '</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12">');
            h.push('<div></div>');
            //-- Schema Info begins
            h.push('<div class="schema-table"><div class="table-header">Schema Info</div>');
            h.push('<table class="table table-bordered table-hover"><thead><tr>');
            h.push('<th>id</th><th>m_code</th><th>schema_code</th><th>schema_name</th>');
            h.push('</tr></thead><tbody id="schemaedit-info">');
            h.push('<tr><td>' + id + '</td><td>' + m_code + '</td><td>' + schema_code + '</td><td>' + schema_name + '</td></tr>');
            h.push('</tbody></table></div>');
            //-- Schema Info ends
            //-- Schema Content begins
            h.push('<div class="schema-table">');
            h.push('<div class="table-header">Schema Content</div>');
            h.push('<table class="table table-bordered table-hover"><thead><tr>');
            h.push('<th>key</th><th>desc</th><th>type</th><th>regx</th><th>default</th><th>editable</th><th>is_index</th>');
            h.push('</tr></thead><tbody id="schemaedit-content">');
            if (data.schema_content) {
                options.schema_content_origin = data.schema_content;
                var schema_content = options.schema_content = $.parseJSON(data.schema_content);
                if (!_.isEmpty(schema_content)) {
                    _.each(schema_content, function(item, index) {
                        h.push('<tr>');
                        h.push('<td>' + item.key + '</td>');
                        h.push('<td>' + (item.desc || '') + '</td>');
                        h.push('<td>' + (item.type || '') + '</td>');
                        h.push('<td>' + (item.regx || '') + '</td>');
                        h.push('<td>' + (item.default || '') + '</td>');
                        h.push('<td>' + (item.editable || 'YES') + '</td>');
                        h.push('<td>' + (item.is_index || '') + '</td>');
                        h.push('</tr>');
                    });
                }
            }
            h.push('</tbody></table></div>');
            //-- Schema Content ends
            h.push('<div class="schema-table">');
            h.push('<div class="table-header">Schema Plugins');
            h.push('</div>');
            h.push('<table class="table table-bordered table-hover">');
            h.push('<thead><tr><th>key</th><th>name</th><th>value</th></tr></thead>');
            h.push('<tbody id="schema-plugin">');
            if (data.schema_extend) {
                options.schema_extend_origin = data.schema_extend;
                options.schema_extend = $.parseJSON(data.schema_extend);
                if (!_.isEmpty(options.schema_extend.plugin)) {
                    h.push(this._createSchemaPluginElem(options.schema_extend.plugin));
                } else {
                    h.push(this._createBlankSchemaPluginElem());
                }
            } else {
                h.push(this._createBlankSchemaPluginElem());
            }
            h.push('</tbody></table>');
            h.push('</div>');
            h.push('</div>');
            this.element.addClass('hide').empty().append(h.join('')).removeClass('hide');
        },
        _createSchemaEditElem: function(data) {
            var self = this,
                options = this.options,
                id = options.id = data.id,
                m_code = options.m_code = data.m_code,
                schema_code = options.schema_code = data.schema_code,
                schema_name = options.schema_name = data.schema_name,
                typeSelectData = options.typeSelectData,
                h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip">Schema ' + options.schema_code + '</div>');
            h.push('<div class="table-tool">');
            h.push('<button class="btn btn-mini btn-danger data-save"><i class="fa fa-save"></i> 保存</button>');
            h.push('</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12">');
            h.push('<div></div>');
            //-- Schema Info begins
            h.push('<div class="schema-table"><div class="table-header">Schema Info</div>');
            h.push('<table class="table table-bordered table-hover"><thead><tr>');
            h.push('<th>id</th><th>m_code</th><th>schema_code</th><th>schema_name</th>');
            h.push('</tr></thead><tbody id="schemaedit-info">');
            h.push('<tr><td>' + id + '</td><td>' + m_code + '</td><td>' + schema_code + '</td><td><textarea id="schemaedit-name">' + schema_name + '</textarea></td></tr>');
            h.push('</tbody></table></div>');
            //-- Schema Info ends
            //-- Schema Content begins
            h.push('<div class="schema-table"><div class="table-header">Schema Content');
            h.push('<div class="table-tool">');
            h.push('<a class="btn btn-mini btn-success schema-addprop"  data-toggle="modal" data-target="#schema-modal-content-item"><i class="fa fa-plus"></i> 属性</a>');
            h.push('</div>');
            h.push('</div>');
            h.push('<div class="table_err hide" id="schemaedit-content-err"></div>');
            h.push('<table class="table table-bordered table-hover"><thead><tr>');
            h.push('<th>key</th><th>desc</th><th>type</th><th>regx</th><th>default</th><th>editable</th><th>is_index</th><th>操作</th>');
            h.push('</tr></thead><tbody id="schemaedit-content">');
            if (data.schema_content) {
                options.schema_content_origin = data.schema_content;
                var schema_content = options.schema_content = $.parseJSON(data.schema_content);

                if (!_.isEmpty(schema_content)) {
                    _.each(schema_content, function(item, index) {
                        h.push(self._createSchemaContentItemElem(item));
                    });
                }
            }
            h.push('</tbody></table></div>');
            //-- Schema Content ends

            h.push('<div class="schema-table">');
            h.push('<div class="table-header">Schema Plugins');
            h.push('<div class="table-tool"><a class="btn btn-mini btn-success schema-editplugins" data-toggle="modal" data-target="#schema-modal-plugin"><i class="fa fa-pencil-square-o"></i> 编辑</a></div>');
            h.push('</div>');
            h.push('<table class="table table-bordered table-hover">');
            h.push('<thead><tr><th>key</th><th>name</th><th>value</th></tr></thead>');
            h.push('<tbody id="schema-plugin">');
            if (data.schema_extend) {
                options.schema_extend_origin = data.schema_extend;
                options.schema_extend = $.parseJSON(data.schema_extend);
                if (!_.isEmpty(options.schema_extend.plugin)) {
                    h.push(this._createSchemaPluginElem(options.schema_extend.plugin));
                } else {
                    h.push(this._createBlankSchemaPluginElem());
                }
            } else {
                h.push(this._createBlankSchemaPluginElem());
            }
            h.push('</tbody></table>');
            h.push('</div>');
            h.push(this._createContentModalElem());
            h.push(this._createPluginModalElem());
            this.element.addClass('hide').empty().append(h.join('')).removeClass('hide');
        },
        _createContentModalElem: function() {
            var h = [];
            //-- schema content item modal begins
            h.push('<div class="modal fade" id="schema-modal-content-item" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content">');
            h.push('<div class="modal-header">');
            h.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
            h.push('<h4 class="modal-title" id="schema-modal-content-item-title"></h4>');
            h.push('</div>');
            h.push('<div class="modal-body">');
            h.push('<div id="schema-modal-content-item-loading" class="cs-loading hide"><div class="cs-loadingico"></div><span>正在加载 ...</span></div>');
            h.push('<div id="schema-modal-content-item-content"></div>');
            h.push('</div>');
            h.push('<div class="modal-footer">');
            h.push('<button type="button" class="btn btn-mini btn-default schema-modal-content-item-cancel" data-dismiss="modal">取消</button>');
            h.push('<button type="button" class="btn btn-mini btn-primary schema-modal-content-item-save">保存</button>');
            h.push('</div>');
            h.push('</div></div></div>');
            return h.join('');
            //-- schema content item modal ends
        },
        _createPluginModalElem: function() {
            var h = [],
                options = this.options; //-- schema plugins modal begins
            h.push('<div class="modal fade" id="schema-modal-plugin" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content">');
            h.push('<div class="modal-header">');
            h.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
            h.push('<h4 class="modal-title" id="schema-modal-plugin-title">编辑 Schema Plugins</h4>');
            h.push('</div>');
            h.push('<div class="modal-body">');
            h.push('<div id="schema-modal-plugin-loading" class="cs-loading hide"><div class="cs-loadingico"></div><span>正在加载 ...</span></div>');
            h.push('<div id="schema-modal-plugin-content">');
            h.push('<table class="table table-bordered table-hover">');
            h.push('<thead><tr><th>key</th><th>name</th><th>value</th></tr></thead>');
            h.push('<tbody>');
            h.push('<tr><td colspan="3" class="table-header-item">For List</td></tr>');
            if (options.schema_extend && options.schema_extend.plugin && (!_.isEmpty(options.schema_extend.plugin))) {
                var schema_extend = options.schema_extend,
                    list = schema_extend.plugin.list,
                    item = schema_extend.plugin.item;
                h.push('<tr><td>is_sorted</td><td>是否排序</td><td>');
                h.push('<input id="plugin-list-is_sorted" type="checkbox" ' + (_.findWhere(list, {
                    key: 'is_sorted'
                })['value'] == 1 ? 'checked="checked"' : '') + ' class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                h.push('</td></tr>');
                h.push('<tr><td>select_import</td><td>选择添加</td><td><div class="table_err hide"></div><textarea id="plugin-list-select_import">' + _.findWhere(list, {
                    key: 'select_import'
                })['value'] + '</textarea></td></tr>');
                //TODO h.push('<tr><td>valid_check</td><td>有效性检查</td><td><textarea></textarea></td></tr>');
                h.push('<tr><td>sum_limit</td><td>条目限数</td><td>');
                h.push('<div class="table_tip">提示：<br>1.若is_sorted值为NO，sum_limit值必须为不大于60的正整数。<br/>2.若is_sorted值为YES，此处必须留空。</div><div class="table_err hide"></div>');
                h.push('<input id="plugin-list-sum_limit" type="text" value="' +
                    (_.findWhere(list, {
                        key: 'is_sorted'
                    })['value'] == 1 ? (_.findWhere(list, {
                        key: 'sum_limit'
                    })['value'] || '60') : '') + (_.findWhere(list, {
                        key: 'is_sorted'
                    })['value'] == 1 ? '' : ' readonly="readonly"') + '"/></td></tr>');
                h.push('<tr><td colspan="3" class="table-header-item">For Item</td></tr>');
                h.push('<tr><td>preview</td><td>预览</td><td><div class="table_err hide"></div><textarea id="plugin-item-preview">' + _.findWhere(item, {
                    key: 'preview'
                })['value'] + '</textarea></td></tr>');
            } else {
                h.push('<tr><td>is_sorted</td><td>是否排序</td><td>');
                h.push('<input id="plugin-list-is_sorted" type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                h.push('</td></tr>');
                h.push('<tr><td>select_import</td><td>选择添加</td><td><div class="table_err hide"></div><textarea id="plugin-list-select_import"></textarea></td></tr>');
                //TODO h.push('<tr><td>valid_check</td><td>有效性检查</td><td><textarea></textarea></td></tr>');
                h.push('<tr><td>sum_limit</td><td>条目限数</td><td>');
                h.push('<div class="table_tip">提示：<br>1.若is_sorted值为NO，sum_limit值必须为不大于60的正整数。<br/>2.若is_sorted值为YES，此处必须留空。</div><div class="table_err hide"></div>');
                h.push('<input id="plugin-list-sum_limit" type="text" value="" readonly="readonly"/></td></tr>');
                h.push('<tr><td colspan="3" class="table-header-item">For Item</td></tr>');
                h.push('<tr><td>preview</td><td>预览</td><td><div class="table_err hide"></div><textarea id="plugin-item-preview"></textarea></td></tr>');
            }
            h.push('</tbody></table>');
            h.push('</div>');
            h.push('<div class="modal-footer">');
            h.push('<button type="button" class="btn btn-mini btn-default schema-modal-plugin-cancel" data-dismiss="modal">取消</button>');
            h.push('<button type="button" class="btn btn-mini btn-primary schema-modal-plugin-save">保存</button>');
            h.push('</div>');
            h.push('</div></div></div>');
            //-- schema plugins modal ends
            return h.join('');
        },
        _createSchemaPluginElem: function(plugin) {
            var options = this.options,
                list = plugin.list,
                item = plugin.item,
                h = [];
            h.push('<tr><td colspan="3" class="table-header-item">For List</td></tr>');
            h.push('<tr><td>is_sorted</td><td>是否排序</td><td>' + (_.findWhere(list, {
                key: 'is_sorted'
            }).value == 1 ? 'YES' : 'NO') + '</td></tr>');
            h.push('<tr><td>select_import</td><td>选择添加</td><td>' + _.findWhere(list, {
                key: 'select_import'
            }).value + '</td></tr>');
            //TODO h.push('<tr><td>valid_check</td><td>有效性检查</td><td><textarea></textarea></td></tr>');
            h.push('<tr><td>sum_limit</td><td>条目限数</td><td>' + (_.findWhere(list, {
                key: 'is_sorted'
            }).value == 1 ? (_.findWhere(list, {
                key: 'sum_limit'
            }).value) : '' || '') + '</td></tr>');
            h.push('<tr><td colspan="3" class="table-header-item">For Item</td></tr>');
            h.push('<tr><td>preview</td><td>预览</td><td>' + _.findWhere(item, {
                key: 'preview'
            }).value + '</td></tr>');
            return h.join('');
        },
        _createBlankSchemaPluginElem: function() {
            var h = [];
            h.push('<tr><td colspan="3" class="table-header-item">For List</td></tr>');
            h.push('<tr><td>is_sorted</td><td>是否排序</td><td>NO</td></tr>');
            h.push('<tr><td>select_import</td><td>选择添加</td><td></td></tr>');
            //TODO h.push('<tr><td>valid_check</td><td>有效性检查</td><td><textarea></textarea></td></tr>');
            h.push('<tr><td>sum_limit</td><td>条目限数</td><td></td></tr>');
            h.push('<tr><td colspan="3" class="table-header-item">For Item</td></tr>');
            h.push('<tr><td>preview</td><td>预览</td><td></td></tr>');
            return h.join('');
        },
        _createSchemaContentItemElem: function(item) {
            var self = this,
                options = this.options,
                typeSelectData = options.typeSelectData,
                allContentKeys = options.allContentKeys,
                h = [];
            allContentKeys.push(item.key);
            h.push('<tr data-key="' + item.key + '" data-data="' + _.escape(JSON.stringify(item)) + '">');
            h.push(this._createSchemaContentItemInnerElem(item));
            h.push('</tr>');
            return h.join('');
        },
        _createSchemaContentItemInnerElem: function(item) {
            var h = [];
            h.push('<td>' + item.key + '</td>');
            h.push('<td>' + item.desc + '</td>');
            h.push('<td>' + item.type + '</td>');
            h.push('<td>' + (item.regx || '') + '</td>');
            h.push('<td>');
            if (!!item.default) {
                switch (item.type) {
                    case 'link':
                        h.push('<a href="' + item.default+'">' + item.default+'</a>');
                        break;
                    case 'boolean':
                        h.push(item.default == '0' ? 'NO' : 'YES');
                        break;
                    case 'image':
                        h.push('<img class="snapshot" src="' + item.default+'">');
                        break;
                    case 'text':
                    case 'time':
                    case 'select':
                    default:
                        h.push(item.default || '');
                }
            }
            h.push('</td>');
            h.push('<td>');
            if (item.editable == 0) {
                h.push('NO');
            } else {
                h.push('YES');
            }
            h.push('</td>');
            h.push('<td>' + item.is_index + '</td>');
            h.push('<td>');
            h.push('<a class="btn btn-link schema-editprop" data-toggle="modal" data-target="#schema-modal-content-item">编辑</a>')
            h.push('<div class="btn-group">');
            h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
            h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
            h.push('<li><a class="data-del">是，确认删除。</a></li>');
            h.push('</ul>');
            h.push('</div></td>');
            return h.join('');
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click button.data-save': this._dataSave,
                'click a.schema-addprop': this._addPropElem,
                'click a.schema-editprop': this._editPropElem,
                'click a.data-del': this._dataDel,
                'click button.schema-modal-content-item-save': this._saveSchemaItem,
                'click button.schema-modal-plugin-save': this._savePlugin,
                'change select.schema-type': this._changeSelect,
                'change textarea.schema-modal-content-item-regx': this._updateDefaultElem,
                'click button.upload-img-btn': this._uploadFile,
                'change input[type=file]': this._uploadImage,
                'change textarea.upload-img-tx': this._previewImg,
                'change #plugin-list-is_sorted': this._changeSumLimit
            });
        },
        _dataSave: function() {
            var options = this.options,
                schema_name = this.element.find('#schemaedit-name').val().trim(),
                $schemaedit_content = this.element.find('#schemaedit-content'),
                schema_content = [],
                schema_extend = JSON.stringify(options.schema_extend);

            $schemaedit_content.children('tr').each(function() {
                schema_content.push($(this).attr('data-data'));
            });

            if (_.isEmpty(schema_content)) {
                this.element.find('#schemaedit-content-err').html('Schema Content内容不可为空。').removeClass('hide');
                return false;
            } else {
                schema_content = '[' + schema_content.join(',') + ']';
            }

            $.ajax({
                url: options.schemaupdate,
                data: {
                    id: options.id,
                    m_code: options.m_code,
                    schema_code: options.schema_code,
                    schema_name: schema_name,
                    schema_content: schema_content,
                    schema_extend: schema_extend
                }
            }).done(function(res) {
                if ((!res.errno) && res.data) {
                    notify({
                        text: '保存成功。'
                    });
                } else {
                    notify({
                        tmpl: 'error',
                        text: res.error
                    });
                }
            }).fail(function(res) {
                notify({
                    tmpl: 'error',
                    text: '保存失败，请稍后再试。'
                });
            });
            return false;
        },
        _addPropElem: function(event) {
            var options = this.options,
                h = [],
                $title = this.element.find('#schema-modal-content-item-title'),
                $content = this.element.find('#schema-modal-content-item-content');
            $title.html('新增属性');
            h.push('<table class="table table-bordered table-hover">');
            h.push('<tr><td>key</td><td class="editable" data-key="key">');
            h.push('<div class="table_tip">提示：key值必须以字母开头，且key值必须为字母、数字或者下划线组合，且不能取值：depth、list、root_id、update_time。</div>');
            h.push('<div class="table_err hide"></div><textarea></textarea></td></tr>');
            h.push('<tr><td>desc</td><td class="editable" data-key="desc"><div class="table_err hide"></div><textarea></textarea></td></tr>');
            h.push('<tr><td>type</td><td class="editable" data-key="type">' + this._createSelectElem(options.typeSelectData) + '</td></tr>');
            h.push('<tr><td>regx</td><td class="editable" data-key="regx"><div class="table_err hide"></div><textarea class="schema-modal-content-item-regx"></textarea></td></tr>');
            h.push('<tr><td>editable</td><td class="editable" data-key="editable"><input type="checkbox" checked="checked" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span></td></tr>');
            h.push('<tr><td>default</td><td class="editable" data-key="default"><div class="table_err hide"></div><textarea></textarea></td></tr>');
            h.push('<tr><td>is_index</td><td class="editable" data-key="is_index" data-value=""></td></tr>');
            h.push('</table>');
            $content.addClass('hide').empty().append(h.join('')).removeClass('hide');
            $content.data('key', '');
            $('textarea').each(function() {
                autosize($(this));
            });
        },
        _editPropElem: function(event) {
            var options = this.options,
                h = [],
                item = $.parseJSON(_.unescape($(event.target).closest('tr').attr('data-data'))),
                $title = this.element.find('#schema-modal-content-item-title'),
                $content = this.element.find('#schema-modal-content-item-content');
            $title.html('修改属性');
            h.push('<table class="table table-bordered table-hover">');
            h.push('<tr><td>key</td><td class="editable" data-key="key" data-value="' + item.key + '">' + item.key + '</td></tr>');
            h.push('<tr><td>desc</td><td class="editable" data-key="desc"><div class="table_err hide"></div><textarea>' + item.desc + '</textarea></td></tr>');
            h.push('<tr><td>type</td><td class="editable" data-key="type">' + this._createSelectElem(options.typeSelectData, item.type) + '</td></tr>');
            h.push('<tr><td>regx</td><td class="editable" data-key="regx"><div class="table_err hide"></div><textarea class="schema-modal-content-item-regx">' + item.regx + '</textarea></td></tr>');
            h.push('<tr><td>editable</td><td class="editable" data-key="editable"><input type="checkbox" ' + (item.editable == 0 ? '' : 'checked="checked"') + ' class="ace ace-switch ace-switch-2"><span class="lbl middle"></span></td></tr>');
            h.push('<tr><td>default</td><td class="editable" data-key="default">');

            switch (item.type) {
                case 'text':
                case 'link':
                    h.push('<div class="table_err hide"></div><textarea>' + (item.default || '') + '</textarea>');
                    break;
                case 'boolean':
                    h.push('<div class="table_err hide"></div><input type="checkbox" ' + (item.default == 0 ? '' : 'checked="checked"') + ' class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                    break;
                case 'image':
                    h.push('<div class="table_err hide"></div>');
                    h.push('<div class="upload-img-box">');
                    h.push('<div class="upload-img">');
                    h.push('<button class="upload-img-btn">上传图片</button>');
                    h.push('<textarea type="text" placeholder="图片链接" class="form-control upload-img-tx" style="resize: vertical;"></textarea>');
                    h.push('<input type="file" accept="image/gif, image/jpeg, image/png" class="hide module-image-upload">');
                    h.push('</div>');
                    if (!!item.default) {
                        h.push('<div class="upload-img-preivew"><img src="' + item.default+'"></div>');
                    } else {
                        h.push('<div class="upload-img-preivew"></div>');
                    }
                    h.push('</div>');
                    break;
                case 'select':
                    var regx = item.regx.split('|');
                    h.push('<select class="form-control">');
                    _.each(regx, function(item, index) {
                        if (!!item && (item.indexOf(':') > -1)) {
                            var item = item.split(':');
                            h.push('<option value="' + item[1] + '">' + item[0] + '</option>');
                        }
                    });
                    h.push('</select>');
                    break;
                case 'time':
                    h.push('<div class="table_err hide"></div><input class="datetimepicker" type="text" value="' + (item.default || '') + '">');
                    break;
            }
            h.push('</td></tr>');
            h.push('<tr><td>is_index</td><td class="editable" data-key="is_index" data-value=""></td></tr>');
            h.push('</table>');
            $content.addClass('hide').empty().append(h.join('')).removeClass('hide');
            $content.data('key', item.key);
            $('textarea').each(function() {
                autosize($(this));
            });
            $('input.datetimepicker').datetimepicker({
                format: 'Y-m-d H:i:s',
                lang: 'ch',
                yearStart: 2015,
                yearEnd: 2020,
                minDate: '-1970/01/01'
            });
            if (item.type == 'select') {
                $content.find('textarea.schema-modal-content-item-regx:eq(0)').trigger('change');
            }
        },
        _saveSchemaItem: function() {
            var self = this,
                options = this.options,
                $content = this.element.find('#schema-modal-content-item-content'),
                $editable = $content.find('td.editable'),
                $schemaedit_content = this.element.find('#schemaedit-content'),
                data = {},
                stop = false;
            $editable.each(function() {
                var tdkey = $(this).attr('data-key');
                switch (tdkey) {
                    case 'key':
                        if (!!$content.data('key')) {
                            data['key'] = $(this).attr('data-value');
                        } else {
                            var key = $(this).children('textarea:eq(0)').val().trim(),
                                $err = $(this).children('div.table_err:eq(0)');
                            if (!!key) {
                                if (_util.validateId(key)) {
                                    if (options.keysExcept.indexOf(key) > -1) {
                                        $err.html('key值不能取值：depth、list、root_id、update_time。').removeClass('hide');
                                        stop = true;
                                    } else {
                                        if (options.allContentKeys.indexOf(key) > -1) {
                                            stop = true;
                                            $err.html('key值必须唯一，该key值已存在。').removeClass('hide');
                                        } else {
                                            data['key'] = key;
                                        }
                                    }
                                } else {
                                    stop = true;
                                    $err.html('key值必须以字母开头，且key值必须为字母、数字或者下划线组合，长度最少2个字符。').removeClass('hide');
                                }
                            } else {
                                stop = true;
                                $err.html('请输入key值。').removeClass('hide');
                            }
                        }
                        break;
                    case 'desc':
                        var desc = $(this).children('textarea:eq(0)').val().trim(),
                            $err = $(this).children('div.table_err:eq(0)');
                        if (desc.length) {
                            data['desc'] = desc;
                        } else {
                            stop = true;
                            $err.html('请输入desc值，不可为空。').removeClass('hide');
                        }
                        break;
                    case 'type':
                        var type = $(this).children('select:eq(0)').val();
                        data['type'] = type;
                        break;
                    case 'regx':
                        var regx = $(this).children('textarea:eq(0)').val();
                        data['regx'] = regx;
                        break;
                    case 'editable':
                        var editable = $(this).children('input:eq(0)').is(':checked') ? '1' : '0';
                        data['editable'] = editable;
                        break;
                    case 'default':
                        var default_,
                            type = data['type'];
                        switch (type) {
                            case 'text':
                                default_ = $(this).children('textarea:eq(0)').val().trim();
                                data['default'] = default_;
                                break;
                            case 'link':
                                var $err = $(this).children('div.table_err:eq(0)');
                                default_ = $(this).children('textarea:eq(0)').val().trim();
                                if (!!default_) {
                                    if (_util.validateUrl(default_)) {
                                        data['default'] = default_;
                                    } else {
                                        stop = true;
                                        $err.html('请输入type为link的有效默认值。').removeClass('hide');
                                    }
                                }
                                break;
                            case 'boolean':
                                default_ = $(this).children('input:eq(0)').is(':checked') ? '1' : '0';
                                data['default'] = default_;
                                break;
                            case 'image':
                                default_ = $(this).find('textarea:eq(0)').val().trim();
                                data['default'] = default_;
                                break;
                            case 'select':

                                if (!!data['regx']) {
                                    default_ = $(this).children('select:eq(0)').val();
                                } else {
                                    data['default'] = '';
                                }
                                break;
                            case 'time':
                                default_ = $(this).children('input.datetimepicker:eq(0)').val().trim();
                                break;
                        }
                        data['default'] = default_;
                        break;
                    case 'is_index':
                        data['is_index'] = '';

                }
            });

            if (stop) {
                return false;
            }
            if (!!$content.data('key')) {
                var $tr = $schemaedit_content.find('tr[data-key=' + $content.data('key') + ']:eq(0)');
                $tr.empty().append(this._createSchemaContentItemInnerElem(data));
                $tr.attr({
                    'data-data': JSON.stringify(data)
                });
            } else {
                $schemaedit_content.append(this._createSchemaContentItemElem(data));
            }
            this.element.find('#schema-modal-content-item').find('button.schema-modal-content-item-cancel:eq(0)').trigger('click');
        },
        _savePlugin: function(event) {
            var options = this.options,
                $modal_content = this.element.find('#schema-modal-plugin-content'),
                $is_sorted = $modal_content.find('#plugin-list-is_sorted'),
                is_sorted = $is_sorted.is(':checked') ? '1' : '0',
                $select_import = $modal_content.find('#plugin-list-select_import'),
                select_import = $select_import.val().trim(),
                $sum_limit = $modal_content.find('#plugin-list-sum_limit'),
                sum_limit = $sum_limit.val().trim(),
                $preview = $modal_content.find('#plugin-item-preview'),
                preview = $preview.val().trim();

            var stop = false;

            if (!!select_import) {
                if (!_util.validateUrl(select_import)) {
                    $select_import.closest('td').find('div.table_err').html('请留空或输入正确的链接地址。').removeClass('hide');
                    stop = true;
                }
            }
            if (!!sum_limit) {
                if (!_util.validateNum(sum_limit)) {
                    $sum_limit.closest('td').find('div.table_err').html('请留空或输入小于' + options.sum_limit + '的正整数。').removeClass('hide');
                    stop = true;
                } else {
                    if (parseInt(sum_limit, 10) > options.sum_limit) {
                        $sum_limit.closest('td').find('div.table_err').html('请输入小于' + options.sum_limit + '的正整数。').removeClass('hide');
                        stop = true;
                    }
                }
            }
            if (!!preview) {
                if (!_util.validateUrl(preview)) {
                    $preview.closest('td').find('div.table_err').html('请留空或输入正确的链接地址。').removeClass('hide');
                    stop = true;
                }
            }
            if (stop) {
                return false;
            }

            var plugin = {
                list: [{
                    key: 'is_sorted',
                    name: '是否排序',
                    value: is_sorted
                }, {
                    key: 'select_import',
                    name: '选择添加',
                    value: select_import
                }, {
                    key: 'valid_check',
                    name: '有效性检查',
                    value: ''
                }, {
                    key: 'sum_limit',
                    name: '条目限数',
                    value: sum_limit
                }],
                item: [{
                    key: 'preview',
                    name: '预览',
                    value: preview
                }]
            }
            options.schema_extend.plugin = plugin;

            this.element.find('#schema-plugin').empty().append(this._createSchemaPluginElem(plugin));
            $(event.target).parent().children('button.schema-modal-plugin-cancel').trigger('click');
            return false;
        },
        _changeSelect: function(event) {
            var type = $(event.target).val(),
                $content = this.element.find('#schema-modal-content-item-content'),
                $default_ = $content.find('td[data-key=default]:eq(0)');
            $content.find('td[data-key=regx]:eq(0)').children('textarea:eq(0)').val('');
            switch (type) {
                case 'text':
                case 'link':
                    $default_.empty().append('<div class="table_err hide"></div><textarea></textarea>');
                    $('textarea').each(function() {
                        autosize($(this));
                    });
                    break;
                case 'boolean':
                    $default_.empty().append('<div class="table_err hide"></div><input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                    break;
                case 'image':
                    var h = [];
                    h.push('<div class="table_err hide"></div>');
                    h.push('<div class="upload-img-box">');
                    h.push('<div class="upload-img">');
                    h.push('<button class="upload-img-btn">上传图片</button>');
                    h.push('<textarea type="text" placeholder="图片链接" class="form-control upload-img-tx" style="resize: vertical;"></textarea>');
                    h.push('<input type="file" accept="image/gif, image/jpeg, image/png" class="hide module-image-upload">');
                    h.push('</div>');
                    h.push('<div class="upload-img-preivew"></div>');
                    h.push('</div>');
                    $default_.empty().append(h.join(''));
                    break;
                case 'time':
                    $default_.empty().append('<div class="table_err hide"></div><input class="datetimepicker" type="text" >');
                    $('input.datetimepicker').datetimepicker({
                        format: 'Y-m-d H:i:s',
                        lang: 'ch',
                        yearStart: 2015,
                        yearEnd: 2020,
                        minDate: '-1970/01/01'
                    });
                    break;
                case 'select':
                    $default_.empty();
                    break;
            }
            return false;
        },
        _updateDefaultElem: function(event) {
            var $content = this.element.find('#schema-modal-content-item-content'),
                schema_type = $content.find('select.schema-type:eq(0)').val();
            if (schema_type == 'select') {
                var regx = $(event.target).val().trim(),
                    $default_ = $content.find('td[data-key=default]:eq(0)'),
                    h = [],
                    regx = regx.split('|');
                h.push('<select class="form-control">');
                _.each(regx, function(item, index) {
                    if (!!item && (item.indexOf(':') > -1)) {
                        var item = item.split(':');
                        h.push('<option value="' + item[1] + '">' + item[0] + '</option>');
                    }
                });
                h.push('</select>');
                $default_.empty().append(h.join(''));
            }
        },
        _dataDel: function(event) {
            var $tr = $(event.target).closest('tr');
            $tr.remove();
            return false;
        },
        _createSelectElem: function(typeSelectData, selected) {
            var h = [];
            h.push('<select class="form-control schema-type">');
            if (_.isArray(typeSelectData)) {
                _.each(typeSelectData, function(item, index) {
                    h.push('<option value="' + item + '"');
                    if (!!selected && (selected === item)) {
                        h.push(' selected="selected"')
                    }
                    h.push('>' + item + '</option>');
                });
            }
            h.push('</select>');
            return h.join('');
        },
        _hasDuplicateKeys: function(keys) {
            return _.uniq(keys).length !== keys.length
        },
        _changeSumLimit: function(event) {
            var is_sorted = $(event.target).is(':checked'),
                $sum_limit = this.element.find('#plugin-list-sum_limit');
            if (is_sorted) {
                $sum_limit.removeAttr('readonly');
                $sum_limit.val('60');
            } else {
                $sum_limit.attr({
                    'readonly': 'readonly',
                });
                $sum_limit.val('');
            }
        }
    });
    module.exports = $.cs.schemaedit;
});
