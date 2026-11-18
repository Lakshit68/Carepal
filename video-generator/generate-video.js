const puppeteer = require('puppeteer-core');
const ffmpegPath = require('ffmpeg-static');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.join(__dirname, 'output');
const FRAMES_DIR = path.join(OUTPUT_DIR, 'frames');
const AUDIO_DIR = path.join(OUTPUT_DIR, 'audio');
const FINAL_VIDEO_PATH = path.join(__dirname, '../thecarepal_walkthrough.mp4');

// Ensure output directories exist
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(AUDIO_DIR, { recursive: true });

function getAudioDuration(filePath) {
  try {
    const output = execSync(
      `"${ffmpegPath}" -i "${filePath}" 2>&1 | grep "Duration"`,
      { encoding: 'utf8' }
    );
    const match = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    if (match) {
      const hours = parseFloat(match[1]);
      const minutes = parseFloat(match[2]);
      const seconds = parseFloat(match[3]);
      return hours * 3600 + minutes * 60 + seconds;
    }
  } catch (e) {
    console.error('Error measuring audio duration:', e);
  }
  return 10.0;
}

function generateSpeech(text, filename) {
  const aiffPath = path.join(AUDIO_DIR, `${filename}.aiff`);
  const wavPath = path.join(AUDIO_DIR, `${filename}.wav`);

  // macOS say command
  execSync(`say -v Daniel -r 175 -o "${aiffPath}" "${text.replace(/"/g, '\\"')}"`);
  
  // Convert to 44.1kHz WAV using afconvert
  execSync(`afconvert -f WAVE -d LEI16@44100 "${aiffPath}" "${wavPath}"`);
  
  const duration = getAudioDuration(wavPath);
  return { path: wavPath, duration };
}

const scenes = [
  {
    id: 'scene_01_intro',
    title: 'Project Introduction',
    type: 'slide',
    narration: "Hello everyone! This is my walkthrough for TheCarePal's Visit Feedback and Care Quality Dashboard, Task ID FS-08 for the Full Stack Developer Intern position. TheCarePal delivers home healthcare across India, supporting elderly care, dementia care, post-op recovery, and baby care. Our goal is to hear from families regularly and spot problems with a nurse before they turn into complaints.",
    html: `
      <div style="background: linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #115e59 100%); color: white; width: 1920px; height: 1080px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative; overflow: hidden;">
        <div style="position: absolute; width: 600px; height: 600px; background: rgba(20, 184, 166, 0.15); border-radius: 50%; filter: blur(80px); top: -100px; right: -100px;"></div>
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
          <div style="width: 80px; height: 80px; background: #0d9488; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div>
            <h1 style="font-size: 64px; font-weight: 800; margin: 0; letter-spacing: -1px;">TheCarePal</h1>
            <p style="font-size: 24px; color: #99f6e4; margin: 4px 0 0; font-weight: 500;">Home Healthcare & Specialized Nursing India</p>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 36px 60px; max-width: 900px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.25);">
          <span style="background: #14b8a6; color: #042f2e; padding: 6px 16px; border-radius: 9999px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Internship Assignment FS-08</span>
          <h2 style="font-size: 44px; font-weight: 700; margin: 20px 0 12px; line-height: 1.2;">Visit Feedback & Care Quality Dashboard</h2>
          <p style="font-size: 20px; color: #ccfbf1; margin: 0; opacity: 0.9;">End-to-End Proactive Healthcare Quality Assurance System</p>
          <div style="display: flex; justify-content: center; gap: 40px; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 16px; color: #99f6e4;">
            <span>✦ React (Vite) + Tailwind CSS</span>
            <span>✦ Node.js Express + SQLite</span>
            <span>✦ Zero-Login Single-Use Survey</span>
            <span>✦ Net Promoter Score & Triage</span>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'scene_02_family_form',
    title: 'Family Mobile Feedback Form',
    type: 'browser_action',
    viewport: { width: 430, height: 932, isMobile: true },
    url: 'http://localhost:5173/feedback/demo-fresh-01',
    narration: "Let's begin with the family experience. After a shift, family members receive a personalized feedback link via SMS or WhatsApp. Notice that no login is required, eliminating friction for busy families. The form immediately displays the visit details: Nurse Sunita Sharma, Elderly Care, and patient name. Families rate four core pillars: Punctuality, Quality of Care, Hygiene and Safety, and Behaviour, followed by the Net Promoter Score recommendation from 0 to 10 and free-form comments.",
    action: async (page) => {
      await page.waitForSelector('form', { timeout: 10000 });
      await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
      await new Promise((r) => setTimeout(r, 1200));

      // Click star ratings
      const starContainers = await page.$$('.flex.items-center.space-x-1');
      if (starContainers.length >= 4) {
        for (let i = 0; i < 4; i++) {
          const stars = await starContainers[i].$$('button');
          if (stars.length === 5) await stars[4].click();
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      // Click NPS 10
      await page.evaluate(() => window.scrollBy({ top: 260, behavior: 'smooth' }));
      await new Promise((r) => setTimeout(r, 1000));
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const txt = await page.evaluate(el => el.textContent.trim(), btn);
        if (txt === '10') {
          await btn.click();
          break;
        }
      }

      // Type comment
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.type('Nurse Sunita was gentle, attentive and very punctual. Mother felt very comfortable.', { delay: 25 });
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  },
  {
    id: 'scene_03_submission_and_expiry',
    title: 'Single-Use and Expiration Protection',
    type: 'browser_action',
    viewport: { width: 430, height: 932, isMobile: true },
    url: 'http://localhost:5173/feedback/demo-fresh-01',
    narration: "When the family submits the form, the response is instantly recorded, and a reassuring thank-you card appears. Each link is cryptographically unique and works only once: refreshing or reopening the URL immediately informs the family that feedback was already recorded. Furthermore, links expire after a set number of days, ensuring our operations team captures timely, actionable data.",
    action: async (page) => {
      // Click submit
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await new Promise((r) => setTimeout(r, 2500));

      // Reload to show single-use protection
      await page.reload({ waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 2000));

      // Navigate to expired link
      await page.goto('http://localhost:5173/feedback/demo-expired-01', { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 2500));
    }
  },
  {
    id: 'scene_04_dashboard_overview',
    title: 'Operations Quality Dashboard & KPIs',
    type: 'browser_action',
    viewport: { width: 1920, height: 1080 },
    url: 'http://localhost:5173/',
    narration: "Now let's switch to the internal Operations Quality Dashboard. At the top, operations leads see real-time performance indicators: the average care rating across all visits, our Net Promoter Score broken down by Promoters, Passives, and Detractors, the feedback response rate, and active low-score alerts. Below, the trend chart tracks daily rating and NPS progression over time.",
    action: async (page) => {
      await page.waitForSelector('main', { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 2000));

      // Toggle trend chart buttons
      const pillarBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('4 Pillars'));
      });
      if (pillarBtn.asElement()) {
        await pillarBtn.asElement().click();
        await new Promise((r) => setTimeout(r, 2000));
      }

      const npsBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('NPS Trend'));
      });
      if (npsBtn.asElement()) {
        await npsBtn.asElement().click();
        await new Promise((r) => setTimeout(r, 2000));
      }

      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await new Promise((r) => setTimeout(r, 2000));
    }
  },
  {
    id: 'scene_05_nurse_leaderboard',
    title: 'Nurse Performance Leaderboard',
    type: 'browser_action',
    viewport: { width: 1920, height: 1080 },
    url: 'http://localhost:5173/',
    narration: "Under the Nurses tab, we have a complete leaderboard of all caregivers. Each nurse card displays their specialization, total completed visits, average star rating, and a four-pillar breakdown for Punctuality, Care, Hygiene, and Behaviour. Supervisors can easily sort by highest rated, most visits, or active alerts, enabling data-driven recognition and targeted coaching.",
    action: async (page) => {
      // Click Nurses tab
      const nurseTab = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('Nurses ('));
      });
      if (nurseTab.asElement()) {
        await nurseTab.asElement().click();
        await new Promise((r) => setTimeout(r, 1500));
      }

      // Sort by rating
      const select = await page.$('select');
      if (select) {
        await select.select('total_feedback');
        await new Promise((r) => setTimeout(r, 1500));
        await select.select('avg_rating');
        await new Promise((r) => setTimeout(r, 1500));
      }
      await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
      await new Promise((r) => setTimeout(r, 2000));
    }
  },
  {
    id: 'scene_06_low_scores_queue',
    title: 'Low Scores Triage & Follow-up Queue',
    type: 'browser_action',
    viewport: { width: 1920, height: 1080 },
    url: 'http://localhost:5173/',
    narration: "A cornerstone of TheCarePal's quality system is spotting problems before they escalate into formal grievances. The Follow-up Queue automatically isolates visits where ratings are 3 stars or lower, detractor scores are given, or negative comments are detected. Coordinators can view patient contact details, change triage status to In Progress, and record resolution notes directly into the system.",
    action: async (page) => {
      // Click Follow-Up Queue tab
      const queueTab = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('Follow-Up Queue'));
      });
      if (queueTab.asElement()) {
        await queueTab.asElement().click();
        await new Promise((r) => setTimeout(r, 1500));
      }

      // Find first status dropdown
      const statusSelect = await page.$('select');
      if (statusSelect) {
        await statusSelect.select('in_progress');
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Type note
      const noteBox = await page.$('textarea');
      if (noteBox) {
        await noteBox.type('Clinical Lead called family at 2 PM. Replacement shift arranged.', { delay: 25 });
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Click save
      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('Save'));
      });
      if (saveBtn.asElement()) {
        await saveBtn.asElement().click();
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  },
  {
    id: 'scene_07_feedback_feed_profanity',
    title: 'Profanity Moderation & Sentiment Analysis',
    type: 'browser_action',
    viewport: { width: 1920, height: 1080 },
    url: 'http://localhost:5173/',
    narration: "In the All Feedback Feed, our automated NLP pipeline tags every comment with Positive, Neutral, or Negative sentiment. To protect staff dignity, an automated profanity filter masks abusive English and regional slang with asterisks. Operations leads can toggle the Profanity Filter to inspect uncensored text in Audit View. With a single click, all feedback can also be exported as a structured CSV file.",
    action: async (page) => {
      // Click All Feedback Feed
      const feedTab = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('All Feedback Feed'));
      });
      if (feedTab.asElement()) {
        await feedTab.asElement().click();
        await new Promise((r) => setTimeout(r, 1500));
      }

      // Toggle profanity filter button
      const filterToggle = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('Active (Censored)') || b.textContent.includes('Audit View'));
      });
      if (filterToggle.asElement()) {
        await filterToggle.asElement().click();
        await new Promise((r) => setTimeout(r, 2000));
        await filterToggle.asElement().click();
        await new Promise((r) => setTimeout(r, 2000));
      }

      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await new Promise((r) => setTimeout(r, 2000));
    }
  },
  {
    id: 'scene_08_weekly_digest',
    title: 'Weekly Summary Operations Email',
    type: 'browser_action',
    viewport: { width: 1920, height: 1080 },
    url: 'http://localhost:5173/',
    narration: "As a bonus feature, the system automatically compiles a weekly summary email for executive and operations leadership. Clicking Weekly Digest opens a live preview of the HTML email template, summarizing performance highlights, top caregivers, and unresolved low scores. Leaders can dispatch the digest instantly or have it sent via scheduled cron.",
    action: async (page) => {
      // Click Weekly Digest button
      const digestBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('Weekly Digest'));
      });
      if (digestBtn.asElement()) {
        await digestBtn.asElement().click();
        await new Promise((r) => setTimeout(r, 2500));
      }

      // Scroll preview modal
      const modal = await page.$('.overflow-y-auto');
      if (modal) {
        await page.evaluate(el => el.scrollBy({ top: 250, behavior: 'smooth' }), modal);
        await new Promise((r) => setTimeout(r, 2500));
      }
    }
  },
  {
    id: 'scene_09_code_and_architecture',
    title: 'Code Architecture & Design Decisions',
    type: 'slide',
    narration: "Taking a look at our architecture: the backend uses Node.js and Express with modular services for sentiment scoring, profanity detection, and CSV formatting. We chose SQLite for zero-configuration, ACID-compliant local evaluation. In our schema, visits are decoupled with cryptographic tokens, enforcing single-use and expiration guards. The React frontend uses Vite and Tailwind CSS for rapid mobile-first execution.",
    html: `
      <div style="background: #0f172a; color: white; width: 1920px; height: 1080px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 60px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <span style="color: #2dd4bf; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; font-size: 16px;">Technical Design & Engineering Decisions</span>
          <h2 style="font-size: 48px; font-weight: 800; margin: 10px 0;">Clean, Scalable Architecture</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 1500px; width: 100%;">
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 32px;">
            <div style="font-size: 32px; margin-bottom: 12px;">📱</div>
            <h3 style="font-size: 24px; font-weight: 700; color: #38bdf8; margin: 0 0 12px;">Frontend Architecture</h3>
            <ul style="font-size: 16px; color: #cbd5e1; line-height: 1.8; padding-left: 20px; margin: 0;">
              <li>React 19 + Vite: Sub-second builds</li>
              <li>Tailwind CSS: Mobile-first responsive UX</li>
              <li>Recharts: Dynamic rating & NPS trends</li>
              <li>Zero-login family friction reduction</li>
            </ul>
          </div>
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 32px;">
            <div style="font-size: 32px; margin-bottom: 12px;">⚙️</div>
            <h3 style="font-size: 24px; font-weight: 700; color: #2dd4bf; margin: 0 0 12px;">Backend & Security</h3>
            <ul style="font-size: 16px; color: #cbd5e1; line-height: 1.8; padding-left: 20px; margin: 0;">
              <li>Node.js + Express: Service-oriented design</li>
              <li>Token Guard: Single-use & expiration security</li>
              <li>Profanity Filter: Masking & audit toggle</li>
              <li>Sentiment Engine: Auto NLP classification</li>
            </ul>
          </div>
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 32px;">
            <div style="font-size: 32px; margin-bottom: 12px;">🗄️</div>
            <h3 style="font-size: 24px; font-weight: 700; color: #a78bfa; margin: 0 0 12px;">Data Layer & Integrity</h3>
            <ul style="font-size: 16px; color: #cbd5e1; line-height: 1.8; padding-left: 20px; margin: 0;">
              <li>SQLite with Promise Wrapper: Zero-config ACID</li>
              <li>Foreign key constraints: Nurses, Visits, Feedback</li>
              <li>RFC-compliant CSV export streaming</li>
              <li>Nodemailer weekly HTML digest engine</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'scene_10_roadmap_and_conclusion',
    title: 'Future Roadmap & Conclusion',
    type: 'slide',
    narration: "Looking ahead, for production we would integrate WhatsApp Business API for automatic link triggers two hours post-shift, add multi-lingual voice feedback for diverse Indian families, and configure Slack escalation if low scores remain unassigned for over four hours. Thank you for your time, and I look forward to contributing to TheCarePal!",
    html: `
      <div style="background: linear-gradient(135deg, #042f2e 0%, #0f172a 100%); color: white; width: 1920px; height: 1080px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 60px;">
        <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; padding: 48px 64px; max-width: 1100px; width: 100%; text-align: center;">
          <span style="color: #2dd4bf; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 16px;">What to Build Next</span>
          <h2 style="font-size: 44px; font-weight: 800; margin: 12px 0 32px;">Production Roadmap</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; text-align: left; margin-bottom: 40px;">
            <div style="background: rgba(0,0,0,0.25); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
              <h4 style="font-size: 18px; color: #38bdf8; margin: 0 0 8px;">1. Automated WhatsApp Bot</h4>
              <p style="font-size: 14px; color: #94a3b8; margin: 0; line-height: 1.5;">Auto-trigger survey links 2 hours after nurse checkout in mobile app.</p>
            </div>
            <div style="background: rgba(0,0,0,0.25); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
              <h4 style="font-size: 18px; color: #2dd4bf; margin: 0 0 8px;">2. Multi-Lingual & Voice</h4>
              <p style="font-size: 14px; color: #94a3b8; margin: 0; line-height: 1.5;">Audio voice notes & 6 regional Indian languages for elderly caregivers.</p>
            </div>
            <div style="background: rgba(0,0,0,0.25); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
              <h4 style="font-size: 18px; color: #f43f5e; margin: 0 0 8px;">3. Clinical Escalation SLAs</h4>
              <p style="font-size: 14px; color: #94a3b8; margin: 0; line-height: 1.5;">Slack & SMS escalation if critical scores are unresolved after 4 hours.</p>
            </div>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.15); padding-top: 28px;">
            <h3 style="font-size: 32px; font-weight: 700; margin: 0; color: #ffffff;">Thank You, TheCarePal Team!</h3>
            <p style="font-size: 18px; color: #2dd4bf; margin: 8px 0 0; font-weight: 500;">Task ID: FS-08 • Full Stack Developer Intern Submission</p>
          </div>
        </div>
      </div>
    `
  }
];

async function generateWalkthroughVideo() {
  console.log('\n=============================================================');
  console.log('   Starting TheCarePal Automated Walkthrough Video Generation  ');
  console.log('=============================================================\n');

  // Reset database to ensure demo links are active
  execSync('node ../server/src/seed.js');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const sceneVideoFiles = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    console.log(`\n--- Scene ${i + 1}/${scenes.length}: ${scene.title} ---`);

    // 1. Generate Voiceover Audio
    console.log(` Generating voiceover with Daniel (en_GB)...`);
    const { path: audioPath, duration } = generateSpeech(scene.narration, scene.id);
    console.log(` Voiceover ready (${duration.toFixed(1)}s)`);

    // Add 1.5s padding so the scene doesn't cut off abruptly
    const totalSceneDuration = duration + 1.5;
    const fps = 24;
    const totalFrames = Math.ceil(totalSceneDuration * fps);

    const sceneFramesDir = path.join(FRAMES_DIR, scene.id);
    fs.mkdirSync(sceneFramesDir, { recursive: true });

    // 2. Render and Capture Frames
    console.log(` Capturing ${totalFrames} frames at ${fps} fps...`);
    const page = await browser.newPage();

    if (scene.type === 'slide') {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setContent(scene.html, { waitUntil: 'load' });
      const screenshotPath = path.join(sceneFramesDir, 'frame_%04d.png');

      // Take single frame and duplicate for efficiency
      const singleFramePath = path.join(sceneFramesDir, 'single.png');
      await page.screenshot({ path: singleFramePath });

      // Link or copy frames
      for (let f = 1; f <= totalFrames; f++) {
        const frameNum = String(f).padStart(4, '0');
        fs.copyFileSync(singleFramePath, path.join(sceneFramesDir, `frame_${frameNum}.png`));
      }
    } else if (scene.type === 'browser_action') {
      await page.setViewport(scene.viewport);
      await page.goto(scene.url, { waitUntil: 'networkidle0' });

      // If mobile, wrap in a phone frame against a dark background for clean presentation
      const isMobile = scene.viewport.isMobile;
      if (isMobile) {
        // We'll capture mobile viewport
      }

      // Execute scene action
      if (scene.action) {
        await scene.action(page);
      }

      // Capture final steady state frame and duplicate
      const finalFramePath = path.join(sceneFramesDir, 'single.png');
      await page.screenshot({ path: finalFramePath });

      for (let f = 1; f <= totalFrames; f++) {
        const frameNum = String(f).padStart(4, '0');
        fs.copyFileSync(finalFramePath, path.join(sceneFramesDir, `frame_${frameNum}.png`));
      }
    }

    await page.close();

    // 3. Encode Scene Video with FFmpeg (uniform 1920x1080 with padding)
    console.log(` Encoding scene video with FFmpeg...`);
    const sceneVideoPath = path.join(OUTPUT_DIR, `${scene.id}.mp4`);

    execSync(
      `"${ffmpegPath}" -y -framerate ${fps} -i "${sceneFramesDir}/frame_%04d.png" -i "${audioPath}" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#042f2e" -c:v libx264 -pix_fmt yuv420p -r ${fps} -c:a aac -b:a 192k -shortest "${sceneVideoPath}"`,
      { stdio: 'inherit' }
    );

    sceneVideoFiles.push(sceneVideoPath);
  }

  await browser.close();

  // 4. Concatenate all scenes into final video
  console.log('\n--- Concatenating all scenes into master walkthrough video ---');
  const concatListPath = path.join(OUTPUT_DIR, 'concat_list.txt');
  const concatContent = sceneVideoFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  execSync(
    `"${ffmpegPath}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${FINAL_VIDEO_PATH}"`,
    { stdio: 'inherit' }
  );

  const finalDuration = getAudioDuration(FINAL_VIDEO_PATH);
  const fileSizeMB = (fs.statSync(FINAL_VIDEO_PATH).size / (1024 * 1024)).toFixed(2);

  console.log('\n=============================================================');
  console.log('   🎉 Walkthrough Video Successfully Generated!             ');
  console.log('=============================================================');
  console.log(` File Path: ${FINAL_VIDEO_PATH}`);
  console.log(` Duration:  ${Math.floor(finalDuration / 60)}m ${Math.round(finalDuration % 60)}s (Target: 2 to 5 minutes)`);
  console.log(` Size:      ${fileSizeMB} MB`);
  console.log(' Format:    1080p MP4 (H.264 / AAC) — Ready for YouTube or Google Drive');
  console.log('=============================================================\n');
}

generateWalkthroughVideo().catch(err => {
  console.error('Fatal video generation error:', err);
  process.exit(1);
});
