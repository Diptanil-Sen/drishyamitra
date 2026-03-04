import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../api";

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            const res = await getHistory();
            setHistory(res.data.history);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const getTypeIcon = (type) => {
        if (type === 'email') return '📧';
        if (type === 'whatsapp') return '💬';
        return '📤';
    };

    const getStatusColor = (status) => {
        if (status === 'sent') return '#10b981';
        if (status === 'failed') return '#ef4444';
        return '#f59e0b';
    };

    return (
        <div style={{ fontFamily: "'Sora', sans-serif" }} className="min-h-screen bg-gray-950 text-white">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .bg-mesh::before { content: ''; position: absolute; width: 700px; height: 700px; background: radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%); top: -200px; left: -200px; animation: drift1 12s ease-in-out infinite alternate; }
        .bg-mesh::after { content: ''; position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%); bottom: -100px; right: -100px; animation: drift2 10s ease-in-out infinite alternate; }
        @keyframes drift1 { from { transform: translate(0,0); } to { transform: translate(80px, 60px); } }
        @keyframes drift2 { from { transform: translate(0,0); } to { transform: translate(-60px, -40px); } }
        .glass { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); }
        .history-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; transition: all 0.3s; animation: fadeIn 0.5s ease; }
        .history-card:hover { border-color: rgba(79,142,247,0.3); transform: translateY(-2px); background: rgba(255,255,255,0.06); }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; text-align: center; position: relative; overflow: hidden; }
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

            <div className="bg-mesh" />

            <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔮</div>
                    <span style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #4f8ef7 50%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Drishyamitra</span>
                </div>
                <button onClick={() => navigate("/dashboard")} style={{ padding: '8px 18px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: "'Sora',sans-serif", fontSize: '13px', fontWeight: '600' }}>
                    ← Dashboard
                </button>
            </nav>

            <div className="relative z-10 max-w-3xl mx-auto p-8 fade-in">
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>📦 Delivery History</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '32px' }}>Track all your photo deliveries via email and WhatsApp</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { label: 'Total Sent', value: history.length, icon: '📤', color: '#4f8ef7' },
                        { label: 'Via Email', value: history.filter(h => h.delivery_type === 'email').length, icon: '📧', color: '#8b5cf6' },
                        { label: 'Via WhatsApp', value: history.filter(h => h.delivery_type === 'whatsapp').length, icon: '💬', color: '#10b981' },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card">
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <p style={{ color: '#6b7280' }}>Loading history...</p>
                ) : history.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <p style={{ color: '#6b7280', fontSize: '16px' }}>No deliveries yet!</p>
                        <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '8px' }}>Send photos via email or WhatsApp to see history here</p>
                        <button onClick={() => navigate("/chat")} style={{ marginTop: '20px', padding: '12px 24px', background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontFamily: "'Sora',sans-serif", fontWeight: '600', cursor: 'pointer' }}>
                            Open AI Chat →
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {history.map((item) => (
                            <div key={item.id} className="history-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '44px', height: '44px', background: item.delivery_type === 'email' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: `1px solid ${item.delivery_type === 'email' ? 'rgba(139,92,246,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                                            {getTypeIcon(item.delivery_type)}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                                                Sent via {item.delivery_type === 'email' ? 'Email' : 'WhatsApp'}
                                            </p>
                                            <p style={{ fontSize: '12px', color: '#6b7280' }}>To: {item.recipient}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '600', background: `${getStatusColor(item.status)}20`, color: getStatusColor(item.status), border: `1px solid ${getStatusColor(item.status)}40` }}>
                                            {item.status === 'sent' ? '✅ Delivered' : '❌ Failed'}
                                        </span>
                                        <p style={{ fontSize: '11px', color: '#4b5563', marginTop: '6px' }}>{item.sent_at}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}