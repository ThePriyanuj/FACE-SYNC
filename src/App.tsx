import { useState } from 'react';
import useSWR from 'swr';
import { supabase } from './lib/supabase-client';
import { NeuralLogicErrorBoundary } from './components/NeuralLogicErrorBoundary';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentEnrollment } from './components/StudentEnrollment';

interface Student {
  id: string;
  name: string;
  roll_number: string;
  remarks?: string;
}

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

interface AttendanceRecord {
  id: string;
  student_roll: string;
  course_code: string;
  date: string;
  status: 'Present' | 'Absent';
}

type ViewState = 'entry' | 'auth' | 'teacher_dashboard' | 'student_dashboard' | 'schedule';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('entry');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);

  const [studentRoll, setStudentRoll] = useState('');
  const [activeFaculty, setActiveFaculty] = useState('Dipangshu Dutta');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const currentWeekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const defaultDay = currentWeekday === 'Sunday' ? 'Monday' : currentWeekday;
  const todayDate = new Date().toISOString().split('T')[0];

  const [scheduleDay, setScheduleDay] = useState(defaultDay);

  // Dynamic Supabase Fetches using SWR with Fault Protection
  const { data: students = [], error: studentsError } = useSWR('students_data', async () => {
    try {
      const { data, error } = await supabase.from('students').select('*').order('roll_number');
      if (error) throw error;
      return data as Student[];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const { data: courses = [], error: coursesError } = useSWR('courses_data', async () => {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('name');
      if (error) throw error;
      return data as Course[];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const { data: schedule = [], error: scheduleError } = useSWR('schedule_data', async () => {
    try {
      const { data, error } = await supabase.from('schedule').select('*');
      if (error) throw error;
      return data as ScheduleItem[];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const { data: attendanceLog = [], error: attendanceError } = useSWR('attendance_data', async () => {
    try {
      const { data, error } = await supabase.from('attendance').select('*');
      if (error && error.code === '42P01') return []; // Relation does not exist
      if (error) throw error;
      return data as AttendanceRecord[];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const navigateTo = (view: ViewState) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsTransitioning(false);
    }, 150);
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.roll_number === studentRoll);
    if (student) {
      setActiveStudent(student);
      navigateTo('student_dashboard');
    } else {
      alert('Roll number not found in live Supabase database!');
    }
  };

  const daySchedule = schedule.filter(s => s.day === scheduleDay);

  const teacherTodayClasses = schedule
    .filter(s => s.day === defaultDay)
    .map(s => {
      const course = courses.find(c => c.course_code === s.course_code);
      return { ...s, course };
    })
    .filter(s => s.course && s.course.faculty_id === activeFaculty);

  const studentTodayClasses = schedule
    .filter(s => s.day === defaultDay)
    .map(s => {
      const course = courses.find(c => c.course_code === s.course_code);
      return { ...s, course };
    })
    .filter(s => s.course);

  const isDataLoading = !studentsError && !coursesError && !scheduleError && !attendanceError && (students.length === 0 || courses.length === 0);
  const hasError = studentsError || coursesError || scheduleError || attendanceError;

  return (
    <NeuralLogicErrorBoundary>
      <div className={`w-full transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

        {hasError && (
          <div className="flex h-screen items-center justify-center p-4">
            <div className="glass-accelerated p-6 rounded-2xl border border-red-500/30 bg-red-500/10 max-w-md w-full">
              <h2 className="text-lg font-semibold text-red-400 mb-2">Supabase Sync Error</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                The application detected a connection fault with the core database.
              </p>
              <div className="bg-black/30 rounded-xl p-3 border border-white/5 font-mono text-[10px] text-slate-400 overflow-x-auto">
                <p>Students Fault: {studentsError?.message || 'Clear'}</p>
                <p>Courses Fault: {coursesError?.message || 'Clear'}</p>
                <p>Schedule Fault: {scheduleError?.message || 'Clear'}</p>
                <p>Attendance Fault: {attendanceError?.message || 'Clear'}</p>
              </div>
              <button onClick={() => window.location.reload()} className="mt-4 w-full bg-white/10 border border-white/20 py-2.5 rounded-xl text-xs uppercase hover:bg-white/20 transition">
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {!hasError && isDataLoading && (
          <div className="flex h-screen items-center justify-center flex-col gap-4">
            <div className="h-8 w-8 rounded-full border-2 border-t-white border-white/20 animate-spin" />
            <p className="text-[10px] tracking-widest text-slate-400 uppercase">Synchronizing...</p>
          </div>
        )}

        {!hasError && !isDataLoading && (
          <>
            {/* Entry View */}
            {currentView === 'entry' && (
              <div className="flex min-h-[100dvh] items-center justify-center flex-col gap-6 p-4">
                <h1 className="text-4xl md:text-5xl font-extralight tracking-widest text-white/90 text-center">Face:Sync</h1>
                <p className="text-slate-400 text-xs md:text-sm tracking-wide text-center max-w-sm">Assam Engineering College • CSE 4th Semester</p>
                <button onClick={() => navigateTo('auth')} className="glass-accelerated rounded-2xl px-8 py-3 md:px-10 md:py-4 text-xs md:text-sm tracking-widest uppercase transition-all duration-200 border border-white/20 bg-white/10 hover:bg-white/20">
                  Initialize System
                </button>
              </div>
            )}

            {/* Auth Selection View */}
            {currentView === 'auth' && (
              <div className="flex min-h-[100dvh] items-center justify-center p-4">
                <div className="glass-accelerated p-6 md:p-8 rounded-2xl flex flex-col gap-6 w-full max-w-md border border-white/20 bg-white/5 backdrop-blur-lg">
                  <h2 className="text-2xl font-light text-center tracking-wide text-white">System Authentication</h2>

                  {/* Student Login Form */}
                  <form onSubmit={handleStudentLogin} className="flex flex-col gap-3 border-b border-white/10 pb-6">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Student Access</label>
                    <input
                      type="text"
                      placeholder="Enter 10-Digit Roll No (e.g. 2481101171)"
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/40 text-white transition"
                    />
                    <button type="submit" className="border border-white/20 px-6 py-2.5 rounded-xl hover:bg-white/10 text-white transition text-sm">
                      Student Verification
                    </button>
                  </form>

                  {/* Faculty Access */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faculty Dashboard</label>
                    <select
                      value={activeFaculty}
                      onChange={(e) => setActiveFaculty(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none text-white transition"
                    >
                      <option value="Dipangshu Dutta">Dipangshu Dutta (FSAD/DAA)</option>
                      <option value="Riju Kalita">Riju Kalita (DBMS)</option>
                      <option value="Mridul Jyoti Roy">Mridul Jyoti Roy (ML)</option>
                      <option value="Gunajit Kalita">Gunajit Kalita (COA)</option>
                      <option value="Rajashree Konwar">Rajashree Konwar (Java)</option>
                    </select>
                    <button onClick={() => navigateTo('teacher_dashboard')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl transition text-sm">
                      Faculty Access
                    </button>
                  </div>

                  <button onClick={() => navigateTo('entry')} className="text-xs tracking-widest text-slate-500 hover:text-white transition text-center mt-2">Back to main screen</button>
                </div>
              </div>
            )}

            {/* Teacher / Faculty Dashboard */}
            {currentView === 'teacher_dashboard' && (
              <TeacherDashboard
                activeFaculty={activeFaculty}
                teacherTodayClasses={teacherTodayClasses}
                defaultDay={defaultDay}
                onSignOut={() => navigateTo('auth')}
                onViewSchedule={() => navigateTo('schedule')}
              />
            )}

            {/* Student Dashboard */}
            {currentView === 'student_dashboard' && activeStudent && (
              <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-[100dvh]">
                <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 md:mb-8 border-b border-white/10 pb-4 gap-4 md:gap-0">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-light text-white tracking-wide">AEC Student Portal</h1>
                    <p className="text-xs text-slate-400 mt-1">{activeStudent.remarks || 'Regular'} Student</p>
                  </div>
                  <button onClick={() => navigateTo('auth')} className="w-full md:w-auto text-xs tracking-wider uppercase text-slate-400 hover:text-white transition py-2.5 bg-white/5 md:bg-transparent rounded-xl text-center">Sign Out</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {/* Profile Card */}
                  <div className="glass-accelerated p-6 rounded-2xl border border-white/15 bg-white/5">
                    <div className="h-16 w-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-light text-white mb-4">
                      {activeStudent.name[0]}
                    </div>
                    <h2 className="text-xl font-light text-white">{activeStudent.name}</h2>
                    <p className="text-sm text-slate-400 font-mono mt-1">{activeStudent.roll_number}</p>
                    <div className="mt-6 border-t border-white/10 pt-4 flex flex-col gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Department</p>
                        <p className="text-sm text-slate-300 mt-1">Computer Science & Engineering</p>
                      </div>
                      <button
                        onClick={() => setShowEnrollment(true)}
                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-xl text-xs tracking-wider uppercase transition"
                      >
                        Enroll Biometrics
                      </button>
                    </div>
                  </div>

                  {/* Attendance Log Card */}
                  <div className="md:col-span-2 glass-accelerated p-6 rounded-2xl border border-white/15 bg-white/5">
                    <h3 className="text-lg font-light text-white mb-4">Today's Class ({defaultDay})</h3>
                    <div className="flex flex-col gap-3">
                      {studentTodayClasses.length > 0 ? (
                        studentTodayClasses.map(sched => {
                          const course = courses.find(c => c.course_code === sched.course_code);
                          const attRecord = attendanceLog.find(a =>
                            a.student_roll === activeStudent.roll_number &&
                            a.course_code === sched.course_code &&
                            a.date === todayDate
                          );

                          let statusText = "No class yet";
                          let statusClass = "bg-white/5 border-white/10 text-slate-400";

                          if (attRecord) {
                            if (attRecord.status === 'Present') {
                              statusText = "Present";
                              statusClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                            } else {
                              statusText = "Absent";
                              statusClass = "bg-rose-500/10 border-rose-500/20 text-rose-400";
                            }
                          }

                          return (
                            <div key={sched.id} className="flex justify-between items-center border-b border-white/5 pb-4 pt-2">
                              <div>
                                <p className="text-sm font-light text-white/90">{course?.name || sched.course_code}</p>
                                <p className="text-xs text-slate-400 mt-1">{sched.course_code} • {sched.time_slot} • Faculty: {course?.faculty_id}</p>
                              </div>
                              <span className={`text-xs px-2.5 py-1 rounded-full border ${statusClass}`}>
                                {statusText}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-slate-500 font-light p-4 text-center">No classes scheduled today</p>
                      )}
                    </div>
                  </div>
                </div>

                {showEnrollment && (
                  <StudentEnrollment
                    activeStudent={activeStudent}
                    onCancel={() => setShowEnrollment(false)}
                    onSuccess={() => setShowEnrollment(false)}
                  />
                )}
              </div>
            )}

            {/* Schedule View */}
            {currentView === 'schedule' && (
              <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-[100dvh]">
                <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 md:mb-8 border-b border-white/10 pb-4 gap-4 md:gap-0">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-light text-white">Class Timetable</h1>
                    <p className="text-xs text-slate-400 mt-1">Assam Engineering College • CSE 4th Sem</p>
                  </div>
                  <button onClick={() => navigateTo('teacher_dashboard')} className="w-full md:w-auto text-xs tracking-wider uppercase text-slate-400 hover:text-white transition py-2.5 bg-white/5 md:bg-transparent rounded-xl text-center">Back</button>
                </header>

                {/* Day Selector */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <button
                      key={day}
                      onClick={() => setScheduleDay(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition border ${scheduleDay === day ? 'bg-white text-black border-white' : 'border-white/10 text-slate-400 hover:text-white hover:border-white/30'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  {daySchedule.length > 0 ? (
                    daySchedule.map(sched => {
                      const course = courses.find(c => c.course_code === sched.course_code);
                      return (
                        <div key={sched.id} className="glass-accelerated p-6 rounded-xl flex justify-between items-center border border-white/10 bg-white/5">
                          <div>
                            <h3 className="text-lg font-light text-white">{sched.time_slot}</h3>
                            <p className="text-sm text-slate-300 mt-1 font-light">{course ? course.name : sched.course_code}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{sched.room_number} • Faculty: {course ? course.faculty_id : 'N/A'}</p>
                          </div>
                          <span className="text-slate-400 px-3 py-1 bg-white/5 rounded-full text-xs uppercase tracking-widest border border-white/10">
                            {sched.course_code}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-500 font-light">No classes scheduled for {scheduleDay}.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </NeuralLogicErrorBoundary>
  );
}
