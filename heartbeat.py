import requests

url = "http://127.0.0.1:8078/projects"
payload = {
    "name": "Bootstrap-Nexus-App",
    "description": "The self-hosting Nexus workbench"
}

response = requests.post(url, json=payload)

response = requests.post(url, json=payload)

print(f"Status Code: {response.status_code}")
print(f"Full Text: '{response.text}'") # This will show us the actual error

if response.status_code == 200:
    print(response.json())
