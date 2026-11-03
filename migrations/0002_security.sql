-- Tentativas de login falhadas por IP (limite contra adivinhar a senha)
CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT PRIMARY KEY,
  fails INTEGER NOT NULL DEFAULT 0,
  first_fail INTEGER NOT NULL
);

-- Configurações internas. "session_epoch" muda ao clicar em "Sair" e termina todas as sessões.
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
