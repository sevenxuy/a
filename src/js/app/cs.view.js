define(function(require, exports, module) {
    'use strict';
    $.widget('cs.view', {
        options: {},
        _create: function() {
            this.render();
            this._bindEvents();
        },
        _bindEvents: function() {
            this._on(this.element, {
                'click button.upload-img-btn': this._uploadFile,
                'change input[type=file]': this._uploadImage,
                'change textarea.upload-img-tx': this._previewImg
            });
        },
        _uploadFile: function(event) {
            $(event.target).parent().children('input.module-image-upload').eq(0).trigger('click');
        },
        _uploadImage: function(event) {
            var options = this.options,
                data = new FormData(),
                img = event.target.files[0],
                $tx = $(event.target).parent().children('textarea.upload-img-tx').eq(0);
            if (img.type.match('image.*') && img.name.toLowerCase().match(/(?:gif|jpg|png|jpeg)$/)) {
                data.append('file', event.target.files[0]);
                $.ajax({
                    url: options.uploadfile,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST'
                }).done(function(data) {
                    var newsrc = data.data;
                    $tx.val(newsrc).removeClass('hide').trigger('change');
                    autosize($tx);
                }).fail(function() {});
            } else {
                notify({
                    text: '请检查图片格式，只能上传png, jpeg, gif格式的图片。'
                });
            }
            return false;
        },
        _previewImg: function(event) {
            var $preview = $(event.target).closest('div.upload-img-box').children('div.upload-img-preivew').eq(0),
                imgsrc = $(event.target).val().trim();
            if (!!imgsrc) {
                if (imgsrc.toLowerCase().match(/(?:gif|jpg|png|jpeg)$/)) {
                    $preview.empty().append('<img src ="' + imgsrc + '">').removeClass('hide');
                } else {
                    notify({
                        text: '请检查图片格式，只能上传png, jpeg, gif格式的图片。'
                    });
                }
            } else {
                $preview.empty().addClass('hide');
            }
            return false;
        }
    });
    module.exports = $.cs.view;
});
