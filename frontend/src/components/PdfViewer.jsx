import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import api from "../api/axios";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PdfViewer({ documentId, fileUrl }) {
  const [marker, setMarker] = useState(null);

  const handleClick = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    setMarker({ x, y });

    try {
      await api.post("/api/signatures", {
        document_id: documentId,
        x,
        y,
        page: 1,
      });

      alert("Signature position saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    }
  };
  console.log(fileUrl);
  return (
    <div
      className="border mt-4"
      onClick={handleClick}
    >
      <Document
      file={fileUrl}
      onLoadSuccess={({ numPages }) => {
        console.log("Pages:", numPages);
      }}
      onLoadError={(error) => console.log(error)}
    >
      <Page
        pageNumber={1}
        width={800}
      />
    </Document>

      {marker && (
        <div
          className="absolute bg-yellow-300 px-2 py-1 rounded"
          style={{
            left: marker.x,
            top: marker.y,
          }}
        >
          ✍ Sign Here
        </div>
      )}
    </div>
  );
}

export default PdfViewer;