import { useState } from "react";
import { getApiErrorMessage } from "../utils/apiError";
import { useToast } from "../components/Toast/useToast";

// Drives the delete-confirmation flow that pairs with <ConfirmDialog>:
//
//   const del = useDeleteConfirm({
//     entity: "exam",
//     deleteFn: (exam) => ExamService.delete(exam.examId),
//     onDeleted: loadExams,   // just the refetch - the success toast is automatic
//   });
//
//   <button onClick={() => del.request(exam)}>Delete</button>
//
//   <ConfirmDialog
//     open={Boolean(del.pending)}
//     title={`Delete "${del.pending?.examName}"?`}
//     body="This can't be undone."
//     confirmLabel="Delete exam"
//     loading={del.deleting}
//     error={del.error}
//     onConfirm={del.confirm}
//     onCancel={del.close}
//   />
//
// `deleteFn` receives whatever was passed to `request()` (usually the whole
// row) and should perform the API call. A thrown error is caught, run through
// getApiErrorMessage, and shown inline in the dialog so the user can retry.
// On success a toast fires automatically ("Exam deleted" by default, or pass
// `successMessage`) - callers no longer need their own DeleteModal/showDelete.
export function useDeleteConfirm({
  entity = "item",
  deleteFn,
  onDeleted,
  successMessage,
}) {
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const request = (item) => {
    setError(null);
    setPending(item ?? true);
  };

  const close = () => {
    if (deleting) return;
    setPending(null);
    setError(null);
  };

  const confirm = async () => {
    if (pending == null || deleting) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteFn(pending);
      setPending(null);
      toast.success(successMessage || `${capitalize(entity)} deleted.`);
      onDeleted?.(pending);
    } catch (err) {
      console.error(`Failed to delete ${entity}:`, err);
      setError(getApiErrorMessage(err, `Couldn't delete this ${entity}.`));
    } finally {
      setDeleting(false);
    }
  };

  return { pending, deleting, error, request, close, confirm };
}

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export default useDeleteConfirm;
