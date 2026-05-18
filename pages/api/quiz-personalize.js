// pages/api/quiz-personalize.js — Q4-Q11 personalizadas por segmento (sem viés wash-off)
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
        max_tokens: 1500,
        system: `Você é consultor da ARclad do Brasil. Gere 8 perguntas personalizadas com base no perfil do visitante.

INSTRUÇÃO CRÍTICA: Retorne APENAS JSON, sem markdown, sem backticks.

Formato exato:
{"questions":[
  {"id":"4","bloco":"Sobre você","q":"?","opts":["A","B","C","D"],"r":null},
  ...
  {"id":"8","bloco":"Pergunta técnica","q":"?","opts":["A","B","C","D"],"r":1,"feedback":"..."}
]}

═══ ESTRUTURA OBRIGATÓRIA (gerar EXATAMENTE 9 perguntas com estes IDs) ═══

Q4 — Brand awareness (igual para todos):
"Como você chegou até a ARclad?"
Opções fixas: ["Já sou cliente","Conhecia mas nunca comprei","Já ouvi falar","Conheci aqui na feira hoje"]

Q5 — Motivação (adapte ao segmento)
Q6 — Material principal usado (adapte ao segmento)
Q7 — Avaliação do suporte atual (fixa): ["Excelente","Razoável","Ruim","Não tenho suporte"]
Q7b — Por que suporte não é excelente (condicional, "condicional":true)
Q8 — TÉCNICA (alterne assuntos! não fixe em wash-off)
Q9 — Maior desafio (adapte ao segmento)
Q10 — O que faria trocar (adapte ao segmento)
Q11 — Timing (fixa): "Tem projeto de material nos próximos 3 meses?" ["Sim, projeto concreto","Sim, em fase de orçamento","Talvez","Não por enquanto"]

═══ Q8 TÉCNICA — VARIE O ASSUNTO POR SEGMENTO ═══

PROIBIDO sempre perguntar sobre BOPP wash-off! Alterne entre estes temas:

🖨️ GRÁFICA — pergunte sobre UM destes (escolha aleatoriamente):
A) Função do liner siliconado no autoadesivo (correta: protege o adesivo)
B) Diferença entre adesivo permanente e removível
C) Gramatura ideal de Couché para impressão flexográfica
D) Por que materiais térmicos precisam de cabeçote especial

🏭 MARCA — pergunte sobre UM destes:
A) Qual material protege melhor garrafa PET reciclável (correta: BOPP wash-off)
B) Diferença entre BOPP brilho e BOPP fosco
C) Por que rótulos para congelados precisam de adesivo especial
D) Vantagem do Couché fosco vs brilho para visual premium

🎨 AGÊNCIA — pergunte sobre UM destes:
A) Qual Couché é ideal para acabamentos premium PDV
B) Diferença entre laminação fosca e brilho
C) Quando usar adesivo removível vs permanente
D) Quais materiais permitem hot stamping

📦 DISTRIBUIDOR — pergunte sobre UM destes:
A) Qual componente é o adesivo no material autoadesivo (correta: a camada entre facestock e liner)
B) Diferença entre liner kraft e glassine
C) Como armazenar materiais autoadesivos corretamente
D) Vantagem do térmico direto vs térmico transfer

═══ REGRAS ABSOLUTAS ═══

❌ Liner = SUPORTE siliconado. NUNCA é o adesivo.
❌ NUNCA mencione vinil ou PSA
❌ Couché com acento (Couché)
❌ NUNCA repita o tema BOPP wash-off duas vezes na mesma sessão

✅ Para Q8, escolha um tema diferente a cada perfil
✅ Para wash-off, só pergunte se o segmento for MARCA E o contexto sugerir sustentabilidade

Retorne SOMENTE o JSON com as 9 perguntas. Use "r":1 (índice 0-3) para indicar a resposta correta em Q8 e adicione campo "feedback" com explicação de 10-20 palavras.`,
        messages: [{
          role: 'user',
          content: `Perfil do visitante:
- Segmento: ${segmento}
- Faturamento anual: ${faturamento}
- SKUs/ano: ${skus}
- Feira: ${feira}

Gere as 9 perguntas personalizadas em JSON puro. Para Q8, ESCOLHA UM TEMA ESPECÍFICO da lista do segmento — varie a cada chamada.`
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
      if (Array.isArray(parsed.questions) && parsed.questions.length >= 8) {
        return res.status(200).json({ questions: parsed.questions })
      }
    } catch(e) {
      const m = jsonText.match(/\{[\s\S]*\}/)
      if (m) {
        try {
          parsed = JSON.parse(m[0])
          if (Array.isArray(parsed.questions) && parsed.questions.length >= 8) {
            return res.status(200).json({ questions: parsed.questions })
          }
        } catch(e2) {}
      }
    }

    return res.status(200).json({ questions: getDefaultQuestions(segmento) })

  } catch (error) {
    console.error('Personalize error:', error)
    return res.status(200).json({ questions: getDefaultQuestions(segmento) })
  }
}

function getDefaultQuestions(segmento) {
  // Q8 técnica varia por segmento no fallback
  const seg = (segmento||'').toLowerCase()
  let q8
  if (seg.includes('marca') || seg.includes('indústria')) {
    q8 = {"id":"8","bloco":"Pergunta técnica","q":"Para rótulos em garrafas PET recicláveis, qual material é mais indicado?","opts":["BOPP metalizado","BOPP wash-off (separa-se do PET na reciclagem)","Couché brilhante","Térmico direto"],"r":1,"feedback":"BOPP wash-off separa-se da garrafa PET na reciclagem, mantendo a pureza do flake."}
  } else if (seg.includes('agência') || seg.includes('agencia') || seg.includes('marketing')) {
    q8 = {"id":"8","bloco":"Pergunta técnica","q":"Para um material com acabamento premium em PDV, qual Couché é ideal?","opts":["Couché simples sem revestimento","Couché para impressão digital/offset com gramatura alta","Sulfite comum","Kraft natural"],"r":1,"feedback":"Couché revestido com gramatura adequada oferece o acabamento premium ideal para PDV."}
  } else if (seg.includes('distribuidor')) {
    q8 = {"id":"8","bloco":"Pergunta técnica","q":"Em um material autoadesivo, qual componente É o adesivo?","opts":["A camada adesiva entre facestock e liner","O liner siliconado","O facestock impresso","O verniz de acabamento"],"r":0,"feedback":"O adesivo é a camada entre o facestock (papel ou filme) e o liner siliconado."}
  } else {
    // Gráfica (padrão)
    q8 = {"id":"8","bloco":"Pergunta técnica","q":"Qual a função do liner siliconado no material autoadesivo?","opts":["É o adesivo que gruda no produto","É o suporte que protege o adesivo até a aplicação","É a camada que recebe a impressão","É o verniz de acabamento"],"r":1,"feedback":"O liner siliconado é apenas o suporte que protege o adesivo até a hora da aplicação."}
  }

  return [
    {"id":"4","bloco":"Sobre você e seu negócio","q":"Como você chegou até a ARclad?","opts":["Já sou cliente","Conhecia mas nunca comprei","Já ouvi falar","Conheci aqui na feira hoje"],"r":null},
    {"id":"5","bloco":"Sobre você e seu negócio","q":"O que te trouxe ao nosso stand?","opts":["Buscar novos materiais","Avaliar suporte técnico","Indicação de parceiro","Conhecer o portfólio"],"r":null},
    {"id":"6","bloco":"Sobre você e seu negócio","q":"Qual material você mais compra/utiliza hoje?","opts":["BOPP ou filmes plásticos","Papel Couché ou revestido","Substratos térmicos","Material autoadesivo (liner + facestock + adesivo)"],"r":null},
    {"id":"7","bloco":"Sobre você e seu negócio","q":"Como avalia o suporte técnico do seu fornecedor atual?","opts":["Excelente","Razoável","Ruim","Não tenho suporte"],"r":null},
    {"id":"7b","bloco":"Sobre você e seu negócio","q":"Por que o suporte não é excelente?","opts":["Demora para responder","Não conhece bem os materiais","Não resolve problemas técnicos","Não oferece suporte proativo"],"r":null,"condicional":true},
    q8,
    {"id":"9","bloco":"Sobre você e seu negócio","q":"Qual é o seu maior desafio com materiais hoje?","opts":["Preço alto","Prazo imprevisível / falta de estoque","Falta de variedade no portfólio","Suporte técnico fraco"],"r":null},
    {"id":"10","bloco":"Sobre você e seu negócio","q":"O que te faria trocar de fornecedor?","opts":["Preço melhor","Material de maior qualidade","Suporte técnico especializado","Entrega rápida e estoque garantido"],"r":null},
    {"id":"11","bloco":"Sobre você e seu negócio","q":"Tem projeto de material nos próximos 3 meses?","opts":["Sim, projeto concreto","Sim, em fase de orçamento","Talvez","Não por enquanto"],"r":null}
  ]
}

