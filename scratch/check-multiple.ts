import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ffhlhntcxyobzbkhrbdb.supabase.co'
const supabaseAnonKey = 'sb_publishable_hfa6P5YgxejGzqmTajiBDQ_Sb8_vhhG'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkMultiple() {
  const accounts = [
    { email: 'technisuivi-test-user@outlook.fr', pass: 'Password123!' },
    { email: 'test-technisuivi@yopmail.com', pass: 'Password123!' },
    { email: 'artisan.test.technisuivi@gmail.com', pass: 'Password123!' },
    { email: 'admin@helppilot.fr', pass: 'Password123!' }
  ]
  
  for (const acc of accounts) {
    console.log(`Checking ${acc.email}...`)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.pass,
    })
    
    if (error) {
      console.log(`  Failed: ${error.message}`)
    } else {
      console.log(`  SUCCESS! Account ${acc.email} is active. ID: ${data.user?.id}`)
      return
    }
  }
}

checkMultiple()
