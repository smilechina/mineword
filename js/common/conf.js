/**
 * @file conf.js
 * @author solopea@gmail.com
 */

// get user's options
var options = {
    autoplay: true,
    timetoclose: 3000

};

chrome.storage.sync.get('options', function (data) {
    options = $.extend(options, data.options);
});
