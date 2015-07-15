define(function(require, exports, module) {
    'use strict';
    var _util = require('cs.util'),
        notify = require('cs.plugin.notify');;

    $.widget('cs.contentlist', {
        options: {
            // getdatainfo: '../../data/getdatainfo.json', //for test
            getdatainfo: '/udata/mis/getdatainfo',
            deldatainfo: 'udata/mis/deldatainfo',
            app: 'flyflow'
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
                url: options.getdatainfo,
                data: {
                    app: options.app,
                    id: options.id
                }
            }).done(function(data) {

                self.element.append(self._createContentListElem(data.data));

                if (self.element.hasClass('hide')) {
                    self.element.removeClass('hide').addClass('current');
                }
            });
        },
        _createContentListElem: function(lists) {
            var h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip" title="Data">Data</div>');
            h.push('<div class="table-tool">');
            h.push('<button class="btn btn-mini btn-success" attr="click:newMeta"><i class="fa fa-plus"></i> 新增</button>');
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
            h.push('<div class="col-xs-12"><table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr><th>ID</th><th>Meta</th><th>Schema</th><th>Version</th><th>上次更新时间</th><th>操作</th></tr></thead>');
            _.each(lists, function(item, index) {
                h.push('<tr data-id=' + item.id + '><td>' + item.id + '</td><td><a class="btn-link contentlist-editMeta">' + (item.metadata || 'Empty') + '</a></td><td><a class="btn-link contentlist-editSchema" data-schema_id="' + item.schema_id + '">' + item.schema_id + '</a></td><td>' + item.version + '</td><td>' + _util.dateFormat(item.updated_time * 1000, 'yyyy-MM-dd hh:mm:ss') + '</td><td>');
                h.push('<a class="btn btn-link contentlist-expand">编辑</a>');
                h.push('<a class="btn btn-link contentlist-edit">复制创建</a>');
                h.push('<div class="btn-group">');
                h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
                h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
                h.push('<li><a class="contentlist-del">是，确认删除。</a></li>');
                h.push('</ul>');
                h.push('</div>');
                h.push('</td></tr>');
            });
            h.push('</table></div>');
            return h.join('');
        },
        reRender: function(opt) {
            _.extend(this.options, opt);
            this.element.addClass('hide').empty();
            this.render();
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click a.contentlist-expand': this._expandContent,
                'click a.contentlist-del': this._delContent,
                'click a.contentlist-editSchema': this._editSchema,
                'click a.contentlist-editMeta': this._editMeta
            });
        },
        _expandContent: function(event) {
            var id = $(event.target).closest('tr').attr('data-id'),
                router = new Backbone.Router;
            router.navigate('data/' + id + '/0', {
                trigger: true
            });
            return false;
        },
        _delContent: function(event) {
            var options = this.options,
                $tr = $(event.target).closest('tr'),
                id = $tr.attr('data-id');
            $tr.addClass('hide');
            $.ajax({
                url: options.deldatainfo,
                data: {
                    app: options.app,
                    data_id: id
                }
            }).done(function(response) {
                if (!response.errno) {
                    $tr.remove();
                } else {
                    $tr.removeClass('hide');
                    notify({
                        text: response.error
                    })
                }
            }).fail(function(response) {
                $tr.removeClass('hide');
                notify({
                    text: '删除失败'
                })
            });
            return false;
        },
        _editSchema: function(event) {
            var id = $(event.target).attr('data-schema_id'),
                router = new Backbone.Router;
            router.navigate('schema/' + id, {
                trigger: true
            });
            return false;
        },
        _editMeta: function(event) {
            var id = $(event.target).closest('tr').attr('data-id'),
                router = new Backbone.Router;
            router.navigate('meta/' + id, {
                trigger: true
            });
            return false;
        }
    });
    module.exports = $.cs.contentlist;
});
