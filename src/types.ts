export interface Data {
  lists: List[];
}

export interface List {
  createdAt: string;
  SK: string;
  PK: string;
  listName: string;
  dataType: "LIST";
  key?: string;
}

export interface Task {
  completed: boolean;
  createdAt: string;
  SK: string;
  PK: string;
  taskName: string;
  listId: string;
  deadline: string;
  dataType: "TASK";
  key?: string;
}

export type DataItem = List | Task;

export interface TaskListProps {
  title: string;
  id: string;
  currentTab: string;
  handleSetCurrentTab: (id: string) => void;
  handleListNameChange: (newName: string, id: string) => Promise<string>;
  handleDeleteList: (listId: string) => Promise<void>;
}

export interface TaskItemProps {
  title: string;
  time: string;
  completed: boolean;
  taskId: string;
  handleEditTask: (
    taskId: string,
    newTask: string,
    newDeadline: string
  ) => Promise<{ task: string; deadline: string }>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleToggleTaskCompletion: (
    taskId: string,
    isCompleted: boolean
  ) => Promise<boolean>;
}
