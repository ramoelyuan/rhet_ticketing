function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const msg = err.expose ? err.message : "Server error";
  if (status >= 500) console.error(err);
  res.status(status).json({ error: msg });
}

module.exports = { notFound, errorHandler };

