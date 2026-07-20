import React, { useState, useEffect } from "react";
import CollegeService from "../../services/CollegeService";

function CollegeForm({ selectedCollegeData, onUpdateComplete }) {
  const getEmptyCollege = () => ({
    collegeId: "",
    instituteName: "",
    address: "",
    phoneNumber: "",
    email: ""
  });

  const [college, setCollege] = useState(getEmptyCollege());

  // Load data when Edit button is clicked, or clear it if selection is reset
  useEffect(() => {
    if (selectedCollegeData) {
      setCollege(selectedCollegeData);
    } else {
      setCollege(getEmptyCollege());
    }
  }, [selectedCollegeData]);

  const handleChange = (e) => {
    // If typing in phone number field, prevent entering non-numeric characters completely
    if (e.target.name === "phoneNumber") {
      const numericValue = e.target.value.replace(/[^0-9]/g, "");
      setCollege({
        ...college,
        [e.target.name]: numericValue
      });
      return;
    }

    setCollege({
      ...college,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Explicit Front-end Validation Check for 10 digits
    if (college.phoneNumber.length !== 10) {
      alert("Validation Error: Phone Number must be exactly 10 numeric digits long!");
      return; // Stop form submission entirely
    }

    if (college.collegeId) {
      // UPDATE COLLEGE (PUT)
      CollegeService.updateCollege(college)
        .then(() => {
          alert("College Updated Successfully!");
          clearForm();
        })
        .catch((error) => {
          console.error("Error updating college:", error);
        });
    } else {
      // SAVE COLLEGE (POST)
      CollegeService.saveCollege(college)
        .then(() => {
          alert("College Saved Successfully!");
          clearForm();
        })
        .catch((error) => {
          console.error("Error saving college:", error);
        });
    }
  };

  const clearForm = () => {
    setCollege(getEmptyCollege());
    if (onUpdateComplete) {
      onUpdateComplete();
    }
  };

  return (
    <div className="w-100 text-start">
      
      {/* 🌟 GLOBAL CLASSPATH FIX: Forces any open modal wrapper card on this page to be bright white with solid text */}
      <style>{`
        /* Target the parent modal sheets directly to remove transparent filters */
        .modal, .modal-dialog, .modal-content, .modal-body {
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #212529 !important;
        }
        
        /* Force text entry containers to render bright white */
        .modal-body .form-control {
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #111827 !important;
          border: 1px solid #cbd5e1 !important;
          opacity: 1 !important;
        }

        .modal-body .form-control:focus {
          background-color: #ffffff !important;
          color: #111827 !important;
          border-color: #2563eb !important;
          box-shadow: 0 0 0 0.25rem rgba(37, 99, 235, 0.25) !important;
        }

        .modal-body .form-control::placeholder {
          color: #94a3b8 !important;
          opacity: 1 !important;
        }

        .modal-body label, .modal-body h2 {
          color: #1e293b !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Centered Modal Header Typography */}
      <h2 className="fw-bold text-dark fs-4 mb-4 text-center">
        {college.collegeId ? "✍️ Edit College Details" : "🏢 Add New College"}
      </h2>

      <form onSubmit={handleFormSubmit}>
        {/* Institute Name Field */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-dark">Institute Name</label>
          <input
            type="text"
            name="instituteName"
            placeholder="Enter Institute Name"
            value={college.instituteName}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* Address Field */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-dark">Address</label>
          <input
            type="text"
            name="address"
            placeholder="Enter Location Address"
            value={college.address}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* Phone Number Field with strict criteria formatting */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-dark">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number (10 digits)"
            value={college.phoneNumber}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            maxLength="10"
            title="Phone number must be exactly 10 numeric digits long"
            className="form-control"
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="form-label small fw-semibold text-dark">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter Email Address"
            value={college.email}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* Dynamic Modal Action Control Footer Buttons */}
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary px-4 fw-semibold"
            data-bs-dismiss="modal"
            onClick={clearForm}
          >
            Close
          </button>
          
          <button
            type="submit"
            className={`btn px-4 fw-bold text-white ${college.collegeId ? "btn-success" : "btn-primary"}`}
          >
            {college.collegeId ? "Update College" : "Save College"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CollegeForm;