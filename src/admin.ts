import './admin.css';
import { supabase, type Category, type MenuItem } from './supabase';

const app = document.getElementById('app') as HTMLElement;

let categories: Category[] = [];
let items: MenuItem[] = [];

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

function toast(msg: string): void {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 1800);
}

/* ---------------- Auth ---------------- */

async function init(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    await loadData();
    renderAdmin();
  } else {
    renderLogin();
  }
}

function renderLogin(err = ''): void {
  app.innerHTML = `
    <form class="login" id="login">
      <h1>Punto&nbsp;P</h1>
      <p class="sub">Panel de administración</p>
      <div class="field">
        <label for="email">Correo</label>
        <input id="email" type="email" autocomplete="username" required />
      </div>
      <div class="field">
        <label for="password">Contraseña</label>
        <input id="password" type="password" autocomplete="current-password" required />
      </div>
      <button type="submit">Entrar</button>
      ${err ? `<div class="error">${esc(err)}</div>` : ''}
    </form>`;

  const form = document.getElementById('login') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button')!;
    btn.disabled = true;
    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      renderLogin('Correo o contraseña incorrectos.');
      return;
    }
    await loadData();
    renderAdmin();
  });
}

async function logout(): Promise<void> {
  await supabase.auth.signOut();
  categories = [];
  items = [];
  renderLogin();
}

/* ---------------- Data ---------------- */

async function loadData(): Promise<void> {
  const [catRes, itemRes] = await Promise.all([
    supabase.from('categories').select('*').order('position'),
    supabase.from('menu_items').select('*').order('position'),
  ]);
  categories = (catRes.data ?? []) as Category[];
  items = (itemRes.data ?? []) as MenuItem[];
}

/* ---------------- Render ---------------- */

function renderAdmin(): void {
  const catOptions = categories
    .map((c) => `<option value="${c.id}">${esc(c.name)}</option>`)
    .join('');

  app.innerHTML = `
    <div class="bar">
      <h1>Punto P · Carta</h1>
      <button id="logout" class="small">Salir</button>
    </div>
    <div class="wrap">

      <section class="block">
        <h2>Categorías</h2>
        <div id="cat-list">
          ${
            categories.length === 0
              ? '<p class="muted">Aún no hay categorías.</p>'
              : categories
                  .map(
                    (c) => `
            <div class="row" data-cat="${c.id}">
              <input class="grow" value="${esc(c.name)}" data-cat-name="${c.id}" />
              <button class="small" data-cat-save="${c.id}">Guardar</button>
              <button class="small ghost" data-cat-del="${c.id}">Borrar</button>
            </div>`,
                  )
                  .join('')
          }
        </div>
        <div class="row" style="border:0">
          <input class="grow" id="new-cat" placeholder="Nueva categoría (p. ej. Pizzas rojas)" />
          <button class="small" id="add-cat">Añadir</button>
        </div>
      </section>

      <section class="block">
        <h2>Nuevo plato</h2>
        <div class="item-edit" style="border:0">
          <div class="full">
            <label>Nombre</label>
            <input id="ni-name" placeholder="Margherita" />
          </div>
          <div class="full">
            <label>Ingredientes</label>
            <input id="ni-ing" placeholder="Tomate, Fior di Latte, albahaca" />
          </div>
          <div>
            <label>Precio (€)</label>
            <input id="ni-price" type="number" step="0.10" min="0" placeholder="9,50" />
          </div>
          <div>
            <label>Categoría</label>
            <select id="ni-cat">${catOptions}</select>
          </div>
          <div class="actions">
            <button id="add-item" ${categories.length === 0 ? 'disabled' : ''}>Añadir plato</button>
            ${categories.length === 0 ? '<span class="muted">Crea una categoría primero.</span>' : ''}
          </div>
        </div>
      </section>

      <section class="block">
        <h2>Platos</h2>
        <div id="item-list">${renderItems()}</div>
      </section>

    </div>`;

  wireAdmin();
}

function renderItems(): string {
  if (items.length === 0) return '<p class="muted">Aún no hay platos.</p>';
  const catOpts = (sel: number) =>
    categories
      .map(
        (c) =>
          `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.name)}</option>`,
      )
      .join('');

  return categories
    .map((cat) => {
      const list = items.filter((i) => i.category_id === cat.id);
      if (list.length === 0) return '';
      const rows = list
        .map(
          (it) => `
        <div class="item-edit" data-item="${it.id}">
          <div class="full">
            <label>Nombre ${it.visible ? '' : '<span class="hidden-tag">oculto</span>'}</label>
            <input value="${esc(it.name)}" data-f="name" data-id="${it.id}" />
          </div>
          <div class="full">
            <label>Ingredientes</label>
            <input value="${esc(it.ingredients ?? '')}" data-f="ingredients" data-id="${it.id}" />
          </div>
          <div>
            <label>Precio (€)</label>
            <input type="number" step="0.10" min="0" value="${it.price}" data-f="price" data-id="${it.id}" />
          </div>
          <div>
            <label>Categoría</label>
            <select data-f="category_id" data-id="${it.id}">${catOpts(it.category_id)}</select>
          </div>
          <div class="actions">
            <label class="check"><input type="checkbox" data-f="visible" data-id="${it.id}" ${it.visible ? 'checked' : ''} /> Visible</label>
            <button class="small" data-item-save="${it.id}">Guardar</button>
            <button class="small ghost" data-item-del="${it.id}">Borrar</button>
          </div>
        </div>`,
        )
        .join('');
      return `<h3 style="margin:18px 0 0">${esc(cat.name)}</h3>${rows}`;
    })
    .join('');
}

/* ---------------- Actions ---------------- */

function wireAdmin(): void {
  document.getElementById('logout')!.addEventListener('click', logout);

  // Add category
  document.getElementById('add-cat')!.addEventListener('click', async () => {
    const input = document.getElementById('new-cat') as HTMLInputElement;
    const name = input.value.trim();
    if (!name) return;
    const position = categories.length;
    const { error } = await supabase.from('categories').insert({ name, position });
    if (error) return toast('Error al añadir');
    await loadData();
    renderAdmin();
    toast('Categoría añadida');
  });

  // Add item
  const addItem = document.getElementById('add-item');
  addItem?.addEventListener('click', async () => {
    const name = (document.getElementById('ni-name') as HTMLInputElement).value.trim();
    const ingredients = (document.getElementById('ni-ing') as HTMLInputElement).value.trim();
    const price = parseFloat((document.getElementById('ni-price') as HTMLInputElement).value) || 0;
    const category_id = parseInt((document.getElementById('ni-cat') as HTMLSelectElement).value, 10);
    if (!name) return toast('Falta el nombre');
    const position = items.filter((i) => i.category_id === category_id).length;
    const { error } = await supabase
      .from('menu_items')
      .insert({ name, ingredients: ingredients || null, price, category_id, position });
    if (error) return toast('Error al añadir');
    await loadData();
    renderAdmin();
    toast('Plato añadido');
  });

  // Delegated clicks for save/delete
  app.addEventListener('click', async (e) => {
    const t = e.target as HTMLElement;

    const catSave = t.getAttribute('data-cat-save');
    if (catSave) {
      const name = (document.querySelector(`[data-cat-name="${catSave}"]`) as HTMLInputElement).value.trim();
      if (!name) return;
      const { error } = await supabase.from('categories').update({ name }).eq('id', catSave);
      toast(error ? 'Error' : 'Guardado');
      if (!error) await loadData();
      return;
    }

    const catDel = t.getAttribute('data-cat-del');
    if (catDel) {
      if (!confirmInline('¿Borrar la categoría y sus platos?')) return;
      const { error } = await supabase.from('categories').delete().eq('id', catDel);
      if (error) return toast('Error');
      await loadData();
      renderAdmin();
      toast('Categoría borrada');
      return;
    }

    const itemSave = t.getAttribute('data-item-save');
    if (itemSave) {
      await saveItem(itemSave);
      return;
    }

    const itemDel = t.getAttribute('data-item-del');
    if (itemDel) {
      if (!confirmInline('¿Borrar este plato?')) return;
      const { error } = await supabase.from('menu_items').delete().eq('id', itemDel);
      if (error) return toast('Error');
      await loadData();
      renderAdmin();
      toast('Plato borrado');
      return;
    }
  });
}

async function saveItem(id: string): Promise<void> {
  const field = (f: string) =>
    document.querySelector(`[data-f="${f}"][data-id="${id}"]`) as HTMLInputElement | HTMLSelectElement;
  const name = (field('name') as HTMLInputElement).value.trim();
  const ingredients = (field('ingredients') as HTMLInputElement).value.trim();
  const price = parseFloat((field('price') as HTMLInputElement).value) || 0;
  const category_id = parseInt((field('category_id') as HTMLSelectElement).value, 10);
  const visible = (field('visible') as HTMLInputElement).checked;
  if (!name) return toast('Falta el nombre');

  const { error } = await supabase
    .from('menu_items')
    .update({ name, ingredients: ingredients || null, price, category_id, visible })
    .eq('id', id);
  if (error) return toast('Error al guardar');
  await loadData();
  renderAdmin();
  toast('Guardado');
}

// Simple confirm. The sandboxed window.confirm works in the real app (not in artifacts).
function confirmInline(msg: string): boolean {
  return window.confirm(msg);
}

init();
