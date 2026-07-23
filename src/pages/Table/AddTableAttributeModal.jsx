import { useState } from "react";
import { createPortal } from "react-dom";

import {
  FaTimes,
  FaTable,
  FaTag,
  FaColumns,
  FaSave,
} from "react-icons/fa";

import "./AddTableAttributeModal.css";


function AddTableAttributeModal({ show, onClose, onSave }) {

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [tableHeaderName, setTableHeaderName] = useState("");


  if (!show) return null;


  const handleSave = () => {

    if (
      !name.trim() ||
      !shortName.trim() ||
      !tableHeaderName.trim()
    ) {
      alert("Please fill all the fields.");
      return;
    }


    const newTableAttribute = {
      name,
      shortName,
      tableHeaderName,
    };


    onSave(newTableAttribute);


    setName("");
    setShortName("");
    setTableHeaderName("");

    onClose();

  };


  return createPortal(

    <div className="modal-overlay">


      <div className="table-attribute-modal">


        {/* Header */}

        <div className="modal-header">

          <div>

            <h2>
              Add Table Attribute
            </h2>

            <p>
              Create a new table attribute.
            </p>

          </div>


          <button
            className="close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>


        </div>




        {/* Body */}

        <div className="modal-body">


          <div className="form-card">


            <h3 className="section-title">
              Table Attribute Information
            </h3>



            <div className="form-grid">



              {/* Name */}

              <div className="form-group">

                <label>
                  Name <span>*</span>
                </label>


                <div className="input-box">

                  <FaTable className="input-icon" />


                  <input
                    type="text"
                    placeholder="Enter Attribute Name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />

                </div>

              </div>




              {/* Short Name */}

              <div className="form-group">

                <label>
                  Short Name <span>*</span>
                </label>


                <div className="input-box">

                  <FaTag className="input-icon" />


                  <input
                    type="text"
                    placeholder="Enter Short Name"
                    value={shortName}
                    onChange={(e) =>
                      setShortName(e.target.value)
                    }
                  />

                </div>

              </div>




              {/* Table Header Name */}

              <div className="form-group">

                <label>
                  Table Header Name <span>*</span>
                </label>


                <div className="input-box">

                  <FaColumns className="input-icon" />

                  <select
                      value={tableHeaderName}
                      onChange={(e) => setTableHeaderName(e.target.value)}
                  >
                     <option value="">Select Table Header Name</option>
                     <option value="1">
                        ------
                      </option>
      
                  </select>

                  </div>

              </div>



            </div>


          </div>


        </div>





        {/* Footer */}

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

            <FaSave className="me-2" />

            Save

          </button>


        </div>


      </div>


    </div>,


    document.body

  );

}


export default AddTableAttributeModal;