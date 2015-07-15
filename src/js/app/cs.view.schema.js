define(function(require, exports, module) {
    'use strict';
    require('cs.view.schemaedit');
    var notify = require('cs.plugin.notify'),
        autosize = require('../lib/autosize.min');

    $.widget('cs.schema', {
        options: {
            // schemagetlist: '../../datacms/schemagetlist.json',
            schemagetlist: '/ucms/cms/schemagetlist',
            schemaadd: '/ucms/cms/schemaadd',
            schemadel: '/ucms/cms/schemadel'
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
                url: options.schemagetlist,
                data: {
                    m_code: options.m_code
                }
            }).done(function(response) {
                if (!response.errno) {
                    var data = response.data,
                        use_acl = data.use_acl;
                    if (use_acl && (!_.isEmpty(use_acl))) {
                        options.role = use_acl.role;
                        if (use_acl.module_acl && (use_acl.module_acl != 'null') && (use_acl.module_acl != '{}')) {
                            options.role_current = $.parseJSON(use_acl.module_acl)[options.m_code];
                        }
                        self._createWrapperElem(data.list);
                    }
                } else {
                    notify({
                        text: response.error
                    });
                }
            }).fail(function() {});
        },
        reRender: function(opt) {
            var self = this,
                options = this.options;
            _.extend(options, opt);
            $.ajax({
                url: options.schemagetlist,
                data: {
                    m_code: options.m_code
                }
            }).done(function(response) {
                if (!response.errno) {
                    var data = response.data;
                    self._createTableElem(data.list);
                } else {
                    notify({
                        text: response.error
                    });
                }
            }).fail(function() {});
        },
        _createWrapperElem: function(data) {
            var self = this,
                options = this.options,
                h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip">Schema Pool</div>');
            h.push('<div class="table-tool">');
            if (((options.role == '1') && (options.role_current == '3')) || (options.role == '5') || (options.role == '9')) {
                h.push('<button class="btn btn-mini btn-success data-add" data-toggle="modal" data-target="#schame-modal-data"><i class="fa fa-plus"></i> 新增</button>');
            }
            h.push('</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12"><table class="table table-bordered"><thead class="thin-border-bottom"><tr>');
            h.push('<th>id</th><th>schema_name</th><th>schema_code</th>');
            if ((options.role == '1') || (options.role == '5') || (options.role == '9')) {
                h.push('<th>操作</th>');
            }
            h.push('</tr></thead><tbody id="schema-content">');
            h.push('</tbody></table>');
            h.push('<div class="cs-nomoredata">没有更多数据</div>');
            h.push('</div>');
            //-- data item modal begins
            h.push('<div class="modal fade" id="schame-modal-data" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content">');
            h.push('<div class="modal-header">');
            h.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
            h.push('<h4 class="modal-title" id="schema-modal-data-title"></h4>');
            h.push('</div>');
            h.push('<div class="modal-body">');
            h.push('<div id="schema-modal-data-loading" class="cs-loading hide"><div class="cs-loadingico"></div><span>正在加载 ...</span></div>');
            h.push('<div id="schema-modal-data-content"></div>');
            h.push('</div>');
            h.push('<div class="modal-footer">');
            h.push('<button type="button" class="btn btn-mini btn-default data-cancel" data-dismiss="modal">取消</button>');
            h.push('<button type="button" class="btn btn-mini btn-primary data-save">保存</button>');
            h.push('</div>');
            h.push('</div></div></div>');
            //-- data item modal ends
            this.element.append(h.join(''));
            this._createTableElem(data);
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click button.data-add': this._dataAddElem,
                'click button.data-save': this._dataSave,
                'click a.data-edit': this._dataEdit,
                'click a.data-view': this._dataEdit,
                'click a.data-del': this._dataDel
            });
        },
        _createTableElem: function(data) {
            var self = this,
                options = this.options,
                h = [];
            _.each(data, function(item, index) {
                h.push(self._createSchemaItemElem(item));
            });
            this.element.find('#schema-content').addClass('hide').empty().append(h.join('')).removeClass('hide');
        },
        _createSchemaItemElem: function(item) {
            var h = [],
                options = this.options;
            h.push('<tr data-schema_code="' + item.schema_code + '"><td>' + item.id + '</td><td>' + item.schema_name + '</td><td>' + item.schema_code + '</td>');
            if (((options.role == '1') && (options.role_current == '3')) || (options.role == '5') || (options.role == '9')) {
                h.push('<td>');
                h.push('<a class="btn btn-link data-edit">编辑</a>');
                h.push('<div class="btn-group">');
                h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
                h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
                h.push('<li><a class="data-del">是，确认删除。</a></li>');
                h.push('</ul>');
                h.push('</div>');
                h.push('</td>');
            } else if ((options.role == '1') && (options.role_current == '2')) {
                h.push('<td>');
                h.push('<a class="btn btn-link data-view">查看</a>');
                h.push('</td>');
            }
            h.push('</tr>');
            return h.join('');
        },
        _dataAddElem: function() {
            var h = [],
                $title = this.element.find('#schema-modal-data-title'),
                $content = this.element.find('#schema-modal-data-content');
            $title.html('新增');
            h.push('<table class="table table-bordered">');
            h.push('<tr><td>id</td><td></td></tr>');
            h.push('<tr><td>schema_name</td><td><textarea data-key="schema_name"></textarea></td></tr>');
            h.push('<tr><td>schema_code</td><td><textarea data-key="schema_code"></textarea></td></tr>');
            h.push('</table>');
            h.push('<div class="cs-error"></div>');
            $content.addClass('hide').empty().append(h.join('')).removeClass('hide');
            $('textarea').each(function() {
                autosize($(this));
            });
        },
        _dataSave: function(event) {
            var self = this,
                options = this.options,
                $content = this.element.find('#schema-modal-data-content'),
                $error = $content.find('div.cs-error'),
                schema_name = $content.find('textarea[data-key=schema_name]').val().trim(),
                schema_code = $content.find('textarea[data-key=schema_code]').val().trim();
            if ((!!schema_name) && !!(schema_code)) {
                $.ajax({
                    url: options.schemaadd,
                    data: {
                        m_code: options.m_code,
                        schema_name: schema_name,
                        schema_code: schema_code,
                        schema_content: null
                    }
                }).done(function(response) {
                    if (!response.errno) {
                        self.element.find('#schema-content').append(self._createSchemaItemElem(response.data));
                        self.element.find('#schame-modal-data').find('button.data-cancel').trigger('click');
                    } else {
                        $error.html(response.error);
                    }
                }).fail(function(response) {
                    $error.html('保存失败，请稍后再试。');
                });
            } else {
                $error.html('请确认输入schema_name和schema_code。');
                return false;
            }
            return false;
        },
        _dataEdit: function(event) {
            var options = this.options,
                schema_code = $(event.target).closest('tr').attr('data-schema_code'),
                router = new Backbone.Router;
            router.navigate(options.m_code + '/schema/' + schema_code, {
                trigger: true
            });
            return false;
        },
        _dataDel: function(event) {
            var options = this.options,
                $tr = $(event.target).closest('tr'),
                schema_code = $tr.attr('data-schema_code');
            if (!!schema_code) {
                $.ajax({
                    url: options.schemadel,
                    data: {
                        m_code: options.m_code,
                        schema_code: schema_code
                    }
                }).done(function(response) {
                    if (!response.errno) {
                        $tr.remove();
                        notify({
                            text: '删除成功。'
                        });
                    } else {
                        notify({
                            text: response.error
                        });
                    }
                }).fail(function(response) {
                    notify({
                        text: '删除失败，请稍后再试。'
                    });
                });
            } else {
                //delete new item which is not saved
                $tr.remove();
            }
            return false;
        }
    });
    module.exports = $.cs.schema;
});
