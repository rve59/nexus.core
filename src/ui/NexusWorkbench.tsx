import React, { useState, useEffect } from 'react';
import { 
  Terminal, Database, GitBranch, Zap, Layers, 
  Save, Activity, Cpu, History, FolderOpen, Plus, X 
} from 'lucide-react';

const NexusWorkbench = () => {
  // --- STATE ---
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("INITIALIZING");
  
  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // --- INITIALIZATION ---
  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error("Backend Offline");
      const data = await response.json();
      setProjects(data || []);
      if (data && data.length > 0 && !activeProject) {
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
  useEffect(() => {
    const loadArtifactContent = async () => {
      if (!activeProject?.project_id) return;
      
      setStatus("LOADING...");
      try {
        const response = await fetch(`/api/projects/${activeProject.project_id}/artifacts/genesis`);
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
    loadArtifactContent();
  }, [activeProject?.project_id]);

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
	      // IMPORTANT: Wait for the list to reload from the server
	      await loadProjects(); 
	      
	      // Reset the UI
	      setIsModalOpen(false);
	      setNewProjectName("");
	      setStatus("PROJECT CREATED");
	    } else {
	      const errorData = await response.json();
	      console.error("Server refused creation:", errorData);
	      setStatus("CREATE REFUSED");
	    }
	  } catch (err) {
	    console.error("Network Error:", err);
	    setStatus("CREATE FAILED");
	  }
	};
	
	
	
const handleSave = async () => {
  if (!activeProject?.project_id) {
    console.warn("⚠️ No active project selected for save.");
    return;
  }

  // Debug: Check the state in the browser console (F12)
  console.log("💾 Attempting save for:", activeProject.project_id);
  console.log("📝 Content to save:", content);

  setIsSaving(true);
  setStatus("WRITING...");
  
  try {
    const response = await fetch(`/api/projects/${activeProject.project_id}/artifacts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      // Ensure we are sending the keys the Pydantic model expects
      body: JSON.stringify({ 
        type: "GENESIS_PROMPT", 
        content: content 
      })
    });

    if (!response.ok) throw new Error("Server rejected save");
    
    const data = await response.json();
    if (data.intent_v) {
      setActiveProject({ ...activeProject, intent_v: data.intent_v });
      setStatus("SAVED");
    }
  } catch (err) {
    console.error("❌ Save Fetch Error:", err);
    setStatus("WRITE ERROR");
  } finally {
    setIsSaving(false);
    setTimeout(() => setStatus("READY"), 2000);
  }
};



  const handleDispatch = async () => {
    if (!activeProject?.project_id) return;
    try {
      const response = await fetch(`/api/projects/${activeProject.project_id}/dispatch`);
      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (err) { setStatus("PORTAL ERROR"); }
  };

  // --- SAFETY GUARD ---
  // If we are still initializing and have no projects, show a simple loading shell
  if (status === "INITIALIZING" && projects.length === 0) {
    return <div className="h-screen bg-slate-950 flex items-center justify-center text-sky-500 font-mono tracking-widest animate-pulse">NEXUS_CORE_BOOTING...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30">
      {/* HEADER */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Layers className="text-sky-400 w-5 h-5" />
          <h1 className="font-bold tracking-tighter text-lg uppercase">NEXUS<span className="text-sky-500">.core</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase mr-4 tracking-widest">{status}</div>
          <button 
		  onClick={handleSave} // <--- MUST MATCH THE FUNCTION NAME BELOW
		  disabled={isSaving || !activeProject}
		  className="group flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-md text-sm border border-slate-700 transition-all active:scale-95 disabled:opacity-30"
		>
		  <Save size={16} className={isSaving ? "animate-spin" : "group-hover:text-sky-400"} />
		  {isSaving ? "Syncing..." : "Save Artifact"}
	  </button>

          <button onClick={handleDispatch} disabled={!activeProject} className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2">
            <Zap size={16} fill="currentColor" /> Dispatch
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col">
          <div className="p-4 border-b border-slate-800/50 flex justify-between items-center">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projects</h2>
            <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-slate-800 rounded text-sky-400 transition-colors"><Plus size={14} /></button>
          </div>
          <div className="space-y-1 p-2 overflow-y-auto">
            {projects.map((proj) => (
              <div key={proj.project_id} onClick={() => setActiveProject(proj)}
                className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-all ${activeProject?.project_id === proj.project_id ? 'bg-sky-500/20 text-sky-200 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800'}`}>
                <Terminal size={14} />
                <span className="truncate">{proj.name}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* EDITOR */}
        <section className="flex-1 flex flex-col bg-slate-950 p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Editor</h2>
            <code className="text-[10px] text-slate-500 tracking-tight">{activeProject ? `blueprint/${activeProject.name}/genesis.md` : 'No project selected'}</code>
          </div>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-6 font-mono text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500/30 resize-none"
            placeholder={activeProject ? "Begin architectural intent..." : "Select or create a project..."}
          />
        </section>

        {/* ORBIT */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/30 p-6 hidden lg:block">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Player Orbit</h2>
          <div className="space-y-4">
             <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">GAS Laboratory</span>
                <span className="text-[10px] font-bold text-amber-500">ACTIVE</span>
             </div>
             <div className="flex justify-between border-b border-slate-800 pb-2 text-slate-600">
                <span className="text-xs">GAG Factory</span>
                <span className="text-[10px] font-bold">READY</span>
             </div>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="h-10 border-t border-slate-800 bg-slate-900 px-6 flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono tracking-tighter">
        <div>{activeProject?.name || 'STANDBY'}</div>
        <div className="flex gap-4">
          <span>Intent_v <span className="text-sky-400">{activeProject?.intent_v || 0}</span></span>
        </div>
      </footer>


      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-sky-400">New Project</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <input autoFocus value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white mb-6 outline-none focus:border-sky-500" placeholder="Project Name..." />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400">Cancel</button>
              <button onClick={handleCreateProject} className="bg-sky-600 text-white px-6 py-2 rounded-lg font-bold">Create</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default NexusWorkbench;
