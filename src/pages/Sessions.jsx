import "./Sessions.css";

function Sessions() {

  const sessions = [
    {
      title: "Introduction to React",
      course: "Frontend Development",
      progress: 100,
      status: "Completed",
      duration: "45 min",
      lessons: "8 Lessons"
    },
    {
      title: "React Components",
      course: "React Masterclass",
      progress: 60,
      status: "In Progress",
      duration: "60 min",
      lessons: "12 Lessons"
    },
    {
      title: "Advanced React Hooks",
      course: "React Masterclass",
      progress: 0,
      status: "Upcoming",
      duration: "50 min",
      lessons: "6 Lessons"
    }
  ];


  return (

    <div className="sessions-page">


      {/* Header */}

      <div className="sessions-header">

        <div className="header-content">

          <div className="session-icon">
            🎥
          </div>


          <div>

            <h1>
              My Sessions
            </h1>


            <p>
              Access all your course sessions in one place.
            </p>

          </div>

        </div>

      </div>



      {/* Filter Section */}

      <div className="filter-section">


        <div className="search-box">

          <span>
            🔍
          </span>


          <input
            type="text"
            placeholder="Search sessions..."
          />

        </div>



        <div className="filter-options">


          <select>
            <option>All Courses</option>
            <option>React</option>
            <option>JavaScript</option>
          </select>



          <select>
            <option>All Status</option>
            <option>Completed</option>
            <option>Upcoming</option>
          </select>



          <select>
            <option>Newest First</option>
            <option>Oldest First</option>
          </select>


        </div>


      </div>





      {/* Session Cards */}


      <div className="sessions-grid">


        {
          sessions.map((item,index)=>(


            <div className="session-card" key={index}>


              <div className="course-image">

                🎬

              </div>



              <div className="card-top">


                <span className={`status ${item.status.replace(" ","-")}`}>

                  {item.status}

                </span>


              </div>




              <h3>

                {item.title}

              </h3>




              <p className="course-name">

                {item.course}

              </p>





              {/* Progress */}

              <div className="progress-area">


                <div className="progress-header">

                  <span>
                    Progress
                  </span>


                  <span>
                    {item.progress}%
                  </span>

                </div>



                <div className="progress-bar">


                  <div
                    className="progress-fill"
                    style={{
                      width:`${item.progress}%`
                    }}
                  >

                  </div>


                </div>


              </div>





              <div className="session-info">


                <span>
                  ⏱ {item.duration}
                </span>


                <span>
                  📚 {item.lessons}
                </span>


              </div>





              <button>

                {
                  item.status === "Completed"
                  ?
                  "Watch Again"
                  :
                  "Continue"
                }

              </button>



            </div>


          ))
        }


      </div>



    </div>

  );

}


export default Sessions;