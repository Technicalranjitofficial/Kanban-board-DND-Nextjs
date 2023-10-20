import { type } from "os";
export type Id = string | number;

export type Column = {
    id:Id,
    title: string,
}

export type Task = {
    id: Id,
    title: string,
    columnId:Id,
    description: string,
}
