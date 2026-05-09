import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Chatbot.css";

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY; // Replace with your actual Groq API key
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a friendly travel assistant for Smart Trip Planner, an Indian bus and train booking website.
Your job is to help users with:
1. Booking buses and trains between Indian cities
2. Planning trips with budget (Budget, Mid-Range, Luxury)
3. Finding tourist places, hotels and restaurants at destinations
4. Estimating trip costs
5. Answering questions about the website features

Keep responses short, friendly and helpful. Maximum 3-4 sentences.
When users want to book, tell them to use the Search feature.
When users want to plan a trip, tell them to use the Trip Planner.
When users want to explore places, tell them to use the Explore feature.
Always reply in English.
You only answer travel and trip related questions. For anything else say "I can only help with travel planning!"`;

const QUICK_REPLIES = [
  { label: "🚌 Book a Bus", message: "I want to book a bus" },
  { label: "🚂 Book a Train", message: "I want to book a train" },
  { label: "📅 Plan a Trip", message: "Help me plan a trip" },
  { label: "🏛️ Tourist Places", message: "Show me tourist places" },
  { label: "💰 Trip Cost", message: "How much will my trip cost?" },
  { label: "❓ How to use", message: "How do I use this website?" },
];

function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Welcome to Smart Trip Planner!\n\nI am your personal travel assistant. I can help you book buses and trains, plan trips, find tourist places, and estimate costs.\n\nHow can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(function () {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  function getNavAction(text) {
    var lower = text.toLowerCase();
    if (lower.includes("book") && (lower.includes("bus") || lower.includes("train"))) {
      return { label: "Search Now", path: "/" };
    }
    if (lower.includes("plan") || lower.includes("itinerary") || lower.includes("planner")) {
      return { label: "Open Trip Planner", path: "/planner" };
    }
    if (lower.includes("tourist") || lower.includes("explore") || lower.includes("places")) {
      return { label: "Explore Places", path: "/explore" };
    }
    if (lower.includes("cost") || lower.includes("price") || lower.includes("estimate")) {
      return { label: "Open Trip Planner", path: "/planner" };
    }
    if (lower.includes("booking") || lower.includes("my ticket")) {
      return { label: "My Bookings", path: "/bookings" };
    }
    return null;
  }

  function addBotMessage(text, action) {
    setMessages(function (prev) {
      return [
        ...prev,
        {
          role: "bot",
          text: text,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          action: action || null,
        },
      ];
    });
  }

  async function sendMessage(text) {
    var userText = text || input.trim();
    if (!userText) return;

    setMessages(function (prev) {
      return [
        ...prev,
        {
          role: "user",
          text: userText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ];
    });

    setInput("");
    setLoading(true);
    setShowQuick(false);

    try {
      var res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + GROQ_API_KEY,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userText },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      var data = await res.json();

      console.log("Groq status:", res.status);
      console.log("Groq data:", JSON.stringify(data));

      if (!res.ok) {
        if (res.status === 429) {
          addBotMessage("Too many requests! Please wait a moment and try again.");
        } else {
          addBotMessage("Something went wrong. Please try again!");
        }
        setLoading(false);
        return;
      }

      var reply = "";
      if (
        data &&
        data.choices &&
        data.choices.length > 0 &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        reply = data.choices[0].message.content;
      } else {
        reply = "I did not get a response. Please try again!";
      }

      var navAction = getNavAction(userText);
      addBotMessage(reply, navAction);

    } catch (err) {
      console.error("Chatbot error:", err);
      addBotMessage("Connection error. Please check your internet and try again!");
    }

    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <p className="chatbot-name">Trip Assistant</p>
                <p className="chatbot-status">Online · Powered by Groq AI</p>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={function () { setIsOpen(false); }}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(function (msg, i) {
              return (
                <div key={i} className={"chat-msg " + msg.role}>
                  {msg.role === "bot" && (
                    <div className="chat-bot-avatar">🤖</div>
                  )}
                  <div className="chat-bubble-wrap">
                    <div className="chat-bubble">
                      {msg.text.split("\n").map(function (line, j) {
                        return (
                          <span key={j}>
                            {line}
                            {j < msg.text.split("\n").length - 1 && <br />}
                          </span>
                        );
                      })}
                    </div>
                    {msg.action && (
                      <button
                        className="chat-action-btn"
                        onClick={function () {
                          navigate(msg.action.path);
                          setIsOpen(false);
                        }}
                      >
                        {msg.action.label} →
                      </button>
                    )}
                    <span className="chat-time">{msg.time}</span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chat-msg bot">
                <div className="chat-bot-avatar">🤖</div>
                <div className="chat-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          {showQuick && (
            <div className="quick-replies">
              {QUICK_REPLIES.map(function (q, i) {
                return (
                  <button
                    key={i}
                    className="quick-reply-btn"
                    onClick={function () { sendMessage(q.message); }}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="chatbot-input-row">
            <input
              type="text"
              value={input}
              onChange={function (e) { setInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your trip..."
            />
            <button
              className="chatbot-send-btn"
              onClick={function () { sendMessage(); }}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <button
        className={"chatbot-bubble" + (isOpen ? " open" : "")}
        onClick={function () { setIsOpen(!isOpen); }}
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default Chatbot;