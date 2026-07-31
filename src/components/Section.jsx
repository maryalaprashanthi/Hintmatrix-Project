import React, { useState } from "react";
import { createPortal } from "react-dom";
import "./Section.css";

import SectionForm from "./SectionForm";
import SectionTable from "./SectionTable";
import SectionService from "../services/SectionService";

function Section() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // Upload (Frontend Only)
  // Upload Excel
const handleFileUpload = async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  try {
    const response = await SectionService.uploadExcel(file);

    alert(
      typeof response.data === "string"
        ? response.data
        : "Section Excel uploaded successfully!"
    );

    setRefreshTrigger((prev) => !prev);

  } catch (error) {
    console.error("Upload Error:", error);

    if (error.response) {
      alert(error.response.data);
    } else {
      alert("File upload failed.");
    }
  }
    // Reset input
    event.target.value = "";
  };

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

        {/* Hidden Upload Input */}
        <input
          type="file"
          id="sectionUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">

          <button
            className="btn btn-primary"
            onClick={() =>
              document.getElementById("sectionUpload").click()
            }
          >
            ⬆ Upload
          </button>

          <button
            className="btn btn-primary"
            onClick={handleAddSection}
          >
            + Add Section
          </button>

        </div>

      </div>

      {/* Table */}

      <div className="card shadow-sm border-0">

        <div className="card-body">

          <SectionTable
            refresh={refreshTrigger}
            onEdit={handleEditSection}
          />

        </div>

      </div>

      {/* Modal */}

      {showModal &&
        createPortal(
          <div className="modal-overlay">

            <div className="section-modal">

              {/* Header */}

              <div className="modal-header">

                <div className="modal-title">

                  <h2>
                    {selectedSection
                      ? "Edit Section"
                      : "Add New Section"}
                  </h2>

                  <p>
                    Create or update section information.
                  </p>

                </div>

                <button
                  type="button"
                  className="close-btn"
                  onClick={handleClose}
                >
                  ✕
                </button>

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

          </div>,
          document.body
        )}

    </div>
  );
}

export default Section;