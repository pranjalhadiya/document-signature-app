import { useDraggable } from "@dnd-kit/core";

function DraggableField({
  id,
  label,
  type,
  styleName,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: {
      label,
      type,
      style: styleName,
    },
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    visibility: isDragging ? "hidden" : "visible",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="border rounded p-3 mb-3 bg-white cursor-grab hover:bg-slate-100 select-none"
    >
      {label}
    </div>
  );
}

export default DraggableField;