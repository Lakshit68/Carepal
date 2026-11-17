const nodemailer = require('nodemailer');

let cachedTransporter = null;
let sentEmailHistory = []; // In-memory store for demo/review preview

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Generate simulated ethereal account or mock transport
    try {
      const testAccount = await nodemailer.createTestAccount();
      cachedTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('Using Ethereal mock email transport for development.');
    } catch (err) {
      console.warn('Could not connect to external mock SMTP, using in-memory transport fallback.');
      cachedTransporter = {
        sendMail: async (options) => {
          return { messageId: 'simulated-' + Date.now(), mock: true };
        }
      };
    }
  }

  return cachedTransporter;
}

/**
 * Builds HTML template for the weekly operations summary email.
 */
function buildWeeklySummaryHtml({ stats, topNurses, lowScores, weekRange }) {
  const npsClass = stats.nps >= 50 ? '#059669' : stats.nps >= 0 ? '#d97706' : '#dc2626';

  const nurseRows = topNurses
    .map(
      (n, i) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">#${i + 1} ${n.name}</td>
        <td style="padding: 10px 12px; color: #64748b;">${n.specialization}</td>
        <td style="padding: 10px 12px; text-align: center; color: #0f172a; font-weight: bold;">${n.total_feedback}</td>
        <td style="padding: 10px 12px; text-align: right; color: #059669; font-weight: bold;">${n.avg_rating.toFixed(2)} ★</td>
      </tr>`
    )
    .join('');

  const alertRows = lowScores.length
    ? lowScores
        .map(
          (a) => `
      <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 12px; margin-bottom: 8px; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #9f1239;">
          <span>${a.nurse_name} - ${a.service_type} (${a.city})</span>
          <span>Score: ${a.rating_overall.toFixed(1)} / 5</span>
        </div>
        <p style="margin: 6px 0 2px; font-size: 13px; color: #475569; font-style: italic;">
          "${a.comment_censored || 'No written comment provided'}"
        </p>
        <div style="font-size: 11px; color: #94a3b8;">
          Patient: ${a.patient_name} | Contact: ${a.family_contact_name || 'N/A'} (${a.family_phone || 'N/A'}) | Status: <strong>${a.followup_status.toUpperCase()}</strong>
        </div>
      </div>`
        )
        .join('')
    : '<p style="color: #059669; font-weight: 500;">No critical low score incidents this week! Great job team.</p>';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TheCarePal Weekly Quality Digest</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #334155;">
    <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); padding: 28px 32px; color: #ffffff;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">TheCarePal</h1>
          <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500;">
            Operations Weekly Digest
          </span>
        </div>
        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">
          Care Quality & Visit Feedback Report • ${weekRange}
        </p>
      </div>

      <div style="padding: 28px 32px;">
        
        <!-- Summary Cards -->
        <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 0;">Weekly Performance Snapshot</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #0f172a;">${stats.totalFeedback}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Feedbacks</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #0d9488;">${stats.avgRating.toFixed(2)} ★</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Avg Care Rating</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: ${npsClass};">${stats.nps > 0 ? '+' : ''}${stats.nps}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">NPS Score</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: ${stats.criticalCount > 0 ? '#e11d48' : '#059669'};">${stats.criticalCount}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Low Score Alerts</div>
          </div>
        </div>

        <!-- Pillar Breakdown -->
        <div style="background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 600; color: #115e59; margin-bottom: 8px;">Care Quality Pillars (Out of 5.0):</div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #0f766e;">
            <span>Punctuality: <strong>${stats.punctualityAvg.toFixed(2)} ★</strong></span>
            <span>Care Quality: <strong>${stats.careQualityAvg.toFixed(2)} ★</strong></span>
            <span>Hygiene: <strong>${stats.hygieneAvg.toFixed(2)} ★</strong></span>
            <span>Behaviour: <strong>${stats.behaviourAvg.toFixed(2)} ★</strong></span>
          </div>
        </div>

        <!-- Top Nurses -->
        <h3 style="font-size: 16px; color: #0f172a; margin: 24px 0 12px;">🌟 Top Performing Nurses</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left; color: #475569;">
              <th style="padding: 10px 12px;">Nurse</th>
              <th style="padding: 10px 12px;">Care Specialization</th>
              <th style="padding: 10px 12px; text-align: center;">Visits</th>
              <th style="padding: 10px 12px; text-align: right;">Avg Rating</th>
            </tr>
          </thead>
          <tbody>
            ${nurseRows}
          </tbody>
        </table>

        <!-- Low Score Alerts Requiring Follow-up -->
        <h3 style="font-size: 16px; color: #e11d48; margin: 24px 0 12px;">⚠️ Low Scores Requiring Operations Follow-Up</h3>
        <p style="font-size: 13px; color: #64748b; margin: 0 0 12px;">The following visits received scores &le; 3 or negative feedback and need immediate family outreach to resolve:</p>
        ${alertRows}

        <!-- Footer / CTA -->
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <a href="http://localhost:5173" style="display: inline-block; background: #0d9488; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
            Open TheCarePal Operations Dashboard &rarr;
          </a>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
            TheCarePal Quality Assurance System • Automated Operations Digest<br/>
            Bengaluru • Mumbai • Delhi NCR • Hyderabad • Pune
          </p>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Sends or simulates sending the weekly summary email.
 */
async function sendWeeklySummaryEmail(data, recipientEmail = 'ops-team@thecarepal.com') {
  const transporter = await getTransporter();
  const htmlContent = buildWeeklySummaryHtml(data);

  const mailOptions = {
    from: '"TheCarePal Quality Team" <quality@thecarepal.com>',
    to: recipientEmail,
    subject: `Weekly Care Quality Digest: ${data.weekRange} (NPS: ${data.stats.nps > 0 ? '+' : ''}${data.stats.nps})`,
    html: htmlContent
  };

  let previewUrl = null;
  let info = null;

  if (transporter.sendMail) {
    info = await transporter.sendMail(mailOptions);
    if (nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
    }
  }

  const record = {
    id: 'mail-' + Date.now(),
    sentAt: new Date().toISOString(),
    recipient: recipientEmail,
    subject: mailOptions.subject,
    previewUrl,
    stats: data.stats,
    html: htmlContent
  };

  sentEmailHistory.unshift(record);
  if (sentEmailHistory.length > 20) sentEmailHistory.pop();

  return record;
}

function getEmailHistory() {
  return sentEmailHistory;
}

module.exports = {
  buildWeeklySummaryHtml,
  sendWeeklySummaryEmail,
  getEmailHistory
};
