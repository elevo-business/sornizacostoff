(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: mobile menu, scrolled state ---------- */
  const top = document.getElementById("top");
  const menuBtn = document.getElementById("menu-btn");
  const nav = document.getElementById("main-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", open);
      nav.classList.toggle("open", open);
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      menuBtn.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    }));
  }

  /* ---------- Mobile CTA bar ---------- */
  const mcta = document.getElementById("mcta");
  const contact = document.getElementById("anfrage");
  const onScroll = () => {
    if (top) top.classList.toggle("scrolled", scrollY > 8);
    if (!mcta) return;
    let hide = false;
    if (contact) { const r = contact.getBoundingClientRect(); hide = r.top < innerHeight && r.bottom > 0; }
    mcta.classList.toggle("show", scrollY > 600 && !hide);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.remove("pre"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("pre"); io.observe(el); }
    });
  }

  /* ---------- Wendepunkte: the curve is the tab bar ---------- */
  const stops = [...document.querySelectorAll(".stop")];
  const panels = [...document.querySelectorAll(".panel")];
  const curve = document.getElementById("curve-on");
  let select = () => {};
  if (stops.length && curve) {
    const len = curve.getTotalLength();
    const xs = [0, .26, .52, .78];
    const lenAtX = fx => {
      let lo = 0, hi = len;
      for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (curve.getPointAtLength(m).x < fx * 1000) lo = m; else hi = m; }
      return lo;
    };
    const reach = xs.map(x => Math.max(.04, lenAtX(x) / len));
    curve.style.strokeDasharray = len;
    curve.style.strokeDashoffset = len * (1 - reach[0]);
    select = (i, focus) => {
      stops.forEach((s, j) => { s.setAttribute("aria-selected", j === i); s.tabIndex = j === i ? 0 : -1; });
      panels.forEach((p, j) => p.classList.toggle("on", j === i));
      curve.style.transition = reduced ? "none" : "stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)";
      curve.style.strokeDashoffset = len * (1 - reach[i]);
      if (focus) stops[i].focus();
    };
    stops.forEach((s, i) => {
      s.addEventListener("click", () => select(i));
      s.addEventListener("keydown", e => {
        if (e.key === "ArrowRight") select((i + 1) % stops.length, true);
        if (e.key === "ArrowLeft") select((i + stops.length - 1) % stops.length, true);
      });
    });
    select(0);
  }

  /* ---------- Contact form ---------- */
  const form = document.getElementById("req");
  const topic = document.getElementById("f-topic");
  const hint = document.getElementById("form-hint");
  const prefill = (t, msg) => {
    if (!topic) return;
    [...topic.options].forEach(o => { if (o.text === t) topic.value = o.value; });
    if (hint && msg) { hint.textContent = msg; hint.hidden = false; }
  };
  document.querySelectorAll("[data-topic]").forEach(a => a.addEventListener("click", () => prefill(a.dataset.topic, `Thema ausgewählt: ${a.dataset.topic}`)));
  const fromUrl = new URLSearchParams(location.search).get("thema");
  if (fromUrl) prefill(fromUrl, `Thema ausgewählt: ${fromUrl}`);

  if (form) {
    const msg = document.getElementById("form-msg");
    const show = (title, text, err) => {
      msg.innerHTML = "";
      const b = document.createElement("b"); b.textContent = title;
      msg.append(b, document.createTextNode(text));
      msg.classList.toggle("err", !!err);
      msg.hidden = false;
    };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const bad = [...form.querySelectorAll("[required]")].find(el => !el.checkValidity());
      if (bad) { bad.focus(); if (bad.reportValidity) bad.reportValidity(); return; }
      const key = form.dataset.accessKey;
      if (!key) {
        show("Formular noch nicht verbunden.", " Die Anfrage wurde nicht versendet. Schreib mir bitte direkt an contact@costoff.de oder buche einen Termin über den Kalender.", true);
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      if (data.botcheck) return;
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: key, subject: `Neue Anfrage über costoff.de: ${data.topic}`, from_name: "costoff.de", ...data })
        });
        const out = await res.json();
        if (!res.ok || !out.success) throw new Error(out.message || res.status);
        form.reset();
        show("Danke für deine Nachricht!", " Ich melde mich persönlich bei dir, um einen Termin für das Erstgespräch zu finden.");
      } catch (err) {
        show("Das hat leider nicht geklappt.", " Bitte versuch es noch einmal oder schreib mir direkt an contact@costoff.de.", true);
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------- Self-test ---------- */
  const quiz = document.getElementById("quiz");
  if (!quiz) return;
  const P = {
    A: { tab: 0, name: "Karriere-Coaching", topic: "Karriere-Coaching", href: "leistungen.html#karriere-coaching",
         text: "Du spürst, dass sich etwas ändern muss, aber die Richtung ist noch offen. Im Karriere-Coaching finden wir heraus, was du mitbringst, was dich antreibt und was der Markt sucht. Daraus entsteht eine Positionierung, hinter der du stehst." },
    B: { tab: 1, name: "Bewerbungstraining & Outplacement", topic: "Bewerbungstraining & Outplacement", href: "leistungen.html#bewerbung-outplacement",
         text: "Bei dir geht es um Tempo und Wirkung. Wir bringen Lebenslauf, Profil, Vorstellungsgespräch und Gehaltsverhandlung auf den Punkt, damit du schnell wieder Fuß fasst und nicht unter Wert unterschreibst." },
    C: { tab: 2, name: "Onboarding", topic: "Onboarding", href: "leistungen.html#onboarding",
         text: "Die neue Rolle steht oder kommt bald. Wir bereiten deine ersten 100 Tage vor, damit aus Freude über die Zusage kein Druck wird und du die Probezeit sicher bestehst." },
    D: { tab: 3, name: "Executive Coaching", topic: "Executive Coaching", href: "leistungen.html#executive-coaching",
         text: "Du bist in deiner Rolle angekommen, aber bestimmte Themen kommen immer wieder. Im Executive Coaching arbeiten wir an Kommunikation, Selbstmanagement, Stress und Präsenz, bis sich im Alltag etwas ändert." },
    N: { name: "Gerade brauchst du kein Coaching",
         text: "Deine Antworten klingen nach Klarheit und Tatkraft. Ein Coaching wäre im Moment eher ein Bonus als eine Notwendigkeit. Wenn sich das ändert, mach den Test einfach noch einmal oder schreib mir." }
  };
  const Q = [
    { q: "Wie würdest du deine berufliche Situation gerade beschreiben?", a: [
      ["Ich bin im Job, aber zunehmend unzufrieden.", { A: 3 }],
      ["Mein Job endet oder ist bereits beendet.", { B: 3 }],
      ["Ich habe eine neue Position zugesagt oder starte bald.", { C: 3 }],
      ["Ich führe und will als Führungskraft wachsen.", { D: 3 }],
      ["Eigentlich läuft alles gut. Ich will mich nur orientieren.", { N: 3 }] ] },
    { q: "Wie lange beschäftigt dich das Thema schon?", a: [
      ["Erst seit kurzem.", { N: 1 }],
      ["Seit einigen Monaten.", { A: 1, D: 1 }],
      ["Es kommt immer wieder, egal was ich versuche.", { D: 2, A: 1 }],
      ["Es ist akut, jetzt muss etwas passieren.", { B: 2, C: 1 }] ] },
    { q: "Was passiert, wenn du an das Thema denkst?", a: [
      ["Ich gehe es an, sobald ich Zeit habe.", { N: 2 }],
      ["Ich schiebe es vor mir her.", { A: 2, D: 1 }],
      ["Ich mache mir Sorgen, ob ich es diesmal schaffe.", { C: 2, B: 1 }],
      ["Ich weiß nicht, wo ich anfangen soll.", { A: 2, B: 1 }] ] },
    { q: "Wie gut setzt du deine Vorsätze gerade um?", a: [
      ["Gut, mir fehlt nur die Richtung.", { A: 2 }],
      ["Ich weiß, was zu tun wäre, komme aber nicht ins Tun.", { D: 2, A: 1 }],
      ["Mir fehlt das Handwerkszeug, etwa für Lebenslauf oder Gespräche.", { B: 2 }],
      ["Gut. Ich brauche eigentlich keine Unterstützung.", { N: 2 }] ] },
    { q: "Wie ist das Verhältnis zu deiner Führungskraft?", a: [
      ["Gut und offen.", { N: 1 }],
      ["Angespannt. Gespräche laufen oft an derselben Stelle schief.", { D: 2 }],
      ["Ich habe bald eine neue Führungskraft oder bin selbst neu in der Rolle.", { C: 2 }],
      ["Spielt keine Rolle mehr, ich gehe ohnehin.", { B: 2 }] ] },
    { q: "Wie stark ist der Druck gerade?", a: [
      ["Kaum spürbar.", { N: 2 }],
      ["Spürbar, aber im Griff.", { A: 1, D: 1 }],
      ["Hoch. Er kostet mich Schlaf oder Energie.", { D: 2, B: 1 }],
      ["Sehr hoch. Es gibt eine Frist.", { B: 2, C: 1 }] ] },
    { q: "Welche Unterstützung wünschst du dir am meisten?", a: [
      ["Eine fundierte Analyse meiner Stärken und Motive.", { A: 2 }],
      ["Eine Strategie für Bewerbung, Profil und Netzwerk.", { B: 2, A: 1 }],
      ["Einen Sparringspartner für die ersten Monate.", { C: 2 }],
      ["Konkrete Arbeit an meinen Führungsthemen.", { D: 2 }],
      ["Eigentlich nur einen kurzen Impuls.", { N: 2 }] ] }
  ];
  let step = -1, picks = [];
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const head = (label, pct) => `<div class="quiz-top"><span>${label}</span><b>${pct}&nbsp;%</b></div><div class="bar"><i style="width:${pct}%"></i></div>`;

  function intro() {
    quiz.innerHTML = `${head("Selbsttest", 0)}
      <h3>Sieben Fragen zu deiner beruflichen Situation.</h3>
      <p class="muted">Antworte aus dem Bauch heraus. Es gibt keine richtigen oder falschen Antworten, und deine Antworten bleiben in deinem Browser.</p>
      <div><button class="btn btn-ink" type="button" id="q-start">Test starten <span class="arrow" aria-hidden="true">→</span></button></div>`;
    quiz.querySelector("#q-start").onclick = () => { step = 0; render(); };
  }
  function render() {
    if (step >= Q.length) return result();
    const item = Q[step];
    quiz.innerHTML = `${head(`Frage ${step + 1} von ${Q.length}`, Math.round(step / Q.length * 100))}
      <h3>${esc(item.q)}</h3>
      <div class="answers" role="group" aria-label="Antworten">
        ${item.a.map((a, i) => `<button type="button" class="answer" data-i="${i}" aria-pressed="${picks[step] === i}">${esc(a[0])}</button>`).join("")}
      </div>
      <div class="quiz-nav"><button type="button" class="linkbtn" id="q-back" ${step === 0 ? "disabled" : ""}>← Zurück</button><button type="button" class="linkbtn" id="q-reset">Neu beginnen</button></div>`;
    quiz.querySelectorAll(".answer").forEach(b => b.onclick = () => {
      picks[step] = +b.dataset.i;
      quiz.querySelectorAll(".answer").forEach(x => x.setAttribute("aria-pressed", x === b));
      setTimeout(() => { step++; render(); }, 240);
    });
    quiz.querySelector("#q-back").onclick = () => { if (step > 0) { step--; render(); } };
    quiz.querySelector("#q-reset").onclick = () => { step = -1; picks = []; intro(); };
  }
  function result() {
    const score = { A: 0, B: 0, C: 0, D: 0, N: 0 };
    picks.forEach((p, i) => { const w = Q[i].a[p][1]; for (const k in w) score[k] += w[k]; });
    const order = ["A", "B", "C", "D"].sort((a, b) => score[b] - score[a]);
    const none = score.N >= 7 && score.N > score[order[0]];
    const best = none ? P.N : P[order[0]];
    const second = !none && score[order[1]] >= 4 ? P[order[1]] : null;
    quiz.innerHTML = `${head("Dein Ergebnis", 100)}
      <div class="result">
        <p class="kicker">${none ? "Ehrliche Einschätzung" : "Am besten passt zu dir"}</p>
        <h3>${esc(best.name)}</h3>
        <p>${esc(best.text)}</p>
        ${second ? `<p class="fit">Auch Elemente aus <b>${esc(second.name)}</b> könnten für dich eine Rolle spielen. Das klären wir im Erstgespräch.</p>` : ""}
        <div class="actions">
          ${none
            ? `<a class="btn btn-line" href="#anfrage">Trotzdem kurz sprechen</a>`
            : `<a class="btn btn-ink" href="#anfrage" id="q-cta">Erstgespräch dazu anfragen <span class="arrow" aria-hidden="true">→</span></a>
               <a class="tlink" href="${best.href}">Mehr zu ${esc(best.name)}</a>`}
        </div>
        <div class="quiz-nav"><button type="button" class="linkbtn" id="q-back">← Letzte Frage ändern</button><button type="button" class="linkbtn" id="q-reset">Neu beginnen</button></div>
      </div>`;
    const cta = quiz.querySelector("#q-cta");
    if (cta) cta.onclick = () => prefill(best.topic, `Dein Selbsttest-Ergebnis „${best.name}“ ist schon ausgewählt.`);
    quiz.querySelector("#q-back").onclick = () => { step = Q.length - 1; render(); };
    quiz.querySelector("#q-reset").onclick = () => { step = -1; picks = []; intro(); };
  }
  intro();
})();
