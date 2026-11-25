import { useEffect, useRef, useState } from "react";

export default function MenuCamera({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [capturing, setCapturing] = useState(false);
  useEffect(() => {
    let active = true;
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false });
        if (!active) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        if (active) setReady(true);
      } catch { if (active) setError(window.isSecureContext ? "カメラを開けませんでした。ブラウザのカメラ許可をご確認ください。" : "カメラを使うにはHTTPSのページを開いてください。写真の選択はそのまま利用できます。"); }
    };
    void start();
    return () => { active = false; streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };
  }, []);
  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth || capturing) return;
    setCapturing(true);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) onCapture(new File([blob], "menu-camera.jpg", { type: "image/jpeg" }));
      else { setError("撮影できませんでした。もう一度お試しください。"); setCapturing(false); }
    }, "image/jpeg", 0.9);
  };
  return <section className="staffCamera" aria-label="メニューをカメラで撮影"><h2>カメラで撮る</h2>{error && <p className="staffError" role="alert">{error}</p>}<video ref={videoRef} autoPlay playsInline muted className="staffPhoto" /><div className="staffPhotoActions"><button type="button" disabled={!ready || capturing} onClick={capture}>撮影する</button><button type="button" onClick={onClose}>閉じる</button></div></section>;
}
