import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
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

  const arithmeticOptions = [{ name: "add" }, { name: "less" }];
  // Dropdown States
  const [chapters, setChapters] = useState([]);
  const [tableNames, setTableNames] = useState([]);
  const [tableAttributes, setTableAttributes] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  // Load Dropdowns
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
  // Empty Rule
  const emptyRule = () => ({
    arithmetic: "",
    tableName: "",
    headerName: "",
    amountPosition: "",
    information: "",
  });
  const getFieldIssue = (field) => {
    if (!selectedRuleData?.uploadIssues) {
      return null;
    }

    return selectedRuleData.uploadIssues.find((issue) => issue.field === field);
  };

  const getRuleFieldIssue = (index, field) => {
    if (!selectedRuleData?.uploadIssues) {
      return null;
    }

    return selectedRuleData.uploadIssues.find(
      (issue) => issue.field === `${field}${index + 1}`,
    );
  };
  // Form Data
  const [formData, setFormData] = useState({
    chapterName: "",
    tableAttributeName: "",
    pairAttributeName: "",
    relationshipName: "",
    pairOrder: "",

    rules: [emptyRule()],

    activeRow: true,
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

        tableAttributeName:
          selectedRuleData.tableAttributeName ||
          selectedRuleData.attributeName ||
          "",

        pairAttributeName: selectedRuleData.pairAttributeName || "",

        relationshipName: selectedRuleData.relationshipName || "",

        pairOrder: selectedRuleData.pairOrder || "",

        rules: rules.length > 0 ? rules : [emptyRule()],

        activeRow:
          selectedRuleData.activeRow !== false &&
          selectedRuleData.activeRow !== "false" &&
          selectedRuleData.activeRow !== 0 &&
          selectedRuleData.activeRow !== "0",

        rowStatus: selectedRuleData.rowStatus || "",
      });
    } else {
      setFormData({
        chapterName: "",
        tableAttributeName: "",
        pairAttributeName: "",
        relationshipName: "",
        pairOrder: "",

        rules: [emptyRule()],

        activeRow: true,
        rowStatus: "",
      });
    }
  }, [selectedRuleData, show]);
  // Add Rule
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
  // Delete Rule
  const deleteRule = (index) => {
    setFormData((prev) => ({
      ...prev,

      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };
  // Rule Change
  const handleRuleChange = (index, field, value) => {
    const updatedRules = [...formData.rules];

    updatedRules[index][field] = value;

    setFormData((prev) => ({
      ...prev,

      rules: updatedRules,
    }));
  };
  // Normal Field Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // Save
  const handleSave = async () => {
    if (
      !formData.chapterName ||
      !formData.tableAttributeName ||
      !formData.pairAttributeName ||
      !formData.relationshipName ||
      !formData.pairOrder
    ) {
      alert("Please fill the mandatory fields.");
      return;
    }

    const payload = {
      chapterName: formData.chapterName,

      attributeName: formData.tableAttributeName,

      pairAttributeName: formData.pairAttributeName,

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
        {/* =========================
            Header
        ========================== */}

        <div className="modal-header">
          <div>
            <h2>{selectedRuleData ? "Edit Rule Engine" : "Add Rule Engine"}</h2>

            <p>Configure Rule Engine Details.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/*
            Body
       */}

        <div className="modal-body">
          {/*
              Rule Engine Information
         */}

          <div className="form-card">
            <h3 className="section-title">Rule Engine Information</h3>

            <div className="form-grid">
              {/* 
                  Chapter
               */}

              <div className="form-group">
                <label>
                  Chapter Name
                  <span className="required">*</span>
                </label>

                <div className="select-box">
                  <FaBook className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    menuPlacement="bottom"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    options={chapters.map((item) => ({
                      value: item.name,
                      label: item.name,
                    }))}
                    value={
                      chapters
                        .map((item) => ({ value: item.name, label: item.name }))
                        .find(
                          (option) => option.value === formData.chapterName,
                        ) || null
                    }
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        chapterName: option?.value || "",
                      }))
                    }
                    placeholder="Select Chapter"
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No chapter found"}
                  />
                </div>

                {/* REQUIRED FIELD ISSUE */}

                {getFieldIssue("chapter") && (
                  <div className="field-error">
                    {getFieldIssue("chapter").message}
                  </div>
                )}
              </div>

              {/*
                  Table Attribute
              */}

              <div className="form-group">
                <label>
                  Table Attribute Name
                  <span className="required">*</span>
                </label>

                <div className="select-box">
                  <FaTag className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    menuPlacement="bottom"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    options={tableAttributes.map((item) => ({
                      value: item.name,
                      label: item.name,
                    }))}
                    value={
                      tableAttributes
                        .map((item) => ({ value: item.name, label: item.name }))
                        .find(
                          (option) =>
                            option.value === formData.tableAttributeName,
                        ) || null
                    }
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        tableAttributeName: option?.value || "",
                      }))
                    }
                    placeholder="Select Table Attribute"
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No table attribute found"}
                  />
                </div>

                {/* REQUIRED FIELD ISSUE */}

                {getFieldIssue("attribute") && (
                  <div className="field-error">
                    {getFieldIssue("attribute").message}
                  </div>
                )}
              </div>

              {/*
                  Pair Attribute
             */}

              <div className="form-group">
                <label>
                  Pair Attribute Name
                  <span className="required">*</span>
                </label>

                <div className="select-box">
                  <FaTag className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    menuPlacement="bottom"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    options={tableAttributes.map((item) => ({
                      value: item.name,
                      label: item.name,
                    }))}
                    value={
                      tableAttributes
                        .map((item) => ({ value: item.name, label: item.name }))
                        .find(
                          (option) =>
                            option.value === formData.pairAttributeName,
                        ) || null
                    }
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        pairAttributeName: option?.value || "",
                      }))
                    }
                    placeholder="Select Pair Attribute"
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No pair attribute found"}
                  />
                </div>

                {/* REQUIRED FIELD ISSUE */}

                {getFieldIssue("pair_attribute") && (
                  <div className="field-error">
                    {getFieldIssue("pair_attribute").message}
                  </div>
                )}
              </div>

              {/*
                  Relationship
              */}

              <div className="form-group">
                <label>
                  Relationship Name
                  <span className="required">*</span>
                </label>

                <div className="select-box">
                  <FaProjectDiagram className="select-icon" />

                  <Select
                    className="aq-search-select"
                    classNamePrefix="aq-select"
                    menuPlacement="bottom"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    options={relationships.map((item) => ({
                      value: item.name,
                      label: item.name,
                    }))}
                    value={
                      relationships
                        .map((item) => ({ value: item.name, label: item.name }))
                        .find(
                          (option) =>
                            option.value === formData.relationshipName,
                        ) || null
                    }
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        relationshipName: option?.value || "",
                      }))
                    }
                    placeholder="Select Relationship"
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No relationship found"}
                  />
                </div>
              </div>

              {/*
                  Pair Order
             */}

              <div className="form-group">
                <label>
                  Pair Order
                  <span className="required">*</span>
                </label>

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

                {/* REQUIRED FIELD ISSUE */}

                {getFieldIssue("pair_order") && (
                  <div className="field-error">
                    {getFieldIssue("pair_order").message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/*
              Rule Parameters
          */}

          {formData.rules.map((rule, index) => (
            <div className="form-card" key={index}>
              <h3 className="section-title mb-3">Rule {index + 1}</h3>

              <div className="form-grid">
                {/*
                      Arithmetic
                 */}

                <div className="form-group">
                  <label>
                    Arithmetic
                    <span className="required">*</span>
                  </label>

                  <div className="select-box">
                    <FaCalculator className="select-icon" />

                    <Select
                      className="aq-search-select"
                      classNamePrefix="aq-select"
                      menuPlacement="bottom"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                      }}
                      options={arithmeticOptions.map((item) => ({
                        value: item.name,
                        label: item.name,
                      }))}
                      value={
                        arithmeticOptions
                          .map((item) => ({
                            value: item.name,
                            label: item.name,
                          }))
                          .find((option) => option.value === rule.arithmetic) ||
                        null
                      }
                      onChange={(option) =>
                        handleRuleChange(
                          index,
                          "arithmetic",
                          option?.value || "",
                        )
                      }
                      placeholder="Select Arithmetic"
                      isSearchable
                      isClearable
                      noOptionsMessage={() => "No arithmetic option found"}
                    />
                  </div>
                </div>

                {/*
                      Table Name
                  */}

                <div className="form-group">
                  <label>
                    Table Name
                    <span className="required">*</span>
                  </label>

                  <div className="select-box">
                    <FaTable className="select-icon" />

                    <Select
                      className="aq-search-select"
                      classNamePrefix="aq-select"
                      menuPlacement="bottom"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                      }}
                      options={tableNames.map((item) => ({
                        value: item.name,
                        label: item.name,
                      }))}
                      value={
                        tableNames
                          .map((item) => ({
                            value: item.name,
                            label: item.name,
                          }))
                          .find((option) => option.value === rule.tableName) ||
                        null
                      }
                      onChange={(option) =>
                        handleRuleChange(
                          index,
                          "tableName",
                          option?.value || "",
                        )
                      }
                      placeholder="Select Table Name"
                      isSearchable
                      isClearable
                      noOptionsMessage={() => "No table found"}
                    />
                  </div>

                  {/* REQUIRED FIELD ISSUE */}

                  {getRuleFieldIssue(index, "table") && (
                    <div className="field-error">
                      {getRuleFieldIssue(index, "table").message}
                    </div>
                  )}
                </div>

                {/*
                      Header Name
                 */}

                <div className="form-group">
                  <label>
                    Header Name
                    <span className="required">*</span>
                  </label>

                  <div className="select-box">
                    <FaHeading className="select-icon" />

                    <Select
                      className="aq-search-select"
                      classNamePrefix="aq-select"
                      menuPlacement="bottom"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                      }}
                      options={tableHeaders.map((item) => ({
                        value: item.name,
                        label: item.name,
                      }))}
                      value={
                        tableHeaders
                          .map((item) => ({
                            value: item.name,
                            label: item.name,
                          }))
                          .find((option) => option.value === rule.headerName) ||
                        null
                      }
                      onChange={(option) =>
                        handleRuleChange(
                          index,
                          "headerName",
                          option?.value || "",
                        )
                      }
                      placeholder="Select Header Name"
                      isSearchable
                      isClearable
                      noOptionsMessage={() => "No header found"}
                    />
                  </div>

                  {/* REQUIRED FIELD ISSUE */}

                  {getRuleFieldIssue(index, "header") && (
                    <div className="field-error">
                      {getRuleFieldIssue(index, "header").message}
                    </div>
                  )}
                </div>

                {/*
                      Amount Position
                 */}

                <div className="form-group">
                  <label>
                    Amount Position
                    <span className="required">*</span>
                  </label>

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

                {/*
                      Information
                 */}

                <div className="form-group">
                  <label>
                    Information
                    <span className="required">*</span>
                  </label>

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

              {/* Add / Delete Rule */}

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

          {/*
              Status
         */}

          <div className="form-card">
            <h3 className="section-title">Status</h3>

            <div className="form-grid">
              {/* Active Row */}

              <div className="form-group">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="activeRow"
                    checked={formData.activeRow}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">Active</label>
                </div>
              </div>

              {/* Row Status */}

              <div className="form-group">
                <label>
                  Row Status
                  <span className="required">*</span>
                </label>

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

        {/*
            Footer
       */}

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
