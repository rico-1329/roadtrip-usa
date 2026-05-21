# 🗺 Road Trip USA — Été 2026

Application web single-file de gestion de road trip, déployée sur GitHub Pages.

**URL** : https://rico-1329.github.io/roadtrip-usa  
**Version** : v2.9.4 · 21/05/26  
**Stack** : HTML / CSS / JS pur · Leaflet.js · Supabase

---

## 📋 Fonctionnalités

### Timeline
- Affichage chronologique de toutes les étapes du voyage (hôtels, trajets, vols, location voiture)
- Filtres : à partir d'aujourd'hui / tout le voyage, type d'étape (hôtels, visites, trajets, petit-déj), alertes (urgent, manquant, info), recherche texte
- Mode plein écran
- Séparateurs journaliers avec numéro de jour (J+0, J+1…)

### Fiches hôtel
Chaque étape hôtel dispose d'une fiche complète avec :
- **Dates & horaires** : check-in / check-out
- **Adresses** : hôtel et départ
- **GPS** : coordonnées format `N 044° 39.838, W 111° 05.999` avec validation et lien Google Maps automatique
- **Réservation** : numéro, téléphone, date d'annulation
- **Dépôt de garantie** : statut (en attente / versé / restitué), montant, mode, dates
- **Finances** : budget, règlements multiples (acompte / paiement), historique avec traçabilité des suppressions
- **🅿️ Parking** : disponible / gratuit / payant (tarif €/nuit), note, commentaire
- **📶 Wifi** : disponible / gratuit / payant (tarif), note, commentaire
- **Liens utiles** : site hôtel, TripAdvisor, Google Maps…
- **Images** : photos de l'hôtel (max 3 Mo)
- **📑 Documents PDF** : upload vers Supabase Storage (PDF, JPG, PNG, max 20 Mo), visualisation plein écran, suppression
- **Points d'intérêt** : restaurants, musées, activités avec emoji personnalisable
- **Alertes** : éditables (ajout, modification, suppression)
- **Validation** : case à cocher + date de confirmation

### Fiches trajet
- Carte Leaflet avec tracé du parcours
- Heures de départ / arrivée
- Adresses précises
- Notes

### Fiches vols
- Détail par segment (num vol, aéroport, horaires, appareil, repas)
- Carte d'embarquement / QR code par segment
- Surveillance vols Lufthansa (liens directs statut, FlightAware, MAE)
- Finances

### Fiches location voiture
- Références contrat (Budget), contacts d'urgence
- Documents à présenter
- Finances

### Vues supplémentaires
| Vue | Description |
|-----|-------------|
| 🗺 **Map** | Carte Leaflet interactive avec tous les marqueurs numérotés, liste filtrée, tracé du parcours |
| 🧭 **Map Pro** | Vue expérimentale plein écran avec timeline horizontale et panneau fiche flottant |
| 🎫 **Réservations** | Tableau de bord statuts (vols, voiture, hôtels, activités) avec système de votes par participant |
| 💰 **Budget** | Récapitulatif budgété / réglé / reste par étape |
| 🤝 **Compte Amis** | Calcul des soldes, virements à effectuer, remboursements, journal exportable CSV |
| ✅ **Checklist** | Suivi des démarches (ESTA, passeports…) par participant avec pièces jointes |
| 💬 **Chat** | Messagerie interne par discussions, avec pièces jointes |
| ⚙️ **Administration** | Sauvegardes / restauration Supabase, réinitialisation (admin uniquement) |

---

## 🏗 Architecture

### Fichier unique
Tout le code tient dans un seul fichier `index.html` (~650 Ko) :
- CSS inline dans `<style>`
- JS inline dans `<script>`
- HTML statique pour la timeline (généré au build)
- JS dynamique pour les vues (Map, Compte Amis, etc.)

### Données
```
localStorage          ← cache local (fiches, préférences)
     ↕
Supabase (PostgreSQL) ← source de vérité distante
     ↕
Supabase Storage      ← fichiers PDF/images (bucket roadtrip-docs)
```

**Table Supabase** : `fiches` (id TEXT, data JSONB, updated_at TIMESTAMPTZ)  
**Clés** : `roadtrip_fiche_{idx}` pour chaque étape, clés spéciales pour vols/voiture/chat/checklist…

### Authentification
Supabase Auth (email + mot de passe). Rôle admin réservé à `bernarderic29@gmail.com`.

---

## ⚙️ Configuration

### Variables à modifier dans `index.html`

```javascript
const SUPA_URL = 'https://jgcrixldoujrefdwmjjx.supabase.co';
const SUPA_KEY = 'eyJ...';  // Clé anon Supabase
```

### Supabase Storage — Policies RLS requises

Le bucket `roadtrip-docs` doit être **Public** avec les 3 policies suivantes :

```sql
-- Upload
CREATE POLICY "allow_anon_upload" ON storage.objects
FOR INSERT TO anon WITH CHECK (bucket_id = 'roadtrip-docs');

-- Lecture
CREATE POLICY "allow_anon_select" ON storage.objects
FOR SELECT TO anon USING (bucket_id = 'roadtrip-docs');

-- Suppression
CREATE POLICY "allow_anon_delete" ON storage.objects
FOR DELETE TO anon USING (bucket_id = 'roadtrip-docs');
```

---

## 🚀 Déploiement

Le site est déployé automatiquement sur **GitHub Pages** à chaque push sur `main`.

### Mise à jour via PowerShell

```powershell
# Dans le dossier du repo cloné
Copy-Item "$env:USERPROFILE\Downloads\index.html" -Destination ".\index.html" -Force
git add index.html
git commit -m "v2.9.x - Description des changements"
git push origin main
```

### Mise à jour via GitHub (interface web)

1. Repo → **Add file → Upload files**
2. Glisser-déposer `index.html`
3. **Commit changes**

---

## 📦 Dépendances CDN

```html
<!-- Leaflet.js (cartes) -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Supabase JS -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
```

---

## 🗂 Historique des versions

| Version | Date | Changements |
|---------|------|-------------|
| v2.9.4 | 21/05/26 | Commentaire parking + section Wifi (gratuit/payant/commentaire) |
| v2.9.3 | 21/05/26 | Parking dans fiches hôtel (case à cocher, gratuit/payant, tarif, commentaire) |
| v2.9.2 | 21/05/26 | Champ GPS dans fiches hôtel avec validation et lien Google Maps |
| v2.9.1 | 21/05/26 | Fix filtre Hôtels dans la timeline |
| v2.9 | 21/05/26 | Documents PDF dans fiches hôtel (Supabase Storage) |
| v2.8 | 17/05/26 | Fix sous-titre modale (hotelName prioritaire) |
| v2.7 | 17/05/26 | Nom d'hôtel éditable dans fiche |
| v2.6 | 17/05/26 | Fix titre timeline + alertes en doublon |
| v2.5 | 17/05/26 | Alertes éditables dans les fiches |
| v2.4 | 17/05/26 | Fix titre fiche (_customTitle prioritaire) |
| v2.3 | 17/05/26 | Dépôt de garantie dans fiches hôtel |
| v2.2 | 27/04/26 | Fix navigation et overlays |
| v2.1 | 28/04/26 | Map Pro, Checklist, Chat, Logs, Réservations |
| v2.0 | 25/04/26 | Compte Amis, remboursements, FAB, journal exportable |
| v1.9 | 23/04/26 | Carte Map Leaflet, navigation Préc/Suiv |
| v1.8 | 23/04/26 | Vue Map inline, menu Budget/Réservations |
| v1.0–1.7 | 22–23/04/26 | Version initiale → filtres, modales, Supabase, paiements |

---

## 👥 Participants

| Nom | Email |
|-----|-------|
| Éric | bernarderic29@gmail.com |
| Pascale | pascale.cervoni@hotmail.fr |
| Carole | carole.carlino@free.fr |
| Léa | (compte Carole) |

---

## ✈️ Voyage

**Dates** : 28 juillet → 21 août 2026  
**Itinéraire** : MRS → JAC → Yellowstone → Moab → Monument Valley → Page → Bryce Canyon → Kanab → Grand Canyon → Las Vegas → Death Valley → Los Angeles → Solvang → Monterey → SFO → MRS  
**Vols** : Lufthansa · Réf. ZKUZPE  
**Voiture** : Budget · Réf. 35554355FR4 · JAC → SFO
