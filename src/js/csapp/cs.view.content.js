define(function(require, exports, module) {
    'use strict';
    var autosize = require('../cslib/autosize.min'),
        _util = require('cs.util'),
        notify = require('cs.plugin.notify');

    $.widget('cs.content', {
        options: {
            // getdata: '../../data/getdata.json', //for test
            getdata: '/udata/mis/getdata',
            savedata: 'http://uil-mis.shahe.baidu.com:8050/udata/mis/saveData',
            app: 'flyflow',
            cate_info: {},
            schema: {},
            data_info: {},
            toDeleteNodes: [],
            toAddDataNodes: [],
            toUpdateDatNodes: {}
        },
        _create: function(opt) {
            this.render(opt);
            this._bindEvents();
            this.element.data('widgetCreated', true);
        },
        render: function(opt) {
            _.extend(this.options, opt);
            var self = this,
                options = this.options;
            $.ajax({
                url: options.getdata,
                data: {
                    app: options.app,
                    id: options.id
                }
            }).done(function(response) {
                if ((!response.errno) && !_.isEmpty(response.data)) {
                    var data = response.data;
                    options.cate_info = data.cate_info;
                    options.schema = $.parseJSON(data.schema);
                    options.data_info = data.data_info;

                    var codeArray = options.parent_code.split('-'),
                        inner = options.schema.inner,
                        list = options.data_info.data.list;

                    for (var i = codeArray.length - 1; i > 0; i--) {
                        inner = inner.inner;
                    }
                    options.inner = inner;
                    for (var m = 1, n = codeArray.length; m < n; m++) {
                        list = list[codeArray[m]].list;
                    }
                    options.list = list;

                    self.element.append(self._createListElem());
                    if (self.element.hasClass('hide')) {
                        self.element.removeClass('hide').addClass('current');;
                    }
                }
            });
        },
        reRender: function(opt) {
            this.element.addClass('hide').empty();
            this.render(opt);
        },
        _createListElem: function() {
            var self = this,
                options = this.options,
                prop = options.inner.prop,
                list = options.list,
                h = [];
            h.push('</div>');
            h.push('</div>');
            h.push('</div>');
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip" title="Data">Data</div>');
            h.push('<div class="table-tool">');
            h.push('Launch demo modal</button>');
            h.push('<button class="btn btn-mini btn-danger content-save hide"><i class="fa fa-save"></i> 保存</button>');
            h.push('<button class="btn btn-mini btn-success" data-toggle="modal" data-target="#contentModal"><i class="fa fa-plus"></i> 新增</button>');
            h.push('<div class="btn-group">');
            h.push('<button class="btn btn-mini btn-yellow dropdown-toggle btn-import" data-toggle="dropdown">导入<i class="ace-icon fa fa-angle-down icon-on-right"></i></button>');
            h.push('<ul class="dropdown-menu dropdown-info dropdown-menu-right">');
            h.push('<li><a attr="click:showUploadDataSchema">导入新增Data和Schema</a></li>');
            h.push('<li><a attr="click:showUploadData">导入新增Data</a></li>');
            h.push('<li><a attr="click:showUploadSchema">导入更新Schema</a></li>');
            h.push('</ul>');
            h.push('</div>');
            h.push('</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12"><table class="table table-bordered table-hover" data-code="' + options.parent_code + '"><thead class="thin-border-bottom"><tr>');
            _.each(prop, function(item, index) {
                h.push('<th data-key="' + item.key + '" data-type="' + item.type + '" data-regx="' + item.regx + '">' + item.desc + '</th>');
            });
            h.push('<th>操作</th></tr></thead>');
            h.push('<tbody>');
            _.each(list, function(listitem, i) {
                h.push(self._createItemElem(listitem, i));
            });
            h.push('</tbody>');
            h.push('</table></div>');
            h.push('<div id="contentModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="contentModalLabel" aria-hidden="true" style="display: none;">');
            h.push('<div class="modal-dialog">');
            h.push('<div class="modal-content">');
            h.push('<div class="modal-header">');
            h.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>');
            h.push('<h5 class="text-primary" id="contentModalLabel">新增<a class="anchorjs-link" href="#contentModalLabel"><span class="anchorjs-icon"></span></a></h5>');
            h.push('</div>');
            h.push('<div class="modal-body">');
            h.push('</div>');
            h.push('<div class="modal-footer">');
            h.push('<button type="button" class="btn btn-mini btn-default" data-dismiss="modal">X 关闭</button>');
            h.push('<button type="button" class="btn btn-mini btn-primary"><i class="fa fa-save"></i> 保存</button>');
            h.push('</div>');
            return h.join('');
        },
        _createItemElem: function(listitem, i) {
            var options = this.options,
                parent_code = options.parent_code,
                inner = options.inner,
                prop = inner.prop,
                toggleExpandLink = (inner.type == 'list'),
                h = [];
            h.push('<tr data-code="' + parent_code + '-' + i + '" data-index="' + i + '">');
            _.each(prop, function(item, index) {
                h.push('<td data-key="' + item.key + '" data-type="' + item.type + '">' + listitem[item.key] + '</td>');
            });
            h.push('<td>');
            //show expand link according to schema, not data
            if (toggleExpandLink) {
                h.push('<a class="btn btn-link content-expand">展开</a>');
            }
            h.push('<a class="btn btn-link content-del">删除</a>');
            h.push('</td>')
            h.push('</tr>');
            return h.join('');
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click a.content-expand': this._expandContent,
                'click button.content-save': this._saveContent,
                'click a.content-del': this._delItem,
                'change input': this._rowpink,
                'change textarea': this._rowpink,
                'change select': this._rowpink
            });
        },
        _expandContent: function(event) {
            var options = this.options,
                code = $(event.target).closest('tr').attr('data-code'),
                router = new Backbone.Router;
            router.navigate('data/' + options.id + '/' + code, {
                trigger: true
            });
        },
        _saveContent: function(event) {
            var self = this,
                options = this.options;
            //update all pink rows
            var $edited = this.element.find('tr.row-pink');
            if ($edited.length) {
                //check the first td has value or not
                $edited.each(function() {
                    if (!$(this).children('td:first-child').children(':eq(0)').val()) {
                        notify({
                            text: '请确认输入完整或删除' + options.inner.prop[0].desc + '为空的行。'
                        });
                        return false;
                    }
                });

                $edited.each(function() {
                    var dataindex = $(this).attr('data-index');
                    var rowvalue = {};
                    $(this).children('td.editable').each(function() {
                        var type = $(this).attr('data-type');
                        switch (type) {
                            case 'boolean':
                                if ($(this).children(':eq(0)').is(':checked')) {
                                    rowvalue[$(this).attr('data-key')] = '1';
                                } else {
                                    rowvalue[$(this).attr('data-key')] = '0';
                                }
                                break;
                            case 'text':
                                rowvalue[$(this).attr('data-key')] = $(this).children(':eq(0)').val();
                                break;
                        }
                    });
                    console.log(rowvalue);
                    if (dataindex) {
                        options.toUpdateDatNodes[dataindex] = rowvalue;
                    } else {
                        if (options.inner.type == 'list') {
                            rowvalue['list'] = null;
                        }
                        options.toAddDataNodes.unshift(rowvalue);
                    }
                });
            }

            //check if there is existing data to update
            if (!_.isEmpty(options.toUpdateDatNodes)) {
                this._updateDataNode();
            }
            //check if there is data to delete
            if (options.toDeleteNodes.length) {
                this._deleteDataNodes();
            }
            //check if there is new data to add
            if (options.toAddDataNodes.length) {
                this._addDataNodes();
            }

            $.ajax({
                url: options.savedata,
                type: 'POST',
                data: {
                    app: options.app,
                    id: options.id,
                    data: JSON.stringify(options.data_info.data)
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
                    return false;
                }
            }).fail(function(response) {
                notify({
                    text: '保存失败，请稍后再试'
                });
                return false;
            });
            return false;
        },
        _updateDataNode: function() {
            var options = this.options,
                toUpdateDatNodes = options.toUpdateDatNodes,
                list = options.data_info.data.list,
                codeArray = options.parent_code.split('-');
            for (var m = 1, n = codeArray.length; m < n; m++) {
                list = list[codeArray[m]].list;
            }
            _.each(toUpdateDatNodes, function(value, key) {
                _.extend(list[key], value);
            });
        },
        _addDataNodes: function() {
            var options = this.options,
                toAddDataNodes = options.toAddDataNodes,
                list = options.data_info.data.list,
                codeArray = options.parent_code.split('-');
            for (var m = 1, n = codeArray.length; m < n; m++) {
                list = list[codeArray[m]].list;
            }
            list = list.concat(toAddDataNodes);
        },
        _deleteDataNodes: function() {
            var options = this.options,
                toDeleteNodes = options.toDeleteNodes,
                list = options.data_info.data.list,
                codeArray = options.parent_code.split('-');
            for (var m = 1, n = codeArray.length; m < n; m++) {
                list = list[codeArray[m]].list;
            }
            for (var i = 0, j = toDeleteNodes.length; i < j; i++) {
                delete list[toDeleteNodes[i]];
            }
            list = _.without(list, undefined);
        },
        _delItem: function(event) {
            var options = this.options,
                toDeleteNodes = options.toDeleteNodes,
                $tr = $(event.target).closest('tr'),
                dataindex = $tr.attr('data-index');
            $tr.remove();
            if (dataindex) {
                this._showSaveBtn();
                toDeleteNodes.push(dataindex);
            }
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
            var $savebtn = this.element.find('button.content-save');
            if ($savebtn.hasClass('hide')) {
                $savebtn.removeClass('hide');
            }
        }
    });
    module.exports = $.cs.content;
});
