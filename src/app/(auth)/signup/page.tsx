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
        <div className="login-logo-icon">HP</div>
        <span className="login-logo-text">HelpPilot</span>
      </div>
      
      <h1 className="login-title">Créer un compte</h1>
      <p className="login-subtitle">Rejoignez HelpPilot gratuitement</p>
      
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
