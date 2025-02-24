import * as React from "react";
import { TaskListProps } from "@/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import DeleteDialog from "../DeleteDialog";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

const TaskList = ({
  title,
  id,
  currentTab,
  disabled,
  handleSetCurrentTab: onSetCurrentTab,
  handleListNameChange: onSubmit,
  handleDeleteList: onDelete,
}: TaskListProps) => {
  const inputId = React.useId();
  // Why listName? To be able to update the displayed list name
  // the title can be treated as an initial value we fetch from the database
  // and the title can be changed
  const [listName, setListName] = React.useState<string>(title);
  const isBeingSelected = id === currentTab;
  const turnBlueIfHoveredCSS = `${
    isBeingSelected === false ? "hover:bg-gray-200" : ""
  }`;
  const turnBlueIfSelectedCSS = `${
    isBeingSelected ? "bg-sky-200 text-sky-800" : ""
  }`;

  // Dialog to Edit the list's name
  interface EditListDialogProps {
    children: React.ReactNode;
  }
  const EditListDialog = ({ children }: EditListDialogProps) => {
    const [tentativeListName, setTentativeListName] =
      React.useState<string>(title);
    const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>();
    const [error, setError] = React.useState<string>("");
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>();

    const clearForm = () => {
      setTentativeListName("");
      setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      setError("");
      setIsSubmitting(true);
      try {
        const newListName: string = await onSubmit(tentativeListName, id);
        setListName(newListName);
        setIsDialogOpen(false);
        setIsDropdownOpen(false);
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
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 text-gray-900 shadow">
            <Dialog.Title className="text-lg mb-8">Edit list</Dialog.Title>
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <label htmlFor={inputId} className="font-bold">
                List name
              </label>
              <input
                className="bg-inherit min-w-[300px] sm:min-w-[400px] py-2 border-b-2 border-gray-400 outline-none focus:border-black"
                placeholder="Name"
                id={inputId}
                required
                value={tentativeListName}
                maxLength={40}
                onChange={(e) => setTentativeListName(e.target.value)}
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
                  className={`px-4 py-2 ${
                    isSubmitting
                      ? "bg-gray-400 hover:bg-gray-400"
                      : "bg-sky-500 hover:bg-sky-700"
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
    <li
      className={`flex justify-between items-center relative rounded-lg ${turnBlueIfHoveredCSS} ${turnBlueIfSelectedCSS}`}
    >
      <button
        className={`cursor-pointer p-4 px-5 w-[80%] truncate text-start ${
          isBeingSelected ? "font-bold text-[105%]" : ""
        }`}
        disabled={disabled}
        onClick={() => onSetCurrentTab(id)}
      >
        {listName}
      </button>
      <DropdownMenu.Root
        defaultOpen={false}
        open={isDropdownOpen}
        onOpenChange={(open) => {
          setIsDropdownOpen(open);
        }}
      >
        <DropdownMenu.Trigger asChild>
          <button
            className={`absolute right-5 p-[10px] h-10 w-10 hover:bg-black/10 focus:bg-black/10 ${
              isDropdownOpen ? "bg-black/10" : ""
            } active:outline-none focus-visible:outline-none rounded-full`}
          >
            <DotsHorizontalIcon />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="bg-white border-black/5 border-2 min-w-[220px] shadow p-2">
            <EditListDialog>
              <DropdownMenu.Item
                onSelect={(e: Event) => {
                  e.preventDefault();
                }}
              >
                <button className="p-2 hover:bg-gray-100 hover:outline-none w-[100%] block text-start">
                  Edit
                </button>
              </DropdownMenu.Item>
            </EditListDialog>
            <DeleteDialog
              type="list"
              onDelete={async () => {
                await onDelete(id);
              }}
            >
              <DropdownMenu.Item
                onSelect={(e: Event) => {
                  e.preventDefault();
                }}
              >
                <button className="p-2 bg-red-50 hover:bg-red-100 w-[100%] text-start hover:outline-none">
                  Delete
                </button>
              </DropdownMenu.Item>
            </DeleteDialog>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </li>
  );
};

export default TaskList;
