define(function(require, exports, module) {

    'use strict';

    var notify = require('cs.plugin.notify');

    $.widget('cs.pagingbar', {
        options: {
            limit: 60,
            totalpages: 10,
            pn: 1,
            routerstr: ''
        },
        _create: function() {
            this.render();
            this._bindEvents();
            this.element.data('widgetCreated', true);
        },
        render: function() {
            this._createPagingWrapperElem();
        },
        reRender: function(opt) {
            var options = this.options;
            _.extend(options, opt);
            this._updatePagingStatus();
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click div.page_pre': this._preGoSiblingPage,
                'click div.page_next': this._preGoSiblingPage,
                'click div.page_go': this._preGoSiblingPage,
                'keypress input': this._preGoPage
            });
        },
        _createPagingWrapperElem: function() {
            var options = this.options,
                h = [];
            h.push('<div class="paging">');
            h.push('<div class="page-btn-white page_pre hide">&lt;</div>');
            h.push('<div class="page_num"><span class="page_current"></span>');
            h.push('<span class="num_gap">/</span>');
            h.push('<span class="page_total"></span>');
            h.push('</div>');
            h.push('<div class="page-btn-white page_next hide">&gt;</div>');
            h.push('<input type="text" class="form-control goto_page">');
            h.push('<div class="page-btn-white page_go">跳转</div>');
            h.push('</div>');
            this.element.append(h.join(''));
            this._updatePagingStatus();
        },
        _updatePagingStatus: function() {
            var options = this.options,
                pn = parseInt(options.pn, 10),
                totalpages = options.totalpages,
                $paging = this.element.find('div.paging:eq(0)');
            if (totalpages > 1) {
                var $pre = $paging.children('div.page_pre:eq(0)'),
                    $next = $paging.children('div.page_next:eq(0)'),
                    $cur = $paging.find('span.page_current:eq(0)'),
                    $total = $paging.find('span.page_total:eq(0)');
                if ((pn == 1) && (!$pre.hasClass('hide'))) {
                    $pre.addClass('hide');
                } else if ((pn > 1) && $pre.hasClass('hide')) {
                    $pre.removeClass('hide');
                }
                if ((pn == totalpages) && (!$next.hasClass('hide'))) {
                    $next.addClass('hide');
                } else if ((pn < totalpages) && $next.hasClass('hide')) {
                    $next.removeClass('hide');
                }
                $cur.text(pn);
                $total.text(totalpages);
                if ($paging.hasClass('hide')) {
                    $paging.removeClass('hide');
                }
            } else if (!$paging.hasClass('hide')) {
                $paging.addClass('hide');
            }
            return false;
        },
        _preGoSiblingPage: function(event) {
            var options = this.options,
                pn = parseInt(options.pn, 10),
                totalpages = options.totalpages,
                $btn = $(event.target),
                $paging = this.element.find('div.paging:eq(0)'),
                $pre = $paging.children('div.page_pre:eq(0)'),
                $next = $paging.children('div.page_next:eq(0)'),
                $cur = $paging.find('span.page_current:eq(0)');
            if ($btn.hasClass('page_pre')) {
                pn = pn - 1;
            } else if ($btn.hasClass('page_next')) {
                pn = pn + 1;
            } else if ($btn.hasClass('page_go')) {
                var $input = $paging.find('input.goto_page'),
                    page = $input.val().trim();
                if (parseInt(page, 10) && page > 0 && page < totalpages + 1) {
                    pn = page;
                } else {
                    notify({
                        tmpl: 'warning',
                        text: '请输入正确的页码。'
                    });
                    $input.val('');
                    return false;
                }
            }
            if (pn > 0) {
                this._goSiblingPage(options.routerstr, pn);
            }
            return false;
        },
        _goSiblingPage: function(routerstr, pn) {
            var router = new Backbone.Router;
            router.navigate(routerstr + '/' + pn, {
                trigger: true
            });
            return false;
        },
        _preGoPage: function(event) {
            var code = event.keyCode || event.which;
            if (code == 13) {
                $('div.page_go').trigger('click');
            }
        }
    });
    module.exports = $.cs.pagingbar;
});
