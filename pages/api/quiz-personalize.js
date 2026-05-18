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

REGRAS ABSOLUTAS:
- Liner = APENAS o suporte siliconado que protege o adesivo. NÃO confunda com adesivo.
- Wash-off = BOPP especial que se separa da garrafa PET na reciclagem. A resposta correta é sempre a opção que menciona isso.
- NUNCA mencione vinil nem PSA.
- Couché = papel revestido (com acento agudo no é).

Dado o perfil do visitante, gere 8 perguntas personalizadas e retorne SOMENTE um JSON válido:
{"questions":[
  {"id":"4","bloco":"Sobre você","q":"pergunta personalizada?","opts":["A","B","C","D"],"r":null},
  ...
  {"id":"8","bloco":"Pergunta técnica","q":"pergunta técnica sobre BOPP/Couché/flexografia?","opts":["A","B","C","D"],"r":1}
]}

Regras de geração:
- Q4: Como chegou à ARclad? (sempre: Já sou cliente / Conhecia mas nunca comprei / Já ouvi falar / Conheci aqui na feira) r:null
- Q5: O que trouxe ao stand? (adaptar ao segmento) r:null
- Q6: Material que mais compra? (adaptar ao segmento, mencionar materiais ARclad relevantes) r:null
- Q7: Suporte técnico do fornecedor? (sempre: Excelente/Razoável/Ruim/Sem suporte) r:null
- Q7b: Motivo suporte ruim? (se aplicável, id:"7b", adicionar campo "condicional":true) r:null
- Q8: Pergunta técnica sobre material RELEVANTE ao segmento (r deve ser o índice 0-3 da resposta correta)
- Q9: Maior desafio? (adaptar ao segmento) r:null
- Q10: O que faria trocar de fornecedor? (adaptar) r:null
- Q11: Projeto nos próximos 3 meses? (sempre: Sim concreto/Em orçamento/Talvez/Não) r:null

Para Q8 (técnica), use "feedback" com a explicação correta (máx 25 palavras).
Retorne APENAS o JSON, sem markdown nem explicações.`,
        messages: [{
          role: 'user',
          content: `Perfil: Segmento="${segmento}", Faturamento="${faturamento}", SKUs="${skus}", Feira="${feira}". Gere as 8 perguntas personalizadas.`
        }],
      }),
    })

    if (!response.ok) throw new Error(`API ${response.status}`)
    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    let questions = null
    try {
      const m = text.match(/\{[\s\S]*\}/)
      if (m) {
        const parsed = JSON.parse(m[0])
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          questions = parsed.questions
        }
      }
    } catch(e) { /* fallback abaixo */ }

    if (questions) {
      return res.status(200).json({ questions })
    } else {
      // Fallback — perguntas padrão
      return res.status(200).json({ questions: getDefaultQuestions() })
    }

  } catch (error) {
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
    {"id":"8","bloco":"Pergunta técnica","q":"O que diferencia o BOPP wash-off dos demais filmes BOPP?","opts":["Maior resistência a rasgos","Separa-se da garrafa PET na reciclagem","É mais transparente","Tem acabamento metalizado automático"],"r":1,"feedback":"O wash-off separa-se da garrafa PET durante a reciclagem, facilitando a pureza do flake. Material essencial para embalagens sustentáveis."},
    {"id":"9","bloco":"Sobre você e seu negócio","q":"Qual é o seu maior desafio com materiais hoje?","opts":["Preço alto","Prazo imprevisível","Falta de variedade","Suporte técnico fraco"],"r":null},
    {"id":"10","bloco":"Sobre você e seu negócio","q":"O que te faria trocar de fornecedor?","opts":["Preço melhor","Material de maior qualidade","Suporte técnico especializado","Entrega rápida e estoque garantido"],"r":null},
    {"id":"11","bloco":"Sobre você e seu negócio","q":"Tem projeto de material nos próximos 3 meses?","opts":["Sim, projeto concreto","Sim, em fase de orçamento","Talvez","Não por enquanto"],"r":null}
  ]
}
