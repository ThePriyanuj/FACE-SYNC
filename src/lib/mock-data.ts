export interface Student {
  id: string;
  name: string;
  roll_number: string;
  remarks: string;
}

export interface Course {
  course_code: string;
  name: string;
  faculty: string;
  credits: number;
}

export interface ScheduleItem {
  id: string;
  course_code: string;
  day: string;
  time_slot: string;
  room_number: string;
}

export const MOCK_STUDENTS: Student[] = [
  { id: 'stud-01', name: 'ANTARIKHYA TONOY BORA', roll_number: '2481101163', remarks: 'Regular' },
  { id: 'stud-02', name: 'Apu Ahamed', roll_number: '2481101179', remarks: 'Regular' },
  { id: 'stud-03', name: 'Hrishikesh Dutta', roll_number: '2481101166', remarks: 'Regular' },
  { id: 'stud-04', name: 'Lateswar Moran', roll_number: '2481101167', remarks: 'Regular' },
  { id: 'stud-05', name: 'Malongkiri Dera', roll_number: '2481101168', remarks: 'Regular' },
  { id: 'stud-06', name: 'MAYUKH NATH', roll_number: '2481101169', remarks: 'Regular' },
  { id: 'stud-07', name: 'Pritom Kalita', roll_number: '2481101170', remarks: 'Regular' },
  { id: 'stud-08', name: 'Priyanuj Das', roll_number: '2481101171', remarks: 'Regular' },
  { id: 'stud-09', name: 'Rahul Gogoi', roll_number: '2481101172', remarks: 'Regular' },
  { id: 'stud-10', name: 'Raj Ghosh', roll_number: '2481101173', remarks: 'Regular' },
  { id: 'stud-11', name: 'ROSHAN RAUT', roll_number: '2481101174', remarks: 'Regular' },
  { id: 'stud-12', name: 'Sanrik Deuri', roll_number: '2481101175', remarks: 'Regular' },
  { id: 'stud-13', name: 'Satarupa Borkakati', roll_number: '2481101181', remarks: 'Regular' },
  { id: 'stud-14', name: 'Shruti Medhi', roll_number: '2481101176', remarks: 'Regular' },
  { id: 'stud-15', name: 'Sibasish Das', roll_number: '2481101177', remarks: 'Regular' },
  { id: 'stud-16', name: 'Sushree Sonowal', roll_number: '2481101178', remarks: 'Regular' },
  { id: 'stud-17', name: 'Arindom Goswami', roll_number: '2481101295', remarks: 'Transfer (from ETE)' },
  { id: 'stud-18', name: 'Shyam Nandan Pandey', roll_number: '2481101325', remarks: 'Transfer (from ETE)' },
  { id: 'stud-19', name: 'Himanta Medhi', roll_number: '2481101309', remarks: 'Transfer (from ETE)' },
  { id: 'stud-20', name: 'Netra Medhi', roll_number: '2481101420', remarks: 'Transfer (from ME)' },
  { id: 'stud-21', name: 'Jyotirmoy Hazarika', roll_number: '2581101001', remarks: 'Lateral Entry (2025)' },
  { id: 'stud-22', name: 'Abhi Das', roll_number: '2581101002', remarks: 'Lateral Entry (2025)' }
];

export const MOCK_COURSES: Course[] = [
  { course_code: 'CS241401', name: 'Database Management System (DBMS)', faculty: 'Riju Kalita', credits: 3 },
  { course_code: 'CS241402', name: 'Full Stack Application Development (FSAD)', faculty: 'Dipangshu Dutta', credits: 2 },
  { course_code: 'CS241403', name: 'Machine Learning (ML)', faculty: 'Mridul Jyoti Roy', credits: 3 },
  { course_code: 'CS241404', name: 'Computer Organization & Architecture (COA)', faculty: 'Gunajit Kalita', credits: 3 },
  { course_code: 'CS241405', name: 'Design and Analysis of Algorithms (DAA)', faculty: 'Dipangshu Dutta', credits: 3 },
  { course_code: 'HS241406', name: 'Finance and Accounting (FAA)', faculty: 'Humanities Dept.', credits: 3 },
  { course_code: 'AU241407', name: 'Environmental Science (ENVSC)', faculty: 'Humanities Dept.', credits: 0 },
  { course_code: 'CS241411', name: 'Database Management System Lab', faculty: 'Riju Kalita', credits: 1 },
  { course_code: 'CS241412', name: 'Full Stack Application Dev. Lab', faculty: 'Dipangshu Dutta', credits: 2 },
  { course_code: 'CS241413', name: 'Java Programming Lab', faculty: 'Rajashree Konwar', credits: 1 },
  { course_code: 'PR241415', name: 'Micro Project (Skill Based)', faculty: 'Dept. Assigned', credits: 2 }
];

export const MOCK_SCHEDULE: ScheduleItem[] = [
  // Monday
  { id: 'mon-1', course_code: 'AU241407', day: 'Monday', time_slot: '8:00 AM – 8:55 AM', room_number: 'Room 301' },
  { id: 'mon-2', course_code: 'HS241406', day: 'Monday', time_slot: '9:15 AM – 10:10 AM', room_number: 'Room 301' },
  { id: 'mon-3', course_code: 'CS241404', day: 'Monday', time_slot: '10:10 AM – 11:05 AM', room_number: 'Room 301' },
  { id: 'mon-4', course_code: 'PR241415', day: 'Monday', time_slot: '11:05 AM – 12:00 PM', room_number: 'Room 301' },
  { id: 'mon-5', course_code: 'CS241413', day: 'Monday', time_slot: '2:30 PM – 4:15 PM', room_number: 'Java Lab' },
  
  // Tuesday
  { id: 'tue-1', course_code: 'FC', day: 'Tuesday', time_slot: '8:00 AM – 8:55 AM', room_number: 'Common Room' },
  { id: 'tue-2', course_code: 'CS241405', day: 'Tuesday', time_slot: '9:15 AM – 10:10 AM', room_number: 'Room 301' },
  { id: 'tue-3', course_code: 'RC', day: 'Tuesday', time_slot: '10:10 AM – 11:05 AM', room_number: 'Library' },
  { id: 'tue-4', course_code: 'CS241404', day: 'Tuesday', time_slot: '11:05 AM – 12:00 PM', room_number: 'Room 301' },
  { id: 'tue-5', course_code: 'PR241415', day: 'Tuesday', time_slot: '2:30 PM – 4:15 PM', room_number: 'Project Lab' },

  // Wednesday
  { id: 'wed-1', course_code: 'CS241404', day: 'Wednesday', time_slot: '8:00 AM – 8:55 AM', room_number: 'Room 301' },
  { id: 'wed-2', course_code: 'CS241405', day: 'Wednesday', time_slot: '9:15 AM – 10:10 AM', room_number: 'Room 301' },
  { id: 'wed-3', course_code: 'CS241401', day: 'Wednesday', time_slot: '10:10 AM – 11:05 AM', room_number: 'Room 301' },
  { id: 'wed-4', course_code: 'CS241402', day: 'Wednesday', time_slot: '11:05 AM – 12:00 PM', room_number: 'Room 301' },
  { id: 'wed-5', course_code: 'CS241412', day: 'Wednesday', time_slot: '2:30 PM – 4:15 PM', room_number: 'FSAD Lab' },

  // Thursday
  { id: 'thu-1', course_code: 'FC', day: 'Thursday', time_slot: '8:00 AM – 8:55 AM', room_number: 'Common Room' },
  { id: 'thu-2', course_code: 'CS241405', day: 'Thursday', time_slot: '9:15 AM – 10:10 AM', room_number: 'Room 301' },
  { id: 'thu-3', course_code: 'CS241403', day: 'Thursday', time_slot: '10:10 AM – 11:05 AM', room_number: 'Room 301' },
  { id: 'thu-4', course_code: 'CS241401', day: 'Thursday', time_slot: '11:05 AM – 12:00 PM', room_number: 'Room 301' },
  { id: 'thu-5', course_code: 'CS241411', day: 'Thursday', time_slot: '2:30 PM – 4:15 PM', room_number: 'DBMS Lab' },

  // Friday
  { id: 'fri-1', course_code: 'HS241406', day: 'Friday', time_slot: '8:00 AM – 8:55 AM', room_number: 'Room 301' },
  { id: 'fri-2', course_code: 'AU241407', day: 'Friday', time_slot: '9:15 AM – 10:10 AM', room_number: 'Room 301' },
  { id: 'fri-3', course_code: 'CS241401', day: 'Friday', time_slot: '10:10 AM – 11:05 AM', room_number: 'Room 301' },
  { id: 'fri-4', course_code: 'CS241403', day: 'Friday', time_slot: '11:05 AM – 12:00 PM', room_number: 'Room 301' },
  { id: 'fri-5', course_code: 'CS241412', day: 'Friday', time_slot: '2:30 PM – 4:15 PM', room_number: 'FSAD Lab' },

  // Saturday
  { id: 'sat-1', course_code: 'RC', day: 'Saturday', time_slot: '8:00 AM – 8:55 AM', room_number: 'Library' },
  { id: 'sat-2', course_code: 'CS241402', day: 'Saturday', time_slot: '9:15 AM – 10:10 AM', room_number: 'Room 301' },
  { id: 'sat-3', course_code: 'HS241406', day: 'Saturday', time_slot: '10:10 AM – 11:05 AM', room_number: 'Room 301' },
  { id: 'sat-4', course_code: 'CS241403', day: 'Saturday', time_slot: '11:05 AM – 12:00 PM', room_number: 'Room 301' }
];
