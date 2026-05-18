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

⚠️ ATENÇÃO: A "oportunidade" é uma RECOMENDAÇÃO COMERCIAL — qual material/solução ARclad o visitante deveria considerar comprar.

❌ A oportunidade NÃO é o tema da pergunta técnica (Q8).
❌ Se a Q8 perguntou sobre adesivo para congelados, isso NÃO significa que o cliente precisa de material para congelados.
❌ A pergunta técnica é só um teste de conhecimento — IGNORE o tema dela ao gerar a oportunidade.

✅ A oportunidade vem APENAS de:
1. SEGMENTO (Q1) — quem é o cliente
2. MATERIAL ATUAL (Q6) — o que ele já compra
3. DESAFIO (Q9) — qual a dor real
4. GATILHO DE TROCA (Q10) — o que faria ele mudar de fornecedor
5. TIMING (Q11) — quando precisa

═══ PORTFÓLIO ARclad ═══

📦 BOPP: brilhante, fosco, metalizado, transparente
📄 Couché: brilho, fosco, para impressão digital
🏷️ Materiais autoadesivos: liner kraft, liner glassine, adesivo permanente, adesivo removível, adesivo para baixa temperatura
🌡️ Térmicos: direto, transfer, para cadeia fria
🎨 Laminação: brilho, fosca, especiais
🔵 Silicone

═══ COMO GERAR OPORTUNIDADE CORRETA ═══

A oportunidade deve mencionar:
- O MATERIAL ARclad que resolve a dor (não o tema da Q8!)
- O BENEFÍCIO que conecta com o desafio do cliente

EXEMPLOS CORRETOS:

🖨️ Gráfica + Q6:autoadesivo + Q9:suporte fraco + Q10:suporte especializado
→ "Materiais autoadesivos ARclad com liner kraft ou glassine e consultoria técnica especializada para sua produção"

🖨️ Gráfica + Q6:BOPP + Q9:falta variedade + Q10:qualidade
→ "Linha completa BOPP ARclad — brilhante, fosco e metalizado — com qualidade consistente para rótulos premium"

🏭 Marca + Q6:autoadesivo + Q9:prazo
→ "Materiais autoadesivos ARclad com disponibilidade ampla de estoque e relacionamento direto"

🏭 Marca + Q6:Couché + Q9:preço alto + Q10:qualidade
→ "Couché brilho e fosco ARclad com excelente custo-benefício para rótulos comerciais"

🎨 Agência + Q6:autoadesivo + Q10:variedade
→ "Portfólio amplo de materiais autoadesivos ARclad com laminados e acabamentos especiais para campanhas"

🎨 Agência + Q6:Couché + Q9:variedade
→ "Couché premium ARclad em brilho e fosco com diferentes gramaturas para PDV e materiais promocionais"

📦 Distribuidor + Q9:portfólio + Q10:qualidade
→ "Portfólio completo ARclad — BOPP, Couché, autoadesivos e térmicos — com margens competitivas para revenda"

📦 Distribuidor + Q9:suporte fraco
→ "Parceria ARclad com suporte técnico consultivo para você atender melhor seus clientes finais"

═══ REGRAS DE QUALIDADE ═══

❌ Nunca seja genérico ("soluções customizadas", "produtos de qualidade", "atendimento diferenciado")
❌ Nunca prometa prazos específicos (48h, 24h, "rápida", "ágil")
❌ Nunca recomende baseado no tema da Q8 (pergunta técnica)
✅ Sempre cite produto ARclad concreto que resolve a dor real
✅ Sempre conecte com o material atual (Q6) e desafio (Q9)

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

    // 🛡️ CAMADA DE PROTEÇÃO: filtros banidos
    if (parsed && typeof parsed === 'object' && parsed.oportunidade) {
      const oport = parsed.oportunidade
      const bannedPatterns = [
        /wash[\s-]?off/i,
        /garrafa\s*pet/i,
        /\bpet\b/i,
        /recicl/i,
        /sustent/i,
        /\bvinil\b/i,
        /\bpsa\b/i,
        /48\s*h/i,
        /48\s*horas/i,
        /24\s*h/i,
        /24\s*horas/i,
        /entrega\s+r[áa]pida/i,
        /entrega\s+[áa]gil/i,
        /prazo\s+curto/i,
        /congelado/i, // não recomendar baseado em Q8 técnica
      ]
      
      const hasBanned = bannedPatterns.some(rx => rx.test(oport))
      
      if (hasBanned) {
        console.log('🛡️ Oportunidade bloqueada — substituindo por segura baseada em segmento')
        const msgContent = JSON.stringify(messages).toLowerCase()
        
        // Determinar oportunidade segura baseada em segmento + material atual
        let safeOpp = 'Portfólio ARclad de materiais autoadesivos com suporte técnico especializado'
        
        if (msgContent.includes('marca') || msgContent.includes('indústria') || msgContent.includes('industria')) {
          if (msgContent.includes('couché') || msgContent.includes('couche')) {
            safeOpp = 'Couché brilho e fosco ARclad com excelente custo-benefício para rótulos da sua marca'
          } else if (msgContent.includes('bopp')) {
            safeOpp = 'Linha BOPP ARclad — brilhante, fosco e metalizado — para rótulos premium da sua marca'
          } else if (msgContent.includes('autoadesivo')) {
            safeOpp = 'Materiais autoadesivos ARclad com portfólio completo e suporte consultivo para sua indústria'
          } else {
            safeOpp = 'Portfólio ARclad de BOPP e autoadesivos ideais para rótulos e embalagens da sua marca'
          }
        } else if (msgContent.includes('agência') || msgContent.includes('agencia') || msgContent.includes('marketing')) {
          safeOpp = 'Couché premium e laminados especiais ARclad para campanhas e materiais promocionais de impacto'
        } else if (msgContent.includes('distribuidor')) {
          safeOpp = 'Portfólio completo ARclad — BOPP, Couché, autoadesivos e térmicos — com margens competitivas para revenda'
        } else if (msgContent.includes('gráfica') || msgContent.includes('grafica') || msgContent.includes('convertedor')) {
          if (msgContent.includes('autoadesivo')) {
            safeOpp = 'Materiais autoadesivos ARclad com liner kraft ou glassine e consultoria técnica para sua produção'
          } else if (msgContent.includes('bopp')) {
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
