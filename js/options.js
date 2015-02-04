/**
 * @file options
 * @author solopea@gmail.com
 */

$(function () {
    function init() {
        var options = {
            autoplay: false,
            timetoclose: 3000
        };
        chrome.storage.sync.get('options', function (data) {
            $.extend(options, data.options);

            for (var key in options) {
                var $elem = $('#' + key);

                if ($elem) {
                    if ($elem.attr('type') === 'checkbox') {
                        $elem.get(0).checked = options[key];
                        continue;
                    }
                    $elem.val(options[key]);
                }
            }
        });
    }

    init();

    function onSaveClick() {
        var email = $('#email').val();
        var autoplay = $('#autoplay').get(0).checked;
        var timetoclose = $('#timetoclose').val();

        var data = {
            email: email,
            timetoclose: timetoclose,
            autoplay: autoplay
        };

        save(data);
    }

    function save(data) {
        chrome.storage.sync.set({
            options: data
        }, function () {
            alert('保存成功!');
        });
    }

    $('#save').on('click', function () {
        onSaveClick();
    });
});
