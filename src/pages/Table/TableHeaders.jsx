import { useState } from "react";
import "./TableHeaders.css";
import AddTableHeaderModal from "./AddTableHeaderModal";

function TableHeaders() {

  const [showModal, setShowModal] = useState(false);

  const [tableHeaders, setTableHeaders] = useState([]);


  const handleSave = (newTableHeader) => {

    setTableHeaders([
      ...tableHeaders,
      newTableHeader
    ]);

  };


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

      <div className="card shadow-sm border-0">


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


      </div>





      <AddTableHeaderModal

        show={showModal}

        onClose={() => setShowModal(false)}

        onSave={handleSave}

      />


    </div>

  );

}


export default TableHeaders;