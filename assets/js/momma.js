/* MOMMA: regla de la pizza, armador de cucuruchos y coreografía de la página */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const euros = n => n.toFixed(2).replace('.', ',').replace(',00', '') + ' €';
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Datos de la carta (noviembre de 2025) */
  const PIZZAS = [
    { n: 'Fiaca', i: 'Mozzarella', s: 'Fiaca: pereza, de la buena.', p: [9.1, 17, 12], t: [] },
    { n: 'Yapa', i: 'Mozzarella, cherrys, ajo y albahaca', s: 'Yapa: lo que te dan de más.', p: [10.4, 19, 13], t: ['cherry', 'albahaca', 'ajo'] },
    { n: 'Mandinga', i: 'Mozzarella y peperoni picante', s: 'Mandinga: el diablo, y pica.', p: [10.4, 19, 13], t: ['peperoni'] },
    { n: 'Metejón', i: 'Mozzarella, emmental, cheddar y queso azul', s: 'Metejón: enamorarse sin remedio.', p: [10.4, 19, 13], t: ['emmental', 'cheddar', 'azul'] },
    { n: 'Cocoliche', i: 'Mozzarella, bacon y salsa barbacoa', s: 'Cocoliche: mezcla de italiano y criollo.', p: [10.4, 19, 13], t: ['bacon', 'barbacoa'] },
    { n: 'Yuyo', i: 'Mozzarella, champis, berenjena, olivas, pimiento rojo y cebolla', s: 'Yuyo: hierbajo, o sea, la de verduras.', p: [10.4, 19, 13], t: ['champi', 'berenjena', 'oliva', 'pimiento', 'cebolla'] },
    { n: 'Berretín', i: 'Mozzarella, cebolla cruda y orégano', s: 'Berretín: un capricho que no se te va.', p: [10.4, 19, 13], t: ['cebolla', 'oregano'] },
    { n: 'Momma', i: 'Mozzarella, huevo duro, jamón dulce, olivas y pimiento rojo', s: 'La que lleva el nombre de la casa.', p: [10.9, 21, 14], t: ['huevo', 'jamon', 'oliva', 'pimiento'] },
    { n: 'Marchanta', i: 'Mozzarella, rúcula, jamón serrano y parmesano', s: 'A la marchanta: a lo grande, sin mirar.', p: [10.9, 21, 14], t: ['rucula', 'serrano', 'parmesano'] }
  ];

  /* Generador con semilla: la misma pizza siempre sale igual */
  const azar = semilla => () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;

  const sel = $('.selector');

  /* Regla de la pizza */
  const svg = $('#pizza-svg');
  let cm = quieto ? 50 : 8, actual = 0, H = 300;
  const W = 1000, X0 = 8, X1 = 992;
  const xDe = c => X0 + ((X1 - X0) * c) / 50;

  function montarRegla() {
    H = innerWidth < 760 ? 640 : Math.min(300, Math.max(210, innerHeight * 0.34));
    const altoR = innerWidth < 760 ? 100 : 56, altoT = H - altoR;
    svg.setAttribute('viewBox', `0 0 ${W} ${H + 8}`);
    let marcas = '';
    for (let c = 0; c <= 50; c++) {
      const x = xDe(c), g = c % 10 === 0, m = c % 5 === 0;
      marcas += `<line x1="${x}" x2="${x}" y1="${altoT + 6}" y2="${altoT + 6 + (g ? 26 : m ? 18 : 10)}" stroke="#120e14" stroke-width="${g ? 3 : 1.6}"/>`;
      if (g) marcas += `<text x="${c === 50 ? x - 4 : c === 0 ? x + 4 : x}" y="${H - 5}" text-anchor="${c === 50 ? 'end' : c === 0 ? 'start' : 'middle'}" font-family="League Spartan" font-weight="800" font-size="${innerWidth < 760 ? 42 : 19}" fill="#120e14">${c}</text>`;
    }
    svg.innerHTML = `
      <rect x="0" y="4" width="${W}" height="${altoT}" rx="16" fill="#8a4a1d"/>
      <path d="M0 ${altoT * .3}H${W}M0 ${altoT * .62}H${W}" stroke="#6f3914" stroke-width="3" opacity=".6"/>
      <g id="masa"><rect id="borde" x="${X0}" y="16" width="10" height="${altoT - 24}" rx="26" fill="#d98a2f"/><rect id="queso" x="${X0 + 12}" y="28" width="10" height="${altoT - 48}" rx="17" fill="#ffd257"/></g>
      <g id="toppings"></g>
      <rect x="0" y="${altoT + 6}" width="${W}" height="${altoR - 2}" fill="#fffef8" stroke="#120e14" stroke-width="3" rx="4"/>
      ${marcas}`;
    pintar(actual, false);
    crecer();
  }

  function dibujo(tipo, r) {
    const a = r() * 360 | 0;
    const f = {
      queso: () => `<ellipse rx="${13 + r() * 16}" ry="${8 + r() * 8}" fill="#f7b632"/>`,
      cherry: () => `<circle r="15" fill="#e3241b"/><circle cx="-5" cy="-5" r="4" fill="#ff8d7f"/>`,
      albahaca: () => `<path d="M-15 0Q0-16 16 0Q0 13-15 0Z" fill="#2fa84f"/><path d="M-11 0H12" stroke="#17752f" stroke-width="2"/>`,
      ajo: () => `<ellipse rx="6" ry="9" fill="#fff6dc" stroke="#d9c58f" stroke-width="1.5"/>`,
      peperoni: () => `<circle r="20" fill="#c9331f"/><circle r="15" fill="#e0492c"/><circle cx="-5" cy="3" r="2.4" fill="#a32412"/><circle cx="6" cy="-5" r="2.4" fill="#a32412"/>`,
      emmental: () => `<path d="M-17 11L17 11L4-13Z" fill="#fff0a3"/><circle cx="1" cy="4" r="3.6" fill="#f0cf63"/>`,
      cheddar: () => `<rect x="-14" y="-11" width="28" height="22" rx="4" fill="#f58220"/>`,
      azul: () => `<ellipse rx="14" ry="10" fill="#f6f3e4"/><circle cx="-4" cy="-2" r="2.6" fill="#2f6be0"/><circle cx="5" cy="3" r="2.2" fill="#2f6be0"/>`,
      bacon: () => `<path d="M-24-5Q-12-13 0-5T24-5V6Q12-2 0 6T-24 6Z" fill="#a4351f"/><path d="M-20 1Q-10-6 0 1T20 1" stroke="#f3b6a0" stroke-width="3" fill="none"/>`,
      barbacoa: () => `<path d="M-28 0Q-14-13 0 0T28 0" stroke="#5c2410" stroke-width="5.5" fill="none" stroke-linecap="round"/>`,
      champi: () => `<path d="M-15 1A15 13 0 0 1 15 1Z" fill="#c7a988"/><rect x="-5" y="1" width="10" height="11" rx="3" fill="#e8d6bd"/>`,
      berenjena: () => `<circle r="16" fill="#54256f"/><circle r="11.5" fill="#e6d8a8"/>`,
      oliva: () => `<circle r="9" fill="#1d1a20"/><circle r="3" fill="#ffd257"/>`,
      pimiento: () => `<path d="M-19 4Q0-14 19 4" stroke="#e3241b" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      cebolla: () => `<circle r="13" fill="none" stroke="#a23a9c" stroke-width="3.6"/><circle r="6.5" fill="none" stroke="#c76bc0" stroke-width="2.4"/>`,
      oregano: () => `<circle r="2.6" fill="#3d6b2c"/><circle cx="9" cy="5" r="2" fill="#3d6b2c"/><circle cx="-7" cy="6" r="2" fill="#3d6b2c"/>`,
      huevo: () => `<ellipse rx="17" ry="14" fill="#fffef8"/><circle r="7.6" fill="#ffc21a"/>`,
      jamon: () => `<path d="M-20-11H20Q24 0 20 11H-20Q-16 0-20-11Z" fill="#f59ab0"/>`,
      rucula: () => `<path d="M-23 0L-14-7L-9-1L-1-11L4-3L13-9L24 0L13 6L5 3L-3 10L-9 3L-15 8Z" fill="#37952f"/>`,
      serrano: () => `<path d="M-23-7Q-8-15 4-7T24-3Q18 12 0 8T-23 6Z" fill="#b5324a"/><path d="M-14-3Q0-8 13 1" stroke="#f3c0c8" stroke-width="2.4" fill="none"/>`,
      parmesano: () => `<path d="M-11-3L8-6L12 3L-8 6Z" fill="#fff4cc"/>`
    }[tipo]();
    return { a, f };
  }

  function pintar(indice, reanimar = true) {
    const pizza = PIZZAS[indice], capa = $('#toppings');
    const r = azar(4021 + indice * 977);
    const alto = H - (innerWidth < 760 ? 100 : 56);
    const y0 = 44, y1 = alto - 34;
    const columnas = innerWidth < 760 ? 8 : 17, filas = innerWidth < 760 ? 4 : 3;
    let html = '';
    for (let c = 0; c < 18; c++) {
      const { a, f } = dibujo('queso', r);
      html += `<g class="q" data-x="${40 + r() * 920}" transform="translate(${40 + r() * 920} ${y0 + r() * (y1 - y0)}) rotate(${a})">${f}</g>`;
    }
    const lista = pizza.t.length ? pizza.t : [];
    let k = 0;
    if (lista.length) for (let c = 0; c < columnas; c++) for (let f0 = 0; f0 < filas; f0++) {
      const x = 46 + ((c + (f0 % 2) * .5 + (r() - .5) * .35) * 915) / columnas;
      const y = y0 + ((f0 + .5 + (r() - .5) * .4) * (y1 - y0)) / filas;
      if (lista.length === 1 && (c + f0) % 2) continue;
      const { a, f } = dibujo(lista[k++ % lista.length], r);
      html += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a}) scale(${innerWidth < 760 ? 2.3 : 1})"><g class="t" data-x="${x.toFixed(1)}">${f}</g></g>`;
    }
    capa.innerHTML = html;
    actual = indice;
    const clip = 'url(#corte-queso)';
    capa.setAttribute('clip-path', clip);
    let d = $('#corte-queso', svg);
    if (!d) { d = document.createElementNS(NS, 'clipPath'); d.id = 'corte-queso'; d.innerHTML = '<rect id="corte-r" x="0" y="0" width="10" height="1000"/>'; svg.prepend(d); }
    $('#fi-nombre').textContent = pizza.n;
    $('#fi-ing').textContent = pizza.i;
    $('#fi-sig').textContent = pizza.s;
    $('#s25').textContent = euros(pizza.p[0]);
    $('#s50').textContent = euros(pizza.p[1]);
    $('#sgl').textContent = euros(pizza.p[2]);
    $$('.selector button').forEach((b, i) => { b.setAttribute('aria-pressed', i === indice); if (i === indice && sel.scrollWidth > sel.clientWidth) sel.scrollTo({ left: b.offsetLeft - sel.clientWidth / 2 + b.offsetWidth / 2, behavior: quieto ? 'auto' : 'smooth' }); });
    crecer();
    if (reanimar && window.gsap && !quieto) gsap.fromTo('#fi-nombre', { yPercent: 28, rotate: -3, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: .5, ease: 'back.out(2.4)' });
  }

  function crecer() {
    const x = xDe(cm);
    const b = $('#borde'), q = $('#queso');
    if (!b) return;
    b.setAttribute('width', Math.max(30, x - X0));
    q.setAttribute('width', Math.max(12, x - X0 - 24));
    const cr = $('#corte-r');
    if (cr) cr.setAttribute('width', x - 8);
    $$('.t', svg).forEach(t => t.classList.toggle('on', +t.dataset.x < x - 22));
    $('.sello.s25').classList.toggle('on', cm >= 24.8);
    $('.sello.s50').classList.toggle('on', cm >= 49.5);
    const l = $('#lee-cm');
    if (l) l.textContent = `Llevas ${Math.round(cm)} cm de pizza`;
  }

  PIZZAS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = p.n; b.setAttribute('aria-pressed', i === 0);
    b.addEventListener('click', () => pintar(i));
    sel.append(b);
  });
  montarRegla();
  let tRegla;
  addEventListener('resize', () => { clearTimeout(tRegla); tRegla = setTimeout(montarRegla, 180); });

  /* Armador de cucuruchos */
  const SABORES = [
    ['Vainilla de Madagascar', '#fff0b8'], ['Mango', '#ffb21f'], ['Frambuesa', '#e8346f'], ['Cookies', '#c9a77e'],
    ['Sambayón', '#f4d36a'], ['Maracuyá', '#ffd21a'], ['Canela', '#b86a35'], ['Banana split', '#ffe89a']
  ];
  const cajaS = $('.sabores'), bolas = $('.bolas');
  const pila = [];
  let vaso = 'cucurucho';
  const precioBolas = n => (n === 0 ? 0 : n === 1 ? 2.9 : n === 2 ? 3.9 : 4.9 + (n - 3) * 1.5);
  const tamBola = () => $('.bola')?.offsetWidth || 110;
  const alturaVaso = () => $('.vaso').offsetHeight + $('.vitrina-cono').offsetHeight * .06;
  const posBola = i => {
    const t = tamBola(), base = alturaVaso() - t * (vaso === 'cucurucho' ? .3 : .36);
    return { bottom: base + i * t * .62, x: i % 2 ? t * .08 : -t * .05 };
  };
  const svgBola = (color, cara) => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6C76 6 94 26 94 52C94 62 90 68 86 72C82 77 78 72 74 76C70 80 66 74 60 78C54 82 50 75 44 79C38 83 34 75 28 78C22 81 18 74 14 72C9 68 6 62 6 52C6 26 24 6 50 6Z" fill="${color}"/><path d="M28 22C22 28 19 34 18 42" stroke="#fff" stroke-opacity=".6" stroke-width="6" fill="none" stroke-linecap="round"/>${cara ? '<g class="cara"><ellipse class="parpadea" cx="38" cy="42" rx="4.6" ry="6.6" fill="#120e14"/><ellipse class="parpadea" cx="62" cy="42" rx="4.6" ry="6.6" fill="#120e14"/><path d="M38 56Q50 68 62 56" stroke="#120e14" stroke-width="4.6" fill="none" stroke-linecap="round"/></g>' : ''}</svg>`;

  function actualizarCuenta() {
    const n = pila.length;
    $('#cuenta-precio').textContent = n ? euros(precioBolas(n)) : '0 €';
    $('#cuenta-texto').textContent = !n ? 'Elige un sabor' : n <= 3 ? `${n} ${n === 1 ? 'bola' : 'bolas'} en ${vaso === 'cucurucho' ? 'cucurucho' : 'tarrina'}` : `3 bolas y ${n - 3} extra`;
    $('#quitar').hidden = !n;
    $$('.bola .cara', bolas).forEach((c, i, l) => { c.style.display = i === l.length - 1 ? '' : 'none'; });
  }
  function reubicar() {
    pila.forEach((el, i) => { const p = posBola(i); el.style.bottom = p.bottom + 'px'; el.style.transform = `translateX(${p.x}px)`; });
  }
  function ponerBola(nombre, color) {
    if (pila.length >= 5) {
      if (window.gsap && !quieto) gsap.fromTo('.vitrina-cono', { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1.4,.25)' });
      $('#cuenta-texto').textContent = 'Hasta ahí, que se cae';
      return;
    }
    const el = document.createElement('div');
    el.className = 'bola'; el.innerHTML = svgBola(color, true);
    el.setAttribute('aria-hidden', 'true');
    bolas.append(el); pila.push(el);
    const i = pila.length - 1, p = posBola(i);
    el.style.bottom = p.bottom + 'px';
    el.style.transform = `translateX(${p.x}px)`;
    if (window.gsap && !quieto) {
      const inner = el.firstElementChild;
      gsap.fromTo(inner, { y: -$('.vitrina-cono').offsetHeight - 60, scaleY: 1.08, scaleX: .94 }, { y: 0, scaleY: 1, scaleX: 1, duration: .62, ease: 'bounce.out', transformOrigin: '50% 100%' });
      gsap.fromTo(pila.slice(0, i).map(e => e.firstElementChild).concat($('.vaso')), { y: 0 }, { y: 7, duration: .09, delay: .34, yoyo: true, repeat: 1, ease: 'power2.out' });
      gsap.delayedCall(.4, () => { if (i >= 2) gsap.fromTo('.bolas', { rotate: 0 }, { rotate: i % 2 ? 2.5 : -2.5, duration: .18, yoyo: true, repeat: 3, ease: 'sine.inOut', transformOrigin: '50% 100%' }); });
    }
    actualizarCuenta();
    $('#cuenta-viva').textContent = `Añadido ${nombre}. Total ${euros(precioBolas(pila.length))}.`;
  }
  SABORES.forEach(([n, c]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.innerHTML = `<i style="--s:${c}"></i>${n}`;
    b.addEventListener('click', () => ponerBola(n, c));
    cajaS.append(b);
  });
  $('#quitar').addEventListener('click', () => { pila.splice(0).forEach(e => e.remove()); actualizarCuenta(); $('#cuenta-viva').textContent = 'Vacío.'; });
  $$('.conmuta button').forEach(b => b.addEventListener('click', () => {
    vaso = b.dataset.vaso;
    $$('.conmuta button').forEach(o => o.setAttribute('aria-pressed', o === b));
    $('#v-cucurucho').style.display = vaso === 'cucurucho' ? '' : 'none';
    $('#v-tarrina').style.display = vaso === 'tarrina' ? '' : 'none';
    reubicar(); actualizarCuenta();
  }));
  addEventListener('resize', reubicar);
  [['Mango', '#ffb21f'], ['Vainilla de Madagascar', '#fff0b8']].forEach(([n, c]) => { const q = window.gsap; window.gsap = null; ponerBola(n, c); window.gsap = q; });

  /* ¿Está abierto? Horario de otoño-invierno publicado en su Instagram */
  const HORARIO = { 5: [16.5, 23], 6: [16.5, 23], 0: [16.5, 22] };
  try {
    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const d = ahora.getDay(), h = ahora.getHours() + ahora.getMinutes() / 60, mes = ahora.getMonth();
    if (mes >= 3 && mes <= 8) throw new Error('Fuera de la temporada otoño-invierno');
    const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    let txt;
    if (HORARIO[d] && h >= HORARIO[d][0] && h < HORARIO[d][1]) {
      txt = h >= 19.5 ? `Abierto hasta las ${HORARIO[d][1]}:00, con pizzas` : 'Abierto ahora. Pizzas desde las 19:30';
    } else if (HORARIO[d] && h < HORARIO[d][0]) txt = 'Hoy abrimos a las 16:30';
    else {
      let s = (d + 1) % 7; while (!HORARIO[s]) s = (s + 1) % 7;
      txt = `Cerrado. Volvemos el ${nombres[s]} a las 16:30`;
    }
    $$('[data-estado]').forEach(e => { e.textContent = txt; });
    $$('.horario li').forEach(li => li.classList.toggle('hoy', +li.dataset.dia === d));
  } catch { /* si falla la zona horaria, queda el horario escrito */ }

  /* Móvil: la regla ya enseña las pizzas, así que la tabla se pliega */
  const movil = matchMedia('(max-width: 760px)');
  const plegable = $('.plegable');
  const ajustarPlegable = () => { if (plegable) plegable.open = !movil.matches; };
  ajustarPlegable();
  plegable?.addEventListener('toggle', () => { plegable.querySelector('summary').textContent = plegable.open ? 'Ocultar la tabla de pizzas' : 'Ver las 9 pizzas con todos los precios'; window.ScrollTrigger?.refresh(); });

  /* Móvil: bebidas, cafés y horchata en pestañas */
  const pestanas = $('.pestanas'), rejillaB = $('.bebidas-rejilla');
  const tabs = $$('[role=tab]', pestanas);
  const elegir = (t, foco) => {
    tabs.forEach(o => { const si = o === t; o.setAttribute('aria-selected', si); o.tabIndex = si ? 0 : -1; });
    rejillaB.dataset.activa = t.getAttribute('aria-controls').slice(2);
    if (foco) t.focus();
    window.ScrollTrigger?.refresh();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => elegir(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); elegir(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  const ajustarPestanas = () => {
    pestanas.hidden = !movil.matches;
    $$('[data-pestana]').forEach(hj => { if (movil.matches) { hj.setAttribute('role', 'tabpanel'); hj.setAttribute('aria-labelledby', 'p-' + hj.dataset.pestana); } else { hj.removeAttribute('role'); hj.removeAttribute('aria-labelledby'); } });
    if (movil.matches) elegir(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]);
    else delete rejillaB.dataset.activa;
  };
  ajustarPestanas();
  movil.addEventListener('change', () => { ajustarPlegable(); ajustarPestanas(); });

  /* Saltos suaves por JS: el scroll suave de CSS rompe los recálculos de GSAP (la regla dejaba de fijarse) */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const destino = document.querySelector(a.getAttribute('href'));
    if (!destino) return;
    e.preventDefault();
    const margen = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    window.scrollTo({ top: destino.getBoundingClientRect().top + scrollY - margen, behavior: quieto ? 'auto' : 'smooth' });
    if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
    destino.focus({ preventScroll: true });
    history.replaceState(null, '', a.getAttribute('href'));
  });

  /* Navegación activa */
  const enlaces = $$('.barra nav a, .movil-nav a');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    enlaces.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.dataset.nav));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-nav]').forEach(s => io.observe(s));

  /* Coreografía */
  if (!window.gsap || !window.ScrollTrigger || quieto) { actualizarCuenta(); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* Hero: el rótulo cae letra a letra */
  const letras = $$('.logo-grande .letra');
  const entrada = gsap.timeline({ defaults: { ease: 'bounce.out' } });
  entrada
    .from(letras.slice(0, 5), { yPercent: -240, duration: 1, stagger: .09, transformOrigin: '50% 100%' })
    .from(letras[5], { yPercent: -330, rotate: 38, duration: 1.1, ease: 'elastic.out(1,.42)', transformOrigin: '50% 100%' }, '-=.5')
    .from('.lema', { scale: .4, rotate: -14, opacity: 0, duration: .55, ease: 'back.out(2.6)' }, '-=.75')
    .from('.hero-fotos .foto-mancha', { scale: 0, rotate: i => [-22, 18, 12][i], duration: .8, stagger: .08, ease: 'back.out(1.7)' }, '-=.55')
    .from('.hero .personaje', { scale: 0, rotate: -24, duration: .6, stagger: .08, ease: 'back.out(2.6)' }, '-=.5');
  letras.forEach(l => {
    const salto = () => gsap.fromTo(l, { scaleY: .72, scaleX: 1.14 }, { scaleY: 1, scaleX: 1, duration: .8, ease: 'elastic.out(1.2,.3)', overwrite: 'auto', transformOrigin: '50% 100%' });
    l.addEventListener('pointerenter', salto);
  });

  /* Hero: capas con profundidad, al puntero y al scroll */
  if (matchMedia('(pointer:fine)').matches) {
    const capas = $$('[data-prof]').map(el => ({ el, k: +el.dataset.prof, x: gsap.quickTo(el, 'x', { duration: .9, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: .9, ease: 'power3' }) }));
    $('.hero').addEventListener('pointermove', e => {
      const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
      capas.forEach(c => { c.x(dx * c.k); c.y(dy * c.k); });
    });
  }
  const salida = { scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } };
  gsap.to('.hero .fondos', { yPercent: 12, ease: 'none', ...salida });
  gsap.to('.logo-grande', { yPercent: -16, ease: 'none', ...salida });
  gsap.to('.hero-fotos', { yPercent: 12, ease: 'none', ...salida });

  /* Tira: corre sola y se acelera con el scroll */
  const pista = $('.tira-pista');
  const rueda = gsap.to(pista, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: s => {
      const v = gsap.utils.clamp(-6, 6, s.getVelocity() / 240);
      gsap.to(rueda, { timeScale: v < 0 ? v - 1 : 1 + v, duration: .25, overwrite: true });
      gsap.to(rueda, { timeScale: 1, duration: 1, delay: .3 });
    }
  });

  /* LA REGLA: scroll = centímetros. Se detiene en 25 y en 50 */
  ScrollTrigger.create({
    trigger: '.escenario', start: 'top top', end: () => '+=' + innerHeight * 1.7, pin: true, anticipatePin: 1,
    onUpdate: s => {
      const p = s.progress;
      cm = p < .28 ? 8 + (p / .28) * 17 : p < .42 ? 25 : p < .82 ? 25 + ((p - .42) / .4) * 25 : 50;
      crecer();
    }
  });
  crecer();

  /* Pizzas: la hoja se apoya en la mesa */
  gsap.from('.bajo-pizzas .hoja', { y: 90, rotate: -2.5, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.bajo-pizzas', start: 'top 82%', once: true } });
  gsap.from('.promo', { scale: .5, rotate: 12, opacity: 0, duration: .55, stagger: .08, ease: 'back.out(2.2)', scrollTrigger: { trigger: '.promos', start: 'top 85%', once: true } });

  /* Empanadas: la foto se abre como una mancha */
  if (!movil.matches) gsap.fromTo('.empanadas-foto', { scale: .55, rotate: -14 }, { scale: 1, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.empanadas', start: 'top 92%', end: 'top 25%', scrub: .6 } });
  gsap.from('.taco', { y: 40, rotate: 14, opacity: 0, stagger: .09, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: '.tacos', start: 'top 88%', once: true } });

  /* Helados: el borde violeta chorrea al bajar */
  gsap.fromTo('.ola.gotea', { scaleY: .3 }, { scaleY: 1.15, ease: 'none', scrollTrigger: { trigger: '.ola.gotea', start: 'top 95%', end: 'top 25%', scrub: .5 } });
  $$('.tres-fotos figure').forEach((f, i) => gsap.fromTo(f, { y: [50, 110, 30][i] }, { y: [-20, -40, -60][i], ease: 'none', scrollTrigger: { trigger: '.tres-fotos', start: 'top bottom', end: 'bottom top', scrub: true } }));

  /* Creps: el rótulo se balancea y las pegatinas se pegan de golpe */
  gsap.from('.rotulo', { scale: 1.6, rotate: 10, opacity: 0, duration: .55, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.rotulo', start: 'top 85%', once: true } });
  gsap.from('.fila-dulce:not(.cab)', { x: -34, opacity: 0, stagger: .05, duration: .42, ease: 'power3.out', scrollTrigger: { trigger: '.dulces-rejilla', start: 'top 72%', once: true } });
  gsap.from('.pegatina', { scale: 1.3, rotate: -30, opacity: 0, duration: .4, stagger: .12, ease: 'power4.in', scrollTrigger: { trigger: '.pegatinas', start: 'top 92%', once: true } });

  /* Batidos: desfile lateral guiado por el scroll, solo en pantallas anchas */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    const d = $('.desfile');
    const dist = () => Math.max(0, d.scrollWidth - innerWidth);
    const t = gsap.to(d, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.batidos', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1 } });
    $$('.trago').forEach((c, i) => gsap.fromTo(c, { rotate: i % 2 ? 2.5 : -2.5 }, { rotate: i % 2 ? -1.5 : 1.5, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: t, start: 'left right', end: 'right left', scrub: true } }));
  });

  /* Bebidas: hojas que entran por los lados, y la jarra que brinda */
  $$('.bebidas .hoja').forEach((h, i) => gsap.from(h, { x: i % 2 ? 110 : -110, rotate: i % 2 ? 4 : -4, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } }));

  /* Local: cada foto se desliza a su ritmo */
  $$('.mosaico img').forEach((im, i) => gsap.fromTo(im, { yPercent: 0 }, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: .3 + (i % 3) * .3 } }));
  gsap.from('.opinion', { y: 60, rotate: 7, opacity: 0, stagger: .1, duration: .7, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.opiniones', start: 'top 86%', once: true } });

  /* Cierre: ¡Pásate! salta letra a letra y el fantasma saluda */
  gsap.from('.pasate span', { yPercent: 90, rotate: i => (i % 2 ? 10 : -10), duration: .85, stagger: .05, ease: 'elastic.out(1,.5)', scrollTrigger: { trigger: '.pasate', start: 'top 90%', once: true } });
  gsap.to('#fp-brazo', { rotate: -16, duration: .42, yoyo: true, repeat: 7, repeatDelay: .02, ease: 'sine.inOut', scrollTrigger: { trigger: '.pie', start: 'top 85%', toggleActions: 'restart none none none' } });

  /* Refresco final, por si las fuentes cambian medidas */
  addEventListener('load', () => ScrollTrigger.refresh());
  addEventListener('pageshow', e => { if (e.persisted) ScrollTrigger.refresh(); });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  actualizarCuenta();
})();
