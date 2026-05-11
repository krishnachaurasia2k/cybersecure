import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const styles = `
.auth-root {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
  z-index: 9999;
  font-family: inherit;
  overflow: hidden;
}

.auth-video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  z-index: 1;
}

.auth-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 1;
  transform: scaleX(-1);
}

.auth-canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.auth-card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  backdrop-filter: blur(40px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  min-width: 380px;
  max-width: 90%;
}

.auth-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.3);
  margin-bottom: 0.5rem;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(56, 189, 248, 0.3);
}

.auth-avatar-icon {
  position: relative;
  z-index: 2;
  font-size: 2.5rem;
  color: #38bdf8;
}

.auth-header {
  text-align: center;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.4rem;
}

.auth-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
}

.auth-status {
  text-align: center;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  padding: 0.6rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 999px;
  color: #e2e8f0;
  margin-top: 0.5rem;
  width: 100%;
}

.auth-status.error {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.auth-status.success {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
  margin-top: 1rem;
}

.auth-btn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}

.auth-btn:hover {
  background: #0ea5e9;
}

.auth-btn-secondary {
  background: transparent;
  color: #94a3b8;
  font-weight: 400;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
}

.auth-btn-secondary:hover {
  color: #cbd5e1;
}

.auth-visual-input {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 1rem 0;
}

.pin-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.3);
  transition: all 0.2s;
}

.pin-dot.active {
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
}

.auth-footer {
    color: #94a3b8;
    font-size: 0.75rem;
    text-align: center;
    margin-top: 1rem;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.auth-footer:hover {
    opacity: 1;
}
`;

export default function FaceAuthorisation({ onAuth }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);

    const [status, setStatus] = useState("BOOTING BIOMETRIC SYSTEMS...");
    const [error, setError] = useState("");
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [mode, setMode] = useState("loading"); // 'loading' | 'auth' | 'register'
    const [detectedName, setDetectedName] = useState("");

    const STORAGE_KEY = "mission_copilot_commander_face";

    useEffect(() => {
        loadModels();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            stopCamera();
        };
    }, []);

    const loadModels = async () => {
        try {
            const MODEL_URL = "/models";
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setIsModelLoaded(true);
            startCamera();
        } catch (err) {
            console.error("Model load error:", err);
            setError("BIOMETRIC MODELS FAILED TO LOAD.");
            setStatus("SYSTEM FAILURE");
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            setError("CAMERA ACCESS DENIED.");
            setStatus("SENSOR FAILURE");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    const startVideoLoop = (savedData = null) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        let faceMatcher = null;
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                const savedDescriptor = new Float32Array(Object.values(parsed));
                faceMatcher = new faceapi.FaceMatcher(
                    new faceapi.LabeledFaceDescriptors("Commander", [savedDescriptor]),
                    0.5
                );
            } catch (e) {
                console.error("Data corruption", e);
            }
        }

        intervalRef.current = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return;
            if (videoRef.current.paused || videoRef.current.ended) return;

            const detection = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detection) {
                const resizedDetections = faceapi.resizeResults(detection, {
                    width: videoRef.current.videoWidth,
                    height: videoRef.current.videoHeight
                });

                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections, {
                    drawLines: true,
                    color: "#38bdf8",
                    lineWidth: 1
                });

                if (faceMatcher) {
                    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
                    if (bestMatch.label === "Commander") {
                        setDetectedName("Commander");
                        setStatus("IDENTITY CONFIRMED: COMMANDER.");
                        clearInterval(intervalRef.current);
                        setTimeout(onAuth, 1000);
                    } else {
                        setDetectedName("Unknown");
                        setStatus("UNAUTHORIZED USER DETECTED.");
                    }
                }
            } else {
                setDetectedName("");
                if (faceMatcher) setStatus("SEARCHING FACE...");
            }
        }, 100);
    };

    const handleVideoPlay = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);

        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            setMode("register");
            setStatus("NO COMMANDER REGISTERED. INITIATE REGISTRATION.");
            startVideoLoop(null);
        } else {
            setMode("auth");
            setStatus("SCANNING FOR COMMANDER...");
            startVideoLoop(savedData);
        }
    };

    const registerFace = async () => {
        setStatus("CAPTURING BIOMETRICS...");
        if (!videoRef.current) return;

        const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detection) {
            const descriptorArray = Array.from(detection.descriptor);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(descriptorArray));
            setStatus("REGISTRATION COMPLETE. WELCOME COMMANDER.");
            setTimeout(() => {
                setMode('auth');
                onAuth();
            }, 1000);
        } else {
            setStatus("FACE NOT DETECTED. TRY AGAIN.");
        }
    };

    function manualOverride() {
        onAuth();
    }

    const statusClass = detectedName === "Unknown" ? "error" : detectedName === "Commander" ? "success" : "";

    return (
        <div className="auth-root">
            <style>{styles}</style>

            <div className="auth-card">
                <div className="auth-avatar">
                    <div className="auth-video-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            onPlay={handleVideoPlay}
                            className="auth-video"
                        />
                        <canvas ref={canvasRef} className="auth-canvas-overlay" />
                    </div>
                    {!videoRef.current && (
                        <div className="auth-avatar-icon">
                            {detectedName === "Commander" ? "🔓" : "👤"}
                        </div>
                    )}
                </div>

                <div className="auth-header">
                    <div className="auth-title">
                        {mode === 'register' ? 'Setup Face ID' : 'Welcome Back'}
                    </div>
                    <div className="auth-subtitle">
                        {mode === 'register' ? 'Register your face to secure the cockpit.' : 'Mission Control Access'}
                    </div>
                </div>

                <div className={`auth-status ${statusClass}`}>
                    {status}
                </div>

                <div className="auth-visual-input">
                    <div className={`pin-dot ${detectedName ? 'active' : ''}`} />
                    <div className={`pin-dot ${detectedName ? 'active' : ''}`} />
                    <div className={`pin-dot ${detectedName ? 'active' : ''}`} />
                    <div className={`pin-dot ${detectedName ? 'active' : ''}`} />
                </div>

                <div className="auth-actions">
                    {mode === 'register' && isModelLoaded && !error && (
                        <button className="auth-btn" onClick={registerFace}>
                            Capture & Register Face
                        </button>
                    )}

                    {error ? (
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <div className="auth-subtitle" style={{ color: '#ef4444', marginBottom: '10px' }}>{error}</div>
                            <button className="auth-btn" style={{ background: '#ef4444', color: 'white' }} onClick={manualOverride}>
                                Manual Override (Emergency)
                            </button>
                        </div>
                    ) : (
                        mode === 'auth' && (
                            <button className="auth-btn auth-btn-secondary" onClick={() => manualOverride()}>
                                Use Password instead
                            </button>
                        )
                    )}
                </div>

                {!error && mode === 'auth' && (
                    <div className="auth-footer" onClick={() => {
                        localStorage.removeItem(STORAGE_KEY);
                        window.location.reload();
                    }} style={{ cursor: 'pointer' }}>
                        Reset Face ID
                    </div>
                )}
            </div>
        </div>
    );
}
