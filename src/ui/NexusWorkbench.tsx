import React, { useState, useEffect } from 'react';
import { 
  Terminal, Database, Zap, Layers, Save, Activity, Cpu, Plus, X,
  Shield, Box, MessageSquare, Microscope, Code, Monitor, Globe, Share2,
  Maximize2, Minimize2, MinusCircle, PlusCircle
} from 'lucide-react';

const SECTIONS = [
  { id: 'genesis', label: '0. GENESIS', sub: '(The Project Type)', icon: Layers },
  { id: 'architecture', label: '1. ARCHITECTURE', sub: '(The "Where" & "Why")', icon: Globe },
  { id: 'components', label: '2. COMPONENTS', sub: '(The "Players")', icon: Box },
  { id: 'features', label: '3. FEATURES', sub: '(The "What")', icon: Zap },
  { id: 'use-cases', label: '4. USE CASES', sub: '(The Journey)', icon: MessageSquare },
  { id: 'communication', label: '5. COMMUNICATION', sub: '(The Handshake)', icon: Share2 },
  { id: 'data_model', label: '6. DATA MODEL', sub: '(The State)', icon: Database },
  { id: 'ui_ux', label: '7. UI / UX & HCI', sub: '(The Experience)', icon: Monitor },
  { id: 'domain_specs', label: '8. DOMAIN SPECS', sub: '(The Formalization)', icon: Code },
];

const SECTION_EXPLANATIONS = {
  genesis: "In this page you select one of the available Master Genesis Templates. The Master Genesis Template is preconfigured for a specific kind of project.",
  architecture: "Consolidate the architectural intent, technical stack, and non-functional requirements into a unified structural blueprint.",
  components: "Enumerate the internal and external components, defining their roles, boundaries, and responsibilities within the system ecosystem.",
  features: "Define the hierarchical feature set, categorized by intelligence typology and role in the system architecture.",
  'use-cases': "Detail the specific user and agentic flows, mapping out success paths and exception handling for critical interactions.",
  communication: "Specify the protocols, event schemas, and API standards used for inter-component communication and external integrations.",
  data_model: "Design the structural data schemas, normalization rules, and persistence strategies for system state and user data.",
  ui_ux: "Detail the visual language, interaction patterns, and user experience goals, specifically focusing on HCI requirements.",
  domain_specs: "Provide formal technical specifications, JSON schemas, and low-level requirements for implementation and verification."
};

const ASPECT_CONFIG: Record<string, string[]> = {
  architecture: ["Functional Requirements", "Non-Functional Constraints", "Stack", "Topology", "Persistence Strategy"],
  components: ["Backend Core", "Frontend UI", "External Integrations"],
  features: ["Ingestion", "Reasoning", "Transformation", "Synthesis"],
  'use-cases': ["Primary Flows", "Exception Paths", "Agentic Loops"],
  communication: ["Protocols", "Event Schemas", "API Standards"],
  data_model: ["Schema Design", "Persistence Strategy", "Data Lifecycle"],
  ui_ux: ["Visual Language", "Interaction Patterns", "User Personas"],
  domain_specs: ["Formal Specs", "JSON Schemas", "Verification Rules"]
};

// --- INTERFACES ---
interface Template {
  id: string;
  name: string;
  description: string;
  aspects: Record<string, string[]>;
  taxonomies?: Record<string, string[]>;
}

interface Project {
  project_id: string;
  name: string;
  description?: string;
  template_id?: string;
  version?: string;
  intent_v?: number;
  status?: string;
}

// --- HELPER COMPONENTS ---
const ProjectAspectCard = ({ 
  title, 
  value, 
  onChange, 
  taxonomies = [], 
  isFocused, 
  onFocus,
  onExpand
}: { 
  title: string, 
  value: string, 
  onChange: (val: string) => void,
  taxonomies?: string[],
  isFocused: boolean,
  onFocus: () => void,
  onExpand: () => void
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync with external value changes (e.g. from modal)
  useEffect(() => {
    // ONLY OVERWRITE IF NOT FOCUSED to avoid "State Echo" fighting with user typing
    if (value !== localValue && !isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  // Debounced propagation to parent
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [localValue]);

  return (
    <div 
      onClick={onFocus}
      onDoubleClick={() => {
        onFocus();
        onExpand();
      }}
      className={`bg-slate-900/50 border rounded-xl p-4 flex flex-col gap-3 group transition-all cursor-pointer relative ${
        isFocused 
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20' 
          : 'border-slate-800 hover:border-sky-500/30'
      }`}
    >
      <div className="flex justify-between items-start transition-all">
        <h4 className={`text-[10px] font-bold uppercase tracking-widest transition-all pr-12 ${
          isFocused ? 'text-emerald-400' : 'text-slate-500 group-hover:text-sky-400'
        }`}>
          {title}
        </h4>
        <div className="flex items-center gap-2 absolute top-4 right-4 focus-within:opacity-100">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFocus();
              onExpand();
            }}
            className={`flex items-center gap-1.5 transition-all p-1.5 rounded-md ${
              isFocused 
                ? 'opacity-100 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' 
                : 'opacity-0 group-hover:opacity-100 text-slate-500 group-hover:text-emerald-500 hover:bg-emerald-500/10'
            }`}
            title="Double-click card to expand to Intensive Editor"
          >
            <Maximize2 size={12} />
          </button>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse mt-1 ${
            isFocused ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-700 group-hover:bg-sky-500'
          }`}></div>
        </div>
      </div>


      <textarea 
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={onFocus}
        className={`bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 h-24 focus:outline-none focus:ring-1 resize-none placeholder-slate-800 transition-all focus:bg-slate-950 font-mono ${
          isFocused ? 'focus:ring-emerald-500/30' : 'focus:ring-sky-500/30'
        }`}
        placeholder={`Specify ${title.toLowerCase()}...`}
      />
    </div>
  );
};

const TAXONOMIES = {
    features: [
        { type: 'Ingestion Engine', desc: 'Handles raw data intake and structural validation.' },
        { type: 'Reasoning Agent', desc: 'The "Brain" that applies complex logic or research rules.' },
        { type: 'Transformation Layer', desc: 'Converts data from one state to another (e.g., Text to FST).' },
        { type: 'Synthesis Provider', desc: 'Generates human-readable summaries or reports.' },
        { type: 'Administrative Tool', desc: 'System-level functions like Auth, Logging, etc.' }
    ],
    useCases: [
        { type: 'Discovery Flow', desc: 'How the user finds or explores existing data/patterns.' },
        { type: 'Transaction Flow', desc: 'An action that changes the state of the system.' },
        { type: 'Exception Flow', desc: 'How the system handles errors or edge cases.' },
        { type: 'Insight Flow', desc: 'High-level data visualization or complex query results.' },
        { type: 'Agentic Flow', desc: 'A background task where the AI performs autonomous work.' }
    ],
    requirements: [
        { type: 'FR-Logic', desc: 'Mathematical or logical rules the AI must strictly follow.' },
        { type: 'FR-Data', desc: 'Constraints on data format, types, and referential integrity.' },
        { type: 'FR-Linguistic', desc: 'Formal language/Grammar constraints.' },
        { type: 'FR-Compliance', desc: 'Legal or regulatory standards.' },
        { type: 'FR-Performance', desc: 'Technical benchmarks for speed, latency, etc.' }
    ]
};

interface Project {
  project_id: string;
  name: string;
  description?: string;
  template_id?: string;
  version?: string;
  intent_v?: number;
  status?: string;
}

const NexusWorkbench = () => {
  // --- STATE ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState('genesis');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [content, setContent] = useState("");
  const [consolidatedPreview, setConsolidatedPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("INITIALIZING");
  const [isRawMode, setIsRawMode] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [focusedAspect, setFocusedAspect] = useState<string | null>(null);
  const [expandedAspect, setExpandedAspect] = useState<string | null>(null);
  
  // --- INGESTER STATE ---
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [ingestText, setIngestText] = useState("");
  
  // --- LOCAL MODAL STATE (FOR PERFORMANCE) ---
  const [modalDirectives, setModalDirectives] = useState<{id: string, key: string, value: string}[]>([]);
  const [modalDescription, setModalDescription] = useState("");
  
  // --- ASPECT PARSING ---
  const parseDirectives = (raw: string) => {
    const lines = raw.split('\n');
    const directives: {id: string, key: string, value: string}[] = [];
    let descriptionStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^-\s\*\*[^*]+\*\*:(\s.*)?$/)) {
        const match = line.match(/^-\s\*\*([^*]+)\*\*:(\s)?(.*)$/);
        if (match) {
          directives.push({
            id: `d-${i}-${Math.random().toString(36).substr(2, 9)}`,
            key: match[1],
            value: match[3] || ""
          });
          descriptionStart = i + 1;
        }
      } else if (line === "") {
        descriptionStart = i + 1;
      } else {
        break;
      }
    }
    
    return {
      directives,
      description: lines.slice(descriptionStart).join('\n')
    };
  };

  const serializeDirectives = (directives: {id: string, key: string, value: string}[], description: string) => {
    const lines = directives.map(d => `- **${d.key}**: ${d.value}`);
    if (lines.length > 0) {
      return lines.join('\n') + '\n\n' + description;
    }
    return description;
  };

  const getActiveAspects = () => {
    if (!activeProject?.template_id) return ASPECT_CONFIG;
    const template = availableTemplates.find(t => t.id === activeProject.template_id);
    return template?.aspects || ASPECT_CONFIG;
  };

  const parseMarkdownToAspects = (markdown: string, sectionId: string) => {
    const config = getActiveAspects()[sectionId];
    if (!config) return {};

    const values: Record<string, string> = {};
    const lines = markdown.split('\n');
    
    config.forEach(aspect => {
      let content = "";
      let found = false;
      const headerMarker = `- **${aspect}:**`;
      
      for (let i = 0; i < lines.length; i++) {
        // Match the exact aspect header
        if (lines[i].trim().startsWith(headerMarker)) {
          found = true;
          // Capture everything after the header marker line
          const lineRest = lines[i].substring(lines[i].indexOf(headerMarker) + headerMarker.length);
          // Only strip a SINGLE leading space if it exists (markdown standard format)
          // This keeps any subsequent user-intended spaces intact.
          content = lineRest.startsWith(' ') ? lineRest.substring(1) : lineRest;
          
          // Consume subsequent lines until we hit another aspect header
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            // Check if this line is the start of ANOTHER aspect in the current config
            const isNextAspect = config.some(a => nextLine.startsWith(`- **${a}:**`));
            if (isNextAspect) break;
            
            content += '\n' + lines[j];
          }
          break;
        }
      }
      values[aspect] = found ? content : ""; // Removed .trim() here to help with live editing stability
    });
    return values;
  };

  const serializeAspectsToMarkdown = (aspects: Record<string, string>) => {
    return Object.entries(aspects)
      .map(([key, value]) => `- **${key}:** ${value}`)
      .join('\n');
  };
  
  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // --- INITIALIZATION ---
  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setAvailableTemplates(data);
      }
    } catch (err) {}
  };

  const loadProjects = async () => {
    try {
      await loadTemplates();
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error("Backend Offline");
      const data = await response.json();
      setProjects(data || []);
      
      // If we have an active project already, find its updated version in the new data
      if (activeProject) {
        const updated = (data || []).find((p: Project) => p.project_id === activeProject.project_id);
        if (updated) setActiveProject(updated);
      } else if (data && data.length > 0) {
        setActiveProject(data[0]);
      }
      
      setStatus("READY");
    } catch (err) {
      console.error("FS Error:", err);
      setStatus("OFFLINE");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // --- ARTIFACT LOADING ---
  const loadArtifactContent = async () => {
    if (!activeProject?.project_id) return;
    
    setStatus(`LOADING ${activeSection.toUpperCase()}`);
    try {
      const url = activeSection === 'genesis' 
        ? `/api/projects/${activeProject.project_id}/artifacts/genesis`
        : `/api/projects/${activeProject.project_id}/artifacts/discovery/${activeSection}`;
        
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || "");
        setStatus("SYNCED");
      }
    } catch (err) {
      console.error("Load failed:", err);
      setStatus("READ ERROR");
    } finally {
      setTimeout(() => setStatus("READY"), 1000);
    }
  };

  const loadConsolidatedPreview = async () => {
     if (!activeProject?.project_id) return;
     try {
       const response = await fetch(`/api/projects/${activeProject.project_id}/artifacts/genesis?consolidated=true`);
       if (response.ok) {
         const data = await response.json();
         setConsolidatedPreview(data.content || "");
       }
     } catch (err) {}
  };

  useEffect(() => {
    loadArtifactContent();
    loadConsolidatedPreview();
  }, [activeProject?.project_id, activeSection]);

  // Handle Modal Initialization
  useEffect(() => {
    if (expandedAspect) {
      const raw = parseMarkdownToAspects(content, activeSection)[expandedAspect] || "";
      const { directives, description } = parseDirectives(raw);
      setModalDirectives(directives);
      setModalDescription(description);
    }
  }, [expandedAspect]);

  // Debounced Sync from Modal to Content
  useEffect(() => {
    if (!expandedAspect || !modalDirectives) return;

    const handler = setTimeout(() => {
      const updatedAspects = { 
        ...parseMarkdownToAspects(content, activeSection), 
        [expandedAspect]: serializeDirectives(modalDirectives, modalDescription)
      };
      const newContent = serializeAspectsToMarkdown(updatedAspects);
      if (newContent !== content) {
        setContent(newContent);
      }
    }, 500); // 500ms debounce for performance

    return () => clearTimeout(handler);
  }, [modalDirectives, modalDescription]);

  // --- ACTIONS ---
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    setStatus("CREATING...");
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProjectName, 
          description: "Nexus Project"
        })
      });

      if (response.ok) {
        const data = await response.json();
        await loadProjects(); 
        setActiveProject(data); // Focus the newly created project
        setActiveSection('genesis'); // Ensure we start at genesis
        setIsModalOpen(false);
        setNewProjectName("");
        setStatus("PROJECT CREATED");
      }
    } catch (err) {
      setStatus("CREATE FAILED");
    }
  };

  const handleIngest = async () => {
    console.log("🛠️ Ingest initiated for content:", ingestText.substring(0, 50) + "...");
    if (!ingestText.trim()) return;
    setStatus("INGESTING...");
    try {
      const response = await fetch('/api/ingest_mgt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ingestText })
      });
      console.log("📡 Ingest response status:", response.status);
      if (response.ok) {
        await loadTemplates();
        setIsIngestModalOpen(false);
        setIngestText("");
        setStatus("INGEST_COMPLETE");
      } else {
        const err = await response.text();
        console.error("❌ Ingest failed:", err);
      }
    } catch (err) {
      console.error("🔥 Ingest exception:", err);
      setStatus("INGEST_FAILED");
    } finally {
      setTimeout(() => setStatus("READY"), 2000);
    }
  };
  
  const handleSave = async () => {
    if (!activeProject?.project_id) return;

    setIsSaving(true);
    setStatus("SYNCING SECTION...");
    
    try {
      const response = await fetch(`/api/projects/${activeProject.project_id}/artifacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: "GENESIS_PROMPT", 
          section_id: activeSection,
          content: content 
        })
      });

      if (!response.ok) throw new Error("Server rejected save");
      
      const data = await response.json();
      if (data.intent_v) {
        setActiveProject({ ...activeProject, intent_v: data.intent_v });
        setStatus("SAVED");
        loadConsolidatedPreview(); // Refresh preview after save
      }
    } catch (err) {
      console.error("❌ Save Error:", err);
      setStatus("WRITE ERROR");
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus("READY"), 2000);
    }
  };

  const handleSelectTypology = async (templateId: string) => {
    if (!activeProject?.project_id) return;
    setStatus("INITIALIZING TYPOLOGY...");
    try {
      const response = await fetch(`/api/projects/${activeProject.project_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId })
      });
      if (response.ok) {
        await loadProjects(); 
        setStatus("TYPOLOGY_READY");
      }
    } catch (err) {
      setStatus("SELECTION_FAILED");
    } finally {
      setTimeout(() => setStatus("READY"), 2000);
    }
  };

  const handleDispatch = async () => {
    if (!activeProject?.project_id) return;
    try {
      const response = await fetch(`/api/projects/${activeProject.project_id}/dispatch?model=${selectedModel}`);
      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (err) { setStatus("PORTAL ERROR"); }
  };

  if (status === "INITIALIZING" && projects.length === 0) {
    return <div className="h-screen bg-slate-950 flex items-center justify-center text-sky-500 font-mono tracking-widest animate-pulse">NEXUS_CORE_BOOTING...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30">
      {/* HEADER */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Layers className="text-sky-400 w-5 h-5" />
          <h1 className="font-bold tracking-tighter text-lg uppercase italic">NEXUS<span className="text-sky-500">.sync</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase mr-4 tracking-widest">{status}</div>
          <button 
            onClick={handleSave} 
            disabled={isSaving || !activeProject}
            className="group flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-md text-sm border border-slate-700 transition-all active:scale-95 disabled:opacity-30"
          >
            <Save size={16} className={isSaving ? "animate-spin" : "group-hover:text-sky-400"} />
            {isSaving ? "Syncing..." : "Sync Discovery"}
          </button>

          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          >
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
            <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
          </select>

          <button onClick={handleDispatch} disabled={!activeProject} className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-sky-500/20">
            <Zap size={16} fill="currentColor" /> Dispatch Intent
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col">
          {/* PROJECT SELECTOR (TOP) */}
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Core</h2>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="p-1 hover:bg-slate-800 rounded text-sky-400 transition-colors"
                title="Initialize New Core"
              >
                <Plus size={14} />
              </button>
            </div>
            <select 
              value={activeProject?.project_id || ""}
              onChange={(e) => {
                const proj = projects.find(p => p.project_id === e.target.value);
                if (proj) setActiveProject(proj);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-sky-400 outline-none focus:ring-1 focus:ring-sky-500/50 appearance-none cursor-pointer font-mono"
            >
              <option value="" disabled>Select Project...</option>
              {projects.map(proj => (
                <option key={proj.project_id} value={proj.project_id}>{proj.name}</option>
              ))}
            </select>
          </div>

          {/* DISCOVERY BLOCKS (FLUSHED TO TOP UNDER SELECTOR) */}
          <div className="flex-1 flex flex-col pt-2">
            <div className="px-4 py-2">
              <h2 className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Discovery Blocks</h2>
            </div>
            <nav className="px-2 space-y-1 overflow-y-auto">
              {SECTIONS.filter(s => activeProject?.template_id || s.id === 'genesis').map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex flex-col items-start gap-1 px-4 py-3 rounded-xl transition-all group border ${
                    activeSection === section.id
                      ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <section.icon 
                      size={18} 
                      className={activeSection === section.id ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-400'} 
                    />
                    <span className="font-bold text-[13px] tracking-tight uppercase">{section.label}</span>
                  </div>
                  <span className={`text-[10px] pl-7 italic font-medium ${activeSection === section.id ? 'text-sky-500/70' : 'text-slate-600'}`}>
                    {section.sub}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* EDITOR */}
        <section className="flex-1 flex flex-col bg-slate-950 p-6">
          <div className="mb-4 flex justify-between items-end">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white tracking-wider uppercase mb-1 flex items-center">
                  Intent editor <span className="text-sky-400 ml-4 pl-4 border-l-2 border-sky-500/30">{SECTIONS.find(s => s.id === activeSection)?.label || activeSection}</span>
              </h2>
              <code className="text-[10px] text-sky-500/70 tracking-tight block truncate max-w-md">
                {activeProject ? `blueprint/${activeProject.project_id}/${activeSection === 'genesis' ? 'genesis.md' : activeSection + '/core.md'}` : 'No project selected'}
              </code>
            </div>
            

            {activeSection === 'genesis' && activeProject && !content.trim() && (
                <button 
                    onClick={async () => {
                        const templateId = activeProject.template_id || 'master_genesis';
                        const res = await fetch(`/api/templates/${templateId}`);
                        if (res.ok) {
                            const data = await res.json();
                            setContent(data.content.replace('{{PROJECT_NAME}}', activeProject.name));
                        }
                    }}
                    className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-3 py-1 rounded text-[10px] font-bold border border-sky-500/20 transition-all uppercase tracking-tighter"
                >
                    <Plus size={12} /> Load Master Template
                </button>
            )}
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsRawMode(!isRawMode)}
                className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${
                  isRawMode 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' 
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                {isRawMode ? 'RAW_MODE_ACTIVE' : 'GUI_MODE_ACTIVE'}
              </button>
              <div className="text-[10px] font-mono text-slate-600 uppercase">Markdown Mode</div>
            </div>
          </div>

          {/* SECTION PURPOSE DESCRIPTION */}
          {activeSection && activeSection !== 'genesis' && (
              <div className="mb-6 bg-sky-500/5 border-l-2 border-sky-500/50 p-4 rounded-r-lg animate-in fade-in slide-in-from-left-2 duration-500">
                  <div className="flex items-center gap-2 mb-1">
                      <Microscope size={12} className="text-sky-400" />
                      <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Purpose Directive</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                      {SECTION_EXPLANATIONS[activeSection as keyof typeof SECTION_EXPLANATIONS] || 
                       SECTION_EXPLANATIONS[activeSection.replace('-', '') as keyof typeof SECTION_EXPLANATIONS] ||
                       "Define this architectural segment to refine the overall system intent."}
                  </p>
              </div>
          )}

          {/* EDITOR SURFACE */}
          {activeSection === 'genesis' && !activeProject?.template_id ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900/20 rounded-2xl border border-slate-800/50 border-dashed animate-in fade-in zoom-in duration-500">
               <div className="text-center mb-10 max-w-lg">
                  <h3 className="text-sky-400 font-bold tracking-widest text-lg uppercase mb-2">Initialize Application Typology</h3>
                  <p className="text-xs text-slate-500 leading-relaxed italic">Select a Master Genesis Template to define the architectural intent and discovery roadmap for this project.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                  {availableTemplates.slice(0, 5).map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => handleSelectTypology(t.id)}
                      className="flex flex-col text-left p-6 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group active:scale-[0.98]"
                    >
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{t.name}</span>
                         <Plus size={14} className="text-slate-700 group-hover:text-sky-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{t.description}</p>
                    </button>
                  ))}
                  {/* INGEST CUSTOM MGT CARD */}
                  <button 
                      onClick={() => setIsIngestModalOpen(true)}
                      className="flex flex-col text-left p-6 bg-emerald-900/10 border border-emerald-800/50 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group active:scale-[0.98] border-dashed"
                    >
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ingest Custom MGT</span>
                         <Terminal size={14} className="text-emerald-700 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-emerald-500/60 leading-relaxed group-hover:text-emerald-400/80 transition-colors">Paste a text-based Master Genesis Template to add it to your collection.</p>
                  </button>
               </div>
            </div>
          ) : getActiveAspects()[activeSection] && !isRawMode ? (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getActiveAspects()[activeSection].map((aspect) => {
                  const currentTemplate = availableTemplates.find(t => t.id === activeProject?.template_id);
                  const aspectTaxonomies = currentTemplate?.taxonomies?.[aspect] || [];
                  
                  return (
                    <ProjectAspectCard
                      key={aspect}
                      title={aspect}
                      taxonomies={aspectTaxonomies}
                      isFocused={focusedAspect === aspect}
                      onFocus={() => setFocusedAspect(aspect)}
                      onExpand={() => setExpandedAspect(aspect)}
                      value={parseMarkdownToAspects(content, activeSection)[aspect] || ""}
                      onChange={(newVal) => {
                        const currentAspects = parseMarkdownToAspects(content, activeSection);
                        const updatedAspects = { ...currentAspects, [aspect]: newVal };
                        setContent(serializeAspectsToMarkdown(updatedAspects));
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-8 font-mono text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500/30 resize-none shadow-inner"
              placeholder={activeProject ? "Refine architectural intent..." : "Select or create a project..."}
            />
          )}

          {/* EXPANDED MODAL OVERLAY (75% of viewport) */}
          {expandedAspect && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
               <div 
                 className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500"
                 onClick={(e) => e.stopPropagation()}
               >
                  {/* MODAL HEADER */}
                  <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                      <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Maximize2 size={16} /> Intention Surface
                      </h3>
                      <p className="text-xl font-bold text-white tracking-tight leading-none uppercase">{expandedAspect}</p>
                    </div>
                    <button 
                      onClick={() => setExpandedAspect(null)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all flex items-center gap-2 font-bold text-xs"
                    >
                      <Minimize2 size={16} /> Contract Editor
                    </button>
                  </div>                  {/* MODAL BODY */}
                  <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                     {/* CONTEXT HELP */}
                     <div className="bg-sky-500/5 border-l-2 border-sky-500/30 p-5 rounded-r-lg">
                        <p className="text-xs text-secondary italic leading-relaxed">
                          Refining <span className="text-sky-400 font-bold px-1 uppercase">{expandedAspect}</span> for the consolidated genesis intent. Changes will synchronize automatically to the metadata layer.
                        </p>
                     </div>

                     {/* TYPOLOGY & CUSTOM ACTIONS (Now at the top) */}
                     <div className="space-y-3 pb-2">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-bold text-muted uppercase tracking-widest">insert directive from typology</label>
                           <button 
                             onClick={() => {
                               const tempId = `new-${Date.now()}`;
                               setModalDirectives([...modalDirectives, {
                                 id: tempId,
                                 key: `NEW_DIRECTIVE_${modalDirectives.length + 1}`,
                                 value: ""
                               }]);
                             }}
                             className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest"
                           >
                             <PlusCircle size={14} /> + add new directive
                           </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                           {availableTemplates.find(t => t.id === activeProject?.template_id)?.taxonomies?.[expandedAspect]?.map(t => {
                             const isActive = modalDirectives.some(d => d.key === t);
                             
                             return (
                               <button
                                 key={t}
                                 disabled={isActive}
                                 onClick={() => {
                                   if (!isActive) {
                                     setModalDirectives([...modalDirectives, {
                                       id: `typology-${Date.now()}-${t}`,
                                       key: t,
                                       value: ""
                                     }]);
                                   }
                                 }}
                                 className={`px-3 py-1.5 border rounded-lg text-[10px] transition-all ${
                                   isActive 
                                     ? 'bg-slate-900 border-slate-800 text-slate-700 opacity-40 cursor-not-allowed' 
                                     : 'bg-slate-800/30 hover:bg-sky-500/10 border-slate-800/50 hover:border-sky-500/30 text-secondary hover:text-sky-300'
                                 }`}
                               >
                                 {t}
                               </button>
                             );
                           })}
                        </div>
                     </div>

                     {/* UNIFIED INTENTION SURFACE CONTAINER */}
                     <div className="flex-1 flex flex-col bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden min-h-[400px]">
                        
                        {/* THE ARCHITECTURAL DIRECTIVES (STRUCTURED ROWS) */}
                        <div className="p-6 border-b border-slate-800/50 bg-slate-900/20">
                           <div className="flex items-center justify-between mb-4">
                              <label className="text-xs font-bold text-accent uppercase tracking-widest">Architectural Intent Record</label>
                              <span className="text-[10px] text-muted font-mono italic">Structured & Free-form Hybrid</span>
                           </div>

                           <div className="flex flex-col gap-3">
                              {modalDirectives.map((d) => {
                                 const isPredefined = availableTemplates.find(t => t.id === activeProject?.template_id)?.taxonomies?.[expandedAspect]?.includes(d.key);
                                 
                                 return (
                                   <div key={d.id} className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-300">
                                      <button 
                                         onClick={() => {
                                           setModalDirectives(modalDirectives.filter(item => item.id !== d.id));
                                         }}
                                         className="shrink-0 text-slate-600 hover:text-red-500 transition-colors"
                                      >
                                         <MinusCircle size={20} />
                                      </button>
                                      
                                      {isPredefined ? (
                                        <div className="w-32 lg:w-48 shrink-0 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2">
                                           <span className="text-xs font-bold text-sky-400 uppercase tracking-tighter truncate block">{d.key}</span>
                                        </div>
                                      ) : (
                                        <input 
                                           type="text"
                                           value={d.key}
                                           placeholder="Directive Name..."
                                           onChange={(e) => {
                                             setModalDirectives(modalDirectives.map(item => 
                                                item.id === d.id ? { ...item, key: e.target.value } : item
                                             ));
                                           }}
                                           className="w-32 lg:w-48 shrink-0 bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500/50 transition-all uppercase tracking-tighter"
                                        />
                                      )}
                                      
                                      <input 
                                         type="text"
                                         value={d.value}
                                         placeholder={`Constraint for ${d.key}...`}
                                         onChange={(e) => {
                                            setModalDirectives(modalDirectives.map(item => 
                                               item.id === d.id ? { ...item, value: e.target.value } : item
                                            ));
                                         }}
                                         className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2 text-sm text-primary focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                      />
                                   </div>
                                 );
                              })}
                              {modalDirectives.length === 0 && (
                                 <p className="text-[10px] text-slate-700 italic py-2 text-center uppercase tracking-widest bg-slate-900/20 rounded-lg border border-dashed border-slate-800/50">No structured directives active...</p>
                              )}
                           </div>
                        </div>

                        {/* FREE FORM DESCRIPTION SECTION */}
                        <div className="flex-1 relative group">
                           <textarea 
                             autoFocus
                             value={modalDescription}
                             onChange={(e) => setModalDescription(e.target.value)}
                             className="w-full h-full bg-transparent p-8 font-mono text-base text-primary focus:outline-none resize-none leading-relaxed"
                             placeholder={`Specify ${expandedAspect.toLowerCase()} in detail...`}
                           />
                        </div>
                     </div>
                  </div>
                   {/* MODAL FOOTER */}
                   <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                      <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mr-auto flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         CORE_SYNC_ACTIVE: {activeProject?.project_id}/{activeSection}/{expandedAspect}
                      </div>
                   </div>
               </div>
            </div>
          )}
        </section>

        {/* ORBIT */}
        <aside className="w-96 border-l border-slate-800 bg-slate-900/30 flex flex-col hidden xl:flex">
          <div className="p-6 border-b border-slate-800/50">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Microscope size={14} /> Consolidated Intent
            </h2>
          </div>
          <div className="flex-1 p-6 overflow-y-auto font-mono text-[11px] text-amber-400/90 leading-relaxed whitespace-pre-wrap select-none">
            {consolidatedPreview || "No intentional blocks synchronized..."}
          </div>
          <div className="p-6 border-t border-slate-800/50 bg-slate-950/50">
             <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">GAS Laboratory</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[9px] font-bold text-emerald-500">LINK_ACTIVE</span>
                    </div>
                </div>
                <div className="flex justify-between items-center opacity-40">
                    <span className="text-[10px] text-slate-600 uppercase tracking-tighter">GAG Factory</span>
                    <span className="text-[9px] font-bold text-slate-600">STANDBY</span>
                </div>
             </div>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="h-10 border-t border-slate-800 bg-slate-900 px-6 flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono tracking-tighter">
        <div className="flex items-center gap-4">
          <span className={activeProject ? 'text-sky-400' : ''}>{activeProject?.name || 'STANDBY'}</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">{activeSection.replace('_', ' ')}</span>
        </div>
        <div className="flex gap-6">
          <span>Intent_v <span className="text-sky-400">{activeProject?.intent_v || 0}</span></span>
          <span className="flex items-center gap-1"><Activity size={10} className="text-emerald-500" /> Core_Stable</span>
        </div>
      </footer>

      {/* INGEST MODAL */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-[800px] shadow-2xl h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-emerald-400 tracking-tight flex items-center gap-2">
                        <Terminal size={20} /> MGT_INGESTER_CORE
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Paste your Master Genesis Template below</p>
                </div>
                <button onClick={() => setIsIngestModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <textarea 
               autoFocus 
               value={ingestText} 
               onChange={(e) => setIngestText(e.target.value)} 
               className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-6 text-emerald-500/90 outline-none focus:border-emerald-500/50 transition-all font-mono text-sm resize-none mb-6 leading-relaxed" 
               placeholder={`TEMPLATE: My Custom Archetype\nASPECT: architecture\nTYPOLOGY:\n- High Performance: Low latency sub-10ms\n- Scalable: Distributed node mesh\n...`} 
            />
            
            <div className="flex gap-4 justify-end items-center">
              <span className="text-[9px] text-slate-600 font-mono italic mr-auto">Format: TEMPLATE | ASPECT | TYPOLOGY [Directive: Value]</span>
              <button onClick={() => setIsIngestModalOpen(false)} className="px-4 py-2 text-slate-400 text-sm hover:text-white transition-colors uppercase font-bold tracking-widest text-[10px]">Abort</button>
              <button onClick={handleIngest} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/20 uppercase tracking-widest">INGEST_TEMPLATE</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-[440px] shadow-2xl shadow-sky-500/10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-sky-400 tracking-tight">Initialize New Project</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed uppercase tracking-tighter">Genesis prompts dictate architectural intent and discovery roadmaps.</p>
            
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 block">Project Identity</label>
                  <input autoFocus value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-sky-500 transition-all font-mono text-sm" placeholder="PROJECT_IDENTITY..." />
               </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-800/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 text-sm hover:text-white transition-colors uppercase font-bold text-[10px] tracking-widest">Abort</button>
              <button onClick={handleCreateProject} className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-2.5 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-lg shadow-sky-500/20 uppercase tracking-widest">Init_Core</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default NexusWorkbench;
