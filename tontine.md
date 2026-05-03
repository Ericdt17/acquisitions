# TontineApp

TontineApp est une plateforme SaaS multi-tenant de gestion de tontines (djangui),
destinée aux groupes pratiquant l'épargne collective en Afrique, 
dans la diaspora et dans d'autres communautés.

## Qu'est-ce qu'une tontine ?

Une tontine est un système d'épargne collective où chaque membre cotise 
une somme fixe chaque mois. La totalité de la cagnotte est remise à un 
membre différent à chaque cycle, jusqu'à ce que tous aient bénéficié du système.

## Le problème qu'on résout

Aujourd'hui, la majorité des tontines sont gérées sur papier, 
via WhatsApp ou des tableurs Excel. Cela entraîne :
- Des erreurs de calcul
- Un manque de transparence entre membres
- Aucune traçabilité des transactions
- Des conflits liés à la gestion informelle

## Ce que fait TontineApp

TontineApp digitalise et automatise la gestion complète d'une tontine :

- **Cotisations** — suivi des paiements, cagnotte automatique, 
  ordre des bénéficiaires défini par l'admin, pénalités configurables
- **Épargne individuelle** — dépôts libres mensuels, calcul automatique 
  des intérêts (simples ou composés), solde en temps réel, 
  retrait en fin de cycle
- **Prêts internes** — emprunts depuis l'épargne collective, 
  taux et durées configurables, suivi des remboursements
- **Caisse de secours** — fonds d'urgence collectif, 
  décaissements validés par l'admin

## Architecture

Chaque tontine est un **tenant indépendant** avec ses propres règles,
ses propres membres et ses propres données — complètement isolées 
des autres tontines sur la plateforme.

### Rôles
| Rôle | Périmètre |
|------|-----------|
| Super Admin | Gère la plateforme globale, onboarde les tontines |
| Admin Tontine | Configure les règles, gère les membres, valide les paiements |
| Trésorier | Valide les cotisations, gère les prêts |
| Membre | Cotise, épargne, emprunte, consulte le tableau de bord |

## Valeur ajoutée

- Transparence totale — tous les membres voient toutes les activités
- Calculs financiers automatisés et précis
- Notifications email automatiques (rappels, confirmations, alertes)
- Score de fiabilité par membre basé sur l'historique
- Onboarding d'une tontine existante avec saisie de l'historique complet

## Stack technique (V1)

- Frontend : React / Next.js
- Backend : Node.js / PostgreSQL
- Auth : JWT + RBAC
- Emails : SendGrid / Mailgun
- Hébergement : Europe (conformité RGPD)

## Roadmap

- **V1** — Site web, gestion complète cotisations/épargne/prêts/caisse
- **V2** — Application mobile, intégration Orange Money / MTN MoMo
- **V3** — Score de confiance financière, micro-finance communautaire

---
