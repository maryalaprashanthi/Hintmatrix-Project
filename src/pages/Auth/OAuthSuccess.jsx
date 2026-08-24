import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    navigate("/dashboard", { replace: true });
  }, [navigate, searchParams]);

  return <main aria-live="polite">Completing Google sign in...</main>;
}

export default OAuthSuccess;
