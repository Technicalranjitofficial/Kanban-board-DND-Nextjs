import React, { useMemo } from 'react'
import { Column, Task } from '../types'
import { SortableContext, useSortable } from '@dnd-kit/sortable'

import {CSS} from "@dnd-kit/utilities"
import TaskItem from './TaskItem'


type prop={
    column:Column,
    task:Task[]
}

const ColumnContainer = (props:prop) => {

    
   const {id,title} = props.column;
   const {task} = props;

   const taskId = useMemo(()=>task.map((t)=>t.id),[task]);

   const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "Column",
      column:props.column,
    },
  
  });



  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };


  if(isDragging){
    return  <div ref={setNodeRef} style={style} className='w-full bg-slate-600 border border-red-400 h-[500px] rounded-lg p-4 mr-4'></div>
  }

  return (
    <div ref={setNodeRef} style={style} className='w-full overflow-y-auto  bg-transparent border border-slate-600  h-[500px] rounded-lg p-4 mr-4'>
   <div {...listeners} {...attributes} >
   <h1  className='text-xl font-bold'>{title}</h1>


   </div>

   <div className='flex flex-col mt-5 gap-4'>
    <SortableContext items={taskId} >
    {task.map((t)=><TaskItem key={t.id} task={t} />)}
    </SortableContext>
   </div>
  </div>
  )
}

export default ColumnContainer