BEGIN;

-- Teacher employee accounts (password: Te@cher-1234)
-- Hash generated via bcryptjs with cost 10.
INSERT INTO users (full_name, email, password_hash, role)
VALUES
  ('Janelle Juanillo', 't.janelle@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Loriejane Dela Cruz', 't.lorie@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Jenny Coronado', 't.nini@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Minerva Avendano', 't.min@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Eduardo Diestro', 't.ed@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Christina Prima', 't.ina@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Giezel Mc Arol Baldres', 't.gie@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Keneith Gad', 't.keneith@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Dory Fernandez', 't.dory@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Yvette Sarmiento', 't.yvette@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Ronnalyn Gornal', 't.ronna@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Mary Rose Manio', 't.maryrose@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Rechelle Manalon', 't.rechelle@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Rosana Libiran', 't.rosana@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Emelita Servio', 't.emelita@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Tricia May Manuel', 't.tricia@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Joyce Reyes', 't.joyce@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Edlyn Dulay', 't.edlyn@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Rizelle Wy', 't.rizelle@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Dhenne Kelly Dela Cruz', 't.dhenne@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Sherlyn Alfaro', 't.shey@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Nikka Tilan', 't.nikka@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Pearl Ivy Cabiladas', 't.pearl@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Julie Jae Locsin', 't.julie@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Angela Asaral', 't.angela@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Anna Grace Felix', 't.annafelix@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Jennilyn Dela Cruz', 't.jenny@rhet-corp.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE'),
  ('Thrisha Mae Santos', 't.thrisha@little-champion.com', '$2b$10$Ffk63WERmtKbznpM04yTz.j8zAAD00TS3yBJuKvA3zBNng5XCk5Ci', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;

COMMIT;

