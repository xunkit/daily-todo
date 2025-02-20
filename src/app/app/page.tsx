"use client";

import addNewList from "@/lib/addNewList";
import addTaskToList from "@/lib/addTaskToList";
import changeListNameByListId from "@/lib/changeListNameByListId";
import deleteListByListId from "@/lib/deleteListByListId";
import deleteTaskByTaskId from "@/lib/deleteTaskByTaskId";
import editTaskByTaskId from "@/lib/editTaskByTaskId";
import getAllListsByUserId from "@/lib/getAllListsByUserId";
import getAllTasksByUserIdAndListId from "@/lib/getAllTasksByUserIdAndListId";
import toggleTaskCompletionByTaskId from "@/lib/toggleTaskCompletionByTaskId";
import AddTaskListDialog from "@/components/AddTaskListDialog";
import TaskItem from "@/components/TaskItem";
import TaskList from "@/components/TaskList";
import { List, Task } from "@/types";
import React from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import UserProfile from "@/components/UserProfile";
import { Session } from "next-auth";
import { UserSessionContext } from "@/components/UserSessionProvider";
import { HamburgerMenuIcon, PlusIcon } from "@radix-ui/react-icons";

export default function App() {
  // userSession: the user info retrieved from the global context "UserSessionContext"
  const userSession: Session | null = React.useContext(UserSessionContext);

  // isSidebarOpen: A state to manage whether the sidebar (list of todo lists) is open
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>();

  // currentTab: The listId of the tab currently being selected
  const [currentTab, setCurrentTab] = React.useState<string>("");
  // allLists: An array containing all lists of the user, including metadata
  // and tasks inside a list. For reference, see type.tsx
  const [allLists, setAllLists] = React.useState<Array<List>>([]);
  // currentList: An array containing all tasks inside the currently selected list
  // Quite a confusing name, indeed
  const [currentList, setCurrentList] = React.useState<Array<Task>>([]);
  // isLoadingList: A state to manage when the app is fetching tasks from a list
  const [isLoadingList, setIsLoadingList] = React.useState<boolean>();
  // tentativeTask: A state to manage the current task being typed in
  const [tentativeTask, setTentativeTask] = React.useState<string>("");
  // tentativeDeadline: A state to manage the current deadline being typed in
  const [tentativeDeadline, setTentativeDeadline] = React.useState<string>("");
  // addTaskError: Errors related to adding tasks
  const [addTaskError, setAddTaskError] = React.useState<string>("");
  // taskFieldRef: A ref of the Task field, mainly used to focus back on the first field
  // after the user presses the add button
  const TaskFieldRef = React.useRef<HTMLInputElement>(null);
  // isAddingTask: A state to manage whether the process of adding task
  // is being carried out, in which case the add button will pause momentarily
  const [isAddingTask, setIsAddingTask] = React.useState<boolean>(false);
  // congratulations: Congratulate the user on finishing all their tasks
  const [congratulations, setCongratulations] = React.useState<string>("");
  // taskFilterMode: A state to manage how tasks are being filtered
  const [taskFilterMode, setTaskFilterMode] = React.useState<
    "all" | "completed" | "pending"
  >("all");
  // filteredList: Tasks that have been filtered based on taskFilterMode
  const filteredList: Array<Task> = currentList.filter((task) => {
    if (taskFilterMode === "all") return currentList;
    if (taskFilterMode === "completed") return task.completed === true;
    if (taskFilterMode === "pending") return task.completed === false;
  });

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
      setCongratulations("");
      setIsLoadingList(false);
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

  React.useEffect(() => {
    if (!isAddingTask) {
      TaskFieldRef.current?.focus();
    }
  }, [isAddingTask]);

  React.useEffect(() => {
    if (!isLoadingList) {
      TaskFieldRef.current?.focus();
    }
  }, [isLoadingList]);

  const handleSetCurrentTab = async (listId: string) => {
    if (currentTab !== listId) {
      setIsLoadingList(true);
    }
    setCurrentTab(listId);
  };

  const handleAddNewList = async (listName: string) => {
    try {
      const response = await addNewList(listName);
      const responseListId = response.listId;
      const responseListName = response.listName;
      const responseUserId = response.userId;
      const responseCreatedAt = response.createdAt;
      if (!response.ok) {
        throw new Error("Error while adding a new list");
      }
      setAllLists([
        ...allLists,
        {
          PK: responseUserId,
          SK: responseListId,
          createdAt: responseCreatedAt,
          dataType: "LIST",
          listName: responseListName,
          key: responseListId,
        },
      ]);
      setCurrentTab(responseListId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleAddTaskToList = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddTaskError("");
    setIsAddingTask(true);
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
    } catch (error) {
      console.error(error);
      setAddTaskError((error as Error).toString());
      throw error;
    } finally {
      setIsAddingTask(false);
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
      const task = [...currentList].find((task) => task.SK === taskId);
      if (task) task.completed = newCompleted;
      if (currentList.every((task) => task.completed === true)) {
        setCongratulations("Nice work!");
      } else {
        setCongratulations("");
      }
      setCurrentList([...currentList]);
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
      <div className="text-gray-800 text-base font-medium px-4 py-2 w-[100%] rounded-full hover:bg-black/10 flex items-center gap-4">
        <PlusIcon className="stroke-black stroke-[1px] [&>path]:stroke-inherit" />{" "}
        New list
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-center items-stretch relative">
        <button
          className="absolute top-6 left-5 hover:bg-black/10 p-4 rounded-full z-50"
          onClick={() => setIsSidebarOpen((isSidebarOpen) => !isSidebarOpen)}
        >
          <HamburgerMenuIcon />
        </button>
        <div
          className={`w-[250px] lg:w-[300px] pt-32 px-4 bg-sky-50 min-h-[100svh] max-sm:absolute max-sm:inset-0 ${
            isSidebarOpen
              ? "block max-sm:w-[80%] black-overlay-behind"
              : "hidden"
          }`}
        >
          <div className="flex justify-between mb-4 w-[100%] items-center pr-5">
            <AddTaskListDialog
              trigger={<AddListButton />}
              onSubmit={handleAddNewList}
            />
          </div>
          <ul className="text-lg flex flex-col">
            {[...allLists]
              .sort((listA, listB) => {
                const dateA = new Date(listA.createdAt).getTime();
                const dateB = new Date(listB.createdAt).getTime();

                return dateB - dateA;
              })
              .map((list) => {
                return (
                  <TaskList
                    key={list.key}
                    title={list.listName}
                    id={list.SK}
                    currentTab={currentTab}
                    handleSetCurrentTab={handleSetCurrentTab}
                    handleListNameChange={handleListNameChange}
                    handleDeleteList={handleDeleteList}
                  />
                );
              })}
          </ul>
        </div>
        {isLoadingList === true ? (
          <div className="flex-1">
            <div className="flex flex-col justify-between items-start px-12 py-8">
              <h2 className="text-2xl font-bold">{currentTabName}</h2>
              <div className="flex gap-2">
                <span className="text-lg">Loading…</span>
              </div>
            </div>

            <div className="px-12 py-12 pt-4"></div>
          </div>
        ) : currentTab !== "" ? (
          <div
            className={`flex-1 ${
              isSidebarOpen ? "max-sm:relative max-sm:-z-10" : ""
            }`}
          >
            <div
              className={`flex justify-between items-center px-12 ${
                isSidebarOpen ? "" : "ml-8"
              }`}
            >
              <div className="flex flex-col justify-between items-start py-8">
                <h2 className="text-2xl font-bold">{currentTabName}</h2>
                <div className="flex gap-2">
                  <span className="text-lg">
                    {remainingTasks > 1
                      ? `${remainingTasks} tasks`
                      : `${remainingTasks} task`}{" "}
                    remaining
                  </span>
                  {congratulations && (
                    <>
                      <span className="font-bold text-sky-800 underline underline-offset-4 pl-[8px] pt-[2px]">
                        {congratulations} 🎊
                      </span>
                    </>
                  )}
                </div>
              </div>
              {userSession?.user?.name && userSession?.user?.image && (
                <UserProfile
                  displayName={userSession.user.name}
                  avatarUrl={userSession.user.image}
                />
              )}
            </div>
            <div className="px-12 py-12 pt-4">
              <form
                className="flex gap-8 text-lg"
                onSubmit={handleAddTaskToList}
              >
                <input
                  className="flex-[60%] bg-inherit px-4 py-2 border-b-2 border-gray-400 outline-none focus:border-black"
                  type="text"
                  placeholder="New task"
                  value={tentativeTask}
                  onChange={(e) => {
                    setTentativeTask(e.target.value);
                  }}
                  ref={TaskFieldRef}
                  maxLength={120}
                  disabled={isAddingTask}
                  required
                />
                <input
                  className="flex-[20%] bg-inherit px-4 py-2 border-b-2 border-gray-400 outline-none focus:border-black"
                  type="text"
                  placeholder="Deadline"
                  value={tentativeDeadline}
                  onChange={(e) => {
                    setTentativeDeadline(e.target.value);
                  }}
                  maxLength={40}
                  disabled={isAddingTask}
                />
                <button
                  type="submit"
                  className={`aspect-square text-white text-xl font-extrabold px-4  ${
                    isAddingTask
                      ? "bg-gray-400 hover:bg-gray-400"
                      : "bg-black hover:bg-gray-400"
                  }`}
                  disabled={isAddingTask}
                >
                  +
                </button>
              </form>
              {addTaskError !== "" && (
                <p className="text-red-400">{addTaskError}</p>
              )}
            </div>
            <div>
              <ToggleGroup.Root
                type="single"
                aria-label="Filter tasks"
                value={taskFilterMode}
                onValueChange={(value: "all" | "completed" | "pending") => {
                  setTaskFilterMode(value);
                }}
                className="flex gap-8 px-12"
              >
                <ToggleGroup.Item
                  value="all"
                  className="px-4 py-2 rounded-full hover:bg-sky-100 data-[state=on]:bg-sky-200 data-[state=on]:text-sky-950"
                >
                  Show all
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="pending"
                  className="px-4 py-2 rounded-full hover:bg-sky-100 data-[state=on]:bg-sky-200 data-[state=on]:text-sky-950"
                >
                  Pending only
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="completed"
                  className="px-4 py-2 rounded-full hover:bg-sky-100 data-[state=on]:bg-sky-200 data-[state=on]:text-sky-950"
                >
                  Completed only
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </div>
            <ul className="px-12 py-8 flex flex-col">
              {[...filteredList]
                .sort((taskA, taskB) => {
                  const dateA = new Date(taskA.createdAt).getTime();
                  const dateB = new Date(taskB.createdAt).getTime();

                  return dateA - dateB;
                })
                .map((task) => {
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
