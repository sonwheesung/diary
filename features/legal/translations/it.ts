import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Informativa sulla privacy — italiano.
 *
 * 🔴 **Il testo coreano fa fede.** Questa è una traduzione di cortesia; in caso di difformità
 *   prevale `legal-text.ts` (coreano).
 * ⚠ **La struttura deve coincidere esattamente con quella coreana** — stesso numero di sezioni
 *   e di righe in ciascuna. `npm run check:legal` lo verifica.
 *
 * ⚠ **Backup e IA dicono frasi opposte** e non vanno mai fuse in una sola:
 *     backup = conservato ma illeggibile → «lo conserviamo ma non possiamo leggerlo»
 *     IA     = letto ma non conservato  → «non lo conserviamo», e mai «non possiamo vederlo»
 *   La sezione 1 enuncia questa differenza di proposito: non va attenuata traducendo.
 *
 * ⚠ Ogni durata va tradotta indicando **da quando decorre e fino a quando** (90 giorni,
 *   30 giorni, 5 anni, 3 anni, 1 anno). Un «prima» o un «poi» senza termine di riferimento
 *   rende la clausola inapplicabile.
 */
export const PRIVACY_IT: LegalDoc = {
  title: 'Informativa sulla privacy di Jogak',
  sourceFingerprint: '4a69870e',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Vivace Games Studio (“il gestore”) rispetta la Legge sulla protezione delle informazioni personali e le altre norme applicabili e tratta i dati personali delle persone che usano “Jogak” (“il servizio”) come indicato di seguito. Per principio Jogak conserva sul tuo dispositivo le voci di diario che scrivi, e le invia a un server soltanto per il backup che attivi tu e per i report di sintesi con IA che crei tu. Per il resto raccoglie soltanto le informazioni minime necessarie.',
  sections: [
    {
      h: '1. Dove sono conservate le voci di diario (lo diciamo per primo)',
      body: [
        'Le voci (titoli, testo, elenchi, foto, tag ed emozioni) sono conservate nella memoria interna del tuo dispositivo e, in linea di principio, non escono da esso.',
        '⚠ Esistono però due eccezioni, e solo se le scegli tu. Nessuna delle due avviene automaticamente.',
        '• Se attivi il backup — una copia delle tue voci, cifrata sul tuo dispositivo, è conservata sul server del gestore. Il gestore non può leggere quella copia. I dettagli sono alla sezione 2(c).',
        '• Se crei un report di sintesi con IA — il contenuto delle voci di quel periodo transita non cifrato attraverso il server del gestore ed è inviato al fornitore di IA. Il gestore non conserva quel contenuto. I dettagli sono alla sezione 2(e).',
        '⚠ Le due frasi qui sopra dicono cose diverse. Il backup lo conserviamo ma non possiamo leggerlo; il contenuto per il report con IA lo leggiamo ma non lo conserviamo. Lo diciamo chiaramente, senza attenuarlo.',
        'Il gestore non raccoglie in nessun caso le informazioni seguenti e non le trasmette fuori dal tuo dispositivo.',
        '• Il PIN, la sequenza o la risposta del suggerimento del blocco app — restano nella memoria sicura del dispositivo solo in forma non recuperabile (un hash); l’originale non è conservato da nessuna parte.',
        '• Il tuo nome, la data di nascita, il numero di telefono, l’indirizzo, la rubrica, la posizione, né alcun registro di accesso all’intera libreria foto.',
        'Le foto che scegli nell’app vengono copiate nella cartella dedicata dell’app sul tuo dispositivo per poterle inserire in una voce e, se non attivi il backup, non vengono trasmesse all’esterno. Ai report di sintesi con IA non viene trasmessa alcuna foto.',
      ],
    },
    {
      h: '2. Dati personali che raccogliamo',
      body: [
        'a. Quando usi “Contatti” (è necessario accedere)',
        '• Obbligatori: l’indirizzo e-mail del tuo account Google e l’identificatore univoco dell’account social (il “sub” di Google)',
        '  — Base giuridica: Legge sulla protezione delle informazioni personali, art. 15(1)4 (necessario per eseguire le misure richieste dalla persona, ossia rispondere alla sua richiesta)',
        '  — Finalità: identificare chi scrive, inviare la risposta e permetterti di consultare il tuo storico',
        '• Categoria e contenuto della richiesta',
        '• Tipo di dispositivo (Android/iOS) e versione dell’app — per capire in quale ambiente si è verificato il problema',
        '※ L’accesso serve per “Contatti”, per l’abbonamento, per il backup e per i report con IA; scrivere voci, il blocco app e le altre funzioni non lo richiedono.',
        '※ Al primo avvio dell’app ti chiediamo il tuo anno di nascita. Se non raggiungi la soglia, non sono disponibili né l’accesso né la raccolta dell’identificativo del dispositivo di cui alla lettera f che segue; scrivere voci, il blocco dell’app e tutte le altre funzioni restano pienamente utilizzabili.',
        '※ La soglia è di 16, 14 o 13 anni a seconda della regione (14 nella Repubblica di Corea); se non è determinabile si applica quella più alta. L’anno di nascita indicato serve solo a questa decisione e non viene né conservato né trasmesso.',
        'b. Informazioni raccolte automaticamente durante la pubblicazione degli annunci',
        '• Identificatore pubblicitario (ID pubblicità Android), informazioni su dispositivo e rete, registri di impressioni e clic',
        '• Quanto sopra è raccolto da Google (AdMob); i dettagli e come opporsi sono nella sezione 7.',
        'c. Se attivi il backup (è necessario l’abbonamento)',
        '• Una copia cifrata delle tue voci — in una forma che il gestore non può decifrare',
        '• Identificatore del backup, ora del backup, numero di generazione e dimensione — queste informazioni non sono cifrate. Il gestore può sapere quale account ha eseguito il backup, quando e di quale dimensione.',
        '  — Base giuridica: il tuo consenso specifico (raccolto nella schermata in cui attivi il backup)',
        '⚠ Per essere precisi: il gestore conserva quella copia ma non può leggerla. La chiave di decifratura esiste solo sul tuo dispositivo e nel codice di recupero che custodisci tu; il gestore non la possiede.',
        '⚠ Se perdi il codice di recupero non esiste alcun modo di aprire il backup. Nemmeno il gestore può aprirlo per te.',
        'd. Se usi un abbonamento',
        '• Stato dell’abbonamento — chiave del diritto, scadenza, periodo di tolleranza per pagamenti non riusciti, se è previsto il rinnovo',
        '• L’identificatore di transazione rilasciato dallo store, l’identificatore del prodotto e la distinzione dell’ambiente di pagamento (produzione/test)',
        '• I registri di variazione dello stato dell’abbonamento inviati dal servizio di pagamento (acquisto, rinnovo, disdetta, rimborso ecc.) e il loro contenuto originale',
        '  — Base giuridica: Legge sulla protezione delle informazioni personali, art. 15(1)4 (necessario per eseguire le misure richieste, ossia fornire il diritto di abbonamento richiesto)',
        '  — Finalità: verificare il diritto di abbonamento (rimozione degli annunci, uso del backup, uso dei report con IA), gestire richieste di pagamento e rimborsi',
        '⚠ I dati di pagamento come numeri di carta o di conto sono gestiti da Google Play e non vengono trasmessi al gestore. Il gestore può sapere solo che hai pagato e fino a quando l’abbonamento è valido.',
        'e. Se crei report di sintesi con IA (è necessario l’abbonamento)',
        '• Ciò che transita per il server del gestore ed è inviato al fornitore di IA: titolo, testo, emozione e data delle voci del periodo per cui hai richiesto un report',
        '• Ciò che il gestore conserva: la sintesi generata dall’IA, l’identificativo dell’account che ha creato il report, il periodo, il numero di volte e il numero di token utilizzati',
        '⚠ Per essere precisi: il gestore non conserva il contenuto del diario in sé. Tuttavia ① nel momento in cui la sintesi viene prodotta il contenuto transita nel server del gestore, quindi non possiamo dirti che «il gestore non può vederlo», e ② la sintesi generata è conservata per 90 giorni. Lo diciamo chiaramente, senza attenuarlo.',
        '⚠ La sintesi è scritta a partire dal tuo diario, quindi può contenerne il contenuto.',
        '• Consenso specifico per le informazioni sensibili: un diario può contenere informazioni sensibili, come lo stato di salute o psicologico, ai sensi dell’art. 23 della Legge sulla protezione delle informazioni personali. Poiché i report di sintesi con IA trattano tale contenuto non cifrato, al primo utilizzo della funzione raccogliamo un consenso specifico al trattamento di informazioni sensibili. Questo consenso è distinto dal consenso al trasferimento all’estero di cui alla sezione 6, e puoi sceglierli separatamente.',
        'Anche senza il consenso, tutte le funzioni diverse dai report con IA restano pienamente disponibili. I report sono generati soltanto quando li crei tu e non vengono mai prodotti automaticamente.',
        'f. Quando avvii l’app (con o senza accesso effettuato)',
        '• Identificativo del dispositivo — un valore casuale creato sul tuo dispositivo al primo avvio dell’app. Non è un numero di serie dell’apparecchio né un identificativo pubblicitario e scompare quando disinstalli l’app.',
        '  — Base giuridica: articolo 15(1)6 della Legge sulla protezione dei dati personali (legittimo interesse a gestire e migliorare il servizio)',
        '  — Finalità: statistiche di utilizzo del servizio (quante persone usano l’app e in quanti giorni)',
        '※ Da questo valore non è possibile sapere chi sei e non viene collegato al contenuto delle tue voci.',
        '※ Se non raggiungi la soglia di età sopra indicata, questo valore non viene né creato né trasmesso.',
      ],
    },
    {
      h: '3. Finalità del trattamento',
      body: [
        '• Statistiche di utilizzo del servizio: contare quante persone usano l’app e in quanti giorni e impiegarlo per gestire e migliorare il servizio',
        '• Ricezione e gestione delle richieste: esaminare ciò che hai inviato e individuare e correggere i malfunzionamenti',
        '• Identificazione e risposta: recapitarti la risposta e permetterti di rivedere il tuo storico',
        '• Pubblicazione di annunci: mostrare pubblicità a chi usa la versione gratuita e misurarne il rendimento',
        '• Backup e ripristino: se lo hai attivato, conservare la copia cifrata delle tue voci e restituirtela su tua richiesta',
        '• Verifica del diritto di abbonamento: fornire a chi ha pagato la rimozione degli annunci, il backup e i report con IA, e gestire richieste di pagamento e rimborsi',
        '• Creazione dei report di sintesi con IA e miglioramento della qualità: produrre la sintesi del periodo che hai richiesto e, esaminandone il risultato, migliorarne la qualità',
        'Il gestore non usa i dati personali per finalità diverse da quelle sopra indicate e, in caso di cambio di finalità, acquisirà il consenso in anticipo.',
      ],
    },
    {
      h: '4. Periodi di conservazione e uso',
      body: [
        '• Dati dell’account (indirizzo e-mail, “sub” di Google): fino all’eliminazione dell’account. All’eliminazione li distruggiamo senza indugio o li rendiamo non tracciabili.',
        '• Contenuto delle richieste: 3 anni dalla ricezione (Legge sulla tutela dei consumatori nel commercio elettronico — registri su reclami o composizione delle controversie)',
        '• Dati comportamentali basati sull’identificatore pubblicitario: fino a 1 anno dalla raccolta',
        '• Identificativo del dispositivo e registro dei giorni di utilizzo: 400 giorni dall’ultimo giorno di utilizzo. Successivamente eliminati automaticamente.',
        '• Copia di backup cifrata: conservata finché il backup resta attivo e fino a 90 giorni dopo la fine dell’abbonamento, poi distrutta automaticamente. Se disattivi il backup, ne chiedi la cancellazione o elimini il tuo account, la distruggiamo senza indugio, senza attendere quei 90 giorni. I backup a cui non si accede da 3 anni o più vengono distrutti (riguarda chi ha disinstallato l’app senza eliminare l’account).',
        '• Registro dell’avvenuta distruzione di un backup (identificatore del backup e ora della distruzione): 1 anno dalla distruzione — perché tu possa capire “perché il ripristino non funziona”; l’identificatore dell’account non viene conservato insieme.',
        '• Sintesi generata dall’IA: 90 giorni dal giorno della creazione. Trascorsi i quali viene eliminata automaticamente.',
        '• Registri di utilizzo dei report (identificatore dell’account, periodo, numero di volte, numero di token): fino al raggiungimento della finalità o fino all’eliminazione dell’account',
        '• Registri su contratti o recesso e su pagamento e fornitura di beni: 5 anni (Legge sulla tutela dei consumatori nel commercio elettronico, art. 6)',
        'Se elimini l’account, gli identificatori dell’account (e-mail, “sub” di Google) sono resi non tracciabili senza indugio, e i registri delle transazioni sopra indicati sono conservati separatamente e in forma non tracciabile per il periodo indicato e poi distrutti.',
        '⚠ L’eliminazione dell’account non annulla automaticamente il tuo abbonamento Google Play. Devi annullarlo tu in Google Play > Abbonamenti; in caso contrario continuerai a essere addebitato.',
        '⚠ L’avviso della cancellazione del backup dovuta alla scadenza dell’abbonamento ti raggiunge solo a schermo, quando apri l’app. Se non la apri, quell’avviso potrebbe non raggiungerti.',
        'Trascorso il periodo o raggiunta la finalità, distruggiamo i dati senza indugio.',
      ],
    },
    {
      h: '5. Comunicazione a terzi',
      body: [
        'Il gestore non comunica a terzi i dati personali delle persone che usano il servizio.',
        'Le società indicate nella sezione 6 trattano i dati per conto del gestore e non li usano per finalità proprie. Il fornitore di IA non utilizza il contenuto del diario che riceve per addestrare i modelli.',
        'Fanno eccezione i casi in cui vi sia una specifica previsione di legge o in cui un’autorità inquirente lo richieda secondo le procedure e le forme previste dalla legge.',
      ],
    },
    {
      h: '6. Esternalizzazione del trattamento e trasferimento all’estero',
      body: [
        'Per erogare il servizio il gestore esternalizza il trattamento come segue, e una parte avviene fuori dalla Corea.',
        '• Google LLC — Paese: Stati Uniti. Contatto: https://support.google.com/policies/contact/general_privacy_form. Finalità: pubblicazione e misurazione degli annunci (AdMob), accesso con account Google, elaborazione e verifica dei pagamenti dell’abbonamento. Dati: identificatore pubblicitario, informazioni su dispositivo e rete, all’accesso indirizzo e-mail e identificatore dell’account, e dati di transazione dello store. Quando e come: trasmessi in rete alla richiesta di un annuncio, all’accesso e al pagamento. Conservazione: secondo l’informativa privacy di Google',
        '• Supabase Inc. — Paese: Stati Uniti (sede legale). Contatto: privacy@supabase.com. Finalità: conservare in banca dati le informazioni su richieste e account, nonché la copia di backup cifrata e lo stato dell’abbonamento. Dati: quelli delle sezioni 2(a), 2(c) e 2(d). Quando e come: trasmessi in rete all’invio di una richiesta e all’esecuzione del backup. Conservazione: i periodi della sezione 4. ※ Il luogo fisico di archiviazione è la Repubblica di Corea (regione di Seoul), ma lo indichiamo come trasferimento all’estero perché la società che opera ha sede fuori dalla Corea.',
        '• Vercel Inc. — Paese: Stati Uniti. Contatto: privacy@vercel.com. Finalità: gestire il server che riceve le richieste e i server di backup e di IA. Dati: quelli della sezione 2(a). Quando e come: trasmessi in rete all’invio di una richiesta. Conservazione: fino al termine del contratto di esternalizzazione. ※ La copia di backup cifrata viene inviata direttamente all’archivio senza passare da questo server.',
        '• RevenueCat, Inc. — Paese: Stati Uniti. Contatto: compliance@revenuecat.com. Finalità: verificare i pagamenti dell’abbonamento e controllarne lo stato. Dati: identificatore dell’account, identificatori di transazione e prodotto dello store, informazioni su dispositivo e app. Quando e come: trasmessi in rete all’apertura della schermata di abbonamento e al pagamento. Conservazione: fino al termine del contratto di esternalizzazione',
        '• OpenAI OpCo, LLC — Paese: Stati Uniti (1455 Third Street, San Francisco, California 94158, USA). Contatto: dpo@openai.com. Finalità: generare un report di sintesi. Dati: titolo, testo, emozione e data delle voci del periodo per cui hai richiesto un report. Quando e come: trasmessi in rete nel momento in cui premi Crea report. Conservazione: il server del gestore non conserva il contenuto del diario — resta in memoria solo mentre la sintesi viene prodotta e viene scartato subito dopo. Il fornitore di IA lo conserva per un massimo di 30 giorni per il monitoraggio degli abusi e poi lo elimina, e anche in tale periodo non lo utilizza per addestrare i modelli.',
        '⚠ Il trasferimento all’estero per i report con IA richiede un consenso specifico. Al primo utilizzo della funzione ti mostriamo le stesse informazioni dentro l’app e raccogliamo il tuo consenso; questo consenso è distinto dal consenso sulle informazioni sensibili di cui alla sezione 2(e).',
        'Puoi opporti al trasferimento all’estero dei tuoi dati. Per opporti ai trasferimenti legati alla pubblicità, disattiva gli annunci personalizzati secondo la sezione 7; i trasferimenti legati alle richieste non avvengono se non usi “Contatti”. Se non attivi il backup, non ti abboni e non crei report, i trasferimenti collegati non avvengono, e tutte le altre funzioni, compresa la scrittura delle voci, restano disponibili.',
      ],
    },
    {
      h: '7. Identificatori pubblicitari e altri strumenti di raccolta automatica, e come opporsi',
      body: [
        'Il servizio usa Google AdMob per mostrare annunci a chi usa la versione gratuita. AdMob può raccogliere e usare un identificatore pubblicitario per offrire annunci personalizzati.',
        'Finalità della raccolta: offrire annunci personalizzati, misurarne il rendimento e prevenire i clic fraudolenti',
        'Come opporsi (Android): Impostazioni > Privacy > Annunci > “Elimina ID pubblicità” oppure “Disattiva la personalizzazione degli annunci”',
        'Come opporsi (iOS): Impostazioni > Privacy e sicurezza > Tracciamento > disattiva “Consenti alle app di richiedere il tracciamento”',
        'Anche opponendoti, gli annunci potrebbero continuare a comparire, ma saranno annunci generici non basati sui tuoi interessi.',
        'Se ti abboni non ti vengono mostrati annunci, e la raccolta pubblicitaria sopra descritta non avviene.',
        'Maggiori informazioni su come Google tratta i dati personali a fini pubblicitari: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Procedura e modalità di distruzione',
      body: [
        'Procedura: i dati personali il cui periodo è scaduto o la cui finalità è stata raggiunta vengono distrutti senza indugio. Se la legge ne impone la conservazione, restano archiviati separatamente dagli altri per quel periodo e poi vengono distrutti.',
        'Modalità: le informazioni in formato di file elettronico vengono cancellate in modo permanente con mezzi tecnici che rendono impossibile il recupero o la ricostruzione.',
        'Voci, foto e informazioni di blocco salvate sul tuo dispositivo vengono rimosse da esso usando la funzione “Ripristina tutto” dell’app o disinstallandola.',
        'Se hai attivato il backup, la copia cifrata conservata sul server viene distrutta quando la elimini dalla schermata di backup dell’app oppure quando elimini il tuo account. In caso di eliminazione dell’account distruggiamo prima il backup e solo dopo eliminiamo l’account: se sparisse prima l’account, non resterebbe nessuno con il diritto di cancellare quel backup.',
        'Se non hai attivato il backup, il gestore non detiene le voci presenti sul tuo dispositivo e quindi non può eliminarle al posto tuo.',
      ],
    },
    {
      h: '9. Diritti dell’interessato e del rappresentante legale e modalità di esercizio',
      body: [
        'Puoi esercitare in qualsiasi momento i seguenti diritti.',
        '• Chiedere l’accesso ai tuoi dati • Chiedere la rettifica in caso di errore • Chiedere la cancellazione • Chiedere la sospensione del trattamento • Chiedere la trasmissione dei tuoi dati (Legge sulla protezione delle informazioni personali, art. 35-2)',
        'Puoi esercitarli per iscritto o via e-mail usando il contatto della sezione 11, e il gestore agirà senza indugio.',
        'Se chiedi la rettifica di un errore nei tuoi dati, non li useremo né li comunicheremo fino al completamento della rettifica.',
        '⚠ Limiti del diritto di accesso al backup: se chiedi l’accesso al tuo backup, il gestore può consegnarti soltanto il testo cifrato, non decifrabile, e i metadati di cui alla sezione 2(c). Non possiamo fornirti le tue voci in forma leggibile da una persona — il gestore non ha la chiave. Tu stesso puoi ripristinare in qualsiasi momento nell’app con il tuo codice di recupero.',
        'Puoi eliminare in qualsiasi momento dall’app un report con IA che hai creato. Eliminandolo nell’app sparisce dal tuo dispositivo; la sintesi conservata sul server viene eliminata automaticamente trascorsi 90 giorni dalla creazione. Se desideri una cancellazione anticipata, puoi richiederla tramite “Contatti”.',
        '⚠ Le sintesi generate dall’IA possono discostarsi dai fatti e non costituiscono una diagnosi o un consiglio medico o psicologico. L’app offre un modo per segnalare un report.',
        'Il rappresentante legale di un minore di 14 anni può esercitare i diritti sopra indicati per suo conto.',
      ],
    },
    {
      h: '10. Misure per garantire la sicurezza',
      body: [
        '• Organizzative: ridurre al minimo il numero di persone che trattano dati personali e formarle periodicamente',
        '• Tecniche: gestione dei permessi di accesso al sistema di trattamento, cifratura in transito (HTTPS), memorizzazione del segreto di blocco come hash e uso della memoria sicura del dispositivo (Keystore/Keychain)',
        '• Cifratura end-to-end del backup: la copia di backup viene cifrata sul tuo dispositivo prima di essere trasmessa, e la chiave di decifratura esiste solo sul dispositivo e nel tuo codice di recupero. Sul server del gestore non c’è alcuna chiave.',
        '• Fisiche: i server che ospitano dati personali si trovano nei data center di fornitori cloud nazionali ed esteri e seguono le loro politiche di controllo degli accessi fisici.',
        '⚠ La funzione di blocco impedisce l’accesso allo schermo; non cifra i file di diario salvati sul dispositivo. Se il dispositivo viene perso o sottratto e la sua sicurezza viene aggirata, il contenuto delle voci può essere esposto.',
      ],
    },
    {
      h: '11. Responsabile della privacy e ufficio che riceve e gestisce le richieste di accesso',
      body: [
        'Il gestore assume la responsabilità complessiva del trattamento dei dati personali e designa il seguente responsabile della privacy per gestire reclami e richieste di tutela.',
        '• Responsabile della privacy: Son Hwi-seong (ruolo: rappresentante)',
        '• Contatto: support@vivace-games.com',
        '• Ufficio che riceve e gestisce le richieste di accesso: il medesimo',
        'Puoi rivolgere al responsabile della privacy qualsiasi domanda, reclamo o richiesta di tutela in materia di privacy che sorga usando il servizio. Il gestore risponderà e agirà senza indugio.',
      ],
    },
    {
      h: '12. Come ottenere tutela in caso di violazione dei diritti',
      body: [
        'Per ottenere tutela a fronte di una violazione dei tuoi dati personali, puoi rivolgerti ai seguenti organismi coreani per la composizione delle controversie o per una consulenza.',
        '• Comitato di conciliazione per le controversie sui dati personali: 1833-6972 (dalla Corea) / www.kopico.go.kr',
        '• Centro segnalazioni per le violazioni della privacy: 118 (dalla Corea) / privacy.kisa.or.kr',
        '• Procura Suprema, Divisione investigazioni informatiche: 1301 (dalla Corea) / www.spo.go.kr',
        '• Agenzia nazionale di polizia, Ufficio investigazioni informatiche: 182 (dalla Corea) / ecrm.police.go.kr',
        'Inoltre, chi subisca una lesione di diritti o interessi a causa di un provvedimento o di un’omissione del responsabile di un ente pubblico riguardo a una richiesta ai sensi degli artt. 35 (accesso), 36 (rettifica e cancellazione) o 37 (sospensione del trattamento) della Legge sulla protezione delle informazioni personali può proporre ricorso amministrativo secondo la Legge sui ricorsi amministrativi.',
      ],
    },
    {
      h: '13. Modifiche alla presente informativa',
      body: [
        'La presente informativa si applica dalla sua data di entrata in vigore.',
        'Qualora si aggiungano, eliminino o modifichino contenuti per effetto di cambiamenti normativi, di policy o della tecnologia di sicurezza, ti informeremo senza indugio della modifica e della sua data di efficacia tramite avvisi in app e questo documento.',
        'Cronologia delle modifiche',
        '• 2026-08-09 prima adozione',
        '• 2026-08-11 pubblicazione di una modifica in arrivo — prevista introduzione dell’abbonamento mensile e del backup/ripristino (il testo principale non è ancora cambiato)',
        '• 2026-08-12 pubblicazione di una modifica in arrivo — prevista introduzione dei report di sintesi con IA (il testo principale non è ancora cambiato)',
        '• 2026-08-23 modifica — le due modifiche annunciate sopra sono state recepite nel testo principale. Il trattamento relativo all’abbonamento mensile, al backup/ripristino e ai report di sintesi con IA è stato aggiunto alle sezioni 1, 2, 3, 4, 6, 8, 9 e 10.',
        '• 2026-09-01 modifica — è stata aggiunta agli articoli 2, 3 e 4 la raccolta di un identificativo del dispositivo per statistiche di utilizzo del servizio (conteggio degli utenti attivi) ed è stato ampliato l’avviso sulla verifica dell’età all’articolo 2.',
      ],
    },
  ],
};

/**
 * Eliminazione dell’account — italiano.
 *
 * 🔴 **Il testo coreano fa fede** (`legal-text.ts`). Stessa regola dell’informativa sulla
 *   privacy: questa è una traduzione di cortesia.
 *
 * ⚠ Questo documento ha una URL pubblica propria perché il modulo «Sicurezza dei dati» di Play
 *   richiede una via di eliminazione **sul web**: chi ha già disinstallato l’app deve comunque
 *   poterne fare richiesta. È quella URL che aprono i revisori di Play, quindi non può restare
 *   solo in coreano.
 *
 * ⚠ La struttura deve coincidere esattamente con quella coreana — 6 sezioni (6/4/9/5/4/3 righe)
 *   e nessuna modifica in arrivo. `npm run check:legal` lo verifica.
 */
export const DELETE_ACCOUNT_IT: LegalDoc = {
  title: 'Come eliminare il tuo account Jogak',
  sourceFingerprint: 'a8b0c8b9',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Questa pagina spiega come eliminare il tuo account Jogak e i dati a esso associati. Puoi farne richiesta anche via e-mail se hai già disinstallato l’app o non riesci ad accedere.',
  sections: [
    {
      h: '1. Eliminarlo tu stesso nell’app',
      body: [
        'Segui questi passaggi nell’app Jogak: l’eliminazione ha effetto immediato.',
        '① Apri l’app → scheda [Impostazioni], in basso',
        '② Scegli [Contattaci]',
        '③ Se non hai effettuato l’accesso, accedi con il tuo account Google',
        '④ Scegli [Elimina account] in fondo alla schermata e conferma',
        'L’eliminazione dell’account non è reversibile.',
      ],
    },
    {
      h: '2. Richiederla via e-mail (se hai disinstallato l’app o non riesci ad accedere)',
      body: [
        'Invia quanto segue a support@vivace-games.com.',
        '• Oggetto: richiesta di eliminazione dell’account Jogak',
        '• Testo: l’indirizzo e-mail dell’account Google con cui hai effettuato l’accesso a Jogak',
        'L’indirizzo da cui scrivi deve coincidere con quello usato in fase di registrazione, così da poter verificare che sei tu. Daremo seguito alla richiesta e ti risponderemo entro 7 giorni lavorativi.',
      ],
    },
    {
      h: '3. Dati che vengono eliminati',
      body: [
        'Quando elimini il tuo account, le informazioni seguenti vengono distrutte immediatamente o rese non tracciabili.',
        '• L’identificatore univoco del tuo account social (il “sub” di Google)',
        '• Il tuo indirizzo e-mail',
        '• Il collegamento tra le tue richieste e l’account di chi le ha scritte',
        '• La copia cifrata del tuo diario conservata sul server (se hai attivato il backup) — viene eliminata insieme all’account, senza attendere i 90 giorni di tolleranza.',
        '• L’identificatore del backup e i registri di backup (ora, dimensione, numero di generazione)',
        '• Le sintesi dei report con IA conservate sul server (al massimo 90 giorni dalla creazione) e i registri di utilizzo dei report (periodo, numero di volte, numero di token)',
        '⚠ In caso di eliminazione dell’account distruggiamo prima il backup e solo dopo eliminiamo l’account: se sparisse prima l’account, non resterebbe nessuno con il diritto di cancellare quel backup. Se la cancellazione del backup non riesce, neppure l’eliminazione dell’account viene portata a termine; riprova poco più tardi.',
        '⚠ L’operazione non è reversibile. Anche se conservi il tuo codice di recupero, non potrai ripristinare il backup presente sul server.',
      ],
    },
    {
      h: '4. Dati che vengono conservati e per quanto tempo',
      body: [
        'Le informazioni seguenti sono conservate in base alla legge e, anche durante tale periodo, restano soltanto in una forma che non consente di risalire a chi le ha scritte (pseudonimizzata).',
        '• Contenuto delle richieste: 3 anni (Legge sulla tutela dei consumatori nel commercio elettronico — registri su reclami o composizione delle controversie)',
        '• Registri delle transazioni di abbonamento (identificatore della transazione, prodotto, periodo di abbonamento, cronologia delle variazioni dello stato di pagamento): 5 anni (Legge sulla tutela dei consumatori nel commercio elettronico, art. 6)',
        '• Registro dell’avvenuta distruzione di un backup (identificatore del backup e ora della distruzione): 1 anno dalla distruzione — perché tu possa capire “perché il ripristino non funziona”; l’identificatore del tuo account non viene conservato insieme.',
        'Trascorso il periodo di conservazione, distruggiamo i dati senza indugio.',
      ],
    },
    {
      h: '5. Ciò che resta sul dispositivo — l’eliminazione dell’account non lo cancella',
      body: [
        'Le voci di Jogak (titoli, testo, foto, tag ed emozioni) e il testo dei report con IA sono salvati all’interno del tuo dispositivo.',
        'Perciò, eliminando l’account, le voci e i report presenti sul dispositivo restano intatti. Per cancellarli anche dal dispositivo, disinstalla l’app oppure usa la funzione di ripristino nelle [Impostazioni] dell’app.',
        'Al contrario, se disinstalli l’app, le voci presenti sul dispositivo non potranno essere recuperate. Puoi recuperarle solo se avevi attivato il backup e conservi il codice di recupero, e soltanto finché non hai eliminato l’account.',
        '⚠ Se non hai attivato il backup, il gestore non dispone delle voci presenti sul tuo dispositivo e quindi non può né eliminarle né restituirtele.',
      ],
    },
    {
      h: '6. L’abbonamento va disdetto separatamente',
      body: [
        'L’eliminazione dell’account non annulla automaticamente il tuo abbonamento Google Play. Se non lo annulli, continuerai a essere addebitato.',
        'Per annullare: app Google Play Store > profilo > Pagamenti e abbonamenti > Abbonamenti (https://play.google.com/store/account/subscriptions)',
        'Il rimborso degli importi già addebitati segue la politica di rimborso di Google Play e quella del gestore. Puoi scriverci all’indirizzo di contatto indicato qui sopra.',
      ],
    },
  ],
};

/**
 * Condizioni d’uso — italiano.
 *
 * 🔴 **Il testo coreano è l’originale e prevale** (`legal-text.ts`). Questa è una traduzione di
 *   comodità; in caso di divergenza vale il coreano. Lo dice l’articolo 22 stesso all’interno
 *   del documento, ed è ciò che rende sicura la pubblicazione della traduzione.
 *
 * ⚠ **La struttura deve coincidere esattamente con quella coreana** — 22 articoli, lo stesso
 *   numero di righe in ciascuno e nessuna “modifica preannunciata”. `npm run check:legal` lo
 *   verifica. Spezzare in due una frase coreana fa fallire il controllo, e fonderne due
 *   nasconde una clausola persa.
 *
 * ⚠ Questo documento esiste per l’**art. 13(2) della Legge sulla tutela dei consumatori nel
 *   commercio elettronico**: informazione prima del contratto e consegna per iscritto delle
 *   condizioni dopo. I punti 5 (recesso), 6 (rimborsi), 8 (reclami e controversie) e 9 (le
 *   condizioni stesse e come consultarle) non hanno altro posto in cui stare. Ogni articolo è
 *   il contenitore di un punto preciso, quindi **nessun articolo può perdere la propria
 *   sostanza giuridica per leggersi meglio.** I tre che pesano di più:
 *
 *   - L’art. 12 riproduce in sostanza gli artt. 17(2)5 e 17(6). «la fornitura del contenuto
 *     digitale è iniziata», «la parte non ancora fornita di un contenuto digitale fornito in
 *     più parti» e «indicare questo fatto **e nello stesso tempo** mettere a disposizione ...
 *     come prodotto di prova» sono requisiti di legge: se li si attenua, il limite è nullo.
 *   - La prima riga dell’art. 20 è la difesa contro l’art. 35 (contratti sfavorevoli al
 *     consumatore). **Non aggiungere mai «nella massima misura consentita dalla legge»** né
 *     formule equivalenti: rovescerebbe la frase in ciò che essa era scritta per rifiutare.
 *   - L’art. 22 è l’art. 36 (competenza esclusiva): il domicilio **della persona utente**, mai
 *     la sede del gestore. Indicare la sede del gestore sarebbe nullo ai sensi dell’art. 35.
 *
 * ⚠ «청약철회» è reso con **«recesso»**, distinto dalla **«disdetta»** dell’abbonamento
 *   dell’art. 14: Jogak Pro *è* un abbonamento, e i due rimedi non devono confondersi
 *   all’interno dello stesso documento.
 */
export const TERMS_IT: LegalDoc = {
  title: 'Condizioni d’uso di Jogak',
  sourceFingerprint: 'd18f02f7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'Le presenti condizioni disciplinano i diritti, gli obblighi e le responsabilità tra Hwiseong Games (marchio: Vivace Games Studio, “il gestore”) e le persone utenti, in relazione all’uso dell’applicazione mobile “Jogak” (“il servizio”) fornita dal gestore. Ti invitiamo a leggerle prima di usare il servizio.',
  sections: [
    {
      h: 'Articolo 1 (Finalità e ambito di applicazione)',
      body: [
        'Le presenti condizioni hanno lo scopo di stabilire le condizioni e le modalità d’uso del servizio nonché i diritti e gli obblighi del gestore e della persona utente.',
        'Le presenti condizioni si applicano a tutte le persone che usano il servizio. Si applicano allo stesso modo anche quando ti limiti a scrivere voci senza effettuare l’accesso.',
        'Quanto non previsto dalle presenti condizioni è disciplinato dalle norme applicabili, tra cui la Legge sulla tutela dei consumatori nel commercio elettronico, la Legge sulla disciplina delle condizioni generali di contratto e la Legge sulla promozione dell’industria dei contenuti, nonché dagli usi commerciali.',
      ],
    },
    {
      h: 'Articolo 2 (Informazioni sul gestore)',
      body: [
        'Denominazione: Hwiseong Games (marchio: Vivace Games Studio)',
        // ⚠ È la grafia che `PRIVACY_IT` §11 già usa. Due documenti non possono chiamare in modo diverso la stessa persona
        'Rappresentante: Son Hwi-seong',
        'Sede operativa: 204, 2F, 22 Seongan 5-gil, Jung-gu, Ulsan, 44421, Republic of Korea',
        'Telefono: +82 10-9926-0925',
        'Indirizzo e-mail: support@vivace-games.com',
        'Numero di registrazione dell’impresa: 749-25-02260',
        'Numero di registrazione come attività di vendita a distanza: 2026-Ulsan Jung-gu-0170 (autorità che ha ricevuto la registrazione: Jung-gu, Città metropolitana di Ulsan)',
      ],
    },
    {
      h: 'Articolo 3 (Definizioni)',
      body: [
        '“Frammento” (“jogak”) indica una singola voce di diario che la persona utente scrive nel servizio.',
        '“Dispositivo” indica lo smartphone o altro terminale su cui la persona utente installa e usa il servizio.',
        '“Jogak Pro” indica il prodotto in abbonamento ricorrente a pagamento che offre la rimozione della pubblicità, il backup e il ripristino e i report di sintesi con IA.',
        '“Store” indica un negozio di applicazioni, come Google Play, attraverso cui il servizio viene distribuito e vengono pagati i prodotti a pagamento.',
      ],
    },
    {
      h: 'Articolo 4 (Pubblicazione e modifica delle presenti condizioni)',
      body: [
        'Il gestore pubblica le presenti condizioni nella schermata [Impostazioni] del servizio e all’indirizzo indicato di seguito, affinché tu possa consultarle in qualsiasi momento.',
        'https://sonwheesung.github.io/diary/terms.html',
        'Il gestore può modificare le presenti condizioni nei limiti in cui ciò non violi le norme applicabili.',
        'In caso di modifica, il gestore indica la data di efficacia e il motivo e ne dà avviso all’interno del servizio a partire da 7 giorni prima di tale data. Tuttavia, quando la modifica è sfavorevole alle persone utenti, l’avviso è pubblicato a partire da 30 giorni prima della data di efficacia, mostrando in modo confrontabile e facilmente comprensibile il contenuto prima e dopo la modifica.',
        'Se non accetti le condizioni modificate, puoi disdire il servizio a pagamento e smettere di usare il servizio prima della data di efficacia. Se continui a usare il servizio dopo la data comunicata, si intende che hai accettato le condizioni modificate.',
      ],
    },
    {
      h: 'Articolo 5 (Contenuto del servizio)',
      body: [
        'Il servizio fornito dal gestore si chiama “Jogak” ed è un’applicazione mobile (contenuto digitale) per scrivere e conservare un diario.',
        'Funzioni offerte gratuitamente: scrivere, modificare, eliminare e cercare voci, allegare foto, tag, registrazione delle emozioni, vista calendario, blocco dell’app (PIN e sequenza), modalità scura, più lingue, lettura degli avvisi e “Contattaci”.',
        'Funzioni offerte con il prodotto a pagamento “Jogak Pro”: rimozione della pubblicità, backup cifrato e ripristino e report di sintesi con IA.',
        'I titoli, il testo, le foto, i tag e le emozioni delle voci che scrivi sono salvati soltanto all’interno del tuo dispositivo e non vengono trasmessi ai server del gestore, a meno che tu non attivi la funzione di backup.',
        'Se il backup è attivo, le voci vengono cifrate sul tuo dispositivo prima di essere trasmesse e il gestore non conserva la chiave di decifratura, quindi non può leggerne il contenuto.',
        'Quando viene creato un report di sintesi con IA, il testo del diario del periodo richiesto transita nel server del gestore e viene consegnato al fornitore di intelligenza artificiale. Il gestore non conserva quel testo. I dettagli sono disciplinati dall’informativa sulla privacy.',
      ],
    },
    {
      h: 'Articolo 6 (Conclusione del contratto e account)',
      body: [
        'Il contratto d’uso del servizio si conclude quando la persona utente installa il servizio, accetta le presenti condizioni e lo utilizza.',
        'Le funzioni gratuite, compresa la scrittura delle voci, sono utilizzabili senza account.',
        '“Contattaci”, il pagamento dei prodotti a pagamento, il backup e il ripristino e i report di sintesi con IA richiedono l’accesso con un account Google.',
        'La persona utente può eliminare il proprio account in qualsiasi momento dalla schermata [Impostazioni] → [Contattaci] del servizio. Le modalità di eliminazione e le informazioni eliminate o conservate sono disciplinate dalla guida all’eliminazione dell’account.',
      ],
    },
    {
      h: 'Articolo 7 (Prezzo dei prodotti a pagamento e pagamento)',
      body: [
        'Il canone di Jogak Pro è di 3.900 KRW al mese e 29.000 KRW all’anno, importi comprensivi dell’imposta sul valore aggiunto.',
        'Il canone viene addebitato automaticamente sul metodo di pagamento registrato dalla persona utente presso lo store, al momento dell’avvio dell’abbonamento e a ogni successiva data di rinnovo.',
        'Non vi sono costi aggiuntivi oltre al canone. I costi di traffico dati necessari per usare il servizio seguono però la politica dell’operatore telefonico scelto dalla persona utente e restano a suo carico.',
        'L’importo effettivamente addebitato può differire dagli importi indicati sopra in base alle politiche di cambio e di commissioni dello store o ai suoi prezzi per Paese. In tal caso prevale l’importo mostrato nella schermata di pagamento.',
        'Se il gestore aumenta il canone, ne dà avviso in anticipo ai sensi dell’articolo 4, e il prezzo aumentato non si applica a un periodo di abbonamento già pagato.',
      ],
    },
    {
      h: 'Articolo 8 (Limiti delle condizioni di vendita)',
      body: [
        'Il servizio può essere usato soltanto nei Paesi in cui lo store ne consente la distribuzione, e l’installazione e il pagamento sono possibili soltanto nei Paesi individuati dal gestore per la distribuzione.',
        'Un abbonamento a pagamento è collegato a un solo account per volta. Se accedi con un altro account Google sullo stesso dispositivo, l’abbonamento viene trasferito a quell’account e non è più utilizzabile dall’account precedente.',
        'Il gestore può fissare un limite massimo al numero di utilizzi nella misura necessaria a fornire alcune funzioni del servizio. Il numero di report di sintesi con IA generabili è limitato per periodo e tale limite è indicato nelle schermate del servizio.',
      ],
    },
    {
      h: 'Articolo 9 (Momento e modalità della fornitura)',
      body: [
        'Jogak Pro viene applicato all’account della persona utente non appena il pagamento è completato, senza alcuna procedura di consegna separata.',
        'Se il pagamento è stato completato ma il diritto non risulta applicato, la persona utente può usare [Ripristina acquisti] nella schermata [Jogak Pro] del servizio oppure contattare il gestore con le modalità dell’articolo 21.',
        'Il periodo di abbonamento va dalla data del pagamento al giorno precedente il rinnovo successivo e si rinnova automaticamente per un periodo di pari durata, salvo disdetta.',
      ],
    },
    {
      h: 'Articolo 10 (Ambiente d’uso)',
      body: [
        'Il servizio è utilizzabile su dispositivi Android e richiede la versione del sistema operativo indicata nella scheda dello store o una successiva.',
        'Le funzioni di base, come scrivere, consultare e cercare le voci, sono utilizzabili senza connessione a internet.',
        'La lettura degli avvisi, “Contattaci”, l’accesso, il pagamento, il backup e il ripristino e i report di sintesi con IA richiedono una connessione a internet.',
        'Se lo spazio di archiviazione del dispositivo è insufficiente o il sistema operativo è fuori dall’intervallo supportato, alcune funzioni potrebbero non funzionare correttamente.',
      ],
    },
    {
      h: 'Articolo 11 (Prova gratuita e passaggio all’abbonamento a pagamento)',
      body: [
        'Il gestore offre una prova gratuita di 7 giorni di Jogak Pro.',
        'Al termine del periodo di prova gratuita, questo si converte automaticamente in un abbonamento ricorrente a pagamento e viene addebitato il canone dell’articolo 7.',
        'Prima che la conversione avvenga, il gestore mostra la data e l’ora della conversione, il prezzo prima e dopo la variazione e il metodo di pagamento e raccoglie il consenso della persona utente; in mancanza di consenso non viene effettuato alcun pagamento.',
        'Se non desideri che ti venga addebitato il canone al termine della prova gratuita, disdici l’abbonamento con le modalità dell’articolo 14 prima che il periodo di prova finisca. Anche dopo la disdetta puoi continuare a usare Jogak Pro fino alla fine di tale periodo.',
      ],
    },
    {
      h: 'Articolo 12 (Recesso)',
      body: [
        'La persona utente può recedere entro 7 giorni dalla data di pagamento di un prodotto a pagamento oppure dalla data in cui riceve per iscritto le condizioni del contratto.',
        'Il recesso si esercita manifestando tale volontà al canale di assistenza dell’articolo 21, e il gestore comunica l’esito entro 3 giorni lavorativi dalla ricezione.',
        'Esercitato il recesso, il gestore rimborsa l’importo ai sensi dell’articolo 13 e il diritto della persona utente a Jogak Pro cessa immediatamente.',
        'Tuttavia, ai sensi dell’art. 17(2)5 della Legge sulla tutela dei consumatori nel commercio elettronico, il recesso è limitato quando la fornitura del contenuto digitale è iniziata. Anche in tal caso il recesso resta possibile per la parte non ancora fornita di un contenuto digitale fornito in più parti.',
        'Per applicare tale limite il gestore, ai sensi del comma 6 del medesimo articolo, indica questo fatto e nello stesso tempo mette a disposizione la prova gratuita di 7 giorni dell’articolo 11 come prodotto di prova. Se il gestore non ha adottato tali misure, la persona utente può recedere nonostante il limite sopra indicato.',
        'Il gestore non richiede penali né risarcimenti per il fatto che la persona utente abbia esercitato il recesso.',
      ],
    },
    {
      h: 'Articolo 13 (Rimborsi)',
      body: [
        'Poiché il pagamento dei prodotti a pagamento avviene tramite lo store, anche i rimborsi sono in linea di principio gestiti secondo la procedura di rimborso dello store.',
        'La persona utente può chiedere il rimborso direttamente allo store oppure al gestore tramite il canale di assistenza dell’articolo 21. Se la richiesta è rivolta al gestore, questi la gestisce d’intesa con lo store.',
        'Il gestore rimborsa l’importo entro 3 giorni lavorativi dalla data in cui riceve la dichiarazione di recesso o equivalente. L’accredito effettivo può richiedere più tempo, in base ai tempi di lavorazione dello store.',
        'Se il gestore ritarda il rimborso oltre tale termine senza giustificato motivo, corrisponde anche gli interessi di mora per il periodo di ritardo, calcolati applicando il tasso previsto dal Decreto attuativo della Legge sulla tutela dei consumatori nel commercio elettronico.',
        'Se una parte del periodo è già stata utilizzata, il gestore può detrarre l’importo corrispondente a tale periodo prima di rimborsare. Non si detrae però il periodo in cui la persona utente non ha potuto usare il servizio per cause imputabili al gestore.',
        'Per il rimborso non è previsto alcun costo aggiuntivo.',
      ],
    },
    {
      h: 'Articolo 14 (Disdetta dell’abbonamento)',
      body: [
        'La persona utente può disdire l’abbonamento in qualsiasi momento. La disdetta va effettuata dalla persona utente nella schermata di gestione degli abbonamenti dello store; il gestore non può effettuarla al suo posto.',
        'Google Play: app dello store > profilo > Pagamenti e abbonamenti > Abbonamenti (https://play.google.com/store/account/subscriptions)',
        'Anche dopo la disdetta puoi continuare a usare Jogak Pro fino alla fine del periodo di abbonamento già pagato; trascorso tale periodo, il rinnovo automatico si interrompe.',
        'L’eliminazione dell’account nel servizio non disdice l’abbonamento presso lo store. Se non lo disdici con le modalità sopra indicate, separatamente dall’eliminazione dell’account, continuerai a essere addebitato.',
      ],
    },
    {
      h: 'Articolo 15 (Contratti conclusi da minori)',
      body: [
        'Se una persona minorenne ha pagato un prodotto a pagamento senza il consenso del suo rappresentante legale, la persona minorenne stessa o il suo rappresentante legale possono annullare quel contratto.',
        'L’annullamento non è però possibile quando la persona minorenne ha pagato con beni di cui il rappresentante legale le aveva consentito di disporre, oppure quando ha usato un inganno per far credere di essere maggiorenne.',
        'Se desideri annullarlo, presenta la richiesta al canale di assistenza dell’articolo 21. Il gestore può chiedere documenti che attestino la qualità di rappresentante legale.',
      ],
    },
    {
      h: 'Articolo 16 (Obblighi della persona utente)',
      body: [
        'La persona utente deve rispettare le norme applicabili e le presenti condizioni quando usa il servizio.',
        'La persona utente non deve appropriarsi dell’account altrui, ostacolare il normale funzionamento del servizio, accedere o tentare di accedere al servizio con modalità diverse da quelle previste dal gestore, né manipolare il processo di pagamento dei prodotti a pagamento.',
        'La persona utente deve gestire autonomamente le informazioni del proprio account e il PIN o la sequenza di blocco dell’app.',
        'La persona utente deve custodire in modo sicuro il codice di recupero rilasciato all’attivazione della funzione di backup. Se lo perde, nemmeno il gestore può decifrare il backup e il ripristino diventa impossibile.',
      ],
    },
    {
      h: 'Articolo 17 (Conservazione dei dati e backup)',
      body: [
        'L’originale delle voci scritte dalla persona utente è salvato sul suo dispositivo. Se l’app viene disinstallata o il dispositivo viene ripristinato, le voci presenti su di esso non possono essere recuperate.',
        'Se la funzione di backup è stata attivata, il gestore conserva una copia cifrata e la persona utente può ripristinarla con il proprio codice di recupero.',
        'Anche dopo la fine dell’abbonamento il gestore conserva il backup cifrato per 90 giorni e in tale periodo il ripristino resta disponibile. Trascorsi i 90 giorni il backup viene eliminato.',
        'Il gestore non dispone di un canale di notifiche push, perciò l’avviso di tale eliminazione programmata viene dato soltanto a schermo, quando la persona utente apre l’app.',
        'Se la persona utente elimina il proprio account, il backup cifrato conservato sul server viene eliminato insieme all’account, senza i 90 giorni di tolleranza.',
      ],
    },
    {
      h: 'Articolo 18 (Proprietà intellettuale)',
      body: [
        'I diritti sulle voci che la persona utente scrive nel servizio e sulle foto che vi allega appartengono a lei. Il gestore non rivendica alcun diritto su di esse.',
        'Il gestore non usa le voci delle persone utenti per finalità diverse dalla fornitura del servizio e non le usa per pubblicità, statistiche o addestramento di intelligenza artificiale.',
        'I diritti sul servizio stesso e su design, marchi e programmi in esso inclusi appartengono al gestore o ai legittimi titolari.',
        'La persona utente non deve riprodurre, distribuire o sottoporre a ingegneria inversa il servizio senza il previo consenso del gestore.',
      ],
    },
    {
      h: 'Articolo 19 (Modifica, sospensione e cessazione del servizio)',
      body: [
        'Il gestore può modificare il contenuto del servizio per migliorarne la qualità. Quando il contenuto di un prodotto a pagamento viene modificato in modo sfavorevole alle persone utenti, l’avviso è dato in anticipo ai sensi dell’articolo 4.',
        'Il gestore può sospendere temporaneamente la fornitura del servizio in presenza di cause inevitabili quali manutenzione, sostituzione o guasto delle apparecchiature o interruzione delle comunicazioni, dandone avviso in anticipo. Quando la causa inevitabile impedisce l’avviso preventivo, l’avviso è dato successivamente.',
        'Se il gestore cessa il servizio, ne dà avviso tramite comunicazioni all’interno del servizio e nella scheda dello store almeno 30 giorni prima della data di cessazione, indicando anche il periodo entro cui sarà possibile scaricare o ripristinare il backup.',
        'Alla cessazione del servizio, il canone corrispondente al periodo già pagato e non fruito viene rimborsato alla persona utente.',
      ],
    },
    {
      h: 'Articolo 20 (Responsabilità)',
      body: [
        'Il gestore risponde, in relazione alla fornitura del servizio, secondo quanto previsto dalle norme applicabili. Nessuna clausola delle presenti condizioni esclude o limita la responsabilità del gestore prevista dalla legge.',
        'Il gestore non risponde dei danni derivanti da cause a lui non imputabili, quali forza maggiore, guasto, smarrimento o ripristino del dispositivo della persona utente, oppure la perdita da parte sua del codice di recupero o del segreto di blocco dell’app.',
        'Il report di sintesi con IA è materiale di riferimento generato da un’intelligenza artificiale e non costituisce una diagnosi né una consulenza medica, psicologica o legale. Il gestore non garantisce l’esattezza del suo contenuto.',
        'I danni verificatisi nel processo di pagamento tramite lo store per cause imputabili allo store sono disciplinati dalla politica dello store. Il gestore presta comunque tutta la collaborazione necessaria per il ristoro del pregiudizio subito dalla persona utente.',
      ],
    },
    {
      h: 'Articolo 21 (Reclami dei consumatori e composizione delle controversie)',
      body: [
        'Per gestire osservazioni e reclami delle persone utenti, il gestore mette a disposizione il canale [Impostazioni] → [Contattaci] all’interno del servizio e il canale e-mail indicato di seguito.',
        'E-mail: support@vivace-games.com',
        'Quando il gestore riconosce fondata un’osservazione o un reclamo, vi dà seguito senza indugio; se la trattazione richiede tempo, ne comunica il motivo e i tempi previsti.',
        'In caso di controversia tra il gestore e una persona utente, quest’ultima può rivolgersi ai seguenti organismi per la composizione della controversia.',
        '• Comitato di conciliazione per le controversie dei consumatori (Agenzia coreana per i consumatori): 1372 (dalla Corea) · https://www.kca.go.kr',
        '• Comitato di conciliazione per le controversie sui contenuti: 1588-2594 · https://www.kcdrc.kr',
        '• Comitato di conciliazione per le controversie del commercio elettronico: 1661-5714 · https://www.ecmc.or.kr',
      ],
    },
    {
      h: 'Articolo 22 (Legge applicabile e foro competente)',
      body: [
        'Alle presenti condizioni e all’uso del servizio si applica la legge della Repubblica di Corea.',
        'L’azione relativa a una controversia sorta tra il gestore e una persona utente è soggetta, ai sensi dell’art. 36 della Legge sulla tutela dei consumatori nel commercio elettronico, alla competenza esclusiva del tribunale distrettuale del domicilio della persona utente al momento della proposizione della domanda. In mancanza di domicilio, alla competenza esclusiva del tribunale distrettuale della sua residenza; e se al momento della proposizione della domanda il domicilio o la residenza non risultano chiari, il giudice competente è determinato secondo la Legge sul processo civile.',
        'La versione coreana delle presenti condizioni fa fede. In caso di divergenza di significato con una traduzione in un’altra lingua, prevale la versione coreana.',
        'Disposizione finale: le presenti condizioni entrano in vigore il 17 agosto 2026.',
      ],
    },
  ],
};
