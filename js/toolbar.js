/**
 * @file toolbar.js
 * @author solopea@gmail.com
 */

var toolbar = {
    $elem: null,

    offset: null,

    template: [
        '<div class="mw-toolbar">',
        '<a class="mw-tool-iterm" href="mailto:{{email}}?subject={{subject}}">Mail</a>',
        '</div>'
    ].join(''),

    refresh: function (offset) {
        this.remove();
        this.create(offset);
    },

    create: function (offset) {
        var data = {
            email: options.email,
            subject: 'mineword: ' + utils.getWords().join(', ')

        };
        var html = utils.renderTemplate(this.template, data);

        this.$elem = $(html).css({
            left: offset.left,
            top: offset.top - 40,

        });

        var that = this;

        $('body').append(this.$elem);
    },

    remove: function () {
        if (this.$elem) {
            this.$elem.remove();
            this.$elem = null;
        }
    },

    onCopy: function (event) {
        if (highlight.hasWords() && this.offset) {
            this.refresh(this.offset);
        }
    },

    onDocumentClick: function (e) {
        var $target = $(e.target);
        if (!$target.closest('.mw-toolbar').length) {
            this.remove();
        }
    },

    bindEvents: function () {
        var that = this;

        $(document).on('copy', function (event) {
            that.onCopy(event);
        });

        $(document).on('click', function (event) {
            that.onDocumentClick(event);
        });
    },

    init: function () {
        this.bindEvents();
    }

};
