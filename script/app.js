// ============================================================
//  CS Study Hub — Application Logic  (polished v2)
// ============================================================

let COURSES = {};
let NEXT_SEM = {};       // next-semester placeholder data
let currentCourse = 'home';
let currentTopic = null;
let currentView = 'notes';

// ── NEXT SEMESTER PLACEHOLDER DATA ───────────────────────────
const NEXT_SEM_COURSES = {
  softeng: {
    name: 'Software Engineering',
    accent: '#34d399', accent2: '#10b981', accent3: '#6ee7b7',
    icon: '🏗️',
    desc: 'Software development lifecycle, requirements engineering, design patterns, testing methodologies, and project management.',
    topics: [
      'SDLC Models (Waterfall, Agile, Scrum)',
      'Requirements Engineering & Use Cases',
      'Software Design Patterns (GoF)',
      'Testing: Unit, Integration, System',
      'Version Control & CI/CD Pipelines',
      'Software Quality & Metrics',
    ]
  },
  databases: {
    name: 'Database Systems',
    accent: '#fb923c', accent2: '#ea580c', accent3: '#fdba74',
    icon: '🗄️',
    desc: 'Relational database design, SQL, normalisation, transactions, indexing, and introduction to NoSQL databases.',
    topics: [
      'Relational Model & ER Diagrams',
      'SQL: DDL, DML, DCL, TCL',
      'Normalisation (1NF → BCNF)',
      'Transactions & ACID Properties',
      'Indexing & Query Optimisation',
      'Introduction to NoSQL & MongoDB',
    ]
  },
  os: {
    name: 'Operating Systems',
    accent: '#e879f9', accent2: '#c026d3', accent3: '#f0abfc',
    icon: '⚙️',
    desc: 'Process management, memory management, file systems, scheduling algorithms, deadlocks, and concurrency.',
    topics: [
      'Processes & Threads',
      'CPU Scheduling Algorithms',
      'Memory Management & Paging',
      'File Systems & I/O',
      'Deadlocks & Synchronisation',
      'Virtual Memory & Segmentation',
    ]
  },
  webdev: {
    name: 'Web Development',
    accent: '#38bdf8', accent2: '#0284c7', accent3: '#7dd3fc',
    icon: '🌐',
    desc: 'HTML, CSS, JavaScript, responsive design, REST APIs, client-server architecture, and modern web frameworks.',
    topics: [
      'HTML5 Semantics & Accessibility',
      'CSS3 & Responsive Design',
      'JavaScript: DOM, Events, Fetch API',
      'REST APIs & HTTP Protocol',
      'Introduction to React / Vue',
      'Web Security: XSS, CSRF, HTTPS',
    ]
  },
  dsa: {
    name: 'Data Structures & Algorithms',
    accent: '#f87171', accent2: '#dc2626', accent3: '#fca5a5',
    icon: '🧮',
    desc: 'Arrays, linked lists, trees, graphs, sorting and searching algorithms, time & space complexity analysis.',
    topics: [
      'Big-O Notation & Complexity Analysis',
      'Arrays, Stacks & Queues',
      'Linked Lists (Singly, Doubly, Circular)',
      'Trees: BST, AVL, Heaps',
      'Graphs: BFS, DFS, Dijkstra',
      'Sorting: QuickSort, MergeSort, HeapSort',
    ]
  }
};

// ── INIT ──────────────────────────────────────────────────────
async function init() {
  document.getElementById('footerYear').textContent = new Date().getFullYear();
  try {
    const res = await fetch('data.json');
    COURSES = await res.json();
    setupSplash();
    showHome();
  } catch (e) {
    console.error('Failed to load data.json:', e);
    document.getElementById('mainContent').innerHTML =
      '<div style="padding:40px;color:#f76f6f;font-family:monospace">⚠ Error loading course data. Make sure all 4 files are in the same folder, and open via a local server (e.g. VS Code Live Server).</div>';
  }
}

// ── SPLASH ────────────────────────────────────────────────────
function setupSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.addEventListener('click', dismissSplash);
  splash.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') dismissSplash();
  });
}
function dismissSplash() {
  const splash = document.getElementById('splash');
  if (splash) splash.classList.add('hidden');
}

// ── MOBILE SIDEBAR ────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const burger = document.getElementById('hamburger');
  const isOpen = sidebar.classList.toggle('open');
  overlay.classList.toggle('show', isOpen);
  burger.classList.toggle('open', isOpen);
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
  document.getElementById('hamburger').classList.remove('open');
}

// ── ACCENT COLORS ─────────────────────────────────────────────
function setAccent(a, a2, a3) {
  const r = document.documentElement.style;
  r.setProperty('--accent', a);
  r.setProperty('--accent2', a2);
  r.setProperty('--accent3', a3);
}

// ── COURSE SWITCHING ──────────────────────────────────────────
function switchCourse(course, tabEl) {
  currentCourse = course;
  currentTopic = null;
  currentView = 'notes';
  closeSidebar();

  document.querySelectorAll('.course-tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');

  document.getElementById('viewSwitcher').style.display = 'none';
  document.getElementById('topicProgress').style.display = 'none';
  document.getElementById('navList').innerHTML = '';

  // Clear search
  const searchEl = document.getElementById('topicSearch');
  if (searchEl) searchEl.value = '';

  // Home
  if (course === 'home') {
    document.getElementById('sidebarTitle').textContent = 'All Courses';
    document.getElementById('sidebarSub').textContent = Object.keys(COURSES).length + ' courses this semester';
    document.getElementById('mobileTitle').textContent = 'CS Study Hub';
    setAccent('#6b7280', '#4b5563', '#9ca3af');
    showHome();
    return;
  }

  // Next-semester placeholder
  if (NEXT_SEM_COURSES[course]) {
    const c = NEXT_SEM_COURSES[course];
    document.getElementById('sidebarTitle').textContent = c.name;
    document.getElementById('sidebarSub').textContent = 'Coming next semester';
    document.getElementById('mobileTitle').textContent = c.name;
    setAccent(c.accent, c.accent2, c.accent3);
    showNextSemCourse(c);
    return;
  }

  // Current course
  const c = COURSES[course];
  if (!c) return;
  document.getElementById('sidebarTitle').textContent = c.name;
  document.getElementById('sidebarSub').textContent = c.topics.length + ' topics';
  document.getElementById('mobileTitle').textContent = c.name;
  setAccent(c.accent, c.accent2, c.accent3);

  document.getElementById('viewSwitcher').style.display = 'flex';
  document.querySelectorAll('.vsw-btn').forEach((b, i) => b.classList.toggle('active', i === 0));

  buildNav();
  updateProgress(0, c.topics.length);
  showCourseWelcome();
}

// ── NAV ───────────────────────────────────────────────────────
function buildNav() {
  const c = COURSES[currentCourse];
  const nav = document.getElementById('navList');
  nav.innerHTML = '';
  c.topics.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.setAttribute('data-idx', i);
    li.innerHTML = `<span class="nav-num">${String(i + 1).padStart(2, '0')}</span><span class="nav-name">${t.short}</span>`;
    li.onclick = () => loadTopic(i);
    nav.appendChild(li);
  });
}

function setActiveNav(idx) {
  document.querySelectorAll('.nav-item').forEach((el, i) =>
    el.classList.toggle('active', i === idx)
  );
  // Scroll nav item into view
  const activeEl = document.querySelector('.nav-item.active');
  if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ── SEARCH / FILTER ───────────────────────────────────────────
function filterNav(query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll('.nav-item').forEach(el => {
    const name = el.querySelector('.nav-name').textContent.toLowerCase();
    el.classList.toggle('hidden-item', q !== '' && !name.includes(q));
  });
}

// ── PROGRESS BAR ─────────────────────────────────────────────
function updateProgress(idx, total) {
  const prog = document.getElementById('topicProgress');
  const fill = document.getElementById('tpFill');
  const lbl = document.getElementById('tpLabel');
  if (!prog) return;
  prog.style.display = currentTopic !== null ? 'block' : 'none';
  lbl.textContent = `Topic ${idx + 1} of ${total}`;
  fill.style.width = `${Math.round(((idx + 1) / total) * 100)}%`;
}

// ── VIEW SWITCHER ─────────────────────────────────────────────
function setView(v, btn) {
  currentView = v;
  document.querySelectorAll('.vsw-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (currentTopic !== null) loadTopic(currentTopic);
  else showCourseWelcome();
}

// ── HOME PAGE ─────────────────────────────────────────────────
function showHome() {
  const main = document.getElementById('mainContent');
  const keys = Object.keys(COURSES);
  const totalTopics = keys.reduce((s, k) => s + (COURSES[k].topics || []).length, 0);
  const totalQA = keys.reduce((s, k) =>
    s + (COURSES[k].topics || []).reduce((ss, t) => ss + (t.qa || []).length, 0), 0);

  const colorMap = {
    crypto: 'var(--crypto-accent)', forensics: 'var(--forensics-accent)',
    networks: 'var(--networks-accent)', cloud: 'var(--cloud-accent)',
    oop: 'var(--oop-accent)'
  };

  let html = `
    <div class="hero">
      <div class="hero-eyebrow">Complete Study Resource</div>
      <h1 class="hero-heading"><span style="color:#a78bfa">CS</span> Study Hub</h1>
      <p class="hero-desc">All your course notes, Q&amp;A flashcards, and summary cards in one place. Select a course from the sidebar to begin — or jump straight to a topic below.</p>
      <div class="hero-tags">
        <span class="hero-tag">📚 ${keys.length} Courses</span>
        <span class="hero-tag">📄 ${totalTopics} Topics</span>
        <span class="hero-tag">❓ ${totalQA} Flashcards</span>
        <span class="hero-tag">⚡ Quick Notes</span>
        <span class="hero-tag">📊 Summary Cards</span>
      </div>
    </div>
    <div class="welcome">
      <div class="semester-section">
        <div class="semester-heading">
          <span class="sem-badge current">This Semester</span>
          <span class="sem-title">Current Courses</span>
          <span class="sem-divider"></span>
        </div>
  `;

  // Current semester courses
  keys.forEach(key => {
    const c = COURSES[key];
    const col = colorMap[key] || '#888';
    html += `
      <div class="welcome-section-title">
        <div class="wst-dot" style="background:${col}"></div>
        ${c.name}
        <span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--text3);font-weight:400;text-transform:lowercase;letter-spacing:0">${c.topics.length} topics</span>
      </div>
      <div class="welcome-grid">
    `;
    c.topics.forEach((t, i) => {
      const qaCount = (t.qa || []).length;
      const noteCount = (t.notes || []).length;
      html += `
        <div class="welcome-card" data-course="${key}" onclick="navToCourse('${key}', ${i})">
          <div class="wc-num">${String(i + 1).padStart(2, '0')}</div>
          <div class="wc-title">${t.short}</div>
          <div class="wc-meta">${noteCount} notes · ${qaCount} Q&amp;As</div>
        </div>
      `;
    });
    html += `</div>`;
  });

  // Next semester section
  html += `
      </div>
      <div class="semester-section">
        <div class="semester-heading">
          <span class="sem-badge next">Next Semester</span>
          <span class="sem-title">Coming Soon</span>
          <span class="sem-divider"></span>
        </div>
        <div class="coming-course-grid">
  `;
  const nextColors = {
    softeng: '#34d399', databases: '#fb923c', os: '#e879f9',
    webdev: '#38bdf8', dsa: '#f87171'
  };
  Object.entries(NEXT_SEM_COURSES).forEach(([key, c]) => {
    html += `
      <div class="coming-course-card" onclick="switchCourse('${key}', document.querySelector('[data-course=${key}]'))">
        <div class="ccc-dot" style="background:${nextColors[key]}"></div>
        <div class="ccc-name">${c.name}</div>
        <div class="ccc-badge">${c.icon} Coming next semester</div>
      </div>
    `;
  });

  html += `</div></div></div>`;
  main.innerHTML = html;
}

function navToCourse(courseKey, topicIdx) {
  const tab = document.querySelector(`.course-tab[data-course="${courseKey}"]`);
  switchCourse(courseKey, tab);
  setTimeout(() => loadTopic(topicIdx), 80);
}

// ── NEXT SEMESTER COURSE PAGE ─────────────────────────────────
function showNextSemCourse(c) {
  document.getElementById('mainContent').innerHTML = `
    <div class="hero">
      <div class="hero-eyebrow">Next Semester · Coming Soon</div>
      <h1 class="hero-heading"><span>${c.icon}</span> ${c.name}</h1>
      <p class="hero-desc">${c.desc}</p>
      <div class="hero-tags">
        <span class="hero-tag">📅 Next Semester</span>
        <span class="hero-tag">${c.topics.length} Planned Topics</span>
      </div>
    </div>
    <div class="coming-soon-page">
      <div class="cs-icon">🚀</div>
      <div class="cs-title">Content Being Prepared</div>
      <div class="cs-desc">We're putting together comprehensive study notes, Q&amp;A flashcards, and summary cards for <strong style="color:var(--accent)">${c.name}</strong>. Here's what's planned:</div>
      <div class="cs-topics">
        ${c.topics.map(t => `<div class="cs-topic-pill">${t}</div>`).join('')}
      </div>
    </div>
  `;
}

// ── COURSE WELCOME ────────────────────────────────────────────
function showCourseWelcome() {
  const c = COURSES[currentCourse];
  const main = document.getElementById('mainContent');
  const totalQA = c.topics.reduce((s, t) => s + (t.qa || []).length, 0);

  let html = `
    <div class="hero">
      <div class="hero-eyebrow">${c.name}</div>
      <h1 class="hero-heading"><span>${c.name}</span> Study Guide</h1>
      <p class="hero-desc">${c.topics.length} topics with detailed notes, Q&amp;A flashcards, and summary revision cards. Use the view switcher above to switch modes.</p>
      <div class="hero-tags">
        <span class="hero-tag">📄 ${c.topics.length} Topics</span>
        <span class="hero-tag">❓ ${totalQA} Flashcards</span>
        <span class="hero-tag">⚡ Summary Cards</span>
      </div>
    </div>
    <div class="welcome"><div class="welcome-grid">
  `;
  c.topics.forEach((t, i) => {
    const qaCount = (t.qa || []).length;
    const noteCount = (t.notes || []).length;
    html += `
      <div class="welcome-card" data-course="${currentCourse}" onclick="loadTopic(${i})">
        <div class="wc-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="wc-title">${t.short}</div>
        <div class="wc-meta">${noteCount} notes · ${qaCount} Q&amp;As</div>
      </div>
    `;
  });
  html += `</div></div>`;
  main.innerHTML = html;
}

// ── TOPIC LOADER ──────────────────────────────────────────────
function loadTopic(idx) {
  currentTopic = idx;
  setActiveNav(idx);

  const c = COURSES[currentCourse];
  const t = c.topics[idx];
  const main = document.getElementById('mainContent');

  // Progress bar
  document.getElementById('topicProgress').style.display = 'block';
  updateProgress(idx, c.topics.length);

  // Build topic nav dots
  const dots = c.topics.map((_, i) =>
    `<div class="tnav-dot${i === idx ? ' active' : ''}" onclick="loadTopic(${i})" title="${c.topics[i].short}"></div>`
  ).join('');

  const titleWords = t.short.split(' ');
  const heroSpan = titleWords[0];
  const heroRest = titleWords.slice(1).join(' ');

  let html = `
    <div class="hero">
      <div class="hero-eyebrow">Topic ${String(idx + 1).padStart(2, '0')} of ${c.topics.length} — ${c.name}</div>
      <h1 class="hero-heading"><span>${heroSpan}</span> ${heroRest}</h1>
      <p class="hero-desc">${t.subtitle}</p>
    </div>

    <div class="topic-nav-strip">
      <button class="tnav-btn" onclick="loadTopic(${idx - 1})" ${idx === 0 ? 'disabled' : ''}>
        ← Prev
      </button>
      <div class="tnav-dots">${dots}</div>
      <button class="tnav-btn" onclick="loadTopic(${idx + 1})" ${idx === c.topics.length - 1 ? 'disabled' : ''}>
        Next →
      </button>
    </div>

    <div class="content-area">
  `;

  if (currentView === 'notes') {
    html += renderNotes(t, idx);
  } else if (currentView === 'qa') {
    html += renderQA(t, idx);
  } else {
    html += renderSummary(t);
  }

  html += `</div>`;
  main.innerHTML = html;
  main.scrollTop = 0;
}

// ── RENDER: NOTES ─────────────────────────────────────────────
function renderNotes(t, idx) {
  let html = `
    <div class="content-toolbar">
      <span class="ct-left">${t.notes.length} sections</span>
      <div class="ct-actions">
        <button class="ct-btn" onclick="expandAll()">Expand All</button>
        <button class="ct-btn" onclick="collapseAll()">Collapse All</button>
      </div>
    </div>
  `;
  t.notes.forEach((n, ni) => {
    html += `
      <div class="note-block" id="nb-${idx}-${ni}">
        <div class="note-block-header" onclick="toggleNote('nb-${idx}-${ni}')">
          <span>${n.title}</span>
          <span class="nbh-arrow">▼</span>
        </div>
        <div class="note-block-body">${n.body}</div>
      </div>
    `;
  });
  html += `<div class="summary-strip"><strong>Key Takeaway:</strong> ${t.summary}</div>`;
  return html;
}

// ── RENDER: Q&A ───────────────────────────────────────────────
function renderQA(t, idx) {
  let html = `
    <div class="content-toolbar">
      <span class="ct-left">${t.qa.length} questions</span>
      <div class="ct-actions">
        <button class="ct-btn" onclick="revealAll()">Reveal All</button>
        <button class="ct-btn" onclick="hideAll()">Hide All</button>
      </div>
    </div>
    <div class="qa-hint">
      <span class="qa-hint-line"></span>
      Click a question to reveal the answer
      <span class="qa-hint-line"></span>
    </div>
  `;
  t.qa.forEach((item, qi) => {
    html += `
      <div class="qa-card" id="qa-${idx}-${qi}">
        <div class="qa-question" onclick="toggleQA('qa-${idx}-${qi}')">
          <span class="qa-qnum">Q${qi + 1}</span>
          <span class="qa-qtext">${item.q}</span>
          <span class="qa-reveal-hint">tap to reveal ▾</span>
        </div>
        <div class="qa-answer">${item.a}</div>
      </div>
    `;
  });
  return html;
}

// ── RENDER: SUMMARY CARDS ─────────────────────────────────────
function renderSummary(t) {
  let html = `
    <div class="content-toolbar">
      <span class="ct-left">${t.sumCards.length} summary cards</span>
    </div>
    <div class="summary-grid">
  `;
  t.sumCards.forEach(card => {
    html += `
      <div class="sum-card">
        <div class="sum-card-label">${card.label}</div>
        <div class="sum-card-content">${card.content}</div>
      </div>
    `;
  });
  html += `</div>`;
  html += `<div class="summary-strip"><strong>Key Takeaway:</strong> ${t.summary}</div>`;
  return html;
}

// ── TOOLBAR ACTIONS ───────────────────────────────────────────
function expandAll() {
  document.querySelectorAll('.note-block').forEach(b => b.classList.add('open'));
}
function collapseAll() {
  document.querySelectorAll('.note-block').forEach(b => b.classList.remove('open'));
}
function revealAll() {
  document.querySelectorAll('.qa-card').forEach(c => c.classList.add('revealed'));
}
function hideAll() {
  document.querySelectorAll('.qa-card').forEach(c => c.classList.remove('revealed'));
}

// ── TOGGLES ───────────────────────────────────────────────────
function toggleNote(id) {
  document.getElementById(id).classList.toggle('open');
}
function toggleQA(id) {
  document.getElementById(id).classList.toggle('revealed');
}

// ── KEYBOARD NAVIGATION ───────────────────────────────────────
document.addEventListener('keydown', e => {
  if (!currentCourse || currentCourse === 'home') return;
  const c = COURSES[currentCourse];
  if (!c) return;

  // Don't fire when typing in search
  if (document.activeElement === document.getElementById('topicSearch')) return;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    if (currentTopic !== null && currentTopic < c.topics.length - 1) {
      e.preventDefault(); loadTopic(currentTopic + 1);
    }
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (currentTopic !== null && currentTopic > 0) {
      e.preventDefault(); loadTopic(currentTopic - 1);
    }
  }
  // 1/2/3 switch views
  if (e.key === '1') setView('notes', document.querySelector('.vsw-btn:nth-child(1)'));
  if (e.key === '2') setView('qa', document.querySelector('.vsw-btn:nth-child(2)'));
  if (e.key === '3') setView('summary', document.querySelector('.vsw-btn:nth-child(3)'));
});

// ── BOOTSTRAP ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);