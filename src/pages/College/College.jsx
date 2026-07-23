import { useState } from "react";
import CollegeForm from "./CollegeForm";
import CollegeTable from "./CollegeTable";
import Alert from "react-bootstrap/Alert";


function College() {
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

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

  setRefreshTrigger((prev) => !prev);

  setSelectedCollege(null);
  setShowModal(false);

  setShowAlert(true);

  setTimeout(() => {
    setShowAlert(false);
  }, 4000);
  };
  const handleFileUpload = (e) => {
   const file = e.target.files[0];

  if (!file) return;

  console.log("Selected File:", file);

  // Later call your API here
};

  return (
    <div className="container-fluid py-4">
      {showAlert && (
  <Alert
    variant="success"
    className="position-fixed start-50 translate-middle-x shadow"
    style={{
      top: "90px",          // Move below navbar
      width: "300px",       // Small width
      zIndex: 9999,
      padding: "10px 15px",
      fontSize: "15px",
      textAlign:"center",
      borderRadius: "8px"
    }}
  >
    College saved successfully!
  </Alert>
)}

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
        
        <div className="d-flex gap-2">

        <input
         type="file"
         id="collegeUpload"
         accept=".csv,.xlsx,.xls"
         style={{ display: "none" }}
         onChange={handleFileUpload}
        />

          <button
          className="btn btn-outline-primary "
           onClick={() => document.getElementById("collegeUpload").click()}
          >
          Upload 
          </button>
          <button
          className="btn btn-primary"
          onClick={handleAddCollege}
          >
          + Add College
        </button>
      </div>
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