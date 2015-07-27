define(function(require, exports, module) {
    'use strict';
    var _util = require('cs.util'),
        notify = require('cs.plugin.notify'),
        autosize = require('../lib/autosize.min'),
        _view = require('cs.view');

    $.widget('cs.module', _view, {
        options: {
            // schemagetlist: '../../datacms/schemagetlist.json',
            schemagetlist: '/ucms/cms/schemagetlist',
            // dataget: '../../datacms/dataget.json', //for test
            dataget: '/ucms/cms/dataget',
            datadelete: '/ucms/cms/datadelete',
            dataupdate: '/ucms/cms/dataupdate',
            dataadd: '/ucms/cms/dataadd',
            dataapply: '/ucms/cms/dataapply',
            datarefuse: '/ucms/cms/datarefuse',
            datapass: '/ucms/cms/datapass',
            datapublish: '/ucms/cms/datapublish',
            // uploadfile: '../../datacms/uploadfile.json',
            uploadfile: '/ucms/cms/uploadfile',
            ukeyexist: '/ucms/cms/ukeyexist',
            smapupdate: '/ucms/cms/smapupdate',
            schema_content: [],
            schema_extend: {},
            schema_content_map: {},
            schema_extend_map: {},
            limit: 60,
            limit_cols: 5,
            sum_limit: 60,
            is_sorted: false,
            is_added: true,
            is_select_import: false,
            is_preview: false
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
                url: options.dataget,
                data: {
                    m_code: options.m_code,
                    parent_id: options.parent_id,
                    limit: options.limit,
                    offset: (options.pn == 1) ? 0 : parseInt(options.limit, 10) * (parseInt(options.pn, 10) - 1)
                }
            }).done(function(response) {
                if (!response.errno) {
                    var data = response.data;
                    if (!!data) {
                        var use_acl = data.use_acl;
                        if (use_acl && (!_.isEmpty(use_acl))) {
                            options.role = use_acl.role;
                            if (use_acl.module_acl && use_acl.module_acl.length && (use_acl.module_acl != 'null') && (use_acl.module_acl != '{}')) {
                                options.role_current = $.parseJSON(use_acl.module_acl)[options.m_code];
                            }
                            options.schema_content = $.parseJSON(data.schema_content);
                            options.schema_extend = $.parseJSON(data.schema_extend);
                            options.schema_code = data.schema_code;
                            options.m_code = data.m_code;
                            options.parent_id = data.parent_id;
                            options.path = data.path;
                            options.total = data.total;
                            options.totalpages = Math.ceil(options.total / options.limit);
                            options.sortlist = data.data;
                            //reset settings
                            options.is_sorted = false;
                            options.is_added = true;
                            options.is_select_import = false;
                            options.is_preview = false;
                            options.sum_limit = 60;
                            self._createModuleElem(data.data);
                        }
                    } else {
                        self._createModuleDataBlankElem();
                    }
                } else {
                    notify({
                        tmpl: 'error',
                        text: response.error
                    });
                }
            });
        },
        reRender: function(opt) {
            var options = this.options;
            _.extend(options, opt);
            this.render();
        },
        _createModuleElem: function(lists) {
            var self = this,
                options = this.options,
                h = [],
                schema_content = options.schema_content,
                path = options.path;
            if (schema_content && (!_.isNull(schema_content)) && (!_.isEmpty(schema_content))) {
                //-- settings update ends 
                h.push('<div class="breadcrumbs">');
                h.push('<div class="breadcrumbs-content" data-rel="tooltip"><ul class="breadcrumb">');
                if (_.isEmpty(path)) {
                    h.push('<li class="active">Data Depth : 0</li>');
                } else {
                    h.push('<li><a data-parent_id="0" class="data-goto">Data Depth : 0</a></li>');
                    for (var i = 0, j = path.length - 1; i < j; i++) {
                        h.push('<li><a data-parent_id="' + path[i].id + '" class="data-goto">Data Depth : ' + (parseInt(path[i].depth, 10) + 1) + '</a></li>');
                    }
                    h.push('<li class="active">Data Depth : ' + (parseInt(path[path.length - 1].depth, 10) + 1) + '</li>');
                }
                h.push('</ul></div>');
                h.push('</div>');
                h.push('<div class="col-xs-12">');
                //data && schema_content
                h.push('<table class="table table-bordered" id="module-table"><thead class="thin-border-bottom"><tr><th>id</th>');
                _.each(schema_content, function(schema_item, schema_index) {
                    h.push('<th data-key="' + schema_item.key + '">' + schema_item.desc + '</th>');
                    switch (schema_item.type) {
                        case 'select':
                            options['select_' + schema_item.key] = self._getSelectData(schema_item.regx);
                            options['select_' + schema_item.key + '_elem'] = self._createSelectElem(schema_item.regx);
                            break;
                    }
                });
                h.push('<th>schema code</th><th>status</th>');
                if (options.parent_id == 0) {
                    h.push('<th>last updated</th>')
                }
                h.push('<th>操作</th></tr></thead><tbody id="module-content">');
                if (!_.isEmpty(lists)) {
                    _.each(lists, function(item, index) {
                        h.push(self._createItemElem(item));
                    });
                }
                h.push('</tbody></table>');
                if (_.isEmpty(lists) || (options.pn == options.totalpages) || (options.totalpages == 1)) {
                    h.push('<div class="cs-nomoredata">没有更多数据</div>');
                }
                h.push('<div id="module-pagingbar"></div>');
                h.push('</div>');

                if (options.parent_id == 0) {
                    this._createUkeyModalElem();
                }
                this.element.empty().append(h.join(''));
                this._createTableToolElem();

                if (schema_content && (schema_content.length > options.limit_cols)) {
                    this._initCols();
                }
            } else {
                h.push('<div class="breadcrumbs">');
                h.push('<div class="breadcrumbs-content" data-rel="tooltip"><ul class="breadcrumb">');
                if (_.isEmpty(path)) {
                    h.push('<li class="active">Module Data</li>');
                } else {
                    h.push('<li><a data-parent_id="0" class="data-goto">Module Data</a></li>');
                    for (var i = 0, j = path.length - 1; i < j; i++) {
                        h.push('<li><a data-parent_id="' + path[i].id + '" class="data-goto">Data Depth : ' + path[i].depth + '</a></li>');
                    }
                    h.push('<li class="active">Data Depth : ' + path[path.length - 1].depth + '</li>');
                }
                h.push('</ul></div>');
                h.push('</div>');
                h.push('<div class="col-xs-12">');
                //only show schema add on page
                h.push('<div>请选择Schema : <span id="data-schema"></span><a class="btn btn-link schema-save">确定</a></div>');
                self._getSchemaListData();
                h.push('</div>');
                this.element.empty().append(h.join(''));
            }
        },
        _createUkeyModalElem: function() {
            var options = this.options,
                h = [];
            h.push('<button id="notify-ukey" class="hide" data-toggle="modal" data-target="#module-modal-ukey"></button>');
            h.push('<div class="modal fade" id="module-modal-ukey" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content">');
            h.push('<div class="modal-header">');
            h.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
            h.push('<h4 class="modal-title">提示</h4>');
            h.push('</div>');
            h.push('<div class="modal-body">');
            h.push('<div>唯一标识号(ukey):<span id="module-modal-body-ukey"></span>库里已存在，确定保存覆盖？</div>');
            h.push('</div>');
            h.push('<div class="modal-footer">');
            h.push('<button type="button" class="btn btn-mini btn-default data-confirm"> 是 </button>');
            h.push('<button type="button" class="btn btn-mini btn-primary data-cancel" data-dismiss="modal"> 否 </button>');
            h.push('</div>');
            h.push('</div></div></div>');
            return h.join('');
        },
        _initSettings: function() {
            var options = this.options;
            //-- settings update begins
            //only when there is schema_content there is schema_extend;
            //if no schema_extend.plugin, settings will not change but remaind the same as in init options;
            //Sort only for data whose is_sorted value in schema_extend.plugin.list is 1 (true);
            //Sort not for data whose parent_id is 0;
            if (options.parent_id != 0 && options.schema_extend && options.schema_extend.plugin) {
                if (options.schema_extend.plugin.list) {
                    options.is_sorted = (_.findWhere(options.schema_extend.plugin.list, {
                        key: 'is_sorted'
                    })['value'] == 1);
                    options.sum_limit = parseInt(_.findWhere(options.schema_extend.plugin.list, {
                        key: 'sum_limit'
                    })['value'] || '60', 10);
                    options.is_added = (options.sum_limit == 0) ? true : options.sum_limit > options.total;
                    options.is_select_import = (_.findWhere(options.schema_extend.plugin.list, {
                        key: 'select_import'
                    })['value']).length || options.is_select_import;
                    if (options.is_select_import) {
                        options.select_import = _.findWhere(options.schema_extend.plugin.list, {
                            key: 'select_import'
                        })['value'];
                    }
                }
                if (options.schema_extend.plugin.item) {
                    var preview_ = _.findWhere(options.schema_extend.plugin.item, {
                        key: 'preview'
                    })['value'];
                    if (preview_.length) {
                        options.is_preview = true;
                        options.preview = preview_;
                    }
                }
            }
        },
        _createTableToolElem: function() {
            this._initSettings();
            var options = this.options,
                schema_content = options.schema_content,
                h = [];
            h.push('<div class="table-tool">');
            if (options.parent_id == 0) {
                h.push('<button class="btn btn-mini btn-success data-add" data-toggle="modal" data-target="#module-modal-data"><i class="fa fa-plus"></i> 新增</button>');
            } else {
                if (options.is_select_import) {
                    h.push('<button class="btn btn-mini btn-pink data-import" data-toggle="modal" data-target="#module-modal-import">导入</button>');
                }
                if (options.is_sorted) {
                    h.push('<button class="btn btn-mini btn-info data-sort" data-toggle="modal" data-target="#module-modal-sort">排序</button>');
                }
                if (options.is_added) {
                    h.push('<button class="btn btn-mini btn-success data-add" data-toggle="modal" data-target="#module-modal-data"><i class="fa fa-plus"></i> 新增</button>');
                }
                if (schema_content && (schema_content.length > options.limit_cols)) {
                    //-- btn-cols-list begins
                    h.push('<div class="btn-group">');
                    h.push('<button data-toggle="dropdown" class="btn btn-mini btn-yellow dropdown-toggle" aria-expanded="false">显示列 <i class="ace-icon fa fa-angle-down icon-on-right"></i></button>');
                    h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert btn-cols-list">');
                    _.each(schema_content, function(schema_item, schema_index) {
                        if (schema_index > options.limit_cols - 1) {
                            h.push('<li data-key="' + schema_item.key + '"><a><i class="fa"></i> ' + schema_item.desc + '</a></li>');
                        } else {
                            h.push('<li data-key="' + schema_item.key + '"><a><i class="fa fa-check"></i> ' + schema_item.desc + '</a></li>');
                        }
                    });
                    h.push('</ul>');
                    h.push('</div>');
                    //-- btn-cols-list ends
                }
            }
            h.push('</div>');
            this.element.find('div.breadcrumbs').append(h.join(''));

            if (options.parent_id == 0 || !options.is_sorted) {
                var setting = {
                    limit: options.limit,
                    totalpages: options.totalpages,
                    pn: parseInt(options.pn, 10),
                    routerstr: options.m_code + '/module/' + options.parent_id
                };
                var $pagingbar = this.element.find('#module-pagingbar');
                if ($pagingbar.data('widgetCreated')) {
                    $pagingbar.pagingbar('reRender', setting);
                } else {
                    $pagingbar.pagingbar(setting);
                }
            }

            if ((options.parent_id != 0) && options.is_sorted) {
                this._createModalSortElem();
            }
            if (options.is_select_import) {
                this._createModalImportElem();
            }
            if (options.is_added) {
                this._createModalDataElem();
            }
        },
        _getSchemaListData: function() {
            var self = this,
                options = this.options;
            $.ajax({
                url: options.schemagetlist,
                data: {
                    m_code: options.m_code
                }
            }).done(function(data) {
                if (!data.errno) {
                    self.element.find('#data-schema').empty().append(self._createSchemaSelectElem(data.data.list));
                } else {
                    notify({
                        tmpl: 'error',
                        text: response.error
                    });
                }
            }).fail(function(response) {});
        },
        _createModalSortElem: function() {
            var h = [];
            //-- sort modal begins
            h.push('<div class="modal fade" id="module-modal-sort" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog large-modal-dialog"><div class="modal-content">');
            h.push('<div class="modal-header">');
            h.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
            h.push('<h4 class="modal-title" id="module-modal-sort-title">排序</h4>');
            h.push('</div>');
            h.push('<div class="modal-body">');
            h.push('<div id="module-modal-sort-loading" class="cs-loading hide"><div class="cs-loadingico"></div><span>正在加载 ...</span></div>');
            h.push('<div id="module-modal-sort-content">');
            h.push('<ul id="module-modal-sort-head" class="item-list"></ul>');
            h.push('<ul id="module-modal-sort-list" class="item-list ui-sortable">');
            // h.push('<li class="item-blue clearfix ui-sortable-handle"></li>');
            h.push('</ul>');
            h.push('</div>');
            h.push('</div>');
            h.push('<div class="modal-footer">');
            h.push('<button type="button" class="btn btn-mini btn-default sort-cancel" data-dismiss="modal">取消</button>');
            h.push('<button type="button" class="btn btn-mini btn-primary sort-save">保存</button>');
            h.push('</div>');
            h.push('</div></div></div>');
            //-- sort modal ends
            this.element.append(h.join(''));
            //Android's default browser somehow is confused when tapping on label which will lead to dragging the task
            //so disable dragging when clicking on label
            var agent = navigator.userAgent.toLowerCase(),
                $list = this.element.find('#module-modal-sort-list');
            if ("ontouchstart" in document && /applewebkit/.test(agent) && /android/.test(agent))
                $list.on('touchstart', function(e) {
                    var li = $(e.target).closest('#module-modal-sort-list li');
                    if (li.length == 0) return;
                    var label = li.find('label.inline').get(0);
                    if (label == e.target || $.contains(label, e.target)) e.stopImmediatePropagation();
                });
            $list.sortable({
                opacity: 0.8,
                revert: true,
                forceHelperSize: true,
                placeholder: 'draggable-placeholder',
                forcePlaceholderSize: true,
                tolerance: 'pointer',
                stop: function(event, ui) {
                    //just for Chrome!!!! so that dropdowns on items don't appear below other items after being moved
                    $(ui.item).css('z-index', 'auto');
                }
            });
            $list.disableSelection();
        },
        _createModalDataElem: function() {
            var h = [];
            //-- data item modal begins
            h.push('<div class="modal fade" id="module-modal-data" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content">');
            h.push('<div class="modal-header">');
            h.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
            h.push('<h4 class="modal-title" id="module-modal-data-title"></h4>');
            h.push('</div>');
            h.push('<div class="modal-body">');
            h.push('<div id="module-modal-data-loading" class="cs-loading hide"><div class="cs-loadingico"></div><span>正在加载 ...</span></div>');
            h.push('<div id="module-modal-data-content"></div>');
            h.push('</div>');
            h.push('<div class="modal-footer">');
            h.push('<button type="button" class="btn btn-mini btn-default data-cancel" data-dismiss="modal">取消</button>');
            h.push('<button type="button" class="btn btn-mini btn-primary data-save">保存</button>');
            h.push('</div>');
            h.push('</div></div></div>');
            //-- data item modal ends
            this.element.append(h.join(''));
        },
        _createModalImportElem: function() {
            var h = [];
            //-- import modal begins
            h.push('<div class="modal fade" id="module-modal-import" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog large-modal-dialog"><div class="modal-content">');
            h.push('<div class="modal-header">');
            h.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
            h.push('<h4 class="modal-title" id="module-modal-import-title">导入</h4>');
            h.push('</div>');
            h.push('<div class="modal-body">');
            h.push('<div id="module-modal-import-error" class="table_err hide"></div>');
            h.push('<div id="module-modal-import-loading" class="cs-loading"><div class="cs-loadingico"></div><span>正在加载 ...</span></div>');
            h.push('<div id="module-modal-import-content"></div>');
            h.push('</div>');
            h.push('<div class="modal-footer">');
            h.push('<button type="button" class="btn btn-mini btn-default import-cancel" data-dismiss="modal" id="import-cancel">取消</button>');
            h.push('<button type="button" class="btn btn-mini btn-primary import-save" id="import-save">保存</button>');
            h.push('</div>');
            h.push('</div></div></div>');
            //-- import modal ends
            this.element.append(h.join(''));
        },
        _createSchemaSelectElem: function(data) {
            var options = this.options,
                h = [];
            h.push('<select>');
            options.schema_content_map = {};
            options.schema_extend_map = {};
            _.each(data, function(item, index) {
                if (item.schema_content) {
                    options.schema_content_map[item.schema_code] = item.schema_content || '[]'
                    options.schema_extend_map[item.schema_code] = item.schema_extend || '{}';
                    h.push('<option value="' + item.schema_code + '">' + item.schema_name + ' : ' + item.schema_code + '</option>');
                }
            });
            h.push('</select>');
            return h.join('');
        },
        _createModuleDataBlankElem: function() {
            var self = this,
                options = this.options,
                schema_content = options.schema_content,
                h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip">Module Data</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12">');
            h.push('<table class="table table-bordered" id="module-table"><thead class="thin-border-bottom">');
            h.push('<tr><th>id</th><th>唯一标识号</th><th>唯一标识描述</th><th>schema code</th><th>status</th><th>last updated</th><th>操作</th></tr>');
            h.push('</thead><tbody id="module-content">');
            h.push('</tbody></table>');
            h.push('<div class="cs-nomoredata">没有更多数据</div>');
            h.push('</div>');

            this.element.addClass('hide').empty().append(h.join('')).removeClass('hide');
            this._createTableToolElem();
            this._createModalDataElem();
        },
        _createBlankElem: function() {
            var self = this,
                options = this.options,
                schema_content = options.schema_content,
                h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip">Module Data</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12">');
            h.push('<table class="table table-bordered" id="module-table"><thead class="thin-border-bottom"><tr><th>id</th>');
            _.each(schema_content, function(schema_item, schema_index) {
                h.push('<th data-key="' + schema_item.key + '">' + schema_item.desc + '</th>');
                switch (schema_item.type) {
                    case 'select':
                        options['select_' + schema_item.key] = self._getSelectData(schema_item.regx);
                        options['select_' + schema_item.key + '_elem'] = self._createSelectElem(schema_item.regx);
                        break;
                }
            });
            h.push('<th>schema code</th><th>status</th>');
            h.push('<th>操作</th></tr></thead><tbody id="module-content">');
            h.push('</tbody></table>');
            h.push('<div class="cs-nomoredata">没有更多数据</div>');
            h.push('<div id="module-pagingbar"></div>');
            h.push('</div>');

            this.element.addClass('hide').empty().append(h.join('')).removeClass('hide');
            this._createTableToolElem();
            if (schema_content && (schema_content.length > options.limit_cols)) {
                this._initCols();
            }
        },
        _createItemElem: function(item) {
            var self = this,
                options = this.options,
                schema_content = options.schema_content,
                schema_code = options.schema_code,
                h = [],
                itemdata = $.parseJSON(item.data);
            h.push('<tr data-id="' + item.id + '" data-status="' + item.status + '" data-data="' + _.escape(item.data) + '">');
            h.push(this._createItemInnerElem(item));
            h.push('</tr>');
            return h.join('');
        },
        _updateItemElem: function(item) {
            var self = this,
                options = this.options,
                schema_content = options.schema_content,
                schema_code = options.schema_code,
                h = [],
                itemdata = $.parseJSON(item.data),
                id = item.id,
                $content = this.element.find('#module-content'),
                $tr = $content.find('tr[data-id=' + id + ']').addClass('hide');
            $tr.empty().append(this._createItemInnerElem(item));
            $tr.attr({
                'data-data': _.escape(item.data)
            });
            $tr.removeClass('hide');
        },
        _createItemInnerElem: function(item) {
            var self = this,
                options = this.options,
                schema_content = options.schema_content,
                schema_code = options.schema_code,
                h = [],
                itemdata = $.parseJSON(item.data),
                $table = this.element.find('#module-table');
            this._initSettings();
            h.push('<td>' + item.id + '</td>');
            _.each(schema_content, function(schema_item, schema_index) {
                if (schema_item.key === 'ukey') {
                    h.push('<td class="uneditable" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value="' + (itemdata[schema_item.key] || '') + '" title="' + (itemdata[schema_item.key] || '') + '">' + (itemdata[schema_item.key] || '') + '</td>')
                } else {
                    h.push('<td class="editable ');
                    h.push($table.find('th[data-key=' + schema_item.key + ']').hasClass('hide') ? 'hide' : '');
                    h.push('" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value="' + (itemdata[schema_item.key] || '') + '" title="' + (itemdata[schema_item.key] || '') + '"><span>');
                    switch (schema_item.type) {
                        case 'select':
                            h.push('' + options['select_' + schema_item.key][itemdata[schema_item.key]] + '');
                            break;
                        case 'image':
                            if (!!itemdata[schema_item.key]) {
                                h.push('<a href="' + (itemdata[schema_item.key] || '') + '"><img class="snapshot" src="' + (itemdata[schema_item.key] || '') + '" /></a>');
                            } else {
                                h.push('');
                            }
                            break;
                        case 'link':
                            h.push('<a href="' + (itemdata[schema_item.key] || '') + '"><span>' + (itemdata[schema_item.key] || '') + '</span></a>');
                            break;
                        case 'boolean':
                            if (itemdata[schema_item.key] == '1') {
                                h.push('YES');
                            } else {
                                h.push('NO');
                            }
                            break;
                        case 'time':
                        default:
                            h.push(itemdata[schema_item.key] || '');
                    }
                    h.push('</span></td>');
                }
            });
            h.push('<td>' + schema_code + '</td><td><div class="module-status module-status-' + item.status + '">' + self.getStatusFace(item.status) + '</div></td>');
            if (options.parent_id == '0') {
                h.push('<td>' + item.update_time + '</td>');
            }
            h.push('<td>');
            if (options.is_preview) {
                h.push('<a class="btn btn-link data-preview" data-link="' + (itemdata['link'] || '') + '">预览</a>');
            }
            h.push('<a class="btn btn-link data-edit" data-toggle="modal" data-target="#module-modal-data">编辑</a>');
            h.push('<a class="btn btn-link data-save hide">保存</a>');
            h.push('<a class="btn btn-link data-expand">展开</a>');
            h.push('<div class="btn-group">');
            h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
            h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
            h.push('<li><a class="data-del">是，确认删除。</a></li>');
            h.push('</ul>');
            h.push('</div>');
            if (item.status == '0') {
                h.push('<a class="btn btn-link data-audit" data-id="' + item.id + '">提交审核</a>');
            }

            if (((options.role == '1') && (options.role_current == '3')) || (options.role == '5') || (options.role == '9')) {
                if (item.status == '6') {
                    h.push('<a class="btn btn-link data-reject" data-id="' + item.id + '">审核拒绝</a>');
                    h.push('<a class="btn btn-link data-permit" data-id="' + item.id + '">审核通过</a>');
                }
                if (item.status == '3') {
                    h.push('<a class="btn btn-link data-publish" data-id="' + item.id + '">发布</a>');
                }
            }
            h.push('</td>');
            return h.join('');
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click button.data-import': this._dataImportElem,
                'click button.data-sort': this._dataSortElem,
                'click button.data-add': this._dataAddElem,
                'click a.data-audit': this._dataAudit,
                'click a.data-reject': this._dataReject,
                'click a.data-permit': this._dataPermit,
                'click a.data-publish': this._dataPublish,
                'click a.data-del': this._dataDel,
                'click a.data-edit': this._dataEditElem,
                'click a.data-preview': this._dataPreview,
                'click button.import-save': this._importSave,
                'click button.sort-save': this._sortSave,
                'click button.data-save': this._dataSave,
                'click button.data-confirm': this._dataConfirm,
                'click a.data-expand': this._dataExpand,
                'click a.data-goto': this._dataGoto,
                'click button.upload-img-btn': this._uploadFile,
                'change input[type=file]': this._uploadImage,
                'change textarea.upload-img-tx': this._previewImg,
                'click a.schema-save': this._schemaSave,
                'click ul.btn-cols-list>li': this._colsShow,
                'change input.module-modal-import-item': this._toggleImportItem,
                // 'click tbody.module-modal-import-tbody tr': this._toggleImportItem
            });
        },
        _dataAudit: function() {
            this._dataOprate('dataapply');
        },
        _dataReject: function(event) {
            this._dataOprate('datarefuse');
        },
        _dataPermit: function(event) {
            this._dataOprate('datapass');
        },
        _dataPublish: function(event) {
            this._dataOprate('datapublish');
        },
        _dataOprate: function(urltag) {
            var self = this,
                options = this.options,
                id = $(event.target).attr('data-id');
            $.ajax({
                url: options[urltag],
                data: {
                    m_code: options.m_code,
                    id: id
                }
            }).done(function(response) {
                if (!response.errno) {
                    self.reRender({
                        m_code: options.m_code,
                        parent_id: options.parent_id
                    });
                } else {
                    notify({
                        tmpl: 'error',
                        text: '提交失败'
                    });
                }
            }).fail(function(response) {});
            return false;
        },
        _schemaSave: function(event) {
            var options = this.options;
            options.schema_code = this.element.find('#data-schema').find('select').val();
            options.schema_content = $.parseJSON(options.schema_content_map[options.schema_code]);
            options.schema_extend = $.parseJSON(options.schema_extend_map[options.schema_code]);
            this._createBlankElem();
            return false;
        },
        _dataImportElem: function() {
            var self = this,
                options = this.options,
                schema_content = options.schema_content,
                schema_code = options.schema_code,
                limit = options.limit_cols,
                h = [],
                $err = this.element.find('#module-modal-import-error'),
                $loading = this.element.find('#module-modal-import-loading'),
                $content = this.element.find('#module-modal-import-content');
            $.ajax({
                url: options.select_import + '&fn=?',
                crossDomain: true,
                dataType: 'json'
            }).done(function(res) {
                if (!res.errno) {
                    var datalist = res.data.stream_data;
                    if (!_.isEmpty(datalist)) {
                        h.push('<table class="table table-bordered">');
                        h.push('<thead class="thin-border-bottom"><tr>');
                        h.push('<th>选择</th>');
                        _.each(schema_content, function(schema_item, schema_index) {
                            if (schema_index < limit) {
                                h.push('<th data-key="' + schema_item.key + '">' + schema_item.desc + '</th>');
                            }
                        });
                        if (schema_content.length > limit) {
                            h.push('<th>更多省略</th>');
                        }
                        h.push('</tr></thead>');
                        h.push('<tbody class="module-modal-import-tbody" id="module-modal-import-tbody">');
                        _.each(datalist, function(item, index) {
                            h.push('<tr>');
                            h.push('<td><input type="checkbox" class="ace module-modal-import-item"></td>');
                            _.each(schema_content, function(schema_item, schema_index) {
                                if (schema_index < limit) {
                                    h.push('<td data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value="' + (item[schema_item.key] || '') + '" title = "' + (item[schema_item.key] || '') + '"><span>');
                                    switch (schema_item.type) {
                                        case 'select':
                                            h.push('' + options['select_' + schema_item.key][item[schema_item.key]] + '');
                                            break;
                                        case 'image':
                                            if (!!item[schema_item.key] && !_.isEmpty(item[schema_item.key])) {
                                                h.push('<img class="snapshot" src="' + (item[schema_item.key] || '') + '" />');
                                            } else {
                                                h.push('');
                                            }
                                            break;
                                        case 'link':
                                            h.push('<a href="' + (item[schema_item.key] || '') + '"><span>' + (item[schema_item.key] || '') + '</span></a>');
                                            break;
                                        case 'boolean':
                                            if (item[schema_item.key] == '1') {
                                                h.push('YES');
                                            } else {
                                                h.push('NO');
                                            }
                                            break;
                                        case 'time':
                                        default:
                                            h.push(item[schema_item.key] || '');
                                    }
                                    h.push('</span></td>');
                                } else {
                                    h.push('<td class="hide" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value="' + (item[schema_item.key] || '') + '">');
                                    switch (schema_item.type) {
                                        case 'select':
                                            h.push('' + options['select_' + schema_item.key][item[schema_item.key]] + '');
                                            break;
                                        case 'image':
                                            if (!!item[schema_item.key] && !_.isEmpty(item[schema_item.key])) {
                                                h.push('<img class="snapshot" src="' + (item[schema_item.key] || '') + '" />');
                                            } else {
                                                h.push('');
                                            }
                                            break;
                                        case 'link':
                                            h.push('<a href="' + (item[schema_item.key] || '') + '"><span>' + (item[schema_item.key] || '') + '</span></a>');
                                            break;
                                        case 'boolean':
                                            if (item[schema_item.key] == '1') {
                                                h.push('YES');
                                            } else {
                                                h.push('NO');
                                            }
                                            break;
                                        case 'time':
                                        default:
                                            h.push(item[schema_item.key] || '');
                                    }
                                    h.push('</td>');
                                }
                            });
                            if (schema_content.length > limit) {
                                h.push('<td>...</td>');
                            }
                            h.push('</tr>');
                        });
                        h.push('</tbody>');
                        h.push('</table>');
                        $content.addClass('hide').empty().append(h.join('')).removeClass('hide');
                        $content.find('td[data-key]').css({
                            'width': (90 / (Math.min(schema_content.length, limit) + 1)) + '%'
                        });

                    } else {
                        $err.html('没有数据。').removeClass('hide');
                    }
                } else {
                    $err.html(res.error).removeClass('hide');
                }
            }).fail(function(res) {
                $err.html('数据加载失败，请稍后再试。').removeClass('hide');
            }).always(function() {
                $loading.addClass('hide');
            });
        },
        _dataSortElem: function() {
            var self = this,
                options = this.options,
                schema_content = options.schema_content,
                lists = options.sortlist,
                limit = options.limit_cols - 1,
                head = [],
                h = [],
                $content = this.element.find('#module-modal-sort-content'),
                $head = $content.find('#module-modal-sort-head'),
                $list = $content.find('#module-modal-sort-list');
            head.push('<li>');
            head.push('<span>id</span>');
            _.each(schema_content, function(schema_item, schema_index) {
                if (schema_index < limit) {
                    head.push('<span data-key="' + schema_item.key + '">' + schema_item.desc + '</span>');
                }
            });
            head.push('<span data-key="status">status</span>');
            head.push('</li>');
            $head.empty().append(head.join(''));
            _.each(lists, function(item, index) {
                var itemdata = $.parseJSON(item.data);
                h.push('<li class="item-blue clearfix ui-sortable-handle" data-id="' + item.id + '">');
                h.push('<span>' + item.id + '</span>');
                _.each(schema_content, function(schema_item, schema_index) {
                    if (schema_index < limit) {
                        h.push('<span data-key="' + schema_item.key + '" title="' + (itemdata[schema_item.key] || '') + '">');
                        switch (schema_item.type) {
                            case 'select':
                                h.push('' + options['select_' + schema_item.key][itemdata[schema_item.key]] + '');
                                break;
                            case 'image':
                                if (!!itemdata[schema_item.key]) {
                                    h.push('<a href="' + (itemdata[schema_item.key] || '') + '"><img class="snapshot" src="' + (itemdata[schema_item.key] || '') + '" /></a>');
                                } else {
                                    h.push('');
                                }
                                break;
                            case 'link':
                                h.push('<a href="' + (itemdata[schema_item.key] || '') + '">' + (itemdata[schema_item.key] || '') + '</a>');
                                break;
                            case 'boolean':
                                if (itemdata[schema_item.key] == '1') {
                                    h.push('YES');
                                } else {
                                    h.push('NO');
                                }
                                break;
                            case 'time':
                                h.push(itemdata[schema_item.key] || '');
                                break;
                            case 'text':
                                h.push((itemdata[schema_item.key] || '').substr(0, 16) + '...');
                                break;
                            default:
                                h.push(itemdata[schema_item.key] || '');

                        }
                        h.push('</span>');
                    }
                });
                h.push('<span data-key="status"><div class="module-status module-status-' + item.status + '">' + self.getStatusFace(item.status) + '</div></span>');
                if (schema_content.length > limit) {
                    h.push('<span>...</span>');
                }
                h.push('</li>');
            });
            $list.empty().append(h.join(''));
            $content.find('span[data-key]').css({
                'width': (90 / (Math.min(schema_content.length, limit) + 1)) + '%'
            });
        },
        _dataAddElem: function() {
            var self = this,
                options = this.options,
                h = [],
                $title = this.element.find('#module-modal-data-title'),
                $content = $('#module-modal-data-content');
            $title.html('新增');
            //build table
            h.push('<table class="table table-bordered"><tbody>');
            h.push('<tr><td>id</td><td></td></tr>')
            _.each(options.schema_content, function(schema_item, schema_index) {
                h.push('<tr>');
                h.push('<td>' + schema_item.desc + '</td>');
                if (schema_item.editable == 0) {
                    h.push('<td class="uneditable" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value="' + (schema_item.default || '') + '">');
                    if (!!schema_item.default) {
                        switch (schema_item.type) {
                            case 'select':
                                h.push(schema_item.default);
                                break;
                            case 'image':
                                h.push('<div class="upload-img-preivew"><img src="' + schema_item.default+'"></div>');
                                break;
                            case 'boolean':
                                if (schema_item.default == 1) {
                                    h.push('YES');
                                } else {
                                    h.push('NO');
                                }
                                break;
                            case 'time':
                            case 'link':
                            default:
                                h.push(schema_item.default);
                                break;
                            case 'text':

                                break;
                        }
                    }
                } else {
                    h.push('<td class="editable" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '">');
                    if (!!schema_item.default) {
                        switch (schema_item.type) {
                            case 'select':
                                h.push(options['select_' + schema_item.key + '_elem']);
                                break;
                            case 'image':
                                h.push('<div class="upload-img-box">');
                                h.push('<div class="upload-img">');
                                h.push('<button class="upload-img-btn">上传图片</button>');
                                h.push('<textarea type="text" placeholder="图片链接" class="form-control upload-img-tx" style="resize: vertical;"></textarea>');
                                h.push('<input type="file" accept="image/gif, image/jpeg, image/png" class="hide module-image-upload">');
                                h.push('</div>');
                                h.push('<div class="upload-img-preivew"><img src="' + schema_item.default+'"></div>');
                                h.push('</div>');
                                break;
                            case 'boolean':
                                if (schema_item.default == 1) {
                                    h.push('<input type="checkbox" checked="checked" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                                } else {
                                    h.push('<input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                                }
                                break;
                            case 'time':
                                h.push('<input class="datetimepicker" type="text" value="' + schema_item.default+'"/>');
                                break;
                            case 'link':
                            case 'text':
                                h.push('<textarea>' + schema_item.default+'</textarea>');
                        }
                    } else {
                        switch (schema_item.type) {
                            case 'select':
                                h.push(options['select_' + schema_item.key + '_elem']);
                                break;
                            case 'image':
                                h.push('<div class="upload-img-box">');
                                h.push('<div class="upload-img">');
                                h.push('<button class="upload-img-btn">上传图片</button>');
                                h.push('<textarea type="text" placeholder="图片链接" class="form-control upload-img-tx" style="resize: vertical;"></textarea>');
                                h.push('<input type="file" accept="image/gif, image/jpeg, image/png" class="hide module-image-upload">');
                                h.push('</div>');
                                h.push('<div class="upload-img-preivew hide"></div>');
                                h.push('</div>');
                                break;
                            case 'boolean':
                                h.push('<input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                                break;
                            case 'time':
                                h.push('<input class="datetimepicker" type="text" />');
                                break;
                            case 'link':
                            case 'text':
                                h.push('<textarea></textarea>');
                        }
                    }
                }
                h.push('</td>');
                h.push('</tr>');
            });
            h.push('<tr><td>schema_code</td><td>' + options.schema_code + '</td></tr>');
            h.push('<tr><td>status</td><td><div class="module-status module-status-0">' + self.getStatusFace('0') + '</div></td></tr>')
            h.push('</tbody></table>');
            $content.addClass('hide').empty().append(h.join('')).removeClass('hide');
            $content.data('data-id', '');
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
        },
        _dataEditElem: function(event) {
            var self = this,
                options = this.options,
                h = [],
                $title = this.element.find('#module-modal-data-title'),
                $content = $('#module-modal-data-content'),
                $tr = $(event.target).closest('tr'),
                id = $tr.attr('data-id'),
                status = $tr.attr('data-status'),
                data = $.parseJSON(_.unescape($tr.attr('data-data')));
            $title.html('编辑');
            //build table
            h.push('<table class="table table-bordered"><tbody>');
            h.push('<tr><td>id</td><td>' + id + '</td></tr>')
            _.each(options.schema_content, function(schema_item, schema_index) {
                h.push('<tr>');
                h.push('<td>' + schema_item.desc + '</td>');
                if (schema_item.key == 'ukey') {
                    h.push('<td class="uneditable" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value="' + data[schema_item.key] + '">' + data[schema_item.key] + '</td>');
                } else {
                    if (schema_item.editable == 0) {
                        h.push('<td class="uneditable" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value="' + (data[schema_item.key] || schema_item.default) + '">');
                        switch (schema_item.type) {
                            case 'select':
                                h.push(data[schema_item.key] || schema_item.default);
                                break;
                            case 'image':
                                h.push('<div class="upload-img-preivew"><img src="' + (data[schema_item.key] || schema_item.default) + '"></div>');
                                break;
                            case 'boolean':
                                if (data[schema_item.key] == 1) {
                                    h.push('YES');
                                } else {
                                    h.push('NO');
                                }
                                break;
                            case 'time':
                            case 'link':
                            case 'text':
                            default:
                                h.push('' + data[schema_item.key] || schema_item.default);
                        }
                        h.push('</td>');
                    } else {
                        h.push('<td class="editable" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '">');
                        switch (schema_item.type) {
                            case 'select':
                                h.push(options['select_' + schema_item.key + '_elem']);
                                break;
                            case 'image':
                                h.push('<div class="upload-img-box">');
                                h.push('<div class="upload-img">');
                                h.push('<button class="upload-img-btn">上传图片</button>');
                                h.push('<textarea type="text" placeholder="图片链接" class="form-control upload-img-tx" style="resize: vertical;">' + (data[schema_item.key] || '') + '</textarea>');
                                h.push('<input type="file" accept="image/gif, image/jpeg, image/png" class="hide module-image-upload">');
                                h.push('</div>');
                                if (data[schema_item.key]) {
                                    h.push('<div class="upload-img-preivew"><img src="' + data[schema_item.key] + '"></div>');
                                } else {
                                    h.push('<div class="upload-img-preivew hide"></div>');
                                }
                                h.push('</div>');
                                break;
                            case 'link':
                                h.push('<textarea style="background: #fff">' + (data[schema_item.key] || '') + '</textarea>');
                                break;
                            case 'boolean':
                                if (data[schema_item.key] == 'YES') {
                                    h.push('<input type="checkbox" checked="checked" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                                } else {
                                    h.push('<input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
                                }
                                break;
                            case 'time':
                                h.push('<input class="datetimepicker" type="text" value="' + (data[schema_item.key] || '') + '"/>');
                                break;
                            case 'text':
                                h.push('<textarea style="background: #fff">' + (data[schema_item.key] || '') + '</textarea>');
                        }
                        h.push('</td>');
                    }
                }
                h.push('</tr>');
            });
            h.push('<tr><td>schema_code</td><td>' + options.schema_code + '</td></tr>');
            h.push('<tr><td>status</td><td><div class="module-status module-status-' + status + '">' + self.getStatusFace(status) + '</div></td></tr>')
            h.push('</tbody></table>');
            $content.addClass('hide').empty().append(h.join('')).removeClass('hide');
            var $selecttds = $content.find('td[data-type=select]');
            $selecttds.each(function() {
                var $select = $(this).find('select:eq(0)');
                $select.find('option[value=' + data[$(this).attr('data-key')] + ']').attr({
                    'selected': 'selected'
                });
            });
            $content.data('data-id', id);
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
        },
        _dataDel: function(event) {
            var $tr = $(event.target).closest('tr'),
                id = $tr.attr('data-id'),
                options = this.options;
            if (options.total == 1) {
                notify({
                    tmpl: 'error',
                    text: '请保留最后一条数据。'
                });
                return false;
            }

            if (!!id) {
                //delete existing item
                $.ajax({
                    url: options.datadelete,
                    data: {
                        m_code: options.m_code,
                        id: id
                    }
                }).done(function(response) {
                    if (!response.errno) {
                        $tr.remove();
                        options.sortlist = _.reject(options.sortlist, function(item) {
                            return item.id == id;
                        });
                        options.total = options.total - 1;
                        notify({
                            text: '删除成功。'
                        });
                    } else {
                        notify({
                            tmpl: 'error',
                            text: '删除失败，请稍后再试。'
                        });
                    }
                }).fail(function() {
                    notify({
                        tmpl: 'error',
                        text: '删除失败，请稍后再试。'
                    });
                });
            } else {
                //delete new item which is not saved
                $tr.remove();
            }
            return false;
        },
        _importSave: function(event) {
            var self = this,
                options = this.options,
                $selected = this.element.find('#module-modal-import-tbody').children('tr.selected'),
                $cancel = this.element.find('#import-cancel'),
                data = [];
            //return if no selected rows
            if (!$selected.length) {
                $cancel.trigger('click');
                return false;
            }

            if (options.sum_limit < options.total + $selected.length) {
                notify({
                    tmpl: 'error',
                    text: 'Schema:' + options.schema_code + '的条目限数为：' + options.sum_limit + '；当前页面已有' + options.total + '条数据，最多能导入' + (options.sum_limit - options.total) + '条数据。'
                });
                return false;
            }

            //save one by one
            $selected.each(function() {
                var item = {};
                $(this).find('td[data-key]').each(function() {
                    var type = $(this).attr('data-type'),
                        key = $(this).attr('data-key'),
                        value = $(this).attr('data-value');
                    //['text', 'link', 'boolean', 'image', 'select', 'time'],
                    if (type == 'boolean') {
                        value = value || '0'
                    } else {
                        value = value || ''
                    }
                    item[key] = value;
                });
                data.push(item)
            });
            var reqdata = {
                m_code: options.m_code,
                data: JSON.stringify(data),
                parent_id: options.parent_id,
                schema_code: options.schema_code,
                mutadd: 1
            };
            self._updateMultipleDataReq(options.dataadd, reqdata);
            $cancel.trigger('click');
        },
        _sortSave: function(event) {
            var self = this,
                options = this.options,
                $list = this.element.find('#module-modal-sort-list'),
                $cancel = this.element.find('#module-modal-sort').find('button.sort-cancel'),
                data = {};
            $list.children('li').each(function(index, value) {
                var id = $(this).attr('data-id');
                data[id] = index + 1;
            });

            $.ajax({
                url: options.smapupdate,
                data: {
                    m_code: options.m_code,
                    parent_id: options.parent_id,
                    map_value: JSON.stringify(data)
                }
            }).done(function(res) {
                if (!res.errno) {
                    $cancel.trigger('click');
                    self.reRender();
                } else {
                    notify({
                        tmpl: 'error',
                        text: res.error
                    });
                }
            }).fail(function() {
                notify({
                    tmpl: 'error',
                    text: '保存失败，请稍后再试。'
                });
            });
            return false;
        },
        _dataSave: function(event) {
            var self = this,
                options = this.options,
                h = [],
                data = {},
                dataStr,
                reqdata,
                $content = $('#module-modal-data-content'),
                $editable = $content.find('td.editable'),
                id = $content.data('data-id');
            //get new data
            $editable.each(function() {
                switch ($(this).attr('data-type')) {
                    case 'select':
                        data[$(this).attr('data-key')] = $(this).find('select').val();
                        break;
                    case 'boolean':
                        if ($(this).find('input').is(':checked')) {
                            data[$(this).attr('data-key')] = '1';
                        } else {
                            data[$(this).attr('data-key')] = '0';
                        }
                        break;
                    case 'time':
                        data[$(this).attr('data-key')] = $(this).find('input').val();
                        break;
                    case 'image':
                    case 'link':
                    case 'text':
                        data[$(this).attr('data-key')] = $(this).find('textarea').val().trim();
                        break;
                }
            });

            $content.find('td.uneditable').each(function() {
                data[$(this).attr('data-key')] = $(this).attr('data-value');
            });

            dataStr = JSON.stringify(data);
            self.element.find('#module-modal-data').find('button.data-cancel').trigger('click');

            if ((options.parent_id == 0) && (!id)) {
                if (data['ukey'] && _util.validateUkey(data['ukey'])) {
                    $.ajax({
                        url: options.ukeyexist,
                        data: {
                            m_code: options.m_code,
                            ukey: data['ukey']
                        }
                    }).done(function(res) {
                        if (!res.errno) {
                            reqdata = {
                                m_code: options.m_code,
                                data: dataStr,
                                parent_id: options.parent_id,
                                schema_code: options.schema_code
                            };
                            self._updateDataReq(options.dataadd, reqdata);
                            notify({
                                text: '保存成功。'
                            });
                        } else {
                            //show ukeyexist modal
                            var $modal_ukey = self.element.find('#module-modal-ukey'),
                                $ukey = $modal_ukey.find('#module-modal-body-ukey');
                            $ukey.text(data['ukey']);
                            $modal_ukey.data('data', dataStr);
                            self.element.find('#notify-ukey').trigger('click');
                        }
                    });
                } else {
                    notify({
                        tmpl: 'error',
                        text: '请确认输入“唯一标识号”，并确保“唯一标识号”值以字母打头，由任意顺序的大小写字母、数字、下划线组成。'
                    });
                    return false;
                }
            } else {
                if (!!id) {
                    //update existing item: send save request only when data string has been changed.
                    reqdata = {
                        m_code: options.m_code,
                        id: id,
                        data: dataStr
                    };
                    this._updateDataReq(options.dataupdate, reqdata);
                } else {
                    //add new item
                    reqdata = {
                        m_code: options.m_code,
                        data: dataStr,
                        parent_id: options.parent_id,
                        schema_code: options.schema_code
                    };
                    this._updateDataReq(options.dataadd, reqdata);
                }
            }
        },
        _dataConfirm: function(event) {
            var options = this.options,
                $modal_ukey = this.element.find('#module-modal-ukey'),
                dataStr = $modal_ukey.data('data'),
                reqdata = {
                    m_code: options.m_code,
                    data: dataStr,
                    parent_id: options.parent_id,
                    schema_code: options.schema_code
                };
            this._updateDataReq(options.dataadd, reqdata);
        },
        _updateDataReq: function(requrl, reqdata) {
            var self = this,
                options = this.options,
                $content = this.element.find('#module-content');
            $.ajax({
                url: requrl,
                data: reqdata
            }).done(function(response) {
                if (!response.errno) {
                    var item = response.data;
                    if (!_.isEmpty(item)) {
                        if (item.dbret) {
                            self._updateItemElem(item);
                        } else {
                            if (options.parent_id == 0) {
                                $content.prepend(self._createItemElem(item));
                            } else {
                                $content.append(self._createItemElem(item));
                            }
                            options.sortlist.push(item);
                            options.total = options.total + 1;
                        }
                        self.element.find('button.data-cancel').trigger('click');
                    }
                } else {
                    notify({
                        tmpl: 'error',
                        text: response.error
                    });
                }
            }).fail(function() {
                notify({
                    tmpl: 'error',
                    text: '保存失败，请稍后再试。'
                });
            });
        },
        _updateMultipleDataReq: function(requrl, reqdata) {
            var self = this,
                options = this.options,
                $content = this.element.find('#module-content');
            $.ajax({
                url: requrl,
                method: 'POST',
                data: reqdata
            }).done(function(res) {
                if (!res.errno) {
                    var datalist = res.data;
                    if (datalist.length) {
                        _.each(datalist, function(item, index) {
                            $content.append(self._createItemElem(item));
                            options.sortlist.push(item);
                            options.total = options.total + 1;
                        });
                    }
                } else {
                    notify({
                        tmpl: 'error',
                        text: res.error
                    });
                }
            }).fail(function() {
                notify({
                    tmpl: 'error',
                    text: '保存失败，请稍后再试。'
                });
            });
        },
        _dataExpand: function(event) {
            var options = this.options,
                parent_id = $(event.target).closest('tr').attr('data-id'),
                router = new Backbone.Router;
            router.navigate(options.m_code + '/module/' + parent_id, {
                trigger: true
            });
            return false;
        },
        _dataGoto: function(event) {
            var options = this.options,
                parent_id = $(event.target).attr('data-parent_id'),
                router = new Backbone.Router;
            router.navigate(options.m_code + '/module/' + parent_id, {
                trigger: true
            });
            return false;
        },
        //option sequence does matter.
        _createSelectElem: function(regx) {
            var h = [],
                regx = regx.split('|');
            h.push('<select>');
            _.each(regx, function(item, index) {
                var item = item.split(':');
                h.push('<option value="' + item[1] + '">' + item[0] + '</option>');
            });
            h.push('</select>');
            return h.join('');
        },
        //for select to get data by key, while option sequence does not matter.
        _getSelectData: function(regx) {
            var regx = regx.split('|'),
                data = {};
            _.each(regx, function(item, index) {
                var item = item.split(':');
                data[item[1]] = item[0];
            });
            return data;
        },
        getStatusFace: function(status) {
            switch (status) {
                case '0':
                    return '尚未提交';
                    break;
                case '1':
                    return '屏蔽';
                    break;
                case '2':
                    return '审核拒绝';
                    break;
                case '3':
                    return '审核通过';
                    break;
                case '4':
                    return '发布屏蔽';
                    break;
                case '5':
                    return '发布成功';
                    break;
                case '6':
                    return '等待审核';
                    break;
                case '9':
                    return '已删除';
                    break;
            }
        },
        _initCols: function() {
            var self = this,
                options = this.options,
                schema_content = options.schema_content,
                limit_cols = options.limit_cols;
            _.each(schema_content, function(schema_item, schema_index) {
                //hide cols from the index 4
                if (schema_index > limit_cols - 1) {
                    self.hideCol(schema_item.key);
                }
            });
        },
        _colsShow: function(event) {
            var $li = $(event.target).closest('li'),
                key = $li.attr('data-key'),
                $i = $li.find('i');
            if ($i.hasClass('fa-check')) {
                $i.removeClass('fa-check');
                this.hideCol(key);
            } else {
                $i.addClass('fa-check');
                this.showCol(key);
            }
            return false;
        },
        hideCol: function(key) {
            var $table = this.element.find('#module-table');
            $table.find('th[data-key=' + key + ']').addClass('hide');
            $table.find('td[data-key=' + key + ']').addClass('hide');
        },
        showCol: function(key) {
            var $table = this.element.find('#module-table');
            $table.find('th[data-key=' + key + ']').removeClass('hide');
            $table.find('td[data-key=' + key + ']').removeClass('hide');
        },
        _toggleImportItem: function(event) {
            var $tr = $(event.target).closest('tr'),
                is_selected = $(event.target).is(':checked');
            if (is_selected) {
                $tr.addClass('selected');
            } else {
                $tr.removeClass('selected');
            }
        },
        _dataPreview: function(event) {
            var options = this.options,
                link = $(event.target).attr('data-link');
            window.open(options.preview + link, '_blank', 'toolbar=0,location=0,menubar=0,width=600, height=800');
        }
    });
    module.exports = $.cs.module;
});
