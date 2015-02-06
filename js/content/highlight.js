/**
 * @file highlightjs
 * @author solopea@gmail.com
 */

var highlight = {
    hasWords: function () {
        var selection = window.getSelection();
        var frag = selection.getRangeAt(0).cloneContents();

        return !!frag.querySelector('.mw-highlight');
    },

    isHighlight: function (target) {
        var isHighlight = true;
        var $target = $(target);

        if (!target || $target.hasClass('mw-highlight') || $target.closest('.mw-highlight').length) {
            isHighlight = false;
        }

        return isHighlight;
    },

    refresh: function (target, word) {
        if (this.isHighlight(target)) {
            return this.create(word);
        }

        return $(target).closest('.mw-highlight').get(0);
    },

    create: function (word) {
        var range = window.getSelection().getRangeAt(0);
        var selectionContents = range.extractContents();
        var elem = document.createElement('em');

        elem.appendChild(selectionContents);

        elem.setAttribute('class', 'mw-highlight');
        elem.setAttribute('title', 'Backspace键删除');
        elem.style.backgroundColor = 'yellow';
        elem.style.color = 'black';
        elem.style.margin = '0 5px';

        elem.setAttribute('data-id', word.id);
        range.insertNode(elem);

        return elem;
    },

    remove: function (id) {
        var $elem = $('em[data-id=' + id + ']');
        if (!$elem.length) {
            return;
        }
        // TODO: optimize
        // remove all by ID ?
        $elem.each(function () {
            var elem = this;

            utils.selectText(elem);

            var range = window.getSelection().getRangeAt(0);
            var selectionContents = range.extractContents();

            elem.remove();
            range.insertNode(selectionContents);
        });
    },
    getAllTextNode: function (el) {
        var n;
        var a = [];
        var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        while (n = walk.nextNode())
        a.push(n);
        return a;
    },

    init: function () {}

};
