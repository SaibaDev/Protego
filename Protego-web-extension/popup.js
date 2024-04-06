document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup script loaded");

    var recentURLsTable = document.getElementById('recentURLs').getElementsByTagName('tbody')[0];
    var isActive = false;
    var blacklist = [];


    chrome.storage.local.get(['isActive', 'blacklist', 'recentURLs'], function(data) {
        isActive = data.isActive || false;
        blacklist = data.blacklist || [];
        let recentURLs = data.recentURLs || [];

        var toggleButton = document.getElementById('toggleButton');
        toggleButton.textContent = isActive ? "Deactivate" : "Activate";

        if (isActive) {
            captureURL();
        }
        recentURLs.forEach(item => {
            updateRecentURLs(item.url, item.prediction);
        });
    });

    function captureURL() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentTab = tabs[0];
            const url = currentTab.url;
            console.log("Current tab URL:", url);

            if (blacklist.includes(url)) {
                redirectUser(function() {
                    return;
                });
                return;
            }

            fetch('https://flaskurlanalysis-protego.onrender.com/process_url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Prediction result:", data.prediction);
                updateRecentURLs(url, data.prediction);
                saveToLocalStorage(url, data.prediction);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    function saveToLocalStorage(url, prediction) {
        chrome.storage.local.get('recentURLs', function(data) {
            let recentURLs = data.recentURLs || [];
            recentURLs.unshift({ url: url, prediction: prediction });
            recentURLs = recentURLs.slice(0, 3);
            chrome.storage.local.set({ 'recentURLs': recentURLs });
        });
    }

    chrome.tabs.onCreated.addListener(function(tab) {
        if (isActive) {
            captureURL();
        }
    });

    var removeAllButton = document.getElementById('removeAllButton');
    removeAllButton.addEventListener('click', function() {
        removeRecentURLs();
    });

    function removeRecentURLs() {
        recentURLsTable.innerHTML = "";
        chrome.storage.local.set({ 'recentURLs': [] });
    }

    function toggleActivation() {
        isActive = !isActive;
        console.log("Capturing URLs is now", isActive ? "activated" : "deactivated");
        var toggleButton = document.getElementById('toggleButton');
        toggleButton.textContent = isActive ? "Deactivate" : "Activate";
        toggleButton.style.backgroundColor = !isActive ? "" : "orange";
        chrome.storage.local.set({ 'isActive': isActive });
        if (isActive) {
            captureURL();
        }
    }

    var toggleButton = document.getElementById('toggleButton');
    toggleButton.addEventListener('click', function() {
        toggleActivation();
    });

    function updateRecentURLs(url, prediction) {
        if (recentURLsTable.rows.length > 4) {
            recentURLsTable.deleteRow(-1); 
        }
        var newRow = recentURLsTable.insertRow(0); 
        var cell1 = newRow.insertCell(0);
        var cell2 = newRow.insertCell(1);
        var cell3 = newRow.insertCell(2); 
        cell1.textContent = url;
        cell2.textContent = prediction;
        if (prediction === "Potentially dangerous") {
            cell2.style.color = "red";
            var blacklistButton = document.createElement('button');
            blacklistButton.textContent = "Blacklist";
            blacklistButton.addEventListener('click', function() {
                addToBlacklist(url);
                cell3.textContent = "Added to blacklist";
            });
            cell3.appendChild(blacklistButton);
        } else if (prediction === "Safe website") {
            cell2.style.color = "green";
        }
    }

    //BLACKLISTING

    function getBlacklist(callback) {
        chrome.storage.local.get('blacklist', function(data) {
            callback(data.blacklist || []);
        });
    }

    function setBlacklist(blacklist, callback) {
        chrome.storage.local.set({ 'blacklist': blacklist }, function() {
            if (callback) {
                callback();
            }
        });
    }

    function addToBlacklist(url) {
        getBlacklist(function(blacklist) {
            blacklist.push(url);
            setBlacklist(blacklist);
        });
    }

    var showBlacklistButton = document.getElementById('showBlacklistButton');
    showBlacklistButton.addEventListener('click', function() {
        showBlacklist();
    });

    function showBlacklist() {
        getBlacklist(function(blacklist) {
            var blacklistPopup = window.open("", "Blacklist", "width=400,height=400");
            blacklistPopup.document.write("<h2>Blacklisted URLs</h2>");
            if (blacklist.length === 0) {
                blacklistPopup.document.write("<p>No blacklisted URLs</p>");
            } else {
                blacklist.forEach(function(url, index) {
                    var removeButton = document.createElement('button');
                    removeButton.textContent = "Remove";
                    removeButton.addEventListener('click', function() {
                        removeFromBlacklist(url, index, blacklistPopup);
                    });
                    var link = document.createElement('a');
                    link.textContent = url;
                    link.href = url;
                    link.target = "_blank";
                    link.style.marginRight = "10px";
                    blacklistPopup.document.body.appendChild(link);
                    blacklistPopup.document.body.appendChild(removeButton);
                    blacklistPopup.document.body.appendChild(document.createElement('br'));  
                });
            }
        });
    }

    function removeFromBlacklist(url, index, popupWindow) {
        getBlacklist(function(blacklist) {
            blacklist.splice(index, 1);
            setBlacklist(blacklist, function() {
                popupWindow.location.reload();
            });
        });
    }

    function redirectUser(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tabId = tabs[0].id;
            chrome.tabs.update(tabId, { url:'https://saibadev.github.io/Protego-website-deploy/warning-page.html' }, callback); 
        });
    }

});
