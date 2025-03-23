import "./Home.css";
import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, logOut } from "../firebaseConfig";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data from localStorage on page refresh
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async () => {
    const loggedInUser = await signInWithGoogle();
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      toast.success(`Welcome, ${loggedInUser.displayName}!`);
    } else {
      toast.error("Google login failed");
    }
  };

  const handleLogout = async () => {
    await logOut();
    setUser(null);
    setRoomId(""); // ✅ Clear the Room ID
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
  };

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid().slice(0, 16);
    setRoomId(id);
    toast.success("Room ID generated!");
  };

  const joinRoom = () => {
    if (!roomId || !user) {
      toast.error("Login and Room ID are required!");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: { 
        username: user.displayName, 
        email: user.email, // ✅ Use email as a unique identifier
        uid: user.uid, // ✅ Firebase UID is always unique
        avatar: user.photoURL 
      },
    });

    toast.success("Room joined successfully!");
  };

  return (
    <div className="container-fluid">
      <div className="logo">
        <img src="/images/logo5.jpg" alt="logo" />
      </div>
      <div className="Footer">
        <p className="header-text">"Where Coders Connect & Ideas Flow"</p>
      </div>

      <div className="full-container">
        <div className="left-image-container">
          <img src="/images/main.png" alt="Left Side" className="left-image" />
        </div>

        <div className="right-aligned-content">
          <div className="card shadow-sm mb-5 new_name1">
            <div className="card-body new_name">
              <div className="flex-grow-1">
                
                {/* ✅ Message displayed before login */}
                {!user && (
                  <p className="text-center text-danger fw-bold">
                    You can enter a room only after login.
                  </p>
                )}

                {/* ✅ Show Login Button First */}
                {!user ? (
                  <button onClick={handleLogin} className="g-login btn btn-primary btn-lg">
                  <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  <span>Login with Google</span>
                </button>
                ) : (
                  <div className="text-center">
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt="User Avatar"
                        width="50"
                        height="50"
                        className="rounded-circle"
                      />
                    )}
                    <h5 className="mt-2">Welcome, {user.displayName}!</h5>
                    <button onClick={handleLogout} className="g-logut btn btn-danger btn-sm m-2">
                      Logout
                    </button>
                  </div>
                )}

                {/* ✅ Show Room Input & Join Button Only After Login */}
                {user && (
                  <>
                    <h4 className="card-title mb-4">Enter the ROOM ID</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="form-control mb-3"
                        placeholder="ROOM ID"
                      />
                    </div>

                    <button onClick={joinRoom} className="btn btn-success btn-lg">
                      JOIN
                    </button>
                    <p className="mt-3 text-dark">
                      Don't have a room ID? Create{" "}
                      <span
                        onClick={generateRoomId}
                        className="text-success p-2"
                        style={{ cursor: "pointer" }}
                      >
                        New Room
                      </span>
                    </p>
                  </>
                )}
              </div>

              <div className="image-container">
                <img className="right-image" src="/images/main1.png" alt="Right" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
