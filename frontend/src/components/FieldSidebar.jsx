import DraggableField from "./DraggableField";

function FieldSidebar({
  signatures,
  openSignatureModal,
}) {
  return (
    <div className="w-72 bg-white rounded-xl shadow p-4 h-fit">

      <button
        onClick={openSignatureModal}
        className="bg-indigo-600 text-white px-3 py-2 rounded w-full mb-4"
      >
        + Create Signature
      </button>

      {signatures.length > 0 && (
        <>
          <h4 className="font-semibold mb-3">
            My Signatures
          </h4>

          {signatures.map((sig) => (
            <DraggableField
              key={sig.id}
              id={`signature-${sig.id}`}
              label={sig.name}
              type="Signature"
              styleName={sig.style}
            />
          ))}
        </>
      )}

      <h4 className="font-semibold mb-3 mt-6">
        Other Fields
      </h4>

      <DraggableField
        id="date"
        label="Date"
        type="Date"
      />

      <DraggableField
        id="text"
        label="Text"
        type="Text"
      />

      <p className="text-sm text-gray-500 mt-4">
        Drag fields onto the PDF.
      </p>

    </div>
  );
}

export default FieldSidebar;