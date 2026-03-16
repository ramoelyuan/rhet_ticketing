const {
  getTopTechnicianForMonth,
  getTopTechnicianByRatingForMonth,
  buildCertificateHtml,
  generatePdf,
} = require("../services/certificate");

async function getTechnicianOfTheMonthCertificate(req, res, next) {
  try {
    const rawMonth = req.query.month;
    const rawYear = req.query.year;
    const now = new Date();
    const month = rawMonth ? String(rawMonth).trim() : String(now.getMonth() + 1);
    const year = rawYear ? String(rawYear).trim() : String(now.getFullYear());

    const top = await getTopTechnicianForMonth(month, year);
    if (!top) {
      return res.status(404).json({
        error: "No technician with resolved tickets found for the selected month and year.",
      });
    }

    const dateIssued = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const html = buildCertificateHtml({
      technicianName: top.technicianName,
      monthYearLabel: top.monthYearLabel,
      resolvedCount: top.resolvedCount,
      dateIssued,
    });

    const pdfBuffer = await generatePdf(html);

    const safeMonth = top.monthYearLabel.replace(/\s+/g, "-");
    const filename = `IT-Support-of-the-Month-${safeMonth}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    const message = err.message || "Certificate generation failed";
    if (!res.headersSent) {
      return res.status(500).json({ error: message });
    }
    next(err);
  }
}

async function getTechnicianOfTheMonthByRatingCertificate(req, res, next) {
  try {
    const rawMonth = req.query.month;
    const rawYear = req.query.year;
    const now = new Date();
    const month = rawMonth ? String(rawMonth).trim() : String(now.getMonth() + 1);
    const year = rawYear ? String(rawYear).trim() : String(now.getFullYear());

    const top = await getTopTechnicianByRatingForMonth(month, year);
    if (!top) {
      return res.status(404).json({
        error: "No technician with employee ratings found for the selected month and year.",
      });
    }

    const dateIssued = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const html = buildCertificateHtml({
      technicianName: top.technicianName,
      dateIssued,
    });

    const pdfBuffer = await generatePdf(html);

    const safeMonth = top.monthYearLabel.replace(/\s+/g, "-");
    const filename = `IT-Support-of-the-Month-by-Rating-${safeMonth}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    const message = err.message || "Certificate generation failed";
    if (!res.headersSent) {
      return res.status(500).json({ error: message });
    }
    next(err);
  }
}

module.exports = {
  getTechnicianOfTheMonthCertificate,
  getTechnicianOfTheMonthByRatingCertificate,
};
