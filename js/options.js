$(function() {
    function init() {
        chrome.storage.sync.get('options', function(data) {
            var obj = data.options;

            if (!obj) {
                return;
            }

            for (var key in obj) {
                var $elem = $('#' + key);
                if ($elem) {
                    $elem.val(obj[key]);
                }
            }
        });
    }

    init();

    function onSaveClick() {
        var email = $('#email').val();

        var data = {
            email: email
        };

        save(data);
    }

    function save(data) {
        chrome.storage.sync.set({
            options: data
        }, function() {
            alert('保存成功!');
        });
    }

    $('#save').on('click', function() {
        onSaveClick();
    });
});
