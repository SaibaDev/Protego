document.addEventListener('click', function(e) {
    var url = e.target.href;
    if (url) {
        chrome.runtime.sendMessage({action: "captureUrl", url: url});
        console.log('URL : "' + url + '"');

    }
});
