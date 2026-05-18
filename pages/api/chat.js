// pages/api/chat.js — Análise final personalizada
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
        system: `Consultor ARclad do Brasil. Analise as respostas e retorne SOMENTE JSON válido, sem markdown:
{"perfil":"1 frase sobre o perfil","oportunidade":"produto/solução ARclad específica para esse perfil","temperatura":"quente|morno|frio","nivel":"Iniciante|Tecnico|Especialista","prioridade":"Alta|Media|Baixa"}
Temperatura: quente=projeto concreto+insatisfação; morno=interesse sem urgência; frio=só explorando.`,
        messages,
      }),
    })
    if (!response.ok) throw new Error(`API ${response.status}`)
    const data = await response.json()
    return res.status(200).json({ text: data.content?.[0]?.text || '' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
