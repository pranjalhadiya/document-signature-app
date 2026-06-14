import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
} from "@dnd-kit/core";

import PdfViewer from "../components/PdfViewer";
import SignatureModal from "../components/SignatureModal";
import FieldSidebar from "../components/FieldSidebar";

import api from "../api/axios";
import { getProfile, logout } from "../services/authService";
import { getDocuments } from "../services/documentService";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [placedFields, setPlacedFields] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [showSignatureModal, setShowSignatureModal] =
    useState(false);
  const [activeField, setActiveField] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);
  const [numPages, setNumPages] =
    useState(1);

  const pdfRef = useRef(null);

  const navigate = useNavigate();

  const handleSaveSignature = (signature) => {
    setSignatures((prev) => [
      ...prev,
      signature,
    ]);
    setShowSignatureModal(false);
  };

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getProfile()
      .then(setUser)
      .catch(() => navigate("/login"));

    loadDocuments();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(
        "/api/documents/upload",
        formData
      );

      await loadDocuments();

      alert("Upload successful");
    } catch {
      alert("Upload failed");
    }
  };

  const removeField = async (id) => {
    try {
      await api.delete(`/api/signatures/${id}`);

      setPlacedFields((prev) =>
        prev.filter((field) => field.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || over.id !== "pdf-drop-area") {
      setActiveField(null);
      return;
    }

    if (!pdfRef.current) {
      setActiveField(null);
      return;
    }

    let value = active.data.current?.label;

    if (active.data.current?.type === "Date") {
      value = new Date().toLocaleDateString();
    }

    if (active.data.current?.type === "Text") {
      value = prompt("Enter text");

      if (!value) {
        setActiveField(null);
        return;
      }
    }

    const pageCanvas =
      pdfRef.current.querySelector("canvas");

    if (!pageCanvas) {
      setActiveField(null);
      return;
    }

    const canvasRect =
      pageCanvas.getBoundingClientRect();

    const activeRect =
      event.active.rect.current.translated;

    if (!activeRect) {
      setActiveField(null);
      return;
    }

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

    console.log({
      canvasRect,
      activeRect,
      x,
      y,
    });
    
    const xPercent = x / canvasRect.width;
    const yPercent = y / canvasRect.height;

    const newField = {
      id: Date.now(),
      document_id: selectedDoc.id,
      type: active.data.current?.type,
      value,
      style: active.data.current?.style,
      x: xPercent,
      y: yPercent,
      page: currentPage,
    };

    setPlacedFields((prev) => [
      ...prev,
      newField,
    ]);

    try {
      await api.post("/api/signatures", {
        document_id: selectedDoc.id,
        x: xPercent,
        y: yPercent,
        page: currentPage,
        value,
        style: active.data.current?.style,
      });
    } catch (err) {
      console.error(err);
    }

    setActiveField(null);
  };
  return (
    <div className="min-h-screen bg-slate-100 overflow-x-hidden">
      <nav className="bg-white shadow p-4 flex justify-between">
        <h1 className="font-bold text-xl">
          Doc-Signature
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </nav>

      <div className="p-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold">
            Welcome {user?.name} 👋
          </h2>

          <p>{user?.email}</p>
        </div>

        <div className="mt-6 bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold text-lg">
            Upload PDF
          </h3>

          <div className="border-2 border-dashed p-12 text-center mt-4 rounded">
            <p className="mb-4">
              Select a PDF file
            </p>

            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="border p-2 rounded"
            />
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">
            My Documents
          </h3>

          {documents.length === 0 ? (
            <p className="text-gray-500">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center border p-4 rounded-lg"
                >
                  <span className="font-medium flex-1 truncate">
                    {doc.filename}
                  </span>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={async () => {
                        setSelectedDoc(doc);
                        setCurrentPage(1);

                        try {
                          const res = await api.get(
                            `/api/signatures/document/${doc.id}`
                          );

                          const loadedFields = res.data.map(
                            (signature) => ({
                              id: signature.id,
                              x: signature.x,
                              y: signature.y,
                              page: signature.page,
                              value: signature.value,
                              style: signature.style,
                            })
                          );

                          setPlacedFields(loadedFields);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded"
                    >
                      Preview
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const res = await api.post(
                            `/api/documents/${doc.id}/generate`
                          );

                          window.open(
                            `http://127.0.0.1:8000/${res.data.file}`,
                            "_blank"
                          );
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Generate PDF
                    </button>
                  </div>  
                </div>
              ))}
                </div>
              )}
            </div>

        {selectedDoc && (
            <DndContext
              onDragStart={(event) => {
                setActiveField(
                  event.active.data.current
                );
              }}
              onDragEnd={(event) => {
                handleDragEnd(event);
                setActiveField(null);
              }}
            >
              <div className="mt-6 flex gap-6 overflow-hidden">
                <FieldSidebar
                  signatures={signatures}
                  openSignatureModal={() =>
                    setShowSignatureModal(
                      true
                    )
                  }
                />

                <div className="flex-1 overflow-visible">
                  <PdfViewer
                    fileUrl={`http://127.0.0.1:8000/uploads/${selectedDoc.filename}`}
                    fields={placedFields}
                    removeField={removeField}
                    pdfRef={pdfRef}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    numPages={numPages}
                    setNumPages={setNumPages}
                  />
                </div>
              </div>

              <DragOverlay>
                {activeField ? (
                  <div className="bg-yellow-200 border-2 border-indigo-500 px-4 py-2 rounded shadow-lg pointer-events-none">
                    {activeField.label}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {showSignatureModal && (
            <SignatureModal
              onSave={handleSaveSignature}
              onClose={() =>
                setShowSignatureModal(false)
              }
            />
          )}
        </div>
      </div >
      );
}

      export default Dashboard;