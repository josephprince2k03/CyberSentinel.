import requests
import time
import json

def test_person_search():
    url = "http://localhost:8000/api/person/search"
    payload = {
        "name": "Bhupendra kumar ravi",
        "email": "",
        "phone": ""
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, timeout=60) # 60 second timeout
        end_time = time.time()
        print(f"Response status: {response.status_code}")
        print(f"Time taken: {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            print("Success! Response snippet:")
            print(json.dumps(response.json(), indent=2)[:500] + "...")
        else:
            print("Error response:")
            print(response.text)
            
    except requests.exceptions.Timeout:
        print("Request Timed Out after 60 seconds!")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_person_search()
