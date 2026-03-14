import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function ExchangePage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    navigate("/share", { state: location.state, replace: true });
  }, [navigate, location.state]);

  return null;
}
