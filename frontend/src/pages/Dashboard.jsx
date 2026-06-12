import PdfViewer from "../components/PdfViewer";
import { useEffect, useState } from "react";
import { getProfile, logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getDocuments } from "../services/documentService";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

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

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow p-4 flex justify-between">
        <h1 className="font-bold text-xl">
          SignifyPDF
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
             <p className="mb-4">Select a PDF file</p>

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
                    className="flex justify-between items-center border p-4 rounded-lg"
                  >
                    <span className="font-medium">
                      📄 {doc.filename}
                    </span>

                    <button
                     onClick={() => setSelectedDoc(doc)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded"
                    >
                     Preview
                    </button>  
                  </div>
                ))}
              </div>
            )}
        </div>
        {selectedDoc && (
          <PdfViewer
            documentId={selectedDoc.id}
            fileUrl={`http://127.0.0.1:8000/uploads/${selectedDoc.filename}`}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;