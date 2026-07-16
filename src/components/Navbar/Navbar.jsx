import "./Navbar.css";
import logo from "../../assets/hintmatrix-logo.png";

import {FiSearch,FiBell,FiChevronDown} from "react-icons/fi";

export default function Navbar(){

return(

<header className="navbar">

<div className="navbar-left">
<img src={logo} className="logo" alt="logo"/>
</div>

<div className="navbar-center">

<div className="search-box">

<FiSearch className="search-icon"/>

<input
placeholder="Search for courses, topics..."
/>

</div>

</div>

<div className="navbar-right">

<div className="notification">

<FiBell/>

<span className="badge">3</span>

</div>

<div className="profile">

<img
src="https://i.pravatar.cc/150?img=32"
alt=""
/>

<span>Prashanthi</span>

<FiChevronDown/>

</div>

</div>

</header>

);

}