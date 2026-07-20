import React, { useState } from "react";
import CollegeForm from "./CollegeForm";
import CollegeTable from "./CollegeTable";

function College() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);

  // Called when Edit button is clicked
  const handleEditSignal = (collegeData) => {
    setSelectedCollege(collegeData);

    const hiddenTriggerButton = document.getElementById("hiddenModalTrigger");
    if (hiddenTriggerButton) {
      hiddenTriggerButton.click();
    }
  };

  // Called after Save/Update
  const handleFormSubmissionComplete = () => {
    setSelectedCollege(null);
    setRefreshTrigger((prev) => !prev);

    const modalCloseButton = document.getElementById("modalCloseButton");
    if (modalCloseButton) {
      modalCloseButton.click();
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh"
      }}
    >
      {/* Remove Bootstrap dark backdrop */}
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
        id="hiddenModalTrigger"
        className="d-none"
        data-bs-toggle="modal"
        data-bs-target="#collegeModal"
        data-bs-backdrop="false"
      ></button>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold text-dark mb-1">
            College Management Dashboard
          </h1>

          <p className="text-muted mb-0">
            Register academic institutions and manage existing data directories.
          </p>
        </div>

        <button
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-3"
          data-bs-toggle="modal"
          data-bs-target="#collegeModal"
          data-bs-backdrop="false"
          onClick={() => setSelectedCollege(null)}
        >
          ➕ Add College
        </button>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">

          <h3 className="fw-bold text-dark fs-5 mb-3">
            Registered Campuses
          </h3>

          <div className="table-responsive">
            <CollegeTable
              onEdit={handleEditSignal}
              refresh={refreshTrigger}
            />
          </div>

        </div>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="collegeModal"
        tabIndex="-1"
        data-bs-backdrop="false"
        aria-labelledby="collegeModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-3">

            <div className="modal-header border-0">
              <button
                id="modalCloseButton"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body pt-0">
              <CollegeForm
                selectedCollegeData={selectedCollege}
                onUpdateComplete={handleFormSubmissionComplete}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default College;