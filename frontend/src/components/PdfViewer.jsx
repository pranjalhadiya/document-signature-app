import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";
import {
  useDroppable,
} from "@dnd-kit/core";

pdfjs.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

function PdfViewer({
  fileUrl,
  fields,
  removeField,
  pdfRef,
  currentPage,
  setCurrentPage,
  numPages,
  setNumPages,
}) {
  const { setNodeRef } =
    useDroppable({
      id: "pdf-drop-area",
    });

  const handleRef = (node) => {
    setNodeRef(node);
    pdfRef.current = node;
  };

  const PAGE_WIDTH = 700;
  const PAGE_HEIGHT = 990;

  return (
    <div className="flex flex-col items-center">

      {/* Page Controls */}
      <div className="flex gap-4 mb-4 items-center">
        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((p) =>
              Math.max(1, p - 1)
            )
          }
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="font-medium">
          Page {currentPage} of {numPages}
        </span>

        <button
          disabled={
            currentPage === numPages
          }
          onClick={() =>
            setCurrentPage((p) =>
              Math.min(
                numPages,
                p + 1
              )
            )
          }
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* PDF */}
      <div
        ref={handleRef}
        className="relative inline-block overflow-hidden"
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) =>
            setNumPages(numPages)
          }
        >
          <Page
            pageNumber={currentPage}
            width={700}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>

        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            pointerEvents: "auto",
            zIndex: 100,
          }}
        >
          {fields
            .filter(
              (field) =>
                field.page === currentPage
            )
            .map((field) => (
              <div
                key={field.id}
                className="absolute group cursor-pointer"
                style={{
                  left: `${field.x * PAGE_WIDTH}px`,
                  top: `${field.y * PAGE_HEIGHT}px`,
                  pointerEvents: "auto",
                }}
              >
                <span
                  className={
                    field.style === "style1"
                      ? "font-serif italic text-2xl"
                      : field.style === "style2"
                        ? "font-mono text-2xl"
                        : field.style === "style3"
                          ? "font-bold text-2xl"
                          : "text-lg"
                  }
                >
                  {field.value}
                </span>

                <button
                  onClick={() =>
                    removeField(field.id)
                  }
                  className="hidden group-hover:block absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                  style={{
                    pointerEvents: "auto",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default PdfViewer;