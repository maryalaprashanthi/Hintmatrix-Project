import { useEffect, useState, useRef } from "react";
import RuleEngineForm from "./RuleEngineForm";
import RuleEngineTable from "./RuleEngineTable";
import "./RuleEngine.css";
import RuleEngineService from "../../services/RuleEngineService";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";
import { getApiErrorMessage } from "../../utils/apiError";

function RuleEngine() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [ruleEngineList, setRuleEngineList] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);

  const fileInputRef = useRef(null);

  // Store upload draft information
  const [uploadDrafts, setUploadDrafts] = useState([]);
  // Fetch All Rules
  const fetchRules = async () => {
    try {
      const data = await RuleEngineService.getAllRules();

      setRuleEngineList(data || []);
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);
  // Upload Button
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  // Excel Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      const response =
        await RuleEngineService.uploadRulesExcel(file);

      console.log("Excel Upload Response:", response);
      const drafts = response.drafts || [];

      setUploadDrafts(drafts);
      const latestRules =
        await RuleEngineService.getAllRules();
      const rulesWithIssues = (latestRules || []).map((rule) => {
        const draft = drafts.find(
          (item) =>
            Number(item.ruleEngineId) ===
            Number(rule.ruleEngineId)
        );

        return {
          ...rule,

          uploadIssues: draft
            ? draft.missingFields || []
            : [],

          uploadStatus: draft
            ? "DRAFT"
            : "RULE",
        };
      });

      setRuleEngineList(rulesWithIssues);

      toast.success(
        `Excel upload complete — ${response.rulesUploaded || 0} uploaded, ` +
          `${response.draftsCreated || 0} drafts, ${response.failedRows || 0} failed.`,
      );
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "Rule upload failed."));
    }
    e.target.value = "";
  };
  // Add Rule
  const handleAdd = () => {
    setSelectedRule(null);
    setShowModal(true);
  };
  // Edit Rule
  const handleEdit = (rule) => {
    let uploadIssues = rule.uploadIssues || [];
    if (uploadIssues.length === 0) {
      const draft = uploadDrafts.find(
        (item) =>
          Number(item.ruleEngineId) ===
          Number(rule.ruleEngineId)
      );

      uploadIssues = draft?.missingFields || [];
    }

    const ruleWithIssues = {
      ...rule,
      uploadIssues,
    };

    console.log("Editing rule:", ruleWithIssues);

    setSelectedRule(ruleWithIssues);
    setShowModal(true);
  };
  // Delete Rule
  const del = useDeleteConfirm({
    entity: "rule",
    deleteFn: async (rule) => {
      const id = rule?.ruleEngineId ?? rule;
      await RuleEngineService.deleteRule(id);
      setUploadDrafts((prev) =>
        prev.filter((item) => Number(item.ruleEngineId) !== Number(id)),
      );
    },
    onDeleted: fetchRules,
  });
  // Save Rule
  const handleSave = async (ruleData) => {
    const isEdit = Boolean(selectedRule);
    try {
      if (isEdit) {
        await RuleEngineService.updateRule(
          selectedRule.ruleEngineId,
          ruleData
        );
      } else {
        await RuleEngineService.saveRule(ruleData);
      }

      await fetchRules();

      setShowModal(false);
      setSelectedRule(null);

      toast.success(isEdit ? "Rule updated." : "Rule added.");
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error(getApiErrorMessage(error, "Error saving rule."));
    }
  };
  // Close Modal
  const handleClose = () => {
    setShowModal(false);
    setSelectedRule(null);
  };

  return (
    <div className="container-fluid py-4">

      {/*
          HEADER
      */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold">
            Rule Engine
          </h2>

          <p className="text-muted">
            Manage all Rule Engine records.
          </p>
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

          <button
            className="btn btn-primary"
            onClick={handleUploadClick}
          >
            ⬆ Upload
          </button>

          <button
            className="btn btn-primary"
            onClick={handleAdd}
          >
            + Add Rule
          </button>

        </div>
      </div>

      {}
      <div className="card shadow-sm border-0">

        <div className="card-body">

          <RuleEngineTable
            ruleEngineList={ruleEngineList}
            onEdit={handleEdit}
            onDelete={del.request}
          />

        </div>

      </div>

      {}
      <RuleEngineForm
        show={showModal}
        onClose={handleClose}
        onSave={handleSave}
        selectedRuleData={selectedRule}
      />

      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.attributeName || del.pending?.tableAttribute?.name || "this rule"}"?`}
        body="Questions that rely on this rule for grading will no longer be scored against it. This can't be undone."
        confirmLabel="Delete rule"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default RuleEngine;