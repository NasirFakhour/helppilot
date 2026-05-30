import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface rounded-sm shadow-sm p-4 ${className}`}> 
      {children}
    </div>
  )
}
