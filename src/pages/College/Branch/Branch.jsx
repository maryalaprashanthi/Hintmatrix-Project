import { useState } from "react";
import AddBranchModal from "./AddBranchModal";
import "./Branch.css";

function Branch() {
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);

  const handleSave = (newBranch) => {
    setBranches([...branches, newBranch]);
  };

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Branch Management</h2>
          <p className="text-muted">
            Manage all college branches.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Branch
        </button>
      </div>

      {/* Branch Table */}
      <div className="card shadow-sm border-0">

        <div className="card-body">

          <table className="table table-bordered table-hover align-middle">

            <thead className="table-light">

              <tr>
                <th>College Name</th>
                <th>Branch Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>

            </thead>

            <tbody>

              {branches.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Branches Added
                  </td>
                </tr>
              ) : (
                branches.map((branch, index) => (
                  <tr key={index}>
                    <td>{branch.collegeName}</td>
                    <td>{branch.branchName}</td>
                    <td>{branch.address}</td>
                    <td>{branch.phone}</td>
                    <td>{branch.email}</td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      <AddBranchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />

    </div>
  );
}

export default Branch;