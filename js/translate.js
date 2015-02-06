/**
 * @file translate.js
 * @author solopea@gmail.com
 */

var translate = {
    $elem: null,
    closeTimer: 0,

    template: [
        '<div class="mw-window">',
        '<div class="mw-window-header">',
        '<h2>{{word}}</h2>',
        '</div>',
        '<div class="mw-window-con">',
        '<div class="pronounce-list">',
        '<span class="pronounce">',
        '美',
        '<span class="phonetic">{{phonetic}}</span>',
        '<a class="mw-voice" data-rel="{{word}}&type=2" href="#"></a>',
        '</span>',
        '</div>',
        '<div class="translation">{{translation}}</div>',
        '</div>',
        '</div>'
    ].join(''),

    autoHandle: function () {
        var that = this;
        if (options.autoplay) {
            setTimeout(function () {
                that.playAudio();
            }, 500);
        }
        if (options.timetoclose != 0) {
            that.closeTimer = setTimeout(function () {
                that.remove();
            }, options.timetoclose);
        }
    },

    translate: function (text, selection, target, offset, cb) {
        var that = this;

        this.getTranslation(text, function (data) {
            var isCreated = that.refresh(text, data, offset, target);
            that.autoHandle();

            if (isCreated) {
                cb();
            }
        });
    },

    getTranslation: function (text, callback) {
        var that = this;
        var url = API.translate + text;

        $.get(url, function (data) {
            callback(data);
        });
    },

    calcPosition: function (pos) {
        var ret = $.extend({}, pos);
        var rate = window.devicePixelRatio;
        var fixTop = 40;

        if (utils.isMac) {
            rate = rate / 2;
            fixTop = 70;
        }

        ret.top = ret.top - fixTop;

        if (window.outerWidth < (ret.left + 366 * rate)) {
            ret.left = window.outerWidth - 400 * rate;
        }

        return {
            left: ret.left / rate,
            top: ret.top / rate

        };
    },

    refresh: function (text, data, pos, target) {
        this.remove();
        return this.create(text, data, pos, target);
    },

    create: function (text, data, pos, target) {
        if (!data.basic) {
            return false;
        }

        var data = {
            word: text,
            phonetic: data.basic['us-phonetic'],
            translation: data.basic.explains.join('<br />')

        };
        var html = utils.renderTemplate(this.template, data);

        var $elem = this.$elem = $(html);
        var topCtx = utils.getTopWin().document;
        var position = this.calcPosition(pos);

        $elem.css(position);

        $(topCtx.body).append($elem);

        return true;
    },

    remove: function () {
        clearTimeout(this.closeTimer);
        if (this.$elem) {
            this.$elem.remove();
            this.$elem = null;
        }
    },

    playAudio: function (elem) {
        elem = elem || this.$elem && this.$elem.find('.mw-voice');
        if (!elem) {
            return;
        }

        var $audio = $('#mw-audio');

        if (!$audio.length) {
            $audio = $('<audio id="mw-audio" style="display: none"></audio>');
            $audio.appendTo('body');
        }

        var audioElem = $audio.get(0);
        var voiceUrl = API.audio + $(elem).data('rel');

        $audio.attr('src', voiceUrl);

        audioElem.play();
    },

    bindEvents: function () {
        var that = this;

        // 点击外部关闭弹框
        $(document).on('click', function (e) {
            var $target = $(e.target);
            if (!$target.closest('.mw-window').length) {
                that.remove();
            }
        });

        $(document).on('mouseleave', '.mw-window', function (e) {
            that.remove();
        });

        // TODO: optional autoplay audio
        $(document).on('mouseover', '.mw-voice', function () {
            that.playAudio(this);
        });
    },

    init: function () {
        this.bindEvents();
    }

};
