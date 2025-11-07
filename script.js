// ============================
// Header offset (sticky nav)
// ============================
function setHeaderOffset(){
  const header = document.querySelector('header');
  if(!header) return;
  const h = header.offsetHeight;
  document.documentElement.style.setProperty('--header-h', h + 'px');
  document.body.style.paddingTop = h + 'px';
}
window.addEventListener('load', setHeaderOffset);
window.addEventListener('resize', () => { requestAnimationFrame(setHeaderOffset); });

// ============================
// Theme toggle (Light/Dark)
// ============================
const THEME_KEY = 'aiSiteTheme'; // "light" | "dark"
const root = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');
const iconSpan = toggleBtn?.querySelector('.theme-icon');
const labelSpan = toggleBtn?.querySelector('.theme-label');

function applyTheme(theme){
  root.setAttribute('data-theme', theme);
  if (iconSpan && labelSpan){
    if (theme === 'light'){
      iconSpan.textContent = '🌞';
      labelSpan.textContent = 'Light';
    } else {
      iconSpan.textContent = '🌙';
      labelSpan.textContent = 'Dark';
    }
  }
}
function getSystemPref(){
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light' : 'dark';
}
(function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  const start = saved || getSystemPref() || 'dark';
  applyTheme(start);
})();
toggleBtn?.addEventListener('click', ()=>{
  const cur = root.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

// ============================
// Slider (text + split bar, no photo)
// ============================
const slider = document.getElementById('balance');
const titleEl = document.getElementById('balanceTitle');
const descEl  = document.getElementById('balanceDesc');
const humanLbl = document.getElementById('humanPctLbl');
const aiLbl    = document.getElementById('aiPctLbl');
const barHuman = document.getElementById('progressHuman');
const barAi    = document.getElementById('progressAi');

const STATES = [
  { key:'human-led',   min: 0,  max:19, title:'Human-led',              desc:'Ethics & context first. AI is a helper.' },
  { key:'mostly-human',min:20,  max:39, title:'Mostly Human',           desc:'Human decides; AI suggests and speeds up.' },
  { key:'balanced',    min:40,  max:59, title:'Balanced',               desc:'Human goals + AI speed. Best of both.' },
  { key:'mostly-ai',   min:60,  max:79, title:'Mostly AI (supervised)', desc:'AI produces; human supervises and corrects.' },
  { key:'ai-led',      min:80,  max:100,title:'AI-led (risky)',         desc:'High speed, but risk without ethics & context.' }
];

function stateFor(val){
  const v = Number(val);
  return STATES.find(s => v >= s.min && v <= s.max) || STATES[2];
}

function updateSliderUI(v){
  const aiPct = Math.round(Number(v));
  const humanPct = 100 - aiPct;

  if (humanLbl) humanLbl.textContent = `Human ${humanPct}%`;
  if (aiLbl)    aiLbl.textContent    = `AI ${aiPct}%`;

  if (barHuman) barHuman.style.width = humanPct + '%';
  if (barAi)    barAi.style.width    = aiPct + '%';

  const st = stateFor(v);
  if (st){
    if (titleEl) titleEl.textContent = st.title;
    if (descEl)  descEl.textContent  = st.desc;
  }
}

(function initSlider(){
  if (!slider) return;
  updateSliderUI(slider.value);
  slider.addEventListener('input', e => updateSliderUI(e.target.value));
})();

// ============================
/* Poll Logic (localStorage) */
// ============================
const LS_KEY = 'aiPartnerPollVotes'; // stores { nameLower: "agree|neutral|disagree" }
const nameInput = document.getElementById('pollName');
const submitBtn = document.getElementById('pollSubmit');
const clearBtn  = document.getElementById('pollClear');
const msg = document.getElementById('pollMsg');

const bars = {
  agree: document.getElementById('barAgree'),
  neutral: document.getElementById('barNeutral'),
  disagree: document.getElementById('barDisagree'),
};
const counts = {
  agree: document.getElementById('countAgree'),
  neutral: document.getElementById('countNeutral'),
  disagree: document.getElementById('countDisagree'),
};
const percents = {
  agree: document.getElementById('percentAgree'),
  neutral: document.getElementById('percentNeutral'),
  disagree: document.getElementById('percentDisagree'),
};

function loadVotes(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch(e){
    return {};
  }
}
function saveVotes(v){ localStorage.setItem(LS_KEY, JSON.stringify(v)); }

function tallyAndRender(){
  const votes = loadVotes();
  const tallies = { agree:0, neutral:0, disagree:0 };
  Object.values(votes).forEach(v => { if(tallies[v] != null) tallies[v]++; });

  const total = tallies.agree + tallies.neutral + tallies.disagree || 0;
  const pct = k => total ? Math.round((tallies[k] / total) * 100) : 0;

  ['agree','neutral','disagree'].forEach(k=>{
    counts[k].textContent = String(tallies[k]);
    percents[k].textContent = pct(k) + '%';
    if (bars[k]) bars[k].style.width = pct(k) + '%';
  });
}

function getSelectedChoice(){
  const sel = document.querySelector('input[name="pollChoice"]:checked');
  return sel ? sel.value : null;
}

submitBtn?.addEventListener('click', ()=>{
  const name = (nameInput.value || '').trim();
  const choice = getSelectedChoice();
  if(!name){ msg.textContent = 'Please enter your name to vote.'; return; }
  if(!choice){ msg.textContent = 'Please select one option.'; return; }

  const key = name.toLowerCase();
  const votes = loadVotes();

  if (votes[key] && votes[key] === choice){
    msg.textContent = `Thanks, ${name}! Your vote is already recorded as "${choice}".`;
    return;
  }
  votes[key] = choice;
  saveVotes(votes);
  msg.textContent = `Thanks for voting, ${name}! You chose "${choice}".`;
  tallyAndRender();
});

clearBtn?.addEventListener('click', ()=>{
  const name = (nameInput.value || '').trim();
  if(!name){ msg.textContent = 'Enter your name to clear your vote.'; return; }
  const key = name.toLowerCase();
  const votes = loadVotes();
  if(votes[key]){
    delete votes[key];
    saveVotes(votes);
    msg.textContent = `Your vote was cleared, ${name}.`;
    tallyAndRender();
  } else {
    msg.textContent = `No vote found for "${name}".`;
  }
});

// Initial render
tallyAndRender();
