
CREATE DATABASE IF NOT EXISTS leaguipedia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE leaguipedia;


CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, username VARCHAR(30) NOT NULL, email VARCHAR(255) NOT NULL, password_hash VARCHAR(255) NOT NULL, rank VARCHAR(50) DEFAULT NULL, role VARCHAR(50) DEFAULT NULL, bio VARCHAR(200) DEFAULT NULL, avatar MEDIUMTEXT DEFAULT NULL, banner_champ VARCHAR(60) DEFAULT NULL, accent_color VARCHAR(7) DEFAULT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (id), UNIQUE KEY uq_users_username (username), UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, user_id INT UNSIGNED NOT NULL, token_hash VARCHAR(255) NOT NULL, remember TINYINT(1) NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME NOT NULL, PRIMARY KEY (id), UNIQUE KEY uq_sessions_token (token_hash), CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS champions_lanes (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, champion_id VARCHAR(60) NOT NULL, lane ENUM('top','jungle','mid','adc','support') NOT NULL, PRIMARY KEY (id), UNIQUE KEY uq_champ_lane (champion_id, lane)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, user_id INT UNSIGNED NOT NULL, champion_id VARCHAR(60) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), UNIQUE KEY uq_fav_user_champ (user_id, champion_id), CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_tierlists (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, user_id INT UNSIGNED NOT NULL, title VARCHAR(100) NOT NULL, layout_json JSON NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), CONSTRAINT fk_user_tl FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tierlist_comments (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, tierlist_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL, comment TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), CONSTRAINT fk_tl_comment FOREIGN KEY (tierlist_id) REFERENCES user_tierlists(id) ON DELETE CASCADE, CONSTRAINT fk_user_comment FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leagues (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, ext_id VARCHAR(30) DEFAULT NULL, name VARCHAR(80) NOT NULL, region VARCHAR(80) DEFAULT NULL, color VARCHAR(7) DEFAULT NULL, logo_url VARCHAR(512) DEFAULT NULL, PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT IGNORE INTO champions_lanes (champion_id, lane) VALUES 
('Aatrox','top'),('Ahri','mid'),('Akali','mid'),('Akshan','mid'),('Alistar','support'),('Ambessa','top'),('Amumu','jungle'),('Anivia','mid'),('Annie','mid'),('Aphelios','adc'),('Ashe','adc'),('AurelionSol','mid'),('Azir','mid'),('Bard','support'),('Belveth','jungle'),('Blitzcrank','support'),('Brand','mid'),('Braum','support'),('Briar','jungle'),('Caitlyn','adc'),('Camille','top'),('Cassiopeia','mid'),('ChoGath','top'),('Corki','mid'),('Darius','top'),('Diana','jungle'),('DrMundo','top'),('Draven','adc'),('Ekko','jungle'),('Elise','jungle'),('Evelynn','jungle'),('Ezreal','adc'),('Fiddlesticks','jungle'),('Fiora','top'),('Fizz','mid'),('Galio','mid'),('Gangplank','top'),('Garen','top'),('Gnar','top'),('Gragas','jungle'),('Graves','jungle'),('Gwen','top'),('Hecarim','jungle'),('Heimerdinger','mid'),('Hwei','mid'),('Illaoi','top'),('Irelia','top'),('Ivern','jungle'),('Janna','support'),('JarvanIV','jungle'),('Jax','top'),('Jayce','top'),('Jhin','adc'),('Jinx','adc'),('KSante','top'),('KaiSa','adc'),('Kalista','adc'),('Karma','support'),('Karthus','jungle'),('Kassadin','mid'),('Katarina','mid'),('Kayle','top'),('Kayn','jungle'),('Kennen','top'),('Khazix','jungle'),('Kindred','jungle'),('Kled','top'),('KogMaw','adc'),('LeBlanc','mid'),('LeeSin','jungle'),('Leona','support'),('Lillia','jungle'),('Lissandra','mid'),('Lucian','adc'),('Lulu','support'),('Lux','mid'),('Malphite','top'),('Malzahar','mid'),('Maokai','jungle'),('MasterYi','jungle'),('Milio','support'),('MissFortune','adc'),('Mordekaiser','top'),('Morgana','support'),('Naafiri','mid'),('Nami','support'),('Nasus','top'),('Nautilus','support'),('Neeko','mid'),('Nidalee','jungle'),('Nilah','adc'),('Nocturne','jungle'),('Nunu','jungle'),('Olaf','jungle'),('Orianna','mid'),('Ornn','top'),('Pantheon','top'),('Poppy','jungle'),('Pyke','support'),('Qiyana','mid'),('Quinn','top'),('Rakan','support'),('Rammus','jungle'),('RekSai','jungle'),('Rell','support'),('Renata','support'),('Renekton','top'),('Rengar','jungle'),('Riven','top'),('Rumble','top'),('Ryze','mid'),('Samira','adc'),('Sejuani','jungle'),('Senna','support'),('Seraphine','support'),('Sett','top'),('Shaco','jungle'),('Shen','top'),('Shyvana','jungle'),('Singed','top'),('Sion','top'),('Sivir','adc'),('Skarner','jungle'),('Smolder','adc'),('Sona','support'),('Soraka','support'),('Swain','mid'),('Sylas','mid'),('Syndra','mid'),('TahmKench','support'),('Taliyah','mid'),('Talon','mid'),('Taric','support'),('Teemo','top'),('Thresh','support'),('Tristana','adc'),('Trundle','jungle'),('Tryndamere','top'),('TwistedFate','mid'),('Twitch','adc'),('Udyr','jungle'),('Urgot','top'),('Varus','adc'),('Vayne','adc'),('Veigar','mid'),('Velkoz','mid'),('Vex','mid'),('Vi','jungle'),('Viego','jungle'),('Viktor','mid'),('Vladimir','mid'),('Volibear','jungle'),('Warwick','jungle'),('Wukong','jungle'),('Xayah','adc'),('Xerath','mid'),('XinZhao','jungle'),('Yasuo','mid'),('Yone','mid'),('Yorick','top'),('Yuumi','support'),('Zac','jungle'),('Zed','mid'),('Zeri','adc'),('Ziggs','mid'),('Zilean','support'),('Zoe','mid'),('Zyra','support');

INSERT IGNORE INTO leagues (ext_id, name, region, color) VALUES
('98767991299243165', 'LEC', 'EMEA', '#0bc4e3'),
('98767991302996019', 'LCS', 'North America', '#e84057'),
('98767991310872058', 'LCK', 'Korea', '#1ea75a'),
('98767991314006698', 'LPL', 'China', '#f0a30a');