import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginService from "../../services/LoginService";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      setError("");

      const response = await LoginService.login(loginData);

      console.log("Login response:", response.data);

      // Save JWT
      localStorage.setItem("token", response.data.token);

      // Save logged-in user details
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("role", response.data.role);

      // Go to your existing dashboard
      navigate("/dashboard");

    } catch (error) {

      console.error("Login failed:", error);

      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* LEFT SIDE */}

        <div className="login-left">

          <h1>
            Welcome to HINTMATRIX
          </h1>

          <p>
            Learn • Practice • Excel
            <br />
            <br />
            An AI Powered Learning Platform for Accounting Students.
          </p>

        </div>


        {/* RIGHT SIDE */}

        <div className="login-right">

          <div className="login-box">

            <h2>Login</h2>

            <p>
              Sign in to continue learning
            </p>

            <form onSubmit={handleLogin}>

              <div className="login-input-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={loginData.email}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="login-input-group">

                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={loginData.password}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="login-options">

                <label>
                  <input type="checkbox" />
                  {" "}Remember Me
                </label>

                <a href="#">
                  Forgot Password?
                </a>

              </div>


              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}


              <button
                type="submit"
                className="login-btn"
              >
                Login
              </button>

            </form>


            <div className="login-register">

              New User?{" "}

              <a href="#">
                Register Here
              </a>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;