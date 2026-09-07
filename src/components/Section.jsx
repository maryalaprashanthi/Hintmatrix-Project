import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FaSave, FaTimes } from "react-icons/fa";
import "./Section.css";

import SectionForm from "./SectionForm";
import SectionTable from "./SectionTable";
import SectionService from "../services/SectionService";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../hooks/useDeleteConfirm";
import { useToast } from "../components/Toast/useToast";
import { getApiErrorMessage } from "../utils/apiError";

function Section() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const response = await SectionService.uploadExcel(file);

      toast.success(
        typeof response.data === "string"
          ? response.data
          : "Section Excel uploaded.",
      );

      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "File upload failed."));
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
        toast.success("Section updated.");
      } else {
        await SectionService.saveSection(requestDTO);
        toast.success("Section saved.");
      }

      setSelectedSection(null);
      setShowModal(false);
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Section Save Error:", error);
      toast.error(getApiErrorMessage(error, "Failed to save section."));
    }
  };
  const del = useDeleteConfirm({
    entity: "section",
    deleteFn: (section) =>
      SectionService.deleteSection(section.sectionId ?? section.id ?? section),
    onDeleted: () => setRefreshTrigger((prev) => !prev),
  });

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
            onDelete={del.request}
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

      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.sectionName || del.pending?.name || "this section"}"?`}
        body="Students assigned to this section will need to be reassigned. This can't be undone."
        confirmLabel="Delete section"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default Section;
