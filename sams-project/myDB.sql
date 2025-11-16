CREATE DATABASE sams_db;
USE sams_db;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student', 'teacher') NOT NULL,
  program VARCHAR(100) DEFAULT NULL,
  course VARCHAR(100) DEFAULT NULL,
  level VARCHAR(50) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  year_level VARCHAR(50) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Sample seed users
-- Passwords (plaintext) for login testing:
--   admin123, teacher123, student123
INSERT INTO users (name, email, password_hash, role)
VALUES
  ('System Admin', 'admin@sams.local', '$2a$10$am562K3mxBZvIiuWis/9dOmzkCumWaF9VY6zgOTakCNAoCUoQoCaG', 'admin'),
  ('Sample Teacher', 'teacher@sams.local', '$2a$10$T.dVWFC.QPRXBkjfO1WedOTfQtfmPFkA4TsIMqGjPCu8kuInT2d52', 'teacher'),
  ('Sample Student', 'student@sams.local', '$2a$10$fr.we2LTFpuXL9fG8tniCejsq16WqW0tziz8I.uP1ye3zVP1KCNyi', 'student');

CREATE TABLE IF NOT EXISTS classes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,         -- e.g. BSIT 1A, Grade 10 - St. Paul
  section VARCHAR(50) DEFAULT NULL,   -- optional extra label
  school_year VARCHAR(20) DEFAULT NULL, -- e.g. 2024-2025
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subjects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,          -- e.g. IT101, MATH10
  name VARCHAR(150) NOT NULL,         -- e.g. Introduction to IT
  description VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subject_code (code)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enrollment (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  student_id INT UNSIGNED NOT NULL,
  subject_id INT UNSIGNED NOT NULL,
  class_id INT UNSIGNED DEFAULT NULL,   -- optional: which section
  teacher_id INT UNSIGNED NOT NULL,     -- teacher handling this student+subject

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_enrollment_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_enrollment_teacher
    FOREIGN KEY (teacher_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_enrollment_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_enrollment_class
    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE SET NULL,

  -- avoid duplicate enrollment of same student in same subject/class/teacher
  CONSTRAINT uq_enrollment UNIQUE (student_id, subject_id, class_id, teacher_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  enrollment_id INT UNSIGNED NOT NULL,    -- which student+subject (and class/teacher)
  attendance_date DATE NOT NULL,
  status ENUM('present','late','absent') NOT NULL,
  recorded_by INT UNSIGNED NOT NULL,      -- the teacher user id
  remarks VARCHAR(255) DEFAULT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL,

  CONSTRAINT fk_attendance_enrollment
    FOREIGN KEY (enrollment_id) REFERENCES enrollment(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_attendance_recorded_by
    FOREIGN KEY (recorded_by) REFERENCES users(id)
    ON DELETE RESTRICT,

  -- one record per student+subject per date
  CONSTRAINT uq_attendance UNIQUE (enrollment_id, attendance_date)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Quickly find enrollments per student, teacher, or subject
CREATE INDEX idx_enrollment_student ON enrollment(student_id);
CREATE INDEX idx_enrollment_teacher ON enrollment(teacher_id);
CREATE INDEX idx_enrollment_subject ON enrollment(subject_id);

-- Speed up date-range attendance reports
CREATE INDEX idx_attendance_date ON attendance(attendance_date);

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_record_attendance $$
CREATE PROCEDURE sp_record_attendance(
  IN p_enrollment_id INT UNSIGNED,
  IN p_attendance_date DATE,
  IN p_status VARCHAR(10),
  IN p_recorded_by INT UNSIGNED,
  IN p_remarks VARCHAR(255)
)
BEGIN
  DECLARE existing_id INT UNSIGNED;

  SELECT id INTO existing_id
  FROM attendance
  WHERE enrollment_id = p_enrollment_id
    AND attendance_date = p_attendance_date
  LIMIT 1;

  IF existing_id IS NULL THEN
    INSERT INTO attendance (
      enrollment_id,
      attendance_date,
      status,
      recorded_by,
      remarks,
      created_at,
      updated_at
    )
    VALUES (
      p_enrollment_id,
      p_attendance_date,
      p_status,
      p_recorded_by,
      p_remarks,
      NOW(),
      NOW()
    );
  ELSE
    UPDATE attendance
    SET
      status = p_status,
      recorded_by = p_recorded_by,
      remarks = p_remarks,
      updated_at = NOW()
    WHERE id = existing_id;
  END IF;
END $$

DROP FUNCTION IF EXISTS fn_attendance_percentage $$
CREATE FUNCTION fn_attendance_percentage(
  p_enrollment_id INT UNSIGNED,
  p_start_date DATE,
  p_end_date DATE
) RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
  DECLARE v_total INT DEFAULT 0;
  DECLARE v_present INT DEFAULT 0;
  DECLARE v_result DECIMAL(5,2);

  SELECT COUNT(*) INTO v_total
  FROM attendance
  WHERE enrollment_id = p_enrollment_id
    AND attendance_date BETWEEN p_start_date AND p_end_date;

  IF v_total = 0 THEN
    RETURN NULL;
  END IF;

  SELECT COUNT(*) INTO v_present
  FROM attendance
  WHERE enrollment_id = p_enrollment_id
    AND attendance_date BETWEEN p_start_date AND p_end_date
    AND status IN ('present','late');

  SET v_result = ROUND((v_present * 100.0) / v_total, 2);
  RETURN v_result;
END $$

DROP PROCEDURE IF EXISTS sp_get_student_attendance_summary $$
CREATE PROCEDURE sp_get_student_attendance_summary(
  IN p_student_id INT UNSIGNED,
  IN p_subject_id INT UNSIGNED,
  IN p_start_date DATE,
  IN p_end_date DATE
)
BEGIN
  SELECT
    s.id AS student_id,
    s.name AS student_name,
    subj.id AS subject_id,
    subj.code AS subject_code,
    subj.name AS subject_name,
    c.id AS class_id,
    c.name AS class_name,
    c.section,
    c.school_year,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late_count,
    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
    COUNT(a.id) AS total_sessions,
    fn_attendance_percentage(e.id, p_start_date, p_end_date) AS attendance_percentage
  FROM enrollment e
  JOIN users s ON s.id = e.student_id
  JOIN subjects subj ON subj.id = e.subject_id
  LEFT JOIN classes c ON c.id = e.class_id
  LEFT JOIN attendance a
    ON a.enrollment_id = e.id
   AND a.attendance_date BETWEEN p_start_date AND p_end_date
  WHERE e.student_id = p_student_id
    AND (p_subject_id IS NULL OR e.subject_id = p_subject_id)
  GROUP BY
    s.id,
    s.name,
    subj.id,
    subj.code,
    subj.name,
    c.id,
    c.name,
    c.section,
    c.school_year;
END $$

DROP PROCEDURE IF EXISTS sp_get_class_attendance_summary $$
CREATE PROCEDURE sp_get_class_attendance_summary(
  IN p_class_id INT UNSIGNED,
  IN p_subject_id INT UNSIGNED,
  IN p_start_date DATE,
  IN p_end_date DATE
)
BEGIN
  SELECT
    c.id AS class_id,
    c.name AS class_name,
    c.section,
    c.school_year,
    subj.id AS subject_id,
    subj.code AS subject_code,
    subj.name AS subject_name,
    s.id AS student_id,
    s.name AS student_name,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late_count,
    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
    COUNT(a.id) AS total_sessions,
    fn_attendance_percentage(e.id, p_start_date, p_end_date) AS attendance_percentage
  FROM enrollment e
  JOIN users s ON s.id = e.student_id
  JOIN subjects subj ON subj.id = e.subject_id
  JOIN classes c ON c.id = e.class_id
  LEFT JOIN attendance a
    ON a.enrollment_id = e.id
   AND a.attendance_date BETWEEN p_start_date AND p_end_date
  WHERE e.class_id = p_class_id
    AND (p_subject_id IS NULL OR e.subject_id = p_subject_id)
  GROUP BY
    c.id,
    c.name,
    c.section,
    c.school_year,
    subj.id,
    subj.code,
    subj.name,
    s.id,
    s.name;
END $$

DROP VIEW IF EXISTS vw_enrollment_detail $$
CREATE VIEW vw_enrollment_detail AS
SELECT
  e.id AS enrollment_id,
  s.id AS student_id,
  s.name AS student_name,
  s.email AS student_email,
  t.id AS teacher_id,
  t.name AS teacher_name,
  subj.id AS subject_id,
  subj.code AS subject_code,
  subj.name AS subject_name,
  c.id AS class_id,
  c.name AS class_name,
  c.section,
  c.school_year,
  e.created_at
FROM enrollment e
JOIN users s ON s.id = e.student_id AND s.role = 'student'
JOIN users t ON t.id = e.teacher_id AND t.role = 'teacher'
JOIN subjects subj ON subj.id = e.subject_id
LEFT JOIN classes c ON c.id = e.class_id $$

DROP VIEW IF EXISTS vw_attendance_detail $$
CREATE VIEW vw_attendance_detail AS
SELECT
  a.id AS attendance_id,
  a.attendance_date,
  a.status,
  a.remarks,
  a.created_at,
  a.updated_at,
  e.id AS enrollment_id,
  s.id AS student_id,
  s.name AS student_name,
  t.id AS teacher_id,
  t.name AS teacher_name,
  subj.id AS subject_id,
  subj.code AS subject_code,
  subj.name AS subject_name,
  c.id AS class_id,
  c.name AS class_name,
  c.section,
  c.school_year
FROM attendance a
JOIN enrollment e ON e.id = a.enrollment_id
JOIN users s ON s.id = e.student_id AND s.role = 'student'
JOIN users t ON t.id = e.teacher_id AND t.role = 'teacher'
JOIN subjects subj ON subj.id = e.subject_id
LEFT JOIN classes c ON c.id = e.class_id $$

DELIMITER ;