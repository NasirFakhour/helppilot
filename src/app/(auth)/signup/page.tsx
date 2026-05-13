'use client'

import { signup } from '../actions'
import { useActionState } from 'react'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="login-card">
      <div className="login-logo">
        <svg width="48" height="48" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" rx="36" fill="#1e293b"/>
          <path d="M38 46C38 42.6863 40.6863 40 44 40H76C79.3137 40 82 42.6863 82 46V50C82 53.3137 79.3137 56 76 56H64V80C64 83.3137 61.3137 86 58 86H56C52.6863 86 50 83.3137 50 80V56H44C40.6863 56 38 53.3137 38 50V46Z" fill="white"/>
          <circle cx="78" cy="72" r="7" fill="white"/>
        </svg>
        <span className="login-logo-text">TechniSuivi</span>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="login-title">Rejoignez-nous</h1>
        <p className="login-subtitle">L'outil indispensable pour votre activité de technicien</p>
      </div>
      
      <form action={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-4 mb-2 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm animate-fade-in">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label text-white/70" htmlFor="email">Email professionnel</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            className="form-control bg-white/5 border-white/10 text-white focus:bg-white/10" 
            placeholder="votre@email.com"
            required 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label text-white/70" htmlFor="password">Mot de passe</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            className="form-control bg-white/5 border-white/10 text-white focus:bg-white/10" 
            placeholder="Minimum 6 caractères"
            required 
            minLength={6}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary w-full btn-lg mt-2 h-12 shadow-lg shadow-indigo-500/20" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Création...
            </div>
          ) : (
            <>
              <UserPlus className="w-5 h-5 mr-2" />
              S'inscrire gratuitement
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-8 pt-6 border-t border-white/5">
        <p className="text-sm text-white/40">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
