export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="login-screen">
      {children}
    </div>
  )
}
