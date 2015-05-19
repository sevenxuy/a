define(function(require, exports, module) {
  'use strict';
  $.widget('cs.category', {
    options: {
      //getcatelistUrl: '/udata/mis/getcatelist?app=flyflow',
      getcatelistUrl: '../../data/getcatelist.json',
      // saveCateUrl: '/udata/mis/saveCate',
      saveCateUrl: '../../data/saveCate.json',
      // delCateUrl : '/udata/mis/delCate',
      delCateUrl: '../../data/delCate.json'
    },
    _create: function() {
      this.render(this.options.getcatelistUrl);
      this._bindEvents();
    },
    render: function(getcatelistUrl) {
      var self = this;
      $.ajax(getcatelistUrl).done(
        function(data) {
          var lists = data.data,
            h = [];
          h.push('<table class="table table-bordered table-hover category-table"><thead class="thin-border-bottom"><tr><th></th><th>id</th><th>name</th><th>code</th><th>operation</th></tr></thead>');
          _.each(lists, function(item, index) {
            h.push('<tr class="category-item" cate_id="' + item.id + '" depth="' + item.depth + '"><td><i class="fa category-closed"></i></td><td>' + item.id + '</td><td><div class="table-cell-editable category-name" value="' + item.name + '">' + item.name + '</div></td><td><div class="table-cell-editable category-code" value="' + item.code + '">' + item.code + '</div></td><td><i class="fa fa-minus-circle category-remove ');
            if (!_.isEmpty(item.list)) {
              h.push('hide');
            }
            h.push('"></i></td></tr>');
            if (!_.isEmpty(item.list)) {
              _.each(item.list, function(subitem, index) {
                h.push('<tr parent_id="' + item.id + '" cate_id="' + subitem.id + '" depth="' + subitem.depth + '" class="hide"><td>L</td><td>' + subitem.id + '</td><td><div class="table-cell-editable category-name" value="' + subitem.name + '">' + subitem.name + '</div></td><td><div class="table-cell-editable category-code" value="' + subitem.code + '">' + subitem.code + '</div></td><td><i class="fa fa-minus-circle category-remove"></i></td></tr>');
              });
            }
            h.push('<tr parent_id="' + item.id + '" depth="1" class="category-addsubitem hide"><td>L</td><td colspan=4><i class="fa fa-plus-circle category-add"></i></td></tr>')
          });
          h.push('<tr class="category-additem" parent_id="0" depth="0"><td colspan=5><i class="fa fa-plus-circle category-add"></i></td><tr>');
          self.element.append(h.join(''));
        });
    },
    _bindEvents: function() {
      this._on(this.element, {
        'dblclick div.table-cell-editable': this._edit,
        'keyup textarea': this._autosize,
        'blur textarea': this._savetext,
        'click i.category-closed': this._openitem,
        'click i.category-open': this._closeitem,
        'click i.category-add': this._additem,
        'click i.category-remove': this._delitem
      });
    },
    _edit: function(event) {
      var $editdiv = $(event.target),
        $td = $editdiv.parent();
      $td.append('<textarea>' + $editdiv.attr('value') + '</textarea>');
      $editdiv.addClass('hide');
      return false;
    },
    _autosize: function(event) {
      //TODO
      return false;
    },
    _savetext: function(event) {
      var self = this,
        $textarea = $(event.target),
        $td = $textarea.closest('td'),
        $tr = $td.closest('tr'),
        $editdiv = $td.find('div.table-cell-editable').removeClass('hide'),
        val = $textarea.val().replace(' ', '');
      $editdiv.attr({
        'value': val
      });
      $editdiv.text(val);
      $textarea.remove();

      if ($tr.hasClass('category-newitem')) {
        var name = $tr.find('div.category-name').attr('value'),
          code = $tr.find('div.category-code').attr('value'),
          $idcell = $tr.find('td:eq(1)');
        if ((!!name) && (!!code)) {
          $idcell.html('<i class="fa fa-spinner fa-spin"></i>');
          $.ajax({
            url: self.options.saveCateUrl,
            data: {
              app: 'flyflow',
              id: '',
              pid: $tr.attr('parent_id'),
              name: name,
              cate: code,
              inner_data: 0,
              depth: $tr.attr('depth')
            }
          }).done(function(data) {
            var id = data.data.id;
            $idcell.html(id);
            $tr.attr({
              'cate_id': id
            });

            $tr.removeClass('category-newitem');


            if ($tr.attr('depth') == 0) {
              var $newitem = $('<tr parent_id="' + id + '" depth="1" class="category-addsubitem"><td>L</td><td colspan="4"><i class="fa fa-plus-circle category-add"></i></td></tr>');
              $newitem.insertAfter($tr);
            } else {
              // self.element.find('tr[cate_id=]'+$tr.attr('parent_id'))
            }

          }).fail(function(data) {
            //fail notify
          });
        }
      } else {
        var name = $tr.find('div.category-name').attr('value'),
          code = $tr.find('div.category-code').attr('value');
        $.ajax({
          url: self.options.saveCateUrl,
          data: {
            app: 'flyflow',
            id: $tr.attr('cate_id'),
            pid: $tr.attr('parent_id'),
            name: name,
            cate: code,
            inner_data: 0,
            depth: $tr.attr('depth')
          }
        }).fail(function(data) {
          //only fail notify
        });
      }

      return false;
    },
    _openitem: function(event) {
      var $i = $(event.target),
        $tr = $i.closest('tr');
      $i.addClass('category-open');
      $tr.parent().find('tr[parent_id=' + $tr.attr('cate_id') + ']').removeClass('hide');
      return false;
    },
    _closeitem: function(event) {
      var $i = $(event.target),
        $tr = $i.closest('tr');
      $i.removeClass('category-open');
      $tr.parent().find('tr[parent_id=' + $tr.attr('cate_id') + ']').addClass('hide');
      return false;
    },
    _additem: function(event) {
      var $tr = $(event.target).closest('tr'),
        $newitem;
      if ($tr.hasClass('category-additem')) {
        $newitem = $('<tr class="category-item category-newitem" parent_id="' + $tr.attr('parent_id') + '" depth="' + $tr.attr('depth') + '"><td><i class="fa category-closed category-open"></i></td><td></td><td><div class="table-cell-editable category-name hide" value=""></div><textarea></textarea></td><td><div class="table-cell-editable category-code hide" value=""></div><textarea></textarea></td><td><i class="fa fa-minus-circle category-remove"></i></td></tr>');
      } else if ($tr.hasClass('category-addsubitem')) {
        $newitem = $('<tr class="category-newitem" parent_id="' + $tr.attr('parent_id') + '" depth="' + $tr.attr('depth') + '"><td>L</td><td></td><td><div class="table-cell-editable category-name hide" value=""></div><textarea></textarea></td><td><div class="table-cell-editable category-code hide" value=""></div><textarea></textarea></td><td><i class="fa fa-minus-circle category-remove"></i></td></tr>');
      }
      $newitem.insertBefore($tr);
      return false;
    },
    _delitem: function(event) {
      var self = this,
        $tr = $(event.target).closest('tr');
      //if new item, delete directly.
      if ($tr.hasClass('category-newitem')) {
        $tr.remove();
      } else {
        $.ajax({
          url: self.options.delCateUrl,
          data: {
            app: 'flyflow',
            cate_id: $tr.attr('cate_id'),
            parent_id: $tr.attr('parent_id')
          }
        }).done(function(data) {
          var depth = $tr.attr('depth');
          if (depth == 0) {
            //if depth=0, delete add icon too.
            self.element.find('tr[parent_id=' + $tr.attr('cate_id') + ']').remove();
          } else if ((depth == 1) && (self.element.find('tr[parent_id=' + $tr.attr('parent_id') + ']').length == 2)) {
            //if depth=1 and has no siblings, show del icon on parent.
            self.element.find('tr[cate_id=' + $tr.attr('parent_id') + ']').find('i.category-remove').removeClass('hide');
          }
          $tr.remove();
        }).fail(function(data) {
          //fail notity
        });
      }
      return false;
    }
  });
  module.exports = $.cs.category;
});
