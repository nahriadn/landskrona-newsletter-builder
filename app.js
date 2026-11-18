// Official CDN Assets (GitHub / jsDelivr)
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/nahriadn/landskrona-email-assets@main/';
const ASSETS = {
  stad_logo_liggande: CDN_BASE + 'Landskrona_liggande.png',
  stad_logo_liggande_vit: CDN_BASE + 'Landskrona_liggande_VIT.png',
  stad_krona_vinrod: CDN_BASE + 'Krona_vinrod.png',
  stad_krona_morkbla: CDN_BASE + 'Krona_morkbla.png',
  stad_krona_morkgron: CDN_BASE + 'Krona_morkgron.png',
  stad_kronbladet: CDN_BASE + 'stad-kronbladet.png',
  ven_badge_dark: CDN_BASE + 'ven-logo-badge-dark.png',
  ven_badge_light: CDN_BASE + 'ven-logo-badge-light.png',
  ven_wordmark_dark: CDN_BASE + 'ven-logo-wordmark-dark.svg',
  ven_wave_accent: CDN_BASE + 'ven-wave-accent.svg',
  ven_form_wave_box: CDN_BASE + 'ven-form-wave-box.svg'
};

// Pre-hosted Outlook-safe gallery photos (HTTPS URLs)
const GALLERY_IMAGES = [
  {
    titleSv: 'Bibliotekets bokhyllor (Höst & Läsning)',
    titleEn: 'Library Bookshelves (Autumn Reading)',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=80'
  },
  {
    titleSv: 'Öppna böcker & Studieplats',
    titleEn: 'Open Books & Study Space',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=700&q=80'
  },
  {
    titleSv: 'Barn & Sagostund',
    titleEn: 'Children & Storytime Reading',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80'
  },
  {
    titleSv: 'Öresund & Kustliv (Landskrona Ven)',
    titleEn: 'Öresund Coastline (Landskrona Ven)',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80'
  }
];

// State
let currentLang = 'sv';
let currentBrand = 'stad';
let currentHarmony = 'burgundy';
let currentPreset = 'monthly';
let isCanvasEdited = false;
let activeGalleryTargetBtn = null;

// Undo History Stack (up to 15 states)
const historyStack = [];
const MAX_HISTORY = 15;

// Employee Profile (Persisted in localStorage)
let userProfile = {
  name: 'Anna Lindström',
  title: 'Bibliotekarie / Librarian',
  dept: 'Landskrona stadsbibliotek',
  phone: '0418-47 35 12',
  mobile: '0709-47 35 12',
  email: 'anna.lindstrom@landskrona.se',
  photo: ''
};

try {
  const saved = localStorage.getItem('lk_email_profile');
  if (saved) {
    userProfile = Object.assign(userProfile, JSON.parse(saved));
  }
} catch (e) {}

// Brand theme color definitions
const THEMES = {
  stad_burgundy: {
    nameSv: 'Vinröd / Rosa (Kultur & Soluppgång)',
    primary: '#631533',
    secondary: '#F18B8F',
    accent: '#FAC4C9',
    bgSoft: '#FCEEED',
    crest: ASSETS.stad_krona_vinrod,
    font: "'Ciutadella', Arial, 'Segoe UI', sans-serif"
  },
  stad_blue: {
    nameSv: 'Mörkblå / Blå (Hav & Himmel)',
    primary: '#004E68',
    secondary: '#69A3BD',
    accent: '#93D5F6',
    bgSoft: '#E4F5FD',
    crest: ASSETS.stad_krona_morkbla,
    font: "'Ciutadella', Arial, 'Segoe UI', sans-serif"
  },
  stad_green: {
    nameSv: 'Mörkgrön / Grön (Natur & Arkitektur)',
    primary: '#005152',
    secondary: '#709E90',
    accent: '#78C8A4',
    bgSoft: '#DBEED8',
    crest: ASSETS.stad_krona_morkgron,
    font: "'Ciutadella', Arial, 'Segoe UI', sans-serif"
  },
  ven: {
    nameSv: 'Landskrona Ven (Platsvarumärke)',
    primary: '#002438',
    secondary: '#F393B9',
    accent: '#A66420',
    bgSoft: '#F2F1EE',
    crest: ASSETS.ven_badge_dark,
    font: "'Poppins', Arial, 'Segoe UI', sans-serif"
  }
};

function getActiveTheme() {
  if (currentBrand === 'ven') return THEMES.ven;
  return THEMES['stad_' + currentHarmony] || THEMES.stad_burgundy;
}

// Sidebar Toggle State & Handler
let sidebarCollapsed = false;

function toggleSidebar() {
  const sidebar = document.getElementById('mainSidebar');
  const icon = document.getElementById('sidebarToggleIcon');
  const label = document.getElementById('ui_btn_sidebar');
  
  sidebarCollapsed = !sidebarCollapsed;
  sidebar.classList.toggle('collapsed', sidebarCollapsed);
  
  if (sidebarCollapsed) {
    icon.innerText = '▶';
    label.innerText = currentLang === 'en' ? 'Show Blocks' : 'Visa block';
    showToast(currentLang === 'en' ? 'Sidebar hidden — Full canvas view' : 'Sidopanel dold — Bredare arbetsyta');
  } else {
    icon.innerText = '◀';
    label.innerText = currentLang === 'en' ? 'Hide Blocks' : 'Dölj block';
    showToast(currentLang === 'en' ? 'Sidebar visible' : 'Sidopanel visas');
  }
}

// Translations
const i18n = {
  sv: {
    btn_clear: '🗑️ Töm',
    btn_undo: '↩️ Ångra',
    btn_klarsprak: '✓ Klarspråk',
    btn_sig: 'Kopiera signatur',
    btn_profile: 'Min profil',
    btn_save_tpl: '💾 Spara mall',
    btn_viewhtml: '📄 Visa HTML',
    btn_eml: '✉️ Spara utkast (.eml)',
    btn_copy: '📋 Kopiera för Outlook',
    sidebar_title: 'Byggblock',
    sidebar_desc: 'Dra block till mailet eller klicka för att lägga till direkt.',
    presets_label: '⚡ Mallar:',
    modal_title: 'HTML-kod för e-post',
    modal_desc: 'Koden innehåller inbäddade tabellstilar och MSO-fallbacks optimerade för Microsoft Outlook (Desktop & Webbmail).',
    modal_close: 'Stäng',
    modal_copy: '📋 Kopiera kod',
    confirm_clear: 'Är du säker på att du vill tömma hela mailet?',
    confirm_overwrite: 'Du har ändrat i brevet. Vill du ersätta ditt utkast med denna mall?',
    canvas_cleared: 'Arbetsytan har tömts',
    code_copied: 'HTML-kod kopierad till Urklipp!',
    email_copied: '✅ Brevet är kopierat! Klistra in med Ctrl+V i Outlook.',
    email_copied_base64_warn: '✅ Kopierat! Obs: En lokal uppladdad bild kan blockeras i Outlook Webb — använd Bildbank eller Bildlänk för säkrast leverans.',
    sig_copied: '✅ Signaturen är kopierad! Klistra in med Ctrl+V i Outlook.',
    profile_saved: '✅ Profiluppgifter sparade!',
    prompt_url: 'Ange bildlänk (URL):',
    empty_title: 'Ditt brev är tomt',
    empty_desc: 'Välj en mall ovan eller dra in byggblock från menyn till vänster.',
    cat_structure: 'Struktur & Sidhuvud',
    cat_content: 'Innehåll & Nyheter',
    cat_boxes: 'Faktarutor (S. 27 & L-Block)',
    cat_actions: 'Aktiviteter & Avslutning',
    block_header: 'Officiellt sidhuvud',
    block_header_sub: 'Stadsvapen, förvaltningsnamn med friyta',
    block_welcome: 'Hälsningstext / Ingress',
    block_welcome_sub: 'Inledande hälsningsfras och brödtext',
    block_photo: 'Fotokort / Bild',
    block_photo_sub: 'Välj från bildbank, ange länk eller ladda upp',
    block_l_block: 'L-Block System (S. 46–47)',
    block_l_block_sub: 'Autentisk kommunal ram (List + Bas + Färgfält)',
    block_box_dark: 'Mörk profilruta (S. 27)',
    block_box_dark_sub: 'Mörk bakgrund med ljus topplinje & vit text',
    block_box_light: 'Ljus komplementruta (S. 27)',
    block_box_light_sub: 'Mjuk pastellton med färgad topprand',
    block_box_neutral: 'Neutral faktaruta (Guld/Grå)',
    block_box_neutral_sub: 'Varmgrå ton med heraldisk guldaccent',
    block_event: 'Evenemang / Kalender',
    block_event_sub: 'Tid, plats, rubrik och beskrivning',
    block_book: 'Boktips / Personalen tipsar',
    block_book_sub: 'Bokomslag eller ikon, författare & tips',
    block_hours: 'Öppettider & Information',
    block_hours_sub: 'Strukturerad tabell med öppettider',
    block_links_strip: 'Officiell länksamling',
    block_links_strip_sub: 'Snabblänkar till bibliotek, katalog & sociala medier',
    block_familjen: 'Bibliotek Familjen Helsingborg',
    block_familjen_sub: 'Lånesamarbete mellan 11 kommuner',
    block_cta: 'Handlingsknapp (Pill CTA)',
    block_cta_sub: 'Pill-knapp med redigerbar text & länk',
    block_signature: 'Personlig e-postsignatur',
    block_signature_sub: 'Landskrona-stämpel med dina kontaktuppgifter',
    block_footer: 'Sidfot & Besöksadress',
    block_footer_sub: 'Kronbladet-accent, adress, avregistreringslänk',
    block_ven_experience: 'Upplev Landskrona & Ven',
    block_ven_experience_sub: 'Besökstips med vågaccent och länk',
    block_divider: 'Diskret skiljelinje',
    block_divider_sub: 'Avdelare mellan innehållsdelar'
  },
  en: {
    btn_clear: '🗑️ Clear All',
    btn_undo: '↩️ Undo',
    btn_klarsprak: '✓ Brand Check',
    btn_sig: 'Copy Signature for Outlook',
    btn_profile: 'My Profile',
    btn_save_tpl: '💾 Save Template',
    btn_viewhtml: '📄 View HTML Code',
    btn_eml: '✉️ Save Draft (.eml)',
    btn_copy: '📋 Copy Email to Outlook',
    sidebar_title: 'Building Blocks',
    sidebar_desc: 'Drag blocks into the email canvas or click to add directly.',
    presets_label: '⚡ Templates:',
    modal_title: 'Email HTML Code',
    modal_desc: 'This code contains inline table styles and MSO fallbacks fully compatible with Outlook Desktop & Web.',
    modal_close: 'Close',
    modal_copy: '📋 Copy Code',
    confirm_clear: 'Are you sure you want to clear the entire email?',
    confirm_overwrite: 'You have edited this email. Replace your current draft with this template?',
    canvas_cleared: 'Canvas has been cleared',
    code_copied: 'HTML code copied to clipboard!',
    email_copied: '✅ Email copied! Press Ctrl+V in Outlook.',
    email_copied_base64_warn: '✅ Copied! Note: A local uploaded file may be blocked in Outlook Web — use Gallery or Image URL for best delivery.',
    sig_copied: '✅ Signature copied! Press Ctrl+V in Outlook.',
    profile_saved: '✅ Profile updated successfully!',
    prompt_url: 'Enter image URL:',
    empty_title: 'Your email is empty',
    empty_desc: 'Pick a template above or drag building blocks from the left sidebar.',
    cat_structure: 'Structure & Header',
    cat_content: 'Content & News',
    cat_boxes: 'Fact Boxes (P. 27 & L-Block)',
    cat_actions: 'Activities & Sign-off',
    block_header: 'Official Header',
    block_header_sub: 'Coat of arms, tracked operation name with clear space',
    block_welcome: 'Welcome / Lead Story',
    block_welcome_sub: 'Introductory greeting and body copy',
    block_photo: 'Photo Card / Image',
    block_photo_sub: 'Pick from gallery, enter URL, or upload file',
    block_l_block: 'L-Block System (P. 46–47)',
    block_l_block_sub: 'Authentic municipal frame (List + Bas + Content)',
    block_box_dark: 'Dark Profile Box (P. 27)',
    block_box_dark_sub: 'Dark base with light top accent & white text',
    block_box_light: 'Light Complement Box (P. 27)',
    block_box_light_sub: 'Soft pastel tint with colored top line',
    block_box_neutral: 'Neutral Fact Box (Gold/Gray)',
    block_box_neutral_sub: 'Warm gray tint with municipal gold stripe',
    block_event: 'Event / Calendar Item',
    block_event_sub: 'Date, time, location and description',
    block_book: 'Staff Book Pick',
    block_book_sub: 'Book cover or icon, author & recommendation',
    block_hours: 'Opening Hours & Info',
    block_hours_sub: 'Structured opening hours table',
    block_links_strip: 'Official Library Links Strip',
    block_links_strip_sub: 'Direct links to library, catalog & social media',
    block_familjen: 'Bibliotek Familjen Helsingborg',
    block_familjen_sub: 'Inter-municipal library lending network',
    block_cta: 'Action Button (Pill CTA)',
    block_cta_sub: 'Pill-shaped button with editable text & URL',
    block_signature: 'Personal Staff Signature',
    block_signature_sub: 'Official crest with your contact details',
    block_footer: 'Footer & Address Info',
    block_footer_sub: 'Kronbladet accent, street address, unsubscribe link',
    block_ven_experience: 'Experience Landskrona & Ven',
    block_ven_experience_sub: 'Visitor callout with wave accent and link',
    block_divider: 'Divider Line',
    block_divider_sub: 'Subtle separation between blocks'
  }
};

// Dynamic Template HTML Definitions conforming to Outlook and Brand Guidelines
function getTemplates() {
  const t = getActiveTheme();
  const isVen = currentBrand === 'ven';
  
  const profName = userProfile.name || 'Anna Lindström';
  const profTitle = userProfile.title || 'Bibliotekarie / Librarian';
  const profDept = userProfile.dept || 'Landskrona stadsbibliotek';
  const profPhone = userProfile.phone || '0418-47 35 12';
  const profMobile = userProfile.mobile ? ` | 📱 Mobil: ${userProfile.mobile}` : '';
  const profEmail = userProfile.email || 'anna.lindstrom@landskrona.se';
  const profLeftCell = userProfile.photo
    ? `<td class="lk-sig-badge-cell" style="vertical-align: middle; padding-right: 16px; border-right: 3px solid ${t.primary};"><img src="${userProfile.photo}" alt="${profName}" width="64" height="64" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid ${t.primary}; display: block;" /></td>`
    : `<td class="lk-sig-badge-cell" style="vertical-align: middle; padding-right: 16px; border-right: 3px solid ${t.primary};"><div style="background-color: ${t.primary}; padding: 8px 12px; border-radius: 6px; display: inline-block;"><img src="${ASSETS.stad_logo_liggande_vit}" alt="Landskrona stad" width="96" style="display: block; width: 96px; height: auto; border: 0;" /></div></td>`;
  const bookEmoji = currentHarmony === 'blue' ? '📘' : (currentHarmony === 'green' ? '📗' : '📕');

  const photoControlsHtml = `<div class="photo-upload-controls editor-only-controls" style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 10px; display: block;">
    <div style="font-size: 11px; color: #475569; margin-bottom: 6px; font-weight: 600;">📸 ${currentLang === 'en' ? 'Choose Outlook-safe photo or paste URL:' : 'Välj Outlook-säker bild från bildbank eller ange länk:'}</div>
    <div style="display: flex; gap: 6px; justify-content: center; align-items: center; flex-wrap: wrap;">
      <button type="button" onclick="openGalleryModal(this)" style="background: #fff; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; font-size: 11.5px; cursor: pointer; color: #0f172a; font-weight: 600;">🖼️ ${currentLang === 'en' ? 'Library Gallery' : 'Bildbank'}</button>
      <button type="button" onclick="promptImageURL(this)" style="background: #fff; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; font-size: 11.5px; cursor: pointer; color: #374151; font-weight: 600;">🔗 ${currentLang === 'en' ? 'Image URL' : 'Bildlänk (URL)'}</button>
      <label style="background: #fff; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; font-size: 11.5px; cursor: pointer; font-weight: 600; color: #64748b; display: inline-flex; align-items: center; gap: 4px;" title="Obs: Lokala filer kan blockeras i Outlook Webb">
        📁 ${currentLang === 'en' ? 'Upload File...' : 'Ladda upp fil...'}
        <input type="file" accept="image/*" style="display: none;" onchange="handleLocalImageUpload(this)">
      </label>
    </div>
    <div style="font-size: 10px; color: #64748b; margin-top: 5px;">${currentLang === 'en' ? 'Tip: Gallery & Image URLs always load in Outlook Web & Gmail. Local uploads may be blocked by webmail.' : 'Tips: Bildbank och bildlänkar visas alltid i Outlook Webb & Gmail. Lokala filer kan blockeras.'}</div>
  </div>`;

  if (isVen) {
    return {
      header: `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#002438" class="lk-brand-header" style="background-color: #002438; border-bottom: 4px solid #F393B9; border-radius: 6px;">
        <tr>
          <td bgcolor="#002438" class="lk-brand-header-td" style="background-color: #002438; padding: 14px 18px;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="lk-header-table">
              <tr>
                <td align="left" valign="middle" style="vertical-align: middle;">
                  <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td valign="middle" style="vertical-align: middle; padding-right: 12px;">
                        <img src="${ASSETS.ven_badge_light}" alt="Landskrona Ven" width="44" height="44" style="width: 44px; height: 44px; display: block; border: 0;" />
                      </td>
                      <td valign="middle" style="vertical-align: middle; border-left: 2px solid #335061; padding-left: 12px;">
                        <div class="lk-brand-title" contenteditable="true" style="font-family: 'Poppins', Arial, sans-serif; font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em; line-height: 1.2;">LANDSKRONA VEN</div>
                        <div class="lk-brand-sub" contenteditable="true" style="font-family: 'Poppins', Arial, sans-serif; font-size: 10.5px; color: #E3E7D8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;">DESTINATION &amp; KULTUR &bull; iLandskrona.se</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" valign="middle" class="lk-header-badge-cell" style="vertical-align: middle; padding-left: 16px; text-align: right;">
                  <span class="lk-tag" contenteditable="true" style="background-color: #F393B9; color: #002438; font-family: 'Poppins', Arial, sans-serif; font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; display: inline-block; white-space: nowrap;">${currentLang === 'en' ? 'Visitor Guide' : 'Kulturguide'}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`,

      welcome: `<div style="font-family: 'Poppins', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">
        <div style="font-size: 18px; margin-bottom: 4px; color: #F393B9;">〰️〰️</div>
        <p contenteditable="true" style="margin: 0;"><strong>${currentLang === 'en' ? 'Experience Culture & Coastal Life in Landskrona!' : 'Upptäck kultur, litteratur och kustliv i Landskrona & Ven!'}</strong><br>${currentLang === 'en' ? 'Welcome to this week\'s cultural recommendations. From author visits in the historic fire station library to sculpture walks at Citadellet, there is always something inspirational happening along our coastline.' : 'Välkommen till veckans kulturtips! Från författarsamtal i stadsbiblioteket till skulpturvandringar vid Citadellet och cykelturer på Ven – här finns inspiration för alla åldrar.'}</p>
      </div>`,

      photo: `<div class="lk-photo-card" style="text-align: center; margin: 0;">
        ${photoControlsHtml}
        <div style="border-radius: 6px; overflow: hidden; background-color: #002438; text-align: center; border: 1px solid #e2e8f0;">
          <img class="newsletter-img" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80" alt="Landskrona Ven" style="max-width: 100%; width: 100%; height: auto; display: block; border-radius: 6px; margin: 0 auto; border: 0;">
        </div>
        <div class="lk-caption" contenteditable="true" style="font-family: 'Poppins', Arial, sans-serif; font-size: 11.5px; color: #64748b; margin-top: 8px; font-style: normal; text-align: center;">${currentLang === 'en' ? 'Citadellet and the scenic Öresund coastline.' : 'Citadellet och den vackra kusten vid Öresund.'}</div>
      </div>`,

      event: `<div class="lk-event-card" style="background-color: #F2F1EE; border-left: 4px solid #A66420; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; border-radius: 0 6px 6px 0; padding: 14px;">
        <div style="font-family: 'Poppins', Arial, sans-serif; font-size: 11px; font-weight: 700; color: #A66420; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">KULTURTIPS &bull; LANDSKRONA VEN</div>
        <div class="lk-event-title" contenteditable="true" style="font-family: 'Poppins', Arial, sans-serif; font-size: 15px; font-weight: 700; color: #002438;">🎭 ${currentLang === 'en' ? 'Saturday Cultural Walk &amp; Literature Tour' : 'Litterär stadsvandring &amp; Konstupplevelse'}</div>
        <div class="lk-event-meta" contenteditable="true" style="font-family: 'Poppins', Arial, sans-serif; font-size: 12px; font-weight: 600; color: #0551A4; margin: 4px 0 6px 0;">🗓️ ${currentLang === 'en' ? 'Every Saturday | 14:00 – 15:30 | Starts at Stadsbiblioteket' : 'Varje lördag kl. 14.00–15.30 | Samling vid Stadsbiblioteket'}</div>
        <div class="lk-event-desc" contenteditable="true" style="font-family: 'Poppins', Arial, sans-serif; font-size: 13px; color: #334155; line-height: 1.5;">${currentLang === 'en' ? 'Join our cultural guides through historic Landskrona, exploring Selma Lagerlöf\'s footsteps and the iconic Citadellet fortress. Free admission, booking via iLandskrona.se.' : 'Följ med på en guidning i Selma Lagerlöfs fotspår genom det historiska Landskrona och vallgravarna vid Citadellet. Fri entré, boka via iLandskrona.se.'}</div>
      </div>`,

      cta: `<div class="lk-cta-wrap" style="text-align: center; margin: 10px 0;">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
          <tr>
            <td align="center" bgcolor="#002438" style="background-color: #002438; border-radius: 9999px; mso-padding-alt: 12px 28px;">
              <a href="https://iLandskrona.se" class="lk-btn-link" contenteditable="true" style="background-color: #002438; border: 12px solid #002438; border-left-width: 28px; border-right-width: 28px; color: #ffffff !important; border-radius: 9999px; text-decoration: none; font-family: 'Poppins', Arial, sans-serif; font-size: 13.5px; font-weight: 700; letter-spacing: 0.02em; display: inline-block;">${currentLang === 'en' ? 'Discover more at iLandskrona.se' : 'Upptäck mer på iLandskrona.se'}</a>
            </td>
          </tr>
        </table>
        <div class="editor-only-controls">
          <button type="button" class="editor-mini-btn" onclick="editButtonLink(this)">🔗 ${currentLang === 'en' ? 'Edit Button URL' : 'Ändra knapplänk'}</button>
        </div>
      </div>`,

      signature: `<div class="lk-signature-card" style="padding: 4px 0;">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" class="lk-sig-table" style="font-family: 'Poppins', Arial, sans-serif; color: #1e293b;">
          <tr>
            ${userProfile.photo ? `<td class="lk-sig-avatar-cell" style="vertical-align: middle; padding-right: 12px;"><img src="${userProfile.photo}" alt="${profName}" width="56" height="56" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #002438; display: block;" /></td>` : ''}
            <td class="lk-sig-badge-cell" style="vertical-align: middle; padding-right: 16px; border-right: 3px solid #002438;">
              <div style="background-color: #002438; padding: 8px; border-radius: 8px; display: inline-block;">
                <img src="${ASSETS.ven_badge_light}" alt="Landskrona Ven" width="42" height="42" style="display: block; width: 42px; height: 42px; border: 0;" />
              </div>
            </td>
            <td class="lk-sig-info-cell" style="vertical-align: top; padding-left: 18px;">
              <div contenteditable="true" style="font-size: 15px; font-weight: 700; color: #002438; line-height: 1.2;">${profName}</div>
              <div contenteditable="true" style="font-size: 12.5px; color: #A66420; font-weight: 600; margin-bottom: 6px;">${profTitle} &bull; ${profDept}</div>
              <div contenteditable="true" style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                📞 Direkt: ${profPhone}${profMobile}<br>
                ✉️ <a href="mailto:${profEmail}" style="color: #0551A4; text-decoration: none;">${profEmail}</a> &nbsp;|&nbsp; 🌐 <a href="https://iLandskrona.se" style="color: #0551A4; text-decoration: none;">iLandskrona.se</a><br>
                🏛️ Regeringsgatan 13, 261 36 Landskrona &bull; Landskrona Ven
              </div>
            </td>
          </tr>
        </table>
      </div>`,

      footer: `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#002438" class="lk-footer" style="background-color: #002438; border-radius: 6px; margin-top: 10px;">
        <tr>
          <td bgcolor="#002438" style="background-color: #002438; color: #ffffff; padding: 18px; font-family: 'Poppins', Arial, sans-serif; font-size: 11.5px; text-align: center; line-height: 1.6;">
            <p contenteditable="true" style="margin: 0; color: #ffffff;">
              <strong style="color: #F393B9; letter-spacing: 0.04em;">LANDSKRONA VEN &bull; iLandskrona.se</strong><br>
              En del av Landskrona stad &bull; Regeringsgatan 13, 261 36 Landskrona<br>
              📞 0418-47 35 00 &bull; ✉️ <a href="mailto:kontaktcenter@landskrona.se" style="color: #F393B9;">kontaktcenter@landskrona.se</a><br>
              ${currentLang === 'en' ? 'You are receiving this guide because you requested cultural updates.' : 'Du får detta utskick för att du prenumererar på evenemangs- och kulturtips.'} <a href="#" style="color: #E3E7D8; text-decoration: underline;">${currentLang === 'en' ? 'Unsubscribe' : 'Avregistrera'}</a>
            </p>
          </td>
        </tr>
      </table>`
    };
  }

  // LANDSKRONA STAD TEMPLATES (Dark-Mode-safe colored header with white logo)
  return {
    header: `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="${t.primary}" class="lk-brand-header" style="background-color: ${t.primary}; border-bottom: 4px solid ${t.secondary}; border-radius: 6px;">
      <tr>
        <td bgcolor="${t.primary}" class="lk-brand-header-td" style="background-color: ${t.primary}; padding: 14px 16px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="lk-header-table">
            <tr>
              <td align="left" valign="middle" style="vertical-align: middle;">
                <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td valign="middle" style="vertical-align: middle; padding-right: 12px;">
                      <img src="${ASSETS.stad_logo_liggande_vit}" alt="Landskrona stad" style="max-height: 36px; width: auto; display: block; border: 0;" />
                    </td>
                    <td valign="middle" style="vertical-align: middle; border-left: 2px solid rgba(255,255,255,0.28); padding-left: 12px;">
                      <div class="lk-brand-title" contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.2;">LANDSKRONA STADSBIBLIOTEK</div>
                      <div class="lk-brand-sub" contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 10px; color: #f1f5f9; font-weight: 500; margin-top: 2px;">En del av Landskrona stad &bull; Regeringsgatan 13</div>
                    </td>
                  </tr>
                </table>
              </td>
              <td align="right" valign="middle" class="lk-header-badge-cell" style="vertical-align: middle; padding-left: 16px; text-align: right;">
                <span class="lk-tag" contenteditable="true" style="background-color: ${t.secondary}; color: ${t.primary}; font-family: 'Ciutadella', Arial, sans-serif; font-size: 10px; font-weight: 700; padding: 5px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.03em; display: inline-block; white-space: nowrap;">${currentLang === 'en' ? 'Newsletter &bull; Nov 2026' : 'Nyhetsbrev &bull; Nov 2026'}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`,

    welcome: `<div style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #374151;">
      <p contenteditable="true" style="margin: 0;"><strong>${currentLang === 'en' ? 'Dear Patrons & Friends of Landskrona,' : 'Hej alla Landskronabor och bokälskare!'}</strong><br>${currentLang === 'en' ? 'Welcome to this month\'s newsletter from Landskrona Public Library. We have filled our calendar with exciting author visits, cozy weekend storytimes for kids, and new book arrivals. Whether you are seeking a quiet study space, borrowing audiobooks via the Libby app, or enjoying coffee in the historic fire station, you are always welcome here!' : 'Välkommen till månadens uppdatering från Stadsbiblioteket i Landskrona. Nu fyller vi biblioteket med författarbesök, mysiga sagostunder för de minsta och spännande boknyheter på våra hyllor. Oavsett om du söker en lugn studieplats, vill låna e-böcker via appen Libby eller bara njuta av en kopp kaffe och dagens tidningar i gamla brandstationen är du alltid varmt välkommen till oss!'}</p>
    </div>`,

    photo: `<div class="lk-photo-card" style="text-align: center; margin: 0;">
      ${photoControlsHtml}
      <div style="border-radius: 6px; overflow: hidden; background-color: #f1f5f9; min-height: 180px; text-align: center; border: 1px solid #e2e8f0;">
        <img class="newsletter-img" src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=80" alt="Biblioteket" style="max-width: 100%; width: 100%; height: auto; display: block; border-radius: 6px; margin: 0 auto; border: 0;">
      </div>
      <div class="lk-caption" contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 11.5px; color: #494B52; margin-top: 8px; font-style: normal; text-align: center;">${currentLang === 'en' ? 'Autumn atmosphere at Landskrona stadsbibliotek.' : 'Höststämning på Landskrona stadsbibliotek.'}</div>
    </div>`,

    l_block: `<div>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${t.primary}; border-radius: 6px; overflow: hidden;">
        <tr>
          <td width="16" style="width: 16px; background-color: ${t.secondary}; font-size: 1px; line-height: 1px;">&nbsp;</td>
          <td style="padding: 20px 22px; background-color: ${t.primary}; color: #ffffff;">
            <div style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 11px; font-weight: 700; color: ${t.secondary}; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">${currentLang === 'en' ? 'LANDSKRONA STAD • FEATURE NEWS' : 'LANDSKRONA STAD • VERKSAMHETSNYHET'}</div>
            <div contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 17px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 8px;">${currentLang === 'en' ? 'Welcome to our New Digital Learning Wing!' : 'Invigning av nya studierummet och digitala verkstaden'}</div>
            <div contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 13px; color: #ffffff; line-height: 1.5; margin-bottom: 14px;">${currentLang === 'en' ? 'We have expanded our study hall with modern workstations, fast Wi-Fi, and individual guidance slots.' : 'Nu har vi färdigställt det nya studierummet på plan 2 med ergonomiska studieplatser, tysta zoner och modern teknik. Kom förbi och upptäck våra nya resurser!'}</div>
            <table role="presentation" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="background-color: #ffffff; border-radius: 9999px;">
                  <a href="https://landskrona.se/bibliotek" class="lk-btn-link" contenteditable="true" style="background-color: #ffffff; color: ${t.primary} !important; padding: 10px 22px; border-radius: 9999px; text-decoration: none; font-family: 'Ciutadella', Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.02em; display: inline-block;">${currentLang === 'en' ? 'Read more here' : 'Läs mer här'}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="background-color: ${t.secondary}; padding: 8px 22px; text-align: right;">
            <span style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 11px; font-weight: 700; color: ${t.primary}; text-transform: uppercase; letter-spacing: 0.04em;">landskrona.se/bibliotek</span>
          </td>
        </tr>
      </table>
      <div class="editor-only-controls">
        <button type="button" class="editor-mini-btn" onclick="editButtonLink(this)">🔗 ${currentLang === 'en' ? 'Edit Button URL' : 'Ändra knapplänk'}</button>
      </div>
    </div>`,

    box_dark: `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="lk-box-dark" style="background-color: ${t.primary}; border-top: 4px solid ${t.secondary}; border-radius: 6px; padding: 18px 20px;">
      <tr>
        <td>
          <div style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 11px; font-weight: 700; color: ${t.secondary}; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">${currentLang === 'en' ? 'MUNICIPAL NOTICE • LANDSKRONA STAD' : 'VIKTIG INFORMATION • LANDSKRONA STAD'}</div>
          <div contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 8px;">${currentLang === 'en' ? 'Special Announcement: Renovations & Extended Services' : 'Viktigt meddelande: Ombyggnad och utökad digital service'}</div>
          <div contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 13px; color: #ffffff; line-height: 1.5;">${currentLang === 'en' ? 'During November and December, our central study hall will undergo acoustic improvements. All study spaces remain open, and our librarians are happy to assist you at the front desk.' : 'Under november och december genomför vi akustikförbättringar i den stora tysta läsesalen. Studieplatser finns tillgängliga som vanligt och personalen hjälper dig gärna vid informationsdisken.'}</div>
        </td>
      </tr>
    </table>`,

    box_light: `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="lk-box-light" style="background-color: ${t.bgSoft}; border-top: 4px solid ${t.secondary}; border-radius: 6px; padding: 16px 18px;">
      <tr>
        <td>
          <div contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 15px; font-weight: 700; color: ${t.primary}; line-height: 1.3; margin-bottom: 6px;">💡 ${currentLang === 'en' ? 'Did you know? Free Digital Newspaper Access' : 'Visste du att? Läs tusentals tidningar gratis med PressReader'}</div>
          <div contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 13px; color: #374151; line-height: 1.5;">${currentLang === 'en' ? 'With your library card in Landskrona, you get full free access to over 7,000 international newspapers and magazines on your phone or tablet via PressReader. Ask us how to connect!' : 'Med ditt lånekort i Landskrona har du fri tillgång till fler än 7 000 dagstidningar och magasin från hela världen via appen PressReader. Fråga oss i biblioteket så hjälper vi dig komma igång!'}</div>
        </td>
      </tr>
    </table>`,

    box_neutral: `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="lk-box-neutral" style="background-color: #F7F4F3; border-top: 4px solid #BA9754; border-radius: 6px; padding: 16px 18px;">
      <tr>
        <td>
          <div style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 11px; font-weight: 700; color: #494B52; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">${currentLang === 'en' ? 'FACT BOX • CONTACT &amp; ASSISTANCE' : 'FAKTARUTA • KONTAKT &amp; SERVICE'}</div>
          <div contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 6px;">${currentLang === 'en' ? 'Book a Librarian for Research Guidance' : 'Boka en bibliotekarie för sökhjälp'}</div>
          <div contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 12.5px; color: #374151; line-height: 1.5;">${currentLang === 'en' ? 'Need help finding academic sources, genealogy records, or setting up e-services? Book 45 minutes of individual guidance with a librarian at no cost. Email stadsbiblioteket@landskrona.se.' : 'Behöver du fördjupad hjälp med källsökning, släktforskning eller digitala tjänster? Du kan boka 45 minuters kostnadsfri enskild handledning med en bibliotekarie. Kontakta oss via e-post: stadsbiblioteket@landskrona.se.'}</div>
        </td>
      </tr>
    </table>`,

    event: `<div class="lk-event-card" style="background-color: #fafafa; border-left: 4px solid ${t.primary}; border-top: 1px solid #f3f4f6; border-right: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6; border-radius: 0 6px 6px 0; padding: 14px;">
      <div class="lk-event-title" contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 15px; font-weight: 700; color: #111827;">📖 ${currentLang === 'en' ? 'Saturday Morning Storytime &amp; Crafts' : 'Lördagsmys &amp; Sagostund i Barnavdelningen'}</div>
      <div class="lk-event-meta" contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 12px; font-weight: 600; color: ${t.primary}; margin: 4px 0 6px 0;">🗓️ ${currentLang === 'en' ? 'Every Saturday | 11:00 AM – 12:00 PM | Regeringsgatan 13' : 'Varje lördag kl. 11.00–12.00 | Regeringsgatan 13'}</div>
      <div class="lk-event-desc" contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 13px; color: #374151; line-height: 1.5;">${currentLang === 'en' ? 'Join us for seasonal storybooks, songs, and crafts on our cozy reading mats. Perfect for children ages 3 to 6 and their parents. Free admission, no pre-registration required!' : 'Vi samlas på mattan bland kuddarna och läser noga utvalda bilderböcker och pysslar tillsammans. Passar barn tre till sex år och deras vuxna. Fri entré, ingen föranmälan krävs!'}</div>
    </div>`,

    book: `<div>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="lk-book-card" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 14px;">
        <tr>
          <td width="65" class="book-cover-cell" style="vertical-align: middle; width: 65px; padding-right: 14px;">
            <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 60px; height: 80px; background-color: ${t.bgSoft}; border: 1px solid ${t.secondary}; border-radius: 4px;">
              <tr><td align="center" valign="middle" style="font-size: 28px; text-align: center;">${bookEmoji}</td></tr>
            </table>
          </td>
          <td style="vertical-align: middle;">
            <div class="lk-book-title" contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 14.5px; font-weight: 700; color: #111827; line-height: 1.3;">${currentLang === 'en' ? 'Staff Pick: "The Midnight Library"' : 'Personalen tipsar: "Stargate – En julberättelse"'}</div>
            <div class="lk-book-author" contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 12px; color: #6b7280; font-weight: 600; margin: 3px 0 5px 0;">${currentLang === 'en' ? 'By Matt Haig • Recommended by Library Staff' : 'Av Ingvild H. Rishøi • Tipsat av bibliotekarien'}</div>
            <div class="lk-book-desc" contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 12.5px; color: #374151; line-height: 1.4;">${currentLang === 'en' ? 'A touching, thought-provoking tale about regrets, choices, and second chances. Available directly at the front desk or as an e-book via our catalog.' : 'En gripande och poetisk skildring om hopp, syskonkärlek och magi. Finns att låna direkt i hyllan på vuxenavdelningen eller som ljudbok via Bibliotek Familjen Helsingborg.'}</div>
          </td>
        </tr>
      </table>
      <div class="editor-only-controls">
        <button type="button" class="editor-mini-btn" onclick="editBookCover(this)">🖼️ ${currentLang === 'en' ? 'Set Book Cover URL' : 'Lägg till bokomslag (URL)'}</button>
        <button type="button" class="editor-mini-btn" onclick="resetBookIcon(this)">📕 ${currentLang === 'en' ? 'Reset Icon' : 'Återställ ikon'}</button>
      </div>
    </div>`,

    hours: `<div class="lk-hours-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-top: 3px solid ${t.primary}; border-radius: 6px; padding: 14px;">
      <div class="lk-hours-title" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 14px; font-weight: 700; color: ${t.primary}; margin-bottom: 8px;">⏰ <span contenteditable="true">${currentLang === 'en' ? 'Library Opening Hours' : 'Öppettider på Stadsbiblioteket'}</span></div>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="lk-hours-table" style="width: 100%; font-family: 'Ciutadella', Arial, sans-serif; font-size: 12.5px; color: #334155; border-collapse: collapse;">
        <tr><td class="strong" contenteditable="true" style="padding: 3px 0; font-weight: 600; width: 45%;">${currentLang === 'en' ? 'Monday – Thursday:' : 'Måndag – Torsdag:'}</td><td contenteditable="true" style="padding: 3px 0;">${currentLang === 'en' ? '09:00 – 19:00 (Self-service 09:00–10:00)' : '09.00–19.00 (Lättöppet 09.00–10.00)'}</td></tr>
        <tr><td class="strong" contenteditable="true" style="padding: 3px 0; font-weight: 600;">${currentLang === 'en' ? 'Friday:' : 'Fredag:'}</td><td contenteditable="true" style="padding: 3px 0;">${currentLang === 'en' ? '09:00 – 17:00 (Self-service 09:00–10:00)' : '09.00–17.00 (Lättöppet 09.00–10.00)'}</td></tr>
        <tr><td class="strong" contenteditable="true" style="padding: 3px 0; font-weight: 600;">${currentLang === 'en' ? 'Saturday:' : 'Lördag:'}</td><td contenteditable="true" style="padding: 3px 0;">${currentLang === 'en' ? '10:00 – 15:00' : '10.00–15.00'}</td></tr>
        <tr><td class="strong" contenteditable="true" style="padding: 3px 0; font-weight: 600;">${currentLang === 'en' ? 'Sunday:' : 'Söndag:'}</td><td contenteditable="true" style="padding: 3px 0;">${currentLang === 'en' ? 'Closed' : 'Stängt'}</td></tr>
      </table>
      <p style="font-size: 11px; color: #494B52; margin: 8px 0 0 0;" contenteditable="true">${currentLang === 'en' ? 'Note: During 09:00–10:00 on weekdays, Floor 1 is open for automated loan returns. Full desk service begins at 10:00.' : 'Under "lättöppet" kl. 09.00–10.00 på vardagar är plan 1 öppet för att återlämna och låna i automater. Full personalservice från kl. 10.00.'}</p>
    </div>`,

    links_strip: `<div>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="lk-links-strip" style="background-color: #F7F4F3; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px;">
        <tr>
          <td align="center" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 12px; font-weight: 700; line-height: 1.8;">
            <a href="https://landskrona.se/bibliotek" contenteditable="true" style="color: ${t.primary}; text-decoration: none; display: inline-block; margin: 0 8px; white-space: nowrap;">🌐 landskrona.se/bibliotek</a>
            <a href="https://bibliotekfh.se" contenteditable="true" style="color: ${t.primary}; text-decoration: none; display: inline-block; margin: 0 8px; white-space: nowrap;">📚 ${currentLang === 'en' ? 'Search Catalog (FH)' : 'Sök böcker (FH)'}</a>
            <a href="https://www.facebook.com/landskronastadsbibliotek" contenteditable="true" style="color: ${t.primary}; text-decoration: none; display: inline-block; margin: 0 8px; white-space: nowrap;">📘 Facebook</a>
          </td>
        </tr>
      </table>
      <div class="editor-only-controls">
        <button type="button" class="editor-mini-btn" onclick="editLinksStrip(this)">🔗 ${currentLang === 'en' ? 'Edit Link URLs' : 'Ändra länkadresser'}</button>
      </div>
    </div>`,

    familjen: `<div class="lk-familjen-bar" style="background-color: #F7F4F3; border: 1px solid #e2e8f0; border-left: 4px solid ${t.primary}; border-radius: 0 6px 6px 0; padding: 14px; font-size: 12.5px; color: #1f2937;">
      <h4 contenteditable="true" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 14px; font-weight: 700; color: ${t.primary}; margin: 0 0 4px 0;">📚 Bibliotek Familjen Helsingborg</h4>
      <p contenteditable="true" style="margin: 0; line-height: 1.5; color: #1f2937;">${currentLang === 'en' ? 'Did you know your library card in Landskrona also works across 11 municipalities including Helsingborg, Höganäs, Ängelholm, and Svalöv? Borrow, renew, and return books freely across all member libraries!' : 'Visste du att ditt bibliotekskort i Landskrona även gäller i Bjuv, Båstad, Helsingborg, Höganäs, Klippan, Perstorp, Svalöv, Åstorp, Ängelholm och Örkelljunga? Låna och lämna böcker fritt i elva kommuner!'}</p>
    </div>`,

    cta: `<div class="lk-cta-wrap" style="text-align: center; margin: 10px 0;">
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
        <tr>
          <td align="center" bgcolor="${t.primary}" style="background-color: ${t.primary}; border-radius: 9999px; mso-padding-alt: 12px 28px;">
            <a href="https://bibliotekfh.se" class="lk-btn-link" contenteditable="true" style="background-color: ${t.primary}; border: 12px solid ${t.primary}; border-left-width: 28px; border-right-width: 28px; color: #ffffff !important; border-radius: 9999px; text-decoration: none; font-family: 'Ciutadella', Arial, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; display: inline-block;">${currentLang === 'en' ? 'Search Catalog &amp; Reserve Books' : 'Sök i katalogen &amp; reservera böcker'}</a>
          </td>
        </tr>
      </table>
      <div class="editor-only-controls">
        <button type="button" class="editor-mini-btn" onclick="editButtonLink(this)">🔗 ${currentLang === 'en' ? 'Edit Button URL' : 'Ändra knapplänk'}</button>
      </div>
    </div>`,

    divider: `<div style="padding: 8px 0;"><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;"></div>`,

    signature: `<div class="lk-signature-card" style="padding: 4px 0; overflow: hidden;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: 'Ciutadella', Arial, sans-serif; color: #1f2937;">
        <tr>
          <td style="vertical-align: middle;">
            <table role="presentation" border="0" cellspacing="0" cellpadding="0" class="lk-sig-table">
              <tr>
                ${profLeftCell}
                <td class="lk-sig-info-cell" style="vertical-align: middle; padding-left: 16px;">
                  <div class="lk-sig-name" contenteditable="true" style="font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.2;">${profName}</div>
                  <div class="lk-sig-role" contenteditable="true" style="font-size: 12.5px; color: ${t.primary}; font-weight: 600; margin-bottom: 6px;">${profTitle} &bull; ${profDept}</div>
                  <div class="lk-sig-meta" contenteditable="true" style="font-size: 12px; color: #4b5563; line-height: 1.5;">
                    📞 Direkt: ${profPhone}${profMobile}<br>
                    ✉️ <a href="mailto:${profEmail}" style="color: ${t.primary}; text-decoration: none;">${profEmail}</a> &nbsp;|&nbsp; 🌐 <a href="https://landskrona.se/bibliotek" style="color: ${t.primary}; text-decoration: none;">landskrona.se/bibliotek</a><br>
                    🏛️ Regeringsgatan 13, 261 36 Landskrona &bull; Landskrona stad
                  </div>
                </td>
              </tr>
            </table>
          </td>
          <td width="48" align="right" valign="bottom" class="lk-crest-cell" style="width: 48px; vertical-align: bottom; overflow: hidden;">
            <img src="${t.crest}" alt="" width="68" class="lk-crest-img" style="display: block; width: 68px; height: auto; opacity: 0.28; margin-bottom: -24px; margin-right: -24px;" />
          </td>
        </tr>
      </table>
    </div>`,

    footer: `<div class="lk-stad-footer" style="border-top: 1px solid #e2e8f0; margin-top: 10px; padding-top: 14px; overflow: hidden;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td class="lk-footer-text" style="font-family: 'Ciutadella', Arial, sans-serif; font-size: 11.5px; color: #494B52; text-align: center; line-height: 1.6; vertical-align: middle;">
            <p contenteditable="true" style="margin: 0;">
              <strong style="color: #111827; text-transform: uppercase; letter-spacing: 0.04em;">LANDSKRONA STADSBIBLIOTEK</strong> &bull; Regeringsgatan 13, 261 36 Landskrona<br>
              📞 0418-47 35 00 &bull; ✉️ <a href="mailto:stadsbiblioteket@landskrona.se" style="color: ${t.primary};">stadsbiblioteket@landskrona.se</a> &bull; 🌐 <a href="https://landskrona.se/bibliotek" style="color: ${t.primary};">landskrona.se/bibliotek</a><br>
              ${currentLang === 'en' ? 'You are receiving this email because you subscribed to library updates.' : 'Du får detta e-postmeddelande för att du är låntagare eller prenumerant.'} <a href="#" style="color: #494B52; text-decoration: underline;">${currentLang === 'en' ? 'Unsubscribe' : 'Avregistrera'}</a>
            </p>
          </td>
          <td width="48" align="right" valign="bottom" class="lk-crest-cell" style="width: 48px; vertical-align: bottom; overflow: hidden;">
            <img src="${t.crest}" alt="" width="68" class="lk-crest-img" style="display: block; width: 68px; height: auto; opacity: 0.35; margin-bottom: -24px; margin-right: -24px;" />
          </td>
        </tr>
      </table>
    </div>`
  };
}

const canvas = document.getElementById('emailCanvas');
let draggedType = null;
let draggedElement = null;

// Undo Stack Management
function pushUndoState() {
  if (!canvas) return;
  const snapshot = canvas.innerHTML;
  if (historyStack.length > 0 && historyStack[historyStack.length - 1] === snapshot) return;
  historyStack.push(snapshot);
  if (historyStack.length > MAX_HISTORY) historyStack.shift();
  updateUndoButton();
}

function undoLastAction() {
  if (historyStack.length === 0) return;
  const prev = historyStack.pop();
  canvas.innerHTML = prev;
  reattachDragHandlers();
  updateUndoButton();
  autoSaveCanvas();
  showToast(currentLang === 'en' ? '↩️ Undid last change' : '↩️ Ångrade senaste ändringen');
}

function updateUndoButton() {
  const btn = document.getElementById('ui_btn_undo');
  if (!btn) return;
  btn.disabled = historyStack.length === 0;
  btn.style.opacity = historyStack.length === 0 ? '0.5' : '1';
}

// Rich Text Formatting
function formatDoc(cmd, val = null) {
  pushUndoState();
  document.execCommand(cmd, false, val);
  isCanvasEdited = true;
}

function insertDocLink() {
  const url = prompt(currentLang === 'en' ? 'Enter destination URL:' : 'Ange webblänk (URL):', 'https://');
  if (url && url.trim() !== '') {
    pushUndoState();
    formatDoc('createLink', url.trim());
    isCanvasEdited = true;
  }
}

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  const toolbar = document.getElementById('richTextToolbar');
  if (!selection.isCollapsed && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const editable = container.nodeType === 1 ? container.closest('[contenteditable="true"]') : container.parentElement?.closest('[contenteditable="true"]');
    if (editable && document.getElementById('emailCanvas').contains(editable)) {
      const rect = range.getBoundingClientRect();
      toolbar.style.display = 'flex';
      toolbar.style.top = (window.scrollY + rect.top - 38) + 'px';
      toolbar.style.left = Math.max(10, (window.scrollX + rect.left + (rect.width / 2) - 100)) + 'px';
      return;
    }
  }
  if (toolbar) toolbar.style.display = 'none';
});

// Auto-Save Canvas State
function autoSaveCanvas() {
  try {
    const data = {
      brand: currentBrand,
      harmony: currentHarmony,
      subject: document.getElementById('email_subject_input')?.value || '',
      preheader: document.getElementById('email_preheader_input')?.value || '',
      html: canvas.innerHTML
    };
    localStorage.setItem('lk_email_draft_backup', JSON.stringify(data));
  } catch (e) {}
}

canvas.addEventListener('focusin', (e) => {
  if (e.target && e.target.getAttribute && e.target.getAttribute('contenteditable') === 'true') {
    pushUndoState();
  }
});

canvas.addEventListener('input', () => {
  isCanvasEdited = true;
  autoSaveCanvas();
});

// Toast Helper
function showToast(msg) {
  const toast = document.getElementById('toastMessage');
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

// Collapsible Sidebar Categories State
const collapsedCategories = {
  boxes: false,
  actions: false
};

function toggleSidebarCategory(catId) {
  collapsedCategories[catId] = !collapsedCategories[catId];
  const el = document.getElementById('cat_' + catId);
  if (el) el.classList.toggle('is-collapsed', collapsedCategories[catId]);
}

function buildCategorySection(catId, title, items) {
  const isCollapsed = !!collapsedCategories[catId];
  const itemsHtml = items.map(it => createToolItem(it[0], it[1], it[2], it[3])).join('');
  return `<div class="sidebar-category ${isCollapsed ? 'is-collapsed' : ''}" id="cat_${catId}">
    <button type="button" class="sidebar-category-btn" onclick="toggleSidebarCategory('${catId}')">
      <span>${title} <span style="color: #94a3b8; font-weight: 500;">(${items.length})</span></span>
      <span class="sidebar-category-arrow">▼</span>
    </button>
    <div class="sidebar-category-items">
      ${itemsHtml}
    </div>
  </div>`;
}

// Sidebar Rendering
function renderSidebar() {
  const container = document.getElementById('blocksContainer');
  const t = i18n[currentLang];
  const isVen = currentBrand === 'ven';
  
  let html = '';
  
  html += buildCategorySection('structure', t.cat_structure, [
    ['header', '🏛️', t.block_header, t.block_header_sub],
    ['welcome', '👋', t.block_welcome, t.block_welcome_sub],
    ['photo', '🖼️', t.block_photo, t.block_photo_sub]
  ]);
  
  if (isVen) {
    html += buildCategorySection('content', t.cat_content, [
      ['event', '🎭', t.block_ven_experience, t.block_ven_experience_sub]
    ]);
  } else {
    html += buildCategorySection('content', t.cat_content, [
      ['event', '📖', t.block_event, t.block_event_sub],
      ['book', '📕', t.block_book, t.block_book_sub],
      ['hours', '⏰', t.block_hours, t.block_hours_sub],
      ['links_strip', '🔗', t.block_links_strip, t.block_links_strip_sub],
      ['familjen', '📚', t.block_familjen, t.block_familjen_sub]
    ]);
    
    html += buildCategorySection('boxes', t.cat_boxes, [
      ['l_block', '📐', t.block_l_block, t.block_l_block_sub],
      ['box_dark', '🔲', t.block_box_dark, t.block_box_dark_sub],
      ['box_light', '◽', t.block_box_light, t.block_box_light_sub],
      ['box_neutral', '🏛️', t.block_box_neutral, t.block_box_neutral_sub]
    ]);
  }
  
  html += buildCategorySection('actions', t.cat_actions, [
    ['cta', '🔘', t.block_cta, t.block_cta_sub],
    ['divider', '➖', t.block_divider, t.block_divider_sub],
    ['signature', '✒️', t.block_signature, t.block_signature_sub],
    ['footer', '📋', t.block_footer, t.block_footer_sub]
  ]);

  container.innerHTML = html;
  setupDragAndDrop();
}

function createToolItem(type, icon, title, desc) {
  return `<div class="tool-item" draggable="true" data-type="${type}" onclick="addBlockToCanvas('${type}', true, true)">
    <div class="tool-icon">${icon}</div>
    <div class="tool-info">
      <div class="tool-name">${title}</div>
      <div class="tool-desc">${desc}</div>
    </div>
  </div>`;
}

// Custom Saved Templates (localStorage)
function getCustomTemplates() {
  try {
    return JSON.parse(localStorage.getItem('lk_custom_templates') || '[]');
  } catch (e) { return []; }
}

function saveCustomTemplate() {
  const name = prompt(currentLang === 'en' ? 'Name your template (e.g., Book Club):' : 'Namnge din mall (t.ex. Bokcirkel eller Lovprogram):');
  if (!name || !name.trim()) return;
  const list = getCustomTemplates();
  list.push({
    name: name.trim(),
    brand: currentBrand,
    harmony: currentHarmony,
    html: canvas.innerHTML
  });
  try {
    localStorage.setItem('lk_custom_templates', JSON.stringify(list));
  } catch (e) {}
  renderPresetButtons();
  showToast(currentLang === 'en' ? '💾 Template saved!' : '💾 Mall sparad i snabbmenyn!');
}

function applyCustomTemplate(index) {
  if (isCanvasEdited && !confirm(i18n[currentLang].confirm_overwrite)) return;
  const list = getCustomTemplates();
  const item = list[index];
  if (!item) return;
  pushUndoState();
  canvas.innerHTML = item.html;
  reattachDragHandlers();
  isCanvasEdited = false;
  autoSaveCanvas();
  const wrapper = document.querySelector('.canvas-wrapper');
  if (wrapper) wrapper.scrollTop = 0;
  showToast((currentLang === 'en' ? 'Loaded: ' : 'Laddade mall: ') + item.name);
}

function deleteCustomTemplate(index, e) {
  e.stopPropagation();
  const list = getCustomTemplates();
  list.splice(index, 1);
  try {
    localStorage.setItem('lk_custom_templates', JSON.stringify(list));
  } catch (e) {}
  renderPresetButtons();
}

// Preset Buttons Rendering
function renderPresetButtons() {
  const wrap = document.getElementById('presetButtonsWrap');
  let html = '';
  if (currentBrand === 'ven') {
    html = `
      <button class="preset-pill" onclick="applyPresetWithConfirm('ven_guide')">⛵ ${currentLang === 'en' ? 'Visitor & Culture Guide' : 'Kultur- & Besöksguide'}</button>
      <button class="preset-pill" onclick="applyPresetWithConfirm('ven_event')">🎭 ${currentLang === 'en' ? 'Event Announcement' : 'Evenemangstips'}</button>
    `;
  } else {
    html = `
      <button class="preset-pill" onclick="applyPresetWithConfirm('monthly')">📰 ${currentLang === 'en' ? 'Monthly' : 'Månadsbrev'}</button>
      <button class="preset-pill" onclick="applyPresetWithConfirm('lblock_hero')">📐 ${currentLang === 'en' ? 'L-Block' : 'L-Block'}</button>
      <button class="preset-pill" onclick="applyPresetWithConfirm('events')">📖 ${currentLang === 'en' ? 'Storytime' : 'Sagostund'}</button>
      <button class="preset-pill" onclick="applyPresetWithConfirm('notice')">⏰ ${currentLang === 'en' ? 'Hours' : 'Öppettider'}</button>
    `;
  }

  const customs = getCustomTemplates();
  customs.forEach((tpl, idx) => {
    html += `<button class="preset-pill" onclick="applyCustomTemplate(${idx})" style="background: #eef2ff; border-color: #c7d2fe;">⭐ ${tpl.name} <span onclick="deleteCustomTemplate(${idx}, event)" style="margin-left:4px; color:#dc2626;" title="Ta bort mall">×</span></button>`;
  });

  wrap.innerHTML = html;
}

// Brand Mode & Harmony Switching
function setBrandMode(brand) {
  if (currentBrand !== brand && isCanvasEdited) {
    if (!confirm(i18n[currentLang].confirm_overwrite)) return;
  }
  currentBrand = brand;
  document.getElementById('btnBrandStad').classList.toggle('active', brand === 'stad');
  document.getElementById('btnBrandVen').classList.toggle('active', brand === 'ven');
  document.getElementById('harmonyGroup').style.display = (brand === 'stad') ? 'flex' : 'none';

  applyThemeVariables();
  renderSidebar();
  renderPresetButtons();
  updateUIStrings();
  
  if (brand === 'ven') {
    applyPreset('ven_guide');
    showToast(currentLang === 'en' ? '⛵ Switched to Landskrona Ven (Tourism / Place Brand)' : '⛵ Växlade till Landskrona Ven (Platsvarumärke)');
  } else {
    applyPreset('monthly');
    showToast(currentLang === 'en' ? '🏛️ Switched to Landskrona stad (Formal Municipal)' : '🏛️ Växlade till Landskrona stad (Kommunal profil)');
  }
}

function setStadHarmony(harmony) {
  if (currentBrand !== 'stad') return;
  const oldTheme = getActiveTheme();
  currentHarmony = harmony;
  const newTheme = getActiveTheme();
  
  document.getElementById('pillBurgundy').classList.toggle('active', harmony === 'burgundy');
  document.getElementById('pillBlue').classList.toggle('active', harmony === 'blue');
  document.getElementById('pillGreen').classList.toggle('active', harmony === 'green');

  applyThemeVariables();
  renderSidebar();
  
  // Re-theme existing canvas IN PLACE so zero user edits are lost!
  rethemeCanvasInPlace(oldTheme, newTheme);
  
  const names = {
    burgundy: 'Vinröd / Rosa (Kultur & Soluppgång)',
    blue: 'Mörkblå / Blå (Hav & Himmel)',
    green: 'Mörkgrön / Grön (Natur & Arkitektur)'
  };
  showToast('🎨 ' + (names[harmony] || harmony));
}

function rethemeCanvasInPlace(oldTheme, newTheme) {
  if (!oldTheme || !newTheme || oldTheme.primary === newTheme.primary) return;
  pushUndoState();
  let html = canvas.innerHTML;
  const replaceCI = (str, from, to) => str.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), to);
  
  html = replaceCI(html, oldTheme.primary, newTheme.primary);
  html = replaceCI(html, oldTheme.secondary, newTheme.secondary);
  html = replaceCI(html, oldTheme.accent, newTheme.accent);
  html = replaceCI(html, oldTheme.bgSoft, newTheme.bgSoft);
  html = html.split(oldTheme.crest).join(newTheme.crest);
  
  // Also handle rgb(...) values produced by browser inline style normalization
  const hexToRgb = (hex) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };
  html = replaceCI(html, hexToRgb(oldTheme.primary), newTheme.primary);
  html = replaceCI(html, hexToRgb(oldTheme.secondary), newTheme.secondary);
  html = replaceCI(html, hexToRgb(oldTheme.bgSoft), newTheme.bgSoft);

  const newBookEmoji = currentHarmony === 'blue' ? '📘' : (currentHarmony === 'green' ? '📗' : '📕');
  html = html.replace(/📕|📘|📗/g, newBookEmoji);

  canvas.innerHTML = html;
  reattachDragHandlers();
  autoSaveCanvas();
}

function applyThemeVariables() {
  const t = getActiveTheme();
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', t.primary);
  root.style.setProperty('--theme-secondary', t.secondary);
  root.style.setProperty('--theme-accent', t.accent);
  root.style.setProperty('--theme-bg-soft', t.bgSoft);
  root.style.setProperty('--theme-font', t.font);
  
  document.getElementById('navCrestImg').src = t.crest;
}

function reattachDragHandlers() {
  canvas.querySelectorAll('.canvas-item').forEach(div => {
    div.addEventListener('dragstart', (e) => {
      draggedElement = div;
      draggedType = null;
      e.dataTransfer.setData('text/plain', 'internal');
    });
  });
}

// Drag & Drop Handling
function setupDragAndDrop() {
  document.querySelectorAll('.tool-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedType = item.getAttribute('data-type');
      draggedElement = null;
      e.dataTransfer.setData('text/plain', draggedType);
    });
  });

  canvas.ondragover = (e) => {
    e.preventDefault();
    const targetItem = e.target.closest('.canvas-item');
    if (targetItem && targetItem !== draggedElement) {
      targetItem.classList.add('drag-over');
    }
  };

  canvas.ondragleave = (e) => {
    const targetItem = e.target.closest('.canvas-item');
    if (targetItem) targetItem.classList.remove('drag-over');
  };

  canvas.ondrop = (e) => {
    e.preventDefault();
    canvas.querySelectorAll('.canvas-item').forEach(el => el.classList.remove('drag-over'));
    const targetItem = e.target.closest('.canvas-item');

    if (draggedElement) {
      pushUndoState();
      if (targetItem && targetItem !== draggedElement) {
        canvas.insertBefore(draggedElement, targetItem);
      } else {
        canvas.appendChild(draggedElement);
      }
      isCanvasEdited = true;
    } else if (draggedType) {
      pushUndoState();
      const newBlock = createBlockElement(draggedType);
      if (targetItem) {
        canvas.insertBefore(newBlock, targetItem);
      } else {
        canvas.appendChild(newBlock);
      }
      checkEmptyState();
      isCanvasEdited = true;
      showToast(currentLang === 'en' ? 'Block added' : 'Block lagt till');
    }
    draggedType = null;
    draggedElement = null;
    autoSaveCanvas();
  };
}

function addBlockToCanvas(type, shouldScroll = true, recordUndo = false) {
  if (recordUndo) {
    pushUndoState();
    isCanvasEdited = true;
  }
  const el = createBlockElement(type);
  canvas.appendChild(el);
  checkEmptyState();
  if (shouldScroll) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  autoSaveCanvas();
}

function createBlockElement(type) {
  const templates = getTemplates();
  const htmlContent = templates[type] || '<p>Block</p>';
  
  const div = document.createElement('div');
  div.className = 'canvas-item';
  div.setAttribute('data-type', type);
  div.setAttribute('draggable', 'true');

  div.innerHTML = `
    <div class="item-controls">
      <button class="item-ctrl-btn" onclick="moveBlock(this, -1)" title="Flytta upp">▲</button>
      <button class="item-ctrl-btn" onclick="moveBlock(this, 1)" title="Flytta ned">▼</button>
      <button class="item-ctrl-btn" onclick="duplicateBlock(this)" title="Duplicera">⧉</button>
      <button class="item-ctrl-btn danger" onclick="deleteBlock(this)" title="Ta bort">✕</button>
    </div>
    ${htmlContent}
  `;

  div.addEventListener('dragstart', (e) => {
    draggedElement = div;
    draggedType = null;
    e.dataTransfer.setData('text/plain', 'internal');
  });

  return div;
}

function moveBlock(btn, direction) {
  const item = btn.closest('.canvas-item');
  pushUndoState();
  if (direction === -1 && item.previousElementSibling && !item.previousElementSibling.classList.contains('drop-placeholder')) {
    item.parentElement.insertBefore(item, item.previousElementSibling);
  } else if (direction === 1 && item.nextElementSibling) {
    item.parentElement.insertBefore(item.nextElementSibling, item);
  }
  isCanvasEdited = true;
  autoSaveCanvas();
}

function duplicateBlock(btn) {
  const item = btn.closest('.canvas-item');
  pushUndoState();
  const clone = item.cloneNode(true);
  clone.addEventListener('dragstart', (e) => {
    draggedElement = clone;
    draggedType = null;
    e.dataTransfer.setData('text/plain', 'internal');
  });
  item.parentElement.insertBefore(clone, item.nextElementSibling);
  isCanvasEdited = true;
  showToast(currentLang === 'en' ? 'Block duplicated' : 'Block duplicerat');
  autoSaveCanvas();
}

function deleteBlock(btn) {
  pushUndoState();
  const item = btn.closest('.canvas-item');
  item.remove();
  checkEmptyState();
  isCanvasEdited = true;
  autoSaveCanvas();
}

function clearCanvas() {
  if (confirm(i18n[currentLang].confirm_clear)) {
    pushUndoState();
    canvas.innerHTML = '';
    checkEmptyState();
    isCanvasEdited = false;
    showToast(i18n[currentLang].canvas_cleared);
    autoSaveCanvas();
  }
}

function checkEmptyState() {
  if (canvas.children.length === 0) {
    const t = i18n[currentLang];
    canvas.innerHTML = `
      <div class="drop-placeholder">
        <p style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${t.empty_title}</p>
        <p>${t.empty_desc}</p>
      </div>`;
  } else {
    const placeholder = canvas.querySelector('.drop-placeholder:only-child');
    if (placeholder) placeholder.remove();
  }
}

// Visual Link & Book Cover Editors
function editButtonLink(btn) {
  const item = btn.closest('.canvas-item');
  const link = item.querySelector('.lk-btn-link');
  if (!link) return;
  const newUrl = prompt(currentLang === 'en' ? 'Enter button destination URL:' : 'Ange knapplänkens webbadress (URL):', link.getAttribute('href') || 'https://');
  if (newUrl && newUrl.trim() !== '') {
    pushUndoState();
    link.setAttribute('href', newUrl.trim());
    isCanvasEdited = true;
    autoSaveCanvas();
    showToast(currentLang === 'en' ? '🔗 Button URL updated!' : '🔗 Knapplänk uppdaterad!');
  }
}

function editLinksStrip(btn) {
  const item = btn.closest('.canvas-item');
  const links = item.querySelectorAll('a');
  if (links.length === 0) return;
  pushUndoState();
  links.forEach((a, i) => {
    const label = a.innerText.trim();
    const updated = prompt((currentLang === 'en' ? 'URL for ' : 'Webbadress för ') + label + ':', a.getAttribute('href') || 'https://');
    if (updated && updated.trim() !== '') {
      a.setAttribute('href', updated.trim());
    }
  });
  isCanvasEdited = true;
  autoSaveCanvas();
  showToast(currentLang === 'en' ? '🔗 Links updated!' : '🔗 Länkadresser uppdaterade!');
}

function editBookCover(btn) {
  const item = btn.closest('.canvas-item');
  const cell = item.querySelector('.book-cover-cell');
  if (!cell) return;
  const url = prompt(currentLang === 'en' ? 'Paste Book Cover Image URL (HTTPS):' : 'Klistra in bildlänk (HTTPS URL) till bokomslag:', 'https://');
  if (url && url.trim().startsWith('http')) {
    pushUndoState();
    cell.innerHTML = `<img src="${url.trim()}" alt="Bokomslag" width="60" style="width: 60px; height: auto; display: block; border-radius: 4px; border: 1px solid #e2e8f0;" />`;
    isCanvasEdited = true;
    autoSaveCanvas();
    showToast(currentLang === 'en' ? '📕 Book cover updated!' : '📕 Bokomslag uppdaterat!');
  }
}

function resetBookIcon(btn) {
  const item = btn.closest('.canvas-item');
  const cell = item.querySelector('.book-cover-cell');
  const t = getActiveTheme();
  if (!cell) return;
  pushUndoState();
  cell.innerHTML = `<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 60px; height: 80px; background-color: ${t.bgSoft}; border: 1px solid ${t.secondary}; border-radius: 4px;">
    <tr><td align="center" valign="middle" style="font-size: 28px; text-align: center;">📕</td></tr>
  </table>`;
  isCanvasEdited = true;
  autoSaveCanvas();
}

// Pre-hosted Image Gallery (Bildbank)
function openGalleryModal(btn) {
  activeGalleryTargetBtn = btn;
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = GALLERY_IMAGES.map(img => `
    <div class="gallery-card" onclick="selectGalleryImage('${img.url}')">
      <img src="${img.url}" alt="${currentLang === 'en' ? img.titleEn : img.titleSv}" />
      <div class="gallery-card-title">${currentLang === 'en' ? img.titleEn : img.titleSv}</div>
    </div>
  `).join('');
  document.getElementById('galleryModal').style.display = 'flex';
}

function closeGalleryModal() {
  document.getElementById('galleryModal').style.display = 'none';
  activeGalleryTargetBtn = null;
}

function selectGalleryImage(url) {
  if (activeGalleryTargetBtn) {
    const cardImg = activeGalleryTargetBtn.closest('.lk-photo-card')?.querySelector('.newsletter-img');
    if (cardImg) {
      pushUndoState();
      cardImg.src = url;
      isCanvasEdited = true;
      autoSaveCanvas();
      showToast(currentLang === 'en' ? '🖼️ Gallery photo selected!' : '🖼️ Outlook-säker bild vald!');
    }
  }
  closeGalleryModal();
}

// Local image downscaling
function handleLocalImageUpload(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const offCanvas = document.createElement('canvas');
        offCanvas.width = width;
        offCanvas.height = height;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedData = offCanvas.toDataURL('image/jpeg', 0.85);
        const cardImg = input.closest('.lk-photo-card').querySelector('.newsletter-img');
        if (cardImg) {
          pushUndoState();
          cardImg.src = compressedData;
          isCanvasEdited = true;
          autoSaveCanvas();
          showToast(currentLang === 'en' ? 'Photo loaded (Note: use URL/Gallery for Outlook Web)' : 'Bild inläst (Obs: använd Länk/Bildbank för Outlook Webb)');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function promptImageURL(btn) {
  const currentImg = btn.closest('.lk-photo-card').querySelector('.newsletter-img');
  const url = prompt(i18n[currentLang].prompt_url, currentImg.src);
  if (url && url.trim() !== '') {
    pushUndoState();
    currentImg.src = url.trim();
    isCanvasEdited = true;
    autoSaveCanvas();
    showToast(currentLang === 'en' ? 'Image link updated!' : 'Bildlänk uppdaterad!');
  }
}

// Dark Mode Preview Toggle
let isDarkPreview = false;

function toggleDarkPreview() {
  isDarkPreview = !isDarkPreview;
  const canvasEl = document.getElementById('emailCanvas');
  const btn = document.getElementById('btnViewDark');
  if (canvasEl) canvasEl.classList.toggle('dark-preview', isDarkPreview);
  if (btn) btn.classList.toggle('active', isDarkPreview);
  showToast(isDarkPreview
    ? (currentLang === 'en' ? '🌙 Simulated Outlook Dark Mode preview' : '🌙 Simulerad Outlook Dark Mode-visning')
    : (currentLang === 'en' ? '☀️ Light Mode preview' : '☀️ Ljust läge'));
}

// View switcher
function setCanvasView(mode) {
  const canvasEl = document.getElementById('emailCanvas');
  const btnDesk = document.getElementById('btnViewDesktop');
  const btnMob = document.getElementById('btnViewMobile');

  if (mode === 'mobile') {
    canvasEl.classList.add('mobile-view');
    btnMob.classList.add('active');
    btnDesk.classList.remove('active');
    showToast(currentLang === 'en' ? '📱 Mobile preview (375px)' : '📱 Mobilvisning (375px)');
  } else {
    canvasEl.classList.remove('mobile-view');
    btnDesk.classList.add('active');
    btnMob.classList.remove('active');
    showToast(currentLang === 'en' ? '💻 Desktop preview (600px)' : '💻 Datorvisning (600px)');
  }
}

// Presets
function applyPresetWithConfirm(name) {
  if (isCanvasEdited && !confirm(i18n[currentLang].confirm_overwrite)) return;
  pushUndoState();
  applyPreset(name);
}

function applyPreset(name) {
  currentPreset = name;
  canvas.innerHTML = '';
  let blocks = [];
  if (name === 'monthly') {
    blocks = ['header', 'welcome', 'photo', 'box_light', 'event', 'book', 'hours', 'links_strip', 'familjen', 'cta', 'signature', 'footer'];
  } else if (name === 'lblock_hero') {
    blocks = ['header', 'l_block', 'box_light', 'event', 'links_strip', 'signature', 'footer'];
  } else if (name === 'events') {
    blocks = ['header', 'photo', 'box_dark', 'event', 'book', 'links_strip', 'cta', 'signature', 'footer'];
  } else if (name === 'notice') {
    blocks = ['header', 'box_neutral', 'hours', 'links_strip', 'cta', 'signature', 'footer'];
  } else if (name === 'ven_guide') {
    blocks = ['header', 'welcome', 'photo', 'event', 'cta', 'signature', 'footer'];
  } else if (name === 'ven_event') {
    blocks = ['header', 'event', 'photo', 'cta', 'signature', 'footer'];
  }
  blocks.forEach(type => addBlockToCanvas(type, false, false));
  isCanvasEdited = false;
  const wrapper = document.querySelector('.canvas-wrapper');
  if (wrapper) wrapper.scrollTop = 0;
}

// Klarspråk & Brand Guardrail Checker
function runKlarsprakCheck() {
  const clone = canvas.cloneNode(true);
  clone.querySelectorAll('.item-controls, .editor-only-controls').forEach(el => el.remove());
  const text = clone.innerText || '';
  const issues = [];

  const rules = [
    { regex: /\bt\.ex\./gi, msgSv: 'Undvik "t.ex." — skriv "till exempel" i fulltext.', msgEn: 'Avoid "t.ex." — spell out "till exempel".' },
    { regex: /\bbl\.a\./gi, msgSv: 'Undvik "bl.a." — skriv "bland annat" i fulltext.', msgEn: 'Avoid "bl.a." — spell out "bland annat".' },
    { regex: /\bm\.m\./gi, msgSv: 'Undvik "m.m." — skriv "med mera" i fulltext.', msgEn: 'Avoid "m.m." — spell out "med mera".' },
    { regex: /\b(e-mail|mail|maila)\b/gi, msgSv: 'Skriv "e-post", "mejl" eller "mejla" i stället för "mail".', msgEn: 'Use "e-post" / "mejl" instead of "mail".' },
    { regex: /\b(websida|site)\b/gi, msgSv: 'Skriv "webbsida" eller "sajt".', msgEn: 'Use "webbsida" or "sajt".' },
    { regex: /\bskall\b/gi, msgSv: 'Skriv "ska" i stället för "skall".', msgEn: 'Use "ska" instead of "skall".' },
    { regex: /\btjänsteman\b/gi, msgSv: 'Skriv könsneutralt "tjänsteperson" i stället för "tjänsteman".', msgEn: 'Use "tjänsteperson" instead of "tjänsteman".' },
    { regex: /Landskrona Stad/g, msgSv: 'Skriv "Landskrona stad" med litet "s" i löpande text.', msgEn: 'Write "Landskrona stad" with lowercase "stad".' },
    { regex: /kl\.?\s?\d{1,2}:\d{2}/gi, msgSv: 'Använd punkt i svenska klockslag (t.ex. kl. 11.00, inte 11:00).', msgEn: 'Use a dot for Swedish times (kl. 11.00, not 11:00).' }
  ];

  rules.forEach(r => {
    const matches = text.match(r.regex);
    if (matches) {
      issues.push((currentLang === 'en' ? r.msgEn : r.msgSv) + ` ("${matches[0]}")`);
    }
  });

  if (clone.querySelector('em, i')) {
    issues.push(currentLang === 'en' ? 'Italics (<em>/<i>) detected — Landskrona stad prefers bold over italics.' : 'Kursiv text upptäckt — använd fetstil i stället för kursiv enligt riktlinjerna.');
  }

  if (canvas.innerHTML.includes('data:image/')) {
    issues.push(currentLang === 'en' ? 'Base64 local image detected — may be blocked in Outlook Web. Use Gallery or Image URL.' : 'Lokal uppladdad bild (Base64) upptäckt — kan blockeras i Outlook Webb. Använd Bildbank eller Bildlänk.');
  }

  const body = document.getElementById('klarsprakBody');
  if (issues.length === 0) {
    body.innerHTML = `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px; color: #166534; font-size: 13px;">
      <strong>✅ ${currentLang === 'en' ? 'All checks passed!' : 'Inga anmärkningar hittades!'}</strong><br>
      ${currentLang === 'en' ? 'Your email follows Landskrona Klarspråk, typography, and Outlook image guidelines.' : 'Ditt brev följer Landskrona stads regler för Klarspråk, typografi och Outlook-bilder.'}
    </div>`;
  } else {
    body.innerHTML = `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 14px; color: #92400e; font-size: 13px;">
      <strong>⚠️ ${currentLang === 'en' ? 'Suggestions found:' : 'Förslag till förbättringar:'}</strong>
      <ul style="margin: 8px 0 0 18px; line-height: 1.6;">
        ${issues.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>`;
  }
  document.getElementById('klarsprakModal').style.display = 'flex';
}

function closeKlarsprakModal() {
  document.getElementById('klarsprakModal').style.display = 'none';
}

// HTML Generator: Produces 100% Outlook compatible inline table email with Preheader & MSO Fallbacks
function generateCleanHTML() {
  const clone = canvas.cloneNode(true);
  clone.querySelectorAll('.item-controls').forEach(el => el.remove());
  clone.querySelectorAll('.drop-placeholder').forEach(el => el.remove());
  clone.querySelectorAll('.editor-only-controls').forEach(el => el.remove());
  clone.querySelectorAll('.photo-upload-controls').forEach(el => el.remove());
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
  
  let rowsHtml = '';
  const items = clone.querySelectorAll('.canvas-item');
  items.forEach(el => {
    const inner = el.innerHTML.trim();
    rowsHtml += '<tr><td style="padding-bottom: 14px;">' +
      '<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="lk-email-card" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">' +
      '<tr><td class="lk-email-card-td" style="padding: 16px 18px;">' + inner + '</td></tr>' +
      '</table>' +
      '</td></tr>';
  });

  const fontFam = currentBrand === 'ven' 
    ? "'Poppins', Arial, 'Segoe UI', sans-serif" 
    : "'Ciutadella', Arial, 'Segoe UI', sans-serif";

  const theme = getActiveTheme();
  const headerBg = currentBrand === 'ven' ? '#002438' : theme.primary;
  const accentColor = currentBrand === 'ven' ? '#F393B9' : theme.secondary;

  const preheaderText = document.getElementById('email_preheader_input')?.value.trim() || '';
  const preheaderHtml = preheaderText ? `
  <div style="display: none; font-size: 1px; color: #f4f6f8; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheaderText} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>` : '';

  return `<!DOCTYPE html>
<html lang="${currentLang}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Landskrona</title>
<style type="text/css">
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  img { -ms-interpolation-mode: bicubic; max-width: 100%; }
  table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

  @media only screen and (max-width: 600px) {
    .lk-email-body { padding: 8px 0 !important; }
    .lk-email-outer-td { padding: 0 6px !important; }
    .lk-email-container { width: 100% !important; max-width: 100% !important; }
    .lk-email-container-td { padding: 10px !important; }
    .lk-email-card-td { padding: 12px !important; }
    .lk-brand-header-td { padding: 12px 14px !important; }
    .lk-header-table, .lk-header-table tbody, .lk-header-table tr { display: block !important; width: 100% !important; }
    .lk-header-table td { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    .lk-header-badge-cell { text-align: left !important; padding-left: 0 !important; padding-top: 10px !important; }
    .lk-sig-table, .lk-sig-table tbody, .lk-sig-table tr { display: block !important; width: 100% !important; }
    .lk-sig-avatar-cell, .lk-sig-badge-cell, .lk-sig-info-cell {
      display: block !important; width: 100% !important; box-sizing: border-box !important;
      padding-left: 0 !important; padding-right: 0 !important; border-right: none !important;
    }
    .lk-sig-badge-cell, .lk-sig-info-cell { padding-top: 10px !important; }
    .lk-crest-cell { display: none !important; width: 0 !important; }
    .lk-hours-table td { display: block !important; width: 100% !important; padding: 2px 0 !important; }
    .lk-hours-table td.strong { padding-top: 6px !important; }
    .lk-btn-link { display: block !important; text-align: center !important; padding-left: 16px !important; padding-right: 16px !important; }
    .lk-book-card td { display: block !important; width: 100% !important; padding-right: 0 !important; }
    .book-cover-cell { padding-bottom: 10px !important; }
  }

  @media (prefers-color-scheme: dark) {
    .lk-email-body, .lk-email-outer { background-color: #0f172a !important; color: #f1f5f9 !important; }
    .lk-email-container { background-color: #1e293b !important; border-color: #334155 !important; }
    .lk-email-card { background-color: #1e293b !important; border-color: #334155 !important; }
    .lk-email-card p, .lk-email-card div, .lk-email-card td, .lk-email-card span, .lk-email-card strong { color: #e2e8f0 !important; }
    .lk-email-card a { color: #93c5fd !important; }
    .lk-brand-header, .lk-brand-header-td, .lk-box-dark { background-color: ${headerBg} !important; }
    .lk-brand-title, .lk-brand-sub { color: #ffffff !important; }
    .lk-tag { background-color: ${accentColor} !important; color: ${headerBg} !important; }
    .lk-event-card, .lk-hours-card, .lk-book-card, .lk-familjen-bar, .lk-box-light, .lk-box-neutral, .lk-links-strip {
      background-color: #263346 !important; border-color: #3b4b63 !important;
    }
    .lk-familjen-bar h4, .lk-hours-title, .lk-event-meta, .lk-sig-role { color: ${accentColor} !important; }
    .lk-event-title, .lk-book-title, .lk-sig-name, .lk-footer-text strong { color: #f8fafc !important; }
    .lk-caption, .lk-book-author, .lk-sig-meta, .lk-footer-text, .lk-footer-text p { color: #cbd5e1 !important; }
    .lk-stad-footer { border-top-color: #334155 !important; }
    .lk-crest-img { filter: brightness(0) invert(1) !important; opacity: 0.22 !important; }
    .lk-btn-link { color: #ffffff !important; }
  }

  [data-ogsb] .lk-email-body, [data-ogsb] .lk-email-outer { background-color: #0f172a !important; }
  [data-ogsb] .lk-email-container, [data-ogsb] .lk-email-card { background-color: #1e293b !important; border-color: #334155 !important; }
  [data-ogsb] .lk-brand-header, [data-ogsb] .lk-brand-header-td, [data-ogsb] .lk-box-dark { background-color: ${headerBg} !important; }
  [data-ogsb] .lk-event-card, [data-ogsb] .lk-hours-card, [data-ogsb] .lk-book-card, [data-ogsb] .lk-familjen-bar,
  [data-ogsb] .lk-box-light, [data-ogsb] .lk-box-neutral, [data-ogsb] .lk-links-strip {
    background-color: #263346 !important; border-color: #3b4b63 !important;
  }
  [data-ogsc] .lk-email-card p, [data-ogsc] .lk-email-card div, [data-ogsc] .lk-email-card td, [data-ogsc] .lk-email-card strong { color: #e2e8f0 !important; }
  [data-ogsc] .lk-email-card a { color: #93c5fd !important; }
  [data-ogsc] .lk-brand-title, [data-ogsc] .lk-brand-sub, [data-ogsc] .lk-btn-link { color: #ffffff !important; }
  [data-ogsc] .lk-familjen-bar h4, [data-ogsc] .lk-hours-title, [data-ogsc] .lk-event-meta, [data-ogsc] .lk-sig-role {
    color: ${accentColor} !important;
  }
  [data-ogsc] .lk-event-title, [data-ogsc] .lk-book-title, [data-ogsc] .lk-sig-name, [data-ogsc] .lk-footer-text strong { color: #f8fafc !important; }
</style>
<!--[if mso]>
<style type="text/css">
  body, table, td, p, a, div { font-family: Arial, sans-serif !important; }
</style>
<![endif]-->
</head>
<body class="lk-email-body" style="margin: 0; padding: 24px 0; background-color: #f4f6f8; font-family: ${fontFam}; color: #1f2937;">
${preheaderHtml}
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="lk-email-outer" style="background-color: #f4f6f8;">
  <tr>
    <td align="center" class="lk-email-outer-td" style="padding: 0 10px;">
      <!--[if (gte mso 9)|(IE)]>
      <table width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td>
      <![endif]-->
      <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="20" class="lk-email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; border: 1px solid #d2d6dc; text-align: left; box-shadow: 0 4px 6px rgba(0,0,0,0.04);">
        <tr>
          <td class="lk-email-container-td">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              ${rowsHtml}
            </table>
          </td>
        </tr>
      </table>
      <!--[if (gte mso 9)|(IE)]>
      </td></tr></table>
      <![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`;
}

// Copy Full Email for Outlook
async function copyEmailHTML() {
  const fullHtml = generateCleanHTML();
  const hasBase64 = fullHtml.includes('data:image/');
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([fullHtml], { type: 'text/html' });
      const blobText = new Blob([fullHtml], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        })
      ]);
      showToast(hasBase64 ? i18n[currentLang].email_copied_base64_warn : i18n[currentLang].email_copied);
    } else {
      openPreviewModal();
    }
  } catch (err) {
    openPreviewModal();
  }
}

// Download .eml Draft File
function downloadEmlDraft() {
  const htmlContent = generateCleanHTML();
  const subject = document.getElementById('email_subject_input')?.value.trim() || 
    (currentBrand === 'ven' 
      ? (currentLang === 'en' ? 'Culture & Events in Landskrona Ven' : 'Kulturtips & Evenemang i Landskrona Ven')
      : (currentLang === 'en' ? 'Newsletter from Landskrona Public Library' : 'Nyhetsbrev från Landskrona stadsbibliotek'));
  
  const from = `${userProfile.name} <${userProfile.email}>`;
  const boundary = '----=_NextPart_' + Math.random().toString(36).substring(2);

  const emlData = [
    'X-Unsent: 1',
    'Subject: ' + subject,
    'From: ' + from,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    '',
    '--' + boundary,
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    'Vänligen öppna detta mail i en e-postklient med stöd för HTML (t.ex. Outlook).',
    '',
    '--' + boundary,
    'Content-Type: text/html; charset="utf-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlContent,
    '',
    '--' + boundary + '--'
  ].join('\r\n');

  const blob = new Blob([emlData], { type: 'message/rfc822' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Landskrona_Epost_Utkast.eml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  
  showToast(currentLang === 'en' ? '✉️ .eml draft downloaded! Double-click to open in Outlook.' : '✉️ .eml-utkast nedladdat! Dubbelklicka för att öppna i Outlook.');
}

// Copy Signature Only for Outlook
async function copySignatureOnly() {
  const sigEl = canvas.querySelector('[data-type="signature"]');
  let sigHtml = '';
  if (sigEl) {
    const clone = sigEl.cloneNode(true);
    clone.querySelectorAll('.item-controls, .editor-only-controls').forEach(el => el.remove());
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    sigHtml = clone.innerHTML;
  } else {
    sigHtml = getTemplates().signature;
  }

  const fullSig = '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif; color: #1f2937;">' + sigHtml + '</table>';

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([fullSig], { type: 'text/html' });
      const blobText = new Blob([fullSig], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        })
      ]);
      showToast(i18n[currentLang].sig_copied);
    } else {
      prompt(currentLang === 'en' ? 'Copy your HTML signature:' : 'Kopiera din HTML-signatur:', fullSig);
    }
  } catch (err) {
    showToast('Error copying signature');
  }
}

// Profile Modal Functions
function openProfileModal() {
  document.getElementById('prof_name').value = userProfile.name;
  document.getElementById('prof_title').value = userProfile.title;
  document.getElementById('prof_dept').value = userProfile.dept;
  document.getElementById('prof_phone').value = userProfile.phone;
  document.getElementById('prof_mobile').value = userProfile.mobile;
  document.getElementById('prof_email').value = userProfile.email;
  const photoInput = document.getElementById('prof_photo');
  if (photoInput) photoInput.value = userProfile.photo || '';
  document.getElementById('profileModal').style.display = 'flex';
}

function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}

function saveProfile() {
  userProfile.name = document.getElementById('prof_name').value.trim() || 'Anna Lindström';
  userProfile.title = document.getElementById('prof_title').value.trim() || 'Bibliotekarie';
  userProfile.dept = document.getElementById('prof_dept').value.trim() || 'Landskrona stadsbibliotek';
  userProfile.phone = document.getElementById('prof_phone').value.trim() || '0418-47 35 12';
  userProfile.mobile = document.getElementById('prof_mobile').value.trim();
  userProfile.email = document.getElementById('prof_email').value.trim() || 'anna.lindstrom@landskrona.se';
  const photoInput = document.getElementById('prof_photo');
  userProfile.photo = photoInput ? photoInput.value.trim() : '';

  try {
    localStorage.setItem('lk_email_profile', JSON.stringify(userProfile));
  } catch (e) {}

  closeProfileModal();
  // Update signature blocks in place without wiping rest of email
  const sigEl = canvas.querySelector('[data-type="signature"]');
  if (sigEl) {
    pushUndoState();
    const newSig = createBlockElement('signature');
    sigEl.replaceWith(newSig);
    autoSaveCanvas();
  }
  showToast(i18n[currentLang].profile_saved);
}

// Modal View Source
function openPreviewModal() {
  document.getElementById('rawHtmlText').value = generateCleanHTML();
  document.getElementById('exportModal').style.display = 'flex';
}

function closePreviewModal() {
  document.getElementById('exportModal').style.display = 'none';
}

function copyModalCode() {
  const textarea = document.getElementById('rawHtmlText');
  textarea.select();
  navigator.clipboard.writeText(textarea.value);
  showToast(i18n[currentLang].code_copied);
  closePreviewModal();
}

// Language Switching
function setLanguage(lang, syncCanvas = true) {
  const prevLang = currentLang;
  currentLang = lang;
  document.getElementById('btnLangSv').classList.toggle('active', lang === 'sv');
  document.getElementById('btnLangEn').classList.toggle('active', lang === 'en');
  updateUIStrings();
  renderSidebar();
  renderPresetButtons();
  syncDefaultMetaInputs();

  if (syncCanvas && prevLang !== lang && canvas) {
    if (!isCanvasEdited || confirm(lang === 'en' ? 'Switch the template content to English too?' : 'Vill du även byta språk på mallens innehåll till svenska?')) {
      applyPreset(currentPreset || (currentBrand === 'ven' ? 'ven_guide' : 'monthly'));
    }
  }
}

function syncDefaultMetaInputs() {
  const subj = document.getElementById('email_subject_input');
  const pre = document.getElementById('email_preheader_input');
  if (!subj || !pre) return;
  const svSubj = 'Nyhetsbrev från Landskrona stadsbibliotek';
  const enSubj = 'Newsletter from Landskrona Public Library';
  const svPre = 'Upptäck månadens författarbesök, sagostunder och boknyheter.';
  const enPre = 'Discover this month\'s author visits, storytimes, and new book arrivals.';
  if (subj.value === svSubj || subj.value === enSubj) {
    subj.value = currentLang === 'en' ? enSubj : svSubj;
  }
  if (pre.value === svPre || pre.value === enPre) {
    pre.value = currentLang === 'en' ? enPre : svPre;
  }
}

function updateUIStrings() {
  const t = i18n[currentLang];
  const isVen = currentBrand === 'ven';
  const brandTitle = isVen
    ? 'Landskrona <span>Ven</span>'
    : (currentLang === 'en' ? 'Landskrona <span>Public Library</span>' : 'Landskrona <span>stadsbibliotek</span>');
  const brandDesc = isVen
    ? (currentLang === 'en' ? 'Place brand & visitor guide for Landskrona & Ven' : 'Turist- & platsvarumärke för Landskrona & Ven')
    : (currentLang === 'en' ? 'Official Email & Newsletter Creator for Staff' : 'Officiell e-post- & nyhetsbrevsbyggare för personal');

  document.getElementById('ui_brand_title').innerHTML = brandTitle;
  document.getElementById('ui_brand_desc').innerText = brandDesc;
  document.getElementById('ui_btn_clear').innerText = t.btn_clear;
  document.getElementById('ui_btn_undo').innerText = t.btn_undo;
  document.getElementById('ui_btn_klarsprak').innerText = t.btn_klarsprak;
  document.getElementById('ui_btn_sig').innerText = t.btn_sig;
  document.getElementById('ui_btn_profile').innerText = t.btn_profile;
  document.getElementById('ui_btn_save_tpl').innerText = t.btn_save_tpl;
  const sbBtn = document.getElementById('ui_btn_sidebar');
  if (sbBtn) sbBtn.innerText = sidebarCollapsed ? (currentLang === 'en' ? 'Show Blocks' : 'Visa block') : (currentLang === 'en' ? 'Hide Blocks' : 'Dölj block');
  document.getElementById('ui_btn_viewhtml').innerText = t.btn_viewhtml;
  const emlBtn = document.getElementById('ui_btn_eml');
  if (emlBtn) emlBtn.innerText = t.btn_eml;
  document.getElementById('ui_btn_copy').innerText = t.btn_copy;
  document.getElementById('ui_sidebar_title').innerText = t.sidebar_title;
  document.getElementById('ui_sidebar_desc').innerText = t.sidebar_desc;
  document.getElementById('ui_presets_label').innerText = t.presets_label;
  document.getElementById('ui_modal_title').innerText = t.modal_title;
  document.getElementById('ui_modal_desc').innerText = t.modal_desc;
  document.getElementById('ui_modal_btn_close').innerText = t.modal_close;
  document.getElementById('ui_modal_btn_copy').innerText = t.modal_copy;

  const lblProf = document.getElementById('ui_lbl_profile');
  if (lblProf) lblProf.innerText = currentLang === 'en' ? 'Profile:' : 'Profil:';
  const lblHarm = document.getElementById('ui_lbl_harmony');
  if (lblHarm) lblHarm.innerText = currentLang === 'en' ? 'Harmony:' : 'Harmoni:';
  const lblSubj = document.getElementById('ui_lbl_subject');
  if (lblSubj) lblSubj.innerText = currentLang === 'en' ? 'Subject:' : 'Ämnesrad:';
  const lblPre = document.getElementById('ui_lbl_preheader');
  if (lblPre) lblPre.innerText = currentLang === 'en' ? 'Preheader:' : 'Förhandstitt:';
  const btnDesk = document.getElementById('btnViewDesktop');
  if (btnDesk) btnDesk.innerText = currentLang === 'en' ? '💻 Desktop (600px)' : '💻 Dator (600px)';
  const btnMob = document.getElementById('btnViewMobile');
  if (btnMob) btnMob.innerText = currentLang === 'en' ? '📱 Mobile (375px)' : '📱 Mobil (375px)';
  const btnDark = document.getElementById('btnViewDark');
  if (btnDark) btnDark.innerText = currentLang === 'en' ? '🌙 Dark Mode' : '🌙 Mörkt läge';

  // Translate Modals
  const isEn = currentLang === 'en';
  const setTxt = (id, en, sv) => { const el = document.getElementById(id); if (el) el.innerText = isEn ? en : sv; };
  setTxt('ui_profile_title', 'My Staff Profile & Signature', 'Min personalprofil & signatur');
  setTxt('ui_profile_desc', 'Fill in your details and all email signatures will update automatically.', 'Fyll i dina uppgifter så uppdateras alla e-postsignaturer och kontaktuppgifter i dina mail automatiskt.');
  setTxt('lbl_prof_name', 'Full Name', 'För- & efternamn');
  setTxt('lbl_prof_title', 'Job Title', 'Titel / Befattning');
  setTxt('lbl_prof_dept', 'Department / Library', 'Verksamhet / Avdelning');
  setTxt('lbl_prof_phone', 'Direct Phone', 'Direkttelefon');
  setTxt('lbl_prof_mobile', 'Mobile Phone (optional)', 'Mobiltelefon (valfri)');
  setTxt('lbl_prof_email', 'Email Address', 'E-postadress');
  setTxt('lbl_prof_photo', 'Signature Portrait Photo (optional HTTPS URL)', 'Porträttfoto i signatur (valfri HTTPS-länk)');
  setTxt('ui_prof_btn_cancel', 'Cancel', 'Avbryt');
  setTxt('ui_prof_btn_save', '💾 Save Details', '💾 Spara uppgifter');
  setTxt('ui_gallery_title', '🖼️ Library Image Gallery (Outlook-Safe)', '🖼️ Bibliotekets bildbank (Outlook-säkra bilder)');
  setTxt('ui_gallery_desc', 'These HTTPS images load reliably in Outlook Desktop, Outlook Web (O365), and Gmail.', 'Dessa bilder laddas via HTTPS och fungerar alltid i Outlook Desktop, Outlook Webb (O365) och Gmail.');
  setTxt('ui_gallery_btn_close', 'Close', 'Stäng');
  setTxt('ui_klarsprak_title', '✓ Klarspråk & Brand Guidelines Check', '✓ Kontroll av Klarspråk & varumärkesregler');
}

// Restore auto-saved draft if present
function tryRestoreDraft() {
  try {
    const backup = localStorage.getItem('lk_email_draft_backup');
    if (backup) {
      const parsed = JSON.parse(backup);
      if (parsed.html && parsed.html.length > 50) {
        canvas.innerHTML = parsed.html;
        if (parsed.subject && document.getElementById('email_subject_input')) {
          document.getElementById('email_subject_input').value = parsed.subject;
        }
        if (parsed.preheader && document.getElementById('email_preheader_input')) {
          document.getElementById('email_preheader_input').value = parsed.preheader;
        }
        reattachDragHandlers();
        return true;
      }
    }
  } catch (e) {}
  return false;
}

// Initialize Application
applyThemeVariables();
setLanguage('sv');
if (!tryRestoreDraft()) {
  applyPreset('monthly');
}
