/**
 * @file bg.js
 * @author solopea@gmail.com
 */

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request.action === 'saveword') {
        var data = request.data;
        save({
            'words': data

        });
        sendResponse({
            data: data

        });
    }
});

function save(obj) {
    chrome.storage.sync.set(obj, function () {
        console.log('save success');
    });
}
