import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  const hasCheckedAuth = useAuthStore((s) => s.hasCheckedAuth);
  const location = useLocation();

  if (!hasCheckedAuth) return null;

  useEffect(() => {
    if (hasCheckedAuth && !user) alert("로그인이 필요한 서비스입니다.");
  }, [hasCheckedAuth, user]);

  if (!user) return <Navigate to="/" replace state={{ from: location }} />;

  return children;
}
