import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import {
  FaTimes,
  FaBook,
  FaTag,
  FaFont,
  FaProjectDiagram,
  FaSortNumericDown,
  FaCalculator,
  FaTable,
  FaHeading,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaSave,
  FaPlus,
} from "react-icons/fa";

import "./RuleEngineForm.css";

function RuleEngineForm({ show, onClose, onSave, selectedRuleData }) {
  const [formData, setFormData] = useState({
    chapterName: "",
    pairAttributeName: "",
    fieldName: "",
    fieldType: "",
    relationshipName: "",
    pairOrder: "",

    rules: [
      {
        arithmetic: "",
        tableName: "",
        headerName: "",
        amountPosition: "",
        information: "",
      },
    ],

    activeRow: false,
    rowStatus: "",
  });

  useEffect(() => {
    if (selectedRuleData) {
      setFormData({
        ...selectedRuleData,
        rules:
          selectedRuleData.rules && selectedRuleData.rules.length > 0
            ? selectedRuleData.rules
            : [
                {
                  arithmetic: "",
                  tableName: "",
                  headerName: "",
                  amountPosition: "",
                  information: "",
                },
              ],
      });
    } else {
      setFormData({
        chapterName: "",
        pairAttributeName: "",
        fieldName: "",
        fieldType: "",
        relationshipName: "",
        pairOrder: "",

        rules: [
          {
            arithmetic: "",
            tableName: "",
            headerName: "",
            amountPosition: "",
            information: "",
          },
        ],

        activeRow: false,
        rowStatus: "",
      });
    }
  }, [selectedRuleData, show]);

  const addRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          arithmetic: "",
          tableName: "",
          headerName: "",
          amountPosition: "",
          information: "",
        },
      ],
    }));
  };
  const deleteRule = (index) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleRuleChange = (index, field, value) => {
    const updatedRules = [...formData.rules];
    updatedRules[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      rules: updatedRules,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.chapterName || !formData.fieldName || !formData.fieldType) {
      alert("Please fill the mandatory fields.");
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving rule:", error);
    }
  };

  if (!show) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="rule-modal">
        {/* Header */}

        <div className="modal-header">
          <div>
            <h2>{selectedRuleData ? "Edit Rule Engine" : "Add Rule Engine"}</h2>

            <p>Configure Rule Engine Details.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}

        <div className="modal-body">
          {/* Rule Engine Information */}

          <div className="form-card">
            <h3 className="section-title">Rule Engine Information</h3>

            <div className="form-grid">
              {/* Chapter Name */}

              <div className="form-group">
                <label>Chapter Name</label>

                <div className="input-box">
                  <FaBook className="input-icon" />

                  <input
                    type="text"
                    list="chapterList"
                    name="chapterName"
                    placeholder="Select Chapter"
                    value={formData.chapterName}
                    onChange={handleChange}
                  />

                  <datalist id="chapterList">
                    <option value="Chapter 1" />
                    <option value="Chapter 2" />
                    <option value="Chapter 3" />
                    <option value="Chapter 4" />
                  </datalist>
                </div>
              </div>

              {/* Pair Attribute */}

              <div className="form-group">
                <label>Pair Attribute Name</label>

                <div className="input-box">
                  <FaTag className="input-icon" />

                  <input
                    type="text"
                    list="pairAttributeList"
                    name="pairAttributeName"
                    placeholder="Select Pair Attribute"
                    value={formData.pairAttributeName}
                    onChange={handleChange}
                  />

                  <datalist id="pairAttributeList">
                    <option value="Invoice Number" />
                    <option value="Student ID" />
                    <option value="Amount" />
                    <option value="Course" />
                  </datalist>
                </div>
              </div>

              {/* Field Name */}

              <div className="form-group">
                <label>Field Name</label>

                <div className="input-box">
                  <FaFont className="input-icon" />

                  <input
                    type="text"
                    list="fieldList"
                    name="fieldName"
                    placeholder="Select Field"
                    value={formData.fieldName}
                    onChange={handleChange}
                  />

                  <datalist id="fieldList">
                    <option value="Student Name" />
                    <option value="Roll Number" />
                    <option value="Branch" />
                    <option value="College" />
                    <option value="Course" />
                  </datalist>
                </div>
              </div>

              {/* Field Type */}

              <div className="form-group">
                <label>Field Type</label>

                <div className="input-box">
                  <FaFont className="input-icon" />

                  <input
                    type="text"
                    list="fieldTypeList"
                    name="fieldType"
                    placeholder="Select Field Type"
                    value={formData.fieldType}
                    onChange={handleChange}
                  />

                  <datalist id="fieldTypeList">
                    <option value="String" />
                    <option value="Integer" />
                    <option value="Decimal" />
                    <option value="Boolean" />
                    <option value="Date" />
                  </datalist>
                </div>
              </div>

              {/* Relationship */}

              <div className="form-group">
                <label>Relationship Name</label>

                <div className="input-box">
                  <FaProjectDiagram className="input-icon" />

                  <input
                    type="text"
                    list="relationshipList"
                    name="relationshipName"
                    placeholder="Select Relationship"
                    value={formData.relationshipName}
                    onChange={handleChange}
                  />

                  <datalist id="relationshipList">
                    <option value="Equals" />
                    <option value="Not Equals" />
                    <option value="Greater Than" />
                    <option value="Less Than" />
                    <option value="Contains" />
                  </datalist>
                </div>
              </div>

              {/* Pair Order */}

              <div className="form-group">
                <label>Pair Order</label>

                <div className="input-box">
                  <FaSortNumericDown className="input-icon" />

                  <input
                    type="number"
                    name="pairOrder"
                    placeholder="Enter Pair Order"
                    value={formData.pairOrder}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Rule Parameters */}

          {formData.rules.map((rule, index) => (
            <div className="form-card" key={index}>
              <h3 className="section-title mb-3">Rule {index + 1}</h3>
              <div className="form-grid">
                {/* Arithmetic */}

                <div className="form-group">
                  <label>Arithmetic</label>

                  <div className="input-box">
                    <FaCalculator className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Arithmetic"
                      value={rule.arithmetic}
                      onChange={(e) =>
                        handleRuleChange(index, "arithmetic", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Table Name */}

                <div className="form-group">
                  <label>Table Name</label>

                  <div className="input-box">
                    <FaTable className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Table Name"
                      value={rule.tableName}
                      onChange={(e) =>
                        handleRuleChange(index, "tableName", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Header Name */}

                <div className="form-group">
                  <label>Header Name</label>

                  <div className="input-box">
                    <FaHeading className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Header Name"
                      value={rule.headerName}
                      onChange={(e) =>
                        handleRuleChange(index, "headerName", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Amount Position */}

                <div className="form-group">
                  <label>Amount Position</label>

                  <div className="input-box">
                    <FaMapMarkerAlt className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Amount Position"
                      value={rule.amountPosition}
                      onChange={(e) =>
                        handleRuleChange(
                          index,
                          "amountPosition",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                {/* Information */}

                <div className="form-group">
                  <label>Information</label>

                  <div className="input-box">
                    <FaInfoCircle className="input-icon" />

                    <input
                      type="text"
                      placeholder="Enter Information"
                      value={rule.information}
                      onChange={(e) =>
                        handleRuleChange(index, "information", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addRule}
                >
                  <FaPlus className="me-1" />
                  Add Rule
                </button>

                {formData.rules.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deleteRule(formData.rules.length - 1)}
                  >
                    <FaTimes className="me-1" />
                    Delete Rule
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Status */}

          <div className="form-card">
            <h3 className="section-title">Status</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Active Row</label>

                <div className="checkbox-box">
                  <input
                    type="checkbox"
                    name="activeRow"
                    checked={formData.activeRow}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Row Status</label>

                <div className="input-box">
                  <FaSortNumericDown className="input-icon" />

                  <input
                    type="number"
                    name="rowStatus"
                    placeholder="Enter Row Status"
                    value={formData.rowStatus}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
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
    document.body,
  );
}

export default RuleEngineForm;
