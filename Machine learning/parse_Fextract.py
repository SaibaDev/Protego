import csv
import numpy as np
from urllib.parse import urlparse


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


input_csv_path = 'Dataset8.csv'
output_csv_path = 'parsed_Fextracted8.csv'


labeled_urls = []
with open(input_csv_path, 'r', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        labeled_urls.append({
            'url': row['url'],
            'label': int(row['label']) 
        })


features_list = []
for labeled_url in labeled_urls:
    url = labeled_url['url']
    label = labeled_url['label']
    features = extract_features_from_url(url)
    features_list.append({
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
    })


fieldnames = ['url', 'label', 'length', 'num_dots', 'num_slashes', 'num_path_segments', 'num_query_params',
              'has_https', 'netloc_length', 'num_hyphens', 'num_at_symbols', 'num_question_marks', 'num_equal_signs']
with open(output_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(features_list)

print(f"Features extracted from {input_csv_path} and saved to {output_csv_path}.")
