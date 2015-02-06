/**
 * @file utils
 * @author solopea@gmail.com
 */

var utils = {
    isMac: navigator.appVersion.indexOf('Mac') !== -1,

    renderTemplate: function (tpl, data) {
        return tpl.replace(/\{\{(\w+)\}\}/g, function (m, $1) {
            return data[$1] || '';
        });
    },

    getTopWin: function (win) {
        win = win || window;
        if (win.parent === win) {
            return win;
        }
        return utils.getTopWin(win.parent);
    },

    selectText: function (el) {
        var range = document.createRange();

        range.selectNodeContents(el);

        var sel = window.getSelection();

        sel.removeAllRanges();
        sel.addRange(range);
    },
    getWords: function () {
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

};
