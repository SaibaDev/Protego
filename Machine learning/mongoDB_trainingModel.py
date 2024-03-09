import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import VotingClassifier
import joblib
import logging
from pymongo import MongoClient


#todo: Bawasan ang training data dahil matagal itrain ang model
#Scikit learn -- Classification  SVM  and Random forest algorithm

logging.basicConfig(level=logging.DEBUG)


client = MongoClient('mongodb://localhost:27017/')
db = client['URL'] 
collection = db['parsedExtracted_url'] 


data = list(collection.find({}, {'_id': 0}))  
df = pd.DataFrame(data)
df = df.sample(frac=1).reset_index(drop=True)

#Get features and labels 
features = df.drop(['url', 'label'], axis=1)
labels = df['label']
logging.debug(" Extract features and labels")

X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)
logging.debug("Split ")


scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
logging.debug(" Standardize the features )")


rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train_scaled, y_train)
logging.debug(" Train Random Forest")


svm_model = SVC(kernel='linear')
svm_model.fit(X_train_scaled, y_train)
logging.debug(" Train SVM ")


voting_model = VotingClassifier(estimators=[('rf', rf_model), ('svm', svm_model)], voting='hard')
voting_model.fit(X_train_scaled, y_train)


joblib.dump(rf_model, 'random_forest_model.joblib')
joblib.dump(svm_model, 'svm_model.joblib')
joblib.dump(voting_model, 'voting_model.joblib') #  Combined na  RF and SVM  (ensemble)
joblib.dump(scaler, 'scaler.joblib')
logging.debug(" Saving .......")
