const { db, initSchema } = require('./db/database');
const { analyzeProfanity } = require('./services/profanityService');
const { analyzeSentiment } = require('./services/sentimentService');

const nursesData = [
  {
    id: 'NUR-101',
    name: 'Nurse Sunita Sharma',
    specialization: 'Elderly & Dementia Care',
    phone: '+91 98450 12345',
    experience_years: 6,
    avatar_seed: 'Sunita'
  },
  {
    id: 'NUR-102',
    name: 'Sister Anjali Nair',
    specialization: 'Post-Op Recovery & Wound Care',
    phone: '+91 98450 23456',
    experience_years: 8,
    avatar_seed: 'Anjali'
  },
  {
    id: 'NUR-103',
    name: 'Nurse Rajesh Kumar',
    specialization: 'Alzheimer\'s & Palliative Care',
    phone: '+91 98450 34567',
    experience_years: 5,
    avatar_seed: 'Rajesh'
  },
  {
    id: 'NUR-104',
    name: 'Sister Deepa Thomas',
    specialization: 'Baby Care & Mother Support',
    phone: '+91 98450 45678',
    experience_years: 7,
    avatar_seed: 'Deepa'
  },
  {
    id: 'NUR-105',
    name: 'Nurse Amit Verma',
    specialization: 'Critical Care & Bedridden Mobility',
    phone: '+91 98450 56789',
    experience_years: 4,
    avatar_seed: 'Amit'
  },
  {
    id: 'NUR-106',
    name: 'Nurse Kavita Rao',
    specialization: 'Senior Companionship & Physio Assist',
    phone: '+91 98450 67890',
    experience_years: 3,
    avatar_seed: 'Kavita'
  }
];

// Feedback samples with varied ratings, sentiments, and some abusive words for filter testing
const sampleFeedbacks = [
  {
    nurseId: 'NUR-101',
    patient: 'Mrs. Devaki Menon (Age 78)',
    family: 'Ramesh Menon (Son)',
    phone: '+91 99801 11223',
    service: 'Elderly Care',
    city: 'Indiranagar, Bangalore',
    daysAgo: 1,
    punctuality: 5,
    care: 5,
    hygiene: 5,
    behaviour: 5,
    nps: 10,
    comment: 'Nurse Sunita was an absolute blessing today. My mother was feeling very restless in the morning, but Sunita calmed her down with immense patience and checked her vitals carefully.'
  },
  {
    nurseId: 'NUR-101',
    patient: 'Mr. V. S. Murthy (Age 84)',
    family: 'Arun Murthy (Son)',
    phone: '+91 99801 22334',
    service: 'Alzheimer\'s & Dementia Care',
    city: 'Koramangala, Bangalore',
    daysAgo: 3,
    punctuality: 5,
    care: 4,
    hygiene: 5,
    behaviour: 5,
    nps: 9,
    comment: 'Very professional and empathetic approach. Sunita understands dementia triggers very well and made sure my father took his medicines on time.'
  },
  {
    nurseId: 'NUR-102',
    patient: 'Mr. Pradeep Joshi (Age 62)',
    family: 'Pooja Joshi (Daughter)',
    phone: '+91 99801 33445',
    service: 'Post-Op Recovery',
    city: 'Whitefield, Bangalore',
    daysAgo: 2,
    punctuality: 5,
    care: 5,
    hygiene: 5,
    behaviour: 5,
    nps: 10,
    comment: 'Sister Anjali did post-knee replacement dressing and sterile wound check. She explained each step clearly and followed strict sterile techniques. Truly exceptional!'
  },
  {
    nurseId: 'NUR-102',
    patient: 'Mrs. Sarojini Sen (Age 71)',
    family: 'Subhash Sen (Husband)',
    phone: '+91 99801 44556',
    service: 'Post-Op Recovery',
    city: 'HSR Layout, Bangalore',
    daysAgo: 4,
    punctuality: 4,
    care: 4,
    hygiene: 5,
    behaviour: 4,
    nps: 8,
    comment: 'Good visit, took proper precautions and cleaned the surgical site. Arrived slightly later than expected due to traffic but called in advance.'
  },
  {
    nurseId: 'NUR-103',
    patient: 'Mr. H. S. Chawla (Age 82)',
    family: 'Gurpreet Chawla (Son)',
    phone: '+91 99801 55667',
    service: 'Alzheimer\'s & Dementia Care',
    city: 'Defence Colony, Delhi NCR',
    daysAgo: 2,
    punctuality: 2,
    care: 2,
    hygiene: 3,
    behaviour: 1,
    nps: 2,
    comment: 'Completely pathetic and useless support today! The nurse arrived 45 minutes late without informing us and was rude when asked about medications. This is worst behaviour.'
  },
  {
    nurseId: 'NUR-103',
    patient: 'Mrs. Kanta Gupta (Age 75)',
    family: 'Vikram Gupta (Son)',
    phone: '+91 99801 66778',
    service: 'Elderly Care',
    city: 'Gurugram, Delhi NCR',
    daysAgo: 6,
    punctuality: 3,
    care: 3,
    hygiene: 4,
    behaviour: 3,
    nps: 6,
    comment: 'Average visit. He did the routine tasks like BP check and sponge bath, but seemed in a rush to leave before the allocated 3 hours.'
  },
  {
    nurseId: 'NUR-104',
    patient: 'Baby of Tanya & Rohan (Age 3 weeks)',
    family: 'Tanya Roy (Mother)',
    phone: '+91 99801 77889',
    service: 'Baby Care',
    city: 'Bandra West, Mumbai',
    daysAgo: 3,
    punctuality: 5,
    care: 5,
    hygiene: 5,
    behaviour: 5,
    nps: 10,
    comment: 'Sister Deepa is such a gentle soul! As first-time parents, we were so anxious about umbilical cord care and burping. Deepa taught us with so much warmth.'
  },
  {
    nurseId: 'NUR-104',
    patient: 'Baby Aarav (Age 2 months)',
    family: 'Meera Deshmukh (Mother)',
    phone: '+91 99801 88990',
    service: 'Baby Care',
    city: 'Andheri, Mumbai',
    daysAgo: 5,
    punctuality: 5,
    care: 5,
    hygiene: 5,
    behaviour: 5,
    nps: 10,
    comment: 'Always sanitizes hands thoroughly before touching the baby, wears clean scrubs, and monitors feeding times accurately.'
  },
  {
    nurseId: 'NUR-105',
    patient: 'Mr. B. N. Reddy (Age 79)',
    family: 'Suresh Reddy (Son)',
    phone: '+91 99801 99001',
    service: 'Critical Care & Bedridden Mobility',
    city: 'Banjara Hills, Hyderabad',
    daysAgo: 1,
    punctuality: 1,
    care: 2,
    hygiene: 2,
    behaviour: 2,
    nps: 1,
    comment: 'Ghatia service, total idiot caregiver sent today! Nurse was on phone continuously and neglected changing the catheter bag on schedule. Unacceptable.'
  },
  {
    nurseId: 'NUR-105',
    patient: 'Mr. Mohan Rao (Age 80)',
    family: 'Kalyan Rao (Son)',
    phone: '+91 99802 11223',
    service: 'Critical Care & Bedridden Mobility',
    city: 'Jubilee Hills, Hyderabad',
    daysAgo: 7,
    punctuality: 3,
    care: 4,
    hygiene: 3,
    behaviour: 3,
    nps: 7,
    comment: 'Mobility support was good for back turning to prevent bedsores. Need to improve punctuality and hygiene apron cleanliness.'
  },
  {
    nurseId: 'NUR-106',
    patient: 'Mrs. Leela Sundaram (Age 86)',
    family: 'Vidya Sundaram (Daughter)',
    phone: '+91 99802 22334',
    service: 'Elderly Companionship',
    city: 'Malleswaram, Bangalore',
    daysAgo: 2,
    punctuality: 4,
    care: 5,
    hygiene: 4,
    behaviour: 5,
    nps: 9,
    comment: 'Kavita spent quality time reading daily news to my grandmother and helped her walk in the verandah safely. Very cheerful and respectful.'
  },
  {
    nurseId: 'NUR-106',
    patient: 'Mr. Krishnaswamy (Age 89)',
    family: 'Radha Krishnaswamy (Daughter)',
    phone: '+91 99802 33445',
    service: 'Elderly Companionship',
    city: 'Jayanagar, Bangalore',
    daysAgo: 4,
    punctuality: 4,
    care: 4,
    hygiene: 4,
    behaviour: 4,
    nps: 8,
    comment: 'Pleased with the companionship provided. Attentive during lunchtime and monitored his hydration levels.'
  },
  {
    nurseId: 'NUR-101',
    patient: 'Mrs. Fatima Begum (Age 73)',
    family: 'Tariq Beg (Son)',
    phone: '+91 99802 44556',
    service: 'Elderly Care',
    city: 'Shivajinagar, Bangalore',
    daysAgo: 8,
    punctuality: 5,
    care: 5,
    hygiene: 5,
    behaviour: 5,
    nps: 10,
    comment: 'Always pleasant, soft-spoken and very systematic in checking blood sugar and blood pressure.'
  },
  {
    nurseId: 'NUR-102',
    patient: 'Mr. Samuel George (Age 68)',
    family: 'Rachel George (Wife)',
    phone: '+91 99802 55667',
    service: 'Post-Op Recovery',
    city: 'Kalyan Nagar, Bangalore',
    daysAgo: 9,
    punctuality: 5,
    care: 4,
    hygiene: 5,
    behaviour: 5,
    nps: 9,
    comment: 'Sterile dressing done very smoothly without causing pain. Sister Anjali is very skilled with surgical incision monitoring.'
  },
  {
    nurseId: 'NUR-103',
    patient: 'Mrs. Pushpa Agarwal (Age 77)',
    family: 'Alok Agarwal (Son)',
    phone: '+91 99802 66778',
    service: 'Alzheimer\'s & Dementia Care',
    city: 'South Extension, Delhi NCR',
    daysAgo: 10,
    punctuality: 2,
    care: 3,
    hygiene: 3,
    behaviour: 2,
    nps: 3,
    comment: 'Nurse turned up 30 minutes late and was dismissive of our instructions regarding mother\'s dietary allergies.'
  },
  {
    nurseId: 'NUR-105',
    patient: 'Mr. Venkatramana (Age 83)',
    family: 'Anand V (Son)',
    phone: '+91 99802 77889',
    service: 'Critical Care & Bedridden Mobility',
    city: 'Gachibowli, Hyderabad',
    daysAgo: 11,
    punctuality: 4,
    care: 4,
    hygiene: 4,
    behaviour: 4,
    nps: 8,
    comment: 'Bed turning and nebulization handled smoothly. Good knowledge of oxygen concentrator settings.'
  },
  {
    nurseId: 'NUR-104',
    patient: 'Baby of Shruti M (Age 1 month)',
    family: 'Shruti M (Mother)',
    phone: '+91 99802 88990',
    service: 'Baby Care',
    city: 'Powai, Mumbai',
    daysAgo: 12,
    punctuality: 5,
    care: 5,
    hygiene: 5,
    behaviour: 5,
    nps: 10,
    comment: 'Baby massaged so well and bathed without crying! Deepa is an angel for tired post-partum mothers.'
  },
  {
    nurseId: 'NUR-106',
    patient: 'Mrs. Savitri Devi (Age 81)',
    family: 'Naveen Kumar (Grandson)',
    phone: '+91 99802 99001',
    service: 'Elderly Companionship',
    city: 'JP Nagar, Bangalore',
    daysAgo: 14,
    punctuality: 5,
    care: 4,
    hygiene: 4,
    behaviour: 5,
    nps: 9,
    comment: 'Very warm person. Dadi enjoyed the evening walk and memory matching games.'
  }
];

// Active test links that can be used immediately during demos
const testLiveLinks = [
  {
    token: 'demo-fresh-01',
    nurseId: 'NUR-101',
    patient: 'Mrs. Kamala Swaminathan (Age 82)',
    family: 'Sridhar S (Son)',
    phone: '+91 98450 99881',
    service: 'Elderly Care',
    city: 'Indiranagar, Bangalore',
    daysExpires: 3,
    status: 'pending'
  },
  {
    token: 'demo-fresh-02',
    nurseId: 'NUR-102',
    patient: 'Mr. Deepak Mehta (Age 64)',
    family: 'Kavita Mehta (Wife)',
    phone: '+91 98450 99882',
    service: 'Post-Op Recovery',
    city: 'Whitefield, Bangalore',
    daysExpires: 3,
    status: 'pending'
  },
  {
    token: 'demo-fresh-03',
    nurseId: 'NUR-104',
    patient: 'Baby of Priyanka Sen (Age 6 weeks)',
    family: 'Priyanka Sen (Mother)',
    phone: '+91 98450 99883',
    service: 'Baby Care',
    city: 'Bandra, Mumbai',
    daysExpires: 2,
    status: 'pending'
  },
  {
    token: 'demo-expired-01',
    nurseId: 'NUR-103',
    patient: 'Mr. Jagdish Prasad (Age 79)',
    family: 'Manoj Prasad (Son)',
    phone: '+91 98450 99884',
    service: 'Alzheimer\'s & Dementia Care',
    city: 'Noida, Delhi NCR',
    daysExpires: -2, // Expired 2 days ago
    status: 'expired'
  }
];

async function seed() {
  console.log('--- Initializing CarePal Database Schema ---');
  await initSchema();

  console.log('--- Cleaning previous records ---');
  await db.exec(`
    DELETE FROM feedback;
    DELETE FROM visits;
    DELETE FROM nurses;
  `);

  console.log('--- Seeding Nurses ---');
  for (const n of nursesData) {
    await db.run(
      'INSERT INTO nurses (id, name, specialization, phone, experience_years, avatar_seed) VALUES (?, ?, ?, ?, ?, ?)',
      [n.id, n.name, n.specialization, n.phone, n.experience_years, n.avatar_seed]
    );
  }

  console.log('--- Seeding Historical Visits and Feedback ---');
  const now = new Date();

  for (let i = 0; i < sampleFeedbacks.length; i++) {
    const f = sampleFeedbacks[i];
    const visitId = `VST-SEED-${1000 + i}`;
    const token = `tok-used-${1000 + i}`;
    const visitDate = new Date(now.getTime() - f.daysAgo * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(visitDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const submittedAt = new Date(visitDate.getTime() + 4 * 60 * 60 * 1000); // Submitted 4 hours after visit

    await db.run(
      `INSERT INTO visits (
        id, token, nurse_id, patient_name, family_contact_name, family_phone,
        service_type, visit_date, city, status, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
      [
        visitId,
        token,
        f.nurseId,
        f.patient,
        f.family,
        f.phone,
        f.service,
        visitDate.toISOString().slice(0, 10),
        f.city,
        expiresAt.toISOString(),
        visitDate.toISOString()
      ]
    );

    const overallRating = Number(((f.punctuality + f.care + f.hygiene + f.behaviour) / 4).toFixed(2));
    const profanity = analyzeProfanity(f.comment);
    const sentiment = analyzeSentiment(f.comment, overallRating);

    const requiresFollowup = overallRating <= 3.0 || f.nps <= 6 || sentiment.sentiment === 'negative' || profanity.isAbusive ? 1 : 0;
    
    // Assign realistic followup status for low score demo items
    let followupStatus = 'no_action_needed';
    let followupNotes = null;
    if (requiresFollowup) {
      if (i % 2 === 0) {
        followupStatus = 'in_progress';
        followupNotes = 'Ops team reached out via phone on ' + new Date(submittedAt.getTime() + 24*3600*1000).toLocaleDateString() + '. Scheduled senior supervisor check-in.';
      } else if (i === 4) {
        followupStatus = 'unassigned'; // Kept open for reviewer to interact with
      } else {
        followupStatus = 'resolved';
        followupNotes = 'Apologized for delay. Nurse briefed by clinical lead. Family offered replacement shift credit.';
      }
    }

    await db.run(
      `INSERT INTO feedback (
        id, visit_id, nurse_id,
        rating_punctuality, rating_care_quality, rating_hygiene, rating_behaviour,
        rating_overall, nps_score,
        comment, comment_censored,
        has_abusive_language, flagged_words,
        sentiment, sentiment_score,
        requires_followup, followup_status, followup_notes,
        submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `FB-SEED-${1000 + i}`,
        visitId,
        f.nurseId,
        f.punctuality,
        f.care,
        f.hygiene,
        f.behaviour,
        overallRating,
        f.nps,
        f.comment,
        profanity.censoredText,
        profanity.isAbusive ? 1 : 0,
        profanity.flaggedWords.join(', '),
        sentiment.sentiment,
        sentiment.score,
        requiresFollowup,
        followupStatus,
        followupNotes,
        submittedAt.toISOString()
      ]
    );
  }

  console.log('--- Seeding Live Demo Testing Links ---');
  for (const t of testLiveLinks) {
    const visitId = `VST-LIVE-${t.token}`;
    const visitDate = new Date();
    const expiresAt = new Date(now.getTime() + t.daysExpires * 24 * 60 * 60 * 1000);

    await db.run(
      `INSERT INTO visits (
        id, token, nurse_id, patient_name, family_contact_name, family_phone,
        service_type, visit_date, city, status, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        visitId,
        t.token,
        t.nurseId,
        t.patient,
        t.family,
        t.phone,
        t.service,
        visitDate.toISOString().slice(0, 10),
        t.city,
        t.status,
        expiresAt.toISOString()
      ]
    );
  }

  console.log('=== Database Seeding Completed Successfully! ===');
  console.log('Nurses created: 6');
  console.log(`Feedbacks seeded: ${sampleFeedbacks.length}`);
  console.log('Live demo links created:');
  testLiveLinks.forEach((l) => {
    console.log(` - http://localhost:5173/feedback/${l.token} (${l.status}, expires: ${l.daysExpires > 0 ? l.daysExpires + 'd' : 'EXPIRED'})`);
  });
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

module.exports = { seed };
