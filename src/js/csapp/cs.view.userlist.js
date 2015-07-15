define(function(require, exports, module) {
    'use strict';
    var _util = require('cs.util');

    $.widget('cs.userlist', {
        options: {
            getuserlist: '/udata/mis/getuserlist',
            // getuserlist: '../../data/getuserlist.json',
            updateRoles: '/udata/mis/updateRoles',
            // updateRoles: '../../data/updateRoles.json',
            selectData: {
                '0': '新用户',
                '1': '普通职员',
                '3': '数据管理员',
                '5': '产品线管理员'
            }
        },
        _create: function() {
            this.render(this.options.getuserlist);
            this._bindEvents();
            this.options.selectElem = _util.createSelectElem({
                data: this.options.selectData,
                selectClass: 'user-role'
            });
            this.element.data('widgetCreated', true);
        },
        render: function(getuserlist) {
            var self = this,
                options = this.options;
            $.ajax({
                url: options.getuserlist,
                data: {
                    app: options.app
                }
            }).done(
                function(data) {
                    self.element.append(self._createUserlistElem(data.data));
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
                'dblclick div.table-cell-editable': this._edit,
                'change select.user-role': this._changerole
            });
        },
        _createUserlistElem: function(lists) {
            var self = this,
                h = [];
            h.push('<div class="breadcrumbs">');
            h.push('<div class="breadcrumbs-content" data-rel="tooltip" title="用户管理">用户管理</div>');
            h.push('</div>');
            h.push('<div class="col-xs-12">');
            h.push('<table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr><th>id</th><th>uid</th><th>uname</th><th>real_name</th><th>desc</th><th>status</th><th>role</th><th>操作</th></tr></thead><tbody>');
            _.each(lists, function(item, index) {
                h.push('<tr><td>' + item.id + '</td><td>' + item.uid + '</td><td>' + item.uname + '</td><td>' + item.real_name + '</td><td>' + item.remarks + '</td><td>' + item.status + '</td><td>' + self.getrolename(item.roles) + '</td>');
                h.push('<td><a class="btn btn-link data-edit">编辑</a></td>');
                h.push('</tr>');
            });
            h.push('</tbody></table></div>');
            return h.join('');
        },
        _edit: function(event) {
            var $editdiv = $(event.target),
                $td = $editdiv.parent(),
                role = $editdiv.attr('data-role');
            $td.append(this.options.selectElem);
            $td.find('option[value=' + role + ']').attr({
                'selected': 'selected'
            });
            $editdiv.addClass('hide');

            return false;
        },
        _changerole: function(event) {
            var $select = $(event.target),
                $td = $select.parent(),
                $editdiv = $td.find('div.table-cell-editable'),
                changedroleid = $select.children('option:selected').val();
            $editdiv.text(this.getrolename(changedroleid));
            $editdiv.attr({
                'data-role': changedroleid
            });
            $editdiv.removeClass('hide');
            $select.remove();
            $.ajax({
                url: this.options.updateRoles,
                data: {
                    app: 'flyflow',
                    uid: $editdiv.attr('data-uid'),
                    roles: changedroleid
                }
            }).done(function(data) {}).fail(function(data) {});
            return false;
        },
        getrolename: function(roleid) {
            switch (roleid) {
                case '1':
                    return '普通职员';
                    break;
                case '3':
                    return '数据管理员';
                    break;
                case '5':
                    return '产品线管理员';
                    break;
                case '0':
                default:
                    return '新用户';
            }
        }
    });
    module.exports = $.cs.userlist;
});
