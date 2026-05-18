// pages/api/chat.js — Análise final personalizada com contexto ARclad
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
        max_tokens: 400,
        system: `Você é consultor de vendas da ARclad do Brasil — distribuidora especializada em materiais autoadesivos, BOPP, Couché, substratos térmicos, silicone e laminação.

INSTRUÇÃO CRÍTICA: Retorne APENAS um objeto JSON válido, sem nenhuma formatação markdown, sem backticks, sem explicações antes ou depois.

Exemplo de resposta correta:
{"perfil":"Gráfica em crescimento buscando substrato de qualidade","oportunidade":"BOPP wash-off para embalagens com reciclagem sustentável","temperatura":"quente","nivel":"Tecnico","prioridade":"Alta"}

Regras obrigatórias:
- temperatura: EXATAMENTE "quente" (projeto concreto + insatisfação) OU "morno" (interesse sem urgência) OU "frio" (apenas explorando)
- nivel: EXATAMENTE "Iniciante" OU "Tecnico" OU "Especialista"
- prioridade: EXATAMENTE "Alta" OU "Media" OU "Baixa"
- perfil: 1 frase sobre o visitante (10-15 palavras)
- oportunidade: 1 frase específica de produto/solução ARclad (10-15 palavras) — NUNCA genérico

Analise as respostas do visitante e determine temperatura/nivel/prioridade com base em:
- Temperatura alta: faturamento grande, projeto concreto, insatisfação clara
- Temperatura morna: interesse mas sem pressa
- Temperatura fria: apenas explorando
- Nível técnico: pela pergunta técnica acertada ou capacidade demonstrada
- Prioridade: alta se quente + técnico, baixa se frio`,
        messages,
      }),
    })

    if (!response.ok) throw new Error(`API ${response.status}`)
    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''
    
    // Extrair JSON mesmo que tenha markdown fences
    let jsonText = rawText
    if (rawText.includes('```')) {
      jsonText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    }

    let parsed = null
    try {
      parsed = JSON.parse(jsonText)
    } catch(e) {
      // Tentar extrair JSON com regex
      const m = jsonText.match(/\{[\s\S]*\}/)
      if (m) {
        try { parsed = JSON.parse(m[0]) } catch(e2) {}
      }
    }

    if (parsed && typeof parsed === 'object') {
      return res.status(200).json({ text: JSON.stringify(parsed) })
    } else {
      // Fallback se parsing falhar
      return res.status(200).json({ text: JSON.stringify({
        perfil: 'Visitante com interesse em explorar portfólio',
        oportunidade: 'Portfólio completo de materiais autoadesivos com suporte técnico ARclad',
        temperatura: 'morno',
        nivel: 'Iniciante',
        prioridade: 'Media'
      }) })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(200).json({ text: JSON.stringify({
      perfil: 'Visitante em exploração',
      oportunidade: 'Suporte técnico especializado ARclad em materiais autoadesivos',
      temperatura: 'morno',
      nivel: 'Iniciante',
      prioridade: 'Media'
    }) })
  }
}
