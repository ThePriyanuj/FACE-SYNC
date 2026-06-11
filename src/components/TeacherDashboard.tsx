import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { supabase } from '../lib/supabase-client';

interface Course {
  course_code: string;
  name: string;
  faculty_id: string;
}

interface ScheduleItem {
  id: string;
  course_code: string;
  day: string;
  time_slot: string;
  room_number: string;
  course?: Course;
}

interface TeacherDashboardProps {
  activeFaculty: string;
  teacherTodayClasses: ScheduleItem[];
  defaultDay: string;
  onSignOut: () => void;
  onViewSchedule: () => void;
}

interface MatchedStudent {
  id: string;
  name: string;
  roll_number: string;
  email: string | null;
  similarity: number;
  timestamp: number;
}

export function TeacherDashboard({
  activeFaculty,
  teacherTodayClasses,
  defaultDay,
  onSignOut,
  onViewSchedule
}: TeacherDashboardProps) {
  const [selectedCourseCode, setSelectedCourseCode] = useState('');

  // Biometric & Session State
  const [isInitializing, setIsInitializing] = useState(true);
  const [systemStatus, setSystemStatus] = useState<string>('Initializing Models...');
  const [sessionAttendance, setSessionAttendance] = useState<MatchedStudent[]>([]);
  const [recentMatch, setRecentMatch] = useState<MatchedStudent | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastMatchTimeRef = useRef<number>(0);

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
            // Explicitly call play() for mobile browsers like iOS Safari
            videoRef.current.play().catch(e => console.error("Video play error:", e));
          }
        }

        if (isMounted) {
          setIsInitializing(false);
          setSystemStatus('Scanning Idle Stance');
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
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Biometric Processing Loop
  const processVideoFrame = useCallback(async function loop() {
    if (!videoRef.current || videoRef.current.readyState !== 4 || isInitializing || !selectedCourseCode) {
      requestRef.current = requestAnimationFrame(loop);
      return;
    }

    const now = Date.now();
    // Throttle to 1000ms
    if (now - lastMatchTimeRef.current >= 1000) {
      try {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.85 })
        )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          setSystemStatus('Processing Descriptor...');
          const descriptorArray = Array.from(detection.descriptor);

          // RPC Call to Match Face
          const { data, error } = await supabase.rpc('match_student_face', {
            match_embedding: descriptorArray,
            match_threshold: 0.90, // Increased for strict security
            match_count: 1
          });

          if (error) {
            console.error('RPC Error:', error);
          } else if (data && data.length > 0) {
            const match = data[0] as Omit<MatchedStudent, 'timestamp'>;

            // Check if already in session
            setSessionAttendance(prev => {
              const alreadyExists = prev.some(s => s.roll_number === match.roll_number);
              if (!alreadyExists) {
                const newMatch = { ...match, timestamp: Date.now() };
                setRecentMatch(newMatch);
                return [...prev, newMatch];
              }
              return prev;
            });

            setSystemStatus('Match Confirmed');
          } else {
            setSystemStatus('No Match Found');
          }
        } else {
          setSystemStatus('Active Scanning');
        }
      } catch (error) {
        console.error("Frame processing error:", error);
      }
      lastMatchTimeRef.current = Date.now();
    }

    requestRef.current = requestAnimationFrame(loop);
  }, [isInitializing, selectedCourseCode]);

  useEffect(() => {
    if (!isInitializing) {
      requestRef.current = requestAnimationFrame(processVideoFrame);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isInitializing, processVideoFrame]);

  // Clear recent match notification after a few seconds
  useEffect(() => {
    if (recentMatch) {
      const timer = setTimeout(() => {
        setRecentMatch(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [recentMatch]);

  const handleTerminateAndSync = async () => {
    if (!selectedCourseCode) {
      alert("Please select a class session first!");
      return;
    }

    if (sessionAttendance.length === 0) {
      alert("No students matched to sync.");
      return;
    }

    setSystemStatus('Synchronizing...');
    const todayDate = new Date().toISOString().split('T')[0];
    const recordsToInsert = sessionAttendance.map(s => ({
      student_roll: s.roll_number,
      course_code: selectedCourseCode,
      date: todayDate,
      status: 'Present'
    }));

    try {
      const { error } = await supabase.from('attendance').insert(recordsToInsert);

      if (error) {
        console.error(error);
        alert('Failed to submit attendance: ' + error.message);
        setSystemStatus('Sync Error');
      } else {
        alert(`Attendance synced successfully for ${recordsToInsert.length} students.`);

        // Comprehensive Cleanup
        setSessionAttendance([]);
        setRecentMatch(null);
        setSystemStatus('Scanning Idle Stance');

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setIsInitializing(true);
        setSelectedCourseCode(''); // Reset session

        // Optionally restart camera immediately to return to idle stance
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setIsInitializing(false);
        }).catch(err => console.error("Camera restart failed", err));
      }
    } catch (err) {
      console.error(err);
      alert('Network error during sync.');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen flex flex-col">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 md:mb-8 border-b border-white/10 pb-4 gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-light">Faculty Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Active Session: {activeFaculty}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={onViewSchedule} className="flex-1 md:flex-none text-xs tracking-wider uppercase border border-white/10 px-4 py-2.5 rounded-xl hover:bg-white/5 transition text-center">View Schedule</button>
          <button onClick={onSignOut} className="flex-1 md:flex-none text-xs tracking-wider uppercase text-slate-400 hover:text-white transition py-2.5 bg-white/5 md:bg-transparent rounded-xl text-center">Sign Out</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 flex-1">
        {/* Left Column: Camera Feed & Controller */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="glass-accelerated p-6 rounded-2xl border border-white/15 bg-white/5 flex flex-col h-full relative overflow-hidden">

            <div className="flex items-center justify-between mb-4 z-20">
              <div className="w-full max-w-xs">
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Class Session ({defaultDay})</span>
                <select
                  value={selectedCourseCode}
                  onChange={(e) => setSelectedCourseCode(e.target.value)}
                  className="mt-1 block bg-black/30 border border-white/10 rounded-lg text-sm text-white font-light p-2 w-full focus:outline-none transition"
                >
                  <option value="">Select Class...</option>
                  {teacherTodayClasses.length > 0 ? (
                    teacherTodayClasses.map(s => (
                      <option key={s.id} value={s.course_code}>
                        {s.course?.name} ({s.time_slot})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No classes scheduled today</option>
                  )}
                </select>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 block mb-1">Status</span>
                <div className="flex items-center gap-2 justify-end">
                  <span className={`h-2 w-2 rounded-full ${selectedCourseCode && !isInitializing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
                  <span className="text-xs text-white/80">{systemStatus}</span>
                </div>
              </div>
            </div>

            <div className="relative min-h-[50vh] md:min-h-0 md:flex-1 rounded-xl border border-white/10 bg-black/30 overflow-hidden flex items-center justify-center">
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
                <>
                  {selectedCourseCode && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="w-64 h-64 border-2 border-emerald-500/30 rounded-xl" />
                    </div>
                  )}
                  {/* HUD Elements */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-white/60 pointer-events-none z-10">
                    <span>FR_SYS_ACTIVE</span>
                    <span>REC</span>
                  </div>
                </>
              )}
            </div>

            {/* Profile Telemetry Slide-in Card */}
            {recentMatch && (
              <div className="absolute bottom-8 left-8 right-8 animate-bounce pointer-events-none z-30">
                <div className="glass-accelerated p-4 rounded-xl border border-emerald-500/30 bg-black/80 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-light text-white">{recentMatch.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{recentMatch.roll_number} {recentMatch.email ? `• ${recentMatch.email}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs block text-slate-400 uppercase tracking-widest mb-1">Confidence</span>
                    <span className="text-lg text-emerald-400 font-mono">{(recentMatch.similarity * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance Roster Check */}
        <div className="glass-accelerated p-6 border border-white/15 rounded-2xl bg-white/5 flex flex-col h-[500px] md:h-auto">
          <h2 className="text-xl font-light text-white mb-6 tracking-wide">Live Detection</h2>

          <div className="overflow-y-auto flex-1 pr-2 flex flex-col gap-3 mb-6">
            {sessionAttendance.length === 0 ? (
              <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl text-sm text-white/30 p-4 text-center">
                Awaiting student verification...
              </div>
            ) : (
              sessionAttendance.map((student, idx) => (
                <div
                  key={`${student.id}-${idx}`}
                  className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-black/20"
                >
                  <div>
                    <p className="text-sm text-white/90">{student.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{student.roll_number}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest">
                    Present
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleTerminateAndSync}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition"
          >
            Terminate & Sync
          </button>
        </div>
      </div>
    </div>
  );
}
