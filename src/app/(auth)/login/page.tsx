'use client'

import { login } from '../actions'
import { useActionState } from 'react'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="login-card">
      <div className="login-logo">
        <div className="login-logo-icon">HP</div>
        <span className="login-logo-text">HelpPilot</span>
      </div>
      
      <h1 className="login-title">Accès Technicien</h1>
      <p className="login-subtitle">Gérez vos interventions en toute simplicité</p>
      
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
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary w-full btn-lg" 
          disabled={loading}
        >
          <LogIn className="w-5 h-5 mr-2" />
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-[rgba(255,255,255,0.5)]">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="text-white hover:underline font-medium">
          S'inscrire
        </Link>
      </div>
    </div>
  )
}
