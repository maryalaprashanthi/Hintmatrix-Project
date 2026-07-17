import React, { useState } from "react";
import SectionForm from "./SectionForm";
import SectionTable from "./SectionTable";

function Section() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Called when Edit button is clicked
  const handleEditSignal = (sectionData) => {
    setSelectedSection(sectionData);

    const hiddenTriggerButton = document.getElementById(
      "hiddenSectionModalTrigger"
    );

    if (hiddenTriggerButton) {
      hiddenTriggerButton.click();
    }
  };

  // Called after Save/Update
  const handleFormSubmissionComplete = () => {
    setSelectedSection(null);
    setRefreshTrigger((prev) => !prev);

    const modalCloseButton = document.getElementById(
      "sectionModalCloseButton"
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
        id="hiddenSectionModalTrigger"
        className="d-none"
        data-bs-toggle="modal"
        data-bs-target="#sectionModal"
        data-bs-backdrop="false"
      ></button>

      {/* Header */}
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
          onClick={() => setSelectedSection(null)}
        >
          ➕ Add Section
        </button>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">

          <h3 className="fw-bold text-dark fs-5 mb-3">
            Registered Student Sections
          </h3>

          <div className="table-responsive">
            <SectionTable
              onEdit={handleEditSignal}
              refresh={refreshTrigger}
            />
          </div>

        </div>
      </div>

      {/* Bootstrap Modal */}
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
              ></button>
            </div>

            <div className="modal-body pt-0">
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