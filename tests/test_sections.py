import requests
import json
import os
import urllib.parse
from pathlib import Path

BASE_URL = "http://127.0.0.1:8078"

def test_section_compilation():
    print("--- 1. Creating Project ---")
    p = requests.post(f"{BASE_URL}/projects", json={"name": "Expansion Test"}).json()
    p_id = p["project_id"]
    print(f"Project ID: {p_id}")

    print("\n--- 2. Saving Sections ---")
    sections = {
        "genesis": "# Genesis\nCore Intent.",
        "100_core": "## Core\nIdentity details.",
        "200_tech": "## Tech\nFastAPI and React."
    }
    
    for sid, content in sections.items():
        res = requests.post(f"{BASE_URL}/projects/{p_id}/artifacts", 
                            json={"type": "GENESIS_PROMPT", "section_id": sid, "content": content}).json()
        print(f"Saved {sid}: {res['status']}")

    print("\n--- 3. Verifying Consolidated Dispatch ---")
    d = requests.get(f"{BASE_URL}/projects/{p_id}/dispatch").json()
    url = d["url"]
    
    params = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
    compiled_content = params["system_instruction"][0]
    
    print("Compiled Content Preview:")
    print("-" * 20)
    print(compiled_content)
    print("-" * 20)
    
    assert "# Genesis" in compiled_content
    assert "<!-- SECTION: 100_core -->" in compiled_content
    assert "Identity details." in compiled_content
    assert "<!-- SECTION: 200_tech -->" in compiled_content
    assert "FastAPI and React." in compiled_content
    
    print("✅ Compilation Verified!")

    print("\n--- 4. Verifying Individual Retrieval ---")
    r1 = requests.get(f"{BASE_URL}/projects/{p_id}/artifacts/discovery/100_core").json()
    assert r1["content"] == sections["100_core"]
    print("✅ Individual Retrieval Verified!")

    print("\n--- ALL TESTS PASSED ---")

if __name__ == "__main__":
    try:
        test_section_compilation()
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
