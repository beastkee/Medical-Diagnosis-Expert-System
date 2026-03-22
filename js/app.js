// ================================================================
//  APPLICATION — UI rendering and navigation
// ================================================================

// ---- STATE ----
let selectedSymptoms = new Set();
let currentStep = 1;

// ================================================================
//  RENDER KNOWLEDGE BASE PANEL
// ================================================================
function renderKB() {
  const panel = document.getElementById('kb-panel');
  const sevLabel = { urgent:'Urgent', moderate:'Moderate', mild:'Mild' };
  const dotColors = { urgent:'#d85a30', moderate:'#ba7517', mild:'#3b6d11' };

  let html = `<div class="kb-section"><div class="kb-title">Diseases in Knowledge Base (${KNOWLEDGE_BASE.length})</div>`;
  KNOWLEDGE_BASE.forEach(d => {
    const allSyms = [...d.core, ...d.supporting];
    const shown = allSyms.slice(0,5).map(s => symLabel(s)).join(', ');
    html += `<div class="kb-disease" onclick="previewDisease('${d.id}')">
      <div class="kb-dot" style="background:${dotColors[d.severity]}"></div>
      <div>
        <div class="kb-name">${d.name}
          <span class="severity-badge sev-${d.severity}">${sevLabel[d.severity]}</span>
        </div>
        <div class="kb-syms">${shown}${allSyms.length > 5 ? ` +${allSyms.length-5} more` : ''}</div>
      </div>
    </div>`;
  });
  html += '</div>';
  panel.innerHTML = html;
}

function symLabel(id) {
  for (const g of SYMPTOM_GROUPS) {
    const s = g.symptoms.find(x => x.id === id);
    if (s) return s.label;
  }
  return id.replace(/_/g,' ');
}

function previewDisease(id) {
  const d = KNOWLEDGE_BASE.find(x => x.id === id);
  if (!d) return;
  alert(`${d.name}\n\n${d.description}\n\nRequired symptoms:\n• ${d.core.map(symLabel).join('\n• ')}\n\nSupporting symptoms:\n• ${d.supporting.map(symLabel).join('\n• ')}`);
}

// ================================================================
//  RENDER SYMPTOM CHIPS
// ================================================================
function renderSymptoms() {
  const container = document.getElementById('symptom-groups');
  // deduplicate symptom ids across groups
  const seen = new Set();
  let html = '';
  SYMPTOM_GROUPS.forEach(g => {
    const unique = g.symptoms.filter(s => { if(seen.has(s.id)) return false; seen.add(s.id); return true; });
    html += `<div class="sym-group">
      <div class="sym-group-title">${g.group}</div>
      <div class="sym-chips">`;
    unique.forEach(s => {
      const sel = selectedSymptoms.has(s.id) ? 'selected' : '';
      html += `<button class="sym-chip ${sel}" onclick="toggleSym('${s.id}')">
        <span class="chip-dot"></span>${s.label}
      </button>`;
    });
    html += `</div></div>`;
  });
  container.innerHTML = html;
  updateSelectedDisplay();
}

function toggleSym(id) {
  if (selectedSymptoms.has(id)) selectedSymptoms.delete(id);
  else selectedSymptoms.add(id);
  renderSymptoms();
}

function clearSymptoms() {
  selectedSymptoms.clear();
  renderSymptoms();
}

function updateSelectedDisplay() {
  const d = document.getElementById('selected-display');
  const hint = document.getElementById('sym-min-hint');
  const count = document.getElementById('sym-count-text');
  count.textContent = `${selectedSymptoms.size} symptom${selectedSymptoms.size!==1?'s':''} selected`;
  hint.style.display = selectedSymptoms.size === 0 ? 'inline' : 'none';

  if (selectedSymptoms.size === 0) {
    d.innerHTML = `<span class="empty-hint">None selected — tap symptoms below</span>`;
    return;
  }
  d.innerHTML = [...selectedSymptoms].map(id =>
    `<span class="sel-tag">${symLabel(id)}</span>`
  ).join('');
}

// ================================================================
//  RUN DIAGNOSIS
// ================================================================
function runDiagnosis() {
  if (selectedSymptoms.size === 0) {
    document.getElementById('sym-min-hint').style.display = 'inline';
    return;
  }
  const results = runInferenceEngine([...selectedSymptoms]);
  renderResults(results);
  goToStep(3);
}

function renderResults(results) {
  const area = document.getElementById('results-area');
  const name = document.getElementById('pat-name').value || 'Patient';
  const age = document.getElementById('pat-age').value;
  const sex = document.getElementById('pat-sex').value;
  const dur = document.getElementById('pat-duration').value;

  const sevColour = { urgent:'var(--red)', moderate:'var(--amber)', mild:'var(--green)' };

  let html = '';

  // Patient summary
  html += `<div class="patient-summary">
    <strong>${name}</strong>${age ? ` · Age ${age}` : ''}${sex ? ` · ${sex}` : ''}${dur ? ` · Symptoms for ${dur.toLowerCase()}` : ''}
    <br><span style="font-size:12px;opacity:0.8;">${selectedSymptoms.size} symptom(s) entered: ${[...selectedSymptoms].map(symLabel).join(', ')}</span>
  </div>`;

  if (results.length === 0) {
    html += `<div class="no-match">
      <span class="big-icon">🔍</span>
      <strong>No clear match found</strong><br><br>
      The symptoms entered do not match any condition in the knowledge base with sufficient confidence.
      Please check the entered symptoms or consult a healthcare professional directly.
    </div>`;
    area.innerHTML = html;
    return;
  }

  html += `<div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-hint);margin-bottom:12px;">Possible Diagnoses — Ranked by Confidence</div>`;

  results.forEach((r, i) => {
    const isPrimary = i === 0;
    const pct = Math.round(r.confidence * 100);
    const rankLabels = ['Most Likely', 'Possible', 'Also Consider', 'Low Probability'];
    const sev = r.disease.severity;

    html += `<div class="diagnosis-card ${isPrimary ? 'diag-primary' : 'diag-secondary'}">
      <div class="diag-rank">${rankLabels[i] || 'Possible'} · <span style="color:${sevColour[sev]}">${sev.charAt(0).toUpperCase()+sev.slice(1)} severity</span></div>
      <div class="diag-name">${r.disease.name}</div>
      <div class="diag-confidence" style="color:var(--text-muted)">Confidence: <strong>${pct}%</strong> · ${r.coreMatched.length} core + ${r.supMatched.length} supporting symptoms matched</div>
      <div class="conf-bar-wrap"><div class="conf-bar" style="width:${pct}%"></div></div>
      <div class="matched-syms"><strong style="font-size:11px;">Matched:</strong>
        ${r.coreMatched.map(s=>`<span class="match-chip" style="background:${isPrimary?'rgba(12,122,94,0.18)':'rgba(0,0,0,0.07)'}">${symLabel(s)} ★</span>`).join('')}
        ${r.supMatched.map(s=>`<span class="match-chip" style="background:${isPrimary?'rgba(12,122,94,0.1)':'rgba(0,0,0,0.04)'}">${symLabel(s)}</span>`).join('')}
      </div>
      <div style="font-size:13px;color:var(--text-muted);font-style:italic;margin-bottom:8px">${r.disease.description}</div>
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-hint);margin-bottom:6px">Recommended Tests</div>
      <div style="font-size:13px;color:var(--text-muted)">${r.disease.tests.map(t=>`• ${t}`).join('<br>')}</div>
    </div>`;
  });

  // Recommendations for top result
  const top = results[0];
  html += `<div class="section-divider"></div>`;
  html += `<div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-hint);margin-bottom:12px;">Recommendations (Based on Most Likely: ${top.disease.name})</div>`;
  top.disease.recommendations.forEach(rec => {
    html += `<div class="rec-card rec-${rec.level}">
      <div class="rec-title">${rec.title}</div>
      <div class="rec-text">${rec.text}</div>
    </div>`;
  });

  // Emergency note
  if (top.disease.severity === 'urgent') {
    html += `<div style="background:#fcebeb;border:2px solid #e24b4a;border-radius:12px;padding:14px 16px;margin-top:12px;">
      <div style="font-size:13px;font-weight:700;color:#a32d2d;margin-bottom:4px;">⚠ Urgent — Do not delay seeking care</div>
      <div style="font-size:13px;color:#791f1f;">This potential diagnosis is classified as URGENT. The patient should be referred to a healthcare facility as soon as possible. Do not manage this condition without professional medical oversight.</div>
    </div>`;
  }

  area.innerHTML = html;
}

// ================================================================
//  STEP NAVIGATION
// ================================================================
function goToStep(n) {
  [1,2,3].forEach(i => {
    document.getElementById(`step${i}`).classList.toggle('active', i===n);
    const tab = document.getElementById(`tab${i}`);
    tab.classList.remove('active','done');
    if (i === n) tab.classList.add('active');
    else if (i < n) tab.classList.add('done');
  });
  currentStep = n;
  if (n === 2) renderSymptoms();
}

function resetAll() {
  selectedSymptoms.clear();
  document.getElementById('pat-name').value = '';
  document.getElementById('pat-age').value = '';
  document.getElementById('pat-sex').value = '';
  document.getElementById('pat-duration').value = '';
  goToStep(1);
}

// ================================================================
//  INIT
// ================================================================
renderKB();
renderSymptoms();
