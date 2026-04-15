"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Globe, 
  FileText, 
  Database, 
  Trash2, 
  RefreshCcw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BrainCircuit,
  Binary,
  Upload,
  ChevronRight,
  Brain,
  Info,
  Zap,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const SOURCE_TYPE_MAP = {
  TEXT: { icon: BrainCircuit, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Manual Knowledge" },
  URL: { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", label: "Website Crawler" },
  PDF: { icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10", label: "PDF Document" }
};

export default function AIKnowledgePage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAddon, setCheckingAddon] = useState(true);
  const [addonActive, setAddonActive] = useState(false);
  const [addonInfo, setAddonInfo] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState<"TEXT" | "URL" | "PDF">("TEXT");
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAddon();
  }, []);

  async function checkAddon() {
    try {
      const res = await fetch("/api/addons/check?name=AI_KNOWLEDGE_ENGINE");
      const data = await res.json();
      setAddonActive(data.active);
      setAddonInfo(data.addon);
      if (data.active) {
        fetchSources();
      }
    } catch (e) {
      console.error("Addon check failed");
    } finally {
      setCheckingAddon(false);
    }
  }

  useEffect(() => {
    if (addonActive) {
        const interval = setInterval(fetchSources, 15000); // Polling for status updates
        return () => clearInterval(interval);
    }
  }, [addonActive]);

  async function fetchSources() {
    try {
      const res = await fetch("/api/ai/knowledge/ingest");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to load intelligence");
      }
      
      setSources(data.sources || []);
    } catch (err: any) {
      console.error("Failed to load knowledge sources", err);
      // Only toast on initial load or non-401 to prevent spam
      if (sources.length === 0) {
        toast.error(`Neural Link Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  async function handleAddSource() {
    if (!newName && newType !== "PDF") return toast.error("Source name is required");
    if (newType === "PDF" && files.length === 0) return toast.error("Please select at least one PDF");
    if (newType === "URL" && !newUrl) return toast.error("Website URL is required");
    if (newType === "TEXT" && !newContent) return toast.error("Text content is required");
    
    setLoading(true);
    try {
      if (newType === "PDF") {
        // Handle Multiple File Uploads
        for (const file of files) {
          const formData = new FormData();
          formData.append("name", file.name.replace(".pdf", ""));
          formData.append("type", "PDF");
          formData.append("file", file);
          
          const res = await fetch("/api/ai/knowledge/ingest", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(`Upload failed for ${file.name}: ${errData.error || res.statusText}`);
          }
        }
        toast.success(`Succesfully injected ${files.length} documents! 🧠`);
      } else {
        const formData = new FormData();
        formData.append("name", newName);
        formData.append("type", newType);
        if (newType === "TEXT") formData.append("content", newContent);
        if (newType === "URL") formData.append("url", newUrl);

        const res = await fetch("/api/ai/knowledge/ingest", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Ingestion started! 🚀");
        } else {
          throw new Error(data.error);
        }
      }

      setIsAdding(false);
      setNewName("");
      setNewContent("");
      setNewUrl("");
      setFiles([]);
      fetchSources();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will permanently wipe this knowledge from the AI brain.")) return;
    
    try {
      const res = await fetch(`/api/ai/knowledge/ingest/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Knowledge wiped successfully");
        setSources(sources.filter(s => s.id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete source");
    }
  }

  async function handleWipeAll() {
    if (!confirm("☢️ CORE RESET: Are you sure you want to wipe ALL intelligence? This cannot be undone.")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/ai/knowledge/ingest?all=true", { method: "DELETE" });
      if (res.ok) {
        toast.success("Total system reset complete. AI Brain is now empty.");
        setSources([]);
      } else {
        throw new Error("Reset failed");
      }
    } catch (err) {
      toast.error("Critical: Failed to wipe all intelligence");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAddon) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
    );
  }

  if (!addonActive) {
    return (
      <div className="p-8 lg:p-12 max-w-6xl mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-100 rounded-[3rem] p-16 shadow-2xl relative overflow-hidden max-w-2xl"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Brain size={180} />
            </div>
            
            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-xl">
                <Zap className="text-blue-400" size={32} />
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4 leading-tight">
                Unlock Intelligence Brain
            </h2>
            <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">
                Your AI agent is currently running on basic logic. Connect the <b>AI Knowledge Engine</b> to train your bot on PDFs, URLs, and custom business docs for 100% accurate customer responses.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost</p>
                    <p className="text-lg font-black text-slate-900">{addonInfo?.price || 399} Credits/mo</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-lg font-black text-blue-600 uppercase tracking-tight">Premium Addon</p>
                </div>
            </div>

            <a 
                href="/dashboard/addons"
                className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/30 group"
            >
                Activate via Marketplace
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header Section: Premium Redesign */}
      <div className="relative mb-16">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <BrainCircuit className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                        Brain Center
                    </h1>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Autonomous Intelligence Management</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm max-w-xl font-medium leading-relaxed">
              Equip your WhatsApp agent with industrial-grade document intelligence. Train your bot on complex business data to achieve 100% grounded, hallucination-free responses.
            </p>
          </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleWipeAll}
                className="flex items-center gap-3 bg-red-50 text-red-600 hover:bg-red-100 px-6 py-5 rounded-[2rem] transition-all font-black uppercase tracking-widest text-[10px] group border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Wipe Neural Memory
              </button>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-5 rounded-[2rem] transition-all shadow-2xl shadow-slate-900/20 font-black uppercase tracking-widest text-[11px] group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                Train My AI Brain
              </button>
            </div>
        </div>
      </div>

      {/* Grid: Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && sources.length === 0 ? (
            <div className="col-span-full py-40 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-[3rem] shadow-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-600 relative z-10" />
                </div>
                <p className="font-black text-slate-900 text-sm uppercase tracking-widest mt-4">Syncing Vector Memory...</p>
            </div>
        ) : sources.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <Database size={240} />
                </div>
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8">
                  <Database className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Neural Engine Empty</h3>
                <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs">Upload your product catalogs, FAQs, or terms of service to start the autonomous learning phase.</p>
                <button 
                   onClick={() => setIsAdding(true)}
                   className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20"
                >
                  Start Training Engine
                </button>
            </motion.div>
        ) : (
            <AnimatePresence mode="popLayout">
              {sources.map((source, index) => {
                  const config = SOURCE_TYPE_MAP[source.type as keyof typeof SOURCE_TYPE_MAP];
                  const Icon = config.icon;
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      key={source.id} 
                      className="bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative border-b-4 border-b-transparent hover:border-b-emerald-500 duration-500"
                    >
                        <div className="flex items-start justify-between mb-8">
                            <div className={`p-4 ${config.bg} rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm`}>
                                <Icon className={`w-6 h-6 ${config.color}`} />
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                source.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                source.status === 'PROCESSING' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                                'bg-rose-50 text-rose-600'
                            }`}>
                                {source.status}
                            </div>
                        </div>
                        
                        <div className="mb-8">
                          <h3 className="text-slate-900 font-black text-lg mb-1 truncate leading-tight">{source.name}</h3>
                          <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                             <p className="text-slate-400 text-[10px] uppercase font-black tracking-tighter">
                                {config.label}
                             </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-slate-50 p-3 rounded-2xl">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Intelligence</p>
                             <p className="text-sm font-black text-slate-900 leading-none">{source._count?.chunks || 0} Chunks</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Sync Status</p>
                             <p className="text-[10px] font-bold text-slate-600 leading-none truncate">Healthy Mode</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest group-hover:text-slate-900 transition-colors">ID: {source.id.slice(0,8)}</span>
                            <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => fetchSources()}
                                  className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(source.id)}
                                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                  );
              })}
            </AnimatePresence>
        )}
      </div>

      {/* Add Source Modal: Premium Redesign */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdding(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col lg:flex-row h-full max-h-[800px]"
              >
                  {/* Left Sidebar Info */}
                  <div className="lg:w-72 bg-slate-900 p-10 flex flex-col justify-between text-white border-r border-white/5">
                    <div>
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                        <Brain className="text-white w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-tight">Neural Training Phase</h2>
                      <p className="text-slate-400 text-xs leading-relaxed font-medium">Select a data source to expand your AI's perception. The system will slice and index your data into the vector brain for immediate retrieval.</p>
                      
                      <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Brain size={12} /> Additive Intelligence
                        </p>
                        <p className="text-[10px] text-slate-300 leading-relaxed">New uploads will <b>expand</b> the AI's knowledge base. To reset your AI entirely, use the "Wipe" function on the main dashboard.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                         <Info size={16} className="text-emerald-400" />
                         <p className="text-[10px] font-bold text-slate-300">Max size 10MB per PDF</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Area */}
                  <div className="flex-1 p-10 lg:p-16 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-end mb-8 absolute top-8 right-8">
                        <button onClick={() => setIsAdding(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">&times;</button>
                      </div>

                      <div className="flex gap-2 mb-12 p-1 bg-slate-50 rounded-[1.5rem] overflow-hidden">
                          {(["TEXT", "URL", "PDF"] as const).map(t => (
                              <button 
                                  key={t}
                                  onClick={() => { setNewType(t); setFiles([]); }}
                                  className={`flex-1 py-3.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${
                                      newType === t ? 'bg-white text-slate-900 shadow-md scale-[0.98]' : 'text-slate-400 hover:text-slate-600'
                                  }`}
                              >
                                  {t}
                              </button>
                          ))}
                      </div>

                      <div className="space-y-8">
                          {(newType === "TEXT" || newType === "URL") && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <label className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3 px-1">Internal Reference Name</label>
                                <input 
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. 2024 Refund Guidelines"
                                    className="w-full bg-slate-50 border border-transparent rounded-[1.5rem] px-6 py-5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500/30 transition-all font-bold text-sm shadow-inner"
                                />
                            </motion.div>
                          )}

                          {newType === "URL" ? (
                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                  <label className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3 px-1">Crawl Endpoint (URL)</label>
                                  <div className="relative">
                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                                    <input 
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        placeholder="https://grafty.pro/faq"
                                        className="w-full bg-slate-50 border border-transparent rounded-[1.5rem] pl-16 pr-6 py-5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500/30 transition-all font-bold text-sm shadow-inner"
                                    />
                                  </div>
                                  <p className="mt-4 text-emerald-600 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 p-3 rounded-xl inline-block">Bot will recursively map text content</p>
                              </motion.div>
                          ) : newType === "TEXT" ? (
                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                  <label className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3 px-1">Raw Intelligence Content</label>
                                  <textarea 
                                      value={newContent}
                                      onChange={(e) => setNewContent(e.target.value)}
                                      placeholder="Paste documentation, support rules, or business logic here..."
                                      className="w-full bg-slate-50 border border-transparent rounded-[2rem] px-8 py-6 text-slate-900 placeholder:text-slate-300 h-64 focus:outline-none focus:bg-white focus:border-emerald-500/30 transition-all font-medium text-sm resize-none shadow-inner"
                                  />
                              </motion.div>
                          ) : (
                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                  <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative h-64 border-2 border-dashed border-slate-100 hover:border-emerald-500/30 bg-slate-50/50 hover:bg-emerald-50/20 rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden"
                                  >
                                      <input 
                                        type="file" 
                                        hidden 
                                        ref={fileInputRef} 
                                        multiple 
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                      />
                                      <div className="p-5 bg-white rounded-[1.5rem] shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500">
                                        <Upload className="w-6 h-6 text-emerald-600" />
                                      </div>
                                      <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Drop Neural Documents</p>
                                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Multiple PDF support enabled</p>
                                      
                                      {files.length > 0 && (
                                        <div className="absolute inset-0 bg-emerald-600 p-8 flex flex-col items-center justify-center text-white text-center">
                                           <CheckCircle2 size={40} className="mb-4 animate-bounce" />
                                           <p className="font-black text-lg uppercase tracking-tight">{files.length} Documents Selected</p>
                                           <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-2">{files.map(f => f.name).join(", ").slice(0, 50)}...</p>
                                           <button 
                                              onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                                              className="mt-6 flex items-center gap-2 bg-black/20 hover:bg-black/40 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                           >
                                              <X size={12} /> Clear Selection
                                           </button>
                                        </div>
                                      )}
                                  </div>
                              </motion.div>
                          )}
                      </div>

                      <div className="mt-16 pt-8 border-t border-slate-100">
                          <button 
                              disabled={loading}
                              onClick={handleAddSource}
                              className="w-full py-6 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/40 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                          >
                              {loading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Injecting Intelligence...
                                </>
                              ) : (
                                <>
                                  Commit to AI Brain
                                  <ChevronRight size={16} />
                                </>
                              )}
                          </button>
                      </div>
                  </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Styles for Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
