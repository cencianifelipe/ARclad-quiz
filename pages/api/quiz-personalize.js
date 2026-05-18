// pages/api/quiz-personalize.js
// Gera 8 perguntas personalizadas baseadas no perfil do visitante (Q1-Q3)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { segmento, faturamento, skus, feira } = req.body

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
        max_tokens: 1200,
        system: `Você é consultor da ARclad do Brasil (distribuidora de materiais autoadesivos, BOPP, Couché, térmicos, silicone, laminação).

INSTRUÇÃO CRÍTICA: Retorne APENAS um objeto JSON válido, sem markdown, sem backticks, sem explicações.

Formato esperado (EXATO):
{"questions":[
  {"id":"4","bloco":"Bloco X","q":"Pergunta?","opts":["A","B","C","D"],"r":null},
  {"id":"8","bloco":"Pergunta técnica","q":"?","opts":["A","B","C","D"],"r":1,"feedback":"Resposta correta porque..."}
]}

REGRAS ABSOLUTAS:
1. Liner siliconado = suporte que protege o adesivo (NUNCA confunda com o adesivo PSA)
2. Wash-off = BOPP especial que se separa da garrafa PET na reciclagem — resposta técnica sempre aponta isso
3. NUNCA mencione vinil ou PSA
4. Couché = papel revestido com acento (Couché)
5. Gere EXATAMENTE 8 perguntas com IDs: 4,5,6,7,7b,8,9,10,11

Personalização por segmento:
- GRÁFICA: foco em processo, BOPP, filmes de impressão, suporte ao maquinário
- MARCA: foco em sustentabilidade, branding, reciclagem, PET wash-off
- AGÊNCIA: foco em acabamentos especiais, PDV, Couché premium, laminação
- DISTRIBUIDOR: foco em portfólio, margens, suporte ao cliente final

Para Q8 (técnica):
- Se MARCA → pergunte sobre BOPP wash-off para PET reciclável (resposta correta é B)
- Se GRÁFICA → pergunte sobre função do liner no autoadesivo
- Se AGÊNCIA → pergunte sobre Couché para PDV
- Se DISTRIBUIDOR → pergunte sobre componentes do autoadesivo

Retorne APENAS JSON, nada mais.`,
        messages: [{
          role: 'user',
          content: `Segmento: "${segmento}" | Faturamento: "${faturamento}" | SKUs: "${skus}" | Feira: "${feira}". Gere as 8 perguntas personalizadas em JSON puro.`
        }],
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
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return res.status(200).json({ questions: parsed.questions })
      }
    } catch(e) {
      const m = jsonText.match(/\{[\s\S]*\}/)
      if (m) {
        try {
          parsed = JSON.parse(m[0])
          if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            return res.status(200).json({ questions: parsed.questions })
          }
        } catch(e2) {}
      }
    }

    // Fallback
    return res.status(200).json({ questions: getDefaultQuestions() })

  } catch (error) {
    console.error('Personalize error:', error)
    return res.status(200).json({ questions: getDefaultQuestions() })
  }
}

function getDefaultQuestions() {
  return [
    {"id":"4","bloco":"Sobre você e seu negócio","q":"Como você chegou até a ARclad?","opts":["Já sou cliente","Conhecia mas nunca comprei","Já ouvi falar","Conheci aqui na feira hoje"],"r":null},
    {"id":"5","bloco":"Sobre você e seu negócio","q":"O que te trouxe ao nosso stand?","opts":["Queria ver os materiais","Indicação de alguém","Entender o portfólio","Inovação e suporte técnico"],"r":null},
    {"id":"6","bloco":"Sobre você e seu negócio","q":"Qual material você mais compra hoje?","opts":["BOPP ou filmes plásticos","Papel Couché ou revestido","Substratos térmicos","Material autoadesivo com liner siliconado"],"r":null},
    {"id":"7","bloco":"Sobre você e seu negócio","q":"Como avalia o suporte técnico do seu fornecedor atual?","opts":["Excelente","Razoável","Ruim","Não tenho suporte"],"r":null},
    {"id":"7b","bloco":"Sobre você e seu negócio","q":"Por que o suporte não é excelente?","opts":["Demora para responder","Não conhece bem os materiais","Não resolve meus problemas técnicos","Não oferece suporte proativo"],"r":null,"condicional":true},
    {"id":"8","bloco":"Pergunta técnica","q":"O que diferencia o BOPP wash-off dos demais filmes BOPP?","opts":["Maior resistência a rasgos","Separa-se da garrafa PET na reciclagem","É mais transparente","Tem acabamento metalizado automático"],"r":1,"feedback":"O wash-off separa-se da garrafa PET durante reciclagem, facilitando pureza do flake de PET."},
    {"id":"9","bloco":"Sobre você e seu negócio","q":"Qual é o seu maior desafio com materiais hoje?","opts":["Preço alto","Prazo imprevisível","Falta de variedade","Suporte técnico fraco"],"r":null},
    {"id":"10","bloco":"Sobre você e seu negócio","q":"O que te faria trocar de fornecedor?","opts":["Preço melhor","Material de maior qualidade","Suporte técnico especializado","Entrega rápida e estoque garantido"],"r":null},
    {"id":"11","bloco":"Sobre você e seu negócio","q":"Tem projeto de material nos próximos 3 meses?","opts":["Sim, projeto concreto","Sim, em fase de orçamento","Talvez","Não por enquanto"],"r":null}
  ]
}
