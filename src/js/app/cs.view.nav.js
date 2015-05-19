define(function(require, exports, module) {
  'use strict';
  require('cs.view.module');
  require('cs.view.schema');

  var _util = require('cs.util');

  $.widget('cs.nav', {
    options: {
      // modulegetlist: '../../datacms/modulegetlist.json' //for test
      modulegetlist: '/ucms/cms/modulegetlist'
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
      // nav-list will be renderred at server in smarty, rather than json at client.
      $.ajax({
        url: options.modulegetlist,
      }).done(
        function(data) {
          var lists = data.data,
            h = [];
          _.each(lists, function(item, index) {
            h.push('<li class="menu-item" data-id="' + item.id + '" data-m_code="' + item.m_code + '">');
            h.push('<a class="dropdown-toggle"><i class="menu-icon fa fa-list"></i><div class="menu-text"><div>' + item.m_name + '</div><div class="menu-code">' + item.m_code + '</div></div><b class="arrow fa fa-angle-down"></b></a>');
            h.push('<b class="arrow"></b>');
            h.push('<ul class="submenu">');
            h.push('<li class="submenu-item gotoDataList" data-id="' + item.id + '" data-m_code="' + item.m_code + '">');
            h.push('<a><i class="menu-icon fa fa-caret-right"></i><div><div>Module Data</div></div></a>');
            h.push('<b class="arrow"></b></li>');
            h.push('<li class="submenu-item gotoSchemaList" data-id="' + item.id + '" data-m_code="' + item.m_code + '">');
            h.push('<a><i class="menu-icon fa fa-caret-right"></i><div><div>Schema Pool</div></div></a>');
            h.push('<b class="arrow"></b></li>');
            h.push('</ul>');
            h.push('</li>');
          });
          self.element.append(h.join(''));
        });
    },
    _bindEvents: function() {
      this._on(this.element, {
        'click li.submenu-item': this._gotoPagelist
      });
    },
    _gotoPagelist: function(event) {
      $('li.active').each(function(index) {
        $(this).removeClass('active');
      });
      var $li = $(event.target).closest('li.submenu-item'),
        m_code = $li.attr('data-m_code'),
        opt = {
          m_code: m_code
        };
      $li.addClass('active');
      $li.closest('li.menu-item').addClass('active');
      var router = new Backbone.Router;
      if ($li.hasClass('gotoDataList')) {
        router.navigate(m_code + '/module/', {
          trigger: true
        });
      } else if ($li.hasClass('gotoSchemaList')) {
        router.navigate(m_code + '/schema/', {
          trigger: true
        });
      }
      return false;
    }
  });
  module.exports = $.cs.nav;
});
