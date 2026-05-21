<?php 
include 'header.php'; 
include 'connexion.php';

// bloque acces aux invités
if (!isset($_SESSION['user_id'])) {
    header('Location: auth.php');
    exit;
}

// recup champ BDD
$req = $bdd->query("SELECT DISTINCT champion_id FROM champions_lanes ORDER BY champion_id ASC");
?>
<link rel="stylesheet" href="CSS/tierlist.css">

<main class="tierlist-maker-main">
    <h1>Créateur de Tierlist</h1>
    
    <div id="champion-pool" class="tier-row">
        <h3>Champions disponibles</h3>
        <div class="drop-zone" id="pool">
            <?php 
            while ($row = $req->fetch()) {
                $champ = $row['champion_id'];
                // DataDragon pour images
                $imgUrl = "https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/{$champ}.png";
                echo '<div class="champion-item" data-name="'.$champ.'">
                        <img src="'.$imgUrl.'" alt="'.$champ.'" title="'.$champ.'">
                      </div>';
            }
            ?>
        </div>
    </div>

    <div class="tier-board">
        <div class="tier-row"><div class="label" style="background:#ff7f7f">S</div><div class="drop-zone" data-tier="S"></div></div>
        <div class="tier-row"><div class="label" style="background:#ffbf7f">A</div><div class="drop-zone" data-tier="A"></div></div>
        <div class="tier-row"><div class="label" style="background:#ffff7f">B</div><div class="drop-zone" data-tier="B"></div></div>
        <div class="tier-row"><div class="label" style="background:#7fff7f">C</div><div class="drop-zone" data-tier="C"></div></div>
    </div>

    <button id="save-tierlist" class="btn-auth">PUBLIER MA TIERLIST</button>
</main>

<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
<script>
    // drag & drop
    document.querySelectorAll('.drop-zone').forEach(zone => {
        new Sortable(zone, {
            group: 'shared',
            animation: 150
        });
    });
</script>

<?php include 'footer.php'; ?>