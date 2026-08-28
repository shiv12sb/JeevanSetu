const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pptx = new pptxgen();

// Set 16:9 widescreen presentation dimensions (13.33 x 7.5 inches)
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'JeevanSetu Team';
pptx.company = 'Smart India Hackathon 2026';
pptx.title = 'JeevanSetu - HealthcareBridge (SIH 2026 Final Presentation)';
pptx.subject = 'SIH Problem Statement 26133 - Rural Healthcare Access & Coordination';

// Asset paths
const sihLogoHeader = path.join(__dirname, '../assets/sih_logo_header.png');
const sihBrainBulb = path.join(__dirname, '../assets/sih_brain_bulb_title.png');
const homeDashboardImg = path.join(__dirname, '../assets/jeevansetu_home_dashboard.jpg');
const voiceModalImg = path.join(__dirname, '../assets/jeevansetu_marathi_voice_modal.jpg');
const jeevansetuLogo = path.join(__dirname, '../assets/jeevansetu_logo.png');

// Color Palette Constants
const NAVY_PRIMARY = '0B2B63';       // SIH Header Deep Blue
const BLUE_ACCENT = '0B72B9';        // SIH Template Blue
const BLUE_BG_LIGHT = 'EBF3FA';      // Soft Blue Card Background
const TEAL_ACCENT = '0D7D75';        // Healthcare Teal
const TEAL_BG_LIGHT = 'E6F7F5';      // Soft Teal Background
const AMBER_ACCENT = 'D97706';       // Warning / Stockout Amber
const RED_ACCENT = 'DC2626';         // Emergency / Alert Red
const GREEN_ACCENT = '16A34A';       // Success / Active Green
const GREEN_BG_LIGHT = 'F0FDF4';     // Soft Green Background
const GRAY_DARK = '1E293B';          // Primary Text (Slate 800)
const GRAY_BODY = '334155';          // Body Text (Slate 700)
const GRAY_LIGHT = 'F8FAFC';        // Card Fill Light
const GRAY_BORDER = 'CBD5E1';       // Subtle Border
const WHITE = 'FFFFFF';

/**
 * Standard SIH Header & Footer Helper for Slides 2 to 12
 */
function applySIHTemplate(slide, title, slideNumber) {
  // 1. Top-Left Team Name Oval
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 0.5,
    y: 0.25,
    w: 1.6,
    h: 0.85,
    line: { color: NAVY_PRIMARY, width: 1.5 },
    fill: { color: WHITE }
  });
  slide.addText('Your\nTeam\nName', {
    x: 0.5,
    y: 0.25,
    w: 1.6,
    h: 0.85,
    fontSize: 11,
    bold: true,
    color: NAVY_PRIMARY,
    align: 'center',
    valign: 'middle',
    fontFace: 'Georgia',
    lineSpacingMultiple: 0.95
  });

  // 2. Top-Center Big Title (Serif Bold)
  slide.addText(title, {
    x: 2.3,
    y: 0.3,
    w: 8.7,
    h: 0.75,
    fontSize: 22,
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
      y: 0.2,
      w: 1.65,
      h: 0.85
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

console.log('Template helper created successfully');
