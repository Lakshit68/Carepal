# 2 to 5-Minute Video Walkthrough Script
**Task ID:** FS-08 (TheCarePal Full Stack Developer Intern Assignment)

Use this step-by-step guide to record your 2-to-5 minute screen recording for your submission to Google Drive or YouTube (unlisted).

---

## ⏱️ Timing Breakdown (Target: 3.5 to 4 Minutes)

| Part | Duration | Focus Area |
| :--- | :--- | :--- |
| **Part 1: Working Product Demo** | ~2:00 mins | Live demo of the Family Form, Single-Use Expiry, and Ops Dashboard. |
| **Part 2: Code Walkthrough** | ~1:15 mins | Show server architecture, database schema, token guard, & profanity filter. |
| **Part 3: Design Decisions & Next Steps**| ~0:45 mins | Explain product sense, security, and roadmap. |

---

## 🎬 Part 1: Product Demo (Show the Working Product First)

### Step 1: Mobile Feedback Form (30 seconds)
- **What to show on screen:** Open `http://localhost:5173/feedback/demo-fresh-02` (switch Chrome dev tools to a mobile viewport like iPhone 14 to showcase product sense).
- **What to say:**
  > *"Hi everyone, this is my submission for TheCarePal's Visit Feedback and Care Quality Dashboard, Task ID FS-08. We're looking at the feedback form that a family receives via SMS or WhatsApp after a visit. Notice that it requires no login, loads visit details automatically—like Sister Anjali Nair's post-op recovery visit—and is fully responsive on mobile."*
- **Action:** Rate Punctuality 5, Care Quality 5, Hygiene 5, Behaviour 5, NPS 10, write: *"Sister Anjali was so gentle with dressing change"*, and click **Submit**.
- **What to say:**
  > *"Once submitted, the confirmation card appears. If I try to refresh or reopen this same link, the system blocks re-submission to protect data integrity: each link works strictly once."*
- **Action:** Quickly show `http://localhost:5173/feedback/demo-expired-01` to show the **Expired Link** state.
  > *"Likewise, links expire after a set number of days so our operations team catches issues in a timely window."*

### Step 2: Operations Dashboard & KPIs (45 seconds)
- **What to show on screen:** Switch to `http://localhost:5173/`.
- **What to say:**
  > *"Now moving to the internal Operations CRM. At a glance, we see our core quality KPIs: Average Care Rating across the 4 pillars, our Net Promoter Score broken down by Promoters, Passives, and Detractors, response rate, and active alerts. Below, the trend chart tracks quality and NPS over time."*

### Step 3: Nurse Breakdown, Profanity Filter, & Follow-Up (45 seconds)
- **What to show on screen:** 
  1. Scroll to **Nurse Leaderboard**: Show individual ratings and 4-pillar scores for each nurse.
  2. Switch to **Follow-Up Queue**: Show low-score visits ($\le 3.0$) needing immediate attention. Update a status to *In Progress*, add an ops note (*"Spoke to son, replacing nurse tomorrow"*), and click *Save*.
  3. Switch to **All Feedback Feed**: Show sentiment tags (Positive, Neutral, Negative) and the **Profanity Filter**. Click the toggle to show censored vs. uncensored audit view.
  4. Click **Export CSV** to show instant data download, and click **Weekly Digest** to preview the automated HTML email sent to the operations team.

---

## 💻 Part 2: Code Walkthrough (1:15 mins)

### Step 1: Project Structure
- **What to show:** VS Code explorer showing `client/` and `server/`.
- **What to say:**
  > *"The architecture is cleanly separated into a React Vite client and a Node.js Express backend with SQLite. In `server/src/db/database.js`, we have an ACID-compliant schema with foreign keys connecting nurses, visits, and feedback."*

### Step 2: Key Backend Logic
- **Show `server/src/routes/feedbackRoutes.js`:**
  > *"In our feedback route, we validate the unique token: ensuring it exists, has not been used before, and has not passed its expiration timestamp. On submission, we calculate the 4-pillar average, run our profanity moderation engine to mask offensive slang, run sentiment analysis, and flag low scores for follow-up."*
- **Show `server/src/services/profanityService.js` and `emailService.js`:**
  > *"Our profanity filter covers English and regional terms to protect nurse dignity. For operations, `emailService.js` generates a clean HTML weekly digest with Nodemailer."*

---

## 💡 Part 3: Design Decisions & What I Would Build Next (45 seconds)

- **What to say:**
  > *"Key design decisions: First, keeping the feedback form frictionless—no login—because family members caring for elderly patients or newborns are busy and will abandon complex login screens. Second, SQLite was chosen for zero-config portable evaluation without cloud lock-in.*
  >
  > *If I were building this next for production at TheCarePal, I would integrate WhatsApp Business API to trigger links automatically after nurse checkout, add multi-lingual voice feedback for elderly family members, and build a Slack escalation alert if a 1-star review is unassigned for more than 4 hours.*
  >
  > *Thank you, and I look forward to contributing to TheCarePal!"*
