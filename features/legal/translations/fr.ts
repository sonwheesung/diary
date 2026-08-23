import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Politique de confidentialité — français.
 *
 * 🔴 **Le texte coréen fait foi.** Ceci est une traduction de confort ; en cas de divergence,
 *   c’est `legal-text.ts` (coréen) qui prévaut.
 * ⚠ **La structure doit correspondre exactement au coréen** — même nombre de sections et de
 *   lignes dans chacune. `npm run check:legal` le vérifie.
 *
 * ⚠ **Vouvoiement.** Les chaînes d’interface tutoient, les avis juridiques vouvoient.
 *   Ce document est un avis juridique : `vous` partout.
 *
 * 🔴 **La sauvegarde et l’IA disent l’inverse l’une de l’autre.** Ne pas les fondre en une
 *   seule phrase :
 *     sauvegarde = conservée mais illisible → « conserve … mais ne peut pas la lire »
 *     IA         = lue mais non conservée  → « ne conserve pas … », jamais « ne peut pas le voir »
 *   Le coréen reconnaît expressément qu’on ne peut pas dire que l’exploitant « ne peut pas le
 *   voir ». Atténuer cette phrase rendrait l’avis juridique mensonger.
 */
export const PRIVACY_FR: LegalDoc = {
  title: 'Politique de confidentialité de Jogak',
  sourceFingerprint: '47ec2dc4',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Vivace Games (« l’exploitant ») respecte la loi sur la protection des informations personnelles et les autres textes applicables, et traite les données personnelles des utilisateurs de « Jogak » (« le service ») comme indiqué ci-dessous. Par principe, Jogak conserve sur votre appareil les entrées de journal que vous écrivez ; celles-ci ne sont transmises à un serveur que dans deux cas : la sauvegarde que vous activez vous-même et les rapports de synthèse par IA que vous créez vous-même. Pour le reste, nous ne recueillons que le minimum d’informations.',
  sections: [
    {
      h: '1. Nous vous disons d’abord où votre journal est conservé',
      body: [
        'Les entrées (titre, texte, listes, photos, tags et émotions) sont conservées dans le stockage interne de votre appareil et, par défaut, n’en sortent pas.',
        '⚠ Il n’existe que deux exceptions, et uniquement si vous les choisissez vous-même. Aucune des deux ne se produit automatiquement.',
        '• Si vous activez la sauvegarde — une copie de vos entrées, chiffrée sur votre appareil, est conservée sur le serveur de l’exploitant. L’exploitant ne peut pas lire cette copie. Les détails figurent à la section 2(c).',
        '• Si vous créez un rapport de synthèse par IA — le contenu du journal de la période concernée transite non chiffré par le serveur de l’exploitant et est remis au fournisseur d’IA. L’exploitant ne conserve pas ce contenu. Les détails figurent à la section 2(e).',
        '⚠ Ces deux phrases ne disent pas la même chose : l’exploitant conserve la copie de sauvegarde mais ne peut pas la lire, tandis que le contenu envoyé à l’IA, il le lit mais ne le conserve pas. Nous vous le disons tel quel, sans l’atténuer.',
        'L’exploitant ne recueille en aucun cas les informations suivantes et ne les transmet pas hors de votre appareil.',
        '• Le code PIN, le schéma ou la réponse à la question de rappel du verrouillage — conservés dans le stockage sécurisé de l’appareil uniquement sous une forme non réversible (une empreinte), l’original n’étant stocké nulle part.',
        '• Votre nom, date de naissance, numéro de téléphone, adresse, liste de contacts, position, ni aucun relevé d’accès à l’ensemble de votre photothèque.',
        'Les photos que vous choisissez dans l’application sont copiées dans le dossier propre à l’application sur votre appareil afin d’être insérées dans une entrée et, si vous n’activez pas la sauvegarde, elles ne sont transmises nulle part. Aucune photo n’est transmise aux rapports de synthèse par IA.',
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
        '※ La connexion est nécessaire pour « Nous contacter », l’abonnement, la sauvegarde et les rapports par IA ; l’écriture d’entrées, le verrouillage et les autres fonctions n’en ont pas besoin.',
        '※ Les enfants de moins de 14 ans ne peuvent pas utiliser la fonction de connexion.',
        'b. Informations recueillies automatiquement lors de la diffusion des publicités',
        '• Identifiant publicitaire (identifiant publicitaire Android), informations sur l’appareil et le réseau, relevés d’affichages et de clics',
        '• Ces éléments sont recueillis par Google (AdMob) ; les détails et les modalités d’opposition figurent à la section 7.',
        'c. Si vous activez la sauvegarde (abonnement requis)',
        '• Une copie chiffrée de vos entrées — sous une forme que l’exploitant ne peut pas déchiffrer',
        '• Identifiant de sauvegarde, heure de la sauvegarde, numéro de génération et taille — ces informations ne sont pas chiffrées. L’exploitant peut savoir quel compte a sauvegardé, quand et quel volume.',
        '  — Base légale : votre consentement distinct (recueilli sur l’écran où vous activez la sauvegarde)',
        '⚠ Pour être précis : l’exploitant conserve cette copie mais ne peut pas la lire. La clé de déchiffrement n’existe que sur votre appareil et dans le code de récupération que vous conservez ; l’exploitant ne l’a pas.',
        '⚠ Si vous perdez votre code de récupération, il n’existe aucun moyen d’ouvrir la sauvegarde. L’exploitant ne peut pas l’ouvrir non plus.',
        'd. Si vous utilisez un abonnement',
        '• État de l’abonnement — clé de droit, date d’expiration, délai de grâce en cas d’échec de paiement, renouvellement prévu ou non',
        '• L’identifiant de transaction délivré par la boutique, l’identifiant du produit et l’environnement d’achat (production ou test)',
        '• Les relevés de changement d’état de l’abonnement envoyés par le service de paiement (achat, renouvellement, résiliation, remboursement, etc.) et leur contenu d’origine',
        '  — Base légale : loi sur la protection des informations personnelles, art. 15(1)4 (nécessaire pour exécuter les mesures demandées par l’utilisateur, à savoir fournir le droit d’abonnement souscrit)',
        '  — Finalité : vérifier le droit d’abonnement (suppression des publicités, sauvegarde et rapports par IA), traiter les demandes de paiement et les remboursements',
        '⚠ Les données de paiement telles que les numéros de carte ou de compte sont gérées par Google Play et ne sont pas transmises à l’exploitant. L’exploitant sait seulement que vous avez payé et jusqu’à quand l’abonnement est valable.',
        'e. Si vous créez des rapports de synthèse par IA (abonnement requis)',
        '• Ce qui est remis au fournisseur d’IA via le serveur de l’exploitant : le titre, le texte, l’émotion et la date des entrées de la période pour laquelle vous avez demandé un rapport',
        '• Ce que l’exploitant conserve : la synthèse générée par l’IA, l’identifiant du compte ayant créé le rapport, la période, le nombre de fois et le nombre de jetons utilisés',
        '⚠ Pour être précis : l’exploitant ne conserve pas le contenu du journal lui-même. Toutefois, ① au moment où la synthèse est produite, ce contenu transite par le serveur de l’exploitant : nous ne pouvons donc pas vous dire que « l’exploitant ne peut pas le voir », et ② la synthèse générée est conservée 90 jours. Nous vous le disons tel quel, sans l’atténuer.',
        '⚠ La synthèse est rédigée à partir de vos entrées ; elle peut donc contenir le contenu de votre journal.',
        '• Consentement distinct pour les informations sensibles : un journal peut contenir des informations sensibles, telles que l’état de santé ou psychologique, au sens de l’art. 23 de la loi sur la protection des informations personnelles. Les rapports de synthèse par IA traitant ce contenu non chiffré, nous recueillons un consentement distinct au traitement des informations sensibles lors de votre première utilisation de la fonctionnalité. Ce consentement est distinct du consentement au transfert hors du pays de la section 6, et vous pouvez choisir chacun séparément.',
        'Même si vous ne le donnez pas, vous pouvez continuer à utiliser normalement toutes les fonctionnalités autres que les rapports par IA. Les rapports ne sont générés que lorsque vous les créez vous-même ; ils ne le sont jamais automatiquement.',
      ],
    },
    {
      h: '3. Finalités du traitement',
      body: [
        '• Réception et traitement des demandes : examiner ce que vous avez envoyé, puis identifier et corriger les défauts',
        '• Identification de l’auteur et réponse : vous transmettre la réponse et vous permettre de revoir votre propre historique',
        '• Diffusion de publicités : proposer des publicités aux utilisateurs de la version gratuite et en mesurer la performance',
        '• Sauvegarde et restauration : si vous l’activez, conserver une copie chiffrée de vos entrées et vous la restituer à votre demande',
        '• Vérification du droit d’abonnement : fournir aux personnes ayant payé la suppression des publicités, la sauvegarde et les rapports par IA, et traiter les demandes de paiement et les remboursements',
        '• Génération des rapports de synthèse par IA et amélioration de leur qualité : produire la synthèse de la période que vous avez demandée et en examiner le résultat pour améliorer la qualité',
        'L’exploitant n’utilise pas les données personnelles à d’autres fins que celles ci-dessus et, en cas de changement de finalité, recueillera votre consentement au préalable.',
      ],
    },
    {
      h: '4. Durées de conservation et d’utilisation',
      body: [
        '• Informations de compte (adresse e-mail, « sub » Google) : jusqu’à la suppression de votre compte. À la suppression, nous les détruisons sans délai ou les rendons non traçables.',
        '• Contenu des demandes : 3 ans à compter de la réception (loi sur la protection des consommateurs dans le commerce électronique — relevés relatifs aux réclamations ou au règlement des litiges)',
        '• Données comportementales fondées sur l’identifiant publicitaire : jusqu’à 1 an à compter du recueil',
        '• Copie de sauvegarde chiffrée : conservée tant que la sauvegarde est activée et jusqu’à 90 jours après la fin de l’abonnement, puis détruite automatiquement. Si vous désactivez la sauvegarde, demandez sa suppression ou supprimez votre compte, nous la détruisons sans délai, sans attendre les 90 jours. Les sauvegardes sans accès depuis 3 ans ou plus sont détruites (cas où l’application a été désinstallée sans suppression du compte).',
        '• Relevé de la destruction d’une sauvegarde (identifiant de sauvegarde et heure de la destruction) : 1 an — afin que vous puissiez savoir « pourquoi la restauration ne fonctionne pas » ; l’identifiant du compte n’est pas conservé avec lui.',
        '• Synthèse générée par l’IA : 90 jours à compter du jour de sa création. Elle est ensuite supprimée automatiquement.',
        '• Relevés d’utilisation des rapports (identifiant du compte, période, nombre de fois, nombre de jetons) : jusqu’à la réalisation de la finalité ou jusqu’à la suppression de votre compte',
        '• Relevés relatifs aux contrats ou à la rétractation, et au paiement et à la fourniture de biens : 5 ans (loi sur la protection des consommateurs dans le commerce électronique, art. 6)',
        'Si vous supprimez votre compte, les identifiants de compte (e-mail, « sub » Google) sont rendus non traçables sans délai, et les relevés de transaction ci-dessus sont conservés séparément et sous une forme non traçable pendant la durée indiquée, puis détruits.',
        '⚠ La suppression de votre compte ne résilie pas automatiquement votre abonnement Google Play. Vous devez le résilier vous-même dans Google Play > Abonnements ; à défaut, vous continuerez à être facturé.',
        '⚠ L’avis de suppression de la sauvegarde à l’expiration de l’abonnement ne vous parvient qu’à l’écran, à l’ouverture de l’application. Si vous ne l’ouvrez pas, cet avis peut ne pas vous parvenir.',
        'Une fois la durée écoulée ou la finalité atteinte, nous détruisons les données sans délai.',
      ],
    },
    {
      h: '5. Communication à des tiers',
      body: [
        'L’exploitant ne communique pas les données personnelles des utilisateurs à des tiers.',
        'Les sociétés mentionnées à la section 6 sont des sous-traitants qui traitent les informations pour le compte de l’exploitant et ne les utilisent pas à leurs propres fins. Le fournisseur d’IA n’utilise pas pour entraîner ses modèles le contenu du journal qui lui est transmis.',
        'Font exception les cas où une disposition légale particulière l’impose, ou lorsqu’une autorité d’enquête en fait la demande selon les procédures et formes prévues par la loi.',
      ],
    },
    {
      h: '6. Sous-traitance et transfert hors du pays',
      body: [
        'Pour fournir le service, l’exploitant sous-traite le traitement comme suit, une partie ayant lieu hors de Corée.',
        '• Google LLC — Pays : États-Unis. Contact : https://support.google.com/policies/contact/general_privacy_form. Finalité : diffusion et mesure des publicités (AdMob), connexion au compte Google, traitement et vérification des paiements d’abonnement. Données : identifiant publicitaire, informations sur l’appareil et le réseau, lors de la connexion l’adresse e-mail et l’identifiant du compte, et informations de transaction de la boutique. Quand et comment : transmises par le réseau lors d’une demande de publicité, lors de la connexion et lors du paiement. Conservation : selon la politique de confidentialité de Google',
        '• Supabase Inc. — Pays : États-Unis (siège social). Contact : privacy@supabase.com. Finalité : stocker en base de données les informations de demandes et de comptes, et conserver la copie de sauvegarde chiffrée et l’état de l’abonnement. Données : celles des sections 2(a), 2(c) et 2(d). Quand et comment : transmises par le réseau lors de l’envoi d’une demande et lors d’une sauvegarde. Conservation : les durées de la section 4. ※ Le lieu physique de stockage est la République de Corée (région de Séoul), mais nous l’indiquons comme transfert hors du pays car la société exploitante est située hors de Corée.',
        '• Vercel Inc. — Pays : États-Unis. Contact : privacy@vercel.com. Finalité : exploiter le serveur qui reçoit les demandes ainsi que les serveurs de sauvegarde et d’IA. Données : celles de la section 2(a). Quand et comment : transmises par le réseau lors de l’envoi d’une demande. Conservation : jusqu’à la fin du contrat de sous-traitance. ※ La copie de sauvegarde chiffrée est envoyée directement au stockage sans passer par ce serveur.',
        '• RevenueCat, Inc. — Pays : États-Unis. Contact : compliance@revenuecat.com. Finalité : vérifier les paiements d’abonnement et contrôler son état. Données : identifiant de compte, identifiants de transaction et de produit de la boutique, informations sur l’appareil et l’application. Quand et comment : transmises par le réseau à l’ouverture de l’écran d’abonnement et lors du paiement. Conservation : jusqu’à la fin du contrat de sous-traitance',
        '• OpenAI OpCo, LLC — Pays : États-Unis (1455 Third Street, San Francisco, California 94158, USA). Contact : dpo@openai.com. Finalité : générer des rapports de synthèse. Données : le titre, le texte, l’émotion et la date des entrées de la période pour laquelle vous avez demandé un rapport. Quand et comment : transmises par le réseau au moment où vous appuyez sur Créer un rapport. Conservation : le serveur de l’exploitant ne conserve pas le contenu du journal — il ne le garde en mémoire que le temps de produire la synthèse, puis le supprime aussitôt. Le fournisseur d’IA le conserve au maximum 30 jours à des fins de surveillance des abus puis le supprime, et même pendant cette période ne l’utilise pas pour entraîner ses modèles.',
        '⚠ Le transfert hors du pays pour les rapports par IA fait l’objet d’un consentement distinct. Lors de votre première utilisation de la fonctionnalité, nous vous présentons les informations ci-dessus dans l’application et recueillons votre consentement ; ce consentement est distinct du consentement relatif aux informations sensibles de la section 2(e).',
        'Vous pouvez refuser le transfert de vos données personnelles hors du pays. Pour refuser les transferts liés à la publicité, désactivez les publicités personnalisées selon la section 7 ; ceux liés aux demandes n’ont pas lieu si vous n’utilisez pas « Nous contacter ». Si vous n’activez pas la sauvegarde, ne vous abonnez pas et ne créez pas de rapport, les transferts correspondants n’ont pas lieu non plus, et toutes les autres fonctions, dont l’écriture d’entrées, restent disponibles.',
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
        'Si vous vous abonnez, aucune publicité n’est affichée et le recueil publicitaire ci-dessus n’a pas lieu non plus.',
        'Pour en savoir plus sur le traitement des données personnelles par Google à des fins publicitaires : https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Procédure et modalités de destruction',
      body: [
        'Procédure : les données personnelles dont la durée est écoulée ou la finalité atteinte sont détruites sans délai. Lorsque la loi impose leur conservation, elles sont conservées séparément des autres pendant cette durée puis détruites.',
        'Modalités : les informations sous forme de fichier électronique sont supprimées définitivement par des moyens techniques rendant impossible toute récupération ou reconstitution.',
        'Les entrées, photos et informations de verrouillage enregistrées sur votre appareil en sont retirées lorsque vous utilisez la fonction « Tout réinitialiser » de l’application ou que vous la désinstallez.',
        'Si vous avez activé la sauvegarde, la copie chiffrée conservée sur le serveur est détruite lorsque vous la supprimez depuis l’écran de sauvegarde de l’application ou lorsque vous supprimez votre compte. Lors de la suppression du compte, nous détruisons d’abord la sauvegarde puis le compte — si le compte disparaissait d’abord, plus personne n’aurait le droit d’effacer cette sauvegarde.',
        'Si vous n’avez pas activé la sauvegarde, l’exploitant ne détient pas les entrées présentes sur votre appareil et ne peut donc pas les supprimer à votre place.',
      ],
    },
    {
      h: '9. Droits de la personne concernée et de son représentant légal, et modalités d’exercice',
      body: [
        'Vous pouvez exercer à tout moment les droits suivants.',
        '• Demander l’accès à vos données • Demander la rectification en cas d’erreur • Demander l’effacement • Demander la suspension du traitement • Demander la transmission de vos données (loi sur la protection des informations personnelles, art. 35-2)',
        'Vous pouvez les exercer par écrit ou par e-mail à l’adresse figurant à la section 11, et l’exploitant agira sans délai.',
        'Si vous demandez la rectification d’une erreur dans vos données, nous ne les utiliserons ni ne les communiquerons tant que la rectification n’est pas achevée.',
        '⚠ Limites du droit d’accès à la sauvegarde : si vous en demandez l’accès, l’exploitant ne peut vous remettre que le texte chiffré, indéchiffrable, et les métadonnées de la section 2(c). Nous ne pouvons pas vous fournir le contenu de vos entrées sous une forme lisible par un être humain — l’exploitant n’a pas la clé. Vous pouvez vous-même restaurer à tout moment dans l’application à l’aide de votre code de récupération.',
        'Vous pouvez supprimer à tout moment dans l’application un rapport par IA déjà créé. La suppression dans l’application l’efface de votre appareil, et la synthèse conservée sur le serveur est supprimée automatiquement au bout de 90 jours. Si vous souhaitez une suppression plus rapide, vous pouvez en faire la demande via « Nous contacter ».',
        '⚠ Les synthèses générées par IA peuvent différer des faits et ne constituent ni un diagnostic ni un conseil médical ou psychologique. L’application propose un moyen de signaler un rapport.',
        'Le représentant légal d’un enfant de moins de 14 ans peut exercer les droits ci-dessus en son nom.',
      ],
    },
    {
      h: '10. Mesures de sécurité',
      body: [
        '• Organisationnelles : limiter au minimum le nombre de personnes traitant des données personnelles et les former régulièrement',
        '• Techniques : gestion des droits d’accès au système de traitement, chiffrement en transit (HTTPS), stockage du secret de verrouillage sous forme d’empreinte et utilisation du stockage sécurisé de l’appareil (Keystore/Keychain)',
        '• Chiffrement de bout en bout de la sauvegarde : la copie de sauvegarde est chiffrée sur votre appareil avant d’être transmise, et la clé de déchiffrement n’existe que sur votre appareil et dans votre code de récupération. Le serveur de l’exploitant n’a pas la clé.',
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
        '• 2026-08-12 publication d’une modification à venir — introduction prévue des rapports de synthèse par IA (le texte principal n’a pas encore changé)',
        '• 2026-08-23 modification — les deux modifications annoncées ci-dessus ont été intégrées au texte principal. Le traitement relatif à l’abonnement mensuel, à la sauvegarde/restauration et aux rapports de synthèse par IA a été ajouté aux sections 1, 2, 3, 4, 6, 8, 9 et 10.',
      ],
    },
  ],
};

/**
 * Suppression de compte — français.
 *
 * 🔴 **Le texte coréen fait foi** (`legal-text.ts`). Même règle que pour la politique de
 *   confidentialité : ceci est une traduction de confort.
 *
 * ⚠ Ce document possède une URL publique propre parce que le formulaire « Sécurité des
 *   données » de Play exige une voie de suppression **web** : une personne ayant déjà
 *   désinstallé l’application doit pouvoir en faire la demande. C’est cette URL qu’ouvrent
 *   les évaluateurs de Play, elle ne peut donc pas rester uniquement en coréen.
 *
 * ⚠ La structure doit correspondre exactement au coréen — 6 sections (6/4/9/5/4/3 lignes)
 *   et aucune modification à venir. `npm run check:legal` le vérifie.
 */
export const DELETE_ACCOUNT_FR: LegalDoc = {
  title: 'Comment supprimer votre compte Jogak',
  sourceFingerprint: 'a8b0c8b9',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Cette page explique comment supprimer votre compte Jogak et les données qui y sont associées. Vous pouvez aussi en faire la demande par e-mail si vous avez déjà désinstallé l’application ou si vous ne parvenez pas à vous connecter.',
  sections: [
    {
      h: '1. Supprimer vous-même depuis l’application',
      body: [
        'En suivant ces étapes dans l’application Jogak, la suppression prend effet immédiatement.',
        '① Ouvrez l’application → onglet [Réglages], en bas',
        '② Choisissez [Nous contacter]',
        '③ Si vous n’êtes pas connecté, connectez-vous avec votre compte Google',
        '④ Choisissez [Supprimer le compte] tout en bas de l’écran, puis confirmez',
        'La suppression du compte est irréversible.',
      ],
    },
    {
      h: '2. Demander par e-mail (si vous avez désinstallé l’application ou ne pouvez pas vous connecter)',
      body: [
        'Envoyez les éléments suivants à support@vivace-games.com.',
        '• Objet : demande de suppression du compte Jogak',
        '• Corps du message : l’adresse e-mail du compte Google avec lequel vous vous êtes connecté à Jogak',
        'L’adresse depuis laquelle vous écrivez doit être la même que celle utilisée à l’inscription, afin que nous puissions vérifier qu’il s’agit bien de vous. Nous traiterons la demande et vous répondrons sous 7 jours ouvrés.',
      ],
    },
    {
      h: '3. Données supprimées',
      body: [
        'À la suppression de votre compte, les informations suivantes sont détruites immédiatement ou rendues non traçables.',
        '• L’identifiant unique de votre compte social (le « sub » Google)',
        '• Votre adresse e-mail',
        '• Le lien entre vos demandes et le compte de leur auteur',
        '• La copie chiffrée de votre journal conservée sur le serveur (si vous avez activé la sauvegarde) — supprimée en même temps que le compte, sans attendre le délai de grâce de 90 jours.',
        '• L’identifiant de sauvegarde et les relevés de sauvegarde (heure, taille, numéro de génération)',
        '• Les synthèses de rapports par IA conservées sur le serveur (au maximum 90 jours) et les relevés d’utilisation des rapports (période, nombre de fois, nombre de jetons)',
        '⚠ Lors de la suppression du compte, nous détruisons d’abord la sauvegarde puis le compte : si le compte disparaissait d’abord, plus personne n’aurait le droit d’effacer cette sauvegarde. Si la destruction de la sauvegarde échoue, la suppression du compte n’a pas lieu ; il vous suffit de réessayer un peu plus tard.',
        '⚠ La suppression est irréversible. Même si vous conservez votre code de récupération, vous ne pourrez pas restaurer la sauvegarde présente sur le serveur.',
      ],
    },
    {
      h: '4. Données conservées et durées',
      body: [
        'Les informations suivantes sont conservées en application de la loi et, même pendant cette durée, elles ne subsistent que sous une forme ne permettant pas de remonter à leur auteur (pseudonymisée).',
        '• Contenu des demandes : 3 ans (loi sur la protection des consommateurs dans le commerce électronique — relevés relatifs aux réclamations ou au règlement des litiges)',
        '• Relevés de transaction d’abonnement (identifiant de transaction, produit, période d’abonnement, historique des changements d’état de paiement) : 5 ans (loi sur la protection des consommateurs dans le commerce électronique, art. 6)',
        '• Relevé de la destruction d’une sauvegarde (identifiant de sauvegarde et heure de la destruction) : 1 an — afin que vous puissiez savoir « pourquoi la restauration ne fonctionne pas » ; l’identifiant de votre compte n’est pas conservé avec lui.',
        'Une fois la durée de conservation écoulée, nous détruisons les données sans délai.',
      ],
    },
    {
      h: '5. Ce qui reste sur votre appareil — la suppression du compte ne l’efface pas',
      body: [
        'Les entrées de Jogak (titres, texte, photos, tags et émotions) et le texte des rapports par IA sont enregistrés à l’intérieur de votre appareil.',
        'La suppression de votre compte laisse donc intacts les entrées et les rapports présents sur votre appareil. Pour les effacer aussi de l’appareil, désinstallez l’application ou lancez la réinitialisation dans les [Réglages] de l’application.',
        'À l’inverse, si vous désinstallez l’application, les entrées de votre appareil ne pourront pas être récupérées. Vous ne pourrez les restaurer que si vous aviez activé la sauvegarde et conservé votre code de récupération, et uniquement avant la suppression de votre compte.',
        '⚠ Si vous n’avez pas activé la sauvegarde, l’exploitant ne détient pas les entrées présentes sur votre appareil : il ne peut donc ni les supprimer ni vous les restituer.',
      ],
    },
    {
      h: '6. L’abonnement doit être résilié séparément',
      body: [
        'La suppression de votre compte ne résilie pas automatiquement votre abonnement Google Play et, si vous ne le résiliez pas, vous continuerez à être facturé.',
        'Pour résilier : application Google Play Store > profil > Paiements et abonnements > Abonnements (https://play.google.com/store/account/subscriptions)',
        'Le remboursement des sommes déjà prélevées relève de la politique de remboursement de Google Play et de celle de l’exploitant. Vous pouvez nous écrire à l’adresse de contact indiquée ci-dessus.',
      ],
    },
  ],
};

/**
 * Conditions d’utilisation — français.
 *
 * 🔴 **Le texte coréen est l’original et prévaut** (`legal-text.ts`). Ceci est une traduction
 *   de confort ; en cas de divergence, le coréen l’emporte. L’article 22 le dit lui-même à
 *   l’intérieur du document, et c’est ce qui rend la publication de la traduction sûre.
 *
 * ⚠ **La structure doit correspondre exactement au coréen** — 22 articles, le même nombre de
 *   lignes dans chacun, et aucune « modification annoncée ». `npm run check:legal` le vérifie.
 *   Scinder une phrase coréenne en deux fait échouer le contrôle, et en fusionner deux masque
 *   une clause perdue.
 *
 * ⚠ Ce document existe à cause de l’**art. 13(2) de la loi sur la protection des consommateurs
 *   dans le commerce électronique** : information avant le contrat et remise par écrit de ses
 *   conditions après. Les points 5 (rétractation), 6 (remboursements), 8 (réclamations et
 *   litiges) et 9 (les conditions elles-mêmes et la façon de les consulter) n’ont nulle part
 *   ailleurs où figurer. Chaque article est le réceptacle d’un point précis : **un article ne
 *   doit donc jamais perdre sa substance juridique pour mieux se lire.** Les trois plus lourds :
 *
 *   - L’art. 12 reprend en substance les art. 17(2)5 et 17(6). « la fourniture du contenu
 *     numérique a commencé », « la partie non encore fournie d’un contenu numérique fourni par
 *     fractions » et « indiquer ce fait **et fournir en même temps** ... à titre de produit
 *     d’essai » sont des conditions légales : les atténuer rend la restriction nulle.
 *   - La première ligne de l’art. 20 est la garde contre l’art. 35 (contrats défavorables au
 *     consommateur). **Ne jamais ajouter « dans toute la mesure permise par la loi »** ni
 *     formule équivalente : cela retourne la phrase en ce qu’elle était écrite pour refuser.
 *   - L’art. 22, c’est l’art. 36 (compétence exclusive) : le domicile **de l’utilisateur**,
 *     jamais le siège de l’exploitant. Désigner ce siège serait nul au titre de l’art. 35.
 *
 * ⚠ «청약철회» est rendu par **« rétractation »**, distinct de la **« résiliation »** de
 *   l’abonnement à l’art. 14 : Jogak Pro *est* un abonnement, et les deux remèdes ne doivent
 *   pas se confondre dans un même document.
 */
export const TERMS_FR: LegalDoc = {
  title: 'Conditions d’utilisation de Jogak',
  sourceFingerprint: '898aa8d7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'Les présentes conditions définissent les droits, obligations et responsabilités entre Hwiseong Games (marque : Vivace Games, « l’exploitant ») et les utilisateurs, concernant l’utilisation de l’application mobile « Jogak » (« le service ») fournie par l’exploitant. Merci de les lire avant d’utiliser le service.',
  sections: [
    {
      h: 'Article 1 (Objet et champ d’application)',
      body: [
        'Les présentes conditions ont pour objet de définir les conditions et modalités d’utilisation du service ainsi que les droits et obligations de l’exploitant et de l’utilisateur.',
        'Elles s’appliquent à tous les utilisateurs du service. Elles s’appliquent de la même manière lorsque vous vous contentez d’écrire des entrées sans vous connecter.',
        'Les points non prévus par les présentes conditions sont régis par les textes applicables, notamment la loi sur la protection des consommateurs dans le commerce électronique, la loi sur la réglementation des conditions générales et la loi sur la promotion de l’industrie des contenus, ainsi que par les usages commerciaux.',
      ],
    },
    {
      h: 'Article 2 (Informations sur l’exploitant)',
      body: [
        'Dénomination sociale : Hwiseong Games (marque : Vivace Games)',
        // ⚠ C’est la graphie qu’emploie déjà `PRIVACY_FR` §11. Deux documents ne peuvent pas nommer différemment la même personne
        'Représentant : Son Hwi-seong',
        'Adresse de l’établissement : 204, 2F, 22 Seongan 5-gil, Jung-gu, Ulsan, 44421, Republic of Korea',
        'Téléphone : +82 10-9926-0925',
        'Adresse e-mail : support@vivace-games.com',
        'Numéro d’immatriculation de l’entreprise : 749-25-02260',
        'Numéro de déclaration d’activité de vente à distance : 2026-Ulsan Jung-gu-0170 (autorité ayant reçu la déclaration : Jung-gu, ville métropolitaine d’Ulsan)',
      ],
    },
    {
      h: 'Article 3 (Définitions)',
      body: [
        '« Fragment » (« jogak ») désigne une entrée de journal que l’utilisateur écrit dans le service.',
        '« Appareil » désigne le smartphone ou tout autre terminal sur lequel l’utilisateur installe et utilise le service.',
        '« Jogak Pro » désigne l’abonnement payant récurrent qui offre la suppression des publicités, la sauvegarde et la restauration, ainsi que les rapports de synthèse générés par IA.',
        '« Boutique d’applications » désigne une place de marché d’applications, telle que Google Play, par laquelle le service est distribué et les produits payants sont réglés.',
      ],
    },
    {
      h: 'Article 4 (Publication et modification des présentes conditions)',
      body: [
        'L’exploitant publie les présentes conditions sur l’écran [Réglages] du service ainsi qu’à l’adresse ci-dessous, afin que les utilisateurs puissent les consulter à tout moment.',
        'https://sonwheesung.github.io/diary/terms.html',
        'L’exploitant peut modifier les présentes conditions dans la mesure où cela ne contrevient pas aux textes applicables.',
        'En cas de modification, l’exploitant indique la date d’entrée en vigueur et le motif, et en informe dans le service à partir de 7 jours avant cette date. Toutefois, lorsque la modification est défavorable aux utilisateurs, l’information est publiée à partir de 30 jours avant la date d’entrée en vigueur, en présentant côte à côte le contenu avant et après, sous une forme aisément compréhensible.',
        'L’utilisateur qui n’accepte pas les conditions modifiées peut résilier tout service payant et cesser d’utiliser le service avant la date d’entrée en vigueur. Si vous continuez à utiliser le service après la date annoncée, vous êtes réputé avoir accepté les conditions modifiées.',
      ],
    },
    {
      h: 'Article 5 (Contenu du service)',
      body: [
        'Le service fourni par l’exploitant s’appelle « Jogak » ; il s’agit d’une application mobile (contenu numérique) destinée à écrire et à conserver un journal.',
        'Fonctionnalités fournies gratuitement : écrire, modifier, supprimer et rechercher des entrées, joindre des photos, tags, enregistrement des émotions, vue calendrier, verrouillage de l’application (code PIN et schéma), mode sombre, plusieurs langues, lecture des annonces et « Nous contacter ».',
        'Fonctionnalités fournies par le produit payant « Jogak Pro » : suppression des publicités, sauvegarde chiffrée et restauration, et rapports de synthèse générés par IA.',
        'Les titres, textes, photos, tags et émotions des entrées que vous écrivez sont enregistrés uniquement à l’intérieur de votre appareil et ne sont pas transmis aux serveurs de l’exploitant, sauf si vous activez la fonction de sauvegarde.',
        'Si la sauvegarde est activée, les entrées sont chiffrées sur votre appareil avant d’être transmises et l’exploitant ne conserve pas la clé de déchiffrement : il ne peut donc pas en lire le contenu.',
        'Lors de la création d’un rapport de synthèse par IA, le texte du journal de la période demandée transite par le serveur de l’exploitant et est remis au fournisseur d’intelligence artificielle. L’exploitant ne conserve pas ce texte. Les détails relèvent de la politique de confidentialité.',
      ],
    },
    {
      h: 'Article 6 (Formation du contrat et comptes)',
      body: [
        'Le contrat d’utilisation du service est formé lorsque l’utilisateur installe le service, accepte les présentes conditions puis utilise le service.',
        'Les fonctionnalités gratuites, y compris la rédaction d’entrées, peuvent être utilisées sans compte.',
        '« Nous contacter », le paiement des produits payants, la sauvegarde et la restauration ainsi que les rapports de synthèse par IA nécessitent une connexion avec un compte Google.',
        'L’utilisateur peut supprimer son compte à tout moment depuis l’écran [Réglages] → [Nous contacter] du service. Les modalités de suppression et les informations supprimées ou conservées relèvent du guide de suppression de compte.',
      ],
    },
    {
      h: 'Article 7 (Prix des produits payants et paiement)',
      body: [
        'Le tarif de Jogak Pro est de 3 900 KRW par mois et de 29 000 KRW par an, taxe sur la valeur ajoutée comprise.',
        'Le tarif est prélevé automatiquement sur le moyen de paiement enregistré par l’utilisateur auprès de la boutique d’applications, au début de l’abonnement puis à chaque date de renouvellement.',
        'Aucun coût ne s’ajoute au tarif. Les frais de communication de données nécessaires à l’utilisation du service relèvent toutefois de la politique de l’opérateur télécom souscrit par l’utilisateur et restent à sa charge.',
        'Le montant réellement facturé peut différer des montants ci-dessus selon les politiques de change et de commissions de la boutique d’applications ou selon ses tarifs par pays. Dans ce cas, le montant affiché sur l’écran de paiement prévaut.',
        'Si l’exploitant augmente le tarif, il en informe à l’avance conformément à l’article 4, et le prix augmenté ne s’applique pas à une période d’abonnement déjà payée.',
      ],
    },
    {
      h: 'Article 8 (Restrictions des conditions de vente)',
      body: [
        'Le service ne peut être utilisé que dans les pays où la boutique d’applications en autorise la distribution, et l’installation comme le paiement ne sont possibles que dans les pays retenus par l’exploitant pour la distribution.',
        'Un abonnement payant n’est rattaché qu’à un seul compte à la fois. Si vous vous connectez avec un autre compte Google sur le même appareil, l’abonnement est transféré à ce compte et ne peut plus être utilisé depuis le compte précédent.',
        'L’exploitant peut fixer un plafond du nombre d’utilisations dans la mesure nécessaire à la fourniture de certaines fonctionnalités du service. Le nombre de rapports de synthèse par IA pouvant être générés est limité par période, et cette limite est affichée dans les écrans du service.',
      ],
    },
    {
      h: 'Article 9 (Date et modalités de fourniture)',
      body: [
        'Jogak Pro est appliqué au compte de l’utilisateur dès que le paiement est effectué, sans procédure de livraison distincte.',
        'Lorsque le paiement a été effectué mais que le droit n’a pas été appliqué, l’utilisateur peut utiliser [Restaurer les achats] sur l’écran [Jogak Pro] du service ou contacter l’exploitant par le moyen prévu à l’article 21.',
        'La période d’abonnement court de la date de paiement à la veille de la date de renouvellement suivante et se renouvelle automatiquement pour une durée identique à défaut de résiliation.',
      ],
    },
    {
      h: 'Article 10 (Environnement d’utilisation)',
      body: [
        'Le service s’utilise sur les appareils Android et requiert la version du système d’exploitation indiquée sur la fiche de la boutique d’applications, ou une version ultérieure.',
        'Les fonctionnalités de base, comme écrire, consulter et rechercher des entrées, s’utilisent sans connexion internet.',
        'La lecture des annonces, « Nous contacter », la connexion, le paiement, la sauvegarde et la restauration ainsi que les rapports de synthèse par IA nécessitent une connexion internet.',
        'Si l’espace de stockage de votre appareil est insuffisant ou si son système d’exploitation sort de la plage prise en charge, certaines fonctionnalités peuvent ne pas fonctionner correctement.',
      ],
    },
    {
      h: 'Article 11 (Essai gratuit et passage à l’abonnement payant)',
      body: [
        'L’exploitant offre un essai gratuit de 7 jours de Jogak Pro.',
        'À la fin de la période d’essai gratuit, celle-ci se transforme automatiquement en abonnement payant récurrent et le tarif de l’article 7 est facturé.',
        'Avant que la conversion n’intervienne, l’exploitant affiche la date et l’heure de la conversion, le prix avant et après le changement ainsi que le moyen de paiement, et recueille le consentement de l’utilisateur ; à défaut de consentement, aucun paiement n’est effectué.',
        'Si vous ne souhaitez pas être facturé à l’issue de l’essai gratuit, résiliez l’abonnement par le moyen prévu à l’article 14 avant la fin de la période d’essai. Même après résiliation, vous pouvez continuer à utiliser Jogak Pro jusqu’à la fin de cette période.',
      ],
    },
    {
      h: 'Article 12 (Rétractation)',
      body: [
        'L’utilisateur peut se rétracter dans un délai de 7 jours à compter de la date de paiement d’un produit payant ou de la date de réception de l’écrit reprenant les conditions du contrat.',
        'La rétractation s’exerce en manifestant cette volonté auprès du canal de contact de l’article 21, et l’exploitant communique le résultat dans les 3 jours ouvrés suivant la réception.',
        'Une fois la rétractation exercée, l’exploitant rembourse le montant conformément à l’article 13 et le droit de l’utilisateur à Jogak Pro prend fin immédiatement.',
        'Toutefois, en vertu de l’art. 17(2)5 de la loi sur la protection des consommateurs dans le commerce électronique, la rétractation est restreinte lorsque la fourniture du contenu numérique a commencé. Même dans ce cas, la rétractation reste ouverte pour la partie non encore fournie d’un contenu numérique fourni par fractions.',
        'Pour appliquer cette restriction, l’exploitant, conformément au paragraphe 6 du même article, indique ce fait et fournit en même temps l’essai gratuit de 7 jours de l’article 11 à titre de produit d’essai. Si l’exploitant n’a pas pris ces mesures, l’utilisateur peut se rétracter nonobstant la restriction ci-dessus.',
        'L’exploitant ne réclame ni pénalité ni dommages-intérêts au motif qu’un utilisateur s’est rétracté.',
      ],
    },
    {
      h: 'Article 13 (Remboursements)',
      body: [
        'Le paiement des produits payants s’effectuant par la boutique d’applications, les remboursements sont eux aussi traités, en principe, selon la procédure de remboursement de cette boutique.',
        'L’utilisateur peut demander le remboursement directement à la boutique d’applications ou à l’exploitant via le canal de contact de l’article 21. Lorsque la demande est adressée à l’exploitant, celui-ci la traite en concertation avec la boutique.',
        'L’exploitant rembourse le montant dans les 3 jours ouvrés suivant la réception d’une déclaration de rétractation ou équivalente. Le versement effectif peut prendre plus de temps selon les délais de traitement de la boutique d’applications.',
        'Lorsque l’exploitant retarde le remboursement au-delà de ce délai sans motif légitime, il verse en outre des intérêts de retard pour la durée du retard, calculés au taux fixé par le décret d’application de la loi sur la protection des consommateurs dans le commerce électronique.',
        'Lorsqu’une période a déjà été utilisée, l’exploitant peut déduire le montant correspondant à cette période avant de rembourser. Aucune déduction n’est toutefois opérée pour la période durant laquelle l’utilisateur n’a pas pu utiliser le service pour des motifs imputables à l’exploitant.',
        'Aucuns frais distincts ne sont facturés pour un remboursement.',
      ],
    },
    {
      h: 'Article 14 (Résiliation de l’abonnement)',
      body: [
        'L’utilisateur peut résilier l’abonnement à tout moment. La résiliation doit être effectuée par l’utilisateur depuis l’écran de gestion des abonnements de la boutique d’applications ; l’exploitant ne peut pas la faire à sa place.',
        'Google Play : application de la boutique > profil > Paiements et abonnements > Abonnements (https://play.google.com/store/account/subscriptions)',
        'Même après résiliation, vous pouvez continuer à utiliser Jogak Pro jusqu’à la fin de la période d’abonnement déjà payée ; passée cette période, le renouvellement automatique s’arrête.',
        'La suppression de votre compte dans le service ne résilie pas l’abonnement souscrit auprès de la boutique d’applications. Si vous ne le résiliez pas par le moyen ci-dessus, indépendamment de la suppression du compte, vous continuerez à être facturé.',
      ],
    },
    {
      h: 'Article 15 (Contrats conclus par des mineurs)',
      body: [
        'Lorsqu’un mineur a payé un produit payant sans le consentement de son représentant légal, le mineur ou son représentant légal peut annuler ce contrat.',
        'L’annulation n’est toutefois pas possible lorsque le mineur a payé avec des biens dont son représentant légal lui avait permis de disposer, ou lorsqu’il a usé de manœuvres pour faire croire qu’il était majeur.',
        'Si vous souhaitez annuler, adressez la demande au canal de contact de l’article 21. L’exploitant peut demander des documents attestant votre qualité de représentant légal.',
      ],
    },
    {
      h: 'Article 16 (Obligations de l’utilisateur)',
      body: [
        'L’utilisateur doit respecter les textes applicables et les présentes conditions lorsqu’il utilise le service.',
        'L’utilisateur ne doit pas usurper le compte d’autrui, entraver le fonctionnement normal du service, accéder ou tenter d’accéder au service par des moyens autres que ceux prévus par l’exploitant, ni manipuler le processus de paiement des produits payants.',
        'L’utilisateur doit gérer lui-même les informations de son compte ainsi que le code PIN ou le schéma de verrouillage de l’application.',
        'L’utilisateur doit conserver en lieu sûr le code de récupération délivré lors de l’activation de la fonction de sauvegarde. En cas de perte, l’exploitant ne peut pas non plus déchiffrer la sauvegarde et la restauration devient impossible.',
      ],
    },
    {
      h: 'Article 17 (Conservation des données et sauvegarde)',
      body: [
        'L’original des entrées écrites par l’utilisateur est enregistré sur son appareil. Si l’application est désinstallée ou l’appareil réinitialisé, les entrées qui s’y trouvaient ne peuvent pas être récupérées.',
        'Lorsque la fonction de sauvegarde est activée, l’exploitant conserve une copie chiffrée que l’utilisateur peut restaurer avec son code de récupération.',
        'Même après la fin d’un abonnement, l’exploitant conserve la sauvegarde chiffrée pendant 90 jours, la restauration restant possible durant ce délai. Passés 90 jours, la sauvegarde est supprimée.',
        'L’exploitant ne dispose d’aucun canal de notification push : l’information relative à cette suppression programmée n’est donc donnée qu’à l’écran, lorsque l’utilisateur ouvre l’application.',
        'Si l’utilisateur supprime son compte, la sauvegarde chiffrée conservée sur le serveur est supprimée en même temps que le compte, sans le délai de grâce de 90 jours.',
      ],
    },
    {
      h: 'Article 18 (Propriété intellectuelle)',
      body: [
        'Les droits sur les entrées écrites par l’utilisateur dans le service et sur les photos qu’il y joint lui appartiennent. L’exploitant ne revendique aucun droit sur celles-ci.',
        'L’exploitant n’utilise pas les entrées des utilisateurs à d’autres fins que la fourniture du service et ne les utilise ni à des fins publicitaires ou statistiques, ni pour l’entraînement d’une intelligence artificielle.',
        'Les droits sur le service lui-même et sur les créations graphiques, marques et programmes qu’il comporte appartiennent à l’exploitant ou à leurs titulaires légitimes.',
        'L’utilisateur ne doit pas reproduire, distribuer ni procéder à l’ingénierie inverse du service sans le consentement préalable de l’exploitant.',
      ],
    },
    {
      h: 'Article 19 (Modification, interruption et arrêt du service)',
      body: [
        'L’exploitant peut modifier le contenu du service afin d’en améliorer la qualité. Lorsque le contenu d’un produit payant est modifié de façon défavorable aux utilisateurs, l’information est donnée à l’avance conformément à l’article 4.',
        'L’exploitant peut interrompre temporairement la fourniture du service en cas de motif impérieux tel qu’une maintenance, un remplacement ou une panne d’équipement ou une coupure des communications ; il en informe alors à l’avance. Lorsque le motif impérieux rend l’information préalable impossible, celle-ci est donnée a posteriori.',
        'Si l’exploitant arrête le service, il en informe par des annonces dans le service et sur la fiche de la boutique d’applications au moins 30 jours avant la date d’arrêt, en précisant la période pendant laquelle les utilisateurs peuvent télécharger ou restaurer leur sauvegarde.',
        'À l’arrêt du service, le tarif correspondant à une période déjà payée mais non utilisée est remboursé à l’utilisateur.',
      ],
    },
    {
      h: 'Article 20 (Responsabilité)',
      body: [
        'L’exploitant assume, pour la fourniture du service, la responsabilité prévue par les textes applicables. Aucune stipulation des présentes conditions n’exclut ni ne limite une responsabilité de l’exploitant prévue par la loi.',
        'L’exploitant n’est pas responsable des dommages résultant de causes qui ne lui sont pas imputables, telles que la force majeure, la panne, la perte ou la réinitialisation de l’appareil de l’utilisateur, ou la perte par ce dernier de son code de récupération ou du secret de verrouillage de l’application.',
        'Le rapport de synthèse par IA est un document de référence généré par une intelligence artificielle ; il ne constitue ni un diagnostic ni un conseil médical, psychologique ou juridique. L’exploitant ne garantit pas l’exactitude de son contenu.',
        'Les dommages survenus lors du paiement via la boutique d’applications pour des causes imputables à celle-ci relèvent de la politique de cette boutique. L’exploitant apporte néanmoins toute la coopération nécessaire à la réparation du préjudice de l’utilisateur.',
      ],
    },
    {
      h: 'Article 21 (Réclamations des consommateurs et règlement des litiges)',
      body: [
        'Pour traiter les avis et réclamations des utilisateurs, l’exploitant met à disposition le canal [Réglages] → [Nous contacter] dans le service ainsi que le canal e-mail ci-dessous.',
        'E-mail : support@vivace-games.com',
        'Lorsque l’exploitant estime fondé un avis ou une réclamation, il le traite sans délai ; si le traitement demande du temps, il en indique le motif et le calendrier prévu.',
        'En cas de litige entre l’exploitant et un utilisateur, ce dernier peut saisir les organismes suivants d’une demande de médiation.',
        '• Commission de médiation des litiges de consommation (Agence coréenne de la consommation) : 1372 (depuis la Corée) · https://www.kca.go.kr',
        '• Commission de médiation des litiges relatifs aux contenus : 1588-2594 · https://www.kcdrc.kr',
        '• Commission de médiation des litiges du commerce électronique : 1661-5714 · https://www.ecmc.or.kr',
      ],
    },
    {
      h: 'Article 22 (Droit applicable et juridiction compétente)',
      body: [
        'Le droit de la République de Corée s’applique aux présentes conditions et à l’utilisation du service.',
        'L’action relative à un litige survenu entre l’exploitant et un utilisateur relève, conformément à l’art. 36 de la loi sur la protection des consommateurs dans le commerce électronique, de la compétence exclusive du tribunal de district du domicile de l’utilisateur au moment de l’introduction de l’action. À défaut de domicile, elle relève de la compétence exclusive du tribunal de district de sa résidence ; et si, au moment de l’introduction de l’action, le domicile ou la résidence de l’utilisateur n’est pas clairement établi, la juridiction compétente est déterminée conformément à la loi sur la procédure civile.',
        'La version coréenne des présentes conditions fait foi. En cas de divergence de sens avec une traduction dans une autre langue, la version coréenne prévaut.',
        'Disposition finale : les présentes conditions entrent en vigueur le 17 août 2026.',
      ],
    },
  ],
};
