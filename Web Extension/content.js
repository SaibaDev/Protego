document.addEventListener('click', (e) => {
    const url = e.target.href;
    if (url) {
        chrome.runtime.sendMessage({action: "captureUrl", url: url});
    }
});