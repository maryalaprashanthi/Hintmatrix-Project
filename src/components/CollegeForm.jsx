import React, { useState, useEffect } from "react";
import CollegeService from "../services/CollegeService";

function CollegeForm({ selectedCollegeData, onUpdateComplete }) {
  const getEmptyCollege = () => ({
    collegeId: "",
    instituteName: "",
    address: "",
    phoneNumber: "",
    email: ""
  });

  const [college, setCollege] = useState(getEmptyCollege());

  useEffect(() => {
    if (selectedCollegeData) {
      setCollege({
        collegeId: selectedCollegeData.collegeId || "",
        instituteName: selectedCollegeData.instituteName || "",
        address: selectedCollegeData.address || "",
        phoneNumber: selectedCollegeData.phoneNumber || "",
        email: selectedCollegeData.email || ""
      });
    } else {
      setCollege(getEmptyCollege());
    }
  }, [selectedCollegeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setCollege({ ...college, [name]: numericValue });
      return;
    }
    setCollege({ ...college, [name]: value });
  };

  const handleActionSubmit = (e, actionType) => {
    if (e) e.preventDefault();
    
    if (college.phoneNumber && college.phoneNumber.length !== 10) {
      alert("Validation Error: Phone Number must be exactly 10 numeric digits long!");
      return;
    }

    // Explicitly shape data matching CollegeRequestDTO structure
    const collegeRequestDTO = {
      instituteName: college.instituteName,
      address: college.address,
      phoneNumber: college.phoneNumber,
      email: college.email
    };

    // Aligns signatures matching CollegeService parameter configurations
    const serviceCall = college.collegeId 
      ? CollegeService.updateCollege(college.collegeId, collegeRequestDTO) 
      : CollegeService.saveCollege(collegeRequestDTO);

    serviceCall
      .then((response) => {
        alert(`College Record Successfully Processed!`);
        
        if (actionType === "save") {
          clearForm();
        } else if (actionType === "add_another") {
          setCollege(getEmptyCollege()); // Reset to empty form layout immediately
          if (onUpdateComplete) onUpdateComplete(); // Tells parent to update list grid background
        } else if (actionType === "continue_editing") {
          if (onUpdateComplete) onUpdateComplete(); // Soft updates grid without closing current popup drawer
        }
      })
      .catch((error) => {
        console.error("Operational failure:", error);
        if (error.response && error.response.status === 400) {
          alert("Server Validation Error: " + JSON.stringify(error.response.data));
        }
      });
  };

  const clearForm = () => {
    setCollege(getEmptyCollege());
    if (onUpdateComplete) {
      onUpdateComplete();
    }
  };

  return (
    <div className="w-100 text-start" style={{ color: "#212529" }}>
      <style>{`
        .form-label-custom {
          width: 140px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0;
          font-size: 14px;
        }
        .form-control-custom {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 10px 12px;
          background-color: #ffffff;
          color: #0f172a;
        }
        .form-control-custom:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          outline: 0;
        }
        .btn-custom-action {
          border-radius: 6px;
          padding: 10px 16px;
          font-weight: 600;
          font-size: 13px;
          border: none;
        }
      `}</style>

      <h2 className="fw-bold text-dark fs-4 mb-4 text-center">
        {college.collegeId ? "✍️ Edit College Details" : "🏢 Add New College"}
      </h2>

      <form onSubmit={(e) => handleActionSubmit(e, "save")}>
        
        <div className="d-flex align-items-center mb-3">
          <label className="form-label-custom">Institute Name</label>
          <input 
            type="text" 
            name="instituteName" 
            placeholder="Enter Institute Name" 
            value={college.instituteName} 
            onChange={handleChange} 
            required 
            className="form-control form-control-custom flex-grow-1" 
          />
        </div>

        <div className="d-flex align-items-start mb-3">
          <label className="form-label-custom pt-2">Address</label>
          <textarea 
            name="address" 
            placeholder="Enter Address" 
            value={college.address} 
            onChange={handleChange} 
            required 
            className="form-control form-control-custom flex-grow-1" 
            rows="3" 
          />
        </div>

        <div className="d-flex align-items-center mb-3">
          <label className="form-label-custom">Phone Number</label>
          <input 
            type="tel" 
            name="phoneNumber" 
            placeholder="Enter Phone Number" 
            value={college.phoneNumber} 
            onChange={handleChange} 
            required 
            maxLength="10" 
            className="form-control form-control-custom flex-grow-1" 
          />
        </div>

        <div className="d-flex align-items-center mb-4">
          <label className="form-label-custom">Email</label>
          <input 
            type="email" 
            name="email" 
            placeholder="Enter Email" 
            value={college.email} 
            onChange={handleChange} 
            required 
            className="form-control form-control-custom flex-grow-1" 
          />
        </div>

        <div className="d-flex gap-2 justify-content-end pt-2 border-top">
          <button 
            type="button" 
            className="btn btn-custom-action text-white" 
            style={{ backgroundColor: "#4A5568" }} 
            onClick={() => handleActionSubmit(null, "add_another")}
          >
            Save and Add Another
          </button>
          
          <button 
            type="button" 
            className="btn btn-custom-action text-white" 
            style={{ backgroundColor: "#4C51BF" }} 
            onClick={() => handleActionSubmit(null, "continue_editing")}
          >
            Save and Continue Editing
          </button>
          
          <button 
            type="submit" 
            className="btn btn-custom-action text-white" 
            style={{ backgroundColor: "#2563eb" }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default CollegeForm;
