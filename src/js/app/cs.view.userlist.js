define(function(require, exports, module) {
    'use strict';
    var _util = require('cs.util'),
        notify = require('cs.plugin.notify');

    $.widget('cs.userlist', {
        options: {
            // userinfolist: '../../datacms/userinfolist.json', //for test
            userinfolist: '/ucms/cms/userinfolist',
            // modulegetlist: '../../datacms/modulegetlist.json',
            modulegetlist: '/ucms/cms/modulegetlist',
            // userupdate: '../../datacms/userupdate.json',
            userupdate: '/ucms/cms/userupdate',
            userdelete: '/ucms/cms/userdelete',
            modulelist: {},
            roleSelect: '<select class="user-role"><option value="0">访客</option><option value="1">module级权限</option><option value="5">平台最高权限</option></select>',
            moduleSelect: '',
            i: 0,
            limit: 60,
            routerstr: 'userlist'
        },
        _create: function() {
            this.getModulelist();
            this._bindEvents();
            $(window).resize();
            this.element.data('widgetCreated', true);
        },
        render: function() {
            this._createWrapperElem();
        },
        reRender: function(opt) {
            var options = this.options;
            _.extend(options, opt);
            this.renderTable();
        },
        _createWrapperElem: function() {
            var self = this,
                options = this.options,
                h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip">User管理</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12"><table class="table table-bordered"><thead class="thin-border-bottom">');
            h.push('<tr><th>id</th><th>uname</th><th>real_name</th><th>department</th><th>email</th><th>remark</th><th>activated</th><th>role</th><th style="width: 260px;">module_acl</th><th>update_time</th>');
            if ((options.role == '5') || (options.role == '9')) {
                h.push('<th>操作</th>');
            }
            h.push('</tr><thead><tbody id="userlist-content">');
            h.push('</tbody></table>');
            h.push('<div class="cs-nomoredata hide">没有更多数据</div>');
            h.push('<div id="userlist-pagingbar"></div>')
            h.push('</div>');
            this.element.append(h.join(''));
            this.renderTable();
        },
        renderTable: function() {
            var self = this,
                options = this.options,
                h = [];
            $.ajax({
                url: options.userinfolist,
                data: {
                    limit: options.limit,
                    offset: (options.pn == 1) ? 0 : parseInt(options.limit, 10) * (parseInt(options.pn, 10) - 1)
                }
            }).done(function(data) {
                var data = data.data;
                options.usertotal = data.usertotal;
                options.totalpages = Math.ceil(options.usertotal / options.limit);
                self._createTableElem(data.userlist);
                if ((options.pn == options.totalpages) || (options.totalpages == 1)) {
                    self.element.find('div.cs-nomoredata').removeClass('hide');
                }
                var setting = {
                    limit: options.limit,
                    totalpages: options.totalpages,
                    pn: parseInt(options.pn, 10),
                    routerstr: options.routerstr
                };
                var $pagingbar = self.element.find('#userlist-pagingbar');
                if ($pagingbar.data('widgetCreated')) {
                    $pagingbar.pagingbar('reRender', setting);
                } else {
                    $pagingbar.pagingbar(setting);
                }
            }).fail(function(response) {});
        },
        _createTableElem: function(data) {
            var self = this,
                options = this.options,
                h = [];
            if (!_.isEmpty(data)) {
                _.each(data, function(item, index) {
                    h.push('<tr data-uid="' + item.uid + '"><td>' + item.id + '</td><td>' + item.uname + '</td><td>' + item.real_name + '</td><td>' + (item.department || '') + '</td><td>' + (item.email || '') + '</td><td>' + (item.remark || '') + '</td><td>' + self.getActivatedFace(item.activated) + '</td>');
                    if (((options.role == '5') && (item.role != '9')) || options.role == '9') {
                        h.push('<td class="editable" data-key="role" data-value="' + item.role + '"><span>' + self.getRoleFace(item.role) + '</span></td><td class="editable" data-key="module_acl" data-value="' + _.escape(item.module_acl) + '"><span>' + self.parseModule_acl(item.module_acl) + '</span></td>');
                    } else {
                        h.push('<td>' + self.getRoleFace(item.role) + '</td><td>' + self.parseModule_acl(item.module_acl) + '</td>');
                    }

                    h.push('<td>' + item.update_time + '</td>');
                    if ((options.role == '5') || (options.role == '9')) {
                        h.push('<td>');
                        if (((options.role == '5') && (item.role != '9')) || (options.role == '9')) {
                            h.push('<a class="btn btn-link data-edit">编辑</a>');
                            h.push('<a class="btn btn-link data-save hide">保存</a>');
                            h.push('<div class="btn-group">');
                            h.push('<a data-toggle="dropdown" class="btn btn-link btn-white dropdown-toggle" aria-expanded="false">删除</a>');
                            h.push('<ul class="dropdown-menu dropdown-menu-right dropdown-alert">');
                            h.push('<li><a class="data-del">是，确认删除。</a></li>');
                            h.push('</ul>');
                            h.push('</div>');
                        }
                        h.push('</td>');
                    }
                    h.push('</tr>');
                });
            }
            this.element.find('#userlist-content').empty().append(h.join(''));
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click a.data-edit': this._dataEdit,
                'click a.data-save': this._dataSave,
                'click a.data-del': this._dataDel,
                'change select': this._rowpink,
                'change input': this._rowpink,
                'change select.user-role': this._toggleModuleAclStatus,
                'click a.user-addacl': this._addAclElem,
                'click a.user-delacl': this._delAclElem
            });
        },
        _addAclElem: function(event) {
            $(event.target).parent().find('div.user-ac').append(this._createBlankModuleAclItemElem());
            return false;
        },
        _delAclElem: function(event) {
            $(event.target).parent().children('select').trigger('change');
            $(event.target).closest('div.user-moduleitem').remove();
            return false;
        },
        _toggleModuleAclStatus: function(event) {
            var $select = $(event.target),
                role = $select.val();
            if (role == '1') {
                $select.closest('tr').find('div.user-aclbox').append(this._createModuleAclElem());
            } else {
                $select.closest('tr').find('div.user-aclbox').empty();
            }
            return false;
        },
        _dataEdit: function(event) {
            var self = this,
                options = this.options,
                $editlink = $(event.target),
                $savelink = $editlink.parent().find('a.data-save'),
                $editable = $editlink.closest('tr').find('td.editable'),
                vals;
            $editlink.addClass('hide');
            $savelink.removeClass('hide');
            $editable.each(function() {
                var $span = $(this).find('span');
                $span.addClass('hide');
                switch ($(this).attr('data-key')) {
                    case 'role':
                        $(this).append(options.roleSelect);
                        $(this).find('option[value=' + $(this).attr('data-value') + ']').attr({
                            'selected': 'selected'
                        });
                        break;
                    case 'module_acl':
                        var module_acl = $(this).attr('data-value');
                        if (module_acl && (module_acl != '{}')) {
                            $(this).append('<div class="user-aclbox">' + self._createModuleAclElem(module_acl) + '</div>');
                        } else {
                            $(this).append('<div class="user-aclbox"></div>');
                        }
                        break;
                }
            });
            return false;
        },
        _createModuleAclElem: function(module_acl) {
            var self = this,
                h = [],
                acl;
            h.push('<div class="user-ac">')
            if (!module_acl) {
                h.push(this._createBlankModuleAclItemElem());
            } else {
                acl = $.parseJSON(module_acl);
                _.each(acl, function(value, key) {
                    h.push(self._createModuleAclItemElem(key, value));
                });
            }
            h.push('</div><a class="btn btn-link user-addacl">+ 新增Module权限</a>');
            return h.join('');
        },
        _createModuleAclItemElem: function(module, acl) {
            var self = this,
                options = this.options,
                h = [];
            options.i = options.i + 1;
            h.push('<div class="user-moduleitem">');
            h.push(_util.createSelectElem({
                selectClass: 'module_acl',
                data: options.modulelist,
                selected: module
            }));
            h.push('<span>');
            h.push('<div class="radio"><label><input name="regAcl_' + options.i + '" type="radio" class="ace" value="2"');
            if (acl == '2') {
                h.push(' checked="checked"');
            }
            h.push('><span class="lbl">编辑</span></label></div>');
            h.push('<div class="radio"><label><input name="regAcl_' + options.i + '" type="radio" class="ace" value="3"');
            if (acl == '3') {
                h.push(' checked="checked"');
            }
            h.push('><span class="lbl">管理</span></label></div>');
            h.push('</span>');
            h.push('<a class="btn btn-link user-delacl">删除</a>');
            h.push('</div>');
            return h.join('');
        },
        _createBlankModuleAclItemElem: function() {
            var self = this,
                options = this.options,
                h = [];
            options.i = options.i + 1;
            h.push('<div class="user-moduleitem">');
            h.push(options.moduleSelect);
            h.push('<span>');
            h.push('<div class="radio"><label><input name="regAcl_' + options.i + '" type="radio" class="ace" value="2"><span class="lbl">编辑</span></label></div>');
            h.push('<div class="radio"><label><input name="regAcl_' + options.i + '" type="radio" class="ace" value="3"><span class="lbl">管理</span></label></div>');
            h.push('</span>');
            h.push('<a class="btn btn-link user-delacl">删除</a>');
            h.push('</div>');
            return h.join('');
        },
        _dataSave: function(event) {
            var self = this,
                options = this.options,
                $updatelink = $(event.target),
                $editlink = $updatelink.parent().find('a.data-edit'),
                $tr = $updatelink.closest('tr'),
                uid = $tr.attr('data-uid'),
                data = {},
                $editable = $tr.find('td.editable'),
                acllist = {};

            if (!$tr.hasClass('row-pink')) {
                $editable.each(function() {
                    switch ($(this).attr('data-key')) {
                        case 'role':
                            $(this).children('select').remove();
                            $(this).children('span').removeClass('hide');
                            break;
                        case 'module_acl':
                            $(this).children('div.user-aclbox').remove();
                            $(this).children('span').removeClass('hide');
                            break;
                    }
                });
                $updatelink.addClass('hide');
                $editlink.removeClass('hide');
                return false;
            }

            $editable.each(function() {
                switch ($(this).attr('data-key')) {
                    case 'role':
                        data[$(this).attr('data-key')] = $(this).children('select').val();
                        break;
                    case 'module_acl':
                        $(this).find('div.user-moduleitem').each(function() {
                            var module = $(this).find('select.module_acl').val(),
                                acl = $(this).find('input[name^=regAcl_]:checked').val();
                            if (module && acl) {
                                acllist[module] = acl;
                            }
                        });
                        data[$(this).attr('data-key')] = acllist;
                        break;
                }
            });


            if (!(data.role && JSON.stringify(data.module_acl))) {
                notify({
                    text: '请确认输入。'
                });
                return false;
            }

            $.ajax({
                url: options.userupdate,
                data: {
                    uid: uid,
                    role: data.role,
                    module_acl: JSON.stringify(data.module_acl)
                }
            }).done(function(response) {
                if (!response.errno) {
                    if (response.data) {
                        //data has been updated
                        $editable.each(function() {
                            var $select = $(this).find('select'),
                                newVal = data[$(this).attr('data-key')];
                            switch ($(this).attr('data-key')) {
                                case 'role':
                                    $(this).children('span').text(self.getRoleFace(newVal)).removeClass('hide');
                                    $select.remove();
                                    $(this).attr({
                                        'data-value': newVal
                                    });
                                    break;
                                case 'module_acl':
                                    console.log(newVal);
                                    $(this).children('span').text(self.parseModule_acl(newVal)).removeClass('hide');
                                    $(this).children('div.user-aclbox').remove();
                                    $(this).attr({
                                        'data-value': JSON.stringify(newVal)
                                    });
                                    break;
                            }
                        });
                    } else {
                        //data remained the same as before
                        $editable.each(function() {
                            switch ($(this).attr('data-key')) {
                                case 'role':
                                    $(this).children('select').remove();
                                    $(this).children('span').removeClass('hide');
                                    break;
                                case 'module_acl':
                                    $(this).children('div.user-aclbox').remove();
                                    $(this).children('span').removeClass('hide');
                                    break;
                            }
                        });
                    }
                    $updatelink.addClass('hide');
                    $editlink.removeClass('hide');
                    $tr.removeClass('row-pink');
                }
            }).fail(function(response) {});
            return false;
        },
        _dataDel: function(event) {
            var options = this.options,
                $tr = $(event.target).closest('tr'),
                uid = $tr.attr('data-uid');
            $.ajax({
                url: options.userdelete,
                data: {
                    uid: uid
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
            }).fail(function(response) {
                notify({
                    text: '删除失败，请稍后再试。'
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
        },
        getModulelist: function() {
            var self = this,
                options = this.options;
            $.ajax({
                url: options.modulegetlist
            }).done(function(data) {
                var data = data.data,
                    use_acl = data.use_acl;
                if (use_acl && (!_.isEmpty(use_acl))) {
                    options.role = use_acl.role;
                    _.each(data.list, function(item, index) {
                        options.modulelist[item.m_code] = item.m_name;
                    });
                    options.moduleSelect = _util.createSelectElem({
                        selectClass: 'module_acl',
                        data: options.modulelist
                    });
                    self.render();
                }
            }).fail(function(data) {});
        },
        parseModule_acl: function(module_acl) {
            if (!module_acl) {
                return '';
            }
            var self = this,
                options = this.options,
                modulelist = options.modulelist,
                acl,
                h = [];
            if (_.isObject(module_acl)) {
                acl = module_acl;
            } else {
                acl = $.parseJSON(module_acl);
            }
            _.each(acl, function(value, key) {
                h.push(modulelist[key] + ':' + self.getRoleFace(value));
            });
            return h.join(',');
        },
        getActivatedFace: function(key) {
            switch (key) {
                case '0':
                    return '新用户';
                    break;
                case '1':
                    return '待审核';
                    break;
                case '2':
                    return '审核拒绝';
                    break;
                case '3':
                    return '删除状态';
                    break;
                case '4':
                    return '审核通过';
                    break;
            }
        },
        getRoleFace: function(key) {
            switch (key) {
                case '0':
                    return '访客';
                    break;
                case '1':
                    return 'module级权限';
                    break;
                case 2:
                case '2':
                    return '编辑';
                    break;
                case 3:
                case '3':
                    return '管理';
                    break;
                case '5':
                    return '平台最高权限';
                    break;
                case '9':
                    return '超级管理员';
                    break;
            }
        },
    });
    module.exports = $.cs.userlist;
});
