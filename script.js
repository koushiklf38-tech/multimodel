// ========== Theme Toggle ==========

(function setupTheme() {
  const html = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  const stored = localStorage.getItem("aiPartTheme");
  if (stored === "light" || stored === "dark") {
    html.setAttribute("data-theme", stored);
  }

  function updateLabel() {
    const mode = html.getAttribute("data-theme") || "dark";
    const iconSpan = toggleBtn.querySelector(".theme-icon");
    const labelSpan = toggleBtn.querySelector(".theme-label");
    if (mode === "dark") {
      iconSpan.textContent = "🌙";
      labelSpan.textContent = "Dark";
    } else {
      iconSpan.textContent = "☀️";
      labelSpan.textContent = "Light";
    }
  }

  updateLabel();

  toggleBtn.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("aiPartTheme", next);
    updateLabel();
  });
})();

// ========== Slider States ==========

const STATES = [
  {
    key: "human-led",
    min: 0,
    max: 19,
    title: "Human-led",
    desc: "Ethics & context first. AI is a helper.",
  },
  {
    key: "mostly-human",
    min: 20,
    max: 39,
    title: "Mostly Human",
    desc: "Human decides; AI suggests and speeds up.",
  },
  {
    key: "balanced",
    min: 40,
    max: 59,
    title: "Balanced",
    desc: "Human goals + AI speed. Best of both.",
  },
  {
    key: "mostly-ai",
    min: 60,
    max: 79,
    title: "Mostly AI (supervised)",
    desc: "AI produces; human supervises and corrects.",
  },
  {
    key: "ai-led",
    min: 80,
    max: 100,
    title: "AI-led (risky)",
    desc: "High speed, but risk without ethics & context.",
  },
];

(function setupSlider() {
  const slider = document.getElementById("balance");
  if (!slider) return;

  const humanLbl = document.getElementById("humanPctLbl");
  const aiLbl = document.getElementById("aiPctLbl");
  const titleEl = document.getElementById("balanceTitle");
  const descEl = document.getElementById("balanceDesc");
  const progressHuman = document.getElementById("progressHuman");
  const progressAi = document.getElementById("progressAi");

  function updateBalance(value) {
    const aiPct = parseInt(value, 10);
    const humanPct = 100 - aiPct;

    humanLbl.textContent = `Human ${humanPct}%`;
    aiLbl.textContent = `AI ${aiPct}%`;

    // bottom bar: human from left (green), AI from right (blue)
    progressHuman.style.width = `${humanPct}%`;
    progressAi.style.width = `${aiPct}%`;

    const state =
      STATES.find((s) => aiPct >= s.min && aiPct <= s.max) || STATES[2];
    titleEl.textContent = state.title;
    descEl.textContent = state.desc;
  }

  slider.addEventListener("input", (e) => updateBalance(e.target.value));
  updateBalance(slider.value);
})();

// ========== Poll Logic ==========

(function setupPoll() {
  const nameInput = document.getElementById("pollName");
  const submitBtn = document.getElementById("pollSubmit");
  const clearBtn = document.getElementById("pollClear");
  const msgEl = document.getElementById("pollMsg");

  if (!submitBtn || !clearBtn || !msgEl) return;

  const countAgreeEl = document.getElementById("countAgree");
  const countNeutralEl = document.getElementById("countNeutral");
  const countDisagreeEl = document.getElementById("countDisagree");
  const percentAgreeEl = document.getElementById("percentAgree");
  const percentNeutralEl = document.getElementById("percentNeutral");
  const percentDisagreeEl = document.getElementById("percentDisagree");

  const barAgree = document.getElementById("barAgree");
  const barNeutral = document.getElementById("barNeutral");
  const barDisagree = document.getElementById("barDisagree");

  function loadPoll() {
    const stored = localStorage.getItem("aiPartnerPoll");
    if (!stored) {
      return { agree: 0, neutral: 0, disagree: 0 };
    }
    try {
      const parsed = JSON.parse(stored);
      return {
        agree: parsed.agree || 0,
        neutral: parsed.neutral || 0,
        disagree: parsed.disagree || 0,
      };
    } catch {
      return { agree: 0, neutral: 0, disagree: 0 };
    }
  }

  function savePoll(data) {
    localStorage.setItem("aiPartnerPoll", JSON.stringify(data));
  }

  function renderPoll(data) {
    const total = data.agree + data.neutral + data.disagree || 0;

    countAgreeEl.textContent = data.agree;
    countNeutralEl.textContent = data.neutral;
    countDisagreeEl.textContent = data.disagree;

    const pct = (n) => (total === 0 ? 0 : Math.round((n / total) * 100));

    const pA = pct(data.agree);
    const pN = pct(data.neutral);
    const pD = pct(data.disagree);

    percentAgreeEl.textContent = `${pA}%`;
    percentNeutralEl.textContent = `${pN}%`;
    percentDisagreeEl.textContent = `${pD}%`;

    barAgree.style.width = `${pA}%`;
    barNeutral.style.width = `${pN}%`;
    barDisagree.style.width = `${pD}%`;
  }

  let state = loadPoll();
  renderPoll(state);

  submitBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const choice = document.querySelector('input[name="pollChoice"]:checked');

    if (!choice) {
      msgEl.textContent = "Please choose an option before voting.";
      return;
    }

    state = loadPoll();
    state[choice.value] = (state[choice.value] || 0) + 1;
    savePoll(state);
    renderPoll(state);

    msgEl.textContent =
      name === ""
        ? "Thanks for voting!"
        : `Thanks for voting, ${name}! Your answer was saved on this device.`;
  });

  clearBtn.addEventListener("click", () => {
    state = { agree: 0, neutral: 0, disagree: 0 };
    savePoll(state);
    renderPoll(state);
    msgEl.textContent = "Poll results cleared for this browser.";
    const checked = document.querySelector('input[name="pollChoice"]:checked');
    if (checked) checked.checked = false;
    nameInput.value = "";
  });
})();
