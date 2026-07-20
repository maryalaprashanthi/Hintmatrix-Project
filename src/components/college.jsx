import React, { useState } from "react";
import CollegeForm from "./CollegeForm";
import CollegeTable from "./CollegeTable";

function College() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);

  // Triggered when clicking 'Edit' in CollegeTable
  const handleEditSignal = (collegeData) => {
    // Sets fields matching CollegeResponseDTO to pass down to form
    setSelectedCollege(collegeData);
    const hiddenTriggerButton = document.getElementById("hiddenCollegeModalTrigger");
    if (hiddenTriggerButton) {
      hiddenTriggerButton.click();
    }
  };

  // Triggered after successful POST or PUT in CollegeForm
  const handleFormSubmissionComplete = () => {
    setSelectedCollege(null);
    // Toggles boolean state to force CollegeTable to re-run its GET request
    setRefreshTrigger((prev) => !prev);
    const modalCloseButton = document.getElementById("collegeModalCloseButton");
    if (modalCloseButton) {
      modalCloseButton.click();
    }
  };

  // Explicitly resets form fields when user switches from editing to creating
  const handleAddCollegeClick = () => {
    setSelectedCollege(null);
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Scope-isolated styles to handle Bootstrap backdrop layout properly */}
      <style>{`
        .clean-popup-modal {
          background-color: rgba(15, 23, 42, 0.4) !important;
          z-index: 1050 !important;
        }
        /* Fixes body scroll locking and side alignment padding glitches when modal mounts */
        body.modal-open {
          overflow: auto !important;
          padding-right: 0 !important;
        }
        /* Removes conflicting default Bootstrap backdrop overlays completely */
        .modal-backdrop {
          display: none !important;
        }
      `}</style>

      {/* Programmatic Hidden Trigger for Edit Actions */}
      <button
        id="hiddenCollegeModalTrigger"
        className="d-none"
        data-bs-toggle="modal"
        data-bs-target="#collegeModal"
      ></button>

      {/* Main Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold text-dark mb-1 fs-3">College Management Dashboard</h1>
          <p className="text-muted mb-0 small">Register academic institutions and manage existing data directories.</p>
        </div>

        <button
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-3"
          data-bs-toggle="modal"
          data-bs-target="#collegeModal"
          onClick={handleAddCollegeClick}
        >
          ➕ Add College
        </button>
      </div>

      {/* Table Section Card Container */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <h3 className="fw-bold text-dark fs-5 mb-3">Registered Campuses</h3>
          <div className="table-responsive">
            {/* Table receives refresh trigger to re-fetch CollegeResponseDTO arrays */}
            <CollegeTable onEdit={handleEditSignal} refresh={refreshTrigger} />
          </div>
        </div>
      </div>

      {/* Standard Popup Bootstrap Modal - Configured to bypass dark background locks */}
      <div
        className="modal fade clean-popup-modal"
        id="collegeModal"
        tabIndex="-1"
        aria-labelledby="collegeModalLabel"
        aria-hidden="true"
        data-bs-backdrop="false" 
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "680px" }}>
          <div className="modal-content border-0 shadow-lg rounded-3 p-3 bg-white">
            <div className="modal-header border-0 pb-0 justify-content-end">
              <button
                id="collegeModalCloseButton"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setSelectedCollege(null)}
              ></button>
            </div>
            <div className="modal-body pt-0">
              {/* Form processes DTO mapping dynamically on change operations */}
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
