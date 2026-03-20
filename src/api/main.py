import os
import json
import uuid
import urllib.parse
from pathlib import Path
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel

# --- INITIALIZATION ---
# BASE_DIR identifies the project root /00_NEXUS
BASE_DIR = Path(__file__).resolve().parent.parent.parent
NEXUS_DIR = BASE_DIR / ".nexus"

# Ensure core directories exist
os.makedirs(NEXUS_DIR, exist_ok=True)
os.makedirs(BASE_DIR / "blueprint", exist_ok=True)

app = FastAPI(title="NEXUS.core API", version="0.1.0")

# --- MODELS ---
class ProjectCreate(BaseModel):
    name: str
    description: str = "Nexus Project"

class ArtifactSave(BaseModel):
    type: str
    content: str

# --- PROJECT ROUTES ---

@app.get("/projects")
async def list_projects():
    """Lists all projects found in the .nexus directory."""
    projects = []
    try:
        if not NEXUS_DIR.exists():
            return []

        for manifest_file in NEXUS_DIR.glob("*_manifest.json"):
            with open(manifest_file, "r") as f:
                data = json.load(f)
                projects.append(data)
                
        return sorted(projects, key=lambda x: x.get("name", ""))
    except Exception as e:
        print(f"❌ Error listing projects: {e}")
        raise HTTPException(status_code=500, detail="Could not read project manifests")

@app.post("/projects")
async def create_project(project: ProjectCreate):
    """Creates a new project manifest in .nexus."""
    try:
        project_id = str(uuid.uuid4())
        manifest_path = NEXUS_DIR / f"{project_id}_manifest.json"
        
        manifest_data = {
            "project_id": project_id,
            "name": project.name,
            "description": project.description,
            "version": "0.1.0",
            "intent_v": 1,
            "status": "INIT"
        }
        
        with open(manifest_path, "w") as f:
            json.dump(manifest_data, f, indent=4)
            
        print(f"✅ Created project: {project.name} ({project_id})")
        return manifest_data
        
    except Exception as e:
        print(f"❌ Backend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ARTIFACT ROUTES ---

@app.get("/projects/{project_id}/artifacts/genesis")
async def get_genesis_artifact(project_id: str):
    """Retrieves the genesis.md artifact for a specific project."""
    project_dir = BASE_DIR / "blueprint" / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = project_dir / "genesis.md"
    
    if not file_path.exists():
        return {"content": f"# Genesis Prompt for project {project_id}\n\nBegin your architectural intent here..."}
        
    with open(file_path, "r", encoding="utf-8") as f:
        return {"content": f.read()}

@app.post("/projects/{project_id}/artifacts")
async def save_artifact(project_id: str, payload: ArtifactSave):
    """Saves an artifact (genesis.md) to a project-specific directory."""
    try:
        # Create isolated project folder: blueprint/PROJECT_ID/
        target_dir = BASE_DIR / "blueprint" / project_id
        target_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = target_dir / "genesis.md"
        
        # Atomic Write with FS sync
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(payload.content)
            f.flush()
            os.fsync(f.fileno()) 
            
        print(f"✅ CONFIRMED WRITE: {file_path}")

        # Update intent version in manifest
        manifest_path = NEXUS_DIR / f"{project_id}_manifest.json"
        if manifest_path.exists():
            with open(manifest_path, "r+") as f:
                data = json.load(f)
                data["intent_v"] = data.get("intent_v", 0) + 1
                f.seek(0)
                json.dump(data, f, indent=4)
                f.truncate()
                return {"status": "success", "intent_v": data["intent_v"]}
        
        return {"status": "success", "message": "File written, manifest not updated"}

    except Exception as e:
        print(f"❌ CRITICAL WRITE ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}/dispatch")
async def get_gas_dispatch(project_id: str):
    """Generates a Google AI Studio deep link for the project's genesis prompt."""
    genesis_path = BASE_DIR / "blueprint" / project_id / "genesis.md"
    
    if not genesis_path.exists():
        raise HTTPException(status_code=404, detail="No Genesis artifact found for this project.")

    with open(genesis_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Google AI Studio Deep Link Schema (v2026)
    params = {
        "system_instruction": content,
        "model": "gemini-3-pro"
    }
    
    query_string = urllib.parse.urlencode(params)
    dispatch_url = f"https://aistudio.google.com/prompts/new?{query_string}"
    
    return {"url": dispatch_url}
