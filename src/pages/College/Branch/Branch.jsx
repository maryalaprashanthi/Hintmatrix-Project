import { useState, useEffect } from "react";
import AddBranchModal from "./AddBranchmodal";
import "./Branch.css";
import BranchService from "../../../services/BranchService";
import BranchTable from "./BranchTable";
import ConfirmDialog from "../../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { useToast } from "../../../components/Toast/useToast";
import { getApiErrorMessage } from "../../../utils/apiError";

function Branch() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); // 🌟 ADDED: State tracking for editing items
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // Open Add Branch Form Context Block
  const handleAddBranch = () => {
    setSelectedBranch(null);
    setShowModal(true);
  };

  // Open Edit Branch Modal Form (Passed up from AG Grid Row callback event)
  const handleEditBranch = (branchData) => {
    setSelectedBranch(branchData);
    setShowModal(true);
  };

  // Save / Update Branch Orchestration Pipeline
  const handleSave = async (branchData) => {
    console.log("Submitting Branch payload:", branchData);

    try {
      if (branchData.branchId) {
        await BranchService.updateBranch(branchData.branchId, branchData);
        toast.success("Branch updated.");
      } else {
        await BranchService.saveBranch(branchData);
        toast.success("Branch saved.");
      }

      setShowModal(false);
      setSelectedBranch(null);
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Operation failed."));
    }
  };
  const del = useDeleteConfirm({
    entity: "branch",
    deleteFn: (branch) =>
      BranchService.deleteBranch(branch.branchId ?? branch.id ?? branch),
    onDeleted: () => setRefreshTrigger((prev) => !prev),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const response = await BranchService.uploadExcel(file);

      toast.success(
        typeof response.data === "string"
          ? response.data
          : "Branch Excel uploaded.",
      );

      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "File upload failed."));
    }

    e.target.value = "";
  };
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Branch Management</h2>

          <p className="text-muted">Manage all college branches.</p>
        </div>

        {/* Hidden Upload Input */}
        <input
          type="file"
          id="branchUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById("branchUpload").click()}
          >
            ⬆ Upload
          </button>

          <button className="btn btn-primary" onClick={handleAddBranch}>
            + Add Branch
          </button>
        </div>
      </div>

      {/* 🌟 FIXED: Replaced simple local table markup with high performance AG Grid container wrapper */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <BranchTable
            refresh={refreshTrigger}
            onEdit={handleEditBranch}
            onDelete={del.request}
          />
        </div>
      </div>

      {/* Pop-up Portal form matching downstream alignment updates */}
      <AddBranchModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBranch(null);
        }}
        onSave={handleSave}
        selectedBranchData={selectedBranch} // 🌟 Passes row tracking state downstream to inputs
      />
      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.branchName || del.pending?.name || "this branch"}"?`}
        body="Sections, courses and everything under this branch will be removed. This can't be undone."
        confirmLabel="Delete branch"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default Branch;
