const MongoClient = require('mongodb').MongoClient;

//const model = joblib.load('voting_model.joblib');  NOT WORKING IN JAVASCRIPT 


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "captureUrl") {
        const url = message.url;
        const label = predictLabel(url);
        insertToMongo(url, label, sendResponse);
        return true; 
    }
});

/*function predictLabel(url) {
    
    return "PlaceholderLabel";
}*/

function insertToMongo(url, label, sendResponse) { 
    const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        const db = client.db('URL');
        const collection = db.collection('parseExtracted');
        const urlDocument = {
            url: url,
            label: label
        };
        collection.insertOne(urlDocument, (err, result) => {
            if (!err) {
                console.log('URL and label inserted into MongoDB');
                sendResponse({ label: label });
            }
            client.close();
        });
    });
}

