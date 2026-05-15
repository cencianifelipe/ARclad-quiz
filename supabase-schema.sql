-- =====================================================
-- ARCLAD QUIZ — Schema do banco de dados (Supabase)
-- Cole este SQL no editor SQL do seu projeto Supabase
-- =====================================================

CREATE TABLE IF NOT EXISTS leads (
  id                  BIGSERIAL PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT NOW(),

  -- Dados pessoais
  nome                TEXT NOT NULL,
  empresa             TEXT NOT NULL,
  cargo               TEXT,
  whatsapp            TEXT NOT NULL,
  email               TEXT,

  -- Contexto da feira
  pais                TEXT NOT NULL DEFAULT 'BR',
  feira               TEXT,
  locale              TEXT DEFAULT 'pt',

  -- Perfil identificado pela IA
  segmento            TEXT,
  faturamento         TEXT,
  skus                TEXT,
  materiais           TEXT,
  suporte_fornecedor  TEXT,
  desafio             TEXT,
  gatilho_compra      TEXT,
  timing              TEXT,

  -- Classificação IA
  nivel_tecnico       TEXT,
  temperatura         TEXT DEFAULT 'morno',
  oportunidade        TEXT,
  prioridade_followup TEXT DEFAULT 'Media',

  -- Brand Awareness
  conhecia_arclad     TEXT,
  atracao_stand       TEXT
);

-- Índices para filtros comuns
CREATE INDEX IF NOT EXISTS idx_leads_pais        ON leads(pais);
CREATE INDEX IF NOT EXISTS idx_leads_feira       ON leads(feira);
CREATE INDEX IF NOT EXISTS idx_leads_temperatura ON leads(temperatura);
CREATE INDEX IF NOT EXISTS idx_leads_created_at  ON leads(created_at DESC);

-- Row Level Security: permitir inserção pública, leitura apenas autenticada
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserção publica" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Leitura apenas autenticada" ON leads
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
