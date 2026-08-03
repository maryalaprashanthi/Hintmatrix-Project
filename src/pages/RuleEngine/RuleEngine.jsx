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

    try {
      const response = await RuleEngineService.uploadRulesExcel(file);

      alert(response.message || "Rules uploaded successfully!");

      fetchRules();
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Rule upload failed");
    }

    e.target.value = "";
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
  // Save Rule
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
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Rule Engine</h2>

          <p className="text-muted">Manage all Rule Engine records.</p>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleUploadClick}>
            ⬆ Upload
          </button>

          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Rule
          </button>
        </div>
      </div>

      {/* AG Grid Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <RuleEngineTable
            ruleEngineList={ruleEngineList}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Modal */}
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
