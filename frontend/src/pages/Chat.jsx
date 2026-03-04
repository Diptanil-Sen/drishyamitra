import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendMessage } from "../api";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm Drishyamitra AI 👋 Ask me anything about your photos! Try 'Show me photos of Mom' or 'Send Bro's photos to example@gmail.com'" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);
    try {
      const res = await sendMessage({ message: userMessage });
      setMessages((prev) => [...prev, { role: "assistant", text: res.data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, something went wrong. Please try again!" }]);
    }
    setLoading(false);
  };

  const suggestions = ["Show all my photos", "How many people?", "Send photos via email", "Send photos via WhatsApp"];

  return (
    <div style={{ fontFamily:"'Sora',sans-serif" }} className="min-h-screen bg-gray-950 text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .bg-mesh{position:fixed;inset:0;z-index:0;pointer-events:none}
        .bg-mesh::before{content:'';position:absolute;width:700px;height:700px;background:radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%);top:-200px;left:-200px;animation:drift1 12s ease-in-out infinite alternate}
        .bg-mesh::after{content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%);bottom:-100px;right:-100px;animation:drift2 10s ease-in-out infinite alternate}
        @keyframes drift1{from{transform:translate(0,0)}to{transform:translate(80px,60px)}}
        @keyframes drift2{from{transform:translate(0,0)}to{transform:translate(-60px,-40px)}}
        .glass{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(20px)}
        .msg-in{animation:msgIn 0.3s ease}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .dot{width:8px;height:8px;background:#6b7280;border-radius:50%;animation:bounce 1.2s infinite}
        .dot:nth-child(2){animation-delay:0.2s}
        .dot:nth-child(3){animation-delay:0.4s}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        .suggestion{padding:8px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:100px;font-size:12px;color:#9ca3af;cursor:pointer;transition:all 0.3s;font-family:'Sora',sans-serif}
        .suggestion:hover{border-color:#4f8ef7;color:#4f8ef7;background:rgba(79,142,247,0.08)}
        .chat-input{flex:1;background:none;border:none;color:white;font-family:'Sora',sans-serif;font-size:14px;outline:none;padding:8px 0}
        .chat-input::placeholder{color:rgba(255,255,255,0.25)}
        .input-box{display:flex;gap:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:8px 8px 8px 16px;transition:all 0.3s}
        .input-box:focus-within{border-color:#4f8ef7;box-shadow:0 0 0 3px rgba(79,142,247,0.1)}
      `}</style>

      <div className="bg-mesh" />

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div style={{ background:'linear-gradient(135deg,#4f8ef7,#8b5cf6)', borderRadius:'10px', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🔮</div>
          <span style={{ fontSize:'20px', fontWeight:'800', background:'linear-gradient(135deg,#fff 0%,#4f8ef7 50%,#8b5cf6 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Drishyamitra</span>
          <span style={{ padding:'4px 12px', background:'linear-gradient(135deg,#8b5cf6,#ec4899)', borderRadius:'100px', fontSize:'11px', fontWeight:'600' }}>AI Powered by Groq</span>
        </div>
        <button onClick={() => navigate("/dashboard")} style={{ padding:'8px 18px', borderRadius:'100px', background:'rgba(255,255,255,0.06)', color:'#9ca3af', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:'13px', fontWeight:'600' }}>
          ← Dashboard
        </button>
      </nav>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <div style={{ display:'flex', flexDirection:'column', gap:'16px', paddingBottom:'16px' }}>
          {messages.map((msg, i) => (
            <div key={i} className="msg-in" style={{ display:'flex', gap:'12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background: msg.role === 'user' ? 'linear-gradient(135deg,#8b5cf6,#ec4899)' : 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>
                {msg.role === 'user' ? '😊' : '🤖'}
              </div>
              <div style={{ maxWidth:'65%', padding:'14px 18px', borderRadius:'18px', fontSize:'14px', lineHeight:'1.6', background: msg.role === 'user' ? 'linear-gradient(135deg,#4f8ef7,#8b5cf6)' : 'rgba(255,255,255,0.05)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)', borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px', borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '18px' }}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-in" style={{ display:'flex', gap:'12px' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#4f8ef7,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🤖</div>
              <div style={{ padding:'14px 18px', borderRadius:'18px', borderBottomLeftRadius:'4px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display:'flex', gap:'4px' }}>
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="relative z-10 px-6 pb-4 max-w-3xl mx-auto w-full">
          <p style={{ fontSize:'12px', color:'#6b7280', marginBottom:'10px' }}>Try asking:</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion" onClick={() => setInput(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative z-10 p-4 max-w-3xl mx-auto w-full pb-6">
        <div className="input-box">
          <input className="chat-input" type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask about your photos..." />
          <button onClick={handleSend} disabled={loading || !input.trim()} style={{ padding:'10px 22px', background:'linear-gradient(135deg,#4f8ef7,#8b5cf6)', border:'none', borderRadius:'12px', color:'white', fontFamily:"'Sora',sans-serif", fontSize:'13px', fontWeight:'700', cursor:'pointer', transition:'all 0.3s', opacity: loading || !input.trim() ? 0.5 : 1 }}>
            Send →
          </button>
        </div>
      </div>
    </div>
  );
}