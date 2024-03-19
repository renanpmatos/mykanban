"use client";

import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Column, Id, Task } from "../app/types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import { v4 as uuidv4 } from "uuid";

function KanbanBoard() {
  // hooks para gerencimento de stado das tasks e colunas
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [loading, setloading] = useState(true); // Pre-loader antes de renderizar a página

  // Pre-loader
  useEffect(() => {
    setTimeout(() => {
      setloading(false);
    }, 3500);
  }, []);

  // Fetching do Local Storage
  const getTasks = localStorage.getItem("taskAdded");
  const getColumns = localStorage.getItem("columnAdded");

  useEffect(() => {
    if (getTasks == null || getColumns == null) {
      setTasks([]);
      setColumns([]);
    } else {
      setTasks(JSON.parse(getTasks));
      setColumns(JSON.parse(getColumns));
    }
  }, []);

  // sensores para o Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px] bg-slate-950 ">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}>
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {/* carrega as colunas */}
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)} // carrega as tasks na coluna
                />
              ))}
            </SortableContext>
          </div>

          {/* Criar nova coluna */}
          <button
            onClick={() => {
              createNewColumn();
            }}
            className="h-[60px] w-[180px] min-w-[180px] cursor-pointer rounded-xl bg-slate-800 p-4 text-white font-semibold transition duration-250 hover:bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 flex gap-2">
            <Plus />
            Add Column
          </button>
        </div>

        {/* Eventos de Drag das Colunas e Tasks */}

        {createPortal(
          <DragOverlay>
            {/* Em caso de drag da coluna */}
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {/* Em caso de drag da task */}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  // --------------------------------------------------------------------------------------------------//
  //                              Funções de CRUD das Tasks                                            //
  // ------------------------------------------------------------------------------------------------- //

  // Cria nova Task numa coluna
  function createTask(columnId: Id) {
    const newTask: Task = {
      id: uuidv4(),
      columnId,
      content: `Task ${tasks.length + 1}`, // conteúdo inicial
    };

    setTasks([...tasks, newTask]); // adiciona no array de tasks
    localStorage.setItem("taskAdded", JSON.stringify([...tasks, newTask])); // salva no localStorage
  }

  // Excluí uma Task Específica
  function deleteTask(id: Id) {
    const deleteTask = tasks.filter((task) => task.id !== id); // filtra pelas demais tasks, excluindo a task Id
    setTasks(deleteTask); // sobreescreve com as tasks filtradas
    localStorage.setItem("taskAdded", JSON.stringify(deleteTask)); // sobreescreve com as tasks filtradas
  }

  // Atualiza uma Task
  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      // verifica todas as tasks do array
      if (task.id !== id) return task;
      return { ...task, content }; // caso encontra a task do Id, sobreescreve o conteúdo
    });
    setTasks(newTasks);
    localStorage.setItem("taskAdded", JSON.stringify(newTasks)); // sobreescreve com as tasks filtradas
  }

  // --------------------------------------------------------------------------------------------------//
  //                              Funções de CRUD das Colunas                                          //
  // ------------------------------------------------------------------------------------------------- //

  // Cria nova coluna
  function createNewColumn() {
    const columnToAdd: Column = {
      id: uuidv4(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
    localStorage.setItem(
      "columnAdded",
      JSON.stringify([...columns, columnToAdd])
    );
  }

  // Excluí uma coluna e suas tasks
  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter((col) => col.id !== id); // filtra pelas colunas sem o id
    setColumns(filteredColumns);

    localStorage.setItem("columnAdded", JSON.stringify(filteredColumns)); // sobreescreve colunas

    const newTasks = tasks.filter((t) => t.columnId !== id); // filtra pelas taks sem estar na coluna
    setTasks(newTasks);

    localStorage.setItem("taskAdded", JSON.stringify(newTasks)); // sobreescreve tasks
  }

  // Atualiza uma coluna
  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title }; // caso encontra a coluna do Id, sobreescreve o título
    });

    setColumns(newColumns);

    localStorage.setItem("columnAdded", JSON.stringify(newColumns)); // sobreescreve as colunas
  }

  // --------------------------------------------------------------------------------------------------//
  //                              Eventos de Drag and Drop                                             //
  // ------------------------------------------------------------------------------------------------- //

  function onDragStart(event: DragStartEvent) {
    // pega a coluna selecionada
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    // pega a task selecionada
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null); // zera a coluna selecionada
    setActiveTask(null); // zera a task selecionada

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    // verifica e seta a ordem das colunas no final do drag
    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // pega dados de drag da task
    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Drop task em outra task
    if (isActiveATask && isOverATask) {
      // atualiza as tasks e sua ordem
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        // se for em outra task, diminuí sua posição no array
        if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // pega dados de drag numa coluna
    const isOverAColumn = over.data.current?.type === "Column";

    // Drop task numa coluna
    if (isActiveATask && isOverAColumn) {
      // atualiza as tasks
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

export default KanbanBoard;
