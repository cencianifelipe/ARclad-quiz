// pages/api/chat.js — Análise final personalizada · Recomendação baseada no perfil COMPLETO
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

INSTRUÇÃO CRÍTICA: Retorne APENAS um objeto JSON válido, sem markdown, sem backticks, sem explicações.

Formato exato:
{"perfil":"...","oportunidade":"...","temperatura":"...","nivel":"...","prioridade":"..."}

═══ PORTFÓLIO ARclad (para gerar recomendações) ═══

📦 BOPP (filmes plásticos):
- BOPP brilhante / fosco — rótulos premium, embalagens flexíveis
- BOPP wash-off — APENAS para garrafas PET recicláveis (sustentabilidade)
- BOPP metalizado — efeito visual diferenciado
- BOPP transparente — produtos cosméticos e bebidas

📄 Couché (papéis revestidos):
- Couché brilho — rótulos comerciais, PDV
- Couché fosco — visual premium, vinhos, gourmet
- Couché para impressão digital — tiragens curtas

🏷️ Materiais autoadesivos (liner siliconado + facestock + adesivo):
- Liner kraft amarelo — uso geral, alta produtividade
- Liner glassine — etiquetas finas, impressão de alta qualidade
- Adesivo permanente — fixação definitiva
- Adesivo removível — promoções, eventos
- Adesivo congelados — baixa temperatura

🌡️ Substratos térmicos:
- Térmico direto — etiquetas logísticas, balanças
- Térmico transfer — códigos de barras industriais
- Térmico congelados — cadeia fria

═══ COMO GERAR A OPORTUNIDADE ═══

REGRA DE OURO: A oportunidade deve combinar SEGMENTO + MATERIAL ATUAL + DESAFIO + TIMING. Nunca recomende um produto baseado em uma única resposta.

Exemplos de raciocínio correto:

🖨️ GRÁFICA que compra BOPP + desafio é prazo:
→ "BOPP brilhante e fosco ARclad com estoque garantido e entrega em 48h"

🖨️ GRÁFICA que compra autoadesivo + desafio é suporte:
→ "Materiais autoadesivos com liner adequado ao seu maquinário e suporte técnico especializado"

🏭 MARCA que falou em sustentabilidade (Q5/Q9) E embalagem PET:
→ "BOPP wash-off para suas garrafas PET com certificado de reciclagem"

🏭 MARCA que NÃO mencionou reciclagem + busca valorizar produto:
→ "Couché premium e BOPP fosco para rótulos que destacam sua marca no PDV"

🎨 AGÊNCIA com foco em PDV:
→ "Couché premium e laminados especiais para materiais promocionais de alto impacto"

📦 DISTRIBUIDOR com desafio de portfólio:
→ "Portfólio completo BOPP + Couché + térmicos com margens competitivas e exclusividade regional"

═══ REGRAS PROIBIDAS ═══

❌ NUNCA recomende BOPP wash-off se o cliente NÃO mencionou:
   - Sustentabilidade
   - Reciclagem
   - Garrafas PET
   - Embalagens recicláveis

❌ NUNCA seja genérico — sempre cite o produto específico

❌ NUNCA use frases vagas como "soluções customizadas" ou "produtos de qualidade"

═══ CLASSIFICAÇÃO ═══

temperatura:
- "quente" = projeto concreto + insatisfação atual + faturamento médio/alto
- "morno" = interesse claro mas sem urgência
- "frio" = apenas explorando, sem projeto definido

nivel: "Iniciante" / "Tecnico" / "Especialista" (baseado em quanto conhece os materiais)
prioridade: "Alta" / "Media" / "Baixa"

perfil: 1 frase descrevendo o visitante (10-15 palavras), incluindo segmento e contexto.
oportunidade: 1 frase ESPECÍFICA citando produto ARclad concreto que resolve a dor real (12-18 palavras).`,
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
      if (m) {
        try { parsed = JSON.parse(m[0]) } catch(e2) {}
      }
    }

    if (parsed && typeof parsed === 'object' && parsed.oportunidade) {
      return res.status(200).json({ text: JSON.stringify(parsed) })
    } else {
      return res.status(200).json({ text: JSON.stringify({
        perfil: 'Visitante com interesse em explorar portfólio',
        oportunidade: 'Portfólio completo de BOPP, Couché e autoadesivos com suporte técnico especializado ARclad',
        temperatura: 'morno',
        nivel: 'Iniciante',
        prioridade: 'Media'
      }) })
    }
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
