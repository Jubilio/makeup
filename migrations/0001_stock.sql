-- Stock atual por variante (SKU do catálogo)
CREATE TABLE IF NOT EXISTS stock (
  sku TEXT PRIMARY KEY,
  qty INTEGER NOT NULL DEFAULT 0,
  min_qty INTEGER NOT NULL DEFAULT 2,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Histórico de entradas, vendas e acertos
CREATE TABLE IF NOT EXISTS movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('entrada', 'venda', 'acerto')),
  qty INTEGER NOT NULL,
  unit_price INTEGER,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_movements_sku ON movements (sku);
CREATE INDEX IF NOT EXISTS idx_movements_created ON movements (created_at);
