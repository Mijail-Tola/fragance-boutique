// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // Quitamos el max-w-7xl y los paddings para que tu panel ocupe el 100% de la pantalla
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col w-full">
      {children}
    </div>
  )
}