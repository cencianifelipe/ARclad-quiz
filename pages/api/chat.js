// pages/api/chat.js — Análise final · SEM menção a wash-off
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
- "reciclagem" / "reciclável" / "reciclavel"
- "sustentabilidade" / "sustentável"
- "vinil" / "PSA"

Se mencionar qualquer destes, a resposta será rejeitada.

═══ PORTFÓLIO ARclad PARA GERAR OPORTUNIDADES ═══

📦 BOPP (filmes plásticos):
- BOPP brilhante / fosco — rótulos premium, embalagens flexíveis
- BOPP metalizado — efeito visual diferenciado
- BOPP transparente — cosméticos e bebidas

📄 Couché (papéis revestidos):
- Couché brilho — rótulos comerciais, PDV
- Couché fosco — visual premium, vinhos, gourmet
- Couché para impressão digital — tiragens curtas

🏷️ Materiais autoadesivos (facestock + adesivo + liner siliconado):
- Liner kraft amarelo — uso geral, alta produtividade
- Liner glassine — etiquetas finas, impressão de alta qualidade
- Adesivo permanente — fixação definitiva
- Adesivo removível — promoções, eventos
- Adesivo para congelados — baixa temperatura

🌡️ Substratos térmicos:
- Térmico direto — etiquetas logísticas, balanças
- Térmico transfer — códigos de barras industriais
- Térmico congelados — cadeia fria

═══ COMO GERAR OPORTUNIDADE (sempre concreta) ═══

Combine SEGMENTO + MATERIAL ATUAL + DESAFIO + TIMING.

🖨️ GRÁFICA + dor de prazo → "BOPP brilhante e fosco ARclad com estoque garantido e entrega 48h"
🖨️ GRÁFICA + dor de suporte → "Materiais autoadesivos com liner adequado ao seu maquinário e suporte técnico especializado"
🖨️ GRÁFICA + Couché → "Couché brilho e fosco ARclad para impressão flexográfica de alta qualidade"

🏭 MARCA + busca valorização → "Couché premium e BOPP fosco para rótulos que destacam sua marca no PDV"
🏭 MARCA + congelados → "Materiais autoadesivos com adesivo especial para baixa temperatura"
🏭 MARCA + cosméticos → "BOPP transparente e Couché brilho para destaque visual de produtos premium"

🎨 AGÊNCIA + PDV → "Couché premium e laminados especiais para campanhas de alto impacto"
🎨 AGÊNCIA + campanhas temporárias → "Materiais autoadesivos com adesivo removível ideais para promoções"

📦 DISTRIBUIDOR → "Portfólio completo BOPP + Couché + térmicos com margens competitivas e exclusividade regional"
📦 DISTRIBUIDOR + cliente final → "Suporte técnico ARclad consultivo para você atender melhor seus clientes"

═══ REGRAS DE QUALIDADE ═══

❌ Nunca seja genérico ("soluções customizadas", "produtos de qualidade")
✅ Sempre cite produto ARclad concreto que resolve a dor real

═══ CLASSIFICAÇÃO ═══

temperatura:
- "quente" = projeto concreto + insatisfação atual + faturamento médio/alto
- "morno" = interesse claro mas sem urgência
- "frio" = apenas explorando

nivel: "Iniciante" / "Tecnico" / "Especialista"
prioridade: "Alta" / "Media" / "Baixa"

perfil: 1 frase descrevendo o visitante (10-15 palavras), com segmento e contexto.
oportunidade: 1 frase ESPECÍFICA citando produto ARclad concreto (12-18 palavras).`,
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

    // 🛡️ CAMADA DE PROTEÇÃO: se a IA mencionar palavras banidas, substituir oportunidade
    if (parsed && typeof parsed === 'object' && parsed.oportunidade) {
      const oport = parsed.oportunidade.toLowerCase()
      const bannedWords = ['wash-off', 'washoff', 'wash off', 'garrafa pet', 'pet recicl', 'reciclagem', 'reciclável', 'reciclavel', 'sustentável', 'sustentavel', 'sustentabilidade', 'vinil', 'psa']
      const hasBanned = bannedWords.some(w => oport.includes(w))
      
      if (hasBanned) {
        console.log('🛡️ Oportunidade bloqueada — substituindo por genérica segura')
        // Substituir por oportunidade genérica segura baseada em palavra-chave nas messages
        const msgContent = JSON.stringify(messages).toLowerCase()
        if (msgContent.includes('marca') || msgContent.includes('indústria')) {
          parsed.oportunidade = 'Couché premium e BOPP fosco ARclad para rótulos que destacam sua marca no PDV'
        } else if (msgContent.includes('agência') || msgContent.includes('marketing')) {
          parsed.oportunidade = 'Couché premium e laminados especiais ARclad para campanhas de alto impacto visual'
        } else if (msgContent.includes('distribuidor')) {
          parsed.oportunidade = 'Portfólio completo BOPP, Couché e térmicos ARclad com margens competitivas'
        } else {
          parsed.oportunidade = 'Materiais autoadesivos ARclad com suporte técnico especializado e entrega ágil'
        }
      }
      
      return res.status(200).json({ text: JSON.stringify(parsed) })
    }

    // Fallback se parsing falhar
    return res.status(200).json({ text: JSON.stringify({
      perfil: 'Visitante com interesse em explorar portfólio',
      oportunidade: 'Portfólio completo de BOPP, Couché e autoadesivos com suporte técnico ARclad',
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
