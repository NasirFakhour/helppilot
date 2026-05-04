/**
 * HelpPilot — demo-data.js
 * Realistic demo data for the app (Avignon)
 */

export const DEMO_CLIENTS = [
  {
    id: 'c1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@gmail.com',
    telephone: '06 12 34 56 78',
    adresse: '24 rue des Lilas',
    ville: 'Avignon',
    codePostal: '84000',
    notes: 'Client régulier.',
    createdAt: '2023-03-15T09:00:00Z',
    updatedAt: '2024-10-20T14:30:00Z',
  },
  {
    id: 'c2',
    nom: 'Bernard',
    prenom: 'Sophie',
    email: 's.bernard@orange.fr',
    telephone: '06 98 76 54 32',
    adresse: '8 impasse des Oliviers',
    ville: 'Avignon',
    codePostal: '84000',
    notes: 'Utilise un Mac.',
    createdAt: '2023-07-20T11:00:00Z',
    updatedAt: '2024-11-05T10:15:00Z',
  },
  {
    id: 'c3',
    nom: 'Techpro',
    prenom: 'SARL',
    email: 'contact@techpro84.fr',
    telephone: '04 90 12 34 56',
    adresse: '45 avenue de la République',
    ville: 'Carpentras',
    codePostal: '84200',
    notes: 'Contrat de maintenance.',
    createdAt: '2022-11-01T08:30:00Z',
    updatedAt: '2025-01-10T16:00:00Z',
  },
  {
    id: 'c4',
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.m@free.fr',
    telephone: '07 23 45 67 89',
    adresse: '12 chemin des Vignes',
    ville: 'Le Pontet',
    codePostal: '84130',
    notes: 'Problèmes de box fréquents.',
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-09-12T09:45:00Z',
  },
  {
    id: 'c5',
    nom: 'Moreau',
    prenom: 'Garage',
    email: 'garage.moreau@gmail.com',
    telephone: '04 90 56 78 90',
    adresse: '3 route de Marseille',
    ville: 'Avignon',
    codePostal: '84000',
    notes: 'Besoin de réactivité.',
    createdAt: '2024-04-15T10:00:00Z',
    updatedAt: '2025-02-01T11:30:00Z',
  },
];

const today = new Date();
const fmt = (d) => d.toISOString();
const setTime = (d, h, m = 0) => { const r = new Date(d); r.setHours(h, m, 0, 0); return r; };

// Helper to precisely set the dates requested (14/04/2026, 15/04/2026, 20/04/2026)
const specificDate = (year, month, day, h, m = 0) => {
  // month is 0-indexed in JS (0 = Jan, 3 = Apr)
  const d = new Date(year, month, day, h, m, 0, 0);
  return fmt(d);
};

export const DEMO_INTERVENTIONS = [
  // Aujourd'hui
  {
    id: 'i1',
    clientId: 'c1', // Jean Dupont
    date: fmt(setTime(today, 9, 0)),
    heure: '09:00',
    duree: 60,
    adresse: '24 rue des Lilas, 84000 Avignon',
    description: 'Mise à jour Windows + nettoyage disque',
    statut: 'planifiee',
    montant: 60,
    statut_paiement: 'non-paye',
    rappel_actif: true,
    rappel_envoye: true,
    recurrente: false,
    periodicite: null,
    recurrence_parent_id: null,
    notes: '',
    createdAt: fmt(today),
    updatedAt: fmt(today),
  },
  {
    id: 'i2',
    clientId: 'c3', // SARL Techpro
    date: fmt(setTime(today, 14, 30)),
    heure: '14:30',
    duree: 120,
    adresse: '45 avenue de la République, 84200 Carpentras',
    description: 'Maintenance trimestrielle parc informatique',
    statut: 'planifiee',
    montant: 280,
    statut_paiement: 'non-paye',
    rappel_actif: true,
    rappel_envoye: true,
    recurrente: true,
    periodicite: 'trimestrielle',
    recurrence_parent_id: null,
    notes: '',
    createdAt: fmt(today),
    updatedAt: fmt(today),
  },
  {
    id: 'i3',
    clientId: 'c2', // Sophie Bernard
    date: fmt(setTime(today, 17, 0)),
    heure: '17:00',
    duree: 90,
    adresse: '8 impasse des Oliviers, 84000 Avignon',
    description: 'Problème sauvegarde Time Machine + config NAS',
    statut: 'planifiee',
    montant: 95,
    statut_paiement: 'non-paye',
    rappel_actif: false,
    rappel_envoye: false,
    recurrente: false,
    periodicite: null,
    recurrence_parent_id: null,
    notes: '',
    createdAt: fmt(today),
    updatedAt: fmt(today),
  },

  // Historique & Relances
  {
    id: 'i4',
    clientId: 'c1', // Jean Dupont
    date: specificDate(2026, 3, 14, 10, 0), // 14/04/2026
    heure: '10:00',
    duree: 60,
    adresse: '24 rue des Lilas, 84000 Avignon',
    description: 'Paramétrage VPN + accès distant professionnel',
    statut: 'terminee',
    montant: 80,
    statut_paiement: 'non-paye',
    rappel_actif: false,
    rappel_envoye: false,
    recurrente: false,
    periodicite: null,
    recurrence_parent_id: null,
    notes: '',
    createdAt: specificDate(2026, 3, 10, 10, 0),
    updatedAt: specificDate(2026, 3, 14, 12, 0),
  },
  {
    id: 'i5',
    clientId: 'c4', // Marie Martin
    date: specificDate(2026, 3, 20, 10, 0), // 20/04/2026
    heure: '10:00',
    duree: 60,
    adresse: '12 chemin des Vignes, 84130 Le Pontet',
    description: 'Réinitialisation box internet + problème wifi',
    statut: 'terminee',
    montant: 55,
    statut_paiement: 'paye',
    rappel_actif: false,
    rappel_envoye: false,
    recurrente: false,
    periodicite: null,
    recurrence_parent_id: null,
    notes: '',
    createdAt: specificDate(2026, 3, 15, 10, 0),
    updatedAt: specificDate(2026, 3, 20, 11, 0),
  },
  {
    id: 'i6',
    clientId: 'c5', // Garage Moreau
    date: specificDate(2026, 3, 15, 9, 0), // 15/04/2026
    heure: '09:00',
    duree: 90,
    adresse: '3 route de Marseille, 84000 Avignon',
    description: 'Installation antivirus + formation utilisateur',
    statut: 'terminee',
    montant: 70,
    statut_paiement: 'paye',
    rappel_actif: false,
    rappel_envoye: false,
    recurrente: false,
    periodicite: null,
    recurrence_parent_id: null,
    notes: '',
    createdAt: specificDate(2026, 3, 10, 9, 0),
    updatedAt: specificDate(2026, 3, 15, 11, 0),
  },
  // Retard (Overdue)
  {
    id: 'i7',
    clientId: 'c4', // Marie Martin
    date: specificDate(2026, 3, 28, 14, 0), // 28/04/2026 (hier)
    heure: '14:00',
    duree: 60,
    adresse: '12 chemin des Vignes, 84130 Le Pontet',
    description: 'Remplacement disque dur (En attente de pièce)',
    statut: 'en-cours',
    montant: 120,
    statut_paiement: 'non-paye',
    rappel_actif: false,
    rappel_envoye: false,
    recurrente: false,
    periodicite: null,
    recurrence_parent_id: null,
    notes: 'Pièce commandée, retard livraison.',
    createdAt: specificDate(2026, 3, 27, 9, 0),
    updatedAt: specificDate(2026, 3, 28, 14, 30),
  }
];

export const DEMO_SETTINGS = {
  nom_societe: 'InfoTech Service Avignon',
  email_expediteur: 'contact@infotech-avignon.fr',
  telephone_societe: '04 90 00 11 22',
  signature_email:
    `Cordialement,\n\nInfoTech Service Avignon\n📞 04 90 00 11 22\n✉️ contact@infotech-avignon.fr`,
  modele_rappel:
    `Bonjour {{prenom}},\n\nJe vous rappelle votre intervention prévue le {{date}} à {{heure}} à l'adresse {{adresse}}.\n\nN'hésitez pas à me contacter en cas d'empêchement.\n\n{{signature}}`,
  modele_relance:
    `Bonjour {{prenom}},\n\nSauf erreur de ma part, la facture de {{montant}}€ pour l'intervention du {{date}} ({{description}}) n'a pas encore été réglée.\n\nMerci de procéder au règlement dans les meilleurs délais.\n\n{{signature}}`,
};
