import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ffhlhntcxyobzbkhrbdb.supabase.co'
const supabaseAnonKey = 'sb_publishable_hfa6P5YgxejGzqmTajiBDQ_Sb8_vhhG'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAccount() {
  const email = 'admin@helppilot.fr'
  const password = 'Password123!'
  
  console.log(`Checking if ${email} exists...`)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    console.log('Login failed:', error.message)
    // If it says "Invalid login credentials", the account might exist but password wrong, 
    // or it doesn't exist.
  } else {
    console.log('Account exists and password is correct!', data.user?.id)
  }
}

checkAccount()
