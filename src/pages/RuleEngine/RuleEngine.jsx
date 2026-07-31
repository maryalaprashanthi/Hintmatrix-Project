import { useEffect, useState, useRef } from "react";
import RuleEngineForm from "./RuleEngineForm";
import RuleEngineTable from "./RuleEngineTable";
import "./RuleEngine.css";
import RuleEngineService from "../../services/RuleEngineService";

function RuleEngine() {
  const [showModal, setShowModal] = useState(false);
  const [ruleEngineList, setRuleEngineList] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);

  const fileInputRef = useRef(null);

  // ===========================
  // Fetch All Rules
  // ===========================
  const fetchRules = async () => {
    try {
      const data = await RuleEngineService.getAllRules();
      setRuleEngineList(data);
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // ===========================
  // Upload
  // ===========================
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log("Selected File:", file);

    // TODO:
    // await RuleEngineService.uploadRules(file);

    fetchRules();
  };

  // ===========================
  // Add Rule
  // ===========================
  const handleAdd = () => {
    setSelectedRule(null);
    setShowModal(true);
  };

  // ===========================
  // Edit Rule
  // ===========================
  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setShowModal(true);
  };

  // ===========================
  // Delete Rule
  // ===========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;

    try {
      await RuleEngineService.deleteRule(id);
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  // ===========================
  // Save / Update Rule
  // ===========================
  const handleSave = async (ruleData) => {
    try {
      if (selectedRule) {
        await RuleEngineService.updateRule(selectedRule.ruleId, ruleData);
      } else {
        await RuleEngineService.saveRule(ruleData);
      }

      fetchRules();
      setShowModal(false);
      setSelectedRule(null);
    } catch (error) {
      console.error("Error saving rule:", error);
    }
  };

  // ===========================
  // Close Modal
  // ===========================
  const handleClose = () => {
    setShowModal(false);
    setSelectedRule(null);
  };

  return (
    <div className="rule-engine-container">
      <div className="page-header">
        <h2>Rule Engine</h2>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleUploadClick}>
            ⬆ Upload
          </button>

          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Rule
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
      />

      <RuleEngineTable
        ruleEngineList={ruleEngineList}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <RuleEngineForm
        show={showModal}
        onClose={handleClose}
        onSave={handleSave}
        selectedRuleData={selectedRule}
      />
    </div>
  );
}

export default RuleEngine;
