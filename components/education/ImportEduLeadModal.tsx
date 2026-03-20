"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Info, Download, Layers, Save } from "lucide-react";

interface ImportEduLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ImportEduLeadModal({ isOpen, onClose, onSuccess }: ImportEduLeadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR" | "INTEGRATION">("IDLE");
    const [message, setMessage] = useState("");
    const [workspaceId, setWorkspaceId] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user context for webhook URL
    useEffect(() => {
        if (isOpen) {
            fetch("/api/auth/me")
                .then(res => res.json())
                .then(data => {
                    if (data.user?.workspaceId) setWorkspaceId(data.user.workspaceId);
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const webhookUrl = workspaceId ? `${window.location.origin}/api/education/webhook/${workspaceId}` : "Fetching URL...";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))) {
            setFile(selectedFile);
            setStatus("IDLE");
        } else {
            alert("Please select a valid CSV file");
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ["student_name", "whatsapp_number", "email", "grade", "course_interested", "city", "potential_revenue", "parent_name"];
        const rows = [
            ["Rahul Sharma", "919988776655", "rahul@example.com", "10th", "Science", "Mumbai", "5000", "Anita Sharma"],
            ["Priya Singh", "918877665544", "priya@example.com", "12th", "Maths", "Delhi", "12000", "Raj Singh"]
        ];

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "academy_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus("IDLE");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/education/leads/import", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setStatus("SUCCESS");
                setMessage(`Successfully imported ${data.count} student leads.`);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setFile(null);
                    setStatus("IDLE");
                }, 2000);
            } else {
                setStatus("ERROR");
                setMessage(data.error || "Failed to process import file.");
            }
        } catch (error) {
            console.error("Import Error:", error);
            setStatus("ERROR");
            setMessage("Network failure. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#27954D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Upload size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Lead Ingestion Hub</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hydrate Academy CRM via Bulk Payload</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 font-bold">
                        <X size={20} />
                    </button>
                </header>

                <div className="p-8 space-y-6">
                    {status === "INTEGRATION" ? (
                        <div className="space-y-6 animate-in slide-in-from-right-2">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Meta Lead Ads Sync</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Academy Ingestion</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 space-y-4">
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                    Use this Callback URL in your Meta Developer App (Webhooks Product) to sync leads from Facebook Forms directly into the Academy Pipeline.
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-mono text-[10px] text-slate-600 truncate">
                                        {webhookUrl}
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(webhookUrl);
                                            alert("Webhook URL copied!");
                                        }}
                                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                                    >
                                        <Save size={14} />
                                    </button>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Verification Token</p>
                                    <p className="text-[10px] font-bold text-amber-700 font-mono">SST_GRAFTY_SECURE_VERIFY</p>
                                </div>

                                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-3">
                                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Meta Connection Guide</h4>
                                    {[
                                        "Go to developers.facebook.com and select your App.",
                                        "Add 'Webhooks' Product and select 'Page' object.",
                                        "Subscribe to 'leadgen' field using the URL above.",
                                        "Test your form in the Meta Lead Ads Testing Tool."
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-2 items-start">
                                            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex-shrink-0 flex items-center justify-center text-[8px] font-black mt-0.5">{i+1}</div>
                                            <p className="text-[10px] font-bold text-blue-700/80 leading-snug">{step}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setStatus("IDLE")}
                                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Back to CSV Import
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Main Import UI */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStatus("INTEGRATION")}
                                    className="flex-1 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl transition-all group text-left"
                                >
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Ad Campaigns</p>
                                    <p className="text-sm font-black text-blue-900">Meta Lead Engine</p>
                                </button>

                                <button
                                    onClick={handleDownloadTemplate}
                                    className="flex-1 p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-2xl transition-all group text-left"
                                >
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Data Feed</p>
                                    <p className="text-sm font-black text-emerald-900">Get CSV Template</p>
                                </button>
                            </div>

                            {!file ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer p-12 rounded-[2rem] text-center flex flex-col items-center gap-4 group"
                                >
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 shadow-sm transition-colors border border-slate-100 group-hover:border-blue-100">
                                        <Upload size={32} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Select CSV Data Payload</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Maximum file size 5MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            ) : (
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                                            <FileText size={24} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-black text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-xs font-black text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors uppercase tracking-widest"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            {status === "SUCCESS" && (
                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in">
                                    <CheckCircle2 className="text-emerald-500 mt-0.5" size={18} />
                                    <p className="text-sm font-black text-emerald-900 leading-tight">{message}</p>
                                </div>
                            )}

                            {status === "ERROR" && (
                                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in">
                                    <AlertCircle className="text-rose-500 mt-0.5" size={18} />
                                    <p className="text-sm font-black text-rose-900 leading-tight">{message}</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || loading || status === "SUCCESS"}
                                    className="w-full py-5 bg-gradient-to-r from-[#27954D] to-[#042F94] hover:shadow-2xl hover:shadow-blue-500/30 disabled:from-slate-200 disabled:to-slate-300 disabled:opacity-50 text-white font-black rounded-2xl transition-all relative overflow-hidden group active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em]">
                                        {loading ? "HYDRATING ACADEMY DATA..." : "EXECUTE ACADEMY IMPORT"}
                                    </span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
