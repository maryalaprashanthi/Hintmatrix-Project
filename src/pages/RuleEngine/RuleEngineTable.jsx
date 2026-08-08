import React from "react";
import { themeQuartz } from "ag-grid-community";
import DataGrid from "../../components/DataGrid";
import ActionIconButton from "../../components/Common/ActionIconButton";

function RuleEngineTable({ ruleEngineList, onEdit, onDelete }) {
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const columnDefs = [
    {
      field: "chapterName",
      headerName: "Chapter Name",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "pairAttributeName",
      headerName: "Pair Attribute",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "fieldName",
      headerName: "Field Name",
      flex: 1,
      minWidth: 170,
    },
    {
      field: "fieldType",
      headerName: "Field Type",
      width: 140,
    },
    {
      field: "relationshipName",
      headerName: "Relationship",
      flex: 1,
      minWidth: 170,
    },
    {
      field: "pairOrder",
      headerName: "Pair Order",
      width: 120,
    },
    {
      headerName: "Status",
      width: 120,
      valueGetter: (params) => (params.data?.activeRow ? "Active" : "Inactive"),
    },
    {
      headerName: "Action",
      width: 200,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        if (!params.data) return null;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              height: "100%",
            }}
          >
            <ActionIconButton
              type="edit"
              onClick={() => onEdit(params.data)}
              title="Edit rule"
            />

            <ActionIconButton
              type="delete"
              onClick={() => onDelete(params.data.ruleEngineId)}
              title="Delete rule"
            />
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ marginTop: "20px" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .ag-popup { min-width:280px !important; }
            .ag-filter-wrapper { min-width:260px !important; padding:16px !important; }
            .ag-filter-body-wrapper { width:100% !important; }
            .ag-filter-condition { width:100% !important; margin:12px 0 !important; }
            .ag-picker-field { min-height:32px !important; }
            .ag-radio-button-input-wrapper { display:none !important; }
            .ag-radio-button-label {
              display:inline-flex !important;
              align-items:center !important;
              gap:6px !important;
              cursor:pointer !important;
            }
            .ag-radio-button-label::before{
              content:"";
              display:inline-block;
              width:14px;
              height:14px;
              border:2px solid #64748b;
              border-radius:50%;
              background:white;
            }
            .ag-selected .ag-radio-button-label::before{
              background:#2563eb;
              border-color:#2563eb;
              box-shadow:inset 0 0 0 3px white;
            }
          `,
        }}
      />

      <DataGrid
        rowData={ruleEngineList}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={themeQuartz}
        height="450px"
        pageSize={10}
        paginationPageSizeSelector={false}
        rowHeight={50}
        popupParent={document.body}
      />
    </div>
  );
}

export default RuleEngineTable;
