

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import whois
import dns.resolver
import uvicorn
import phonenumbers
from phonenumbers import geocoder, carrier, timezone
# from googlesearch import search  <-- Removed
from duckduckgo_search import DDGS
import requests
import concurrent.futures
import traceback

app = FastAPI(title="OSINT Investigation Toolkit API", version="1.0.0")

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class DomainRequest(BaseModel):
    domain: str

class EmailRequest(BaseModel):
    email: str

class PersonSearchRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

# --- Services (Helper Functions) ---
def get_whois_data(domain: str):
    try:
        w = whois.whois(domain)
        return w
    except Exception as e:
        return {"error": str(e)}

def get_dns_data(domain: str):
    record_types = ["A", "MX", "TXT", "NS"]
    results = {}
    for record in record_types:
        try:
            answers = dns.resolver.resolve(domain, record)
            results[record] = [r.to_text() for r in answers]
        except Exception:
            results[record] = []
    return results

def perform_web_search(query: str, num_results=5):
    print(f"[INFO] Searching Web for: {query}")
    try:
        found_results = []
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=num_results))
            for r in results:
                found_results.append(r)
        return found_results
    except Exception as e:
        print(f"[ERROR] Web Search Error: {e}")
        return []

def check_social_media(username: str):
    print(f"[INFO] Checking Social Media for: {username}")
    # List of platforms to check
    platforms = {
        "GitHub": f"https://github.com/{username}",
        "Twitter": f"https://twitter.com/{username}",
        "Instagram": f"https://www.instagram.com/{username}/",
        "Facebook": f"https://www.facebook.com/{username}",
        "Medium": f"https://medium.com/@{username}",
        "Reddit": f"https://www.reddit.com/user/{username}",
        "Pinterest": f"https://www.pinterest.com/{username}/"
    }
    
    found_profiles = []
    
    def check_url(platform, url):
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code == 200:
                return {"platform": platform, "username": username, "url": url, "exists": True}
        except:
            pass
        return None

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_url = {executor.submit(check_url, p, u): p for p, u in platforms.items()}
        for future in concurrent.futures.as_completed(future_to_url):
            result = future.result()
            if result:
                found_profiles.append(result)
                
    return found_profiles

def search_person_intelligence(request: PersonSearchRequest):
    print(f"[INFO] Starting Investigation for: {request}")
    results = {
        "identity": {
            "full_name": request.name or "Unknown",
            "possible_aliases": [],
            "age_range": "Unknown"
        },
        "contact_info": {
            "emails": [request.email] if request.email else [],
            "phones": [request.phone] if request.phone else [],
            "carrier": "Unknown",
            "location": "Unknown"
        },
        "social_footprint": [],
        "risk_assessment": {
            "score": 0,
            "level": "LOW",
            "flags": []
        },
        "web_results": [] 
    }

    # 1. Phone Number Analysis (Real logic using phonenumbers lib)
    if request.phone:
        try:
            print("[INFO] analyzing phone...")
            phone_obj = None
            try:
                phone_obj = phonenumbers.parse(request.phone, None)
            except:
                pass

            if phone_obj and phonenumbers.is_valid_number(phone_obj):
                region = geocoder.description_for_number(phone_obj, "en")
                carrier_name = carrier.name_for_number(phone_obj, "en")
                time_zones = timezone.time_zones_for_number(phone_obj)
                
                results["contact_info"]["location"] = region
                results["contact_info"]["carrier"] = carrier_name
                results["contact_info"]["timezone"] = time_zones
                
                results["risk_assessment"]["flags"].append(f"Phone registered in {region} ({carrier_name})")
                
                # Search phone
                phone_results = perform_web_search(f'"{request.phone}" OR "{phonenumbers.format_number(phone_obj, phonenumbers.PhoneNumberFormat.INTERNATIONAL)}"')
                for res in phone_results:
                    results["web_results"].append({
                        "title": res['title'],
                        "url": res['href'],
                        "description": res['body'],
                        "source": "Web (Phone)"
                    })
                    if "truecaller" in res['href']:
                         results["social_footprint"].append({"platform": "Truecaller Lookup", "username": request.phone, "url": res['href'], "exists": True})
            else:
                 results["risk_assessment"]["flags"].append("Phone number provided is invalid or bad format")
        except Exception as e:
             results["risk_assessment"]["flags"].append(f"Phone analysis error: {str(e)}")

    # 2. Email Analysis
    if request.email:
        print("[INFO] analyzing email...")
        # Search for email
        email_results = perform_web_search(f'"{request.email}"')
        for res in email_results:
             results["web_results"].append({
                "title": res['title'],
                "url": res['href'],
                "description": res['body'],
                "source": "Web (Email)"
            })
        
        # Username extraction from email to check social media
        username = request.email.split("@")[0]
        results["identity"]["possible_aliases"].append(username)
        
        # Check social for this username
        social_profiles = check_social_media(username)
        results["social_footprint"].extend(social_profiles)
        
        # Check for breach mentions in search results
        for res in email_results:
            if any(x in res['title'].lower() or x in res['body'].lower() for x in ["breach", "pwned", "leak", "hacked"]):
                results["risk_assessment"]["score"] += 20
                results["risk_assessment"]["flags"].append(f"Potential breach mention found: {res['title']}")

    # 3. Name Analysis
    if request.name:
        print("[INFO] analyzing name...")
        query = f'"{request.name}"'
        if results["contact_info"]["location"] != "Unknown":
             query += f' "{results["contact_info"]["location"]}"' # Narrow down by location if known
        
        name_results = perform_web_search(query, num_results=5)
        for res in name_results:
             results["web_results"].append({
                "title": res['title'],
                "url": res['href'],
                "description": res['body'],
                "source": "Web (Name)"
            })
    
    # Risk Scoring Logic based on findings
    risk_score = results["risk_assessment"]["score"]
    
    if len(results["social_footprint"]) > 3:
        risk_score += 10
    
    if len(results["web_results"]) > 10:
         risk_score += 10
         
    results["risk_assessment"]["score"] = min(risk_score, 100)
    
    if risk_score > 60:
        results["risk_assessment"]["level"] = "HIGH"
    elif risk_score > 30:
        results["risk_assessment"]["level"] = "MEDIUM"
    else:
        results["risk_assessment"]["level"] = "LOW"

    print("[INFO] Investigation Complete.")
    return results


# --- Routes ---
@app.get("/")
def read_root():
    return {"message": "OSINT API is running"}

@app.get("/api/domain/{domain:path}")
def analyze_domain(domain: str):
    # Sanitize domain input
    # Remove protocol if present
    if "://" in domain:
        domain = domain.split("://")[-1]
    
    # Remove trailing paths or query parameters
    if "/" in domain:
        domain = domain.split("/")[0]
        
    whois_info = get_whois_data(domain)
    dns_info = get_dns_data(domain)
    
    return {
        "domain": domain,
        "whois": whois_info,
        "dns": dns_info
    }

def check_breach_intelligence(email: str):
    print(f"[INFO] Checking Breach Intel for: {email}")
    results = {
        "email": email,
        "risk_score": 0,
        "breaches": [],
        "pastes": [],
        "dark_web_mentions": []
    }
    
    # 1. Check for Leaks/Dumps (Clearweb)
    # Queries targeting leak databases, dumps, and sql files
    leak_queries = [
        f'"{email}" (password OR "leak" OR "database" OR "dump")',
        f'"{email}" filetype:sql',
        f'"{email}" filetype:txt (password OR credential)'
    ]
    
    for q in leak_queries:
        search_res = perform_web_search(q, num_results=3)
        for res in search_res:
             results["breaches"].append({
                "title": res['title'],
                "url": res['href'],
                "snippet": res['body'],
                "source": "Web Leak Search"
            })
             if any(x in res['title'].lower() or x in res['body'].lower() for x in ["password", "dump", "leak", "hacked"]):
                 results["risk_score"] += 25

    # 2. Check Paste Sites (Pastebin, etc.)
    paste_query = f'site:pastebin.com OR site:throwbin.io OR site:pasteorg.ru "{email}"'
    paste_res = perform_web_search(paste_query, num_results=5)
    for res in paste_res:
        results["pastes"].append({
            "title": res['title'],
            "url": res['href'],
            "snippet": res['body'],
            "source": "Paste Site"
        })
        results["risk_score"] += 35 # High risk if found in paste

    # 3. Check for Onion/Tor Proxies (Dark Web mentions on clearweb)
    dark_query = f'"{email}" site:*.onion.* OR site:tor2web.* OR site:onion.ly'
    dark_res = perform_web_search(dark_query, num_results=3)
    for res in dark_res:
        results["dark_web_mentions"].append({
            "title": res['title'],
            "url": res['href'],
            "snippet": res['body'],
            "source": "Dark Web Proxy"
        })
        results["risk_score"] += 50 # Very High risk

    # Cap score
    results["risk_score"] = min(results["risk_score"], 100)
    
    return results

@app.get("/api/breach/{email}")
def check_breach(email: str):
    return check_breach_intelligence(email)

@app.post("/api/person/search")
def search_person(request: PersonSearchRequest):
    return search_person_intelligence(request)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
