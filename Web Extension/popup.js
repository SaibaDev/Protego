document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleCapture');
    const predictionDisplay = document.getElementById('prediction');

    chrome.storage.local.get('captureEnabled', (data) => {
        const captureEnabled = data.captureEnabled || false;
        updateToggleButton(captureEnabled);
    });
    toggleButton.addEventListener('click', () => {
        chrome.storage.local.get('captureEnabled', (data) => {
            const captureEnabled = !data.captureEnabled;
            chrome.storage.local.set({'captureEnabled': captureEnabled});
            updateToggleButton(captureEnabled);
        });
    });
    function updateToggleButton(captureEnabled) {
        toggleButton.innerText = captureEnabled ? 'Deactivate Capture' : 'Activate Capture';
        if (captureEnabled) {
            startCapture();
        } else {
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
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "prediction") {
            const prediction = message.prediction;
            predictionDisplay.innerText = `Prediction: ${prediction}`;
        }
    });
});
