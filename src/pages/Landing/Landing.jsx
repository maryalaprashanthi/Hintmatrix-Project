import { Link } from "react-router-dom";
import "./style.css";
import "./responsive.css";

function Landing() {
  return (
    <div className="landing-page">
      {/* ================= HEADER ================= */}

      <header>
        <nav className="navbar">
          <div className="logo">
            <a href="/">
              <img src="/images/logo.png" alt="HintMatrix Logo" />
            </a>
          </div>

          <div className="menu-toggle">☰</div>

          <div className="nav-menu">
            <ul className="nav-links">
              <li>
                <a href="/">Home</a>
              </li>

              <li>
                <a href="#about">About</a>
              </li>

              <li>
                <a href="#courses">Courses</a>
              </li>

              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>

            <div className="nav-buttons">
              <Link to="/login" className="login-btn">
                Login
              </Link>

              <Link to="/signup" className="signup-btn">
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Learn Smarter with <span>HINTMATRIX</span>
            </h1>

            <p>
              We Challenge You
              <br />
              to Build an Unstoppable Habit of
              <br />
              <span>Learning, Practicing & Achieving..</span>
            </p>

            <p>
              Experience the joy of practicing accounting descriptive questions
              with the magic of HintMatrix App
            </p>

            <div className="hero-buttons">
              <a href="#" className="primary-btn">
                Get Started
              </a>

              <a href="#courses" className="secondary-btn">
                Explore Courses
              </a>
            </div>
          </div>

          <div className="hero-image">
            <img src="/images/hero.png" alt="Student Learning" />
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}

      <section id="about" className="about">
        <div className="about-container">
          <div className="about-image">
            <img src="/images/about.png" alt="About HINTMATRIX" />
          </div>

          <div className="about-content">
            <h2>About HINTMATRIX</h2>

            <p>
              HINTMATRIX is an AI-powered learning platform designed to make
              accounting practice simple, interactive, and engaging. Instead of
              directly showing answers, students receive step-by-step hints that
              help them think, learn, and solve problems independently.
            </p>

            <div className="about-cards">
              <div className="card">
                <h3>🎯 Our Mission</h3>

                <p>
                  Empower every student with intelligent learning tools that
                  improve confidence and problem-solving skills.
                </p>
              </div>

              <div className="card">
                <h3>🚀 Our Vision</h3>

                <p>
                  Build the most trusted AI learning platform for accounting
                  education across schools and colleges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section id="features" className="features">
        <h2>Why Choose HINTMATRIX?</h2>

        <p className="section-description">
          Discover a smarter and more engaging way to practice accounting with
          interactive learning designed for students.
        </p>

        <div className="feature-container">
          <div className="feature-card">
            <h3>📚 Step-by-Step Learning</h3>
            <p>
              Learn concepts gradually with guided practice that improves
              understanding and confidence.
            </p>
          </div>

          <div className="feature-card">
            <h3>📈 Progress Tracking</h3>
            <p>
              Keep track of your learning journey and monitor your improvement
              over time.
            </p>
          </div>

          <div className="feature-card">
            <h3>⚡ Instant Evaluation</h3>
            <p>
              Receive immediate feedback on your answers to identify strengths
              and areas for improvement.
            </p>
          </div>

          <div className="feature-card">
            <h3>🎓 Student-Friendly Platform</h3>
            <p>
              Designed for Intermediate, CBSE Class 11 & 12, and CA Foundation
              students with an easy-to-use interface.
            </p>
          </div>
        </div>
      </section>

      {/* ================= COURSES ================= */}

      <section id="courses" className="courses">
        <div className="section-title">
          <h2>Courses Offered</h2>

          <p>
            Explore our accounting courses designed for different educational
            boards and academic levels.
          </p>
        </div>

        <div className="courses-image">
          <img src="/images/Courses.png" alt="Courses Offered" />
        </div>

        <div className="middle-image">
          <img src="/images/boards.png" alt="HintMatrix" />

          <p>
            Our Chapters of Jr.Inter and Sr.Inter Covers the Accounting Syllabus
            of the following Boards.
          </p>
        </div>
      </section>

      {/* ================= PRACTICE ================= */}

      <section id="practice" className="practice">
        <div className="section-title">
          <h2>How to Practice questions in HintMatrix?</h2>

          <p>Practice accounting in an interactive and engaging way.</p>
        </div>

        <div className="practice-images">
          <img src="/images/step1.png" alt="Practice Step 1" />

          <img src="/images/step2.png" alt="Practice Step 2" />

          <img src="/images/step3.png" alt="Practice Step 3" />
        </div>
      </section>

      {/* ================= BANNERS ================= */}

      <section className="slider-section">
        <div className="slider">
          <button className="prev">&#10094;</button>

          <div className="slides">
            <div className="slide active">
              <img src="/images/banner1.png" alt="Banner 1" />

              <div className="slide-content">
                <h1>
                  Get <span>Addicted</span>
                  <br />
                  to <span>Education</span>
                  <br />& Practice
                </h1>

                <p>
                  Practicing Accounting questions by click makes learning
                  engaging, enjoyable and hassle-free.
                </p>
              </div>
            </div>
          </div>

          <button className="next">&#10095;</button>
        </div>

        <div className="dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </section>

      {/* ================= CONTACT ================= */}

      <section id="contact" className="contact">
        <div className="section-title">
          <h2>Contact Us</h2>

          <p>Have questions? We'd love to hear from you.</p>
        </div>

        <div className="contact-container">
          <div className="contact-info">
            <h3>Get in Touch</h3>

            <p>
              <strong>📍 Address</strong>
              <br />
              11-5-416/1/B, Red Hills, Lakdikapool, Hyderabad - 500004
            </p>

            <p>
              <strong>📞 Phone</strong>
              <br />
              +91 9949816612
            </p>

            <p>
              <strong>📧 Email</strong>
              <br />
              helpbyhm@gmail.com
            </p>
          </div>

          <div className="contact-form">
            <form>
              <input type="text" placeholder="Your Name" required />

              <input type="email" placeholder="Your Email" required />

              <input type="text" placeholder="Subject" />

              <textarea rows="6" placeholder="Your Message" />

              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
