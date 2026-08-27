import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FaSave, FaTimes } from "react-icons/fa";
import "./Section.css";

import SectionForm from "./SectionForm";
import SectionTable from "./SectionTable";
import SectionService from "../services/SectionService";
import SuccessModal from "../components/Common/SuccessModal";
import DeleteModal from "../components/Common/DeleteModal";

function Section() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const response = await SectionService.uploadExcel(file);

      alert(
        typeof response.data === "string"
          ? response.data
          : "Section Excel uploaded successfully!",
      );

      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Upload Error:", error);

      alert("File upload failed.");
    }

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

  const handleClose = () => {
    setSelectedSection(null);
    setShowModal(false);
  };

  const handleSaveSection = async (requestDTO, sectionId) => {
    try {
      if (sectionId) {
        await SectionService.updateSection(sectionId, requestDTO);

        setSuccessMessage("Section updated successfully!");
      } else {
        await SectionService.saveSection(requestDTO);

        setSuccessMessage("Section saved successfully!");
      }

      setShowSuccess(true);
      setSelectedSection(null);
      setShowModal(false);
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Section Save Error:", error);

      alert(error.response?.data?.message || "Failed to save section");
    }
  };
  const handleDeleteSection = async (sectionId) => {
    if (!sectionId) {
      alert("Cannot delete: Section ID is missing.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this section?",
    );

    if (!confirmDelete) return;

    try {
      await SectionService.deleteSection(sectionId);

      // Refresh table from DB
      setRefreshTrigger((prev) => !prev);

      // Show success popup
      setShowDelete(true);
    } catch (error) {
      console.error("Section Delete Error:", error);

      alert(error.response?.data?.message || "Failed to delete section");
    }
  };

  return (
    <div className="container-fluid py-4 px-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Section Management</h2>

          <p className="text-muted mb-0">Manage all sections from one place.</p>
        </div>

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
            onClick={() => document.getElementById("sectionUpload").click()}
          >
            ⬆ Upload
          </button>

          <button className="btn btn-primary" onClick={handleAddSection}>
            + Add Section
          </button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <SectionTable
            refresh={refreshTrigger}
            onEdit={handleEditSection}
            onDelete={handleDeleteSection}
          />
        </div>
      </div>

      {showModal &&
        createPortal(
          <div className="modal-overlay">
            <div className="section-modal">
              <div className="modal-header">
                <div className="modal-title">
                  <h2>
                    {selectedSection ? "Edit Section" : "Add New Section"}
                  </h2>

                  <p>Create or update section information.</p>
                </div>

                <button
                  type="button"
                  className="close-btn"
                  onClick={handleClose}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <SectionForm
                  selectedSectionData={selectedSection}
                  onSave={handleSaveSection}
                  onCancel={handleClose}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="section-form"
                  className="btn btn-primary"
                >
                  <FaSave className="me-2" />
                  {selectedSection ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>,

          document.body,
        )}

      <SuccessModal
        show={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
      <DeleteModal
        show={showDelete}
        message="Section deleted successfully!"
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}

export default Section;
