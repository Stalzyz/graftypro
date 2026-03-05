"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceConfigPage() {
    const [config, setConfig] = useState<any>({
        header_text: "",
        footer_text: "",
        declaration: "",
        signature_url: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/finance/config")
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setConfig(data);
            })
            .catch(console.error);
    }, []);

    const handleChange = (field: string, value: string) => {
        setConfig({ ...config, [field]: value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/finance/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            if (res.ok) alert("Saved Successfully");
            else alert("Failed to save");
        } catch (e) {
            console.error(e);
            alert("Error saving");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Invoice Template Editor</h1>

            <div className="bg-white p-6 rounded-lg shadow space-y-6">

                {/* Header Text */}
                <div>
                    <label className="block text-sm font-medium mb-1">Header Custom Text</label>
                    <textarea
                        className="w-full border p-2 rounded"
                        rows={3}
                        value={config.header_text || ""}
                        onChange={e => handleChange("header_text", e.target.value)}
                        placeholder="e.g. Tax Invoice / Bill of Supply"
                    />
                </div>

                {/* Declaration */}
                <div>
                    <label className="block text-sm font-medium mb-1">Declaration</label>
                    <textarea
                        className="w-full border p-2 rounded"
                        rows={4}
                        value={config.declaration || ""}
                        onChange={e => handleChange("declaration", e.target.value)}
                        placeholder="e.g. We declare that this invoice shows the actual price of the goods described..."
                    />
                </div>

                {/* Footer Text */}
                <div>
                    <label className="block text-sm font-medium mb-1">Footer / Terms</label>
                    <textarea
                        className="w-full border p-2 rounded"
                        rows={4}
                        value={config.footer_text || ""}
                        onChange={e => handleChange("footer_text", e.target.value)}
                        placeholder="e.g. Terms & Conditions apply. Subject to ..."
                    />
                </div>

                {/* Signature Upload */}
                <div>
                    <label className="block text-sm font-medium mb-1">Authorized Signature URL</label>
                    <input
                        className="w-full border p-2 rounded"
                        value={config.signature_url || ""}
                        onChange={e => handleChange("signature_url", e.target.value)}
                        placeholder="Enter URL or Upload (feature pending)"
                    />
                </div>

                <div className="border-t pt-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold"
                    >
                        {loading ? "Saving..." : "Save Template"}
                    </button>
                </div>

            </div>
        </div>
    );
}
