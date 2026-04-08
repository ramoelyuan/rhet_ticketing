 -- Run after add_employee_department.sql. Matches employees by full_name (ILIKE, trimmed).
-- Ops1: deactivated (cannot hard-delete if tickets reference user).

BEGIN;

UPDATE users SET department = 'Ecommerce' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Abby Guiab';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Angela Asaral';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Anna Grace Felix';
UPDATE users SET department = 'HR' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Anna Mae Lago';
UPDATE users SET department = 'Curriculum' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Anne Trisha Sacdalan';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Ashley Nuguid';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Carla Gabriel';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Cha Ablaza';
UPDATE users SET department = 'Accounting' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Charnelle Joselle Delos Santos';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Christina Prima';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Clarise';
UPDATE users SET department = 'Curriculum' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Daniel Ray Datoon';
UPDATE users SET department = 'Hogia' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Darline Admin';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Dhenne Kelly Dela Cruz';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Dory Fernandez';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Edlyn Dulay';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Eduardo Diestro';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Emelita Servio';
UPDATE users SET department = 'Hogia' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Emilie';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Giezel Mc Arol Baldres';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Ishi';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Janelle Juanillo';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Jennilyn Dela Cruz';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Jenny Coronado';
UPDATE users SET department = 'Hogia' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Jherin Santos';
UPDATE users SET department = 'Curriculum' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Jose Ivan Domingo';
UPDATE users SET department = 'Hogia' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Joseph Alba';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Joyce Reyes';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Julie Jae Locsin';
UPDATE users SET department = 'Hogia' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Juve Sta. Ana';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Keneith Gad';
UPDATE users SET department = 'HR' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Kersten Ventura';
UPDATE users SET department = 'Curriculum' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Lara Mae Berboso';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Lhean Shamelle Bernabe';
UPDATE users SET department = 'LCA' WHERE role = 'EMPLOYEE' AND (TRIM(full_name) ILIKE 'littlechampionacademy' OR TRIM(email) ILIKE 'littlechampionacademy%');
UPDATE users SET department = 'LCA' WHERE role = 'EMPLOYEE' AND (TRIM(full_name) ILIKE 'littlechampionsguiguinto' OR TRIM(email) ILIKE 'littlechampionsguiguinto%');
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Loriejane Dela Cruz';
UPDATE users SET department = 'Curriculum' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Maria Carmela Bartolome';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Mary Rose Manio';
UPDATE users SET department = 'Curriculum' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Mharla Nicole Santiago';
UPDATE users SET department = 'HR' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Michelle Gaspar';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Mikee';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Minerva Avendano';
UPDATE users SET department = 'Ecommerce' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Nicole Medina';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Nikka Tilan';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Nina';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Pearl Ivy Cabiladas';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Rechelle Manalon';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Rizelle Wy';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Ronnalyn Gornal';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Rosana Libiran';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'se.mj';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Sherlyn Alfaro';
UPDATE users SET department = 'Marketing' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Test Employee';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Thrisha Mae Santos';
UPDATE users SET department = 'Accounting' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Trainee1';
UPDATE users SET department = 'Accounting' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Trainee2';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Tricia May Manuel';
UPDATE users SET department = 'OPS' WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Yvette Sarmiento';

-- Ops1: deactivate (FK from tickets prevents hard delete)
UPDATE users SET is_active = false WHERE role = 'EMPLOYEE' AND TRIM(full_name) ILIKE 'Ops1';

COMMIT;
