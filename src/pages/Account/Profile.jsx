import { useEffect, useState } from "react";
import { FiBookOpen, FiShield, FiUser, FiUsers } from "react-icons/fi";
import UserService from "../../services/UserService";
import "./AccountPages.css";

const valueOf = (value) => value == null || value === "" ? "Not provided" : String(value);
const dateOf = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
};
const assignment = (name, id) => name
  ? `${name}${id != null ? ` (ID: ${id})` : ""}`
  : id != null ? `ID: ${id}` : "Not assigned";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProfile(null);
    setImageFailed(false);
    UserService.getMyProfile()
      .then(({ data }) => {
        if (!data?.userId) throw new Error("Profile is unavailable.");
        if (active) setProfile(data);
      })
      .catch(() => {
        if (active) setError("Unable to load your profile. Please try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  const name = profile?.name || "User";
  const role = (profile?.role || "User").replaceAll("_", " ");
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]).join("").toUpperCase();
  const isStudent = profile?.role === "STUDENT";
  const isAdmin = ["SUPER_ADMIN", "COLLEGE_ADMIN", "BRANCH_ADMIN"].includes(profile?.role);
  const status = profile?.activeRow === true ? "Active" : profile?.activeRow === false ? "Inactive" : "Not available";
  const sections = profile ? [
    {
      title: "Personal information", description: "Your saved personal and contact details.", icon: <FiUser />,
      fields: [
        ["User ID", profile.userId], ["Full name", profile.name],
        ["Email address", profile.email], ["Phone number", profile.phoneNumber],
        ["Address", profile.address],
        ...((isAdmin || profile.designation || profile.employeeId != null) ? [
          ["Designation", profile.designation], ["Employee ID", profile.employeeId],
        ] : []),
        ...((isStudent || profile.studentCode != null) ? [["Student ID", profile.studentCode]] : []),
      ],
    },
    {
      title: "Organization", description: "Your assigned institution and learning group.", icon: <FiBookOpen />,
      fields: [
        ["College", assignment(profile.collegeName, profile.collegeId)],
        ["Branch", assignment(profile.branchName, profile.branchId)],
        ["Course", assignment(profile.courseName, profile.courseId)],
        ["Section", assignment(profile.sectionName, profile.sectionId)],
      ],
    },
    ...((isStudent || profile.guardianName || profile.guardianPhoneNumber) ? [{
      title: "Guardian information", description: "Your saved guardian contact details.", icon: <FiUsers />,
      fields: [["Guardian name", profile.guardianName], ["Guardian phone number", profile.guardianPhoneNumber]],
    }] : []),
    {
      title: "Account details", description: "Account access and activity. View only.", icon: <FiShield />,
      fields: [
        ["Role", role], ["Role ID", profile.roleId], ["Account status", status],
        ["Login type", profile.loginType?.replaceAll("_", " ")],
        ["Weekly study goal", profile.weeklyStudyGoalHours != null ? `${profile.weeklyStudyGoalHours} hours` : null],
        ["Last login", dateOf(profile.lastLoginAt)],
        ["Created on", dateOf(profile.createdAt)], ["Updated on", dateOf(profile.updatedAt)],
      ],
    },
  ] : [];

  return (
    <main className="account-page">
      <header className="account-page-header">
        <div>
          <span className="account-eyebrow">Account</span>
          <h1>My Profile</h1>
          <p>View your personal information and account access details.</p>
        </div>
      </header>
      {loading && <div className="account-card" role="status">Loading your profile...</div>}
      {error && (
        <div className="alert alert-danger" role="alert">
          <p>{error}</p>
          <button className="btn btn-outline-danger" type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button>
        </div>
      )}
      {profile && <>
        <section className="profile-hero-card">
          <div className="profile-avatar">
            {profile.profilePicture && !imageFailed
              ? <img src={profile.profilePicture} alt={`${name}'s profile`} onError={() => setImageFailed(true)} />
              : initials || "U"}
          </div>
          <div className="profile-identity">
            <h2>{name}</h2><p>{valueOf(profile.email)}</p><span className="role-pill">{role}</span>
          </div>
          <div className={`profile-status${profile.activeRow === false ? " profile-status-inactive" : profile.activeRow == null ? " profile-status-unknown" : ""}`}>
            <span /> {status}{profile.activeRow != null ? " account" : ""}
          </div>
        </section>
        <div className="account-grid">
          {sections.map((section) => (
            <section className="account-card account-card-wide" key={section.title}>
              <div className="account-card-heading">
                <div><h2>{section.title}</h2><p>{section.description}</p></div>
                {section.icon}
              </div>
              <dl className="details-grid profile-details">
                {section.fields.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{valueOf(value)}</dd></div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </>}
    </main>
  );
}
