"use client";

import getAllListsByUserId from "@/api/getAllListsByUserId";
import getAllTasksByUserIdAndListId from "@/api/getAllTasksByUserIdAndListId";
import { List, Task, TaskItemProps, TaskListProps } from "@/types";
import React from "react";

export default function Home() {
  const [currentTab, setCurrentTab] = React.useState<string>("");
  const [allLists, setAllLists] = React.useState<Array<List>>([]);
  const [currentList, setCurrentList] = React.useState<Array<Task>>([]);

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

  // const currentList: List | undefined = getCurrentList(todolist, currentTab);
  // const numRemainingTasks = React.useMemo(() => {
  //   return currentList
  //     ? currentList.tasks.filter((task) => task.completed === false).length
  //     : 0;
  // }, [currentList]);

  // return (
  //   <div>
  //     {allTasks.map((task) => (
  //       <div key={task.id}>{task.title}</div>
  //     ))}
  //   </div>
  // );

  const TaskItem = ({ title, time, completed }: TaskItemProps) => {
    return (
      <li className="mb-2 flex items-center gap-2 border-b border-gray-200 last:border-b-0 pb-6">
        <input
          type="checkbox"
          defaultChecked={completed}
          className="mr-2 w-[16px] h-[16px]"
        />
        <div className="flex flex-col gap-2">
          <span className="text-2xl">{title}</span>
          <span className="text-sm">{time}</span>
        </div>
      </li>
    );
  };

  const TaskList = ({ title, id }: TaskListProps) => {
    return (
      <li>
        <button
          className="mb-2 cursor-pointer hover:text-blue-200"
          onClick={() => setCurrentTab(id)}
        >
          <span className="mr-2">•</span> {title}
        </button>
      </li>
    );
  };

  return (
    <>
      <div className="flex justify-center items-center mx-auto mt-8">
        <div className="min-w-[400px] pr-8 text-white">
          <h2 className="text-xl font-bold mb-4">My Lists</h2>
          <ul className="text-2xl">
            {allLists.map((list) => {
              return (
                <TaskList key={list.key} title={list.listName} id={list.SK} />
              );
            })}
          </ul>
          <button
            className="text-3xl text-white bg-slate-600 hover:bg-slate-800"
            onClick={async () => {
              console.log(await getAllListsByUserId());
            }}
          >
            Test API
          </button>
        </div>
        {currentList ? (
          <div className="w-[600px] bg-white">
            <div className="flex justify-between items-center mb-4 bg-gray-200 p-8">
              <h2 className="text-2xl font-bold">Stuf</h2>
              <span className="text-sm text-gray-500">{2} tasks remaining</span>
            </div>

            <ul className="p-8 flex flex-col">
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
          <h2 className="text-2xl font-bold p-8 text-white">Select a list</h2>
        )}
      </div>
    </>
  );
}
