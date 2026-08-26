import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Datenschutzerklärung — Deutsch.
 *
 * 🔴 **Der koreanische Text ist maßgeblich.** Dies ist eine Übersetzung zur besseren
 *   Lesbarkeit; bei Abweichungen gilt `legal-text.ts` (Koreanisch).
 * ⚠ **Die Struktur muss exakt dem Koreanischen entsprechen** — gleiche Anzahl Abschnitte und
 *   Zeilen je Abschnitt. `npm run check:legal` prüft das.
 *
 * ⚠ **Backup und KI sagen entgegengesetzte Sätze** — sie dürfen niemals zu einem verschmelzen:
 *     Backup = gespeichert, aber unlesbar → „speichert, kann es aber nicht lesen“
 *     KI     = gelesen, aber nicht gespeichert → „speichert es nicht“, und ausdrücklich
 *              **nicht** „kann es nicht sehen“
 *   Abschnitt 1 benennt diesen Unterschied absichtlich; das darf beim Übersetzen nicht
 *   geglättet werden.
 *
 * ⚠ Dieses Dokument beruht auf dem **koreanischen** Gesetz zum Schutz personenbezogener Daten,
 *   nicht auf der DSGVO. Keine DSGVO-Begriffe einführen, die hier nicht ohnehin schon stehen —
 *   sie würden die Rechtsgrundlage falsch darstellen.
 */
export const PRIVACY_DE: LegalDoc = {
  title: 'Datenschutzerklärung für Jogak',
  sourceFingerprint: '47ec2dc4',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Vivace Games Studio („der Betreiber“) hält das Gesetz zum Schutz personenbezogener Daten und weitere einschlägige Vorschriften ein und verarbeitet die personenbezogenen Daten der Nutzerinnen und Nutzer von „Jogak“ („der Dienst“) wie nachstehend beschrieben. Jogak bewahrt die von dir geschriebenen Tagebucheinträge grundsätzlich auf deinem Gerät auf; an einen Server übermittelt werden sie ausschließlich beim Backup, das du selbst einschaltest, und bei den KI-Zusammenfassungsberichten, die du selbst erstellst. Im Übrigen erheben wir nur die notwendigen Mindestangaben.',
  sections: [
    {
      h: '1. Wo deine Einträge liegen — das sagen wir vorab',
      body: [
        'Deine Einträge (Titel, Text, Listen, Fotos, Tags und Gefühle) liegen im internen Speicher deines Geräts und verlassen es grundsätzlich nicht.',
        '⚠ Es gibt jedoch zwei Ausnahmen, und zwar nur, wenn du sie selbst wählst. Keine von beiden geschieht automatisch.',
        '• Wenn du das Backup einschaltest — eine auf deinem Gerät verschlüsselte Kopie deiner Einträge wird auf dem Server des Betreibers gespeichert. Der Betreiber kann diese Kopie nicht lesen. Einzelheiten stehen in Abschnitt 2(c).',
        '• Wenn du einen KI-Zusammenfassungsbericht erstellst — der Inhalt deiner Einträge aus dem betreffenden Zeitraum wird unverschlüsselt über den Server des Betreibers an den KI-Anbieter übermittelt. Der Betreiber speichert diesen Inhalt nicht. Einzelheiten stehen in Abschnitt 2(e).',
        '⚠ Die beiden vorstehenden Sätze sagen Verschiedenes. Das Backup speichert der Betreiber, kann es aber nicht lesen; beim KI-Bericht liest er den Inhalt, speichert ihn aber nicht. Wir sagen das klar und verschleiern es nicht.',
        'Die folgenden Angaben erhebt der Betreiber in keinem Fall und übermittelt sie nicht von deinem Gerät fort.',
        '• PIN, Muster oder Hinweisantwort der App-Sperre — sie werden im sicheren Speicher des Geräts nur in nicht wiederherstellbarer Form (als Hash) abgelegt; das Original wird nirgends gespeichert.',
        '• Name, Geburtsdatum, Telefonnummer, Anschrift, Kontaktliste, Standort oder Aufzeichnungen über Zugriffe auf deine gesamte Fotomediathek.',
        'Fotos, die du in der App auswählst, werden in den app-eigenen Ordner auf deinem Gerät kopiert, damit sie in einen Eintrag eingefügt werden können; solange du das Backup nicht einschaltest, werden sie nicht nach außen übermittelt. An die KI-Zusammenfassungsberichte werden keine Fotos übermittelt.',
      ],
    },
    {
      h: '2. Personenbezogene Daten, die wir erheben',
      body: [
        'a. Wenn du „Kontakt“ nutzt (Anmeldung erforderlich)',
        '• Erforderlich: die E-Mail-Adresse deines Google-Kontos und die eindeutige Kennung des Social-Kontos (Google „sub“)',
        '  — Rechtsgrundlage: Gesetz zum Schutz personenbezogener Daten, Art. 15 Abs. 1 Nr. 4 (erforderlich zur Durchführung der von der Nutzerin bzw. dem Nutzer verlangten Maßnahmen, also zur Beantwortung der Anfrage)',
        '  — Zweck: Identifizierung der anfragenden Person, Zusendung der Antwort und Einsicht in den eigenen Anfrageverlauf',
        '• Kategorie und Inhalt der Anfrage',
        '• Gerätetyp (Android/iOS) und App-Version — um zu verstehen, in welcher Umgebung das Problem aufgetreten ist',
        '※ Eine Anmeldung wird für „Kontakt“, das Abo, das Backup und die KI-Berichte benötigt; Einträge schreiben, App-Sperre und alle anderen Funktionen benötigen sie nicht.',
        '※ Kinder unter 14 Jahren können die Anmeldefunktion nicht nutzen.',
        'b. Angaben, die bei der Auslieferung von Werbung automatisch erhoben werden',
        '• Werbe-ID (Android-Werbe-ID), Geräte- und Netzwerkinformationen, Aufzeichnungen über Einblendungen und Klicks',
        '• Diese Angaben erhebt Google (AdMob); Einzelheiten und die Widerspruchsmöglichkeit stehen in Abschnitt 7.',
        'c. Wenn du das Backup einschaltest (Abo erforderlich)',
        '• Eine verschlüsselte Kopie deiner Einträge — in einer Form, die der Betreiber nicht entschlüsseln kann',
        '• Backup-Kennung, Backup-Zeitpunkt, Generationsnummer und Größe — diese Angaben sind nicht verschlüsselt. Der Betreiber kann erkennen, welches Konto wann wie viel gesichert hat.',
        '  — Rechtsgrundlage: deine gesonderte Einwilligung (eingeholt auf dem Bildschirm, auf dem du das Backup einschaltest)',
        '⚠ Genau gesagt: Der Betreiber speichert diese Kopie, kann sie aber nicht lesen. Der Entschlüsselungsschlüssel existiert nur auf deinem Gerät und in dem Wiederherstellungscode, den du aufbewahrst; der Betreiber hat ihn nicht.',
        '⚠ Verlierst du den Wiederherstellungscode, gibt es keine Möglichkeit, das Backup zu öffnen. Auch der Betreiber kann es nicht für dich öffnen.',
        'd. Wenn du ein Abo nutzt',
        '• Abostatus — Berechtigungsschlüssel, Ablaufzeitpunkt, Kulanzfrist bei Zahlungsfehlern, ob eine Verlängerung ansteht',
        '• Die vom Store ausgestellte Transaktionskennung, die Produktkennung und die Unterscheidung der Zahlungsumgebung (Produktion/Test)',
        '• Vom Zahlungsdienst übermittelte Aufzeichnungen über Statusänderungen des Abos (Kauf, Verlängerung, Kündigung, Erstattung usw.) und deren Originalinhalt',
        '  — Rechtsgrundlage: Gesetz zum Schutz personenbezogener Daten, Art. 15 Abs. 1 Nr. 4 (erforderlich zur Durchführung der verlangten Maßnahme, also zur Bereitstellung der beantragten Aboberechtigung)',
        '  — Zweck: Prüfung der Aboberechtigung (Werbefreiheit, Backup, KI-Berichte), Bearbeitung von Zahlungsanfragen und Erstattungen',
        '⚠ Zahlungsdaten wie Kreditkarten- oder Kontonummern verarbeitet Google Play; sie werden nicht an den Betreiber weitergegeben. Der Betreiber erfährt nur, dass du bezahlt hast und bis wann das Abo gültig ist.',
        'e. Wenn du KI-Zusammenfassungsberichte erstellst (Abo erforderlich)',
        '• Was über den Server des Betreibers an den KI-Anbieter übermittelt wird: Titel, Text, Gefühl und Datum der Einträge aus dem Zeitraum, für den du einen Bericht angefordert hast',
        '• Was der Betreiber speichert: die von der KI erzeugte Zusammenfassung, die Kennung des Kontos, das den Bericht erstellt hat, den Zeitraum, die Anzahl der Male und die Anzahl der verwendeten Token',
        '⚠ Genau gesagt: Der Betreiber speichert den Tagebuchinhalt selbst nicht. Allerdings ① durchläuft der Inhalt in dem Moment, in dem die Zusammenfassung entsteht, den Server des Betreibers, weshalb wir dir nicht sagen können, dass „der Betreiber ihn nicht sehen kann“, und ② wird die erzeugte Zusammenfassung 90 Tage lang aufbewahrt. Wir sagen das klar und verschleiern es nicht.',
        '⚠ Die Zusammenfassung wird auf Grundlage deines Tagebuchs verfasst und kann daher Tagebuchinhalte enthalten.',
        '• Gesonderte Einwilligung für sensible Daten: Ein Tagebuch kann sensible Daten wie Gesundheits- oder psychische Zustände im Sinne von Art. 23 des Gesetzes zum Schutz personenbezogener Daten enthalten. Da KI-Zusammenfassungsberichte diesen Inhalt unverschlüsselt verarbeiten, holen wir bei der ersten Nutzung der Funktion eine gesonderte Einwilligung zur Verarbeitung sensibler Daten ein. Diese Einwilligung ist von der Einwilligung zur Übermittlung ins Ausland nach Abschnitt 6 getrennt; du kannst beide unabhängig voneinander wählen.',
        'Auch ohne Einwilligung bleiben alle Funktionen außer den KI-Berichten vollständig nutzbar. Berichte entstehen nur, wenn du sie selbst erstellst; sie werden nie automatisch erzeugt.',
      ],
    },
    {
      h: '3. Zwecke der Verarbeitung',
      body: [
        '• Entgegennahme und Bearbeitung von Anfragen: prüfen, was du gesendet hast, und Fehler erkennen und beheben',
        '• Identifizierung und Antwort: der anfragenden Person die Antwort zustellen und ihr die Einsicht in den eigenen Verlauf ermöglichen',
        '• Auslieferung von Werbung: Nutzerinnen und Nutzern der kostenlosen Version Werbung anzeigen und deren Leistung messen',
        '• Backup und Wiederherstellung: wenn du es eingeschaltet hast, die verschlüsselte Kopie deiner Einträge aufbewahren und sie dir auf Verlangen zurückgeben',
        '• Prüfung der Aboberechtigung: zahlenden Nutzerinnen und Nutzern Werbefreiheit, Backup und KI-Berichte bereitstellen sowie Zahlungsanfragen und Erstattungen bearbeiten',
        '• Erstellung von KI-Zusammenfassungsberichten und Verbesserung ihrer Qualität: die Zusammenfassung für den von dir angeforderten Zeitraum erzeugen und anhand des Ergebnisses die Qualität verbessern',
        'Der Betreiber verwendet personenbezogene Daten nicht für andere als die oben genannten Zwecke und holt bei einer Zweckänderung vorab die Einwilligung ein.',
      ],
    },
    {
      h: '4. Speicher- und Nutzungsdauer',
      body: [
        '• Kontoangaben (E-Mail-Adresse, Google „sub“): bis zur Löschung deines Kontos. Bei Löschung vernichten wir sie unverzüglich oder überführen sie in eine nicht rückverfolgbare Form.',
        '• Inhalt der Anfragen: 3 Jahre ab Eingang (Gesetz zum Verbraucherschutz im elektronischen Handel — Aufzeichnungen über Beschwerden oder Streitbeilegung)',
        '• Verhaltensdaten auf Basis der Werbe-ID: bis zu 1 Jahr ab Erhebung',
        '• Verschlüsselte Backup-Kopie: gespeichert, solange das Backup eingeschaltet ist, und bis zu 90 Tage nach dem Ende des Abos; danach automatische Vernichtung. Schaltest du das Backup aus, verlangst du die Löschung oder löschst du dein Konto, vernichten wir sie unverzüglich, ohne die 90 Tage abzuwarten. Backups, auf die seit 3 Jahren oder länger nicht zugegriffen wurde, werden vernichtet (das betrifft den Fall, dass die App gelöscht, das Konto aber nicht gelöscht wurde).',
        '• Aufzeichnung der Vernichtung eines Backups (Backup-Kennung und Zeitpunkt der Vernichtung): 1 Jahr — damit du herausfinden kannst, „warum die Wiederherstellung nicht funktioniert“; die Kontokennung wird nicht mit aufbewahrt.',
        '• Von der KI erzeugte Zusammenfassung: 90 Tage ab dem Tag der Erstellung. Danach wird sie automatisch gelöscht.',
        '• Nutzungsaufzeichnungen der Berichte (Kontokennung, Zeitraum, Anzahl der Male, Anzahl der Token): bis der Zweck erfüllt ist oder bis du dein Konto löschst',
        '• Aufzeichnungen über Verträge oder Widerruf sowie über Zahlung und Lieferung von Waren: 5 Jahre (Gesetz zum Verbraucherschutz im elektronischen Handel, Art. 6)',
        'Löschst du dein Konto, werden die Kontokennungen (E-Mail, Google „sub“) unverzüglich in eine nicht rückverfolgbare Form überführt; die obigen Transaktionsaufzeichnungen werden für die genannte Dauer getrennt und in nicht rückverfolgbarer Form aufbewahrt und danach vernichtet.',
        '⚠ Das Löschen deines Kontos kündigt dein Google-Play-Abo nicht automatisch. Du musst es selbst unter Google Play > Abos kündigen; andernfalls wird dir weiterhin Geld berechnet.',
        '⚠ Der Hinweis darauf, dass dein Backup wegen des abgelaufenen Abos gelöscht wird, erreicht dich nur auf dem Bildschirm, wenn du die App öffnest. Öffnest du sie nicht, erreicht dich dieser Hinweis möglicherweise nicht.',
        'Nach Ablauf der Frist oder Erreichen des Zwecks vernichten wir die Daten unverzüglich.',
      ],
    },
    {
      h: '5. Weitergabe an Dritte',
      body: [
        'Der Betreiber gibt personenbezogene Daten der Nutzerinnen und Nutzer nicht an Dritte weiter.',
        'Die in Abschnitt 6 genannten Unternehmen verarbeiten die Daten im Auftrag des Betreibers und nutzen sie nicht für eigene Zwecke. Der KI-Anbieter verwendet die ihm übermittelten Tagebuchinhalte nicht für das Modelltraining.',
        'Ausgenommen sind Fälle, in denen eine besondere gesetzliche Vorschrift dies vorsieht oder eine Ermittlungsbehörde dies nach den gesetzlich vorgesehenen Verfahren und Formen verlangt.',
      ],
    },
    {
      h: '6. Auftragsverarbeitung und Übermittlung ins Ausland',
      body: [
        'Zur Erbringung des Dienstes lässt der Betreiber wie folgt verarbeiten; ein Teil davon erfolgt außerhalb Koreas.',
        '• Google LLC — Land: USA. Kontakt: https://support.google.com/policies/contact/general_privacy_form. Zweck: Auslieferung und Messung von Werbung (AdMob), Anmeldung mit Google-Konto, Abwicklung und Prüfung der Abozahlungen. Daten: Werbe-ID, Geräte- und Netzwerkinformationen, bei der Anmeldung E-Mail-Adresse und Kontokennung sowie Store-Transaktionsdaten. Wann und wie: Übermittlung über das Netz bei Werbeanfragen, bei der Anmeldung und beim Bezahlen. Speicherdauer: gemäß der Datenschutzerklärung von Google',
        '• Supabase Inc. — Land: USA (Sitz der Gesellschaft). Kontakt: privacy@supabase.com. Zweck: Speicherung der Anfrage- und Kontoinformationen in einer Datenbank sowie der verschlüsselten Backup-Kopie und des Abostatus. Daten: die Angaben aus Abschnitt 2(a), 2(c) und 2(d). Wann und wie: Übermittlung über das Netz beim Senden einer Anfrage und beim Backup. Speicherdauer: die Fristen aus Abschnitt 4. ※ Der physische Speicherort ist die Republik Korea (Region Seoul); da die betreibende Gesellschaft jedoch im Ausland sitzt, weisen wir dies als Übermittlung ins Ausland aus.',
        '• Vercel Inc. — Land: USA. Kontakt: privacy@vercel.com. Zweck: Betrieb des Servers, der Anfragen entgegennimmt, sowie des Backup- und des KI-Servers. Daten: die Angaben aus Abschnitt 2(a). Wann und wie: Übermittlung über das Netz beim Senden einer Anfrage. Speicherdauer: bis zum Ende des Auftragsverhältnisses. ※ Die verschlüsselte Backup-Kopie geht direkt an den Speicher, ohne diesen Server zu passieren.',
        '• RevenueCat, Inc. — Land: USA. Kontakt: compliance@revenuecat.com. Zweck: Prüfung der Abozahlungen und des Abostatus. Daten: Kontokennung, Transaktions- und Produktkennungen des Stores, Geräte- und App-Informationen. Wann und wie: Übermittlung über das Netz beim Öffnen des Abo-Bildschirms und beim Bezahlen. Speicherdauer: bis zum Ende des Auftragsverhältnisses',
        '• OpenAI OpCo, LLC — Land: USA (1455 Third Street, San Francisco, California 94158, USA). Kontakt: dpo@openai.com. Zweck: Erstellung eines Zusammenfassungsberichts. Daten: Titel, Text, Gefühl und Datum der Einträge aus dem Zeitraum, für den du einen Bericht angefordert hast. Wann und wie: Übertragung über das Netz in dem Moment, in dem du auf Bericht erstellen tippst. Speicherdauer: Der Server des Betreibers speichert die Tagebuchinhalte nicht — sie werden nur während der Erstellung der Zusammenfassung im Arbeitsspeicher gehalten und sofort danach verworfen. Der KI-Anbieter bewahrt sie zur Missbrauchsüberwachung höchstens 30 Tage auf und löscht sie danach; auch in diesem Zeitraum verwendet er sie nicht für das Modelltraining.',
        '⚠ Die Übermittlung ins Ausland für KI-Berichte bedarf einer gesonderten Einwilligung. Bei der ersten Nutzung der Funktion zeigen wir dir dieselben Angaben in der App und holen deine Einwilligung ein; diese Einwilligung ist von der Einwilligung zu sensiblen Daten nach Abschnitt 2(e) getrennt.',
        'Du kannst der Übermittlung deiner Daten ins Ausland widersprechen. Für werbebezogene Übermittlungen deaktiviere personalisierte Werbung nach Abschnitt 7; anfragebezogene Übermittlungen finden nicht statt, wenn du „Kontakt“ nicht nutzt. Schaltest du das Backup nicht ein, schließt du kein Abo ab und erstellst du keine Berichte, finden die damit verbundenen Übermittlungen nicht statt, und alle übrigen Funktionen, auch das Schreiben von Einträgen, bleiben vollständig nutzbar.',
      ],
    },
    {
      h: '7. Werbe-IDs und andere automatische Erhebungsmittel sowie Widerspruch',
      body: [
        'Der Dienst nutzt Google AdMob, um Nutzerinnen und Nutzern der kostenlosen Version Werbung anzuzeigen. AdMob kann zur Auslieferung personalisierter Werbung eine Werbe-ID erheben und verwenden.',
        'Zweck der Erhebung: personalisierte Werbung ausliefern, Werbeleistung messen und Klickbetrug verhindern',
        'Widerspruch (Android): Einstellungen > Datenschutz > Werbung > „Werbe-ID löschen“ oder „Werbepersonalisierung deaktivieren“',
        'Widerspruch (iOS): Einstellungen > Datenschutz & Sicherheit > Tracking > „Apps erlauben, Tracking anzufordern“ ausschalten',
        'Auch nach einem Widerspruch kann weiterhin Werbung erscheinen, dann jedoch allgemeine Werbung, die nicht auf deinen Interessen beruht.',
        'Mit einem Abo wird dir keine Werbung angezeigt, und die oben genannte werbebezogene Erhebung findet dann nicht statt.',
        'Mehr dazu, wie Google personenbezogene Daten zu Werbezwecken verarbeitet: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Verfahren und Methode der Vernichtung',
      body: [
        'Verfahren: Personenbezogene Daten, deren Frist abgelaufen oder deren Zweck erreicht ist, werden unverzüglich vernichtet. Ist eine Aufbewahrung gesetzlich vorgeschrieben, werden sie für diese Dauer getrennt von anderen Daten aufbewahrt und danach vernichtet.',
        'Methode: Informationen in elektronischer Dateiform werden mit technischen Mitteln dauerhaft gelöscht, die eine Wiederherstellung oder Rekonstruktion ausschließen.',
        'Auf deinem Gerät gespeicherte Einträge, Fotos und Sperrinformationen werden entfernt, wenn du die Funktion „Alles zurücksetzen“ nutzt oder die App löschst.',
        'Hast du das Backup eingeschaltet, wird die auf dem Server gespeicherte verschlüsselte Kopie vernichtet, sobald du sie im Backup-Bildschirm der App löschst oder dein Konto löschst. Beim Löschen des Kontos vernichten wir zuerst das Backup und löschen danach das Konto — verschwindet das Konto zuerst, gibt es niemanden mehr, der berechtigt wäre, dieses Backup zu löschen.',
        'Hast du das Backup nicht eingeschaltet, besitzt der Betreiber die Einträge auf deinem Gerät nicht und kann sie daher nicht für dich löschen.',
      ],
    },
    {
      h: '9. Rechte der betroffenen Person und der gesetzlichen Vertretung sowie deren Ausübung',
      body: [
        'Du kannst jederzeit die folgenden Rechte ausüben.',
        '• Auskunft über deine Daten verlangen • bei Fehlern Berichtigung verlangen • Löschung verlangen • Einschränkung der Verarbeitung verlangen • Übermittlung deiner Daten verlangen (Gesetz zum Schutz personenbezogener Daten, Art. 35-2)',
        'Die Ausübung ist schriftlich oder per E-Mail über den Kontakt in Abschnitt 11 möglich; der Betreiber handelt unverzüglich.',
        'Verlangst du die Berichtigung eines Fehlers, verwenden wir die betreffenden Daten bis zum Abschluss der Berichtigung weder noch geben wir sie weiter.',
        '⚠ Grenzen des Auskunftsrechts beim Backup: Verlangst du Auskunft über dein Backup, kann der Betreiber dir nur den nicht entschlüsselbaren Chiffretext und die Metadaten aus Abschnitt 2(c) herausgeben. Deine Einträge in menschenlesbarer Form können wir nicht bereitstellen — der Betreiber hat den Schlüssel nicht. Du selbst kannst jederzeit in der App mit deinem Wiederherstellungscode wiederherstellen.',
        'Einen erstellten KI-Bericht kannst du jederzeit in der App löschen. Beim Löschen in der App verschwindet er von deinem Gerät; die auf dem Server aufbewahrte Zusammenfassung wird nach 90 Tagen automatisch gelöscht. Wünschst du eine frühere Löschung, kannst du sie über „Kontakt“ anfordern.',
        '⚠ Von der KI erzeugte Zusammenfassungen können von den Tatsachen abweichen und sind keine medizinische oder psychologische Diagnose oder Beratung. Die App bietet eine Möglichkeit, einen Bericht zu melden.',
        'Die gesetzliche Vertretung eines Kindes unter 14 Jahren kann die vorstehenden Rechte in dessen Namen ausüben.',
      ],
    },
    {
      h: '10. Maßnahmen zur Gewährleistung der Sicherheit',
      body: [
        '• Organisatorisch: Zahl der mit personenbezogenen Daten befassten Personen möglichst gering halten und regelmäßig schulen',
        '• Technisch: Verwaltung der Zugriffsrechte auf das Verarbeitungssystem, Verschlüsselung bei der Übertragung (HTTPS), Speicherung des Sperrgeheimnisses als Hash und Nutzung des sicheren Gerätespeichers (Keystore/Keychain)',
        '• Ende-zu-Ende-Verschlüsselung des Backups: Die Backup-Kopie wird auf deinem Gerät verschlüsselt und erst dann übertragen; der Entschlüsselungsschlüssel existiert nur auf dem Gerät und in deinem Wiederherstellungscode. Auf dem Server des Betreibers liegt kein Schlüssel.',
        '• Physisch: Server mit personenbezogenen Daten stehen in Rechenzentren in- und ausländischer Cloud-Anbieter und folgen deren Regelungen zur physischen Zutrittskontrolle.',
        '⚠ Die App-Sperre verhindert den Zugriff auf den Bildschirm; sie verschlüsselt nicht die auf dem Gerät gespeicherten Tagebuchdateien. Geht das Gerät verloren oder wird es entwendet und seine eigene Sicherheit ausgehebelt, können Inhalte offengelegt werden.',
      ],
    },
    {
      h: '11. Datenschutzbeauftragte Person und Stelle für Auskunftsersuchen',
      body: [
        'Der Betreiber trägt die Gesamtverantwortung für die Verarbeitung personenbezogener Daten und benennt die folgende datenschutzbeauftragte Person zur Bearbeitung von Beschwerden und Abhilfeersuchen.',
        '• Datenschutzbeauftragte Person: Son Hwi-seong (Funktion: Vertretungsberechtigter)',
        '• Kontakt: support@vivace-games.com',
        '• Stelle für Entgegennahme und Bearbeitung von Auskunftsersuchen: dieselbe',
        'Du kannst jede Frage, Beschwerde oder jedes Abhilfeersuchen zum Datenschutz, das bei der Nutzung des Dienstes entsteht, an die datenschutzbeauftragte Person richten. Der Betreiber antwortet und handelt unverzüglich.',
      ],
    },
    {
      h: '12. Rechtsbehelfe bei Rechtsverletzungen',
      body: [
        'Um Abhilfe bei einer Verletzung deiner personenbezogenen Daten zu erhalten, kannst du dich an die folgenden koreanischen Stellen zur Streitbeilegung oder Beratung wenden.',
        '• Ausschuss für die Schlichtung von Streitigkeiten über personenbezogene Daten: 1833-6972 (aus Korea) / www.kopico.go.kr',
        '• Meldestelle für Verletzungen der Privatsphäre: 118 (aus Korea) / privacy.kisa.or.kr',
        '• Oberste Staatsanwaltschaft, Abteilung für Cyberermittlungen: 1301 (aus Korea) / www.spo.go.kr',
        '• Nationale Polizeibehörde, Amt für Cyberermittlungen: 182 (aus Korea) / ecrm.police.go.kr',
        'Wer zudem durch eine Verfügung oder ein Unterlassen der Leitung einer öffentlichen Stelle im Hinblick auf ein Ersuchen nach Art. 35 (Auskunft), Art. 36 (Berichtigung und Löschung) oder Art. 37 (Einschränkung der Verarbeitung) des Gesetzes zum Schutz personenbezogener Daten in Rechten oder Interessen verletzt ist, kann nach dem Verwaltungsrechtsbehelfsgesetz einen Verwaltungsrechtsbehelf einlegen.',
      ],
    },
    {
      h: '13. Änderungen dieser Datenschutzerklärung',
      body: [
        'Diese Datenschutzerklärung gilt ab ihrem Inkrafttreten.',
        'Werden Inhalte aufgrund von Änderungen der Rechtslage, der Richtlinien oder der Sicherheitstechnik ergänzt, gestrichen oder geändert, informieren wir ab 7 Tagen vor Wirksamwerden über Mitteilungen in der App (bei für Nutzerinnen und Nutzer nachteiligen Änderungen ab 30 Tagen vorher).',
        'Geplante Änderungen werden vorab unter „Angekündigte Änderungen“ am Ende dieses Dokuments in einer Form veröffentlicht, die einen Vorher-Nachher-Vergleich erlaubt.',
        'Änderungsverlauf',
        '• 2026-08-09 erstmalig erlassen',
        '• 2026-08-11 Ankündigung einer Änderung veröffentlicht — geplante Einführung von Monatsabo und Backup/Wiederherstellung (der Haupttext ist noch unverändert)',
        '• 2026-08-12 Ankündigung einer Änderung veröffentlicht — geplante Einführung der KI-Zusammenfassungsberichte (der Haupttext ist noch unverändert)',
        '• 2026-08-23 Änderung — die beiden vorstehenden Ankündigungen wurden in den Haupttext übernommen. Die Verarbeitung zu Monatsabo, Backup/Wiederherstellung und KI-Zusammenfassungsberichten wurde in die Abschnitte 1, 2, 3, 4, 6, 8, 9 und 10 aufgenommen.',
      ],
    },
  ],
};

/**
 * Anleitung zur Kontolöschung — Deutsch.
 *
 * 🔴 **Der koreanische Text ist maßgeblich** (`legal-text.ts`). Es gilt dieselbe Regel wie für
 *   die Datenschutzerklärung: bei Abweichungen entscheidet das Koreanische.
 *
 * ⚠ Dieses Dokument hat eine **eigene öffentliche URL**, weil das Formular „Datensicherheit“
 *   von Google Play einen **Weg über das Web** zur Löschung verlangt: Wer die App bereits
 *   deinstalliert hat, muss die Löschung trotzdem verlangen können. Genau diese URL öffnen die
 *   Prüferinnen und Prüfer von Play — sie darf deshalb nicht nur auf Koreanisch vorliegen.
 *
 * ⚠ **Die Struktur muss exakt dem Koreanischen entsprechen** — 6 Abschnitte
 *   (6/4/9/5/4/3 Zeilen) und keine angekündigten Änderungen mehr. `npm run check:legal` prüft
 *   das. Eine stillschweigend fehlende Klausel ist hier der einzige Fehler, der wirklich zählt.
 */
export const DELETE_ACCOUNT_DE: LegalDoc = {
  title: 'Jogak — So löschst du dein Konto',
  sourceFingerprint: 'a8b0c8b9',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Diese Seite erklärt, wie du dein Konto bei der App Jogak und die damit verbundenen Daten löschst. Wenn du die App bereits gelöscht hast oder dich nicht anmelden kannst, kannst du die Löschung auch per E-Mail verlangen.',
  sections: [
    {
      h: '1. Selbst in der App löschen',
      body: [
        'Gehe in der App Jogak wie folgt vor, dann wird es sofort wirksam.',
        '① App öffnen → unten der Tab [Einstellungen]',
        '② [Kontakt] auswählen',
        '③ Wenn du nicht angemeldet bist, melde dich mit deinem Google-Konto an',
        '④ Ganz unten auf dem Bildschirm [Konto löschen] auswählen und bestätigen',
        'Das Löschen des Kontos lässt sich nicht rückgängig machen.',
      ],
    },
    {
      h: '2. Per E-Mail verlangen (wenn du die App gelöscht hast oder dich nicht anmelden kannst)',
      body: [
        'Sende das Folgende an support@vivace-games.com.',
        '• Betreff: Antrag auf Löschung des Jogak-Kontos',
        '• Text: die E-Mail-Adresse des Google-Kontos, mit dem du dich bei Jogak angemeldet hast',
        'Damit wir prüfen können, dass du es bist, muss die Adresse, von der du schreibst, mit der bei der Anmeldung verwendeten übereinstimmen. Nach Eingang bearbeiten wir das Anliegen innerhalb von 7 Werktagen und antworten dir.',
      ],
    },
    {
      h: '3. Daten, die gelöscht werden',
      body: [
        'Wenn du dein Konto löschst, werden die folgenden Angaben unverzüglich vernichtet oder in eine nicht rückverfolgbare Form überführt.',
        '• Die eindeutige Kennung des Social-Kontos (Google „sub“)',
        '• Die E-Mail-Adresse',
        '• Die Verknüpfung zwischen deinen Anfragen und dem Konto, das sie verfasst hat',
        '• Die auf dem Server gespeicherte verschlüsselte Kopie deiner Einträge (wenn du das Backup eingeschaltet hast) — sie wird mit gelöscht, ohne die 90 Tage Kulanzfrist abzuwarten.',
        '• Backup-Kennung und Backup-Aufzeichnungen (Zeitpunkt, Größe, Generationsnummer)',
        '• Die auf dem Server aufbewahrten Zusammenfassungen der KI-Berichte (höchstens 90 Tage) und die Nutzungsaufzeichnungen der Berichte (Zeitraum, Anzahl der Male, Anzahl der Token)',
        '⚠ Beim Löschen des Kontos vernichten wir zuerst das Backup und löschen danach das Konto. Verschwindet das Konto zuerst, gibt es niemanden mehr, der berechtigt wäre, dieses Backup zu löschen. Schlägt die Löschung des Backups fehl, wird auch das Löschen des Kontos nicht durchgeführt; versuche es dann bitte etwas später erneut.',
        '⚠ Einmal gelöscht, lässt es sich nicht rückgängig machen. Auch wenn du deinen Wiederherstellungscode noch hast, kannst du das Backup auf dem Server nicht wiederherstellen.',
      ],
    },
    {
      h: '4. Daten, die aufbewahrt werden, und für wie lange',
      body: [
        'Die folgenden Angaben werden nach gesetzlicher Vorgabe aufbewahrt und verbleiben auch während dieser Dauer nur in einer Form, die sich nicht auf die verfassende Person zurückführen lässt (pseudonymisiert).',
        '• Inhalt der Anfragen: 3 Jahre (Gesetz zum Verbraucherschutz im elektronischen Handel — Aufzeichnungen über Beschwerden von Verbraucherinnen und Verbrauchern oder über Streitbeilegung)',
        '• Aufzeichnungen über Abotransaktionen (Transaktionskennung, Produkt, Abolaufzeit, Verlauf der Änderungen des Zahlungsstatus): 5 Jahre (Gesetz zum Verbraucherschutz im elektronischen Handel, Art. 6)',
        '• Die Aufzeichnung der Vernichtung eines Backups (Backup-Kennung und Zeitpunkt der Vernichtung): 1 Jahr — damit du herausfinden kannst, „warum die Wiederherstellung nicht funktioniert“; die Kontokennung wird nicht mit aufbewahrt.',
        'Nach Ablauf der Aufbewahrungsfrist vernichten wir sie unverzüglich.',
      ],
    },
    {
      h: '5. Was auf deinem Gerät bleibt — durch das Löschen des Kontos verschwindet es nicht',
      body: [
        'Die Einträge in Jogak (Titel, Text, Fotos, Tags und Gefühle) sowie der Text der KI-Berichte werden im Inneren deines Geräts gespeichert.',
        'Deshalb bleiben Einträge und Berichte auf deinem Gerät auch nach dem Löschen des Kontos erhalten. Willst du sie auch vom Gerät entfernen, lösche die App oder führe in den [Einstellungen] der App das Zurücksetzen durch.',
        'Umgekehrt gilt: Löschst du die App, lassen sich die Einträge auf dem Gerät nicht wiederherstellen. Nur wenn du das Backup eingeschaltet und deinen Wiederherstellungscode aufbewahrt hast, kannst du sie zurückholen — und das ausschließlich, solange du dein Konto noch nicht gelöscht hast.',
        '⚠ Hast du das Backup nicht eingeschaltet, liegen die Einträge auf deinem Gerät nicht beim Betreiber; er kann sie daher weder für dich löschen noch für dich zurückholen.',
      ],
    },
    {
      h: '6. Das Abo musst du gesondert kündigen',
      body: [
        'Das Löschen deines Kontos kündigt dein Abo bei Google Play nicht automatisch; kündigst du es nicht, wird dir weiterhin Geld berechnet.',
        'Kündigen: Google-Play-Store-App > Profil > Zahlungen und Abos > Abos (https://play.google.com/store/account/subscriptions)',
        'Die Erstattung bereits gezahlter Beträge richtet sich nach der Erstattungsrichtlinie von Google Play und der des Betreibers. Fragen dazu richtest du an die oben genannte Kontaktadresse.',
      ],
    },
  ],
};

/**
 * Nutzungsbedingungen — Deutsch.
 *
 * 🔴 **Der koreanische Text ist maßgeblich** (`legal-text.ts`). Dies ist eine Übersetzung zur
 *   besseren Lesbarkeit; bei Abweichungen entscheidet das Koreanische. § 22 sagt das im
 *   Dokument selbst — erst dadurch ist die Veröffentlichung der Übersetzung überhaupt
 *   unbedenklich.
 *
 * ⚠ **Die Struktur muss exakt dem Koreanischen entsprechen** — 22 Paragrafen, je Paragraf
 *   dieselbe Zeilenzahl, und kein `pending`. `npm run check:legal` prüft das. Einen
 *   koreanischen Satz in zwei deutsche zu teilen lässt die Prüfung scheitern; zwei zu einem
 *   zusammenzuziehen verbirgt eine weggefallene Klausel.
 *
 * ⚠ Grundlage dieses Dokuments ist **Art. 13 Abs. 2 des koreanischen Gesetzes zum
 *   Verbraucherschutz im elektronischen Handel** — Information *vor* Vertragsschluss und
 *   schriftliche Fassung des Vertragsinhalts *danach*. Für Nr. 5 (Widerruf), Nr. 6
 *   (Erstattungen), Nr. 8 (Beschwerden und Streitigkeiten) und Nr. 9 (die Bedingungen selbst
 *   und wie man sie einsieht) gibt es kein anderes Gefäß. Jeder Paragraf trägt eine bestimmte
 *   Nummer, deshalb **darf kein Paragraf seinen rechtlichen Gehalt verlieren, nur damit er
 *   sich flüssiger liest.** Am schwersten wiegen drei:
 *
 *   - § 12 gibt Art. 17 Abs. 2 Nr. 5 und Abs. 6 der Sache nach wörtlich wieder. „wenn die
 *     Bereitstellung der digitalen Inhalte begonnen hat“, „derjenige Teil in Teilen
 *     bereitgestellter digitaler Inhalte, der noch nicht bereitgestellt worden ist“ und
 *     „weist auf diese Tatsache hin **und stellt zugleich** … als Probeprodukt zur
 *     Verfügung“ sind gesetzliche Voraussetzungen — wer sie verwischt, macht den Ausschluss
 *     unwirksam. ⚠ Das ist **koreanisches Recht**, nicht § 356 BGB: die Vorschriften nicht
 *     durch europäische ersetzen und die Nummerierung so lassen, wie sie ist.
 *   - § 20 Satz 1 ist der Schutz gegen Art. 35 (für Verbraucher nachteilige Vereinbarungen).
 *     **Niemals „soweit gesetzlich zulässig“** oder ähnliche Haftungsformeln ergänzen: das
 *     kehrt genau den Satz um, der geschrieben wurde, um so etwas abzulehnen. Deshalb steht
 *     dort „Verantwortung“ und nicht „Haftung“.
 *   - § 22 ist Art. 36 (ausschließliche Zuständigkeit) — der Wohnsitz **der Nutzerin bzw. des
 *     Nutzers**, nie der Sitz des Betreibers. Den Sitz zu nennen wäre nach Art. 35 unwirksam.
 *
 * ⚠ „청약철회“ heißt hier **„Widerruf des Angebots“**, nicht „Kündigung“. Jogak Pro *ist* ein
 *   Abo, und § 14 ist dessen Kündigung — die beiden dürfen in einem Dokument nicht
 *   zusammenfallen.
 */
export const TERMS_DE: LegalDoc = {
  title: 'Jogak Nutzungsbedingungen',
  sourceFingerprint: '898aa8d7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'Diese Nutzungsbedingungen regeln die Rechte, Pflichten und Verantwortlichkeiten zwischen Hwiseong Games (Marke: Vivace Games Studio, „der Betreiber“) und den Nutzerinnen und Nutzern in Bezug auf die Nutzung der mobilen Anwendung „Jogak“ („der Dienst“), die der Betreiber anbietet. Bitte lies sie, bevor du den Dienst nutzt.',
  sections: [
    {
      h: '§ 1 (Zweck und Anwendungsbereich)',
      body: [
        'Zweck dieser Nutzungsbedingungen ist es, die Bedingungen und Verfahren für die Nutzung des Dienstes sowie die Rechte und Pflichten des Betreibers und der Nutzerinnen und Nutzer festzulegen.',
        'Diese Nutzungsbedingungen gelten für alle Nutzerinnen und Nutzer des Dienstes. Sie gelten in gleicher Weise, wenn du nur Einträge schreibst, ohne dich anzumelden.',
        'Was in diesen Nutzungsbedingungen nicht geregelt ist, richtet sich nach den einschlägigen Vorschriften — darunter das Gesetz zum Verbraucherschutz im elektronischen Handel, das Gesetz zur Regelung allgemeiner Geschäftsbedingungen und das Gesetz zur Förderung der Inhalteindustrie — sowie nach der Handelsübung.',
      ],
    },
    {
      h: '§ 2 (Angaben zum Betreiber)',
      body: [
        'Firma: Hwiseong Games (Marke: Vivace Games Studio)',
        // ⚠ Dieselbe Schreibweise wie in `PRIVACY_DE` Abschnitt 11. Zwei Dokumente dürfen
        //   dieselbe Person nicht unterschiedlich benennen.
        'Vertretungsberechtigter: Son Hwi-seong',
        'Anschrift der Niederlassung: 204, 2F, 22 Seongan 5-gil, Jung-gu, Ulsan, 44421, Republic of Korea',
        'Telefon: +82 10-9926-0925',
        'E-Mail-Adresse: support@vivace-games.com',
        'Handelsregisternummer: 749-25-02260',
        'Anmeldenummer für das Fernabsatzgewerbe: 2026-Ulsan Jung-gu-0170 (Stelle, welche die Anmeldung entgegengenommen hat: Jung-gu, Metropolstadt Ulsan)',
      ],
    },
    {
      h: '§ 3 (Begriffsbestimmungen)',
      body: [
        '„Stück“ („Jogak“) bezeichnet einen einzelnen Tagebucheintrag, den eine Nutzerin bzw. ein Nutzer im Dienst schreibt.',
        '„Gerät“ bezeichnet ein Smartphone oder ein anderes Endgerät, auf dem der Dienst installiert und genutzt wird.',
        '„Jogak Pro“ bezeichnet das kostenpflichtige Abo mit wiederkehrender Zahlung, das Werbefreiheit, Backup und Wiederherstellung sowie KI-Zusammenfassungsberichte bietet.',
        '„Open Market“ bezeichnet einen App-Marktplatz wie Google Play, über den der Dienst vertrieben wird und über den kostenpflichtige Produkte bezahlt werden.',
      ],
    },
    {
      h: '§ 4 (Veröffentlichung und Änderung dieser Nutzungsbedingungen)',
      body: [
        'Der Betreiber veröffentlicht diese Nutzungsbedingungen im Dienst unter [Einstellungen] und unter der nachstehenden Adresse, damit sie jederzeit eingesehen werden können.',
        'https://sonwheesung.github.io/diary/terms.html',
        'Der Betreiber kann diese Nutzungsbedingungen ändern, soweit dies nicht gegen die einschlägigen Vorschriften verstößt.',
        'Bei einer Änderung nennt der Betreiber den Zeitpunkt des Inkrafttretens und den Grund der Änderung und weist ab 7 Tagen vor dem Inkrafttreten im Dienst darauf hin. Bei Änderungen, die für Nutzerinnen und Nutzer nachteilig sind, erfolgt der Hinweis jedoch ab 30 Tagen vor dem Inkrafttreten, wobei der Inhalt vor und nach der Änderung in leicht verständlicher Form gegenübergestellt wird.',
        'Wer den geänderten Nutzungsbedingungen nicht zustimmt, kann kostenpflichtige Leistungen vor dem Inkrafttreten kündigen und die Nutzung einstellen. Nutzt du den Dienst nach dem bekannt gegebenen Zeitpunkt des Inkrafttretens weiter, gilt das als Zustimmung zu den geänderten Nutzungsbedingungen.',
      ],
    },
    {
      h: '§ 5 (Inhalt des Dienstes)',
      body: [
        'Der vom Betreiber angebotene Dienst heißt „Jogak“; seiner Art nach ist er eine mobile Anwendung (digitale Inhalte) zum Schreiben und Aufbewahren eines Tagebuchs.',
        'Kostenlos angebotene Funktionen: Einträge schreiben, bearbeiten, löschen und durchsuchen, Fotos anhängen, Tags, Gefühle festhalten, Kalenderansicht, App-Sperre (PIN und Muster), dunkler Modus, mehrere Sprachen, Mitteilungen lesen und Kontakt.',
        'Über das kostenpflichtige Produkt „Jogak Pro“ angebotene Funktionen: Werbefreiheit, verschlüsseltes Backup und Wiederherstellung sowie KI-Zusammenfassungsberichte.',
        'Titel, Text, Fotos, Tags und Gefühle der Einträge, die du schreibst, werden ausschließlich im Inneren deines Geräts gespeichert und nicht an die Server des Betreibers übermittelt, solange du die Backup-Funktion nicht einschaltest.',
        'Ist das Backup eingeschaltet, werden die Einträge auf deinem Gerät verschlüsselt und erst dann übertragen; der Betreiber bewahrt den Entschlüsselungsschlüssel nicht auf und kann ihren Inhalt daher nicht lesen.',
        'Wird ein KI-Zusammenfassungsbericht erstellt, gelangt der Tagebuchtext des von dir angeforderten Zeitraums über den Server des Betreibers zum Anbieter künstlicher Intelligenz. Der Betreiber speichert diesen Text nicht. Einzelheiten richten sich nach der Datenschutzerklärung.',
      ],
    },
    {
      h: '§ 6 (Zustandekommen des Vertrags und Konten)',
      body: [
        'Der Vertrag über die Nutzung des Dienstes kommt zustande, indem du den Dienst installierst, diesen Nutzungsbedingungen zustimmst und den Dienst sodann nutzt.',
        'Kostenlose Funktionen, darunter das Schreiben von Einträgen, können ohne Konto genutzt werden.',
        'Kontakt, die Bezahlung kostenpflichtiger Produkte, Backup und Wiederherstellung sowie KI-Zusammenfassungsberichte setzen eine Anmeldung mit einem Google-Konto voraus.',
        'Du kannst dein Konto jederzeit im Dienst unter [Einstellungen] → [Kontakt] löschen. Wie die Löschung abläuft und welche Angaben gelöscht oder aufbewahrt werden, richtet sich nach der Anleitung zur Kontolöschung.',
      ],
    },
    {
      h: '§ 7 (Preis kostenpflichtiger Produkte und Zahlung)',
      body: [
        'Das Entgelt für Jogak Pro beträgt 3.900 KRW im Monat und 29.000 KRW im Jahr, jeweils einschließlich Mehrwertsteuer.',
        'Das Entgelt wird automatisch über das im Open Market hinterlegte Zahlungsmittel abgebucht, und zwar zu Beginn des Abos und danach an jedem Verlängerungstag.',
        'Über das Entgelt hinaus fallen für dich keine weiteren Kosten an. Die für die Nutzung des Dienstes erforderlichen Entgelte für die Datenübertragung richten sich jedoch nach den Bedingungen deines Mobilfunkanbieters und sind von dir zu tragen.',
        'Je nach Wechselkurs- und Gebührenpolitik des Open Market oder dessen länderspezifischer Preisgestaltung kann der tatsächlich berechnete Betrag von den obigen Beträgen abweichen. In diesem Fall gilt der auf dem Zahlungsbildschirm angezeigte Betrag.',
        'Erhöht der Betreiber das Entgelt, gibt er dies nach § 4 vorab bekannt; auf einen bereits bezahlten Abozeitraum wird der erhöhte Preis nicht angewendet.',
      ],
    },
    {
      h: '§ 8 (Beschränkungen der Verkaufsbedingungen)',
      body: [
        'Der Dienst kann nur in den Ländern genutzt werden, in denen der Open Market den Vertrieb zulässt; Installation und Bezahlung sind nur in den vom Betreiber bestimmten Vertriebsländern möglich.',
        'Ein kostenpflichtiges Abo ist zu jeder Zeit mit nur einem Konto verknüpft. Meldest du dich auf demselben Gerät mit einem anderen Google-Konto an, geht das Abo auf dieses Konto über und kann mit dem bisherigen Konto nicht mehr genutzt werden.',
        'Der Betreiber kann die Zahl der Nutzungen begrenzen, soweit dies zur Bereitstellung einzelner Funktionen des Dienstes erforderlich ist. Die Zahl der KI-Zusammenfassungsberichte, die erstellt werden können, ist je Zeitraum begrenzt; die jeweilige Grenze wird auf den Bildschirmen des Dienstes angezeigt.',
      ],
    },
    {
      h: '§ 9 (Zeitpunkt und Art der Bereitstellung)',
      body: [
        'Jogak Pro wird deinem Konto unmittelbar nach Abschluss der Zahlung zugewiesen; einen gesonderten Lieferweg gibt es nicht.',
        'Ist die Zahlung abgeschlossen, die Berechtigung aber nicht zugewiesen, kannst du im Dienst auf dem Bildschirm [Abo] die Funktion [Käufe wiederherstellen] nutzen oder dich auf dem Weg des § 21 an den Betreiber wenden.',
        'Der Abozeitraum läuft vom Tag der Zahlung bis zum Tag vor dem nächsten Verlängerungstag und verlängert sich, wenn er nicht gekündigt wird, automatisch um denselben Zeitraum.',
      ],
    },
    {
      h: '§ 10 (Nutzungsumgebung)',
      body: [
        'Der Dienst kann auf Android-Geräten genutzt werden und setzt mindestens die auf der Detailseite des Open Market angegebene Betriebssystemversion voraus.',
        'Grundfunktionen wie das Schreiben, Ansehen und Durchsuchen von Einträgen können ohne Internetverbindung genutzt werden.',
        'Mitteilungen lesen, Kontakt, Anmeldung, Bezahlung, Backup und Wiederherstellung sowie KI-Zusammenfassungsberichte setzen eine Internetverbindung voraus.',
        'Ist der Speicherplatz deines Geräts knapp oder liegt dessen Betriebssystem außerhalb des unterstützten Bereichs, können einzelne Funktionen nicht ordnungsgemäß arbeiten.',
      ],
    },
    {
      h: '§ 11 (Kostenlose Testphase und Übergang in ein kostenpflichtiges Abo)',
      body: [
        'Der Betreiber bietet für Jogak Pro eine kostenlose Testphase von 7 Tagen an.',
        'Endet die kostenlose Testphase, geht sie automatisch in ein kostenpflichtiges Abo mit wiederkehrender Zahlung über, und das Entgelt nach § 7 wird berechnet.',
        'Vor dem Übergang zeigt der Betreiber den Zeitpunkt des Übergangs, den Preis vor und nach der Änderung sowie die Zahlungsweise an und holt deine Zustimmung ein; ohne Zustimmung erfolgt keine Zahlung.',
        'Möchtest du nicht, dass dir während der kostenlosen Testphase etwas berechnet wird, kündige das Abo bitte vor Ablauf der Testphase auf dem Weg des § 14. Auch nach der Kündigung kannst du Jogak Pro bis zum Ende der Testphase weiter nutzen.',
      ],
    },
    {
      h: '§ 12 (Widerruf des Angebots)',
      body: [
        'Du kannst dein Angebot innerhalb von 7 Tagen ab dem Tag der Zahlung für ein kostenpflichtiges Produkt oder ab dem Tag widerrufen, an dem du die schriftliche Fassung des Vertragsinhalts erhalten hast.',
        'Der Widerruf erfolgt, indem du diese Absicht gegenüber der Anlaufstelle nach § 21 erklärst; der Betreiber teilt das Ergebnis innerhalb von 3 Geschäftstagen ab dem Tag des Eingangs mit.',
        'Ist der Widerruf erfolgt, erstattet der Betreiber das Entgelt nach § 13, und deine Berechtigung für Jogak Pro endet sofort.',
        'Nach Art. 17 Abs. 2 Nr. 5 des Gesetzes zum Verbraucherschutz im elektronischen Handel ist der Widerruf jedoch ausgeschlossen, wenn die Bereitstellung der digitalen Inhalte begonnen hat. Auch in diesem Fall bleibt der Widerruf für denjenigen Teil in Teilen bereitgestellter digitaler Inhalte möglich, der noch nicht bereitgestellt worden ist.',
        'Um diesen Ausschluss anwenden zu können, weist der Betreiber nach Abs. 6 desselben Artikels auf diese Tatsache hin und stellt zugleich die 7-tägige kostenlose Testphase nach § 11 als Probeprodukt zur Verfügung. Hat der Betreiber diese Maßnahmen nicht getroffen, kannst du ungeachtet des vorstehenden Ausschlusses widerrufen.',
        'Der Betreiber verlangt wegen eines Widerrufs weder eine Vertragsstrafe noch Schadensersatz.',
      ],
    },
    {
      h: '§ 13 (Erstattungen)',
      body: [
        'Da die Zahlung für kostenpflichtige Produkte über den Open Market erfolgt, richten sich auch Erstattungen grundsätzlich nach dem Erstattungsverfahren des Open Market.',
        'Du kannst die Erstattung unmittelbar beim Open Market oder über die Anlaufstelle nach § 21 beim Betreiber verlangen. Verlangst du sie beim Betreiber, bearbeitet dieser sie in Abstimmung mit dem Open Market.',
        'Der Betreiber erstattet das Entgelt innerhalb von 3 Geschäftstagen ab dem Tag, an dem ihn eine Widerrufserklärung oder eine vergleichbare Erklärung erreicht. Bis das Geld tatsächlich eingeht, kann es je nach Bearbeitungsplan des Open Market länger dauern.',
        'Verzögert der Betreiber die Erstattung ohne berechtigten Grund über diese Frist hinaus, zahlt er für die Dauer der Verzögerung zusätzlich Verzugszinsen, berechnet nach dem Zinssatz, den die Durchführungsverordnung zum Gesetz zum Verbraucherschutz im elektronischen Handel vorsieht.',
        'Ist bereits ein Zeitraum genutzt worden, kann der Betreiber den auf diesen Zeitraum entfallenden Betrag vor der Erstattung abziehen. Nicht abgezogen wird jedoch ein Zeitraum, in dem du den Dienst aus Gründen nicht nutzen konntest, die der Betreiber zu vertreten hat.',
        'Für eine Erstattung fällt keine gesonderte Gebühr an.',
      ],
    },
    {
      h: '§ 14 (Kündigung des Abos)',
      body: [
        'Du kannst das Abo jederzeit kündigen. Die Kündigung musst du selbst im Verwaltungsbildschirm für Abos des Open Market vornehmen; der Betreiber kann sie nicht an deiner Stelle vornehmen.',
        'Google Play: Store-App > Profil > Zahlungen und Abos > Abos (https://play.google.com/store/account/subscriptions)',
        'Auch nach der Kündigung kannst du Jogak Pro bis zum Ende des bereits bezahlten Abozeitraums weiter nutzen; ist dieser Zeitraum abgelaufen, endet die automatische Verlängerung.',
        'Das Löschen deines Kontos im Dienst kündigt das Abo im Open Market nicht. Kündigst du es nicht gesondert auf dem oben genannten Weg, wird dir weiterhin Geld berechnet.',
      ],
    },
    {
      h: '§ 15 (Verträge Minderjähriger)',
      body: [
        'Hat eine minderjährige Person ohne Zustimmung ihrer gesetzlichen Vertretung ein kostenpflichtiges Produkt bezahlt, können die minderjährige Person selbst oder ihre gesetzliche Vertretung diesen Vertrag aufheben.',
        'Eine Aufhebung ist jedoch ausgeschlossen, wenn die minderjährige Person mit Vermögen bezahlt hat, über das zu verfügen ihre gesetzliche Vertretung ihr gestattet hatte, oder wenn sie durch Täuschung den Eindruck erweckt hat, volljährig zu sein.',
        'Möchtest du eine Aufhebung, wende dich bitte an die Anlaufstelle nach § 21. Der Betreiber kann Unterlagen anfordern, aus denen sich die gesetzliche Vertretung ergibt.',
      ],
    },
    {
      h: '§ 16 (Pflichten der Nutzerinnen und Nutzer)',
      body: [
        'Nutzerinnen und Nutzer haben bei der Nutzung des Dienstes die einschlägigen Vorschriften und diese Nutzungsbedingungen einzuhalten.',
        'Nutzerinnen und Nutzer dürfen nicht das Konto anderer missbrauchen, den ordnungsgemäßen Betrieb des Dienstes stören, auf anderem als dem vom Betreiber vorgesehenen Weg auf den Dienst zugreifen oder dies versuchen oder den Zahlungsvorgang für kostenpflichtige Produkte manipulieren.',
        'Nutzerinnen und Nutzer haben ihre Kontoangaben sowie die PIN bzw. das Muster der App-Sperre selbst zu verwahren.',
        'Nutzerinnen und Nutzer haben den Wiederherstellungscode, der beim Einschalten der Backup-Funktion ausgegeben wird, sicher aufzubewahren. Geht der Wiederherstellungscode verloren, kann auch der Betreiber das Backup nicht entschlüsseln, und eine Wiederherstellung wird unmöglich.',
      ],
    },
    {
      h: '§ 17 (Aufbewahrung der Daten und Backup)',
      body: [
        'Das Original der Einträge, die du schreibst, wird auf deinem Gerät gespeichert. Löschst du die App oder setzt du das Gerät zurück, lassen sich die Einträge im Gerät nicht wiederherstellen.',
        'Ist die Backup-Funktion eingeschaltet, bewahrt der Betreiber eine verschlüsselte Kopie auf, die du mit deinem Wiederherstellungscode wiederherstellen kannst.',
        'Auch nach dem Ende eines Abos bewahrt der Betreiber das verschlüsselte Backup 90 Tage lang auf; in dieser Zeit bleibt die Wiederherstellung weiterhin nutzbar. Nach Ablauf der 90 Tage wird das Backup gelöscht.',
        'Der Betreiber verfügt über kein Mittel für Push-Mitteilungen; der Hinweis auf die bevorstehende Löschung erfolgt daher ausschließlich als Anzeige auf dem Bildschirm, wenn du die App öffnest.',
        'Löschst du dein Konto, wird das auf dem Server aufbewahrte verschlüsselte Backup ohne die 90-tägige Schonfrist zusammen mit dem Konto gelöscht.',
      ],
    },
    {
      h: '§ 18 (Rechte des geistigen Eigentums)',
      body: [
        'Die Rechte an den Einträgen, die du im Dienst schreibst, und an den Fotos, die du anhängst, liegen bei dir. Der Betreiber macht daran keinerlei Rechte geltend.',
        'Der Betreiber nutzt die Einträge der Nutzerinnen und Nutzer nicht zu anderen Zwecken als der Erbringung des Dienstes und insbesondere nicht zu Werbe-, Statistik- oder KI-Trainingszwecken.',
        'Die Rechte am Dienst selbst sowie an den darin enthaltenen Gestaltungen, Marken und Programmen liegen beim Betreiber oder bei den jeweils Berechtigten.',
        'Nutzerinnen und Nutzer dürfen den Dienst ohne vorherige Zustimmung des Betreibers nicht vervielfältigen, verbreiten oder zurückentwickeln.',
      ],
    },
    {
      h: '§ 19 (Änderung, Unterbrechung und Einstellung des Dienstes)',
      body: [
        'Der Betreiber kann den Inhalt des Dienstes ändern, um dessen Qualität zu verbessern. Wird der Inhalt eines kostenpflichtigen Produkts zum Nachteil der Nutzerinnen und Nutzer geändert, erfolgt die Bekanntgabe vorab nach § 4.',
        'Der Betreiber kann die Erbringung des Dienstes vorübergehend unterbrechen, wenn unabweisbare Gründe wie Wartung, Austausch oder Ausfall von Anlagen oder eine Unterbrechung der Telekommunikation vorliegen; in diesem Fall erfolgt die Bekanntgabe vorab. Liegen unabweisbare Gründe vor, die eine vorherige Bekanntgabe unmöglich machen, erfolgt sie nachträglich.',
        'Stellt der Betreiber den Dienst ein, gibt er dies mindestens 30 Tage vor dem Tag der Einstellung über Mitteilungen im Dienst und über die Detailseite des Open Market bekannt und weist zugleich auf den Zeitraum hin, in dem Backups heruntergeladen oder wiederhergestellt werden können.',
        'Bei Einstellung des Dienstes wird das Entgelt für einen bereits bezahlten, aber nicht genutzten Zeitraum erstattet.',
      ],
    },
    {
      h: '§ 20 (Verantwortung)',
      body: [
        'Der Betreiber trägt im Zusammenhang mit der Erbringung des Dienstes die nach den einschlägigen Vorschriften vorgesehene Verantwortung. Keine Bestimmung dieser Nutzungsbedingungen schließt eine gesetzlich vorgesehene Verantwortung des Betreibers aus oder beschränkt sie.',
        'Für Schäden aus Gründen, die der Betreiber nicht zu vertreten hat — etwa höhere Gewalt, Ausfall, Verlust oder Zurücksetzen deines Geräts oder der Verlust deines Wiederherstellungscodes oder des Geheimnisses deiner App-Sperre —, trägt der Betreiber keine Verantwortung.',
        'Ein KI-Zusammenfassungsbericht ist von künstlicher Intelligenz erzeugtes Material zur Orientierung und keine medizinische, psychologische oder rechtliche Diagnose oder Beratung. Der Betreiber gewährleistet die Richtigkeit seines Inhalts nicht.',
        'Für Schäden, die im Zahlungsvorgang über den Open Market aus Gründen entstehen, die der Open Market zu vertreten hat, gelten dessen Richtlinien. Der Betreiber leistet gleichwohl jede Mitwirkung, die zur Abhilfe für dich erforderlich ist.',
      ],
    },
    {
      h: '§ 21 (Verbraucherbeschwerden und Beilegung von Streitigkeiten)',
      body: [
        'Zur Bearbeitung von Rückmeldungen und Beschwerden betreibt der Betreiber im Dienst die Anlaufstelle [Einstellungen] → [Kontakt] sowie die nachstehende E-Mail-Anlaufstelle.',
        'E-Mail: support@vivace-games.com',
        'Hält der Betreiber eine Rückmeldung oder Beschwerde für berechtigt, bearbeitet er sie unverzüglich; nimmt die Bearbeitung Zeit in Anspruch, teilt er den Grund und den zeitlichen Ablauf mit.',
        'Kommt es zwischen dem Betreiber und einer Nutzerin bzw. einem Nutzer zu einer Streitigkeit, kann bei den folgenden Stellen eine Schlichtung beantragt werden.',
        '• Ausschuss für die Schlichtung von Verbraucherstreitigkeiten (Koreanische Verbraucherbehörde): 1372 (aus Korea) · https://www.kca.go.kr',
        '• Ausschuss für die Schlichtung von Streitigkeiten über Inhalte: 1588-2594 · https://www.kcdrc.kr',
        '• Ausschuss für die Schlichtung von Streitigkeiten im elektronischen Handel: 1661-5714 · https://www.ecmc.or.kr',
      ],
    },
    {
      h: '§ 22 (Anwendbares Recht und Gerichtsstand)',
      body: [
        'Auf diese Nutzungsbedingungen und auf die Nutzung des Dienstes ist das Recht der Republik Korea anzuwenden.',
        'Für Klagen aus Streitigkeiten zwischen dem Betreiber und einer Nutzerin bzw. einem Nutzer ist nach Art. 36 des Gesetzes zum Verbraucherschutz im elektronischen Handel ausschließlich das Bezirksgericht zuständig, in dessen Bezirk die Nutzerin bzw. der Nutzer zum Zeitpunkt der Klageerhebung ihren bzw. seinen Wohnsitz hat. Besteht kein Wohnsitz, ist ausschließlich das Bezirksgericht des Aufenthaltsorts zuständig; sind Wohnsitz oder Aufenthaltsort zum Zeitpunkt der Klageerhebung nicht feststellbar, bestimmt sich das zuständige Gericht nach dem Zivilprozessgesetz.',
        'Maßgeblich ist die koreanische Fassung dieser Nutzungsbedingungen. Weicht eine Übersetzung in eine andere Sprache im Sinngehalt ab, geht die koreanische Fassung vor.',
        'Schlussbestimmung: Diese Nutzungsbedingungen treten am 17. August 2026 in Kraft.',
      ],
    },
  ],
};
