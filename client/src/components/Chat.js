import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./Chat.css";

// Utility function to generate consistent colors based on username
const getRandomColor = (username) => {
  const colors = [
    '#4299E1', '#48BB78', '#9F7AEA', '#ED64A6', '#ECC94B',
    '#F56565', '#667EEA', '#38B2AC'
  ];
  const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

// Letter Avatar Component
const LetterAvatar = ({ username }) => {
  const firstLetter = username.charAt(0).toUpperCase();
  const backgroundColor = getRandomColor(username);
  
  return (
    <div 
      className="avatar"
      style={{
        backgroundColor,
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '600',
        fontSize: '12px'
      }}
    >
      {firstLetter}
    </div>
  );
};

const ChatBox = ({ roomId, username }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log(`🔹 ChatBox Loaded - Username: ${username}, Room ID: ${roomId}`);

    const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket", "polling"], // Ensure compatibility
        reconnection: true,
        reconnectionAttempts: Infinity,
      });

      socketRef.current.on("connect", () => {
        console.log("🟢 Connected to chat server");
        socketRef.current.emit("JOIN_CHAT", { roomId, username });
      });

      // Load Chat History
      socketRef.current.on("CHAT_HISTORY", (history) => {
        console.log("📜 Loading chat history:", history);
        setMessages(history.map(msg => ({
          ...msg,
          isSystemMessage: msg.username === "System"
        })));
      });

      // Receive New Messages
      socketRef.current.on("RECEIVE_MESSAGE", (data) => {
        console.log("📩 New message received:", data);
        setMessages(prev => [...prev, {
          username: data.username,
          message: data.message,
          timestamp: data.timestamp,
          isSystemMessage: data.username === "System"
        }]);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Connection error:", error);
      });
    }

    // Cleanup when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("LEAVE_CHAT", { roomId, username });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, username]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && socketRef.current) {
      const messageData = {
        roomId,
        username,
        message: messageInput.trim(),
        timestamp: new Date().toLocaleTimeString(),
      };
      console.log("📤 Sending message:", messageData);
      socketRef.current.emit("SEND_MESSAGE", messageData);
      setMessageInput("");
    }
  };

  return (
    <div className="chatbox-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message-item ${msg.isSystemMessage ? "system-message-wrapper" : (msg.username === username ? "sent" : "received")}`}>
            {msg.isSystemMessage ? (
              <div className="system-message">
                <span className="system-text">{msg.message}</span>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
            ) : (
              <>
                <div className="message-header">
                  <div className="user-info">
                    <LetterAvatar username={msg.username} />
                    <span className="username">{msg.username}</span>
                  </div>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
                <div className="message-content">{msg.message}</div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-form">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
          autoFocus
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
