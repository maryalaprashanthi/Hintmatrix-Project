import React from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import ActionIconButton from "../../components/Common/ActionIconButton";

function RuleEngineTable({
  ruleEngineList,
  onEdit,
  onDelete,
}) {

  // ============================================================
  // DEFAULT COLUMN CONFIGURATION
  // ============================================================

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  // ============================================================
  // CONVERT BACKEND FIELD NAME TO READABLE NAME
  // ============================================================

  const getReadableFieldName = (field) => {

    if (!field) {
      return "";
    }

    const fieldNames = {

      chapter: "Chapter",

      pair_attribute: "Pair Attribute",

      attribute: "Table Attribute",

      relationship_name: "Relationship",

      pair_order: "Pair Order",

      arithmetic1: "Arithmetic 1",
      table1: "Table 1",
      header1: "Header 1",
      amount_position1: "Amount Position 1",
      information1: "Information 1",

      arithmetic2: "Arithmetic 2",
      table2: "Table 2",
      header2: "Header 2",
      amount_position2: "Amount Position 2",
      information2: "Information 2",

      arithmetic3: "Arithmetic 3",
      table3: "Table 3",
      header3: "Header 3",
      amount_position3: "Amount Position 3",
      information3: "Information 3",

      arithmetic4: "Arithmetic 4",
      table4: "Table 4",
      header4: "Header 4",
      amount_position4: "Amount Position 4",
      information4: "Information 4",
    };

    return (
      fieldNames[field] ||
      field
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
    );
  };

  // ============================================================
  // GET ISSUES FROM BACKEND
  // ============================================================

  const getIssues = (data) => {

    if (!data) {
      return [];
    }

    if (Array.isArray(data.uploadIssues)) {
      return data.uploadIssues;
    }

    if (Array.isArray(data.missingFields)) {
      return data.missingFields;
    }

    return [];
  };

  // ============================================================
  // GET TABLE ATTRIBUTE VALUE
  //
  // Handles different possible backend field names.
  // ============================================================

  const getTableAttributeValue = (data) => {

    if (!data) {
      return "";
    }

    return (
      data.tableAttributeName ||
      data.attributeName ||
      data.tableAttribute?.name ||
      data.tableAttributeid?.name ||
      ""
    );
  };

  // ============================================================
  // CHECK WHETHER FIELD IS CHAPTER
  //
  // Chapter warnings should NOT be displayed.
  // ============================================================

  const isChapterIssue = (issue) => {

    if (!issue) {
      return false;
    }

    const field =
      typeof issue === "string"
        ? issue
        : issue.field;

    return field === "chapter";
  };

  // ============================================================
  // GET EFFECTIVE ISSUES
  //
  // IMPORTANT:
  //
  // During upload:
  // backend provides missingFields/uploadIssues.
  //
  // After refresh:
  // backend may only provide rowStatus = 0.
  //
  // Therefore, if the row is DRAFT and the Table Attribute
  // is empty, create the Table Attribute issue on the frontend.
  // ============================================================

  const getEffectiveIssues = (data) => {

    if (!data) {
      return [];
    }

    let issues = getIssues(data);

    // ----------------------------------------------------------
    // Remove Chapter issues
    // ----------------------------------------------------------

    issues = issues.filter(
      (issue) => !isChapterIssue(issue)
    );

    // ----------------------------------------------------------
    // Determine whether row is DRAFT
    // ----------------------------------------------------------

    const isDraft =
      data.uploadStatus === "DRAFT" ||
      data.rowStatus === 0;

    // ----------------------------------------------------------
    // Get Table Attribute
    // ----------------------------------------------------------

    const tableAttribute =
      getTableAttributeValue(data);

    // ----------------------------------------------------------
    // If DRAFT and Table Attribute is empty,
    // create the warning even after page refresh.
    // ----------------------------------------------------------

    const hasTableAttributeIssue =
      issues.some((issue) => {

        if (!issue) {
          return false;
        }

        const field =
          typeof issue === "string"
            ? issue
            : issue.field;

        return field === "attribute";
      });

    if (
      isDraft &&
      !tableAttribute &&
      !hasTableAttributeIssue
    ) {

      issues.push({
        field: "attribute",
        value: null,
        message: "Table Attribute is required",
      });
    }

    return issues;
  };

  // ============================================================
  // GET MISSING FIELD NAMES
  // ============================================================

  const getMissingFieldNames = (data) => {

    const issues =
      getEffectiveIssues(data);

    if (!issues.length) {
      return [];
    }

    return issues
      .map((issue) => {

        if (!issue) {
          return null;
        }

        // String issue
        if (typeof issue === "string") {

          return getReadableFieldName(issue);
        }

        // Object issue
        if (issue.field) {

          return getReadableFieldName(
            issue.field
          );
        }

        return null;
      })
      .filter(Boolean);
  };

  // ============================================================
  // GET ISSUE DETAILS
  // ============================================================

  const getIssueMessages = (data) => {

    const issues =
      getEffectiveIssues(data);

    if (!issues.length) {
      return "";
    }

    return issues
      .map((issue) => {

        if (!issue) {
          return "";
        }

        // String issue
        if (typeof issue === "string") {

          return getReadableFieldName(issue);
        }

        const field =
          issue.field
            ? getReadableFieldName(
                issue.field
              )
            : "";

        const message =
          issue.message || "";

        if (field && message) {

          return `${field}: ${message}`;
        }

        return field || message;
      })
      .filter(Boolean)
      .join("\n");
  };

  // ============================================================
  // COLUMN DEFINITIONS
  //
  // IMPORTANT:
  // All columns now use flex.
  //
  // This prevents the horizontal scrollbar.
  // ============================================================

  const columnDefs = [

    // ==========================================================
    // CHAPTER
    // ==========================================================

    {
      field: "chapterName",
      headerName: "Chapter Name",

      flex: 1,

      minWidth: 130,

      tooltipField: "chapterName",
    },

    // ==========================================================
    // PAIR ATTRIBUTE
    // ==========================================================

    {
      field: "pairAttributeName",
      headerName: "Pair Attribute",

      flex: 1,

      minWidth: 130,

      tooltipField: "pairAttributeName",
    },

    // ==========================================================
    // TABLE ATTRIBUTE
    // ==========================================================

    {
      field: "tableAttributeName",
      headerName: "Table Attribute Name",

      flex: 1,

      minWidth: 150,

      tooltipField: "tableAttributeName",

      valueGetter: (params) => {

        return getTableAttributeValue(
          params.data
        );
      },
    },

    // ==========================================================
    // RELATIONSHIP
    // ==========================================================

    {
      field: "relationshipName",
      headerName: "Relationship",

      flex: 1,

      minWidth: 140,

      tooltipField: "relationshipName",
    },

    // ==========================================================
    // PAIR ORDER
    // ==========================================================

    {
      field: "pairOrder",
      headerName: "Pair Order",

      flex: 0.6,

      minWidth: 90,
    },

    // ==========================================================
    // STATUS
    // ==========================================================

    {
      headerName: "Status",

      flex: 1.6,

      minWidth: 240,

      sortable: true,

      filter: true,

      cellRenderer: (params) => {

        if (!params.data) {
          return null;
        }

        const data =
          params.data;

        // ------------------------------------------------------
        // GET EFFECTIVE ISSUES
        // ------------------------------------------------------

        const issues =
          getEffectiveIssues(data);

        const missingFields =
          getMissingFieldNames(data);

        const issueMessages =
          getIssueMessages(data);

        // ------------------------------------------------------
        // DETERMINE DRAFT
        // ------------------------------------------------------

        const isDraft =
          data.uploadStatus === "DRAFT" ||
          data.rowStatus === 0 ||
          issues.length > 0;

        // ======================================================
        // DRAFT
        // ======================================================

        if (isDraft) {

          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",

                height: "100%",
                width: "100%",

                overflow: "hidden",
              }}
            >

              {/* ==================================================
                  RED DOT
              ================================================== */}

              <span
                style={{
                  width: "9px",
                  height: "9px",

                  minWidth: "9px",

                  borderRadius: "50%",

                  backgroundColor: "#dc2626",

                  display: "inline-block",
                }}
              />

              {/* ==================================================
                  DRAFT
              ================================================== */}

              <span
                style={{
                  color: "#dc2626",

                  fontWeight: "600",

                  whiteSpace: "nowrap",
                }}
              >
                Draft
              </span>

              {/* ==================================================
                  WARNING ICON
              ================================================== */}

              {missingFields.length > 0 && (

                <span
                  title={issueMessages}
                  style={{
                    color: "#dc2626",

                    fontWeight: "bold",

                    cursor: "help",

                    fontSize: "16px",

                    flexShrink: 0,
                  }}
                >
                  ⚠
                </span>

              )}

              {/* ==================================================
                  MISSING FIELD
              ================================================== */}

              {missingFields.length > 0 && (

                <span
                  title={issueMessages}
                  style={{
                    color: "#dc2626",

                    fontWeight: "600",

                    fontSize: "13px",

                    whiteSpace: "nowrap",

                    overflow: "hidden",

                    textOverflow: "ellipsis",

                    cursor: "help",

                    minWidth: 0,
                  }}
                >
                  Missing:{" "}
                  {missingFields.join(", ")}
                </span>

              )}

            </div>
          );
        }

        // ======================================================
        // ACTIVE
        // ======================================================

        return (
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: "7px",

              height: "100%",
            }}
          >

            {/* GREEN DOT */}

            <span
              style={{
                width: "9px",

                height: "9px",

                minWidth: "9px",

                borderRadius: "50%",

                backgroundColor: "#16a34a",

                display: "inline-block",
              }}
            />

            {/* ACTIVE */}

            <span
              style={{
                color: "#16a34a",

                fontWeight: "600",

                whiteSpace: "nowrap",
              }}
            >
              Active
            </span>

          </div>
        );
      },
    },

    // ==========================================================
    // ACTION
    // ==========================================================

    {
      headerName: "Action",

      flex: 0.7,

      minWidth: 100,

      maxWidth: 120,

      sortable: false,

      filter: false,

      cellRenderer: (params) => {

        if (!params.data) {
          return null;
        }

        return (
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: "8px",

              height: "100%",
            }}
          >

            {/* EDIT */}

            <ActionIconButton
              type="edit"
              onClick={() =>
                onEdit(params.data)
              }
              title="Edit rule"
            />

            {/* DELETE */}

            <ActionIconButton
              type="delete"
              onClick={() =>
                onDelete(
                  params.data.ruleEngineId
                )
              }
              title="Delete rule"
            />

          </div>
        );
      },
    },
  ];

  // ============================================================
  // FORMAT DATA
  // ============================================================

  const formattedRuleEngineList =
    (ruleEngineList || []).map((item) => {

      const backendIssues =
        Array.isArray(item.uploadIssues)
          ? item.uploadIssues
          : Array.isArray(item.missingFields)
          ? item.missingFields
          : [];

      return {

        ...item,

        // ======================================================
        // TABLE ATTRIBUTE
        // ======================================================

        tableAttributeName:
          item.tableAttributeName ||
          item.attributeName ||
          item.tableAttribute?.name ||
          item.tableAttributeid?.name ||
          "",

        // ======================================================
        // ISSUES
        // ======================================================

        uploadIssues:
          backendIssues,

        missingFields:
          backendIssues,

        // ======================================================
        // STATUS
        // ======================================================

        uploadStatus:
          item.uploadStatus ||
          (
            item.rowStatus === 0
              ? "DRAFT"
              : "RULE"
          ),
      };
    });

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div
      style={{
        marginTop: "20px",

        width: "100%",

        overflow: "hidden",
      }}
    >

      {/* ========================================================
          AG GRID STYLING
      ======================================================== */}

      <style
        dangerouslySetInnerHTML={{
          __html: `

            .ag-popup {
              min-width: 280px !important;
            }

            .ag-filter-wrapper {
              min-width: 260px !important;
              padding: 16px !important;
            }

            .ag-filter-body-wrapper {
              width: 100% !important;
            }

            .ag-filter-condition {
              width: 100% !important;
              margin: 12px 0 !important;
            }

            .ag-picker-field {
              min-height: 32px !important;
            }

            .ag-radio-button-input-wrapper {
              display: none !important;
            }

            .ag-radio-button-label {
              display: inline-flex !important;
              align-items: center !important;
              gap: 6px !important;
              cursor: pointer !important;
            }

            .ag-radio-button-label::before {
              content: "";
              display: inline-block;
              width: 14px;
              height: 14px;
              border: 2px solid #64748b;
              border-radius: 50%;
              background: white;
            }

            .ag-selected
            .ag-radio-button-label::before {
              background: #2563eb;
              border-color: #2563eb;
              box-shadow:
                inset 0 0 0 3px white;
            }

          `,
        }}
      />

      {/* ========================================================
          GRID
      ======================================================== */}

      <div
        style={{
          width: "100%",

          height: "450px",

          overflow: "hidden",
        }}
      >

        <AgGridReact
          rowData={formattedRuleEngineList}

          columnDefs={columnDefs}

          defaultColDef={defaultColDef}

          theme={themeQuartz}

          pagination={true}

          paginationPageSize={10}

          paginationPageSizeSelector={false}

          rowHeight={50}

          popupParent={document.body}

          // Prevent unnecessary horizontal scrolling
          suppressHorizontalScroll={true}

          // Automatically fit columns to available width
          onGridReady={(params) => {

            setTimeout(() => {

              params.api.sizeColumnsToFit();

            }, 100);

          }}
        />

      </div>

    </div>
  );
}

export default RuleEngineTable;