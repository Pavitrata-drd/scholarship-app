import React, { useState } from "react";

const botReplies = [
  {
    keywords: ["apply", "application", "how apply", "submit"],
    reply: "Open Scholarships page, choose a scholarship, then click Apply and fill the form.",
  },
  {
    keywords: ["login", "sign in", "student login", "cannot login", "cant login"],
    reply: "Use Student Login in the top-right. If login fails, check email/password and try again.",
  },
  {
    keywords: ["register", "signup", "sign up", "new account", "create account"],
    reply: "Go to Register page, complete your details, then sign in using your registered credentials.",
  },
  {
    keywords: ["deadline", "last date", "closing date", "when due"],
    reply: "Each scholarship has its own deadline. Please open that scholarship card to see the exact last date.",
  },
  {
    keywords: ["documents", "required documents", "upload", "certificate", "proof"],
    reply: "Common documents: ID proof, marksheets, income certificate, and Aadhaar. Upload clear files.",
  },
  {
    keywords: ["eligibility", "am i eligible", "criteria", "requirements"],
    reply: "Eligibility depends on marks, income, category, and course. Check the scholarship details section.",
  },
  {
    keywords: ["status", "track", "application status", "approved", "rejected", "pending"],
    reply: "You can check your application status from the Student Dashboard or Student Profile page.",
  },
  {
    keywords: ["otp", "captcha", "aadhaar", "verification"],
    reply: "Enter valid Aadhaar, click Get OTP, type the OTP and captcha correctly, then submit.",
  },
  {
    keywords: ["admin", "admin login", "dashboard", "manage"],
    reply: "Admins can sign in using the Admin button and manage applications, students, and scholarships.",
  },
  {
    keywords: ["help", "support", "contact", "problem", "issue"],
    reply: "For help, share your issue clearly (login/apply/document/status). I will guide you step by step.",
  },
];

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function getBotReply(text) {
  const question = normalizeText(text);
  let bestScore = 0;
  let bestReply = "";

  botReplies.forEach((item) => {
    const score = item.keywords.reduce((total, keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return question.includes(normalizedKeyword) ? total + 1 : total;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestReply = item.reply;
    }
  });

  if (bestScore > 0) return bestReply;
  return null;
}

export default function ChatbotWidget() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I am Comet. Ask me anything about scholarships." },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const fallbackReplies = [
    "I can help with scholarships, login, registration, documents, and status. Try asking one of these.",
    "Please ask in this format: 'How to apply?', 'What documents are needed?', or 'How to check status?'.",
    "I did not fully catch that. Ask about: apply, deadline, eligibility, OTP/captcha, or admin dashboard.",
  ];

  const getFallbackReply = () => {
    const reply = fallbackReplies[fallbackIndex];
    setFallbackIndex((prev) => (prev + 1) % fallbackReplies.length);
    return reply;
  };

  const sendMessage = () => {
    const userText = input.trim();
    if (!userText) return;

    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setInput("");

    setTimeout(() => {
      const normalizedUserText = normalizeText(userText);
      const greetingKeywords = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon"];
      const isGreeting = greetingKeywords.some((word) => normalizedUserText.includes(word));
      const matchedReply = isGreeting
        ? "Hello! I am here to help you with scholarships. You can ask about apply, documents, eligibility, or status."
        : getBotReply(userText);
      const finalText = matchedReply || getFallbackReply();
      setMessages((prev) => [...prev, { from: "bot", text: finalText }]);
    }, 300);
  };

  return (
    <div style={{ position: "fixed", right: 14, bottom: 14, zIndex: 9999 }}>
      {isOpen && (
        <div
          style={{
            width: 270,
            background: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(0,0,0,0.16)",
            marginBottom: 10,
            overflow: "hidden",
            color: "var(--text-color)",
          }}
        >
          <div
            style={{
              padding: 8,
              borderBottom: "1px solid var(--border-color)",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Comet</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
              }}
              aria-label="Close chatbot"
            >
              X
            </button>
          </div>

          <div style={{ height: 210, overflowY: "auto", padding: 8, fontSize: 13 }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.from === "user" ? "right" : "left",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "7px 9px",
                    borderRadius: 8,
                    background: msg.from === "user" ? "#dbeafe" : "var(--surface-muted)",
                    color: msg.from === "user" ? "#0f172a" : "var(--text-color)",
                    maxWidth: "85%",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, padding: 8, borderTop: "1px solid var(--border-color)" }}>
            <input
              type="text"
              value={input}
              placeholder="Type your question..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{
                flex: 1,
                padding: "7px 8px",
                fontSize: 13,
                background: "var(--surface-muted)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                width: 34,
                height: 34,
                cursor: "pointer",
                background: "var(--accent-color)",
                border: "none",
                color: "#ffffff",
                clipPath: "polygon(50% 0%, 61% 36%, 98% 36%, 68% 58%, 79% 93%, 50% 72%, 21% 93%, 32% 58%, 2% 36%, 39% 36%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(79, 70, 229, 0.45)",
              }}
              aria-label="Send message"
            >
              <span style={{ fontSize: 12, lineHeight: 1 }}>➤</span>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "3px solid #ffffff",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          cursor: "pointer",
          boxShadow: "0 8px 18px rgba(62, 38, 130, 0.45)",
          overflow: "hidden",
          padding: 0,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>X</span>
        ) : (
          <svg
            viewBox="0 0 100 100"
            width="40"
            height="40"
            aria-hidden="true"
          >
            <circle cx="50" cy="12" r="6" fill="#efe9ff" stroke="#5b3cc4" strokeWidth="3" />
            <line x1="50" y1="18" x2="50" y2="26" stroke="#5b3cc4" strokeWidth="3" />

            <rect x="22" y="26" width="56" height="44" rx="18" fill="#f5f1ff" stroke="#5b3cc4" strokeWidth="4" />
            <rect x="30" y="36" width="40" height="24" rx="10" fill="#e9e0ff" stroke="#6d4ed6" strokeWidth="3" />

            <circle cx="42" cy="48" r="4" fill="#5b3cc4" />
            <circle cx="58" cy="48" r="4" fill="#5b3cc4" />
            <path d="M44 56 Q50 62 56 56" fill="none" stroke="#5b3cc4" strokeWidth="3" strokeLinecap="round" />

            <rect x="16" y="40" width="8" height="16" rx="4" fill="#efe9ff" stroke="#5b3cc4" strokeWidth="3" />
            <rect x="76" y="40" width="8" height="16" rx="4" fill="#efe9ff" stroke="#5b3cc4" strokeWidth="3" />

            <path d="M30 70 Q50 90 70 70 V78 Q50 95 30 78 Z" fill="#e2d7ff" stroke="#5b3cc4" strokeWidth="3" />
            <path d="M44 73 Q50 79 56 73" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

            <line x1="84" y1="28" x2="90" y2="24" stroke="#b69cff" strokeWidth="3" strokeLinecap="round" />
            <line x1="86" y1="34" x2="93" y2="34" stroke="#b69cff" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}


// create function to format chatbot message time

