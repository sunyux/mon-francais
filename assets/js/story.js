/* story.js — "story video" player: animated scenes narrated in French,
   with karaoke-style word highlighting and translated subtitles.
   story = { title:{fr,zh,en}, scenes:[{ emoji, bg, time?:'07:45', fr, zh, en }] }
   bg is one of: dawn morning noon afternoon evening night summer autumn winter spring */
(function () {
  const FL = window.FL;
  const B = FL.bi;

  // a painted sun or moon for the scene's sky, instead of emoji
  const MOON = ['night', 'evening', 'dawn'];
  function celestial(bg) {
    const moon = MOON.includes(bg);
    const low = ['dawn', 'evening', 'autumn'].includes(bg);
    return `<svg viewBox="0 0 400 300" class="celestial ${moon ? 'is-moon' : 'is-sun'} ${low ? 'is-low' : ''}" aria-hidden="true">
      <defs>
        <radialGradient id="glow-${bg}"><stop offset="0" stop-color="${moon ? '#f2ead2' : '#fff1c4'}" stop-opacity=".7"/><stop offset="1" stop-color="${moon ? '#f2ead2' : '#ffd27a'}" stop-opacity="0"/></radialGradient>
        <radialGradient id="disc-${bg}" cx=".4" cy=".35"><stop offset="0" stop-color="${moon ? '#fbf6e6' : '#fff8dc'}"/><stop offset="1" stop-color="${moon ? '#cfc6ad' : '#f3c35a'}"/></radialGradient>
      </defs>
      <circle cx="200" cy="${low ? 190 : 130}" r="130" fill="url(#glow-${bg})"/>
      <circle cx="200" cy="${low ? 190 : 130}" r="${moon ? 34 : 40}" fill="url(#disc-${bg})"/>
      ${moon ? `<circle cx="214" cy="${low ? 182 : 122}" r="30" class="moon-shadow"/>` : ''}
    </svg>`;
  }

  FL.Story = {
    mount(el, story) {
      let idx = 0, playing = false, tok = 0, fallbackT = null, gotBoundary = false;
      el.innerHTML = `
        <div class="story">
          <div class="stage">
            <div class="st-scene">
              <div class="st-emoji"></div>
              <div class="st-clock"></div>
            </div>
            <div class="st-caption">
              <div class="st-fr fr" lang="fr"></div>
              <div class="st-tr"></div>
            </div>
            <button type="button" class="st-big-play" aria-label="Play">▶</button>
            <div class="st-num"></div>
          </div>
          <div class="st-ctrl">
            <button type="button" class="btn ghost icon" data-st="prev" aria-label="Previous scene"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6 5h2v14H6zm3.5 7L19 5v14z"/></svg></button>
            <button type="button" class="btn primary st-play" data-st="play">▶ ${B('播放', 'Play')}</button>
            <button type="button" class="btn ghost icon" data-st="next" aria-label="Next scene"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M16 5h2v14h-2zM5 5l9.5 7L5 19z"/></svg></button>
            <button type="button" class="btn ghost" data-st="repeat" title="重播这一句 Replay line">↺</button>
            <div class="st-dots">${story.scenes.map((_, i) => `<button type="button" data-go="${i}" aria-label="Scene ${i + 1}"></button>`).join('')}</div>
            <label class="check"><input type="checkbox" data-sub checked> ${B('翻译字幕', 'Subtitles')}</label>
          </div>
        </div>`;
      const stage = el.querySelector('.stage');
      const frEl = el.querySelector('.st-fr');
      const playBtn = el.querySelector('.st-play');

      function render(i) {
        const s = story.scenes[i];
        [...stage.classList].forEach(c => { if (c.startsWith('bg-') || c === 'enter') stage.classList.remove(c); });
        stage.classList.add(`bg-${s.bg || 'morning'}`);
        void stage.offsetWidth; // restart the entrance animation
        stage.classList.add('enter');
        el.querySelector('.st-emoji').innerHTML = celestial(s.bg);
        const clock = el.querySelector('.st-clock');
        if (s.time) {
          const [h, m] = s.time.split(':').map(Number);
          clock.innerHTML = FL.clockSVG(h, m, { cls: 'mini' }) + `<span>${s.time}</span>`;
          clock.hidden = false;
        } else clock.hidden = true;
        // one span per word with its char offset, for the speech boundary highlight
        let pos = 0;
        frEl.innerHTML = s.fr.split(/(\s+)/).map(tok => {
          const start = pos; pos += tok.length;
          return /^\s+$/.test(tok) ? tok : `<span class="w" data-s="${start}" data-e="${pos}">${FL.esc(tok)}</span>`;
        }).join('');
        FL.markVerbs(frEl);
        el.querySelector('.st-tr').innerHTML = B(s.zh, s.en);
        el.querySelector('.st-num').textContent = `${i + 1} / ${story.scenes.length}`;
        el.querySelectorAll('[data-go]').forEach((d, k) => d.classList.toggle('on', k === i));
      }
      function highlight(ci) {
        frEl.querySelectorAll('.w').forEach(w => {
          const on = ci >= +w.dataset.s && ci < +w.dataset.e;
          w.classList.toggle('now', on);
          if (ci >= +w.dataset.e) w.classList.add('said');
        });
      }
      function speakScene() {
        const my = ++tok;
        const s = story.scenes[idx];
        gotBoundary = false;
        frEl.querySelectorAll('.w').forEach(w => w.classList.remove('now', 'said'));
        clearInterval(fallbackT);
        // browsers without word boundary events: estimate the highlight from speaking speed
        const t0 = Date.now();
        fallbackT = setInterval(() => {
          if (gotBoundary || my !== tok) return clearInterval(fallbackT);
          highlight(((Date.now() - t0) / 1000) * 13 * FL.rate());
        }, 80);
        FL.speak(s.fr, {
          onboundary: e => { if (my !== tok) return; gotBoundary = true; highlight(e.charIndex); },
          onend: () => {
            if (my !== tok) return;
            clearInterval(fallbackT);
            highlight(1e9);
            if (!playing) return;
            setTimeout(() => {
              if (my !== tok || !playing) return;
              if (idx < story.scenes.length - 1) { idx++; render(idx); speakScene(); }
              else setPlaying(false);
            }, 1300);
          },
        });
      }
      function setPlaying(p) {
        playing = p;
        stage.classList.toggle('is-playing', p);
        playBtn.innerHTML = p ? `⏸ ${B('暂停', 'Pause')}` : `▶ ${B('播放', 'Play')}`;
        if (!p) { tok++; clearInterval(fallbackT); FL.stopSpeech(); }
      }
      function go(i) {
        idx = (i + story.scenes.length) % story.scenes.length;
        render(idx);
        speakScene(); // when paused this reads the line once without advancing
      }

      el.addEventListener('click', e => {
        if (e.target.closest('.verb')) return;
        const b = e.target.closest('[data-st], [data-go], .st-big-play');
        if (!b) return;
        if (b.matches('.st-big-play') || b.dataset.st === 'play') {
          if (playing) return setPlaying(false);
          if (idx === story.scenes.length - 1 && b.matches('.st-big-play')) idx = 0;
          setPlaying(true); render(idx); speakScene();
          return;
        }
        if (b.dataset.go) return go(+b.dataset.go);
        if (b.dataset.st === 'next') go(idx + 1);
        if (b.dataset.st === 'prev') go(idx - 1);
        if (b.dataset.st === 'repeat') speakScene();
      });
      // stop narrating when the book turns away from this page
      document.addEventListener('fl:pageturn', () => { if (playing && !el.isConnected) setPlaying(false); });
      el.querySelector('[data-sub]').addEventListener('change', e => stage.classList.toggle('no-sub', !e.target.checked));
      render(0);
    },
  };
})();
