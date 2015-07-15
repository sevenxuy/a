define(function(require, exports, module) {

    'use strict';

    $.widget('cs.notify', {
        options: {
            notifyWrapperElem: $('body'),
            tmpl: 'message', //sticky,warning,error
            title: '',
            text: '',
            expires: 3000,
            speed: 300,
            buttons: null
        },
        _create: function() {
            this.render();
            this._bindEvents();
        },
        render: function() {
            var h = [],
                options = this.options,
                notifyWrapperElem = options.notifyWrapperElem;
            if (!notifyWrapperElem.find(">:first-child").hasClass('notify-wrapper')) {
                notifyWrapperElem.prepend('<div class="notify-wrapper"></div>');
            }
            h.push('<div class="notify notify-' + options.tmpl + '">');
            if (options.title) {
                h.push('<div class="notify-header"><h1>' + options.title + '</h1><i class="ic-times"></i></div>');
            }
            h.push('<p>' + options.text + '</p>');
            h.push('</div>');
            this._notifyElem = $(h.join('')).hide().appendTo(notifyWrapperElem.find('>:first-child'));
            this._open();
        },
        _bindEvents: function() {
            this._on(this._notifyElem, {
                'tap': this.destroy
            });
        },

        /* ------------------------------------------------------------------------------
         * Common Event Handlers
         * ------------------------------------------------------------------------------*/
        _open: function() {
            var speed = this.options.speed;
            this._notifyElem.fadeIn(speed, 0).slideDown(speed, $.proxy(function() {
                this._notifyElem.show();
            }, this));
            if (this.options.tmpl == 'message') {
                this._onTimeout();
            }
            return false;
        },
        _onTimeout: function() {
            var self = this;
            setTimeout(function() {
                self.destroy();
            }, self.options.expires);
            return false;
        },
        /* ------------------------------------------------------------------------------
         *  Common APIs
         * ------------------------------------------------------------------------------*/
        destroy: function() {
            var speed = this.options.speed;
            this._notifyElem.fadeTo(speed, 0).slideUp(speed, $.proxy(function() {
                this._notifyElem.remove();
            }, this));
            return false;
        },
        hideNotifyWrapper: function() {
            var notifyWrapperElem = this.options.notifyWrapperElem;
            if (!notifyWrapperElem.find('>:first-child').hasClass('notify-wrapper')) {
                notifyWrapperElem.find('>:first-child').hide();
            }
        },
        showNotifyWrapper: function() {
            var notifyWrapperElem = this.options.notifyWrapperElem;
            if (!notifyWrapperElem.find(">:first-child").hasClass('notify-wrapper')) {
                this.options.notifyWrapperElem.find('>:first-child').show();
            }
        }
    });
    module.exports = $.cs.notify;
});
