"use client"

export default function WhatsAppButton() {
  const numeroWhatsApp = "59163993851" // Tu número
  const mensaje = "Hola, me gustaría recibir asesoramiento personalizado sobre los perfumes. ✨"
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`

  return (
    <a 
      href={url}
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
      aria-label="Asesoramiento por WhatsApp"
    >
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.656.69 5.2 1.996 7.458L.357 24l4.675-1.57c2.158 1.155 4.596 1.764 7.001 1.764 6.646 0 12.03-5.385 12.03-12.03S18.676 0 12.031 0zm0 22.215c-2.25 0-4.453-.604-6.388-1.751l-.458-.278-3.324 1.116.885-3.24-.306-.487C1.258 15.422.585 13.76.585 12.031c0-6.323 5.143-11.466 11.446-11.466 6.324 0 11.446 5.143 11.446 11.466s-5.122 11.466-11.446 11.466zM17.58 14.5c-.302-.15-1.785-.882-2.062-.982-.277-.101-.48-.15-.683.15-.203.303-.781.982-.958 1.183-.176.202-.353.226-.655.076-2.14-1.07-3.415-2.22-4.664-4.385-.175-.302-.018-.466.133-.616.136-.136.302-.353.453-.53.15-.176.203-.302.302-.504.101-.202.05-.378-.025-.53-.075-.15-.683-1.644-.935-2.25-.246-.593-.496-.513-.683-.521-.176-.009-.378-.009-.581-.009-.202 0-.53.076-.807.378-.278.303-1.058 1.034-1.058 2.522 0 1.488 1.084 2.925 1.235 3.127.15.202 2.134 3.256 5.166 4.562 2.135.918 2.87.807 3.398.681.603-.143 1.785-.731 2.037-1.437.252-.706.252-1.311.176-1.437-.076-.126-.277-.202-.58-.353z"/>
      </svg>
      {/* Tooltip que aparece al pasar el ratón */}
      <span className="absolute right-16 bg-white text-gray-800 text-sm px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold pointer-events-none">
        ¿Necesitas asesoría?
      </span>
    </a>
  )
}