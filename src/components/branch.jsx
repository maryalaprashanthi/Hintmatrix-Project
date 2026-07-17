import React, { useState } from "react";
import BranchForm from "./BranchForm";
import BranchTable from "./BranchTable";

function Branch() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Called when Edit button is clicked
  const handleEditSignal = (branchData) => {
    setSelectedBranch(branchData);

    const hiddenTriggerButton = document.getElementById(
      "hiddenBranchModalTrigger"
    );

    if (hiddenTriggerButton) {
      hiddenTriggerButton.click();
    }
  };

  // Called after Save/Update
  const handleFormSubmissionComplete = () => {
    setSelectedBranch(null);
    setRefreshTrigger((prev) => !prev);

    const modalCloseButton = document.getElementById(
      "branchModalCloseButton"
    );

    if (modalCloseButton) {
      modalCloseButton.click();
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Remove Bootstrap Backdrop */}
      <style>{`
        .modal-backdrop {
          display: none !important;
        }

        body.modal-open {
          overflow: auto !important;
          padding-right: 0 !important;
        }
      `}</style>

      {/* Hidden Trigger */}
      <button
        id="hiddenBranchModalTrigger"
        className="d-none"
        data-bs-toggle="modal"
        data-bs-target="#branchModal"
        data-bs-backdrop="false"
      ></button>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold text-dark mb-1">
            Branch Management Dashboard
          </h1>

          <p className="text-muted mb-0">
            Configure system-wide academic branches and manage existing data
            tables.
          </p>
        </div>

        <button
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-3"
          data-bs-toggle="modal"
          data-bs-target="#branchModal"
          data-bs-backdrop="false"
          onClick={() => setSelectedBranch(null)}
        >
          ➕ Add Branch
        </button>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">

          <h3 className="fw-bold text-dark fs-5 mb-3">
            Registered Academic Branches
          </h3>

          <div className="table-responsive">
            <BranchTable
              onEdit={handleEditSignal}
              refresh={refreshTrigger}
            />
          </div>

        </div>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="branchModal"
        tabIndex="-1"
        data-bs-backdrop="false"
        aria-labelledby="branchModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-3">

            <div className="modal-header border-0">
              <button
                id="branchModalCloseButton"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body pt-0">
              <BranchForm
                selectedBranchData={selectedBranch}
                onUpdateComplete={handleFormSubmissionComplete}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Branch;