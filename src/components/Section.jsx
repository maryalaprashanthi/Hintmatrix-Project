import React, { useState } from "react";
import SectionForm from "./SectionForm";
import SectionTable from "./SectionTable";

function Section() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Triggered when clicking 'Edit' in SectionTable
  const handleEditSignal = (sectionData) => {
    // Sets fields matching SectionResponseDTO to pass down to form
    setSelectedSection(sectionData);

    const hiddenTriggerButton = document.getElementById(
      "hiddenSectionModalTrigger"
    );

    if (hiddenTriggerButton) {
      hiddenTriggerButton.click();
    }
  };

  // Triggered after successful POST or PUT in SectionForm
  const handleFormSubmissionComplete = () => {
    setSelectedSection(null);
    // Toggles boolean state to force SectionTable to re-run its GET request
    setRefreshTrigger((prev) => !prev);

    const modalCloseButton = document.getElementById(
      "sectionModalCloseButton"
    );

    if (modalCloseButton) {
      modalCloseButton.click();
    }
  };

  // Explicitly resets form fields when user switches from editing to creating
  const handleAddSectionClick = () => {
    setSelectedSection(null);
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
        id="hiddenSectionModalTrigger"
        className="d-none"
        data-bs-toggle="modal"
        data-bs-target="#sectionModal"
        data-bs-backdrop="false"
      ></button>

      {/* Dashboard Top Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold text-dark mb-1">
            Section Management Dashboard
          </h1>

          <p className="text-muted mb-0">
            Configure system-wide student cohorts and manage active academic
            sections.
          </p>
        </div>

        <button
          className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-3"
          data-bs-toggle="modal"
          data-bs-target="#sectionModal"
          data-bs-backdrop="false"
          onClick={handleAddSectionClick}
        >
          ➕ Add Section
        </button>
      </div>

      {/* Main Table Content Container Card */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">

          <h3 className="fw-bold text-dark fs-5 mb-3">
            Registered Student Sections
          </h3>

          <div className="table-responsive">
            {/* Table receives refresh trigger to re-fetch SectionResponseDTO arrays */}
            <SectionTable
              onEdit={handleEditSignal}
              refresh={refreshTrigger}
            />
          </div>

        </div>
      </div>

      {/* Standard Popup Bootstrap Modal */}
      <div
        className="modal fade"
        id="sectionModal"
        tabIndex="-1"
        data-bs-backdrop="false"
        aria-labelledby="sectionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-3">

            <div className="modal-header border-0">
              <button
                id="sectionModalCloseButton"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setSelectedSection(null)}
              ></button>
            </div>

            <div className="modal-body pt-0">
              {/* Form processes DTO mapping dynamically on change operations */}
              <SectionForm
                selectedSectionData={selectedSection}
                onUpdateComplete={handleFormSubmissionComplete}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Section;
