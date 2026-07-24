import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";

import "./Layout.css";


export default function Layout(){

const [sidebarOpen,setSidebarOpen] = useState(
    window.innerWidth > 768
);


useEffect(()=>{

const handleResize=()=>{

if(window.innerWidth > 768){

setSidebarOpen(true);

}
else{

setSidebarOpen(false);

}

};


window.addEventListener(
"resize",
handleResize
);


return()=>{

window.removeEventListener(
"resize",
handleResize
);

};


},[]);



return(

<div className="app-layout">


<Sidebar

sidebarOpen={sidebarOpen}

setSidebarOpen={setSidebarOpen}

/>



<div className="main-layout">


<Navbar

sidebarOpen={sidebarOpen}

setSidebarOpen={setSidebarOpen}

/>



<main className="page-content">

<Outlet/>

</main>



</div>



{
sidebarOpen &&
window.innerWidth <=768 &&
(

<div

className="sidebar-overlay"

onClick={()=>setSidebarOpen(false)}

></div>

)

}


</div>


);


}