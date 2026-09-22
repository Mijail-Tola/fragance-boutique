import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-16 pb-8 border-t border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-gray-800 pb-12">
        
        {/* Marca y Descripción */}
        <div>
          <h3 className="font-serif text-2xl mb-1 tracking-wide">Fragance Boutique</h3>
          <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase mb-6">Perfumería y Cosmética</p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
            Especialistas en fragancias de diseñador, perfumes árabes y cosmética premium. Asesoramiento personalizado para encontrar tu esencia ideal.
          </p>
        </div>

        {/* Contacto y Ubicación */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-300">Contacto Directo</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <span className="text-rose-500">📍</span> 
              <span>Atención online y envíos<br/>Cochabamba, Bolivia</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-rose-500">📞</span> 
              <span>+591 63993851</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-rose-500">✉️</span> 
              <span>ventas@fraganceboutique.com</span>
            </li>
          </ul>
        </div>

        {/* Redes Sociales y Enlaces */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-300">Síguenos</h4>
          <div className="flex gap-4 mb-8">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg">
              <span className="sr-only">Facebook</span>
              <span className="font-bold font-serif">f</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg">
              <span className="sr-only">Instagram</span>
              <span className="font-bold font-serif">ig</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg">
              <span className="sr-only">TikTok</span>
              <span className="font-bold font-serif">tk</span>
            </a>
          </div>
        </div>

      </div>
      
      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 pt-8 text-center text-xs text-gray-600 tracking-wider">
        <p>&copy; {new Date().getFullYear()} FRAGANCE BOUTIQUE. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}