import os
import json
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from rich.progress import Progress, SpinnerColumn, TextColumn
from gemini_service import GeminiService

load_dotenv()
console = Console()

class DirectiveManager:
    """Manages standardized LLM directives for each MGT layer."""
    def __init__(self, taxonomy_path: str):
        self.taxonomy_path = taxonomy_path
        self.directives = {
            "A": "Architecture Synthesis: Define the application intent, software typology, and initial presentation layer. Return a JSON object with a 'components' key.",
            "B": "Logic & Orchestration (The 'Brain'): Define the core computational and communication components. Return a JSON object with a 'components' key containing a list of components. For each component, include a 'narrative_rationale' explaining why it was chosen.",
            "C": "Storage & Persistence (The 'Memory'): Define the database, caching, and data lifecycle components. Return a JSON object with a 'components' key.",
            "D": "Cross-Cutting Concerns (The 'Skeleton'): Define security, observability, and IAM policies. Return a JSON object with a 'components' key.",
            "E": "Infrastructure & Deployment (The 'Vessel'): Define containerization, IaC, and environment topology. Return a JSON object with a 'components' key.",
            "F": "Quality & Verification (The 'Judge'): Define testing taxonomy and complexity thresholds. Return a JSON object with a 'components' key.",
            "G": "Use-Cases & Agentic Loops (The 'Action'): Define the dynamic logic flows and agentic reasoning loops. Return a JSON object with a 'components' key.",
            "H": "Domain Specification & Rules (The 'Reality'): Define business invariants and data schema standards. Return a JSON object with a 'components' key.",
            "I": "Specialized Agentic Components (The 'Organs'): Define the sensors, reasoning patterns, and actuators for autonomous behavior. Return a JSON object with a 'components' key."
        }

    def get_directive(self, layer_id: str) -> str:
        # In a production system, this would load from specialized .md templates
        return self.directives.get(layer_id, "Unknown Layer")

class ContextHydrator:
    """Injects architectural state and taxonomy constraints into prompts."""
    def __init__(self, taxonomy_path: str, genesis_path: Optional[str] = None):
        self.taxonomy_path = taxonomy_path
        self.genesis_path = genesis_path

    def hydrate(self, layer_id: str, user_intent: str) -> str:
        """Hydrates a layer directive with context."""
        context = f"### USER INTENT\n{user_intent}\n\n"
        
        # 1. Inject Solution Typology (Chapter 1)
        context += "### ARCHITECTURAL GUARDRAILS (Typology)\n"
        # Logic to extract Chapter 1 from self.taxonomy_path would go here
        context += "- Typology: Edge-Centric (Default for collaborative tools)\n\n"
        
        # 2. Inject Current Genesis State
        if self.genesis_path and os.path.exists(self.genesis_path):
            with open(self.genesis_path, 'r') as f:
                context += f"### CURRENT BLUEPRINT STATE (Genesis.md)\n{f.read()}\n\n"
        
        return context

class SessionLedger:
    """Manages the Machine-Readable Session Ledger and Transaction Bundles."""
    def __init__(self, session_id: str, session_dir: str):
        self.session_id = session_id
        self.session_dir = session_dir
        self.history: List[Dict[str, Any]] = []
        self.ledger_path = os.path.join(session_dir, "session_ledger.json")

    def record_transaction(self, actor: str, action: str, content: Any, status: str = "SUCCESS"):
        transaction = {
            "timestamp": datetime.now().isoformat(),
            "actor": actor,
            "action": action,
            "content": content,
            "status": status
        }
        self.history.append(transaction)
        # In a real implementation, we would save to ledger_path here.

class BlueprintValidator:
    """Validates LLM-generated JSON blueprints against the MGT Taxonomy."""
    def validate(self, layer_id: str, raw_content: str) -> Dict[str, Any]:
        """Parses and validates the raw LLM output."""
        try:
            # Assuming the LLM returns a markdown code block with JSON
            if "```json" in raw_content:
                json_str = raw_content.split("```json")[1].split("```")[0].strip()
            else:
                json_str = raw_content.strip()
            
            data = json.loads(json_str)
            
            # Normalization: If the result is a list, wrap it in a 'components' key
            if isinstance(data, list):
                data = {"components": data}
            
            # If it's a dict but doesn't have 'components', maybe it *is* a single component?
            if isinstance(data, dict) and "components" not in data and ("component" in data or "id" in data):
                data = {"components": [data]}

            return data
        except Exception as e:
            console.print(f"[bold red]Validation Error:[/bold red] {str(e)}")
            console.print(Panel(raw_content, title="Raw LLM Response (Failed Validation)", border_style="red"))
            return {}

class SynthesisOrchestrator:
    """The core engine for MGT synthesis orchestration."""
    def __init__(self, taxonomy_path: str, base_blueprint_dir: str = "blueprint", mock_mode: bool = False):
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S") + "_" + str(uuid.uuid4())[:8]
        self.session_dir = os.path.join(base_blueprint_dir, "sessions", self.session_id)
        os.makedirs(self.session_dir, exist_ok=True)
        
        self.genesis_path = os.path.join(self.session_dir, "genesis.md")
        self._initialize_genesis()

        self.ledger = SessionLedger(self.session_id, self.session_dir)
        self.directives = DirectiveManager(taxonomy_path)
        self.hydrator = ContextHydrator(taxonomy_path, self.genesis_path)
        self.validator = BlueprintValidator()
        self.llm = GeminiService(mock=mock_mode)
        self.current_phase = "INIT"

    def _initialize_genesis(self):
        """Creates an empty Genesis document with the standard header and all layer placeholders."""
        header = f"# Master Genesis Template (Project: {self.session_id})\n\n"
        header += "## A. Architecture Synthesis\n*Awaiting Intent Anchoring...*\n\n"
        
        layers = [
            ("B", "Logic & Orchestration (The 'Brain')"),
            ("C", "Storage & Persistence (The 'Memory')"),
            ("D", "Cross-Cutting Concerns (The 'Skeleton')"),
            ("E", "Infrastructure & Deployment (The 'Vessel')"),
            ("F", "Quality & Verification (The 'Judge')"),
            ("G", "Use-Cases & Agentic Loops (The 'Action')"),
            ("H", "Domain Specification & Rules (The 'Reality')"),
            ("I", "Specialized Agentic Components (The 'Organs')")
        ]
        
        for layer_id, layer_name in layers:
            header += f"## {layer_id}. {layer_name}\n*Awaiting Synthesis...*\n\n"
            
        with open(self.genesis_path, 'w') as f:
            f.write(header)

    def start_session(self):
        console.clear()
        console.print(Panel.fit(
            "[bold cyan]NEXUS AGENTIC WIZARD[/bold cyan]\n"
            "[dim]ASDLC Protocol v1.3 | Synthesis Loop v1.0[/dim]",
            border_style="bright_blue"
        ))
        
        console.print("[italic blue]Nexus Consultant:[/italic blue] Welcome. I am your advocate in this synthesis process.")
        console.print("[dim]Phase A: Intent Anchoring initialized.[/dim]\n")

        # Step 1: Prompt for Intent
        app_concept = Prompt.ask("[bold green]Describe the application you want to build[/bold green]")
        
        self.ledger.record_transaction("USER", "PROVIDE_INTENT", app_concept)
        self._update_genesis("A. Architecture Synthesis", app_concept)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            transient=True,
        ) as progress:
            progress.add_task(description="Nexus Agent is evaluating Typology...", total=None)
            import time; time.sleep(1.2) # Simulate thinking

        # Placeholder for Typological Evaluation
        console.print("\n[bold yellow]Nexus Consultant:[/bold yellow] I have evaluated your intent.")
        console.print("Proposed Typology: [bold underline]Local-First Collaborative Agent[/bold underline]")
        
        self.ledger.record_transaction("AGENT", "PROPOSE_TYPOLOGY", "local_first_collaborative")
        
        console.print("\n[dim]Ready for Phase B: Logic & Orchestration Layer (The 'Brain')[/dim]")
        
        # Proceed to Phase 2: Layer Synthesis
        self.run_phase_2(app_concept)

    def _update_genesis(self, section: str, content: str):
        """Updates a specific section in the Genesis document."""
        with open(self.genesis_path, 'r') as f:
            lines = f.readlines()
        
        new_lines = []
        in_section = False
        for line in lines:
            if line.startswith(f"## {section}"):
                new_lines.append(line)
                new_lines.append(f"{content}\n")
                in_section = True
            elif in_section and line.startswith("## "):
                new_lines.append(line)
                in_section = False
            elif not in_section:
                new_lines.append(line)
        
        with open(self.genesis_path, 'w') as f:
            f.writelines(new_lines)


    def run_phase_2(self, user_intent: str):
        """Executes the synthesis loop for all MGT Layers with component-level refinement."""
        layers = [
            ("B", "Logic & Orchestration (The 'Brain')"),
            ("C", "Storage & Persistence (The 'Memory')"),
            ("D", "Visual & Interface (The 'Face')"),
            ("E", "Infrastructure & Deployment (The 'Vessel')"),
            ("F", "Quality & Verification (The 'Judge')"),
            ("G", "Use-Cases & Agentic Loops (The 'Action')"),
            ("H", "Domain Specification & Rules (The 'Reality')"),
            ("I", "Specialized Agentic Components (The 'Organs')")
        ]
        
        for layer_id, layer_name in layers:
            console.print(f"\n[bold reverse cyan] PHASE {layer_id}: {layer_name} [/bold reverse cyan]")
            
            # Initial Synthesis of the Layer
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                transient=True,
            ) as progress:
                progress.add_task(description=f"Consulting Gemini for initial {layer_name} blueprint...", total=None)
                context = self.hydrator.hydrate(layer_id, user_intent)
                directive = self.directives.get_directive(layer_id)
                prompt = f"{directive}\n\n{context}\n\nPlease provide the architectural components in JSON format."
                response = self.llm.generate_content(prompt)
            
            data = self.validator.validate(layer_id, response)
            if not data or "components" not in data:
                console.print(f"[red]✗[/red] Failed to synthesize valid components for {layer_name}.")
                continue

            # Show Full Overview
            console.print(Panel(json.dumps(data, indent=2), title=f"Initial {layer_name} Overview", border_style="dim"))
            
            # Component-Level Refinement Loop
            components = data.get("components", [])
            refined_components = []
            
            for i, comp in enumerate(components):
                while True:
                    # Multi-key lookup for robust display
                    comp_name = comp.get("component") or comp.get("name") or comp.get("id") or f"Component {i+1}"
                    description = comp.get("description") or comp.get("responsibility") or "N/A"
                    rationale = comp.get("narrative_rationale") or comp.get("rationale") or "N/A"
                    
                    console.print(Panel(
                        f"[bold yellow]Component:[/bold yellow] {comp_name}\n"
                        f"[bold cyan]Description:[/bold cyan] {description}\n"
                        f"[bold magenta]Rationale:[/bold magenta] {rationale}",
                        title=f"Reviewing {layer_id}.{i+1}: {comp_name}",
                        border_style="blue"
                    ))
                    
                    action = Prompt.ask(
                        f"Action for '{comp_name}'",
                        choices=["approve", "refine", "skip"],
                        default="approve"
                    )
                    
                    if action == "approve":
                        refined_components.append(comp)
                        break
                    elif action == "skip":
                        console.print(f"[dim]Skipping {comp_name}...[/dim]")
                        break
                    else:
                        feedback = Prompt.ask(f"[bold red]Refinement for {comp_name}[/bold red]")
                        
                        # Call LLM for granular refinement
                        with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), transient=True) as progress:
                            progress.add_task(description=f"Refining {comp_name} based on feedback...", total=None)
                            refine_prompt = (
                                f"You are refining a specific component in the {layer_name} layer.\n"
                                f"Current Component: {json.dumps(comp, indent=2)}\n"
                                f"User Feedback: {feedback}\n\n"
                                "Please return the updated JSON for THIS COMPONENT ONLY. Include 'component', 'description', and 'narrative_rationale'."
                            )
                            refine_response = self.llm.generate_content(refine_prompt)
                            new_comp = self.validator.validate(layer_id, refine_response)
                            
                            if new_comp:
                                # Normalization: validate() might return {"components": [...]}
                                # We want the single object inside.
                                if "components" in new_comp and len(new_comp["components"]) > 0:
                                    comp = new_comp["components"][0]
                                else:
                                    comp = new_comp
                                console.print("[green]✓ Component refined.[/green]")
                            else:
                                console.print("[red]✗ Refinement failed. Keeping original.[/red]")
                
            # After all components in the layer are handled
            data["components"] = refined_components
            section_name = f"{layer_id}. {layer_name}"
            self._update_genesis(section_name, json.dumps(data, indent=2))
            console.print(f"[bold green]✓ Layer {layer_id} finalized and written to Genesis.[/bold green]")

        console.print("\n[bold reverse green] DISCOVERY PHASE COMPLETE [/bold reverse green]")
        console.print(f"Final Blueprint: [bold underline]{self.genesis_path}[/bold underline]")
        console.print(f"Final Blueprint available at: [bold]{self.genesis_path}[/bold]")

if __name__ == "__main__":
    # In a real run, these paths would be resolved from the environment
    TAXONOMY = "/home/raynier/.gemini/antigravity/brain/84d2eb74-c8bf-4abc-b201-7534350ea182/mgt_taxonomy_expanded.md"
    
    # Toggle mock_mode=True for testing without live API calls
    wizard = SynthesisOrchestrator(taxonomy_path=TAXONOMY, mock_mode=False)
    wizard.start_session()
