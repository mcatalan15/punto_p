import './menu.css';
import { supabase, type Category, type MenuItem } from './supabase';

const root = document.getElementById('menu') as HTMLElement;
const CACHE_KEY = 'punto-p-menu';

type Snapshot = { categories: Category[]; items: MenuItem[] };

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

function formatPrice(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

function render({ categories, items }: Snapshot): void {
  if (categories.length === 0) {
    root.innerHTML = '<p class="state">La carta estará disponible muy pronto.</p>';
    return;
  }

  const byCat = new Map<number, MenuItem[]>();
  for (const it of items) {
    if (!byCat.has(it.category_id)) byCat.set(it.category_id, []);
    byCat.get(it.category_id)!.push(it);
  }

  const html: string[] = [];
  for (const cat of categories) {
    const list = byCat.get(cat.id) ?? [];
    if (list.length === 0) continue;
    html.push(`<span class="cat">${escapeHtml(cat.name)}</span>`);
    for (const it of list) {
      html.push(`
        <div class="item">
          <div class="item-main">
            <p class="item-name">${escapeHtml(it.name)}</p>
            ${it.ingredients ? `<p class="item-ing">${escapeHtml(it.ingredients)}</p>` : ''}
          </div>
          <span class="price">${formatPrice(it.price)}</span>
        </div>`);
    }
  }

  root.innerHTML =
    html.length > 0
      ? html.join('')
      : '<p class="state">La carta estará disponible muy pronto.</p>';
}

async function load(): Promise<void> {
  try {
    const [catRes, itemRes] = await Promise.all([
      supabase.from('categories').select('*').order('position'),
      supabase
        .from('menu_items')
        .select('*')
        .eq('visible', true)
        .order('position'),
    ]);

    if (catRes.error) throw catRes.error;
    if (itemRes.error) throw itemRes.error;

    const snap: Snapshot = {
      categories: (catRes.data ?? []) as Category[],
      items: (itemRes.data ?? []) as MenuItem[],
    };
    render(snap);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(snap));
    } catch {
      /* storage may be unavailable; ignore */
    }
  } catch {
    // Database unreachable (e.g. paused). Fall back to the last good menu.
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        render(JSON.parse(cached) as Snapshot);
        return;
      }
    } catch {
      /* ignore */
    }
    root.innerHTML =
      '<p class="state">No se pudo cargar la carta. Inténtalo de nuevo en un momento.</p>';
  }
}

load();
