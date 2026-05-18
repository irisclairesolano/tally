-- Drop existing tables to start fresh
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense'))
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  note TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

-- Insert seed categories
INSERT INTO categories (name, icon, color, type) VALUES
  ('Food', 'fast-food-outline', '#FF7A59', 'expense'),
  ('Transport', 'bus-outline', '#6B7FFF', 'expense'),
  ('Utilities', 'flash-outline', '#D4A829', 'expense'),
  ('Leisure', 'film-outline', '#E36AB7', 'expense'),
  ('Shopping', 'bag-outline', '#C474FF', 'expense'),
  ('Health', 'medical-outline', '#22A06B', 'expense'),
  ('Income', 'cash-outline', '#22A06B', 'income'),
  ('Side Hustle', 'school-outline', '#22A06B', 'income');

-- Insert seed transactions using WITH clause to avoid subquery issues
WITH food_cat AS (SELECT id FROM categories WHERE name = 'Food' LIMIT 1),
     transport_cat AS (SELECT id FROM categories WHERE name = 'Transport' LIMIT 1),
     utilities_cat AS (SELECT id FROM categories WHERE name = 'Utilities' LIMIT 1),
     leisure_cat AS (SELECT id FROM categories WHERE name = 'Leisure' LIMIT 1),
     income_cat AS (SELECT id FROM categories WHERE name = 'Income' LIMIT 1)
INSERT INTO transactions (title, amount, note, occurred_at, category_id) VALUES
  ('Grocery shopping', -650, 'Weekly groceries at SM Supermarket', '2026-04-06T10:30:00', (SELECT id FROM food_cat)),
  ('Jeepney fare', -85, 'Round trip to school', '2026-04-06T07:45:00', (SELECT id FROM transport_cat)),
  ('Coffee', -120, 'Iced latte at Starbucks', '2026-04-06T14:15:00', (SELECT id FROM food_cat)),
  ('Allowance', 5000, 'Weekly allowance from mom', '2026-04-05T08:00:00', (SELECT id FROM income_cat)),
  ('Meralco bill', -1850, 'Electricity for March', '2026-04-05T16:20:00', (SELECT id FROM utilities_cat)),
  ('Movie ticket', -350, 'Cinema with friends', '2026-04-04T19:00:00', (SELECT id FROM leisure_cat));

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (anon key can read/write)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Public insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update transactions" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Public delete transactions" ON transactions FOR DELETE USING (true);
