import React, { useState, useEffect, useRef } from 'react';
const StudentPortal = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
     const attemptCameraAccess = async () => {
        let camers = await startVideo();
    if (!camers){
      setTimeout(() => {
        attemptCameraAccess();
      }, 1000);
    }}
    attemptCameraAccess();
  }, []);

  useEffect(() => {
    let interval;
    let ws;

    
      // Connect to Python Backend
      ws = new WebSocket("ws://localhost:8000/ws/student_1");

      ws.onopen = () => {
        setConnected(true);
        // Start sending frames
        interval = setInterval(() => {
          sendFrame(ws);
        }, 200); // 5 FPS
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setTelemetry(data);
      };

      ws.onclose = () => setConnected(false);
      ws.onerror = () => {
        setConnected(false);
      };
    

    return () => {
      if (interval) clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
      if (videoRef.current) videoRef.current.srcObject = stream;
      return true;
    } catch (err) {
        alert("Please Give Camera Access");
     return false;
    }
    
  };

  const sendFrame = (ws) => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(base64);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <div className="space-y-4">
        <div className="bg-slate-800/50 border border-slate-700 p-2 rounded-2xl relative overflow-hidden aspect-video bg-black backdrop-blur-md">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-xl transform scale-x-[-1]"
          ></video>
          <canvas ref={canvasRef} width="320" height="240" className="hidden"></canvas>

          <div className="absolute top-4 left-4">
            <StatusBadge
              status={connected ? "green" : "red"}
              text={connected ? ( "Live ML Connection") : "Connecting..."}
            />
          </div>

          {telemetry?.gaze_alert && (
            <div className="absolute inset-0 border-4 border-red-500/50 rounded-xl flex items-center justify-center bg-red-500/10 backdrop-blur-sm transition-all">
              <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold animate-pulse">
                ⚠️ Please look at the screen
              </div>
            </div>
          )}
        </div>
        
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Real-Time Analysis</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl backdrop-blur-md">
            <h3 className="text-slate-400 text-sm mb-1">Current State</h3>
            <p className={`text-2xl font-bold ${telemetry?.emotion === 'Confused' ? 'text-yellow-400' : 'text-white'}`}>
              {telemetry?.emotion || "Initializing..."}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl backdrop-blur-md">
            <h3 className="text-slate-400 text-sm mb-1">Integrity Status</h3>
            <p className={`text-2xl font-bold ${telemetry?.gaze_alert ? 'text-red-400' : 'text-green-400'}`}>
              {telemetry?.gaze_alert ? "Flagged" : "Clear"}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl backdrop-blur-md">
          <h3 className="text-slate-400 text-sm mb-4">Debug Console</h3>
          <div className="font-mono text-xs text-green-400 h-32 overflow-y-auto bg-slate-900/50 p-4 rounded-lg">
            <p>&gt; System initialized...</p>
            <p>&gt; Camera stream connected.</p>
            {telemetry && (
              <p>&gt; [{new Date().toLocaleTimeString()}] Status: {telemetry.status} | Msg: {telemetry.debug_msg}</p>
            )}
            {telemetry?.emotion === 'Confused' && (
              <p className="text-yellow-400">&gt; [DETECTED] Confusion Metric &gt; Threshold (Brow Furrow Detected)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
const StatusBadge = ({ status, text }) => {
  const colors = {
    green: "bg-green-500/20 text-green-400 border-green-500/50",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    red: "bg-red-500/20 text-red-400 border-red-500/50",
    gray: "bg-gray-500/20 text-gray-400 border-gray-500/50"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[status] || colors.gray}`}>
      {text}
    </span>
  );
};
export default StudentPortal;