// Catalogue des codages/options activables par véhicule, utilisé par l'onglet
// « Options codage » de gestion.html pour générer le PDF envoyé au client.
// Généré à partir du document Seat Leon 5F (source vag-coding.fr) pour les
// autres modèles de la plateforme MQB : à vérifier par diagnostic avant envoi.
window.CODAGES_CATALOGUE = {
  "seat-leon-5f": {
    "marque": "Seat",
    "modele": "Leon 3 (5F)",
    "periode": "2012 à 2020",
    "sousTitre": "Leon / FR / Cupra / Facelift (2017-2020)",
    "source": "Source des codages : vag-coding.fr (page Seat Leon 5F), synthèse à faire valider par diagnostic sur le véhicule.",
    "categories": [
      {
        "nom": "Éclairage extérieur",
        "items": [
          {
            "option": "Feux en virage (Corner Lights) avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant équipés fonction AFS ; 6 lignes de codage (calc. feux avant + BCM)"
          },
          {
            "option": "Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Désactivation des Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Corner Lights avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Seuils de vitesse d'activation des feux de virage",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) sur antibrouillards déjà actifs"
          },
          {
            "option": "Antibrouillards en feux de jour (DRL)",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 2 lignes de codage"
          },
          {
            "option": "Antibrouillards en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 4 lignes de codage"
          },
          {
            "option": "Feux de jour (DRL) uniquement en position Auto",
            "faisabilite": "OUI",
            "prerequis": "Commodo de phares avec position Auto"
          },
          {
            "option": "Activer/désactiver les DRL depuis l'écran (menu CAR)",
            "faisabilite": "OUI",
            "prerequis": "Écran Easy Connect (MIB) ; vérifier réglementation locale sur l'extinction des DRL"
          },
          {
            "option": "Désactivation des DRL avec le frein à main",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Feux arrière allumés avec les DRL (mode scandinave)",
            "faisabilite": "OUI",
            "prerequis": "1 ligne de codage, calc. feux arrière"
          },
          {
            "option": "Feux de stationnement des deux côtés",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Allumage automatique des feux à partir de 140 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares avec les antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Appel de phares avec les feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Assistant feux de route (Light Assist) - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist ou Lane Assist)"
          },
          {
            "option": "Light Assist toujours actif au démarrage",
            "faisabilite": "COND",
            "prerequis": "Light Assist déjà codé et actif"
          },
          {
            "option": "Réglages seuils de vitesse du Light Assist",
            "faisabilite": "COND",
            "prerequis": "Light Assist codé ; réglages fiables surtout avec phares Xénon ou LED"
          },
          {
            "option": "Baisser l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED ; 6 lignes de codage"
          },
          {
            "option": "Conserver l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED"
          },
          {
            "option": "Clignotant confort (nombre de clignotements)",
            "faisabilite": "OUI",
            "prerequis": "Fonction clignotant confort déjà présente d'usine"
          },
          {
            "option": "Clignotant US (veilleuses avec clignotants)",
            "faisabilite": "COND",
            "prerequis": "Phares LED ou Xénon ; 10 lignes de codage à l'avant, 8 à l'arrière"
          },
          {
            "option": "Clignotant US uniquement en mode Sport",
            "faisabilite": "COND",
            "prerequis": "Phares LED + sélecteur Drive Profile (mode de conduite)"
          },
          {
            "option": "Clignotants arrière et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED"
          },
          {
            "option": "Clignotants arrière US",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED (feux de position rouges clignotants)"
          },
          {
            "option": "Clignotants avant et LED en même temps",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Clignotants avant et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards + Xénon/LED",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant + phares Xénon ou LED"
          },
          {
            "option": "Coming/Leaving Home avec les DRL",
            "faisabilite": "OUI",
            "prerequis": "Codage en phase de test constructeur : sauvegarde des valeurs d'origine obligatoire avant modification"
          },
          {
            "option": "Coming/Leaving Home sans capteur de lumière",
            "faisabilite": "OUI",
            "prerequis": "5 lignes de codage ; fonctionne même sans capteur de luminosité"
          },
          {
            "option": "Coming Home à l'ouverture de la porte conducteur",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Coming Home automatique (sans appel de phares)",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Durée du Coming/Leaving Home augmentée dans le menu",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Clignotants extérieurs allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "4 lignes de codage"
          },
          {
            "option": "Feux arrière allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Compatible feux halogènes et LED ; plusieurs lignes de codage"
          },
          {
            "option": "Feux de coffre toujours actif même le coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Troisième feu stop allumé coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage plaque d'immatriculation coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "3 lignes de codage"
          },
          {
            "option": "Feux en mode Flash lors d'un freinage d'urgence",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité des feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Utile notamment avec une caméra de recul en garage sombre"
          },
          {
            "option": "Xénon : mode présentation au démarrage",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon (module DLA) montés"
          },
          {
            "option": "Xénon : réglages des lave-phares",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon avec lave-phares intégrés"
          },
          {
            "option": "Supprimer erreur ampoule antibrouillard LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement des antibrouillards d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule feu de recul LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement du feu de recul d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule immatriculation LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement de l'éclairage de plaque d'origine ; 2 lignes de codage"
          }
        ]
      },
      {
        "nom": "Éclairage intérieur & ambiance",
        "items": [
          {
            "option": "Éclairage intérieur progressif (fade in/out)",
            "faisabilite": "OUI",
            "prerequis": "Éclairages boutons de portes, tableau de bord et console centrale : d'usine allumage/extinction brusque"
          },
          {
            "option": "Désactiver l'éclairage habitacle à l'ouverture du coffre seul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage compteur avec les feux de position",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité de l'éclairage des portes",
            "faisabilite": "OUI",
            "prerequis": "Éclairage de portes (puddle light) déjà présent"
          },
          {
            "option": "Configuration de la lumière ambiante",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light (baguettes lumineuses de garniture de porte) montée d'usine"
          },
          {
            "option": "Lumière ambiante toujours rouge",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light montée d'usine (phase 1 : rouge uniquement, sans sélecteur couleur)"
          },
          {
            "option": "Intensité des LED de la climatisation",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic ; 3 lignes de codage"
          },
          {
            "option": "Désactiver la LED du sélecteur de mode de conduite",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite : Eco/Sport/Individual) équipé"
          }
        ]
      },
      {
        "nom": "Confort, ouverture & carrosserie",
        "items": [
          {
            "option": "Abaisser le rétroviseur passager en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs électriques à mémoire ; sélecteur du rétro doit être en position côté passager lors de la manœuvre"
          },
          {
            "option": "Rabattre automatiquement les rétroviseurs au verrouillage",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Rabattre les rétroviseurs avec le contact",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Réglage du rabattement des rétros via la télécommande",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Dégivrage rétros automatique avec la lunette arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs chauffants"
          },
          {
            "option": "Durée du dégivrage de la lunette arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Vitres fonctionnelles contact coupé, porte ouverte",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Fermeture automatique des vitres en cas de pluie",
            "faisabilite": "COND",
            "prerequis": "Capteur de pluie (essuie-glaces automatiques) monté ; 4 lignes de codage, inclut le toit ouvrant si équipé"
          },
          {
            "option": "Ouverture/fermeture des vitres avec KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Verrouillage automatique sans clé KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Ouverture complète du toit ouvrant avec la télécommande",
            "faisabilite": "COND",
            "prerequis": "Toit ouvrant électrique monté"
          },
          {
            "option": "Déverrouillage automatique des portes DSG sur P",
            "faisabilite": "COND",
            "prerequis": "Boîte de vitesses automatique DSG"
          },
          {
            "option": "Confirmation verrouillage/déverrouillage (bip / klaxon)",
            "faisabilite": "OUI",
            "prerequis": "Plusieurs lignes de codage selon le mode choisi (bip d'alarme ou klaxon)"
          },
          {
            "option": "Alarme anti-intrusion avec klaxon",
            "faisabilite": "OUI",
            "prerequis": "Alarme antivol d'usine (détecteur d'ouverture de porte) ; plusieurs lignes de codage"
          },
          {
            "option": "Utilisation de la clé même contact mis",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier, pratique avec une clé de secours"
          },
          {
            "option": "Désactiver l'alarme porte ouverte avec contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver le klaxon sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Easy Entry (recul du siège conducteur)",
            "faisabilite": "COND",
            "prerequis": "Siège conducteur électrique à mémoire ; disponible sur Leon 5F Facelift uniquement"
          },
          {
            "option": "Mémoire des sièges chauffants",
            "faisabilite": "COND",
            "prerequis": "Sièges avant chauffants"
          },
          {
            "option": "Mémoire de la fonction AirCare",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic avec fonction AirCare (filtration/qualité de l'air)"
          },
          {
            "option": "Affichage vitesse ventilation en mode Auto",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic (climatisation automatique)"
          },
          {
            "option": "Seuils d'alerte risque de verglas",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température en Celsius ou Fahrenheit",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Essuie-glaces",
        "items": [
          {
            "option": "Tear Wiping (balayage supplémentaire après lave-glace)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Arrêt des essuie-glaces au retrait de la clé",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver l'essuie-glace arrière en marche arrière",
            "faisabilite": "OUI",
            "prerequis": "Véhicule équipé d'un essuie-glace arrière (break/5 portes)"
          },
          {
            "option": "Affichage essuie-glace arrière confort dans le menu CAR",
            "faisabilite": "OUI",
            "prerequis": "Écran Easy Connect (MIB) ; essuie-glace arrière à balayage confort"
          },
          {
            "option": "Menu position remplacement des balais sur l'écran",
            "faisabilite": "OUI",
            "prerequis": "Écran Easy Connect (MIB)"
          },
          {
            "option": "Angle des essuie-glaces en position service",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Ordinateur de bord (ODB) / Virtual Cockpit",
        "items": [
          {
            "option": "Check des aiguilles au démarrage (needle sweep)",
            "faisabilite": "OUI",
            "prerequis": "Compteur analogique classique ou Virtual Cockpit"
          },
          {
            "option": "Chronomètre (Lap Timer)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température d'huile sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Niveau de charge batterie sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Quantité d'appoint carburant sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Boussole sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Système de navigation GPS (NAV) monté"
          },
          {
            "option": "Affichage des panneaux (Sign Assist) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist)"
          },
          {
            "option": "Affichage du mode 2 cylindres sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Moteur avec technologie ACT (désactivation de cylindres, ex. 1.4 TSI ACT)"
          },
          {
            "option": "Affichage essuie-glace arrière confort sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Voir section Essuie-glaces"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite) équipé"
          },
          {
            "option": "Alerte dépassement 120 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Changer la langue de l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Idéal en cas de véhicule importé"
          },
          {
            "option": "Logo de démarrage ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "ODB look carbone",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Correction affichage de consommation",
            "faisabilite": "OUI",
            "prerequis": "Effet variable selon le style de conduite, sans garantie de précision absolue"
          },
          {
            "option": "Désactiver le voyant plaquettes de frein",
            "faisabilite": "OUI",
            "prerequis": "Pertinent si plaquettes montées sans capteur d'usure"
          },
          {
            "option": "Désactiver l'avertissement antibrouillard arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Supprimer alarme ceinture",
            "faisabilite": "OUI",
            "prerequis": "Déconseillé pour des raisons de sécurité routière"
          },
          {
            "option": "Facelift : compteur Sport Cupra sur Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit, disponible à partir de fin 2018"
          },
          {
            "option": "Facelift : Cupra Flag sur Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Virtual Cockpit (Active Info Display) version AID V1, logiciel 1701 ou antérieur"
          },
          {
            "option": "Facelift : modifier l'affichage du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : modifier le véhicule du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : désactiver le message « Allumez les feux de croisement »",
            "faisabilite": "OUI",
            "prerequis": "Disponible uniquement sur Leon 5F Facelift"
          },
          {
            "option": "Facelift : pulsation lumineuse bouton Start/Stop",
            "faisabilite": "COND",
            "prerequis": "Bouton de démarrage KESSY (accès sans clé), disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Multimédia (MIB)",
        "items": [
          {
            "option": "Changement automatique heure été/hiver",
            "faisabilite": "OUI",
            "prerequis": "Écran Easy Connect (MIB)"
          },
          {
            "option": "Look carbone sur l'écran Easy Connect",
            "faisabilite": "OUI",
            "prerequis": "Écran Easy Connect (MIB)"
          },
          {
            "option": "Logo de démarrage sur l'écran Easy Connect",
            "faisabilite": "OUI",
            "prerequis": "Écran Easy Connect (MIB)"
          },
          {
            "option": "Menu caché (green menu / mode ingénieur) MIB2",
            "faisabilite": "OUI",
            "prerequis": "Écran Easy Connect (MIB2) ; sauvegarde obligatoire avant modification"
          },
          {
            "option": "Mode Auto-École (affichage clignotants, vitesse...)",
            "faisabilite": "OUI",
            "prerequis": "Écran Easy Connect (MIB)"
          },
          {
            "option": "Personnalisation du profil conducteur",
            "faisabilite": "OUI",
            "prerequis": "Combiné ODB/Virtual Cockpit et écran MIB compatibles profils conducteur"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur MIB2",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 + sélecteur Drive Profile équipé"
          },
          {
            "option": "Affichage radars de recul sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Véhicule équipé uniquement de radars de recul (sans caméra de recul)"
          },
          {
            "option": "Vitesse de désactivation des radars / caméra",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) et/ou caméra de recul monté"
          },
          {
            "option": "Désactiver le bip d'enclenchement de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) monté"
          },
          {
            "option": "Désactiver la réduction audio de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot monté avec coupure automatique du son"
          },
          {
            "option": "Distance trottoir Park Assist",
            "faisabilite": "COND",
            "prerequis": "Système Park Assist (créneau semi-automatique) monté"
          },
          {
            "option": "Ajouter CarPlay / Android Auto après activation Full Link (MIB2 2xxT)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 référence système en 2xxT, Full Link déjà activé au préalable"
          },
          {
            "option": "Activer le port USB pour iPhone CarPlay",
            "faisabilite": "RETROFIT",
            "prerequis": "Full Link activé, remplacement du port USB et/ou du câble par un modèle compatible CarPlay filaire"
          },
          {
            "option": "Activer caméra de recul (retrofit Low/High)",
            "faisabilite": "RETROFIT",
            "prerequis": "Caméra de recul (version Low ou High) installée physiquement avec câblage"
          },
          {
            "option": "Activer l'extraction CD/DVD (copie multimédia)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB avec lecteur CD/DVD intégré"
          },
          {
            "option": "Verrouiller le bouton d'éjection CD/DVD",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 avec lecteur CD/DVD intégré"
          },
          {
            "option": "Désactiver la fréquence AM",
            "faisabilite": "OUI",
            "prerequis": "Écran Easy Connect (MIB)"
          },
          {
            "option": "Désactiver MirrorLink",
            "faisabilite": "OUI",
            "prerequis": "Écran MIB2 (service MirrorLink obsolète, non lié au fonctionnement du CarPlay/Android Auto)"
          },
          {
            "option": "Sensibilité du microphone mains libres",
            "faisabilite": "OUI",
            "prerequis": "Système Bluetooth mains libres actif"
          },
          {
            "option": "Facelift : Ambient Light (couleurs) sur MIB / Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 Facelift + option Ambient Light avec fonction changement de couleur"
          },
          {
            "option": "Facelift : mode Off-Road sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Écran Easy Connect (MIB2) avec navigation, disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Aides à la conduite & châssis",
        "items": [
          {
            "option": "Lane Assist - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist et/ou Light Assist)"
          },
          {
            "option": "Mémoire de la fonction Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Réglages du Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Hill Start Assist (réglage)",
            "faisabilite": "OUI",
            "prerequis": "Fonction ESP de maintien en côte présente sur la majorité des Leon 5F"
          },
          {
            "option": "Hold Assist (mémoire du bouton Auto Hold)",
            "faisabilite": "COND",
            "prerequis": "Frein de parking électrique avec fonction Auto Hold"
          },
          {
            "option": "Blocage électronique du différentiel (XDS)",
            "faisabilite": "OUI",
            "prerequis": "Fonction XDS de l'ESP présente sur la majorité des Leon 5F, notamment FR/Cupra"
          },
          {
            "option": "Désactiver l'ESP / mode Sport ESC depuis l'écran",
            "faisabilite": "OUI",
            "prerequis": "Disponible sur Leon 5F phase 1 uniquement"
          },
          {
            "option": "Dureté de la direction assistée",
            "faisabilite": "OUI",
            "prerequis": "Direction assistée électrique (EPS)"
          },
          {
            "option": "Sensibilité de l'accélérateur",
            "faisabilite": "OUI",
            "prerequis": "Effet plus marqué sur boîte DSG qu'en boîte manuelle"
          },
          {
            "option": "Séchage des disques de frein (intensité)",
            "faisabilite": "OUI",
            "prerequis": "Fonction d'essuyage des disques par l'ESP présente sur la majorité des Leon 5F"
          },
          {
            "option": "Désactivation du Start/Stop",
            "faisabilite": "OUI",
            "prerequis": "Système Start/Stop présent (moteurs essence/diesel concernés) ; 1 ligne de codage"
          },
          {
            "option": "Volume du Soundaktor",
            "faisabilite": "COND",
            "prerequis": "Haut-parleur Soundaktor (générateur sonore moteur), présent notamment sur FR/Cupra"
          },
          {
            "option": "Activer l'attelage remorque (retrofit)",
            "faisabilite": "RETROFIT",
            "prerequis": "Attelage remorque installé physiquement ; adaptation dédiée dans le calculateur ESP/BCM"
          },
          {
            "option": "Facelift : réglages du Front Assist",
            "faisabilite": "COND",
            "prerequis": "Radar frontal ACC/Front Assist, disponible sur Facelift"
          },
          {
            "option": "Facelift : ACC par incréments de 1 km/h",
            "faisabilite": "COND",
            "prerequis": "Régulateur adaptatif ACC monté, disponible sur Facelift"
          },
          {
            "option": "Facelift : désactiver la prévention des dépassements par la droite",
            "faisabilite": "COND",
            "prerequis": "Régulateur ACC + Lane Assist montés, disponible sur Facelift"
          }
        ]
      },
      {
        "nom": "Procédures d'entretien / diagnostic (hors options)",
        "items": [
          {
            "option": "Reprogrammer une nouvelle batterie",
            "faisabilite": "ENTRETIEN",
            "prerequis": "À réaliser après tout remplacement de la batterie 12V (gestion de batterie / Bordnetz)"
          },
          {
            "option": "Frein à main électrique en mode maintenance (plaquettes AR)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Frein de parking électrique (EPB) ; nécessaire pour tout remplacement de plaquettes arrière"
          },
          {
            "option": "Calibrage radar ACC (défaut C1103)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Radar ACC/Front Assist ; requis après dépose du pare-choc avant ou choc/remplacement du radar"
          }
        ]
      }
    ]
  },
  "vw-golf-7": {
    "marque": "Volkswagen",
    "modele": "Golf 7 / 7.5",
    "periode": "2012 à 2020",
    "sousTitre": "Golf / GTI / GTD / R / Facelift Golf 7.5 (2017-2020)",
    "source": "Liste établie par AREPROG à partir de la plateforme MQB partagée avec la Seat Leon 5F (même famille de calculateurs) ; à confirmer systématiquement par diagnostic sur le véhicule avant toute intervention.",
    "categories": [
      {
        "nom": "Éclairage extérieur",
        "items": [
          {
            "option": "Feux en virage (Corner Lights) avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant équipés fonction AFS ; 6 lignes de codage (calc. feux avant + BCM)"
          },
          {
            "option": "Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Désactivation des Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Corner Lights avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Seuils de vitesse d'activation des feux de virage",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) sur antibrouillards déjà actifs"
          },
          {
            "option": "Antibrouillards en feux de jour (DRL)",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 2 lignes de codage"
          },
          {
            "option": "Antibrouillards en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 4 lignes de codage"
          },
          {
            "option": "Feux de jour (DRL) uniquement en position Auto",
            "faisabilite": "OUI",
            "prerequis": "Commodo de phares avec position Auto"
          },
          {
            "option": "Activer/désactiver les DRL depuis l'écran (menu CAR)",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB) ; vérifier réglementation locale sur l'extinction des DRL"
          },
          {
            "option": "Désactivation des DRL avec le frein à main",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Feux arrière allumés avec les DRL (mode scandinave)",
            "faisabilite": "OUI",
            "prerequis": "1 ligne de codage, calc. feux arrière"
          },
          {
            "option": "Feux de stationnement des deux côtés",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Allumage automatique des feux à partir de 140 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares avec les antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Appel de phares avec les feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Assistant feux de route (Light Assist) - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist ou Lane Assist)"
          },
          {
            "option": "Light Assist toujours actif au démarrage",
            "faisabilite": "COND",
            "prerequis": "Light Assist déjà codé et actif"
          },
          {
            "option": "Réglages seuils de vitesse du Light Assist",
            "faisabilite": "COND",
            "prerequis": "Light Assist codé ; réglages fiables surtout avec phares Xénon ou LED"
          },
          {
            "option": "Baisser l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED ; 6 lignes de codage"
          },
          {
            "option": "Conserver l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED"
          },
          {
            "option": "Clignotant confort (nombre de clignotements)",
            "faisabilite": "OUI",
            "prerequis": "Fonction clignotant confort déjà présente d'usine"
          },
          {
            "option": "Clignotant US (veilleuses avec clignotants)",
            "faisabilite": "COND",
            "prerequis": "Phares LED ou Xénon ; 10 lignes de codage à l'avant, 8 à l'arrière"
          },
          {
            "option": "Clignotant US uniquement en mode Sport",
            "faisabilite": "COND",
            "prerequis": "Phares LED + sélecteur Drive Profile (mode de conduite)"
          },
          {
            "option": "Clignotants arrière et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED"
          },
          {
            "option": "Clignotants arrière US",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED (feux de position rouges clignotants)"
          },
          {
            "option": "Clignotants avant et LED en même temps",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Clignotants avant et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards + Xénon/LED",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant + phares Xénon ou LED"
          },
          {
            "option": "Coming/Leaving Home avec les DRL",
            "faisabilite": "OUI",
            "prerequis": "Codage en phase de test constructeur : sauvegarde des valeurs d'origine obligatoire avant modification"
          },
          {
            "option": "Coming/Leaving Home sans capteur de lumière",
            "faisabilite": "OUI",
            "prerequis": "5 lignes de codage ; fonctionne même sans capteur de luminosité"
          },
          {
            "option": "Coming Home à l'ouverture de la porte conducteur",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Coming Home automatique (sans appel de phares)",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Durée du Coming/Leaving Home augmentée dans le menu",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Clignotants extérieurs allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "4 lignes de codage"
          },
          {
            "option": "Feux arrière allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Compatible feux halogènes et LED ; plusieurs lignes de codage"
          },
          {
            "option": "Feux de coffre toujours actif même le coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Troisième feu stop allumé coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage plaque d'immatriculation coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "3 lignes de codage"
          },
          {
            "option": "Feux en mode Flash lors d'un freinage d'urgence",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité des feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Utile notamment avec une caméra de recul en garage sombre"
          },
          {
            "option": "Xénon : mode présentation au démarrage",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon (module DLA) montés"
          },
          {
            "option": "Xénon : réglages des lave-phares",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon avec lave-phares intégrés"
          },
          {
            "option": "Supprimer erreur ampoule antibrouillard LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement des antibrouillards d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule feu de recul LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement du feu de recul d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule immatriculation LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement de l'éclairage de plaque d'origine ; 2 lignes de codage"
          }
        ]
      },
      {
        "nom": "Éclairage intérieur & ambiance",
        "items": [
          {
            "option": "Éclairage intérieur progressif (fade in/out)",
            "faisabilite": "OUI",
            "prerequis": "Éclairages boutons de portes, tableau de bord et console centrale : d'usine allumage/extinction brusque"
          },
          {
            "option": "Désactiver l'éclairage habitacle à l'ouverture du coffre seul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage compteur avec les feux de position",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité de l'éclairage des portes",
            "faisabilite": "OUI",
            "prerequis": "Éclairage de portes (puddle light) déjà présent"
          },
          {
            "option": "Configuration de la lumière ambiante",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light (baguettes lumineuses de garniture de porte) montée d'usine"
          },
          {
            "option": "Lumière ambiante toujours rouge",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light montée d'usine (phase 1 : rouge uniquement, sans sélecteur couleur)"
          },
          {
            "option": "Intensité des LED de la climatisation",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic ; 3 lignes de codage"
          },
          {
            "option": "Désactiver la LED du sélecteur de mode de conduite",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite : Eco/Sport/Individual) équipé"
          }
        ]
      },
      {
        "nom": "Confort, ouverture & carrosserie",
        "items": [
          {
            "option": "Abaisser le rétroviseur passager en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs électriques à mémoire ; sélecteur du rétro doit être en position côté passager lors de la manœuvre"
          },
          {
            "option": "Rabattre automatiquement les rétroviseurs au verrouillage",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Rabattre les rétroviseurs avec le contact",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Réglage du rabattement des rétros via la télécommande",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Dégivrage rétros automatique avec la lunette arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs chauffants"
          },
          {
            "option": "Durée du dégivrage de la lunette arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Vitres fonctionnelles contact coupé, porte ouverte",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Fermeture automatique des vitres en cas de pluie",
            "faisabilite": "COND",
            "prerequis": "Capteur de pluie (essuie-glaces automatiques) monté ; 4 lignes de codage, inclut le toit ouvrant si équipé"
          },
          {
            "option": "Ouverture/fermeture des vitres avec KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Verrouillage automatique sans clé KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Ouverture complète du toit ouvrant avec la télécommande",
            "faisabilite": "COND",
            "prerequis": "Toit ouvrant électrique monté"
          },
          {
            "option": "Déverrouillage automatique des portes DSG sur P",
            "faisabilite": "COND",
            "prerequis": "Boîte de vitesses automatique DSG"
          },
          {
            "option": "Confirmation verrouillage/déverrouillage (bip / klaxon)",
            "faisabilite": "OUI",
            "prerequis": "Plusieurs lignes de codage selon le mode choisi (bip d'alarme ou klaxon)"
          },
          {
            "option": "Alarme anti-intrusion avec klaxon",
            "faisabilite": "OUI",
            "prerequis": "Alarme antivol d'usine (détecteur d'ouverture de porte) ; plusieurs lignes de codage"
          },
          {
            "option": "Utilisation de la clé même contact mis",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier, pratique avec une clé de secours"
          },
          {
            "option": "Désactiver l'alarme porte ouverte avec contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver le klaxon sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Easy Entry (recul du siège conducteur)",
            "faisabilite": "COND",
            "prerequis": "Siège conducteur électrique à mémoire ; disponible sur Golf 7 Facelift uniquement"
          },
          {
            "option": "Mémoire des sièges chauffants",
            "faisabilite": "COND",
            "prerequis": "Sièges avant chauffants"
          },
          {
            "option": "Mémoire de la fonction AirCare",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic avec fonction AirCare (filtration/qualité de l'air)"
          },
          {
            "option": "Affichage vitesse ventilation en mode Auto",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic (climatisation automatique)"
          },
          {
            "option": "Seuils d'alerte risque de verglas",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température en Celsius ou Fahrenheit",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Essuie-glaces",
        "items": [
          {
            "option": "Tear Wiping (balayage supplémentaire après lave-glace)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Arrêt des essuie-glaces au retrait de la clé",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver l'essuie-glace arrière en marche arrière",
            "faisabilite": "OUI",
            "prerequis": "Véhicule équipé d'un essuie-glace arrière (break/5 portes)"
          },
          {
            "option": "Affichage essuie-glace arrière confort dans le menu CAR",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB) ; essuie-glace arrière à balayage confort"
          },
          {
            "option": "Menu position remplacement des balais sur l'écran",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Angle des essuie-glaces en position service",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Ordinateur de bord (ODB) / Virtual Cockpit",
        "items": [
          {
            "option": "Check des aiguilles au démarrage (needle sweep)",
            "faisabilite": "OUI",
            "prerequis": "Compteur analogique classique ou Virtual Cockpit"
          },
          {
            "option": "Chronomètre (Lap Timer)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température d'huile sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Niveau de charge batterie sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Quantité d'appoint carburant sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Boussole sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Système de navigation GPS (NAV) monté"
          },
          {
            "option": "Affichage des panneaux (Sign Assist) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist)"
          },
          {
            "option": "Affichage du mode 2 cylindres sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Moteur avec technologie ACT (désactivation de cylindres, ex. 1.4 TSI ACT)"
          },
          {
            "option": "Affichage essuie-glace arrière confort sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Voir section Essuie-glaces"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite) équipé"
          },
          {
            "option": "Alerte dépassement 120 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Changer la langue de l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Idéal en cas de véhicule importé"
          },
          {
            "option": "Logo de démarrage ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "ODB look carbone",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Correction affichage de consommation",
            "faisabilite": "OUI",
            "prerequis": "Effet variable selon le style de conduite, sans garantie de précision absolue"
          },
          {
            "option": "Désactiver le voyant plaquettes de frein",
            "faisabilite": "OUI",
            "prerequis": "Pertinent si plaquettes montées sans capteur d'usure"
          },
          {
            "option": "Désactiver l'avertissement antibrouillard arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Supprimer alarme ceinture",
            "faisabilite": "OUI",
            "prerequis": "Déconseillé pour des raisons de sécurité routière"
          },
          {
            "option": "Facelift : modifier l'affichage du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : modifier le véhicule du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : désactiver le message « Allumez les feux de croisement »",
            "faisabilite": "OUI",
            "prerequis": "Disponible uniquement sur Golf 7 Facelift"
          },
          {
            "option": "Facelift : pulsation lumineuse bouton Start/Stop",
            "faisabilite": "COND",
            "prerequis": "Bouton de démarrage KESSY (accès sans clé), disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Multimédia (MIB)",
        "items": [
          {
            "option": "Changement automatique heure été/hiver",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Look carbone sur l'écran multimédia",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Logo de démarrage sur l'écran multimédia",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Menu caché (green menu / mode ingénieur) MIB2",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB2) ; sauvegarde obligatoire avant modification"
          },
          {
            "option": "Mode Auto-École (affichage clignotants, vitesse...)",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Personnalisation du profil conducteur",
            "faisabilite": "OUI",
            "prerequis": "Combiné ODB/Virtual Cockpit et écran MIB compatibles profils conducteur"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur MIB2",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 + sélecteur Drive Profile équipé"
          },
          {
            "option": "Affichage radars de recul sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Véhicule équipé uniquement de radars de recul (sans caméra de recul)"
          },
          {
            "option": "Vitesse de désactivation des radars / caméra",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) et/ou caméra de recul monté"
          },
          {
            "option": "Désactiver le bip d'enclenchement de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) monté"
          },
          {
            "option": "Désactiver la réduction audio de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot monté avec coupure automatique du son"
          },
          {
            "option": "Distance trottoir Park Assist",
            "faisabilite": "COND",
            "prerequis": "Système Park Assist (créneau semi-automatique) monté"
          },
          {
            "option": "Ajouter CarPlay / Android Auto après activation Full Link (MIB2 2xxT)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 référence système en 2xxT, Full Link déjà activé au préalable"
          },
          {
            "option": "Activer le port USB pour iPhone CarPlay",
            "faisabilite": "RETROFIT",
            "prerequis": "Full Link activé, remplacement du port USB et/ou du câble par un modèle compatible CarPlay filaire"
          },
          {
            "option": "Activer caméra de recul (retrofit Low/High)",
            "faisabilite": "RETROFIT",
            "prerequis": "Caméra de recul (version Low ou High) installée physiquement avec câblage"
          },
          {
            "option": "Activer l'extraction CD/DVD (copie multimédia)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB avec lecteur CD/DVD intégré"
          },
          {
            "option": "Verrouiller le bouton d'éjection CD/DVD",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 avec lecteur CD/DVD intégré"
          },
          {
            "option": "Désactiver la fréquence AM",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Désactiver MirrorLink",
            "faisabilite": "OUI",
            "prerequis": "Écran MIB2 (service MirrorLink obsolète, non lié au fonctionnement du CarPlay/Android Auto)"
          },
          {
            "option": "Sensibilité du microphone mains libres",
            "faisabilite": "OUI",
            "prerequis": "Système Bluetooth mains libres actif"
          },
          {
            "option": "Facelift : Ambient Light (couleurs) sur MIB / Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 Facelift + option Ambient Light avec fonction changement de couleur"
          },
          {
            "option": "Facelift : mode Off-Road sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Écran multimédia (MIB2) avec navigation, disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Aides à la conduite & châssis",
        "items": [
          {
            "option": "Lane Assist - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist et/ou Light Assist)"
          },
          {
            "option": "Mémoire de la fonction Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Réglages du Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Hill Start Assist (réglage)",
            "faisabilite": "OUI",
            "prerequis": "Fonction ESP de maintien en côte présente sur la majorité des Golf 7"
          },
          {
            "option": "Hold Assist (mémoire du bouton Auto Hold)",
            "faisabilite": "COND",
            "prerequis": "Frein de parking électrique avec fonction Auto Hold"
          },
          {
            "option": "Blocage électronique du différentiel (XDS)",
            "faisabilite": "OUI",
            "prerequis": "Fonction XDS de l'ESP présente sur la majorité des Golf 7, notamment GTI/GTD/R"
          },
          {
            "option": "Désactiver l'ESP / mode Sport ESC depuis l'écran",
            "faisabilite": "OUI",
            "prerequis": "Disponible sur Golf 7 phase 1 uniquement"
          },
          {
            "option": "Dureté de la direction assistée",
            "faisabilite": "OUI",
            "prerequis": "Direction assistée électrique (EPS)"
          },
          {
            "option": "Sensibilité de l'accélérateur",
            "faisabilite": "OUI",
            "prerequis": "Effet plus marqué sur boîte DSG qu'en boîte manuelle"
          },
          {
            "option": "Séchage des disques de frein (intensité)",
            "faisabilite": "OUI",
            "prerequis": "Fonction d'essuyage des disques par l'ESP présente sur la majorité des Golf 7"
          },
          {
            "option": "Désactivation du Start/Stop",
            "faisabilite": "OUI",
            "prerequis": "Système Start/Stop présent (moteurs essence/diesel concernés) ; 1 ligne de codage"
          },
          {
            "option": "Volume du Soundaktor",
            "faisabilite": "COND",
            "prerequis": "Haut-parleur Soundaktor (générateur sonore moteur), présent notamment sur GTI/GTD/R"
          },
          {
            "option": "Activer l'attelage remorque (retrofit)",
            "faisabilite": "RETROFIT",
            "prerequis": "Attelage remorque installé physiquement ; adaptation dédiée dans le calculateur ESP/BCM"
          },
          {
            "option": "Facelift : réglages du Front Assist",
            "faisabilite": "COND",
            "prerequis": "Radar frontal ACC/Front Assist, disponible sur Facelift"
          },
          {
            "option": "Facelift : ACC par incréments de 1 km/h",
            "faisabilite": "COND",
            "prerequis": "Régulateur adaptatif ACC monté, disponible sur Facelift"
          },
          {
            "option": "Facelift : désactiver la prévention des dépassements par la droite",
            "faisabilite": "COND",
            "prerequis": "Régulateur ACC + Lane Assist montés, disponible sur Facelift"
          }
        ]
      },
      {
        "nom": "Procédures d'entretien / diagnostic (hors options)",
        "items": [
          {
            "option": "Reprogrammer une nouvelle batterie",
            "faisabilite": "ENTRETIEN",
            "prerequis": "À réaliser après tout remplacement de la batterie 12V (gestion de batterie / Bordnetz)"
          },
          {
            "option": "Frein à main électrique en mode maintenance (plaquettes AR)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Frein de parking électrique (EPB) ; nécessaire pour tout remplacement de plaquettes arrière"
          },
          {
            "option": "Calibrage radar ACC (défaut C1103)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Radar ACC/Front Assist ; requis après dépose du pare-choc avant ou choc/remplacement du radar"
          }
        ]
      }
    ]
  },
  "audi-a3-8v": {
    "marque": "Audi",
    "modele": "A3 (8V)",
    "periode": "2012 à 2020",
    "sousTitre": "A3 / S3 / RS3 / Facelift (2016-2020)",
    "source": "Liste établie par AREPROG à partir de la plateforme MQB partagée avec la Seat Leon 5F (même famille de calculateurs) ; à confirmer systématiquement par diagnostic sur le véhicule avant toute intervention.",
    "categories": [
      {
        "nom": "Éclairage extérieur",
        "items": [
          {
            "option": "Feux en virage (Corner Lights) avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant équipés fonction AFS ; 6 lignes de codage (calc. feux avant + BCM)"
          },
          {
            "option": "Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Désactivation des Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Corner Lights avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Seuils de vitesse d'activation des feux de virage",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) sur antibrouillards déjà actifs"
          },
          {
            "option": "Antibrouillards en feux de jour (DRL)",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 2 lignes de codage"
          },
          {
            "option": "Antibrouillards en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 4 lignes de codage"
          },
          {
            "option": "Feux de jour (DRL) uniquement en position Auto",
            "faisabilite": "OUI",
            "prerequis": "Commodo de phares avec position Auto"
          },
          {
            "option": "Activer/désactiver les DRL depuis l'écran (menu CAR)",
            "faisabilite": "OUI",
            "prerequis": "Écran MMI (MIB) ; vérifier réglementation locale sur l'extinction des DRL"
          },
          {
            "option": "Désactivation des DRL avec le frein à main",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Feux arrière allumés avec les DRL (mode scandinave)",
            "faisabilite": "OUI",
            "prerequis": "1 ligne de codage, calc. feux arrière"
          },
          {
            "option": "Feux de stationnement des deux côtés",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Allumage automatique des feux à partir de 140 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares avec les antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Appel de phares avec les feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Assistant feux de route (Light Assist) - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist ou Lane Assist)"
          },
          {
            "option": "Light Assist toujours actif au démarrage",
            "faisabilite": "COND",
            "prerequis": "Light Assist déjà codé et actif"
          },
          {
            "option": "Réglages seuils de vitesse du Light Assist",
            "faisabilite": "COND",
            "prerequis": "Light Assist codé ; réglages fiables surtout avec phares Xénon ou LED"
          },
          {
            "option": "Baisser l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED ; 6 lignes de codage"
          },
          {
            "option": "Conserver l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED"
          },
          {
            "option": "Clignotant confort (nombre de clignotements)",
            "faisabilite": "OUI",
            "prerequis": "Fonction clignotant confort déjà présente d'usine"
          },
          {
            "option": "Clignotant US (veilleuses avec clignotants)",
            "faisabilite": "COND",
            "prerequis": "Phares LED ou Xénon ; 10 lignes de codage à l'avant, 8 à l'arrière"
          },
          {
            "option": "Clignotant US uniquement en mode Sport",
            "faisabilite": "COND",
            "prerequis": "Phares LED + sélecteur Drive Profile (mode de conduite)"
          },
          {
            "option": "Clignotants arrière et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED"
          },
          {
            "option": "Clignotants arrière US",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED (feux de position rouges clignotants)"
          },
          {
            "option": "Clignotants avant et LED en même temps",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Clignotants avant et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards + Xénon/LED",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant + phares Xénon ou LED"
          },
          {
            "option": "Coming/Leaving Home avec les DRL",
            "faisabilite": "OUI",
            "prerequis": "Codage en phase de test constructeur : sauvegarde des valeurs d'origine obligatoire avant modification"
          },
          {
            "option": "Coming/Leaving Home sans capteur de lumière",
            "faisabilite": "OUI",
            "prerequis": "5 lignes de codage ; fonctionne même sans capteur de luminosité"
          },
          {
            "option": "Coming Home à l'ouverture de la porte conducteur",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Coming Home automatique (sans appel de phares)",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Durée du Coming/Leaving Home augmentée dans le menu",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Clignotants extérieurs allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "4 lignes de codage"
          },
          {
            "option": "Feux arrière allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Compatible feux halogènes et LED ; plusieurs lignes de codage"
          },
          {
            "option": "Feux de coffre toujours actif même le coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Troisième feu stop allumé coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage plaque d'immatriculation coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "3 lignes de codage"
          },
          {
            "option": "Feux en mode Flash lors d'un freinage d'urgence",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité des feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Utile notamment avec une caméra de recul en garage sombre"
          },
          {
            "option": "Xénon : mode présentation au démarrage",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon (module DLA) montés"
          },
          {
            "option": "Xénon : réglages des lave-phares",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon avec lave-phares intégrés"
          },
          {
            "option": "Supprimer erreur ampoule antibrouillard LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement des antibrouillards d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule feu de recul LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement du feu de recul d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule immatriculation LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement de l'éclairage de plaque d'origine ; 2 lignes de codage"
          }
        ]
      },
      {
        "nom": "Éclairage intérieur & ambiance",
        "items": [
          {
            "option": "Éclairage intérieur progressif (fade in/out)",
            "faisabilite": "OUI",
            "prerequis": "Éclairages boutons de portes, tableau de bord et console centrale : d'usine allumage/extinction brusque"
          },
          {
            "option": "Désactiver l'éclairage habitacle à l'ouverture du coffre seul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage compteur avec les feux de position",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité de l'éclairage des portes",
            "faisabilite": "OUI",
            "prerequis": "Éclairage de portes (puddle light) déjà présent"
          },
          {
            "option": "Configuration de la lumière ambiante",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light (baguettes lumineuses de garniture de porte) montée d'usine"
          },
          {
            "option": "Lumière ambiante toujours rouge",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light montée d'usine (phase 1 : rouge uniquement, sans sélecteur couleur)"
          },
          {
            "option": "Intensité des LED de la climatisation",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic ; 3 lignes de codage"
          },
          {
            "option": "Désactiver la LED du sélecteur de mode de conduite",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite : Eco/Sport/Individual) équipé"
          }
        ]
      },
      {
        "nom": "Confort, ouverture & carrosserie",
        "items": [
          {
            "option": "Abaisser le rétroviseur passager en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs électriques à mémoire ; sélecteur du rétro doit être en position côté passager lors de la manœuvre"
          },
          {
            "option": "Rabattre automatiquement les rétroviseurs au verrouillage",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Rabattre les rétroviseurs avec le contact",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Réglage du rabattement des rétros via la télécommande",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Dégivrage rétros automatique avec la lunette arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs chauffants"
          },
          {
            "option": "Durée du dégivrage de la lunette arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Vitres fonctionnelles contact coupé, porte ouverte",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Fermeture automatique des vitres en cas de pluie",
            "faisabilite": "COND",
            "prerequis": "Capteur de pluie (essuie-glaces automatiques) monté ; 4 lignes de codage, inclut le toit ouvrant si équipé"
          },
          {
            "option": "Ouverture/fermeture des vitres avec KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Verrouillage automatique sans clé KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Ouverture complète du toit ouvrant avec la télécommande",
            "faisabilite": "COND",
            "prerequis": "Toit ouvrant électrique monté"
          },
          {
            "option": "Déverrouillage automatique des portes S tronic sur P",
            "faisabilite": "COND",
            "prerequis": "Boîte de vitesses automatique S tronic"
          },
          {
            "option": "Confirmation verrouillage/déverrouillage (bip / klaxon)",
            "faisabilite": "OUI",
            "prerequis": "Plusieurs lignes de codage selon le mode choisi (bip d'alarme ou klaxon)"
          },
          {
            "option": "Alarme anti-intrusion avec klaxon",
            "faisabilite": "OUI",
            "prerequis": "Alarme antivol d'usine (détecteur d'ouverture de porte) ; plusieurs lignes de codage"
          },
          {
            "option": "Utilisation de la clé même contact mis",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier, pratique avec une clé de secours"
          },
          {
            "option": "Désactiver l'alarme porte ouverte avec contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver le klaxon sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Easy Entry (recul du siège conducteur)",
            "faisabilite": "COND",
            "prerequis": "Siège conducteur électrique à mémoire ; disponible sur A3 8V Facelift uniquement"
          },
          {
            "option": "Mémoire des sièges chauffants",
            "faisabilite": "COND",
            "prerequis": "Sièges avant chauffants"
          },
          {
            "option": "Mémoire de la fonction AirCare",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic avec fonction AirCare (filtration/qualité de l'air)"
          },
          {
            "option": "Affichage vitesse ventilation en mode Auto",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic (climatisation automatique)"
          },
          {
            "option": "Seuils d'alerte risque de verglas",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température en Celsius ou Fahrenheit",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Essuie-glaces",
        "items": [
          {
            "option": "Tear Wiping (balayage supplémentaire après lave-glace)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Arrêt des essuie-glaces au retrait de la clé",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver l'essuie-glace arrière en marche arrière",
            "faisabilite": "OUI",
            "prerequis": "Véhicule équipé d'un essuie-glace arrière (break/5 portes)"
          },
          {
            "option": "Affichage essuie-glace arrière confort dans le menu CAR",
            "faisabilite": "OUI",
            "prerequis": "Écran MMI (MIB) ; essuie-glace arrière à balayage confort"
          },
          {
            "option": "Menu position remplacement des balais sur l'écran",
            "faisabilite": "OUI",
            "prerequis": "Écran MMI (MIB)"
          },
          {
            "option": "Angle des essuie-glaces en position service",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Ordinateur de bord (ODB) / Virtual Cockpit",
        "items": [
          {
            "option": "Check des aiguilles au démarrage (needle sweep)",
            "faisabilite": "OUI",
            "prerequis": "Compteur analogique classique ou Virtual Cockpit"
          },
          {
            "option": "Chronomètre (Lap Timer)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température d'huile sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Niveau de charge batterie sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Quantité d'appoint carburant sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Boussole sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Système de navigation GPS (NAV) monté"
          },
          {
            "option": "Affichage des panneaux (Sign Assist) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist)"
          },
          {
            "option": "Affichage du mode 2 cylindres sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Moteur avec technologie ACT (désactivation de cylindres, ex. 1.4 TSI ACT)"
          },
          {
            "option": "Affichage essuie-glace arrière confort sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Voir section Essuie-glaces"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite) équipé"
          },
          {
            "option": "Alerte dépassement 120 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Changer la langue de l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Idéal en cas de véhicule importé"
          },
          {
            "option": "Logo de démarrage ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "ODB look carbone",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Correction affichage de consommation",
            "faisabilite": "OUI",
            "prerequis": "Effet variable selon le style de conduite, sans garantie de précision absolue"
          },
          {
            "option": "Désactiver le voyant plaquettes de frein",
            "faisabilite": "OUI",
            "prerequis": "Pertinent si plaquettes montées sans capteur d'usure"
          },
          {
            "option": "Désactiver l'avertissement antibrouillard arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Supprimer alarme ceinture",
            "faisabilite": "OUI",
            "prerequis": "Déconseillé pour des raisons de sécurité routière"
          },
          {
            "option": "Facelift : modifier l'affichage du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : modifier le véhicule du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : désactiver le message « Allumez les feux de croisement »",
            "faisabilite": "OUI",
            "prerequis": "Disponible uniquement sur A3 8V Facelift"
          },
          {
            "option": "Facelift : pulsation lumineuse bouton Start/Stop",
            "faisabilite": "COND",
            "prerequis": "Bouton de démarrage KESSY (accès sans clé), disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Multimédia (MIB)",
        "items": [
          {
            "option": "Changement automatique heure été/hiver",
            "faisabilite": "OUI",
            "prerequis": "Écran MMI (MIB)"
          },
          {
            "option": "Look carbone sur l'écran MMI",
            "faisabilite": "OUI",
            "prerequis": "Écran MMI (MIB)"
          },
          {
            "option": "Logo de démarrage sur l'écran MMI",
            "faisabilite": "OUI",
            "prerequis": "Écran MMI (MIB)"
          },
          {
            "option": "Menu caché (green menu / mode ingénieur) MIB2",
            "faisabilite": "OUI",
            "prerequis": "Écran MMI (MIB2) ; sauvegarde obligatoire avant modification"
          },
          {
            "option": "Mode Auto-École (affichage clignotants, vitesse...)",
            "faisabilite": "OUI",
            "prerequis": "Écran MMI (MIB)"
          },
          {
            "option": "Personnalisation du profil conducteur",
            "faisabilite": "OUI",
            "prerequis": "Combiné ODB/Virtual Cockpit et écran MIB compatibles profils conducteur"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur MIB2",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 + sélecteur Drive Profile équipé"
          },
          {
            "option": "Affichage radars de recul sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Véhicule équipé uniquement de radars de recul (sans caméra de recul)"
          },
          {
            "option": "Vitesse de désactivation des radars / caméra",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) et/ou caméra de recul monté"
          },
          {
            "option": "Désactiver le bip d'enclenchement de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) monté"
          },
          {
            "option": "Désactiver la réduction audio de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot monté avec coupure automatique du son"
          },
          {
            "option": "Distance trottoir Park Assist",
            "faisabilite": "COND",
            "prerequis": "Système Park Assist (créneau semi-automatique) monté"
          },
          {
            "option": "Ajouter CarPlay / Android Auto après activation Full Link (MIB2 2xxT)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 référence système en 2xxT, Full Link déjà activé au préalable"
          },
          {
            "option": "Activer le port USB pour iPhone CarPlay",
            "faisabilite": "RETROFIT",
            "prerequis": "Full Link activé, remplacement du port USB et/ou du câble par un modèle compatible CarPlay filaire"
          },
          {
            "option": "Activer caméra de recul (retrofit Low/High)",
            "faisabilite": "RETROFIT",
            "prerequis": "Caméra de recul (version Low ou High) installée physiquement avec câblage"
          },
          {
            "option": "Activer l'extraction CD/DVD (copie multimédia)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB avec lecteur CD/DVD intégré"
          },
          {
            "option": "Verrouiller le bouton d'éjection CD/DVD",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 avec lecteur CD/DVD intégré"
          },
          {
            "option": "Désactiver la fréquence AM",
            "faisabilite": "OUI",
            "prerequis": "Écran MMI (MIB)"
          },
          {
            "option": "Désactiver MirrorLink",
            "faisabilite": "OUI",
            "prerequis": "Écran MIB2 (service MirrorLink obsolète, non lié au fonctionnement du CarPlay/Android Auto)"
          },
          {
            "option": "Sensibilité du microphone mains libres",
            "faisabilite": "OUI",
            "prerequis": "Système Bluetooth mains libres actif"
          },
          {
            "option": "Facelift : Ambient Light (couleurs) sur MIB / Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 Facelift + option Ambient Light avec fonction changement de couleur"
          },
          {
            "option": "Facelift : mode Off-Road sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Écran MMI (MIB2) avec navigation, disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Aides à la conduite & châssis",
        "items": [
          {
            "option": "Lane Assist - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist et/ou Light Assist)"
          },
          {
            "option": "Mémoire de la fonction Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Réglages du Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Hill Start Assist (réglage)",
            "faisabilite": "OUI",
            "prerequis": "Fonction ESP de maintien en côte présente sur la majorité des A3 8V"
          },
          {
            "option": "Hold Assist (mémoire du bouton Auto Hold)",
            "faisabilite": "COND",
            "prerequis": "Frein de parking électrique avec fonction Auto Hold"
          },
          {
            "option": "Blocage électronique du différentiel (XDS)",
            "faisabilite": "OUI",
            "prerequis": "Fonction XDS de l'ESP présente sur la majorité des A3 8V, notamment S line/S3/RS3"
          },
          {
            "option": "Désactiver l'ESP / mode Sport ESC depuis l'écran",
            "faisabilite": "OUI",
            "prerequis": "Disponible sur A3 8V phase 1 uniquement"
          },
          {
            "option": "Dureté de la direction assistée",
            "faisabilite": "OUI",
            "prerequis": "Direction assistée électrique (EPS)"
          },
          {
            "option": "Sensibilité de l'accélérateur",
            "faisabilite": "OUI",
            "prerequis": "Effet plus marqué sur boîte S tronic qu'en boîte manuelle"
          },
          {
            "option": "Séchage des disques de frein (intensité)",
            "faisabilite": "OUI",
            "prerequis": "Fonction d'essuyage des disques par l'ESP présente sur la majorité des A3 8V"
          },
          {
            "option": "Désactivation du Start/Stop",
            "faisabilite": "OUI",
            "prerequis": "Système Start/Stop présent (moteurs essence/diesel concernés) ; 1 ligne de codage"
          },
          {
            "option": "Volume du Soundaktor",
            "faisabilite": "COND",
            "prerequis": "Haut-parleur Soundaktor (générateur sonore moteur), présent notamment sur S line/S3/RS3"
          },
          {
            "option": "Activer l'attelage remorque (retrofit)",
            "faisabilite": "RETROFIT",
            "prerequis": "Attelage remorque installé physiquement ; adaptation dédiée dans le calculateur ESP/BCM"
          },
          {
            "option": "Facelift : réglages du Front Assist",
            "faisabilite": "COND",
            "prerequis": "Radar frontal ACC/Front Assist, disponible sur Facelift"
          },
          {
            "option": "Facelift : ACC par incréments de 1 km/h",
            "faisabilite": "COND",
            "prerequis": "Régulateur adaptatif ACC monté, disponible sur Facelift"
          },
          {
            "option": "Facelift : désactiver la prévention des dépassements par la droite",
            "faisabilite": "COND",
            "prerequis": "Régulateur ACC + Lane Assist montés, disponible sur Facelift"
          }
        ]
      },
      {
        "nom": "Procédures d'entretien / diagnostic (hors options)",
        "items": [
          {
            "option": "Reprogrammer une nouvelle batterie",
            "faisabilite": "ENTRETIEN",
            "prerequis": "À réaliser après tout remplacement de la batterie 12V (gestion de batterie / Bordnetz)"
          },
          {
            "option": "Frein à main électrique en mode maintenance (plaquettes AR)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Frein de parking électrique (EPB) ; nécessaire pour tout remplacement de plaquettes arrière"
          },
          {
            "option": "Calibrage radar ACC (défaut C1103)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Radar ACC/Front Assist ; requis après dépose du pare-choc avant ou choc/remplacement du radar"
          }
        ]
      }
    ]
  },
  "skoda-octavia-3": {
    "marque": "Skoda",
    "modele": "Octavia 3 (5E)",
    "periode": "2013 à 2020",
    "sousTitre": "Octavia / RS / Combi / Facelift (2017-2020)",
    "source": "Liste établie par AREPROG à partir de la plateforme MQB partagée avec la Seat Leon 5F (même famille de calculateurs) ; à confirmer systématiquement par diagnostic sur le véhicule avant toute intervention.",
    "categories": [
      {
        "nom": "Éclairage extérieur",
        "items": [
          {
            "option": "Feux en virage (Corner Lights) avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant équipés fonction AFS ; 6 lignes de codage (calc. feux avant + BCM)"
          },
          {
            "option": "Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Désactivation des Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Corner Lights avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Seuils de vitesse d'activation des feux de virage",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) sur antibrouillards déjà actifs"
          },
          {
            "option": "Antibrouillards en feux de jour (DRL)",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 2 lignes de codage"
          },
          {
            "option": "Antibrouillards en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 4 lignes de codage"
          },
          {
            "option": "Feux de jour (DRL) uniquement en position Auto",
            "faisabilite": "OUI",
            "prerequis": "Commodo de phares avec position Auto"
          },
          {
            "option": "Activer/désactiver les DRL depuis l'écran (menu CAR)",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB) ; vérifier réglementation locale sur l'extinction des DRL"
          },
          {
            "option": "Désactivation des DRL avec le frein à main",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Feux arrière allumés avec les DRL (mode scandinave)",
            "faisabilite": "OUI",
            "prerequis": "1 ligne de codage, calc. feux arrière"
          },
          {
            "option": "Feux de stationnement des deux côtés",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Allumage automatique des feux à partir de 140 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares avec les antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Appel de phares avec les feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Assistant feux de route (Light Assist) - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist ou Lane Assist)"
          },
          {
            "option": "Light Assist toujours actif au démarrage",
            "faisabilite": "COND",
            "prerequis": "Light Assist déjà codé et actif"
          },
          {
            "option": "Réglages seuils de vitesse du Light Assist",
            "faisabilite": "COND",
            "prerequis": "Light Assist codé ; réglages fiables surtout avec phares Xénon ou LED"
          },
          {
            "option": "Baisser l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED ; 6 lignes de codage"
          },
          {
            "option": "Conserver l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED"
          },
          {
            "option": "Clignotant confort (nombre de clignotements)",
            "faisabilite": "OUI",
            "prerequis": "Fonction clignotant confort déjà présente d'usine"
          },
          {
            "option": "Clignotant US (veilleuses avec clignotants)",
            "faisabilite": "COND",
            "prerequis": "Phares LED ou Xénon ; 10 lignes de codage à l'avant, 8 à l'arrière"
          },
          {
            "option": "Clignotant US uniquement en mode Sport",
            "faisabilite": "COND",
            "prerequis": "Phares LED + sélecteur Drive Profile (mode de conduite)"
          },
          {
            "option": "Clignotants arrière et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED"
          },
          {
            "option": "Clignotants arrière US",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED (feux de position rouges clignotants)"
          },
          {
            "option": "Clignotants avant et LED en même temps",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Clignotants avant et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards + Xénon/LED",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant + phares Xénon ou LED"
          },
          {
            "option": "Coming/Leaving Home avec les DRL",
            "faisabilite": "OUI",
            "prerequis": "Codage en phase de test constructeur : sauvegarde des valeurs d'origine obligatoire avant modification"
          },
          {
            "option": "Coming/Leaving Home sans capteur de lumière",
            "faisabilite": "OUI",
            "prerequis": "5 lignes de codage ; fonctionne même sans capteur de luminosité"
          },
          {
            "option": "Coming Home à l'ouverture de la porte conducteur",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Coming Home automatique (sans appel de phares)",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Durée du Coming/Leaving Home augmentée dans le menu",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Clignotants extérieurs allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "4 lignes de codage"
          },
          {
            "option": "Feux arrière allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Compatible feux halogènes et LED ; plusieurs lignes de codage"
          },
          {
            "option": "Feux de coffre toujours actif même le coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Troisième feu stop allumé coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage plaque d'immatriculation coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "3 lignes de codage"
          },
          {
            "option": "Feux en mode Flash lors d'un freinage d'urgence",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité des feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Utile notamment avec une caméra de recul en garage sombre"
          },
          {
            "option": "Xénon : mode présentation au démarrage",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon (module DLA) montés"
          },
          {
            "option": "Xénon : réglages des lave-phares",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon avec lave-phares intégrés"
          },
          {
            "option": "Supprimer erreur ampoule antibrouillard LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement des antibrouillards d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule feu de recul LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement du feu de recul d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule immatriculation LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement de l'éclairage de plaque d'origine ; 2 lignes de codage"
          }
        ]
      },
      {
        "nom": "Éclairage intérieur & ambiance",
        "items": [
          {
            "option": "Éclairage intérieur progressif (fade in/out)",
            "faisabilite": "OUI",
            "prerequis": "Éclairages boutons de portes, tableau de bord et console centrale : d'usine allumage/extinction brusque"
          },
          {
            "option": "Désactiver l'éclairage habitacle à l'ouverture du coffre seul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage compteur avec les feux de position",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité de l'éclairage des portes",
            "faisabilite": "OUI",
            "prerequis": "Éclairage de portes (puddle light) déjà présent"
          },
          {
            "option": "Configuration de la lumière ambiante",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light (baguettes lumineuses de garniture de porte) montée d'usine"
          },
          {
            "option": "Lumière ambiante toujours rouge",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light montée d'usine (phase 1 : rouge uniquement, sans sélecteur couleur)"
          },
          {
            "option": "Intensité des LED de la climatisation",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic ; 3 lignes de codage"
          },
          {
            "option": "Désactiver la LED du sélecteur de mode de conduite",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite : Eco/Sport/Individual) équipé"
          }
        ]
      },
      {
        "nom": "Confort, ouverture & carrosserie",
        "items": [
          {
            "option": "Abaisser le rétroviseur passager en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs électriques à mémoire ; sélecteur du rétro doit être en position côté passager lors de la manœuvre"
          },
          {
            "option": "Rabattre automatiquement les rétroviseurs au verrouillage",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Rabattre les rétroviseurs avec le contact",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Réglage du rabattement des rétros via la télécommande",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Dégivrage rétros automatique avec la lunette arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs chauffants"
          },
          {
            "option": "Durée du dégivrage de la lunette arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Vitres fonctionnelles contact coupé, porte ouverte",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Fermeture automatique des vitres en cas de pluie",
            "faisabilite": "COND",
            "prerequis": "Capteur de pluie (essuie-glaces automatiques) monté ; 4 lignes de codage, inclut le toit ouvrant si équipé"
          },
          {
            "option": "Ouverture/fermeture des vitres avec KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Verrouillage automatique sans clé KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Ouverture complète du toit ouvrant avec la télécommande",
            "faisabilite": "COND",
            "prerequis": "Toit ouvrant électrique monté"
          },
          {
            "option": "Déverrouillage automatique des portes DSG sur P",
            "faisabilite": "COND",
            "prerequis": "Boîte de vitesses automatique DSG"
          },
          {
            "option": "Confirmation verrouillage/déverrouillage (bip / klaxon)",
            "faisabilite": "OUI",
            "prerequis": "Plusieurs lignes de codage selon le mode choisi (bip d'alarme ou klaxon)"
          },
          {
            "option": "Alarme anti-intrusion avec klaxon",
            "faisabilite": "OUI",
            "prerequis": "Alarme antivol d'usine (détecteur d'ouverture de porte) ; plusieurs lignes de codage"
          },
          {
            "option": "Utilisation de la clé même contact mis",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier, pratique avec une clé de secours"
          },
          {
            "option": "Désactiver l'alarme porte ouverte avec contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver le klaxon sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Easy Entry (recul du siège conducteur)",
            "faisabilite": "COND",
            "prerequis": "Siège conducteur électrique à mémoire ; disponible sur Octavia 3 Facelift uniquement"
          },
          {
            "option": "Mémoire des sièges chauffants",
            "faisabilite": "COND",
            "prerequis": "Sièges avant chauffants"
          },
          {
            "option": "Mémoire de la fonction AirCare",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic avec fonction AirCare (filtration/qualité de l'air)"
          },
          {
            "option": "Affichage vitesse ventilation en mode Auto",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic (climatisation automatique)"
          },
          {
            "option": "Seuils d'alerte risque de verglas",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température en Celsius ou Fahrenheit",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Essuie-glaces",
        "items": [
          {
            "option": "Tear Wiping (balayage supplémentaire après lave-glace)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Arrêt des essuie-glaces au retrait de la clé",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver l'essuie-glace arrière en marche arrière",
            "faisabilite": "OUI",
            "prerequis": "Véhicule équipé d'un essuie-glace arrière (break/5 portes)"
          },
          {
            "option": "Affichage essuie-glace arrière confort dans le menu CAR",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB) ; essuie-glace arrière à balayage confort"
          },
          {
            "option": "Menu position remplacement des balais sur l'écran",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Angle des essuie-glaces en position service",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Ordinateur de bord (ODB) / Virtual Cockpit",
        "items": [
          {
            "option": "Check des aiguilles au démarrage (needle sweep)",
            "faisabilite": "OUI",
            "prerequis": "Compteur analogique classique ou Virtual Cockpit"
          },
          {
            "option": "Chronomètre (Lap Timer)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température d'huile sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Niveau de charge batterie sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Quantité d'appoint carburant sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Boussole sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Système de navigation GPS (NAV) monté"
          },
          {
            "option": "Affichage des panneaux (Sign Assist) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist)"
          },
          {
            "option": "Affichage du mode 2 cylindres sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Moteur avec technologie ACT (désactivation de cylindres, ex. 1.4 TSI ACT)"
          },
          {
            "option": "Affichage essuie-glace arrière confort sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Voir section Essuie-glaces"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite) équipé"
          },
          {
            "option": "Alerte dépassement 120 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Changer la langue de l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Idéal en cas de véhicule importé"
          },
          {
            "option": "Logo de démarrage ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "ODB look carbone",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Correction affichage de consommation",
            "faisabilite": "OUI",
            "prerequis": "Effet variable selon le style de conduite, sans garantie de précision absolue"
          },
          {
            "option": "Désactiver le voyant plaquettes de frein",
            "faisabilite": "OUI",
            "prerequis": "Pertinent si plaquettes montées sans capteur d'usure"
          },
          {
            "option": "Désactiver l'avertissement antibrouillard arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Supprimer alarme ceinture",
            "faisabilite": "OUI",
            "prerequis": "Déconseillé pour des raisons de sécurité routière"
          },
          {
            "option": "Facelift : modifier l'affichage du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : modifier le véhicule du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : désactiver le message « Allumez les feux de croisement »",
            "faisabilite": "OUI",
            "prerequis": "Disponible uniquement sur Octavia 3 Facelift"
          },
          {
            "option": "Facelift : pulsation lumineuse bouton Start/Stop",
            "faisabilite": "COND",
            "prerequis": "Bouton de démarrage KESSY (accès sans clé), disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Multimédia (MIB)",
        "items": [
          {
            "option": "Changement automatique heure été/hiver",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Look carbone sur l'écran multimédia",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Logo de démarrage sur l'écran multimédia",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Menu caché (green menu / mode ingénieur) MIB2",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB2) ; sauvegarde obligatoire avant modification"
          },
          {
            "option": "Mode Auto-École (affichage clignotants, vitesse...)",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Personnalisation du profil conducteur",
            "faisabilite": "OUI",
            "prerequis": "Combiné ODB/Virtual Cockpit et écran MIB compatibles profils conducteur"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur MIB2",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 + sélecteur Drive Profile équipé"
          },
          {
            "option": "Affichage radars de recul sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Véhicule équipé uniquement de radars de recul (sans caméra de recul)"
          },
          {
            "option": "Vitesse de désactivation des radars / caméra",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) et/ou caméra de recul monté"
          },
          {
            "option": "Désactiver le bip d'enclenchement de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) monté"
          },
          {
            "option": "Désactiver la réduction audio de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot monté avec coupure automatique du son"
          },
          {
            "option": "Distance trottoir Park Assist",
            "faisabilite": "COND",
            "prerequis": "Système Park Assist (créneau semi-automatique) monté"
          },
          {
            "option": "Ajouter CarPlay / Android Auto après activation Full Link (MIB2 2xxT)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 référence système en 2xxT, Full Link déjà activé au préalable"
          },
          {
            "option": "Activer le port USB pour iPhone CarPlay",
            "faisabilite": "RETROFIT",
            "prerequis": "Full Link activé, remplacement du port USB et/ou du câble par un modèle compatible CarPlay filaire"
          },
          {
            "option": "Activer caméra de recul (retrofit Low/High)",
            "faisabilite": "RETROFIT",
            "prerequis": "Caméra de recul (version Low ou High) installée physiquement avec câblage"
          },
          {
            "option": "Activer l'extraction CD/DVD (copie multimédia)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB avec lecteur CD/DVD intégré"
          },
          {
            "option": "Verrouiller le bouton d'éjection CD/DVD",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 avec lecteur CD/DVD intégré"
          },
          {
            "option": "Désactiver la fréquence AM",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Désactiver MirrorLink",
            "faisabilite": "OUI",
            "prerequis": "Écran MIB2 (service MirrorLink obsolète, non lié au fonctionnement du CarPlay/Android Auto)"
          },
          {
            "option": "Sensibilité du microphone mains libres",
            "faisabilite": "OUI",
            "prerequis": "Système Bluetooth mains libres actif"
          },
          {
            "option": "Facelift : Ambient Light (couleurs) sur MIB / Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 Facelift + option Ambient Light avec fonction changement de couleur"
          },
          {
            "option": "Facelift : mode Off-Road sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Écran multimédia (MIB2) avec navigation, disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Aides à la conduite & châssis",
        "items": [
          {
            "option": "Lane Assist - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist et/ou Light Assist)"
          },
          {
            "option": "Mémoire de la fonction Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Réglages du Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Hill Start Assist (réglage)",
            "faisabilite": "OUI",
            "prerequis": "Fonction ESP de maintien en côte présente sur la majorité des Octavia 3"
          },
          {
            "option": "Hold Assist (mémoire du bouton Auto Hold)",
            "faisabilite": "COND",
            "prerequis": "Frein de parking électrique avec fonction Auto Hold"
          },
          {
            "option": "Blocage électronique du différentiel (XDS)",
            "faisabilite": "OUI",
            "prerequis": "Fonction XDS de l'ESP présente sur la majorité des Octavia 3, notamment RS"
          },
          {
            "option": "Désactiver l'ESP / mode Sport ESC depuis l'écran",
            "faisabilite": "OUI",
            "prerequis": "Disponible sur Octavia 3 phase 1 uniquement"
          },
          {
            "option": "Dureté de la direction assistée",
            "faisabilite": "OUI",
            "prerequis": "Direction assistée électrique (EPS)"
          },
          {
            "option": "Sensibilité de l'accélérateur",
            "faisabilite": "OUI",
            "prerequis": "Effet plus marqué sur boîte DSG qu'en boîte manuelle"
          },
          {
            "option": "Séchage des disques de frein (intensité)",
            "faisabilite": "OUI",
            "prerequis": "Fonction d'essuyage des disques par l'ESP présente sur la majorité des Octavia 3"
          },
          {
            "option": "Désactivation du Start/Stop",
            "faisabilite": "OUI",
            "prerequis": "Système Start/Stop présent (moteurs essence/diesel concernés) ; 1 ligne de codage"
          },
          {
            "option": "Volume du Soundaktor",
            "faisabilite": "COND",
            "prerequis": "Haut-parleur Soundaktor (générateur sonore moteur), présent notamment sur RS"
          },
          {
            "option": "Activer l'attelage remorque (retrofit)",
            "faisabilite": "RETROFIT",
            "prerequis": "Attelage remorque installé physiquement ; adaptation dédiée dans le calculateur ESP/BCM"
          },
          {
            "option": "Facelift : réglages du Front Assist",
            "faisabilite": "COND",
            "prerequis": "Radar frontal ACC/Front Assist, disponible sur Facelift"
          },
          {
            "option": "Facelift : ACC par incréments de 1 km/h",
            "faisabilite": "COND",
            "prerequis": "Régulateur adaptatif ACC monté, disponible sur Facelift"
          },
          {
            "option": "Facelift : désactiver la prévention des dépassements par la droite",
            "faisabilite": "COND",
            "prerequis": "Régulateur ACC + Lane Assist montés, disponible sur Facelift"
          }
        ]
      },
      {
        "nom": "Procédures d'entretien / diagnostic (hors options)",
        "items": [
          {
            "option": "Reprogrammer une nouvelle batterie",
            "faisabilite": "ENTRETIEN",
            "prerequis": "À réaliser après tout remplacement de la batterie 12V (gestion de batterie / Bordnetz)"
          },
          {
            "option": "Frein à main électrique en mode maintenance (plaquettes AR)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Frein de parking électrique (EPB) ; nécessaire pour tout remplacement de plaquettes arrière"
          },
          {
            "option": "Calibrage radar ACC (défaut C1103)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Radar ACC/Front Assist ; requis après dépose du pare-choc avant ou choc/remplacement du radar"
          }
        ]
      }
    ]
  },
  "vw-passat-b8": {
    "marque": "Volkswagen",
    "modele": "Passat B8",
    "periode": "2014 à 2023",
    "sousTitre": "Passat / GT / Alltrack / Facelift (2019-2023)",
    "source": "Liste établie par AREPROG à partir de la plateforme MQB partagée avec la Seat Leon 5F (même famille de calculateurs) ; à confirmer systématiquement par diagnostic sur le véhicule avant toute intervention.",
    "categories": [
      {
        "nom": "Éclairage extérieur",
        "items": [
          {
            "option": "Feux en virage (Corner Lights) avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant équipés fonction AFS ; 6 lignes de codage (calc. feux avant + BCM)"
          },
          {
            "option": "Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Désactivation des Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Corner Lights avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Seuils de vitesse d'activation des feux de virage",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) sur antibrouillards déjà actifs"
          },
          {
            "option": "Antibrouillards en feux de jour (DRL)",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 2 lignes de codage"
          },
          {
            "option": "Antibrouillards en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 4 lignes de codage"
          },
          {
            "option": "Feux de jour (DRL) uniquement en position Auto",
            "faisabilite": "OUI",
            "prerequis": "Commodo de phares avec position Auto"
          },
          {
            "option": "Activer/désactiver les DRL depuis l'écran (menu CAR)",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB) ; vérifier réglementation locale sur l'extinction des DRL"
          },
          {
            "option": "Désactivation des DRL avec le frein à main",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Feux arrière allumés avec les DRL (mode scandinave)",
            "faisabilite": "OUI",
            "prerequis": "1 ligne de codage, calc. feux arrière"
          },
          {
            "option": "Feux de stationnement des deux côtés",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Allumage automatique des feux à partir de 140 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares avec les antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Appel de phares avec les feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Assistant feux de route (Light Assist) - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist ou Lane Assist)"
          },
          {
            "option": "Light Assist toujours actif au démarrage",
            "faisabilite": "COND",
            "prerequis": "Light Assist déjà codé et actif"
          },
          {
            "option": "Réglages seuils de vitesse du Light Assist",
            "faisabilite": "COND",
            "prerequis": "Light Assist codé ; réglages fiables surtout avec phares Xénon ou LED"
          },
          {
            "option": "Baisser l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED ; 6 lignes de codage"
          },
          {
            "option": "Conserver l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED"
          },
          {
            "option": "Clignotant confort (nombre de clignotements)",
            "faisabilite": "OUI",
            "prerequis": "Fonction clignotant confort déjà présente d'usine"
          },
          {
            "option": "Clignotant US (veilleuses avec clignotants)",
            "faisabilite": "COND",
            "prerequis": "Phares LED ou Xénon ; 10 lignes de codage à l'avant, 8 à l'arrière"
          },
          {
            "option": "Clignotant US uniquement en mode Sport",
            "faisabilite": "COND",
            "prerequis": "Phares LED + sélecteur Drive Profile (mode de conduite)"
          },
          {
            "option": "Clignotants arrière et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED"
          },
          {
            "option": "Clignotants arrière US",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED (feux de position rouges clignotants)"
          },
          {
            "option": "Clignotants avant et LED en même temps",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Clignotants avant et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards + Xénon/LED",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant + phares Xénon ou LED"
          },
          {
            "option": "Coming/Leaving Home avec les DRL",
            "faisabilite": "OUI",
            "prerequis": "Codage en phase de test constructeur : sauvegarde des valeurs d'origine obligatoire avant modification"
          },
          {
            "option": "Coming/Leaving Home sans capteur de lumière",
            "faisabilite": "OUI",
            "prerequis": "5 lignes de codage ; fonctionne même sans capteur de luminosité"
          },
          {
            "option": "Coming Home à l'ouverture de la porte conducteur",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Coming Home automatique (sans appel de phares)",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Durée du Coming/Leaving Home augmentée dans le menu",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Clignotants extérieurs allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "4 lignes de codage"
          },
          {
            "option": "Feux arrière allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Compatible feux halogènes et LED ; plusieurs lignes de codage"
          },
          {
            "option": "Feux de coffre toujours actif même le coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Troisième feu stop allumé coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage plaque d'immatriculation coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "3 lignes de codage"
          },
          {
            "option": "Feux en mode Flash lors d'un freinage d'urgence",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité des feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Utile notamment avec une caméra de recul en garage sombre"
          },
          {
            "option": "Xénon : mode présentation au démarrage",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon (module DLA) montés"
          },
          {
            "option": "Xénon : réglages des lave-phares",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon avec lave-phares intégrés"
          },
          {
            "option": "Supprimer erreur ampoule antibrouillard LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement des antibrouillards d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule feu de recul LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement du feu de recul d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule immatriculation LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement de l'éclairage de plaque d'origine ; 2 lignes de codage"
          }
        ]
      },
      {
        "nom": "Éclairage intérieur & ambiance",
        "items": [
          {
            "option": "Éclairage intérieur progressif (fade in/out)",
            "faisabilite": "OUI",
            "prerequis": "Éclairages boutons de portes, tableau de bord et console centrale : d'usine allumage/extinction brusque"
          },
          {
            "option": "Désactiver l'éclairage habitacle à l'ouverture du coffre seul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage compteur avec les feux de position",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité de l'éclairage des portes",
            "faisabilite": "OUI",
            "prerequis": "Éclairage de portes (puddle light) déjà présent"
          },
          {
            "option": "Configuration de la lumière ambiante",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light (baguettes lumineuses de garniture de porte) montée d'usine"
          },
          {
            "option": "Lumière ambiante toujours rouge",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light montée d'usine (phase 1 : rouge uniquement, sans sélecteur couleur)"
          },
          {
            "option": "Intensité des LED de la climatisation",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic ; 3 lignes de codage"
          },
          {
            "option": "Désactiver la LED du sélecteur de mode de conduite",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite : Eco/Sport/Individual) équipé"
          }
        ]
      },
      {
        "nom": "Confort, ouverture & carrosserie",
        "items": [
          {
            "option": "Abaisser le rétroviseur passager en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs électriques à mémoire ; sélecteur du rétro doit être en position côté passager lors de la manœuvre"
          },
          {
            "option": "Rabattre automatiquement les rétroviseurs au verrouillage",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Rabattre les rétroviseurs avec le contact",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Réglage du rabattement des rétros via la télécommande",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Dégivrage rétros automatique avec la lunette arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs chauffants"
          },
          {
            "option": "Durée du dégivrage de la lunette arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Vitres fonctionnelles contact coupé, porte ouverte",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Fermeture automatique des vitres en cas de pluie",
            "faisabilite": "COND",
            "prerequis": "Capteur de pluie (essuie-glaces automatiques) monté ; 4 lignes de codage, inclut le toit ouvrant si équipé"
          },
          {
            "option": "Ouverture/fermeture des vitres avec KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Verrouillage automatique sans clé KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Ouverture complète du toit ouvrant avec la télécommande",
            "faisabilite": "COND",
            "prerequis": "Toit ouvrant électrique monté"
          },
          {
            "option": "Déverrouillage automatique des portes DSG sur P",
            "faisabilite": "COND",
            "prerequis": "Boîte de vitesses automatique DSG"
          },
          {
            "option": "Confirmation verrouillage/déverrouillage (bip / klaxon)",
            "faisabilite": "OUI",
            "prerequis": "Plusieurs lignes de codage selon le mode choisi (bip d'alarme ou klaxon)"
          },
          {
            "option": "Alarme anti-intrusion avec klaxon",
            "faisabilite": "OUI",
            "prerequis": "Alarme antivol d'usine (détecteur d'ouverture de porte) ; plusieurs lignes de codage"
          },
          {
            "option": "Utilisation de la clé même contact mis",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier, pratique avec une clé de secours"
          },
          {
            "option": "Désactiver l'alarme porte ouverte avec contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver le klaxon sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Easy Entry (recul du siège conducteur)",
            "faisabilite": "COND",
            "prerequis": "Siège conducteur électrique à mémoire ; disponible sur Passat B8 Facelift uniquement"
          },
          {
            "option": "Mémoire des sièges chauffants",
            "faisabilite": "COND",
            "prerequis": "Sièges avant chauffants"
          },
          {
            "option": "Mémoire de la fonction AirCare",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic avec fonction AirCare (filtration/qualité de l'air)"
          },
          {
            "option": "Affichage vitesse ventilation en mode Auto",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic (climatisation automatique)"
          },
          {
            "option": "Seuils d'alerte risque de verglas",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température en Celsius ou Fahrenheit",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Essuie-glaces",
        "items": [
          {
            "option": "Tear Wiping (balayage supplémentaire après lave-glace)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Arrêt des essuie-glaces au retrait de la clé",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver l'essuie-glace arrière en marche arrière",
            "faisabilite": "OUI",
            "prerequis": "Véhicule équipé d'un essuie-glace arrière (break/5 portes)"
          },
          {
            "option": "Affichage essuie-glace arrière confort dans le menu CAR",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB) ; essuie-glace arrière à balayage confort"
          },
          {
            "option": "Menu position remplacement des balais sur l'écran",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Angle des essuie-glaces en position service",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Ordinateur de bord (ODB) / Virtual Cockpit",
        "items": [
          {
            "option": "Check des aiguilles au démarrage (needle sweep)",
            "faisabilite": "OUI",
            "prerequis": "Compteur analogique classique ou Virtual Cockpit"
          },
          {
            "option": "Chronomètre (Lap Timer)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température d'huile sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Niveau de charge batterie sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Quantité d'appoint carburant sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Boussole sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Système de navigation GPS (NAV) monté"
          },
          {
            "option": "Affichage des panneaux (Sign Assist) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist)"
          },
          {
            "option": "Affichage du mode 2 cylindres sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Moteur avec technologie ACT (désactivation de cylindres, ex. 1.4 TSI ACT)"
          },
          {
            "option": "Affichage essuie-glace arrière confort sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Voir section Essuie-glaces"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite) équipé"
          },
          {
            "option": "Alerte dépassement 120 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Changer la langue de l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Idéal en cas de véhicule importé"
          },
          {
            "option": "Logo de démarrage ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "ODB look carbone",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Correction affichage de consommation",
            "faisabilite": "OUI",
            "prerequis": "Effet variable selon le style de conduite, sans garantie de précision absolue"
          },
          {
            "option": "Désactiver le voyant plaquettes de frein",
            "faisabilite": "OUI",
            "prerequis": "Pertinent si plaquettes montées sans capteur d'usure"
          },
          {
            "option": "Désactiver l'avertissement antibrouillard arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Supprimer alarme ceinture",
            "faisabilite": "OUI",
            "prerequis": "Déconseillé pour des raisons de sécurité routière"
          },
          {
            "option": "Facelift : modifier l'affichage du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : modifier le véhicule du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : désactiver le message « Allumez les feux de croisement »",
            "faisabilite": "OUI",
            "prerequis": "Disponible uniquement sur Passat B8 Facelift"
          },
          {
            "option": "Facelift : pulsation lumineuse bouton Start/Stop",
            "faisabilite": "COND",
            "prerequis": "Bouton de démarrage KESSY (accès sans clé), disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Multimédia (MIB)",
        "items": [
          {
            "option": "Changement automatique heure été/hiver",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Look carbone sur l'écran multimédia",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Logo de démarrage sur l'écran multimédia",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Menu caché (green menu / mode ingénieur) MIB2",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB2) ; sauvegarde obligatoire avant modification"
          },
          {
            "option": "Mode Auto-École (affichage clignotants, vitesse...)",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Personnalisation du profil conducteur",
            "faisabilite": "OUI",
            "prerequis": "Combiné ODB/Virtual Cockpit et écran MIB compatibles profils conducteur"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur MIB2",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 + sélecteur Drive Profile équipé"
          },
          {
            "option": "Affichage radars de recul sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Véhicule équipé uniquement de radars de recul (sans caméra de recul)"
          },
          {
            "option": "Vitesse de désactivation des radars / caméra",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) et/ou caméra de recul monté"
          },
          {
            "option": "Désactiver le bip d'enclenchement de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) monté"
          },
          {
            "option": "Désactiver la réduction audio de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot monté avec coupure automatique du son"
          },
          {
            "option": "Distance trottoir Park Assist",
            "faisabilite": "COND",
            "prerequis": "Système Park Assist (créneau semi-automatique) monté"
          },
          {
            "option": "Ajouter CarPlay / Android Auto après activation Full Link (MIB2 2xxT)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 référence système en 2xxT, Full Link déjà activé au préalable"
          },
          {
            "option": "Activer le port USB pour iPhone CarPlay",
            "faisabilite": "RETROFIT",
            "prerequis": "Full Link activé, remplacement du port USB et/ou du câble par un modèle compatible CarPlay filaire"
          },
          {
            "option": "Activer caméra de recul (retrofit Low/High)",
            "faisabilite": "RETROFIT",
            "prerequis": "Caméra de recul (version Low ou High) installée physiquement avec câblage"
          },
          {
            "option": "Activer l'extraction CD/DVD (copie multimédia)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB avec lecteur CD/DVD intégré"
          },
          {
            "option": "Verrouiller le bouton d'éjection CD/DVD",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 avec lecteur CD/DVD intégré"
          },
          {
            "option": "Désactiver la fréquence AM",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Désactiver MirrorLink",
            "faisabilite": "OUI",
            "prerequis": "Écran MIB2 (service MirrorLink obsolète, non lié au fonctionnement du CarPlay/Android Auto)"
          },
          {
            "option": "Sensibilité du microphone mains libres",
            "faisabilite": "OUI",
            "prerequis": "Système Bluetooth mains libres actif"
          },
          {
            "option": "Facelift : Ambient Light (couleurs) sur MIB / Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 Facelift + option Ambient Light avec fonction changement de couleur"
          },
          {
            "option": "Facelift : mode Off-Road sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Écran multimédia (MIB2) avec navigation, disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Aides à la conduite & châssis",
        "items": [
          {
            "option": "Lane Assist - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist et/ou Light Assist)"
          },
          {
            "option": "Mémoire de la fonction Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Réglages du Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Hill Start Assist (réglage)",
            "faisabilite": "OUI",
            "prerequis": "Fonction ESP de maintien en côte présente sur la majorité des Passat B8"
          },
          {
            "option": "Hold Assist (mémoire du bouton Auto Hold)",
            "faisabilite": "COND",
            "prerequis": "Frein de parking électrique avec fonction Auto Hold"
          },
          {
            "option": "Blocage électronique du différentiel (XDS)",
            "faisabilite": "OUI",
            "prerequis": "Fonction XDS de l'ESP présente sur la majorité des Passat B8, notamment R-Line/GT"
          },
          {
            "option": "Désactiver l'ESP / mode Sport ESC depuis l'écran",
            "faisabilite": "OUI",
            "prerequis": "Disponible sur Passat B8 phase 1 uniquement"
          },
          {
            "option": "Dureté de la direction assistée",
            "faisabilite": "OUI",
            "prerequis": "Direction assistée électrique (EPS)"
          },
          {
            "option": "Sensibilité de l'accélérateur",
            "faisabilite": "OUI",
            "prerequis": "Effet plus marqué sur boîte DSG qu'en boîte manuelle"
          },
          {
            "option": "Séchage des disques de frein (intensité)",
            "faisabilite": "OUI",
            "prerequis": "Fonction d'essuyage des disques par l'ESP présente sur la majorité des Passat B8"
          },
          {
            "option": "Désactivation du Start/Stop",
            "faisabilite": "OUI",
            "prerequis": "Système Start/Stop présent (moteurs essence/diesel concernés) ; 1 ligne de codage"
          },
          {
            "option": "Volume du Soundaktor",
            "faisabilite": "COND",
            "prerequis": "Haut-parleur Soundaktor (générateur sonore moteur), présent notamment sur R-Line/GT"
          },
          {
            "option": "Activer l'attelage remorque (retrofit)",
            "faisabilite": "RETROFIT",
            "prerequis": "Attelage remorque installé physiquement ; adaptation dédiée dans le calculateur ESP/BCM"
          },
          {
            "option": "Facelift : réglages du Front Assist",
            "faisabilite": "COND",
            "prerequis": "Radar frontal ACC/Front Assist, disponible sur Facelift"
          },
          {
            "option": "Facelift : ACC par incréments de 1 km/h",
            "faisabilite": "COND",
            "prerequis": "Régulateur adaptatif ACC monté, disponible sur Facelift"
          },
          {
            "option": "Facelift : désactiver la prévention des dépassements par la droite",
            "faisabilite": "COND",
            "prerequis": "Régulateur ACC + Lane Assist montés, disponible sur Facelift"
          }
        ]
      },
      {
        "nom": "Procédures d'entretien / diagnostic (hors options)",
        "items": [
          {
            "option": "Reprogrammer une nouvelle batterie",
            "faisabilite": "ENTRETIEN",
            "prerequis": "À réaliser après tout remplacement de la batterie 12V (gestion de batterie / Bordnetz)"
          },
          {
            "option": "Frein à main électrique en mode maintenance (plaquettes AR)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Frein de parking électrique (EPB) ; nécessaire pour tout remplacement de plaquettes arrière"
          },
          {
            "option": "Calibrage radar ACC (défaut C1103)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Radar ACC/Front Assist ; requis après dépose du pare-choc avant ou choc/remplacement du radar"
          }
        ]
      }
    ]
  },
  "vw-tiguan-2": {
    "marque": "Volkswagen",
    "modele": "Tiguan 2 (AD1)",
    "periode": "2016 à 2023",
    "sousTitre": "Tiguan / R-Line / Allspace / Facelift (2020-2023)",
    "source": "Liste établie par AREPROG à partir de la plateforme MQB partagée avec la Seat Leon 5F (même famille de calculateurs) ; à confirmer systématiquement par diagnostic sur le véhicule avant toute intervention.",
    "categories": [
      {
        "nom": "Éclairage extérieur",
        "items": [
          {
            "option": "Feux en virage (Corner Lights) avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant équipés fonction AFS ; 6 lignes de codage (calc. feux avant + BCM)"
          },
          {
            "option": "Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Désactivation des Corner Lights en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Corner Lights avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) déjà codés et fonctionnels"
          },
          {
            "option": "Seuils de vitesse d'activation des feux de virage",
            "faisabilite": "COND",
            "prerequis": "Corner Lights (AFS) sur antibrouillards déjà actifs"
          },
          {
            "option": "Antibrouillards en feux de jour (DRL)",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 2 lignes de codage"
          },
          {
            "option": "Antibrouillards en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés ; 4 lignes de codage"
          },
          {
            "option": "Feux de jour (DRL) uniquement en position Auto",
            "faisabilite": "OUI",
            "prerequis": "Commodo de phares avec position Auto"
          },
          {
            "option": "Activer/désactiver les DRL depuis l'écran (menu CAR)",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB) ; vérifier réglementation locale sur l'extinction des DRL"
          },
          {
            "option": "Désactivation des DRL avec le frein à main",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Feux arrière allumés avec les DRL (mode scandinave)",
            "faisabilite": "OUI",
            "prerequis": "1 ligne de codage, calc. feux arrière"
          },
          {
            "option": "Feux de stationnement des deux côtés",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Allumage automatique des feux à partir de 140 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares avec les antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Appel de phares avec les feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Appel de phares sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Assistant feux de route (Light Assist) - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist ou Lane Assist)"
          },
          {
            "option": "Light Assist toujours actif au démarrage",
            "faisabilite": "COND",
            "prerequis": "Light Assist déjà codé et actif"
          },
          {
            "option": "Réglages seuils de vitesse du Light Assist",
            "faisabilite": "COND",
            "prerequis": "Light Assist codé ; réglages fiables surtout avec phares Xénon ou LED"
          },
          {
            "option": "Baisser l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED ; 6 lignes de codage"
          },
          {
            "option": "Conserver l'intensité des DRL avec les clignotants",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED"
          },
          {
            "option": "Clignotant confort (nombre de clignotements)",
            "faisabilite": "OUI",
            "prerequis": "Fonction clignotant confort déjà présente d'usine"
          },
          {
            "option": "Clignotant US (veilleuses avec clignotants)",
            "faisabilite": "COND",
            "prerequis": "Phares LED ou Xénon ; 10 lignes de codage à l'avant, 8 à l'arrière"
          },
          {
            "option": "Clignotant US uniquement en mode Sport",
            "faisabilite": "COND",
            "prerequis": "Phares LED + sélecteur Drive Profile (mode de conduite)"
          },
          {
            "option": "Clignotants arrière et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED"
          },
          {
            "option": "Clignotants arrière US",
            "faisabilite": "COND",
            "prerequis": "Feux arrière à LED (feux de position rouges clignotants)"
          },
          {
            "option": "Clignotants avant et LED en même temps",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Clignotants avant et LED en opposition de phase",
            "faisabilite": "COND",
            "prerequis": "Phares avant à LED (DRL LED) ; 6 lignes de codage"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant montés"
          },
          {
            "option": "Coming/Leaving Home avec antibrouillards + Xénon/LED",
            "faisabilite": "COND",
            "prerequis": "Antibrouillards avant + phares Xénon ou LED"
          },
          {
            "option": "Coming/Leaving Home avec les DRL",
            "faisabilite": "OUI",
            "prerequis": "Codage en phase de test constructeur : sauvegarde des valeurs d'origine obligatoire avant modification"
          },
          {
            "option": "Coming/Leaving Home sans capteur de lumière",
            "faisabilite": "OUI",
            "prerequis": "5 lignes de codage ; fonctionne même sans capteur de luminosité"
          },
          {
            "option": "Coming Home à l'ouverture de la porte conducteur",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Coming Home automatique (sans appel de phares)",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Durée du Coming/Leaving Home augmentée dans le menu",
            "faisabilite": "OUI",
            "prerequis": "Fonction Coming/Leaving Home déjà active"
          },
          {
            "option": "Clignotants extérieurs allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "4 lignes de codage"
          },
          {
            "option": "Feux arrière allumés coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Compatible feux halogènes et LED ; plusieurs lignes de codage"
          },
          {
            "option": "Feux de coffre toujours actif même le coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Troisième feu stop allumé coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage plaque d'immatriculation coffre ouvert",
            "faisabilite": "OUI",
            "prerequis": "3 lignes de codage"
          },
          {
            "option": "Feux en mode Flash lors d'un freinage d'urgence",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité des feux de recul",
            "faisabilite": "OUI",
            "prerequis": "Utile notamment avec une caméra de recul en garage sombre"
          },
          {
            "option": "Xénon : mode présentation au démarrage",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon (module DLA) montés"
          },
          {
            "option": "Xénon : réglages des lave-phares",
            "faisabilite": "COND",
            "prerequis": "Phares Xénon avec lave-phares intégrés"
          },
          {
            "option": "Supprimer erreur ampoule antibrouillard LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement des antibrouillards d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule feu de recul LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement du feu de recul d'origine ; 4 lignes de codage"
          },
          {
            "option": "Supprimer erreur ampoule immatriculation LED",
            "faisabilite": "RETROFIT",
            "prerequis": "Ampoules LED installées en remplacement de l'éclairage de plaque d'origine ; 2 lignes de codage"
          }
        ]
      },
      {
        "nom": "Éclairage intérieur & ambiance",
        "items": [
          {
            "option": "Éclairage intérieur progressif (fade in/out)",
            "faisabilite": "OUI",
            "prerequis": "Éclairages boutons de portes, tableau de bord et console centrale : d'usine allumage/extinction brusque"
          },
          {
            "option": "Désactiver l'éclairage habitacle à l'ouverture du coffre seul",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Éclairage compteur avec les feux de position",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Augmenter l'intensité de l'éclairage des portes",
            "faisabilite": "OUI",
            "prerequis": "Éclairage de portes (puddle light) déjà présent"
          },
          {
            "option": "Configuration de la lumière ambiante",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light (baguettes lumineuses de garniture de porte) montée d'usine"
          },
          {
            "option": "Lumière ambiante toujours rouge",
            "faisabilite": "COND",
            "prerequis": "Option Ambient Light montée d'usine (phase 1 : rouge uniquement, sans sélecteur couleur)"
          },
          {
            "option": "Intensité des LED de la climatisation",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic ; 3 lignes de codage"
          },
          {
            "option": "Désactiver la LED du sélecteur de mode de conduite",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite : Eco/Sport/Individual) équipé"
          }
        ]
      },
      {
        "nom": "Confort, ouverture & carrosserie",
        "items": [
          {
            "option": "Abaisser le rétroviseur passager en marche arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs électriques à mémoire ; sélecteur du rétro doit être en position côté passager lors de la manœuvre"
          },
          {
            "option": "Rabattre automatiquement les rétroviseurs au verrouillage",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Rabattre les rétroviseurs avec le contact",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Réglage du rabattement des rétros via la télécommande",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs rabattables électriquement"
          },
          {
            "option": "Dégivrage rétros automatique avec la lunette arrière",
            "faisabilite": "COND",
            "prerequis": "Rétroviseurs chauffants"
          },
          {
            "option": "Durée du dégivrage de la lunette arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Vitres fonctionnelles contact coupé, porte ouverte",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Fermeture automatique des vitres en cas de pluie",
            "faisabilite": "COND",
            "prerequis": "Capteur de pluie (essuie-glaces automatiques) monté ; 4 lignes de codage, inclut le toit ouvrant si équipé"
          },
          {
            "option": "Ouverture/fermeture des vitres avec KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Verrouillage automatique sans clé KESSY",
            "faisabilite": "COND",
            "prerequis": "Système d'accès et de démarrage sans clé KESSY"
          },
          {
            "option": "Ouverture complète du toit ouvrant avec la télécommande",
            "faisabilite": "COND",
            "prerequis": "Toit ouvrant électrique monté"
          },
          {
            "option": "Déverrouillage automatique des portes DSG sur P",
            "faisabilite": "COND",
            "prerequis": "Boîte de vitesses automatique DSG"
          },
          {
            "option": "Confirmation verrouillage/déverrouillage (bip / klaxon)",
            "faisabilite": "OUI",
            "prerequis": "Plusieurs lignes de codage selon le mode choisi (bip d'alarme ou klaxon)"
          },
          {
            "option": "Alarme anti-intrusion avec klaxon",
            "faisabilite": "OUI",
            "prerequis": "Alarme antivol d'usine (détecteur d'ouverture de porte) ; plusieurs lignes de codage"
          },
          {
            "option": "Utilisation de la clé même contact mis",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier, pratique avec une clé de secours"
          },
          {
            "option": "Désactiver l'alarme porte ouverte avec contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver le klaxon sans contact",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Easy Entry (recul du siège conducteur)",
            "faisabilite": "COND",
            "prerequis": "Siège conducteur électrique à mémoire ; disponible sur Tiguan 2 Facelift uniquement"
          },
          {
            "option": "Mémoire des sièges chauffants",
            "faisabilite": "COND",
            "prerequis": "Sièges avant chauffants"
          },
          {
            "option": "Mémoire de la fonction AirCare",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic avec fonction AirCare (filtration/qualité de l'air)"
          },
          {
            "option": "Affichage vitesse ventilation en mode Auto",
            "faisabilite": "COND",
            "prerequis": "Climatiseur Climatronic (climatisation automatique)"
          },
          {
            "option": "Seuils d'alerte risque de verglas",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température en Celsius ou Fahrenheit",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Essuie-glaces",
        "items": [
          {
            "option": "Tear Wiping (balayage supplémentaire après lave-glace)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Arrêt des essuie-glaces au retrait de la clé",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Désactiver l'essuie-glace arrière en marche arrière",
            "faisabilite": "OUI",
            "prerequis": "Véhicule équipé d'un essuie-glace arrière (break/5 portes)"
          },
          {
            "option": "Affichage essuie-glace arrière confort dans le menu CAR",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB) ; essuie-glace arrière à balayage confort"
          },
          {
            "option": "Menu position remplacement des balais sur l'écran",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Angle des essuie-glaces en position service",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          }
        ]
      },
      {
        "nom": "Ordinateur de bord (ODB) / Virtual Cockpit",
        "items": [
          {
            "option": "Check des aiguilles au démarrage (needle sweep)",
            "faisabilite": "OUI",
            "prerequis": "Compteur analogique classique ou Virtual Cockpit"
          },
          {
            "option": "Chronomètre (Lap Timer)",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Température d'huile sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Niveau de charge batterie sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Quantité d'appoint carburant sur l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Boussole sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Système de navigation GPS (NAV) monté"
          },
          {
            "option": "Affichage des panneaux (Sign Assist) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist)"
          },
          {
            "option": "Affichage du mode 2 cylindres sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Moteur avec technologie ACT (désactivation de cylindres, ex. 1.4 TSI ACT)"
          },
          {
            "option": "Affichage essuie-glace arrière confort sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Voir section Essuie-glaces"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur l'ODB",
            "faisabilite": "COND",
            "prerequis": "Sélecteur Drive Profile (mode de conduite) équipé"
          },
          {
            "option": "Alerte dépassement 120 km/h",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Changer la langue de l'ODB",
            "faisabilite": "OUI",
            "prerequis": "Idéal en cas de véhicule importé"
          },
          {
            "option": "Logo de démarrage ODB",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "ODB look carbone",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Correction affichage de consommation",
            "faisabilite": "OUI",
            "prerequis": "Effet variable selon le style de conduite, sans garantie de précision absolue"
          },
          {
            "option": "Désactiver le voyant plaquettes de frein",
            "faisabilite": "OUI",
            "prerequis": "Pertinent si plaquettes montées sans capteur d'usure"
          },
          {
            "option": "Désactiver l'avertissement antibrouillard arrière",
            "faisabilite": "OUI",
            "prerequis": "Aucun équipement particulier"
          },
          {
            "option": "Supprimer alarme ceinture",
            "faisabilite": "OUI",
            "prerequis": "Déconseillé pour des raisons de sécurité routière"
          },
          {
            "option": "Facelift : modifier l'affichage du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : modifier le véhicule du Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Combiné Virtual Cockpit"
          },
          {
            "option": "Facelift : désactiver le message « Allumez les feux de croisement »",
            "faisabilite": "OUI",
            "prerequis": "Disponible uniquement sur Tiguan 2 Facelift"
          },
          {
            "option": "Facelift : pulsation lumineuse bouton Start/Stop",
            "faisabilite": "COND",
            "prerequis": "Bouton de démarrage KESSY (accès sans clé), disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Multimédia (MIB)",
        "items": [
          {
            "option": "Changement automatique heure été/hiver",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Look carbone sur l'écran multimédia",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Logo de démarrage sur l'écran multimédia",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Menu caché (green menu / mode ingénieur) MIB2",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB2) ; sauvegarde obligatoire avant modification"
          },
          {
            "option": "Mode Auto-École (affichage clignotants, vitesse...)",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Personnalisation du profil conducteur",
            "faisabilite": "OUI",
            "prerequis": "Combiné ODB/Virtual Cockpit et écran MIB compatibles profils conducteur"
          },
          {
            "option": "Mode de conduite (Driving Mode) sur MIB2",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 + sélecteur Drive Profile équipé"
          },
          {
            "option": "Affichage radars de recul sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Véhicule équipé uniquement de radars de recul (sans caméra de recul)"
          },
          {
            "option": "Vitesse de désactivation des radars / caméra",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) et/ou caméra de recul monté"
          },
          {
            "option": "Désactiver le bip d'enclenchement de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot (radars de stationnement) monté"
          },
          {
            "option": "Désactiver la réduction audio de l'aide au stationnement",
            "faisabilite": "COND",
            "prerequis": "Système Park Pilot monté avec coupure automatique du son"
          },
          {
            "option": "Distance trottoir Park Assist",
            "faisabilite": "COND",
            "prerequis": "Système Park Assist (créneau semi-automatique) monté"
          },
          {
            "option": "Ajouter CarPlay / Android Auto après activation Full Link (MIB2 2xxT)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 référence système en 2xxT, Full Link déjà activé au préalable"
          },
          {
            "option": "Activer le port USB pour iPhone CarPlay",
            "faisabilite": "RETROFIT",
            "prerequis": "Full Link activé, remplacement du port USB et/ou du câble par un modèle compatible CarPlay filaire"
          },
          {
            "option": "Activer caméra de recul (retrofit Low/High)",
            "faisabilite": "RETROFIT",
            "prerequis": "Caméra de recul (version Low ou High) installée physiquement avec câblage"
          },
          {
            "option": "Activer l'extraction CD/DVD (copie multimédia)",
            "faisabilite": "COND",
            "prerequis": "Écran MIB avec lecteur CD/DVD intégré"
          },
          {
            "option": "Verrouiller le bouton d'éjection CD/DVD",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 avec lecteur CD/DVD intégré"
          },
          {
            "option": "Désactiver la fréquence AM",
            "faisabilite": "OUI",
            "prerequis": "Écran multimédia (MIB)"
          },
          {
            "option": "Désactiver MirrorLink",
            "faisabilite": "OUI",
            "prerequis": "Écran MIB2 (service MirrorLink obsolète, non lié au fonctionnement du CarPlay/Android Auto)"
          },
          {
            "option": "Sensibilité du microphone mains libres",
            "faisabilite": "OUI",
            "prerequis": "Système Bluetooth mains libres actif"
          },
          {
            "option": "Facelift : Ambient Light (couleurs) sur MIB / Virtual Cockpit",
            "faisabilite": "COND",
            "prerequis": "Écran MIB2 Facelift + option Ambient Light avec fonction changement de couleur"
          },
          {
            "option": "Facelift : mode Off-Road sur l'écran",
            "faisabilite": "COND",
            "prerequis": "Écran multimédia (MIB2) avec navigation, disponible sur Facelift uniquement"
          }
        ]
      },
      {
        "nom": "Aides à la conduite & châssis",
        "items": [
          {
            "option": "Lane Assist - activation",
            "faisabilite": "COND",
            "prerequis": "Caméra frontale multifonction (option Sign Assist et/ou Light Assist)"
          },
          {
            "option": "Mémoire de la fonction Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Réglages du Lane Assist",
            "faisabilite": "COND",
            "prerequis": "Lane Assist déjà codé et actif"
          },
          {
            "option": "Hill Start Assist (réglage)",
            "faisabilite": "OUI",
            "prerequis": "Fonction ESP de maintien en côte présente sur la majorité des Tiguan 2"
          },
          {
            "option": "Hold Assist (mémoire du bouton Auto Hold)",
            "faisabilite": "COND",
            "prerequis": "Frein de parking électrique avec fonction Auto Hold"
          },
          {
            "option": "Blocage électronique du différentiel (XDS)",
            "faisabilite": "OUI",
            "prerequis": "Fonction XDS de l'ESP présente sur la majorité des Tiguan 2, notamment R-Line"
          },
          {
            "option": "Désactiver l'ESP / mode Sport ESC depuis l'écran",
            "faisabilite": "OUI",
            "prerequis": "Disponible sur Tiguan 2 phase 1 uniquement"
          },
          {
            "option": "Dureté de la direction assistée",
            "faisabilite": "OUI",
            "prerequis": "Direction assistée électrique (EPS)"
          },
          {
            "option": "Sensibilité de l'accélérateur",
            "faisabilite": "OUI",
            "prerequis": "Effet plus marqué sur boîte DSG qu'en boîte manuelle"
          },
          {
            "option": "Séchage des disques de frein (intensité)",
            "faisabilite": "OUI",
            "prerequis": "Fonction d'essuyage des disques par l'ESP présente sur la majorité des Tiguan 2"
          },
          {
            "option": "Désactivation du Start/Stop",
            "faisabilite": "OUI",
            "prerequis": "Système Start/Stop présent (moteurs essence/diesel concernés) ; 1 ligne de codage"
          },
          {
            "option": "Volume du Soundaktor",
            "faisabilite": "COND",
            "prerequis": "Haut-parleur Soundaktor (générateur sonore moteur), présent notamment sur R-Line"
          },
          {
            "option": "Activer l'attelage remorque (retrofit)",
            "faisabilite": "RETROFIT",
            "prerequis": "Attelage remorque installé physiquement ; adaptation dédiée dans le calculateur ESP/BCM"
          },
          {
            "option": "Facelift : réglages du Front Assist",
            "faisabilite": "COND",
            "prerequis": "Radar frontal ACC/Front Assist, disponible sur Facelift"
          },
          {
            "option": "Facelift : ACC par incréments de 1 km/h",
            "faisabilite": "COND",
            "prerequis": "Régulateur adaptatif ACC monté, disponible sur Facelift"
          },
          {
            "option": "Facelift : désactiver la prévention des dépassements par la droite",
            "faisabilite": "COND",
            "prerequis": "Régulateur ACC + Lane Assist montés, disponible sur Facelift"
          }
        ]
      },
      {
        "nom": "Procédures d'entretien / diagnostic (hors options)",
        "items": [
          {
            "option": "Reprogrammer une nouvelle batterie",
            "faisabilite": "ENTRETIEN",
            "prerequis": "À réaliser après tout remplacement de la batterie 12V (gestion de batterie / Bordnetz)"
          },
          {
            "option": "Frein à main électrique en mode maintenance (plaquettes AR)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Frein de parking électrique (EPB) ; nécessaire pour tout remplacement de plaquettes arrière"
          },
          {
            "option": "Calibrage radar ACC (défaut C1103)",
            "faisabilite": "ENTRETIEN",
            "prerequis": "Radar ACC/Front Assist ; requis après dépose du pare-choc avant ou choc/remplacement du radar"
          }
        ]
      }
    ]
  }
};
