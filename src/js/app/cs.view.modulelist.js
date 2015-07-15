define(function(require, exports, module) {
    'use strict';
    var notify = require('cs.plugin.notify'),
        autosize = require('../lib/autosize.min');

    $.widget('cs.modulelist', {
        options: {
            // modulegetlist: '../../datacms/modulegetlist.json', //for test
            modulegetlist: '/ucms/cms/modulegetlist',
            moduledelete: '/ucms/cms/moduledelete',
            modulesave: '/ucms/cms/modulesave'
        },
        _create: function() {
            this.render();
            this._bindEvents();
            $(window).resize();
            this.element.data('widgetCreated', true);
        },
        render: function() {
            this.renderTable();
        },
        reRender: function() {
            var self = this,
                options = this.options;
            $.ajax({
                url: options.modulegetlist
            }).done(function(response) {
                if (!response.errno) {
                    var data = response.data;
                        self._createWrapperElem(data);
                } else {
                    notify({
                        text: response.error
                    });
                }
            }).fail(function(response) {});
        },
        _createWrapperElem: function(data) {
            var self = this,
                options = this.options,
                h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip">Module管理</div>');
            h.push('<div class="table-tool">');
            if (options.role == '9') {
                h.push('<button class="btn btn-mini btn-success data-add"><i class="fa fa-plus"></i> 新增</button>');
            }
            h.push('</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12"><table class="table table-bordered"><thead class="thin-border-bottom">');
            h.push('<tr><th>id</th><th>m_name</th><th>m_code</th>');
            if (options.role == '9') {
                h.push('<th>操作</th>');
            }
            h.push('</tr>');
            h.push('<thead><tbody id="modulelist-content"></tbody></table>');
            h.push('<div class="cs-nomoredata">没有更多数据</div>');
            h.push('</div>');
            this.element.append(h.join(''));
            self._createTableElem(data.list);
            this.element.find('div.breadcrumbs').css({
                'width': this.element.width()
            });
        },
        renderTable: function() {
            var self = this,
                options = this.options;
            $.ajax({
                url: options.modulegetlist
            }).done(function(response) {
                if (!response.errno) {
                    var data = response.data,
                        use_acl = data.use_acl;
                    if (use_acl && (!_.isEmpty(use_acl))) {
                        options.role = use_acl.role;
                        self._createWrapperElem(data);
                    }
                } else {
                    notify({
                        text: response.error
                    });
                }
            }).fail(function(response) {});
        },
        _createTableElem: function(data) {
            var h = [],
                options = this.options;
            if (!_.isEmpty(data)) {
                _.each(data, function(item, index) {
                    h.push('<tr data-id="' + item.id + '" data-m_code="' + item.m_code + '"><td>' + item.id + '</td><td class="editable" data-key="m_name"><span>' + item.m_name + '</span></td><td data-key="m_code">' + item.m_code + '</td>');
                    if (options.role == '9') {
                        h.push('<td>');
                        h.push('<a class="btn btn-link data-edit">编辑</a>');
                        h.push('<a class="btn btn-link data-save hide">保存</a>');
                        h.push('<div class="btn-group">');
                        h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
                        h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
                        h.push('<li><a class="data-del">是，确认删除。</a></li>');
                        h.push('</ul>');
                        h.push('</div>');
                        h.push('</td>');
                    }
                    h.push('</tr>');
                });
            }
            this.element.find('#modulelist-content').empty().append(h.join(''));
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click button.data-add': this._dataAddElem,
                'click a.data-save': this._dataSave,
                'click a.data-del': this._dataDel,
                'click a.data-edit': this._dataEdit,
                'change textarea': this._rowpink
            });
        },
        _dataAddElem: function(event) {
            var options = this.options,
                h = [];
            h.push('<tr><td></td><td class="editable" data-key="m_name"><span></span><textarea></textarea></td><td class="editable" data-key="m_code"><span></span><textarea></textarea></td>');
            h.push('<td>');
            h.push('<a class="btn btn-link data-edit hide">编辑</a>');
            h.push('<a class="btn btn-link data-save">保存</a>');
            h.push('<a class="btn btn-link data-del">删除</a>');
            h.push('</td></tr>');
            this.element.find('#modulelist').find('tbody').prepend(h.join(''));
            $('textarea').each(function() {
                autosize($(this));
            });
            return false;
        },
        _dataSave: function(event) {
            var self = this,
                options = this.options,
                $updatelink = $(event.target),
                $editlink = $updatelink.parent().find('a.data-edit'),
                $tr = $updatelink.closest('tr'),
                id = $tr.attr('data-id'),
                $editable = $tr.find('td.editable'),
                data = {};
            if (!$tr.hasClass('row-pink')) {
                if (!!id) {
                    $editable.each(function() {
                        $(this).find('textarea').remove();
                        $(this).find('span').removeClass('hide');
                    });
                    $updatelink.addClass('hide');
                    $editlink.removeClass('hide');
                } else {
                    notify({
                        text: '请确认输入。'
                    });
                    return false;
                }
                return false;
            }

            //get new data
            $editable.each(function() {
                data[$(this).attr('data-key')] = $(this).find('textarea').val().trim();
            });

            $.ajax({
                url: options.modulesave,
                data: {
                    m_name: data.m_name,
                    m_code: data.m_code || $tr.attr('data-m_code'),
                    id: id
                }
            }).done(function(response) {
                if (!response.errno) {
                    var res = response.data;
                    if (res == true) {
                        $editable.each(function() {
                            var $ta = $(this).find('textarea'),
                                newVal = data[$(this).attr('data-key')];
                            console.log(newVal);
                            $(this).find('span').text(newVal).removeClass('hide');
                            $ta.remove();
                        });
                        $updatelink.addClass('hide');
                        $editlink.removeClass('hide');
                        $tr.removeClass('row-pink');
                    } else if (_.isObject(res)) {
                        $tr.remove();
                        self.element.find('tbody').prepend(self._createTableElem(res));
                    }
                } else {
                    notify({
                        text: response.error
                    });
                }
            }).fail(function(response) {
                notify({
                    text: '保存失败，请稍后再试。'
                });
            });
            return false;
        },
        _dataDel: function(event) {
            var options = this.options,
                $tr = $(event.target).closest('tr'),
                id = $tr.attr('data-id');
            if (!!id) {
                //delete existing item
                $.ajax({
                    url: options.moduledelete,
                    data: {
                        id: id
                    }
                }).done(function(response) {
                    if (!response.errno) {
                        $tr.remove();
                        notify({
                            text: '删除成功。'
                        });
                    } else {
                        notify({
                            text: '删除失败，请稍后再试。'
                        });
                    }
                }).fail(function() {
                    notify({
                        text: '删除失败，请稍后再试。'
                    });
                });
            } else {
                $tr.remove();
            }
            return false;
        },
        _dataEdit: function(event) {
            var options = this.options,
                $editlink = $(event.target),
                $savelink = $editlink.parent().find('a.data-save'),
                $editable = $editlink.closest('tr').find('td.editable');
            $editlink.addClass('hide');
            $savelink.removeClass('hide');
            $editable.each(function() {
                var $span = $(this).find('span');
                $span.addClass('hide');
                $(this).append('<textarea style="background: #fff">' + $span.text() + '</textarea>');
                $('textarea').each(function() {
                    autosize($(this));
                });
            });
            return false;
        },
        _rowpink: function(event) {
            var $row = $(event.target).closest('tr');
            if (!$row.hasClass('row-pink')) {
                $row.addClass('row-pink');
            }
            return false;
        }
    });
    module.exports = $.cs.modulelist;
});
