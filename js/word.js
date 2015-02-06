/**
 * @file word.js
 * @author solopea@gmail.com
 */

var Word = {
    records: {},
    ids: [],

    init: function (data) {
        this.load(data);
    },

    load: function (data) {
        if (!data || !data.length) {
            return;
        }

        for (var i = 0, len = data.length; i < len; i++) {
            this.records[data[i].id] = data[i];
            this.ids.push(data[i].id);
        }
    },
    recordsValues: function () {
        var result = [];
        for (var key in this.records) {
            result.push(this.records[key]);
        }
        return result;
    },

    sync: function () {
        // TODO
    },

    exsits: function (wordText) {
        return this.findByName(wordText);
    },

    find: function (id) {
        return this.records[id];
    },

    findByName: function (name) {
        for (var id in this.records) {
            if (name === this.records[id].name) {
                return this.records[id];
            }
        }

        return null;
    },

    create: function (wordText) {
        var word = this.exsits(wordText);
        if (word) {
            return word;
        }

        var guid = this.generateID();

        word = {
            id: guid,
            name: wordText,
            num: 0

        };

        this.records[guid] = this.dup(word);

        this.ids.push(guid);

        this.sync();
        return word;
    },

    dup: function (obj) {
        return $.extend({}, obj);
    },

    addNum: function (id) {
        this.records[id].num += 1;
    },

    update: function (id, attr, value) {
        this.records[id][attr] = value;
    },

    remove: function (id) {
        delete this.records[id];
        this.ids.splice(this.ids.indexOf(id), 1);
    },

    generateID: function () {
        return Math.guid();
    },

    removeLast: function () {
        var id = this.ids[this.ids.length - 1];
        if (!id) {
            return;
        }
        this.remove(id);

        return id;
    }

};
