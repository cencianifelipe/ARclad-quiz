// pages/api/chat.js — Análise final · Oportunidade COMERCIAL (não técnica)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages required' })
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `Você é consultor de vendas sênior da ARclad do Brasil — distribuidora especializada em materiais autoadesivos, BOPP, Couché, substratos térmicos, silicone e laminação.

INSTRUÇÃO CRÍTICA: Retorne APENAS JSON válido, sem markdown, sem backticks.

Formato exato:
{"perfil":"...","oportunidade":"...","temperatura":"...","nivel":"...","prioridade":"..."}

🚫🚫🚫 PALAVRAS BANIDAS — NUNCA mencione 🚫🚫🚫
- "wash-off" / "washoff" / "wash off"
- "garrafa PET" / "PET reciclável"
- "reciclagem" / "reciclável"
- "sustentabilidade" / "sustentável"
- "vinil" / "PSA"
- "entrega 48h" / "entrega em 48 horas" / "entrega rápida" (a ARclad não cumpre prazos curtos)
- Qualquer promessa de prazo específico em horas/dias

═══ REGRA FUNDAMENTAL — O QUE É "OPORTUNIDADE" ═══

⚠️ REGRA MAIS IMPORTANTE — LEIA COM ATENÇÃO ⚠️

A "oportunidade" é UMA RECOMENDAÇÃO COMERCIAL de qual material/solução ARclad o cliente deve comprar.

A PERGUNTA TÉCNICA (Q8) É UM TESTE DE CONHECIMENTO — ela NÃO revela o que o cliente precisa comprar.
Exemplos do que NÃO fazer:
- Q8 perguntou sobre PDV → NÃO recomende material para PDV
- Q8 perguntou sobre substratos térmicos → NÃO recomende térmicos
- Q8 perguntou sobre Couché → NÃO recomende Couché só por isso
- Q8 perguntou sobre congelados → NÃO recomende adesivo para congelados

A oportunidade vem EXCLUSIVAMENTE de:
1. SEGMENTO (Q1) — quem é o cliente
2. MATERIAL ATUAL (Q6) — o que ele já compra
3. DESAFIO (Q9) — qual a dor real
4. GATILHO DE TROCA (Q10) — o que faria ele mudar
5. TIMING (Q11) — quando precisa

═══ PORTFÓLIO ARclad (completo e correto) ═══

📦 BOPP: brilhante, fosco, metalizado, transparente, BOPP para congelados
📄 Couché: brilho, fosco, para impressão digital
🌡️ Térmicos: direto, transfer, para cadeia fria
🔵 PET / Poliéster: alta performance e durabilidade
🎨 Laminação: brilho, fosca, especiais
🌱 Linha sustentável: materiais com certificação ambiental
⚙️ Silicone

NOTA SOBRE ADESIVOS (componentes — NÃO mencionar como oportunidade principal):
- Adesivo permanente, removível, para baixa temperatura são componentes internos dos materiais
- Liner kraft e liner glassine são suportes técnicos — NUNCA mencionar como oportunidade comercial

═══ COMO GERAR OPORTUNIDADE CORRETA ═══

A oportunidade deve mencionar:
- O MATERIAL ARclad que resolve a dor (não o tema da Q8!)
- O BENEFÍCIO que conecta com o desafio do cliente

❌ NUNCA mencione liners (kraft, glassine, PET liner) como oportunidade — liner é componente técnico, não produto de venda
❌ NUNCA mencione "liner kraft", "liner glassine" na oportunidade

🌱 REGRA ESPECIAL — SUSTENTÁVEL:
Se o cliente escolheu "Sustentável" ou "Linhas especiais" com menção a sustentável:
→ Temperatura automática: QUENTE
→ Oportunidade: falar sobre materiais sustentáveis ARclad (BOPP com certificação, materiais para reciclagem)
→ Exemplo: "Linha de materiais sustentáveis ARclad para embalagens com apelo ambiental e certificação"

EXEMPLOS CORRETOS:

🖨️ Gráfica + Q6:BOPP + Q9:suporte fraco
→ "Linha BOPP ARclad — brilhante, fosco e metalizado — com consultoria técnica especializada para sua produção"

🖨️ Gráfica + Q6:Couché + Q9:falta variedade
→ "Couché ARclad em brilho e fosco com diversas gramaturas para impressão flexográfica de alta qualidade"

🖨️ Gráfica + Q6:Linhas especiais (sustentável)
→ "Linha de materiais sustentáveis ARclad para embalagens com apelo ambiental e certificação"

🖨️ Gráfica + Q6:Linhas especiais (PET)
→ "BOPP e PET/Poliéster ARclad para aplicações especiais com alta performance e durabilidade"

🏭 Marca + Q6:BOPP + menção a congelados/cadeia fria
→ "BOPP ARclad para congelados com adesivo para baixa temperatura — ideal para rótulos em cadeia fria"

🏭 Marca + Q6:Couché + Q9:preço alto
→ "Couché brilho e fosco ARclad com excelente custo-benefício para rótulos comerciais"

🏭 Marca + Q6:Linhas especiais (sustentável)
→ "Materiais sustentáveis ARclad com certificação ambiental para embalagens da sua marca"

🎨 Agência + Q6:Couché + Q9:variedade
→ "Couché premium ARclad em brilho e fosco com diferentes gramaturas para PDV e materiais promocionais"

📦 Distribuidor + Q9:portfólio
→ "Portfólio completo ARclad — BOPP, Couché, PET, térmicos — com margens competitivas para revenda"

📦 Distribuidor + Q6:Linhas especiais (sustentável)
→ "Linha sustentável ARclad como diferencial competitivo para seu portfólio de revenda"

═══ REGRAS DE QUALIDADE ═══

❌ Nunca seja genérico ("soluções customizadas", "produtos de qualidade", "atendimento diferenciado")
❌ Nunca prometa prazos específicos (48h, 24h, "rápida", "ágil")
❌ Nunca recomende baseado no tema da Q8 (pergunta técnica)
❌ NUNCA mencione liner (kraft, glassine) como oportunidade comercial
✅ Sempre cite produto ARclad concreto que resolve a dor real
✅ Se "Sustentável" ou "Linhas especiais" → destaque materiais sustentáveis e temperatura quente

═══ CLASSIFICAÇÃO ═══

temperatura:
- "quente" = projeto concreto (Q11=A/B) + insatisfação clara (Q7=C/D ou Q9 com dor forte)
- "morno" = interesse claro mas sem urgência (Q11=C)
- "frio" = apenas explorando (Q11=D)

nivel: "Iniciante" / "Tecnico" / "Especialista"
prioridade: "Alta" / "Media" / "Baixa"

perfil: 1 frase descrevendo o visitante (10-15 palavras), com segmento e contexto.
oportunidade: 1 frase com produto ARclad específico que resolve dor real do cliente (12-18 palavras), SEM prazos.`,
        messages,
      }),
    })

    if (!response.ok) throw new Error(`API ${response.status}`)
    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''
    
    let jsonText = rawText
    if (rawText.includes('```')) {
      jsonText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    }

    let parsed = null
    try {
      parsed = JSON.parse(jsonText)
    } catch(e) {
      const m = jsonText.match(/\{[\s\S]*\}/)
      if (m) { try { parsed = JSON.parse(m[0]) } catch(e2) {} }
    }

    // 🌱 PRÉ-CHECK SUSTENTÁVEL (antes de qualquer filtro)
    // Se o cliente escolheu sustentável → forçar oportunidade específica independente do que a IA gerou
    if (parsed && typeof parsed === 'object') {
      const msgLower = JSON.stringify(messages).toLowerCase()
      const escolheuSustentavel = msgLower.includes('sustentável') || msgLower.includes('sustentavel') || msgLower.includes('linhas especiais')
      
      if (escolheuSustentavel) {
        const seg = msgLower
        let sustOpp = 'Linha de materiais sustentáveis ARclad para embalagens com apelo ambiental e certificação'
        if (seg.includes('agência') || seg.includes('agencia') || seg.includes('marketing')) {
          sustOpp = 'Linha sustentável ARclad para campanhas e materiais com apelo ambiental para seus clientes'
        } else if (seg.includes('distribuidor')) {
          sustOpp = 'Linha sustentável ARclad como diferencial competitivo para seu portfólio de revenda'
        } else if (seg.includes('marca') || seg.includes('indústria') || seg.includes('industria')) {
          sustOpp = 'Materiais sustentáveis ARclad com certificação ambiental para embalagens da sua marca'
        }
        parsed.oportunidade = sustOpp
        parsed.temperatura = 'quente'
        parsed.prioridade = 'Alta'
        return res.status(200).json({ text: JSON.stringify(parsed) })
      }
    }

    // 🛡️ CAMADA DE PROTEÇÃO: filtros banidos
    if (parsed && typeof parsed === 'object' && parsed.oportunidade) {
      const oport = parsed.oportunidade
      const bannedPatterns = [
        /wash[\s-]?off/i,
        /garrafa\s*pet/i,
        /\bpet\b/i,
        /recicl/i,
        /sustent/i,         // banido genérico — fallback usa oportunidade específica para sustentável
        /\bvinil\b/i,
        /\bpsa\b/i,
        /48\s*h/i,
        /48\s*horas/i,
        /24\s*h/i,
        /24\s*horas/i,
        /entrega\s+r[áa]pida/i,
        /entrega\s+[áa]gil/i,
        /prazo\s+curto/i,
        /projetos?\s+pdv/i,
        /substratos?\s+t[eé]rmico/i,
        /t[eé]rmicos?\s+arclad/i,
        /food[\s-]?safe/i,
        /hot\s*stamp/i,
        /liner\s+siliconado/i,
        /liner\s+kraft/i,
        /liner\s+glassine/i,
        /kraft\s+e\s+glassine/i,
        /glassine\s+e\s+kraft/i,
        /kraft\s+ou\s+glassine/i,
      ]
      
      const hasBanned = bannedPatterns.some(rx => rx.test(oport))
      
      if (hasBanned) {
        console.log('🛡️ Oportunidade bloqueada — substituindo por segura baseada em segmento')
        const msgContent = JSON.stringify(messages).toLowerCase()
        
        let safeOpp = 'Portfólio ARclad de materiais autoadesivos com suporte técnico especializado'

        // Sustentável = aposta da matriz → temperatura quente + oportunidade específica
        const isSustentavel = msgContent.includes('sustent') || msgContent.includes('linhas especiais')

        if (isSustentavel) {
          safeOpp = 'Linha de materiais sustentáveis ARclad para embalagens com apelo ambiental e certificação'
          parsed.temperatura = 'quente'
          parsed.prioridade = 'Alta'
        } else if (msgContent.includes('marca') || msgContent.includes('indústria') || msgContent.includes('industria')) {
          if (msgContent.includes('couché') || msgContent.includes('couche')) {
            safeOpp = 'Couché brilho e fosco ARclad com excelente custo-benefício para rótulos da sua marca'
          } else if (msgContent.includes('bopp')) {
            safeOpp = 'Linha BOPP ARclad — brilhante, fosco e metalizado — para rótulos premium da sua marca'
          } else {
            safeOpp = 'Portfólio ARclad de BOPP e Couché ideais para rótulos e embalagens da sua marca'
          }
        } else if (msgContent.includes('agência') || msgContent.includes('agencia') || msgContent.includes('marketing')) {
          safeOpp = 'Couché premium e laminados especiais ARclad para campanhas e materiais promocionais de impacto'
        } else if (msgContent.includes('distribuidor')) {
          safeOpp = 'Portfólio completo ARclad — BOPP, Couché, PET, térmicos — com margens competitivas para revenda'
        } else if (msgContent.includes('gráfica') || msgContent.includes('grafica') || msgContent.includes('convertedor')) {
          if (msgContent.includes('bopp')) {
            safeOpp = 'Linha BOPP ARclad com qualidade consistente para impressão flexográfica de rótulos'
          } else if (msgContent.includes('couché') || msgContent.includes('couche')) {
            safeOpp = 'Couché ARclad em diferentes gramaturas com qualidade consistente para impressão flexográfica'
          } else {
            safeOpp = 'Portfólio ARclad de materiais para impressão com consultoria técnica especializada'
          }
        }
        
        parsed.oportunidade = safeOpp
      }
      
      return res.status(200).json({ text: JSON.stringify(parsed) })
    }

    // Fallback se parsing falhar
    return res.status(200).json({ text: JSON.stringify({
      perfil: 'Visitante com interesse em explorar portfólio',
      oportunidade: 'Portfólio ARclad de BOPP, Couché e autoadesivos com suporte técnico especializado',
      temperatura: 'morno',
      nivel: 'Iniciante',
      prioridade: 'Media'
    }) })
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(200).json({ text: JSON.stringify({
      perfil: 'Visitante em exploração inicial',
      oportunidade: 'Portfólio ARclad de materiais autoadesivos com suporte técnico especializado',
      temperatura: 'morno',
      nivel: 'Iniciante',
      prioridade: 'Media'
    }) })
  }
}
