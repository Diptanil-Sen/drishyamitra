import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPhotos, getPeople, addPerson, getUnlabeledFaces, labelFace, deletePhoto, searchPhotos } from "../api";

export default function Dashboard() {
    const [photos, setPhotos] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPersonName, setNewPersonName] = useState("");
    const [addingPerson, setAddingPerson] = useState(false);
    const [showAddPerson, setShowAddPerson] = useState(false);
    const [unlabeledFaces, setUnlabeledFaces] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();
    const username = localStorage.getItem("username");

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const photosRes = await getAllPhotos();
            const peopleRes = await getPeople();
            const unlabeledRes = await getUnlabeledFaces();
            setPhotos(photosRes.data.photos);
            setPeople(peopleRes.data.people);
            setUnlabeledFaces(unlabeledRes.data.unlabeled_faces);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
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

    const handleSearch = async () => {
        if (!searchQuery.trim() && !searchDate) return;
        setSearching(true);
        try {
            const res = await searchPhotos(searchQuery, searchDate);
            setSearchResults(res.data.photos);
        } catch (err) {
            console.error(err);
        }
        setSearching(false);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchDate("");
        setSearchResults(null);
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
        .grad-text { background: linear-gradient(135deg, #fff 0%, #4f8ef7 50%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .grad-btn { background: linear-gradient(135deg, #4f8ef7, #8b5cf6); border: none; color: white; cursor: pointer; transition: all 0.3s; font-family: 'Sora', sans-serif; font-weight: 600; }
        .grad-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79,142,247,0.4); }
        .photo-card { position: relative; border-radius: 16px; overflow: hidden; aspect-ratio: 1; transition: all 0.3s; cursor: pointer; }
        .photo-card:hover { transform: scale(1.03); box-shadow: 0 15px 30px rgba(0,0,0,0.5); z-index: 2; }
        .photo-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85), transparent 60%); opacity: 0; transition: opacity 0.3s; display: flex; align-items: flex-end; justify-content: space-between; padding: 10px; }
        .photo-card:hover .photo-overlay { opacity: 1; }
        .delete-btn { background: rgba(239,68,68,0.9); border: none; color: white; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .delete-btn:hover { background: #ef4444; transform: scale(1.1); }
        .person-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px 16px; text-align: center; cursor: pointer; transition: all 0.3s; }
        .person-card:hover { transform: translateY(-4px); border-color: rgba(79,142,247,0.4); box-shadow: 0 15px 30px rgba(0,0,0,0.3); background: rgba(79,142,247,0.08); }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; text-align: center; position: relative; overflow: hidden; transition: all 0.3s; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #4f8ef7, #8b5cf6); }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .unknown-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(239,68,68,0.2); border-radius: 16px; overflow: hidden; transition: all 0.3s; }
        .unknown-card:hover { transform: translateY(-3px); border-color: rgba(239,68,68,0.5); }
        .input-field { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-family: 'Sora', sans-serif; padding: 12px 16px; font-size: 14px; outline: none; transition: all 0.3s; }
        .input-field:focus { border-color: #4f8ef7; box-shadow: 0 0 0 3px rgba(79,142,247,0.15); }
        .input-field::placeholder { color: rgba(255,255,255,0.25); }
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

            {/* Animated background */}
            <div className="bg-mesh" />

            {/* Navbar */}
            <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔮</div>
                    <span className="text-xl font-extrabold grad-text">Drishyamitra</span>
                </div>
                <div className="flex items-center gap-3">
                    <span style={{ fontSize: '13px', color: '#6b7280', padding: '8px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        👋 {username}
                    </span>
                    <button onClick={() => navigate("/upload")} className="grad-btn px-4 py-2 rounded-full text-sm" style={{ background: 'linear-gradient(135deg, #4f8ef7, #06b6d4)' }}>
                        📤 Upload
                    </button>
                    <button onClick={() => navigate("/chat")} className="grad-btn px-4 py-2 rounded-full text-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                        🤖 AI Chat
                    </button>
                    <button onClick={() => navigate("/history")} className="grad-btn px-4 py-2 rounded-full text-sm" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                        📦 History
                    </button>
                    <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '100px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontFamily: "'Sora',sans-serif", fontSize: '13px', fontWeight: '600' }}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="relative z-10 p-8 max-w-6xl mx-auto fade-in">

                {/* Search Bar */}
                <div className="glass rounded-2xl p-4 mb-8 flex gap-3 flex-wrap">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        placeholder="Search by person name (e.g. Mom, Bro)"
                        className="input-field flex-1"
                        style={{ minWidth: '200px' }}
                    />
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="input-field"
                        style={{ width: '160px' }}
                    />
                    <button onClick={handleSearch} disabled={searching} className="grad-btn px-5 py-2 rounded-xl text-sm">
                        {searching ? "Searching..." : "🔍 Search"}
                    </button>
                    {searchResults !== null && (
                        <button onClick={clearSearch} style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontFamily: "'Sora',sans-serif", fontSize: '13px', fontWeight: '600' }}>
                            ✕ Clear
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {searchResults !== null && (
                    <div className="mb-10">
                        <h2 className="text-lg font-bold mb-5">
                            🔍 Search Results
                            <span style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', color: 'white', fontSize: '11px', padding: '3px 10px', borderRadius: '100px', marginLeft: '8px' }}>
                                {searchResults.length} found
                            </span>
                        </h2>
                        {searchResults.length === 0 ? (
                            <p style={{ color: '#6b7280' }}>No photos found matching your search.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {searchResults.map((photo) => (
                                    <div key={photo.id} className="photo-card glass">
                                        <img
                                            src={`http://127.0.0.1:5000/api/photos/serve/${photo.filename}`}
                                            alt={photo.filename}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <div className="photo-overlay">
                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                                                {photo.uploaded_at?.split(' ')[0]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'Unique Photos', value: photos.length, icon: '📸' },
                        { label: 'People', value: people.length, icon: '👥' },
                        { label: 'Unknown Faces', value: unlabeledFaces.length, icon: '❓' },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card">
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* People */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            👥 People
                            <span style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', color: 'white', fontSize: '11px', padding: '3px 10px', borderRadius: '100px' }}>
                                {people.length}
                            </span>
                        </h2>
                        <button onClick={() => setShowAddPerson(!showAddPerson)} className="grad-btn px-4 py-2 rounded-full text-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                            + Add Person
                        </button>
                    </div>

                    {showAddPerson && (
                        <div className="glass rounded-2xl p-4 mb-4 flex gap-3 fade-in">
                            <input
                                type="text"
                                value={newPersonName}
                                onChange={(e) => setNewPersonName(e.target.value)}
                                placeholder="Enter person's name (e.g. Mom, Dad)"
                                className="input-field flex-1"
                            />
                            <button
                                onClick={async () => {
                                    if (!newPersonName.trim()) return;
                                    setAddingPerson(true);
                                    try {
                                        await addPerson({ name: newPersonName.trim() });
                                        setNewPersonName("");
                                        setShowAddPerson(false);
                                        fetchData();
                                    } catch (err) {
                                        alert(err.response?.data?.message || "Failed to add person");
                                    }
                                    setAddingPerson(false);
                                }}
                                disabled={addingPerson}
                                className="grad-btn px-6 py-2 rounded-xl text-sm"
                            >
                                {addingPerson ? "Adding..." : "Add"}
                            </button>
                        </div>
                    )}

                    {people.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>No people added yet. Click "+ Add Person" to start!</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {people.map((person) => (
                                <div key={person.id} className="person-card" onClick={() => navigate(`/person/${person.id}`)}>
                                    <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 12px' }}>👤</div>
                                    <p className="font-bold text-sm">{person.name}</p>
                                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{person.photo_count} photos</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Unknown Faces */}
                {unlabeledFaces.length > 0 && (
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                ❓ Unknown Faces
                                <span style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', color: 'white', fontSize: '11px', padding: '3px 10px', borderRadius: '100px' }}>
                                    {unlabeledFaces.length}
                                </span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {unlabeledFaces.map((face) => (
                                <div key={face.face_id} className="unknown-card">
                                    <img
                                        src={`http://127.0.0.1:5000/api/faces/serve/${face.face_filename}`}
                                        alt="Unknown face"
                                        style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div style={{ padding: '8px' }}>
                                        <select
                                            onChange={async (e) => {
                                                if (!e.target.value) return;
                                                try {
                                                    await labelFace({ face_id: face.face_id, person_id: parseInt(e.target.value) });
                                                    fetchData();
                                                } catch (err) {
                                                    alert("Failed to label face");
                                                }
                                            }}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#9ca3af', fontFamily: "'Sora',sans-serif", fontSize: '11px', padding: '6px', outline: 'none' }}
                                        >
                                            <option value="">Who is this?</option>
                                            {people.map((person) => (
                                                <option key={person.id} value={person.id}>{person.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Photos */}
                <div>
                    <h2 className="text-lg font-bold mb-5">🖼️ Recent Photos</h2>
                    {loading ? (
                        <p style={{ color: '#6b7280' }}>Loading...</p>
                    ) : photos.length === 0 ? (
                        <div className="text-center py-16">
                            <p style={{ color: '#6b7280', fontSize: '16px' }}>No photos yet!</p>
                            <button onClick={() => navigate("/upload")} className="grad-btn px-6 py-3 rounded-xl mt-4 text-sm">
                                Upload your first photo
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
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                                            {photo.filename.substring(0, 12)}...
                                        </span>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
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
        </div>
    );
}