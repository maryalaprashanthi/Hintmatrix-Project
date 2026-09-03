import { useEffect, useState } from "react";
import CollegeAdminForm from "./CollegeAdminForm";
import CollegeAdminTable from "./CollegeAdminTable";
import "./BranchAdmin.css";
import UserService from "../../services/UserService";

function CollegeAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [collegeAdmins, setCollegeAdmins] = useState([]);
  const [selectedCollegeAdmin, setSelectedCollegeAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  // HELPER: normalize backend payloads for admin rows

  const normalizeCollegeAdmin = (admin = {}) => {
    const college = admin.college || {};

    return {
      ...admin,
      collegeName:
        admin.collegeName ??
        college.instituteName ??
        college.collegeName ??
        college.name ??
        "Unknown College",
    };
  };

  // FETCH ALL COLLEGE ADMINS

  const fetchCollegeAdmins = async () => {
    try {
      setLoading(true);

      const response = await UserService.getAllCollegeAdmins();

      setCollegeAdmins((response.data || []).map(normalizeCollegeAdmin));
    } catch (error) {
      console.error("Error fetching College Admins:", error);

      alert(
        error?.response?.data?.message || "Failed to fetch College Admins.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollegeAdmins();
  }, []);

  // ADD COLLEGE ADMIN

  const handleAddCollegeAdmin = () => {
    setSelectedCollegeAdmin(null);
    setShowModal(true);
  };

  // EDIT COLLEGE ADMIN

  const handleEditCollegeAdmin = (collegeAdminData) => {
    setSelectedCollegeAdmin(collegeAdminData);
    setShowModal(true);
  };

  // SAVE / UPDATE COLLEGE ADMIN

  const handleSave = async (collegeAdminData) => {
    try {
      if (selectedCollegeAdmin) {
        await UserService.updateCollegeAdmin(
          selectedCollegeAdmin.userId,
          collegeAdminData,
        );
      } else {
        await UserService.createCollegeAdmin(collegeAdminData);
      }

      await fetchCollegeAdmins();

      setSelectedCollegeAdmin(null);

      // Important:
      // Do not close the form here.
      // CollegeAdminForm will show the success modal first.
    } catch (error) {
      console.error("College Admin Save Error:", error);

      throw error;
    }
  };

 
  // CLOSE MODAL
  

  const handleClose = () => {
    setShowModal(false);
    setSelectedCollegeAdmin(null);
  };

  
  // UI
  

  return (
    <div className="container-fluid py-4">
      {/* PAGE HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">College Admin Management</h2>

          <p className="text-muted">Manage all College Administrators.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddCollegeAdmin}
        >
          + Add College Admin
        </button>
      </div>

      {/*  TABLE */}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">Loading College Admins...</div>
          ) : (
            <CollegeAdminTable
              data={collegeAdmins}
              onEdit={handleEditCollegeAdmin}
              refreshData={fetchCollegeAdmins}
            />
          )}
        </div>
      </div>

      {/* COLLEGE ADMIN FORM */}

      <CollegeAdminForm
        show={showModal}
        onClose={handleClose}
        onSave={handleSave}
        selectedCollegeAdminData={selectedCollegeAdmin}
      />
    </div>
  );
}

export default CollegeAdmin;
