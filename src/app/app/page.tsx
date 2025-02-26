"use client";

import addNewList from "@/lib/dynamodb/addNewList";
import addTaskToList from "@/lib/dynamodb/addTaskToList";
import changeListNameByListId from "@/lib/dynamodb/changeListNameByListId";
import deleteListByListId from "@/lib/dynamodb/deleteListByListId";
import deleteTaskByTaskId from "@/lib/dynamodb/deleteTaskByTaskId";
import editTaskByTaskId from "@/lib/dynamodb/editTaskByTaskId";
import getAllListsByUserId from "@/lib/dynamodb/getAllListsByUserId";
import getAllTasksByListId from "@/lib/dynamodb/getAllTasksByListId";
import toggleTaskCompletionByTaskId from "@/lib/dynamodb/toggleTaskCompletionByTaskId";
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
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { AnimatePresence } from "motion/react";
import AITaskDialog from "@/components/AITaskDialog";
import getTasksFromPrompt from "@/lib/gemini/getTasksFromPrompt";

export default function App() {
  // userSession: the user info retrieved from the global context "UserSessionContext"
  const userSession: Session | null = React.useContext(UserSessionContext);

  // isSidebarOpen: A state to manage whether the sidebar (list of todo lists) is open
  // Null, because in case the user wants to open it BEFORE the page has loaded and
  // assigned whether the sidebar should be open, we should respect their choice to open or close.
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean | null>(
    null
  );

  // Close the sidebar if the user's on mobile, open it if the user's on desktop
  React.useEffect(() => {
    if (window.innerWidth > 640) {
      setIsSidebarOpen(true);
    }

    const mediaQuery = window.matchMedia("(min-width: 640px)");

    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setIsSidebarOpen(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  // currentTab: The listId of the tab currently being selected
  const [currentTab, setCurrentTab] = React.useState<string>("");
  // allLists: An array containing all lists of the user, including metadata
  // and tasks inside a list. For reference, see type.tsx
  const [allLists, setAllLists] = React.useState<Array<List>>([]);
  // isLoadingAllLists: A state to manage when the app is fetching all lists from the user
  const [isLoadingAllLists, setIsLoadingAllLists] =
    React.useState<boolean>(true);
  // currentList: An array containing all tasks inside the currently selected list
  // Quite a confusing name, indeed
  const [currentList, setCurrentList] = React.useState<Array<Task>>([]);
  // isLoadingList: A state to manage when the app is fetching tasks from a list
  const [isLoadingList, setIsLoadingList] = React.useState<boolean>(false);
  // lastEvaluatedKey: A state to manage when the last fetch ended (for pagination)
  const [lastEvaluatedKey, setLastEvaluatedKey] = React.useState<
    Record<string, AttributeValue> | undefined | null
  >(null);
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
    setIsLoadingList(true);

    const fetchTasks = async () => {
      const { tasks, lastEvaluatedKey } = await getAllTasksByListId(currentTab);
      setCurrentList(tasks);
      setLastEvaluatedKey(lastEvaluatedKey);
      setCongratulations("");
      setIsLoadingList(false);
    };

    fetchTasks();
  }, [currentTab]);

  React.useEffect(() => {
    const temp = async () => {
      try {
        setIsLoadingAllLists(true);
        const data = await getAllListsByUserId();
        setAllLists(data);
      } catch (error) {
        console.error((error as Error).toString());
        throw error;
      } finally {
        setIsLoadingAllLists(false);
      }
    };

    temp();
  }, []);

  React.useEffect(() => {
    if (!isAddingTask) {
      TaskFieldRef.current?.focus();
    }
  }, [isAddingTask]);

  const handleSetCurrentTab = async (listId: string) => {
    if (currentTab !== listId) {
      setIsLoadingList(true);
    }
    setCurrentTab(listId);
  };

  const handleLoadMoreTasks = async () => {
    const { tasks: newTasks, lastEvaluatedKey: newLastEvaluatedKey } =
      await getAllTasksByListId(currentTab, lastEvaluatedKey ?? undefined);
    setCurrentList([...currentList, ...newTasks]);
    setLastEvaluatedKey(newLastEvaluatedKey);
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
      const nextCurrentList = [...currentList];
      const affectedTask = nextCurrentList.find((task) => task.SK === taskId);
      if (affectedTask) {
        affectedTask.taskName = response.newTask.task;
        affectedTask.deadline = response.newTask.deadline;
      }
      setCurrentList(nextCurrentList);
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

  const handleCreateTasksFromPrompt = async (prompt: string) => {
    try {
      const result = await getTasksFromPrompt(prompt);
      const resultJSON: Array<{ task: string; deadline: string }> =
        JSON.parse(result);
      for (const task of resultJSON) {
        const response = await addTaskToList(
          currentTab,
          task.task,
          task.deadline
        );
        if (!response.ok) {
          throw new Error("Error while adding a new task");
        }
        setCurrentList((currentList) => [
          ...currentList,
          { ...response.newTask, key: response.newTask.SK },
        ]);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const AddListButton = () => {
    return (
      <div className="text-gray-800 text-base font-medium px-4 py-2 w-[100%] rounded-lg hover:bg-black/10 flex items-center gap-4">
        <PlusIcon className="stroke-black stroke-[1px] [&>path]:stroke-inherit" />{" "}
        New list
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-center items-stretch relative">
        <button
          className="absolute top-9 sm:top-6 left-2 sm:left-5 hover:bg-black/10 p-4 rounded-full z-50"
          onClick={() => {
            if (isSidebarOpen === null) {
              setIsSidebarOpen(true);
            }
            setIsSidebarOpen((isSidebarOpen) => !isSidebarOpen);
          }}
        >
          <HamburgerMenuIcon />
        </button>
        <div
          className={`sm:min-w-[300px] pt-32 px-4 bg-sky-50 min-h-[100svh] absolute inset-0 sm:static sm:inset-auto ${
            isSidebarOpen
              ? "block w-[80%] sm:w-auto black-overlay-behind"
              : "hidden"
          }`}
        >
          {isLoadingAllLists === false && (
            <div className="flex justify-between mb-4 w-[100%] items-center pr-5">
              <AddTaskListDialog
                trigger={<AddListButton />}
                onSubmit={handleAddNewList}
              />
            </div>
          )}
          <ul className="flex flex-col">
            {isLoadingAllLists ? (
              <p className="px-4"> Loading… </p>
            ) : (
              [...allLists]
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
                      disabled={isLoadingList}
                    />
                  );
                })
            )}
          </ul>
        </div>
        {isLoadingList === true ? (
          <div className="flex-1">
            <div className="flex flex-col justify-between items-start ml-12 sm:ml-auto px-2 sm:px-12 py-8">
              <h2 className="text-lg font-bold">{currentTabName}</h2>
              <div className="flex gap-2">
                <span className="text-lg">Loading…</span>
              </div>
            </div>

            <div className="px-6 sm:px-12 py-12 pt-4"></div>
          </div>
        ) : currentTab !== "" ? (
          <div
            className={`flex-1 ${
              isSidebarOpen ? "relative -z-10 sm:static sm:z-auto" : ""
            }`}
          >
            <div
              className={`flex justify-between items-center px-6 sm:px-12 ${
                isSidebarOpen ? "" : "ml-8"
              }`}
            >
              <div className="flex flex-col justify-between items-start py-8">
                <h2 className="text-lg font-bold">{currentTabName}</h2>
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
            <div className="px-6 sm:px-12 py-12 pt-4">
              <form
                className="flex gap-8 text-lg flex-wrap"
                onSubmit={handleAddTaskToList}
              >
                <input
                  className="flex-auto relative bg-inherit px-4 py-2 border-b-2 border-gray-400 outline-none focus:border-black"
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
                  className="min-w-[100px] sm:max-w-[20%] bg-inherit px-4 py-2 border-b-2 border-gray-400 outline-none focus:border-black"
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
                  className={`aspect-square text-white text-lg font-extrabold px-4  ${
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
              <AITaskDialog onSubmit={handleCreateTasksFromPrompt}>
                <div className="bg-blue-200 px-4 py-2 rounded-lg my-4 hover:bg-blue-300">
                  Create Tasks with AI
                </div>
              </AITaskDialog>
            </div>
            <div>
              <ToggleGroup.Root
                type="single"
                aria-label="Filter tasks"
                value={taskFilterMode}
                onValueChange={(value: "all" | "completed" | "pending") => {
                  setTaskFilterMode(value);
                }}
                className="flex gap-8 px-6 sm:px-12"
              >
                <ToggleGroup.Item
                  value="all"
                  className="px-4 py-2 rounded-lg hover:bg-sky-100 data-[state=on]:bg-sky-200 data-[state=on]:text-sky-950"
                >
                  Show all
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="pending"
                  className="px-4 py-2 rounded-lg hover:bg-sky-100 data-[state=on]:bg-sky-200 data-[state=on]:text-sky-950"
                >
                  Pending
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="completed"
                  className="px-4 py-2 rounded-lg hover:bg-sky-100 data-[state=on]:bg-sky-200 data-[state=on]:text-sky-950"
                >
                  Completed
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </div>
            <ul className="px-6 sm:px-12 py-8 flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {[...filteredList]
                  .sort((taskA, taskB) => {
                    const dateA = new Date(taskA.createdAt).getTime();
                    const dateB = new Date(taskB.createdAt).getTime();

                    return dateB - dateA;
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
              </AnimatePresence>
              {lastEvaluatedKey !== undefined && (
                <button
                  className="px-8 py-4 bg-white hover:bg-gray-100 rounded-lg border-black/10 border-[2px]"
                  onClick={handleLoadMoreTasks}
                  type="button"
                >
                  Load more
                </button>
              )}
            </ul>
          </div>
        ) : (
          <div
            className={`p-8 flex-[80%] flex items-center sm:items-start ${
              isSidebarOpen ? "" : "ml-12"
            } `}
          >
            <h2 className="text-lg font-bold flex-1">Select a list</h2>
            {userSession?.user?.name && userSession?.user?.image && (
              <UserProfile
                displayName={userSession.user.name}
                avatarUrl={userSession.user.image}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
