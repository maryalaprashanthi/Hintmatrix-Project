import "./Chapters.css";
import { useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaPlayCircle
} from "react-icons/fa";



function Chapters() {


  const { courseId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

const isQuestionsModule =
  location.pathname.startsWith("/questions");
const [showAddChapter, setShowAddChapter] = useState(false);


  const courseData = {



    bcom: {

      name:"B.Com",

      chapters:[

        {
          title:"Financial Accounting",
          lessons:12,
          progress:"80%"
        },

        {
          title:"Business Economics",
          lessons:10,
          progress:"60%"
        },

        {
          title:"Corporate Accounting",
          lessons:15,
          progress:"45%"
        },

        {
          title:"Cost Accounting",
          lessons:14,
          progress:"70%"
        },

        {
          title:"Business Law",
          lessons:8,
          progress:"55%"
        },

        {
          title:"Taxation",
          lessons:18,
          progress:"30%"
        }

      ]

    },

    "ca-foundation": {


      name:"CA Foundation",


      chapters:[

        {
          title:"Principles of Accounting",
          lessons:20,
          progress:"75%"
        },

        {
          title:"Business Laws",
          lessons:16,
          progress:"50%"
        },

        {
          title:"Economics",
          lessons:12,
          progress:"40%"
        },

        {
          title:"Quantitative Aptitude",
          lessons:22,
          progress:"65%"
        }

      ]

    },

    "cbse-11": {


      name:"CBSE Class 11",


      chapters:[

        {
          title:"Accountancy",
          lessons:18,
          progress:"60%"
        },

        {
          title:"Business Studies",
          lessons:15,
          progress:"50%"
        },

        {
          title:"Economics",
          lessons:14,
          progress:"45%"
        }

      ]

    },


    "jr-accountancy": {


      name:"Junior Accountancy",


      chapters:[

        {
          title:"Basic Accounting",
          lessons:10,
          progress:"70%"
        },

        {
          title:"Journal Entries",
          lessons:12,
          progress:"55%"
        },

        {
          title:"Ledger",
          lessons:8,
          progress:"40%"
        }

      ]

    },

    combo:{


      name:"Commerce Combo",


      chapters:[

        {
          title:"Accounting Basics",
          lessons:15,
          progress:"80%"
        },

        {
          title:"Commerce Concepts",
          lessons:20,
          progress:"65%"
        },

        {
          title:"Exam Preparation",
          lessons:12,
          progress:"35%"
        }

      ]

    },

    inter:{


      name:"Intermediate",


      chapters:[

        {
          title:"Advanced Accounting",
          lessons:20,
          progress:"60%"
        },

        {
          title:"Corporate Law",
          lessons:15,
          progress:"50%"
        },

        {
          title:"Financial Management",
          lessons:18,
          progress:"45%"
        }

      ]

    }



  };

const defaultCourse = {
  name: "All Chapters",
  chapters: [
    {
      title: "Financial Accounting",
      lessons: 12,
      progress: "80%",
    },
    {
      title: "Business Economics",
      lessons: 10,
      progress: "60%",
    },
    {
      title: "Corporate Accounting",
      lessons: 15,
      progress: "45%",
    },
    {
      title: "Cost Accounting",
      lessons: 14,
      progress: "70%",
    },
    {
      title: "Business Law",
      lessons: 8,
      progress: "55%",
    },
    {
      title: "Taxation",
      lessons: 18,
      progress: "30%",
    },
  ],
};

const course = isQuestionsModule
  ? defaultCourse
  : courseData[courseId] || defaultCourse;

  // Chapter -> Question Categories

  const openCategories = (chapterTitle)=>{


    const chapterSlug = chapterTitle

    .toLowerCase()

    .replaceAll(" ","-");

      if (isQuestionsModule) {
  navigate("/questions/question-categories");
} else {
  navigate(
    `/question-categories/${courseId}/${chapterSlug}`
  );
}
  };
  return (


    <div className="chapters-page">

      <button

        className="back-btn"
         onClick={() =>
  navigate(
    isQuestionsModule
      ? "/questions"
      : "/courses"
  )
}

      >


        <FaArrowLeft/>

        Back to Courses


      </button>
      
      <div className="chapter-header d-flex justify-content-between align-items-center flex-wrap gap-3">

  <div>
    <h2>{course.name} Chapters</h2>
    <p className="mb-0">
      Select a chapter and start learning
    </p>
  </div>

  <button
    className="btn btn-primary"
    onClick={() => setShowAddChapter(true)}
  >
    + Add Chapter
  </button>

</div>

      <div className="row g-4">



      {

      course.chapters.map((chapter,index)=>(



        <div

        className="col-xl-4 col-lg-4 col-md-6"

        key={index}

        >





          <div className="chapter-card">







            <div className="chapter-icon">


              <FaBookOpen/>


            </div>









            <h4>


              {chapter.title}


            </h4>









            <div className="chapter-info">



              <span>

                <FaClock/>

                {chapter.lessons} Lessons

              </span>






              <span>


                <FaCheckCircle/>

                {chapter.progress}


              </span>



            </div>









            <div className="progress">



              <div

              className="progress-bar"

              style={{

                width:chapter.progress

              }}

              >

              </div>



            </div>









            <button


            className="start-btn"


            onClick={()=>openCategories(chapter.title)}


            >



              <FaPlayCircle/>

              Start Learning



            </button>






          </div>





        </div>



      ))

      }



      </div>
      
</div>



  );


}



export default Chapters;