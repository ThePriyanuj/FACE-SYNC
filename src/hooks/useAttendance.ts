import useSWR from 'swr';
import { useInsertMutation } from '@supabase-cache-helpers/postgrest-swr';
import { supabase } from '../lib/supabase-client';

// Fetching attendance logs with automatic cache key generation
export function useStudentAttendance(studentId: string) {
  return useSWR(
    studentId ? supabase
     .from('attendance_logs')
     .select('id, course_code, status, timestamp')
     .eq('student_id', studentId)
     .order('timestamp', { ascending: false }) : null,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );
}

// Optimized attendance submission utilizing the fast-path mutation pipeline
export function useSubmitAttendance() {
  const { trigger: recordLog, isMutating } = useInsertMutation(
    supabase.from('attendance_logs'),
    ['id'], // Primary Key
    null,   // No custom query string needed; relying on automatic cache expansion
    {
      disableAutoQuery: true, // Disables background query overhead to maximize throughput
      revalidateTables: [{ schema: 'public', table: 'attendance_logs' }]
    }
  );
  return { recordLog, isMutating };
}
