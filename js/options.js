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
    
    $('#save').on('click', function() {
        var email = $('#email').val();

        chrome.storage.sync.set({
            options: {
                email: email
            }
        }, function() {
            alert('保存成功!');
        });
    });
});