import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MGT_ASPECTS = [
  { id: 'A', name: 'Architecture', label: 'A. Architecture' },
  { id: 'B', name: 'Brain', label: 'B. Logic & Orchestration' },
  { id: 'C', name: 'Memory', label: 'C. Storage & Persistence' },
  { id: 'D', name: 'Skeleton', label: 'D. Cross-Cutting Concerns' },
  { id: 'E', name: 'Vessel', label: 'E. Infrastructure & Deployment' },
  { id: 'F', name: 'Judge', label: 'F. Quality & Verification' },
  { id: 'G', name: 'Action', label: 'G. Use-Cases & Agentic Loops' },
  { id: 'H', name: 'Reality', label: 'H. Domain Specification' },
  { id: 'I', name: 'Organs', label: 'I. Specialized Agents' }
];

const VISION_ENTRY = { id: 'vision', name: 'Vision', label: 'VISION' };
const TYPOLOGY_ENTRY = { id: '0', name: 'Typology', label: 'Application Typology' };

const TEMPLATES = [
  'Monolithic Modular',
  'Distributed Microservices',
  'Serverless / Event-Driven',
  'Edge-Centric',
  'Hexagonal (Ports & Adapters)',
  'BFF (Backend for Frontend)',
  'CQRS'
];

const TYPOLOGY_DATA = [
  { id: 1, category: "Small-to-Midscale Productivity", types: "1. Team Collaboration Hub\n2. Internal Knowledge Base\n3. IT Asset Management Portal\n4. Niche Community Wiki\n5. Project Coordination Tool", typology: "Monolithic Modular" },
  { id: 2, category: "Global Scale Hyper-Services", types: "1. E-commerce Marketplace\n2. Global Video Streaming Service\n3. Ride-Sharing Orchestrator\n4. Hyper-scale Social Network\n5. Multi-tenant SaaS Ecosystem", typology: "Distributed Microservices" },
  { id: 3, category: "Reactive Data Pipelines", types: "1. Real-time Threat Analytics\n2. Media Transcoding Pipeline\n3. IoT Sensor Ingestion Engine\n4. Log Monitoring & Alerting\n5. Transaction Reconciliation Service", typology: "Serverless / Event-Driven" },
  { id: 4, category: "Real-time Collaborative Tools", types: "1. Collaborative Document Suite\n2. Browser-based Vector Design Tool\n3. P2P Field Research Application\n4. Multi-user Code Workspace\n5. Local-first Personal CRM", typology: "Edge-Centric" },
  { id: 5, category: "Domain-Strict Critical Engines", types: "1. Centralized Financial Ledger\n2. Regulatory Reporting Engine\n3. Clinical Health Data Repository\n4. Insurance Claims Processing Hub\n5. Cross-border Payment Gateway", typology: "Hexagonal (Ports & Adapters)" },
  { id: 6, category: "Omni-channel Delivery", types: "1. Multi-device Travel Booking Engine\n2. Educational Video Library (LMS)\n3. Digital News & Magazine Hub\n4. Customer Service Dashboard\n5. Smart Home Control Interface", typology: "BFF (Backend for Frontend)" },
  { id: 7, category: "Audited High-Performance Systems", types: "1. Disclosure & Financial Reporting Suite\n2. High-frequency Order Book\n3. Real-time Inventory Ledger\n4. Patient Vital Monitoring System\n5. Election Results Aggregator", typology: "CQRS" }
];

const INITIAL_DIRECTIVE_STATE = [VISION_ENTRY, TYPOLOGY_ENTRY, ...MGT_ASPECTS].reduce((acc, aspect) => {
  acc[aspect.id] = {
    selections: [],
    notes: '',
    typologyIds: [],
    synthesizedData: null
  };
  return acc;
}, {});

function App() {
  // Global State
  const [visionStatement, setVisionStatement] = useState('');
  const [session, setSession] = useState(null);
  const [activeLayer, setActiveLayer] = useState(VISION_ENTRY);
  const [template, setTemplate] = useState(TEMPLATES[3]);
  const [loading, setLoading] = useState(false);
  const [taxonomyContent, setTaxonomyContent] = useState('');
  
  // Per-Directive Persistent State
  const [directiveStates, setDirectiveStates] = useState(INITIAL_DIRECTIVE_STATE);

  // UI States
  const [splitWidth, setSplitWidth] = useState(55);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (activeLayer.id !== '0' && activeLayer.id !== 'vision') {
        fetchTaxonomy(activeLayer.id);
    }
  }, [activeLayer]);

  const fetchTaxonomy = async (id) => {
    try {
      const res = await fetch(`/api/taxonomy/${id}`);
      const data = await res.json();
      setTaxonomyContent(data.content);
    } catch (err) {
      console.error("Failed to fetch taxonomy", err);
    }
  };

  const handleResize = (e) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) setSplitWidth(newWidth);
  };

  const updateDirectiveState = (id, updates) => {
    setDirectiveStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: visionStatement })
      });
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error("Failed to start session", err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeVision = async () => {
    setLoading(true);
    try {
      // 1. Analyze for Typologies
      const suggestRes = await fetch('/api/suggest_typologies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vision_text: visionStatement })
      });
      const suggestData = await suggestRes.json();
      
      // 2. Pre-select in Typology Panel
      updateDirectiveState('0', { typologyIds: suggestData.suggested_ids || [] });
      
      // 3. Start Session (Intent Anchoring)
      if (!session) {
        await startSession();
      }

      // 4. Switch to Typology Panel
      setActiveLayer(TYPOLOGY_ENTRY);
    } catch (err) {
      console.error("Vision analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  const synthesizeLayer = async () => {
    const currentState = directiveStates[activeLayer.id];
    let finalIntent = visionStatement;
    let finalContext = currentState.selections.join(', ');

    // Special Logic for Typology (0)
    if (activeLayer.id === '0') {
      if (currentState.typologyIds && currentState.typologyIds.length > 0) {
        const selectedNames = TYPOLOGY_DATA
          .filter(t => currentState.typologyIds.includes(t.id))
          .map(t => t.typology)
          .join(', ');
        finalContext = `Selected Typologies: ${selectedNames}\n${finalContext}`;
      }
      if (currentState.notes) {
        finalIntent = `${currentState.notes}\n\nVision Background: ${visionStatement}`;
      }
    } else {
        if (currentState.notes) {
            finalIntent = `${currentState.notes}\n\nLayer Context: ${visionStatement}`;
        }
    }

    setLoading(true);
    try {
      if (!session) {
        const startRes = await fetch('/api/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intent: finalIntent })
        });
        const startData = await startRes.json();
        setSession(startData);
      }

      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          layer_id: activeLayer.id === '0' ? 'A' : activeLayer.id,
          layer_name: activeLayer.name,
          intent: finalIntent,
          context: finalContext
        })
      });
      const data = await res.json();
      updateDirectiveState(activeLayer.id, { synthesizedData: data });
    } catch (err) {
      console.error("Synthesis failed", err);
    } finally {
      setLoading(false);
    }
  };

  const finalizeLayer = async () => {
    const data = directiveStates[activeLayer.id].synthesizedData;
    if (!data) return;
    setLoading(true);
    try {
      await fetch('/api/finalize_layer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layer_id: activeLayer.id === '0' ? 'A' : activeLayer.id,
          layer_name: activeLayer.name,
          components: data.components
        })
      });
      alert(`${activeLayer.label} finalized!`);
    } catch (err) {
      console.error("Finalization failed", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id, label) => {
    const current = directiveStates[id].selections;
    const next = current.includes(label) ? current.filter(l => l !== label) : [...current, label];
    updateDirectiveState(id, { selections: next });
  };

  const currentState = directiveStates[activeLayer.id];

  return (
    <div 
      className="flex flex-col h-screen bg-[#010409] text-gray-100 font-sans select-none overflow-hidden"
      onMouseMove={handleResize}
      onMouseUp={() => setIsResizing(false)}
    >
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0d1117] relative z-50">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-12">
            <span className="text-xl font-black text-white -rotate-12">N</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white">NEXUS AGENTIC MGT WIZARD</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Architectural Inception Proto v4</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/5 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Active System</span>
          </div>
          {session && session.session_id && (
            <div className="text-[10px] text-gray-500 font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              Session: <span className="text-purple-400">{session.session_id}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/5 min-w-[280px] bg-[#0d1117] border-r border-gray-800 flex flex-col p-5 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Templates</label>
            <div className="flex space-x-2">
              <div className="relative flex-1 group">
                <select 
                  value={template} 
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full bg-[#161b22] border border-gray-800 text-[12px] rounded-xl p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all cursor-pointer hover:border-gray-700 font-bold text-gray-300"
                >
                  {TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 group-hover:text-purple-400 scale-75">▼</div>
              </div>
              <button 
                onClick={() => alert("Creating new empty MGT template...")}
                className="px-3 bg-[#161b22] border border-gray-800 rounded-xl hover:bg-white/5 transition-all text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-tighter"
              >
                NEW MGT
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar flex flex-col">
            {/* New Solution Types Section */}
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1 mb-4 block">Solution Types</label>
            
            <button
               onClick={() => setActiveLayer(VISION_ENTRY)}
               className={`w-full text-left p-3 mb-1 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden border ${
                 activeLayer.id === 'vision' 
                   ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10' 
                   : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border-transparent'
               }`}
            >
               <div className={`w-1 h-4 rounded-full mr-3 transition-all duration-300 ${
                  activeLayer.id === 'vision' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-transparent'
                }`} />
               <span className="text-[11px] font-black tracking-tight">{VISION_ENTRY.label}</span>
            </button>

            <button
               onClick={() => setActiveLayer(TYPOLOGY_ENTRY)}
               className={`w-full text-left p-3 mb-8 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden border ${
                 activeLayer.id === '0' 
                   ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10' 
                   : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border-transparent'
               }`}
            >
               <div className={`w-1 h-4 rounded-full mr-3 transition-all duration-300 ${
                  activeLayer.id === '0' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-transparent'
                }`} />
               <span className="text-[11px] font-black tracking-tight">{TYPOLOGY_ENTRY.label}</span>
               {directiveStates['0'].typologyIds.length > 0 && (
                   <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
               )}
            </button>

            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1 mb-4 block">Directives</label>
            <div className="space-y-1">
                {MGT_ASPECTS.map((aspect) => (
                <button
                    key={aspect.id}
                    onClick={() => setActiveLayer(aspect)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${
                    activeLayer.id === aspect.id 
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/10 border border-purple-500/30 text-white shadow-lg shadow-purple-500/5' 
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                    }`}
                >
                    <div className={`w-1 h-4 rounded-full mr-3 transition-all duration-300 ${
                    activeLayer.id === aspect.id ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-transparent'
                    }`} />
                    <span className="text-[11px] font-black tracking-tight">{aspect.label}</span>
                    {directiveStates[aspect.id].synthesizedData && (
                        <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    )}
                </button>
                ))}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 bg-[#010409] flex flex-col relative overflow-hidden">
          {activeLayer.id === 'vision' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto bg-gradient-to-b from-blue-600/[0.02] to-transparent">
              <div className="max-w-4xl w-full space-y-12">
                <div className="space-y-6 text-center">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Phase 1: Inception</span>
                  </div>
                  <h2 className="text-5xl font-black text-white tracking-tight italic">Product Vision Statement</h2>
                  <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                    Define the domain, the existential purpose, and the primary technical components you envision for this solution.
                  </p>
                </div>
                
                <div className="bg-[#0d1117] border border-gray-800 rounded-[2.5rem] p-4 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-[0.03] blur-3xl group-focus-within:opacity-[0.08] transition-all" />
                  <textarea
                    value={visionStatement}
                    onChange={(e) => setVisionStatement(e.target.value)}
                    placeholder="e.g., An expert financial simulation platform for real-time stress testing of multi-asset portfolios. It uses a high-concurrency valuation service, a persistent risk ledger, and a distributed modeling engine for Monte Carlo simulations..."
                    className="w-full h-80 bg-transparent rounded-lg p-8 text-lg focus:outline-none resize-none font-medium text-gray-200 leading-relaxed placeholder:text-gray-700"
                  />
                </div>

                <div className="flex flex-col items-center space-y-6">
                   <button
                    onClick={analyzeVision}
                    disabled={loading || !visionStatement}
                    className="group relative w-full py-8 rounded-[2rem] bg-gradient-to-r from-blue-700 to-indigo-600 font-black text-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all shadow-2xl shadow-blue-900/30 overflow-hidden"
                   >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                    {loading ? (
                       <div className="flex items-center justify-center space-x-3">
                          <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Architecting Vision...</span>
                       </div>
                    ) : 'Analyze Vision & Suggest Typologies'}
                   </button>
                   <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Nexus AI Integration Active</p>
                </div>
              </div>
            </div>
          ) : activeLayer.id === '0' ? (
             <div className="flex h-full w-full">
                {/* Typology Selection table */}
                <div 
                  className="h-full overflow-y-auto p-8 bg-[#0d1117] border-r border-gray-800 custom-scrollbar"
                  style={{ width: `${splitWidth}%` }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-white flex items-center space-x-3 mb-2">
                       <span className="text-blue-400 text-sm bg-blue-400/10 px-2 py-1 rounded italic">0.</span>
                       <span>Application Typology (The "Kind" of App)</span>
                    </h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-loose italic">Refine the foundational realization categories suggested from your vision</p>
                  </div>

                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="p-4 text-left w-12"></th>
                        <th className="p-4 text-left text-[8pt] font-black text-gray-500 uppercase tracking-widest">Category</th>
                        <th className="p-4 text-left text-[8pt] font-black text-gray-500 uppercase tracking-widest">Realization Types</th>
                        <th className="p-4 text-left text-[8pt] font-black text-gray-500 uppercase tracking-widest">Typology</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TYPOLOGY_DATA.map((row) => {
                        const isSelected = currentState.typologyIds.includes(row.id);
                        return (
                          <tr 
                            key={row.id}
                            onClick={() => {
                              const next = isSelected 
                                ? currentState.typologyIds.filter(id => id !== row.id)
                                : [...currentState.typologyIds, row.id];
                              updateDirectiveState('0', { typologyIds: next });
                            }}
                            className={`border-b border-gray-900 group cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/10' : 'hover:bg-white/[0.02]'}`}
                          >
                            <td className="p-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => {}} 
                                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600"
                              />
                            </td>
                            <td className="p-4 text-[9pt] font-bold text-gray-300 border-r border-gray-800/30">{row.category}</td>
                            <td className="p-4 text-[9pt] text-gray-500 leading-relaxed italic border-r border-gray-800/30 whitespace-pre-line">{row.types}</td>
                            <td className="p-4 text-[9pt] font-black text-blue-300">{row.typology}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div 
                  className="w-1.5 bg-gray-800 hover:bg-blue-500/50 cursor-col-resize transition-all flex items-center justify-center group"
                  onMouseDown={() => setIsResizing(true)}
                >
                   <div className="w-0.5 h-12 bg-gray-700 group-hover:bg-blue-300 rounded-full" />
                </div>

                <div 
                  className="h-full overflow-y-auto p-12 flex flex-col space-y-10 bg-[#010409]"
                  style={{ width: `${100 - splitWidth}%` }}
                >
                   <div>
                      <div className="flex items-center space-x-3 mb-2">
                         <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded tracking-widest uppercase">Typology Anchoring</span>
                         <h3 className="text-2xl font-black text-white italic tracking-tighter">Refine Architecture Vision</h3>
                      </div>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed italic border-l-2 border-blue-500/20 pl-4">
                        Synthesize architectural realizes based on selected typology and custom constraints derived from your vision statement.
                      </p>
                   </div>

                   <div className="flex-1 flex flex-col space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Concept Refinement</label>
                      <textarea 
                        value={currentState.notes}
                        onChange={(e) => updateDirectiveState('0', { notes: e.target.value })}
                        placeholder="Add specific architectural preferences, hardware targets, or custom service patterns..."
                        className="flex-1 bg-[#0d1117] border border-gray-800 rounded-2xl p-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium leading-loose text-gray-300 resize-none"
                      />
                   </div>

                   <button 
                     onClick={synthesizeLayer}
                     disabled={loading}
                     className="w-full h-16 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
                   >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Synthesize Archetype blueprint</span>}
                   </button>

                   {currentState.synthesizedData && (
                     <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {currentState.synthesizedData.components.map((comp, idx) => (
                           <div key={idx} className="p-6 bg-[#0d1117] border border-gray-800 rounded-2xl space-y-4">
                              <h4 className="text-lg font-black text-blue-400">{comp.component}</h4>
                              <p className="text-xs text-gray-400 leading-relaxed italic">"{comp.narrative_rationale}"</p>
                           </div>
                        ))}
                        <button onClick={finalizeLayer} className="w-full py-4 bg-blue-600/20 border border-blue-500/30 text-blue-400 font-black rounded-xl hover:bg-blue-600/30 transition-all text-xs tracking-widest uppercase">Finalize Typology Blueprint</button>
                     </div>
                   )}
                </div>
             </div>
          ) : (
             <div className="flex-1 flex overflow-hidden">
                {/* Standard Taxonomy View for A-I */}
                <div className="w-[45%] h-full border-r border-gray-800 bg-[#0d1117] overflow-y-auto p-8 custom-scrollbar">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Taxonomy Guide</h3>
                      <span className="text-[10px] font-black text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">{currentState.selections.length} SELECTED</span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => <div className="overflow-x-auto my-6 border border-gray-800 rounded-xl"><table className="min-w-full divide-y divide-gray-800" {...props} /></div>,
                        th: ({node, ...props}) => <th className="px-4 py-3 text-left text-[8pt] font-black text-gray-500 uppercase tracking-widest bg-[#161b22]" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-3 border-t border-gray-800 text-[9pt] font-medium text-gray-400" {...props} />,
                        tr: ({node, ...props}) => {
                          if (node.parent?.tagName === 'thead') return <tr {...props} />;
                          const rowId = props.children?.[1]?.props?.children?.toString() || JSON.stringify(props.children);
                          const isChecked = currentState.selections.includes(rowId);
                          return (
                            <tr 
                              className={`group cursor-pointer transition-colors ${isChecked ? 'bg-purple-900/10' : 'hover:bg-white/[0.02]'}`}
                              onClick={() => toggleSelection(activeLayer.id, rowId)}
                            >
                              <td className="w-10 px-4 py-3 border-t border-gray-800 text-center">
                                <input type="checkbox" checked={isChecked} onChange={() => {}} className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-purple-600" />
                              </td>
                              {props.children}
                            </tr>
                          );
                        }
                      }}
                    >
                      {taxonomyContent}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Standard Synthesis View for A-I */}
                <div className="flex-1 overflow-y-auto p-12 bg-[#161b22]/30 custom-scrollbar relative">
                  <div className="max-w-4xl mx-auto space-y-10">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{activeLayer.name}</h2>
                            <p className="text-sm text-gray-500 font-medium uppercase font-black tracking-widest italic">Directive Synthesis</p>
                        </div>
                        <button 
                          onClick={synthesizeLayer}
                          disabled={loading}
                          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 font-black rounded-xl transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50"
                        >
                            {loading ? 'Synthesizing...' : 'Synthesize Layer'}
                        </button>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 italic">Refinement Notes</label>
                        <textarea 
                            value={currentState.notes}
                            onChange={(e) => updateDirectiveState(activeLayer.id, { notes: e.target.value })}
                            placeholder={`Specify details for ${activeLayer.name}...`}
                            className="w-full h-32 bg-[#0d1117] border border-gray-800 rounded-2xl p-6 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium text-gray-300 resize-none"
                        />
                      </div>

                      {currentState.synthesizedData ? (
                        <div className="space-y-8 pb-32">
                          {currentState.synthesizedData.components.map((comp, idx) => (
                            <div key={idx} className="bg-[#0b0e14] border border-gray-800 rounded-[2rem] p-8 space-y-6 hover:border-purple-500/40 transition-all shadow-2xl">
                                <div className="flex justify-between">
                                  <h3 className="text-2xl font-black text-purple-100 italic tracking-tight">{comp.component}</h3>
                                  <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                      <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Validated</span>
                                  </div>
                                </div>
                                <p className="text-gray-400 leading-loose text-sm font-medium italic">{comp.description}</p>
                                <div className="bg-black/40 p-6 rounded-3xl space-y-3">
                                  <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Rationale</h4>
                                  <p className="text-blue-300 text-sm italic font-medium">"{comp.narrative_rationale}"</p>
                                </div>
                            </div>
                          ))}
                          <div className="fixed bottom-12 right-12">
                              <button onClick={finalizeLayer} className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 font-black rounded-2xl shadow-2xl transition-all uppercase text-sm tracking-widest">Finalize Layer</button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center border-4 border-dashed border-gray-800/20 rounded-[3rem] opacity-20">
                          <span className="text-sm font-black uppercase tracking-[0.3em] italic">Awaiting Instruction</span>
                        </div>
                      )}
                  </div>
                </div>
             </div>
          )}
        </section>
      </main>

      <footer className="h-12 border-t border-gray-800 bg-[#0d1117] flex items-center justify-between px-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">
         <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div><span>Nexus Core v1.4</span></span>
            <span className="text-gray-800">|</span>
            <span>Typology: {template}</span>
         </div>
         <div className="flex items-center space-x-2 text-green-500/50">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Verified Blueprint State</span>
         </div>
      </footer>
    </div>
  );
}

export default App;
