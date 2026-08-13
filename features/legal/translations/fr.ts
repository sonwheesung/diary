import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Politique de confidentialité — français.
 *
 * 🔴 **Le texte coréen fait foi.** Ceci est une traduction de confort ; en cas de divergence,
 *   c’est `legal-text.ts` (coréen) qui prévaut.
 * ⚠ **La structure doit correspondre exactement au coréen** — même nombre de sections et de
 *   lignes dans chacune. `npm run check:legal` le vérifie.
 */
export const PRIVACY_FR: LegalDoc = {
  title: 'Politique de confidentialité de Jogak',
  sourceFingerprint: 'e1010878',
  effective: '2026-08-09',
  updated: '2026-08-11',
  intro:
    'Vivace Games (« l’exploitant ») respecte la loi sur la protection des informations personnelles et les autres textes applicables, et traite les données personnelles des utilisateurs de « Jogak » (« le service ») comme indiqué ci-dessous. Jogak n’envoie à aucun serveur les entrées de journal que vous écrivez et, par principe, ne recueille que le minimum d’informations nécessaires.',
  sections: [
    {
      h: '1. Ce que nous ne recueillons pas (dit en premier)',
      body: [
        'L’exploitant ne recueille pas les informations suivantes et ne les transmet pas hors de votre appareil.',
        '• Les titres, le texte, les listes, les photos, les tags et les émotions de vos entrées — conservés uniquement dans le stockage interne de votre appareil.',
        '• Le code PIN, le schéma ou la réponse à la question de rappel du verrouillage — conservés dans le stockage sécurisé de l’appareil uniquement sous une forme non réversible (une empreinte), l’original n’étant stocké nulle part.',
        '• Votre nom, date de naissance, numéro de téléphone, adresse, liste de contacts, position, ni aucun relevé d’accès à l’ensemble de votre photothèque.',
        'Les photos que vous choisissez dans l’application sont seulement copiées dans le dossier propre à l’application sur votre appareil afin d’être insérées dans une entrée ; elles ne sont transmises nulle part.',
      ],
    },
    {
      h: '2. Données personnelles que nous recueillons',
      body: [
        'a. Lorsque vous utilisez « Nous contacter » (connexion requise)',
        '• Obligatoire : l’adresse e-mail de votre compte Google et l’identifiant unique du compte social (le « sub » Google)',
        '  — Base légale : loi sur la protection des informations personnelles, art. 15(1)4 (nécessaire pour exécuter les mesures demandées par l’utilisateur, à savoir répondre à sa demande)',
        '  — Finalité : identifier l’auteur du message, envoyer la réponse et vous permettre de consulter votre propre historique',
        '• Catégorie et contenu de la demande',
        '• Type d’appareil (Android/iOS) et version de l’application — pour comprendre dans quel environnement le problème est survenu',
        '※ La connexion n’est nécessaire que pour « Nous contacter » ; l’écriture d’entrées, le verrouillage et les autres fonctions n’en ont pas besoin.',
        '※ Les enfants de moins de 14 ans ne peuvent pas utiliser la fonction de connexion.',
        'b. Informations recueillies automatiquement lors de la diffusion des publicités',
        '• Identifiant publicitaire (identifiant publicitaire Android), informations sur l’appareil et le réseau, relevés d’affichages et de clics',
        '• Ces éléments sont recueillis par Google (AdMob) ; les détails et les modalités d’opposition figurent à la section 7.',
      ],
    },
    {
      h: '3. Finalités du traitement',
      body: [
        '• Réception et traitement des demandes : examiner ce que vous avez envoyé, puis identifier et corriger les défauts',
        '• Identification de l’auteur et réponse : vous transmettre la réponse et vous permettre de revoir votre propre historique',
        '• Diffusion de publicités : proposer des publicités aux utilisateurs de la version gratuite et en mesurer la performance',
        'L’exploitant n’utilise pas les données personnelles à d’autres fins que celles ci-dessus et, en cas de changement de finalité, recueillera votre consentement au préalable.',
      ],
    },
    {
      h: '4. Durées de conservation et d’utilisation',
      body: [
        '• Informations de compte (adresse e-mail, « sub » Google) : jusqu’à la suppression de votre compte. À la suppression, nous les détruisons sans délai ou les rendons non traçables.',
        '• Contenu des demandes : 3 ans à compter de la réception (loi sur la protection des consommateurs dans le commerce électronique — relevés relatifs aux réclamations ou au règlement des litiges)',
        '• Données comportementales fondées sur l’identifiant publicitaire : jusqu’à 1 an à compter du recueil',
        'Une fois la durée écoulée ou la finalité atteinte, nous détruisons les données sans délai.',
      ],
    },
    {
      h: '5. Communication à des tiers',
      body: [
        'L’exploitant ne communique pas les données personnelles des utilisateurs à des tiers.',
        'Font exception les cas où une disposition légale particulière l’impose, ou lorsqu’une autorité d’enquête en fait la demande selon les procédures et formes prévues par la loi.',
      ],
    },
    {
      h: '6. Sous-traitance et transfert hors du pays',
      body: [
        'Pour fournir le service, l’exploitant sous-traite le traitement comme suit, une partie ayant lieu hors de Corée.',
        '• Google LLC — Pays : États-Unis. Contact : https://support.google.com/policies/contact/general_privacy_form. Finalité : diffusion et mesure des publicités (AdMob), connexion au compte Google. Données : identifiant publicitaire, informations sur l’appareil et le réseau et, lors de la connexion, l’adresse e-mail et l’identifiant du compte. Quand et comment : transmises par le réseau lors d’une demande de publicité et lors de la connexion. Conservation : selon la politique de confidentialité de Google',
        '• Supabase Inc. — Pays : États-Unis (siège social). Contact : privacy@supabase.com. Finalité : stocker en base de données les informations de demandes et de comptes. Données : celles de la section 2(a). Quand et comment : transmises par le réseau lors de l’envoi d’une demande. Conservation : les durées de la section 4. ※ Le lieu physique de stockage est la République de Corée (région de Séoul), mais nous l’indiquons comme transfert hors du pays car la société exploitante est située hors de Corée.',
        '• Vercel Inc. — Pays : États-Unis. Contact : privacy@vercel.com. Finalité : exploiter le serveur qui reçoit les demandes. Données : celles de la section 2(a). Quand et comment : transmises par le réseau lors de l’envoi d’une demande. Conservation : jusqu’à la fin du contrat de sous-traitance',
        'Vous pouvez refuser le transfert de vos données hors du pays. Pour refuser les transferts liés à la publicité, désactivez les publicités personnalisées selon la section 7 ; pour refuser ceux liés aux demandes, il suffit de ne pas utiliser « Nous contacter » (toutes les autres fonctions, dont l’écriture d’entrées, restent disponibles).',
      ],
    },
    {
      h: '7. Identifiants publicitaires et autres dispositifs de collecte automatique, et modalités d’opposition',
      body: [
        'Le service utilise Google AdMob pour diffuser des publicités aux utilisateurs de la version gratuite. AdMob peut recueillir et utiliser un identifiant publicitaire afin de proposer des publicités personnalisées.',
        'Finalité du recueil : proposer des publicités personnalisées, mesurer leur performance et prévenir les clics frauduleux',
        'Modalités d’opposition (Android) : Paramètres > Confidentialité > Annonces > « Supprimer l’identifiant publicitaire » ou « Désactiver la personnalisation des annonces »',
        'Modalités d’opposition (iOS) : Réglages > Confidentialité et sécurité > Suivi > désactivez « Autoriser les app à demander de vous suivre »',
        'Même en cas d’opposition, des publicités peuvent continuer à s’afficher, mais il s’agira de publicités génériques non fondées sur vos centres d’intérêt.',
        'Pour en savoir plus sur le traitement des données personnelles par Google à des fins publicitaires : https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Procédure et modalités de destruction',
      body: [
        'Procédure : les données personnelles dont la durée est écoulée ou la finalité atteinte sont détruites sans délai. Lorsque la loi impose leur conservation, elles sont conservées séparément des autres pendant cette durée puis détruites.',
        'Modalités : les informations sous forme de fichier électronique sont supprimées définitivement par des moyens techniques rendant impossible toute récupération ou reconstitution.',
        'Les entrées, photos et informations de verrouillage enregistrées sur votre appareil en sont retirées lorsque vous utilisez la fonction « Tout réinitialiser » de l’application ou que vous la désinstallez. L’exploitant ne détient pas ces informations et ne peut donc pas les supprimer à votre place.',
      ],
    },
    {
      h: '9. Droits de la personne concernée et de son représentant légal, et modalités d’exercice',
      body: [
        'Vous pouvez exercer à tout moment les droits suivants.',
        '• Demander l’accès à vos données • Demander la rectification en cas d’erreur • Demander l’effacement • Demander la suspension du traitement • Demander la transmission de vos données (loi sur la protection des informations personnelles, art. 35-2)',
        'Vous pouvez les exercer par écrit ou par e-mail à l’adresse figurant à la section 11, et l’exploitant agira sans délai.',
        'Si vous demandez la rectification d’une erreur dans vos données, nous ne les utiliserons ni ne les communiquerons tant que la rectification n’est pas achevée.',
        'Le représentant légal d’un enfant de moins de 14 ans peut exercer les droits ci-dessus en son nom.',
      ],
    },
    {
      h: '10. Mesures de sécurité',
      body: [
        '• Organisationnelles : limiter au minimum le nombre de personnes traitant des données personnelles et les former régulièrement',
        '• Techniques : gestion des droits d’accès au système de traitement, chiffrement en transit (HTTPS), stockage du secret de verrouillage sous forme d’empreinte et utilisation du stockage sécurisé de l’appareil (Keystore/Keychain)',
        '• Physiques : les serveurs hébergeant des données personnelles se trouvent dans les centres de données de fournisseurs cloud nationaux et étrangers et suivent leurs politiques de contrôle d’accès physique.',
        '⚠ La fonction de verrouillage empêche l’accès à l’écran ; elle ne chiffre pas les fichiers de journal enregistrés sur l’appareil. Si l’appareil est perdu ou dérobé et que sa propre sécurité est contournée, le contenu des entrées peut être exposé.',
      ],
    },
    {
      h: '11. Responsable de la protection des données et service chargé des demandes d’accès',
      body: [
        'L’exploitant assume la responsabilité générale du traitement des données personnelles et désigne le responsable ci-dessous pour traiter les réclamations et les demandes de réparation des utilisateurs.',
        '• Responsable de la protection des données : Son Hwi-seong (fonction : représentant)',
        '• Contact : support@vivace-games.com',
        '• Service chargé de recevoir et de traiter les demandes d’accès : le même',
        'Vous pouvez adresser au responsable toute question, réclamation ou demande de réparation en matière de protection des données survenant lors de l’utilisation du service. L’exploitant répondra et agira sans délai.',
      ],
    },
    {
      h: '12. Voies de recours en cas d’atteinte à vos droits',
      body: [
        'Pour obtenir réparation d’une atteinte à vos données personnelles, vous pouvez saisir les organismes coréens suivants pour une médiation ou un conseil.',
        '• Commission de médiation des litiges relatifs aux informations personnelles : 1833-6972 (depuis la Corée) / www.kopico.go.kr',
        '• Centre de signalement des atteintes à la vie privée : 118 (depuis la Corée) / privacy.kisa.or.kr',
        '• Parquet suprême, division des enquêtes cybernétiques : 1301 (depuis la Corée) / www.spo.go.kr',
        '• Agence nationale de police, bureau des enquêtes cybernétiques : 182 (depuis la Corée) / ecrm.police.go.kr',
        'En outre, toute personne dont les droits ou intérêts sont lésés par une décision ou une abstention du responsable d’un organisme public concernant une demande fondée sur les art. 35 (accès), 36 (rectification et effacement) ou 37 (suspension du traitement) de la loi sur la protection des informations personnelles peut former un recours administratif conformément à la loi sur les recours administratifs.',
      ],
    },
    {
      h: '13. Modifications de la présente politique',
      body: [
        'La présente politique s’applique à compter de sa date d’entrée en vigueur.',
        'En cas d’ajout, de suppression ou de modification de contenu en raison d’évolutions légales, politiques ou techniques en matière de sécurité, nous en informerons par des annonces dans l’application à partir de 7 jours avant la prise d’effet (30 jours avant si la modification est défavorable aux utilisateurs).',
        'Les modifications à venir sont publiées à l’avance sous « Modifications à venir », au bas du présent document, dans un format permettant de comparer l’avant et l’après.',
        'Historique des modifications',
        '• 2026-08-09 première version',
        '• 2026-08-11 publication d’une modification à venir — introduction prévue de l’abonnement mensuel et de la sauvegarde/restauration (le texte principal n’a pas encore changé)',
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'À compter du jour de publication de la version incluant l’abonnement mensuel et la sauvegarde/restauration',
      summary:
        'L’abonnement mensuel et la sauvegarde/restauration sont ajoutés. Si vous vous abonnez, l’état de l’abonnement et l’identifiant de transaction sont traités ; et uniquement si vous activez la sauvegarde, une copie de vos entrées chiffrée sur votre appareil est conservée sur le serveur de l’exploitant. L’exploitant ne peut pas déchiffrer cette copie.',
      sections: [
        {
          h: 'a. Ce qui change (avant → après)',
          body: [
            'Avant : les titres, le texte et les photos de vos entrées ne sont pas transmis hors de votre appareil.',
            'Après : **uniquement si vous activez vous-même la sauvegarde**, une copie de vos entrées chiffrée sur votre appareil est conservée sur le serveur de l’exploitant. Si vous ne l’activez pas, pas un seul caractère n’est transmis, exactement comme avant.',
            '⚠ Pour être précis : l’exploitant **conserve cette copie mais ne peut pas la lire.** La clé de déchiffrement n’existe que sur votre appareil et dans le code de récupération que vous conservez ; l’exploitant ne l’a pas.',
          ],
        },
        {
          h: 'b. Informations supplémentaires conservées si vous activez la sauvegarde',
          body: [
            '• Une copie chiffrée de vos entrées — sous une forme que l’exploitant ne peut pas déchiffrer',
            '• Identifiant de sauvegarde, heure de la sauvegarde, numéro de génération et taille — **ces informations ne sont pas chiffrées.** L’exploitant peut savoir quel compte a sauvegardé, quand et quel volume.',
            '• Base légale : votre consentement distinct (recueilli sur l’écran où vous activez la sauvegarde)',
          ],
        },
        {
          h: 'c. Durée de conservation',
          body: [
            '• Conservée tant que la sauvegarde est activée, et jusqu’à 90 jours après la fin de l’abonnement, puis détruite automatiquement.',
            '• Si vous désactivez la sauvegarde, demandez sa suppression ou supprimez votre compte, nous la détruisons sans délai, sans attendre les 90 jours.',
            '• Les sauvegardes sans accès depuis 3 ans ou plus sont détruites. (Cas où l’application a été désinstallée sans suppression du compte.)',
            '• Le relevé de la destruction (identifiant de sauvegarde et heure) est conservé 1 an — afin que vous puissiez savoir « pourquoi la restauration ne fonctionne pas » ; l’identifiant du compte n’est pas conservé avec lui.',
            '⚠ L’avis d’expiration de l’abonnement ne vous parvient qu’à l’écran, à l’ouverture de l’application. Si vous ne l’ouvrez pas, cet avis peut ne pas vous parvenir.',
          ],
        },
        {
          h: 'd. Limites du droit d’accès',
          body: [
            'Si vous demandez l’accès à votre sauvegarde, l’exploitant ne peut vous remettre que **le texte chiffré, indéchiffrable, et les métadonnées du point (b).** Nous ne pouvons pas vous fournir vos entrées sous une forme lisible — l’exploitant n’a pas la clé.',
            'Vous pouvez vous-même restaurer à tout moment dans l’application à l’aide de votre code de récupération.',
            '⚠ Si vous perdez votre code de récupération, il n’existe aucun moyen d’ouvrir la sauvegarde. L’exploitant ne peut pas l’ouvrir non plus.',
          ],
        },
        {
          h: 'e. Informations conservées si vous utilisez un abonnement',
          body: [
            '• État de l’abonnement — clé de droit, date d’expiration, délai de grâce en cas d’échec de paiement, renouvellement prévu ou non',
            '• L’identifiant de transaction délivré par la boutique, l’identifiant du produit et l’environnement d’achat (production ou test)',
            '• Les relevés de changement d’état envoyés par le service de paiement (achat, renouvellement, résiliation, remboursement, etc.) et leur contenu d’origine',
            '⚠ Les données de paiement telles que les numéros de carte ou de compte sont gérées par Google Play et ne sont pas transmises à l’exploitant. L’exploitant sait seulement que vous avez payé et jusqu’à quand l’abonnement est valable.',
            '• Base légale : loi sur la protection des informations personnelles, art. 15(1)4 (nécessaire pour exécuter les mesures demandées par l’utilisateur, à savoir fournir le droit d’abonnement souscrit)',
            '• Finalité : vérifier le droit d’abonnement (suppression des publicités, usage de la sauvegarde), traiter les demandes de paiement et les remboursements',
          ],
        },
        {
          h: 'f. Durée de conservation des informations d’abonnement',
          body: [
            '• Relevés relatifs aux contrats ou à la rétractation, et au paiement et à la fourniture de biens : 5 ans (loi sur la protection des consommateurs dans le commerce électronique, art. 6)',
            '• Si vous supprimez votre compte, les identifiants de compte (e-mail, « sub » Google) sont rendus non traçables sans délai, et les relevés de transaction ci-dessus sont conservés séparément et sous une forme non traçable pendant la durée indiquée, puis détruits.',
            '⚠ La suppression de votre compte ne résilie pas automatiquement votre abonnement Google Play. Vous devez le résilier vous-même dans Google Play > Abonnements ; à défaut, vous continuerez à être facturé.',
          ],
        },
        {
          h: 'g. Sous-traitance et transfert hors du pays (complément)',
          body: [
            '• Supabase Inc. — Pays : États-Unis (siège social). Contact : privacy@supabase.com. Finalité : stocker la copie de sauvegarde chiffrée et l’état de l’abonnement. Données : celles des points (b) et (e). Conservation : les durées des points (c) et (f). ※ Le lieu physique de stockage est la République de Corée (région de Séoul).',
            '• Vercel Inc. — Pays : États-Unis. Contact : privacy@vercel.com. Finalité : exploiter le serveur de sauvegarde. ※ La copie chiffrée est envoyée directement au stockage sans passer par ce serveur.',
            '• RevenueCat, Inc. — Pays : États-Unis. Contact : compliance@revenuecat.com. Finalité : vérifier les paiements d’abonnement et contrôler son état. Données : identifiant de compte, identifiants de transaction et de produit de la boutique, informations sur l’appareil et l’application. Quand et comment : transmises par le réseau à l’ouverture de l’écran d’abonnement et lors du paiement. Conservation : jusqu’à la fin du contrat de sous-traitance',
            '• Google LLC — outre le transfert décrit à la section 6, des informations de transaction de la boutique sont traitées aux fins du traitement et de la vérification des paiements d’abonnement.',
            'Vous pouvez refuser le transfert hors du pays. Si vous n’activez pas la sauvegarde et ne vous abonnez pas, ces transferts n’ont pas lieu, et toutes les autres fonctions, dont l’écriture d’entrées, restent disponibles.',
          ],
        },
      ],
    },
    {
      appliesFrom:
        'À compter du jour de publication de la version incluant les bilans de synthèse par IA',
      summary:
        'Les bilans de synthèse par IA sont ajoutés. Uniquement lorsque vous créez vous-même un bilan, le contenu de vos entrées de la période concernée transite en clair par le serveur de l’exploitant et est envoyé au prestataire d’IA. L’exploitant ne conserve pas ce contenu ; le prestataire d’IA le garde jusqu’à 30 jours à des fins de surveillance des abus, puis le supprime, et ne l’utilise pas pour entraîner ses modèles.',
      sections: [
        {
          h: 'a. Ce qui change (avant → après)',
          body: [
            'Avant : les titres et le texte de vos entrées ne sont pas transmis hors de votre appareil. Même avec la sauvegarde activée, ils ne sont transmis que sous forme de texte chiffré que l’exploitant ne peut pas lire.',
            'Après : **uniquement lorsque vous appuyez vous-même sur « Créer un bilan »**, le contenu des entrées de cette période est envoyé **en clair** via le serveur de l’exploitant au prestataire d’IA, et un résumé est généré.',
            '⚠ Pour être précis : l’exploitant **ne conserve pas** ce contenu. Mais au moment où le résumé est rédigé, le contenu transite bien par le serveur de l’exploitant — nous ne pouvons donc pas vous dire que « l’exploitant ne peut pas le voir ». Nous le disons clairement plutôt que de l’estomper.',
            'Si vous ne créez pas de bilan, cette transmission n’a pas lieu du tout, et toutes les autres fonctions, dont l’écriture d’entrées, restent disponibles.',
          ],
        },
        {
          h: 'b. Consentement distinct pour les informations sensibles',
          body: [
            'Les journaux peuvent contenir des informations sensibles au sens de l’art. 23 de la loi sur la protection des informations personnelles, telles que l’état de santé ou l’état psychique.',
            'Comme les bilans de synthèse par IA traitent ce contenu en clair, nous recueillons un **consentement distinct au traitement des informations sensibles** lors de votre première utilisation de la fonction. Ce consentement est **indépendant** de celui relatif au transfert hors du pays au point (c), et chacun peut être choisi séparément.',
            'Si vous ne le donnez pas, vous pouvez continuer à utiliser toutes les fonctions à l’exception des bilans par IA.',
          ],
        },
        {
          h: 'c. Consentement distinct pour le transfert hors du pays',
          body: [
            'Le prestataire d’IA est situé hors de Corée. Son nom, le pays destinataire et ses coordonnées sont indiqués dans ce point au moment de la mise en service de la fonction, et sont également affichés dans l’application avant le recueil du consentement.',
            '• Données transférées : le titre, le texte, l’émotion et la date des entrées de la période pour laquelle vous avez demandé un bilan',
            '• Finalité : générer le bilan de synthèse',
            '• Quand et comment : transmises par le réseau lorsque vous appuyez sur « Créer un bilan »',
            '• Conservation : le serveur de l’exploitant **ne le conserve pas** — il ne le garde en mémoire que le temps de rédiger le résumé, puis le supprime. Le prestataire d’IA le conserve **jusqu’à 30 jours** à des fins de surveillance des abus puis le supprime, et même durant cette période **ne l’utilise pas pour entraîner ses modèles.**',
            'Vous pouvez refuser le transfert hors du pays ; dans ce cas, seuls les bilans par IA deviennent indisponibles et toutes les autres fonctions continuent de fonctionner.',
          ],
        },
        {
          h: 'd. Ce que l’exploitant conserve (et qui n’est pas le contenu de vos entrées)',
          body: [
            'Nous ne conservons pas le contenu des entrées, mais nous conservons ce qui suit.',
            '• L’identifiant du compte ayant créé le bilan, la période, le nombre de fois et le nombre de jetons utilisés — pour la facturation et la prévention des abus.',
            '• Conservation : jusqu’à la réalisation de la finalité ou jusqu’à la suppression de votre compte',
            'Le texte du bilan terminé est conservé **uniquement sur votre appareil** et, si la sauvegarde est activée, il y est inclus sous forme chiffrée.',
          ],
        },
        {
          h: 'e. Vos droits',
          body: [
            '• Les bilans ne sont générés que lorsque vous les créez vous-même ; ils ne le sont jamais automatiquement.',
            '• Vous pouvez supprimer à tout moment, dans l’application, un bilan que vous avez créé.',
            '• Les résumés générés par IA peuvent s’écarter des faits et ne constituent ni un diagnostic ni un conseil médical ou psychologique. L’application propose un moyen de signaler un résumé.',
          ],
        },
      ],
    },
  ],
};
