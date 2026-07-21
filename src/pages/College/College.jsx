import { useState } from "react";
import CollegeForm from "./CollegeForm";
import CollegeTable from "./CollegeTable";


function College() {
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);

  // Open Add College
  const handleAddCollege = () => {
    setSelectedCollege(null);
    setShowModal(true);
  };

  // Open Edit College
  const handleEditCollege = (collegeData) => {
    setSelectedCollege(collegeData);
    setShowModal(true);
  };

  // Save / Update College
  const handleSave = (collegeData) => {
    console.log("College Saved:", collegeData);

    // Your API save/update will be handled inside CollegeForm
    setRefreshTrigger((prev) => !prev);

    setSelectedCollege(null);
    setShowModal(false);
  };

  return (
    <div className="container-fluid py-4">

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold">
            College Management
          </h2>

          <p className="text-muted">
            Manage all registered colleges.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAddCollege}
        >
          + Add College
        </button>

      </div>

      {/* Table */}

      <div className="card shadow-sm border-0">

        <div className="card-body">

          <CollegeTable
            refresh={refreshTrigger}
            onEdit={handleEditCollege}
          />

        </div>

      </div>

      {/* Modal */}

      <CollegeForm
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCollege(null);
        }}
        onSave={handleSave}
        selectedCollegeData={selectedCollege}
      />

    </div>
  );
}

export default College;