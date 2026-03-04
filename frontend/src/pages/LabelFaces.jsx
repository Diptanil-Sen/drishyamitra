import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFacesInPhoto, getPeople, labelFace } from "../api";

export default function LabelFaces() {
  const { photoId } = useParams();
  const [faces, setFaces] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, [photoId]);

  const fetchData = async () => {
    try {
      const facesRes = await getFacesInPhoto(photoId);
      const peopleRes = await getPeople();
      setFaces(facesRes.data.faces);
      setPeople(peopleRes.data.people);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleLabel = async (faceId, personId) => {
    try {
      await labelFace({ face_id: faceId, person_id: personId });
      fetchData();
    } catch (err) { alert("Failed to label face"); }
  };

  return (
    <div style={{ fontFamily:"'Sora',sans-serif" }} className="min-h-screen bg-gray-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .bg-mesh{position:fixed;inset:0;z-index:0;pointer-events:none}
        .bg-mesh::before{content:'';position:absolute;width:700px;height:700px;background:radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%);top:-200px;left:-200px;animation:drift1 12s ease-in-out infinite alternate}
        .bg-mesh::after{content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%);bottom:-100px;right:-100px;animation:drift2 10s ease-in-out infinite alternate}
        @keyframes drift1{from{transform:translate(0,0)}to{transform:translate(80px,60px)}}
        @keyframes drift2{from{transform:translate(0,0)}to{transform:translate(-60px,-40px)}}
        .glass{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(20px)}
        .face-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;transition:all 0.3s}
        .face-card:hover{border-color:rgba(79,142,247,0.4);transform:translateY(-2px)}
        .fade-in{animation:fadeIn 0.5s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .label-select{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#9ca3af;font-family:'Sora',sans-serif;font-size:12px;padding:10px;outline:none;transition:all 0.3s}
        .label-select:focus{border-color:#4f8ef7}
      `}</style>

      <div className="bg-mesh" />

      <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div style={{ background:'linear-gradient(135deg,#4f8ef7,#8b5cf6)', borderRadius:'10px', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🔮</div>
          <span style={{ fontSize:'20px', fontWeight:'800', background:'linear-gradient(135deg,#fff 0%,#4f8ef7 50%,#8b5cf6 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Drishyamitra</span>
        </div>
        <button onClick={() => navigate("/dashboard")} style={{ padding:'8px 18px', borderRadius:'100px', background:'rgba(255,255,255,0.06)', color:'#9ca3af', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:'13px', fontWeight:'600' }}>
          ← Dashboard
        </button>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto p-8 fade-in">
        <h2 style={{ fontSize:'24px', fontWeight:'800', marginBottom:'8px' }}>🏷️ Label Faces</h2>
        <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'32px' }}>Assign each detected face to a person in your library</p>

        {loading ? (
          <p style={{ color:'#6b7280' }}>Loading faces...</p>
        ) : faces.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p style={{ color:'#6b7280' }}>No faces detected in this photo.</p>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'16px', marginBottom:'24px' }}>
              {faces.map((face, i) => (
                <div key={face.id} className="face-card">
                  <div style={{ position:'relative' }}>
                    <img
                      src={`http://127.0.0.1:5000/api/faces/serve/${face.face_path?.split('/').pop()}`}
                      alt={`Face ${i + 1}`}
                      style={{ width:'100%', height:'150px', objectFit:'cover' }}
                      onError={(e) => { e.target.style.display='none'; }}
                    />
                    {face.person_name && (
                      <div style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(16,185,129,0.9)', borderRadius:'100px', padding:'3px 10px', fontSize:'11px', fontWeight:'600', color:'white' }}>
                        ✅ {face.person_name}
                      </div>
                    )}
                  </div>
                  <div style={{ padding:'12px' }}>
                    <p style={{ fontSize:'11px', color:'#6b7280', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Face {i + 1}</p>
                    <select className="label-select" onChange={(e) => { if (e.target.value) handleLabel(face.id, parseInt(e.target.value)); }} defaultValue={face.person_id || ""}>
                      <option value="">Who is this?</option>
                      {people.map((person) => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => navigate("/dashboard")} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#10b981,#06b6d4)', border:'none', borderRadius:'14px', color:'white', fontFamily:"'Sora',sans-serif", fontSize:'15px', fontWeight:'700', cursor:'pointer', transition:'all 0.3s' }}>
              Done → Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}