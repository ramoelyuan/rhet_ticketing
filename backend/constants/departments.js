/** Allowed employee departments (must match DB / UI). */
const DEPARTMENTS = [
  "HR",
  "Accounting",
  "Marketing",
  "Ecommerce",
  "Hogia",
  "LCA",
  "OPS",
  "Curriculum",
];

function isValidDepartment(value) {
  return typeof value === "string" && DEPARTMENTS.includes(value.trim());
}

module.exports = { DEPARTMENTS, isValidDepartment };
