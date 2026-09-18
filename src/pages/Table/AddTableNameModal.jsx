import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { FaTimes, FaTable, FaSave } from "react-icons/fa";

import "./AddTableNameModal.css";

function AddTableNameModal({ show, onClose, onSave, Inputname, Inputstatus }) {
  const [name, setName] = useState("");
  const [activeRow, setActiveRow] = useState(true);

  useEffect(() => {
    setName(Inputname || "");
    setActiveRow(Inputstatus !== false);
  }, [Inputname, Inputstatus]);

  if (!show) return null;


  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter Table Name.");
      return;
    }

    const newTableName = {
      name,
      activeRow,
    };

    await onSave(newTableName);
    setName("");
  };

  const handleClose = () => {
    setName("");
    setActiveRow(true);
    onClose();
  };


  return createPortal(

    <div className="modal-overlay">
      <div className="table-name-modal">
        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>{Inputname == "" ? "Add Table name" : "Update table name"}</h2>
            <p>
              {Inputname == ""
                ? "Create a new table name."
                : "Update existing table"}
            </p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>




        {/* Body */}

        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Table Name Information</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  Table Name <span>*</span>
                </label>



                <div className="input-box">
                  <FaTable className="input-icon" />
               <input
               type="text"
               placeholder="Enter Table Name"
               value={name}
               onChange={(e) => setName(e.target.value)}
              />
                </div>
              </div>

              <div className="form-group table-name-status-field">
                <label>Status</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={activeRow}
                    onChange={(e) => setActiveRow(e.target.checked)}
                  />
                  <label className="form-check-label">
                    {activeRow ? "Active" : "Inactive"}
                  </label>
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
            onClick={handleClose}
          >
            Cancel
          </button>




          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >

            <FaSave className="me-2" />
            {Inputname == "" ? "Save" : "Update"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );

}


export default AddTableNameModal;
