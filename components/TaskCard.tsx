"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { GripVertical } from "lucide-react";
import { Id, Task } from "../app/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
  deleteTask: (id: Id) => void; // em caso de delete
  updateTask: (id: Id, content: string) => void; // em caso de update
}

function TaskCard({ task, deleteTask, updateTask }: TaskCardProps) {
  const [mouseIsOver, setMouseIsOver] = useState(false); // mouse track para Drag and Drop
  const [editMode, setEditMode] = useState(true); // começa podendo editar

  // confira mais sobre o uso do useSortable:
  // https://docs.dndkit.com/presets/sortable/usesortable

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // muda modo de edição
  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  // drag task
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-teal-800  cursor-grab relative"
      />
    );
  }

  // edit task
  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-slate-800 p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl ring-2 ring-inset ring-teal-600 cursor-grab relative">
        <textarea
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
          value={task.content}
          autoFocus
          placeholder="Task content here"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              toggleEditMode();
            }
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
        />
      </div>
    );
  }

  // default task, sem edição ou drag
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      className="bg-slate-900 p-2.5 h-[100px] min-h-[100px] items-center flex text-white text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-teal-700 cursor-grab relative task"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}>
      <GripVertical />

      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap ml-5">
        {task.content}
      </p>

      {/* botao de excluir task */}
      {mouseIsOver && (
        <button
          onClick={() => {
            deleteTask(task.id);
          }}
          className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-slate-600 p-2 rounded opacity-60 hover:opacity-100">
          <Trash2 />
        </button>
      )}
    </div>
  );
}

export default TaskCard;
