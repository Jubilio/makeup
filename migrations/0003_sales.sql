-- Vendas anuladas (cliente desistiu, erro ao registar). A venda fica no histórico,
-- mas deixa de contar nos totais e no gráfico, e as unidades voltam ao stock.
ALTER TABLE movements ADD COLUMN cancelled_at TEXT;
