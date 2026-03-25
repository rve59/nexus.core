from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from mgt_agent import SynthesisOrchestrator

app = Flask(__name__)
CORS(app)

# Path to the expanded taxonomy
TAXONOMY_PATH = "/home/raynier/.gemini/antigravity/brain/84d2eb74-c8bf-4abc-b201-7534350ea182/mgt_taxonomy_expanded.md"

ASPECT_TO_CHAPTER = {
    "A": [],
    "B": "### B. Logic & Orchestration Layer",
    "C": "### C. Storage & Persistence Layer",
    "D": "### D. Cross-Cutting Concerns",
    "E": "### E. Infrastructure & Deployment Layer",
    "F": "### F. Quality & Verification Layer",
    "G": "### G. Use-Cases & Agentic Loops",
    "H": "### H. Domain Specification & Rules",
    "I": "### I. Specialized Agentic Components"
}

def _get_section_content(content, chapter_title):
    lines = content.split('\n')
    start_idx = -1
    target_level = chapter_title.count('#')
    
    for i, line in enumerate(lines):
        if line.strip().startswith(chapter_title):
            start_idx = i
            break
            
    if start_idx == -1:
        return "" # Return empty if not found

    section_lines = []
    for i in range(start_idx, len(lines)):
        line = lines[i]
        if i > start_idx:
            stripped = line.strip()
            if stripped.startswith('#'):
                current_level = stripped.split(' ')[0].count('#')
                if current_level <= target_level:
                    break
            if stripped == '---':
                break
        section_lines.append(line)
        
    return '\n'.join(section_lines).strip()

@app.route('/api/taxonomy/<aspect_id>', methods=['GET'])
def get_taxonomy(aspect_id):
    target = ASPECT_TO_CHAPTER.get(aspect_id)
    if target is None:
        with open(TAXONOMY_PATH, 'r') as f:
            return jsonify({"content": f.read()})
            
    if isinstance(target, list) and not target:
        return jsonify({"content": ""})
            
    with open(TAXONOMY_PATH, 'r') as f:
        content = f.read()
    
    if isinstance(target, list):
        sections = []
        for header in target:
            sec = _get_section_content(content, header)
            if sec:
                sections.append(sec)
        combined = "\n\n---\n\n".join(sections)
        return jsonify({"content": combined})
    
    section = _get_section_content(content, target)
    return jsonify({"content": section})

@app.route('/api/start', methods=['POST'])
def start_session():
    global orchestrator
    data = request.json
    intent = data.get('intent')
    
    if not intent:
        return jsonify({"error": "Intent is required"}), 400
    
    orchestrator = SynthesisOrchestrator(taxonomy_path=TAXONOMY_PATH)
    orchestrator.ledger.record_transaction("USER", "PROVIDE_INTENT", intent)
    orchestrator._update_genesis("A. Architecture Synthesis", intent)
    
    return jsonify({
        "session_id": orchestrator.session_id,
        "genesis_path": orchestrator.genesis_path,
        "status": "INITIALIZED",
        "proposed_typology": "Edge-Centric" # Mocked for now to match mgt_agent.py logic
    })

@app.route('/api/synthesize', methods=['POST'])
def synthesize_layer():
    global orchestrator
    if not orchestrator:
        return jsonify({"error": "No active session"}), 400
    
    data = request.json
    layer_id = data.get('layer_id')
    layer_name = data.get('layer_name')
    user_intent = data.get('intent') # Original code uses user_intent
    context_from_request = data.get('context', '') # Selected taxonomy variables
    
    context_from_hydrator = orchestrator.hydrator.hydrate(layer_id, user_intent)
    directive = orchestrator.directives.get_directive(layer_id)

    # Prepend context_from_request to the prompt
    prompt_parts = []
    if context_from_request:
        prompt_parts.append(f"Relevant Taxonomy Variables: {context_from_request}")
    prompt_parts.append(directive)
    prompt_parts.append(context_from_hydrator)
    prompt_parts.append("Please provide the architectural components in JSON format.")
    
    prompt = "\n\n".join(filter(None, prompt_parts)) # Filter out empty strings if any

    response = orchestrator.llm.generate_content(prompt)
    layer_data = orchestrator.validator.validate(layer_id, response)
    
    if not layer_data or "components" not in layer_data:
        return jsonify({"error": f"Failed to synthesize {layer_name}"}), 500
    
    return jsonify(layer_data)

@app.route('/api/refine', methods=['POST'])
def refine_component():
    global orchestrator
    if not orchestrator:
        return jsonify({"error": "No active session"}), 400
    
    data = request.json
    # Map 'Face' aspect 'D' back to 'A' for DirectiveManager if needed, 
    # but DirectiveManager uses the actual IDs passed to hydrate.
    # mgt_agent.py uses B, C, D, E, F, G, H, I. 
    # Faces is D in App.jsx and mgt_agent.py matches.
    
    layer_name = data.get('layer_name')
    layer_id = data.get('layer_id')
    component = data.get('component')
    feedback = data.get('feedback')
    
    refine_prompt = (
        f"You are refining a specific component in the {layer_name} layer.\n"
        f"Current Component: {json.dumps(component, indent=2)}\n"
        f"User Feedback: {feedback}\n\n"
        "Please return the updated JSON for THIS COMPONENT ONLY. Include 'component', 'description', and 'narrative_rationale'."
    )
    
    refine_response = orchestrator.llm.generate_content(refine_prompt)
    new_comp_data = orchestrator.validator.validate(layer_id, refine_response)
    
    if not new_comp_data:
        return jsonify({"error": "Refinement failed"}), 500
        
    # Normalization
    if "components" in new_comp_data and len(new_comp_data["components"]) > 0:
        refined_comp = new_comp_data["components"][0]
    else:
        refined_comp = new_comp_data
        
    return jsonify(refined_comp)

@app.route('/api/finalize_layer', methods=['POST'])
def finalize_layer():
    global orchestrator
    if not orchestrator:
        return jsonify({"error": "No active session"}), 400
        
    data = request.json
    layer_id = data.get('layer_id')
    layer_name = data.get('layer_name')
    components = data.get('components')
    
    layer_key = f"{layer_id}. {layer_name}"
    orchestrator._update_genesis(layer_key, json.dumps({"components": components}, indent=2))
    
    return jsonify({"status": "SUCCESS", "message": f"Layer {layer_id} written to Genesis."})

@app.route('/api/suggest_typologies', methods=['POST'])
def suggest_typologies():
    global orchestrator
    if not orchestrator:
        # Initialize a temporary orchestrator if none exists to use the LLM
        orchestrator = SynthesisOrchestrator(taxonomy_path=TAXONOMY_PATH)
        
    data = request.json
    vision_text = data.get('vision_text')
    
    if not vision_text:
        return jsonify({"error": "Vision text is required"}), 400
        
    prompt = (
        "Based on the following application vision statement, suggest the most appropriate architecture typologies "
        "from the list below. Return ONLY a JSON array of the numerical IDs (1-7).\n\n"
        "Typologies:\n"
        "1. Monolithic Modular (Small-scale productivity)\n"
        "2. Distributed Microservices (Global scale, hyper-services)\n"
        "3. Serverless / Event-Driven (Reactive data pipelines)\n"
        "4. Edge-Centric (Real-time collaborative, local-first)\n"
        "5. Hexagonal (Domain-strict, critical engines, regulatory)\n"
        "6. BFF (Backend for Frontend, multi-device delivery)\n"
        "7. CQRS (Audited, high-performance systems)\n\n"
        f"Vision Statement: {vision_text}\n\n"
        "Return Format: [ID1, ID2, ...]"
    )
    
    response = orchestrator.llm.generate_content(prompt)
    try:
        # Extract list from response
        import re
        match = re.search(r'\[.*\]', response)
        if match:
            suggested_ids = json.loads(match.group())
            return jsonify({"suggested_ids": suggested_ids})
    except Exception as e:
        print(f"Error parsing suggestions: {e}")
        
    return jsonify({"suggested_ids": []})

@app.route('/api/synthesis/prepare', methods=['POST'])
def prepare_synthesis():
    global orchestrator
    if not orchestrator:
        return jsonify({"error": "No active session"}), 400
        
    # In a real scenario, this would package all finalized layers
    # For this prototype, we'll signal that the Genesis.md is ready
    orchestrator.ledger.record_transaction("USER", "REQUEST_SYNTHESIS", orchestrator.genesis_path)
    
    return jsonify({
        "status": "READY",
        "message": "Project blueprint is ready for full-project synthesis.",
        "genesis_path": orchestrator.genesis_path,
        "instructions": "Please signal your Agent with: 'The MGT is ready in the sandbox. Synthesize the project structure and primary logic in the sandbox/ directory.'"
    })

if __name__ == '__main__':
    app.run(port=8091, debug=True) # Backend on 8091
