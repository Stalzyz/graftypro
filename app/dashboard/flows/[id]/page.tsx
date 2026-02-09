"use client";

import { useEffect, useState } from "react";
import FlowBuilder from "@/components/flow-builder/FlowBuilder";

export default function EditFlowPage({ params }: { params: { id: string } }) {
    const [flowData, setFlowData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch flow details (Need a GET /api/flows/[id] endpoint or reuse search if acceptable)
        // Since we don't have a direct GET /api/flows/[id] that returns full data in the previous context, 
        // we might need to rely on the list endpoint filter or update the API.
        // Actually, let's check app/api/flows/[id]/route.ts again.
        // The PUT route exists. Does GET exist?

        const fetchFlow = async () => {
            try {
                // Assuming GET /api/flows/[id] exists. If not, I will add it.
                const res = await fetch(`/api/flows/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.flow) {
                        setFlowData({
                            ...data.flow,
                            nodes: data.flow.nodes || [],
                            edges: data.flow.edges || []
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to fetch flow", e);
            } finally {
                setLoading(false);
            }
        };

        fetchFlow();
    }, [params.id]);

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center">Loading Flow...</div>;
    }

    if (!flowData) {
        return <div className="h-screen w-full flex items-center justify-center">Flow not found</div>;
    }

    return (
        <div className="h-screen w-full bg-white">
            <FlowBuilder initialData={flowData} />
        </div>
    );
}
