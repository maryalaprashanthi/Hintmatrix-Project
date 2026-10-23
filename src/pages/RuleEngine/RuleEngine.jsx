import { useEffect, useState, useRef } from "react";
import RuleEngineForm from "./RuleEngineForm";
import RuleEngineUploadErrorsModal from "./RuleEngineUploadErrorsModal";
import { readRuleEngineUploadReport, saveRuleEngineUploadReport } from "./ruleEngineUploadReport";
import RuleEngineTable from "./RuleEngineTable";
import "./RuleEngine.css";
import RuleEngineService from "../../services/RuleEngineService";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";
import { getApiErrorMessage } from "../../utils/apiError";
import ManagementCountTiles from "../../components/Common/ManagementCountTiles";
import { getManagementCounts } from "../../utils/managementCounts";
import { FaGavel, FaProjectDiagram } from "react-icons/fa";

function RuleEngine() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [ruleEngineList, setRuleEngineList] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);

  const fileInputRef = useRef(null);

  const [uploadReport, setUploadReport] = useState(readRuleEngineUploadReport);
  const [showUploadErrors, setShowUploadErrors] = useState(false);
  const [uploading, setUploading] = useState(false);
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

    setUploading(true);
    saveRuleEngineUploadReport(null);
    setUploadReport(null);
    setShowUploadErrors(false);
    try {
      const response = await RuleEngineService.uploadRulesExcel(file);
      setUploadReport(response);
      saveRuleEngineUploadReport(response);
      setUploadDrafts([]);
      setShowUploadErrors(Boolean(response.errors?.length));
      if (!response.errors?.length) toast.success(response.message || "Rule upload complete.");
      await fetchRules();
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "Rule upload failed."));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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

  const ruleEngineCounts = getManagementCounts(ruleEngineList);
  const relationshipTypeCount = new Set(
    ruleEngineList
      .map((rule) => String(rule.relationshipName ?? "").trim().toLowerCase())
      .filter(Boolean),
  ).size;

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
          accept=".xlsx,.xls,.xlsm"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="d-flex gap-2">
          {uploadReport?.errors?.length > 0 && (
            <button className="btn btn-outline-danger" onClick={() => setShowUploadErrors(true)}>
              Upload Errors ({uploadReport.errors.length})
            </button>
          )}

          <button
            className="btn btn-primary"
            disabled={uploading}
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

      <ManagementCountTiles
        label="Rule Engines"
        counts={ruleEngineCounts}
        icon={FaGavel}
        extraTiles={[
          {
            title: "Total Relationship Types",
            count: relationshipTypeCount,
            subtitle: "Unique Relationships",
            icon: FaProjectDiagram,
            color: "purple",
          },
        ]}
      />

      <RuleEngineTable
        ruleEngineList={ruleEngineList}
        onEdit={handleEdit}
        onDelete={del.request}
      />

      <RuleEngineUploadErrorsModal
        show={showUploadErrors}
        report={uploadReport}
        onClose={() => setShowUploadErrors(false)}
      />
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
