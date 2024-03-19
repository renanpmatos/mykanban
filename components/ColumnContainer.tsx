"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Trash2 } from "lucide-react";
import { Column, Id, Task } from "../app/types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  // casos de crud de colunas e tasks(dentro das colunas)
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;

  createTask: (columnId: Id) => void;
  updateTask: (id: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  tasks: Task[];
}

function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  // carrega as tasks
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

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
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Drag Column
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 border-2 border-dashed border-teal-500 w-[350px] h-[500px] max-h-[500px] rounded-xl flex flex-col"></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col">
      {/* Column title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="text-md h-[60px] cursor-grab rounded-xl
      p-3 font-bold border-2 border-teal-500 bg-slate-800
       flex text-white items-center justify-between">
        <div className="flex gap-2">
          <div className="flex justify-center items-center px-2 py-1 text-sm rounded-full">
            {tasks.length}
          </div>
          {!editMode && column.title}

          {/* Modo de Edição */}

          {editMode && (
            <input
              className=" focus:bg-slate-700 text-white rounded outline-none px-2"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        {/* Deletar coluna */}
        <button
          onClick={() => {
            deleteColumn(column.id);
          }}
          className="stroke-gray-500 hover:stroke-white hover:bg-teal-700 rounded px-1 py-2">
          <Trash2 />
        </button>
      </div>

      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      {/* Column footer */}
      <button
        className="flex gap-2 items-center text-slate-600 border-slate-700 border-2 rounded-xl p-4  hover:text-teal-400 hover:border-teal-400 active:bg-black"
        onClick={() => {
          createTask(column.id);
        }}>
        <Plus />
        Add task
      </button>
    </div>
  );
}

export default ColumnContainer;
