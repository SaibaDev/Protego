document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('toggleCapture');
   // var predictionDisplay = document.getElementById('prediction');

    chrome.storage.local.get('captureEnabled', function(data) {
        var captureEnabled = data.captureEnabled || false;
        updateToggleButton(captureEnabled);
    });

    toggleButton.addEventListener('click', function() {
        chrome.storage.local.get('captureEnabled', function(data) {
            var captureEnabled = !data.captureEnabled;
            chrome.storage.local.set({'captureEnabled': captureEnabled});
            updateToggleButton(captureEnabled);
        });
    });
    
    function updateToggleButton(captureEnabled) {
        if (captureEnabled) {
            toggleButton.innerText = 'Deactivate Capture';
            startCapture();
        } else {
            toggleButton.innerText = 'Activate Capture';
            stopCapture();
        }
    }
    
    function startCapture() {
        chrome.runtime.sendMessage({action: "startCapture"});
        toggleButton.style.backgroundColor='#FF0000';
        toggleButton.style.transition='.5s ease';

    }
    
    function stopCapture() {
        chrome.runtime.sendMessage({action: "stopCapture"});
        toggleButton.style.backgroundColor='#008000';
        toggleButton.style.transition='.5s ease';
    }
    /*chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === "prediction") {
            var prediction = message.prediction;
            predictionDisplay.innerText = 'Prediction: ' + prediction;
        }
    });*/
});
