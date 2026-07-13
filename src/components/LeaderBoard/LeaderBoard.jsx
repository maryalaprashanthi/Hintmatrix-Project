import "./LeaderBoard.css";

const leaderboardData = [
  {
    rank: 1,
    name: "Prashanthi (You)",
    score: 5120,
    image: "https://i.pravatar.cc/100?img=47",
    current: true,
  },
  {
    rank: 2,
    name: "Arjun Mehta",
    score: 4820,
    image: "https://i.pravatar.cc/100?img=12",
  },
  {
    rank: 3,
    name: "Sneha Reddy",
    score: 4510,
    image: "https://i.pravatar.cc/100?img=48",
  },
  {
    rank: 4,
    name: "Rohit Sharma",
    score: 4380,
    image: "https://i.pravatar.cc/100?img=15",
  },
  {
    rank: 5,
    name: "Priya Nair",
    score: 4160,
    image: "https://i.pravatar.cc/100?img=32",
  },
];

const medalColor = (rank) => {
  switch (rank) {
    case 1:
      return "#FDBA0A";
    case 2:
      return "#B8BCC7";
    case 3:
      return "#C56A24";
    default:
      return "#ffffff";
  }
};

function LeaderBoard() {
  return (
    <div className="leaderboard-card">
      <div className="leaderboard-header">
        <h3>Leaderboard</h3>
        <span>View All</span>
      </div>

      {leaderboardData.map((user) => (
        <div
          key={user.rank}
          className={`leader-row ${user.current ? "active-user" : ""}`}
        >
          <div
            className="rank-circle"
            style={{ background: medalColor(user.rank) }}
          >
            {user.rank}
          </div>

          <img src={user.image} alt={user.name} />

          <div className="leader-info">
            <h4>{user.name}</h4>
          </div>

          <div className="leader-score">{user.score}</div>
        </div>
      ))}
    </div>
  );
}

export default LeaderBoard;