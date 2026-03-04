import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPhoto, detectFaces } from "../api";

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
    setResults([]);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    setFiles(dropped);
    setResults([]);
    setError("");
  };

  const handleUpload = async () => {
    if (files.length === 0) { setError("Please select at least one photo!"); return; }
    setUploading(true);
    setError("");
    const uploadResults = [];
    for (let file of files) {
      try {
        const formData = new FormData();
        formData.append("photo", file);
        const uploadRes = await uploadPhoto(formData);
        const photoId = uploadRes.data.photo_id;
        const faceRes = await detectFaces(photoId);
        uploadResults.push({
          filename: file.name,
          photo_id: photoId,
          faces: faceRes.data.faces.length,
          auto_recognized: faceRes.data.auto_recognized_count || 0,
          unknown: faceRes.data.unknown_count || 0,
          status: "success",
        });
      } catch (err) {
        uploadResults.push({ filename: file.name, status: "error", error: err.response?.data?.message || "Upload failed" });
      }
    }
    setResults(uploadResults);
    setUploading(false);
    setFiles([]);
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
        .upload-zone{border:2px dashed rgba(79,142,247,0.3);border-radius:24px;padding:60px 40px;text-align:center;background:rgba(79,142,247,0.03);transition:all 0.3s;cursor:pointer}
        .upload-zone:hover,.upload-zone.drag-over{border-color:#4f8ef7;background:rgba(79,142,247,0.07);box-shadow:0 0 40px rgba(79,142,247,0.1)}
        .float-anim{animation:float 3s ease-in-out infinite}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .fade-in{animation:fadeIn 0.5s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .progress-bar{height:3px;background:rgba(255,255,255,0.08);border-radius:100px;overflow:hidden;margin:10px 0}
        .progress-fill{height:100%;background:linear-gradient(90deg,#4f8ef7,#8b5cf6);border-radius:100px;animation:progressAnim 1s ease}
        @keyframes progressAnim{from{width:0}to{width:100%}}
      `}</style>

      <div className="bg-mesh" />

      {/* Navbar */}
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
        <h2 style={{ fontSize:'24px', fontWeight:'800', marginBottom:'8px' }}>📤 Upload Photos</h2>
        <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'32px' }}>AI will automatically detect and recognize faces in your photos</p>

        {/* Upload zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div className="float-anim" style={{ fontSize:'56px', marginBottom:'16px' }}>📸</div>
          <p style={{ fontSize:'18px', fontWeight:'700', marginBottom:'8px' }}>Drop photos here</p>
          <p style={{ color:'#6b7280', fontSize:'13px', marginBottom:'24px' }}>or click to browse · JPG, PNG, WEBP · Max 16MB</p>
          <div style={{ display:'inline-block', padding:'12px 28px', background:'linear-gradient(135deg,#4f8ef7,#8b5cf6)', borderRadius:'12px', fontSize:'14px', fontWeight:'700', color:'white' }}>
            Choose Photos
          </div>
          <input type="file" id="file-input" multiple accept="image/*" onChange={handleFileChange} style={{ display:'none' }} />
        </div>

        {/* Selected files */}
        {files.length > 0 && (
          <div className="glass rounded-2xl p-5 mt-6 fade-in">
            <p style={{ fontWeight:'700', marginBottom:'12px', fontSize:'14px' }}>📋 {files.length} file(s) selected</p>
            {[...files].map((file, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#9ca3af', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <span>{file.name}</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'12px', padding:'12px 16px', marginTop:'16px', fontSize:'13px', color:'#f87171' }}>
            ⚠️ {error}
          </div>
        )}

        {files.length > 0 && (
          <button onClick={handleUpload} disabled={uploading} style={{ width:'100%', marginTop:'20px', padding:'16px', background:'linear-gradient(135deg,#4f8ef7,#8b5cf6)', border:'none', borderRadius:'14px', color:'white', fontFamily:"'Sora',sans-serif", fontSize:'15px', fontWeight:'700', cursor:'pointer', transition:'all 0.3s', opacity: uploading ? 0.8 : 1 }}>
            {uploading ? "🔄 Uploading & Detecting Faces..." : `Upload ${files.length} Photo(s) →`}
          </button>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 fade-in">
            <p style={{ fontWeight:'700', marginBottom:'12px', fontSize:'14px' }}>✅ Upload Results</p>
            {results.map((result, i) => (
              <div key={i} className="glass rounded-2xl p-5 mb-3">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <span style={{ fontSize:'13px', fontWeight:'600' }}>{result.filename}</span>
                  {result.status === "success" ? (
                    <span style={{ fontSize:'12px', color:'#34d399', fontWeight:'600' }}>✅ Done</span>
                  ) : (
                    <span style={{ fontSize:'12px', color:'#f87171' }}>❌ Failed</span>
                  )}
                </div>
                {result.status === "success" && (
                  <>
                    <div className="progress-bar"><div className="progress-fill" style={{ width:'100%' }} /></div>
                    <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'8px' }}>
                      🤖 {result.faces} face(s) detected
                      {result.auto_recognized > 0 && <span style={{ color:'#8b5cf6', marginLeft:'8px' }}>· ✨ {result.auto_recognized} auto-recognized</span>}
                      {result.unknown > 0 && (
                        <button onClick={() => navigate(`/label/${result.photo_id}`)} style={{ marginLeft:'8px', color:'#4f8ef7', background:'none', border:'none', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:'12px', textDecoration:'underline' }}>
                          🏷️ Label {result.unknown} unknown →
                        </button>
                      )}
                      {result.faces > 0 && result.unknown === 0 && <span style={{ color:'#34d399', marginLeft:'8px' }}>· All recognized!</span>}
                    </div>
                  </>
                )}
                {result.status === "error" && <p style={{ fontSize:'12px', color:'#f87171', marginTop:'4px' }}>{result.error}</p>}
              </div>
            ))}
            <button onClick={() => navigate("/dashboard")} style={{ width:'100%', marginTop:'8px', padding:'14px', background:'linear-gradient(135deg,#10b981,#06b6d4)', border:'none', borderRadius:'14px', color:'white', fontFamily:"'Sora',sans-serif", fontSize:'14px', fontWeight:'700', cursor:'pointer' }}>
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}