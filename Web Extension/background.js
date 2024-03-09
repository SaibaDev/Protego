const MongoClient = require('mongodb').MongoClient;
const { URL } = require('url');

const model = joblib.load('voting_model.joblib');


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "captureUrl") {
        
        const url = message.url;
        const features = extractFeaturesFromUrl(url);
        const label = predictLabel(features);
        insertUrlAndLabelIntoMongoDB(url, label);
        sendResponse({ label: label });
    }
});

function extractFeaturesFromUrl(url) {
    
    const parsedUrl = new URL(url);
    return [
        url.length,
        (url.match(/\./g) || []).length,
        (url.match(/\//g) || []).length,
        parsedUrl.pathname.split('/').length,
        parsedUrl.searchParams.toString().split('&').length,
        parsedUrl.protocol === 'https:' ? 1 : 0,
        parsedUrl.hostname.length,
        (url.match(/-/g) || []).length,
        (url.match(/@/g) || []).length,
        (url.match(/\?/g) || []).length,
        (url.match(/=/g) || []).length
    ];
}

function predictLabel(features) {
    
    const label = model.predict([features])[0];
    return label;
}
function insertUrlAndLabelIntoMongoDB(url, label) { 
    const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        if (err) {
            console.error('Error connecting to MongoDB:', err);
            return;
        }
        const db = client.db('URL');
        const collection = db.collection('parsedExtracted_url');
        const urlDocument = {
            url: url,
            label: label
        };
        collection.insertOne(urlDocument, (err, result) => {
            if (err) {
                console.error('Error inserting URL and label into MongoDB:', err);
            } else {
                console.log('URL and label inserted into MongoDB collection.');
            }
            client.close();
        });
    });
}
