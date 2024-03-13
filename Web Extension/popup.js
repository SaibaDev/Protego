document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup script loaded");

    var captureButton = document.getElementById('captureButton');
    var predictionText = document.getElementById('predictionText');
    var recentURLsTable = document.getElementById('recentURLs').getElementsByTagName('tbody')[0];
    var capturedURLs = JSON.parse(localStorage.getItem('capturedURLs')) || [];

    captureButton.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentTab = tabs[0];
            const url = currentTab.url;
            console.log("Current tab URL:", url);
            fetch('http://127.0.0.1:5000/process_url', {
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
                predictionText.textContent = "Prediction: " + data.prediction;
                capturedURLs.push({url: url, prediction: data.prediction}); 
                localStorage.setItem('capturedURLs', JSON.stringify(capturedURLs)); 
                updateRecentURLs(url, data.prediction); 
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    capturedURLs.forEach(function(urlObj) {
        updateRecentURLs(urlObj.url, urlObj.prediction);
    });

    // update
    function updateRecentURLs(url, prediction) {
        var newRow = recentURLsTable.insertRow(0);
        var urlCell = newRow.insertCell(0);
        urlCell.textContent = url;
        var predictionCell = newRow.insertCell(1);
        predictionCell.textContent = prediction;
        var removeCell = newRow.insertCell(2);
        var removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', function() {
            var row = this.parentNode.parentNode;
            var index = Array.from(row.parentNode.children).indexOf(row);
            capturedURLs.splice(index, 1);
            localStorage.setItem('capturedURLs', JSON.stringify(capturedURLs));
            row.parentNode.removeChild(row);
        });
        removeCell.appendChild(removeButton);
    }
});
