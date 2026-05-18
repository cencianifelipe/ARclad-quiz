// pages/api/quiz-personalize.js — Q4-Q11 personalizadas · SEM wash-off
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
        system: `Você é consultor da ARclad do Brasil. Gere 9 perguntas personalizadas com base no perfil do visitante.

INSTRUÇÃO CRÍTICA: Retorne APENAS JSON, sem markdown, sem backticks.

🚫🚫🚫 PROIBIDO ABSOLUTO 🚫🚫🚫
- NUNCA, em hipótese alguma, mencione "wash-off", "washoff", "wash off"
- NUNCA pergunte sobre garrafas PET, reciclagem, sustentabilidade
- NUNCA mencione vinil ou PSA
- Estes temas estão BANIDOS deste quiz

Se você mencionar qualquer um destes, a resposta será descartada.

═══ ESTRUTURA OBRIGATÓRIA (9 perguntas com IDs: 4,5,6,7,7b,8,9,10,11) ═══

Q4 — Brand awareness (fixa para todos):
"Como você chegou até a ARclad?"
Opções: ["Já sou cliente","Conhecia mas nunca comprei","Já ouvi falar","Conheci aqui na feira hoje"]

Q5 — Motivação (adapte ao segmento)
Q6 — Material principal usado (adapte ao segmento)
Q7 — Avaliação do suporte (fixa): ["Excelente","Razoável","Ruim","Não tenho suporte"]
Q7b — Por que suporte não é excelente ("condicional":true)
Q8 — TÉCNICA (escolha um dos temas autorizados abaixo)
Q9 — Maior desafio (adapte)
Q10 — O que faria trocar (adapte)
Q11 — Timing (fixa): "Tem projeto de material nos próximos 3 meses?" ["Sim, projeto concreto","Sim, em fase de orçamento","Talvez","Não por enquanto"]

═══ Q8 TÉCNICA — TEMAS AUTORIZADOS POR SEGMENTO ═══

🖨️ GRÁFICA — escolha UM destes:
A) Função do liner siliconado (correta: protege o adesivo até a aplicação)
B) Adesivo permanente vs removível (qual indica para promoção temporária)
C) Por que térmico direto não precisa de ribbon
D) Gramatura ideal de Couché para impressão flexográfica

🏭 MARCA — escolha UM destes:
A) BOPP brilho vs BOPP fosco (diferença visual e aplicação)
B) Por que rótulos para congelados precisam adesivo especial
C) Vantagem do Couché fosco para visual premium
D) Quando usar BOPP transparente vs branco

🎨 AGÊNCIA — escolha UM destes:
A) Qual Couché é ideal para acabamento premium em PDV
B) Diferença entre laminação fosca e brilho
C) Quando usar adesivo removível em campanha
D) Quais materiais permitem hot stamping

📦 DISTRIBUIDOR — escolha UM destes:
A) Qual componente É o adesivo no autoadesivo (correta: camada entre facestock e liner)
B) Diferença entre liner kraft amarelo e glassine
C) Como armazenar materiais autoadesivos corretamente
D) Vantagem do térmico direto vs térmico transfer

═══ REGRAS DE ESTRUTURA ═══

- Liner = SUPORTE siliconado (NÃO é o adesivo)
- Couché com acento
- r: índice 0-3 da resposta correta em Q8
- feedback: explicação de 10-20 palavras

Retorne SOMENTE JSON.`,
        messages: [{
          role: 'user',
          content: `Perfil:
- Segmento: ${segmento}
- Faturamento: ${faturamento}
- SKUs/ano: ${skus}
- Feira: ${feira}

Gere 9 perguntas em JSON puro. Para Q8 escolha UM tema da lista do segmento — NÃO use wash-off nem PET nem reciclagem.`
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
    } catch(e) {
      const m = jsonText.match(/\{[\s\S]*\}/)
      if (m) {
        try { parsed = JSON.parse(m[0]) } catch(e2) {}
      }
    }

    // 🛡️ CAMADA DE PROTEÇÃO REFORÇADA
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length >= 8) {
      const bannedPatterns = [
        /wash[\s-]?off/i,
        /garrafa\s*pet/i,
        /\bpet\b/i,
        /recicl/i,
        /sustent/i,
        /\bvinil\b/i,
        /\bpsa\b/i,
      ]
      
      // Verificar cada pergunta individualmente
      let hasAnyBanned = false
      const cleanQuestions = parsed.questions.map((q, idx) => {
        if (!q) return null
        const qText = JSON.stringify(q)
        const isBanned = bannedPatterns.some(rx => rx.test(qText))
        if (isBanned) {
          console.log(`🛡️ Pergunta ${idx} (id:${q.id}) bloqueada — substituindo`)
          hasAnyBanned = true
          // Pegar a pergunta segura equivalente do fallback
          const fallback = getDefaultQuestions(segmento)
          return fallback.find(fq => String(fq.id) === String(q.id)) || q
        }
        return q
      }).filter(Boolean)
      
      if (cleanQuestions.length >= 8) {
        return res.status(200).json({ questions: cleanQuestions })
      }
    }

    return res.status(200).json({ questions: getDefaultQuestions(segmento) })

  } catch (error) {
    console.error('Personalize error:', error)
    return res.status(200).json({ questions: getDefaultQuestions(segmento) })
  }
}

function getDefaultQuestions(segmento) {
  const seg = (segmento||'').toLowerCase()
  let q8

  if (seg.includes('marca') || seg.includes('indústria') || seg.includes('industria')) {
    q8 = {"id":"8","bloco":"Pergunta técnica","q":"Para rótulos de produtos congelados, qual característica do adesivo é essencial?","opts":["Adesivo padrão para uso geral","Adesivo permanente comum","Adesivo especial para baixa temperatura","Adesivo removível"],"r":2,"feedback":"Adesivos especiais para baixa temperatura mantêm a fixação mesmo em ambientes frios."}
  } else if (seg.includes('agência') || seg.includes('agencia') || seg.includes('marketing')) {
    q8 = {"id":"8","bloco":"Pergunta técnica","q":"Para um material com acabamento premium em PDV, qual papel é ideal?","opts":["Sulfite comum","Kraft natural","Couché revestido com gramatura adequada","Papel jornal"],"r":2,"feedback":"Couché revestido com gramatura adequada oferece o acabamento premium ideal para PDV."}
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
