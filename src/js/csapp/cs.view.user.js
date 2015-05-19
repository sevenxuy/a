define(function(require, exports, module) {
  'use strict';
  var _util = require('cs.util');

  $.widget('cs.user', {
    options: {
      // getuserlistUrl: '/udata/mis/getuserlist?app=flyflow',
      getuserlistUrl: '../../data/getuserlist.json',
      // updateRolesUrl: '/udata/mis/updateRoles',
      updateRolesUrl: '../../data/updateRoles.json',
      selectData: {
        '0': '新用户',
        '1': '普通职员',
        '3': '数据管理员',
        '5': '产品线管理员'
      }
    },
    _create: function() {
      this.render(this.options.getuserlistUrl);
      this._bindEvents();
      this.options.selectElem = _util.createSelectElem({
        data: this.options.selectData,
        selectClass: 'user-role'
      });
    },
    render: function(getuserlistUrl) {
      var self = this;
      $.ajax(getuserlistUrl).done(
        function(data) {
          var lists = data.data,
            h = [];
          h.push('<table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr><th>uid</th><th>uname</th><th>real_name</th><th>desc</th><th>operation</th></tr></thead>');
          _.each(lists, function(item, index) {
            var role;
            h.push('<tr><td>' + item.uid + '</td><td>' + item.uname + '</td><td>' + item.real_name + '</td><td>' + item.remarks + '</td><td>');
            h.push('<div class="table-cell-editable" data-role="' + item.roles + '" data-uid="' + item.uid + '">' + self.getrolename(item.roles) + '</div>');
            h.push('</td></tr>');
          });
          self.element.append(h.join(''));
        });
    },
    _bindEvents: function() {
      this._on(this.element, {
        'dblclick div.table-cell-editable': this._edit,
        'change select.user-role': this._changerole
      });
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
        url: this.options.updateRolesUrl,
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
        default:
          return '新用户';
      }
    }
  });
  module.exports = $.cs.user;
});
