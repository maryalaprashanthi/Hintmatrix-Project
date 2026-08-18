import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaUsers, FaArrowRight } from "react-icons/fa";

import "./Subscription.css";

function Subscription() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid subscription-page">
      {/* ================= HEADER ================= */}

      <div className="subscription-header">
        <div className="subscription-title">
          <div className="subscription-icon">
            <FaCreditCard />
          </div>

          <div>
            <h2>Subscription Management</h2>

            <p>Create, organize and manage subscription plans.</p>
          </div>
        </div>
      </div>

      {/* ================= SUBSCRIPTION CARDS ================= */}

      <div className="row">
        {/* ================= SUBSCRIPTION PLANS ================= */}

        <div className="col-12 col-md-6 col-lg-4 mb-4">
          <div className="subscription-card">
            {/* IMAGE / ICON AREA */}
            <div className="subscription-banner">
              <div className="subscription-banner-icon">
                <FaCreditCard />
              </div>
            </div>

            {/* CONTENT */}
            <div className="subscription-content">
              <h4>Subscription Plans</h4>

              <p className="subscription-description">
                Create and manage all subscription plans.
              </p>

              <div className="subscription-details">
                <div>
                  <FaCreditCard />
                  <span>Manage Plans</span>
                </div>

                <div>
                  <FaUsers />
                  <span>Plan Access</span>
                </div>
              </div>

              {/* BUTTON */}
              <button
                className="subscription-btn"
                onClick={() => navigate("/subscriptions/plans")}
              >
                <span>View Plans</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* ================= SUBSCRIPTION PERMISSIONS ================= */}

        <div className="col-12 col-md-6 col-lg-4 mb-4">
          <div className="subscription-card">
            {/* IMAGE / ICON AREA */}
            <div className="subscription-banner">
              <div className="subscription-banner-icon">
                <FaUsers />
              </div>
            </div>

            {/* CONTENT */}
            <div className="subscription-content">
              <h4>Subscription Permissions</h4>

              <p className="subscription-description">
                Manage subscription access and permissions.
              </p>

              <div className="subscription-details">
                <div>
                  <FaUsers />
                  <span>User Access</span>
                </div>

                <div>
                  <FaCreditCard />
                  <span>Subscription Access</span>
                </div>
              </div>

              {/* BUTTON */}
              <button
                className="subscription-btn"
                onClick={() => navigate("/subscriptions/permissions")}
              >
                <span>View Permissions</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subscription;
