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
      localStorage.setItem("user", JSON.stringify(loggedInUser)); // Save user data
      toast.success(`Welcome, ${loggedInUser.displayName}!`);
    }
    else{
      toast.error("Google login failed");
    }
  };

  const handleLogout = async () => {
    await logOut();
    setUser(null);
    setRoomId("");  // ✅ Clear the Room ID
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

                {/* Show user info if logged in, otherwise show login button */}
                {user ? (
                  <div className="text-center">
                    {user.photoURL && (  // ✅ Check if photoURL exists before using it
      <img
        src={user.photoURL}
        alt="User Avatar"
        width="50"
        height="50"
        className="rounded-circle"
      />
    )}
                    <h5 className="mt-2">Welcome, {user.displayName}!</h5>
                    <button onClick={joinRoom} className="btn btn-success btn-lg">
                      JOIN
                    </button>
                    <button onClick={handleLogout} className="btn btn-danger btn-lg m-2">
                      Logout
                    </button>
                  </div>
                ) : (
                  <button onClick={handleLogin} className="btn btn-primary btn-lg">
                    Login with Google
                  </button>
                )}

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
