define(function(require, exports, module) {
    'use strict';
    var _util = require('cs.util'),
        notify = require('cs.plugin.notify');
    $.widget('cs.category', {
        options: {
            // getcatelist: '../../data/getcatelist.json',
            // saveCate: '../../data/saveCate.json',
            // delCate: '../../data/delCate.json',
            getcatelist: '/udata/mis/getcatelist',
            saveCate: '/udata/mis/saveCate',
            delCate: '/udata/mis/delCate',
            app: 'flyflow',
            categorydata: [],
            curCategoryFirstId: '1'
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
                url: options.getcatelist,
                data: {
                    app: options.app
                }
            }).done(function(data) {
                options.categorydata = data.data;
                self.element.append(self._createCategoryElem(data.data));

                if (self.element.hasClass('hide')) {
                    self.element.removeClass('hide').addClass('current');
                }
            });
        },
        reRender: function() {
            this.element.addClass('hide').empty();
            this.render();
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click button.data-add': this._addBlankItemElem,
                'click a.data-del': this._delItem,
                'click a.data-save': this._saveItem,
                'click a.data-edit': this._editItem,
                'click #category_first > tr': this._renderCategorySecondInnerElem
            });
        },
        _createCategoryElem: function(list) {
            var self = this,
                options = this.options,
                h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip" title="菜单管理">菜单管理</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12">');
            h.push('<div class="col-xs-12 col-sm-6 widget-container-col ui-sortable">');
            h.push('<div class="widget-box widget-color-blue ui-sortable-handle">')
            h.push('<div class="widget-header"><h5 class="widget-title bigger lighter"><i class="ace-icon fa fa-list"></i>一级分类</h5></div>');
            h.push('<div class="widget-body"><div class="widget-main no-padding"><table class="table table-striped table-bordered table-hover">');
            h.push('<thead class="thin-border-bottom"><tr><th>id</th><th>name</th><th>code</th><th>操作</th></tr></thead><tbody id="category_first">');
            _.each(list, function(item, index) {
                if (options.curCategoryFirstId === item.id) {
                    h.push('<tr class="row-cur" data-id="' + item.id + '" data-parent_id="0" data-depth="0">');
                } else {
                    h.push('<tr data-id="' + item.id + '" data-parent_id="0" data-depth="0">');
                }
                h.push(self._createItemInnerElem(item));
                h.push('</tr>');
            });
            h.push('</tbody>');
            h.push('</table></div>');
            h.push('<div class="widget-toolbox padding-8 clearfix"><button class="btn btn-xs btn-success pull-right data-add" data-depth="0"><i class="fa fa-plus"></i><span class="bigger-110"> 新增</span></button></div>');
            h.push('</div></div></div>');
            h.push('<div class="col-xs-12 col-sm-6 widget-container-col ui-sortable">');
            h.push('<div class="widget-box widget-color-green ui-sortable-handle">')
            h.push('<div class="widget-header"><h5 class="widget-title bigger lighter"><i class="ace-icon fa fa-list"></i>二级分类</h5></div>');
            h.push('<div class="widget-body"><div class="widget-main no-padding"><table class="table table-striped table-bordered table-hover">');
            h.push('<thead class="thin-border-bottom"><tr><th>id</th><th>name</th><th>code</th><th>操作</th></tr></thead><tbody id="category_second">');
            h.push(self._createCategorySecondInnerElem());
            h.push('</tbody>');
            h.push('</table></div>');
            h.push('<div class="widget-toolbox padding-8 clearfix"><button class="btn btn-xs btn-success pull-right data-add" data-depth="1"><i class="fa fa-plus"></i><span class="bigger-110"> 新增</span></button></div>');
            h.push('</div></div></div>');
            h.push('</div>')
            return h.join('');
        },
        _addBlankItemElem: function(event) {
            var h = [];
            h.push('<tr data-depth="' + $(event.target).closest('button').attr('data-depth') + '"><td></td><td><input type="text" data-key="name" /></td><td><input type="text" data-key="code" /></td><td>');
            h.push('<a class="btn btn-link data-save">保存</a>');
            h.push('<a class="btn btn-link data-del">删除</a>');
            h.push('</td></tr>');
            $(event.target).closest('div.widget-body').find('tbody').append(h.join(''));
            return false;
        },
        _editItem: function(event) {
            var options = this.options,
                categorydata = options.categorydata,
                $tr = $(event.target).closest('tr'),
                id = $tr.attr('data-id'),
                parent_id = $tr.attr('data-parent_id'),
                h = [],
                category = {};
            if (parent_id == '0') {
                category = _.findWhere(categorydata, {
                    id: id
                });
            } else {
                category = _.findWhere(_.findWhere(categorydata, {
                    id: parent_id
                }).list, {
                    id: id
                });
            }
            h.push('<td>' + category.id + '</td><td><input type="text" data-key="name" value="' + category.name + '"></td><td><input type="text" data-key="code" value="' + category.code + '"></td>');
            h.push('<td><a class="btn btn-link data-save">保存</a>');
            h.push('<div class="btn-group">');
            h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
            h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
            h.push('<li><a class="data-del">是，确认删除。</a></li>');
            h.push('</ul>');
            h.push('</div>');
            h.push('</td>');
            $tr.empty().append(h.join(''));
            return false;
        },
        _delItem: function(event) {
            var options = this.options,
                $tr = $(event.target).closest('tr'),
                id = $tr.attr('data-id');
            if (id) {
                $.ajax({
                    url: options.delCate,
                    data: {
                        app: options.app,
                        cate_id: $tr.attr('data-id'),
                        parent_id: $tr.attr('data-parent_id')
                    }
                }).done(function(response) {
                    if (!response.errno) {
                        if (response.data) {
                            $tr.remove();
                        }
                    } else {
                        notify({
                            text: response.error
                        });
                    }
                }).fail(function(response) {});
            } else {
                $tr.remove();
            }
            return false;
        },
        _renderCategorySecondInnerElem: function(event) {
            var self = this,
                options = this.options,
                $category_first = $('#category_first'),
                $tr = $(event.target).closest('tr'),
                curId = $tr.attr('data-id');

            if ($(event.target).hasClass('dropdown-toggle')) {
                $(event.target).closest('div.btn-group').addClass('open');
                $(event.target).attr({
                    'aria-expanded': true
                });
                return false;
            }
            if ($(event.target).hasClass('data-edit')) {
                $(this).trigger('click');
                return false;
            }
            if (!curId) {
                return false;
            }
            if ($tr.hasClass('row-cur')) {
                return false;
            } else {
                $category_first.find('tr[data-id=' + options.curCategoryFirstId + ']').removeClass('row-cur');
                $tr.addClass('row-cur');
                options.curCategoryFirstId = curId;
                $('#category_second').empty().append(this._createCategorySecondInnerElem());
            }
            return false;
        },
        _createCategorySecondInnerElem: function() {
            var h = [],
                self = this,
                options = this.options,
                categorydata = options.categorydata,
                curCategoryFirstId = options.curCategoryFirstId,
                category = _.findWhere(categorydata, {
                    id: curCategoryFirstId
                });
            _.each(category.list, function(item, index) {
                h.push('<tr data-id="' + item.id + '" data-parent_id="' + curCategoryFirstId + '" data-depth="1">');
                h.push(self._createItemInnerElem(item));
                h.push('</tr>');
            });
            return h.join('');
        },
        _createItemInnerElem: function(item) {
            var h = [];
            h.push('<td>' + item.id + '</td><td>' + item.name + '</td><td>' + item.code + '</td><td>');
            h.push('<a class="btn btn-link data-edit">编辑</a>');
            h.push('<div class="btn-group">');
            h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
            h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
            h.push('<li><a class="data-del">是，确认删除。</a></li>');
            h.push('</ul>');
            h.push('</div>');
            h.push('</td>');
            return h.join('');
        },
        _saveItem: function(event) {
            var self = this,
                options = this.options,
                $tr = $(event.target).closest('tr'),
                depth = $tr.attr('data-depth'),
                id = $tr.attr('data-id'),
                name = $tr.find('input[data-key=name]').val().trim(),
                code = $tr.find('input[data-key=code]').val().trim();
            if ((name && code && (depth == 1)) || (name && (depth == 0))) {
                if (code && !_util.validateId(code)) {
                    notify({
                        text: '请确保code值以字母打头，由任意顺序的大小写字母、数字、下划线组成。'
                    });
                    return false;
                } else {
                    $.ajax({
                        url: options.saveCate,
                        data: {
                            app: options.app,
                            id: id,
                            pid: 0,
                            name: name,
                            cate: code,
                            inner_data: 0,
                            depth: depth
                        }
                    }).done(function(response) {
                        var data = response.data;
                        if (id) {
                            //update existing item
                            $tr.empty().append(self._createItemInnerElem({
                                id: id,
                                name: name,
                                code: code
                            }));
                        } else {
                            //add new item
                            $tr.empty().append(self._createItemInnerElem(data));
                            $tr.attr({
                                'data-id': data.id,
                                'data-parent_id': options.curCategoryFirstId
                            });
                        }
                    }).fail(function(response) {});
                }
            } else {
                notify({
                    text: '请确保name与code输入完整。'
                });
                return false;
            }
            return false;
        }
    });
    module.exports = $.cs.category;
});
