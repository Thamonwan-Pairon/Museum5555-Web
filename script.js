/**
 * GRURU MUSEUM - JAVASCRIPT LOGIC (Script.jss / script.js)
 * Features:
 *  - Web Audio API Sound Synthesizer (Zero external dependencies)
 *  - Theme Engine (Dark Lab / Archive Paper Light)
 *  - Navigation & Mobile Drawer Controller
 *  - Exhibitions Filter & Live Search
 *  - Data Booming Simulator (40ms Staggered Radial Burst)
 *  - Interactive Knowledge Graph (Canvas Network with Physics/Interactions)
 *  - Specimen Detail Modal & Takeaway Clipboard Exporter
 */

if (window.__GRURU_INIT__) {
  // Already initialized
} else {
  window.__GRURU_INIT__ = true;

  function initGruruApp() {
  // -------------------------------------------------------------------------
  // 1. WEB AUDIO API SYNTHESIZER
  // -------------------------------------------------------------------------
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.08) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  function playUiClick() {
    playTone(680, 'sine', 0.06, 0.05);
  }

  function playBoomSound(step = 0) {
    const baseFreq = 220 + step * 40;
    playTone(baseFreq, 'triangle', 0.12, 0.07);
  }

  // Audio Toggle Button
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      soundToggleBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
      soundToggleBtn.setAttribute('title', isSoundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์');
      if (isSoundEnabled) playUiClick();
    });
  }

  // Attach sound to common interactive elements
  document.querySelectorAll('button, .nav-link, .filter-btn, .tab-btn').forEach(el => {
    el.addEventListener('click', () => playUiClick());
  });

  // -------------------------------------------------------------------------
  // 2. THEME CONTROLLER (Dark Void vs Archive Paper Light)
  // -------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('gruru_theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      themeToggleBtn.textContent = isLight ? '🌙' : '☀️';
      localStorage.setItem('gruru_theme', isLight ? 'light' : 'dark');
      // Redraw canvas graph with adapted colors
      if (typeof drawGraph === 'function') drawGraph();
    });
  }

  // -------------------------------------------------------------------------
  // 3. NAVIGATION & MOBILE DRAWER
  // -------------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Active section spy on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      const secHeight = sec.offsetHeight;
      if (scrollY >= secTop && scrollY < secTop + secHeight) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 4. EXHIBITIONS DATA & FILTER & SEARCH
  // -------------------------------------------------------------------------
  const exhibitionData = [
    {
      id: 'GRM-1872-SCI-014',
      title: 'สุริยุปราคาหว้ากอ & การคำนวณดาราศาสตร์สยาม',
      category: 'sci',
      categoryName: 'วิทยาศาสตร์และดาราศาสตร์',
      categoryClass: 'pill-sci',
      era: 'รัตนโกสินทร์ (พ.ศ. 2411)',
      image: 'ChatGPT Image Oct 8, 2026, 09_53_35 PM-4.png',
      summary: 'การคำนวณตำแหน่งสุริยุปราคาล่วงหน้า 2 ปีอย่างแม่นยำด้วยการผสานคณิตศาสตร์สากลกับปูมดาราศาสตร์ไทย เป็นหมุดหมายสำคัญของวิทยาศาสตร์เชิงประจักษ์',
      takeaway: 'Empirical Thinking: การตัดสินใจบนข้อมูลเชิงประจักษ์และการคำนวณที่พิสูจน์ได้ ท่ามกลางกระแสน้ำท่วมข้อมูลและข่าวปลอมในชีวิตประจำวัน',
      source: 'หอจดหมายเหตุแห่งชาติ / พระราชพงศาวดารรัชกาลที่ 4',
      details: 'พระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัวทรงใช้สมการคณิตศาสตร์และดาราศาสตร์สากลคำนวณพิกัดตำบลหว้ากอ เมืองประจวบคีรีขันธ์ ได้อย่างแม่นยำล่วงหน้าถึง 2 ปี สะท้อนถึงการปฏิเสธความงมงายและยึดมั่นในกระบวนการทางวิทยาศาสตร์'
    },
    {
      id: 'GRM-1782-TECH-008',
      title: 'วิศวกรรมชลประทาน & ผังเมืองคลองพระนคร',
      category: 'tech',
      categoryName: 'เทคโนโลยีและวิศวกรรม',
      categoryClass: 'pill-tech',
      era: 'ต้นกรุงรัตนโกสินทร์',
      image: 'ChatGPT Image Oct 8, 2026, 09_53_33 PM-2.png',
      summary: 'โครงข่ายคูคลองรอบพระนครไม่เพียงป้องกันข้าศึก แต่คือระบบลอจิสติกส์ระบายน้ำและการระบายน้ำหลาก (Flow Architecture) ที่ชาญฉลาด',
      takeaway: 'Flow Architecture: การจัดระเบียบงานและข้อมูลให้ไหลลื่นเป็นโครงข่าย แทนที่จะปล่อยให้เป็นคอขวด (Bottleneck)',
      source: 'กรมแผนที่ทหาร / จดหมายเหตุความทรงจำกรุงรัตนโกสินทร์',
      details: 'โครงข่ายแม่น้ำลำคลองเชื่อมต่อระหว่างแม่น้ำเจ้าพระยาผ่านคูเมืองและคลองหลอด ออกแบบตามทิศทางการไหลของน้ำทะเลหนุนและการระบายน้ำหลาก ทำหน้าที่เป็นทั้งเส้นทางสัญจร คมนาคม และการป้องกันน้ำท่วมอย่างยั่งยืน'
    },
    {
      id: 'GRM-1851-CULT-021',
      title: 'ภูมิปัญญาการบันทึกใบลานสู่โครงสร้างคลาวด์',
      category: 'cult',
      categoryName: 'วัฒนธรรมและภูมิปัญญา',
      categoryClass: 'pill-cult',
      era: 'อยุธยา - รัตนโกสินทร์',
      image: 'ChatGPT Image Oct 8, 2026, 09_53_32 PM-1.png',
      summary: 'เทคนิคการย้อมขมิ้นน้ำมันยางเพื่อกันแมลงและระบบจัดหมวดหมู่คัมภีร์ใบลานด้วยเชือกสนอง (Cataloging Metadata) ที่มีอายุกว่า 500 ปี',
      takeaway: 'Metadata Tagging: จัดหมวดหมู่ไฟล์และชีวิตด้วยระบบแท็กมาตรฐาน เพื่อให้ข้อมูลในอนาคตถูกค้นหาเจอใน 1 วินาที',
      source: 'หอสมุดแห่งชาติ / กองวรรณกรรมและประวัติศาสตร์',
      details: 'คัมภีร์ใบลานถูกรักษาผ่านกาลเวลาด้วยเทคนิคทางเคมีธรรมชาติและการสลักอักษรด้วยเหล็กจาร จากนั้นผูกร้อยด้วยสายสนองที่มีป้ายกำกับบอกหมวดหมู่ เปรียบได้กับ Header Metadata ในโครงสร้างฐานข้อมูลดิจิทัลยุคใหม่'
    },
    {
      id: 'GRM-1905-BIO-003',
      title: 'การสกัดสารออกฤทธิ์สมุนไพรตามจารึกวัดโพธิ์',
      category: 'bio',
      categoryName: 'ธรรมชาติและเภสัชกรรม',
      categoryClass: 'pill-bio',
      era: 'รัชกาลที่ 3 - ปัจจุบัน',
      image: 'ChatGPT Image Oct 8, 2026, 09_53_34 PM-3.png',
      summary: 'การถอดรหัสตำรับยาสมุนไพรไทย 1,080 ขนานในจารึกวัดโพธิ์ ด้วยเคมีสารสกัดสมัยใหม่ พบสารต้านการอักเสบและสารต้านอนุมูลอิสระตรงตามสรรพคุณโบราณ',
      takeaway: 'Preventive Nutrition: กินอาหารเป็นยาตามฤดูกาลและสมดุลร่างกาย ลดค่าใช้จ่ายด้านสุขภาพในระยะยาว',
      source: 'ยูเนสโก มรดกความทรงจำแห่งโลก / คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย',
      details: 'ศิลาจารึกวัดพระเชตุพนฯ ได้รับการขึ้นทะเบียนเป็นมรดกความทรงจำแห่งโลก บันทึกตำรับยาบำบัดโรคและท่าฤๅษีดัดตนที่ปัจจุบันถูกนำมาวิจัยสกัดสารออกฤทธิ์ทางเภสัชศาสตร์จนเกิดเป็นผลิตภัณฑ์เพื่อสุขภาพระดับสากล'
    },
    {
      id: 'GRM-1920-HIST-017',
      title: 'สถาปัตยกรรมเรือนไทย & การปรับสมดุลความร้อน',
      category: 'hist',
      categoryName: 'ประวัติศาสตร์และสถาปัตยกรรม',
      categoryClass: 'pill-hist',
      era: 'สถาปัตยกรรมพื้นถิ่นลุ่มน้ำเจ้าพระยา',
      image: 'gruru_exhibition_bright.jpg',
      summary: 'การยกใต้ถุนสูง ชานเรือนเปิดโล่ง หลังคาจั่วสูงระบายความร้อน และฝาปะกนลาดเอียง ถือเป็นสุดยอดนวัตกรรม Passive Cooling แบบไม่ต้องพึ่งพลังงานไฟฟ้า',
      takeaway: 'Passive Cooling: เทคนิคเปิดรับลมธรรมชาติและการบังแดดในที่อยู่อาศัยเพื่อลดค่าไฟฟ้าได้ถึง 20-30%',
      source: 'สมาคมสถาปนิกสยามในพระบรมราชูปถัมภ์',
      details: 'เรือนไทยโบราณออกแบบโดยคำนึงถึงทิศทางแดดและลมมรสุม การยกใต้ถุนสูงช่วยให้น้ำหลากผ่านได้สะดวก และเกิดกระแสลมหมุนเวียนใต้ชานเรือนระบายความร้อนขึ้นสู่ยอดจั่วที่มีช่องระบายอากาศ'
    },
    {
      id: 'GRM-2026-FUTR-099',
      title: 'Future Archaeology: ห้องแล็บภัณฑารักษ์ยุค AI',
      category: 'tech',
      categoryName: 'อนาคตและปัญญาประดิษฐ์',
      categoryClass: 'pill-tech',
      era: 'ศตวรรษที่ 21 - ศตวรรษที่ 22',
      image: 'ChatGPT Image Oct 8, 2026, 09_53_38 PM-6.png',
      summary: 'เมื่อภัณฑารักษ์จากอนาคตใช้ Knowledge Graph เชื่อมโยงจดหมายเหตุกับเทคโนโลยี Big Data เพื่อสร้างระบบ Single Source of Truth ให้กับปัญญาประดิษฐ์',
      takeaway: 'Information Synthesis: ฝึกทักษะการเชื่อมโยงความรู้ข้ามสายงาน (Cross-disciplinary) เพื่อไม่ให้ถูกแทนที่ด้วยเครื่องจักร',
      source: 'GRURU Museum Lab / Future Knowledge Initiative 2026',
      details: 'การสังเคราะห์ความรู้ในศตวรรษหน้าต้องพึ่งพาการดึงข้อมูลที่มีหลักฐานประจักษ์ (Ground Truth) มาฝึกสอนโมเดล AI เพื่อให้คำตอบที่ซื่อตรงต่อประวัติศาสตร์และสร้างคุณค่าจริงต่อชีวิตมนุษย์'
    }
  ];

  const exhibitionsContainer = document.getElementById('exhibitionsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchExhibitions');

  function renderExhibitions(items) {
    if (!exhibitionsContainer) return;
    if (items.length === 0) {
      exhibitionsContainer.innerHTML = `
        <div style="grid-column: 1/-1; padding: 60px 20px; text-align: center; color: var(--gr-fog);">
          <div style="font-family: var(--font-mono); font-size: 18px; margin-bottom: 8px;">[ ชิ้นส่วนนี้ยังไม่ถูกค้นพบ // NO SPECIMENS FOUND ]</div>
          <p style="font-size: 14px;">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่อีกครั้ง</p>
        </div>
      `;
      return;
    }

    exhibitionsContainer.innerHTML = items.map(item => `
      <article class="specimen-card" data-category="${item.category}" data-id="${item.id}">
        <div class="specimen-thumb-box">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <span class="specimen-era-badge">${item.era}</span>
        </div>
        <div class="specimen-body">
          <div class="specimen-meta">
            <span class="specimen-label">
              <span class="dot"></span>
              <span>${item.id}</span>
            </span>
            <span class="category-pill ${item.categoryClass}">${item.categoryName}</span>
          </div>
          <h3 class="specimen-title">${item.title}</h3>
          <p class="specimen-summary">${item.summary}</p>
          <div class="everyday-takeaway-box">
            <div class="takeaway-tag">⚡ EVERYDAY TAKEAWAY</div>
            <div class="takeaway-text">${item.takeaway}</div>
          </div>
          <div class="card-action-bar">
            <span class="mono" style="font-size: 11px; color: var(--gr-fog);">SRC: ${item.source.split('/')[0]}</span>
            <button class="btn-decode" onclick="openSpecimenModal('${item.id}')">
              <span>DECODE (อ่านเจาะลึก)</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Initial render
  renderExhibitions(exhibitionData);

  // Filter functionality
  let currentFilter = 'all';
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      applyFilterAndSearch();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilterAndSearch();
    });
  }

  function applyFilterAndSearch() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const filtered = exhibitionData.filter(item => {
      const matchCat = (currentFilter === 'all') || (item.category === currentFilter);
      const matchQuery = !query || 
        item.title.toLowerCase().includes(query) || 
        item.summary.toLowerCase().includes(query) || 
        item.id.toLowerCase().includes(query) ||
        item.takeaway.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
    renderExhibitions(filtered);
  }

  // -------------------------------------------------------------------------
  // 5. HALL 02 TABS (Data Booming vs Knowledge Graph)
  // -------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
        if (targetId === 'tab-graph') {
          // Trigger canvas resize
          setTimeout(initGraphCanvas, 50);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // 6. DATA BOOMING SIMULATOR (Radial Burst at 40ms interval)
  // -------------------------------------------------------------------------
  const boomingTopics = {
    siam_reform: {
      center: 'การปฏิรูปข้อมูลสยามสู่ยุคดิจิทัล',
      centerTag: 'GRM-CORE-ROOT-001',
      children: [
        { title: 'ดาราศาสตร์หว้ากอ (พ.ศ. 2411)', cat: 'วิทยาศาสตร์', color: '#2EE6FF', takeaway: 'การตัดสินใจบนหลักฐานเชิงประจักษ์' },
        { title: 'ผังเมืองคลองพระนคร', cat: 'วิศวกรรม', color: '#8C6BFF', takeaway: 'Flow Architecture ไร้คอขวด' },
        { title: 'สารบรรณใบลานสู่ Metadata', cat: 'วัฒนธรรม', color: '#FFC233', takeaway: 'การจัดแท็กข้อมูลเพื่อการค้นหาฉับไว' },
        { title: 'ตำรับโอสถศิลาจารึกวัดโพธิ์', cat: 'ชีววิทยา', color: '#34E89E', takeaway: 'การกินเพื่อป้องกันโรคเชิงรุก' },
        { title: 'สถาปัตยกรรมเรือนไทยเย็นสบาย', cat: 'ประวัติศาสตร์', color: '#FF5A1F', takeaway: 'Passive Cooling ประหยัดพลังงาน' },
        { title: 'การทำแผนที่สยามยุคต้น', cat: 'เทคโนโลยี', color: '#8C6BFF', takeaway: 'Spatial Thinking มองภาพรวมเชิงพื้นที่' },
        { title: 'การถนอมอาหารหมักดองพื้นถิ่น', cat: 'ชีววิทยา', color: '#34E89E', takeaway: 'จุลินทรีย์ Probiotics เสริมภูมิคุ้มกัน' },
        { title: 'ระบบชั่งตวงวัดโบราณสู่ ISO', cat: 'วิทยาศาสตร์', color: '#2EE6FF', takeaway: 'การสร้าง Standard Metric ในทีมงาน' }
      ]
    },
    herb_tech: {
      center: 'พฤกษศาสตร์สมุนไพร & เทคโนโลยีอาหาร',
      centerTag: 'GRM-CORE-ROOT-002',
      children: [
        { title: 'ขมิ้นชัน & สาร Curcuminoids', cat: 'วิทยาศาสตร์', color: '#2EE6FF', takeaway: 'ต้านการอักเสบระดับเซลล์' },
        { title: 'ฟ้าทะลายโจร & ภูมิคุ้มกัน', cat: 'ชีววิทยา', color: '#34E89E', takeaway: 'ดักจับไวรัสในระยะเริ่มต้น' },
        { title: 'การบ่มน้ำปลาแท้โบราณ', cat: 'วัฒนธรรม', color: '#FFC233', takeaway: 'Amino Acids ธรรมชาติทดแทนผงปรุงรส' },
        { title: 'ดินสอพองกรองพิษแดด', cat: 'ประวัติศาสตร์', color: '#FF5A1F', takeaway: 'แร่ธาตุธรรมชาติบำรุงผิว' },
        { title: 'ระบบอบแห้งพลังแสงอาทิตย์', cat: 'เทคโนโลยี', color: '#8C6BFF', takeaway: 'ถนอมอาหารแบบ Zero Carbon' },
        { title: 'น้ำต้มสมุนไพรแก้ร้อนใน', cat: 'ชีววิทยา', color: '#34E89E', takeaway: 'ปรับสมดุลอุณหภูมิร่างกาย' }
      ]
    }
  };

  let currentTopicKey = 'siam_reform';
  let isBoomed = false;

  const boomingContainer = document.getElementById('boomingWorkspaceBox');
  const boomingSvg = document.getElementById('boomingSvgLines');
  const boomCenterNode = document.getElementById('boomingCenterNode');
  const boomStatusBadge = document.getElementById('boomingStatusBadge');
  const boomCounter = document.getElementById('boomingCounter');
  const boomResetBtn = document.getElementById('boomingResetBtn');
  const boomTopicSelect = document.getElementById('boomingTopicSelect');

  function triggerDataBooming() {
    if (isBoomed || !boomingContainer || !boomingSvg) return;
    isBoomed = true;

    const topic = boomingTopics[currentTopicKey];
    const rect = boomingContainer.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.72;

    if (boomStatusBadge) {
      boomStatusBadge.textContent = `STATUS: BOOMING ACTIVE (${topic.children.length} NODES EXPLODED)`;
      boomStatusBadge.style.background = 'var(--gr-lime)';
      boomStatusBadge.style.color = '#000000';
    }

    // Explode child nodes at 40ms interval strictly according to project brief
    topic.children.forEach((child, idx) => {
      setTimeout(() => {
        const total = topic.children.length;
        const angle = (idx / total) * 2 * Math.PI - (Math.PI / 2);
        const targetX = centerX + radius * Math.cos(angle);
        const targetY = centerY + radius * Math.sin(angle);

        // Create animated SVG line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', targetX);
        line.setAttribute('y2', targetY);
        line.setAttribute('stroke', child.color);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '5,3');
        line.setAttribute('opacity', '0.7');
        boomingSvg.appendChild(line);

        // Create DOM child node
        const nodeEl = document.createElement('div');
        nodeEl.className = 'burst-child-node cut-corner-alt';
        nodeEl.style.left = `${targetX}px`;
        nodeEl.style.top = `${targetY}px`;
        nodeEl.style.transform = 'translate(-50%, -50%) scale(0.3)';
        nodeEl.innerHTML = `
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${child.color}; box-shadow:0 0 8px ${child.color};"></span>
          <span style="font-weight:600;">${child.title}</span>
        `;

        // Click to view takeaway
        nodeEl.addEventListener('click', () => {
          playTone(880, 'sine', 0.1, 0.08);
          alert(`⚡ EVERYDAY TAKEAWAY จากโหนด: [${child.title}]\n\n• หมวดหมู่: ${child.cat}\n• บทเรียนนำไปใช้จริง: ${child.takeaway}`);
        });

        boomingContainer.appendChild(nodeEl);

        // Animate entrance
        requestAnimationFrame(() => {
          nodeEl.classList.add('exploded');
          nodeEl.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // Audio chime per exploded node
        playBoomSound(idx);

        // Counter increment
        if (boomCounter) {
          boomCounter.textContent = `${idx + 2} โหนด`;
        }
      }, idx * 40); // 40ms interval per step
    });
  }

  function resetDataBooming() {
    isBoomed = false;
    if (boomingSvg) boomingSvg.innerHTML = '';
    if (boomingContainer) {
      const children = boomingContainer.querySelectorAll('.burst-child-node');
      children.forEach(c => c.remove());
    }
    if (boomStatusBadge) {
      boomStatusBadge.textContent = 'STATUS: STANDBY (READY TO BOOM)';
      boomStatusBadge.style.background = 'rgba(44, 44, 58, 0.5)';
      boomStatusBadge.style.color = 'var(--gr-fog)';
    }
    if (boomCounter) {
      boomCounter.textContent = '1 โหนด (ราก)';
    }
    playUiClick();
  }

  if (boomCenterNode) {
    boomCenterNode.addEventListener('click', triggerDataBooming);
  }
  if (boomResetBtn) {
    boomResetBtn.addEventListener('click', resetDataBooming);
  }
  if (boomTopicSelect) {
    boomTopicSelect.addEventListener('change', (e) => {
      currentTopicKey = e.target.value;
      const topic = boomingTopics[currentTopicKey];
      const titleEl = boomCenterNode.querySelector('.title');
      const tagEl = boomCenterNode.querySelector('.tag');
      if (titleEl) titleEl.textContent = topic.center;
      if (tagEl) tagEl.textContent = topic.centerTag;
      resetDataBooming();
    });
  }

  // -------------------------------------------------------------------------
  // 7. INTERACTIVE KNOWLEDGE GRAPH (CANVAS FORCE-DIRECTED SIMULATION)
  // -------------------------------------------------------------------------
  const canvas = document.getElementById('knowledgeGraphCanvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  let animId = null;
  let nodes = [];
  let links = [];
  let hoveredNode = null;
  let selectedNode = null;

  const graphData = {
    nodes: [
      { id: 'n1', label: 'ดาราศาสตร์หว้ากอ', cat: 'sci', color: '#2EE6FF', era: 'พ.ศ. 2411', takeaway: 'ตัดสินใจบนข้อมูลเชิงประจักษ์', x: 200, y: 160, r: 16 },
      { id: 'n2', label: 'ผังเมืองคลองพระนคร', cat: 'tech', color: '#8C6BFF', era: 'รัตนโกสินทร์', takeaway: 'ระบบการไหลไร้คอขวด', x: 380, y: 130, r: 18 },
      { id: 'n3', label: 'สารบรรณใบลาน', cat: 'cult', color: '#FFC233', era: 'อยุธยา', takeaway: 'แท็กข้อมูลเพื่อความเร็วในการค้น', x: 540, y: 220, r: 15 },
      { id: 'n4', label: 'ตำรับโอสถวัดโพธิ์', cat: 'bio', color: '#34E89E', era: 'รัชกาลที่ 3', takeaway: 'อาหารเป็นยาต้านโรค', x: 420, y: 350, r: 17 },
      { id: 'n5', label: 'สถาปัตยกรรมเรือนไทย', cat: 'hist', color: '#FF5A1F', era: 'พื้นถิ่น', takeaway: 'การระบายความร้อนธรรมชาติ', x: 240, y: 320, r: 19 },
      { id: 'n6', label: 'ลายรดน้ำศิลปะสยาม', cat: 'art', color: '#FF5FA2', era: 'ช่างสิบหมู่', takeaway: 'สุนทรียภาพแห่งความอดทนและประณีต', x: 120, y: 240, r: 13 },
      { id: 'n7', label: 'ระบบชลประทานเขื่อน', cat: 'tech', color: '#8C6BFF', era: 'รัชกาลที่ 5', takeaway: 'การบริหารทรัพยากรส่วนกลาง', x: 500, y: 100, r: 14 },
      { id: 'n8', label: 'การทำนาเกลือสมุทร', cat: 'sci', color: '#2EE6FF', era: 'อ่าวไทย', takeaway: 'ใช้พลังงานลมและแสงแดดแปรรูป', x: 140, y: 400, r: 13 },
      { id: 'n9', label: 'Future AI Curator', cat: 'tech', color: '#D7FF3A', era: 'ศตวรรษที่ 22', takeaway: 'การตรวจสอบแหล่งที่มาก่อนเชื่อ', x: 340, y: 240, r: 22 }
    ],
    links: [
      { source: 'n9', target: 'n1', type: 'influenced' },
      { source: 'n9', target: 'n2', type: 'derived_from' },
      { source: 'n9', target: 'n3', type: 'used_in' },
      { source: 'n9', target: 'n4', type: 'used_in' },
      { source: 'n9', target: 'n5', type: 'influenced' },
      { source: 'n1', target: 'n2', type: 'derived_from' },
      { source: 'n2', target: 'n7', type: 'derived_from' },
      { source: 'n4', target: 'n8', type: 'used_in' },
      { source: 'n5', target: 'n6', type: 'influenced' },
      { source: 'n3', target: 'n4', type: 'used_in' }
    ]
  };

  function initGraphCanvas() {
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Rescale node positions to fit canvas
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    nodes = graphData.nodes.map(n => ({
      ...n,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      targetX: cx + (n.x - 320) * (canvas.width / 700),
      targetY: cy + (n.y - 250) * (canvas.height / 500)
    }));

    nodes.forEach(n => {
      n.x = n.targetX;
      n.y = n.targetY;
    });

    links = graphData.links.map(l => ({
      source: nodes.find(n => n.id === l.source),
      target: nodes.find(n => n.id === l.target),
      type: l.type
    }));

    if (!selectedNode) {
      selectedNode = nodes.find(n => n.id === 'n9') || nodes[0];
      updateGraphSidebar(selectedNode);
    }

    if (!animId) {
      renderGraphLoop();
    }
  }

  function renderGraphLoop() {
    if (!ctx || !canvas) return;
    drawGraph();

    // Subtle floating drift
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 30 || n.x > canvas.width - 30) n.vx *= -1;
      if (n.y < 30 || n.y > canvas.height - 30) n.vy *= -1;
    });

    animId = requestAnimationFrame(renderGraphLoop);
  }

  function drawGraph() {
    if (!ctx || !canvas) return;
    const isLight = document.body.classList.contains('light-mode');

    // Clear
    ctx.fillStyle = isLight ? '#FAF8F5' : '#09090C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background subtle grid inside canvas
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Links
    links.forEach(l => {
      const isConnectedToHovered = hoveredNode && (l.source === hoveredNode || l.target === hoveredNode);
      const isConnectedToSelected = selectedNode && (l.source === selectedNode || l.target === selectedNode);

      ctx.beginPath();
      ctx.moveTo(l.source.x, l.source.y);
      ctx.lineTo(l.target.x, l.target.y);

      if (isConnectedToHovered || isConnectedToSelected) {
        ctx.strokeStyle = '#D7FF3A';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = isLight ? 'rgba(85, 85, 106, 0.25)' : 'rgba(138, 138, 158, 0.25)';
        ctx.lineWidth = 1;
        if (l.type === 'derived_from') {
          ctx.setLineDash([5, 4]);
        } else if (l.type === 'used_in') {
          ctx.setLineDash([2, 3]);
        } else {
          ctx.setLineDash([]);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw Nodes
    nodes.forEach(n => {
      const isHovered = n === hoveredNode;
      const isSelected = n === selectedNode;

      // Glow effect for selected or lime node
      if (isSelected || isHovered) {
        ctx.save();
        ctx.shadowColor = '#D7FF3A';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(215, 255, 58, 0.25)';
        ctx.fill();
        ctx.restore();
      }

      // Draw node shape
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#D7FF3A' : n.color;
      ctx.fill();
      ctx.strokeStyle = isLight ? '#FFFFFF' : '#0B0B0F';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Label below node
      ctx.font = '11px "IBM Plex Sans Thai", sans-serif';
      ctx.fillStyle = isLight ? '#12131A' : '#F2EDE3';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y + n.r + 14);
    });
  }

  // Canvas Mouse Interactions
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found = null;
      for (const n of nodes) {
        const dx = mx - n.x;
        const dy = my - n.y;
        if (Math.sqrt(dx * dx + dy * dy) <= n.r + 5) {
          found = n;
          break;
        }
      }

      if (found !== hoveredNode) {
        hoveredNode = found;
        canvas.style.cursor = found ? 'pointer' : 'default';
        if (found) playTone(540, 'sine', 0.04, 0.03);
      }
    });

    canvas.addEventListener('click', () => {
      if (hoveredNode) {
        selectedNode = hoveredNode;
        updateGraphSidebar(selectedNode);
        playTone(720, 'triangle', 0.09, 0.08);
      }
    });

    canvas.addEventListener('mouseleave', () => {
      hoveredNode = null;
    });
  }

  function updateGraphSidebar(node) {
    const titleEl = document.getElementById('graphNodeTitle');
    const catEl = document.getElementById('graphNodeCat');
    const eraEl = document.getElementById('graphNodeEra');
    const takeawayEl = document.getElementById('graphNodeTakeaway');
    const linksCountEl = document.getElementById('graphNodeLinksCount');

    if (!node) return;
    if (titleEl) titleEl.textContent = node.label;
    if (catEl) {
      catEl.textContent = node.cat.toUpperCase();
      catEl.style.color = node.color;
    }
    if (eraEl) eraEl.textContent = node.era;
    if (takeawayEl) takeawayEl.textContent = node.takeaway;

    if (linksCountEl) {
      const conn = links.filter(l => l.source === node || l.target === node).length;
      linksCountEl.textContent = `${conn} เส้นทางเชื่อมโยง`;
    }
  }

  // Initialize graph after layout mounts
  window.addEventListener('load', () => {
    initGraphCanvas();
  });
  window.addEventListener('resize', () => {
    initGraphCanvas();
  });

  // -------------------------------------------------------------------------
  // 8. SPECIMEN DETAIL MODAL CONTROLLER
  // -------------------------------------------------------------------------
  const modalOverlay = document.getElementById('specimenModalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  window.openSpecimenModal = function(id) {
    const item = exhibitionData.find(e => e.id === id);
    if (!item || !modalOverlay) return;

    document.getElementById('modalSpecimenTag').textContent = item.id;
    document.getElementById('modalCategoryPill').textContent = item.categoryName;
    document.getElementById('modalCategoryPill').className = `category-pill ${item.categoryClass}`;
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalImage').src = item.image;
    document.getElementById('modalImage').alt = item.title;
    document.getElementById('modalEra').textContent = item.era;
    document.getElementById('modalSummary').textContent = item.summary;
    document.getElementById('modalDetails').textContent = item.details;
    document.getElementById('modalTakeaway').textContent = item.takeaway;
    document.getElementById('modalSource').textContent = item.source;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    playTone(600, 'sine', 0.08, 0.06);
  };

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    playUiClick();
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // -------------------------------------------------------------------------
  // 9. COPY TAKEAWAY TO CLIPBOARD
  // -------------------------------------------------------------------------
  window.copyTakeawayText = function(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToastNotification('📋 คัดลอกบทเรียนความรู้ลงคลิปบอร์ดแล้ว!');
        playTone(900, 'sine', 0.08, 0.06);
      });
    } else {
      showToastNotification('⚡ ไม่สามารถเข้าถึงคลิปบอร์ดได้');
    }
  };

  function showToastNotification(msg) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--gr-lime);
        color: #000000;
        font-family: var(--font-mono);
        font-size: 13px;
        font-weight: 700;
        padding: 12px 20px;
        border: 1px solid #000;
        box-shadow: 4px 4px 0px #FF5A1F;
        z-index: 9999;
        transition: opacity 0.3s ease, transform 0.3s ease;
        clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 2800);
  }
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGruruApp);
  } else {
    initGruruApp();
  }
}

