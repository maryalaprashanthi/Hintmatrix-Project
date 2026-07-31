import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SuccessModal from "../../components/Common/SuccessModal";

import {
  FaTimes,
  FaUniversity,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaSave,
} from "react-icons/fa";

import "./CollegeForm.css";

function CollegeForm({ show, onClose, onSave, selectedCollegeData }) {

  const [showSuccess, setShowSuccess] = useState(false);

  const [college, setCollege] = useState({
    instituteName: "",
    address: "",
    phoneNumber: "",
    email: "",
  });


  useEffect(() => {

    if (selectedCollegeData) {

      setCollege({
        ...selectedCollegeData,
        instituteName: selectedCollegeData.instituteName || "",
        address: selectedCollegeData.address || "",
        phoneNumber: selectedCollegeData.phoneNumber || "",
        email: selectedCollegeData.email || "",
      });

    } else {

      setCollege({
        instituteName: "",
        address: "",
        phoneNumber: "",
        email: "",
      });

    }

  }, [selectedCollegeData, show]);



  const handleChange = (e) => {

    setCollege({
      ...college,
      [e.target.name]: e.target.value,
    });

  };



  const handleSave = () => {

    if (
      !college.instituteName.trim() ||
      !college.address.trim() ||
      !college.phoneNumber.trim() ||
      !college.email.trim()
    ) {
      alert("Please fill all the fields.");
      return;
    }


    if (!/^\d{10}$/.test(college.phoneNumber)) {

      alert("Phone number must contain exactly 10 digits.");
      return;

    }


    if (!/\S+@\S+\.\S+/.test(college.email)) {

      alert("Please enter a valid email address.");
      return;

    }


    // Save data
    onSave(college);


    // Show success popup
    setShowSuccess(true);


    // Clear form
    setCollege({
      instituteName: "",
      address: "",
      phoneNumber: "",
      email: "",
    });


    // Close college modal
    onClose();

  };



  return createPortal(

    <>

      {show && (

        <div className="modal-overlay">

          <div className="branch-modal">


            <div className="modal-header">

              <div>

                <h2>
                  {selectedCollegeData ? "Update College" : "Add College"}
                </h2>

                <p>Register a new college.</p>

              </div>


              <button 
                className="close-btn"
                onClick={onClose}
              >

                <FaTimes />

              </button>

            </div>



            <div className="modal-body">


              <div className="form-card">

                <h3 className="section-title">
                  College Information
                </h3>


                <div className="form-grid">


                  <div className="form-group">

                    <label>
                      Institute Name <span>*</span>
                    </label>


                    <div className="input-box">

                      <FaUniversity className="input-icon"/>


                      <input
                        type="text"
                        name="instituteName"
                        placeholder="Enter Institute Name"
                        value={college.instituteName}
                        onChange={handleChange}
                      />

                    </div>

                  </div>




                  <div className="form-group">

                    <label>
                      Phone Number <span>*</span>
                    </label>


                    <div className="input-box">

                      <FaPhone className="input-icon"/>


                      <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="Enter Phone Number"
                        value={college.phoneNumber}
                        onChange={handleChange}
                      />

                    </div>

                  </div>





                  <div className="form-group">

                    <label>
                      Email <span>*</span>
                    </label>


                    <div className="input-box">

                      <FaEnvelope className="input-icon"/>


                      <input
                        type="email"
                        name="email"
                        placeholder="Institute@gmail.com"
                        value={college.email}
                        onChange={handleChange}
                      />

                    </div>

                  </div>


                </div>


              </div>




              <div className="form-card">


                <h3 className="section-title">
                  Address
                </h3>


                <div className="textarea-box">


                  <FaMapMarkerAlt className="input-icon"/>


                  <textarea

                    name="address"

                    placeholder="Enter Institute Address"

                    value={college.address}

                    onChange={handleChange}

                  />


                </div>


              </div>


            </div>





            <div className="modal-footer">


              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >

                Cancel

              </button>




              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
              >

                <FaSave className="me-2"/>

                {selectedCollegeData ? "Update College" : "Save"}

              </button>


            </div>



          </div>


        </div>

      )}



      <SuccessModal

        show={showSuccess}

        message="College saved successfully!"

        onClose={() => setShowSuccess(false)}

      />


    </>,

    document.body

  );

}


export default CollegeForm;