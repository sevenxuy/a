define(function(require, exports, module) {
  'use strict';
  var _util = require('cs.util');

  $.widget('cs.log', {
    options: {
      // userlogget: '../../datacms/userlogget.json', //for test
      userlogget: '/ucms/cms/userlogget',
      limitlist: [30, 50, 100]
    },
    _create: function() {
      this.render();
      this._bindEvents();
      $(window).resize();
      this.element.data('widgetCreated', true);
    },
    render: function() {
      var self = this,
        options = this.options;
      $.ajax({
        url: options.userlogget,
        data: {
          limit: options.limit,
          offset: parseInt(options.limit, 10) * parseInt(options.pageid, 10)
        }
      }).done(function(data) {
        var data = data.data;
        options.log_total = data.log_total;
        options.totalpages = Math.ceil(options.log_total / options.limit);
        self.element.append(self._createLogElem(data.log_list));
        self.updatePagingStatus();
      }).fail(function(response) {});
      if (this.element.hasClass('hide')) {
        this.element.removeClass('hide').addClass('current');
      }
    },
    reRender: function() {
      this.element.addClass('hide').empty();
      this.render();
      this.element.removeClass('hide').addClass('current');
    },
    _createLogElem: function(data) {
      var h = [],
        options = this.options;
      h.push('<div class="breadcrumbs">');
      h.push('<div class="breadcrumbs-content" data-rel="tooltip">Log</div>');
      h.push('</div>');
      h.push('<div class="col-xs-12"><table class="table table-bordered"><thead class="thin-border-bottom">');
      h.push('<tr><th>uname</th><th>real_name</th><th>level</th><th>log_type</th><th>module</th><th>data</th><th>update_time</th></tr>');
      h.push('<thead><tbody>');
      _.each(data, function(item, index) {
        h.push('<tr><td>' + item.uname + '</td><td>' + item.real_name + '</td><td>' + item.level + '</td><td>' + item.log_type + '</td><td>' + item.module + '</td><td>' + item.data + '</td><td>' + item.update_time + '</td></tr>');
      });
      h.push('</tbody></table>');
      h.push('<div id="pg_grid-pager" class="ui-pager-control" role="group">');
      h.push('<table cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;" class="ui-pg-table"><tbody><tr>');
      h.push('<td id="first_logpg" class="ui-pg-button ui-corner-all first_logpg" style="cursor: default;"><span class="ui-icon ace-icon fa fa-angle-double-left bigger-140"></span></td>');
      h.push('<td id="prev_logpg" class="ui-pg-button ui-corner-all prev_logpg" style="cursor: default;"><span class="ui-icon ace-icon fa fa-angle-left bigger-140"></span></td>');
      h.push('<td class="ui-pg-button ui-state-disabled" style="width: 4px; cursor: default;"><span class="ui-separator"></span></td>');
      h.push('<td dir="ltr">Page');
      h.push('<input class="ui-pg-input log-pageid" type="text" size="3" maxlength="7" value="' + (parseInt(options.pageid, 10) + 1) + '" role="textbox"> of <span id="sp_1_logpg">' + options.totalpages + '</span></td>');
      h.push('<td class="ui-pg-button ui-state-disabled" style="width:4px;"><span class="ui-separator"></span></td>');
      h.push('<td id="next_logpg" class="ui-pg-button ui-corner-all next_logpg" style="cursor: default;"><span class="ui-icon ace-icon fa fa-angle-right bigger-140"></span></td>');
      h.push('<td id="last_logpg" class="ui-pg-button ui-corner-all last_logpg" style="cursor: default;"><span class="ui-icon ace-icon fa fa-angle-double-right bigger-140"></span></td>');
      h.push('<td dir="ltr">');
      h.push(_util.createSelectElem({
        selectClass: 'log-limit',
        data: options.limitlist,
        selected: options.limit
      }))
      h.push('</td>');
      h.push('</tr></tbody></table>');
      h.push('</div>');
      h.push('</div>');
      return h.join('');
    },
    updatePagingStatus: function() {
      var options = this.options,
        pageid = options.pageid,
        $first = $('#first_logpg'),
        $prev = $('#prev_logpg'),
        $next = $('#next_logpg'),
        $last = $('#last_logpg');
      if (pageid == 0) {
        if (!$first.hasClass('ui-state-disabled')) {
          $first.addClass('ui-state-disabled');
        }
        if (!$prev.hasClass('ui-state-disabled')) {
          $prev.addClass('ui-state-disabled');
        }
      }
      if (pageid == options.totalpages - 1) {
        if (!$next.hasClass('ui-state-disabled')) {
          $next.addClass('ui-state-disabled');
        }
        if (!$last.hasClass('ui-state-disabled')) {
          $last.addClass('ui-state-disabled');
        }
      }
    },
    _bindEvents: function() {
      this._on(this.element, {
        'change input.log-pageid': this._getlog,
        'change select.log-limit': this._getlog,
        'click td.ui-pg-button': this._goPage
      });
    },
    _getlog: function(event) {
      var options = this.options,
        pageid, limit, router = new Backbone.Router;
      if ($(event.target).hasClass('log-pageid')) {
        pageid = parseInt($(event.target).val().trim(), 10) - 1;
        if (pageid > -1 && pageid < options.totalpages) {
          options.pageid = pageid;
        } else {
          return false;
        }
      } else {
        limit = parseInt($(event.target).val(), 10);
        options.limit = limit;
        options.pageid = 0;
      }
      router.navigate('log/' + options.limit + '/' + options.pageid, {
        trigger: true
      });
      return false;
    },
    _goPage: function(event) {
      var options = this.options,
        $td = $(event.target).closest('td'),
        router = new Backbone.Router;
      if ($td.hasClass('first_logpg')) {
        options.pageid = 0;
      } else if ($td.hasClass('prev_logpg')) {
        options.pageid = parseInt(options.pageid, 10) - 1;
      } else if ($td.hasClass('next_logpg')) {
        options.pageid = parseInt(options.pageid, 10) + 1;
      } else if ($td.hasClass('last_logpg')) {
        options.pageid = options.totalpages - 1;
      } else {
        return false;
      }
      router.navigate('log/' + options.limit + '/' + options.pageid, {
        trigger: true
      });
      return false;
    }
  });
  module.exports = $.cs.log;
});
