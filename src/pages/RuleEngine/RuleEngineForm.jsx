import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import RuleEngineService from "../../services/RuleEngineService";

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
  const relationships = [
    { name: "1to1" },
    { name: "1to2" },
    { name: "1to3" },
    { name: "1to4" },
  ];
  const arithmeticOptions = [{ name: "Add" }, { name: "Subtract" }];
  // Mock Data States
  const [chapters, setChapters] = useState([]);
  const [tableNames, setTableNames] = useState([]);
  const [tableAttributes, setTableAttributes] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [chapterRes, tableRes, attributeRes, headerRes] = await Promise.all(
        [
          RuleEngineService.getChapters(),
          RuleEngineService.getTableNames(),
          RuleEngineService.getTableAttributes(),
          RuleEngineService.getTableHeaders(),
        ],
      );

      setChapters(chapterRes);
      setTableNames(tableRes);
      setTableAttributes(attributeRes);
      setTableHeaders(headerRes);
    } catch (error) {
      console.error("Error loading dropdowns", error);
    }
  };

  const emptyRule = () => ({
    arithmetic: "",
    tableName: "",
    headerName: "",
    amountPosition: "",
    information: "",
  });

  const [formData, setFormData] = useState({
    chapterName: "",
    pairAttributeName: "",
    tableAttributeName: "",
    relationshipName: "",
    pairOrder: "",

    rules: [emptyRule()],

    activeRow: false,
    rowStatus: "",
  });

  // Edit / Reset Form Data
  useEffect(() => {
    if (selectedRuleData) {
      const rules = [];

      for (let i = 1; i <= 4; i++) {
        if (
          selectedRuleData[`arithmetic${i}`] ||
          selectedRuleData[`table${i}Name`] ||
          selectedRuleData[`header${i}Name`] ||
          selectedRuleData[`amountPosition${i}`] ||
          selectedRuleData[`information${i}`]
        ) {
          rules.push({
            arithmetic: selectedRuleData[`arithmetic${i}`] || "",

            tableName: selectedRuleData[`table${i}Name`] || "",

            headerName: selectedRuleData[`header${i}Name`] || "",

            amountPosition: selectedRuleData[`amountPosition${i}`] || "",

            information: selectedRuleData[`information${i}`] || "",
          });
        }
      }

      setFormData({
        chapterName: selectedRuleData.chapterName || "",

        pairAttributeName: selectedRuleData.pairAttributeName || "",

        tableAttributeName:
          selectedRuleData.tableAttributeName ||
          selectedRuleData.attributeName ||
          "",

        relationshipName: selectedRuleData.relationshipName || "",

        pairOrder: selectedRuleData.pairOrder || "",

        rules: rules.length > 0 ? rules : [emptyRule()],

        activeRow: selectedRuleData.activeRow || false,

        rowStatus: selectedRuleData.rowStatus || "",
      });
    } else {
      setFormData({
        chapterName: "",
        pairAttributeName: "",
        tableAttributeName: "",
        relationshipName: "",
        pairOrder: "",

        rules: [emptyRule()],
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
    if (
      !formData.chapterName ||
      !formData.pairAttributeName ||
      !formData.tableAttributeName ||
      !formData.relationshipName ||
      !formData.pairOrder
    ) {
      alert("Please fill the mandatory fields.");
      return;
    }

    const payload = {
      chapterName: formData.chapterName,
      pairAttributeName: formData.pairAttributeName,
      attributeName: formData.tableAttributeName,
      relationshipName: formData.relationshipName,
      pairOrder: formData.pairOrder,

      activeRow: formData.activeRow,
      rowStatus: formData.rowStatus,
    };

    formData.rules.forEach((rule, index) => {
      const i = index + 1;

      payload[`arithmetic${i}`] = rule.arithmetic;

      payload[`table${i}Name`] = rule.tableName;

      payload[`header${i}Name`] = rule.headerName;

      payload[`amountPosition${i}`] = rule.amountPosition;

      payload[`information${i}`] = rule.information;
    });

    try {
      await onSave(payload);
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
          <div className="form-card">
            <h3 className="section-title">Rule Engine Information</h3>

            <div className="form-grid">
              {/* Chapter */}
              <div className="form-group">
                <label>Chapter Name</label>

                <div className="input-box">
                  <FaBook className="input-icon" />

                  <Typeahead
                    id="chapterName"
                    labelKey="name"
                    options={chapters}
                    placeholder="Select Chapter"
                    selected={chapters.filter(
                      (item) => item.name === formData.chapterName,
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,

                        chapterName: selected.length ? selected[0].name : "",
                      }))
                    }
                  />
                </div>
              </div>
              {/* Pair Attribute */}
              <div className="form-group">
                <label>Pair Attribute Name</label>

                <div className="input-box">
                  <FaTag className="input-icon" />

                  <Typeahead
                    id="pairAttributeName"
                    labelKey="name"
                    options={tableAttributes}
                    placeholder="Select Pair Attribute"
                    selected={tableAttributes.filter(
                      (item) => item.name === formData.pairAttributeName,
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,

                        pairAttributeName: selected.length
                          ? selected[0].name
                          : "",
                      }))
                    }
                  />
                </div>
              </div>
              {/* Table Attribute Name */}{" "}
              <div className="form-group">
                {" "}
                <label>Table Attribute Name</label>{" "}
                <div className="input-box">
                  {" "}
                  <FaTag className="input-icon" />{" "}
                  <Typeahead
                    id="tableAttributeName"
                    labelKey="name"
                    options={tableAttributes}
                    placeholder="Select Table Attribute"
                    selected={tableAttributes.filter(
                      (item) => item.name === formData.tableAttributeName,
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        tableAttributeName: selected.length
                          ? selected[0].name
                          : "",
                      }))
                    }
                  />{" "}
                </div>{" "}
              </div>
              {/* Relationship */}
              <div className="form-group">
                <label>Relationship Name</label>

                <div className="input-box">
                  <FaProjectDiagram className="input-icon" />

                  <Typeahead
                    id="relationshipName"
                    labelKey="name"
                    options={relationships}
                    placeholder="Select Relationship"
                    selected={relationships.filter(
                      (item) => item.name === formData.relationshipName,
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        relationshipName: selected.length
                          ? selected[0].name
                          : "",
                      }))
                    }
                  />
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

                    <Typeahead
                      id={`arithmetic-${index}`}
                      labelKey="name"
                      options={arithmeticOptions}
                      placeholder="Select Arithmetic"
                      selected={arithmeticOptions.filter(
                        (item) => item.name === rule.arithmetic,
                      )}
                      onChange={(selected) =>
                        handleRuleChange(
                          index,
                          "arithmetic",
                          selected.length ? selected[0].name : "",
                        )
                      }
                    />
                  </div>
                </div>

                {/* Table Name */}

                <div className="form-group">
                  <label>Table Name</label>

                  <div className="input-box">
                    <FaTable className="input-icon" />

                    <Typeahead
                      id={`tableName-${index}`}
                      labelKey="name"
                      options={tableNames}
                      placeholder="Select Table Name"
                      selected={tableNames.filter(
                        (item) => item.name === rule.tableName,
                      )}
                      onChange={(selected) =>
                        handleRuleChange(
                          index,
                          "tableName",
                          selected.length ? selected[0].name : "",
                        )
                      }
                    />
                  </div>
                </div>

                {/* Header Name */}

                <div className="form-group">
                  <label>Header Name</label>

                  <div className="input-box">
                    <FaHeading className="input-icon" />

                    <Typeahead
                      id={`headerName-${index}`}
                      labelKey="name"
                      options={tableHeaders}
                      placeholder="Select Header Name"
                      selected={tableHeaders.filter(
                        (item) => item.name === rule.headerName,
                      )}
                      onChange={(selected) =>
                        handleRuleChange(
                          index,
                          "headerName",
                          selected.length ? selected[0].name : "",
                        )
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
                    onClick={() => deleteRule(index)}
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
