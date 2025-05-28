import { useEffect, useContext } from "react";
import { UserContext } from "../UserContext";
import { Navigate } from "react-router-dom";

function Logout() {
  const userContext = useContext(UserContext);
  useEffect(function () {
    const logout = async function () {
      userContext.setUserContext(null);
      const apiUrl = process.env.REACT_APP_API_URL?.trim() || "";
      const res = await fetch(`${apiUrl}/api/user/logout`);
    };
    logout();
  }, []);

  return <Navigate replace to="/login" />;
}

export default Logout;
