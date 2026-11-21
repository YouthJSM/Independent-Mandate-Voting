'use strict';
/* Independent Mandate – voting app (tablet). Frontend only. Verification is SIMULATED in demo mode. */
const C = window.IMV_CONFIG, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const S = { step: 1, ward: null, pr: null, review: false, scanned: false, data: null, voter: null, receipt: null, last: Date.now() };

/* Backend calls (see API.md). Demo mode when API_BASE is empty. */
const API = {
  live: () => !!C.API_BASE,
  async req(p, m = 'GET', b){ const r = await fetch(C.API_BASE + p, { method: m, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: b && JSON.stringify(b) }); if (!r.ok) throw new Error(r.status); return r.json(); },
  voter(){ return this.live() ? this.req(C.ENDPOINTS.voter) : Promise.resolve(C.DEMO.voter); },
  verify(otp){ return this.live() ? this.req(C.ENDPOINTS.verify, 'POST', { otp }) : Promise.resolve({ ok: otp === C.DEMO_OTP }); },
  ballot(){ return this.live() ? this.req(C.ENDPOINTS.ballot) : Promise.resolve(C.DEMO); },
  cast(b){ return this.live() ? this.req(C.ENDPOINTS.cast, 'POST', b) : Promise.resolve({ ok: true }); }
};

/* Steps */
const TITLES = { 1: 'VOTER VERIFICATION', 2: 'WARD COUNCILLOR', 3: 'PARTY VOTE', 4: 'REVIEW YOUR BALLOTS', 5: 'YOUR RECEIPT' };
const find = (k, id) => S.data && S.data[k].find(o => o.id === id);
function go(n){
  S.step = n; $$('.step').forEach(s => s.hidden = s.id !== 's' + n);
  $$('.stp').forEach((x, i) => { x.classList.toggle('on', i + 1 === n); x.classList.toggle('done', i + 1 < n); });
  $('#pageTitle').textContent = TITLES[n]; $('#hero').hidden = n !== 1;
  const b = $('#hBack'); b.hidden = n === 1 || n === 5; b.textContent = { 2: '✕ Exit', 3: '← Back', 4: '← Edit' }[n] || '';
  $('#readBtn').hidden = n < 2 || n > 4;
  $('#wardNext').textContent = S.review ? 'Back to review →' : 'Next: Ballot 2 of 2 →';
  if (n === 4) { S.review = false; renderReview(); }
  clearTimeout(S.t5); if (n === 5) S.t5 = setTimeout(resetAll, C.RECEIPT_SECONDS * 1000);
  updateSel(); scrollTo(0, 0); S.last = Date.now();
}
function resetAll(){
  Object.assign(S, { ward: null, pr: null, review: false, scanned: false, data: null, receipt: null });
  $$('#otp input').forEach(i => i.value = ''); $('#scanMsg').textContent = ''; $('#unlockMsg').textContent = ''; $('#sealMsg').textContent = '';
  $('#confirmBox').checked = false; $('#seal').textContent = '🗳️ Seal and submit vote to ballot box'; $('#wardSearch').value = $('#prSearch').value = '';
  checkUnlock(); go(1);
}

/* Step 1: voter, scan, OTP */
function renderVoter(){
  const v = S.voter, dl = $('#voterDl'); dl.replaceChildren();
  [['Name', v.name], ['ID number', v.idMasked], ['Municipality', v.municipality], ['Ward / district', v.ward + ' · ' + v.vd]].forEach(([k, x]) => { dl.append(el('dt', '', k), el('dd', '', x)); });
  $('#otpLbl').textContent = 'Enter the 6-digit SMS code sent to ending ' + v.phoneLast4;
}
const otpValue = () => $$('#otp input').map(i => i.value).join('');
function checkUnlock(){ $('#unlock').disabled = !(S.scanned && otpValue().length === 6); }
for (let i = 0; i < 6; i++) {
  const inp = el('input'); inp.inputMode = 'numeric'; inp.maxLength = 1; inp.setAttribute('aria-label', 'Digit ' + (i + 1)); $('#otp').append(inp);
  inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, ''); if (inp.value && inp.nextElementSibling) inp.nextElementSibling.focus(); checkUnlock(); });
  inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && inp.previousElementSibling) inp.previousElementSibling.focus(); });
}
$('#scanBtn').onclick = () => { const m = $('#scanMsg'); m.textContent = 'Scanning…';
  setTimeout(() => { S.scanned = true; m.textContent = '✔ Fingerprint matched (demo)'; checkUnlock(); }, 1200); };
$('#unlock').onclick = async () => {
  const m = $('#unlockMsg'); m.textContent = 'Checking…';
  try {
    const r = await API.verify(otpValue()); if (!r.ok) { m.textContent = '✖ That code is not correct. Try again.'; return; }
    S.data = await API.ballot(); renderList('ward'); renderList('pr'); m.textContent = ''; go(2);
  } catch (e) { m.textContent = '✖ Could not verify right now. Please call an official.'; }
};

/* Steps 2 and 3: choose one */
const initials = n => n.split(/[ ,]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('');
const pic = (cls, url, fallback) => { const d = el('span', cls); if (url) { const i = el('img'); i.src = url; i.alt = ''; d.append(i); } else d.textContent = fallback; return d; };
function renderList(k){
  const box = $('#' + k + 'List'); box.replaceChildren();
  S.data[k].forEach(o => {
    const b = el('button', 'opt'); b.type = 'button'; b.setAttribute('aria-pressed', S[k] === o.id);
    const nm = el('span', 'nm'); nm.append(el('b', '', o.name)); if (o.party) nm.append(el('small', '', o.party));
    if (k === 'ward') b.append(pic('av', o.photo, initials(o.name)));
    b.append(nm, pic('lg', o.logo, o.acr || ''), el('span', 'chk', S[k] === o.id ? '✔ Selected' : ''));
    b.onclick = () => { S[k] = o.id; renderList(k); updateSel(); }; box.append(b);
  });
  filter(k);
}
function filter(k){ const q = $('#' + k + 'Search').value.toLowerCase(); $$('#' + k + 'List .opt').forEach(b => b.hidden = !b.textContent.toLowerCase().includes(q)); }
['ward', 'pr'].forEach(k => {
  $('#' + k + 'Search').oninput = () => filter(k);
  $('#' + k + 'Clear').onclick = () => { S[k] = null; renderList(k); updateSel(); };
});
function updateSel(){
  if (!S.data) return;
  const w = find('ward', S.ward), p = find('pr', S.pr);
  $('#wardSel').textContent = w ? `SELECTION: ${w.name} (${w.party})` : 'No candidate selected yet.'; $('#wardNext').disabled = !w;
  $('#prSel').textContent = p ? 'SELECTION: ' + p.name : 'No party selected yet.'; $('#prNext').disabled = !p;
}
$('#wardNext').onclick = () => go(S.review ? 4 : 3);
$('#prNext').onclick = () => go(4);
$('#hBack').onclick = () => { if (S.step === 2) { if (confirm('Exit the voting booth? Your choices will be cleared.')) resetAll(); } else go(S.step - 1); };

/* Step 4: review and seal */
function renderReview(){
  const w = find('ward', S.ward), p = find('pr', S.pr);
  $('#revWard').textContent = w ? `✔ Marked [X]: ${w.name} (${w.party})` : '';
  $('#revPr').textContent = p ? `✔ Marked [X]: ${p.name}` : '';
  $('#confirmBox').checked = false; $('#seal').disabled = true; $('#sealMsg').textContent = '';
}
$('#chWard').onclick = () => { S.review = true; go(2); };
$('#chPr').onclick = () => { S.review = true; go(3); };
$('#confirmBox').onchange = e => $('#seal').disabled = !e.target.checked;
const makeHash = () => { const h = [...crypto.getRandomValues(new Uint8Array(6))].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase(); return `#IM-${h.slice(0,4)}-${h.slice(4,8)}-${h.slice(8)}`; };
$('#seal').onclick = async () => {
  const b = $('#seal'), hash = makeHash(); b.disabled = true; b.textContent = 'Sealing…';
  try {
    const r = await API.cast({ ward: S.ward, pr: S.pr, receipt: hash }); if (!r.ok) throw new Error('rejected');   // never send the voter's ID with the ballot
    const time = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + ' SAST';
    S.receipt = { hash, time, ward: S.voter.ward, vd: S.voter.vd }; S.ward = S.pr = null;
    $('#rcptBox').textContent = `Your ballots have been encrypted and deposited into the ${S.receipt.ward} / VD ${S.receipt.vd} digital ballot box.`;
    $('#rcptTime').textContent = time; $('#rcptHash').textContent = hash; go(5);
  } catch (e) { $('#sealMsg').textContent = '✖ Could not submit your vote. Please call an official. Your choices are kept.'; b.disabled = false; b.textContent = '🗳️ Seal and submit vote to ballot box'; }
};

/* Step 5: downloadable receipt and badge (images made in the browser; choices are never included) */
function paint(kind, img){
  const c = document.createElement('canvas'); c.width = 800; c.height = kind === 'badge' ? 800 : 1000; const x = c.getContext('2d'), r = S.receipt;
  x.fillStyle = kind === 'badge' ? '#3F0F23' : '#F5F1E8'; x.fillRect(0, 0, 800, c.height); x.textAlign = 'center';
  if (kind === 'badge') {
    x.save(); x.beginPath(); x.arc(400, 330, 250, 0, 7); x.clip(); x.fillStyle = '#F5F1E8'; x.fillRect(0, 0, 800, 800); if (img) x.drawImage(img, 467, 85, 440, 440, 150, 80, 500, 500); x.restore();
    x.fillStyle = '#fff'; x.font = 'bold 96px Georgia'; x.fillText('I VOTED', 400, 680); x.font = '32px Georgia'; x.fillText('INDEPENDENT MANDATE', 400, 740);
  } else {
    x.fillStyle = '#3F0F23'; x.fillRect(0, 0, 800, 150); x.fillStyle = '#fff'; x.font = 'bold 44px Georgia'; x.fillText('INDEPENDENT MANDATE', 400, 92);
    x.fillStyle = '#1F4E79'; x.font = 'bold 52px Georgia'; x.fillText('✓ VOTE CAST AND SEALED', 400, 270);
    x.fillStyle = '#2A1620'; x.font = '32px Georgia'; [`${r.ward} / VD ${r.vd}`, "Voters' roll: MARKED AS VOTED", r.time, 'Anonymous audit hash'].forEach((t, i) => x.fillText(t, 400, 370 + i * 70));
    x.font = 'bold 54px monospace'; x.fillText(r.hash, 400, 700); x.fillStyle = '#6B5A62'; x.font = '26px Georgia'; x.fillText('This receipt does not show your choices.', 400, 860);
  }
  return c;
}
async function makeCard(kind){
  const img = await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'logo.jpg'; });
  for (const use of [img, null]) { try { return await new Promise(res => paint(kind, use).toBlob(res, 'image/png')); } catch (e) { /* canvas blocked: retry without logo */ } }
}
const save = (blob, name) => { const a = el('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
$('#saveRcpt').onclick = async () => save(await makeCard('receipt'), 'IM-vote-receipt.png');
$('#shareBadge').onclick = async () => {
  const blob = await makeCard('badge'), f = new File([blob], 'I-Voted.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], text: 'I voted! #IndependentMandate' }); } catch (e) {} } else save(blob, 'I-Voted.png');
};
$('#home').onclick = resetAll;

/* Read aloud */
const VL = { en: 'en-ZA', zu: 'zu-ZA', xh: 'xh-ZA', af: 'af-ZA', nso: 'nso-ZA', tn: 'tn-ZA', st: 'st-ZA', ts: 'ts-ZA', ss: 'ss-ZA', ve: 've-ZA', nr: 'nr-ZA' };
$('#readBtn').onclick = () => {
  const s = window.speechSynthesis; if (!s) return; s.cancel();
  const code = VL[$('#lang').value], vs = s.getVoices(), v = vs.find(x => x.lang.toLowerCase().startsWith(code.slice(0, 2))) || vs.find(x => x.lang.startsWith('en'));
  (($('.step:not([hidden])').innerText.replace(/\s+/g, ' ')).match(/[^.!?]+[.!?]*/g) || []).forEach(t => { const u = new SpeechSynthesisUtterance(t); if (v) { u.voice = v; u.lang = v.lang; } s.speak(u); });
};

/* Kiosk safety: reset when idle; install as an app; offline support */
['pointerdown', 'keydown'].forEach(e => addEventListener(e, () => S.last = Date.now()));
setInterval(() => { if (S.step >= 2 && S.step <= 4 && Date.now() - S.last > C.IDLE_SECONDS * 1000) resetAll(); }, 5000);
let deferred; addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#installBtn').hidden = false; });
$('#installBtn').onclick = async () => { if (deferred) { deferred.prompt(); await deferred.userChoice; $('#installBtn').hidden = true; } };
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

/* Start */
$('#siteLink').href = C.WEBSITE_URL; $('#verifyLink').href = C.WEBSITE_URL + '#verify';
if (!API.live()) $('#demoHint').textContent = 'Simulation code: ' + C.DEMO_OTP;
API.voter().then(v => { S.voter = v; renderVoter(); }).catch(() => $('#unlockMsg').textContent = '✖ Could not load the voter. Please call an official.');
go(1);