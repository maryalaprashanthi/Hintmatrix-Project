import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginService from "../../services/LoginService";
import { clearAuthSession } from "../../interceptors/axiosInterceptor";

function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const controller = new AbortController();

    clearAuthSession();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    // Remove the token from the address bar while the profile loads.
    window.history.replaceState(window.history.state, "", window.location.pathname);

    LoginService.getCurrentUser({ signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (!data.userId || !data.email || !data.role) {
          throw new Error("Missing authenticated user profile");
        }
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("name", data.name || "");
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);
        localStorage.setItem("lastUserActivityAt", String(Date.now()));
        navigate(data.role === "GUEST" ? "/course-subscribe" : "/dashboard", {
          replace: true,
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        clearAuthSession();
        navigate("/login", { replace: true });
      });

    return () => controller.abort();
  }, [navigate, searchParams]);

  return <main aria-live="polite">Completing Google sign in...</main>;
}

export default OAuthSuccess;
