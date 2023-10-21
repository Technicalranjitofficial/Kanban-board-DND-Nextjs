"use client";
import Image from "next/image";
import { Column, Task } from "./types";
import { useEffect, useMemo, useState } from "react";
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
import ColumnContainer from "./components/ColumnContainer";
import TaskItem from "./components/TaskItem";
import { columnsDefault, tasksDefault } from "./data/dummy";


export default function Home() {
  //states for column
  const [column, setColumn] = useState<Column[]>([]);

  //state for task
  const [tasks, setTasks] = useState<Task[]>(tasksDefault);

  useEffect(() => {
    //getting task and columns from localstorage
    const col = window.localStorage.getItem("Column");
    const tasks = window.localStorage.getItem("Task");
    if (!col) {
      window.localStorage.setItem("Column", JSON.stringify(columnsDefault));
      setColumn(columnsDefault);
      console.log("fetched from default");
    } else {
      const data = JSON.parse(col);
      console.log("fetched from localstorage");
      setColumn(data);
    }

    if (!tasks) {
      window.localStorage.setItem("Task", JSON.stringify(tasksDefault));
      setTasks(tasksDefault);
      console.log("fetched from default");
    } else {
      const data = JSON.parse(tasks);
      console.log("fetched from localstorage");
      setTasks(data);
    }
  }, []);

  //getting column id 
  const columnId = useMemo(() => column.map((col) => col.id), [column]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  }
  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveColumn = active.data.current?.type === "Column";
    if (!isActiveColumn) return;

    setColumn((columns) => {
      const activeColIdx = columns.findIndex((col) => col.id === activeId);
      const overColIdx = columns.findIndex((col) => col.id === overId);
      const p = arrayMove(columns, activeColIdx, overColIdx);
      window.localStorage.setItem("Column", JSON.stringify(p));
      return p;
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { over, active } = event;

    if (!over) return;
    console.log("over", over);
    const activeId = active.id;
    const overId = over.id;
    if (!overId) return;
    if (activeId === overId) return;
    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;
    // i am droping over a task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        let p;

        const activeTaskIdx = tasks.findIndex((t) => t.id === activeId);
        const overTaskIdx = tasks.findIndex((t) => t.id === overId);
        if (tasks[activeTaskIdx].columnId != tasks[overTaskIdx].columnId) {
          // Fix introduced after video recording
          tasks[activeTaskIdx].columnId = tasks[overTaskIdx].columnId;
          p = arrayMove(tasks, activeTaskIdx, overTaskIdx - 1);
          window.localStorage.setItem("Task", JSON.stringify(p));
          return p;
        }

        p = arrayMove(tasks, activeTaskIdx, overTaskIdx);
        window.localStorage.setItem("Task", JSON.stringify(p));
        return p;
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";
    // i am droping a task over anoter column

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        console.log("DROPPING TASK OVER COLUMN", { activeIndex });
        const p = arrayMove(tasks, activeIndex, activeIndex);
        window.localStorage.setItem("Task", JSON.stringify(p));
        return p;
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return (
    <main className="flex min-h-screen bg-[#101418] w-full flex-col items-center justify-around p-10">

      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-center">Drag and Drop Kanban Board Using Nextjs</h1>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-full  gap-5">
          <SortableContext items={columnId}>
            {column.map((item, index) => (
              <ColumnContainer
                key={item.id}
                column={item}
                task={tasks.filter((t) => t.columnId === item.id)}
              />
            ))}
          </SortableContext>
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  task={tasks.filter((t) => t.columnId === activeColumn.id)}
                  column={activeColumn}
                />
              )}
              {activeTask && <TaskItem task={activeTask} />}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </main>
  );
}
