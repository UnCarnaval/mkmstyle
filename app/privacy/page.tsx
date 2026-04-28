export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Política de Privacidad
          </h1>

          <div className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Información que Recopilamos</h2>
              <p className="leading-relaxed">
                Conforme a la Ley 172-13 de Protección de Datos Personales de República Dominicana, recopilamos
                información personal cuando te registras en nuestra plataforma, realizas una compra o interactúas con
                nuestros servicios. Esta información puede incluir:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico</li>
                <li>Dirección física en República Dominicana</li>
                <li>Información de pago (procesada de forma segura por nuestros proveedores autorizados)</li>
                <li>Historial de compras y participación en sorteos</li>
                <li>Dirección IP y datos de navegación</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Base Legal y Uso de la Información</h2>
              <p className="leading-relaxed">Utilizamos tu información personal con base en:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Tu consentimiento expreso al registrarte</li>
                <li>Ejecución del contrato de participación en sorteos</li>
                <li>Cumplimiento de obligaciones legales (DGII, Pro Consumidor, prevención de lavado de activos)</li>
              </ul>
              <p className="leading-relaxed mt-2">Usamos tus datos para:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Procesar tus compras de boletos y emitir comprobantes fiscales</li>
                <li>Verificar tu identidad conforme a regulaciones dominicanas</li>
                <li>Notificarte sobre el estado de los sorteos</li>
                <li>Contactarte si resultas ganador y gestionar la entrega del premio</li>
                <li>Cumplir con obligaciones tributarias ante la DGII</li>
                <li>Prevenir fraude y cumplir con la Ley 155-17 contra Lavado de Activos</li>
                <li>Mejorar nuestros servicios y experiencia de usuario</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Protección y Seguridad de Datos</h2>
              <p className="leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas conforme a estándares internacionales y la
                Ley 172-13 para proteger tu información personal contra acceso no autorizado, pérdida o alteración:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Cifrado SSL/TLS en todas las transmisiones de datos</li>
                <li>Almacenamiento seguro en servidores con certificación</li>
                <li>Acceso restringido solo a personal autorizado</li>
                <li>Auditorías de seguridad periódicas</li>
                <li>Protocolos de respuesta ante incidentes de seguridad</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Compartir Información con Terceros</h2>
              <p className="leading-relaxed">
                No vendemos ni alquilamos tu información personal a terceros. Solo compartimos información con:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Procesadores de pago autorizados en República Dominicana</li>
                <li>Proveedores de servicios tecnológicos bajo acuerdos de confidencialidad</li>
                <li>Autoridades dominicanas cuando sea requerido por ley (DGII, Ministerio Público, etc.)</li>
                <li>Empresas de courier para entrega de premios</li>
              </ul>
              <p className="leading-relaxed mt-2">
                Todos nuestros proveedores están obligados contractualmente a proteger tu información conforme a la Ley
                172-13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Tus Derechos bajo la Ley Dominicana</h2>
              <p className="leading-relaxed">Conforme a la Ley 172-13, tienes derecho a:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Acceder a tu información personal que mantenemos</li>
                <li>Rectificar datos inexactos o incompletos</li>
                <li>Solicitar la eliminación de tus datos (salvo obligaciones legales de conservación)</li>
                <li>Oponerte al procesamiento de tu información para fines de marketing</li>
                <li>Revocar tu consentimiento en cualquier momento</li>
                <li>Presentar quejas ante el órgano regulador competente</li>
                <li>Solicitar la portabilidad de tus datos</li>
              </ul>
              <p className="leading-relaxed mt-2">
                Para ejercer estos derechos, contáctanos en privacy@dinamicapro.com con tu cédula de identidad.
                Responderemos en un plazo máximo de 15 días hábiles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Retención de Datos</h2>
              <p className="leading-relaxed">Conservamos tu información personal durante:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>El tiempo necesario para proporcionar nuestros servicios</li>
                <li>10 años para registros contables y fiscales conforme al Código Tributario</li>
                <li>5 años para registros de prevención de lavado de activos conforme a la Ley 155-17</li>
                <li>El plazo que las autoridades dominicanas requieran</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Cookies y Tecnologías Similares</h2>
              <p className="leading-relaxed">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, mantener tu sesión activa y
                analizar el uso de la plataforma. Puedes configurar tu navegador para rechazar cookies, aunque esto
                puede afectar algunas funcionalidades. Las cookies que usamos incluyen:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Cookies esenciales para el funcionamiento de la plataforma</li>
                <li>Cookies de sesión para mantener tu login</li>
                <li>Cookies analíticas para mejorar nuestros servicios</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Transferencias Internacionales</h2>
              <p className="leading-relaxed">
                Algunos de nuestros proveedores de servicios pueden estar ubicados fuera de República Dominicana. En
                esos casos, nos aseguramos de que existan garantías adecuadas conforme a la Ley 172-13, incluyendo
                cláusulas contractuales estándar y certificaciones de privacidad internacionales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Menores de Edad</h2>
              <p className="leading-relaxed">
                Nuestra plataforma está dirigida exclusivamente a mayores de 18 años. No recopilamos intencionalmente
                información de menores de edad. Si detectamos que hemos recopilado datos de un menor, los eliminaremos
                inmediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Cambios a esta Política</h2>
              <p className="leading-relaxed">
                Nos reservamos el derecho de actualizar esta política de privacidad. Te notificaremos sobre cambios
                importantes por correo electrónico o mediante un aviso destacado en la plataforma con al menos 15 días
                de anticipación. La versión actualizada entrará en vigencia tras dicho período.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Información de Contacto</h2>
              <p className="leading-relaxed">
                Para preguntas, ejercicio de derechos o quejas sobre esta política de privacidad:
                <br />
                <br />
                <strong>Dinamica Pro</strong>
                <br />
                Responsable de Tratamiento de Datos
                <br />
                Correo: <span className="text-cyan-400">privacy@dinamicapro.com</span>
              </p>
            </section>

            <p className="text-sm text-slate-400 mt-8 pt-8 border-t border-white/10">
              Última actualización: {new Date().toLocaleDateString("es-ES")}
              <br />
              Versión: 2.0 - Conforme a Ley 172-13 de República Dominicana
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
