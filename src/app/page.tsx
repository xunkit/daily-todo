"use client";

import addNewList from "@/api/addNewList";
import addTaskToList from "@/api/addTaskToList";
import getAllListsByUserId from "@/api/getAllListsByUserId";
import getAllTasksByUserIdAndListId from "@/api/getAllTasksByUserIdAndListId";
import AddTaskListDialog from "@/components/AddTaskListDialog";
import { List, Task, TaskItemProps, TaskListProps } from "@/types";
import React from "react";

export default function Home() {
  const [currentTab, setCurrentTab] = React.useState<string>("");
  const [allLists, setAllLists] = React.useState<Array<List>>([]);
  const [currentList, setCurrentList] = React.useState<Array<Task>>([]);
  const [tentativeTask, setTentativeTask] = React.useState<string>("");
  const [tentativeDeadline, setTentativeDeadline] = React.useState<string>("");
  const TaskFieldRef = React.useRef<HTMLInputElement>(null);

  const currentTabName: string | undefined = allLists.find(
    (list) => list.SK === currentTab
  )?.listName;

  const remainingTasks: number | undefined = currentList.filter(
    (task) => !task.completed
  )?.length;

  React.useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getAllTasksByUserIdAndListId(currentTab);
      setCurrentList(tasks);
    };

    fetchTasks();
  }, [currentTab]);

  React.useEffect(() => {
    const temp = async () => {
      const data = await getAllListsByUserId();
      setAllLists(data);
    };

    temp();
  }, []);

  const handleAddNewList = async (listName: string) => {
    try {
      const response = await addNewList(listName);
      if (!response.ok) {
        throw new Error("Error while adding a new list");
      }
      setAllLists([
        ...allLists,
        {
          PK: "USER#12345",
          SK: `LIST#${response.listId}`,
          createdAt: "2025-02-11T01:02:00Z",
          dataType: "LIST",
          listName: `${listName}`,
          key: `LIST#${response.listId}`,
        },
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleAddTaskToList = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await addTaskToList(
        currentTab,
        tentativeTask,
        tentativeDeadline
      );
      if (!response.ok) {
        throw new Error("Error while adding a new task");
      }
      setCurrentList([
        ...currentList,
        { ...response.newTask, key: response.newTask.SK },
      ]);
      setTentativeTask("");
      setTentativeDeadline("");
      TaskFieldRef.current?.focus();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const TaskItem = ({ title, time, completed }: TaskItemProps) => {
    return (
      <li className="my-2 flex items-center gap-2 border-b border-gray-200 last:border-b-0 pb-6">
        <input
          type="checkbox"
          defaultChecked={completed}
          className="mr-2 w-[32px] h-[32px]"
        />
        <div className="flex flex-col gap-1">
          <span className="text-2xl">{title}</span>
          <span className="text-lg font-mono">{time}</span>
        </div>
      </li>
    );
  };

  const TaskList = ({ title, id }: TaskListProps) => {
    const isBeingSelected = id === currentTab;
    const turnBlueIfHoveredCSS = `${
      isBeingSelected === false ? "hover:bg-sky-200" : ""
    }`;
    const turnBlueIfSelectedCSS = `${isBeingSelected ? "bg-sky-500" : ""}`;

    return (
      <li>
        <button
          className={`mb-2 cursor-pointer ${turnBlueIfHoveredCSS} p-4 w-[100%] text-start font-bold ${turnBlueIfSelectedCSS}`}
          onClick={() => setCurrentTab(id)}
        >
          {title}
        </button>
      </li>
    );
  };

  const AddListButton = () => {
    return (
      <span className="bg-black text-white text-xl font-extrabold p-1 px-2 w-8 h-8 hover:bg-gray-400">
        +
      </span>
    );
  };

  return (
    <>
      <div className="flex justify-center items-start mx-auto mt-8 max-w-[1200px] gap-8">
        <div className="flex-[20%] pt-8">
          <div className="flex justify-between border-b-2 mb-8 w-[100%] items-center">
            <h2 className="text-xl font-bold font-mono py-2 border-gray-200">
              MY LISTS
            </h2>
            <AddTaskListDialog
              trigger={<AddListButton />}
              onSubmit={handleAddNewList}
            />
          </div>
          <ul className="text-2xl flex flex-col">
            {allLists.map((list) => {
              return (
                <TaskList key={list.key} title={list.listName} id={list.SK} />
              );
            })}
          </ul>
        </div>
        {currentTab !== "" ? (
          <div className="flex-[80%] bg-gray-100">
            <div className="flex justify-between items-center bg-sky-500 px-12 py-8">
              <h2 className="text-2xl font-bold">{currentTabName}</h2>
              <span className="text-sm">
                {remainingTasks > 1
                  ? `${remainingTasks} tasks`
                  : `${remainingTasks} task`}{" "}
                remaining
              </span>
            </div>
            <div className="px-12 py-12">
              <form className="flex gap-8" onSubmit={handleAddTaskToList}>
                <input
                  className="flex-[60%] bg-inherit text-2xl px-4 py-2 border-b-2 border-gray-400 outline-none focus:border-black"
                  type="text"
                  placeholder="New task"
                  value={tentativeTask}
                  onChange={(e) => {
                    setTentativeTask(e.target.value);
                  }}
                  ref={TaskFieldRef}
                />
                <input
                  className="flex-[20%] bg-inherit text-2xl px-4 py-2 border-b-2 border-gray-400 outline-none focus:border-black"
                  type="text"
                  placeholder="Deadline"
                  value={tentativeDeadline}
                  onChange={(e) => {
                    setTentativeDeadline(e.target.value);
                  }}
                />
                <button
                  type="submit"
                  className="flex-1 bg-black text-white text-xl font-extrabold px-4 hover:bg-gray-400"
                >
                  +
                </button>
              </form>
            </div>
            <ul className="px-12 py-0 flex flex-col">
              {currentList.map((task) => {
                return (
                  <TaskItem
                    key={task.key}
                    title={task.taskName}
                    time={task.deadline}
                    completed={task.completed}
                  />
                );
              })}
            </ul>
          </div>
        ) : (
          <h2 className="text-2xl font-bold p-8 flex-[80%] text-center">
            Select a list
          </h2>
        )}
      </div>
    </>
  );
}
