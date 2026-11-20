-- Dev-only sample data, loaded on `supabase db reset`.
-- Never runs against production.

insert into categories (name, position) values
  ('Pizzas rojas', 0),
  ('Pizzas blancas', 1),
  ('Bebidas', 2);

insert into menu_items (category_id, name, ingredients, price, position, visible) values
  (1, 'Margherita', 'Tomate, Fior di Latte, albahaca fresca', 9.50, 0, true),
  (1, 'Diavola', 'Tomate, Fior di Latte, spianata picante, miel picante', 12.00, 1, true),
  (2, 'Carbonara', 'Base blanca, guanciale, huevo, pecorino', 13.00, 0, true),
  (3, 'Agua', null, 2.00, 0, true);
