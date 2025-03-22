import React from "react";
import { signInWithGoogle, logOut } from "../firebaseConfig";

const Login = ({ user, setUser }) => {
  const handleLogin = async () => {
    const result = await signInWithGoogle();
    if (result) {
      setUser(result);
      localStorage.setItem("user", JSON.stringify(result));
    }
  };

  const handleLogout = async () => {
    await logOut();
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <div>
      {user ? (
        <div>
          <img src={user.photoURL} alt="Profile" width="40" height="40" />
          <p>Welcome, {user.displayName}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Sign in with Google</button>
      )}
    </div>
  );
};

export default Login;
