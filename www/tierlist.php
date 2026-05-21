<?php
include 'connexion.php';
include 'header.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: auth.php');
    exit;
}

$req  = $bdd->query("SELECT DISTINCT champion_id FROM champions_lanes ORDER BY champion_id ASC");
$champions = $req->fetchAll(PDO::FETCH_COLUMN);
?>

<main class="tierlist-maker-main">

    <div class="tierlist-header">
        <h1>CRÉATEUR DE <span class="gold">TIERLIST</span></h1>
        <p class="tierlist-sub">Glisse les champions dans les tiers, puis sauvegarde ta liste</p>
    </div>

    <div class="saved-tierlists-wrap">
        <div class="saved-tierlists-header">
            <h2>MES TIERLISTS</h2>
            <span id="tl-count" class="tl-count">—</span>
        </div>
        <div id="saved-tierlists-list" class="saved-tierlists-list">
            <div class="tl-loading">Chargement...</div>
        </div>
    </div>

    <!-- ÉDITEUR -->
    <div class="tierlist-editor" id="tierlist-editor">

        <div class="editor-topbar">
            <input type="text" id="tl-title" placeholder="TITRE DE MA TIERLIST..." maxlength="100" value="Ma Tierlist">
            <div class="editor-actions">
                <button id="btn-reset-editor" class="btn-secondary">RÉINITIALISER</button>
                <button id="btn-save" class="btn-auth">SAUVEGARDER</button>
            </div>
        </div>

        <div id="feedback-tl" class="tl-feedback"></div>

        <div class="tier-board" id="tier-board">
            <div class="tier-row">
                <div class="label" style="background:#ff4655">S</div>
                <div class="drop-zone" data-tier="S" id="tier-S"></div>
            </div>
            <div class="tier-row">
                <div class="label" style="background:#ff9a3c">A</div>
                <div class="drop-zone" data-tier="A" id="tier-A"></div>
            </div>
            <div class="tier-row">
                <div class="label" style="background:#f0e36a">B</div>
                <div class="drop-zone" data-tier="B" id="tier-B"></div>
            </div>
            <div class="tier-row">
                <div class="label" style="background:#5a8a3c">C</div>
                <div class="drop-zone" data-tier="C" id="tier-C"></div>
            </div>
            <div class="tier-row">
                <div class="label" style="background:#5b7fcb">D</div>
                <div class="drop-zone" data-tier="D" id="tier-D"></div>
            </div>
        </div>

        <div class="pool-section">
            <div class="pool-header">
                <span>POOL — Champions disponibles</span>
                <input type="text" id="pool-search" placeholder="Rechercher..." class="pool-search">
            </div>
            <div class="drop-zone" id="pool">
                <?php foreach ($champions as $champ): ?>
                <div class="champion-item" data-name="<?= htmlspecialchars($champ) ?>">
                    <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/<?= htmlspecialchars($champ) ?>_0.jpg"
                         alt="<?= htmlspecialchars($champ) ?>"
                         title="<?= htmlspecialchars($champ) ?>">
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</main>

<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
<script src="JS/tierlist.js"></script>

<?php include 'footer.php'; ?>
