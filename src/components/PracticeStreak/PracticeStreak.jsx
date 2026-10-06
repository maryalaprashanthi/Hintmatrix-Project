/* eslint-disable react/prop-types */
import { useId } from "react";
import { FaTrophy, FaBookOpen, FaGraduationCap, FaCheck } from "react-icons/fa";
import "./PracticeStreak.css";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function PracticeStreak({ streakDays = 0, week = [] }) {
  const headingId = useId();
  const streak = String(streakDays).padStart(2, "0");
  return (
    <section className="practice-streak" aria-labelledby={headingId}>
      <div className="practice-streak__heading">
        <h2 id={headingId}>Stay Consistent, Keep Improving!</h2>
        <p>{streakDays > 0
          ? `You are on a ${streak} day practice streak. 🔥`
          : "Practise today to start your streak. 🔥"}</p>
      </div>
      <FaTrophy className="practice-streak__trophy" aria-hidden="true" />
      {week.length === 7 ? (
        <ol className="practice-streak__week" aria-label="Practice this week, Monday to Sunday">
          {week.map((day, index) => {
            const status = day.practiced ? "Practised" : day.future ? "Upcoming" : "Not practised";
            return (
              <li key={day.date} className={`practice-streak__day${day.practiced ? " is-complete" : ""}${day.today ? " is-today" : ""}${day.future ? " is-future" : ""}`}
                aria-current={day.today ? "date" : undefined}
                aria-label={`${weekdays[index]}, ${day.date}: ${status}${day.today ? ", today" : ""}`} title={`${day.date} · ${status}`}>
                <span className="practice-streak__circle" aria-hidden="true">{day.practiced && <FaCheck />}</span>
                <span className="practice-streak__label">{weekdays[index]}</span>
              </li>
            );
          })}
        </ol>
      ) : <p className="practice-streak__unavailable">Refresh the dashboard to load this week&apos;s practice days.</p>}
      <div className="practice-streak__art" aria-hidden="true"><FaBookOpen /><FaGraduationCap /></div>
    </section>
  );
}
export default PracticeStreak;
