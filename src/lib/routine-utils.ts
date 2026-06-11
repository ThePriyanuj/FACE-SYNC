export function logOfflineAttendance(studentId: string, courseCode: string, status: string) {
  const offlineLogs = JSON.parse(localStorage.getItem('offline_attendance_logs') || '[]');
  offlineLogs.push({
    studentId,
    courseCode,
    status,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('offline_attendance_logs', JSON.stringify(offlineLogs));
  console.log('Logged attendance offline:', { studentId, courseCode, status });
}

export function syncOfflineLogs() {
  const offlineLogs = JSON.parse(localStorage.getItem('offline_attendance_logs') || '[]');
  if (offlineLogs.length > 0) {
    console.log(`Attempting to sync ${offlineLogs.length} offline logs to Supabase...`);
    // Mock sync logic
    setTimeout(() => {
      console.log('Sync successful.');
      localStorage.removeItem('offline_attendance_logs');
    }, 1000);
  }
}
