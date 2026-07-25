import "./Chapters.css";

import { useState } from "react";

import { 
  useParams,
  useNavigate
} from "react-router-dom";


import {
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaPlayCircle,
  FaPen,
  FaTrash
} from "react-icons/fa";


import ChapterForm from "./ChapterForm";



function Chapters(){


const {courseId}=useParams();

const navigate=useNavigate();



const [showAddChapter,setShowAddChapter]=useState(false);



const handleFileUpload=(e)=>{

const file=e.target.files[0];

if(file){

alert(`Selected File: ${file.name}`);

}

};





const handleEdit=(chapter)=>{

console.log("Edit:",chapter);

alert(`Edit ${chapter.title}`);

};





const handleDelete=(chapter)=>{


if(window.confirm(`Delete ${chapter.title}?`)){


console.log("Delete:",chapter);


}


};






const courses={


bcom:{

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



"ca-foundation":{

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
}

]

},



"cbse-11":{

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
}

]

},



"jr-accountancy":{

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
}

]

}



};





const course =
courses[courseId] || courses.bcom;







const openCategories=(title)=>{


const slug=
title
.toLowerCase()
.replaceAll(" ","-");


navigate(
`/question-categories/${courseId}/${slug}`
);


};







return(


<div className="chapters-page">



<div className="chapter-header d-flex justify-content-between align-items-center flex-wrap gap-3">


<div>

<h2>
{course.name}
</h2>


<p>
Select a chapter and start learning
</p>


</div>





<div className="d-flex gap-2">



<input

type="file"

id="chapterUpload"

accept=".csv,.xlsx,.xls"

style={{display:"none"}}

onChange={handleFileUpload}

/>




<button

className="btn btn-primary"

onClick={()=>
document
.getElementById("chapterUpload")
.click()
}

>

⬆ Upload

</button>





<button

className="btn btn-primary"

onClick={()=>
setShowAddChapter(true)
}

>

+ Add Chapter

</button>



</div>



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

onClick={()=>
openCategories(chapter.title)
}

>

<FaPlayCircle/>

Start Learning


</button>







<div className="d-flex gap-2 mt-3">


<button

className="btn btn-sm btn-outline-primary"

onClick={()=>
handleEdit(chapter)
}

>

<FaPen/>

&nbsp; Edit

</button>





<button

className="btn btn-sm btn-outline-danger"

onClick={()=>
handleDelete(chapter)
}

>

<FaTrash/>

&nbsp; Delete

</button>



</div>






</div>



</div>



))


}



</div>








<ChapterForm

show={showAddChapter}

onClose={()=>
setShowAddChapter(false)
}


onSave={(data)=>{

console.log(data);

}}


/>



</div>


);


}



export default Chapters;