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
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" rx="24" fill="#1E293B"/>
          <path d="M35 38H85C86.6569 38 88 39.3431 88 41V44C88 45.6569 86.6569 47 85 47H35C33.3431 47 32 45.6569 32 44V41C32 39.3431 33.3431 38 35 38Z" fill="white"/>
          <path d="M55 47H65V85C65 87.7614 62.7614 90 60 90V90C57.2386 90 55 87.7614 55 85V47Z" fill="white"/>
          <circle cx="78" cy="56" r="6" fill="#818CF8"/>
        </svg>
        <span className="login-logo-text">TechniSuivi</span>
      </div>
      
      <h1 className="login-title">Créer un compte</h1>
      <p className="login-subtitle">Rejoignez TechniSuivi gratuitement</p>
      
      <form action={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 mb-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            className="form-control" 
            required 
          />
        </div>
        
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="password">Mot de passe</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            className="form-control" 
            required 
            minLength={6}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary w-full btn-lg" 
          disabled={loading}
        >
          <UserPlus className="w-5 h-5 mr-2" />
          {loading ? 'Création en cours...' : "S'inscrire"}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-[rgba(255,255,255,0.5)]">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-white hover:underline font-medium">
          Se connecter
        </Link>
      </div>
    </div>
  )
}
