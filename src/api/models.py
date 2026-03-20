# models.py
from pydantic import BaseModel, Field
from typing import Dict, Optional
from enum import Enum
from uuid import UUID, uuid4

class ProjectStatus(str, Enum):
    INIT = "INIT"
    LAB_PROTOTYPE = "LAB_PROTOTYPE"
    DEV = "DEV"

class ArtifactType(str, Enum):
    GENESIS_PROMPT = "GENESIS_PROMPT"
    SCHEMA = "SCHEMA"
    REQUIREMENT = "REQUIREMENT"

class Project(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    status: ProjectStatus = ProjectStatus.INIT

class Workspace(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    status: ProjectStatus = ProjectStatus.INIT

class Manifest(BaseModel):
    project_id: UUID
    intent_v: int = 0
    state_snapshot: Dict[str, str] = Field(
        default_factory=lambda: {"GAS": "IDLE", "GH": "IDLE", "GAG": "IDLE"}
    )
    version: str = "0.1.0"

class Artifact(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    type: ArtifactType
    content_path: str