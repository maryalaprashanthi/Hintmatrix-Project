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

    arithmetic1: "",
    table1Name: "",
    header1Name: "",
    amountPosition1: "",
    information1: "",

    arithmetic2: "",
    table2Name: "",
    header2Name: "",
    amountPosition2: "",
    information2: "",

    arithmetic3: "",
    table3Name: "",
    header3Name: "",
    amountPosition3: "",
    information3: "",

    arithmetic4: "",
    table4Name: "",
    header4Name: "",
    amountPosition4: "",
    information4: "",

    activeRow: false,
    rowStatus: "",
  });

  useEffect(() => {
    if (selectedRuleData) {
      setFormData(selectedRuleData);
    } else {
      setFormData({
        chapterName: "",
        pairAttributeName: "",
        fieldName: "",
        fieldType: "",
        relationshipName: "",
        pairOrder: "",

        arithmetic1: "",
        table1Name: "",
        header1Name: "",
        amountPosition1: "",
        information1: "",

        arithmetic2: "",
        table2Name: "",
        header2Name: "",
        amountPosition2: "",
        information2: "",

        arithmetic3: "",
        table3Name: "",
        header3Name: "",
        amountPosition3: "",
        information3: "",

        arithmetic4: "",
        table4Name: "",
        header4Name: "",
        amountPosition4: "",
        information4: "",

        activeRow: false,
        rowStatus: "",
      });
    }
  }, [selectedRuleData, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    if (!formData.chapterName || !formData.fieldName || !formData.fieldType) {
      alert("Please fill the mandatory fields.");
      return;
    }

    onSave(formData);
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
              <div className="form-group">
                <label>Chapter Name</label>

                <div className="input-box">
                  <FaBook className="input-icon" />

                  <input
                    type="text"
                    name="chapterName"
                    placeholder="Enter Chapter Name"
                    value={formData.chapterName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Pair Attribute Name</label>

                <div className="input-box">
                  <FaTag className="input-icon" />

                  <input
                    type="text"
                    name="pairAttributeName"
                    placeholder="Enter Pair Attribute Name"
                    value={formData.pairAttributeName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Field Name</label>

                <div className="input-box">
                  <FaFont className="input-icon" />

                  <input
                    type="text"
                    name="fieldName"
                    placeholder="Enter Field Name"
                    value={formData.fieldName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Field Type</label>

                <div className="input-box">
                  <FaFont className="input-icon" />

                  <input
                    type="text"
                    name="fieldType"
                    placeholder="Enter Field Type"
                    value={formData.fieldType}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Relationship Name</label>

                <div className="input-box">
                  <FaProjectDiagram className="input-icon" />

                  <input
                    type="text"
                    name="relationshipName"
                    placeholder="Enter Relationship Name"
                    value={formData.relationshipName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Pair Order</label>

                <div className="input-box">
                  <FaSortNumericDown className="input-icon" />

                  <input
                    type="number"
                    name="pairOrder"
                    placeholder="Enter PairOrder Number"
                    value={formData.pairOrder}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rule 1 */}

          <div className="form-card">
            <h3 className="section-title">Rule 1</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Arithmetic 1</label>

                <div className="input-box">
                  <FaCalculator className="input-icon" />

                  <input
                    type="text"
                    name="arithmetic1"
                    placeholder="Enter arithmetic1"
                    value={formData.arithmetic1}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Table Name</label>

                <div className="input-box">
                  <FaTable className="input-icon" />

                  <input
                    type="text"
                    name="table1Name"
                    placeholder="Enter tableName1 "
                    value={formData.table1Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Header Name</label>

                <div className="input-box">
                  <FaHeading className="input-icon" />

                  <input
                    type="text"
                    name="header1Name"
                    placeholder="Enter header1Name "
                    value={formData.header1Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Amount Position</label>

                <div className="input-box">
                  <FaMapMarkerAlt className="input-icon" />

                  <input
                    type="text"
                    name="amountPosition1"
                    placeholder="Enter amountPostion1 "
                    value={formData.amountPosition1}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Information</label>

                <div className="input-box">
                  <FaInfoCircle className="input-icon" />

                  <input
                    type="text"
                    name="information1"
                    placeholder="Enter information1 "
                    value={formData.information1}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Rule 2 */}

          <div className="form-card">
            <h3 className="section-title">Rule 2</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Arithmetic 2</label>

                <div className="input-box">
                  <FaCalculator className="input-icon" />

                  <input
                    type="text"
                    name="arithmetic2"
                    placeholder="Enter arithmetic2 "
                    value={formData.arithmetic2}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Table Name</label>

                <div className="input-box">
                  <FaTable className="input-icon" />

                  <input
                    type="text"
                    name="table2Name"
                    placeholder="Enter table2Name "
                    value={formData.table2Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Header Name</label>

                <div className="input-box">
                  <FaHeading className="input-icon" />

                  <input
                    type="text"
                    name="header2Name"
                    placeholder="Enter header2Name "
                    value={formData.header2Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Amount Position</label>

                <div className="input-box">
                  <FaMapMarkerAlt className="input-icon" />

                  <input
                    type="text"
                    name="amountPosition2"
                    placeholder="Enter amountPosition2"
                    value={formData.amountPosition2}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Information</label>

                <div className="input-box">
                  <FaInfoCircle className="input-icon" />

                  <input
                    type="text"
                    name="information2"
                    placeholder="Enter information2"
                    value={formData.information2}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rule 3 */}

          <div className="form-card">
            <h3 className="section-title">Rule 3</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Arithmetic 3</label>

                <div className="input-box">
                  <FaCalculator className="input-icon" />

                  <input
                    type="text"
                    name="arithmetic3"
                    placeholder="Enter arithmetic3 "
                    value={formData.arithmetic3}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Table Name</label>

                <div className="input-box">
                  <FaTable className="input-icon" />

                  <input
                    type="text"
                    name="table3Name"
                    placeholder="Enter table3Name "
                    value={formData.table3Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Header Name</label>

                <div className="input-box">
                  <FaHeading className="input-icon" />

                  <input
                    type="text"
                    name="header3Name"
                    placeholder="Enter header3Name "
                    value={formData.header3Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Amount Position</label>

                <div className="input-box">
                  <FaMapMarkerAlt className="input-icon" />

                  <input
                    type="text"
                    name="amountPosition3"
                    placeholder="Enter amountPosition3 "
                    value={formData.amountPosition3}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Information</label>

                <div className="input-box">
                  <FaInfoCircle className="input-icon" />

                  <input
                    type="text"
                    name="information3"
                    placeholder="Enter information3 "
                    value={formData.information3}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Rule 4 */}

          <div className="form-card">
            <h3 className="section-title">Rule 4</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Arithmetic 4</label>

                <div className="input-box">
                  <FaCalculator className="input-icon" />

                  <input
                    type="text"
                    name="arithmetic4"
                    placeholder="Enter arithmetic4 "
                    value={formData.arithmetic4}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Table Name</label>

                <div className="input-box">
                  <FaTable className="input-icon" />

                  <input
                    type="text"
                    name="table4Name"
                    placeholder="Enter table4Name "
                    value={formData.table4Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Header Name</label>

                <div className="input-box">
                  <FaHeading className="input-icon" />

                  <input
                    type="text"
                    name="header4Name"
                    placeholder="Enter header4Name "
                    value={formData.header4Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Amount Position</label>

                <div className="input-box">
                  <FaMapMarkerAlt className="input-icon" />

                  <input
                    type="text"
                    name="amountPosition4"
                    placeholder="Enter amountPosition4"
                    value={formData.amountPosition4}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Information</label>

                <div className="input-box">
                  <FaInfoCircle className="input-icon" />

                  <input
                    type="text"
                    name="information4"
                    placeholder="Enter information4"
                    value={formData.information4}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

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
                    placeholder="Enter activeRow"
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
                    placeholder="Enter row status "
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
