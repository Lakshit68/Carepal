const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { generateFeedbackCSV } = require('../services/csvService');

/**
 * GET /api/admin/stats
 * Aggregates overall quality KPIs, NPS calculation, and trend data.
 */
router.get('/stats', async (req, res) => {
  try {
    const { timeRange } = req.query; // '7d', '30d', 'all'
    let dateFilter = '';
    const params = [];

    if (timeRange === '7d') {
      dateFilter = "WHERE f.submitted_at >= datetime('now', '-7 days')";
    } else if (timeRange === '30d') {
      dateFilter = "WHERE f.submitted_at >= datetime('now', '-30 days')";
    }

    // Overall KPI counts
    const totalVisitsRow = await db.get('SELECT COUNT(*) as count FROM visits');
    const totalSubmittedRow = await db.get('SELECT COUNT(*) as count FROM visits WHERE status = "submitted"');
    const totalExpiredRow = await db.get('SELECT COUNT(*) as count FROM visits WHERE status = "expired"');
    const totalPendingRow = await db.get('SELECT COUNT(*) as count FROM visits WHERE status = "pending"');

    const totalVisits = totalVisitsRow.count || 0;
    const totalSubmitted = totalSubmittedRow.count || 0;
    const responseRate = totalVisits > 0 ? Number(((totalSubmitted / totalVisits) * 100).toFixed(1)) : 0;

    // Averages across feedback
    const averages = await db.get(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(f.rating_overall) as avg_overall,
        AVG(f.rating_punctuality) as avg_punctuality,
        AVG(f.rating_care_quality) as avg_care_quality,
        AVG(f.rating_hygiene) as avg_hygiene,
        AVG(f.rating_behaviour) as avg_behaviour,
        SUM(CASE WHEN f.nps_score >= 9 THEN 1 ELSE 0 END) as promoters,
        SUM(CASE WHEN f.nps_score >= 7 AND f.nps_score <= 8 THEN 1 ELSE 0 END) as passives,
        SUM(CASE WHEN f.nps_score <= 6 THEN 1 ELSE 0 END) as detractors,
        SUM(CASE WHEN f.requires_followup = 1 AND f.followup_status != 'resolved' THEN 1 ELSE 0 END) as pending_followups,
        SUM(CASE WHEN f.has_abusive_language = 1 THEN 1 ELSE 0 END) as abusive_count,
        SUM(CASE WHEN f.sentiment = 'positive' THEN 1 ELSE 0 END) as positive_sentiment_count,
        SUM(CASE WHEN f.sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_sentiment_count,
        SUM(CASE WHEN f.sentiment = 'negative' THEN 1 ELSE 0 END) as negative_sentiment_count
      FROM feedback f
      ${dateFilter}
    `, params);

    const totalFeedback = averages.total_feedback || 0;
    const promoters = averages.promoters || 0;
    const passives = averages.passives || 0;
    const detractors = averages.detractors || 0;

    // Net Promoter Score calculation: % Promoters - % Detractors
    let npsScore = 0;
    let promoterPct = 0;
    let passivePct = 0;
    let detractorPct = 0;

    if (totalFeedback > 0) {
      promoterPct = Number(((promoters / totalFeedback) * 100).toFixed(1));
      passivePct = Number(((passives / totalFeedback) * 100).toFixed(1));
      detractorPct = Number(((detractors / totalFeedback) * 100).toFixed(1));
      npsScore = Math.round(promoterPct - detractorPct);
    }

    // Trend over time (grouped by week/date)
    const trendRows = await db.all(`
      SELECT 
        strftime('%Y-%m-%d', f.submitted_at) as date,
        COUNT(*) as count,
        ROUND(AVG(f.rating_overall), 2) as avg_rating,
        ROUND(AVG(f.rating_punctuality), 2) as avg_punctuality,
        ROUND(AVG(f.rating_care_quality), 2) as avg_care_quality,
        ROUND(AVG(f.rating_hygiene), 2) as avg_hygiene,
        ROUND(AVG(f.rating_behaviour), 2) as avg_behaviour,
        ROUND((SUM(CASE WHEN f.nps_score >= 9 THEN 1.0 ELSE 0.0 END) - SUM(CASE WHEN f.nps_score <= 6 THEN 1.0 ELSE 0.0 END)) / COUNT(*) * 100, 0) as nps_trend
      FROM feedback f
      GROUP BY strftime('%Y-%m-%d', f.submitted_at)
      ORDER BY date ASC
      LIMIT 30
    `);

    res.json({
      summary: {
        totalVisits,
        totalSubmitted,
        totalPending: totalPendingRow.count,
        totalExpired: totalExpiredRow.count,
        responseRate,
        avgOverall: Number((averages.avg_overall || 0).toFixed(2)),
        avgPunctuality: Number((averages.avg_punctuality || 0).toFixed(2)),
        avgCareQuality: Number((averages.avg_care_quality || 0).toFixed(2)),
        avgHygiene: Number((averages.avg_hygiene || 0).toFixed(2)),
        avgBehaviour: Number((averages.avg_behaviour || 0).toFixed(2)),
        nps: {
          score: npsScore,
          promoters,
          passives,
          detractors,
          promoterPct,
          passivePct,
          detractorPct
        },
        pendingFollowups: averages.pending_followups || 0,
        abusiveCount: averages.abusive_count || 0,
        sentimentBreakdown: {
          positive: averages.positive_sentiment_count || 0,
          neutral: averages.neutral_sentiment_count || 0,
          negative: averages.negative_sentiment_count || 0
        }
      },
      trends: trendRows
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

/**
 * GET /api/admin/nurses
 * List of all nurses with aggregated ratings per nurse.
 */
router.get('/nurses', async (req, res) => {
  try {
    const nurses = await db.all(`
      SELECT 
        n.id,
        n.name,
        n.specialization,
        n.phone,
        n.experience_years,
        n.avatar_seed,
        n.active,
        COUNT(f.id) as total_feedback,
        ROUND(AVG(f.rating_overall), 2) as avg_rating,
        ROUND(AVG(f.rating_punctuality), 2) as avg_punctuality,
        ROUND(AVG(f.rating_care_quality), 2) as avg_care_quality,
        ROUND(AVG(f.rating_hygiene), 2) as avg_hygiene,
        ROUND(AVG(f.rating_behaviour), 2) as avg_behaviour,
        SUM(CASE WHEN f.requires_followup = 1 AND f.followup_status != 'resolved' THEN 1 ELSE 0 END) as low_score_alerts,
        ROUND((SUM(CASE WHEN f.nps_score >= 9 THEN 1.0 ELSE 0.0 END) - SUM(CASE WHEN f.nps_score <= 6 THEN 1.0 ELSE 0.0 END)) / NULLIF(COUNT(f.id), 0) * 100, 0) as nurse_nps
      FROM nurses n
      LEFT JOIN feedback f ON n.id = f.nurse_id
      GROUP BY n.id
      ORDER BY avg_rating DESC NULLS LAST
    `);

    res.json(nurses);
  } catch (error) {
    console.error('Error fetching nurses:', error);
    res.status(500).json({ error: 'Failed to fetch nurse ratings' });
  }
});

/**
 * GET /api/admin/feedback/low-scores
 * List of low scores needing immediate follow-up.
 */
router.get('/feedback/low-scores', async (req, res) => {
  try {
    const lowScores = await db.all(`
      SELECT 
        f.*,
        v.visit_date,
        v.patient_name,
        v.family_contact_name,
        v.family_phone,
        v.service_type,
        v.city,
        n.name as nurse_name,
        n.specialization as nurse_specialization
      FROM feedback f
      JOIN visits v ON f.visit_id = v.id
      JOIN nurses n ON f.nurse_id = n.id
      WHERE f.requires_followup = 1
      ORDER BY 
        CASE f.followup_status 
          WHEN 'unassigned' THEN 1 
          WHEN 'in_progress' THEN 2 
          WHEN 'resolved' THEN 3 
          ELSE 4 
        END,
        f.submitted_at DESC
    `);

    res.json(lowScores);
  } catch (error) {
    console.error('Error fetching low scores:', error);
    res.status(500).json({ error: 'Failed to fetch low scores queue' });
  }
});

/**
 * GET /api/admin/feedback
 * Fetch all feedback with filtering and abusive language masking.
 */
router.get('/feedback', async (req, res) => {
  try {
    const { nurseId, sentiment, rating, abusiveOnly, search, limit = 50, offset = 0 } = req.query;

    let whereClauses = ['1=1'];
    const params = [];

    if (nurseId) {
      whereClauses.push('f.nurse_id = ?');
      params.push(nurseId);
    }
    if (sentiment) {
      whereClauses.push('f.sentiment = ?');
      params.push(sentiment);
    }
    if (rating) {
      whereClauses.push('ROUND(f.rating_overall) = ?');
      params.push(Math.round(Number(rating)));
    }
    if (abusiveOnly === 'true') {
      whereClauses.push('f.has_abusive_language = 1');
    }
    if (search) {
      whereClauses.push('(f.comment LIKE ? OR v.patient_name LIKE ? OR n.name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereSql = whereClauses.join(' AND ');

    const rows = await db.all(`
      SELECT 
        f.*,
        v.visit_date,
        v.patient_name,
        v.family_contact_name,
        v.family_phone,
        v.service_type,
        v.city,
        v.token,
        n.name as nurse_name,
        n.specialization as nurse_specialization
      FROM feedback f
      JOIN visits v ON f.visit_id = v.id
      JOIN nurses n ON f.nurse_id = n.id
      WHERE ${whereSql}
      ORDER BY f.submitted_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const countRow = await db.get(`
      SELECT COUNT(*) as total
      FROM feedback f
      JOIN visits v ON f.visit_id = v.id
      JOIN nurses n ON f.nurse_id = n.id
      WHERE ${whereSql}
    `, params);

    res.json({
      feedback: rows,
      total: countRow.total
    });
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

/**
 * GET /api/admin/visits
 * List visits with filter by status ('pending', 'submitted', 'expired').
 */
router.get('/visits', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT v.*, n.name as nurse_name, n.specialization as nurse_specialization
      FROM visits v
      JOIN nurses n ON v.nurse_id = n.id
    `;
    const params = [];
    if (status) {
      sql += ' WHERE v.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY v.created_at DESC LIMIT 50';

    const visits = await db.all(sql, params);
    res.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

/**
 * POST /api/admin/visits/create
 * Generates a unique feedback link for a visit with expiration.
 */
router.post('/visits/create', async (req, res) => {
  try {
    const {
      nurse_id,
      patient_name,
      family_contact_name,
      family_phone,
      service_type,
      visit_date,
      city = 'Bangalore',
      expires_in_days = 3
    } = req.body;

    if (!nurse_id || !patient_name || !service_type || !visit_date) {
      return res.status(400).json({ error: 'Nurse, patient name, service type, and visit date are required.' });
    }

    const visitId = 'VST-' + uuidv4().slice(0, 8).toUpperCase();
    const token = uuidv4().replace(/-/g, '').slice(0, 16);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (parseInt(expires_in_days) || 3) * 24 * 60 * 60 * 1000);

    await db.run(`
      INSERT INTO visits (
        id, token, nurse_id, patient_name, family_contact_name, family_phone,
        service_type, visit_date, city, status, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      visitId,
      token,
      nurse_id,
      patient_name,
      family_contact_name || '',
      family_phone || '',
      service_type,
      visit_date,
      city,
      expiresAt.toISOString()
    ]);

    const nurse = await db.get('SELECT name, specialization FROM nurses WHERE id = ?', [nurse_id]);

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const feedbackUrl = `${baseUrl}/feedback/${token}`;

    res.status(201).json({
      success: true,
      visitId,
      token,
      feedbackUrl,
      expiresAt: expiresAt.toISOString(),
      expiresInDays: expires_in_days,
      nurseName: nurse ? nurse.name : '',
      patientName: patient_name
    });
  } catch (error) {
    console.error('Error creating visit feedback link:', error);
    res.status(500).json({ error: 'Failed to create feedback link' });
  }
});

/**
 * PATCH /api/admin/feedback/:id/followup
 * Updates follow-up status and notes for low score / flagged feedback.
 */
router.patch('/feedback/:id/followup', async (req, res) => {
  try {
    const { id } = req.params;
    const { followup_status, followup_notes } = req.body;

    const validStatuses = ['unassigned', 'in_progress', 'resolved', 'no_action_needed'];
    if (followup_status && !validStatuses.includes(followup_status)) {
      return res.status(400).json({ error: 'Invalid followup status' });
    }

    await db.run(`
      UPDATE feedback
      SET 
        followup_status = COALESCE(?, followup_status),
        followup_notes = COALESCE(?, followup_notes),
        followup_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [followup_status, followup_notes, id]);

    const updated = await db.get('SELECT * FROM feedback WHERE id = ?', [id]);
    res.json({ success: true, feedback: updated });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    res.status(500).json({ error: 'Failed to update follow-up' });
  }
});

/**
 * GET /api/admin/export/csv
 * Exports all feedback data as CSV download.
 */
router.get('/export/csv', async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT 
        f.*,
        v.visit_date,
        v.patient_name,
        v.family_contact_name,
        v.family_phone,
        v.service_type,
        v.city,
        n.name as nurse_name,
        n.specialization as nurse_specialization
      FROM feedback f
      JOIN visits v ON f.visit_id = v.id
      JOIN nurses n ON f.nurse_id = n.id
      ORDER BY f.submitted_at DESC
    `);

    const csvContent = generateFeedbackCSV(rows);

    const filename = `TheCarePal_Feedback_Export_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
