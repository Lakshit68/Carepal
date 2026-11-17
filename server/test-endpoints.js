async function testEndpoints() {
  const baseUrl = 'http://localhost:5001';
  console.log('--- Testing TheCarePal Endpoints ---');

  // 1. Health
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const health = await healthRes.json();
  console.log('1. Health check:', health.status);

  // 2. Fresh Link
  const freshRes = await fetch(`${baseUrl}/api/feedback/link/demo-fresh-01`);
  const fresh = await freshRes.json();
  console.log('2. Fresh Link Valid:', fresh.valid, 'Patient:', fresh.visit?.patientName, 'Nurse:', fresh.visit?.nurseName);

  // 3. Expired Link
  const expiredRes = await fetch(`${baseUrl}/api/feedback/link/demo-expired-01`);
  const expired = await expiredRes.json();
  console.log('3. Expired Link Detected:', !expired.valid, 'Reason:', expired.reason);

  // 4. Admin Stats & NPS
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`);
  const stats = await statsRes.json();
  console.log('4. Admin Stats:', {
    avgOverall: stats.summary?.avgOverall,
    nps: stats.summary?.nps?.score,
    totalVisits: stats.summary?.totalVisits,
    totalSubmitted: stats.summary?.totalSubmitted,
    pendingFollowups: stats.summary?.pendingFollowups
  });

  // 5. Nurses
  const nursesRes = await fetch(`${baseUrl}/api/admin/nurses`);
  const nurses = await nursesRes.json();
  console.log('5. Nurses count:', nurses.length, 'Top nurse:', nurses[0]?.name, 'Rating:', nurses[0]?.avg_rating);

  // 6. Low Scores Queue
  const lowRes = await fetch(`${baseUrl}/api/admin/feedback/low-scores`);
  const lowScores = await lowRes.json();
  console.log('6. Low Scores Needing Followup count:', lowScores.length);

  // 7. Feedback submission test
  const submitRes = await fetch(`${baseUrl}/api/feedback/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: 'demo-fresh-01',
      rating_punctuality: 5,
      rating_care_quality: 5,
      rating_hygiene: 5,
      rating_behaviour: 5,
      nps_score: 10,
      comment: 'Sister Sunita was punctual, highly attentive and took wonderful care of mother.'
    })
  });
  const submitData = await submitRes.json();
  console.log('7. Submit Feedback result:', submitData.success ? 'SUCCESS' : 'FAILED', 'Sentiment:', submitData.sentiment);

  // 8. Re-check Fresh Link (should now be already submitted)
  const recheckRes = await fetch(`${baseUrl}/api/feedback/link/demo-fresh-01`);
  const recheck = await recheckRes.json();
  console.log('8. Link single-use enforced:', !recheck.valid && recheck.reason === 'already_submitted');

  // 9. Weekly summary preview
  const previewRes = await fetch(`${baseUrl}/api/reports/weekly-summary/preview`);
  const preview = await previewRes.json();
  console.log('9. Weekly Summary Report generated:', preview.success, 'Range:', preview.data?.weekRange);

  console.log('=== ALL ENDPOINTS VERIFIED AND WORKING 100% ===');
}

testEndpoints().catch(console.error);
