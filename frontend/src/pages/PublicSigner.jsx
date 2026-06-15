import {
    useEffect,
    useState,
    useRef,
} from "react";
import { useParams } from "react-router-dom";
import {
    DndContext,
    DragOverlay,
} from "@dnd-kit/core";

import api from "../api/axios";
import PdfViewer from "../components/PdfViewer";
import FieldSidebar from "../components/FieldSidebar";
import SignatureModal from "../components/SignatureModal";

function PublicSigner() {
    const { token } = useParams();

    const [document, setDocument] =
        useState(null);

    const [currentPage, setCurrentPage] =
        useState(1);

    const [numPages, setNumPages] =
        useState(1);

    const [placedFields, setPlacedFields] =
        useState([]);

    const [activeField, setActiveField] =
        useState(null);

    const [signatures, setSignatures] = useState([]);

    const [showSignatureModal, setShowSignatureModal] = useState(false);

    const pdfRef = useRef(null);

    useEffect(() => {
        loadDocument();
    }, []);

    const loadDocument = async () => {
        try {
            const res = await api.get(
                `/api/documents/public/${token}`
            );

            setDocument(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (
            !over ||
            over.id !== "pdf-drop-area"
        ) {
            setActiveField(null);
            return;
        }

        if (!pdfRef.current) return;

        let value =
            active.data.current?.label;

        if (
            active.data.current?.type ===
            "Date"
        ) {
            value =
                new Date().toLocaleDateString();
        }

        if (
            active.data.current?.type ===
            "Text"
        ) {
            value = prompt("Enter text");

            if (!value) return;
        }

        const pageCanvas =
            pdfRef.current.querySelector(
                "canvas"
            );

        if (!pageCanvas) return;

        const canvasRect =
            pageCanvas.getBoundingClientRect();

        const activeRect =
            event.active.rect.current
                .translated;

        if (!activeRect) return;

        let x =
            activeRect.left -
            canvasRect.left;

        let y =
            activeRect.top -
            canvasRect.top;

        x = Math.max(
            0,
            Math.min(x, canvasRect.width)
        );

        y = Math.max(
            0,
            Math.min(y, canvasRect.height)
        );

        const xPercent =
            x / canvasRect.width;

        const yPercent =
            y / canvasRect.height;

        const newField = {
            id: Date.now(),
            value,
            style:
                active.data.current?.style,
            x: xPercent,
            y: yPercent,
            page: currentPage,
        };

        setPlacedFields((prev) => [
            ...prev,
            newField,
        ]);

        try {
            await api.post(
                `/api/public-sign/${token}`,
                {
                    x: xPercent,
                    y: yPercent,
                    page: currentPage,
                    value,
                    style:
                        active.data.current?.style,
                }
            );
        } catch (err) {
            console.error(err);
        }

        setActiveField(null);
    };

    const handleSaveSignature = (signature) => {
        setSignatures((prev) => [...prev, signature]);
        setShowSignatureModal(false);
    };

    if (!document) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100 overflow-x-hidden">
            <DndContext
                onDragStart={(event) => {
                    setActiveField(event.active.data.current);
                }}
                onDragEnd={(event) => {
                    handleDragEnd(event);
                    setActiveField(null);
                }}
            >
                <div className="p-8">
                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h1 className="text-2xl font-semibold">
                            Public Sign Page
                        </h1>

                        <p className="mt-2 text-gray-600">
                            {document.filename}
                        </p>
                    </div>

                    {/* PDF Card - SAME AS DASHBOARD */}
                    <div className="mt-6 bg-slate-100 rounded-xl p-6 shadow">
                        <div className="flex gap-6 overflow-hidden">
                            <FieldSidebar
                                signatures={signatures}
                                openSignatureModal={() =>
                                    setShowSignatureModal(true)
                                }
                            />

                            <div className="flex-1 overflow-visible">
                                <PdfViewer
                                    fileUrl={document.file_url}
                                    fields={placedFields}
                                    pdfRef={pdfRef}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    numPages={numPages}
                                    setNumPages={setNumPages}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    alert("Document submitted successfully!");
                                }}
                                className="bg-green-600 text-white px-6 py-2 rounded"
                            >
                                Submit
                            </button>
                        </div>
                    </div>

                    <DragOverlay>
                        {activeField ? (
                            <div className="bg-yellow-200 border-2 border-indigo-500 px-4 py-2 rounded shadow-lg pointer-events-none">
                                {activeField.label}
                            </div>
                        ) : null}
                    </DragOverlay>

                </div>
            </DndContext>

            {showSignatureModal && (
                <SignatureModal
                    onSave={handleSaveSignature}
                    onClose={() =>
                        setShowSignatureModal(false)
                    }
                />
            )}
        </div>
    );
}
export default PublicSigner;