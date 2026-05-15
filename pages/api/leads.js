// pages/api/leads.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // CREATE — salvar novo lead
  if (req.method === 'POST') {
    const lead = req.body
    if (!lead.nome || !lead.empresa) {
      return res.status(400).json({ error: 'nome e empresa obrigatórios' })
    }
    const { error } = await supabase.from('leads').insert([lead])
    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ ok: true })
  }

  // UPDATE — atualizar NPS do lead pelo whatsapp
  if (req.method === 'PATCH') {
    const { nps, whatsapp } = req.body
    if (!whatsapp) return res.status(400).json({ error: 'whatsapp obrigatório' })
    const { error } = await supabase
      .from('leads')
      .update({ nps })
      .eq('whatsapp', whatsapp)
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) {
      console.error('Supabase update error:', error)
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ ok: true })
  }

  // READ — listar leads
  if (req.method === 'GET') {
    const { pais, feira, limit = 500 } = req.query
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Number(limit))

    if (pais)  query = query.eq('pais', pais)
    if (feira) query = query.eq('feira', feira)

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ leads: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
