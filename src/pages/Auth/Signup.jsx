import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import SignupService from "../../services/SignupService";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password show/hide states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    let updatedValue = value;

    // Full Name: allow only letters and spaces
    if (name === "name") {
      updatedValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    // Phone Number: allow only numbers
    if (name === "phoneNumber") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : updatedValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Full Name validation
    if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      setError("Full Name should contain only letters and spaces.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Phone Number validation
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError("Phone Number must contain exactly 10 digits.");
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Terms validation
    if (!formData.termsAccepted) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      await SignupService.register({
        name: formData.name,
        address: formData.address,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      navigate("/login", { state: { signupSuccess: true } });
    } catch (requestError) {
      console.error("Signup failed:", requestError);
      setError(
        requestError.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-container">
        <section className="signup-left">
          <img
            src="/src/assets/hintmatrix-logo.png"
            className="signup-logo"
            alt="HintMatrix Logo"
          />

          <h1>
            Create Your <br />
            <span>HintMatrix</span> Account
          </h1>

          <img
            src="/src/assets/signup-illustration.png"
            className="signup-illustration"
            alt="Student learning"
          />

          <div className="signup-security">
            Your information is securely protected.
          </div>
        </section>

        <section className="signup-right">
          <div className="signup-box">
            <h2>
              Create <span>Account</span>
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="signup-input-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-input-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-input-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength="10"
                />
              </div>

              {/* Password */}
              <div className="signup-input-group">
                <label htmlFor="password">Password</label>

                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: "45px", width: "100%" }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "5px",
                    }}
                  >
                    {showPassword ? "👁" : "🔒"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="signup-input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>

                <div style={{ position: "relative" }}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: "45px", width: "100%" }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "5px",
                    }}
                  >
                    {showConfirmPassword ? "👁" : "🔒"}
                  </button>
                </div>
              </div>

              <label className="signup-terms">
                <input
                  name="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                />

                <span>
                  I agree to the <a href="#terms">Terms &amp; Conditions</a>
                </span>
              </label>

              {error && (
                <div className="signup-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="signup-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="signup-login-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Signup;
