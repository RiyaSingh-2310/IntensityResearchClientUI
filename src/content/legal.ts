export interface LegalBlock {
  kind: 'paragraph' | 'list' | 'note'
  text?: string
  items?: string[]
}

export interface LegalSection {
  id: string
  title: string
  blocks: LegalBlock[]
}

export interface LegalPageContent {
  eyebrow: string
  title: string
  description: string
  updated?: string
  intro: string[]
  sections: LegalSection[]
}

export const privacyPolicy: LegalPageContent = {
  eyebrow: 'Intensity Research',
  title: 'Privacy Policy',
  description:
    'This notice explains how Intensity Research collects, uses, shares, and protects personal data for market research, the Intensity Research panel, and related business activities.',
  updated: 'Last updated: 31 July 2026',
  intro: [
    'This notice explains how we collect, use, share, retain, transfer, and protect personal data across our market research and business activities.',
    'Project-specific information: a survey invitation, consent form, or project-specific notice may contain additional details relevant to a particular study. That information should be read together with this notice.',
  ],
  sections: [
    {
      id: 'about-this-notice',
      title: '1. About This Notice',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Intensity Research (“Intensity Research,” “we,” “our,” or “us”) respects the privacy of the individuals whose personal data we handle.',
        },
        {
          kind: 'paragraph',
          text: 'This notice describes our general data-handling practices for market research, respondent recruitment, research panels, project administration, quality control, website operations, and business communications.',
        },
        {
          kind: 'paragraph',
          text: 'We handle personal data in accordance with the privacy and data-protection laws that apply to a particular activity. Where the European Union General Data Protection Regulation or another international law applies, we follow the relevant requirements.',
        },
      ],
    },
    {
      id: 'who-we-are',
      title: '2. Who We Are',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Intensity Research is a market research company providing respondent recruitment, online sampling, fieldwork, project support, and related research services for consumer, business, healthcare professional, patient, and caregiver studies.',
        },
        {
          kind: 'paragraph',
          text: 'Privacy contact: info@intensityresearch.com. Website: intensityresearch.com.',
        },
      ],
    },
    {
      id: 'who-this-notice-covers',
      title: '3. Who This Notice Covers',
      blocks: [
        { kind: 'paragraph', text: 'This notice may apply to:' },
        {
          kind: 'list',
          items: [
            'Research participants and people invited to participate in research.',
            'Members of our research panel or recruitment database, including Intensity Research panelists.',
            'Healthcare professionals, patients, caregivers, and other specialist audiences.',
            'Client, prospective-client, supplier, and business representatives.',
            'Individuals included in an authorized client-provided contact list.',
            'Website visitors and people who contact us.',
            'Other individuals whose information we process for legitimate research or business purposes.',
          ],
        },
      ],
    },
    {
      id: 'data-protection-role',
      title: '4. Our Data-Protection Role',
      blocks: [
        { kind: 'paragraph', text: 'Our role depends on the activity:' },
        {
          kind: 'list',
          items: [
            'We may decide why and how personal data is used, for example when managing our panel, business contacts, website enquiries, quality-control records, or incentive administration.',
            'We may process personal data for a client or research sponsor and follow that organization’s documented instructions.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'The organization responsible for a specific project may be identified in the invitation, consent materials, or project-specific notice.',
        },
      ],
    },
    {
      id: 'information-we-collect',
      title: '5. Information We May Collect',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The information we collect depends on the purpose and the individual’s relationship with us. It may include:',
        },
        {
          kind: 'list',
          items: [
            'Contact and identity information: name, email address, telephone number, country, general location, and participant or panel ID.',
            'Profile and demographic information: age range, gender, region, household information, education, income range, interests, and consumer characteristics.',
            'Professional information: employer, organization type, industry, job title, seniority, responsibilities, experience, specialty, practice setting, and relevant publicly available professional information.',
            'Research information: screening answers, eligibility information, survey responses, opinions, interview or group-discussion contributions, recordings or transcripts where disclosed, participation history, and project status.',
            'Sensitive personal data: health or other legally protected information where relevant to a study and handled with appropriate notice, consent, and safeguards.',
            'Technical and quality information: IP address, browser, device, operating system, access time, approximate technical location, duplicate indicators, security signals, and response-quality information.',
            'Payment information: limited details needed to arrange, verify, or reconcile an incentive or honorarium.',
            'Business and website information: correspondence, enquiries, meeting records, project documents, contracts, invoices, billing information, and website interactions.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'We aim to collect only information reasonably relevant to the research, service, security, legal, or business purpose involved.',
        },
      ],
    },
    {
      id: 'how-we-obtain-data',
      title: '6. How We Obtain Personal Data',
      blocks: [
        { kind: 'paragraph', text: 'We may obtain personal data:' },
        {
          kind: 'list',
          items: [
            'Directly from the individual.',
            'Through our panel, recruitment database, screening forms, surveys, interviews, focus groups, or other research activities.',
            'From a client, research sponsor, or authorized client-provided contact list.',
            'From approved research, technology, quality-control, communication, incentive, or payment providers.',
            'From referrals, company websites, professional directories, or other publicly available professional sources, where appropriate.',
            'Through business correspondence, meetings, forms, or enquiries.',
            'Automatically through our website, systems, or survey links.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Where we receive information indirectly, we use it for the relevant purpose and provide information about the source where required by applicable law.',
        },
      ],
    },
    {
      id: 'why-we-use-data',
      title: '7. Why We Use Personal Data',
      blocks: [
        { kind: 'paragraph', text: 'We may use personal data to:' },
        {
          kind: 'list',
          items: [
            'Register and manage panel or recruitment-database members.',
            'Identify, invite, screen, schedule, and communicate with suitable research participants.',
            'Conduct surveys, interviews, focus groups, research communities, or other research activities.',
            'Manage project instructions, attendance, recontact, and study administration.',
            'Administer incentives, honoraria, and payments.',
            'Verify eligibility, identity, profile, employment, or professional background.',
            'Prevent duplicate, fraudulent, abusive, ineligible, or poor-quality participation.',
            'Review research quality and investigate project, payment, or security concerns.',
            'Manage client projects, suppliers, contracts, invoices, and business relationships.',
            'Respond to enquiries, complaints, privacy requests, audits, or legal claims.',
            'Protect our systems, information, people, and business operations.',
            'Improve our services and research processes.',
            'Meet contractual, legal, regulatory, accounting, tax, and reporting requirements.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Research responses are used for research and insight purposes. We do not use an individual’s research responses to market a client’s products or services to that individual unless separate permission has been obtained.',
        },
      ],
    },
    {
      id: 'when-information-is-required',
      title: '8. When Providing Information Is Required',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Providing personal data is generally voluntary. However, certain information may be required to:',
        },
        {
          kind: 'list',
          items: [
            'Determine eligibility for a research study.',
            'Confirm identity, professional status, or study participation.',
            'Arrange an incentive or payment.',
            'Respond to an enquiry or privacy request.',
            'Enter into or administer a client or supplier relationship.',
            'Meet legal, contractual, quality, security, or reporting requirements.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'If required information is not provided, we may be unable to offer participation, process a payment, complete verification, respond fully to a request, or provide the relevant service.',
        },
      ],
    },
    {
      id: 'legal-grounds',
      title: '9. Legal Grounds for Processing',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The legal ground depends on the type of information, the activity, and the applicable law. We may rely on:',
        },
        {
          kind: 'list',
          items: [
            'Consent, including explicit consent for sensitive information where required.',
            'Contractual necessity, including steps requested before entering into a contract.',
            'Legitimate and proportionate interests, where permitted, such as project administration, business relationship management, quality control, fraud prevention, information security, and protection of legal rights.',
            'Legal obligations, including accounting, tax, regulatory, breach-notification, and reporting requirements.',
            'Another ground permitted by applicable law.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Where we rely on consent, it may be withdrawn by contacting us. Withdrawal does not affect processing already carried out lawfully and may not require deletion where another valid reason for retention applies.',
        },
      ],
    },
    {
      id: 'voluntary-participation',
      title: '10. Voluntary Research Participation',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Participation in research is voluntary. Participants may normally decline an invitation, refuse to answer a question, or stop participating.',
        },
        {
          kind: 'paragraph',
          text: 'Before or at the start of a study, participants may receive information about the research purpose, expected duration, incentive, recording or observation, recontact, confidentiality, data sharing, and any special healthcare or safety-reporting requirements.',
        },
        {
          kind: 'paragraph',
          text: 'Some completed responses may no longer be removable after they have been anonymized, combined with other responses, delivered to a client, or used in completed analysis.',
        },
      ],
    },
    {
      id: 'healthcare-research',
      title: '11. Healthcare and Sensitive Research',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Some studies involve healthcare professionals, patients, caregivers, medical conditions, treatments, or other sensitive topics. For these studies, we limit collection to information relevant to the research and apply additional notice, consent, access, and confidentiality measures where appropriate.',
        },
        {
          kind: 'paragraph',
          text: 'If a participant reports an adverse event, product complaint, or safety concern during applicable healthcare research, relevant information may need to be passed to the research sponsor or its authorized safety team in accordance with the study notice and applicable requirements.',
        },
      ],
    },
    {
      id: 'client-lists',
      title: '12. Client-Provided Lists and Business Contacts',
      blocks: [
        {
          kind: 'paragraph',
          text: 'A client may provide an authorized contact list for a particular research project. We use such information for the agreed purpose, restrict access, and do not use the list for unrelated marketing or unrelated studies.',
        },
        {
          kind: 'paragraph',
          text: 'We may also use professional contact details to communicate with existing or prospective clients, suppliers, or business partners about relevant research services or opportunities. Such details may come directly from the person, a referral, a company website, a professional directory, or another lawful business source.',
        },
        {
          kind: 'paragraph',
          text: 'Business contacts may opt out of future promotional communications by using an unsubscribe option where available, replying to the message, or contacting info@intensityresearch.com. We may retain limited suppression information so that the request is respected.',
        },
      ],
    },
    {
      id: 'sharing',
      title: '13. Sharing and Disclosure of Personal Data',
      blocks: [
        {
          kind: 'paragraph',
          text: 'To provide our research and business services, we may share limited personal data where necessary with:',
        },
        {
          kind: 'list',
          items: [
            'Clients, research sponsors, and authorized project contacts.',
            'Research, recruitment, fieldwork, translation, transcription, scheduling, or moderation partners.',
            'Survey, hosting, communication, IT, security, fraud-prevention, incentive, and payment providers.',
            'Professional advisers, auditors, insurers, banks, or parties involved in a legitimate business transaction.',
            'Courts, regulators, law-enforcement bodies, or other parties where disclosure is required or permitted by law.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Research findings are normally shared in aggregated, anonymized, or pseudonymized form. Direct contact details or other identifying information are disclosed only where needed for the stated purpose, the individual has been appropriately informed, and suitable safeguards apply.',
        },
        {
          kind: 'paragraph',
          text: 'Service providers may receive limited technical or operational information, such as log data, browser or device information, payment details, or project identifiers, only to the extent needed to provide their service.',
        },
        {
          kind: 'paragraph',
          text: 'Recipients are expected to use personal data only for the relevant purpose and to apply appropriate confidentiality, security, and data-protection measures.',
        },
        {
          kind: 'paragraph',
          text: 'We do not sell or rent personal data as a list for third-party direct marketing.',
        },
      ],
    },
    {
      id: 'international-transfers',
      title: '14. International Processing and Transfers',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Intensity Research supports international research. Personal data may therefore be accessed, stored, or processed in another country used by a client, research partner, or service provider.',
        },
        {
          kind: 'paragraph',
          text: 'Where required, we use appropriate contractual, technical, and organizational measures for international transfers. These may include data-processing terms, contractual confidentiality requirements, access restrictions, data minimization, secure transfer methods, or approved transfer clauses.',
        },
        {
          kind: 'paragraph',
          text: 'For relevant transfers from the European Economic Area, an approved transfer mechanism such as the European Commission’s Standard Contractual Clauses may be used where appropriate.',
        },
      ],
    },
    {
      id: 'security',
      title: '15. Security, Fraud Prevention, and Quality Controls',
      blocks: [
        {
          kind: 'paragraph',
          text: 'We use reasonable administrative, technical, and organizational measures designed to protect personal data against unauthorized access, misuse, loss, alteration, or disclosure.',
        },
        {
          kind: 'paragraph',
          text: 'These measures may include access controls, password-protected accounts, approved business systems, secure transmission, software protection, backups, confidentiality obligations, staff guidance, and incident-response procedures.',
        },
        {
          kind: 'paragraph',
          text: 'We may use technical and behavioural indicators to support eligibility checks, duplicate prevention, fraud detection, survey security, and response-quality review. An automated indicator may lead to further review, exclusion from a study, withholding of an incentive while a matter is investigated, or restriction of future participation where justified.',
        },
        {
          kind: 'paragraph',
          text: 'No system or transmission method is completely secure, and absolute security cannot be guaranteed.',
        },
      ],
    },
    {
      id: 'retention',
      title: '16. Retention and Deletion',
      blocks: [
        {
          kind: 'paragraph',
          text: 'We retain personal data only for as long as reasonably necessary for the purpose for which it was collected, the research or business relationship, quality validation, payment administration, fraud prevention, legal claims, or applicable contractual, accounting, tax, and regulatory requirements.',
        },
        {
          kind: 'paragraph',
          text: 'Retention periods vary according to the type of information and project. When information is no longer needed, it may be deleted, anonymized, or securely destroyed. Information held in backups may be removed through the relevant backup-retention cycle.',
        },
        {
          kind: 'paragraph',
          text: 'Limited records may be retained after an opt-out or deletion request where needed to respect the request, prevent duplicate or fraudulent participation, resolve payments or quality disputes, comply with law, or protect legal rights.',
        },
      ],
    },
    {
      id: 'your-rights',
      title: '17. Your Choices and Rights',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Depending on applicable law and the circumstances, an individual may be able to:',
        },
        {
          kind: 'list',
          items: [
            'Ask whether we hold personal data about them and request access to it.',
            'Request correction of inaccurate or incomplete information.',
            'Update consent or communication preferences.',
            'Request deletion, restriction, or portability where applicable.',
            'Object to certain processing or withdraw consent.',
            'Opt out of future research invitations or business communications.',
            'Complain to an applicable privacy or data-protection authority.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'These rights are not absolute. A request may be limited by identity-verification requirements, legal obligations, contractual responsibilities, completed anonymization, technical limitations, fraud-prevention needs, payment or quality disputes, or the rights of other persons.',
        },
        {
          kind: 'paragraph',
          text: 'Where Intensity Research processes information only for a client or research sponsor, we may refer or forward the request to that organization and assist where appropriate.',
        },
        { kind: 'paragraph', text: 'Requests may be sent to info@intensityresearch.com.' },
      ],
    },
    {
      id: 'children',
      title: '18. Children and Young People',
      blocks: [
        {
          kind: 'paragraph',
          text: 'We do not knowingly involve children in research unless the project specifically requires their participation and suitable legal, consent, age-appropriate notice, privacy, and safety measures are in place.',
        },
        {
          kind: 'paragraph',
          text: 'If we learn that a child’s information was collected without required authorization, we will take appropriate steps, which may include deletion.',
        },
      ],
    },
    {
      id: 'cookies',
      title: '19. Cookies, Similar Technologies, and External Websites',
      blocks: [
        {
          kind: 'paragraph',
          text: 'A cookie is a small text file or similar identifier stored on or accessed from a browser or device. Our website and survey systems may use cookies or similar technologies for:',
        },
        {
          kind: 'list',
          items: [
            'Essential and security purposes: operating the website or survey, maintaining sessions, protecting systems, and supporting basic functions.',
            'Research quality and verification: preventing duplicate participation, supporting eligibility checks, detecting suspicious activity, and protecting survey integrity.',
            'Preferences and functionality: remembering selected settings and improving the user experience.',
            'Measurement and performance: understanding website or survey usage and improving performance.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'We do not use survey participants’ browsing information to provide third-party advertising. We will not describe or use advertising or targeting cookies unless such technologies are actually used.',
        },
        {
          kind: 'paragraph',
          text: 'Browser settings may be used to manage cookies. Where applicable law requires consent for non-essential cookies, appropriate information and consent choices will be provided.',
        },
        { kind: 'note', text: 'External websites' },
        {
          kind: 'paragraph',
          text: 'Our website may contain links to external websites. We do not control their privacy, content, or security practices, and their own privacy notices apply.',
        },
      ],
    },
    {
      id: 'incidents',
      title: '20. Privacy and Security Incidents',
      blocks: [
        {
          kind: 'paragraph',
          text: 'We maintain procedures to assess, contain, investigate, document, and respond to suspected privacy or security incidents.',
        },
        {
          kind: 'paragraph',
          text: 'Where required, we may notify affected clients, individuals, regulators, or other authorities within the applicable legal period.',
        },
      ],
    },
    {
      id: 'contact',
      title: '21. Contact, Requests, and Complaints',
      blocks: [
        { kind: 'paragraph', text: 'Questions, requests, concerns, or complaints may be sent to:' },
        {
          kind: 'paragraph',
          text: 'Privacy Contact, Intensity Research.',
        },
        {
          kind: 'paragraph',
          text: 'Email: info@intensityresearch.com. Website: intensityresearch.com.',
        },
        {
          kind: 'paragraph',
          text: 'We will review the matter and respond within a reasonable period. An individual may also have the right to contact the relevant privacy or data-protection authority in their country.',
        },
      ],
    },
    {
      id: 'changes',
      title: '22. Changes to This Notice',
      blocks: [
        {
          kind: 'paragraph',
          text: 'We may update this notice when our services, practices, technology, or legal obligations change. The latest version will be posted on this page with the revised date. Where required, we will provide additional notice of material changes.',
        },
        {
          kind: 'paragraph',
          text: 'Please contact our Privacy Contact if you would like to ask a question, update your communication preferences, exercise an applicable privacy right, or raise a concern about how personal data has been handled.',
        },
      ],
    },
  ],
}

/** Screenshot topic order. Every privacy section id is included once. */
export const privacyTopics: { id: string; title: string; sectionIds: string[] }[] = [
  { id: 'privacy-statement', title: 'Privacy Statement', sectionIds: ['about-this-notice', 'changes'] },
  {
    id: 'collection',
    title: 'Collection of your Personal Information',
    sectionIds: ['who-this-notice-covers', 'information-we-collect', 'how-we-obtain-data', 'when-information-is-required', 'children'],
  },
  {
    id: 'use',
    title: 'Use of your Personal Information',
    sectionIds: ['data-protection-role', 'why-we-use-data', 'legal-grounds', 'voluntary-participation', 'healthcare-research', 'your-rights'],
  },
  { id: 'cookies', title: 'Use of Cookies', sectionIds: ['cookies'] },
  {
    id: 'security',
    title: 'Security of your Personal Information',
    sectionIds: ['security', 'retention', 'incidents'],
  },
  { id: 'sharing', title: 'Sharing', sectionIds: ['client-lists', 'sharing', 'international-transfers'] },
  { id: 'contact', title: 'Contact Information', sectionIds: ['who-we-are', 'contact'] },
]

export const termsConditions: LegalPageContent = {
  eyebrow: 'Intensity Research',
  title: 'Terms & Conditions',
  description:
    'These terms govern participation in Intensity Research surveys and research activities, and the rewards you may earn by sharing your opinions.',
  intro: [
    'Welcome to Intensity Research. These Terms of Service (“Terms”) govern your participation in our surveys and research activities (“Services”) and your ability to earn rewards by sharing your opinions. By participating in our Services, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, please do not participate in our surveys or research activities.',
  ],
  sections: [
    {
      id: 'eligibility',
      title: '1. Eligibility',
      blocks: [
        { kind: 'paragraph', text: 'To participate in our Services and earn rewards, you must:' },
        {
          kind: 'list',
          items: [
            'Age requirement: be at least 18 years old or the age of majority in your jurisdiction.',
            'Accurate information: provide accurate and truthful information during registration and survey participation.',
            'Residency: be a legal resident of the country specified in the survey invitation.',
          ],
        },
      ],
    },
    {
      id: 'account-registration',
      title: '2. Account Registration',
      blocks: [
        {
          kind: 'list',
          items: [
            'Account creation: you may need to create an account to participate in surveys and earn rewards.',
            'Accurate information: you agree to provide accurate, current, and complete information during registration and keep your account information updated.',
            'Account responsibility: you are responsible for maintaining the confidentiality of your account credentials and all activities under your account.',
          ],
        },
      ],
    },
    {
      id: 'participation',
      title: '3. Participation in Surveys',
      blocks: [
        {
          kind: 'list',
          items: [
            'Voluntary participation: participation in surveys is voluntary, and you may withdraw at any time.',
            'Honest responses: by participating, you agree to provide honest and accurate responses.',
            'Non-transferability: you acknowledge that survey invitations are non-transferable and intended solely for your personal use.',
          ],
        },
      ],
    },
    {
      id: 'earning-rewards',
      title: '4. Earning Rewards',
      blocks: [
        {
          kind: 'list',
          items: [
            'Rewards eligibility: you may earn rewards for completing surveys, subject to the terms specified in each survey invitation.',
            'Types of rewards: rewards may include cash, gift cards, vouchers, or other incentives as described in the survey.',
            'Program modifications: Intensity Research reserves the right to modify or terminate reward programs at any time without notice.',
          ],
        },
      ],
    },
    {
      id: 'payment-of-rewards',
      title: '5. Payment of Rewards',
      blocks: [
        {
          kind: 'list',
          items: [
            'Processing time: rewards will be processed and delivered according to the terms specified in each survey.',
            'Delivery timeframe: please allow up to 4–6 weeks for rewards to be processed and delivered.',
            'Taxes and fees: you are responsible for any taxes or fees associated with receiving rewards.',
          ],
        },
      ],
    },
    {
      id: 'user-conduct',
      title: '6. User Conduct',
      blocks: [
        { kind: 'paragraph', text: 'By participating in our Services, you agree not to:' },
        {
          kind: 'list',
          items: [
            'Prohibited use: use the Services for any illegal or unauthorized purpose.',
            'False information: provide false or misleading information in your account or survey responses.',
            'Fraudulent activity: engage in fraudulent activity to earn rewards.',
            'Security interference: interfere with or disrupt the security or performance of the Services.',
          ],
        },
      ],
    },
    {
      id: 'privacy',
      title: '7. Privacy and Data Protection',
      blocks: [
        {
          kind: 'list',
          items: [
            'Privacy commitment: we value your privacy and are committed to protecting your personal information. Please review our Privacy Policy, which explains how we collect, use, and disclose information when you participate in our Services.',
            'Consent: by participating, you consent to our collection, use, and disclosure of your information as described in our Privacy Policy.',
          ],
        },
      ],
    },
    {
      id: 'intellectual-property',
      title: '8. Intellectual Property',
      blocks: [
        {
          kind: 'list',
          items: [
            'Ownership: all content, trademarks, and other intellectual property rights in the Services are owned by Intensity Research or our licensors.',
            'Usage restriction: you may not use, reproduce, distribute, or create derivative works from any content without our express written permission.',
          ],
        },
      ],
    },
    {
      id: 'termination',
      title: '9. Termination',
      blocks: [
        { kind: 'note', text: '9.1 Termination by you' },
        {
          kind: 'paragraph',
          text: 'You may terminate your account at any time by contacting us or following the instructions on our website.',
        },
        { kind: 'note', text: '9.2 Termination by us' },
        {
          kind: 'paragraph',
          text: 'We reserve the right to suspend or terminate your access to the Services at any time for any reason, including if we believe you have violated these Terms.',
        },
      ],
    },
    {
      id: 'disclaimers',
      title: '10. Disclaimers and Limitation of Liability',
      blocks: [
        { kind: 'note', text: '10.1 Disclaimers' },
        {
          kind: 'paragraph',
          text: 'The Services are provided “as is” and “as available” without warranties of any kind, either express or implied. Intensity Research disclaims all warranties, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
        },
        { kind: 'note', text: '10.2 Limitation of liability' },
        {
          kind: 'paragraph',
          text: 'To the fullest extent permitted by law, Intensity Research shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from (a) your access to or use of or inability to access or use the Services; (b) any conduct or content of any third party on the Services; (c) any content obtained from the Services; and (d) unauthorized access, use, or alteration of your transmissions or content.',
        },
      ],
    },
    {
      id: 'indemnification',
      title: '11. Indemnification',
      blocks: [
        {
          kind: 'paragraph',
          text: 'You agree to indemnify, defend, and hold harmless Intensity Research, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the Services or your violation of these Terms.',
        },
      ],
    },
    {
      id: 'governing-law',
      title: '12. Governing Law',
      blocks: [
        {
          kind: 'paragraph',
          text: 'These Terms shall be governed by and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law principles.',
        },
      ],
    },
    {
      id: 'dispute-resolution',
      title: '13. Dispute Resolution',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Any disputes arising out of or relating to these Terms or the Services shall be resolved through binding arbitration in accordance with the rules of [Arbitration Institution], and judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof.',
        },
      ],
    },
    {
      id: 'entire-agreement',
      title: '14. Entire Agreement',
      blocks: [
        {
          kind: 'paragraph',
          text: 'These Terms constitute the entire agreement between you and Intensity Research regarding the use of the Services and supersede any prior agreements between you and Intensity Research relating to your use of the Services.',
        },
      ],
    },
    {
      id: 'contact',
      title: '15. Contact Information',
      blocks: [
        {
          kind: 'paragraph',
          text: 'For any questions or concerns about these Terms or the Services, please contact us at:',
        },
        {
          kind: 'list',
          items: [
            'Email: info@intensityresearch.com',
            'Website: intensityresearch.com',
          ],
        },
      ],
    },
  ],
}
