<?php include 'header.php'; ?>

<main class="esport-main">
    <h1 class="page-title">E-SPORT <span class="gold">LOL</span></h1>

    <div class="league-tabs" id="league-tabs">
        <button class="league-tab active" data-league="all">Toutes</button>
        <button class="league-tab" data-league="98767991299243165">LEC</button>
        <button class="league-tab" data-league="98767991302996019">LCS</button>
        <button class="league-tab" data-league="98767991310872058">LCK</button>
        <button class="league-tab" data-league="98767991314006698">LPL</button>
        <button class="league-tab" data-league="101382741235120470">Worlds</button>
        <button class="league-tab" data-league="105266103462388553">MSI</button>
    </div>

    <div class="status-tabs">
        <button class="status-tab active" data-status="live">🔴 Live</button>
        <button class="status-tab" data-status="upcoming">À venir</button>
        <button class="status-tab" data-status="completed">Résultats</button>
    </div>

    <div class="esport-content" id="esport-content">
        <div class="loading-screen">
            <div class="loading-spin"></div>
            <div class="loading-text">Connexion à l'API LoL Esports</div>
        </div>
    </div>
</main>

<script src="JS/esport.js"></script>

<?php include 'footer.php'; ?>