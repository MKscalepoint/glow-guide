import { useState, useRef, useEffect } from "react";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: `Annyeong! 🌸 Welcome to **Glow Guide** — your personal skincare companion!

I'm here to help you with everything from building your first routine to figuring out which actives play nice together (and which ones *really* don't 😅).

Here's what I can help with:
- 🧴 **Routine building** — morning, evening, beginner to advanced
- ⚗️ **Ingredient compatibility** — what to layer, what to avoid mixing
- 🌿 **K-beauty deep dives** — the brands and products worth the hype
- 🔍 **Ingredient decoder** — what does that 10-syllable ingredient actually do?
- 💸 **Honest reviews** — hype vs. real results

To get started, you could tell me:
- Your skin type and main concerns
- Products you're currently using
- Or just ask me anything!

What's on your skincare mind today? ✨`
};

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#e8a4c0",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const formatContent = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
      const isBullet = line.trim().startsWith("- ");
      const isNumbered = /^\d+\./.test(line.trim());
      if (isBullet) {
        return <li key={i} style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: line.trim().slice(2) }} />;
      }
      if (isNumbered) {
        return <li key={i} style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: line.trim().replace(/^\d+\.\s*/, '') }} />;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} style={{ margin: "2px 0" }} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      animation: "fadeSlideIn 0.3s ease forwards"
    }}>
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #f9c5d1, #c5e8d1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0, marginRight: 10, marginTop: 4,
          boxShadow: "0 2px 8px rgba(232,164,192,0.4)"
        }}>🌸</div>
      )}
      <div style={{
        maxWidth: "72%",
        background: isUser
          ? "linear-gradient(135deg, #f9a8c9, #f0c5e0)"
          : "rgba(255,255,255,0.92)",
        color: isUser ? "#fff" : "#4a3f4a",
        padding: "12px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        boxShadow: isUser
          ? "0 4px 15px rgba(249,168,201,0.4)"
          : "0 4px 15px rgba(0,0,0,0.06)",
        fontSize: 15,
        lineHeight: 1.6,
        backdropFilter: "blur(10px)",
        border: isUser ? "none" : "1px solid rgba(232,164,192,0.2)"
      }}>
        {isUser ? (
          <p style={{ margin: 0 }}>{msg.content}</p>
        ) : (
          <div style={{ listStylePosition: "inside" }}>
            {formatContent(msg.content)}
          </div>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Can I use vitamin C and niacinamide together?",
  "Build me a K-beauty beginner routine",
  "Is retinol safe to use every night?",
  "What's the layering order for my products?",
  "Decode: Snail Secretion Filtrate",
  "Is COSRX Snail Mucin worth the hype?",
];

export default function GlowGuide() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Sorry, something went wrong! Try again 🌸";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Connection hiccup 🌿 Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #fdf0f5 0%, #f0f8f4 40%, #f5f0fd 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 0 0 0",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        textarea:focus { outline: none; }
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #f9c5d1; border-radius: 4px; }
        .suggestion-chip:hover {
          background: linear-gradient(135deg, #f9a8c9, #c5e8d1) !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(249,168,201,0.4) !important;
        }
      `}</style>

      {/* Decorative blobs */}
      <div style={{ position: "fixed", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,197,209,0.3), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(197,232,209,0.3), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "40%", left: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(213,197,232,0.25), transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{
        width: "100%",
        maxWidth: 720,
        padding: "24px 24px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg, #f9c5d1 0%, #c5e8d1 50%, #d5c5f0 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, boxShadow: "0 4px 15px rgba(249,197,209,0.5)",
            animation: "float 4s ease-in-out infinite"
          }}>✨</div>
          <div>
            <div style={{
              fontSize: 26,
              fontWeight: "bold",
              background: "linear-gradient(135deg, #d4748a, #7ab5a0, #9b7ac4)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 4s linear infinite",
              letterSpacing: "-0.5px"
            }}>Glow Guide</div>
            <div style={{ fontSize: 12, color: "#b89aaa", letterSpacing: "0.5px", fontFamily: "system-ui, sans-serif" }}>your skincare companion ✿</div>
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.7)",
          borderRadius: 20,
          padding: "6px 14px",
          fontSize: 12,
          color: "#c47a9a",
          fontFamily: "system-ui, sans-serif",
          border: "1px solid rgba(249,197,209,0.4)",
          backdropFilter: "blur(10px)"
        }}>🌿 K-beauty & beyond</div>
      </header>

      {/* Chat area */}
      <main style={{
        flex: 1,
        width: "100%",
        maxWidth: 720,
        padding: "20px 24px",
        overflowY: "auto",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 220px)",
        overflowX: "hidden"
      }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #f9c5d1, #c5e8d1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0, marginRight: 10,
              boxShadow: "0 2px 8px rgba(232,164,192,0.4)"
            }}>🌸</div>
            <div style={{
              background: "rgba(255,255,255,0.92)",
              padding: "12px 16px",
              borderRadius: "18px 18px 18px 4px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
              border: "1px solid rgba(232,164,192,0.2)"
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{
          width: "100%", maxWidth: 720,
          padding: "0 24px 12px",
          display: "flex", flexWrap: "wrap", gap: 8
        }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)} style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(232,164,192,0.4)",
              borderRadius: 20,
              padding: "7px 14px",
              fontSize: 12,
              color: "#c47a9a",
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
              transition: "all 0.2s ease",
              backdropFilter: "blur(8px)"
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        width: "100%", maxWidth: 720,
        padding: "12px 24px 28px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          background: "rgba(255,255,255,0.9)",
          borderRadius: 24,
          padding: "12px 12px 12px 20px",
          boxShadow: "0 4px 24px rgba(232,164,192,0.2), 0 1px 4px rgba(0,0,0,0.04)",
          border: "1.5px solid rgba(249,197,209,0.5)",
          backdropFilter: "blur(12px)",
          gap: 10
        }}>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Ask about ingredients, routines, products…"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 15,
              color: "#4a3f4a",
              fontFamily: "system-ui, -apple-system, sans-serif",
              lineHeight: 1.5,
              maxHeight: 120,
              overflow: "auto",
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40,
              borderRadius: "50%",
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #f9a8c9, #9bc4b0)"
                : "rgba(232,164,192,0.2)",
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
              transition: "all 0.2s ease",
              flexShrink: 0,
              boxShadow: input.trim() && !loading ? "0 4px 12px rgba(249,168,201,0.4)" : "none",
              transform: input.trim() && !loading ? "scale(1)" : "scale(0.9)"
            }}
          >
            {loading ? "🌸" : "→"}
          </button>
        </div>
        <p style={{
          textAlign: "center", fontSize: 11,
          color: "#c4aab8", marginTop: 8,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "0.3px"
        }}>Glow Guide gives general skincare guidance — always patch test new products 🌿</p>
      </div>
    </div>
  );
}
