import { FiEdit3, FiMail, FiShield, FiUser } from "react-icons/fi";
import { getCurrentUserName } from "../../utils/user";
import "./AccountPages.css";

export default function Profile() {
  const name = getCurrentUserName();
  const email = localStorage.getItem("email") || "Not available";
  const role = (localStorage.getItem("role") || "User").replaceAll("_", " ");
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="account-page">
      <header className="account-page-header">
        <div>
          <span className="account-eyebrow">Account</span>
          <h1>My Profile</h1>
          <p>View your personal information and account access details.</p>
        </div>
        <button className="account-primary-button" type="button">
          <FiEdit3 /> Edit profile
        </button>
      </header>
      <section className="profile-hero-card">
        <div className="profile-avatar">{initials || "U"}</div>
        <div className="profile-identity">
          <h2>{name}</h2>
          <p>{email}</p>
          <span className="role-pill">{role}</span>
        </div>
        <div className="profile-status">
          <span /> Active account
        </div>
      </section>
      <div className="account-grid">
        <section className="account-card account-card-wide">
          <div className="account-card-heading">
            <div>
              <h2>Personal information</h2>
              <p>Your basic account details.</p>
            </div>
            <FiUser />
          </div>
          <div className="details-grid">
            <div>
              <span>Full name</span>
              <strong>{name}</strong>
            </div>
            <div>
              <span>Email address</span>
              <strong>{email}</strong>
            </div>
            <div>
              <span>Phone number</span>
              <strong>Not provided</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>Not provided</strong>
            </div>
          </div>
        </section>
        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <h2>Access</h2>
              <p>Role and permissions.</p>
            </div>
            <FiShield />
          </div>
          <div className="access-summary">
            <span>Current role</span>
            <strong>{role}</strong>
            <p>
              Your permissions are managed by the organization administrator.
            </p>
          </div>
        </section>
        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <h2>Contact</h2>
              <p>Primary communication channel.</p>
            </div>
            <FiMail />
          </div>
          <div className="access-summary">
            <span>Verified email</span>
            <strong>{email}</strong>
            <p>System notifications and account updates are sent here.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
