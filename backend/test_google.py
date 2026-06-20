from googlesearch import search
import time

print("Starting Google Search Test...")
try:
    start = time.time()
    # Explicitly simple internal test
    results = list(search("Bhupendra kumar ravi", num_results=3, advanced=True))
    end = time.time()
    print(f"Search completed in {end-start} seconds")
    print(f"Found {len(results)} results")
    for r in results:
        print(f" - {r.title}: {r.url}")
except Exception as e:
    print(f"Search Failed: {e}")
