import { useState } from "react";
import SuperAdminForm from "./SuperAdminForm";
import "./SuperAdmin.css";
import SuperAdminTable from "./SuperAdminTable";

function SuperAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [selectedSuperAdmin, setSelectedSuperAdmin] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // Open Add Super Admin Form
  const handleAddSuperAdmin = () => {
    setSelectedSuperAdmin(null);
    setShowModal(true);
  };

  // Open Edit Super Admin Form
  const handleEditSuperAdmin = (superAdminData) => {
    setSelectedSuperAdmin(superAdminData);
    setShowModal(true);
  };

  // Save / Update Super Admin
  const handleSave = (superAdminData) => {
    console.log("Submitting Super Admin payload:", superAdminData);

    setSuperAdmins((prev) => [...prev, superAdminData]);

    alert(
      selectedSuperAdmin
        ? "Super Admin updated successfully!"
        : "Super Admin added successfully!",
    );

    setRefreshTrigger((prev) => !prev);
    setShowModal(false);
    setSelectedSuperAdmin(null);
  };

  // Upload File
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log("Selected File:", file);

    alert(`Selected File: ${file.name}`);

    e.target.value = "";
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Super Admin Management</h2>

          <p className="text-muted">Manage all Super Administrators.</p>
        </div>

        {/* Hidden Upload */}
        <input
          type="file"
          id="superAdminUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById("superAdminUpload").click()}
          >
            ⬆ Upload
          </button>

          <button className="btn btn-primary" onClick={handleAddSuperAdmin}>
            + Add Super Admin
          </button>
        </div>
      </div>

      {/* AG Grid */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <SuperAdminTable
            data={superAdmins}
            refresh={refreshTrigger}
            onEdit={handleEditSuperAdmin}
          />
        </div>
      </div>

      {/* Form */}
      <SuperAdminForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSuperAdmin(null);
        }}
        onSave={handleSave}
        selectedSuperAdminData={selectedSuperAdmin}
      />
    </div>
  );
}

export default SuperAdmin;
