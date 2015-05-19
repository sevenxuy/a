define(function(require, exports, module) {

  'use strict';
  var _util = require('cs.util');

  $.widget('cs.pagingbar', {
    options: {
      // wrapperElem
      limitlist: [30, 50, 100]
    },
    _create: function() {
      this.render();
      this._bindEvents();
    },
    render: function() {
      this._pagingbarElem = $(this.createPagingbarElem()).appendTo(this.options.wrapperElem);
      this.updateStatus();
    },
    createPagingbarElem: function() {
      var options = this.options,
        h = [];
      h.push('<div class="ui-pager-control" role="group">');
      h.push('<table cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;" class="ui-pg-table"><tbody><tr>');
      h.push('<td class="ui-pg-button ui-corner-all first_page" style="cursor: default;"><span class="ui-icon ace-icon fa fa-angle-double-left bigger-140"></span></td>');
      h.push('<td class="ui-pg-button ui-corner-all prev_page" style="cursor: default;"><span class="ui-icon ace-icon fa fa-angle-left bigger-140"></span></td>');
      h.push('<td class="ui-pg-button ui-state-disabled" style="width: 4px; cursor: default;"><span class="ui-separator"></span></td>');
      h.push('<td dir="ltr">Page');
      h.push('<input class="ui-pg-input page-offset" type="text" size="3" maxlength="7" value="" role="textbox"> of <span class="page-total"></span></td>');
      h.push('<td class="ui-pg-button ui-state-disabled" style="width:4px;"><span class="ui-separator"></span></td>');
      h.push('<td class="ui-pg-button ui-corner-all next_page" style="cursor: default;"><span class="ui-icon ace-icon fa fa-angle-right bigger-140"></span></td>');
      h.push('<td class="ui-pg-button ui-corner-all last_page" style="cursor: default;"><span class="ui-icon ace-icon fa fa-angle-double-right bigger-140"></span></td>');
      h.push('<td dir="ltr">');
      h.push(_util.createSelectElem({
        selectClass: 'page-limit',
        data: options.limitlist,
        selected: options.limit
      }))
      h.push('</td>');
      h.push('</tr></tbody></table>');
      h.push('</div>');
      return h.join('');
    },
    updateStatus: function() {
      console.log(this.options.limit);
      var options = this.options,
        offset = options.offset,
        $first = this._pagingbarElem.find('td.first_page'),
        $prev = this._pagingbarElem.find('td.prev_page'),
        $next = this._pagingbarElem.find('td.next_page'),
        $last = this._pagingbarElem.find('td.last_page'),
        $offset = this._pagingbarElem.find('input.page-offset'),
        $limit = this._pagingbarElem.find('select.page-limit'),
        $total = this._pagingbarElem.find('span.page-total');
      if (offset == 0) {
        if (!$first.hasClass('ui-state-disabled')) {
          $first.addClass('ui-state-disabled');
        }
        if (!$prev.hasClass('ui-state-disabled')) {
          $prev.addClass('ui-state-disabled');
        }
      }
      if (offset == options.totalpages - 1) {
        if (!$next.hasClass('ui-state-disabled')) {
          $next.addClass('ui-state-disabled');
        }
        if (!$last.hasClass('ui-state-disabled')) {
          $last.addClass('ui-state-disabled');
        }
      }

      options.totalpages = Math.ceil(options.total / options.limit);
      $offset.val(parseInt(options.offset, 10) + 1);
      $limit.val(options.limit);
      $total.text(options.totalpages);
    },
    _bindEvents: function() {
      this._on(this._pagingbarElem, {
        'change input.page-offset': this._goPageByChange,
        'change select.page-limit': this._goPageByChange,
        'click td.ui-pg-button': this._goPageByNav
      });
    },
    _goPageByChange: function(event) {
      var options = this.options,
        offset, limit, router = new Backbone.Router;
      if ($(event.target).hasClass('page-offset')) {
        offset = parseInt($(event.target).val().trim(), 10) - 1;
        if (offset > -1 && offset < options.totalpages) {
          options.offset = offset;
        } else {
          return false;
        }
      } else {
        limit = parseInt($(event.target).val(), 10);
        options.limit = limit;
        options.offset = 0;
        options.totalpages = Math.ceil(options.total / options.limit);
        console.log(options.limit);
      }
      router.navigate('log/' + options.limit + '/' + options.offset, {
        trigger: true
      });
      return false;
    },
    _goPageByNav: function(event) {
      var options = this.options,
        $td = $(event.target).closest('td'),
        router = new Backbone.Router;
      if ($td.hasClass('first_page')) {
        options.offset = 0;
      } else if ($td.hasClass('prev_page')) {
        options.offset = parseInt(options.offset, 10) - 1;
      } else if ($td.hasClass('next_page')) {
        options.offset = parseInt(options.offset, 10) + 1;
      } else if ($td.hasClass('last_page')) {
        options.offset = options.totalpages - 1;
      } else {
        return false;
      }
      router.navigate('log/' + options.limit + '/' + options.offset, {
        trigger: true
      });
      return false;
    }
  });
  module.exports = $.cs.pagingbar;
});
