// pages/api/leads.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // CREATE — salvar novo lead
  if (req.method === 'POST') {
    try {
      const lead = req.body || {}
      if (!lead.nome || !lead.empresa) {
        return res.status(400).json({ error: 'nome e empresa obrigatórios' })
      }
      // Limpar campos undefined que possam quebrar o insert
      const cleaned = {}
      Object.keys(lead).forEach(k => {
        if (lead[k] !== undefined) cleaned[k] = lead[k]
      })
      const { data, error } = await supabase.from('leads').insert([cleaned]).select()
      if (error) {
        console.error('Supabase insert error:', error)
        return res.status(500).json({ error: error.message, details: error })
      }
      return res.status(200).json({ ok: true, lead: data?.[0] || null })
    } catch (e) {
      console.error('POST handler error:', e)
      return res.status(500).json({ error: e.message || 'erro desconhecido' })
    }
  }

  // UPDATE — atualizar NPS do lead mais recente pelo whatsapp
  if (req.method === 'PATCH') {
    try {
      const { nps, whatsapp } = req.body || {}
      if (!whatsapp) return res.status(400).json({ error: 'whatsapp obrigatório' })
      if (!nps) return res.status(400).json({ error: 'nps obrigatório' })

      // Primeiro buscar o lead mais recente
      const { data: leadsFound, error: findErr } = await supabase
        .from('leads')
        .select('id')
        .eq('whatsapp', whatsapp)
        .order('created_at', { ascending: false })
        .limit(1)

      if (findErr) {
        console.error('Supabase find error:', findErr)
        return res.status(500).json({ error: findErr.message })
      }
      if (!leadsFound || leadsFound.length === 0) {
        return res.status(404).json({ error: 'lead não encontrado' })
      }

      const { error: updateErr } = await supabase
        .from('leads')
        .update({ nps })
        .eq('id', leadsFound[0].id)

      if (updateErr) {
        console.error('Supabase update error:', updateErr)
        return res.status(500).json({ error: updateErr.message })
      }
      return res.status(200).json({ ok: true })
    } catch (e) {
      console.error('PATCH handler error:', e)
      return res.status(500).json({ error: e.message || 'erro desconhecido' })
    }
  }

  // READ — listar leads
  if (req.method === 'GET') {
    try {
      const { pais, feira, limit = 500 } = req.query
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Number(limit))

      if (pais)  query = query.eq('pais', pais)
      if (feira) query = query.eq('feira', feira)

      const { data, error } = await query
      if (error) {
        console.error('Supabase select error:', error)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json({ leads: data })
    } catch (e) {
      console.error('GET handler error:', e)
      return res.status(500).json({ error: e.message || 'erro desconhecido' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
