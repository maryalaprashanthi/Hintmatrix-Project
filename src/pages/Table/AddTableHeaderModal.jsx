import { useState } from "react";
import { createPortal } from "react-dom";

import {
  FaTimes,
  FaTable,
  FaSave,
} from "react-icons/fa";

import "./AddTableHeaderModal.css";


function AddTableHeaderModal({ show, onClose, onSave }) {

  const [name, setName] = useState("");


  if (!show) return null;


  const handleSave = () => {

    if (!name.trim()) {
      alert("Please enter Table Header Name.");
      return;
    }


    const newTableHeader = {
      name,
    };


    onSave(newTableHeader);


    setName("");

    onClose();

  };



  return createPortal(

    <div className="modal-overlay">


      <div className="table-header-modal">


        {/* Header */}

        <div className="modal-header">

          <div>

            <h2>
              Add Table Header
            </h2>

            <p>
              Create a new table header.
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
              Table Header Information
            </h3>



            <div className="form-grid">


              <div className="form-group">


                <label>
                  Header Name <span>*</span>
                </label>



                <div className="input-box">


                  <FaTable className="input-icon" />



                  <input
                    type="text"
                    placeholder="Enter Table Header Name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />


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


export default AddTableHeaderModal;