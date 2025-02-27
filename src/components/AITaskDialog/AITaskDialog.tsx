import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface AITaskDialogProps {
  onSubmit: (prompt: string) => Promise<void>;
  children: React.ReactNode;
}

function AITaskDialog({ onSubmit, children }: AITaskDialogProps) {
  const id = React.useId();
  const [tentativePrompt, setTentativePrompt] = React.useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>();
  const [error, setError] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>();

  const clearForm = () => {
    setTentativePrompt("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(tentativePrompt);
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
        clearForm();
      }}
    >
      <Dialog.Trigger asChild>
        <button>{children}</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 text-gray-900 shadow">
          <Dialog.Title className="text-xl mb-8">
            Create tasks from prompt
          </Dialog.Title>
          <form className="flex flex-col text-base" onSubmit={handleSubmit}>
            <label htmlFor={id} className="font-bold">
              Enter your prompt
            </label>
            <input
              className="bg-inherit min-w-[300px] sm:min-w-[400px] py-2 border-b-2 border-gray-400 outline-none focus:border-black"
              placeholder="Prompt"
              id={id}
              value={tentativePrompt}
              maxLength={1000}
              onChange={(e) => {
                setTentativePrompt(e.target.value);
              }}
            />
            {error !== "" && <p className="text-red-400">{error}</p>}
            <div className="flex mt-8 justify-end">
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
                className={` px-4 py-2 ${
                  isSubmitting
                    ? "bg-gray-400 hover:bg-gray-400"
                    : "bg-sky-500 hover:bg-sky-700"
                }`}
                disabled={isSubmitting}
              >
                Create
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AITaskDialog;
