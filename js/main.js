/* Gasthof Hirsch – Öffnungsstatus aus den belegten Zeiten (Mittag + Abend), Laterne brennt nur bei „geöffnet“, Schild schwingt beim Scrollen */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = $('#hours'); if (!el) return;
  const H = JSON.parse(el.textContent);
  const p = {}; new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date()).forEach(x => p[x.type] = x.value);
  const d = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday], h = (+p.hour % 24) + (+p.minute) / 60;
  const f = v => { if (v >= 24) return '24 Uhr'; const a = Math.floor(v), m = Math.round((v - a) * 60); return a + (m ? ':' + String(m).padStart(2, '0') : '') + ' Uhr'; };
  const N = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const today = H[String(d)] || [];
  const ci = today.findIndex(r => h >= r[0] && h < r[1]), cur = today[ci];
  let next = null;
  for (let k = 0; k < 8 && !next; k++) {
    const dd = (d + k) % 7, rs = H[String(dd)] || [];
    const r = rs.find(r => k > 0 || h < r[0]);
    if (r) next = { k, dd, t: r[0] };
  }
  const nextTxt = next ? (next.k === 0 ? 'heute ab ' : next.k === 1 ? 'morgen (' + N[next.dd] + ') ab ' : N[next.dd] + ' ab ') + f(next.t) : '';
  const status = cur ? '● Jetzt geöffnet – bis ' + f(cur[1]) : '● Gerade geschlossen' + (nextTxt ? ' – wieder ' + nextTxt : '');
  $$('[data-open]').forEach(x => { x.textContent = status; x.classList.add(cur ? 'is-open' : 'is-closed'); });
  document.documentElement.classList.toggle('is-open', !!cur);
  const lt = $('[data-lantern-t]'); if (lt) lt.textContent = cur ? 'Die Laterne brennt – wir haben offen!' : 'Laterne aus – ' + (nextTxt ? 'wieder ' + nextTxt : 'Ruhetag');
  const nx = $('[data-next]'); if (nx) nx.textContent = cur ? 'jetzt – bis ' + f(cur[1]) : nextTxt;
  const row = $('.wk-row[data-day="' + d + '"]');
  if (row) { row.classList.add('today'); if (cur) { const s = $$('.wk-slot', row)[ci]; if (s) s.classList.add('now'); } }
  // Schild schwingt mit der Scroll-Geschwindigkeit nach
  const sign = $('[data-swing]');
  if (sign && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let last = scrollY, v = 0, raf = 0;
    const tick = () => { v *= .9; sign.style.setProperty('--sw', Math.max(-7, Math.min(7, v)).toFixed(2)); raf = Math.abs(v) > .05 ? requestAnimationFrame(tick) : 0; };
    addEventListener('scroll', () => { const y = scrollY; v += (y - last) * .06; last = y; if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  }
})();
