import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_domain(domain):
    print(f"Testing domain: '{domain}'")
    # Encode slash manually? No, requests does it if it's part of path? 
    # If we format it into the string, it becomes part of the path structure.
    url = f"{BASE_URL}/domain/{domain}"
    print(f"URL: {url}")
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Response: {response.text}")
        else:
            print("Success")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)

if __name__ == "__main__":
    test_domain("google.com")
    test_domain("https://google.com")
    test_domain("google.com/")
    test_domain("google.com/foo") # This should 404
