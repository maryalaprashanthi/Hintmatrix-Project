import "./InfoCard.css";

function InfoCard({ icon, title, value, subtitle }) {
  return (
    <div className="info-card">

      <div className="info-icon">
        {icon}
      </div>

      <div className="info-content">
        <h4>{title}</h4>

        <h2>{value}</h2>

        <p>{subtitle}</p>
      </div>

    </div>
  );
}

export default InfoCard;