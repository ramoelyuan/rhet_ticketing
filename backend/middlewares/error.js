function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && typeof err.message === "string" && /only .+ images are allowed/i.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  const status = err.status || 500;
  const msg = err.expose ? err.message : "Server error";
  if (status >= 500) console.error(err);
  res.status(status).json({ error: msg });
}

module.exports = { notFound, errorHandler };

