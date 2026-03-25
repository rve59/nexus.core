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
    template_id: str | None = None

class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    template_id: str | None = None
    status: str | None = None

class TemplateIngest(BaseModel):
    text: str

class ArtifactSave(BaseModel):
    type: str
    content: str
    section_id: str = "genesis" # Default to root genesis or section ID like "100_core"

@app.post("/ingest_mgt")
async def ingest_template(payload: TemplateIngest):
    """Parses raw text into a Master Genesis Template and saves it to templates.json."""
    try:
        lines = payload.text.split('\n')
        template = {
            "id": f"ingested_{str(uuid.uuid4())[:8]}",
            "name": "Ingested Template",
            "description": "Custom template from ingestion",
            "aspects": {},
            "taxonomies": {}
        }
        
        current_aspect = None
        current_mode = None # 'INTENTION' or 'TYPOLOGY'
        
        for line in lines:
            line_strip = line.strip()
            if not line_strip: continue
            
            # Metadata
            if line_strip.upper().startswith("TEMPLATE:"):
                template["name"] = line_strip[9:].strip()
                template["id"] = template["name"].lower().replace(" ", "_")
                continue
            if line_strip.upper().startswith("DESCRIPTION:"):
                template["description"] = line_strip[12:].strip()
                continue
                
            # Aspect Marker
            if line_strip.upper().startswith("ASPECT:") or line_strip.upper().startswith("SECTION:"):
                current_aspect = line_strip.split(":", 1)[1].strip().lower()
                if current_aspect not in template["aspects"]:
                    template["aspects"][current_aspect] = []
                if current_aspect not in template["taxonomies"]:
                    template["taxonomies"][current_aspect] = []
                continue
            
            # Mode Markers
            if line_strip.upper().startswith("INTENTION:"):
                current_mode = "INTENTION"
                continue
            if line_strip.upper().startswith("TYPOLOGY:"):
                current_mode = "TYPOLOGY"
                continue
                
            # Data Lines
            if current_aspect and current_mode == "TYPOLOGY":
                # Handle bullet points or name:value pairs
                item = line_strip.lstrip("- ").strip()
                if ":" in item:
                    item_name = item.split(":", 1)[0].strip()
                    if item_name not in template["aspects"][current_aspect]:
                        template["aspects"][current_aspect].append(item_name)
                    template["taxonomies"][current_aspect].append(item)
                else:
                    if item not in template["aspects"][current_aspect]:
                        template["aspects"][current_aspect].append(item)
        
        # Save to templates.json
        templates_path = BASE_DIR / "src" / "templates" / "templates.json"
        existing = []
        if templates_path.exists():
            with open(templates_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
        
        # Replace if ID exists, otherwise append
        existing = [t for t in existing if t["id"] != template["id"]]
        existing.append(template)
        
        store._atomic_write(templates_path, json.dumps(existing, indent=4))
        
        print(f"✅ Ingested Template: {template['name']} ({template['id']})")
        return template

    except Exception as e:
        print(f"❌ Ingestion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- HELPERS ---
import tempfile
import shutil

class NexusFileSystemStore:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir

    def _atomic_write(self, file_path: Path, content: str):
        """Writes to a temporary file and renames it to target to ensure atomicity."""
        file_path.parent.mkdir(parents=True, exist_ok=True)
        # Create temp file in the same directory to ensure it's on the same filesystem for os.rename
        fd, temp_path = tempfile.mkstemp(dir=file_path.parent, text=True)
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as f:
                f.write(content)
                f.flush()
                os.fsync(f.fileno())
            os.replace(temp_path, file_path)
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

    def save_artifact(self, project_id: str, section_id: str, content: str):
        project_dir = self.base_dir / "blueprint" / project_id
        
        # Mapping section_id to subdirectory names
        standard_sections = [
            "architecture", "components", "features", 
            "use-cases", "communication", "data_model", "ui_ux", "domain_specs"
        ]
        
        if section_id == "genesis":
            file_path = project_dir / "genesis.md"
            section_dir = project_dir / section_id
            filename = "core.md" if section_id != "domain_specs" else "schema.json"
            file_path = section_dir / filename
        else:
            file_path = project_dir / "discovery" / section_id / "section.md"
            
        self._atomic_write(file_path, content)
        return file_path

    def update_manifest(self, project_id: str, update_dict: dict):
        manifest_path = NEXUS_DIR / f"{project_id}_manifest.json"
        if manifest_path.exists():
            with open(manifest_path, "r") as f:
                data = json.load(f)
            data.update(update_dict)
            self._atomic_write(manifest_path, json.dumps(data, indent=4))
            return data
        return None

store = NexusFileSystemStore(BASE_DIR)

def compile_genesis(project_id: str) -> str:
    """Assembles all discovery sections into a single consolidated genesis string."""
    project_dir = BASE_DIR / "blueprint" / project_id
    
    parts = []
    
    # 1. Start with the root genesis if it exists
    root_path = project_dir / "genesis.md"
    if root_path.exists():
        with open(root_path, "r", encoding="utf-8") as f:
            parts.append(f.read())
            
    # 2. Map and append sections in a logical order
    section_map = [
        ("architecture", "## 🏗️ ARCHITECTURE"),
        ("components", "## 📦 COMPONENTS"),
        ("features", "## 🚀 FEATURES"),
        ("use-cases", "## 🔄 USE CASES"),
        ("communication", "## 📡 COMMUNICATION PROTOCOLS"),
        ("data_model", "## 💾 DATA MODEL & PERSISTENCE"),
        ("ui_ux", "## 🎨 UI/UX & HCI"),
        ("domain_specs", "## 🔍 DOMAIN SPECIFICATIONS")
    ]
    
    for subdir_name, header in section_map:
        subdir = project_dir / subdir_name
        if subdir.exists() and subdir.is_dir():
            parts.append(f"\n\n{header}")
            # Process files in alphanumeric order
            for file_path in sorted(subdir.glob("*.*")):
                if file_path.suffix in [".md", ".json"]:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if file_path.suffix == ".json":
                            content = f"```json\n{content}\n```"
                        parts.append(f"\n### {file_path.name}\n{content}")

    # 3. Handle legacy 'discovery' folder if it exists
    discovery_dir = project_dir / "discovery"
    if discovery_dir.exists():
        for section_folder in sorted(discovery_dir.iterdir()):
            if section_folder.is_dir():
                file_path = section_folder / "section.md"
                if file_path.exists():
                    with open(file_path, "r", encoding="utf-8") as f:
                        parts.append(f"\n\n<!-- LEGACY SECTION: {section_folder.name} -->\n" + f.read())
                        
    return "\n".join(parts) if parts else "# No Intent Specified"

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
        manifest_data = {
            "project_id": project_id,
            "name": project.name,
            "description": project.description,
            "template_id": project.template_id,
            "version": "0.1.0",
            "intent_v": 1,
            "status": "INIT"
        }
        
        manifest_path = NEXUS_DIR / f"{project_id}_manifest.json"
        store._atomic_write(manifest_path, json.dumps(manifest_data, indent=4))
            
        print(f"✅ Created project: {project.name} ({project_id})")
        return manifest_data
        
    except Exception as e:
        print(f"❌ Backend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/projects/{project_id}")
async def update_project(project_id: str, project_update: ProjectUpdate):
    """Updates a project manifest in .nexus."""
    try:
        update_data = {k: v for k, v in project_update.dict().items() if v is not None}
        if not update_data:
            return {"message": "No fields to update"}
            
        updated_manifest = store.update_manifest(project_id, update_data)
        if not updated_manifest:
            raise HTTPException(status_code=404, detail="Project not found")
            
        print(f"✅ Updated project: {project_id} - {update_data}")
        return updated_manifest
        
    except Exception as e:
        print(f"❌ Backend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ARTIFACT ROUTES ---

@app.get("/projects/{project_id}/artifacts/genesis")
async def get_genesis_artifact(project_id: str, consolidated: bool = False):
    """Retrieves either a single section or the compiled consolidated genesis prompt."""
    if consolidated:
        return {"content": compile_genesis(project_id)}
        
    # Default behavior for the main project view
    file_path = BASE_DIR / "blueprint" / project_id / "genesis.md"
    if not file_path.exists():
        return {"content": f"# Genesis Prompt for project {project_id}\n\nBegin your architectural intent here..."}
        
    with open(file_path, "r", encoding="utf-8") as f:
        return {"content": f.read()}

@app.get("/projects/{project_id}/artifacts/discovery/{section_id}")
async def get_discovery_section(project_id: str, section_id: str):
    """Retrieves a specific discovery section, searching new and legacy paths."""
    standard_sections = [
        "architecture", "components", "features", 
        "use-cases", "communication", "data_model", "ui_ux", "domain_specs"
    ]
    # 1. Try new granular subdirectories
    if section_id in standard_sections:
        filename = "core.md" if section_id != "domain_specs" else "schema.json"
        file_path = BASE_DIR / "blueprint" / project_id / section_id / filename
    else:
        # 2. Try legacy discovery path
        file_path = BASE_DIR / "blueprint" / project_id / "discovery" / section_id / "section.md"
    
    if not file_path.exists():
        return {"content": ""}
        
    with open(file_path, "r", encoding="utf-8") as f:
        return {"content": f.read()}

@app.post("/projects/{project_id}/artifacts")
async def save_artifact(project_id: str, payload: ArtifactSave):
    """Saves a section-based artifact using atomic writes."""
    try:
        store.save_artifact(project_id, payload.section_id, payload.content)
        
        # Update intent version in manifest
        manifest_path = NEXUS_DIR / f"{project_id}_manifest.json"
        if manifest_path.exists():
            with open(manifest_path, "r") as f:
                data = json.load(f)
            data["intent_v"] = data.get("intent_v", 0) + 1
            store._atomic_write(manifest_path, json.dumps(data, indent=4))
            return {"status": "success", "intent_v": data["intent_v"]}
            
        return {"status": "success", "message": "File written, manifest not found"}

    except Exception as e:
        print(f"❌ CRITICAL WRITE ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/templates")
async def list_templates():
    """Lists all available Master Genesis Templates from templates.json."""
    file_path = BASE_DIR / "src" / "templates" / "templates.json"
    if not file_path.exists():
        return []
    
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/templates/{template_name}")
async def get_template(template_name: str):
    """Retrieves a master genesis template by name."""
    file_path = BASE_DIR / "src" / "templates" / f"{template_name}.md"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Template not found")
    
    with open(file_path, "r", encoding="utf-8") as f:
        return {"content": f.read()}

@app.get("/projects/{project_id}/dispatch")
async def get_gas_dispatch(project_id: str, model: str = "gemini-1.5-pro"):
    """Generates a Google AI Studio deep link for the project's consolidated genesis prompt."""
    # Always use the consolidated intent for the Lab
    content = compile_genesis(project_id)
    
    if not content or content == "# No Intent Specified":
        raise HTTPException(status_code=404, detail="No Genesis artifact found for this project.")

    # Google AI Studio Deep Link Schema (v2026)
    # Using 'new_chat' to ensure a fresh session and 'instructions' for system prompt
    params = {
        "instructions": content,
        "prompt": "Proceed with the next step of the Nexus ASDLC expansion based on the consolidated intent.",
        "model": model
    }
    
    query_string = urllib.parse.urlencode(params)
    dispatch_url = f"https://aistudio.google.com/app/prompts/new_chat?{query_string}"
    
    return {"url": dispatch_url}
