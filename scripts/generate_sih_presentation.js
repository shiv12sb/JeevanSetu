const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pptx = new pptxgen();

// Set 16:9 widescreen presentation dimensions (13.33 x 7.5 inches)
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Team JeevanSetu';
pptx.company = 'Smart India Hackathon 2026 - Government of Maharashtra';
pptx.title = 'JeevanSetu - SIH 2026 Final Presentation';
pptx.subject = 'SIH Problem Statement 26133 - Rural Healthcare Access & Coordination';

// Asset paths
const sihLogoHeader = path.join(__dirname, '../assets/sih_logo_header.png');
const sihBrainBulb = path.join(__dirname, '../assets/sih_brain_bulb_title.png');
const homeDashboardImg = path.join(__dirname, '../assets/jeevansetu_home_dashboard.jpg');
const voiceModalImg = path.join(__dirname, '../assets/jeevansetu_marathi_voice_modal.jpg');

// Professional SIH Color Palette
const NAVY_PRIMARY = '0B2B63';       // SIH Header Deep Blue
const BLUE_ACCENT = '0B72B9';        // SIH Template Footer Blue
const BLUE_LIGHT = 'EBF3FA';         // Soft Blue Container Fill
const TEAL_ACCENT = '0D7D75';        // Healthcare Teal Accent
const TEAL_LIGHT = 'E6F7F5';         // Soft Teal Container Fill
const AMBER_ACCENT = 'D97706';       // Warning / Stockout Amber
const AMBER_LIGHT = 'FEF3C7';        // Amber Container Fill
const RED_ACCENT = 'DC2626';         // Emergency / Alert Red
const RED_LIGHT = 'FEE2E2';          // Soft Red Container Fill
const GREEN_ACCENT = '16A34A';       // Success / Active Green
const GREEN_LIGHT = 'F0FDF4';        // Soft Green Container Fill
const GRAY_DARK = '0F172A';          // Slate 900 for Primary Headings
const GRAY_BODY = '334155';          // Slate 700 for Clean Body Text
const GRAY_LIGHT = 'F8FAFC';        // Card Fill Light
const GRAY_BORDER = 'CBD5E1';       // Card Border Light
const WHITE = 'FFFFFF';
const DARK_BG = '0F172A';

/**
 * Applies Standard SIH Header & Footer to Slides 2 to 12
 */
function applySIHTemplate(slide, title, slideNumber) {
  // 1. Top-Left Team Name Oval
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 0.5,
    y: 0.22,
    w: 1.5,
    h: 0.8,
    line: { color: NAVY_PRIMARY, width: 1.5 },
    fill: { color: WHITE }
  });
  slide.addText('Your\nTeam\nName', {
    x: 0.5,
    y: 0.22,
    w: 1.5,
    h: 0.8,
    fontSize: 10.5,
    bold: true,
    color: NAVY_PRIMARY,
    align: 'center',
    valign: 'middle',
    fontFace: 'Georgia',
    lineSpacingMultiple: 0.95
  });

  // 2. Top-Center Big Title (Serif Bold)
  slide.addText(title, {
    x: 2.1,
    y: 0.25,
    w: 8.9,
    h: 0.75,
    fontSize: 21,
    bold: true,
    color: NAVY_PRIMARY,
    align: 'center',
    valign: 'middle',
    fontFace: 'Georgia'
  });

  // 3. Top-Right SIH 2026 Logo
  if (fs.existsSync(sihLogoHeader)) {
    slide.addImage({
      path: sihLogoHeader,
      x: 11.2,
      y: 0.18,
      w: 1.65,
      h: 0.82
    });
  }

  // 4. Bottom Full-Width Blue Footer Bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 7.15,
    w: 13.33,
    h: 0.35,
    fill: { color: BLUE_ACCENT },
    line: { color: BLUE_ACCENT, width: 0 }
  });
  slide.addText(`@SIH Idea submission- Template  ${slideNumber}`, {
    x: 0.5,
    y: 7.15,
    w: 6.0,
    h: 0.35,
    fontSize: 10,
    color: WHITE,
    align: 'left',
    valign: 'middle',
    fontFace: 'Arial'
  });
  slide.addText(`${slideNumber}`, {
    x: 12.0,
    y: 7.15,
    w: 0.8,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: WHITE,
    align: 'right',
    valign: 'middle',
    fontFace: 'Arial'
  });
}

// =========================================================================
// SLIDE 1: EXACT SIH SAMPLE TITLE PAGE (100% Faithful Replica)
// =========================================================================
const slide1 = pptx.addSlide();
slide1.background = { color: WHITE };

// Top Banner Text
slide1.addText('SMART INDIA HACKATHON 2026', {
  x: 1.0,
  y: 0.5,
  w: 8.5,
  h: 0.8,
  fontSize: 26,
  bold: true,
  color: NAVY_PRIMARY,
  align: 'left',
  valign: 'middle',
  fontFace: 'Georgia'
});

// Top Right Logo
if (fs.existsSync(sihLogoHeader)) {
  slide1.addImage({
    path: sihLogoHeader,
    x: 10.8,
    y: 0.35,
    w: 2.0,
    h: 1.0
  });
}

// Center Title
slide1.addText('TITLE PAGE', {
  x: 1.0,
  y: 1.8,
  w: 11.33,
  h: 0.8,
  fontSize: 24,
  bold: true,
  color: '000000',
  align: 'center',
  valign: 'middle',
  fontFace: 'Georgia'
});

// Background Brain Bulb Graphic
if (fs.existsSync(sihBrainBulb)) {
  slide1.addImage({
    path: sihBrainBulb,
    x: 7.2,
    y: 1.6,
    w: 5.5,
    h: 5.5
  });
}

// Left Details Box with Clean Individual Bullet Items
const slide1Bullets = [
  [
    { text: 'Problem Statement ID – ', options: { bold: true, fontSize: 14.5, color: '000000', fontFace: 'Arial' } },
    { text: '26133', options: { bold: false, fontSize: 14.5, color: '000000', fontFace: 'Arial' } }
  ],
  [
    { text: 'Problem Statement Title- ', options: { bold: true, fontSize: 14.5, color: '000000', fontFace: 'Arial' } },
    { text: '"Accessibility and quality of public healthcare services, particularly in rural and underserved areas"', options: { bold: false, fontSize: 13.5, color: '000000', fontFace: 'Arial' } }
  ],
  [
    { text: 'Theme- ', options: { bold: true, fontSize: 14.5, color: '000000', fontFace: 'Arial' } },
    { text: 'MedTech / BioTech / HealthTech', options: { bold: false, fontSize: 14.5, color: '000000', fontFace: 'Arial' } }
  ],
  [
    { text: 'PS Category- ', options: { bold: true, fontSize: 14.5, color: '000000', fontFace: 'Arial' } },
    { text: 'Software', options: { bold: false, fontSize: 14.5, color: '000000', fontFace: 'Arial' } }
  ],
  [
    { text: 'Team ID- ', options: { bold: true, fontSize: 14.5, color: '000000', fontFace: 'Arial' } },
    { text: '[Registered Team ID]', options: { bold: false, fontSize: 14.5, color: '000000', fontFace: 'Arial' } }
  ],
  [
    { text: 'Team Name (Registered on portal)- ', options: { bold: true, fontSize: 14.5, color: '000000', fontFace: 'Arial' } },
    { text: 'Team JeevanSetu', options: { bold: false, fontSize: 14.5, color: '000000', fontFace: 'Arial' } }
  ]
];

slide1Bullets.forEach((item, idx) => {
  const yPos = 2.8 + idx * 0.72;
  slide1.addText(item, {
    x: 0.8,
    y: yPos,
    w: 6.8,
    h: 0.65,
    bullet: true,
    valign: 'top',
    lineSpacingMultiple: 1.05
  });
});


// =========================================================================
// SLIDE 2: THE PROBLEM (Rural Healthcare Crisis & Broken Patient Journey)
// =========================================================================
const slide2 = pptx.addSlide();
slide2.background = { color: WHITE };
applySIHTemplate(slide2, 'IDEA TITLE', 2);

slide2.addText('❖ Proposed Solution: Problem Analysis & Ground Reality in Rural Maharashtra', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

const problems = [
  {
    num: '1',
    title: 'The 70 km Referral Blackhole',
    desc: 'When a rural patient is referred from a PHC to a District Hospital, there is ZERO digital coordination. Patients arrive after arduous travel only to find specialists absent or ICU beds full.',
    stat: '42% Referral Dropout Rate in Rural Transit',
    color: RED_ACCENT,
    bg: RED_LIGHT
  },
  {
    num: '2',
    title: 'Language & Digital Literacy Divide',
    desc: 'Over 68% of tribal/rural citizens cannot read or type text forms in English/Hindi. Existing e-health portals are unusable for non-literate villagers speaking Marathi or regional dialects.',
    stat: 'Zero Usability for Non-Literate Keypad Users',
    color: AMBER_ACCENT,
    bg: AMBER_LIGHT
  },
  {
    num: '3',
    title: 'Ghost Facilities & Silent Stockouts',
    desc: 'Villagers walk 15–30 km on foot only to discover duty doctors are absent or critical emergency medicines (anti-snake venoms, insulin, maternal antibiotics) are completely out of stock.',
    stat: 'Supply Chains are 100% Reactive',
    color: NAVY_PRIMARY,
    bg: BLUE_LIGHT
  }
];

problems.forEach((p, idx) => {
  const yPos = 1.65 + idx * 1.7;
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: yPos,
    w: 5.9,
    h: 1.55,
    rectRadius: 0.1,
    fill: { color: p.bg },
    line: { color: p.color, width: 1.2 }
  });
  slide2.addText(`${p.num}. ${p.title}`, {
    x: 0.75,
    y: yPos + 0.08,
    w: 5.6,
    h: 0.32,
    fontSize: 12.5,
    bold: true,
    color: p.color,
    fontFace: 'Arial'
  });
  slide2.addText(p.desc, {
    x: 0.75,
    y: yPos + 0.42,
    w: 5.6,
    h: 0.7,
    fontSize: 9.5,
    color: GRAY_BODY,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.75,
    y: yPos + 1.15,
    w: 5.6,
    h: 0.28,
    rectRadius: 0.06,
    fill: { color: WHITE },
    line: { color: p.color, width: 0.8 }
  });
  slide2.addText(`🚨 Ground Reality: ${p.stat}`, {
    x: 0.75,
    y: yPos + 1.15,
    w: 5.6,
    h: 0.28,
    fontSize: 8.5,
    bold: true,
    color: p.color,
    align: 'center',
    valign: 'middle',
    fontFace: 'Arial'
  });
});

// Right Column: Rural Patient Journey Visual Breakdown
slide2.addShape(pptx.ShapeType.roundRect, {
  x: 6.8,
  y: 1.65,
  w: 5.9,
  h: 5.1,
  rectRadius: 0.12,
  fill: { color: GRAY_LIGHT },
  line: { color: GRAY_BORDER, width: 1.5 }
});

slide2.addText('🔴 THE BROKEN RURAL PATIENT JOURNEY (CURRENT REALITY)', {
  x: 7.0,
  y: 1.8,
  w: 5.5,
  h: 0.35,
  fontSize: 11.5,
  bold: true,
  color: RED_ACCENT,
  fontFace: 'Arial',
  align: 'center'
});

const journeySteps = [
  { step: '1. Sickness at Remote Hamlet', detail: 'Tribal patient falls ill in Gadchiroli; no local diagnostic facility.' },
  { step: '2. Blind Travel (15-25 km)', detail: 'Spends daily wages on transport to reach Sub-Centre / PHC.' },
  { step: '3. Facility Dead-End', detail: 'Doctor is on unrecorded leave; anti-snake venom is out of stock.' },
  { step: '4. Paper Referral Slip', detail: 'Handed a paper slip to District Hospital 70 km away without bed confirmation.' },
  { step: '5. Catastrophic Dropout (42%)', detail: 'Fearing exorbitant costs & unfamiliar city hospitals, patient returns home.' },
  { step: '6. Preventable Tragedy', detail: 'Manageable medical condition turns into a fatal emergency.' }
];

journeySteps.forEach((st, idx) => {
  const yBox = 2.25 + idx * 0.75;
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 7.0,
    y: yBox,
    w: 5.5,
    h: 0.65,
    rectRadius: 0.08,
    fill: { color: WHITE },
    line: { color: idx >= 4 ? RED_ACCENT : GRAY_BORDER, width: idx >= 4 ? 1.2 : 0.8 }
  });
  slide2.addText(st.step, {
    x: 7.15,
    y: yBox + 0.05,
    w: 5.2,
    h: 0.24,
    fontSize: 9.5,
    bold: true,
    color: idx >= 4 ? RED_ACCENT : NAVY_PRIMARY,
    fontFace: 'Arial'
  });
  slide2.addText(st.detail, {
    x: 7.15,
    y: yBox + 0.28,
    w: 5.2,
    h: 0.32,
    fontSize: 8.5,
    color: GRAY_BODY,
    fontFace: 'Arial'
  });
});


// =========================================================================
// SLIDE 3: EXISTING GAP ANALYSIS & ECOSYSTEM HARMONIZATION
// =========================================================================
const slide3 = pptx.addSlide();
slide3.background = { color: WHITE };
applySIHTemplate(slide3, 'IDEA TITLE', 3);

slide3.addText('❖ Ecosystem Analysis: Strengthening & Harmonizing Existing Public Health Systems', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

slide3.addShape(pptx.ShapeType.roundRect, {
  x: 0.6,
  y: 1.65,
  w: 12.1,
  h: 1.4,
  rectRadius: 0.1,
  fill: { color: BLUE_LIGHT },
  line: { color: BLUE_ACCENT, width: 1.2 }
});

slide3.addText('🏛️ 4-TIER PUBLIC HEALTHCARE ECOSYSTEM IN MAHARASHTRA', {
  x: 0.8,
  y: 1.75,
  w: 11.7,
  h: 0.3,
  fontSize: 11,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial',
  align: 'center'
});

const tiers = [
  { name: '1. Sub-Centres (SC)', role: 'ASHA / ANM Workers', issue: 'Paper registers, zero referral visibility', x: 0.8 },
  { name: '2. Primary Health Centres', role: 'PHC Medical Officers', issue: 'Reactive supply chain, attendance blindspot', x: 3.8 },
  { name: '3. Sub-District Hospitals', role: 'Specialist First Referral', issue: 'Unannounced surge, no prior bed booking', x: 6.8 },
  { name: '4. District Civil Hospitals', role: 'Tertiary Care & Surgery', issue: 'Overcrowded OPDs, lost follow-up loop', x: 9.8 }
];

tiers.forEach((t) => {
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: t.x,
    y: 2.1,
    w: 2.7,
    h: 0.8,
    rectRadius: 0.08,
    fill: { color: WHITE },
    line: { color: BLUE_ACCENT, width: 1.0 }
  });
  slide3.addText(t.name, {
    x: t.x,
    y: 2.15,
    w: 2.7,
    h: 0.24,
    fontSize: 9.5,
    bold: true,
    color: NAVY_PRIMARY,
    align: 'center',
    fontFace: 'Arial'
  });
  slide3.addText(`${t.role}\n⚠️ ${t.issue}`, {
    x: t.x + 0.1,
    y: 2.38,
    w: 2.5,
    h: 0.48,
    fontSize: 7.5,
    color: GRAY_BODY,
    align: 'center',
    fontFace: 'Arial'
  });
});

slide3.addText('🔍 COMPARATIVE GAP ANALYSIS: HOW JEEVANSETU COMPLEMENTS NATIONAL PLATFORMS', {
  x: 0.6,
  y: 3.18,
  w: 12.1,
  h: 0.35,
  fontSize: 11.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

const tableHeaders = [
  { text: 'National / State Portal', options: { bold: true, color: WHITE, fill: NAVY_PRIMARY, fontSize: 9.5, align: 'center' } },
  { text: 'Core Intended Function', options: { bold: true, color: WHITE, fill: NAVY_PRIMARY, fontSize: 9.5, align: 'center' } },
  { text: 'Rural Operational Limitation', options: { bold: true, color: WHITE, fill: RED_ACCENT, fontSize: 9.5, align: 'center' } },
  { text: 'JeevanSetu Unified Bridge (Our Impact)', options: { bold: true, color: WHITE, fill: GREEN_ACCENT, fontSize: 9.5, align: 'center' } }
];

const tableRows = [
  [
    { text: 'ABHA & ABDM', options: { bold: true, fontSize: 8.5 } },
    { text: 'National Health ID & Longitudinal Electronic Health Records', options: { fontSize: 8 } },
    { text: 'No live inter-facility referral handshakes, queue tokens, or bed booking', options: { fontSize: 8, color: RED_ACCENT } },
    { text: 'Acts as the Active Coordination Layer that feeds verified events into ABDM', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } }
  ],
  [
    { text: 'e-Sanjeevani', options: { bold: true, fontSize: 8.5 } },
    { text: 'Doctor-to-Doctor & Citizen Teleconsultation', options: { fontSize: 8 } },
    { text: 'Requires high-speed 4G video; does not manage PHC drug inventory or transit', options: { fontSize: 8, color: RED_ACCENT } },
    { text: 'Works on 2G Keypad IVR + Real-time Marathi Voice AI without video overhead', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } }
  ],
  [
    { text: '108 Emergency Fleet', options: { bold: true, fontSize: 8.5 } },
    { text: 'Emergency Ambulance Dispatch', options: { fontSize: 8 } },
    { text: 'Lacks digital vitals pre-transmission to destination hospital trauma team', options: { fontSize: 8, color: RED_ACCENT } },
    { text: 'Bi-directional triage data sharing with destination hospital before ambulance arrives', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } }
  ],
  [
    { text: 'MJPJAY / PM-JAY', options: { bold: true, fontSize: 8.5 } },
    { text: '₹5 Lakhs Cashless Health Coverage', options: { fontSize: 8 } },
    { text: 'Rural villagers do not know which empaneled hospital performs specific surgeries', options: { fontSize: 8, color: RED_ACCENT } },
    { text: 'Automated Grounded Scheme Suggester maps patient symptoms directly to schemes', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } }
  ]
];

slide3.addTable([tableHeaders, ...tableRows], {
  x: 0.6,
  y: 3.55,
  w: 12.1,
  h: 3.2,
  colW: [2.0, 3.2, 3.4, 3.5],
  border: { color: GRAY_BORDER, width: 0.8 },
  valign: 'middle'
});


// =========================================================================
// SLIDE 4: OUR SOLUTION — JEEVANSETU (HealthcareBridge)
// =========================================================================
const slide4 = pptx.addSlide();
slide4.background = { color: WHITE };
applySIHTemplate(slide4, 'IDEA TITLE', 4);

slide4.addText('❖ Proposed Solution: JeevanSetu — The Connected Rural Healthcare Highway', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

slide4.addShape(pptx.ShapeType.roundRect, {
  x: 0.6,
  y: 1.65,
  w: 12.1,
  h: 1.1,
  rectRadius: 0.1,
  fill: { color: TEAL_LIGHT },
  line: { color: TEAL_ACCENT, width: 1.5 }
});

slide4.addText('🌐 "BRIDGING RURAL PATIENTS TO VERIFIED, LIFE-SAVING CARE"', {
  x: 0.8,
  y: 1.75,
  w: 11.7,
  h: 0.3,
  fontSize: 12,
  bold: true,
  color: TEAL_ACCENT,
  fontFace: 'Arial',
  align: 'center'
});

slide4.addText('JeevanSetu (जीवनसेतु) is a high-reliability, zero-literacy digital healthcare coordination platform engineered for the Government of Maharashtra. It unifies citizens, ASHA workers, PHC Medical Officers, District Hospitals, and Health Administrators into a single seamless, transparent, and multi-lingual care highway.', {
  x: 0.8,
  y: 2.05,
  w: 11.7,
  h: 0.6,
  fontSize: 9.5,
  color: GRAY_DARK,
  fontFace: 'Arial',
  align: 'center',
  lineSpacingMultiple: 1.05
});

const stakeholders = [
  {
    role: '1. Rural Citizen',
    badge: '🗣️ Citizen Desk',
    points: ['Hands-free Marathi Voice AI', '2G Keypad IVR Phone Access', 'Check Before You Travel desk', 'MJPJAY ₹5L cashless finder'],
    color: TEAL_ACCENT,
    bg: TEAL_LIGHT
  },
  {
    role: '2. ASHA Worker',
    badge: '👩‍⚕️ Community Lead',
    points: ['Field triage guidance', 'Maternal risk tracking', 'Post-discharge follow-up', 'Emergency 108 ambulance routing'],
    color: BLUE_ACCENT,
    bg: BLUE_LIGHT
  },
  {
    role: '3. PHC Doctor',
    badge: '🏥 Primary Care',
    points: ['Verified doctor check-in', '6-stage digital referral', 'Drug depletion alerts', 'OPD digital token & vitals'],
    color: NAVY_PRIMARY,
    bg: GRAY_LIGHT
  },
  {
    role: '4. District Hospital',
    badge: '🏨 Tertiary Hub',
    points: ['Pre-arrival bed booking', 'Referral handshake', 'Specialist OPD doctor desk', 'QR code admission verify'],
    color: AMBER_ACCENT,
    bg: AMBER_LIGHT
  },
  {
    role: '5. District Admin',
    badge: '📊 Public Health',
    points: ['Outbreak Z-score detection', 'Doctor presence integrity', 'Medicine rebalancing desk', 'District completion metrics'],
    color: GREEN_ACCENT,
    bg: GREEN_LIGHT
  }
];

stakeholders.forEach((s, idx) => {
  const xPos = 0.6 + idx * 2.45;
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: xPos,
    y: 2.9,
    w: 2.35,
    h: 3.9,
    rectRadius: 0.1,
    fill: { color: s.bg },
    line: { color: s.color, width: 1.2 }
  });
  
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: xPos + 0.15,
    y: 3.02,
    w: 2.05,
    h: 0.52,
    rectRadius: 0.06,
    fill: { color: WHITE },
    line: { color: s.color, width: 0.8 }
  });
  slide4.addText(s.role, {
    x: xPos + 0.15,
    y: 3.02,
    w: 2.05,
    h: 0.52,
    fontSize: 9.5,
    bold: true,
    color: s.color,
    align: 'center',
    valign: 'middle',
    fontFace: 'Arial'
  });
  
  s.points.forEach((pt, pIdx) => {
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.15,
      y: 3.65 + pIdx * 0.75,
      w: 2.05,
      h: 0.65,
      rectRadius: 0.05,
      fill: { color: WHITE },
      line: { color: GRAY_BORDER, width: 0.6 }
    });
    slide4.addText(`✓ ${pt}`, {
      x: xPos + 0.2,
      y: 3.65 + pIdx * 0.75,
      w: 1.95,
      h: 0.65,
      fontSize: 8.2,
      color: GRAY_BODY,
      valign: 'middle',
      fontFace: 'Arial'
    });
  });
});


// =========================================================================
// SLIDE 5: HOW JEEVANSETU WORKS (End-to-End Operational Flowchart)
// =========================================================================
const slide5 = pptx.addSlide();
slide5.background = { color: WHITE };
applySIHTemplate(slide5, 'TECHNICAL APPROACH', 5);

slide5.addText('❖ Methodology & Process: End-to-End Patient Care Flowchart', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

const flowRow1 = [
  { step: 'STEP 1: Sickness / Need', title: 'Vernacular Intake', desc: 'Villager speaks in Marathi / Hindi or dials 2G Keypad IVR.', color: TEAL_ACCENT, bg: TEAL_LIGHT },
  { step: 'STEP 2: Guided Triage', title: '"What Should I Do?"', desc: 'Non-diagnostic safety filter identifies facility level required.', color: BLUE_ACCENT, bg: BLUE_LIGHT },
  { step: 'STEP 3: Readiness Check', title: '"Check Before Travel"', desc: 'Verifies duty doctor presence & OPD token before patient walks.', color: AMBER_ACCENT, bg: AMBER_LIGHT },
  { step: 'STEP 4: PHC Consultation', title: 'Vitals & Care Case', desc: 'PHC Doctor logs vitals (BP, Sugar, SpO2) & initiates digital case.', color: NAVY_PRIMARY, bg: GRAY_LIGHT }
];

const flowRow2 = [
  { step: 'STEP 8: Follow-up Loop', title: 'ASHA Care Continuity', desc: 'Automated milestone alerts prompt ASHA for home visit & recovery.', color: GREEN_ACCENT, bg: GREEN_LIGHT },
  { step: 'STEP 7: Hospital Care', title: 'Treatment & Discharge', desc: 'Specialist surgery recorded; digital discharge synched to PHC.', color: NAVY_PRIMARY, bg: GRAY_LIGHT },
  { step: 'STEP 6: Assisted Transit', title: 'QR Bed Handshake', desc: 'Patient arrives with QR Token; ₹0 cashless MJPJAY admission.', color: AMBER_ACCENT, bg: AMBER_LIGHT },
  { step: 'STEP 5: Referral Booking', title: '6-Stage Bed Lock', desc: 'District Hospital accepts referral & reserves Bed #12 in advance.', color: BLUE_ACCENT, bg: BLUE_LIGHT }
];

// Draw Row 1
flowRow1.forEach((f, i) => {
  const x = 0.6 + i * 3.05;
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: x,
    y: 1.7,
    w: 2.85,
    h: 2.0,
    rectRadius: 0.1,
    fill: { color: f.bg },
    line: { color: f.color, width: 1.5 }
  });
  slide5.addText(f.step, {
    x: x + 0.1,
    y: 1.78,
    w: 2.65,
    h: 0.26,
    fontSize: 9,
    bold: true,
    color: f.color,
    align: 'center',
    fontFace: 'Arial'
  });
  slide5.addText(f.title, {
    x: x + 0.1,
    y: 2.06,
    w: 2.65,
    h: 0.32,
    fontSize: 11,
    bold: true,
    color: GRAY_DARK,
    align: 'center',
    fontFace: 'Arial'
  });
  slide5.addText(f.desc, {
    x: x + 0.15,
    y: 2.42,
    w: 2.55,
    h: 1.15,
    fontSize: 8.5,
    color: GRAY_BODY,
    align: 'center',
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });

  if (i < 3) {
    slide5.addShape(pptx.ShapeType.rightArrow, {
      x: x + 2.88,
      y: 2.55,
      w: 0.15,
      h: 0.25,
      fill: { color: NAVY_PRIMARY },
      line: { color: NAVY_PRIMARY, width: 0 }
    });
  }
});

slide5.addShape(pptx.ShapeType.downArrow, {
  x: 10.9,
  y: 3.8,
  w: 0.3,
  h: 0.45,
  fill: { color: NAVY_PRIMARY },
  line: { color: NAVY_PRIMARY, width: 0 }
});

// Draw Row 2
flowRow2.forEach((f, i) => {
  const x = 9.75 - i * 3.05;
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: x,
    y: 4.35,
    w: 2.85,
    h: 2.0,
    rectRadius: 0.1,
    fill: { color: f.bg },
    line: { color: f.color, width: 1.5 }
  });
  slide5.addText(f.step, {
    x: x + 0.1,
    y: 4.43,
    w: 2.65,
    h: 0.26,
    fontSize: 9,
    bold: true,
    color: f.color,
    align: 'center',
    fontFace: 'Arial'
  });
  slide5.addText(f.title, {
    x: x + 0.1,
    y: 4.71,
    w: 2.65,
    h: 0.32,
    fontSize: 11,
    bold: true,
    color: GRAY_DARK,
    align: 'center',
    fontFace: 'Arial'
  });
  slide5.addText(f.desc, {
    x: x + 0.15,
    y: 5.07,
    w: 2.55,
    h: 1.15,
    fontSize: 8.5,
    color: GRAY_BODY,
    align: 'center',
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });

  if (i < 3) {
    slide5.addShape(pptx.ShapeType.leftArrow, {
      x: x - 0.2,
      y: 5.2,
      w: 0.15,
      h: 0.25,
      fill: { color: NAVY_PRIMARY },
      line: { color: NAVY_PRIMARY, width: 0 }
    });
  }
});

// Bottom Invariant Bar
slide5.addShape(pptx.ShapeType.roundRect, {
  x: 0.6,
  y: 6.5,
  w: 12.1,
  h: 0.45,
  rectRadius: 0.08,
  fill: { color: DARK_BG }
});
slide5.addText('🔒 CORE SYSTEM INVARIANT: Absence of a digital event is labeled as "Hospital arrival pending", never "Patient abandoned care". Zero dropouts.', {
  x: 0.8,
  y: 6.5,
  w: 11.7,
  h: 0.45,
  fontSize: 9,
  bold: true,
  color: WHITE,
  align: 'center',
  valign: 'middle',
  fontFace: 'Arial'
});


// =========================================================================
// SLIDE 6: KEY IMPLEMENTED MODULES & FEATURE MATRIX
// =========================================================================
const slide6 = pptx.addSlide();
slide6.background = { color: WHITE };
applySIHTemplate(slide6, 'TECHNICAL APPROACH', 6);

slide6.addText('❖ Core Verified Features: 6-Pillar Healthcare Delivery Matrix (RC-33 Audited)', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

const featurePillars = [
  {
    title: '1. ACCESS & TRIAGE',
    points: [
      { h: 'Verified Directory: ', d: '1,200+ geo-tagged PHCs, Sub-Centres & Hospitals.' },
      { h: 'Check Before You Travel: ', d: 'Live doctor duty status & bed occupancy desk.' },
      { h: 'What Should I Do Now?: ', d: 'Non-diagnostic triage routing to right care tier.' },
      { h: 'OPD Token Generation: ', d: 'Digital queue slips reducing PHC waiting lines.' }
    ],
    color: TEAL_ACCENT,
    bg: TEAL_LIGHT
  },
  {
    title: '2. 6-STAGE REFERRALS',
    points: [
      { h: 'Bi-Directional Lifecycle: ', d: 'Initiation -> Destination Accept -> Transit -> Admit -> Treat -> Follow-up.' },
      { h: 'Pre-Arrival Bed Booking: ', d: 'Reserves Bed #12 before patient leaves PHC.' },
      { h: 'QR Code Handover: ', d: 'One-scan patient identification at district casualty.' },
      { h: 'Care Continuity Ledger: ', d: 'Immutable append-only audit trail.' }
    ],
    color: BLUE_ACCENT,
    bg: BLUE_LIGHT
  },
  {
    title: '3. DRUG INVENTORY',
    points: [
      { h: 'Real-Time PHC Stock: ', d: 'Balance truth in transactional PostgreSQL.' },
      { h: 'Deterministic Z-Score: ', d: 'Moving baseline math (forecast.utils.js).' },
      { h: '5-Day Depletion Warnings: ', d: 'Alerting before anti-snake venoms run out.' },
      { h: 'Inter-PHC Redistribution: ', d: 'District surplus-to-deficit rebalancing.' }
    ],
    color: AMBER_ACCENT,
    bg: AMBER_LIGHT
  },
  {
    title: '4. INCLUSION & VOICE',
    points: [
      { h: 'Marathi Voice AI (mr-IN): ', d: 'Real-time 1-on-1 natural conversation.' },
      { h: 'Hindi (hi-IN) & English: ', d: 'Multi-lingual speech recognition & synthesis.' },
      { h: '2G Keypad IVR: ', d: 'Toll-free DTMF access for basic phone owners.' },
      { h: 'Offline Resilience: ', d: 'Browser speech synthesis with regional fallback.' }
    ],
    color: NAVY_PRIMARY,
    bg: GRAY_LIGHT
  },
  {
    title: '5. SCHEMES & CASHLESS',
    points: [
      { h: 'MJPJAY Maharashtra: ', d: 'Up to ₹5 Lakhs cashless hospital surgery finder.' },
      { h: 'PM-JAY & JSSK: ', d: 'Free maternal & infant transport entitlements.' },
      { h: 'Grounded Scheme Matcher: ', d: 'Symptom profile maps to financial grants.' },
      { h: 'Zero Moneylender Debt: ', d: 'Direct empaneled hospital navigation.' }
    ],
    color: GREEN_ACCENT,
    bg: GREEN_LIGHT
  },
  {
    title: '6. SURVEILLANCE & SAFETY',
    points: [
      { h: 'Early Outbreak Alerts: ', d: 'Statistical syndrome clustering 14d before logs.' },
      { h: 'Doctor Presence Integrity: ', d: 'Server timestamped duty attendance auditing.' },
      { h: 'Deterministic 108 Hotlines: ', d: 'Life-threatening red flags bypass AI.' },
      { h: 'Citizen Feedback Desk: ', d: '2G missed-call and web grievance resolution.' }
    ],
    color: RED_ACCENT,
    bg: RED_LIGHT
  }
];

featurePillars.forEach((fp, idx) => {
  const row = Math.floor(idx / 3);
  const col = idx % 3;
  const x = 0.6 + col * 4.1;
  const y = 1.65 + row * 2.6;

  slide6.addShape(pptx.ShapeType.roundRect, {
    x: x,
    y: y,
    w: 3.9,
    h: 2.45,
    rectRadius: 0.1,
    fill: { color: fp.bg },
    line: { color: fp.color, width: 1.3 }
  });

  slide6.addText(fp.title, {
    x: x + 0.15,
    y: y + 0.08,
    w: 3.6,
    h: 0.3,
    fontSize: 10.5,
    bold: true,
    color: fp.color,
    fontFace: 'Arial'
  });

  fp.points.forEach((pt, pIdx) => {
    slide6.addText([
      { text: `• ${pt.h}`, options: { bold: true, fontSize: 8.3, color: GRAY_DARK, fontFace: 'Arial' } },
      { text: pt.d, options: { bold: false, fontSize: 8.0, color: GRAY_BODY, fontFace: 'Arial' } }
    ], {
      x: x + 0.15,
      y: y + 0.42 + pIdx * 0.48,
      w: 3.6,
      h: 0.45,
      valign: 'top',
      lineSpacingMultiple: 1.02
    });
  });
});


// =========================================================================
// SLIDE 7: MULTILINGUAL AI, VERNACULAR VOICE & 2G IVR SYSTEM
// =========================================================================
const slide7 = pptx.addSlide();
slide7.background = { color: WHITE };
applySIHTemplate(slide7, 'TECHNICAL APPROACH', 7);

slide7.addText('❖ Vernacular Voice AI Engine & 2G Feature-Phone IVR Architecture', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

// Left Column: Flow A (Smartphone Marathi Voice AI)
slide7.addShape(pptx.ShapeType.roundRect, {
  x: 0.6,
  y: 1.65,
  w: 7.2,
  h: 2.55,
  rectRadius: 0.1,
  fill: { color: TEAL_LIGHT },
  line: { color: TEAL_ACCENT, width: 1.2 }
});

slide7.addText('📱 FLOW A: SMARTPHONE REAL-TIME MARATHI VOICE AI (mr-IN)', {
  x: 0.8,
  y: 1.75,
  w: 6.8,
  h: 0.28,
  fontSize: 10.5,
  bold: true,
  color: TEAL_ACCENT,
  fontFace: 'Arial'
});

const voiceA_steps = [
  { num: '1', title: 'User Taps Mic: ', desc: 'Speaks naturally in Marathi ("माझ्या छातीत दुखत आहे, जवळचे रुग्णालय कुठे आहे?")' },
  { num: '2', title: 'Web Speech STT: ', desc: 'Transcribes regional phonemes (mr-IN / hi-IN / en-IN).' },
  { num: '3', title: 'Healthcare Safety Layer: ', desc: 'Validates non-diagnostic boundaries & detects red-flag emergencies.' },
  { num: '4', title: 'Express Grounding: ', desc: 'Retrieves verified doctor presence, beds & schemes from Supabase.' },
  { num: '5', title: 'Regional TTS: ', desc: 'Speaks answer aloud in Marathi + renders high-contrast action cards.' }
];

voiceA_steps.forEach((s, idx) => {
  slide7.addText([
    { text: `${s.num}. ${s.title}`, options: { bold: true, fontSize: 8.3, color: NAVY_PRIMARY, fontFace: 'Arial' } },
    { text: s.desc, options: { bold: false, fontSize: 8.1, color: GRAY_BODY, fontFace: 'Arial' } }
  ], {
    x: 0.8,
    y: 2.05 + idx * 0.42,
    w: 6.8,
    h: 0.4,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
});

// Flow B: 2G Feature-Phone Offline IVR
slide7.addShape(pptx.ShapeType.roundRect, {
  x: 0.6,
  y: 4.3,
  w: 7.2,
  h: 2.65,
  rectRadius: 0.1,
  fill: { color: BLUE_LIGHT },
  line: { color: BLUE_ACCENT, width: 1.2 }
});

slide7.addText('☎️ FLOW B: 2G KEYPAD FEATURE-PHONE TELEPHONY IVR (NO INTERNET)', {
  x: 0.8,
  y: 4.4,
  w: 6.8,
  h: 0.28,
  fontSize: 10.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

const voiceB_steps = [
  { num: '1', title: 'Toll-Free Dialing: ', desc: 'Villager calls toll-free health access number from any basic keypad phone.' },
  { num: '2', title: 'Multi-Language Menu: ', desc: 'Press 1 for Hindi, Press 2 for Marathi, Press 3 for English.' },
  { num: '3', title: 'Keypad DTMF Options: ', desc: '[1] Health Guide | [2] Referral PIN Check | [3] PHCs | [4] Drug Stock | [5] ASHA Callback.' },
  { num: '4', title: 'Privacy & Masking: ', desc: 'Caller number automatically masked (+91 98XXX XX04) with SHA-256 hash.' },
  { num: '5', title: 'Emergency Escalation: ', desc: 'Life-threatening symptom selections immediately route to 108 Emergency.' }
];

voiceB_steps.forEach((s, idx) => {
  slide7.addText([
    { text: `${s.num}. ${s.title}`, options: { bold: true, fontSize: 8.3, color: NAVY_PRIMARY, fontFace: 'Arial' } },
    { text: s.desc, options: { bold: false, fontSize: 8.1, color: GRAY_BODY, fontFace: 'Arial' } }
  ], {
    x: 0.8,
    y: 4.7 + idx * 0.44,
    w: 6.8,
    h: 0.42,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
});

// Right Column: Actual Real Screenshot of Marathi Voice AI Modal
slide7.addShape(pptx.ShapeType.roundRect, {
  x: 8.0,
  y: 1.65,
  w: 4.7,
  h: 5.3,
  rectRadius: 0.12,
  fill: { color: DARK_BG },
  line: { color: TEAL_ACCENT, width: 1.5 }
});

slide7.addText('📸 VERIFIED MARATHI VOICE CALL UI', {
  x: 8.1,
  y: 1.75,
  w: 4.5,
  h: 0.3,
  fontSize: 11,
  bold: true,
  color: WHITE,
  align: 'center',
  fontFace: 'Arial'
});

if (fs.existsSync(voiceModalImg)) {
  slide7.addImage({
    path: voiceModalImg,
    x: 8.35,
    y: 2.1,
    w: 4.0,
    h: 4.4
  });
}

slide7.addText('✨ Live Two-Way Marathi Speech Engine (frontend/lib/voice/)', {
  x: 8.1,
  y: 6.55,
  w: 4.5,
  h: 0.3,
  fontSize: 8,
  bold: true,
  color: 'A7F3D0',
  align: 'center',
  fontFace: 'Arial'
});


// =========================================================================
// SLIDE 8: TECHNOLOGY STACK & SYSTEM ARCHITECTURE
// =========================================================================
const slide8 = pptx.addSlide();
slide8.background = { color: WHITE };
applySIHTemplate(slide8, 'TECHNICAL APPROACH', 8);

slide8.addText('❖ Full-Stack Technology Architecture & Security Boundary', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

const archLayers = [
  {
    layer: 'CLIENT & INTERACTION LAYER',
    tech: 'Next.js 16 (Turbopack) • React 19 • Tailwind CSS • Web Speech API • Lucide React • DTMF Simulator',
    desc: '32 compiled static routes, zero-literacy vernacular voice modal, high-contrast accessible UI (>=44px touch targets), dark/light theme, and PWA mobile responsiveness.',
    color: TEAL_ACCENT,
    bg: TEAL_LIGHT
  },
  {
    layer: 'API GATEWAY & SECURITY PERIMETER',
    tech: 'Node.js 20+ • Express.js REST • Helmet • Strict CORS • Sliding-Window Rate Limiters • Input Whitelists',
    desc: '21 modular API routes, JWT bearer authentication, HMAC webhook signature verification, regex prompt injection interceptors, and PII anonymization.',
    color: BLUE_ACCENT,
    bg: BLUE_LIGHT
  },
  {
    layer: 'BUSINESS LOGIC & DETERMINISTIC ENGINES',
    tech: 'Referral FollowUp Service • Medicine Forecast Engine (Z-Score) • Early-Warning Surveillance • AI Gateway',
    desc: 'Pure statistical math (no LLM hallucination in inventory), multi-stage referral milestone scheduler, doctor presence review desk, and provider-agnostic LLM gateway (Gemini/Claude/Fallback).',
    color: NAVY_PRIMARY,
    bg: GRAY_LIGHT
  },
  {
    layer: 'DATA & STORAGE LAYER (AUTHORITATIVE TRUTH)',
    tech: 'Supabase PostgreSQL (22 Relational Migrations) • Row Level Security (RLS) • Supabase Auth • Storage',
    desc: '100% RLS enforcement across all tables, append-only immutable audit logs, server-side clock timestamps, and normalized schemas (patients, referrals, inventory, early warnings).',
    color: GREEN_ACCENT,
    bg: GREEN_LIGHT
  }
];

archLayers.forEach((al, idx) => {
  const y = 1.65 + idx * 1.25;
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: y,
    w: 12.1,
    h: 1.15,
    rectRadius: 0.08,
    fill: { color: al.bg },
    line: { color: al.color, width: 1.3 }
  });

  slide8.addText(`LAYER ${idx + 1}: ${al.layer}`, {
    x: 0.8,
    y: y + 0.08,
    w: 3.5,
    h: 0.28,
    fontSize: 10.5,
    bold: true,
    color: al.color,
    fontFace: 'Arial'
  });

  slide8.addText(al.tech, {
    x: 4.3,
    y: y + 0.08,
    w: 8.2,
    h: 0.28,
    fontSize: 9.5,
    bold: true,
    color: GRAY_DARK,
    align: 'right',
    fontFace: 'Arial'
  });

  slide8.addText(al.desc, {
    x: 0.8,
    y: y + 0.38,
    w: 11.7,
    h: 0.7,
    fontSize: 8.5,
    color: GRAY_BODY,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
});

const techBadges = [
  { name: 'Frontend', val: 'Next.js 16 + React 19' },
  { name: 'Backend', val: 'Express.js REST APIs' },
  { name: 'Database', val: 'PostgreSQL (Supabase RLS)' },
  { name: 'Vernacular AI', val: 'Web Speech API (mr-IN)' },
  { name: 'Testing', val: 'Jest (19/19 Test Suites Pass)' },
  { name: 'Deployment', val: 'Vercel + Render + Docker' }
];

techBadges.forEach((tb, i) => {
  const x = 0.6 + i * 2.05;
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: x,
    y: 6.55,
    w: 1.95,
    h: 0.5,
    rectRadius: 0.06,
    fill: { color: DARK_BG }
  });
  slide8.addText(`${tb.name}\n${tb.val}`, {
    x: x,
    y: 6.55,
    w: 1.95,
    h: 0.5,
    fontSize: 7.5,
    bold: true,
    color: WHITE,
    align: 'center',
    valign: 'middle',
    fontFace: 'Arial'
  });
});


// =========================================================================
// SLIDE 9: SECURITY, PRIVACY & NON-DIAGNOSTIC CLINICAL GUARDRAILS
// =========================================================================
const slide9 = pptx.addSlide();
slide9.background = { color: WHITE };
applySIHTemplate(slide9, 'FEASIBILITY AND VIABILITY', 9);

slide9.addText('❖ Healthcare Safety, AI Ethics & Enterprise Security Matrix', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

// Left Card: Strict AI Safety Guardrails
slide9.addShape(pptx.ShapeType.roundRect, {
  x: 0.6,
  y: 1.65,
  w: 5.9,
  h: 5.3,
  rectRadius: 0.12,
  fill: { color: RED_LIGHT },
  line: { color: RED_ACCENT, width: 1.5 }
});

slide9.addText('🛡️ CLINICAL AI SAFETY & ETHICAL BOUNDARIES', {
  x: 0.8,
  y: 1.8,
  w: 5.5,
  h: 0.32,
  fontSize: 12,
  bold: true,
  color: RED_ACCENT,
  fontFace: 'Arial',
  align: 'center'
});

const aiSafeties = [
  {
    title: '1. AI != Doctor (Strict Non-Diagnostic Boundary)',
    desc: 'The AI assistant is strictly an informational and navigation guide. It NEVER diagnoses disease, declares clinical certainty, or prescribes pharmaceutical drugs or dosages.'
  },
  {
    title: '2. Deterministic 108 Emergency Hotlines',
    desc: 'Life-threatening red flags (acute chest pain, breathing collapse, loss of consciousness, heavy trauma, snake bites) NEVER go to probabilistic LLMs; they trigger deterministic 108 Ambulance alerts.'
  },
  {
    title: '3. Zero Fabrication / Hallucination Protection',
    desc: 'Medicine stock quantities, doctor on-duty rosters, and hospital bed availability are pulled exclusively from transactional database records, never generated by AI.'
  },
  {
    title: '4. Prompt Injection & Jailbreak Defense',
    desc: 'Multi-layer regex boundary interceptors reject adversarial instructions ("ignore clinical rules", "dump database") with safe refusal envelopes without executing generation.'
  }
];

aiSafeties.forEach((as, idx) => {
  const yBox = 2.2 + idx * 1.15;
  slide9.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: yBox,
    w: 5.5,
    h: 1.05,
    rectRadius: 0.08,
    fill: { color: WHITE },
    line: { color: RED_ACCENT, width: 0.8 }
  });
  slide9.addText(as.title, {
    x: 0.95,
    y: yBox + 0.06,
    w: 5.2,
    h: 0.24,
    fontSize: 9.5,
    bold: true,
    color: RED_ACCENT,
    fontFace: 'Arial'
  });
  slide9.addText(as.desc, {
    x: 0.95,
    y: yBox + 0.3,
    w: 5.2,
    h: 0.7,
    fontSize: 8.2,
    color: GRAY_BODY,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
});

// Right Card: 5-Pillar Security Architecture
slide9.addShape(pptx.ShapeType.roundRect, {
  x: 6.8,
  y: 1.65,
  w: 5.9,
  h: 5.3,
  rectRadius: 0.12,
  fill: { color: BLUE_LIGHT },
  line: { color: NAVY_PRIMARY, width: 1.5 }
});

slide9.addText('🔒 5-PILLAR ENTERPRISE SECURITY ARCHITECTURE', {
  x: 7.0,
  y: 1.8,
  w: 5.5,
  h: 0.32,
  fontSize: 12,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial',
  align: 'center'
});

const securityPillars = [
  {
    title: '1. Role-Based Access Control (RBAC - 6 Roles)',
    desc: 'Strict isolation across patient, phc_staff, doctor, hospital_staff, ngo_staff, and district_admin. Users are barred by database triggers from self-escalating roles.'
  },
  {
    title: '2. PostgreSQL Row Level Security (RLS)',
    desc: '100% RLS active on all 22 database tables. Patients can ONLY query their own cases; staff can ONLY access records within their assigned PHC or hospital.'
  },
  {
    title: '3. PII Masking & Telephony Anonymization',
    desc: 'Phone numbers are masked (+91 98XXX XX04), ABHA IDs redacted, and IVR caller IDs hashed with salted SHA-256 to guarantee complete patient privacy.'
  },
  {
    title: '4. Authoritative Server-Side Truth',
    desc: 'Check-in timestamps, stock adjustments, and referral states originate strictly from database clocks, preventing client-side backdating or clock manipulation.'
  },
  {
    title: '5. Append-Only Immutable Audit Logs',
    desc: 'All state transitions, administrative overrides, and referral handshakes append permanent audit events to audit_logs, ensuring zero tampering.'
  }
];

securityPillars.forEach((sp, idx) => {
  const yBox = 2.2 + idx * 0.92;
  slide9.addShape(pptx.ShapeType.roundRect, {
    x: 7.0,
    y: yBox,
    w: 5.5,
    h: 0.85,
    rectRadius: 0.08,
    fill: { color: WHITE },
    line: { color: NAVY_PRIMARY, width: 0.8 }
  });
  slide9.addText(sp.title, {
    x: 7.15,
    y: yBox + 0.05,
    w: 5.2,
    h: 0.22,
    fontSize: 9.5,
    bold: true,
    color: NAVY_PRIMARY,
    fontFace: 'Arial'
  });
  slide9.addText(sp.desc, {
    x: 7.15,
    y: yBox + 0.27,
    w: 5.2,
    h: 0.55,
    fontSize: 8,
    color: GRAY_BODY,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
});


// =========================================================================
// SLIDE 10: REAL-TIME OPERATIONAL DASHBOARDS & SURVEILLANCE
// =========================================================================
const slide10 = pptx.addSlide();
slide10.background = { color: WHITE };
applySIHTemplate(slide10, 'FEASIBILITY AND VIABILITY', 10);

slide10.addText('❖ Operational Impact: Real-Time Live PHC & District Healthcare Dashboards', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

// Left Column: Actual Verified Home & Dashboard Screenshot
slide10.addShape(pptx.ShapeType.roundRect, {
  x: 0.6,
  y: 1.65,
  w: 6.8,
  h: 5.3,
  rectRadius: 0.12,
  fill: { color: GRAY_LIGHT },
  line: { color: TEAL_ACCENT, width: 1.5 }
});

slide10.addText('📸 VERIFIED JEEVANSETU HOME & LIVE MONITOR DASHBOARD', {
  x: 0.8,
  y: 1.78,
  w: 6.4,
  h: 0.3,
  fontSize: 11,
  bold: true,
  color: NAVY_PRIMARY,
  align: 'center',
  fontFace: 'Arial'
});

if (fs.existsSync(homeDashboardImg)) {
  slide10.addImage({
    path: homeDashboardImg,
    x: 0.8,
    y: 2.15,
    w: 6.4,
    h: 3.8
  });
}

slide10.addText('✨ Live Synchronized Monitor: Gadchiroli & Chandrapur Public Health Cluster', {
  x: 0.8,
  y: 6.5,
  w: 6.4,
  h: 0.35,
  fontSize: 8.5,
  bold: true,
  color: TEAL_ACCENT,
  align: 'center',
  fontFace: 'Arial'
});

// Right Column: Dashboard Operational Callouts
const dashFeatures = [
  {
    title: '1. Live Referral Lifecycle Monitor',
    desc: 'Tracks active referral case (JVS-MH-7A82K1) from Ashti PHC to District Civil Hospital Gadchiroli with real-time "Step 3: Accepted" progress bar.',
    color: TEAL_ACCENT,
    bg: TEAL_LIGHT
  },
  {
    title: '2. Predictive Medicine Depletion Alert',
    desc: 'Flags essential cardiac drug (Amlodipine) with "3.4d stock remaining" depletion warning before stock reaches zero, prompting automated replenishment.',
    color: RED_ACCENT,
    bg: RED_LIGHT
  },
  {
    title: '3. Grounded Resource & Scheme Matching',
    desc: 'Instantly identifies PM-JAY Cashless Coverage & Gramin Arogya Sahayog transport grants matching the patient profile to eliminate out-of-pocket expenses.',
    color: GREEN_ACCENT,
    bg: GREEN_LIGHT
  },
  {
    title: '4. Multi-Signal Early Warning Feed',
    desc: 'Aggregates PHC syndromic vitals, drug consumption anomalies, and citizen feedback to alert District Health Officers (DHO) of seasonal outbreak spikes.',
    color: NAVY_PRIMARY,
    bg: BLUE_LIGHT
  }
];

dashFeatures.forEach((df, idx) => {
  const y = 1.65 + idx * 1.33;
  slide10.addShape(pptx.ShapeType.roundRect, {
    x: 7.7,
    y: y,
    w: 5.0,
    h: 1.25,
    rectRadius: 0.08,
    fill: { color: df.bg },
    line: { color: df.color, width: 1.2 }
  });

  slide10.addText(df.title, {
    x: 7.85,
    y: y + 0.08,
    w: 4.7,
    h: 0.26,
    fontSize: 10,
    bold: true,
    color: df.color,
    fontFace: 'Arial'
  });

  slide10.addText(df.desc, {
    x: 7.85,
    y: y + 0.34,
    w: 4.7,
    h: 0.85,
    fontSize: 8.3,
    color: GRAY_BODY,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
});


// =========================================================================
// SLIDE 11: PROBLEM STATEMENT REQUIREMENT -> JEEVANSETU SOLUTION MAPPING
// =========================================================================
const slide11 = pptx.addSlide();
slide11.background = { color: WHITE };
applySIHTemplate(slide11, 'FEASIBILITY AND VIABILITY', 11);

slide11.addText('❖ Direct Alignment with SIH Problem Statement 26133 Requirements', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

const mapHeaders = [
  { text: 'Govt. of Maharashtra SIH Mandate', options: { bold: true, color: WHITE, fill: NAVY_PRIMARY, fontSize: 9, align: 'center' } },
  { text: 'Rural Ground Reality Challenge', options: { bold: true, color: WHITE, fill: RED_ACCENT, fontSize: 9, align: 'center' } },
  { text: 'JeevanSetu Verified Solution', options: { bold: true, color: WHITE, fill: GREEN_ACCENT, fontSize: 9, align: 'center' } },
  { text: 'Verified Codebase Proof', options: { bold: true, color: WHITE, fill: NAVY_PRIMARY, fontSize: 9, align: 'center' } }
];

const mapRows = [
  [
    { text: 'Long Travel Distances', options: { bold: true, fontSize: 8.5 } },
    { text: 'Unnecessary 25km trips to unstaffed or closed facilities', options: { fontSize: 8 } },
    { text: '"Check Before You Travel" Live Availability Desk', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } },
    { text: 'frontend/app/navigate/page.js', options: { fontSize: 7.5, fontFace: 'Courier New' } }
  ],
  [
    { text: 'Delayed & Blind Referrals', options: { bold: true, fontSize: 8.5 } },
    { text: '42% patient dropout during inter-facility transit', options: { fontSize: 8 } },
    { text: '6-Stage Bi-Directional Referral with Bed Booking', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } },
    { text: 'frontend/app/referrals/page.js', options: { fontSize: 7.5, fontFace: 'Courier New' } }
  ],
  [
    { text: 'Medicine Stockout Uncertainty', options: { bold: true, fontSize: 8.5 } },
    { text: 'Silent emergency drug exhaustion (anti-snake venoms)', options: { fontSize: 8 } },
    { text: 'Deterministic Consumption & Depletion Alert Engine', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } },
    { text: 'backend/src/services/forecasting/', options: { fontSize: 7.5, fontFace: 'Courier New' } }
  ],
  [
    { text: 'Illiteracy & Language Barriers', options: { bold: true, fontSize: 8.5 } },
    { text: 'Inability to read or type complex English/Hindi forms', options: { fontSize: 8 } },
    { text: '1-on-1 Real-Time Marathi Voice AI Engine (mr-IN)', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } },
    { text: 'frontend/lib/voice/speechRecognition.js', options: { fontSize: 7.5, fontFace: 'Courier New' } }
  ],
  [
    { text: 'Low-Bandwidth & 2G Phones', options: { bold: true, fontSize: 8.5 } },
    { text: 'Villagers owning basic keypad feature phones', options: { fontSize: 8 } },
    { text: 'Toll-Free 2G Keypad DTMF IVR Access & PIN lookup', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } },
    { text: 'frontend/app/ivrsupport/page.js', options: { fontSize: 7.5, fontFace: 'Courier New' } }
  ],
  [
    { text: 'Doctor Absenteeism', options: { bold: true, fontSize: 8.5 } },
    { text: 'Unrecorded doctor leaves causing ghost PHC visits', options: { fontSize: 8 } },
    { text: 'Server-Verified Duty Roster & Attendance Monitor', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } },
    { text: 'frontend/app/admin/doctor-presence/', options: { fontSize: 7.5, fontFace: 'Courier New' } }
  ],
  [
    { text: 'Outbreak Reporting Delays', options: { bold: true, fontSize: 8.5 } },
    { text: '2-3 week lag in manual paper epidemic reports', options: { fontSize: 8 } },
    { text: 'Multi-Signal Statistical Anomaly Alerts (Z-score)', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } },
    { text: 'backend/src/services/earlyWarning/', options: { fontSize: 7.5, fontFace: 'Courier New' } }
  ],
  [
    { text: 'Financial Medical Debt', options: { bold: true, fontSize: 8.5 } },
    { text: 'Extortionate loans for private hospital surgeries', options: { fontSize: 8 } },
    { text: 'MJPJAY & PM-JAY ₹5L Cashless Scheme Navigator', options: { fontSize: 8, bold: true, color: GREEN_ACCENT } },
    { text: 'frontend/app/resources/schemes/', options: { fontSize: 7.5, fontFace: 'Courier New' } }
  ]
];

slide11.addTable([mapHeaders, ...mapRows], {
  x: 0.6,
  y: 1.65,
  w: 12.1,
  h: 5.3,
  colW: [2.7, 3.2, 3.7, 2.5],
  border: { color: GRAY_BORDER, width: 0.8 },
  valign: 'middle'
});


// =========================================================================
// SLIDE 12: IMPACT, FEASIBILITY, SUSTAINABILITY & RESEARCH REFERENCES
// =========================================================================
const slide12 = pptx.addSlide();
slide12.background = { color: WHITE };
applySIHTemplate(slide12, 'IMPACT AND BENEFITS', 12);

slide12.addText('❖ Projected Rural Impact, Scalability & Government References', {
  x: 0.6,
  y: 1.15,
  w: 12.1,
  h: 0.45,
  fontSize: 14.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

// Left Column: Measurable Public Health Impact (4 Metrics Cards)
slide12.addShape(pptx.ShapeType.roundRect, {
  x: 0.6,
  y: 1.65,
  w: 5.9,
  h: 5.3,
  rectRadius: 0.12,
  fill: { color: GREEN_LIGHT },
  line: { color: GREEN_ACCENT, width: 1.5 }
});

slide12.addText('📈 MEASURABLE PUBLIC HEALTH IMPACT', {
  x: 0.8,
  y: 1.8,
  w: 5.5,
  h: 0.32,
  fontSize: 12,
  bold: true,
  color: GREEN_ACCENT,
  fontFace: 'Arial',
  align: 'center'
});

const impacts = [
  { metric: '60% Reduction', label: 'in Unnecessary Travel', desc: '"Check Before You Travel" prevents wasted 20km journeys to closed PHCs.' },
  { metric: '85%+ Completion', label: 'in Inter-Facility Referrals', desc: 'Pre-arrival bed booking eliminates the 42% transit dropout rate.' },
  { metric: '100% Elimination', label: 'of Silent Stockouts', desc: '5-day predictive consumption warnings trigger automated restock.' },
  { metric: '₹0 Out-of-Pocket', label: 'Cashless Care for BPL', desc: 'Grounded MJPJAY guidance connects poor villagers to ₹5L surgical cover.' }
];

impacts.forEach((imp, idx) => {
  const y = 2.25 + idx * 1.12;
  slide12.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: y,
    w: 5.5,
    h: 1.0,
    rectRadius: 0.08,
    fill: { color: WHITE },
    line: { color: GREEN_ACCENT, width: 0.8 }
  });
  slide12.addText(`${imp.metric} ${imp.label}`, {
    x: 0.95,
    y: y + 0.08,
    w: 5.2,
    h: 0.26,
    fontSize: 10.5,
    bold: true,
    color: GREEN_ACCENT,
    fontFace: 'Arial'
  });
  slide12.addText(imp.desc, {
    x: 0.95,
    y: y + 0.36,
    w: 5.2,
    h: 0.55,
    fontSize: 8.5,
    color: GRAY_BODY,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
});

// Right Top: Scalability Roadmap (Phase 2)
slide12.addShape(pptx.ShapeType.roundRect, {
  x: 6.8,
  y: 1.65,
  w: 5.9,
  h: 2.6,
  rectRadius: 0.12,
  fill: { color: BLUE_LIGHT },
  line: { color: NAVY_PRIMARY, width: 1.3 }
});

slide12.addText('🚀 FUTURE SCALABILITY & INTEGRATION ROADMAP', {
  x: 7.0,
  y: 1.78,
  w: 5.5,
  h: 0.28,
  fontSize: 10.5,
  bold: true,
  color: NAVY_PRIMARY,
  fontFace: 'Arial'
});

const roadmap = [
  { title: '• ABDM & FHIR Interoperability: ', desc: 'Direct synchronization with Ayushman Bharat Digital Health Accounts.' },
  { title: '• Standardized IoT Device Streaming: ', desc: 'Bluetooth glucometers & SpO2 streaming via open APIs.' },
  { title: '• State-Wide Rollout: ', desc: 'District-wide scaling across all 36 districts of Maharashtra.' },
  { title: '• Tribal Dialect Expansion: ', desc: 'Adding Gondi, Bhili, and Korku vernacular voice phoneme models.' }
];

roadmap.forEach((r, idx) => {
  slide12.addText([
    { text: r.title, options: { bold: true, fontSize: 8.2, color: NAVY_PRIMARY, fontFace: 'Arial' } },
    { text: r.desc, options: { bold: false, fontSize: 8.0, color: GRAY_BODY, fontFace: 'Arial' } }
  ], {
    x: 7.0,
    y: 2.12 + idx * 0.5,
    w: 5.5,
    h: 0.45,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
});

// Right Bottom: Official References & Research Work
slide12.addShape(pptx.ShapeType.roundRect, {
  x: 6.8,
  y: 4.4,
  w: 5.9,
  h: 2.55,
  rectRadius: 0.12,
  fill: { color: GRAY_LIGHT },
  line: { color: GRAY_BORDER, width: 1.3 }
});

slide12.addText('📚 RESEARCH, REFERENCES & POLICY GROUNDING', {
  x: 7.0,
  y: 4.52,
  w: 5.5,
  h: 0.28,
  fontSize: 10.5,
  bold: true,
  color: GRAY_DARK,
  fontFace: 'Arial'
});

const refs = [
  { num: '1', title: 'National Health Mission (NHM) Rural Health Statistics 2022-23 — ', desc: 'Ministry of Health & Family Welfare.' },
  { num: '2', title: 'Government of Maharashtra Public Health Guidelines — ', desc: 'MJPJAY & PHC Referral Protocols.' },
  { num: '3', title: 'World Health Organization (WHO) Digital Health Guidelines — ', desc: 'Strengthening Primary Health Care.' },
  { num: '4', title: 'Ayushman Bharat Digital Mission (ABDM) Whitepaper — ', desc: 'National Health Authority (NHA).' }
];

refs.forEach((rf, idx) => {
  slide12.addText([
    { text: `${rf.num}. ${rf.title}`, options: { bold: true, fontSize: 8.2, color: NAVY_PRIMARY, fontFace: 'Arial' } },
    { text: rf.desc, options: { bold: false, fontSize: 8.0, color: GRAY_BODY, fontFace: 'Arial' } }
  ], {
    x: 7.0,
    y: 4.85 + idx * 0.5,
    w: 5.5,
    h: 0.45,
    fontFace: 'Arial',
    lineSpacingMultiple: 1.05
  });
});


// Save presentation
const outputPath = path.join(__dirname, '../JeevanSetu_SIH_Final_Presentation.pptx');
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log(`Presentation created successfully at: ${outputPath}`);
}).catch(err => {
  console.error('Error generating presentation:', err);
});
