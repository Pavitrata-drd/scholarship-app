import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.https://mcranuklhopiynlvnzqk.supabase.co
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jcmFudWtsaG9waXlubHZuenFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTI3MTEsImV4cCI6MjA4NjgyODcxMX0.7xsHW0pvslnoeIHpnOFGU8nzGvYwN68bcRMx-KLLMJk

export const supabase = createClient(supabaseUrl, supabaseAnonKey)