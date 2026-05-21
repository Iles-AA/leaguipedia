<?php include 'header.php'; ?>

<div class="search-section">
    <input type="text" id="search-bar" placeholder="RECHERCHER UN CHAMPION...">
</div>

<div class="role-filters">
    <button class="role-btn active" data-lane="all">Tous</button>
    <button class="role-btn" data-lane="top">Top Lane</button>
    <button class="role-btn" data-lane="jungle">Jungle</button>
    <button class="role-btn" data-lane="mid">Mid Lane</button>
    <button class="role-btn" data-lane="adc">ADC</button>
    <button class="role-btn" data-lane="support">Support</button>
</div>

<div class="champions-count" id="count-display">Chargement...</div>

<main class="champions-container" id="champions-grid">
    <div class="loading-screen" style="grid-column:1/-1">
        <div class="loading-spin"></div>
        <div class="loading-text">Connexion à l'API Riot Games</div>
    </div>
</main>

<script src="JS/api.js"></script>
<script src="JS/champions.js?v=2"></script>

<?php include 'footer.php'; ?>