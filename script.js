// Set header offset dynamically so anchors don't hide under header
function setHeaderOffset(){
  const header = document.querySelector('header');
  if(!header) return;
  const h = header.offsetHeight;
  document.documentElement.style.setProperty('--header-h', h + 'px');
  document.body.style.paddingTop = h + 'px';
}
window.addEventListener('load', setHeaderOffset);
window.addEventListener('resize', () => { requestAnimationFrame(setHeaderOffset); });

// Slider label
const slider = document.getElementById('balance');
const label = document.getElementById('balanceLabel');
function updateLabel(v){
  v = Number(v);
  if (v < 20) label.textContent = "Human-led: ethics & context first";
  else if (v < 40) label.textContent = "Mostly human with AI support";
  else if (v < 60) label.textContent = "Balanced: human goals + AI speed";
  else if (v < 80) label.textContent = "Mostly AI with human supervision";
  else label.textContent = "AI-led: risky without ethics";
}
if (slider && label){
  updateLabel(slider.value);
  slider.addEventListener('input', e => updateLabel(e.target.value));
}

// ===== Poll Logic (localStorage) =====
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

  // Update counts and bars
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

if (submitBtn) {
  submitBtn.addEventListener('click', ()=>{
    const name = (nameInput.value || '').trim();
    const choice = getSelectedChoice();
    if(!name){ msg.textContent = 'Please enter your name to vote.'; return; }
    if(!choice){ msg.textContent = 'Please select one option.'; return; }

    const key = name.toLowerCase();
    const votes = loadVotes();

    // prevent duplicate name
    if (votes[key] && votes[key] === choice){
      msg.textContent = `Thanks, ${name}! Your vote is already recorded as "${choice}".`;
      return;
    }
    votes[key] = choice;
    saveVotes(votes);
    msg.textContent = `Thanks for voting, ${name}! You chose "${choice}".`;
    tallyAndRender();
  });
}

if (clearBtn) {
  clearBtn.addEventListener('click', ()=>{
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
}

// Initial render
tallyAndRender();
