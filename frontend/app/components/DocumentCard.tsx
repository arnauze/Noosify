import type { Document } from "~/models/document"

interface DocumentProps {
    doc: Document
}

export default function DocumentCard({doc}: DocumentProps) {
    return (
        <div
            key={doc.id}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow"
        >
            <p className="font-bold text-sm text-neutral-600 mb-2">
            Filename: {doc.filename}
            </p>
            <p className="text-sm text-neutral-600 mb-2">
            Updated at: {new Date(doc.updated_at).toLocaleString()}
            </p>
            <p className="text-neutral-800 text-base whitespace-pre-wrap">
            {doc.summary}
            </p>
        </div>
    )
}