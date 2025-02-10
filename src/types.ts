export interface Data {
  lists: List[];
}

export interface List {
  createdAt: string;
  SK: string;
  PK: string;
  listName: string;
  type: "LIST";
  key: string;
}

export interface Task {
  completed: boolean;
  createdAt: string;
  SK: string;
  PK: string;
  taskName: string;
  listId: string;
  deadline: string;
  type: "TASK";
  key: string;
}

export type DataItem = List | Task;

export interface TaskListProps {
  title: string;
  id: string;
}

export interface TaskItemProps {
  title: string;
  time: string;
  completed: boolean;
}
