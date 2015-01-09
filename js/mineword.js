/**
 * author: tomasy
 * email: solopea@gmail.com
 * date: 2014-12-06
 */

(function($, document) {
    var API = {
        translate: 'https://fanyi.youdao.com/openapi.do?' + 'keyfrom=mineword&key=1362458147&type=data&doctype=json&version=1.1&q=',
        audio: 'http://dict.youdao.com/dictvoice?audio='
    };

    // get user's options
    var options = {};
    chrome.storage.sync.get('options', function(data) {
        options = data.options || {};
    });

    var utils = {
        isMac: navigator.appVersion.indexOf('Mac') !== -1,

        renderTemplate: function(tpl, data) {
            return tpl.replace(/\{\{(\w+)\}\}/g, function(m, $1) {
                return data[$1] || '';
            });
        },

        getTopWin: function(win) {
            win = win || window;
            if (win.parent === win) {
                return win;
            }
            return utils.getTopWin(win.parent);
        }
    };

    var highlight = {
        hasWords: function() {
            var selection = window.getSelection();
            var frag = selection.getRangeAt(0).cloneContents();

            return !!frag.querySelector('.mw-highlight');
        },

        isHighlight: function(target) {
            var isHighlight = true;
            var $target = $(target);

            if (!target || $target.hasClass('mw-highlight') || $target.closest('.mw-highlight').length) {
                isHighlight = false;
            }

            return isHighlight;
        },

        refresh: function(target) {
            if (this.isHighlight(target)) {
                this.create();
            }
        },

        create: function() {
            var range = window.getSelection().getRangeAt(0);
            var selectionContents = range.extractContents();
            var span = document.createElement('em');

            span.appendChild(selectionContents);

            span.setAttribute('class', 'mw-highlight');
            span.setAttribute('title', 'Backspace键删除');
            span.style.backgroundColor = 'yellow';
            span.style.color = 'black';
            span.style.margin = '0 5px';

            range.insertNode(span);
        },

        remove: function() {
            var range = window.getSelection().getRangeAt(0);
            var emNode = window.getSelection().anchorNode.parentElement;
            var selectionContents = range.extractContents();

            if ($(emNode).hasClass('mw-highlight')) {
                emNode.remove();
            }
            range.insertNode(selectionContents);
        },

        bindEvents: function() {
            var that = this;
            $(document).on('keydown', function(e) {
                if (e.keyCode !== 8 || !window.getSelection().toString()) {
                    return;
                }

                var elem = window.getSelection().anchorNode.parentElement;
                if ($(elem).hasClass('mw-highlight')) {
                    that.remove();
                    e.preventDefault();
                    return false;
                }
            });
        },

        init: function() {
            this.bindEvents();
        }
    };

    highlight.init();

    var translate = {
        $elem: null,

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

        translate: function(text, selection, target, offset) {
            var that = this;

            this.getTranslation(text, function(data) {
                that.refresh(text, data, offset, target);
            });
        },

        getTranslation: function(text, callback) {
            var that = this;
            var url = API.translate + text;

            $.get(url, function(data) {
                callback(data);
            });
        },

        calcPosition: function(pos) {
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

        refresh: function(text, data, pos, target) {
            this.remove();
            this.create(text, data, pos, target);
        },

        create: function(text, data, pos, target) {
            if (!data.basic) {
                return;
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

            highlight.refresh(target);
        },

        remove: function() {
            if (this.$elem) {
                this.$elem.remove();
                this.$elem = null;
            }
        },

        playAudio: function(elem) {
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

        onDocumentMouseup: function(e) {
            var selection = window.getSelection();
            var text = selection.toString();
            var target = e.target;

            // 点击弹框内部不提示
            if ($(target).closest('.mw-window').length || !text) {
                return;
            }

            this.onSelect(e, text, selection, target);
        },

        onSelect: function(e, text, selection, target) {
            // save offset for toolbar
            if (highlight.hasWords()) {
                toolbar.offset = {
                    left: e.pageX,
                    top: e.pageY
                };
                return;
            }

            // translate
            this.translate(text, selection, target, {
                top: e.screenY,
                left: e.screenX
            });
        },

        // event handle for highlight word
        onDocumentMouseenter: function(elem, event) {
            var that = this;
            var $target = $(event.target);

            if (event.target === document) {
                return;
            }
            if (!$target.hasClass('mw-highlight') && $target.css('background-color') !== 'rgb(255, 255, 0)') {
                return;
            }

            var text = $target.text();

            if (!text) {
                return;
            }

            if (event.ctrlKey) {
                this.translate(text, elem, null, {
                    left: event.screenX,
                    top: event.screenY
                });
            } else {
                this.hoverHandle = function() {
                    that.translate(text, elem, null, {
                        left: event.screenX,
                        top: event.screenY
                    });
                }
            }
        },

        onDocumentMouseleave: function(event) {
            var $target = $(event.target);

            if (event.target === document) {
                return;
            }
            if ($target.hasClass('mw-highlight') ||
                $target.css('background-color') !== 'rgb(255, 255, 0)') {
                this.hoverHandle = null;
            }
        },

        onDocumentClick: function(e) {
            var $target = $(e.target);
            if (!$target.closest('.mw-window').length) {
                this.remove();
            }
        },
        
        bindEvents: function() {
            var that = this;
            // 选中翻译
            $(document).bind('mouseup', function(e) {
                that.onDocumentMouseup(e);
            });

            // ctrl翻译
            $(document).on('keydown', function(e) {
                if (e.ctrlKey && that.hoverHandle) {
                    that.hoverHandle();
                }
            });

            document.addEventListener('mouseenter', function(event) {
                that.onDocumentMouseenter(this, event);
            }, true);

            document.addEventListener('mouseleave', function(event) {
                that.onDocumentMouseleave(this, event);
            }, true);

            // 点击外部关闭弹框
            $(document).on('click', function(e) {
                that.onDocumentClick(e)
            });

            $(document).on('mouseleave', '.mw-window', function(e) {
                that.remove();
            });

            // TODO: optional autoplay audio
            $(document).on('mouseover', '.mw-voice', function() {
                that.playAudio(this);
            });
        },

        init: function() {
            this.bindEvents();
        }
    };

    translate.init();

    function getWords() {
        var selection = window.getSelection();
        var frag = selection.getRangeAt(0).cloneContents();

        if (!frag) {
            return;
        }

        var wordElems = frag.querySelectorAll('.mw-highlight');
        var words = [];

        for (var i = 0, len = wordElems.length; i < len; i++) {
            words.push(wordElems[i].textContent);
        }

        return words;
    }

    var toolbar = {
        $elem: null,

        offset: null,

        template: [
            '<div class="mw-toolbar">',
            '<a class="mw-tool-iterm" href="mailto:{{email}}?subject={{subject}}">Mail</a>',
            '</div>'
        ].join(''),

        refresh: function(offset) {
            this.remove();
            this.create(offset);
        },

        create: function(offset) {
            var data = {
                email: options.email,
                subject: 'mineword: ' + getWords().join(', ')
            };
            var html = utils.renderTemplate(this.template, data);

            this.$elem = $(html).css({
                left: offset.left,
                top: offset.top - 40,
            });

            var that = this;

            $('body').append(this.$elem);
        },

        remove: function() {
            if (this.$elem) {
                this.$elem.remove();
                this.$elem = null;
            }
        },

        onCopy: function(event) {
            if (highlight.hasWords() && this.offset) {
                this.refresh(this.offset);
            }
        },

        onDocumentClick: function(e) {
            var $target = $(e.target);
            if (!$target.closest('.mw-toolbar').length) {
                this.remove();
            }
        },

        bindEvents: function() {
            var that = this;

            $(document).on('copy', function(event) {
                that.onCopy(event);
            });

            $(document).on('click', function(event) {
                that.onDocumentClick(event);
            });
        },

        init: function() {
            this.bindEvents();
        }
    };

    toolbar.init();
})(jQuery, document);
