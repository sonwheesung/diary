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
  sourceFingerprint: '0a627bd3',
  effective: '2026-08-09',
  updated: '2026-08-11',
  intro:
    'Vivace Games ("the operator") complies with the Personal Information Protection Act and other applicable laws, and handles the personal data of users of "Jogak" ("the service") as set out below. Jogak does not send the diary entries you write to any server, and collects the minimum information necessary as a matter of principle.',
  sections: [
    {
      h: '1. What we do not collect (stated first)',
      body: [
        'The operator does not collect the following, and does not transmit it off your device.',
        '• Diary titles, text, lists, photos, tags and emotions — these are kept only in your device’s internal storage.',
        '• The PIN, pattern or hint answer used for app lock — these are kept in your device’s secure storage only in a non-recoverable form (a hash); the original is never stored anywhere.',
        '• Your name, date of birth, phone number, address, contact list, location, or any record of access to your full photo library.',
        'Photos you pick in the app are only copied into the app’s own folder on your device so they can be placed in an entry; they are not transmitted anywhere.',
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
        '※ Sign-in is needed only for Contact us; writing entries, app lock and other features do not require it.',
        '※ Children under 14 may not use the sign-in feature.',
        'b. Information collected automatically while ads are served',
        '• Advertising identifier (Android advertising ID), device and network information, ad impression and click records',
        '• The above is collected by Google (AdMob); details and how to opt out are in section 7.',
      ],
    },
    {
      h: '3. Purposes of processing',
      body: [
        '• Receiving and handling enquiries: to review what you sent and to identify and fix faults',
        '• Identifying you and replying: to deliver a reply to the user who wrote in, and to let you review your own enquiry history',
        '• Serving ads: to show ads to users on the free tier and to measure ad performance',
        'The operator does not use personal data for purposes other than the above, and will obtain consent in advance if the purpose changes.',
      ],
    },
    {
      h: '4. Retention and use periods',
      body: [
        '• Account information (email address, Google sub): until you delete your account. On deletion we destroy it without delay or render it non-traceable.',
        '• Enquiry content: 3 years from receipt (Act on Consumer Protection in Electronic Commerce — records on consumer complaints or dispute handling)',
        '• Behavioural data based on the advertising identifier: up to 1 year from collection',
        'Once the retention period passes or the purpose is achieved, we destroy the data without delay.',
      ],
    },
    {
      h: '5. Provision to third parties',
      body: [
        'The operator does not provide users’ personal data to third parties.',
        'Exceptions apply where there is a specific provision in law, or where an investigative authority makes a request following the procedures and methods prescribed by law.',
      ],
    },
    {
      h: '6. Outsourcing of processing and transfer abroad',
      body: [
        'To provide the service the operator outsources processing as follows, and some of it takes place outside Korea.',
        '• Google LLC — Country: United States. Contact: https://support.google.com/policies/contact/general_privacy_form. Purpose: serving and measuring ads (AdMob), Google account sign-in. Items: advertising identifier, device and network information, and on sign-in the email address and account identifier. When and how: transmitted over the network when an ad is requested and when you sign in. Retention: as per Google’s privacy policy',
        '• Supabase Inc. — Country: United States (place of incorporation). Contact: privacy@supabase.com. Purpose: storing enquiry and account information in a database. Items: the information in section 2(a). When and how: transmitted over the network when you send an enquiry. Retention: the periods in section 4. ※ The physical storage location is the Republic of Korea (Seoul region), but we disclose it as a transfer abroad because the operating company is located outside Korea.',
        '• Vercel Inc. — Country: United States. Contact: privacy@vercel.com. Purpose: running the server that receives enquiries. Items: the information in section 2(a). When and how: transmitted over the network when you send an enquiry. Retention: until the outsourcing contract ends',
        'You may refuse the transfer of your personal data abroad. To refuse ad-related transfers, turn off personalised ads using the method in section 7; to refuse enquiry-related transfers, simply do not use Contact us (all other features, including writing entries, remain fully available).',
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
        'More on how Google handles personal data for advertising: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Procedure and method of destruction',
      body: [
        'Procedure: personal data whose retention period has passed or whose purpose has been achieved is destroyed without delay. Where retention is required by law, it is stored separately from other personal data for that period and then destroyed.',
        'Method: information in electronic file form is permanently deleted by technical means that make recovery or reconstruction impossible.',
        'Entries, photos and lock information stored on your device are removed from the device when you use the app’s "Reset everything" function or delete the app. The operator does not hold this information and therefore cannot delete it for you.',
      ],
    },
    {
      h: '9. Rights of data subjects and legal representatives, and how to exercise them',
      body: [
        'You may exercise the following rights at any time.',
        '• Request access to your personal data • Request correction where there is an error • Request deletion • Request suspension of processing • Request transmission of your personal data (Personal Information Protection Act art. 35-2)',
        'You may exercise these rights in writing or by email using the contact in section 11, and the operator will act without delay.',
        'If you request correction of an error in your personal data, we will not use or provide that data until the correction is complete.',
        'The legal representative of a child under 14 may exercise the above rights on the child’s behalf.',
      ],
    },
    {
      h: '10. Measures to ensure security',
      body: [
        '• Administrative: minimising the number of people who handle personal data, and regular training for them',
        '• Technical: access control for the personal data processing system, encryption in transit (HTTPS), storing app lock secrets as hashes and using the device secure storage (Keystore/Keychain)',
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
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'From the day the version containing monthly subscription and backup/restore is released',
      summary:
        'Monthly subscription and backup/restore are being added. If you subscribe, your subscription status and transaction identifier are processed; and only if you turn backup on, a copy of your entries encrypted on your device is stored on the operator’s server. The operator cannot decrypt that copy.',
      sections: [
        {
          h: 'a. What changes (before → after)',
          body: [
            'Before: diary titles, text and photos are not transmitted off your device.',
            'After: **only if you turn backup on yourself**, a copy of your entries encrypted on your device is stored on the operator’s server. If you do not turn backup on, not a single character is transmitted, exactly as before.',
            '⚠ To be precise: the operator **stores that copy but cannot read it.** The decryption key exists only on your device and in the recovery code you keep; the operator does not have it.',
          ],
        },
        {
          h: 'b. Additional information stored if you turn backup on',
          body: [
            '• An encrypted copy of your entries — in a form the operator cannot decrypt',
            '• Backup identifier, backup time, generation number, size — **this information is not encrypted.** The operator can tell which account backed up, when, and how much.',
            '• Legal basis: your separate consent (taken on the screen where you turn backup on)',
          ],
        },
        {
          h: 'c. Retention period',
          body: [
            '• Kept while backup is on, and for 90 days after a subscription ends, then destroyed automatically.',
            '• If you turn backup off, request deletion, or delete your account, we destroy it without delay rather than waiting 90 days.',
            '• Backups untouched for 3 years or more are destroyed. (This covers the case where you deleted the app without deleting your account.)',
            '• A record of the destruction (backup identifier and time of destruction) is kept for 1 year — so that you can find out "why restore does not work"; the account identifier is not kept with it.',
            '⚠ Notice that a subscription has expired reaches you only on screen when you open the app. If you do not open the app, this notice may not reach you.',
          ],
        },
        {
          h: 'd. Limits on access requests',
          body: [
            'If you request access to your backup, all the operator can give you is **the ciphertext, which cannot be decrypted, and the metadata in (b) above.** We cannot provide your entries in human-readable form — the operator does not hold the key.',
            'You yourself can restore at any time in the app using your recovery code.',
            '⚠ If you lose your recovery code there is no way to open the backup. The operator cannot open it for you either.',
          ],
        },
        {
          h: 'e. Information stored if you use a subscription',
          body: [
            '• Subscription status — entitlement key, subscription expiry time, payment-failure grace time, whether it will renew',
            '• The transaction identifier issued by the store, the product identifier, and whether the purchase was made in the production or test environment',
            '• Records of subscription status changes sent by the payment service (purchase, renewal, cancellation, refund, etc.) and their raw content',
            '⚠ Payment details such as credit card or bank account numbers are handled by Google Play and are not passed to the operator. The operator can only tell that you paid and until when the subscription is valid.',
            '• Legal basis: Personal Information Protection Act art. 15(1)4 (necessary to carry out measures requested by the user — that is, to provide the subscription entitlement you applied for)',
            '• Purpose: confirming subscription entitlement (ad removal, use of backup), handling payment enquiries and refunds',
          ],
        },
        {
          h: 'f. Retention period for subscription-related information',
          body: [
            '• Records on contracts or withdrawal of subscription, and on payment and supply of goods: 5 years (Act on Consumer Protection in Electronic Commerce, art. 6)',
            '• If you delete your account, the account identifiers (email, Google sub) are rendered non-traceable without delay, and the transaction records above are stored separately in a non-traceable form for the period above and then destroyed.',
            '⚠ Deleting your account does not automatically cancel your Google Play subscription. You must cancel it yourself in Google Play > Subscriptions; if you do not, you will continue to be charged.',
          ],
        },
        {
          h: 'g. Outsourcing and transfer abroad (additional)',
          body: [
            '• Supabase Inc. — Country: United States (place of incorporation). Contact: privacy@supabase.com. Purpose: storing the encrypted backup copy and subscription status. Items: the information in (b) and (e) above. Retention: the periods in (c) and (f) above. ※ The physical storage location is the Republic of Korea (Seoul region).',
            '• Vercel Inc. — Country: United States. Contact: privacy@vercel.com. Purpose: running the backup server. ※ The encrypted copy is sent directly to storage without passing through this server.',
            '• RevenueCat, Inc. — Country: United States. Contact: compliance@revenuecat.com. Purpose: verifying subscription payments and checking subscription status. Items: account identifier, store transaction and product identifiers, device and app information. When and how: transmitted over the network when you open the subscription screen and when you pay. Retention: until the outsourcing contract ends',
            '• Google LLC — in addition to the transfer described in section 6 above, store transaction information is processed for the purpose of handling and verifying subscription payments.',
            'You may refuse transfer abroad. If you do not turn backup on and do not subscribe, the transfers above do not occur, and all other features including writing entries remain fully available.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'From the day the version containing AI summary reports is released',
      summary:
        'AI summary reports are being added. Only when you create a report yourself, the diary content for that period passes through the operator’s server unencrypted and is sent to the AI provider. The operator does not store the diary content, but keeps the generated summary for 90 days in order to improve report quality. The AI provider keeps it for up to 30 days for abuse monitoring, then deletes it, and does not use it for model training.',
      sections: [
        {
          h: 'a. What changes (before → after)',
          body: [
            'Before: diary titles and text are not transmitted off your device. Even if you turned backup on, they are transmitted only as ciphertext the operator cannot read.',
            'After: **only when you press Create report yourself**, the diary content for that period is sent **unencrypted** through the operator’s server to the AI provider, and a summary is generated.',
            '⚠ To be precise: the operator **does not store the diary content itself**. However, ① at the moment the summary is being made the content passes through the operator’s server, so we cannot tell you that "the operator cannot see it", and ② **the generated summary is kept for 90 days** (see d below). We state this plainly rather than blur it.',
            'If you do not create a report, this transmission does not occur at all, and all other features including writing entries remain fully available.',
          ],
        },
        {
          h: 'b. Separate consent for sensitive information',
          body: [
            'A diary may contain sensitive information such as health or psychological state, as defined in article 23 of the Personal Information Protection Act.',
            'Because AI summary reports process that content unencrypted, we take **separate consent for the processing of sensitive information** the first time you use the feature. This consent is **separate** from the consent to transfer abroad in (c) below, and you may choose each independently.',
            'If you do not consent, every feature other than AI reports remains fully available.',
          ],
        },
        {
          h: 'c. Separate consent for transfer abroad',
          body: [
            'The AI provider is located outside Korea. The provider’s name, the receiving country and its contact details are stated in this section at the time the feature is released, and are also shown in the app before consent is taken.',
            '• Items transferred: the title, text, emotion and date of the entries in the period you requested a report for',
            '• Purpose: generating a summary report',
            '• When and how: transmitted over the network when you press Create report',
            '• Retention: the operator’s server **does not store the transferred items (diary content)** — they are held in memory only while the summary is being made and then discarded. Retention of the generated summary is stated separately in (d) below. The AI provider keeps them for **up to 30 days** for abuse monitoring and then deletes them, and even during that period **does not use them for model training.**',
            'You may refuse the transfer abroad; if you do, only AI reports become unavailable and all other features remain fully available.',
          ],
        },
        {
          h: 'd. What the operator does store',
          body: [
            'We do not store diary content (titles and text). We do store the following.',
            '• **The summary generated by AI** — kept in order to check and improve report quality. Retention: **90 days from the day it was created**, after which it is deleted automatically.',
            '• The identifier of the account that created the report, the period, the number of times, and the number of tokens used — used for billing and abuse prevention. Retention: until the purpose is achieved or until you delete your account',
            '⚠ A summary is written on the basis of your diary, so diary content may appear within it. We state this plainly rather than blur it.',
            'The finished report is stored **on your device as well**, and is included in your backup in encrypted form if you have turned backup on.',
          ],
        },
        {
          h: 'e. Your rights',
          body: [
            '• Reports are generated only when you create them yourself; they are never generated automatically.',
            '• You can delete a report you have created at any time in the app.',
            '• Deleting it in the app removes it from your device; the summary kept on the operator’s server is deleted automatically after 90 days. If you want it deleted sooner, you can ask through Contact us.',
            '• Summaries generated by AI may differ from fact and are not a medical or psychological diagnosis or advice. The app provides a way to report a summary.',
          ],
        },
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
 * ⚠ Structure must match the Korean exactly — 5 sections (6/4/4/3/3 lines) plus two
 *   upcoming amendments. `npm run check:legal` enforces it.
 */
export const DELETE_ACCOUNT_EN: LegalDoc = {
  title: 'Jogak — How to delete your account',
  sourceFingerprint: 'a6b3a8b5',
  effective: '2026-08-10',
  updated: '2026-08-10',
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
      ],
    },
    {
      h: '4. Data that is kept, and for how long',
      body: [
        'The following is kept as required by law, and even during that period it remains only in a form that cannot be traced back to its author (pseudonymised).',
        '• Enquiry contents: 3 years (Act on Consumer Protection in Electronic Commerce — records of consumer complaints and dispute handling)',
        'Once the retention period ends we destroy it without delay.',
      ],
    },
    {
      h: '5. What is not deleted — the diary on your device',
      body: [
        'Your Jogak entries (titles, text, photos, tags and emotions) are stored only inside your own device and are not transmitted to the operator’s servers.',
        'So deleting your account leaves the entries on your device untouched. To erase those as well, uninstall the app or use the reset option in the app’s [Settings].',
        'Conversely, if you uninstall the app the entries on your device cannot be recovered.',
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'From the day a version including the monthly subscription and backup/restore features is released',
      summary:
        'If you turned backup on, deleting your account also deletes the encrypted backup held on the server. Subscription transaction records are kept as required by law, pseudonymised.',
      sections: [
        {
          h: 'a. Data that is additionally deleted',
          body: [
            '• The encrypted copy of your diary held on the server — deleted together with your account. We do not wait out the 90-day grace period.',
            '• The backup identifier and backup records (time, size, generation number)',
            '⚠ This cannot be undone. Even if you still hold your recovery code, you will not be able to restore.',
            '⚠ The entries on your device remain untouched. Only the server-side copy is deleted.',
          ],
        },
        {
          h: 'b. Data that is additionally kept, and for how long',
          body: [
            '• Subscription transaction records (transaction identifier, product, subscription period, history of payment state changes): 5 years (Act on Consumer Protection in Electronic Commerce, art. 6)',
            '• A record that a backup was destroyed (backup identifier and time of destruction): 1 year — so that you can find out "why restore no longer works". Your account identifier is not kept alongside it.',
            'Even during those periods, these records remain only in a form that cannot be traced back to their author.',
          ],
        },
        {
          h: 'c. You must cancel the subscription separately',
          body: [
            'Deleting your account does not cancel your Google Play subscription. If you do not cancel it, you will keep being charged.',
            'To cancel: Google Play Store app > profile > Payments and subscriptions > Subscriptions (https://play.google.com/store/account/subscriptions)',
            'Refunds of amounts already charged follow Google Play’s refund policy and the operator’s refund policy. Ask us using the contact address below.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'From the day a version including the AI summary report feature is released',
      summary:
        'AI report text is stored on your device. On the server, report summaries are kept for up to 90 days for quality review, and are deleted together with your usage records when you delete your account.',
      sections: [
        {
          h: 'a. What gets deleted for AI reports',
          body: [
            '• The usage records kept on the server (account identifier, period, count, token counts) — deleted together with your account.',
            '• The report summaries held on the server (up to 90 days) — deleted together with your account. The diary text itself is never stored, so there is nothing to delete.',
            '⚠ Report text is also stored on your device, so it stays there after you delete your account. To erase it, delete the reports in the app or uninstall the app.',
            '• If you turned backup on, reports are included in the backup in encrypted form and are deleted when the backup is deleted.',
          ],
        },
      ],
    },
  ],
};
