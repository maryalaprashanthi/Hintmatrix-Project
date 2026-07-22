// NOTE:
// This is a starter Section.jsx template showing a custom React modal.
// Replace your existing Section.jsx with this and adapt imports/logic as needed.

import React, { useState } from "react";
import SectionForm from "./SectionForm";
import SectionTable from "./SectionTable";

export default function Section() {
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleEditSignal = (sectionData) => {
    setSelectedSection(sectionData);
    setShowModal(true);
  };

  const handleAddSectionClick = () => {
    setSelectedSection(null);
    setShowModal(true);
  };

  const handleFormSubmissionComplete = () => {
    setSelectedSection(null);
    setRefreshTrigger(v => !v);
    setShowModal(false);
  };

  return (
    <div className="container-fluid p-4" style={{background:"#f8fafc",minHeight:"100vh"}}>
      <style>{`
        .overlay{
          position:fixed; inset:0;
          background:rgba(15,23,42,.35);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:2000;
        }
        .modal-box{
          width:min(900px,95vw);
          background:#fff;
          border-radius:18px;
          box-shadow:0 20px 60px rgba(0,0,0,.25);
          max-height:90vh;
          overflow:auto;
          position:relative;
        }
        .close-btn{
          position:absolute;
          top:15px;
          right:18px;
          width:40px;
          height:40px;
          border:none;
          border-radius:50%;
          background:#f1f5f9;
          color:#334155;
          font-size:24px;
          font-weight:bold;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          z-index:9999;
          transition:all .2s ease;
}

          .close-btn:hover{
            background:#ef4444;
            color:#fff;
            
}
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Section Management Dashboard</h2>
        <button className="btn btn-primary" onClick={handleAddSectionClick}>
          + Add Section
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <SectionTable
            refresh={refreshTrigger}
            onEdit={handleEditSignal}
          />
        </div>
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              aria-label="Close"
              ×
              
            </button>
            <SectionForm
              selectedSectionData={selectedSection}
              onUpdateComplete={handleFormSubmissionComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
