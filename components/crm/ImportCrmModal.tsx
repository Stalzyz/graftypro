"use client";

import { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Info, Download } from "lucide-react";

interface ImportCrmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    stages: any[];
}

export function ImportCrmModal({ isOpen, onClose, onSuccess, stages }: ImportCrmModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
    const [message, setMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

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
        const headers = ["name", "phone", "email", "deal_value", "source", "stage_name"];
        const rows = [
            ["John Doe", "919876543210", "john@example.com", "5000", "WEBSITE", stages[0]?.name || "New Lead"],
            ["Jane Smith", "918765432109", "jane@test.com", "12000", "DIRECT", stages[1]?.name || stages[0]?.name || "Follow Up"]
        ];

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "crm_import_template.csv");
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
            const res = await fetch("/api/crm/leads/import", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setStatus("SUCCESS");
                setMessage(`Successfully imported ${data.count} leads.`);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                setStatus("ERROR");
                setMessage(data.error || "Failed to process import file.");
            }
        } catch (error) {
            console.error("Import Error:", error);
            setStatus("ERROR");
            setMessage("Server transition failed. Check network stability.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Upload size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Bulk Import Index</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hydrate CRM via CSV payload</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 font-bold">
                        <X size={20} />
                    </button>
                </header>

                <div className="p-8 space-y-6">
                    {/* Template Warning */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-4">
                        <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-black text-blue-900 leading-tight">Sync Requirements</p>
                            <p className="text-xs font-bold text-blue-500 mt-1">Ensure your CSV header matches our structure exactly.</p>
                            <button
                                onClick={handleDownloadTemplate}
                                className="mt-3 text-[10px] font-black uppercase tracking-wider bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                                <Download size={12} /> Get Template
                            </button>
                        </div>
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
                            className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-950/20 transform active:scale-[0.98]"
                        >
                            {loading ? "INITIALIZING UPLOAD..." : "EXECUTE IMPORT"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
