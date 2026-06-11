import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { supabase } from '../lib/supabase-client';

interface Student {
  id: string;
  name: string;
  roll_number: string;
}

interface StudentEnrollmentProps {
  activeStudent: Student;
  onCancel: () => void;
  onSuccess: () => void;
}

export function StudentEnrollment({ activeStudent, onCancel, onSuccess }: StudentEnrollmentProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [systemStatus, setSystemStatus] = useState<string>('Initializing Camera...');
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Models and Camera
  useEffect(() => {
    let isMounted = true;

    async function loadModelsAndCamera() {
      try {
        setSystemStatus('Loading Neural Models...');
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);

        if (!isMounted) return;
        setSystemStatus('Acquiring Video Feed...');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video play error:", e));
          }
        }

        if (isMounted) {
          setIsInitializing(false);
          setSystemStatus('Ready to Scan');
        }
      } catch (error) {
        console.error("Initialization failed:", error);
        if (isMounted) {
          setSystemStatus('System Initialization Failed');
        }
      }
    }

    loadModelsAndCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndEnroll = useCallback(async () => {
    if (!videoRef.current || isUploading) return;

    setIsScanning(true);
    setSystemStatus('Analyzing Face...');

    try {
      const detection = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setSystemStatus('No face detected. Please look directly at the camera.');
        setIsScanning(false);
        return;
      }

      setSystemStatus('Face mapped. Uploading Biometrics...');
      setIsUploading(true);

      const descriptorArray = Array.from(detection.descriptor);
      const vectorString = `[${descriptorArray.join(',')}]`;

      const { error } = await supabase
        .from('students')
        .update({ face_embedding: vectorString })
        .eq('roll_number', activeStudent.roll_number);

      if (error) {
        console.error(error);
        setSystemStatus('Upload failed. Try again.');
        setIsUploading(false);
        setIsScanning(false);
        return;
      }

      setSystemStatus('Biometric ID Enrolled Successfully!');
      setTimeout(() => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error("Enrollment error:", error);
      setSystemStatus('Error capturing face.');
      setIsScanning(false);
      setIsUploading(false);
    }
  }, [activeStudent.roll_number, isUploading, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4 md:p-8 backdrop-blur-sm">
      <div className="max-w-xl w-full mx-auto flex flex-col h-full">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-light text-white">Biometric Enrollment</h2>
          <button
            onClick={() => {
              if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
              onCancel();
            }}
            className="text-xs tracking-wider uppercase text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
        </header>

        <div className="glass-accelerated p-6 rounded-2xl border border-white/15 bg-white/5 flex flex-col flex-1 relative">
          <div className="text-center mb-4">
            <h3 className="text-lg text-white">{activeStudent.name}</h3>
            <p className="text-sm text-slate-400">{activeStudent.roll_number}</p>
          </div>

          <div className="relative flex-1 rounded-xl border border-white/10 bg-black/50 overflow-hidden flex items-center justify-center min-h-[50vh]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`object-cover w-full h-full transition-opacity duration-300 ${isInitializing ? 'opacity-0' : 'opacity-100'}`}
            />

            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                <div className="h-8 w-8 rounded-full border-2 border-t-white border-white/20 animate-spin mb-4" />
                <p className="text-xs tracking-widest text-slate-400 uppercase">Initializing System</p>
              </div>
            )}

            {!isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-dashed border-white/30 rounded-full" />
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-300 mb-6 min-h-[20px]">{systemStatus}</p>
            <button
              onClick={captureAndEnroll}
              disabled={isInitializing || isScanning || isUploading}
              className={`w-full py-4 rounded-xl text-sm font-semibold tracking-wider uppercase transition ${isInitializing || isScanning || isUploading
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-slate-200'
                }`}
            >
              {isUploading ? 'Uploading...' : isScanning ? 'Scanning...' : 'Capture Face ID'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
