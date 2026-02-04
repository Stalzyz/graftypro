import FlowCanvas from "@/components/flow-builder/FlowCanvas";

export default function CreateFlowPage() {
    return (
        <div className="flex h-screen flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-white px-6">
                <h1 className="text-lg font-semibold">New Automation Flow</h1>
                <div className="ml-auto flex items-center gap-2">
                    <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800">
                        Save Draft
                    </button>
                    <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500">
                        Publish
                    </button>
                </div>
            </header>
            <main className="flex-1 overflow-hidden">
                <FlowCanvas />
            </main>
        </div>
    );
}
