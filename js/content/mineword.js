/**
 * @file mineword.js
 * @author: tomasy
 * @email: solopea@gmail.com
 * @date: 2014-12-06
 */

var $p = $({});

var MineWord = {
    removeLast: function () {
        var id = Word.removeLast();
        if (id) {
            highlight.remove(id);
        }
    },

    remove: function (id) {
        Word.remove(id);
        highlight.remove(id);
    },

    handleTextSelected: function (e) {
        var selection = window.getSelection();
        var text = selection.toString();
        var target = e.target;

        // 点击弹框内部不提示
        if ($(target).closest('.mw-window').length || !text) {
            return;
        }

        this.select(e, text, selection, target);
    },

    select: function (e, text, selection, target) {
        // save offset for toolbar
        var toolbarOffset = {
            left: e.pageX,
            top: e.pageY

        };
        if (highlight.hasWords()) {
            toolbar.offset = toolbarOffset;
            return;
        }

        // translate
        var translateOffset = {
            top: e.screenY,
            left: e.screenX

        };

        translate.translate(text, selection, target, translateOffset, function () {
            $p.trigger('select', [
                text,
                target
            ]);
        });
    },
    // event handle for highlight word
    onDocumentMouseenter: function (elem, event) {
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
            translate.translate(text, elem, null, {
                left: event.screenX,
                top: event.screenY

            });
        }
        else {
            this.hoverHandle = function () {
                translate.translate(text, elem, null, {
                    left: event.screenX,
                    top: event.screenY

                });
            };
        }
    },

    onDocumentMouseleave: function (event) {
        var $target = $(event.target);

        if (event.target === document) {
            return;
        }
        if ($target.hasClass('mw-highlight') || $target.css('background-color') !== 'rgb(255, 255, 0)') {
            this.hoverHandle = null;
        }
    },
    bindEvents: function () {
        var that = this;

        // 选中翻译
        $(document).bind('mouseup', function (e) {
            that.handleTextSelected(e);
        });

        $p.on('select', function (e, wordText, elem) {
            var word = Word.create(wordText);
            var wrapElem = highlight.refresh(elem, word);

            utils.selectText(wrapElem);
        });
        // ctrl翻译
        $(document).on('keydown', function (e) {
            if (e.ctrlKey && that.hoverHandle) {
                that.hoverHandle();
            }
        });

        document.addEventListener('mouseenter', function (event) {
            that.onDocumentMouseenter(this, event);
        }, true);

        document.addEventListener('mouseleave', function (event) {
            that.onDocumentMouseleave(this, event);
        }, true);

        $(document).on('keydown', function (e) {
            // ctrl + z to remove last word's highlight
            if (e.keyCode === 90 && e.ctrlKey) {
                that.removeLast();
                return;
            }

            if (e.keyCode !== 8 || !window.getSelection().toString()) {
                return;
            }

            var elem = window.getSelection().anchorNode.parentElement;
            if ($(elem).hasClass('mw-highlight')) {
                that.remove($(elem).data('id'));

                e.preventDefault();
                return false;
            }
        });
    },

    init: function () {
        translate.init();
        toolbar.init();
        this.bindEvents();
    }

};

var host = window.location.hostname;

chrome.storage.sync.get('disurls', function (data) {
    var isAbled = true;
    var disurls = data.disurls;

    if (!disurls || !disurls.length) {
        MineWord.init();
        return;
    }

    disurls.forEach(function (v, k) {
        if (v.indexOf(host) != -1) {
            isAbled = false;
            return false;
        }
    });

    if (isAbled) {
        MineWord.init();
    }
});
