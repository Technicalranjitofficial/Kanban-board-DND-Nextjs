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

//dummy column
const columnsDefault: Column[] = [
  {
    id: 1,
    title: "Backlog",
  },
  {
    id: 2,
    title: "To Do",
  },
  {
    id: 3,
    title: "In Progress",
  },
  {
    id: 4,
    title: "Done",
  },
];




//dummy task data

const tasksDefault: Task[] = [
  {
    id: 90,
    title: "task1",
    columnId: 1,
    description: "Hello Guys",
  },
  {
    id: 91,
    title: "task2 ",
    columnId: 2,
    description: "Task 2",
  },
  {
    id: 92,
    title: "task3",
    columnId: 3,
    description: "Task 3",
  },
  {
    id: 93,
    title: "task4",
    columnId: 4,
    description: "Task 4",
  },
  {
    id: 94,
    title: "task5",
    columnId: 1,
    description: "Task 5",
  },
  {
    id: 95,
    title: "task6",
    columnId: 2,
    description: "Task 6",
  },
  {
    id: 96,
    title: "task7",
    columnId: 3,
    description: "Task 7",
  },
  {
    id: 97,
    title: "task8",
    columnId: 4,
    description: "Task 8",
  },
  {
    id: 98,
    title: "task9",
    columnId: 1,
    description: "Task 9",
  },
  {
    id: 99,
    title: "task10",
    columnId: 2,
    description: "Task 10",
  },
  {
    id: 100,
    title: "task11",
    columnId: 3,
    description: "Task 11",
  },
  {
    id: 101,
    title: "task12",
    columnId: 4,
    description: "Task 12",
  },
  {
    id: 102,
    title: "task13",
    columnId: 1,
    description: "Task 13",
  },
  {
    id: 103,
    title: "task14",
    columnId: 2,
    description: "Task 14",
  },
  {
    id: 104,
    title: "task15",
    columnId: 3,
    description: "Task 15",
  },
  {
    id: 105,
    title: "task16",
    columnId: 4,
    description: "Task 16",
  },
  {
    id: 106,
    title: "task17",
    columnId: 1,
    description: "Task 17",
  },
  
 


];

export default function Home() {
  
  
  
  const [column, setColumn] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>(tasksDefault);
  
  useEffect(()=>{
    const col = window.localStorage.getItem("Column");
    const tasks = window.localStorage.getItem("Task");
    if(!col){
      window.localStorage.setItem("Column",JSON.stringify(columnsDefault));
      setColumn(columnsDefault);
      console.log("fetched from default");

    }else{
     const data = JSON.parse(col);
     console.log("fetched from localstorage");
     setColumn(data);
    }

    if(!tasks){
      window.localStorage.setItem("Task",JSON.stringify(tasksDefault));
      setTasks(tasksDefault);
      console.log("fetched from default");

    }else{
     const data = JSON.parse(tasks);
     console.log("fetched from localstorage");
     setTasks(data);
    }

  


  },[])

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
     const p =  arrayMove(columns, activeColIdx, overColIdx);
     window.localStorage.setItem("Column",JSON.stringify(p));
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
          p= arrayMove(tasks, activeTaskIdx, overTaskIdx - 1);
          window.localStorage.setItem("Task",JSON.stringify(p));
          return p;
        }

        p= arrayMove(tasks, activeTaskIdx, overTaskIdx);
        window.localStorage.setItem("Task",JSON.stringify(p));
        return p;
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";
    // i am droping a task over anoter column

    if(isActiveATask && isOverAColumn){
      setTasks((tasks)=>{
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

                tasks[activeIndex].columnId = overId;
                console.log("DROPPING TASK OVER COLUMN", { activeIndex });
               const p= arrayMove(tasks, activeIndex, activeIndex);
               window.localStorage.setItem("Task",JSON.stringify(p));
               return p;
      })
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
    <main className="flex min-h-screen w-full flex-col items-center justify-between p-24">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="w-full h-full flex gap-5">
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
                <ColumnContainer task={tasks.filter((t)=>t.columnId===activeColumn.id)} column={activeColumn} />
              )}
              {activeTask && <TaskItem task={activeTask} />}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </main>
  );
}
