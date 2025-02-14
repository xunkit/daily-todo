"use client";

import addNewList from "@/api/addNewList";
import addTaskToList from "@/api/addTaskToList";
import changeListNameByListId from "@/api/changeListNameByListId";
import deleteListByListId from "@/api/deleteListByListId";
import deleteTaskByTaskId from "@/api/deleteTaskByTaskId";
import editTaskByTaskId from "@/api/editTaskByTaskId";
import getAllListsByUserId from "@/api/getAllListsByUserId";
import getAllTasksByUserIdAndListId from "@/api/getAllTasksByUserIdAndListId";
import toggleTaskCompletionByTaskId from "@/api/toggleTaskCompletionByTaskId";
import AddTaskListDialog from "@/components/AddTaskListDialog";
import TaskItem from "@/components/TaskItem";
import TaskList from "@/components/TaskList";
import { List, Task } from "@/types";
import React from "react";

export default function Home() {
  const [currentTab, setCurrentTab] = React.useState<string>("");
  const [allLists, setAllLists] = React.useState<Array<List>>([]);
  const [currentList, setCurrentList] = React.useState<Array<Task>>([]);
  const [tentativeTask, setTentativeTask] = React.useState<string>("");
  const [tentativeDeadline, setTentativeDeadline] = React.useState<string>("");
  const [addTaskError, setAddTaskError] = React.useState<string>("");
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
    setAddTaskError("");
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
      setAddTaskError((error as Error).toString());
      throw error;
    }
  };

  const handleListNameChange = async (
    listName: string,
    listId: string
  ): Promise<string> => {
    try {
      const response = await changeListNameByListId(listName, listId);
      if (!response.ok) {
        throw new Error("Error while changing the list's name");
      }
      const newListName = response.newListName;
      // Why? This is to change the displayed name in the task section on the right too
      // Previously, it would only reflect changes on the list section on the left
      const nextAllLists = [...allLists];
      const affectedList = nextAllLists.find((list) => list.SK === listId);
      if (affectedList) {
        affectedList.listName = newListName;
      }
      setAllLists(nextAllLists);
      return newListName;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleEditTask = async (
    taskId: string,
    newTask: string,
    newDeadline: string
  ): Promise<{ task: string; deadline: string }> => {
    try {
      const response = await editTaskByTaskId(taskId, newTask, newDeadline);
      if (!response.ok) {
        throw new Error("Error while changing the task information");
      }
      return {
        task: response.newTask.task,
        deadline: response.newTask.deadline,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleToggleTaskCompletion = async (
    taskId: string,
    isCompleted: boolean
  ): Promise<boolean> => {
    try {
      const newCompleted = await toggleTaskCompletionByTaskId(
        taskId,
        isCompleted
      );
      return newCompleted;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    try {
      await deleteTaskByTaskId(taskId);
      const newCurrentList = [...currentList].filter(
        (task) => task.SK !== taskId
      );
      setCurrentList(newCurrentList);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteList = async (listId: string): Promise<void> => {
    try {
      await deleteListByListId(listId);
      const newAllLists = [...allLists].filter((list) => list.SK !== listId);
      setAllLists(newAllLists);
      if (currentTab === listId) {
        setCurrentTab("");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
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
                <TaskList
                  key={list.key}
                  title={list.listName}
                  id={list.SK}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  handleListNameChange={handleListNameChange}
                  handleDeleteList={handleDeleteList}
                />
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
                  required
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
              {addTaskError !== "" && (
                <p className="text-red-400">{addTaskError}</p>
              )}
            </div>
            <ul className="px-12 py-0 flex flex-col">
              {currentList.map((task) => {
                return (
                  <TaskItem
                    key={task.key}
                    title={task.taskName}
                    time={task.deadline}
                    completed={task.completed}
                    taskId={task.SK}
                    handleEditTask={handleEditTask}
                    handleDeleteTask={handleDeleteTask}
                    handleToggleTaskCompletion={handleToggleTaskCompletion}
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
