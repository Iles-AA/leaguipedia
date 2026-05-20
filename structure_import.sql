-- =============================================================
--  LEAGUIPEDIA — structure.sql
--  Base de données complète du projet
--  Moteur : MySQL / MariaDB
-- =============================================================



-- =============================================================
--  TABLE : users
--  Comptes utilisateurs (auth + profil)
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    username      VARCHAR(30)     NOT NULL,          -- 3-30 cars, [a-zA-Z0-9_]
    email         VARCHAR(255)    NOT NULL,
    password_hash VARCHAR(255)    NOT NULL,          -- bcrypt
    -- Profil visible
    rank          VARCHAR(50)     DEFAULT NULL,      -- ex. "Gold II", "Diamond I"
    role          VARCHAR(50)     DEFAULT NULL,      -- ex. "ADC", "Support"
    bio           VARCHAR(200)    DEFAULT NULL,
    avatar        MEDIUMTEXT      DEFAULT NULL,      -- data-URL base64 (max ~2 Mo)
    -- Apparence
    banner_champ  VARCHAR(60)     DEFAULT NULL,      -- ID champion Data Dragon, ex. "Ahri"
    accent_color  VARCHAR(7)      DEFAULT NULL,      -- code hex, ex. "#c8aa6e"
    -- Dates
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--  TABLE : sessions
--  Tokens JWT / session (pour invalidation côté serveur)
-- =============================================================
CREATE TABLE IF NOT EXISTS sessions (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id    INT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,               -- hash SHA-256 du JWT
    remember   TINYINT(1)   NOT NULL DEFAULT 0,    -- 1 = localStorage, 0 = sessionStorage
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME     NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_sessions_token (token_hash),
    INDEX      idx_sessions_user (user_id),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--  TABLE : champions_lanes
--  Association champion ↔ lane (rôle joué sur la carte)
--  Source d'autorité : back-end (populée manuellement / via script)
--  Consultée par /api/champions/lanes
-- =============================================================
CREATE TABLE IF NOT EXISTS champions_lanes (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    champion_id VARCHAR(60)  NOT NULL,              -- ID Data Dragon, ex. "Ahri", "LeeSin"
    lane        ENUM('top','jungle','mid','adc','support') NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_champ_lane (champion_id, lane),
    INDEX      idx_cl_lane   (lane)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--  TABLE : favorites
--  Champions mis en favoris par un utilisateur
--  Route : GET/POST/DELETE /api/favorites/:championId
-- =============================================================
CREATE TABLE IF NOT EXISTS favorites (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED NOT NULL,
    champion_id VARCHAR(60)  NOT NULL,              -- ID Data Dragon
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_fav_user_champ (user_id, champion_id),
    INDEX      idx_fav_user      (user_id),

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--  TABLE : tierlists
--  Placement d'un champion dans la tier list personnelle
--  Tiers : S > A > B > C > D
--  Route : GET /api/tierlist
--          PUT /api/tierlist/:championId   { tier, note }
--          DELETE /api/tierlist/:championId
-- =============================================================
CREATE TABLE IF NOT EXISTS tierlists (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED  NOT NULL,
    champion_id VARCHAR(60)   NOT NULL,
    tier        ENUM('S','A','B','C','D') NOT NULL,
    note        VARCHAR(300)  DEFAULT NULL,         -- commentaire optionnel
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_tl_user_champ (user_id, champion_id),
    INDEX      idx_tl_user      (user_id),
    INDEX      idx_tl_tier      (tier),

    CONSTRAINT fk_tierlists_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--  TABLE : leagues
--  Ligues e-sport stockées en BDD (enrichies depuis l'API LoL Esports)
--  Route : GET /api/leagues
-- =============================================================
CREATE TABLE IF NOT EXISTS leagues (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ext_id     VARCHAR(30)  DEFAULT NULL,           -- ID externe (LoL Esports API)
    name       VARCHAR(80)  NOT NULL,               -- ex. "LEC", "LCS", "Worlds"
    region     VARCHAR(80)  DEFAULT NULL,           -- ex. "EMEA", "NA", "International"
    color      VARCHAR(7)   DEFAULT NULL,           -- couleur hex d'accentuation, ex. "#0bc4e3"
    logo_url   VARCHAR(512) DEFAULT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_leagues_name   (name),
    UNIQUE KEY uq_leagues_ext_id (ext_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--  DONNÉES INITIALES
-- =============================================================

-- Lanes par défaut (quelques exemples représentatifs)
INSERT IGNORE INTO champions_lanes (champion_id, lane) VALUES
    -- Top
    ('Darius',   'top'),    ('Garen',    'top'),    ('Fiora',    'top'),
    ('Irelia',   'top'),    ('Camille',  'top'),    ('Malphite', 'top'),
    ('Shen',     'top'),    ('Ornn',     'top'),    ('Gnar',     'top'),
    ('Jayce',    'top'),    ('Renekton', 'top'),    ('Ambessa',  'top'),
    -- Jungle
    ('LeeSin',   'jungle'), ('Hecarim',  'jungle'), ('Khazix',   'jungle'),
    ('Kayn',     'jungle'), ('Rengar',   'jungle'), ('Viego',    'jungle'),
    ('Elise',    'jungle'), ('Nidalee',  'jungle'), ('Vi',       'jungle'),
    ('RekSai',   'jungle'), ('Ekko',     'jungle'), ('Shyvana',  'jungle'),
    -- Mid
    ('Ahri',     'mid'),    ('Zed',      'mid'),    ('Yasuo',    'mid'),
    ('Yone',     'mid'),    ('Lux',      'mid'),    ('Orianna',  'mid'),
    ('Syndra',   'mid'),    ('Viktor',   'mid'),    ('Cassiopeia','mid'),
    ('Katarina', 'mid'),    ('Ekko',     'mid'),    ('Sylas',    'mid'),
    -- ADC
    ('Jinx',     'adc'),    ('Caitlyn',  'adc'),    ('Ezreal',   'adc'),
    ('Jhin',     'adc'),    ('Vayne',    'adc'),    ('Kaisa',    'adc'),
    ('Varus',    'adc'),    ('Samira',   'adc'),    ('Xayah',    'adc'),
    ('Draven',   'adc'),    ('Lucian',   'adc'),    ('MissFortune','adc'),
    -- Support
    ('Thresh',   'support'),('Lulu',     'support'),('Nautilus', 'support'),
    ('Soraka',   'support'),('Leona',    'support'),('Blitzcrank','support'),
    ('Nami',     'support'),('Morgana',  'support'),('Rakan',    'support'),
    ('Karma',    'support'),('Senna',    'support'),('Yuumi',    'support');

-- Ligues e-sport principales
INSERT IGNORE INTO leagues (ext_id, name, region, color) VALUES
    ('98767991299243165', 'LEC',    'EMEA',          '#0bc4e3'),
    ('98767991302996019', 'LCS',    'North America',  '#e84057'),
    ('98767991310872058', 'LCK',    'Korea',          '#1ea75a'),
    ('98767991314006698', 'LPL',    'China',          '#f0a30a'),
    (NULL,                'Worlds', 'International',  '#c8aa6e'),
    (NULL,                'MSI',    'International',  '#9b59b6');
