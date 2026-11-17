const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { analyzeProfanity } = require('../services/profanityService');
const { analyzeSentiment } = require('../services/sentimentService');

/**
 * GET /api/feedback/link/:token
 * Validates a unique feedback token and returns visit details.
 */
router.get('/link/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const visit = await db.get(
      `SELECT v.*, n.name as nurse_name, n.specialization as nurse_specialization, n.avatar_seed
       FROM visits v
       JOIN nurses n ON v.nurse_id = n.id
       WHERE v.token = ?`,
      [token]
    );

    if (!visit) {
      return res.status(404).json({
        valid: false,
        reason: 'not_found',
        message: 'This feedback link does not exist. Please check the URL or contact TheCarePal support.'
      });
    }

    if (visit.status === 'submitted') {
      const feedback = await db.get('SELECT submitted_at FROM feedback WHERE visit_id = ?', [visit.id]);
      return res.status(200).json({
        valid: false,
        reason: 'already_submitted',
        message: 'Feedback for this visit has already been submitted. Thank you for your response!',
        submittedAt: feedback ? feedback.submitted_at : null,
        patientName: visit.patient_name,
        nurseName: visit.nurse_name,
        serviceType: visit.service_type
      });
    }

    const now = new Date();
    const expiresAt = new Date(visit.expires_at);

    if (now > expiresAt) {
      // Mark as expired if not already
      await db.run('UPDATE visits SET status = "expired" WHERE id = ?', [visit.id]);
      return res.status(200).json({
        valid: false,
        reason: 'expired',
        message: `This feedback link expired on ${expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}. Links are active for a set window to ensure prompt follow-up.`,
        expiresAt: visit.expires_at,
        patientName: visit.patient_name,
        nurseName: visit.nurse_name,
        serviceType: visit.service_type
      });
    }

    return res.json({
      valid: true,
      visit: {
        id: visit.id,
        token: visit.token,
        patientName: visit.patient_name,
        familyContactName: visit.family_contact_name,
        serviceType: visit.service_type,
        visitDate: visit.visit_date,
        city: visit.city,
        nurseName: visit.nurse_name,
        nurseSpecialization: visit.nurse_specialization,
        avatarSeed: visit.avatar_seed,
        expiresAt: visit.expires_at
      }
    });
  } catch (error) {
    console.error('Error verifying feedback link:', error);
    res.status(500).json({ error: 'Server error verifying link' });
  }
});

/**
 * POST /api/feedback/submit
 * Submits feedback for a visit, applies profanity filtering and sentiment tagging.
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      token,
      rating_punctuality,
      rating_care_quality,
      rating_hygiene,
      rating_behaviour,
      nps_score,
      comment
    } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    // Validate ratings
    const ratings = [rating_punctuality, rating_care_quality, rating_hygiene, rating_behaviour];
    for (const r of ratings) {
      if (typeof r !== 'number' || r < 1 || r > 5) {
        return res.status(400).json({ error: 'Ratings for all categories must be between 1 and 5' });
      }
    }

    if (typeof nps_score !== 'number' || nps_score < 0 || nps_score > 10) {
      return res.status(400).json({ error: 'NPS score must be between 0 and 10' });
    }

    // Verify visit and ensure not already submitted or expired
    const visit = await db.get('SELECT * FROM visits WHERE token = ?', [token]);
    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    if (visit.status === 'submitted') {
      return res.status(400).json({ error: 'Feedback already submitted for this visit' });
    }

    const now = new Date();
    if (now > new Date(visit.expires_at)) {
      await db.run('UPDATE visits SET status = "expired" WHERE id = ?', [visit.id]);
      return res.status(400).json({ error: 'This feedback link has expired' });
    }

    // Calculate overall rating
    const overallRating = Number(((rating_punctuality + rating_care_quality + rating_hygiene + rating_behaviour) / 4).toFixed(2));

    // Abusive language detection and censorship
    const profanityResult = analyzeProfanity(comment || '');

    // Sentiment analysis
    const sentimentResult = analyzeSentiment(comment || '', overallRating);

    // Follow-up condition: overall rating <= 3.0 OR NPS <= 6 OR negative sentiment OR abusive language
    const requiresFollowup = overallRating <= 3.0 || nps_score <= 6 || sentimentResult.sentiment === 'negative' || profanityResult.isAbusive ? 1 : 0;

    const feedbackId = 'FB-' + uuidv4().slice(0, 8).toUpperCase();

    await db.run(
      `INSERT INTO feedback (
        id, visit_id, nurse_id,
        rating_punctuality, rating_care_quality, rating_hygiene, rating_behaviour,
        rating_overall, nps_score,
        comment, comment_censored,
        has_abusive_language, flagged_words,
        sentiment, sentiment_score,
        requires_followup, followup_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        feedbackId,
        visit.id,
        visit.nurse_id,
        rating_punctuality,
        rating_care_quality,
        rating_hygiene,
        rating_behaviour,
        overallRating,
        nps_score,
        comment || '',
        profanityResult.censoredText,
        profanityResult.isAbusive ? 1 : 0,
        profanityResult.flaggedWords.join(', '),
        sentimentResult.sentiment,
        sentimentResult.score,
        requiresFollowup,
        requiresFollowup ? 'unassigned' : 'no_action_needed'
      ]
    );

    // Mark visit as submitted
    await db.run('UPDATE visits SET status = "submitted" WHERE id = ?', [visit.id]);

    return res.status(201).json({
      success: true,
      feedbackId,
      message: 'Thank you! Your feedback has been recorded.',
      sentiment: sentimentResult.sentiment,
      requiresFollowup: requiresFollowup === 1
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback. Please try again.' });
  }
});

module.exports = router;
