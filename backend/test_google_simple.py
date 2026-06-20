from googlesearch import search
import time

print("Starting Google Search Test (Simple)...")
try:
    start = time.time()
    # Removing advanced=True to see if it works better
    results = list(search("Bhupendra kumar ravi", num_results=3))
    end = time.time()
    print(f"Search completed in {end-start} seconds")
    print(f"Found {len(results)} results")
    for r in results:
        print(f" - {r}")
except Exception as e:
    print(f"Search Failed: {e}")
