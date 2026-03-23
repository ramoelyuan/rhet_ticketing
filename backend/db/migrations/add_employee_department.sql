-- Employee department (all EMPLOYEE users should have one set after seed)
ALTER TABLE users ADD COLUMN IF NOT EXISTS department text NULL;

COMMENT ON COLUMN users.department IS 'Department for EMPLOYEE role: HR, Accounting, Marketing, Ecommerce, Hogia, LCA, OPS, Curriculum';
