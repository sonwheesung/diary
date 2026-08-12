import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Informativa sulla privacy — italiano.
 *
 * 🔴 **Il testo coreano fa fede.** Questa è una traduzione di cortesia; in caso di difformità
 *   prevale `legal-text.ts` (coreano).
 * ⚠ **La struttura deve coincidere esattamente con quella coreana** — stesso numero di sezioni
 *   e di righe in ciascuna. `npm run check:legal` lo verifica.
 */
export const PRIVACY_IT: LegalDoc = {
  title: 'Informativa sulla privacy di Jogak',
  effective: '2026-08-09',
  updated: '2026-08-11',
  intro:
    'Vivace Games (“il gestore”) rispetta la Legge sulla protezione delle informazioni personali e le altre norme applicabili e tratta i dati personali delle persone che usano “Jogak” (“il servizio”) come indicato di seguito. Jogak non invia ad alcun server le voci di diario che scrivi e, per principio, raccoglie soltanto le informazioni minime necessarie.',
  sections: [
    {
      h: '1. Ciò che non raccogliamo (lo diciamo per primo)',
      body: [
        'Il gestore non raccoglie le informazioni seguenti e non le trasmette fuori dal tuo dispositivo.',
        '• Titoli, testo, elenchi, foto, tag ed emozioni delle voci — restano solo nella memoria interna del tuo dispositivo.',
        '• Il PIN, la sequenza o la risposta del suggerimento del blocco app — restano nella memoria sicura del dispositivo solo in forma non recuperabile (un hash); l’originale non è conservato da nessuna parte.',
        '• Il tuo nome, la data di nascita, il numero di telefono, l’indirizzo, la rubrica, la posizione, né alcun registro di accesso all’intera libreria foto.',
        'Le foto che scegli nell’app vengono solo copiate nella cartella dedicata dell’app sul tuo dispositivo per poterle inserire in una voce; non vengono trasmesse da nessuna parte.',
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
        '※ L’accesso serve solo per “Contatti”; scrivere voci, il blocco app e le altre funzioni non lo richiedono.',
        '※ I minori di 14 anni non possono usare la funzione di accesso.',
        'b. Informazioni raccolte automaticamente durante la pubblicazione degli annunci',
        '• Identificatore pubblicitario (ID pubblicità Android), informazioni su dispositivo e rete, registri di impressioni e clic',
        '• Quanto sopra è raccolto da Google (AdMob); i dettagli e come opporsi sono nella sezione 7.',
      ],
    },
    {
      h: '3. Finalità del trattamento',
      body: [
        '• Ricezione e gestione delle richieste: esaminare ciò che hai inviato e individuare e correggere i malfunzionamenti',
        '• Identificazione e risposta: recapitarti la risposta e permetterti di rivedere il tuo storico',
        '• Pubblicazione di annunci: mostrare pubblicità a chi usa la versione gratuita e misurarne il rendimento',
        'Il gestore non usa i dati personali per finalità diverse da quelle sopra indicate e, in caso di cambio di finalità, acquisirà il consenso in anticipo.',
      ],
    },
    {
      h: '4. Periodi di conservazione e uso',
      body: [
        '• Dati dell’account (indirizzo e-mail, “sub” di Google): fino all’eliminazione dell’account. All’eliminazione li distruggiamo senza indugio o li rendiamo non tracciabili.',
        '• Contenuto delle richieste: 3 anni dalla ricezione (Legge sulla tutela dei consumatori nel commercio elettronico — registri su reclami o composizione delle controversie)',
        '• Dati comportamentali basati sull’identificatore pubblicitario: fino a 1 anno dalla raccolta',
        'Trascorso il periodo o raggiunta la finalità, distruggiamo i dati senza indugio.',
      ],
    },
    {
      h: '5. Comunicazione a terzi',
      body: [
        'Il gestore non comunica a terzi i dati personali delle persone che usano il servizio.',
        'Fanno eccezione i casi in cui vi sia una specifica previsione di legge o in cui un’autorità inquirente lo richieda secondo le procedure e le forme previste dalla legge.',
      ],
    },
    {
      h: '6. Esternalizzazione del trattamento e trasferimento all’estero',
      body: [
        'Per erogare il servizio il gestore esternalizza il trattamento come segue, e una parte avviene fuori dalla Corea.',
        '• Google LLC — Paese: Stati Uniti. Contatto: https://support.google.com/policies/contact/general_privacy_form. Finalità: pubblicazione e misurazione degli annunci (AdMob), accesso con account Google. Dati: identificatore pubblicitario, informazioni su dispositivo e rete e, all’accesso, indirizzo e-mail e identificatore dell’account. Quando e come: trasmessi in rete alla richiesta di un annuncio e all’accesso. Conservazione: secondo l’informativa privacy di Google',
        '• Supabase Inc. — Paese: Stati Uniti (sede legale). Contatto: privacy@supabase.com. Finalità: conservare in banca dati le informazioni su richieste e account. Dati: quelli della sezione 2(a). Quando e come: trasmessi in rete all’invio di una richiesta. Conservazione: i periodi della sezione 4. ※ Il luogo fisico di archiviazione è la Repubblica di Corea (regione di Seoul), ma lo indichiamo come trasferimento all’estero perché la società che opera ha sede fuori dalla Corea.',
        '• Vercel Inc. — Paese: Stati Uniti. Contatto: privacy@vercel.com. Finalità: gestire il server che riceve le richieste. Dati: quelli della sezione 2(a). Quando e come: trasmessi in rete all’invio di una richiesta. Conservazione: fino al termine del contratto di esternalizzazione',
        'Puoi opporti al trasferimento all’estero dei tuoi dati. Per opporti ai trasferimenti legati alla pubblicità, disattiva gli annunci personalizzati secondo la sezione 7; per quelli legati alle richieste, basta non usare la funzione “Contatti” (tutte le altre funzioni, compresa la scrittura delle voci, restano disponibili).',
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
        'Maggiori informazioni su come Google tratta i dati personali a fini pubblicitari: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Procedura e modalità di distruzione',
      body: [
        'Procedura: i dati personali il cui periodo è scaduto o la cui finalità è stata raggiunta vengono distrutti senza indugio. Se la legge ne impone la conservazione, restano archiviati separatamente dagli altri per quel periodo e poi vengono distrutti.',
        'Modalità: le informazioni in formato di file elettronico vengono cancellate in modo permanente con mezzi tecnici che rendono impossibile il recupero o la ricostruzione.',
        'Voci, foto e informazioni di blocco salvate sul tuo dispositivo vengono rimosse da esso usando la funzione “Ripristina tutto” dell’app o disinstallandola. Il gestore non detiene tali informazioni e quindi non può eliminarle al posto tuo.',
      ],
    },
    {
      h: '9. Diritti dell’interessato e del rappresentante legale e modalità di esercizio',
      body: [
        'Puoi esercitare in qualsiasi momento i seguenti diritti.',
        '• Chiedere l’accesso ai tuoi dati • Chiedere la rettifica in caso di errore • Chiedere la cancellazione • Chiedere la sospensione del trattamento • Chiedere la trasmissione dei tuoi dati (Legge sulla protezione delle informazioni personali, art. 35-2)',
        'Puoi esercitarli per iscritto o via e-mail usando il contatto della sezione 11, e il gestore agirà senza indugio.',
        'Se chiedi la rettifica di un errore nei tuoi dati, non li useremo né li comunicheremo fino al completamento della rettifica.',
        'Il rappresentante legale di un minore di 14 anni può esercitare i diritti sopra indicati per suo conto.',
      ],
    },
    {
      h: '10. Misure per garantire la sicurezza',
      body: [
        '• Organizzative: ridurre al minimo il numero di persone che trattano dati personali e formarle periodicamente',
        '• Tecniche: gestione dei permessi di accesso al sistema di trattamento, cifratura in transito (HTTPS), memorizzazione del segreto di blocco come hash e uso della memoria sicura del dispositivo (Keystore/Keychain)',
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
        'In caso di aggiunta, eliminazione o modifica di contenuti per cambiamenti normativi, di policy o della tecnologia di sicurezza, ne daremo avviso tramite comunicazioni in app a partire da 7 giorni prima dell’entrata in vigore (30 giorni prima, se la modifica è sfavorevole per le persone che usano il servizio).',
        'Le modifiche di prossima entrata in vigore sono pubblicate in anticipo sotto “Modifiche in arrivo”, in fondo a questo documento, in un formato che consente di confrontare prima e dopo.',
        'Cronologia delle modifiche',
        '• 2026-08-09 prima adozione',
        '• 2026-08-11 pubblicazione di una modifica in arrivo — prevista introduzione dell’abbonamento mensile e del backup/ripristino (il testo principale non è ancora cambiato)',
      ],
    },
  ],
  pending: [
    {
      appliesFrom: 'Dal giorno in cui viene pubblicata la versione che include l’abbonamento mensile e il backup/ripristino',
      summary:
        'Vengono aggiunti l’abbonamento mensile e il backup/ripristino. Se ti abboni, saranno trattati lo stato dell’abbonamento e l’identificatore della transazione; e soltanto se attivi il backup, una copia delle tue voci cifrata sul tuo dispositivo sarà conservata sul server del gestore. Il gestore non può decifrare tale copia.',
      sections: [
        {
          h: 'a. Che cosa cambia (prima → dopo)',
          body: [
            'Prima: titoli, testo e foto delle voci non vengono trasmessi fuori dal tuo dispositivo.',
            'Dopo: **soltanto se attivi tu il backup**, una copia delle tue voci cifrata sul tuo dispositivo sarà conservata sul server del gestore. Se non lo attivi, non viene trasmesso neppure un carattere, esattamente come prima.',
            '⚠ Per essere precisi: il gestore **conserva quella copia ma non può leggerla.** La chiave di decifratura esiste solo sul tuo dispositivo e nel codice di recupero che custodisci tu; il gestore non la possiede.',
          ],
        },
        {
          h: 'b. Informazioni aggiuntive conservate se attivi il backup',
          body: [
            '• Una copia cifrata delle tue voci — in una forma che il gestore non può decifrare',
            '• Identificatore del backup, ora del backup, numero di generazione e dimensione — **queste informazioni non sono cifrate.** Il gestore può sapere quale account ha eseguito il backup, quando e di quale dimensione.',
            '• Base giuridica: il tuo consenso specifico (raccolto nella schermata in cui attivi il backup)',
          ],
        },
        {
          h: 'c. Periodo di conservazione',
          body: [
            '• Conservata finché il backup resta attivo e fino a 90 giorni dopo la fine dell’abbonamento, poi distrutta automaticamente.',
            '• Se disattivi il backup, ne chiedi la cancellazione o elimini il tuo account, la distruggiamo senza indugio, senza attendere i 90 giorni.',
            '• I backup senza accessi da 3 anni o più vengono distrutti. (Riguarda chi ha disinstallato l’app senza eliminare l’account.)',
            '• Il registro della distruzione (identificatore del backup e ora) è conservato 1 anno — perché tu possa capire “perché il ripristino non funziona”; l’identificatore dell’account non viene conservato insieme.',
            '⚠ L’avviso di scadenza dell’abbonamento ti raggiunge solo a schermo, quando apri l’app. Se non la apri, quell’avviso potrebbe non raggiungerti.',
          ],
        },
        {
          h: 'd. Limiti del diritto di accesso',
          body: [
            'Se chiedi l’accesso al tuo backup, il gestore può consegnarti soltanto **il testo cifrato, non decifrabile, e i metadati di cui alla lettera (b).** Non possiamo fornirti le tue voci in forma leggibile — il gestore non ha la chiave.',
            'Tu stesso puoi ripristinare in qualsiasi momento nell’app con il tuo codice di recupero.',
            '⚠ Se perdi il codice di recupero non esiste alcun modo di aprire il backup. Nemmeno il gestore può aprirlo per te.',
          ],
        },
        {
          h: 'e. Informazioni conservate se usi un abbonamento',
          body: [
            '• Stato dell’abbonamento — chiave del diritto, scadenza, periodo di tolleranza per pagamenti non riusciti, se è previsto il rinnovo',
            '• L’identificatore di transazione rilasciato dallo store, l’identificatore del prodotto e la distinzione dell’ambiente di pagamento (produzione/test)',
            '• I registri di variazione di stato inviati dal servizio di pagamento (acquisto, rinnovo, disdetta, rimborso ecc.) e il loro contenuto originale',
            '⚠ I dati di pagamento come numeri di carta o di conto sono gestiti da Google Play e non vengono trasmessi al gestore. Il gestore può sapere solo che hai pagato e fino a quando l’abbonamento è valido.',
            '• Base giuridica: Legge sulla protezione delle informazioni personali, art. 15(1)4 (necessario per eseguire le misure richieste, ossia fornire il diritto di abbonamento richiesto)',
            '• Finalità: verificare il diritto di abbonamento (rimozione degli annunci, uso del backup), gestire richieste di pagamento e rimborsi',
          ],
        },
        {
          h: 'f. Periodo di conservazione delle informazioni sull’abbonamento',
          body: [
            '• Registri su contratti o recesso e su pagamento e fornitura di beni: 5 anni (Legge sulla tutela dei consumatori nel commercio elettronico, art. 6)',
            '• Se elimini l’account, gli identificatori dell’account (e-mail, “sub” di Google) sono resi non tracciabili senza indugio, e i registri delle transazioni sopra indicati sono conservati separatamente e in forma non tracciabile per il periodo indicato e poi distrutti.',
            '⚠ L’eliminazione dell’account non annulla automaticamente il tuo abbonamento Google Play. Devi annullarlo tu in Google Play > Abbonamenti; in caso contrario continuerai a essere addebitato.',
          ],
        },
        {
          h: 'g. Esternalizzazione e trasferimento all’estero (ulteriore)',
          body: [
            '• Supabase Inc. — Paese: Stati Uniti (sede legale). Contatto: privacy@supabase.com. Finalità: conservare la copia di backup cifrata e lo stato dell’abbonamento. Dati: quelli delle lettere (b) ed (e). Conservazione: i periodi delle lettere (c) ed (f). ※ Il luogo fisico di archiviazione è la Repubblica di Corea (regione di Seoul).',
            '• Vercel Inc. — Paese: Stati Uniti. Contatto: privacy@vercel.com. Finalità: gestire il server di backup. ※ La copia cifrata viene inviata direttamente all’archivio senza passare da questo server.',
            '• RevenueCat, Inc. — Paese: Stati Uniti. Contatto: compliance@revenuecat.com. Finalità: verificare i pagamenti dell’abbonamento e controllarne lo stato. Dati: identificatore dell’account, identificatori di transazione e prodotto dello store, informazioni su dispositivo e app. Quando e come: trasmessi in rete all’apertura della schermata di abbonamento e al pagamento. Conservazione: fino al termine del contratto di esternalizzazione',
            '• Google LLC — oltre al trasferimento descritto nella sezione 6, i dati di transazione dello store sono trattati per elaborare e verificare i pagamenti dell’abbonamento.',
            'Puoi opporti al trasferimento all’estero. Se non attivi il backup e non ti abboni, tali trasferimenti non avvengono, e tutte le altre funzioni, compresa la scrittura delle voci, restano disponibili.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'Dal giorno in cui viene pubblicata la versione che include i resoconti di sintesi con IA',
      summary:
        'Vengono aggiunti i resoconti di sintesi con IA. Soltanto quando crei tu un resoconto, il contenuto delle tue voci di quel periodo passa non cifrato dal server del gestore e viene inviato al fornitore di IA. Il gestore non conserva quel contenuto; il fornitore di IA lo mantiene fino a 30 giorni per il monitoraggio degli abusi, poi lo elimina, e non lo usa per addestrare modelli.',
      sections: [
        {
          h: 'a. Che cosa cambia (prima → dopo)',
          body: [
            'Prima: titoli e testo delle voci non vengono trasmessi fuori dal tuo dispositivo. Anche con il backup attivo, vengono trasmessi solo come testo cifrato che il gestore non può leggere.',
            'Dopo: **soltanto quando tocchi tu “Crea resoconto”**, il contenuto delle voci di quel periodo viene inviato **non cifrato** attraverso il server del gestore al fornitore di IA e viene generata una sintesi.',
            '⚠ Per essere precisi: il gestore **non conserva** quel contenuto. Ma nel momento in cui la sintesi viene scritta, il contenuto passa dal server del gestore — quindi non possiamo dirti che “il gestore non può vederlo”. Lo diciamo chiaramente invece di sfumarlo.',
            'Se non crei resoconti, questa trasmissione non avviene affatto, e tutte le altre funzioni, compresa la scrittura delle voci, restano disponibili.',
          ],
        },
        {
          h: 'b. Consenso specifico per i dati sensibili',
          body: [
            'I diari possono contenere dati sensibili ai sensi dell’art. 23 della Legge sulla protezione delle informazioni personali, come lo stato di salute o lo stato psicologico.',
            'Poiché i resoconti di sintesi con IA trattano quel contenuto non cifrato, raccogliamo un **consenso specifico al trattamento dei dati sensibili** la prima volta che usi la funzione. Tale consenso è **indipendente** da quello per il trasferimento all’estero di cui alla lettera (c), e ciascuno può essere scelto separatamente.',
            'Se non lo presti, puoi comunque usare tutte le funzioni tranne i resoconti con IA.',
          ],
        },
        {
          h: 'c. Consenso specifico per il trasferimento all’estero',
          body: [
            'Il fornitore di IA si trova fuori dalla Corea. Nome del fornitore, Paese destinatario e recapiti sono indicati in questa lettera al momento del rilascio della funzione e sono mostrati anche nell’app prima della raccolta del consenso.',
            '• Dati trasferiti: titolo, testo, emozione e data delle voci del periodo per cui hai chiesto il resoconto',
            '• Finalità: generare il resoconto di sintesi',
            '• Quando e come: trasmessi in rete quando tocchi “Crea resoconto”',
            '• Conservazione: il server del gestore **non conserva nulla** — mantiene il contenuto in memoria solo mentre la sintesi viene scritta e poi lo scarta. Il fornitore di IA lo mantiene **fino a 30 giorni** per il monitoraggio degli abusi e poi lo elimina, e anche in quel periodo **non lo usa per addestrare modelli.**',
            'Puoi opporti al trasferimento all’estero; in tal caso saranno indisponibili solo i resoconti con IA e tutte le altre funzioni continueranno a funzionare.',
          ],
        },
        {
          h: 'd. Che cosa conserva il gestore (e che non è il contenuto delle voci)',
          body: [
            'Non conserviamo il contenuto delle voci, ma conserviamo quanto segue.',
            '• L’identificatore dell’account che ha creato il resoconto, il periodo, il numero di volte e il numero di token usati — servono per la fatturazione e la prevenzione degli abusi.',
            '• Conservazione: fino al raggiungimento della finalità o fino all’eliminazione del tuo account',
            'Il testo del resoconto finito è conservato **solo sul tuo dispositivo** e, se hai il backup attivo, vi è incluso in forma cifrata.',
          ],
        },
        {
          h: 'e. I tuoi diritti',
          body: [
            '• I resoconti sono generati solo quando li crei tu; non vengono mai generati automaticamente.',
            '• Puoi eliminare in qualsiasi momento, dall’app, un resoconto che hai creato.',
            '• Le sintesi generate dall’IA possono discostarsi dai fatti e non costituiscono una diagnosi né un consiglio medico o psicologico. L’app offre un modo per segnalare una sintesi.',
          ],
        },
      ],
    },
  ],
};
