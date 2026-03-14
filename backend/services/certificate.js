const path = require("path");
const fs = require("fs");
const { pool } = require("../config/db");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getLogoBase64() {
  const candidates = [
    path.join(process.cwd(), "frontend", "public", "logo", "rhetlogo.png"),
    path.join(process.cwd(), "..", "frontend", "public", "logo", "rhetlogo.png"),
    path.join(__dirname, "..", "..", "frontend", "public", "logo", "rhetlogo.png"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        return `data:image/png;base64,${buf.toString("base64")}`;
      }
    } catch {
      // continue
    }
  }
  return null;
}

async function getTopTechnicianForMonth(month, year) {
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  if (!monthNum || monthNum < 1 || monthNum > 12 || !yearNum || yearNum < 2000) {
    return null;
  }
  const monthStart = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
  const { rows } = await pool.query(
    `
    SELECT
      u.full_name AS technician,
      COUNT(t.id)::int AS resolved_count
    FROM users u
    JOIN technicians tech ON tech.user_id = u.id
    LEFT JOIN tickets t ON t.assigned_technician_id = u.id
      AND t.status = 'RESOLVED'
      AND (t.resolved_at IS NOT NULL OR t.closed_at IS NOT NULL)
      AND COALESCE(t.resolved_at, t.closed_at) >= $1::date
      AND COALESCE(t.resolved_at, t.closed_at) < ($1::date + interval '1 month')
    WHERE u.role = 'TECHNICIAN' AND u.is_active = true
    GROUP BY u.full_name
    ORDER BY resolved_count DESC, technician ASC
    LIMIT 1
    `,
    [monthStart]
  );
  const row = rows[0];
  if (!row || row.resolved_count === 0) return null;
  return {
    technicianName: row.technician,
    resolvedCount: row.resolved_count,
    monthYearLabel: `${MONTHS[monthNum - 1]} ${yearNum}`,
    month: monthNum,
    year: yearNum,
  };
}

function buildCertificateHtml(data) {
  const logoBase64 = getLogoBase64();
  const logoImg = logoBase64
    ? `<img src="${logoBase64}" alt="RHET" class="logo" />`
    : '<div class="logo-text">RHET</div>';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>IT Support of the Month</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      width: 297mm;
      height: 210mm;
      margin: 0;
      padding: 15mm;
      background: #fff;
      color: #1a1a2e;
      position: relative;
      overflow: hidden;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-18deg);
      opacity: 0.06;
      pointer-events: none;
      font-size: 180px;
      font-weight: 700;
      color: #1a1a2e;
      white-space: nowrap;
    }
    .border-frame {
      position: absolute;
      inset: 10mm;
      border: 2px solid #c9a227;
      border-radius: 4px;
      pointer-events: none;
    }
    .content {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-align: center;
    }
    .top-section {
      width: 100%;
    }
    .logo {
      height: 52px;
      width: auto;
      margin-bottom: 12px;
      object-fit: contain;
    }
    .logo-text {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: #1a365d;
      margin-bottom: 12px;
    }
    .accent-line {
      width: 120px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #c9a227, transparent);
      margin: 0 auto 16px;
      border-radius: 2px;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      color: #1a365d;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .middle-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
    }
    .technician-name {
      font-size: 36px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    .month-year {
      font-size: 20px;
      color: #4a5568;
      margin-bottom: 24px;
      font-weight: 600;
    }
    .accent-line-mid {
      width: 80px;
      height: 2px;
      background: #2563eb;
      margin: 0 auto 20px;
      border-radius: 2px;
    }
    .award-text {
      font-size: 16px;
      line-height: 1.6;
      color: #2d3748;
      max-width: 520px;
      margin-bottom: 16px;
    }
    .resolved-count {
      font-size: 22px;
      font-weight: 700;
      color: #1a365d;
    }
    .bottom-section {
      width: 100%;
      padding-top: 20px;
    }
    .signature-line {
      border-top: 1px solid #2d3748;
      width: 200px;
      margin: 0 auto 4px;
      padding-top: 8px;
      font-size: 14px;
      color: #4a5568;
    }
    .date-issued {
      font-size: 13px;
      color: #718096;
    }
  </style>
</head>
<body>
  <div class="watermark" aria-hidden="true">RHET</div>
  <div class="border-frame" aria-hidden="true"></div>
  <div class="content">
    <div class="top-section">
      ${logoImg}
      <div class="accent-line"></div>
      <h1 class="title">IT Support of the Month</h1>
    </div>
    <div class="middle-section">
      <p class="technician-name">${escapeHtml(data.technicianName)}</p>
      <p class="month-year">${escapeHtml(data.monthYearLabel)}</p>
      <div class="accent-line-mid"></div>
      <p class="award-text">
        This certificate is awarded to <strong>${escapeHtml(data.technicianName)}</strong> in recognition of
        resolving the highest number of IT support tickets for the month.
      </p>
      <p class="resolved-count">${data.resolvedCount} ticket${data.resolvedCount !== 1 ? "s" : ""} resolved</p>
    </div>
    <div class="bottom-section">
      <div class="signature-line">IT Supervisor</div>
      <p class="date-issued">Date issued: ${escapeHtml(data.dateIssued)}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(s) {
  if (typeof s !== "string") return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function generatePdf(html) {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 10000,
    });
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: {
        top: "10mm",
        right: "15mm",
        bottom: "10mm",
        left: "15mm",
      },
      preferCSSPageSize: false,
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = {
  getTopTechnicianForMonth,
  buildCertificateHtml,
  generatePdf,
  MONTHS,
};
