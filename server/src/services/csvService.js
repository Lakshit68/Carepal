/**
 * Escapes a CSV cell value to handle commas, quotes, and newlines correctly.
 * @param {any} val
 * @returns {string}
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  } else {
    str = '"' + str + '"';
  }
  return str;
}

/**
 * Converts array of feedback records with nurse and visit joins into a CSV string.
 * @param {Array<Object>} rows
 * @returns {string}
 */
function generateFeedbackCSV(rows) {
  const headers = [
    'Feedback ID',
    'Visit Date',
    'Submitted At',
    'Patient Name',
    'Family Contact',
    'Phone',
    'City',
    'Care Service Type',
    'Nurse ID',
    'Nurse Name',
    'Nurse Specialization',
    'Punctuality (1-5)',
    'Care Quality (1-5)',
    'Hygiene (1-5)',
    'Behaviour (1-5)',
    'Overall Rating (1-5)',
    'NPS Score (0-10)',
    'NPS Category',
    'Sentiment',
    'Sentiment Score',
    'Abusive Language Flagged',
    'Flagged Words',
    'Customer Comment (Censored)',
    'Customer Comment (Original)',
    'Requires Followup',
    'Followup Status',
    'Followup Notes'
  ];

  const lines = [headers.join(',')];

  for (const r of rows) {
    let npsCategory = 'Passive';
    if (r.nps_score >= 9) npsCategory = 'Promoter';
    else if (r.nps_score <= 6) npsCategory = 'Detractor';

    const row = [
      escapeCSV(r.id),
      escapeCSV(r.visit_date),
      escapeCSV(r.submitted_at),
      escapeCSV(r.patient_name),
      escapeCSV(r.family_contact_name || 'N/A'),
      escapeCSV(r.family_phone || 'N/A'),
      escapeCSV(r.city || 'Bangalore'),
      escapeCSV(r.service_type),
      escapeCSV(r.nurse_id),
      escapeCSV(r.nurse_name),
      escapeCSV(r.nurse_specialization),
      escapeCSV(r.rating_punctuality),
      escapeCSV(r.rating_care_quality),
      escapeCSV(r.rating_hygiene),
      escapeCSV(r.rating_behaviour),
      escapeCSV(r.rating_overall?.toFixed(2)),
      escapeCSV(r.nps_score),
      escapeCSV(npsCategory),
      escapeCSV(r.sentiment),
      escapeCSV(r.sentiment_score),
      escapeCSV(r.has_abusive_language ? 'YES' : 'NO'),
      escapeCSV(r.flagged_words || ''),
      escapeCSV(r.comment_censored || ''),
      escapeCSV(r.comment || ''),
      escapeCSV(r.requires_followup ? 'YES' : 'NO'),
      escapeCSV(r.followup_status || 'unassigned'),
      escapeCSV(r.followup_notes || '')
    ];

    lines.push(row.join(','));
  }

  return lines.join('\r\n');
}

module.exports = {
  generateFeedbackCSV
};
