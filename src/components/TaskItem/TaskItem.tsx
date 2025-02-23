import * as React from "react";
import { TaskItemProps } from "@/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import DeleteDialog from "../DeleteDialog";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

const TaskItem = ({
  title,
  time,
  completed,
  taskId,
  handleEditTask: onSubmit,
  handleDeleteTask: handleDelete,
  handleToggleTaskCompletion: onToggleCompletion,
}: TaskItemProps) => {
  const [task, setTask] = React.useState(title);
  const [deadline, setDeadline] = React.useState(time);
  const [isCompleted, setIsCompleted] = React.useState<boolean>(completed);
  const [isToggling, setIsToggling] = React.useState<boolean>(false);
  const [toggleCompletedError, setToggleCompletedError] =
    React.useState<string>("");

  const handleToggleCompletion = async () => {
    setIsToggling(true);
    setToggleCompletedError("");
    try {
      const newIsCompleted = await onToggleCompletion(taskId, !isCompleted);
      setIsCompleted(newIsCompleted);
    } catch (error) {
      setToggleCompletedError((error as Error).toString());
      throw error;
    } finally {
      setIsToggling(false);
    }
  };

  // Dialog to Edit the list's name
  interface EditTaskDialogProps {
    children: React.ReactNode;
  }
  const EditTaskDialog = ({ children }: EditTaskDialogProps) => {
    const inputId1 = React.useId();
    const inputId2 = React.useId();
    const [tentativeTask, setTentativeTask] = React.useState<string>(title);
    const [tentativeDeadline, setTentativeDeadline] =
      React.useState<string>(time);
    const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>();
    const [error, setError] = React.useState<string>("");
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>();

    const clearForm = () => {
      setTentativeTask("");
      setError("");
    };

    interface newTaskObject {
      task: string;
      deadline: string;
    }
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      setError("");
      setIsSubmitting(true);
      try {
        const newTask: newTaskObject = await onSubmit(
          taskId,
          tentativeTask,
          tentativeDeadline
        );
        setTask(newTask.task);
        setDeadline(newTask.deadline);
        setIsDialogOpen(false);
      } catch (error) {
        setError((error as Error).toString());
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog.Root
        defaultOpen={false}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
        }}
      >
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 text-gray-900 shadow min-w-[400px]">
            <Dialog.Title className="text-3xl mb-8">Edit list</Dialog.Title>
            <form className="flex flex-col text-xl" onSubmit={handleSubmit}>
              <label htmlFor={inputId1} className="font-bold">
                Task
              </label>
              <input
                className="bg-inherit min-w-[400px] py-2 border-b-2 border-gray-400 outline-none focus:border-black mb-4"
                placeholder="Task"
                id={inputId1}
                required
                value={tentativeTask}
                onChange={(e) => setTentativeTask(e.target.value)}
                maxLength={120}
              />
              <label htmlFor={inputId2} className="font-bold">
                Deadline
              </label>
              <input
                className="bg-inherit min-w-[400px] py-2 border-b-2 border-gray-400 outline-none focus:border-black"
                placeholder="Deadline"
                id={inputId2}
                value={tentativeDeadline}
                maxLength={40}
                onChange={(e) => setTentativeDeadline(e.target.value)}
              />
              {error !== "" && <p className="text-red-400">{error}</p>}
              <div className="flex mt-8 justify-end ">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className={`px-4 py-2 mr-4 ${
                      isSubmitting ? "" : "hover:text-gray-600"
                    }`}
                    disabled={isSubmitting}
                    onClick={clearForm}
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  className={`bg-sky-500 px-4 py-2 ${
                    isSubmitting
                      ? "bg-gray-400 hover:bg-gray-400"
                      : "hover:bg-sky-700"
                  }`}
                >
                  Save
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  };

  // WHY? This is to preserve the hover effect when the dropdown is open
  // Basically pretending like the dropdown burger button is still being hovered
  // when it's actually already opened
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>();
  return (
    <li className="my-2 flex items-center gap-2 border-b border-gray-200 last:border-b-0 pb-6">
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={async () => await handleToggleCompletion()}
        className="mr-2 w-[32px] h-[32px]"
        disabled={isToggling}
      />
      <div className="relative flex flex-col gap-1 w-[100%]">
        <span className="text-lg pr-8 break-words">{task}</span>
        <span className="text-base font-mono">{deadline}</span>
        <DropdownMenu.Root
          defaultOpen={false}
          open={isDropdownOpen}
          onOpenChange={(open) => {
            setIsDropdownOpen(open);
          }}
        >
          <DropdownMenu.Trigger asChild>
            <button
              className={`absolute right-0 h-[100%] p-2 hover:bg-black/20 focus:bg-black/20 ${
                isDropdownOpen ? "bg-black/20" : ""
              } active:outline-none focus-visible:outline-none`}
            >
              <DotsHorizontalIcon />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-white border-black/5 border-2 min-w-[220px] shadow text-xl p-2">
              <EditTaskDialog>
                <button className="p-2 hover:bg-gray-100 hover:outline-none w-[100%] block text-start">
                  Edit
                </button>
              </EditTaskDialog>
              <DeleteDialog
                type="task"
                onDelete={async () => {
                  await handleDelete(taskId);
                }}
              >
                <button className="p-2 bg-red-50 hover:bg-red-100 hover:outline-none w-[100%] text-start">
                  Delete
                </button>
              </DeleteDialog>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {toggleCompletedError !== "" && (
          <p className="text-red-400">{toggleCompletedError}</p>
        )}
      </div>
    </li>
  );
};

export default TaskItem;
