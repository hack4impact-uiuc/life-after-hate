import { useEffect } from "react";
import { connect } from "react-redux";
import { logout, refreshGlobalAuth } from "../../utils/api";
import { purgeGlobalAuthState } from "../../utils/apiHelpers";

export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
function SessionGuard({ authenticated }) {
  useEffect(() => {
    if (!authenticated) return;
    let lastActivity = Date.now();
    let locked = false;
    const check = () => {
      if (!locked && Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        locked = true;
        // Hide private data immediately, even if the network is unavailable.
        purgeGlobalAuthState();
        logout().catch(() => {});
      }
      return locked;
    };
    const activity = () => {
      if (!check()) lastActivity = Date.now();
    };
    const visible = () => {
      if (document.visibilityState === "visible" && !check())
        refreshGlobalAuth();
    };
    const timer = setInterval(check, 1000);
    const refresh = setInterval(
      () => {
        if (!check()) refreshGlobalAuth();
      },
      5 * 60 * 1000,
    );
    for (const event of ["pointerdown", "keydown"])
      window.addEventListener(event, activity);
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      clearInterval(refresh);
      for (const event of ["pointerdown", "keydown"])
        window.removeEventListener(event, activity);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [authenticated]);
  return null;
}
export default connect((state) => ({
  authenticated: state.auth.authenticated,
}))(SessionGuard);
