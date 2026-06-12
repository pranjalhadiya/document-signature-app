import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import api from "../api/axios";
import Draggable from "react-draggable";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PdfViewer({ documentId, fileUrl }) {
  const [marker, setMarker] = useState({
      x: 100,
      y: 100,
    });

  const handleClick = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // Relative coordinates (percentage)
    const xPercent = Number(
      (((e.clientX - rect.left) / rect.width) * 100).toFixed(2)
    );

    const yPercent = Number(
      (((e.clientY - rect.top) / rect.height) * 100).toFixed(2)
    );

    // Position marker visually
    setMarker({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    try {
      await api.post("/api/signatures", {
        document_id: documentId,
        x: xPercent,
        y: yPercent,
        page: 1,
      });

      alert("Signature position saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    }
  };

  return (
    <div
      className="relative mt-6 flex justify-center"
      onClick={handleClick}
    >
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) =>
          console.log("Pages:", numPages)
        }
        onLoadError={(error) => console.log(error)}
      >
        <Page
          pageNumber={1}
          width={700}
        />
      </Document>

    <Draggable
      position={marker}
      onStop={(e, data) => {
        setMarker({
          x: data.x,
          y: data.y,
        });
      }}
    >
      <div
        className="absolute bg-yellow-400 border-2 border-black px-3 py-2 rounded shadow-lg cursor-move z-50"
      >
       ✍ Sign Here
      </div>
    </Draggable>
    </div>
  );
}

export default PdfViewer;