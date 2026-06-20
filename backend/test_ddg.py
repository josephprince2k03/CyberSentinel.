from duckduckgo_search import DDGS
import json

print("Starting DDG Verification...")
try:
    with DDGS() as ddgs:
        results = list(ddgs.text("", max_results=10))
        print(f"Found {len(results)} results")
        for r in results:
            print(f"Title: {r['title']}")
            print(f"URL: {r['href']}")
            print("---")
except Exception as e:
    print(f"DDG Failed: {e}")
