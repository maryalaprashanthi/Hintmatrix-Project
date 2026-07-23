import React, { useState } from "react";
import SectionForm from "./SectionForm";
import SectionTable from "./SectionTable";

function Section() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleAddSection = () => {
    setSelectedSection(null);
    setShowModal(true);
  };

  const handleEditSection = (sectionData) => {
    setSelectedSection(sectionData);
    setShowModal(true);
  };

  const handleUpdateComplete = () => {
    setSelectedSection(null);
    setShowModal(false);
    setRefreshTrigger((prev) => !prev);
  };

  const handleClose = () => {
    setSelectedSection(null);
    setShowModal(false);
  };

  return (
    <div className="container-fluid py-4 px-4 bg-light min-vh-100">

      {/* Local Styles */}
      <style>{`
        .modal-overlay {
    position: fixed;
    top: 82px;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    justify-content: center;
    align-items: flex-start;

    padding-top: 40px;

    background: rgba(15, 23, 42, 0.35);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

    overflow-y: auto;   /* Allows scrolling */
    z-index: 9999;
}

     .section-modal {
    width: 900px;
    max-width: 95%;

    background: #fff;

    border-radius: 18px;
    box-shadow: 0 20px 60px rgba(0,0,0,.25);

    max-height: calc(100vh - 140px);
    
    display: flex;
    flex-direction: column;
    overflow-y: hidden;   /* Scroll inside the modal */
    
        /* Above the overlay */
}
        .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
`}</style>

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Section Management
          </h2>

          <p className="text-muted mb-0">
            Manage all sections from one place.
          </p>

        </div>

        <button
          className="btn btn-primary px-4"
          onClick={handleAddSection}
        >
          + Add Section
        </button>

      </div>

      {/* Table */}

      <div className="card section-card">

        <div className="card-body">

          <SectionTable
            refresh={refreshTrigger}
            onEdit={handleEditSection}
          />

        </div>

      </div>

      {/* Bootstrap Modal */}

      {showModal && (

        <div
          className="modal-overlay"
          tabIndex="-1"
          style={{
            background: "rgba(15,23,42,.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          }}
        >

          <div className="section-modal">

    {/* Header */}

    <div className="modal-header">

        <div className="w-100 text-center">

            <h3 className="fw-bold mb-1">
                {selectedSection ? "Edit Section" : "Add New Section"}
            </h3>

            <p className="text-muted mb-0">
                Create or update section information.
            </p>

        </div>

        <button
            type="button"
            className="btn-close position-absolute end-0 me-3"
            onClick={handleClose}
        ></button>

    </div>

    {/* Body */}

    <div className="modal-body">

        <SectionForm
            selectedSectionData={selectedSection}
            onUpdateComplete={handleUpdateComplete}
            onCancel={handleClose}
        />

    </div>

</div>
           
          </div>
            
        

      )}

    </div>
  );
}

export default Section;