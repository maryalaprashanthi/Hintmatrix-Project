import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

import SignupService from "../../services/SignupService";
import { PASSWORD_HELP, signupFieldErrors } from "../../utils/signupValidation";
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
  const [touched, setTouched] = useState({});
  const fieldErrors = signupFieldErrors(formData);
  const handleBlur = (event) => setTouched((current) => ({ ...current, [event.target.name]: true }));

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
    if (isSubmitting) return;
    setTouched({ email: true, password: true, confirmPassword: true });
    setError("");
    if (Object.keys(fieldErrors).length) return;

    // Full Name validation
    if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      setError("Full Name should contain only letters and spaces.");
      return;
    }
    if (!formData.address.trim()) {
      setError("Address is required.");
      return;
    }

    // Phone Number validation
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError("Phone Number must contain exactly 10 digits.");
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
        email: formData.email.trim(),
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

            <form onSubmit={handleSubmit} noValidate>
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
                  autoComplete="email"
                  onBlur={handleBlur}
                  aria-invalid={Boolean(touched.email && fieldErrors.email)}
                  aria-describedby={touched.email && fieldErrors.email ? "signup-email-error" : undefined}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {touched.email && fieldErrors.email && (
                  <p id="signup-email-error" className="signup-field-error" role="alert">{fieldErrors.email}</p>
                )}
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
                    autoComplete="new-password"
                    onBlur={handleBlur}
                    aria-invalid={Boolean(touched.password && fieldErrors.password)}
                    aria-describedby={touched.password && fieldErrors.password ? "signup-password-error" : "signup-password-help"}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: "45px", width: "100%" }}
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password ? (
                  <p id="signup-password-error" className="signup-field-error" role="alert">{fieldErrors.password}</p>
                ) : <p id="signup-password-help" className="signup-field-help">{PASSWORD_HELP}</p>}
              </div>

              {/* Confirm Password */}
              <div className="signup-input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>

                <div style={{ position: "relative" }}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    onBlur={handleBlur}
                    aria-invalid={Boolean(touched.confirmPassword && fieldErrors.confirmPassword)}
                    aria-describedby={touched.confirmPassword && fieldErrors.confirmPassword ? "signup-confirm-error" : undefined}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: "45px", width: "100%" }}
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    aria-pressed={showConfirmPassword}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p id="signup-confirm-error" className="signup-field-error" role="alert">{fieldErrors.confirmPassword}</p>
                )}
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
