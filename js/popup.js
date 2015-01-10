var disurls = [];
var curUrl;

function getDisableUrlList(callback) {
    chrome.storage.sync.get('disurls', function(data) {
        disurls = data.disurls || [];
        callback(data.disurls || []);
    });
}

function getCurTabUrl(callback) {
    chrome.tabs.getSelected(null, function(tab) {
        console.log(tab);
        callback(tab);
    });
}

function refreshButtons(showDisable) {
    if (showDisable) {
        $('#enable-cur').hide();
        $('#disable-cur').show();
    } else {
        $('#disable-cur').hide();
        $('#enable-cur').show();
    }
}

function refresh(urlList) {
    if (!urlList) {
        refreshButtons(true);
        return;
    }

    function match(urlList, curUrl) {
        if (urlList.indexOf(curUrl) !== -1) {
            refreshButtons(false);
        } else {
            refreshButtons(true);
        }
    }

    if (!curUrl) {
        getCurTabUrl(function(tab) {
            curUrl = tab.url;
            match(urlList, tab.url);
        });
    } else {
        match(urlList, curUrl);
    }
}

function initButtons() {
    getDisableUrlList(function(urlList) {
        refresh(urlList);
    });
}

function onDisableCurClick() {
    disurls.push(curUrl);
    chrome.storage.sync.set({
        disurls: disurls
    }, function() {
        refreshButtons(disurls);
    });
}

function onEnableCurClick() {
    disurls.splice(disurls.indexOf(curUrl), 1);
    chrome.storage.sync.set({
        disurls: disurls
    }, function() {
        refresh(disurls);
    });
}

function bindEvents() {
    $('#disable-cur').on('click', function() {
        onDisableCurClick();
    });

    $('#enable-cur').on('click', function() {
        onEnableCurClick();
    });
}

function init() {
    initButtons();
    bindEvents();
}
init();
