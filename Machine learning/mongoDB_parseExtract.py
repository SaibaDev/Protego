import numpy as np
from urllib.parse import urlparse
from pymongo import MongoClient


# Todo mag-add ng additional features para mas maging accurate
def extract_features_from_url(url):
    parsed_url = urlparse(url)
    return [
        len(url),
        url.count('.'),
        url.count('/'),
        len(parsed_url.path.split('/')),
        len(parsed_url.query.split('&')),
        1 if parsed_url.scheme == 'https' else 0,
        len(parsed_url.netloc),  
        url.count('-'),  
        url.count('@'),  
        url.count('?'), 
        url.count('=')   
    ]


#source ng dataset
source_client = MongoClient('localhost', 27017) 
source_db = source_client['URL']  
source_collection = source_db['labeled_url']  

#san masasave
destination_client = MongoClient('localhost', 27017)  
destination_db = destination_client['URL']  
destination_collection = destination_db['parsedExtracted_url']  


labeled_urls = []
for doc in source_collection.find():
    url = doc.get('url', '')
    label = int(doc.get('label', -1)) 
    labeled_urls.append({'url': url, 'label': label})

print(f"Number of URLs retrieved: {len(labeled_urls)}")  


features_list = []
for labeled_url in labeled_urls:
    url = labeled_url['url']
    label = labeled_url['label']
    if label not in [0, 1]:  
        print(f"Invalid label ({label}) for URL: {url}")
        continue
    features = extract_features_from_url(url)
    features_dict = {
        'url': url,
        'label': label,
        'length': features[0],
        'num_dots': features[1],
        'num_slashes': features[2],
        'num_path_segments': features[3],
        'num_query_params': features[4],
        'has_https': features[5],
        'netloc_length': features[6],
        'num_hyphens': features[7],
        'num_at_symbols': features[8],
        'num_question_marks': features[9],
        'num_equal_signs': features[10]
    }
    features_list.append(features_dict)

#check lang kung ilan
print(f"Number of features extracted: {len(features_list)}")  


if features_list: 
    destination_collection.insert_many(features_list)
    print("ok")
else:
    print("error")
