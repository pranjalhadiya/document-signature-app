import { Document, Page, pdfjs } from "react-pdf";
import { useDroppable } from "@dnd-kit/core";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PdfViewer({
  documentId,
  fileUrl,
  fields,
}) {
  const { setNodeRef } = useDroppable({
    id: "pdf-drop-area",
  });

  return (
    <div
      ref={setNodeRef}
      className="mt-6 bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 flex justify-center"
    >
      <div className="relative inline-block overflow-visible">
        {/* PDF */}
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) =>
            console.log("Pages:", numPages)
          }
          onLoadError={(error) =>
            console.log(error)
          }
        >
          <Page
            pageNumber={1}
            width={700}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="relative z-0"
          />
        </Document>

        {/* Overlay */}
        <div
          className="absolute inset-0 overflow-visible"
          style={{
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          {fields.map((field) => (
            <div
              key={field.id}
              className={`
                absolute
                bg-yellow-200
                border-2
                border-indigo-500
                px-4
                py-2
                rounded
                shadow-lg
                ${
                  field.style === "style1"
                    ? "font-serif italic text-2xl"
                    : field.style === "style2"
                    ? "font-mono text-2xl"
                    : field.style === "style3"
                    ? "font-bold text-2xl"
                    : ""
                }
              `}
              style={{
                left: field.x,
                top: field.y,
                zIndex: 101,
              }}
            >
              {field.type === "Signature"
                ? field.value
                : field.type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PdfViewer;