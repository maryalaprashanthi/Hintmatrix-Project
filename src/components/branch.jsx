import React, { useState } from "react";
import BranchForm from "./BranchForm";
import BranchTable from "./BranchTable";

function Branch() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Triggered when clicking 'Edit' in BranchTable
  const handleEditSignal = (branchData) => {
    // Sets fields matching BranchResponseDTO to pass down to form
    setSelectedBranch(branchData);

    const hiddenTriggerButton = document.getElementById(
      "hiddenBranchModalTrigger"
    );
    if (hiddenTriggerButton) {
      hiddenTriggerButton.click();
    }
  };

  // Triggered after successful POST or PUT in BranchForm
  const handleFormSubmissionComplete = () => {
    setSelectedBranch(null);
    // Toggles boolean state to force BranchTable to re-run its GET request
    setRefreshTrigger((prev) => !prev);

    const modalCloseButton = document.getElementById(
      "branchModalCloseButton"
    );
    if (modalCloseButton) {
      modalCloseButton.click();
    }
  };

  // Explicitly resets form fields when user switches from editing to creating
  const handleAddBranchClick = () => {
    setSelectedBranch(null);
  };

  return (
    <div
      className="container-fluid p-4"
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Scope-isolated styles to handle Bootstrap backdrop layout properly */}
      <style>{`
        .modal-backdrop {
          display: none !important;
        }
        body.modal-open {
          overflow: auto !important;
          padding-right: 0 !important;
        }
      `}</style>

      {/* Programmatic Hidden Trigger for Edit Actions */}
      <button
        id="hiddenBranchModalTrigger"
        className="d-none"
        data-bs-toggle="modal"
        data-bs-target="#branchModal"
        data-bs-backdrop="false"
      ></button>

      {/* Dashboard Top Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold text-dark mb-1">
            Branch Management Dashboard
          </h1>
          <p className="text-muted mb-0">
            Configure system-wide academic branches and manage existing data tables.
          </p>
        </div>

        <button
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-3"
          data-bs-toggle="modal"
          data-bs-target="#branchModal"
          data-bs-backdrop="false"
          onClick={handleAddBranchClick}
        >
          ➕ Add Branch
        </button>
      </div>

      {/* Main Table Content Container Card */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <h3 className="fw-bold text-dark fs-5 mb-3">
            Registered Academic Branches
          </h3>
          <div className="table-responsive">
            {/* Table receives refresh trigger to re-fetch BranchResponseDTO arrays */}
            <BranchTable
              onEdit={handleEditSignal}
              refresh={refreshTrigger}
            />
          </div>
        </div>
      </div>

      {/* Standard Popup Bootstrap Modal */}
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
                onClick={() => setSelectedBranch(null)}
              ></button>
            </div>

            <div className="modal-body pt-0">
              {/* Form processes DTO mapping dynamically on change operations */}
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
