import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Política de privacidad — español.
 *
 * 🔴 **El texto coreano es el original y prevalece.** Esta es una traducción para facilitar
 *   la lectura; en caso de discrepancia, rige `legal-text.ts` (coreano).
 * ⚠ **La estructura debe coincidir exactamente con el coreano** — mismo número de secciones
 *   y de líneas en cada una. `npm run check:legal` lo verifica.
 */
export const PRIVACY_ES: LegalDoc = {
  title: 'Política de privacidad de Jogak',
  sourceFingerprint: 'e1010878',
  effective: '2026-08-09',
  updated: '2026-08-11',
  intro:
    'Vivace Games (en adelante, «el operador») cumple la Ley de Protección de Información Personal y demás normativa aplicable, y trata los datos personales de las personas usuarias de «Jogak» (en adelante, «el servicio») como se indica a continuación. Jogak no envía a ningún servidor las entradas de diario que escribes y, por principio, recoge únicamente la información mínima necesaria.',
  sections: [
    {
      h: '1. Lo que no recogemos (lo decimos primero)',
      body: [
        'El operador no recoge la siguiente información ni la transmite fuera de tu dispositivo.',
        '• Títulos, texto, listas, fotos, etiquetas y emociones de las entradas: se guardan únicamente en el almacenamiento interno de tu dispositivo.',
        '• El PIN, el patrón o la respuesta de pista del bloqueo de la aplicación: se guardan en el almacenamiento seguro del dispositivo solo en forma no recuperable (un hash); el original no se almacena en ningún sitio.',
        '• Tu nombre, fecha de nacimiento, número de teléfono, dirección, lista de contactos, ubicación ni ningún registro de acceso a toda tu galería de fotos.',
        'Las fotos que eliges en la aplicación solo se copian a la carpeta propia de la aplicación en tu dispositivo para poder incluirlas en una entrada; no se transmiten a ningún sitio.',
      ],
    },
    {
      h: '2. Datos personales que recogemos',
      body: [
        'a. Cuando usas «Contacto» (requiere iniciar sesión)',
        '• Obligatorio: la dirección de correo de tu cuenta de Google y el identificador único de la cuenta social (el «sub» de Google)',
        '  — Base legal: Ley de Protección de Información Personal, art. 15(1)4 (necesario para ejecutar las medidas solicitadas por la persona usuaria, es decir, responder a su consulta)',
        '  — Finalidad: identificar a quien escribe, enviar la respuesta y permitirte consultar tu propio historial',
        '• Categoría y contenido de la consulta',
        '• Tipo de dispositivo (Android/iOS) y versión de la aplicación: para entender en qué entorno se produjo el problema',
        '※ Iniciar sesión solo es necesario para «Contacto»; escribir entradas, el bloqueo de la aplicación y las demás funciones no lo requieren.',
        '※ Los menores de 14 años no pueden usar la función de inicio de sesión.',
        'b. Información recogida automáticamente al mostrar anuncios',
        '• Identificador publicitario (ID de publicidad de Android), información del dispositivo y de la red, registros de impresiones y clics',
        '• Lo anterior lo recoge Google (AdMob); los detalles y cómo oponerse figuran en el apartado 7.',
      ],
    },
    {
      h: '3. Finalidades del tratamiento',
      body: [
        '• Recibir y atender consultas: revisar lo que has enviado e identificar y corregir fallos',
        '• Identificar a quien escribe y responder: hacerte llegar la respuesta y permitirte revisar tu propio historial de consultas',
        '• Mostrar anuncios: ofrecer publicidad a quienes usan la versión gratuita y medir su rendimiento',
        'El operador no usa los datos personales para fines distintos de los anteriores y, si la finalidad cambia, recabará el consentimiento previamente.',
      ],
    },
    {
      h: '4. Plazos de conservación y uso',
      body: [
        '• Datos de la cuenta (correo electrónico, «sub» de Google): hasta que elimines tu cuenta. Al eliminarla los destruimos sin demora o los dejamos en una forma no rastreable.',
        '• Contenido de las consultas: 3 años desde su recepción (Ley de Protección del Consumidor en el Comercio Electrónico — registros sobre reclamaciones o resolución de conflictos)',
        '• Datos de comportamiento basados en el identificador publicitario: hasta 1 año desde su recogida',
        'Una vez transcurrido el plazo o cumplida la finalidad, destruimos los datos sin demora.',
      ],
    },
    {
      h: '5. Cesión a terceros',
      body: [
        'El operador no cede a terceros los datos personales de las personas usuarias.',
        'Se exceptúan los casos en que exista una disposición legal específica o en que una autoridad investigadora lo requiera siguiendo los procedimientos y formas previstos por la ley.',
      ],
    },
    {
      h: '6. Encargo del tratamiento y transferencia internacional',
      body: [
        'Para prestar el servicio, el operador encarga el tratamiento como se indica a continuación, y parte de él se realiza fuera de Corea.',
        '• Google LLC — País: Estados Unidos. Contacto: https://support.google.com/policies/contact/general_privacy_form. Finalidad: mostrar y medir anuncios (AdMob) e inicio de sesión con cuenta de Google. Datos: identificador publicitario, información del dispositivo y de la red y, al iniciar sesión, la dirección de correo y el identificador de la cuenta. Cuándo y cómo: se transmiten por la red al solicitar un anuncio y al iniciar sesión. Conservación: conforme a la política de privacidad de Google',
        '• Supabase Inc. — País: Estados Unidos (domicilio social). Contacto: privacy@supabase.com. Finalidad: almacenar en base de datos la información de consultas y cuentas. Datos: los del apartado 2(a). Cuándo y cómo: se transmiten por la red al enviar una consulta. Conservación: los plazos del apartado 4. ※ La ubicación física de almacenamiento es la República de Corea (región de Seúl), pero lo comunicamos como transferencia internacional porque la sociedad operadora está fuera de Corea.',
        '• Vercel Inc. — País: Estados Unidos. Contacto: privacy@vercel.com. Finalidad: operar el servidor que recibe las consultas. Datos: los del apartado 2(a). Cuándo y cómo: se transmiten por la red al enviar una consulta. Conservación: hasta la finalización del contrato de encargo',
        'Puedes oponerte a la transferencia internacional de tus datos. Para oponerte a las transferencias relacionadas con la publicidad, desactiva los anuncios personalizados según el apartado 7; para oponerte a las relacionadas con las consultas, basta con que no uses la función «Contacto» (todas las demás funciones, incluida la escritura de entradas, siguen disponibles).',
      ],
    },
    {
      h: '7. Identificadores publicitarios y otros medios de recogida automática, y cómo oponerse',
      body: [
        'El servicio usa Google AdMob para mostrar anuncios a quienes usan la versión gratuita. AdMob puede recoger y usar un identificador publicitario para ofrecer anuncios personalizados.',
        'Finalidad de la recogida: ofrecer anuncios personalizados, medir su rendimiento y prevenir clics fraudulentos',
        'Cómo oponerse (Android): Ajustes > Privacidad > Anuncios > «Eliminar ID de publicidad» u «Desactivar la personalización de anuncios»',
        'Cómo oponerse (iOS): Ajustes > Privacidad y seguridad > Rastreo > desactivar «Permitir que las apps soliciten rastrearte»',
        'Aunque te opongas, es posible que sigas viendo anuncios, pero serán anuncios genéricos no basados en tus intereses.',
        'Más información sobre cómo trata Google los datos personales con fines publicitarios: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Procedimiento y método de destrucción',
      body: [
        'Procedimiento: los datos personales cuyo plazo haya vencido o cuya finalidad se haya cumplido se destruyen sin demora. Cuando la ley exija conservarlos, se guardan separados del resto durante ese plazo y después se destruyen.',
        'Método: la información en formato de archivo electrónico se elimina de forma permanente mediante procedimientos técnicos que impiden su recuperación o reconstrucción.',
        'Las entradas, fotos e información de bloqueo guardadas en tu dispositivo se eliminan de él cuando usas la función «Restablecer todo» de la aplicación o la desinstalas. El operador no dispone de esa información, por lo que no puede eliminarla por ti.',
      ],
    },
    {
      h: '9. Derechos de la persona interesada y de su representante legal, y cómo ejercerlos',
      body: [
        'Puedes ejercer en cualquier momento los siguientes derechos.',
        '• Solicitar el acceso a tus datos • Solicitar la rectificación si hay algún error • Solicitar la supresión • Solicitar la suspensión del tratamiento • Solicitar la portabilidad de tus datos (Ley de Protección de Información Personal, art. 35-2)',
        'Puedes ejercerlos por escrito o por correo electrónico usando el contacto del apartado 11, y el operador actuará sin demora.',
        'Si solicitas la rectificación de un error en tus datos, no los usaremos ni los cederemos hasta que la rectificación esté completa.',
        'El representante legal de un menor de 14 años puede ejercer los derechos anteriores en su nombre.',
      ],
    },
    {
      h: '10. Medidas para garantizar la seguridad',
      body: [
        '• Administrativas: reducir al mínimo el número de personas que tratan datos personales y formarlas periódicamente',
        '• Técnicas: control de accesos al sistema de tratamiento, cifrado en tránsito (HTTPS), almacenamiento del secreto del bloqueo como hash y uso del almacenamiento seguro del dispositivo (Keystore/Keychain)',
        '• Físicas: los servidores que albergan datos personales están en centros de datos de proveedores de nube nacionales e internacionales y siguen sus políticas de control de acceso físico.',
        '⚠ La función de bloqueo impide el acceso a la pantalla; no cifra los archivos de diario guardados en el dispositivo. Si el dispositivo se pierde o es sustraído y su propia seguridad queda vulnerada, el contenido de las entradas podría quedar expuesto.',
      ],
    },
    {
      h: '11. Responsable de privacidad y departamento que recibe y atiende las solicitudes de acceso',
      body: [
        'El operador asume la responsabilidad general del tratamiento de datos personales y designa al siguiente responsable de privacidad para atender reclamaciones y remedios relacionados con dicho tratamiento.',
        '• Responsable de privacidad: Son Hwi-seong (cargo: representante)',
        '• Contacto: support@vivace-games.com',
        '• Departamento que recibe y atiende las solicitudes de acceso: el mismo',
        'Puedes dirigir al responsable de privacidad cualquier consulta, reclamación o solicitud de remedio en materia de privacidad que surja al usar el servicio. El operador responderá y actuará sin demora.',
      ],
    },
    {
      h: '12. Cómo obtener reparación por la vulneración de tus derechos',
      body: [
        'Para obtener reparación por una vulneración de tus datos personales, puedes acudir a los siguientes organismos coreanos para mediación o consulta.',
        '• Comité de Mediación de Conflictos sobre Información Personal: 1833-6972 (desde Corea) / www.kopico.go.kr',
        '• Centro de Denuncias de Vulneración de la Privacidad: 118 (desde Corea) / privacy.kisa.or.kr',
        '• Fiscalía Suprema, División de Investigación Cibernética: 1301 (desde Corea) / www.spo.go.kr',
        '• Agencia Nacional de Policía, Oficina de Investigación Cibernética: 182 (desde Corea) / ecrm.police.go.kr',
        'Además, quien vea vulnerados sus derechos o intereses por una resolución u omisión del titular de un organismo público respecto de una solicitud formulada al amparo de los arts. 35 (acceso), 36 (rectificación y supresión) o 37 (suspensión del tratamiento) de la Ley de Protección de Información Personal podrá interponer un recurso administrativo conforme a la Ley de Recursos Administrativos.',
      ],
    },
    {
      h: '13. Cambios en esta política de privacidad',
      body: [
        'Esta política de privacidad se aplica desde su fecha de entrada en vigor.',
        'Cuando se añada, elimine o modifique contenido por cambios legales, de política o de tecnología de seguridad, lo comunicaremos mediante avisos dentro de la aplicación desde 7 días antes de que el cambio surta efecto (30 días antes si el cambio es desfavorable para las personas usuarias).',
        'Las modificaciones previstas se publican con antelación bajo «Modificaciones previstas», al final de este documento, en un formato que permite comparar el antes y el después.',
        'Historial de modificaciones',
        '• 2026-08-09 primera versión',
        '• 2026-08-11 publicación de modificación prevista — se prevé introducir la suscripción mensual y la copia de seguridad/restauración (el texto principal aún no ha cambiado)',
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'Desde el día en que se publique la versión que incluye la suscripción mensual y la copia de seguridad/restauración',
      summary:
        'Se añaden la suscripción mensual y la copia de seguridad/restauración. Si te suscribes, se tratarán el estado de la suscripción y el identificador de la transacción; y solo si activas la copia de seguridad, se guardará en el servidor del operador una copia de tus entradas cifrada en tu dispositivo. El operador no puede descifrar esa copia.',
      sections: [
        {
          h: 'a. Qué cambia (antes → después)',
          body: [
            'Antes: los títulos, el texto y las fotos de las entradas no se transmiten fuera de tu dispositivo.',
            'Después: **solo si activas tú la copia de seguridad**, se guardará en el servidor del operador una copia de tus entradas cifrada en tu dispositivo. Si no la activas, no se transmite ni un solo carácter, igual que antes.',
            '⚠ Con precisión: el operador **guarda esa copia pero no puede leerla.** La clave de descifrado existe únicamente en tu dispositivo y en el código de recuperación que tú conservas; el operador no la tiene.',
          ],
        },
        {
          h: 'b. Información adicional que se guarda si activas la copia de seguridad',
          body: [
            '• Una copia cifrada de tus entradas, en una forma que el operador no puede descifrar',
            '• Identificador de la copia, hora de la copia, número de generación y tamaño — **esta información no está cifrada.** El operador puede saber qué cuenta hizo copia, cuándo y de qué tamaño.',
            '• Base legal: tu consentimiento específico (recabado en la pantalla donde activas la copia de seguridad)',
          ],
        },
        {
          h: 'c. Plazo de conservación',
          body: [
            '• Se conserva mientras la copia esté activada y hasta 90 días después de que finalice la suscripción; después se destruye automáticamente.',
            '• Si desactivas la copia, solicitas su supresión o eliminas tu cuenta, la destruimos sin demora, sin esperar los 90 días.',
            '• Las copias sin acceso durante 3 años o más se destruyen. (Es el caso de quien desinstala la aplicación sin eliminar su cuenta.)',
            '• El registro de la destrucción (identificador de la copia y hora) se conserva 1 año, para que puedas averiguar «por qué no funciona la restauración»; el identificador de la cuenta no se conserva junto a él.',
            '⚠ El aviso de que la suscripción ha vencido solo te llega por pantalla al abrir la aplicación. Si no la abres, es posible que ese aviso no te llegue.',
          ],
        },
        {
          h: 'd. Límites del derecho de acceso',
          body: [
            'Si solicitas acceder a tu copia de seguridad, lo único que el operador puede entregarte es **el texto cifrado, que no se puede descifrar, y los metadatos del apartado (b).** No podemos facilitarte tus entradas en un formato legible: el operador no tiene la clave.',
            'Tú mismo puedes restaurar en cualquier momento desde la aplicación con tu código de recuperación.',
            '⚠ Si pierdes el código de recuperación, no hay forma de abrir la copia. El operador tampoco puede abrirla por ti.',
          ],
        },
        {
          h: 'e. Información que se guarda si usas una suscripción',
          body: [
            '• Estado de la suscripción: clave de derecho, fecha de vencimiento, periodo de gracia por impago y si se renovará',
            '• El identificador de transacción emitido por la tienda, el identificador del producto y si la compra se hizo en entorno de producción o de prueba',
            '• Los registros de cambios de estado enviados por el servicio de pago (compra, renovación, cancelación, reembolso, etc.) y su contenido original',
            '⚠ Los datos de pago, como números de tarjeta o de cuenta, los gestiona Google Play y no se transmiten al operador. El operador solo puede saber que has pagado y hasta cuándo es válida la suscripción.',
            '• Base legal: Ley de Protección de Información Personal, art. 15(1)4 (necesario para ejecutar las medidas solicitadas por la persona usuaria, es decir, proporcionar el derecho de suscripción solicitado)',
            '• Finalidad: comprobar el derecho de suscripción (eliminación de anuncios, uso de la copia de seguridad) y atender consultas de pago y reembolsos',
          ],
        },
        {
          h: 'f. Plazo de conservación de la información de suscripción',
          body: [
            '• Registros sobre contratos o desistimiento y sobre el pago y suministro de bienes: 5 años (Ley de Protección del Consumidor en el Comercio Electrónico, art. 6)',
            '• Si eliminas tu cuenta, los identificadores de cuenta (correo, «sub» de Google) se dejan sin demora en una forma no rastreable, y los registros de transacción anteriores se conservan separados y en forma no rastreable durante el plazo indicado y después se destruyen.',
            '⚠ Eliminar tu cuenta no cancela automáticamente tu suscripción de Google Play. Debes cancelarla tú en Google Play > Suscripciones; si no lo haces, se te seguirá cobrando.',
          ],
        },
        {
          h: 'g. Encargo del tratamiento y transferencia internacional (adicional)',
          body: [
            '• Supabase Inc. — País: Estados Unidos (domicilio social). Contacto: privacy@supabase.com. Finalidad: almacenar la copia de seguridad cifrada y el estado de la suscripción. Datos: los de los apartados (b) y (e). Conservación: los plazos de los apartados (c) y (f). ※ La ubicación física de almacenamiento es la República de Corea (región de Seúl).',
            '• Vercel Inc. — País: Estados Unidos. Contacto: privacy@vercel.com. Finalidad: operar el servidor de copias de seguridad. ※ La copia cifrada se envía directamente al almacenamiento sin pasar por este servidor.',
            '• RevenueCat, Inc. — País: Estados Unidos. Contacto: compliance@revenuecat.com. Finalidad: verificar los pagos de la suscripción y comprobar su estado. Datos: identificador de cuenta, identificadores de transacción y producto de la tienda, información del dispositivo y de la aplicación. Cuándo y cómo: se transmiten por la red al abrir la pantalla de suscripción y al pagar. Conservación: hasta la finalización del contrato de encargo',
            '• Google LLC — además de la transferencia descrita en el apartado 6, se tratan datos de transacción de la tienda con el fin de procesar y verificar los pagos de la suscripción.',
            'Puedes oponerte a la transferencia internacional. Si no activas la copia de seguridad y no te suscribes, dichas transferencias no se producen, y todas las demás funciones, incluida la escritura de entradas, siguen disponibles.',
          ],
        },
      ],
    },
    {
      appliesFrom:
        'Desde el día en que se publique la versión que incluye los informes de resumen con IA',
      summary:
        'Se añaden los informes de resumen con IA. Solo cuando creas un informe tú mismo, el contenido de tus entradas de ese periodo pasa sin cifrar por el servidor del operador y se envía al proveedor de IA. El operador no almacena ese contenido; el proveedor de IA lo conserva hasta 30 días para vigilar abusos, después lo borra, y no lo usa para entrenar modelos.',
      sections: [
        {
          h: 'a. Qué cambia (antes → después)',
          body: [
            'Antes: los títulos y el texto de las entradas no se transmiten fuera de tu dispositivo. Incluso con la copia de seguridad activada, se transmiten solo como texto cifrado que el operador no puede leer.',
            'Después: **solo cuando pulsas tú «Crear informe»**, el contenido de las entradas de ese periodo se envía **sin cifrar** a través del servidor del operador al proveedor de IA, y se genera un resumen.',
            '⚠ Con precisión: el operador **no almacena** ese contenido. Pero en el momento en que se elabora el resumen, el contenido pasa por el servidor del operador, así que no podemos decirte que «el operador no puede verlo». Lo indicamos con claridad en lugar de difuminarlo.',
            'Si no creas informes, esta transmisión no se produce en absoluto, y todas las demás funciones, incluida la escritura de entradas, siguen disponibles.',
          ],
        },
        {
          h: 'b. Consentimiento específico para información sensible',
          body: [
            'Las entradas pueden contener información sensible en el sentido del art. 23 de la Ley de Protección de Información Personal, como el estado de salud o el estado anímico.',
            'Dado que los informes de resumen con IA tratan ese contenido sin cifrar, recabamos un **consentimiento específico para el tratamiento de información sensible** la primera vez que usas la función. Este consentimiento es **independiente** del consentimiento para la transferencia internacional del apartado (c), y cada uno puede elegirse por separado.',
            'Si no lo otorgas, puedes seguir usando todas las funciones salvo los informes con IA.',
          ],
        },
        {
          h: 'c. Consentimiento específico para la transferencia internacional',
          body: [
            'El proveedor de IA está fuera de Corea. Su nombre, el país receptor y sus datos de contacto se indican en este apartado en el momento de publicar la función, y también se muestran en la aplicación antes de recabar el consentimiento.',
            '• Datos transferidos: el título, el texto, la emoción y la fecha de las entradas del periodo para el que has pedido el informe',
            '• Finalidad: generar el informe de resumen',
            '• Cuándo y cómo: se transmiten por la red cuando pulsas «Crear informe»',
            '• Conservación: el servidor del operador **no lo almacena**; solo lo mantiene en memoria mientras se elabora el resumen y después lo descarta. El proveedor de IA lo conserva **hasta 30 días** para vigilar abusos y después lo borra, y ni siquiera durante ese periodo **lo usa para entrenar modelos.**',
            'Puedes oponerte a la transferencia internacional; si lo haces, solo dejarán de estar disponibles los informes con IA y todas las demás funciones seguirán funcionando.',
          ],
        },
        {
          h: 'd. Lo que sí almacena el operador (que no es el contenido de tus entradas)',
          body: [
            'No almacenamos el contenido de las entradas, pero sí lo siguiente.',
            '• El identificador de la cuenta que creó el informe, el periodo, el número de veces y el número de tokens utilizados: se usan para la facturación y para prevenir abusos.',
            '• Conservación: hasta que se cumpla la finalidad o hasta que elimines tu cuenta',
            'El texto del informe terminado se guarda **únicamente en tu dispositivo** y, si tienes activada la copia de seguridad, se incluye en ella de forma cifrada.',
          ],
        },
        {
          h: 'e. Tus derechos',
          body: [
            '• Los informes se generan únicamente cuando los creas tú; nunca se generan automáticamente.',
            '• Puedes eliminar en cualquier momento, desde la aplicación, un informe que hayas creado.',
            '• Los resúmenes generados por IA pueden no ajustarse a la realidad y no constituyen un diagnóstico ni un consejo médico o psicológico. La aplicación ofrece una forma de denunciar un resumen.',
          ],
        },
      ],
    },
  ],
};
