import { useState } from "react";
import { login } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("user_id", res.data.user_id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }} className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .bg-mesh::before { content: ''; position: absolute; width: 700px; height: 700px; background: radial-gradient(circle, rgba(79,142,247,0.15) 0%, transparent 70%); top: -200px; left: -200px; animation: drift1 12s ease-in-out infinite alternate; }
        .bg-mesh::after { content: ''; position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%); bottom: -100px; right: -100px; animation: drift2 10s ease-in-out infinite alternate; }
        @keyframes drift1 { from{transform:translate(0,0)} to{transform:translate(80px,60px)} }
        @keyframes drift2 { from{transform:translate(0,0)} to{transform:translate(-60px,-40px)} }
        .card-in { animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1); }
        @keyframes cardIn { from{opacity:0;transform:translateY(30px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        .logo-pulse { animation: pulse 3s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 30px rgba(79,142,247,0.4)} 50%{box-shadow:0 0 50px rgba(139,92,246,0.5)} }
        .input-field { width:100%; padding:14px 16px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white; font-family:'Sora',sans-serif; font-size:14px; outline:none; transition:all 0.3s; }
        .input-field:focus { border-color:#4f8ef7; background:rgba(79,142,247,0.08); box-shadow:0 0 0 3px rgba(79,142,247,0.15); }
        .input-field::placeholder { color:rgba(255,255,255,0.2); }
        .btn-primary { width:100%; padding:14px; background:linear-gradient(135deg,#4f8ef7,#8b5cf6); border:none; border-radius:12px; color:white; font-family:'Sora',sans-serif; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.3s; position:relative; overflow:hidden; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(79,142,247,0.4); }
        .btn-primary:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
      `}</style>

      <div className="bg-mesh" />

      <div className="relative z-10 w-full max-w-md card-in">
        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,142,247,0.1)' }}>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="logo-pulse" style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 16px' }}>🔮</div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #4f8ef7 50%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Drishyamitra</h1>
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px' }}>AI-Powered Photo Intelligence</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#f87171' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: '#4f8ef7', textDecoration: 'none', fontWeight: '600' }}>Create one</Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>
          Made with ❤️ by Diptanil Sen &nbsp;·&nbsp; v1.0.0 &nbsp;·&nbsp; © 2026 Drishyamitra
        </p>
      </div>
    </div>
  );
}