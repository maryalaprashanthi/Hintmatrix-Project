import "./Dashboard.css";

import StatsCard from "../components/StatsCard/StatsCard";
import RecentActivity from "../components/RecentActivity/RecentActivity";
import TodayPractice from "../components/TodayPractice/TodayPractice";
import LeaderBoard from "../components/LeaderBoard/LeaderBoard";
import UpcomingTests from "../components/UpcomingTests/UpcomingTests";
import { useEffect, useState } from "react";
import DashboardService from "../services/DashboardService";

function Dashboard() {

  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async () =>
  {
    const response = await DashboardService.getDashboardData();
    const data = await response.data;
    setDashboardData(data);
  }

  const [dashboardData,setDashboardData] = useState({
    totalColleges:null,
    totalBranches:null,
    totalCourses:null,
    totalSections:null
  });

  return (
    <div className="dashboard container-fluid">

      {/* Welcome */}
      <div className="dashboard-header mb-4">
        <div>
          <h1>Welcome to DashBoard👋</h1>
          <p>Welcome back! Here's your learning overview.</p>
        </div>
      </div>

      {/* Institution Statistics */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatsCard type="college" data={dashboardData.totalColleges}/>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <StatsCard type="branch" data={dashboardData.totalBranches}/>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <StatsCard type="sections" data={dashboardData.totalSections}/>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <StatsCard type="course" data={dashboardData.totalCourses} />
        </div>
      </div>

      {/* Learning Statistics */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatsCard type="courses" />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <StatsCard type="practice" />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <StatsCard type="completed" />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <StatsCard type="pending" />
        </div>
      </div>

      {/* Rank & Streak */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <StatsCard type="rank" />
        </div>

        <div className="col-12 col-lg-6">
          <StatsCard type="streak" />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="row g-4 mb-4">

        <div className="col-12 col-xl-6">
          <RecentActivity />
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <TodayPractice />
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <LeaderBoard />
        </div>

      </div>

      {/* Upcoming Tests */}
      <div className="row">
        <div className="col-12">
          <UpcomingTests />
        </div>
      </div>

    </div>
  );
}

export default Dashboard;