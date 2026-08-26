import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Política de privacidad — español.
 *
 * 🔴 **El texto coreano es el original y prevalece.** Esta es una traducción para facilitar
 *   la lectura; en caso de discrepancia, rige `legal-text.ts` (coreano).
 * ⚠ **La estructura debe coincidir exactamente con el coreano** — mismo número de secciones
 *   y de líneas en cada una. `npm run check:legal` lo verifica.
 *
 * 🔴 **La copia de seguridad y la IA dicen lo contrario la una de la otra.** No las fundas en
 *   una sola frase al traducir:
 *     copia de seguridad = se guarda pero no se puede leer → «guarda ... pero no puede leerla»
 *     IA                 = se lee pero no se guarda        → «no almacena ... » y nunca «no puede verlo»
 *   El original reconoce expresamente que no podemos decir que el operador «no puede verlo».
 *   Suavizar esa frase convertiría el aviso legal en algo falso.
 */
export const PRIVACY_ES: LegalDoc = {
  title: 'Política de privacidad de Jogak',
  sourceFingerprint: '47ec2dc4',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Vivace Games Studio (en adelante, «el operador») cumple la Ley de Protección de Información Personal y demás normativa aplicable, y trata los datos personales de las personas usuarias de «Jogak» (en adelante, «el servicio») como se indica a continuación. Por principio, Jogak guarda en tu dispositivo las entradas de diario que escribes, y estas solo se transmiten a un servidor en dos casos: la copia de seguridad que actives tú y los informes de resumen con IA que crees tú. Por lo demás, recogemos únicamente la información mínima necesaria.',
  sections: [
    {
      h: '1. Primero te decimos dónde se guardan tus entradas',
      body: [
        'Las entradas (título, texto, listas, fotos, etiquetas y emociones) se guardan en el almacenamiento interno de tu dispositivo y, por defecto, no salen de él.',
        '⚠ Solo hay dos excepciones, y únicamente si las eliges tú. Ninguna de las dos ocurre de forma automática.',
        '• Si activas la copia de seguridad: una copia de tus entradas, cifrada en tu dispositivo, se guarda en el servidor del operador. El operador no puede leer esa copia. Los detalles figuran en el apartado 2(c).',
        '• Si creas un informe de resumen con IA: el contenido del diario de ese periodo pasa sin cifrar por el servidor del operador y se entrega al proveedor de IA. El operador no almacena ese contenido. Los detalles figuran en el apartado 2(e).',
        '⚠ Las dos frases anteriores dicen cosas distintas: el operador guarda la copia de seguridad pero no puede leerla, mientras que el contenido que se envía a la IA sí lo lee, pero no lo almacena. Te lo decimos tal cual, sin difuminarlo.',
        'El operador no recoge en ningún caso la siguiente información ni la transmite fuera de tu dispositivo.',
        '• El PIN, el patrón o la respuesta de pista del bloqueo de la aplicación: se guardan en el almacenamiento seguro del dispositivo solo en forma no recuperable (un hash); el original no se almacena en ningún sitio.',
        '• Tu nombre, fecha de nacimiento, número de teléfono, dirección, lista de contactos, ubicación ni ningún registro de acceso a toda tu galería de fotos.',
        'Las fotos que eliges en la aplicación se copian a la carpeta propia de la aplicación en tu dispositivo para poder incluirlas en una entrada y, si no activas la copia de seguridad, no se transmiten fuera. A los informes de resumen con IA no se envía ninguna foto.',
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
        '※ Iniciar sesión es necesario para «Contacto», la suscripción, la copia de seguridad y los informes con IA; escribir entradas, el bloqueo de la aplicación y las demás funciones no lo requieren.',
        '※ Los menores de 14 años no pueden usar la función de inicio de sesión.',
        'b. Información recogida automáticamente al mostrar anuncios',
        '• Identificador publicitario (ID de publicidad de Android), información del dispositivo y de la red, registros de impresiones y clics',
        '• Lo anterior lo recoge Google (AdMob); los detalles y cómo oponerse figuran en el apartado 7.',
        'c. Si activas la copia de seguridad (requiere suscripción)',
        '• Una copia cifrada de tus entradas, en una forma que el operador no puede descifrar',
        '• Identificador de la copia, hora de la copia, número de generación y tamaño: esta información no se cifra. El operador puede saber qué cuenta hizo copia, cuándo y de qué tamaño.',
        '  — Base legal: tu consentimiento específico (recabado en la pantalla donde activas la copia de seguridad)',
        '⚠ Con precisión: el operador guarda esa copia pero no puede leerla. La clave de descifrado solo existe en tu dispositivo y en el código de recuperación que tú conservas; el operador no la tiene.',
        '⚠ Si pierdes el código de recuperación, no hay forma de abrir la copia. El operador tampoco puede abrirla por ti.',
        'd. Si usas una suscripción',
        '• Estado de la suscripción: clave de derecho, fecha de vencimiento, periodo de gracia por impago y si se renovará',
        '• El identificador de transacción emitido por la tienda, el identificador del producto y si la compra se hizo en entorno de producción o de prueba',
        '• Los registros de cambio de estado de la suscripción enviados por el servicio de pago (compra, renovación, cancelación, reembolso, etc.) y su contenido original',
        '  — Base legal: Ley de Protección de Información Personal, art. 15(1)4 (necesario para ejecutar las medidas solicitadas por la persona usuaria, es decir, proporcionar el derecho de suscripción solicitado)',
        '  — Finalidad: comprobar el derecho de suscripción (eliminación de anuncios, copia de seguridad e informes con IA) y atender consultas de pago y reembolsos',
        '⚠ Los datos de pago, como números de tarjeta o de cuenta, los gestiona Google Play y no se transmiten al operador. El operador solo puede saber que has pagado y hasta cuándo es válida la suscripción.',
        'e. Si creas informes de resumen con IA (requiere suscripción)',
        '• Lo que se entrega al proveedor de IA a través del servidor del operador: el título, el texto, la emoción y la fecha de las entradas del periodo para el que solicitaste un informe',
        '• Lo que almacena el operador: el resumen generado por la IA, el identificador de la cuenta que creó el informe, el periodo, el número de veces y el número de tokens utilizados',
        '⚠ Con precisión: el operador no almacena el contenido del diario en sí. No obstante, ① en el momento en que se elabora el resumen ese contenido pasa por el servidor del operador, por lo que no podemos decirte que «el operador no puede verlo», y ② el resumen generado se conserva 90 días. Te lo decimos tal cual, sin difuminarlo.',
        '⚠ El resumen se redacta a partir de tus entradas, por lo que puede contener el contenido de tu diario.',
        '• Consentimiento específico para información sensible: un diario puede contener información sensible, como el estado de salud o psicológico, en el sentido del art. 23 de la Ley de Protección de Información Personal. Como los informes de resumen con IA tratan ese contenido sin cifrar, recabamos un consentimiento específico para el tratamiento de información sensible la primera vez que usas la función. Este consentimiento es independiente del consentimiento de transferencia internacional del apartado 6, y puedes elegir cada uno por separado.',
        'Aunque no lo otorgues, puedes seguir usando con normalidad todas las funciones salvo los informes con IA. Los informes solo se generan cuando los creas tú; nunca se generan automáticamente.',
      ],
    },
    {
      h: '3. Finalidades del tratamiento',
      body: [
        '• Recibir y atender consultas: revisar lo que has enviado e identificar y corregir fallos',
        '• Identificar a quien escribe y responder: hacerte llegar la respuesta y permitirte revisar tu propio historial de consultas',
        '• Mostrar anuncios: ofrecer publicidad a quienes usan la versión gratuita y medir su rendimiento',
        '• Copia de seguridad y restauración: si la activas, conservar una copia cifrada de tus entradas y devolvértela cuando lo pidas',
        '• Comprobar el derecho de suscripción: ofrecer a quienes han pagado la eliminación de anuncios, la copia de seguridad y los informes con IA, y atender consultas de pago y reembolsos',
        '• Generar informes de resumen con IA y mejorar su calidad: elaborar el resumen del periodo que has pedido y revisar el resultado para mejorar la calidad',
        'El operador no usa los datos personales para fines distintos de los anteriores y, si la finalidad cambia, recabará el consentimiento previamente.',
      ],
    },
    {
      h: '4. Plazos de conservación y uso',
      body: [
        '• Datos de la cuenta (correo electrónico, «sub» de Google): hasta que elimines tu cuenta. Al eliminarla los destruimos sin demora o los dejamos en una forma no rastreable.',
        '• Contenido de las consultas: 3 años desde su recepción (Ley de Protección del Consumidor en el Comercio Electrónico — registros sobre reclamaciones o resolución de conflictos)',
        '• Datos de comportamiento basados en el identificador publicitario: hasta 1 año desde su recogida',
        '• Copia de seguridad cifrada: se conserva mientras la copia esté activada y hasta 90 días después de que finalice la suscripción, y luego se destruye automáticamente. Si desactivas la copia, solicitas su supresión o eliminas tu cuenta, la destruimos sin demora, sin esperar los 90 días. Las copias sin acceso durante 3 años o más se destruyen (es el caso de quien desinstala la aplicación sin eliminar su cuenta).',
        '• Registro de la destrucción de una copia (identificador de la copia y hora de la destrucción): 1 año, para que puedas averiguar «por qué no funciona la restauración»; el identificador de la cuenta no se conserva junto a él.',
        '• Resumen generado por la IA: 90 días desde el día de su creación. Después se elimina automáticamente.',
        '• Registros de uso de los informes (identificador de la cuenta, periodo, número de veces, número de tokens): hasta que se cumpla la finalidad o hasta que elimines tu cuenta',
        '• Registros sobre contratos o desistimiento y sobre el pago y suministro de bienes: 5 años (Ley de Protección del Consumidor en el Comercio Electrónico, art. 6)',
        'Si eliminas tu cuenta, los identificadores de cuenta (correo, «sub» de Google) se dejan sin demora en una forma no rastreable, y los registros de transacción anteriores se conservan separados y en forma no rastreable durante el plazo indicado y después se destruyen.',
        '⚠ Eliminar tu cuenta no cancela automáticamente tu suscripción de Google Play. Debes cancelarla tú en Google Play > Suscripciones; si no lo haces, se te seguirá cobrando.',
        '⚠ El aviso de que la copia de seguridad se eliminará al vencer la suscripción solo te llega por pantalla al abrir la aplicación. Si no la abres, es posible que ese aviso no te llegue.',
        'Una vez transcurrido el plazo o cumplida la finalidad, destruimos los datos sin demora.',
      ],
    },
    {
      h: '5. Cesión a terceros',
      body: [
        'El operador no cede a terceros los datos personales de las personas usuarias.',
        'Las empresas del apartado 6 son encargadas que tratan la información por cuenta del operador y no la usan para fines propios. El proveedor de IA no usa para entrenar modelos el contenido del diario que recibe.',
        'Se exceptúan los casos en que exista una disposición legal específica o en que una autoridad investigadora lo requiera siguiendo los procedimientos y formas previstos por la ley.',
      ],
    },
    {
      h: '6. Encargo del tratamiento y transferencia internacional',
      body: [
        'Para prestar el servicio, el operador encarga el tratamiento como se indica a continuación, y parte de él se realiza fuera de Corea.',
        '• Google LLC — País: Estados Unidos. Contacto: https://support.google.com/policies/contact/general_privacy_form. Finalidad: mostrar y medir anuncios (AdMob), inicio de sesión con cuenta de Google, y procesamiento y verificación de los pagos de la suscripción. Datos: identificador publicitario, información del dispositivo y de la red, al iniciar sesión la dirección de correo y el identificador de la cuenta, e información de transacción de la tienda. Cuándo y cómo: se transmiten por la red al solicitar un anuncio, al iniciar sesión y al pagar. Conservación: conforme a la política de privacidad de Google',
        '• Supabase Inc. — País: Estados Unidos (domicilio social). Contacto: privacy@supabase.com. Finalidad: almacenar en base de datos la información de consultas y cuentas, y guardar la copia de seguridad cifrada y el estado de la suscripción. Datos: los de los apartados 2(a), 2(c) y 2(d). Cuándo y cómo: se transmiten por la red al enviar una consulta y al hacer una copia de seguridad. Conservación: los plazos del apartado 4. ※ La ubicación física de almacenamiento es la República de Corea (región de Seúl), pero lo comunicamos como transferencia internacional porque la sociedad operadora está fuera de Corea.',
        '• Vercel Inc. — País: Estados Unidos. Contacto: privacy@vercel.com. Finalidad: operar el servidor que recibe las consultas y los servidores de copia de seguridad y de IA. Datos: los del apartado 2(a). Cuándo y cómo: se transmiten por la red al enviar una consulta. Conservación: hasta la finalización del contrato de encargo. ※ La copia de seguridad cifrada se envía directamente al almacenamiento sin pasar por este servidor.',
        '• RevenueCat, Inc. — País: Estados Unidos. Contacto: compliance@revenuecat.com. Finalidad: verificar los pagos de la suscripción y comprobar su estado. Datos: identificador de cuenta, identificadores de transacción y de producto de la tienda, información del dispositivo y de la aplicación. Cuándo y cómo: se transmiten por la red al abrir la pantalla de suscripción y al pagar. Conservación: hasta la finalización del contrato de encargo',
        '• OpenAI OpCo, LLC — País: Estados Unidos (1455 Third Street, San Francisco, California 94158, USA). Contacto: dpo@openai.com. Finalidad: generar informes de resumen. Datos: el título, el texto, la emoción y la fecha de las entradas del periodo para el que solicitaste un informe. Cuándo y cómo: se transmiten por la red en el momento en que pulsas Crear informe. Conservación: el servidor del operador no almacena el contenido del diario; solo lo mantiene en memoria mientras se elabora el resumen y lo descarta de inmediato. El proveedor de IA lo conserva un máximo de 30 días para vigilar el uso indebido y después lo elimina, y ni siquiera durante ese periodo lo usa para entrenar modelos.',
        '⚠ La transferencia internacional para los informes con IA es objeto de un consentimiento específico. La primera vez que usas la función te mostramos en la aplicación la información anterior y recabamos tu consentimiento; este consentimiento es independiente del consentimiento para información sensible del apartado 2(e).',
        'Puedes oponerte a la transferencia internacional de tus datos personales. Para oponerte a las transferencias relacionadas con la publicidad, desactiva los anuncios personalizados según el apartado 7; las relacionadas con las consultas no se producen si no usas «Contacto». Si no activas la copia de seguridad, no te suscribes y no creas informes, tampoco se producen las transferencias correspondientes, y todas las demás funciones, incluida la escritura de entradas, siguen disponibles.',
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
        'Si te suscribes no se muestran anuncios, y la recogida publicitaria anterior tampoco se produce.',
        'Más información sobre cómo trata Google los datos personales con fines publicitarios: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Procedimiento y método de destrucción',
      body: [
        'Procedimiento: los datos personales cuyo plazo haya vencido o cuya finalidad se haya cumplido se destruyen sin demora. Cuando la ley exija conservarlos, se guardan separados del resto durante ese plazo y después se destruyen.',
        'Método: la información en formato de archivo electrónico se elimina de forma permanente mediante procedimientos técnicos que impiden su recuperación o reconstrucción.',
        'Las entradas, fotos e información de bloqueo guardadas en tu dispositivo se eliminan de él cuando usas la función «Restablecer todo» de la aplicación o la desinstalas.',
        'Si has activado la copia de seguridad, la copia cifrada guardada en el servidor se destruye cuando la borras desde la pantalla de copia de seguridad de la aplicación o cuando eliminas tu cuenta. Al eliminar la cuenta destruimos primero la copia y después la cuenta: si la cuenta desapareciera antes, ya no quedaría nadie con permiso para borrar esa copia.',
        'Si no has activado la copia de seguridad, el operador no dispone de las entradas de tu dispositivo, por lo que no puede eliminarlas por ti.',
      ],
    },
    {
      h: '9. Derechos de la persona interesada y de su representante legal, y cómo ejercerlos',
      body: [
        'Puedes ejercer en cualquier momento los siguientes derechos.',
        '• Solicitar el acceso a tus datos • Solicitar la rectificación si hay algún error • Solicitar la supresión • Solicitar la suspensión del tratamiento • Solicitar la portabilidad de tus datos (Ley de Protección de Información Personal, art. 35-2)',
        'Puedes ejercerlos por escrito o por correo electrónico usando el contacto del apartado 11, y el operador actuará sin demora.',
        'Si solicitas la rectificación de un error en tus datos, no los usaremos ni los cederemos hasta que la rectificación esté completa.',
        '⚠ Límites del derecho de acceso respecto de la copia de seguridad: si solicitas acceder a ella, lo único que el operador puede entregarte es el texto cifrado, que no se puede descifrar, y los metadatos del apartado 2(c). No podemos facilitarte el contenido de tus entradas en un formato legible por una persona, porque el operador no tiene la clave. Tú misma o tú mismo puedes restaurarlas en cualquier momento desde la aplicación con tu código de recuperación.',
        'Puedes eliminar en cualquier momento desde la aplicación un informe con IA ya creado. Al eliminarlo en la aplicación desaparece de tu dispositivo, y el resumen conservado en el servidor se elimina automáticamente pasados 90 días. Si deseas que se elimine antes, puedes solicitarlo mediante «Contacto».',
        '⚠ Los resúmenes generados por IA pueden no coincidir con los hechos y no constituyen un diagnóstico ni un consejo médico o psicológico. La aplicación ofrece una forma de denunciar un informe.',
        'El representante legal de un menor de 14 años puede ejercer los derechos anteriores en su nombre.',
      ],
    },
    {
      h: '10. Medidas para garantizar la seguridad',
      body: [
        '• Administrativas: reducir al mínimo el número de personas que tratan datos personales y formarlas periódicamente',
        '• Técnicas: control de accesos al sistema de tratamiento, cifrado en tránsito (HTTPS), almacenamiento del secreto del bloqueo como hash y uso del almacenamiento seguro del dispositivo (Keystore/Keychain)',
        '• Cifrado de extremo a extremo de la copia de seguridad: la copia se cifra en tu dispositivo antes de transmitirse, y la clave de descifrado solo existe en tu dispositivo y en tu código de recuperación. El servidor del operador no tiene la clave.',
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
        '• 2026-08-12 publicación de modificación prevista — se prevé introducir los informes de resumen con IA (el texto principal aún no ha cambiado)',
        '• 2026-08-23 modificación — las dos modificaciones previstas anteriores se han incorporado al texto principal. El tratamiento relativo a la suscripción mensual, la copia de seguridad/restauración y los informes de resumen con IA se ha añadido a los apartados 1, 2, 3, 4, 6, 8, 9 y 10.',
      ],
    },
  ],
};

/**
 * Cómo eliminar tu cuenta — español.
 *
 * 🔴 **El texto coreano es el original y prevalece** (`legal-text.ts`). Misma regla que en la
 *   política de privacidad: esta es una traducción para facilitar la lectura.
 *
 * ⚠ Este documento tiene una URL pública propia porque el formulario de seguridad de los datos
 *   de Play exige una vía **web** de eliminación: quien ya haya desinstalado la aplicación debe
 *   poder solicitarla igualmente. Esa URL es la que abren los revisores de Play, y por eso no
 *   puede quedarse solo en coreano.
 *
 * ⚠ La estructura debe coincidir exactamente con la coreana — 6 secciones (6/4/9/5/4/3 líneas)
 *   y sin modificaciones previstas. `npm run check:legal` lo verifica.
 */
export const DELETE_ACCOUNT_ES: LegalDoc = {
  title: 'Cómo eliminar tu cuenta de Jogak',
  sourceFingerprint: 'a8b0c8b9',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Esta página explica cómo eliminar tu cuenta de Jogak y los datos asociados a ella. También puedes solicitarlo por correo electrónico si ya has desinstalado la aplicación o no puedes iniciar sesión.',
  sections: [
    {
      h: '1. Eliminarla tú mismo en la aplicación',
      body: [
        'Si sigues estos pasos en la aplicación Jogak, la eliminación se aplica de inmediato.',
        '① Abre la aplicación → pestaña [Ajustes], abajo',
        '② Elige [Contacto]',
        '③ Si no has iniciado sesión, inicia sesión con tu cuenta de Google',
        '④ Elige [Eliminar cuenta] al final de la pantalla y confirma',
        'Eliminar la cuenta no se puede deshacer.',
      ],
    },
    {
      h: '2. Solicitarlo por correo electrónico (si has desinstalado la aplicación o no puedes iniciar sesión)',
      body: [
        'Envía lo siguiente a support@vivace-games.com.',
        '• Asunto: solicitud de eliminación de cuenta de Jogak',
        '• Cuerpo: la dirección de correo de la cuenta de Google con la que iniciaste sesión en Jogak',
        'La dirección desde la que escribes debe coincidir con la que usaste al registrarte, para que podamos confirmar que eres tú. Lo tramitaremos y te responderemos en un plazo de 7 días hábiles.',
      ],
    },
    {
      h: '3. Datos que se eliminan',
      body: [
        'Al eliminar tu cuenta, la siguiente información se destruye de inmediato o queda en una forma no rastreable.',
        '• El identificador único de tu cuenta social (el «sub» de Google)',
        '• Tu dirección de correo electrónico',
        '• El vínculo entre tus consultas y la cuenta de quien las escribió',
        '• La copia cifrada de tu diario guardada en el servidor (si activaste la copia de seguridad): se elimina con la cuenta, sin esperar los 90 días de gracia.',
        '• El identificador de la copia y los registros de copia (hora, tamaño, número de generación)',
        '• Los resúmenes de informes con IA conservados en el servidor (hasta 90 días) y los registros de uso de los informes (periodo, número de veces, número de tokens)',
        '⚠ Al eliminar la cuenta destruimos primero la copia de seguridad y después la cuenta: si la cuenta desapareciera antes, ya no quedaría nadie con permiso para borrar esa copia. Si la eliminación de la copia falla, la eliminación de la cuenta no llega a realizarse; basta con que lo intentes de nuevo un poco más tarde.',
        '⚠ La eliminación no se puede deshacer. Aunque conserves tu código de recuperación, no podrás restaurar la copia guardada en el servidor.',
      ],
    },
    {
      h: '4. Datos que se conservan y durante cuánto tiempo',
      body: [
        'La siguiente información se conserva conforme a la ley y, incluso durante ese plazo, solo permanece en una forma que no permite rastrear a su autor (seudonimizada).',
        '• Contenido de las consultas: 3 años (Ley de Protección del Consumidor en el Comercio Electrónico — registros sobre reclamaciones o resolución de conflictos)',
        '• Registros de transacción de la suscripción (identificador de la transacción, producto, periodo de suscripción, historial de cambios del estado de pago): 5 años (Ley de Protección del Consumidor en el Comercio Electrónico, art. 6)',
        '• Registro de la destrucción de una copia de seguridad (identificador de la copia y hora de la destrucción): 1 año, para que puedas averiguar «por qué no funciona la restauración»; el identificador de tu cuenta no se conserva junto a él.',
        'Una vez transcurrido el plazo de conservación, destruimos los datos sin demora.',
      ],
    },
    {
      h: '5. Lo que queda en tu dispositivo: eliminar la cuenta no lo borra',
      body: [
        'Las entradas de Jogak (títulos, texto, fotos, etiquetas y emociones) y el texto de los informes con IA se guardan dentro de tu dispositivo.',
        'Por eso, eliminar tu cuenta deja intactos las entradas y los informes de tu dispositivo. Si también quieres borrarlos del dispositivo, desinstala la aplicación o usa el restablecimiento en los [Ajustes] de la aplicación.',
        'A la inversa, si desinstalas la aplicación, las entradas de tu dispositivo no se podrán recuperar. Solo podrás recuperarlas si habías activado la copia de seguridad y conservas tu código de recuperación, y únicamente antes de eliminar tu cuenta.',
        '⚠ Si no activaste la copia de seguridad, el operador no dispone de las entradas de tu dispositivo, por lo que no puede ni eliminarlas ni devolvértelas.',
      ],
    },
    {
      h: '6. La suscripción debes cancelarla por separado',
      body: [
        'Eliminar tu cuenta no cancela automáticamente tu suscripción de Google Play y, si no la cancelas, se te seguirá cobrando.',
        'Para cancelar: aplicación Google Play Store > perfil > Pagos y suscripciones > Suscripciones (https://play.google.com/store/account/subscriptions)',
        'El reembolso de los importes ya cobrados se rige por la política de reembolsos de Google Play y por la del operador. Puedes consultarnos en la dirección de contacto indicada más arriba.',
      ],
    },
  ],
};

/**
 * Condiciones de uso — español.
 *
 * 🔴 **El texto coreano es el original y prevalece** (`legal-text.ts`). Esta es una traducción
 *   para facilitar la lectura; en caso de discrepancia, rige el coreano. El propio artículo 22
 *   lo dice dentro del documento, y eso es lo que hace segura su publicación.
 *
 * ⚠ **La estructura debe coincidir exactamente con la coreana** — 22 artículos, el mismo número
 *   de líneas en cada uno y sin «modificaciones previstas». `npm run check:legal` lo verifica.
 *   Partir una frase coreana en dos falla la comprobación, y fundir dos oculta una cláusula perdida.
 *
 * ⚠ Este documento existe por el **art. 13(2) de la Ley de Protección del Consumidor en el
 *   Comercio Electrónico**: información previa al contrato y entrega por escrito de sus
 *   condiciones después. Los puntos 5 (desistimiento), 6 (reembolsos), 8 (reclamaciones y
 *   conflictos) y 9 (las propias condiciones y cómo consultarlas) no caben en ningún otro sitio.
 *   Cada artículo es el recipiente de un punto concreto, así que **ningún artículo puede perder
 *   su contenido jurídico para leerse mejor.** Los tres más delicados:
 *
 *   - El art. 12 reproduce en sustancia los arts. 17(2)5 y 17(6). «se ha iniciado el suministro
 *     del contenido digital», «la parte aún no suministrada de un contenido digital que se
 *     suministra por partes» e «indicar este hecho **y, al mismo tiempo**, ofrecer ... como
 *     producto de prueba» son requisitos legales: si se difuminan, la limitación es nula.
 *   - La primera línea del art. 20 protege frente al art. 35 (contratos desfavorables para el
 *     consumidor). **Nunca añadir «en la máxima medida permitida por la ley»** ni fórmulas
 *     equivalentes: eso invierte la frase y la convierte en aquello que venía a rechazar.
 *   - El art. 22 es el art. 36 (fuero exclusivo): el domicilio **de la persona usuaria**, nunca
 *     el del operador. Señalar el del operador sería nulo conforme al art. 35.
 *
 * ⚠ «청약철회» se traduce como **«desistimiento»**, distinto de la **«cancelación»** de la
 *   suscripción del artículo 14: Jogak Pro *es* una suscripción, y los dos remedios no pueden
 *   confundirse dentro de un mismo documento.
 */
export const TERMS_ES: LegalDoc = {
  title: 'Condiciones de uso de Jogak',
  sourceFingerprint: '898aa8d7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'Estas condiciones regulan los derechos, las obligaciones y las responsabilidades entre Hwiseong Games (marca: Vivace Games Studio, en adelante «el operador») y las personas usuarias, en relación con el uso de la aplicación móvil «Jogak» (en adelante, «el servicio») que el operador presta. Léelas antes de usar el servicio.',
  sections: [
    {
      h: 'Artículo 1 (Objeto y ámbito de aplicación)',
      body: [
        'Estas condiciones tienen por objeto establecer las condiciones y los procedimientos de uso del servicio y los derechos y obligaciones del operador y de la persona usuaria.',
        'Estas condiciones se aplican a todas las personas que usan el servicio. Se aplican igualmente cuando solo escribes entradas sin iniciar sesión.',
        'Lo no previsto en estas condiciones se rige por la normativa aplicable, incluidas la Ley de Protección del Consumidor en el Comercio Electrónico, la Ley sobre la Regulación de las Condiciones Generales de la Contratación y la Ley de Promoción de la Industria de Contenidos, así como por los usos mercantiles.',
      ],
    },
    {
      h: 'Artículo 2 (Información del operador)',
      body: [
        'Razón social: Hwiseong Games (marca: Vivace Games Studio)',
        // ⚠ Es la grafía que ya usa `PRIVACY_ES` §11. Dos documentos no pueden nombrar distinto a la misma persona
        'Representante: Son Hwi-seong',
        'Domicilio del establecimiento: 204, 2F, 22 Seongan 5-gil, Jung-gu, Ulsan, 44421, Republic of Korea',
        'Teléfono: +82 10-9926-0925',
        'Correo electrónico: support@vivace-games.com',
        'Número de registro de la empresa: 749-25-02260',
        'Número de registro como empresa de venta a distancia: 2026-Ulsan Jung-gu-0170 (organismo que recibió la declaración: Jung-gu, Ciudad Metropolitana de Ulsan)',
      ],
    },
    {
      h: 'Artículo 3 (Definiciones)',
      body: [
        '«Pieza» («jogak») es cada una de las entradas de diario que la persona usuaria escribe en el servicio.',
        '«Dispositivo» es el teléfono inteligente u otro terminal en el que la persona usuaria instala y usa el servicio.',
        '«Jogak Pro» es el producto de suscripción periódica de pago que ofrece la eliminación de anuncios, la copia de seguridad y restauración, y los informes de resumen con IA.',
        '«Tienda de aplicaciones» es un mercado de aplicaciones, como Google Play, a través del cual se distribuye el servicio y se pagan los productos de pago.',
      ],
    },
    {
      h: 'Artículo 4 (Publicación y modificación de estas condiciones)',
      body: [
        'El operador publica estas condiciones en la pantalla [Ajustes] del servicio y en la dirección indicada a continuación, para que puedas consultarlas en cualquier momento.',
        'https://sonwheesung.github.io/diary/terms.html',
        'El operador puede modificar estas condiciones siempre que ello no infrinja la normativa aplicable.',
        'Al modificarlas, el operador indica la fecha de entrada en vigor y el motivo, y lo comunica dentro del servicio desde 7 días antes de esa fecha. No obstante, cuando la modificación sea desfavorable para las personas usuarias, el aviso se publica desde 30 días antes de la fecha de entrada en vigor, mostrando el contenido anterior y el posterior de forma comparable y fácil de entender.',
        'Si no estás de acuerdo con las condiciones modificadas, puedes cancelar el servicio de pago y dejar de usar el servicio antes de la fecha de entrada en vigor. Si sigues usando el servicio después de la fecha anunciada, se entenderá que aceptas las condiciones modificadas.',
      ],
    },
    {
      h: 'Artículo 5 (Contenido del servicio)',
      body: [
        'El nombre del servicio que presta el operador es «Jogak» y su tipo es una aplicación móvil (contenido digital) para escribir y conservar un diario.',
        'Funciones que se ofrecen gratuitamente: escribir, editar, eliminar y buscar entradas, adjuntar fotos, etiquetas, registro de emociones, vista de calendario, bloqueo de la aplicación (PIN y patrón), modo oscuro, varios idiomas, lectura de avisos y «Contacto».',
        'Funciones que se ofrecen con el producto de pago «Jogak Pro»: eliminación de anuncios, copia de seguridad cifrada y restauración, e informes de resumen con IA.',
        'Los títulos, el texto, las fotos, las etiquetas y las emociones de las entradas que escribes se guardan únicamente dentro de tu dispositivo y no se transmiten a los servidores del operador, salvo que actives la función de copia de seguridad.',
        'Si activas la copia de seguridad, las entradas se cifran en tu dispositivo antes de transmitirse y el operador no conserva la clave de descifrado, por lo que no puede leer su contenido.',
        'Al crear un informe de resumen con IA, el texto del diario del periodo que has solicitado pasa por el servidor del operador y se entrega al proveedor de inteligencia artificial. El operador no almacena ese texto. Los detalles se rigen por la política de privacidad.',
      ],
    },
    {
      h: 'Artículo 6 (Perfección del contrato y cuentas)',
      body: [
        'El contrato de uso del servicio se perfecciona cuando la persona usuaria instala el servicio, acepta estas condiciones y lo utiliza.',
        'Las funciones gratuitas, incluida la escritura de entradas, pueden usarse sin cuenta.',
        '«Contacto», el pago de productos de pago, la copia de seguridad y restauración y los informes de resumen con IA requieren iniciar sesión con una cuenta de Google.',
        'Puedes eliminar tu cuenta en cualquier momento en la pantalla [Ajustes] → [Contacto] del servicio. La forma de eliminarla y la información que se elimina o se conserva se rigen por la guía de eliminación de cuenta.',
      ],
    },
    {
      h: 'Artículo 7 (Precio de los productos de pago y pago)',
      body: [
        'La tarifa de Jogak Pro es de 3.900 KRW al mes y 29.000 KRW al año, importes que incluyen el impuesto sobre el valor añadido.',
        'La tarifa se cobra automáticamente al medio de pago que tengas registrado en la tienda de aplicaciones, en el momento de iniciar la suscripción y en cada renovación posterior.',
        'No hay ningún coste adicional a la tarifa. No obstante, los cargos de datos necesarios para usar el servicio se rigen por la política del operador de telecomunicaciones que hayas contratado y corren por tu cuenta.',
        'El importe efectivamente cobrado puede diferir de los anteriores según las políticas de tipo de cambio y comisiones de la tienda de aplicaciones o según sus precios por país. En ese caso prevalece el importe que se muestra en la pantalla de pago.',
        'Si el operador sube la tarifa, lo comunicará con antelación conforme al artículo 4, y el precio incrementado no se aplicará a un periodo de suscripción ya pagado.',
      ],
    },
    {
      h: 'Artículo 8 (Limitaciones de las condiciones de venta)',
      body: [
        'El servicio solo puede usarse en los países en los que la tienda de aplicaciones permite su distribución, y la instalación y el pago solo son posibles en los países que el operador haya designado para la distribución.',
        'Una suscripción de pago está vinculada a una sola cuenta a la vez. Si inicias sesión con otra cuenta de Google en el mismo dispositivo, la suscripción se transfiere a esa cuenta y deja de poder usarse desde la anterior.',
        'El operador puede fijar un límite máximo de usos en la medida necesaria para prestar determinadas funciones del servicio. El número de informes de resumen con IA que pueden generarse está limitado por periodo, y ese límite se muestra en las pantallas del servicio.',
      ],
    },
    {
      h: 'Artículo 9 (Momento y forma del suministro)',
      body: [
        'Jogak Pro se aplica a tu cuenta en cuanto se completa el pago, sin ningún proceso de entrega adicional.',
        'Si el pago se ha completado pero el derecho no se ha aplicado, puedes usar [Restaurar compras] en la pantalla [Jogak Pro] del servicio o dirigirte al operador por la vía del artículo 21.',
        'El periodo de suscripción va desde la fecha de pago hasta el día anterior a la siguiente renovación y se renueva automáticamente por el mismo periodo si no se cancela.',
      ],
    },
    {
      h: 'Artículo 10 (Entorno de uso)',
      body: [
        'El servicio puede usarse en dispositivos Android y requiere la versión del sistema operativo indicada en la ficha de la tienda de aplicaciones o una posterior.',
        'Las funciones básicas, como escribir, consultar y buscar entradas, pueden usarse sin conexión a internet.',
        'La lectura de avisos, «Contacto», el inicio de sesión, el pago, la copia de seguridad y restauración y los informes de resumen con IA requieren conexión a internet.',
        'Si tu dispositivo tiene poco espacio de almacenamiento o su sistema operativo queda fuera del rango admitido, algunas funciones pueden no funcionar correctamente.',
      ],
    },
    {
      h: 'Artículo 11 (Prueba gratuita y conversión en suscripción de pago)',
      body: [
        'El operador ofrece una prueba gratuita de 7 días de Jogak Pro.',
        'Al terminar el periodo de prueba gratuita, este se convierte automáticamente en una suscripción periódica de pago y se cobra la tarifa del artículo 7.',
        'Antes de que se produzca la conversión, el operador muestra la fecha y la hora de la conversión, el precio antes y después del cambio y el método de pago, y recaba tu consentimiento; si no lo otorgas, no se realiza ningún pago.',
        'Si no quieres que se te cobre al terminar la prueba gratuita, cancela la suscripción por la vía del artículo 14 antes de que termine el periodo de prueba. Aunque la canceles, podrás seguir usando Jogak Pro hasta que termine ese periodo.',
      ],
    },
    {
      h: 'Artículo 12 (Desistimiento)',
      body: [
        'Puedes desistir dentro de los 7 días siguientes a la fecha de pago de un producto de pago o a la fecha en que recibas por escrito las condiciones del contrato.',
        'El desistimiento se ejerce comunicando esa voluntad al canal de consultas del artículo 21, y el operador te comunica el resultado en un plazo de 3 días hábiles desde su recepción.',
        'Una vez ejercido el desistimiento, el operador reembolsa el importe conforme al artículo 13 y tu derecho a Jogak Pro termina de inmediato.',
        'No obstante, conforme al art. 17(2)5 de la Ley de Protección del Consumidor en el Comercio Electrónico, el desistimiento queda limitado cuando se ha iniciado el suministro del contenido digital. Aun en ese caso, puedes desistir respecto de la parte aún no suministrada de un contenido digital que se suministra por partes.',
        'Para aplicar esa limitación, el operador, conforme al apartado 6 del mismo artículo, indica este hecho y, al mismo tiempo, ofrece como producto de prueba la prueba gratuita de 7 días del artículo 11. Si el operador no ha adoptado esas medidas, podrás desistir pese a la limitación anterior.',
        'El operador no reclama penalización ni indemnización alguna por el hecho de que hayas desistido.',
      ],
    },
    {
      h: 'Artículo 13 (Reembolsos)',
      body: [
        'Como el pago de los productos de pago se realiza a través de la tienda de aplicaciones, los reembolsos también se tramitan, en principio, conforme al procedimiento de reembolso de esa tienda.',
        'Puedes solicitar el reembolso directamente a la tienda de aplicaciones o al operador a través del canal de consultas del artículo 21. Si lo solicitas al operador, este lo tramitará de acuerdo con la tienda.',
        'El operador reembolsa el importe dentro de los 3 días hábiles siguientes a la recepción de la declaración de desistimiento o similar. El ingreso efectivo puede tardar más según los plazos de tramitación de la tienda de aplicaciones.',
        'Si el operador retrasa el reembolso más allá de ese plazo sin causa justificada, abonará además intereses de demora por el periodo de retraso, calculados aplicando el tipo previsto en el Reglamento de desarrollo de la Ley de Protección del Consumidor en el Comercio Electrónico.',
        'Si ya has usado parte del periodo, el operador puede descontar el importe correspondiente a ese periodo antes de reembolsar. No se descuenta, sin embargo, el periodo durante el cual no hayas podido usar el servicio por causas imputables al operador.',
        'No se cobra ninguna comisión por el reembolso.',
      ],
    },
    {
      h: 'Artículo 14 (Cancelación de la suscripción)',
      body: [
        'Puedes cancelar la suscripción en cualquier momento. La cancelación debes hacerla tú en la pantalla de gestión de suscripciones de la tienda de aplicaciones; el operador no puede cancelarla en tu nombre.',
        'Google Play: aplicación de la tienda > perfil > Pagos y suscripciones > Suscripciones (https://play.google.com/store/account/subscriptions)',
        'Aunque la canceles, podrás seguir usando Jogak Pro hasta que termine el periodo de suscripción ya pagado; una vez pasado ese periodo, la renovación automática se detiene.',
        'Eliminar tu cuenta en el servicio no cancela la suscripción de la tienda de aplicaciones. Si no la cancelas por la vía anterior, con independencia de la eliminación de la cuenta, se te seguirá cobrando.',
      ],
    },
    {
      h: 'Artículo 15 (Contratos celebrados por menores)',
      body: [
        'Si una persona menor de edad ha pagado un producto de pago sin el consentimiento de su representante legal, la propia persona menor o su representante legal pueden anular ese contrato.',
        'No cabe la anulación, sin embargo, cuando la persona menor pagó con bienes de cuya disposición le había autorizado su representante legal, o cuando indujo con engaño a creer que era mayor de edad.',
        'Si deseas anularlo, solicítalo a través del canal de consultas del artículo 21. El operador puede pedir documentación que acredite tu condición de representante legal.',
      ],
    },
    {
      h: 'Artículo 16 (Obligaciones de la persona usuaria)',
      body: [
        'La persona usuaria debe cumplir la normativa aplicable y estas condiciones al usar el servicio.',
        'La persona usuaria no debe usurpar la cuenta de otra persona, interferir en el funcionamiento normal del servicio, acceder o intentar acceder al servicio por medios distintos de los previstos por el operador, ni manipular el proceso de pago de los productos de pago.',
        'La persona usuaria debe custodiar por sí misma la información de su cuenta y el PIN o el patrón de bloqueo de la aplicación.',
        'La persona usuaria debe guardar de forma segura el código de recuperación que se emite al activar la función de copia de seguridad. Si lo pierde, el operador tampoco puede descifrar la copia y la restauración resulta imposible.',
      ],
    },
    {
      h: 'Artículo 17 (Conservación de los datos y copia de seguridad)',
      body: [
        'El original de las entradas que escribes se guarda en tu dispositivo. Si desinstalas la aplicación o restableces el dispositivo, las entradas que hay en él no se pueden recuperar.',
        'Si has activado la función de copia de seguridad, el operador conserva una copia cifrada y puedes restaurarla con tu código de recuperación.',
        'Incluso después de que finalice la suscripción, el operador conserva la copia cifrada durante 90 días, y durante ese plazo la restauración sigue disponible. Pasados los 90 días, la copia se elimina.',
        'El operador no dispone de un canal de notificaciones push, por lo que el aviso de esa eliminación prevista solo se da mostrándolo en pantalla cuando abres la aplicación.',
        'Si eliminas tu cuenta, la copia cifrada guardada en el servidor se elimina junto con la cuenta, sin el periodo de gracia de 90 días.',
      ],
    },
    {
      h: 'Artículo 18 (Propiedad intelectual)',
      body: [
        'Los derechos sobre las entradas que escribes en el servicio y sobre las fotos que adjuntas te pertenecen. El operador no reclama derecho alguno sobre ellas.',
        'El operador no usa las entradas de las personas usuarias para fines distintos de la prestación del servicio, ni con fines publicitarios, estadísticos o de entrenamiento de inteligencia artificial.',
        'Los derechos sobre el servicio en sí y sobre los diseños, las marcas y los programas que incorpora corresponden al operador o a sus legítimos titulares.',
        'La persona usuaria no debe reproducir, distribuir ni someter a ingeniería inversa el servicio sin el consentimiento previo del operador.',
      ],
    },
    {
      h: 'Artículo 19 (Modificación, suspensión y cierre del servicio)',
      body: [
        'El operador puede modificar el contenido del servicio para mejorar su calidad. Cuando el contenido de un producto de pago se modifique de forma desfavorable para las personas usuarias, se comunicará con antelación conforme al artículo 4.',
        'El operador puede suspender temporalmente la prestación del servicio cuando concurran causas inevitables, como la revisión, la sustitución o la avería de los equipos o la interrupción de las comunicaciones, y en tal caso lo comunicará con antelación. No obstante, si la causa inevitable impide avisar con antelación, lo comunicará después.',
        'Si el operador cierra el servicio, lo comunicará mediante avisos dentro del servicio y en la ficha de la tienda de aplicaciones al menos 30 días antes de la fecha de cierre, indicando además el plazo durante el cual podrás descargar o restaurar tu copia de seguridad.',
        'Al cerrar el servicio, se reembolsará a la persona usuaria la tarifa correspondiente al periodo ya pagado y no disfrutado.',
      ],
    },
    {
      h: 'Artículo 20 (Responsabilidad)',
      body: [
        'El operador asume la responsabilidad que la normativa aplicable le atribuye en relación con la prestación del servicio. Ninguna cláusula de estas condiciones excluye ni limita la responsabilidad del operador establecida por la ley.',
        'El operador no responde de los daños derivados de causas que no le sean imputables, como la fuerza mayor, la avería, la pérdida o el restablecimiento del dispositivo de la persona usuaria, o la pérdida por su parte del código de recuperación o del secreto de bloqueo de la aplicación.',
        'El informe de resumen con IA es material de referencia generado por inteligencia artificial y no constituye un diagnóstico ni un consejo médico, psicológico o jurídico. El operador no garantiza la exactitud de su contenido.',
        'Los daños producidos en el proceso de pago a través de la tienda de aplicaciones por causas imputables a esta se rigen por la política de dicha tienda. Aun así, el operador prestará toda la colaboración necesaria para la reparación del perjuicio de la persona usuaria.',
      ],
    },
    {
      h: 'Artículo 21 (Reclamaciones de consumo y resolución de conflictos)',
      body: [
        'Para atender las opiniones y reclamaciones de las personas usuarias, el operador mantiene el canal [Ajustes] → [Contacto] dentro del servicio y el canal de correo electrónico indicado a continuación.',
        'Correo electrónico: support@vivace-games.com',
        'Cuando el operador considere fundada una opinión o reclamación, la atenderá sin demora; si su tramitación requiere tiempo, comunicará el motivo y el calendario previsto.',
        'Si surge un conflicto entre el operador y una persona usuaria, esta puede solicitar mediación ante los siguientes organismos.',
        '• Comité de Mediación de Conflictos de Consumo (Agencia Coreana del Consumidor): 1372 (desde Corea) · https://www.kca.go.kr',
        '• Comité de Mediación de Conflictos sobre Contenidos: 1588-2594 · https://www.kcdrc.kr',
        '• Comité de Mediación de Conflictos del Comercio Electrónico: 1661-5714 · https://www.ecmc.or.kr',
      ],
    },
    {
      h: 'Artículo 22 (Ley aplicable y jurisdicción)',
      body: [
        'A estas condiciones y al uso del servicio se les aplica la ley de la República de Corea.',
        'Las acciones judiciales relativas a los conflictos surgidos entre el operador y una persona usuaria se someten, conforme al art. 36 de la Ley de Protección del Consumidor en el Comercio Electrónico, al fuero exclusivo del juzgado de primera instancia del domicilio de la persona usuaria en el momento de la interposición de la demanda. Si no tiene domicilio, al fuero exclusivo del juzgado de su residencia; y si en ese momento su domicilio o su residencia no constan con claridad, el juzgado competente se determina conforme a la Ley de Procedimiento Civil.',
        'La versión coreana de estas condiciones es la versión auténtica. En caso de discrepancia de significado con una traducción a otro idioma, prevalece la versión coreana.',
        'Disposición final: estas condiciones entran en vigor el 17 de agosto de 2026.',
      ],
    },
  ],
};
