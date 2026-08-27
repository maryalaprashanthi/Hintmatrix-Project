import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaTable, FaTag, FaColumns, FaSave } from "react-icons/fa";

import "./AddTableAttributeModal.css";
import TableHeaderService from "../../services/TableHeaderService";

function AddTableAttributeModal({ show, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    amount1: "",
    amount2: "",
    tableHeaderName: "",
  });
  const [tableHeaders, setTableHeaders] = useState([]);

  const loadTableHeaders = async () => {
    try {
      const result = await TableHeaderService.getAll();
      const data = await result.data;
      const allTableNames = data.map((obj) => ({ name: obj.name }));
      setTableHeaders(allTableNames);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    loadTableHeaders();
    setFormData(
      initialData || {
        name: "",
        Amount1: "",
        Amount2: "",
        tableHeaderName: "",
      },
    );
  }, [initialData]);

  if (!show) return null;

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.tableHeaderName.trim()) {
      return;
    }

    await onSave(formData);
    setFormData({
      name: "",
      amount1: "",
      amount2: "",
      tableHeaderName: "",
    });
  };

  const handleClose = () => {
    setFormData({
      name: "",
      amount1: "",
      amount2: "",
      tableHeaderName: "",
    });
    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="table-attribute-modal">
        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>
              {initialData == null
                ? "Add Table Attribute"
                : "Edit Table Attribute"}
            </h2>

            <p>
              {initialData == null
                ? "Create a new table attribute."
                : "Edit an existing Table Attribute"}
            </p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}

        <div className="modal-body">
          <div className="form-card">
            <h3 className="section-title">Table Attribute Information</h3>

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
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value.replace(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      );

                      setFormData({
                        ...formData,
                        name: value,
                      });
                    }}
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
                    value={formData.tableHeaderName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tableHeaderName: e.target.value,
                      })
                    }
                  >
                    <option value="">Select an option</option>
                    {tableHeaders.map((el, key) => (
                      <option value={el.name} key={key}>
                        {el.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-grid">
          {/* Amount 1 */}
          <div className="form-group">
            <label>Amount 1</label>

            <div className="input-box">
              <FaTag className="input-icon" />

              <input
                type="number"
                placeholder="Enter Amount 1"
                value={formData.amount1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount1: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Amount 2 */}
          <div className="form-group">
            <label>Amount 2</label>

            <div className="input-box">
              <FaTag className="input-icon" />

              <input
                type="number"
                placeholder="Enter Amount 2"
                value={formData.amount2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount2: e.target.value,
                  })
                }
              />
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

            {initialData == null ? "Save" : "Update"}
          </button>
        </div>
      </div>
    </div>,

    document.body,
  );
}

export default AddTableAttributeModal;
