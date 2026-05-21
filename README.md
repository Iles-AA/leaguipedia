# Leaguipedia

Site web dédié à l'univers de League of Legends : encyclopédie des champions, tier list personnalisée, suivi de l'actualité e-sport et espace membre.

🌐 **URL du site** : [https://aitabbailes.alwaysdata.net/](https://aitabbailes.alwaysdata.net/)

---

## Fonctionnalités

- **Champions** : recherche et filtrage par rôle (Top, Jungle, Mid, ADC, Support) via l'API Riot DataDragon
- **Tier list** : création et sauvegarde d'une tier list personnalisée par drag & drop
- **E-Sport** : résultats et matchs en direct (LEC, LCS, LCK, LPL) via l'API LoL Esports
- **Espace membre** : inscription, connexion, profil personnalisable (pseudo, rang, bio, avatar)
- **Accès restreint** : tier list et profil accessibles aux utilisateurs connectés uniquement

---

## Technologies utilisées

- **Front-end** : HTML5, CSS3, JavaScript
- **Back-end** : PHP 8, PDO
- **Base de données** : MySQL
- **Hébergeur** : AlwaysData (hébergeur écoresponsable)

---

## Sources des données

### API Riot DataDragon
- **Usage** : images des champions, noms, versions du jeu
- **URL** : https://ddragon.leagueoflegends.com/
- **Licence** : données fournies par Riot Games — utilisation soumise aux [conditions d'utilisation de Riot Games](https://www.riotgames.com/en/terms-of-service)
- *Leaguipedia n'est pas affilié à Riot Games.*

### API LoL Esports
- **Usage** : matchs en direct, résultats, ligues (LEC, LCS, LCK, LPL)
- **URL** : https://esports-api.lolesports.com/
- **Licence** : API publique Riot Games — utilisation soumise aux [conditions d'utilisation de Riot Games](https://www.riotgames.com/en/terms-of-service)

### Données internes (base de données)
- Table `champions_lanes` : association champion / rôle constituée manuellement à partir des données DataDragon
- Table `leagues` : ligues e-sport renseignées manuellement

---

## Structure de la base de données

| Table | Description |
|---|---|
| `users` | Comptes utilisateurs (identifiants, profil, avatar) |
| `sessions` | Tokens de session persistants |
| `champions_lanes` | Association champion ↔ rôle |
| `favorites` | Champions favoris par utilisateur |
| `user_tierlists` | Tier lists sauvegardées par utilisateur |
| `tierlist_comments` | Commentaires sur les tier lists |
| `leagues` | Ligues e-sport référencées |

---

## Sécurité

- Mots de passe stockés hashés avec `password_hash()` (bcrypt)
- Requêtes SQL préparées via PDO (protection contre les injections SQL)
- Fichier de configuration de la base de données (`connexion.php`) exclu du versionnement via `.gitignore`
- Sessions PHP sécurisées

---

## Auteur

**Ait Abbailes** — Projet réalisé dans le cadre d'une EC à l'ESIEE-IT (2025-2026)
