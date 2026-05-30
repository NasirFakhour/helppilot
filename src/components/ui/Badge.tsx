export default function Badge({ children, variant = 'neutral' }) {
  const bg = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
    neutral: 'bg-gray-100 text-gray-800',
  }[variant]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded ${bg} text-sm font-medium`}>
      {children}
    </span>
  )
}
