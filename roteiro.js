// Roteiro da VSL — interações da página: modo "só a fala", imprimir, checklist lembrado e índice ativo.
(() => {
  const CHAVE_MODO = 'tf-roteiro-modo';
  const CHAVE_LISTA = 'tf-roteiro-checklist';
  const ler = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* navegação privada: segue sem lembrar */ } };

  // Modo de leitura
  const botoes = [...document.querySelectorAll('[data-modo]')];
  const aplicarModo = (modo) => {
    document.body.classList.toggle('modo-fala', modo === 'fala');
    botoes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === modo)));
  };
  botoes.forEach((b) => b.addEventListener('click', () => {
    // mantém a pessoa na mesma parte do roteiro depois de esconder/mostrar blocos
    const alvo = window.scrollY > 200 ? [...document.querySelectorAll('.secao')].find((s) => s.getBoundingClientRect().bottom > 90) : null;
    aplicarModo(b.dataset.modo);
    gravar(CHAVE_MODO, b.dataset.modo);
    if (alvo) alvo.scrollIntoView({ block: 'start', behavior: 'instant' });
  }));
  if (ler(CHAVE_MODO) === 'fala') aplicarModo('fala');

  // Imprimir / salvar PDF
  document.querySelector('[data-imprimir]')?.addEventListener('click', () => window.print());

  // Checklist lembrado neste aparelho
  let marcados = {};
  try { marcados = JSON.parse(ler(CHAVE_LISTA) || '{}') || {}; } catch { marcados = {}; }
  document.querySelectorAll('input[data-guardar]').forEach((c) => {
    c.checked = !!marcados[c.id];
    c.addEventListener('change', () => {
      if (c.checked) marcados[c.id] = 1; else delete marcados[c.id];
      gravar(CHAVE_LISTA, JSON.stringify(marcados));
    });
  });

  // Índice: destaca a parte que está na tela
  const links = new Map([...document.querySelectorAll('.indice a')].map((a) => [a.hash.slice(1), a]));
  if ('IntersectionObserver' in window && links.size) {
    const visiveis = new Set();
    const marcar = () => {
      const atual = [...document.querySelectorAll('.secao')].find((s) => visiveis.has(s.id));
      links.forEach((a, id) => { if (atual && id === atual.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    };
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => (e.isIntersecting ? visiveis.add(e.target.id) : visiveis.delete(e.target.id)));
      marcar();
    }, { rootMargin: '-90px 0px -55% 0px' });
    document.querySelectorAll('.secao').forEach((s) => obs.observe(s));
  }
})();
