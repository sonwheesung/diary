import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Datenschutzerklärung — Deutsch.
 *
 * 🔴 **Der koreanische Text ist maßgeblich.** Dies ist eine Übersetzung zur besseren
 *   Lesbarkeit; bei Abweichungen gilt `legal-text.ts` (Koreanisch).
 * ⚠ **Die Struktur muss exakt dem Koreanischen entsprechen** — gleiche Anzahl Abschnitte und
 *   Zeilen je Abschnitt. `npm run check:legal` prüft das.
 */
export const PRIVACY_DE: LegalDoc = {
  title: 'Datenschutzerklärung für Jogak',
  sourceFingerprint: 'e1010878',
  effective: '2026-08-09',
  updated: '2026-08-11',
  intro:
    'Vivace Games („der Betreiber“) hält das Gesetz zum Schutz personenbezogener Daten und weitere einschlägige Vorschriften ein und verarbeitet die personenbezogenen Daten der Nutzerinnen und Nutzer von „Jogak“ („der Dienst“) wie nachstehend beschrieben. Jogak sendet die von dir geschriebenen Tagebucheinträge an keinen Server und erhebt grundsätzlich nur die notwendigen Mindestangaben.',
  sections: [
    {
      h: '1. Was wir nicht erheben (vorab gesagt)',
      body: [
        'Der Betreiber erhebt die folgenden Angaben nicht und übermittelt sie nicht von deinem Gerät fort.',
        '• Titel, Text, Listen, Fotos, Tags und Gefühle der Einträge — sie verbleiben ausschließlich im internen Speicher deines Geräts.',
        '• PIN, Muster oder Hinweisantwort der App-Sperre — sie werden im sicheren Speicher des Geräts nur in nicht wiederherstellbarer Form (als Hash) abgelegt; das Original wird nirgends gespeichert.',
        '• Name, Geburtsdatum, Telefonnummer, Anschrift, Kontaktliste, Standort oder Aufzeichnungen über Zugriffe auf deine gesamte Fotomediathek.',
        'Fotos, die du in der App auswählst, werden lediglich in den app-eigenen Ordner auf deinem Gerät kopiert, damit sie in einen Eintrag eingefügt werden können; sie werden nirgendwohin übermittelt.',
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
        '※ Eine Anmeldung ist nur für „Kontakt“ nötig; Einträge schreiben, App-Sperre und alle anderen Funktionen benötigen sie nicht.',
        '※ Kinder unter 14 Jahren können die Anmeldefunktion nicht nutzen.',
        'b. Angaben, die bei der Auslieferung von Werbung automatisch erhoben werden',
        '• Werbe-ID (Android-Werbe-ID), Geräte- und Netzwerkinformationen, Aufzeichnungen über Einblendungen und Klicks',
        '• Diese Angaben erhebt Google (AdMob); Einzelheiten und die Widerspruchsmöglichkeit stehen in Abschnitt 7.',
      ],
    },
    {
      h: '3. Zwecke der Verarbeitung',
      body: [
        '• Entgegennahme und Bearbeitung von Anfragen: prüfen, was du gesendet hast, und Fehler erkennen und beheben',
        '• Identifizierung und Antwort: der anfragenden Person die Antwort zustellen und ihr die Einsicht in den eigenen Verlauf ermöglichen',
        '• Auslieferung von Werbung: Nutzerinnen und Nutzern der kostenlosen Version Werbung anzeigen und deren Leistung messen',
        'Der Betreiber verwendet personenbezogene Daten nicht für andere als die oben genannten Zwecke und holt bei einer Zweckänderung vorab die Einwilligung ein.',
      ],
    },
    {
      h: '4. Speicher- und Nutzungsdauer',
      body: [
        '• Kontoangaben (E-Mail-Adresse, Google „sub“): bis zur Löschung deines Kontos. Bei Löschung vernichten wir sie unverzüglich oder überführen sie in eine nicht rückverfolgbare Form.',
        '• Inhalt der Anfragen: 3 Jahre ab Eingang (Gesetz zum Verbraucherschutz im elektronischen Handel — Aufzeichnungen über Beschwerden oder Streitbeilegung)',
        '• Verhaltensdaten auf Basis der Werbe-ID: bis zu 1 Jahr ab Erhebung',
        'Nach Ablauf der Frist oder Erreichen des Zwecks vernichten wir die Daten unverzüglich.',
      ],
    },
    {
      h: '5. Weitergabe an Dritte',
      body: [
        'Der Betreiber gibt personenbezogene Daten der Nutzerinnen und Nutzer nicht an Dritte weiter.',
        'Ausgenommen sind Fälle, in denen eine besondere gesetzliche Vorschrift dies vorsieht oder eine Ermittlungsbehörde dies nach den gesetzlich vorgesehenen Verfahren und Formen verlangt.',
      ],
    },
    {
      h: '6. Auftragsverarbeitung und Übermittlung ins Ausland',
      body: [
        'Zur Erbringung des Dienstes lässt der Betreiber wie folgt verarbeiten; ein Teil davon erfolgt außerhalb Koreas.',
        '• Google LLC — Land: USA. Kontakt: https://support.google.com/policies/contact/general_privacy_form. Zweck: Auslieferung und Messung von Werbung (AdMob), Anmeldung mit Google-Konto. Daten: Werbe-ID, Geräte- und Netzwerkinformationen sowie bei der Anmeldung E-Mail-Adresse und Kontokennung. Wann und wie: Übermittlung über das Netz bei Werbeanfragen und bei der Anmeldung. Speicherdauer: gemäß der Datenschutzerklärung von Google',
        '• Supabase Inc. — Land: USA (Sitz der Gesellschaft). Kontakt: privacy@supabase.com. Zweck: Speicherung der Anfrage- und Kontoinformationen in einer Datenbank. Daten: die Angaben aus Abschnitt 2(a). Wann und wie: Übermittlung über das Netz beim Senden einer Anfrage. Speicherdauer: die Fristen aus Abschnitt 4. ※ Der physische Speicherort ist die Republik Korea (Region Seoul); da die betreibende Gesellschaft jedoch im Ausland sitzt, weisen wir dies als Übermittlung ins Ausland aus.',
        '• Vercel Inc. — Land: USA. Kontakt: privacy@vercel.com. Zweck: Betrieb des Servers, der Anfragen entgegennimmt. Daten: die Angaben aus Abschnitt 2(a). Wann und wie: Übermittlung über das Netz beim Senden einer Anfrage. Speicherdauer: bis zum Ende des Auftragsverhältnisses',
        'Du kannst der Übermittlung deiner Daten ins Ausland widersprechen. Für werbebezogene Übermittlungen deaktiviere personalisierte Werbung nach Abschnitt 7; für anfragebezogene genügt es, „Kontakt“ nicht zu nutzen (alle übrigen Funktionen, auch das Schreiben von Einträgen, bleiben vollständig nutzbar).',
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
        'Mehr dazu, wie Google personenbezogene Daten zu Werbezwecken verarbeitet: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Verfahren und Methode der Vernichtung',
      body: [
        'Verfahren: Personenbezogene Daten, deren Frist abgelaufen oder deren Zweck erreicht ist, werden unverzüglich vernichtet. Ist eine Aufbewahrung gesetzlich vorgeschrieben, werden sie für diese Dauer getrennt von anderen Daten aufbewahrt und danach vernichtet.',
        'Methode: Informationen in elektronischer Dateiform werden mit technischen Mitteln dauerhaft gelöscht, die eine Wiederherstellung oder Rekonstruktion ausschließen.',
        'Auf deinem Gerät gespeicherte Einträge, Fotos und Sperrinformationen werden entfernt, wenn du die Funktion „Alles zurücksetzen“ nutzt oder die App löschst. Der Betreiber besitzt diese Informationen nicht und kann sie daher nicht für dich löschen.',
      ],
    },
    {
      h: '9. Rechte der betroffenen Person und der gesetzlichen Vertretung sowie deren Ausübung',
      body: [
        'Du kannst jederzeit die folgenden Rechte ausüben.',
        '• Auskunft über deine Daten verlangen • bei Fehlern Berichtigung verlangen • Löschung verlangen • Einschränkung der Verarbeitung verlangen • Übermittlung deiner Daten verlangen (Gesetz zum Schutz personenbezogener Daten, Art. 35-2)',
        'Die Ausübung ist schriftlich oder per E-Mail über den Kontakt in Abschnitt 11 möglich; der Betreiber handelt unverzüglich.',
        'Verlangst du die Berichtigung eines Fehlers, verwenden wir die betreffenden Daten bis zum Abschluss der Berichtigung weder noch geben wir sie weiter.',
        'Die gesetzliche Vertretung eines Kindes unter 14 Jahren kann die vorstehenden Rechte in dessen Namen ausüben.',
      ],
    },
    {
      h: '10. Maßnahmen zur Gewährleistung der Sicherheit',
      body: [
        '• Organisatorisch: Zahl der mit personenbezogenen Daten befassten Personen möglichst gering halten und regelmäßig schulen',
        '• Technisch: Verwaltung der Zugriffsrechte auf das Verarbeitungssystem, Verschlüsselung bei der Übertragung (HTTPS), Speicherung des Sperrgeheimnisses als Hash und Nutzung des sicheren Gerätespeichers (Keystore/Keychain)',
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
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'Ab dem Tag, an dem die Version mit Monatsabo und Backup/Wiederherstellung veröffentlicht wird',
      summary:
        'Monatsabo sowie Backup/Wiederherstellung kommen hinzu. Bei einem Abo werden Abostatus und Transaktionskennung verarbeitet; und nur wenn du das Backup einschaltest, wird eine auf deinem Gerät verschlüsselte Kopie deiner Einträge auf dem Server des Betreibers gespeichert. Der Betreiber kann diese Kopie nicht entschlüsseln.',
      sections: [
        {
          h: 'a. Was sich ändert (vorher → nachher)',
          body: [
            'Vorher: Titel, Text und Fotos der Einträge werden nicht von deinem Gerät fort übermittelt.',
            'Nachher: **nur wenn du das Backup selbst einschaltest**, wird eine auf deinem Gerät verschlüsselte Kopie deiner Einträge auf dem Server des Betreibers gespeichert. Schaltest du es nicht ein, wird wie bisher kein einziges Zeichen übermittelt.',
            '⚠ Genau gesagt: Der Betreiber **speichert diese Kopie, kann sie aber nicht lesen.** Der Entschlüsselungsschlüssel existiert nur auf deinem Gerät und in dem Wiederherstellungscode, den du aufbewahrst; der Betreiber hat ihn nicht.',
          ],
        },
        {
          h: 'b. Zusätzlich gespeicherte Angaben, wenn du das Backup einschaltest',
          body: [
            '• Eine verschlüsselte Kopie deiner Einträge — in einer Form, die der Betreiber nicht entschlüsseln kann',
            '• Backup-Kennung, Backup-Zeitpunkt, Generationsnummer und Größe — **diese Angaben sind nicht verschlüsselt.** Der Betreiber kann erkennen, welches Konto wann wie viel gesichert hat.',
            '• Rechtsgrundlage: deine gesonderte Einwilligung (eingeholt auf dem Bildschirm, auf dem du das Backup einschaltest)',
          ],
        },
        {
          h: 'c. Speicherdauer',
          body: [
            '• Gespeichert, solange das Backup eingeschaltet ist, und bis zu 90 Tage nach Ende des Abos; danach automatische Vernichtung.',
            '• Schaltest du das Backup aus, verlangst du die Löschung oder löschst du dein Konto, vernichten wir es unverzüglich, ohne die 90 Tage abzuwarten.',
            '• Backups ohne Zugriff seit 3 Jahren oder länger werden vernichtet. (Das betrifft den Fall, dass die App gelöscht, das Konto aber nicht gelöscht wurde.)',
            '• Die Aufzeichnung der Vernichtung (Backup-Kennung und Zeitpunkt) wird 1 Jahr aufbewahrt — damit du herausfinden kannst, „warum die Wiederherstellung nicht funktioniert“; die Kontokennung wird nicht mit aufbewahrt.',
            '⚠ Der Hinweis auf ein abgelaufenes Abo erreicht dich nur auf dem Bildschirm, wenn du die App öffnest. Öffnest du sie nicht, erreicht dich dieser Hinweis möglicherweise nicht.',
          ],
        },
        {
          h: 'd. Grenzen des Auskunftsrechts',
          body: [
            'Verlangst du Auskunft über dein Backup, kann der Betreiber dir nur **den nicht entschlüsselbaren Chiffretext und die Metadaten aus (b)** herausgeben. Deine Einträge in menschenlesbarer Form können wir nicht bereitstellen — der Betreiber hat den Schlüssel nicht.',
            'Du selbst kannst jederzeit in der App mit deinem Wiederherstellungscode wiederherstellen.',
            '⚠ Verlierst du den Wiederherstellungscode, gibt es keine Möglichkeit, das Backup zu öffnen. Auch der Betreiber kann es nicht für dich öffnen.',
          ],
        },
        {
          h: 'e. Angaben, die bei Nutzung eines Abos gespeichert werden',
          body: [
            '• Abostatus — Berechtigungsschlüssel, Ablaufzeitpunkt, Kulanzfrist bei Zahlungsfehlern, ob eine Verlängerung ansteht',
            '• Die vom Store ausgestellte Transaktionskennung, die Produktkennung und die Unterscheidung der Zahlungsumgebung (Produktion/Test)',
            '• Vom Zahlungsdienst übermittelte Aufzeichnungen über Statusänderungen (Kauf, Verlängerung, Kündigung, Erstattung usw.) und deren Originalinhalt',
            '⚠ Zahlungsdaten wie Kreditkarten- oder Kontonummern verarbeitet Google Play; sie werden nicht an den Betreiber weitergegeben. Der Betreiber erfährt nur, dass du bezahlt hast und bis wann das Abo gültig ist.',
            '• Rechtsgrundlage: Gesetz zum Schutz personenbezogener Daten, Art. 15 Abs. 1 Nr. 4 (erforderlich zur Durchführung der verlangten Maßnahme, also zur Bereitstellung der beantragten Aboberechtigung)',
            '• Zweck: Prüfung der Aboberechtigung (Werbefreiheit, Nutzung des Backups), Bearbeitung von Zahlungsanfragen und Erstattungen',
          ],
        },
        {
          h: 'f. Speicherdauer der Aboangaben',
          body: [
            '• Aufzeichnungen über Verträge oder Widerruf sowie über Zahlung und Lieferung von Waren: 5 Jahre (Gesetz zum Verbraucherschutz im elektronischen Handel, Art. 6)',
            '• Löschst du dein Konto, werden die Kontokennungen (E-Mail, Google „sub“) unverzüglich in eine nicht rückverfolgbare Form überführt; die obigen Transaktionsaufzeichnungen werden für die genannte Dauer getrennt und in nicht rückverfolgbarer Form aufbewahrt und danach vernichtet.',
            '⚠ Das Löschen deines Kontos kündigt dein Google-Play-Abo nicht automatisch. Du musst es selbst unter Google Play > Abos kündigen; andernfalls wird dir weiterhin Geld berechnet.',
          ],
        },
        {
          h: 'g. Auftragsverarbeitung und Übermittlung ins Ausland (ergänzend)',
          body: [
            '• Supabase Inc. — Land: USA (Sitz der Gesellschaft). Kontakt: privacy@supabase.com. Zweck: Speicherung der verschlüsselten Backup-Kopie und des Abostatus. Daten: die Angaben aus (b) und (e). Speicherdauer: die Fristen aus (c) und (f). ※ Der physische Speicherort ist die Republik Korea (Region Seoul).',
            '• Vercel Inc. — Land: USA. Kontakt: privacy@vercel.com. Zweck: Betrieb des Backup-Servers. ※ Die verschlüsselte Kopie geht direkt an den Speicher, ohne diesen Server zu passieren.',
            '• RevenueCat, Inc. — Land: USA. Kontakt: compliance@revenuecat.com. Zweck: Prüfung der Abozahlungen und des Abostatus. Daten: Kontokennung, Transaktions- und Produktkennungen des Stores, Geräte- und App-Informationen. Wann und wie: Übermittlung über das Netz beim Öffnen des Abo-Bildschirms und beim Bezahlen. Speicherdauer: bis zum Ende des Auftragsverhältnisses',
            '• Google LLC — zusätzlich zu der in Abschnitt 6 beschriebenen Übermittlung werden Store-Transaktionsdaten zur Abwicklung und Prüfung der Abozahlungen verarbeitet.',
            'Du kannst der Übermittlung ins Ausland widersprechen. Schaltest du das Backup nicht ein und schließt du kein Abo ab, finden die genannten Übermittlungen nicht statt, und alle übrigen Funktionen, auch das Schreiben von Einträgen, bleiben vollständig nutzbar.',
          ],
        },
      ],
    },
    {
      appliesFrom:
        'Ab dem Tag, an dem die Version mit KI-Zusammenfassungsberichten veröffentlicht wird',
      summary:
        'KI-Zusammenfassungsberichte kommen hinzu. Nur wenn du selbst einen Bericht erstellst, läuft der Inhalt deiner Einträge aus diesem Zeitraum unverschlüsselt über den Server des Betreibers und wird an den KI-Anbieter übermittelt. Der Betreiber speichert diesen Inhalt nicht; der KI-Anbieter bewahrt ihn bis zu 30 Tage zur Missbrauchskontrolle auf, löscht ihn dann und nutzt ihn nicht für das Modelltraining.',
      sections: [
        {
          h: 'a. Was sich ändert (vorher → nachher)',
          body: [
            'Vorher: Titel und Text der Einträge werden nicht von deinem Gerät fort übermittelt. Auch bei eingeschaltetem Backup werden sie nur als Chiffretext übermittelt, den der Betreiber nicht lesen kann.',
            'Nachher: **nur wenn du selbst auf „Bericht erstellen“ tippst**, wird der Inhalt der Einträge dieses Zeitraums **unverschlüsselt** über den Server des Betreibers an den KI-Anbieter übermittelt, und eine Zusammenfassung wird erzeugt.',
            '⚠ Genau gesagt: Der Betreiber **speichert** diesen Inhalt **nicht.** Doch in dem Moment, in dem die Zusammenfassung entsteht, läuft der Inhalt über den Server des Betreibers — wir können dir daher nicht sagen, „der Betreiber kann ihn nicht sehen“. Wir sagen das klar, statt es zu verwischen.',
            'Erstellst du keinen Bericht, findet diese Übermittlung überhaupt nicht statt, und alle übrigen Funktionen, auch das Schreiben von Einträgen, bleiben vollständig nutzbar.',
          ],
        },
        {
          h: 'b. Gesonderte Einwilligung für sensible Daten',
          body: [
            'Tagebücher können sensible Daten im Sinne von Art. 23 des Gesetzes zum Schutz personenbezogener Daten enthalten, etwa zu Gesundheit oder seelischem Zustand.',
            'Da KI-Zusammenfassungsberichte diesen Inhalt unverschlüsselt verarbeiten, holen wir bei der ersten Nutzung der Funktion eine **gesonderte Einwilligung für die Verarbeitung sensibler Daten** ein. Diese Einwilligung ist von der Einwilligung zur Übermittlung ins Ausland unter (c) **unabhängig**; beide können einzeln gewählt werden.',
            'Willigst du nicht ein, kannst du weiterhin alle Funktionen außer den KI-Berichten nutzen.',
          ],
        },
        {
          h: 'c. Gesonderte Einwilligung für die Übermittlung ins Ausland',
          body: [
            'Der KI-Anbieter sitzt außerhalb Koreas. Name des Anbieters, Empfängerland und Kontaktdaten werden zum Zeitpunkt der Freigabe der Funktion in diesem Punkt angegeben und vor der Einholung der Einwilligung auch in der App gezeigt.',
            '• Übermittelte Daten: Titel, Text, Gefühl und Datum der Einträge des Zeitraums, für den du einen Bericht angefordert hast',
            '• Zweck: Erstellung des Zusammenfassungsberichts',
            '• Wann und wie: Übermittlung über das Netz, wenn du auf „Bericht erstellen“ tippst',
            '• Speicherdauer: Der Server des Betreibers **speichert nichts** — er hält den Inhalt nur im Arbeitsspeicher, solange die Zusammenfassung entsteht, und verwirft ihn danach. Der KI-Anbieter bewahrt ihn **bis zu 30 Tage** zur Missbrauchskontrolle auf und löscht ihn dann; auch in dieser Zeit **nutzt er ihn nicht für das Modelltraining.**',
            'Du kannst der Übermittlung ins Ausland widersprechen; dann sind nur die KI-Berichte nicht verfügbar, alle übrigen Funktionen laufen weiter.',
          ],
        },
        {
          h: 'd. Was der Betreiber speichert (und was nicht der Inhalt der Einträge ist)',
          body: [
            'Den Inhalt der Einträge speichern wir nicht, wohl aber Folgendes.',
            '• Die Kennung des Kontos, das den Bericht erstellt hat, den Zeitraum, die Anzahl der Male und die Zahl der verbrauchten Token — für Abrechnung und Missbrauchsprävention.',
            '• Speicherdauer: bis der Zweck erreicht ist oder bis du dein Konto löschst',
            'Der Text des fertigen Berichts wird **nur auf deinem Gerät** gespeichert und ist bei eingeschaltetem Backup verschlüsselt darin enthalten.',
          ],
        },
        {
          h: 'e. Deine Rechte',
          body: [
            '• Berichte entstehen nur, wenn du sie selbst erstellst; automatisch werden sie nie erzeugt.',
            '• Einen erstellten Bericht kannst du jederzeit in der App löschen.',
            '• Von KI erzeugte Zusammenfassungen können von den Tatsachen abweichen und sind weder eine medizinische oder psychologische Diagnose noch eine Beratung. Die App bietet eine Möglichkeit, eine Zusammenfassung zu melden.',
          ],
        },
      ],
    },
  ],
};
