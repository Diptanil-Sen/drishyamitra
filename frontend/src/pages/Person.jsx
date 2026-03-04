import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPhotosByPerson, getPeople, deletePhoto } from "../api";

export default function Person() {
  const { id } = useParams();
  const [photos, setPhotos] = useState([]);
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const peopleRes = await getPeople();
      const found = peopleRes.data.people.find((p) => p.id === parseInt(id));
      setPerson(found);
      const photosRes = await getPhotosByPerson(id);
      setPhotos(photosRes.data.photos);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm("Delete this photo permanently?")) return;
    setDeletingId(photoId);
    try {
      await deletePhoto(photoId);
      fetchData();
    } catch (err) {
      alert("Failed to delete photo");
    }
    setDeletingId(null);
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
        .photo-card { position: relative; border-radius: 16px; overflow: hidden; aspect-ratio: 1; transition: all 0.3s; }
        .photo-card:hover { transform: scale(1.03); box-shadow: 0 15px 30px rgba(0,0,0,0.5); z-index: 2; }
        .photo-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85), transparent 60%); opacity: 0; transition: opacity 0.3s; display: flex; align-items: flex-end; justify-content: space-between; padding: 10px; }
        .photo-card:hover .photo-overlay { opacity: 1; }
        .delete-btn { background: rgba(239,68,68,0.9); border: none; color: white; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .delete-btn:hover { background: #ef4444; transform: scale(1.1); }
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="bg-mesh" />

      <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔮</div>
          <span style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #4f8ef7 50%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Drishyamitra</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ padding: '8px 18px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: "'Sora',sans-serif", fontSize: '13px', fontWeight: '600' }}
        >
          ← Dashboard
        </button>
      </nav>

      <div className="relative z-10 p-8 max-w-6xl mx-auto fade-in">
        {/* Person header */}
        <div className="flex items-center gap-5 mb-10">
          <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 0 30px rgba(79,142,247,0.4)' }}>👤</div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #fff, #4f8ef7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{person?.name}</h2>
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>{photos.length} photos</p>
          </div>
        </div>

        {/* Photos */}
        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading...</p>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: '#6b7280' }}>No photos for {person?.name} yet.</p>
            <button onClick={() => navigate("/upload")} style={{ marginTop: '16px', padding: '12px 24px', background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontFamily: "'Sora',sans-serif", fontWeight: '600', cursor: 'pointer' }}>
              Upload Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="photo-card glass">
                <img
                  src={`http://127.0.0.1:5000/api/photos/serve/${photo.filename}`}
                  alt={photo.filename}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="photo-overlay">
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                    {photo.uploaded_at?.split(' ')[0]}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    title="Delete photo"
                  >
                    {deletingId === photo.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}