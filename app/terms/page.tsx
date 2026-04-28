export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Términos y Condiciones
          </h1>

          <div className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Aceptación de los Términos</h2>
              <p className="leading-relaxed">
                Al acceder y utilizar esta plataforma de sorteos, aceptas estar legalmente vinculado por estos términos
                y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros
                servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Elegibilidad y Jurisdicción</h2>
              <p className="leading-relaxed">Para participar en los sorteos debes:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Ser mayor de 18 años de edad</li>
                <li>
                  Ser residente de la República Dominicana o estar físicamente presente en el territorio dominicano al
                  momento de participar
                </li>
                <li>
                  Tener capacidad legal para celebrar contratos vinculantes según las leyes de República Dominicana
                </li>
                <li>Cumplir con todas las leyes y regulaciones aplicables de República Dominicana</li>
                <li>
                  Proporcionar documentación de identidad válida (Cédula de Identidad y Electoral dominicana o
                  pasaporte)
                </li>
              </ul>
              <p className="leading-relaxed mt-2">
                Esta plataforma opera bajo las leyes de la República Dominicana y cumple con todas las regulaciones de
                la Dirección General de Impuestos Internos (DGII) y demás autoridades competentes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Compra de Boletos</h2>
              <p className="leading-relaxed">
                Cada sorteo tiene un número limitado de boletos. Los boletos se venden por orden de llegada hasta agotar
                existencias. Una vez completada la compra:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Recibirás un número de boleto único y código de verificación</li>
                <li>La compra es final y no reembolsable salvo cancelación del sorteo por parte de Dinamica Pro</li>
                <li>No se pueden transferir boletos a otras personas sin autorización expresa</li>
                <li>Cada boleto tiene las mismas probabilidades matemáticas de ganar</li>
                <li>Se emitirá factura fiscal electrónica conforme a las normas de la DGII</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Métodos de Pago</h2>
              <p className="leading-relaxed">
                Aceptamos los siguientes métodos de pago autorizados en República Dominicana:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Tarjetas de crédito/débito emitidas en RD (Visa, Mastercard, American Express)</li>
                <li>Transferencias bancarias desde instituciones financieras dominicanas</li>
                <li>Pagos electrónicos procesados por plataformas autorizadas</li>
              </ul>
              <p className="leading-relaxed mt-2">
                Todos los pagos son procesados en pesos dominicanos (DOP) o dólares estadounidenses (USD) según se
                indique. No almacenamos información de tarjetas de crédito en nuestros servidores. Todos los pagos están
                sujetos a las leyes de prevención de lavado de activos (Ley 155-17) de República Dominicana.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Selección de Ganadores</h2>
              <p className="leading-relaxed">
                El ganador se selecciona de forma aleatoria mediante un sistema automatizado certificado cuando:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Se venden todos los boletos disponibles, o</li>
                <li>Se alcanza la fecha de finalización del sorteo</li>
              </ul>
              <p className="leading-relaxed mt-2">
                El proceso de selección es transparente, justo y verificable. Nos reservamos el derecho de solicitar
                verificación de identidad mediante cédula dominicana antes de entregar el premio. El sorteo se realiza
                bajo la supervisión de un notario público cuando el valor del premio supere los RD$100,000.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Impuestos y Obligaciones Fiscales</h2>
              <p className="leading-relaxed">Conforme a la legislación tributaria de República Dominicana:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>
                  Los premios mayores a RD$6,000 están sujetos a retención del 10% de Impuesto Sobre la Renta (ISR)
                  conforme al Código Tributario
                </li>
                <li>El ganador deberá proporcionar documentación válida para fines fiscales</li>
                <li>
                  Dinamica Pro realizará las retenciones correspondientes y emitirá el formulario 606 para la DGII
                </li>
                <li>Los gastos de envío dentro de República Dominicana están incluidos</li>
                <li>Para envíos internacionales, aplican impuestos aduanales según regulación de Aduanas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Notificación y Entrega de Premios</h2>
              <p className="leading-relaxed">Los ganadores serán notificados por:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Correo electrónico</li>
                <li>Actualización en su panel de usuario</li>
                <li>Publicación del código de boleto ganador (no datos personales) en la plataforma</li>
              </ul>
              <p className="leading-relaxed mt-2">
                El ganador debe responder y presentar documentación válida dentro de 30 días calendario. La entrega se
                realizará en nuestras oficinas en República Dominicana o mediante courier certificado. Si no se recibe
                respuesta en el plazo establecido, se seleccionará un nuevo ganador conforme a la Ley de Protección al
                Consumidor (Ley 358-05).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Cancelación de Sorteos</h2>
              <p className="leading-relaxed">Dinamica Pro se reserva el derecho de cancelar cualquier sorteo si:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Se detecta fraude o actividad sospechosa conforme a la Ley 155-17 contra el Lavado de Activos</li>
                <li>Casos fortuitos o fuerza mayor lo impiden (desastres naturales, emergencias nacionales, etc.)</li>
                <li>Orden de autoridad competente dominicana</li>
                <li>No se cumple el mínimo de boletos vendidos establecido (si aplica)</li>
              </ul>
              <p className="leading-relaxed mt-2">
                En caso de cancelación, todos los participantes recibirán un reembolso completo en un plazo máximo de 15
                días hábiles conforme a la Ley de Protección al Consumidor.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Protección de Datos Personales</h2>
              <p className="leading-relaxed">
                Dinamica Pro cumple con la Ley 172-13 de Protección de Datos Personales de República Dominicana. Tus
                datos personales serán tratados conforme a nuestra Política de Privacidad y únicamente para los fines
                del sorteo. Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Conducta del Usuario</h2>
              <p className="leading-relaxed">Está prohibido bajo pena de acciones legales:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Usar bots, scripts automatizados o cualquier método fraudulento para comprar boletos</li>
                <li>Crear múltiples cuentas falsas o usar identidades ajenas</li>
                <li>Intentar manipular el sistema de sorteos o hackear la plataforma</li>
                <li>Usar métodos de pago fraudulentos o realizar operaciones sospechosas</li>
                <li>Revender boletos sin autorización expresa de Dinamica Pro</li>
              </ul>
              <p className="leading-relaxed mt-2">
                Cualquier violación resultará en la suspensión inmediata de la cuenta, descalificación de todos los
                sorteos, y posibles acciones legales conforme al Código Penal de República Dominicana.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Limitación de Responsabilidad</h2>
              <p className="leading-relaxed">
                Conforme a las leyes dominicanas, Dinamica Pro no será responsable por pérdidas indirectas, incidentales
                o consecuentes más allá de los límites establecidos por la Ley de Protección al Consumidor. Nuestra
                responsabilidad máxima se limita al precio del boleto pagado. Los premios se entregan en las condiciones
                especificadas, con garantías del fabricante cuando aplique.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Resolución de Disputas</h2>
              <p className="leading-relaxed">Cualquier controversia será resuelta mediante:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Negociación directa entre las partes</li>
                <li>Mediación en la Cámara de Comercio y Producción de Santo Domingo</li>
                <li>Como última instancia, tribunales competentes de República Dominicana</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Ley Aplicable y Jurisdicción</h2>
              <p className="leading-relaxed">
                Estos términos se rigen exclusivamente por las leyes de la República Dominicana, incluyendo pero no
                limitado a: el Código Civil, Código de Comercio, Ley de Protección al Consumidor (358-05), Código
                Tributario, Ley de Protección de Datos (172-13), y Ley contra el Lavado de Activos (155-17). Cualquier
                disputa se resolverá en los tribunales del Distrito Nacional, República Dominicana.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Modificaciones</h2>
              <p className="leading-relaxed">
                Dinamica Pro puede modificar estos términos notificando con 15 días de anticipación a través de la
                plataforma y correo electrónico. Los cambios no afectarán sorteos ya iniciados. Es tu responsabilidad
                revisar estos términos periódicamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Información de la Empresa</h2>
              <p className="leading-relaxed">
                Dinamica Pro
                <br />
                República Dominicana
                <br />
                Correo: legal@dinamicapro.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">16. Contacto y Quejas</h2>
              <p className="leading-relaxed">
                Para preguntas, quejas o reclamos sobre estos términos, contáctanos en:
                <br />
                <span className="text-cyan-400">legal@dinamicapro.com</span>
                <br />
                <br />
                También puedes presentar quejas ante Pro Consumidor (Dirección de Protección al Consumidor) conforme a
                tus derechos bajo la Ley 358-05.
              </p>
            </section>

            <p className="text-sm text-slate-400 mt-8 pt-8 border-t border-white/10">
              Última actualización: {new Date().toLocaleDateString("es-ES")}
              <br />
              Versión: 2.0 - República Dominicana
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
