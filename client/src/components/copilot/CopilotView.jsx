import React, { useState } from "react";
import { Sparkles, Send, ArrowRight } from "lucide-react";
import { getArray } from "../../utils/formatters.js";
import { Panel } from "../dashboard/ChartSection.jsx";
import { InsightCard } from "./InsightCard.jsx";

export function CopilotView({ data, headers, onNavigateView }) {
  const recommendations = getArray(data?.recommendations);
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);

  const samplePrompts = [
    "Why did profit decrease this month?",
    "Which products should I reorder urgently?",
    "Which customers have the highest outstanding balance?",
    "Show me customer returns and RMA details."
  ];

  const handleSendPrompt = async (promptText) => {
    const q = promptText || query;
    if (!q || asking) return;

    setChatHistory((prev) => [...prev, { sender: "user", text: q }]);
    setQuery("");
    setAsking(true);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: headers || { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, history: chatHistory })
      });
      const result = await res.json().catch(() => ({}));
      const botAnswer = result.answer || "Unable to retrieve AI response. Please try again.";
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: botAnswer, model: result.model, action: result.action }
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: `Error generating insight: ${err.message}` }
      ]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <section className="grid-2">
      <Panel title="AI Executive Insights & Recommendations">
        {recommendations.length === 0 ? (
          <InsightCard
            priority="HIGH PRIORITY"
            title="Inventory Reorder Required"
            rationale="Amul Milk stock (8 units) is below reorder threshold of 100 units."
            action="Issue Purchase Order to Amul Dairy Federation."
          />
        ) : (
          recommendations.map((item, idx) => (
            <InsightCard
              key={idx}
              priority={item.priority || "RECOMMENDED"}
              title={item.title}
              rationale={item.rationale}
              action={item.action}
            />
          ))
        )}
      </Panel>

      <Panel title="AI Business Copilot Console">
        <div className="copilot-chat">
          <div className="chat-messages">
            {chatHistory.length === 0 && (
              <p className="placeholder-text">Ask any business query below or tap a quick prompt...</p>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>
                <strong>{msg.sender === "user" ? "You" : "AI Copilot"}</strong>
                <p>{msg.text}</p>
                {msg.action && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="primary-btn"
                      style={{ fontSize: 12, padding: "6px 12px" }}
                      onClick={() => onNavigateView && onNavigateView(msg.action.targetView)}
                    >
                      {msg.action.label} <ArrowRight size={13} style={{ marginLeft: 4 }} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {asking && <p className="typing">Analyzing live business metrics & generating action...</p>}
          </div>

          <div className="sample-prompts">
            {samplePrompts.map((p, idx) => (
              <button key={idx} className="chip-btn" onClick={() => handleSendPrompt(p)}>
                <Sparkles size={12} style={{ marginRight: 4 }} /> {p}
              </button>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Ask about sales, stock, margin, returns, or debtors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendPrompt()}
            />
            <button onClick={() => handleSendPrompt()} disabled={asking}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </Panel>
    </section>
  );
}
