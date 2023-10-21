import React from 'react'
import { Task } from '../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type prop ={
    task:Task
}

const colors={
    "1":"bg-red-600",
    "2":"bg-blue-600",
    "3":"bg-green-600",
    "4":"bg-yellow-600",
  }
const TaskItem = (props:prop) => {
    const {task} = props;

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
    
      });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };
    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="w-full border border-red-500 rounded-md p-5"></div>
        );
    }

    return (
        <div
            {...listeners}
            {...attributes}
            style={style}
            ref={setNodeRef}
            className={`w-full rounded-s-md ${colors[task.columnId as keyof typeof colors]} p-3`}
        >
            <h1>{task.title}</h1>
        </div>
    );
}

export default TaskItem