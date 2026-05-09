import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ffhlhntcxyobzbkhrbdb.supabase.co'
const supabaseAnonKey = 'sb_publishable_hfa6P5YgxejGzqmTajiBDQ_Sb8_vhhG'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
  const email = 'helppilot-test-user@outlook.fr'
  const password = 'Password123!'
  
  console.log(`Attempting to sign up ${email}...`)
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) {
    console.error('Signup failed:', error.message)
  } else {
    console.log('Signup successful!', data.user?.id)
    if (!data.session) {
      console.log('Confirmation email required.')
    }
  }
}

testSignup()
