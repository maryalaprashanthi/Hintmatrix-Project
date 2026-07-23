import { useState,useEffect } from "react";
import "./TableHeaders.css";
import AddTableHeaderModal from "./AddTableHeaderModal";
import TableHeaderService from "../../services/TableHeaderService";
import toast from "react-hot-toast";
import DataGrid from "../../components/DataGrid";

function TableHeaders() {

  const [showModal, setShowModal] = useState(false);

  const [tableHeaders, setTableHeaders] = useState([]);
  const [id, setId] = useState(null);
  const [name, setName] = useState("");

  const handleSave = async (newTableHeader) => {
    if(id==null)
    {
      try {
          console.log("Data is ",newTableHeader);
          const response = await TableHeaderService.create(newTableHeader);
          toast.success("Data saved successfully");
          loadTableHeaders();
        } catch (error) {
          console.log("Error: ",error);
          toast.error(error.message);
        }
    }
    else
    {
      try {
          console.log("Data is ",newTableHeader);
          const response = await TableHeaderService.update(id,newTableHeader);
          toast.success("Data saved successfully");
          loadTableHeaders();
        } catch (error) {
          console.log("Error: ",error);
          toast.error(error.message);
        }
    }
    setId(null);
    setName("")
  };

  const handleDelete = async (id) => {
    console.log("Delete is called with this data ", id);
    try {
      const reposnse = await TableHeaderService.delete(id);
      const data = await reposnse.data;
      toast.success("Data deleted successfully");
    } catch (error) {
      console.error("Error: ", error);
      toast.error(error.message);
    }
    loadTableHeaders();
  };

  useEffect(()=>{
    loadTableHeaders();
  },[])

  const loadTableHeaders = async () => {
    try {
      const result = await TableHeaderService.getAll();
      const data = await result.data;
      console.log("all data ",data);
      const allTableNames = data.map((obj)=>({"name":obj.name,"id":obj.headerId}));
      console.log(allTableNames);
      //  const namesOnly = response.data.map((item) => item.name);
      setTableHeaders(allTableNames);
    } catch (error) {
      console.log("Error: ",error);
      toast.error(error.message);
    }
  }

  const columnDefs = [
    { field: "id", headerName: "ID", width: 80, flex: 1 },
    { field: "name", headerName: "Institute Name", flex: 1, minWidth: 160 },
    {
      headerName: "Action",
      flex: 1,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              gap: "8px",
            }}
          >
            <button
              // onClick={() => handleEdit(params.data.id,params.data)}
              onClick={() => {
                setId(params.data.id);
                setName(params.data.name);
                setShowModal(true);
                console.log("reach");
                
              }}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "2px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(params.data.id)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "2px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (

    <div className="container-fluid py-4">


      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">


        <div>

          <h2 className="fw-bold">
            Table Header Management
          </h2>


          <p className="text-muted">
            Manage all table headers.
          </p>


        </div>



        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >

          + Add Table Header

        </button>


      </div>





      {/* Table */}

      {/* {<div className="card shadow-sm border-0">


        <div className="card-body">


          <table className="table table-bordered table-hover align-middle">


            <thead className="table-light">

              <tr>

                <th>
                  Header Name
                </th>

              </tr>


            </thead>




            <tbody>


              {tableHeaders.length === 0 ? (

                <tr>

                  <td
                    colSpan="1"
                    className="text-center"
                  >
                    No Table Headers Added
                  </td>

                </tr>


              ) : (


                tableHeaders.map((header, index) => (

                  <tr key={index}>

                    <td>
                      {header.name}
                    </td>

                  </tr>


                ))


              )}



            </tbody>


          </table>


        </div>


      </div>} */}

    <DataGrid rowData={tableHeaders} columnDefs={columnDefs} />



      <AddTableHeaderModal

        show={showModal}

        onClose={() => {
          setShowModal(false);
          setId(null);
          setName(null);
        }}
        onSave={handleSave}
        Inputdata={name}

      />


    </div>

  );

}


export default TableHeaders;