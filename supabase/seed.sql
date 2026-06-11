-- =========================================================================
-- AEC DATABASE SEED DATA
-- =========================================================================

-- 1. Insert Courses
insert into public.courses (course_code, name, faculty_id) values
('CS241401', 'Database Management System (DBMS)', 'Riju Kalita'),
('CS241402', 'Full Stack Application Development (FSAD)', 'Dipangshu Dutta'),
('CS241403', 'Machine Learning (ML)', 'Mridul Jyoti Roy'),
('CS241404', 'Computer Organization & Architecture (COA)', 'Gunajit Kalita'),
('CS241405', 'Design and Analysis of Algorithms (DAA)', 'Dipangshu Dutta'),
('HS241406', 'Finance and Accounting (FAA)', 'Humanities Department'),
('AU241407', 'Environmental Science (ENVSC)', 'Humanities Department'),
('CS241411', 'Database Management System Lab', 'Riju Kalita'),
('CS241412', 'Full Stack Application Development Lab', 'Dipangshu Dutta'),
('CS241413', 'Java Programming Lab', 'Rajashree Konwar'),
('PR241415', 'Micro Project (Skill Based) (SBMP)', 'Department Assigned')
on conflict (course_code) do update set
  name = excluded.name,
  faculty_id = excluded.faculty_id;

-- 2. Insert Students
insert into public.students (roll_number, name) values
('2481101163', 'ANTARIKHYA TONOY BORA'),
('2481101179', 'Apu Ahamed'),
('2481101166', 'Hrishikesh Dutta'),
('2481101167', 'Lateswar Moran'),
('2481101168', 'Malongkiri Dera'),
('2481101169', 'MAYUKH NATH'),
('2481101170', 'Pritom Kalita'),
('2481101171', 'Priyanuj Das'),
('2481101172', 'Rahul Gogoi'),
('2481101173', 'Raj Ghosh'),
('2481101174', 'ROSHAN RAUT'),
('2481101175', 'Sanrik Deuri'),
('2481101181', 'Satarupa Borkakati'),
('2481101176', 'Shruti Medhi'),
('2481101177', 'Sibasish Das'),
('2481101178', 'Sushree Sonowal'),
('2481101295', 'Arindom Goswami'),
('2481101325', 'Shyam Nandan Pandey'),
('2481101309', 'Himanta Medhi'),
('2481101420', 'Netra Medhi'),
('2581101001', 'Jyotirmoy Hazarika'),
('2581101002', 'Abhi Das')
on conflict (roll_number) do update set
  name = excluded.name;

-- 3. Insert Schedule Timetable
insert into public.schedule (course_code, day, time_slot, room_number) values
-- Monday
('AU241407', 'Monday', '8:00 AM – 8:55 AM', 'Room 301'),
('HS241406', 'Monday', '9:15 AM – 10:10 AM', 'Room 301'),
('CS241404', 'Monday', '10:10 AM – 11:05 AM', 'Room 301'),
('PR241415', 'Monday', '11:05 AM – 12:00 PM', 'Room 301'),
('CS241413', 'Monday', '2:30 PM – 4:15 PM', 'Java Lab'),
-- Tuesday
('CS241405', 'Tuesday', '9:15 AM – 10:10 AM', 'Room 301'),
('CS241404', 'Tuesday', '11:05 AM – 12:00 PM', 'Room 301'),
('PR241415', 'Tuesday', '2:30 PM – 4:15 PM', 'Project Lab'),
-- Wednesday
('CS241404', 'Wednesday', '8:00 AM – 8:55 AM', 'Room 301'),
('CS241405', 'Wednesday', '9:15 AM – 10:10 AM', 'Room 301'),
('CS241401', 'Wednesday', '10:10 AM – 11:05 AM', 'Room 301'),
('CS241402', 'Wednesday', '11:05 AM – 12:00 PM', 'Room 301'),
('CS241412', 'Wednesday', '2:30 PM – 4:15 PM', 'FSAD Lab'),
-- Thursday
('CS241405', 'Thursday', '9:15 AM – 10:10 AM', 'Room 301'),
('CS241403', 'Thursday', '10:10 AM – 11:05 AM', 'Room 301'),
('CS241401', 'Thursday', '11:05 AM – 12:00 PM', 'Room 301'),
('CS241411', 'Thursday', '2:30 PM – 4:15 PM', 'DBMS Lab'),
-- Friday
('HS241406', 'Friday', '8:00 AM – 8:55 AM', 'Room 301'),
('AU241407', 'Friday', '9:15 AM – 10:10 AM', 'Room 301'),
('CS241401', 'Friday', '10:10 AM – 11:05 AM', 'Room 301'),
('CS241403', 'Friday', '11:05 AM – 12:00 PM', 'Room 301'),
('CS241412', 'Friday', '2:30 PM – 4:15 PM', 'FSAD Lab'),
-- Saturday
('CS241402', 'Saturday', '9:15 AM – 10:10 AM', 'Room 301'),
('HS241406', 'Saturday', '10:10 AM – 11:05 AM', 'Room 301'),
('CS241403', 'Saturday', '11:05 AM – 12:00 PM', 'Room 301');


-- =========================================================================
-- 4. READ ACCESS POLICIES FOR ANONYMOUS/AUTHENTICATED CLIENTS
-- =========================================================================
alter table public.students enable row level security;
alter table public.courses enable row level security;

drop policy if exists "Allow read access to everyone" on public.students;
drop policy if exists "Allow read access to everyone" on public.courses;
drop policy if exists "Allow read access to everyone" on public.schedule;

create policy "Allow read access to everyone" on public.students for select using (true);
create policy "Allow read access to everyone" on public.courses for select using (true);
create policy "Allow read access to everyone" on public.schedule for select using (true);
