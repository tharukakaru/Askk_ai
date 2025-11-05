import React, { useState, useRef, useEffect } from "react";
import { BsAlignCenter } from "react-icons/bs";
import {
  FaEye,
  FaEyeSlash,
  FaPaperPlane,
  FaMicrophone,
  FaUser,
} from "react-icons/fa";
import { FiPaperclip } from "react-icons/fi";

const App = () => {
  const [screen, setScreen] = useState("welcome");
  const [showSignup, setShowSignup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState("");
  const messagesEndRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // parallax effect for welcome circles
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ensure there's at least one chat when chat screen opens
  useEffect(() => {
    if (screen === "chat" && chats.length === 0) {
      setChats([{ id: Date.now(), title: "New Chat", messages: [] }]);
      setCurrentChatIndex(0);
      setMessages([]);
    }
  }, [screen]);

  // ---------------------- SEND MESSAGE ----------------------
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, user: true, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Update chat state safely
    setChats((prevChats) => {
      const updated = [...prevChats];
      if (!updated[currentChatIndex]) {
        updated[currentChatIndex] = {
          id: Date.now(),
          title:
            userMsg.text.slice(0, 25) +
            (userMsg.text.length > 25 ? "..." : ""),
          messages: [userMsg],
        };
      } else {
        const chat = { ...updated[currentChatIndex] };
        chat.messages = [...(chat.messages || []), userMsg];
        if (
          chat.messages.length === 1 ||
          chat.title === "New Chat"
        ) {
          chat.title =
            userMsg.text.slice(0, 25) +
            (userMsg.text.length > 25 ? "..." : "");
        }
        updated[currentChatIndex] = chat;
      }
      return updated;
    });

    // 🔥 Call backend
    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg.text }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      let data;
      try {
        data = await res.json();
      } catch {
        data = { response: "Invalid JSON response" };
      }

      const aiMsg = {
        text: data.response || "Sorry, no response.",
        user: false,
        ts: Date.now(),
      };

      // Add AI message
      setMessages((prev) => [...prev, aiMsg]);
      setChats((prevChats) => {
        const newChats = [...prevChats];
        const chat = { ...newChats[currentChatIndex] };
        chat.messages = [...(chat.messages || []), aiMsg];
        newChats[currentChatIndex] = chat;
        return newChats;
      });
    } catch (err) {
      console.error(err);
      const errMsg = {
        text: "Error connecting to backend",
        user: false,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------- SIGN-IN ----------------------
  const handleSignIn = () => {
    if (!email || !password) {
      setPopup("Email and password are required");
      setTimeout(() => setPopup(""), 2000);
      return;
    }
    if (email === "user@test.com" && password === "12a4d") {
      setPopup("Login successful");
      setTimeout(() => {
        setPopup("");
        setScreen("chat");
        setChats([{ id: Date.now(), title: "New Chat", messages: [] }]);
        setCurrentChatIndex(0);
        setMessages([]);
        setShowSignup(false);
      }, 700);
    } else {
      setPopup("Incorrect email or password");
      setTimeout(() => setPopup(""), 2000);
    }
  };

  // ---------------------- WELCOME SCREEN ----------------------
  if (screen === "welcome") {
    const circles = [
      { top: "0%", left: "0%", bg: "rgba(59, 131, 246, 0)", duration: 10 },
      { top: "0%", left: "0%", bg: "rgba(59, 131, 246, 0)", duration: 5 },
      { top: "0%", left: "0%", bg: "rgba(250, 204, 21, 0)", duration: 20 },
      { top: "0%", left: "0%", bg: "rgba(250, 204, 21, 0)", duration: 25 },
      { top: "0%", left: "0%", bg: "rgba(7, 29, 65, 0)", duration: 23 },
    ];

    return (
      <div style={styles.welcomePage}>
        <video autoPlay loop muted playsInline style={styles.bgVideo}>
          <source src="/vid1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {circles.map((c, i) => (
          <div
            key={i}
            style={{
              ...styles.glowCircle,
              top: c.top,
              left: c.left,
              background: c.bg,
              animation: `pulseGlow 6s ease-in-out infinite, drift${i} ${c.duration}s ease-in-out infinite alternate`,
              transform: `translate(${mousePos.x * (i + 1) * 0.1}px, ${mousePos.y * (i + 1) * 0.1}px)`,
            }}
          />
        ))}

        <div style={styles.welcomeBox}>
          <h1 style={styles.neonTitle}>Welcome to Askk AI</h1>
          <p style={styles.neonSubtitle}>
            Your Intelligent, Creative Companion.
          </p>

          <div style={{ position: "relative", display: "inline-block" }}>
            <div className="neonButtonBorder" />
            <button
              className="getStartedBtn"
              style={styles.neonButton}
              onClick={() => setShowSignup(true)}
            >
              Get Started →
            </button>
          </div>
        </div>

        {showSignup && (
          <div style={styles.signupOverlay}>
            <div style={styles.signupBox}>
              <h2 style={styles.signupTitle}>Login to Askk AI</h2>

              {popup ? <div style={styles.popup}>{popup}</div> : null}

              <input
                type="email"
                placeholder="Email Address"
                style={styles.signupInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  style={{ ...styles.signupInput, paddingRight: 12 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  style={styles.eyeIcon}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <div
                style={styles.forgot}
                onClick={() => {
                  setPopup("If you forgot your password, contact admin.");
                  setTimeout(() => setPopup(""), 2400);
                }}
              >
                Forgot password?
              </div>

              <button style={styles.signupBtn} onClick={handleSignIn}>
                Login
              </button>

              <div
                style={styles.backBtn}
                onClick={() => setShowSignup(false)}
              >
                ← Back
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------------- CHAT SCREEN ----------------------
  const currentChat = chats[currentChatIndex] || { messages: [] };

  return (
    <div style={styles.chatContainer}>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, width: sidebarOpen ? 240 : 60 }}>
        <div style={styles.sidebarHeader}>
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            style={styles.menuBtn}
          >
            ☰
          </button>
          {sidebarOpen && <h2 style={styles.sidebarTitle}>Askk AI</h2>}
        </div>

        {sidebarOpen && (
          <div style={styles.sidebarContent}>
            <button
              style={styles.newChatBtn}
              onClick={() => {
                const newChats = [
                  ...chats,
                  { id: Date.now(), title: "New Chat", messages: [] },
                ];
                setChats(newChats);
                setCurrentChatIndex(newChats.length - 1);
                setMessages([]);
              }}
            >
              + New Chat
            </button>

            <div style={{ marginTop: 8 }}>
              {chats.map((chat, idx) => (
                <div
                  key={chat.id}
                  style={{
                    ...styles.chatItem,
                    background:
                      idx === currentChatIndex ? "#111827" : "transparent",
                    fontWeight: idx === currentChatIndex ? 700 : 500,
                  }}
                  onClick={() => {
                    setCurrentChatIndex(idx);
                    setMessages(chat.messages || []);
                  }}
                >
                  {chat.title || "Untitled"}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.sidebarUserSection}>
          <div
            style={styles.userButton}
            onClick={() => setShowUserMenu((s) => !s)}
          >
            <div style={styles.avatar}>
              <FaUser style={{ color: "#0b1220", fontSize: 12 }} />
            </div>
            {sidebarOpen && <span style={{ marginLeft: 6 }}>testUser</span>}
          </div>

          {showUserMenu && (
            <div
              style={{
                ...styles.logoutText,
                left: sidebarOpen ? 25 : 70,
              }}
              onClick={() => {
                setScreen("welcome");
                setShowUserMenu(false);
                setMessages([]);
                setChats([]);
                setShowSignup(false);
              }}
            >
              Log out
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={styles.mainArea}>
        <div style={styles.messagesArea}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                alignSelf: m.user ? "flex-end" : "flex-start",
                background: m.user ? "#11182aff" : "#0f0f10ff",
              }}
            >
              {m.text}
            </div>
          ))}

          {isLoading && (
            <div style={styles.typingBubble}>
              <span style={styles.dot} />
              <span style={{ ...styles.dot, animationDelay: "0.15s" }} />
              <span style={{ ...styles.dot, animationDelay: "0.3s" }} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={styles.inputContainer}>
          <div style={styles.inputInner}>
            <label htmlFor="file-upload" style={styles.fileLabel}>
              <FiPaperclip style={styles.fileIcon} />
            </label>
            <input
              id="file-upload"
              type="file"
              style={styles.hiddenFileInput}
              onChange={(e) => {
                if (e.target.files?.length) {
                  setPopup(`📎 ${e.target.files.length} file(s) selected`);
                  setTimeout(() => setPopup(""), 1400);
                }
              }}
            />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={styles.chatInput}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <div style={styles.inputIconsRight}>
              <button
                style={styles.micBtn}
                title="Voice input"
                onClick={() => alert("Voice input coming soon")}
              >
                <FaMicrophone style={{ color: "#fff" }} />
              </button>

              <button
                style={{
                  ...styles.sendBtn,
                  background: input.trim() ? "#335ccf" : "#6b7280",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                }}
                onClick={sendMessage}
                disabled={!input.trim()}
                title="Send"
              >
                <FaPaperPlane style={{ color: "#fff" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------- STYLES ----------------------
const styles = {
  // Welcome
  welcomePage: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    backgroundSize: "800% 800%",
    animation: "gradientBG 15s ease infinite",
    color: "#fff",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  },
  glowCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    filter: "blur(100px)",
  },
  welcomeBox: { zIndex: 10, textAlign: "center" },
  neonTitle: { fontSize: 46, textShadow: "0 0 20px #07672dff, 0 0 40px #070f6dff", marginBottom: 5 },
  neonSubtitle: { fontSize: 14, color: "#CBD5E1", marginBottom: 30 },
  neonButton: {
    position: "relative",
    background: "#000000ff",
    border: "none",
    borderRadius: 40,
    padding: "8px 28px",
    fontSize: 16,
    cursor: "pointer",
    zIndex: 1,
    overflow: "hidden",
    color: "#fff",
  },

  bgVideo: {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: -1, // keeps it behind everything
  filter: "brightness(0.35)", // optional: darken a bit for contrast
  },

  // Sign in (overlay)
  signupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },
  signupBox: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 28,
    width: 360,
    textAlign: "center",
    backdropFilter: "blur(8px)",
    position: "relative",
    boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
  },
  signupTitle: { color: "#fff", marginBottom: 16, fontSize: 20 },
  signupInput: {
    width: "90%",
    padding: "12px 12px",
    marginBottom: 12,
    borderRadius: 8,
    border: "none",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 14,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: "40%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#ffffff",
    fontSize: 18,
  },
  forgot: {
    color: "#676767ff",
    textAlign: "right",
    fontSize: 13,
    marginTop: 0,
    marginBottom: 15,
    marginRight: 10,
    cursor: "pointer",
  },
  signupBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg, #9f6e32ff, #2b8c98ff)",
    border: "none",
    borderRadius: 30,
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  backBtn: { color: "#9FB6E6", marginTop: 12, fontSize: 14, cursor: "pointer" },
  popup: { position: "absolute", top: -48, left: "22%", background: "#ff2f0017", color: "#fff", padding: "8px 10px", borderRadius: 8 },

  // Chat
  chatContainer: { display: "flex", height: "100vh", background: "#020202ff", color: "#fff" },
  sidebar: {
    background: "#04060bff",
    color: "#fff",
    transition: "width 0.25s ease",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: { display: "flex", alignItems: "center", padding: 14, borderBottom: "1px solid rgba(255,255,255,0.03)" },
  menuBtn: { fontSize: 18, color: "#fff", background: "none", border: "none", cursor: "pointer", marginRight: 10 },
  sidebarTitle: { fontSize: 16, fontWeight: 700 },
  sidebarContent: { padding: 10, flex: "none" },
  newChatBtn: { background: "#071022", color: "#fff", border: "none", borderRadius: 6, padding: "10px", marginBottom: 12, cursor: "pointer", width: "100%" },
  chatItem: { padding: "6px 10px", marginBottom: 8, borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 12 },
  sidebarUserSection: { marginTop: "auto", padding: 10, borderTop: "1px solid rgba(255,255,255,0.03)", position: "relative" },
  userButton: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "1px", borderRadius: 8 },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  logoutText: { position: "absolute", bottom: 65, color: "#f87171", fontSize: 14, cursor: "pointer" },

  mainArea: { flex: 1, display: "flex", flexDirection: "column" },
  messagesArea: { flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" },
  message: { padding: "12px 16px", borderRadius: 12, maxWidth: "70%", lineHeight: 1.4, marginLeft: "8%", marginRight: "6%" },
  typingBubble: { background: "#030814ff", borderRadius: 10, padding: 10, display: "flex", gap: 6, width: "fit-content" },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "#93C5FD", animation: "bounce 1s infinite" },

  // input area
  inputContainer: {
    padding: 16,
    borderTop: "1px solid rgba(255,255,255,0.02)",
    background: "#38425d00",
  },
  inputInner: {
    maxWidth: 920,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.03)",
    padding: "10px 12px",
    borderRadius: 999,
  },
  fileLabel: { display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 6, borderRadius: 8, background: "transparent" },
  fileIcon: { fontSize: 18, color: "#93C5FD" },
  hiddenFileInput: { display: "none" },
  chatInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    color: "#fff",
    resize: "none",
    outline: "none",
    fontSize: 14,
    padding: "1px 1px",
    minHeight: 20,
    maxHeight: 120,
  },
  inputIconsRight: { display: "flex", alignItems: "center", gap: 8 },
  micBtn: { width: 36, height: 36, borderRadius: "50%", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  sendBtn: { width: 36, height: 36, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
};

// Insert CSS for animations & small helpers (neon border)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
@keyframes gradientBG { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes pulseGlow { 0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.15);opacity:1;} }
@keyframes drift0 {0%{transform:translate(0px,0px);}100%{transform:translate(40px,30px);} }
@keyframes drift1 {0%{transform:translate(0px,0px);}100%{transform:translate(-30px,20px);} }
@keyframes drift2 {0%{transform:translate(0px,0px);}100%{transform:translate(25px,-20px);} }
@keyframes drift3 {0%{transform:translate(0px,0px);}100%{transform:translate(-35px,-25px);} }
@keyframes drift4 {0%{transform:translate(0px,0px);}100%{transform:translate(20px,35px);} }
@keyframes borderLoop { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes bounce { 0%,100%{transform:translateY(0);opacity:.6} 50%{transform:translateY(-4px);opacity:1} }

/* neon border behind button */
.neonButtonBorder {
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-radius: 40px;
  background: linear-gradient(90deg,#06328aff,#766319ff,#12819dff,#3B82F6);
  z-index: -1;
  background-size: 400% 400%;
  animation: borderLoop 3.5s linear infinite;
}

/* get started text default + hover */
.getStartedBtn { color: #fff; background: transparent; transition: color .22s ease; font-weight:600; padding: 10px 28px; border-radius: 40px; }
.getStartedBtn:hover { color: #144786ff; }
.getStartedBtn:focus { outline: none; }

/* small responsiveness */
@media (max-width: 640px) {
  .neonButtonBorder { display:none; }
  .inputInner { margin: 0 10px; }
}
`;
document.head.appendChild(styleSheet);

export default App;
