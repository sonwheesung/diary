import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Privacy policy — English.
 *
 * 🔴 **The Korean text is authoritative.** This is a translation for readability;
 *   where the two differ, `legal-text.ts` (Korean) governs. The screen says so too.
 *
 * ⚠ **Structure must match the Korean exactly** — same number of sections, same number of
 *   lines in each. `npm run check:legal` enforces it. A dropped clause is the one failure
 *   mode that matters here, and it is invisible by eye across 15 languages.
 *
 * ⚠ Section 12 lists **Korean** dispute-resolution bodies with Korean phone numbers.
 *   They are kept as-is: for Korean users they are the real remedy, and for everyone else
 *   the fact that this operator answers to Korean law is itself information.
 */
export const PRIVACY_EN: LegalDoc = {
  title: 'Jogak Privacy Policy',
  sourceFingerprint: '47ec2dc4',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Vivace Games Studio ("the operator") complies with the Personal Information Protection Act and other applicable laws, and handles the personal data of users of "Jogak" ("the service") as set out below. As a matter of principle Jogak keeps the entries you write on your own device; entries are sent to a server only for the backup you turn on yourself and the AI summary reports you create yourself. Apart from that we collect only the minimum information necessary.',
  sections: [
    {
      h: '1. Where your entries are stored (stated first)',
      body: [
        'Your entries (title, text, list, photos, tags and emotion) are kept in your device’s internal storage and, by default, do not leave the device.',
        '⚠ There are two exceptions, and only where you chose them yourself. Neither happens automatically.',
        '• If you turn backup on — a copy of your entries, encrypted on your device, is stored on the operator’s server. The operator cannot read that copy. The detail is in section 2(c).',
        '• If you create an AI summary report — the diary content for that period passes through the operator’s server unencrypted and is sent on to the AI provider. The operator does not store that content. The detail is in section 2(e).',
        '⚠ Those two sentences are not the same. Backup: we store it but cannot read it. AI: we read it but do not store it. We state this plainly rather than blur it.',
        'The operator never collects the following, under any circumstances, and does not transmit it off your device.',
        '• The PIN, pattern or hint answer used for app lock — these are kept in your device’s secure storage only in a non-recoverable form (a hash); the original is never stored anywhere.',
        '• Your name, date of birth, phone number, address, contact list, location, or any record of access to your full photo library.',
        'Photos you pick in the app are copied into the app’s own folder on your device so they can be placed in an entry, and unless you turn backup on they are not transmitted anywhere. Photos are never sent for AI summary reports.',
      ],
    },
    {
      h: '2. Personal data we collect',
      body: [
        'a. When you use Contact us (sign-in required)',
        '• Required: the email address of your Google account, and your social account identifier (Google "sub")',
        '  — Legal basis: Personal Information Protection Act art. 15(1)4 (necessary to carry out measures requested by the user — that is, to reply to your enquiry)',
        '  — Purpose: identifying the sender, replying, and letting you review your own enquiries',
        '• Enquiry category and enquiry content',
        '• Device type (Android/iOS) and app version — to understand the environment in which a problem occurred',
        '※ Sign-in is needed for Contact us, subscription, backup and AI reports; writing entries, app lock and other features do not require it.',
        '※ Children under 14 may not use the sign-in feature.',
        'b. Information collected automatically while ads are served',
        '• Advertising identifier (Android advertising ID), device and network information, ad impression and click records',
        '• The above is collected by Google (AdMob); details and how to opt out are in section 7.',
        'c. If you turn backup on (subscription required)',
        '• An encrypted copy of your entries — in a form the operator cannot decrypt',
        '• Backup identifier, backup time, generation number, size — this information is not encrypted. The operator can tell which account backed up, when, and how much.',
        '  — Legal basis: your separate consent (taken on the screen where you turn backup on)',
        '⚠ To be precise: the operator stores that copy but cannot read it. The decryption key exists only on your device and in the recovery code you keep; the operator does not have it.',
        '⚠ If you lose your recovery code there is no way to open the backup. The operator cannot open it for you either.',
        'd. If you use a subscription',
        '• Subscription status — entitlement key, subscription expiry time, payment-failure grace time, whether it will renew',
        '• The transaction identifier issued by the store, the product identifier, and whether the purchase was made in the production or test environment',
        '• Records of subscription status changes sent by the payment service (purchase, renewal, cancellation, refund, etc.) and their raw content',
        '  — Legal basis: Personal Information Protection Act art. 15(1)4 (necessary to carry out measures requested by the user — that is, to provide the subscription entitlement you applied for)',
        '  — Purpose: confirming subscription entitlement (ad removal, backup, AI reports), handling payment enquiries and refunds',
        '⚠ Payment details such as credit card or bank account numbers are handled by Google Play and are not passed to the operator. The operator can only tell that you paid and until when the subscription is valid.',
        'e. If you create AI summary reports (subscription required)',
        '• Passed through the operator’s server to the AI provider: the title, text, emotion and date of the entries in the period you requested a report for',
        '• Stored by the operator: the summary generated by AI, the identifier of the account that created the report, the period, the number of times, and the number of tokens used',
        '⚠ To be precise: the operator does not store the diary content itself. However, ① at the moment the summary is being made the content passes through the operator’s server, so we cannot tell you that "the operator cannot see it", and ② the generated summary is kept for 90 days. We state this plainly rather than blur it.',
        '⚠ A summary is written on the basis of your entries, so diary content may appear within it.',
        '• Separate consent for sensitive information: entries may contain sensitive information such as health or psychological state, as defined in article 23 of the Personal Information Protection Act. Because AI summary reports process that content unencrypted, we take separate consent for the processing of sensitive information the first time you use the feature. This consent is separate from the consent to transfer abroad in section 6, and you may choose each independently.',
        'Even if you do not consent, every feature other than AI reports remains fully available. Reports are generated only when you create them yourself, never automatically.',
      ],
    },
    {
      h: '3. Purposes of processing',
      body: [
        '• Receiving and handling enquiries: to review what you sent and to identify and fix faults',
        '• Identifying you and replying: to deliver a reply to the user who wrote in, and to let you review your own enquiry history',
        '• Serving ads: to show ads to users on the free tier and to measure ad performance',
        '• Backup and restore: where you turned it on, to hold an encrypted copy of your entries and give it back to you on request',
        '• Confirming subscription entitlement: to provide ad removal, backup and AI reports to users who have paid, and to handle payment enquiries and refunds',
        '• Generating AI summary reports and improving their quality: to produce a summary for the period you asked for, and to review the result and improve quality',
        'The operator does not use personal data for purposes other than the above, and will obtain consent in advance if the purpose changes.',
      ],
    },
    {
      h: '4. Retention and use periods',
      body: [
        '• Account information (email address, Google sub): until you delete your account. On deletion we destroy it without delay or render it non-traceable.',
        '• Enquiry content: 3 years from receipt (Act on Consumer Protection in Electronic Commerce — records on consumer complaints or dispute handling)',
        '• Behavioural data based on the advertising identifier: up to 1 year from collection',
        '• The encrypted backup copy: kept while you leave backup on, and for 90 days after a subscription ends, then destroyed automatically. If you turn backup off, request deletion, or delete your account, we destroy it without delay rather than waiting 90 days. Backups untouched for 3 years or more are destroyed (this covers the case where you deleted the app without deleting your account).',
        '• A record that a backup was destroyed (backup identifier and time of destruction): 1 year — so that you can find out "why restore does not work"; the account identifier is not kept with it.',
        '• The summary generated by AI: 90 days from the day it was created, after which it is deleted automatically.',
        '• Report usage records (account identifier, period, count, token counts): until the purpose is achieved or until you delete your account',
        '• Records on contracts or withdrawal of offer, and on payment and supply of goods: 5 years (Act on Consumer Protection in Electronic Commerce, art. 6)',
        'If you delete your account, the account identifiers (email, Google sub) are rendered non-traceable without delay, and the transaction records above are stored separately in a form that cannot be traced back to their author for the period above and then destroyed.',
        '⚠ Deleting your account does not automatically cancel your Google Play subscription. You must cancel it yourself in Google Play > Subscriptions; if you do not, you will continue to be charged.',
        '⚠ Notice that a backup is due for deletion because a subscription expired reaches you only on screen when you open the app. If you do not open the app, this notice may not reach you.',
        'Once the retention period passes or the purpose is achieved, we destroy the data without delay.',
      ],
    },
    {
      h: '5. Provision to third parties',
      body: [
        'The operator does not provide users’ personal data to third parties.',
        'The companies in section 6 are processors handling information on the operator’s behalf, and do not use it for their own purposes. The AI provider does not use the diary content it receives to train models.',
        'Exceptions apply where there is a specific provision in law, or where an investigative authority makes a request following the procedures and methods prescribed by law.',
      ],
    },
    {
      h: '6. Outsourcing of processing and transfer abroad',
      body: [
        'To provide the service the operator outsources processing as follows, and some of it takes place outside Korea.',
        '• Google LLC — Country: United States. Contact: https://support.google.com/policies/contact/general_privacy_form. Purpose: serving and measuring ads (AdMob), Google account sign-in, processing and verifying subscription payments. Items: advertising identifier, device and network information, on sign-in the email address and account identifier, and store transaction information. When and how: transmitted over the network when an ad is requested, when you sign in, and when you pay. Retention: as per Google’s privacy policy',
        '• Supabase Inc. — Country: United States (place of incorporation). Contact: privacy@supabase.com. Purpose: storing enquiry and account information in a database, and storing the encrypted backup copy and subscription status. Items: the information in sections 2(a), 2(c) and 2(d). When and how: transmitted over the network when you send an enquiry and when you back up. Retention: the periods in section 4. ※ The physical storage location is the Republic of Korea (Seoul region), but we disclose it as a transfer abroad because the operating company is located outside Korea.',
        '• Vercel Inc. — Country: United States. Contact: privacy@vercel.com. Purpose: running the server that receives enquiries and the backup and AI servers. Items: the information in section 2(a). When and how: transmitted over the network when you send an enquiry. Retention: until the outsourcing contract ends. ※ The encrypted backup copy is sent directly to storage without passing through this server.',
        '• RevenueCat, Inc. — Country: United States. Contact: compliance@revenuecat.com. Purpose: verifying subscription payments and checking subscription status. Items: account identifier, store transaction and product identifiers, device and app information. When and how: transmitted over the network when you open the subscription screen and when you pay. Retention: until the outsourcing contract ends',
        '• OpenAI OpCo, LLC — Country: United States (1455 Third Street, San Francisco, California 94158, USA). Contact: dpo@openai.com. Purpose: generating summary reports. Items: the title, text, emotion and date of the entries in the period you requested a report for. When and how: transmitted over the network when you press Create report. Retention: the operator’s server does not store the diary content — it is held in memory only while the summary is being made and then discarded at once. The AI provider keeps it for up to 30 days for abuse monitoring and then deletes it, and even during that period does not use it for model training.',
        '⚠ Transfer abroad for AI reports is a matter of separate consent. The first time you use the feature we show you the same information inside the app and take your consent; this consent is separate from the consent for sensitive information in section 2(e).',
        'You may refuse the transfer of your personal data abroad. To refuse ad-related transfers, turn off personalised ads using the method in section 7; enquiry-related transfers do not occur if you do not use Contact us. If you do not turn backup on, do not subscribe, and do not create reports, none of the related transfers occur, and all other features including writing entries remain fully available.',
      ],
    },
    {
      h: '7. Automatic collection such as advertising identifiers, and how to opt out',
      body: [
        'The service uses Google AdMob to show ads to users on the free tier. AdMob may collect and use an advertising identifier in order to serve personalised ads.',
        'Purpose of collection: serving personalised ads, measuring ad performance, preventing click fraud',
        'How to opt out (Android): Settings > Privacy > Ads > "Delete advertising ID" or "Opt out of Ads Personalisation"',
        'How to opt out (iOS): Settings > Privacy & Security > Tracking > turn off "Allow Apps to Request to Track"',
        'Even if you opt out, ads may still appear, but they will be generic ads not based on your interests.',
        'If you subscribe, no ads are shown and the ad-related collection above does not occur either.',
        'More on how Google handles personal data for advertising: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Procedure and method of destruction',
      body: [
        'Procedure: personal data whose retention period has passed or whose purpose has been achieved is destroyed without delay. Where retention is required by law, it is stored separately from other personal data for that period and then destroyed.',
        'Method: information in electronic file form is permanently deleted by technical means that make recovery or reconstruction impossible.',
        'Entries, photos and lock information stored on your device are removed from the device when you use the app’s "Reset everything" function or delete the app.',
        'If you turned backup on, the encrypted copy held on the server is destroyed when you delete it on the app’s backup screen or when you delete your account. On account deletion we destroy the backup first and then delete the account — if the account went first, no one would be left with the right to delete that backup.',
        'If you did not turn backup on, the operator does not hold the entries on your device and therefore cannot delete them for you.',
      ],
    },
    {
      h: '9. Rights of data subjects and legal representatives, and how to exercise them',
      body: [
        'You may exercise the following rights at any time.',
        '• Request access to your personal data • Request correction where there is an error • Request deletion • Request suspension of processing • Request transmission of your personal data (Personal Information Protection Act art. 35-2)',
        'You may exercise these rights in writing or by email using the contact in section 11, and the operator will act without delay.',
        'If you request correction of an error in your personal data, we will not use or provide that data until the correction is complete.',
        '⚠ Limits on an access request about a backup: if you request access to your backup, all the operator can give you is the ciphertext, which cannot be decrypted, and the metadata in section 2(c). We cannot provide your entries in human-readable form — the operator does not hold the key. You yourself can restore at any time in the app using your recovery code.',
        'You can delete a report you have created at any time in the app. Deleting it in the app removes it from your device; the summary kept on the server is deleted automatically after 90 days. If you want it deleted sooner, you can ask through Contact us.',
        '⚠ Summaries generated by AI may differ from fact and are not a medical or psychological diagnosis or advice. The app provides a way to report a summary.',
        'The legal representative of a child under 14 may exercise the above rights on the child’s behalf.',
      ],
    },
    {
      h: '10. Measures to ensure security',
      body: [
        '• Administrative: minimising the number of people who handle personal data, and regular training for them',
        '• Technical: access control for the personal data processing system, encryption in transit (HTTPS), storing app lock secrets as hashes and using the device secure storage (Keystore/Keychain)',
        '• End-to-end encryption of backups: the backup copy is encrypted on your device before it is sent, and the decryption key exists only on the device and in your recovery code. The operator’s servers do not hold the key.',
        '• Physical: servers holding personal data are located in the data centres of domestic and overseas cloud providers and follow those providers’ physical access control policies.',
        '⚠ The app lock feature blocks access to the screen; it does not encrypt the diary files stored on the device. If the device is lost or taken and its own security is defeated, entry contents may be exposed.',
      ],
    },
    {
      h: '11. Privacy officer, and the department that receives and handles access requests',
      body: [
        'The operator takes overall responsibility for work relating to the processing of personal data and designates a privacy officer as below to handle users’ complaints and remedies relating to personal data processing.',
        '• Privacy officer: Son Hwi-seong (position: representative)',
        '• Contact: support@vivace-games.com',
        '• Department receiving and handling access requests: as above',
        'You may raise with the privacy officer any question, complaint or request for remedy relating to privacy that arises while using the service. The operator will answer and act without delay.',
      ],
    },
    {
      h: '12. How to seek remedy for infringement of rights',
      body: [
        'To obtain remedy for infringement of your personal data, you may apply to the following Korean bodies for dispute resolution or consultation.',
        '• Personal Information Dispute Mediation Committee: 1833-6972 (from Korea) / www.kopico.go.kr',
        '• Privacy Infringement Report Centre: 118 (from Korea) / privacy.kisa.or.kr',
        '• Supreme Prosecutors’ Office, Cyber Investigation Division: 1301 (from Korea) / www.spo.go.kr',
        '• National Police Agency, Cyber Investigation Bureau: 182 (from Korea) / ecrm.police.go.kr',
        'In addition, a person whose rights or interests are infringed by a disposition or omission of the head of a public institution in respect of a request under arts. 35 (access), 36 (correction and deletion) or 37 (suspension of processing) of the Personal Information Protection Act may file an administrative appeal as provided by the Administrative Appeals Act.',
      ],
    },
    {
      h: '13. Changes to this privacy policy',
      body: [
        'This privacy policy applies from its effective date.',
        'Where content is added, removed or amended due to changes in law, policy or security technology, we will give notice through in-app announcements from 7 days before the change takes effect (30 days before, where the change is unfavourable to users).',
        'Amendments scheduled to take effect are posted in advance under "Upcoming amendments" at the foot of this document, in a form that lets you compare before and after.',
        'Amendment history',
        '• 2026-08-09 first enacted',
        '• 2026-08-11 upcoming amendment posted — monthly subscription and backup/restore to be introduced (the main text has not changed yet)',
        '• 2026-08-12 upcoming amendment posted — AI summary reports to be introduced (the main text has not changed yet)',
        '• 2026-08-23 amended — the two amendments above have been carried into the main text. Processing relating to the monthly subscription, backup/restore and AI summary reports has been added to sections 1, 2, 3, 4, 6, 8, 9 and 10.',
      ],
    },
  ],
};

/**
 * Account deletion guide — English.
 *
 * 🔴 **The Korean text is authoritative** (`legal-text.ts`). Same rule as the privacy policy.
 *
 * ⚠ This document has a public URL of its own because Play's Data safety form requires a
 *   **web** deletion route: someone who already uninstalled the app still needs a way to ask.
 *   That URL is what Play reviewers open, which is why it cannot stay Korean-only.
 *
 * ⚠ Structure must match the Korean exactly — 6 sections (6/4/9/5/4/3 lines) and no
 *   `pending`. `npm run check:legal` enforces it.
 */
export const DELETE_ACCOUNT_EN: LegalDoc = {
  title: 'Jogak — How to delete your account',
  sourceFingerprint: 'a8b0c8b9',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'This page explains how to delete your Jogak account and the data associated with it. You can also ask by email if you have already uninstalled the app or cannot sign in.',
  sections: [
    {
      h: '1. Deleting it yourself in the app',
      body: [
        'Follow these steps in the Jogak app and it takes effect immediately.',
        '① Open the app → [Settings] tab at the bottom',
        '② Choose [Contact us]',
        '③ If you are not signed in, sign in with your Google account',
        '④ Choose [Delete account] at the very bottom of the screen and confirm',
        'Deleting your account cannot be undone.',
      ],
    },
    {
      h: '2. Asking by email (if you uninstalled the app or cannot sign in)',
      body: [
        'Send the following to support@vivace-games.com.',
        '• Subject: Jogak account deletion request',
        '• Body: the email address of the Google account you used to sign in to Jogak',
        'The address you write from must match the one you signed up with, so that we can confirm it is you. We will act on it and reply within 7 business days.',
      ],
    },
    {
      h: '3. Data that is deleted',
      body: [
        'When you delete your account, the following is destroyed immediately or put beyond re-identification.',
        '• Your social account identifier (Google "sub")',
        '• Your email address',
        '• The link between your enquiries and your account',
        '• The encrypted copy of your diary held on the server (if you turned backup on) — deleted together with your account, without waiting out the 90-day grace period.',
        '• The backup identifier and backup records (time, size, generation number)',
        '• The AI report summaries held on the server (up to 90 days) and the report usage records (period, count, token counts)',
        '⚠ On account deletion we destroy the backup first and then delete the account. If the account went first, no one would be left with the right to delete that backup. If deleting the backup fails, the account deletion does not go ahead at all; please try again shortly.',
        '⚠ This cannot be undone. Even if you still hold your recovery code, you will not be able to restore the backup from the server.',
      ],
    },
    {
      h: '4. Data that is kept, and for how long',
      body: [
        'The following is kept as required by law, and even during that period it remains only in a form that cannot be traced back to its author (pseudonymised).',
        '• Enquiry contents: 3 years (Act on Consumer Protection in Electronic Commerce — records of consumer complaints and dispute handling)',
        '• Subscription transaction records (transaction identifier, product, subscription period, history of payment state changes): 5 years (Act on Consumer Protection in Electronic Commerce, art. 6)',
        '• A record that a backup was destroyed (backup identifier and time of destruction): 1 year — so that you can find out "why restore no longer works". Your account identifier is not kept alongside it.',
        'Once the retention period ends we destroy it without delay.',
      ],
    },
    {
      h: '5. What stays on your device — deleting your account does not erase it',
      body: [
        'Your Jogak entries (titles, text, photos, tags and emotions) and the text of your AI reports are stored inside your own device.',
        'So deleting your account leaves the entries and reports on your device untouched. To erase those from the device as well, uninstall the app or use the reset option in the app’s [Settings].',
        'Conversely, if you uninstall the app the entries on your device cannot be recovered. Only if you had turned backup on and still keep your recovery code can you bring them back, and only before you delete your account.',
        '⚠ If you did not turn backup on, the operator does not have the entries on your device and can neither delete them nor bring them back for you.',
      ],
    },
    {
      h: '6. You must cancel the subscription separately',
      body: [
        'Deleting your account does not cancel your Google Play subscription. If you do not cancel it, you will keep being charged.',
        'To cancel: Google Play Store app > profile > Payments and subscriptions > Subscriptions (https://play.google.com/store/account/subscriptions)',
        'Refunds of amounts already charged follow Google Play’s refund policy and the operator’s refund policy. Ask us using the contact address above.',
      ],
    },
  ],
};

/**
 * Terms of service — English.
 *
 * 🔴 **The Korean text is authoritative** (`legal-text.ts`). This is a translation for
 *   readability; where the two differ, the Korean governs. Article 22 says so inside the
 *   document itself, which is what makes the translation safe to publish at all.
 *
 * ⚠ **Structure must match the Korean exactly** — 22 articles, same number of lines in each,
 *   and no `pending`. `npm run check:legal` enforces it. Splitting one Korean sentence into
 *   two English ones fails the check, and merging two hides a dropped clause.
 *
 * ⚠ This document exists because of **art. 13(2) of the Act on Consumer Protection in
 *   Electronic Commerce** — disclosure *before* the contract plus a written statement of the
 *   contract terms *after* it. Items 5 (withdrawal of offer), 6 (refunds), 8 (complaints and
 *   disputes) and 9 (the terms themselves and how to check them) have nowhere else to live.
 *   Each article is the vessel for a specific item, so **an article must not lose its legal
 *   substance to read more smoothly.** The three that carry the most weight:
 *
 *   - Art. 12 restates art. 17(2)5 and 17(6) verbatim in substance. "the supply of digital
 *     content has begun", "any part ... supplied in instalments that has not yet been
 *     supplied" and "indicates this fact **and at the same time** provides ... as a
 *     trial-use product" are statutory conditions — blur them and the restriction is void.
 *   - Art. 20 first line is the guard against art. 35 (contracts unfavourable to consumers).
 *     **Never add "to the maximum extent permitted by law"** or any similar English
 *     boilerplate: that inverts the sentence into the very thing it was written to refuse.
 *   - Art. 22 is art. 36 (exclusive jurisdiction) — the **user's** address, never the
 *     operator's seat. Naming the operator's seat is void under art. 35.
 *
 * ⚠ "청약철회" is rendered **"withdrawal of offer"**, not the "withdrawal of subscription"
 *   used by some statute translations. Jogak Pro *is* a subscription, and art. 14 is
 *   cancellation of it — the two must not collide in one document.
 */
export const TERMS_EN: LegalDoc = {
  title: 'Jogak Terms of Service',
  sourceFingerprint: 'd18f02f7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'These terms set out the rights, obligations and responsibilities between Hwiseong Games (brand: Vivace Games Studio, "the operator") and users, in relation to the use of the mobile application "Jogak" ("the service") that the operator provides. Please read them before using the service.',
  sections: [
    {
      h: 'Article 1 (Purpose and scope)',
      body: [
        'The purpose of these terms is to set out the conditions and procedures for using the service and the rights and obligations of the operator and the user.',
        'These terms apply to every user of the service. They apply in the same way where you only write entries without signing in.',
        'Matters not provided for in these terms are governed by applicable law, including the Act on Consumer Protection in Electronic Commerce, the Act on the Regulation of Terms and Conditions and the Content Industry Promotion Act, and by commercial practice.',
      ],
    },
    {
      h: 'Article 2 (Operator information)',
      body: [
        'Company name: Hwiseong Games (brand: Vivace Games Studio)',
        // ⚠ `PRIVACY_EN` §11이 이미 쓰는 표기다. 두 문서가 같은 사람을 다르게 부르면 안 된다
        'Representative: Son Hwi-seong',
        'Business address: 204, 2F, 22 Seongan 5-gil, Jung-gu, Ulsan, 44421, Republic of Korea',
        'Telephone: +82 10-9926-0925',
        'Email address: support@vivace-games.com',
        'Business registration number: 749-25-02260',
        'Mail-Order Business Registration No. 2026-Ulsan Jung-gu-0170 (authority that received the registration: Jung-gu, Ulsan Metropolitan City)',
      ],
    },
    {
      h: 'Article 3 (Definitions)',
      body: [
        '"Piece" ("jogak") means a single diary record that the user writes in the service.',
        '"Device" means a smartphone or other terminal on which the user installs and uses the service.',
        '"Jogak Pro" means the paid recurring subscription product that provides ad removal, backup and restore, and AI summary reports.',
        '"Open market" means an application marketplace, such as Google Play, through which the service is distributed and payment for paid products is made.',
      ],
    },
    {
      h: 'Article 4 (Posting and amendment of these terms)',
      body: [
        'The operator posts these terms on the [Settings] screen inside the service and at the address below, so that users can check them at any time.',
        'https://sonwheesung.github.io/diary/terms.html',
        'The operator may amend these terms to the extent that doing so does not breach applicable law.',
        'When amending these terms, the operator states the effective date and the reason for the amendment and gives notice inside the service from 7 days before the effective date. However, where an amendment is unfavourable to users, notice is given from 30 days before the effective date, showing the content before and after the amendment side by side in a form that is easy to understand.',
        'A user who does not agree to the amended terms may cancel any paid service and stop using the service before the effective date. If you continue to use the service after the notified effective date, you are taken to have agreed to the amended terms.',
      ],
    },
    {
      h: 'Article 5 (Content of the service)',
      body: [
        'The name of the service the operator provides is "Jogak", and its type is a mobile application (digital content) for writing and keeping a diary.',
        'Features provided free of charge: writing, editing, deleting and searching entries, attaching photos, tags, recording emotions, calendar view, app lock (PIN and pattern), dark mode, multiple languages, reading announcements, and Contact us.',
        'Features provided through the paid product "Jogak Pro": ad removal, encrypted backup and restore, and AI summary reports.',
        'The titles, text, photos, tags and emotions of the entries a user writes are stored only inside the user’s device, and are not transmitted to the operator’s servers unless the user turns the backup feature on.',
        'If backup is turned on, entries are encrypted on the user’s device before being transmitted, and the operator does not keep the decryption key and therefore cannot read their content.',
        'When an AI summary report is created, the diary text for the period the user requested passes through the operator’s server and is delivered to the artificial intelligence provider. The operator does not store that text. Further details are governed by the privacy policy.',
      ],
    },
    {
      h: 'Article 6 (Formation of the contract, and accounts)',
      body: [
        'The contract for use of the service is formed when the user installs the service, agrees to these terms, and then uses the service.',
        'Free features, including writing entries, may be used without an account.',
        'Contact us, payment for paid products, backup and restore, and AI summary reports require signing in with a Google account.',
        'A user may delete their account at any time on the [Settings] → [Contact us] screen inside the service. How to delete an account, and which information is deleted or retained, are governed by the account deletion guide.',
      ],
    },
    {
      h: 'Article 7 (Price of paid products and payment)',
      body: [
        'The fee for Jogak Pro is KRW 3,900 per month and KRW 29,000 per year, both inclusive of value-added tax.',
        'The fee is charged automatically to the user’s payment method registered with the open market, at the time the subscription begins and on each renewal date thereafter.',
        'There is no cost the user has to bear in addition to the fee. However, the data communication charges required to use the service are governed by the policy of the telecommunications provider the user has signed up with, and are borne by the user.',
        'The amount actually billed may differ from the amounts above depending on the open market’s exchange-rate and fee policies or its country-specific pricing. In that case the amount shown on the payment screen prevails.',
        'Where the operator raises the fee, it gives advance notice under article 4, and the increased price is not applied to a subscription period already paid for.',
      ],
    },
    {
      h: 'Article 8 (Restrictions on the conditions of sale)',
      body: [
        'The service can be used only in the countries where the open market permits distribution, and installation and payment are possible only in the countries the operator has designated for distribution.',
        'One paid subscription is linked to only one account at a time. If you sign in with a different Google account on the same device, the subscription transfers to that account and can no longer be used from the previous account.',
        'The operator may set an upper limit on the number of times a feature may be used, to the extent necessary to provide part of the service. The number of AI summary reports that may be generated is limited per period, and those limits are shown on the service screens.',
      ],
    },
    {
      h: 'Article 9 (Time and method of supply)',
      body: [
        'Jogak Pro is applied to the user’s account as soon as payment is completed, and there is no separate delivery process.',
        'Where payment has been completed but the entitlement has not been applied, the user may use [Restore purchases] on the [Subscription] screen inside the service, or contact the operator by the means in article 21.',
        'The subscription period runs from the payment date to the day before the next renewal date, and renews automatically for the same length of period unless it is cancelled.',
      ],
    },
    {
      h: 'Article 10 (Operating environment)',
      body: [
        'The service can be used on Android devices, and requires the operating system version shown on the open market’s listing page or later.',
        'Basic features such as writing, viewing and searching entries can be used without an internet connection.',
        'Reading announcements, Contact us, signing in, payment, backup and restore, and AI summary reports require an internet connection.',
        'Where the user’s device is short of storage space or its operating system falls outside the supported range, some features may not work properly.',
      ],
    },
    {
      h: 'Article 11 (Free trial and conversion to a paid subscription)',
      body: [
        'The operator provides a 7-day free trial of Jogak Pro.',
        'When the free trial period ends, it converts automatically to a paid recurring subscription and the fee in article 7 is charged.',
        'Before the conversion takes place, the operator displays the date and time of the conversion, the price before and after the change, and the payment method, and obtains the user’s consent; if the user does not consent, no payment is made.',
        'If you do not wish to be charged during the free trial, please cancel the subscription by the means in article 14 before the trial period ends. Even if you cancel, you can continue to use Jogak Pro until the trial period ends.',
      ],
    },
    {
      h: 'Article 12 (Withdrawal of offer)',
      body: [
        'The user may withdraw their offer within 7 days from the date of payment for a paid product, or from the date of receiving the written statement of the contract terms.',
        'Withdrawal of offer is made by communicating that intention to the enquiry channel in article 21, and the operator notifies the user of the outcome within 3 business days from the date of receipt.',
        'Once the offer has been withdrawn, the operator refunds the payment under article 13, and the user’s Jogak Pro entitlement ends immediately.',
        'However, under article 17(2)5 of the Act on Consumer Protection in Electronic Commerce, withdrawal of offer is restricted where the supply of digital content has begun. Even in that case, withdrawal of offer remains available in respect of any part of digital content supplied in instalments that has not yet been supplied.',
        'In order to apply that restriction, the operator, in accordance with paragraph 6 of the same article, indicates this fact and at the same time provides the 7-day free trial in article 11 as a trial-use product. Where the operator has not taken those measures, the user may withdraw their offer notwithstanding the restriction above.',
        'The operator does not claim any penalty or damages on the ground that a user has withdrawn their offer.',
      ],
    },
    {
      h: 'Article 13 (Refunds)',
      body: [
        'Because payment for paid products is made through the open market, refunds are also in principle processed in accordance with the open market’s refund procedure.',
        'The user may request a refund directly from the open market, or from the operator through the enquiry channel in article 21. Where the request is made to the operator, the operator handles it in consultation with the open market.',
        'The operator refunds the payment within 3 business days from the date it receives a declaration of withdrawal of offer or the like. Actual receipt of the money may take longer depending on the open market’s processing schedule.',
        'Where the operator delays the refund beyond that period without justifiable grounds, it also pays delay interest for the period of the delay, calculated by applying the rate prescribed by the Enforcement Decree of the Act on Consumer Protection in Electronic Commerce.',
        'Where a period has already been used, the operator may deduct the amount corresponding to that period before refunding. However, no deduction is made for any period during which the user could not use the service for reasons attributable to the operator.',
        'No separate fee is charged for a refund.',
      ],
    },
    {
      h: 'Article 14 (Cancelling the subscription)',
      body: [
        'The user may cancel the subscription at any time. Cancellation must be done by the user on the open market’s subscription management screen; the operator cannot cancel it on the user’s behalf.',
        'Google Play: Store app > profile > Payments and subscriptions > Subscriptions (https://play.google.com/store/account/subscriptions)',
        'Even after cancelling, you can continue to use Jogak Pro until the subscription period already paid for ends, and once that period has passed automatic renewal stops.',
        'Deleting your account in the service does not cancel the subscription on the open market. Unless you cancel it by the means above, separately from deleting your account, you will continue to be charged.',
      ],
    },
    {
      h: 'Article 15 (Contracts made by minors)',
      body: [
        'Where a minor has paid for a paid product without the consent of their legal representative, the minor or their legal representative may cancel that contract.',
        'However, cancellation is not available where the minor paid with property that their legal representative had permitted them to dispose of, or where the minor used deception to make the operator believe they were of full age.',
        'If you wish to cancel, please make the request through the enquiry channel in article 21. The operator may ask for documents confirming that you are the legal representative.',
      ],
    },
    {
      h: 'Article 16 (Obligations of the user)',
      body: [
        'The user must comply with applicable law and these terms when using the service.',
        'The user must not misappropriate another person’s account, interfere with the normal operation of the service, access or attempt to access the service by any means other than those provided by the operator, or manipulate the payment process for paid products.',
        'The user must manage their own account information and their app lock password or pattern.',
        'The user must keep safe the recovery code issued when the backup feature is turned on. If the recovery code is lost, the operator cannot decrypt the backup either, and restoring becomes impossible.',
      ],
    },
    {
      h: 'Article 17 (Storage of data, and backup)',
      body: [
        'The original of the entries a user writes is stored on the user’s device. If the app is deleted or the device is reset, the entries inside the device cannot be recovered.',
        'Where the backup feature has been turned on, the operator keeps an encrypted copy, and the user can restore it with their recovery code.',
        'Even after a subscription ends, the operator keeps the encrypted backup for 90 days, and restoring remains available during that period. Once 90 days have passed the backup is deleted.',
        'The operator has no push notification channel, so notice of the scheduled deletion above is given only by displaying it on screen when the user opens the app.',
        'If the user deletes their account, the encrypted backup held on the server is deleted together with the account, without the 90-day grace period.',
      ],
    },
    {
      h: 'Article 18 (Intellectual property)',
      body: [
        'The rights in the entries a user writes in the service and the photos they attach belong to the user. The operator asserts no rights whatsoever over them.',
        'The operator does not use users’ entries for any purpose other than providing the service, and does not use them for advertising, statistics or artificial intelligence training.',
        'The rights in the service itself and in the designs, trade marks and programs included in the service belong to the operator or to the rightful holders.',
        'The user must not reproduce, distribute or reverse-engineer the service without the operator’s prior consent.',
      ],
    },
    {
      h: 'Article 19 (Changes to, suspension of, and termination of the service)',
      body: [
        'The operator may change the content of the service in order to improve its quality. Where the content of a paid product is changed in a way unfavourable to users, advance notice is given under article 4.',
        'The operator may temporarily suspend provision of the service where there are unavoidable grounds such as inspection, replacement or breakdown of equipment or interruption of communications, in which case notice is given in advance. However, where there are unavoidable grounds that make advance notice impossible, notice is given afterwards.',
        'Where the operator terminates the service, it gives notice through announcements inside the service and the open market listing page at least 30 days before the termination date, and at the same time states the period during which users can download or restore their backups.',
        'On termination of the service, the fee corresponding to any period already paid for but not used is refunded to the user.',
      ],
    },
    {
      h: 'Article 20 (Responsibility)',
      body: [
        'The operator bears the responsibility provided by applicable law in relation to the provision of the service. No provision of these terms excludes or limits any responsibility of the operator that is provided by law.',
        'The operator is not responsible for damage arising from causes not attributable to the operator, such as force majeure, breakdown, loss or reset of the user’s device, or the user losing their recovery code or app lock password.',
        'An AI summary report is reference material generated by artificial intelligence, and is not a medical, psychological or legal diagnosis or advice. The operator does not warrant the accuracy of its content.',
        'Damage arising in the course of payment through the open market for reasons attributable to the open market is governed by the open market’s policy. The operator nonetheless gives all the cooperation needed to remedy the user’s loss.',
      ],
    },
    {
      h: 'Article 21 (Consumer complaints and handling of disputes)',
      body: [
        'To handle users’ comments and complaints, the operator runs the [Settings] → [Contact us] channel inside the service and the email channel below.',
        'Email: support@vivace-games.com',
        'Where the operator recognises that a comment or complaint raised by a user is justified, it handles it without delay; where handling takes time, it informs the user of the reason and the expected schedule.',
        'Where a dispute arises between the operator and a user, the user may apply to the following bodies for dispute mediation.',
        '• Consumer Dispute Settlement Commission (Korea Consumer Agency): 1372 (from Korea) · https://www.kca.go.kr',
        '• Content Dispute Resolution Committee: 1588-2594 · https://www.kcdrc.kr',
        '• Electronic Commerce Mediation Committee: 1661-5714 · https://www.ecmc.or.kr',
      ],
    },
    {
      h: 'Article 22 (Governing law and jurisdiction)',
      body: [
        'The law of the Republic of Korea applies to these terms and to the use of the service.',
        'An action concerning a dispute arising between the operator and a user is subject to the exclusive jurisdiction of the district court having jurisdiction over the user’s address at the time the action is filed, in accordance with article 36 of the Act on Consumer Protection in Electronic Commerce. Where there is no address, it is subject to the exclusive jurisdiction of the district court having jurisdiction over the user’s place of residence; and where the user’s address or place of residence is unclear at the time the action is filed, the competent court is determined in accordance with the Civil Procedure Act.',
        'The Korean version of these terms is the authoritative version. Where a translation into another language differs in meaning, the Korean version prevails.',
        'Addendum: These terms take effect on 17 August 2026.',
      ],
    },
  ],
};
