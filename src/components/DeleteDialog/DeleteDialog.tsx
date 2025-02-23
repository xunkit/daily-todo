import * as React from "react";
import * as Alert from "@radix-ui/react-alert-dialog";

interface DeleteDialogProps {
  onDelete: () => Promise<void>;
  type: "list" | "task";
  children: React.ReactNode;
}

function DeleteDialog({ onDelete, type, children }: DeleteDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>();
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      if (isDeleting) return;
      setIsDialogOpen(false);
    } catch (error) {
      setError((error as Error).toString());
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Alert.Root
      defaultOpen={false}
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
    >
      <Alert.Trigger asChild>{children}</Alert.Trigger>
      <Alert.Portal>
        <Alert.Overlay className="fixed inset-0 bg-black/60" />
        <Alert.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 text-gray-900 shadow min-w-[400px]">
          <Alert.Title className="text-3xl mb-2">Delete {type}</Alert.Title>
          <Alert.Description className="text-lg">
            Do you want to delete this {type}? This action cannot be undone.
          </Alert.Description>
          <div className="flex w-[100%] justify-end mt-8 gap-4">
            <Alert.Cancel asChild>
              <button
                disabled={isDeleting}
                className={`px-4 py-2 ${
                  isDeleting
                    ? "bg-gray-400 text-black"
                    : "bg-gray-900 text-white hover:bg-gray-700"
                }`}
              >
                Go back
              </button>
            </Alert.Cancel>
            <Alert.Action
              asChild
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
              }}
            >
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className={`px-4 py-2 ${
                  isDeleting
                    ? "bg-gray-400 text-black"
                    : "bg-red-600 text-white hover:bg-red-800"
                }`}
              >
                Delete
              </button>
            </Alert.Action>
          </div>
          {error !== "" && <p className="text-red-400">{error}</p>}
        </Alert.Content>
      </Alert.Portal>
    </Alert.Root>
  );
}

export default DeleteDialog;
