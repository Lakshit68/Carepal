/**
 * Complete End-to-End Test Suite for TheCarePal
 * Tests both Frontend (Vite on :5173) and Backend (Express on :5001)
 */

async function runE2ETests() {
  const CLIENT_URL = 'http://localhost:5173';
  const SERVER_URL = 'http://localhost:5001';

  console.log('\n============================================================');
  console.log('       TheCarePal Visit Feedback & Dashboard E2E Tests       ');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` \x1b[32m✔\x1b[0m ${message}`);
      passed++;
    } else {
      console.error(` \x1b[31m✖\x1b[0m ${message}`);
      failed++;
    }
  }

  try {
    // 1. Frontend Server Connectivity
    console.log('\n--- 1. Testing Frontend Vite Server (port 5173) ---');
    const frontendRes = await fetch(CLIENT_URL);
    assert(frontendRes.status === 200, `Frontend root accessible (status: ${frontendRes.status})`);
    const frontendHtml = await frontendRes.text();
    assert(frontendHtml.includes('TheCarePal'), 'Frontend index.html contains TheCarePal title');

    // 2. Frontend Feedback Routes on Vite
    const feedbackRouteRes = await fetch(`${CLIENT_URL}/feedback/demo-fresh-01`);
    assert(feedbackRouteRes.status === 200, 'Frontend /feedback/:token route serves SPA correctly');

    // 3. Backend Health Check
    console.log('\n--- 2. Testing Backend Express Server (port 5001) ---');
    const healthRes = await fetch(`${SERVER_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', `Backend health check OK (${healthData.service})`);

    // 4. Vite Proxy Check (/api through :5173)
    console.log('\n--- 3. Testing Vite Proxy Forwarding (/api -> :5001) ---');
    const proxyRes = await fetch(`${CLIENT_URL}/api/health`);
    const proxyData = await proxyRes.json();
    assert(proxyRes.status === 200 && proxyData.status === 'healthy', 'Vite proxy forwards API requests seamlessly');

    // 5. Test Feedback Form: Fresh Active Link
    console.log('\n--- 4. Testing Feedback Link Verification ---');
    const linkRes = await fetch(`${SERVER_URL}/api/feedback/link/demo-fresh-01`);
    const linkData = await linkRes.json();
    assert(linkData.valid === true, 'Fresh link is valid');
    assert(linkData.visit.nurseName === 'Nurse Sunita Sharma', `Nurse name loaded correctly: ${linkData.visit.nurseName}`);
    assert(linkData.visit.serviceType === 'Elderly Care', `Service type loaded: ${linkData.visit.serviceType}`);

    // 6. Test Feedback Submission with Ratings, NPS, and Profanity/Sentiment
    console.log('\n--- 5. Testing Feedback Submission & Sentiment Analysis ---');
    const submitRes = await fetch(`${SERVER_URL}/api/feedback/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'demo-fresh-01',
        rating_punctuality: 5,
        rating_care_quality: 5,
        rating_hygiene: 5,
        rating_behaviour: 5,
        nps_score: 10,
        comment: 'Nurse Sunita was an absolute blessing today! Very gentle and compassionate.'
      })
    });
    const submitResult = await submitRes.json();
    assert(submitRes.status === 201 && submitResult.success === true, 'Feedback successfully submitted');
    assert(submitResult.sentiment === 'positive', `Sentiment correctly tagged as positive (${submitResult.sentiment})`);

    // 7. Test Single-Use Protection (Cannot submit or use twice)
    console.log('\n--- 6. Testing Single-Use Security Guard ---');
    const recheckRes = await fetch(`${SERVER_URL}/api/feedback/link/demo-fresh-01`);
    const recheckData = await recheckRes.json();
    assert(recheckData.valid === false && recheckData.reason === 'already_submitted', 'Single-use enforced: Link marked as already_submitted');

    // Attempt second submission on same token
    const blockedRes = await fetch(`${SERVER_URL}/api/feedback/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'demo-fresh-01',
        rating_punctuality: 4,
        rating_care_quality: 4,
        rating_hygiene: 4,
        rating_behaviour: 4,
        nps_score: 8,
        comment: 'Attempting duplicate submission'
      })
    });
    assert(blockedRes.status === 400, `Duplicate submission blocked with 400 Bad Request`);

    // 8. Test Expired Link Guard
    console.log('\n--- 7. Testing Expiration Guard ---');
    const expiredRes = await fetch(`${SERVER_URL}/api/feedback/link/demo-expired-01`);
    const expiredData = await expiredRes.json();
    assert(expiredData.valid === false && expiredData.reason === 'expired', 'Expired link recognized and blocked from submission');

    // 9. Test Abusive Language / Profanity Filter
    console.log('\n--- 8. Testing Profanity Filter & Moderation ---');
    // Create a new link to test profanity
    const createRes = await fetch(`${SERVER_URL}/api/admin/visits/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nurse_id: 'NUR-103',
        patient_name: 'Test Profanity Patient',
        service_type: 'Elderly Care',
        visit_date: '2026-11-17',
        expires_in_days: 2
      })
    });
    const createdLink = await createRes.json();
    assert(createdLink.success === true, 'New visit feedback link generated dynamically');

    const abusiveSubmitRes = await fetch(`${SERVER_URL}/api/feedback/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: createdLink.token,
        rating_punctuality: 1,
        rating_care_quality: 2,
        rating_hygiene: 1,
        rating_behaviour: 1,
        nps_score: 1,
        comment: 'This was a bakwaas and pathetic service by a complete idiot nurse!'
      })
    });
    const abusiveResult = await abusiveSubmitRes.json();
    assert(abusiveResult.success === true, 'Feedback recorded');
    assert(abusiveResult.requiresFollowup === true, 'Low rating / abusive feedback automatically flagged for follow-up');

    // Verify masked comment in feedback list
    const feedbackListRes = await fetch(`${SERVER_URL}/api/admin/feedback?limit=5`);
    const feedbackList = await feedbackListRes.json();
    const latestFeedback = feedbackList.feedback.find(f => f.id === abusiveResult.feedbackId);
    assert(latestFeedback.has_abusive_language === 1, 'Abusive language flag detected and saved');
    assert(latestFeedback.comment_censored.includes('****'), `Offensive words masked with asterisks: "${latestFeedback.comment_censored}"`);

    // 10. Test Admin KPI Stats & Net Promoter Score (NPS)
    console.log('\n--- 9. Testing Operations Quality Dashboard Analytics ---');
    const statsRes = await fetch(`${SERVER_URL}/api/admin/stats`);
    const statsData = await statsRes.json();
    assert(statsData.summary.avgOverall >= 1 && statsData.summary.avgOverall <= 5, `Average Care Rating calculated: ${statsData.summary.avgOverall}★`);
    assert(typeof statsData.summary.nps.score === 'number', `Net Promoter Score (NPS) computed: ${statsData.summary.nps.score}`);
    assert(statsData.trends.length > 0, `Quality trend points over time available (${statsData.trends.length} days)`);

    // 11. Test Nurse Leaderboard
    const nursesRes = await fetch(`${SERVER_URL}/api/admin/nurses`);
    const nurses = await nursesRes.json();
    assert(nurses.length >= 6, `Nurse Leaderboard lists all nurses (${nurses.length} active)`);
    assert(typeof nurses[0].avg_rating === 'number', `Top nurse has aggregated score: ${nurses[0].name} (${nurses[0].avg_rating}★)`);

    // 12. Test Low-Scores Queue & Follow-up Status Update
    console.log('\n--- 10. Testing Low-Scores Triage & Notes Workflow ---');
    const lowRes = await fetch(`${SERVER_URL}/api/admin/feedback/low-scores`);
    const lowScores = await lowRes.json();
    assert(lowScores.length > 0, `Low-score triage queue populated with ${lowScores.length} items`);

    const targetFeedback = lowScores[0];
    const updateRes = await fetch(`${SERVER_URL}/api/admin/feedback/${targetFeedback.id}/followup`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        followup_status: 'in_progress',
        followup_notes: 'Automated test note: Clinical Lead assigned for home visit.'
      })
    });
    const updateResult = await updateRes.json();
    assert(updateResult.success === true, 'Follow-up status and ops notes updated successfully');
    assert(updateResult.feedback.followup_status === 'in_progress', 'Status updated to in_progress');

    // 13. Test CSV Export Endpoint
    console.log('\n--- 11. Testing CSV Export Service ---');
    const csvRes = await fetch(`${SERVER_URL}/api/admin/export/csv`);
    const csvText = await csvRes.text();
    assert(csvRes.status === 200, 'CSV export endpoint returned 200 OK');
    assert(csvRes.headers.get('content-type').includes('text/csv'), 'Content-Type is text/csv');
    assert(csvText.includes('Feedback ID,Visit Date,Submitted At'), 'CSV headers correctly formatted');
    assert(csvText.includes('Nurse Sunita Sharma'), 'CSV contains nurse feedback records');

    // 14. Test Weekly Summary Email Digest
    console.log('\n--- 12. Testing Weekly Summary Email Service ---');
    const previewRes = await fetch(`${SERVER_URL}/api/reports/weekly-summary/preview`);
    const previewData = await previewRes.json();
    assert(previewData.success === true, 'Weekly email preview generated');
    assert(previewData.html.includes('TheCarePal'), 'Email HTML contains branded header');
    assert(previewData.html.includes('Weekly Performance Snapshot'), 'Email HTML contains weekly snapshot table');

    const sendRes = await fetch(`${SERVER_URL}/api/reports/weekly-summary/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: 'ops-lead@thecarepal.com' })
    });
    const sendData = await sendRes.json();
    assert(sendData.success === true, `Weekly digest dispatched to ops (${sendData.message})`);

    // Clean up: re-seed database so reviewer gets clean initial state
    await fetch(`${SERVER_URL}/api/admin/reset-seed`, { method: 'POST' });

    console.log('\n============================================================');
    console.log(`  E2E Test Results: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
    console.log('============================================================\n');

  } catch (err) {
    console.error('Fatal error during E2E tests:', err);
    failed++;
  }
}

runE2ETests();
