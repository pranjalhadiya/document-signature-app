import { useState } from "react";

function SignatureModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("style1");

  const styles = [
    {
      id: "style1",
      className: "font-serif italic text-2xl",
    },
    {
      id: "style2",
      className: "font-mono text-2xl",
    },
    {
      id: "style3",
      className: "font-bold text-2xl",
    },
  ];

  const handleSave = () => {
    console.log("saving", name, selectedStyle);
    
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    onSave({
      id: Date.now(),
      name,
      style: selectedStyle,
    });
  };

  return (
    <div 
        className="fixed inset-0 bg-black/50 flex justify-center items-center "
        style={{ zIndex: 10000000 }}
    >
      <div 
        className="bg-white p-6 rounded-xl w-[500px] shadow-xl"
        style={{ zIndex: 10000001 }}
      >

        <h2 className="text-2xl font-bold mb-4">
          Create Signature
        </h2>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded mb-6"
        />

        <h3 className="font-semibold mb-3">
          Choose a Style
        </h3>

        <div className="space-y-3">
          {styles.map((style) => (
            <div
                key={style.id}
                onClick={() => {
                  console.log("clicked", style.id);
                  setSelectedStyle(style.id);
                }}
                className={`border rounded p-3 cursor-pointer ${
                  selectedStyle === style.id
                    ? "border-indigo-600 bg-indigo-50"
                    : ""
                }`}
            >
              <p className={style.className}>
                {name || "Your Signature"}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Save Signature
          </button>
        </div>

      </div>
    </div>
  );
}

export default SignatureModal;