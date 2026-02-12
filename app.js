// ========================================
// NUTRI-GÈNES - APPLICATION GÉNÉTIQUE
// ========================================

// Configuration de l'API OpenRouter
const OPENROUTER_API_KEY = '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'; // ⚠️ Remplacez par votre clé API
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Liste des modèles par ordre de priorité (fallback automatique)
const MODELES_FALLBACK = [
    'tngtech/deepseek-r1t-chimera:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'arcee-ai/trinity-large-preview:free',
    'arcee-ai/trinity-mini:free',
    'anthropic/claude-3.5-sonnet' // Dernier recours (payant)
];

// Descriptions détaillées des gènes
const DESCRIPTIONS = {
    apoe4: {
        titre: "🧠 APOE4 — Le Cueilleur",
        soustitre: "Biologie de la vigilance",
        description: "Le Cueilleur est programmé pour survivre dans un environnement imprévisible. Son génome privilégie la réactivité, la rapidité d'adaptation et la détection du danger. Son métabolisme lipidique est exigeant : il tolère mal les excès modernes, mais excelle dans des contextes sobres, naturels et structurés.",
        points: [
            "Un corps performant quand l'environnement est maîtrisé.",
            "Une biologie puissante, mais sensible à l'inflammation chronique."
        ]
    },
    apoe3: {
        titre: "🌾 APOE3 — L'Agriculteur",
        soustitre: "Biologie de l'équilibre",
        description: "L'Agriculteur représente la norme adaptative humaine. Son génome gère efficacement la diversité alimentaire, le stockage énergétique et la stabilité métabolique. Ni extrême, ni fragile : il s'adapte à presque tout… mais n'optimise rien par défaut.",
        points: [
            "Une biologie polyvalente.",
            "Le terrain idéal pour une optimisation progressive."
        ]
    },
    apoe2: {
        titre: "🐄 APOE2 — L'Éleveur",
        soustitre: "Biologie de la protection",
        description: "L'Éleveur est doté d'un génome orienté vers la gestion efficace des lipides et la protection neuronale. Il stocke mieux, récupère plus facilement et résiste mieux au vieillissement cérébral, mais peut devenir vulnérable dans un environnement trop riche en sucres rapides.",
        points: [
            "Une biologie résiliente.",
            "Performante sur la durée, si bien guidée."
        ]
    },
    dio2_positif: {
        titre: "🔥 DIO2 positif — Le Thermorégulateur",
        soustitre: "Biologie de l'énergie fluide",
        description: "Ce profil convertit efficacement les hormones thyroïdiennes. Résultat : énergie stable, bonne tolérance au froid, métabolisme réactif.",
        points: [
            "Un moteur bien réglé, prêt à répondre aux variations de l'environnement."
        ]
    },
    dio2_negatif: {
        titre: "🧊 DIO2 négatif — L'Économe",
        soustitre: "Biologie de la sobriété",
        description: "Ici, le corps limite volontairement la dépense énergétique. Ce génome est adapté aux périodes de pénurie, mais peut souffrir dans un monde de stress constant et de restriction mal gérée.",
        points: [
            "Une biologie prudente.",
            "L'optimisation passe par la régularité, pas l'excès."
        ]
    },
    amy1a_positif: {
        titre: "🍞 AMY1A positif — Le Transformateur",
        soustitre: "Biologie de l'amidon",
        description: "Ce profil produit beaucoup d'amylase salivaire. Il digère les glucides complexes rapidement et efficacement. Historiquement adapté aux sociétés agricoles.",
        points: [
            "Les féculents sont une ressource, pas une menace.",
            "Le danger vient surtout des sucres ultra-transformés."
        ]
    },
    amy1a_negatif: {
        titre: "🥩 AMY1A négatif — Le Sélectif",
        soustitre: "Biologie du carburant dense",
        description: "Ici, les glucides sont moins bien gérés. Les pics glycémiques sont plus marqués. En revanche, les lipides et protéines sont très bien exploités.",
        points: [
            "Une biologie ancestrale.",
            "Le raffiné fatigue, le simple nourrit."
        ]
    },
    fut2_positif: {
        titre: "🦠 FUT2 positif — Le Symbiotique",
        soustitre: "Biologie de la coopération microbienne",
        description: "Ce génome favorise un microbiote riche et diversifié. Fibres, végétaux, prébiotiques : le système digestif travaille en équipe.",
        points: [
            "Intestin résilient.",
            "Forte capacité d'adaptation alimentaire."
        ]
    },
    fut2_negatif: {
        titre: "🛡️ FUT2 négatif — Le Gardien",
        soustitre: "Biologie de la défense",
        description: "Le Gardien limite volontairement certaines interactions microbiennes. Moins de diversité, mais une protection accrue contre certains agents pathogènes.",
        points: [
            "Digestion plus sensible.",
            "Immunité prioritaire sur la flexibilité."
        ]
    }
};

// Sélectionner les éléments du DOM
const form = document.getElementById('paysForm');
const btnValider = document.getElementById('btnValider');
const btnRetour = document.getElementById('btnRetour');
const divChargement = document.getElementById('chargement');
const inputPays = document.getElementById('paysInput');
const pageAccueil = document.getElementById('pageAccueil');
const pageResultats = document.getElementById('pageResultats');

// Variables pour les graphiques
let chartAPOE, chartDIO2, chartAMY1A, chartFUT2;

// Écouter la soumission du formulaire
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const pays = inputPays.value.trim();
    
    if (!pays) {
        alert('Veuillez entrer un pays');
        return;
    }
    
    // Afficher le chargement
    afficherChargement();
    
    try {
        await analyserGenetique(pays);
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert('Erreur lors de l\'analyse. Vérifiez votre clé API OpenRouter.');
        cacherChargement();
    }
});

// Bouton retour
btnRetour.addEventListener('click', function() {
    console.log('🔄 Retour à l\'accueil');
    
    // Cacher la page résultats
    pageResultats.style.display = 'none';
    
    // Afficher la page d'accueil
    pageAccueil.style.display = 'flex';
    
    // Réinitialiser le formulaire
    inputPays.value = '';
    
    // IMPORTANT: Réafficher le formulaire et cacher le chargement
    form.querySelector('input').style.display = 'block';
    btnValider.style.display = 'block';
    btnValider.disabled = false;
    divChargement.style.display = 'none';
    
    // Détruire les graphiques existants
    if (chartAPOE) chartAPOE.destroy();
    if (chartDIO2) chartDIO2.destroy();
    if (chartAMY1A) chartAMY1A.destroy();
    if (chartFUT2) chartFUT2.destroy();
});

// Fonction principale pour analyser avec système de fallback
async function analyserGenetique(pays) {
    console.log('🧬 Analyse génétique pour:', pays);
    
    // Essayer chaque modèle jusqu'à ce qu'un fonctionne
    for (let i = 0; i < MODELES_FALLBACK.length; i++) {
        const modele = MODELES_FALLBACK[i];
        console.log(`🤖 Tentative ${i + 1}/${MODELES_FALLBACK.length} avec ${modele}`);
        
        try {
            const resultat = await essayerModele(pays, modele);
            
            if (resultat) {
                console.log(`✅ Succès avec le modèle: ${modele}`);
                afficherResultats(resultat, pays);
                return;
            }
        } catch (error) {
            console.warn(`⚠️ Échec avec ${modele}:`, error.message);
            
            // Si c'est le dernier modèle, on lance l'erreur
            if (i === MODELES_FALLBACK.length - 1) {
                throw new Error('Tous les modèles ont échoué. Vérifiez votre clé API.');
            }
            
            // Sinon, on continue avec le modèle suivant
            console.log(`↪️ Passage au modèle suivant...`);
        }
    }
}

// Fonction pour essayer un modèle spécifique
async function essayerModele(pays, modele) {
    // Créer le prompt pour l'IA
    const prompt = `Tu es un expert en génétique des populations. Analyse l'origine "${pays}" et estime les fréquences alléliques réelles pour cette population.

CONTEXTE GÉNÉTIQUE PAR POPULATION:
- Populations africaines: APOE4 plus fréquent (20-30%), AMY1A élevé (haute copie)
- Populations asiatiques: APOE2 plus rare (5-10%), AMY1A très élevé (agriculture du riz)
- Populations européennes: APOE3 dominant (70-80%), AMY1A moyen
- Populations méditerranéennes: APOE4 modéré (10-15%), adaptation régime méditerranéen
- Populations nordiques: DIO2 variant fréquent (adaptation climat froid)
- Populations amérindiennes: Profils spécifiques liés à l'agriculture du maïs

Pour "${pays}", base-toi sur:
1. L'origine géographique et ethnique majoritaire
2. Les études de génétique des populations publiées
3. L'histoire alimentaire et agricole de la région
4. Les adaptations climatiques et environnementales

IMPORTANT: Retourne UNIQUEMENT un objet JSON, sans texte ni explication, au format exact:

{
  "apoe": {
    "apoe4": [pourcentage selon population],
    "apoe3": [pourcentage selon population],
    "apoe2": [pourcentage selon population]
  },
  "dio2": {
    "positif": [pourcentage selon climat/région],
    "negatif": [pourcentage]
  },
  "amy1a": {
    "positif": [pourcentage selon type agriculture],
    "negatif": [pourcentage]
  },
  "fut2": {
    "positif": [pourcentage selon population],
    "negatif": [pourcentage]
  }
}

Chaque gène doit totaliser 100%. Varie significativement les valeurs selon "${pays}".`;

    const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.href,
            'X-Title': 'Nutri-Gènes'
        },
        body: JSON.stringify({
            model: modele,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7, // Plus de variation dans les réponses
            max_tokens: 1500
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur ${response.status}: ${errorData.error?.message || 'Erreur API'}`);
    }

    const data = await response.json();
    console.log('📡 Réponse reçue de', modele);

    // Extraire le contenu
    const contenu = data.choices[0].message.content;
    console.log('📄 Contenu brut:', contenu);

    // Parser le JSON
    const jsonMatch = contenu.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Format de réponse invalide - pas de JSON trouvé');
    }

    const resultat = JSON.parse(jsonMatch[0]);
    
    // Valider que les données sont correctes
    if (!resultat.apoe || !resultat.dio2 || !resultat.amy1a || !resultat.fut2) {
        throw new Error('Données incomplètes dans la réponse');
    }
    
    console.log('🧬 Données génétiques validées:', resultat);
    return resultat;
}

// Fonction pour afficher le chargement
function afficherChargement() {
    btnValider.disabled = true;
    divChargement.style.display = 'block';
    form.querySelector('input').style.display = 'none';
    btnValider.style.display = 'none';
}

// Fonction pour cacher le chargement
function cacherChargement() {
    btnValider.disabled = false;
    divChargement.style.display = 'none';
    form.querySelector('input').style.display = 'block';
    btnValider.style.display = 'block';
}

// Fonction pour afficher les résultats
function afficherResultats(data, pays) {
    console.log(`📊 Affichage des résultats pour: ${pays}`);
    console.log('Données reçues:', JSON.stringify(data, null, 2));
    
    // Cacher la page d'accueil
    pageAccueil.style.display = 'none';
    
    // Afficher la page résultats
    pageResultats.style.display = 'block';
    
    // Créer les 4 graphiques
    creerGraphiqueAPOE(data.apoe);
    creerGraphiqueDIO2(data.dio2);
    creerGraphiqueAMY1A(data.amy1a);
    creerGraphiqueFUT2(data.fut2);
}

// GRAPHIQUE 1 : APOE (Doughnut avec navigation intégrée)
let apoeData = null;
let apoeCurrentIndex = 0;

function creerGraphiqueAPOE(data) {
    apoeData = data;
    const ctx = document.getElementById('chartAPOE').getContext('2d');
    
    if (chartAPOE) chartAPOE.destroy();
    
    // Trouver l'allèle dominant
    const alleles = [
        { nom: 'apoe4', label: 'APOE4', valeur: data.apoe4, couleur: '#ff6b6b' },
        { nom: 'apoe3', label: 'APOE3', valeur: data.apoe3, couleur: '#4ecdc4' },
        { nom: 'apoe2', label: 'APOE2', valeur: data.apoe2, couleur: '#95e1d3' }
    ];
    
    const dominant = alleles.reduce((max, curr) => curr.valeur > max.valeur ? curr : max);
    apoeCurrentIndex = alleles.findIndex(a => a.nom === dominant.nom);
    
    afficherGraphiqueAPOE(alleles);
    afficherDescriptionAPOE();
}

function afficherGraphiqueAPOE(alleles) {
    const ctx = document.getElementById('chartAPOE').getContext('2d');
    
    if (chartAPOE) chartAPOE.destroy();
    
    // Créer les couleurs avec mise en valeur de l'allèle actuel
    const couleurs = alleles.map((a, i) => {
        if (i === apoeCurrentIndex) {
            return a.couleur; // Couleur normale pour l'allèle sélectionné
        } else {
            return a.couleur + '40'; // Ajout d'opacité 40% pour les autres
        }
    });
    
    // Créer le graphique doughnut (couronne)
    chartAPOE = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: alleles.map(a => a.label),
            datasets: [{
                data: alleles.map(a => a.valeur),
                backgroundColor: couleurs,
                borderWidth: alleles.map((a, i) => i === apoeCurrentIndex ? 4 : 2),
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                const currentAllele = alleles[apoeCurrentIndex];
                
                ctx.restore();
                ctx.font = "bold 2em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = currentAllele.couleur;
                
                const text = currentAllele.valeur + "%";
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

function afficherDescriptionAPOE() {
    const alleles = ['apoe4', 'apoe3', 'apoe2'];
    const allelesData = [
        { nom: 'apoe4', valeur: apoeData.apoe4 },
        { nom: 'apoe3', valeur: apoeData.apoe3 },
        { nom: 'apoe2', valeur: apoeData.apoe2 }
    ];
    const alleleActuel = alleles[apoeCurrentIndex];
    const desc = DESCRIPTIONS[alleleActuel];
    
    const container = document.getElementById('chartAPOE').parentElement;
    
    // Supprimer l'ancienne navigation
    const oldNav = container.querySelector('.apoe-navigation');
    if (oldNav) oldNav.remove();
    
    // Supprimer l'ancienne description
    const oldDesc = container.querySelector('.apoe-description');
    if (oldDesc) oldDesc.remove();
    
    // Ajouter la navigation avec flèches dans la carte
    const navigation = document.createElement('div');
    navigation.className = 'apoe-navigation';
    navigation.innerHTML = `
        <button class="btn-nav-small" onclick="changerAlleleAPOE(-1)">◀</button>
        <div class="allele-info">
            <span class="allele-nom">${desc.titre.split('—')[0].trim()}</span>
            <span class="allele-pourcentage">${allelesData[apoeCurrentIndex].valeur}%</span>
        </div>
        <button class="btn-nav-small" onclick="changerAlleleAPOE(1)">▶</button>
    `;
    container.appendChild(navigation);
    
    // Ajouter la description
    const description = document.createElement('div');
    description.className = 'apoe-description';
    description.innerHTML = `
        <h4>${desc.titre}</h4>
        <p class="soustitre">${desc.soustitre}</p>
        <p class="description-texte">${desc.description}</p>
        <div class="points">
            ${desc.points.map(p => `<p>👉 ${p}</p>`).join('')}
        </div>
    `;
    container.appendChild(description);
}

function changerAlleleAPOE(direction) {
    apoeCurrentIndex = (apoeCurrentIndex + direction + 3) % 3;
    
    // Recréer le graphique avec la mise en valeur
    const alleles = [
        { nom: 'apoe4', label: 'APOE4', valeur: apoeData.apoe4, couleur: '#ff6b6b' },
        { nom: 'apoe3', label: 'APOE3', valeur: apoeData.apoe3, couleur: '#4ecdc4' },
        { nom: 'apoe2', label: 'APOE2', valeur: apoeData.apoe2, couleur: '#95e1d3' }
    ];
    
    afficherGraphiqueAPOE(alleles);
    afficherDescriptionAPOE();
}

// GRAPHIQUE 2 : DIO2 (Doughnut avec navigation et mise en valeur)
let dio2Data = null;
let dio2CurrentIndex = 0; // 0=positif, 1=négatif

function creerGraphiqueDIO2(data) {
    dio2Data = data;
    
    // Déterminer l'index dominant
    dio2CurrentIndex = data.positif > data.negatif ? 0 : 1;
    
    afficherGraphiqueDIO2();
    afficherDescriptionDIO2();
}

function afficherGraphiqueDIO2() {
    const ctx = document.getElementById('chartDIO2').getContext('2d');
    
    if (chartDIO2) chartDIO2.destroy();
    
    const variants = [
        { nom: 'positif', label: 'Positif', valeur: dio2Data.positif, couleur: '#667eea' },
        { nom: 'negatif', label: 'Négatif', valeur: dio2Data.negatif, couleur: '#f093fb' }
    ];
    
    // Couleurs avec mise en valeur
    const couleurs = variants.map((v, i) => 
        i === dio2CurrentIndex ? v.couleur : v.couleur + '40'
    );
    
    chartDIO2 = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: variants.map(v => v.label),
            datasets: [{
                data: variants.map(v => v.valeur),
                backgroundColor: couleurs,
                borderWidth: variants.map((v, i) => i === dio2CurrentIndex ? 4 : 2),
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                const current = variants[dio2CurrentIndex];
                
                ctx.restore();
                ctx.font = "bold 2em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = current.couleur;
                
                const text = current.valeur + "%";
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

function afficherDescriptionDIO2() {
    const variants = ['positif', 'negatif'];
    const variantActuel = variants[dio2CurrentIndex];
    const desc = DESCRIPTIONS[`dio2_${variantActuel}`];
    
    const container = document.getElementById('chartDIO2').parentElement;
    
    const oldNav = container.querySelector('.gene-navigation');
    if (oldNav) oldNav.remove();
    
    const oldDesc = container.querySelector('.gene-description');
    if (oldDesc) oldDesc.remove();
    
    const navigation = document.createElement('div');
    navigation.className = 'gene-navigation';
    navigation.innerHTML = `
        <button class="btn-nav-small" onclick="changerVariantDIO2(-1)">◀</button>
        <div class="allele-info">
            <span class="allele-nom">${desc.titre.split('—')[0].trim()}</span>
            <span class="allele-pourcentage">${dio2Data[variantActuel]}%</span>
        </div>
        <button class="btn-nav-small" onclick="changerVariantDIO2(1)">▶</button>
    `;
    container.appendChild(navigation);
    
    const description = document.createElement('div');
    description.className = 'gene-description';
    description.innerHTML = `
        <h4>${desc.titre}</h4>
        <p class="soustitre">${desc.soustitre}</p>
        <p class="description-texte">${desc.description}</p>
        <div class="points">
            ${desc.points.map(p => `<p>👉 ${p}</p>`).join('')}
        </div>
    `;
    container.appendChild(description);
}

function changerVariantDIO2(direction) {
    dio2CurrentIndex = (dio2CurrentIndex + direction + 2) % 2;
    afficherGraphiqueDIO2();
    afficherDescriptionDIO2();
}

// GRAPHIQUE 3 : AMY1A (Doughnut avec navigation et mise en valeur)
let amy1aData = null;
let amy1aCurrentIndex = 0;

function creerGraphiqueAMY1A(data) {
    amy1aData = data;
    amy1aCurrentIndex = data.positif > data.negatif ? 0 : 1;
    
    afficherGraphiqueAMY1A();
    afficherDescriptionAMY1A();
}

function afficherGraphiqueAMY1A() {
    const ctx = document.getElementById('chartAMY1A').getContext('2d');
    
    if (chartAMY1A) chartAMY1A.destroy();
    
    const variants = [
        { nom: 'positif', label: 'Positif', valeur: amy1aData.positif, couleur: '#4facfe' },
        { nom: 'negatif', label: 'Négatif', valeur: amy1aData.negatif, couleur: '#f093fb' }
    ];
    
    const couleurs = variants.map((v, i) => 
        i === amy1aCurrentIndex ? v.couleur : v.couleur + '40'
    );
    
    chartAMY1A = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: variants.map(v => v.label),
            datasets: [{
                data: variants.map(v => v.valeur),
                backgroundColor: couleurs,
                borderWidth: variants.map((v, i) => i === amy1aCurrentIndex ? 4 : 2),
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                const current = variants[amy1aCurrentIndex];
                
                ctx.restore();
                ctx.font = "bold 2em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = current.couleur;
                
                const text = current.valeur + "%";
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

function afficherDescriptionAMY1A() {
    const variants = ['positif', 'negatif'];
    const variantActuel = variants[amy1aCurrentIndex];
    const desc = DESCRIPTIONS[`amy1a_${variantActuel}`];
    
    const container = document.getElementById('chartAMY1A').parentElement;
    
    const oldNav = container.querySelector('.gene-navigation');
    if (oldNav) oldNav.remove();
    
    const oldDesc = container.querySelector('.gene-description');
    if (oldDesc) oldDesc.remove();
    
    const navigation = document.createElement('div');
    navigation.className = 'gene-navigation';
    navigation.innerHTML = `
        <button class="btn-nav-small" onclick="changerVariantAMY1A(-1)">◀</button>
        <div class="allele-info">
            <span class="allele-nom">${desc.titre.split('—')[0].trim()}</span>
            <span class="allele-pourcentage">${amy1aData[variantActuel]}%</span>
        </div>
        <button class="btn-nav-small" onclick="changerVariantAMY1A(1)">▶</button>
    `;
    container.appendChild(navigation);
    
    const description = document.createElement('div');
    description.className = 'gene-description';
    description.innerHTML = `
        <h4>${desc.titre}</h4>
        <p class="soustitre">${desc.soustitre}</p>
        <p class="description-texte">${desc.description}</p>
        <div class="points">
            ${desc.points.map(p => `<p>👉 ${p}</p>`).join('')}
        </div>
    `;
    container.appendChild(description);
}

function changerVariantAMY1A(direction) {
    amy1aCurrentIndex = (amy1aCurrentIndex + direction + 2) % 2;
    afficherGraphiqueAMY1A();
    afficherDescriptionAMY1A();
}

// GRAPHIQUE 4 : FUT2 (Doughnut avec navigation et mise en valeur)
let fut2Data = null;
let fut2CurrentIndex = 0;

function creerGraphiqueFUT2(data) {
    fut2Data = data;
    fut2CurrentIndex = data.positif > data.negatif ? 0 : 1;
    
    afficherGraphiqueFUT2();
    afficherDescriptionFUT2();
}

function afficherGraphiqueFUT2() {
    const ctx = document.getElementById('chartFUT2').getContext('2d');
    
    if (chartFUT2) chartFUT2.destroy();
    
    const variants = [
        { nom: 'positif', label: 'Sécréteur', valeur: fut2Data.positif, couleur: '#667eea' },
        { nom: 'negatif', label: 'Non-sécréteur', valeur: fut2Data.negatif, couleur: '#4facfe' }
    ];
    
    const couleurs = variants.map((v, i) => 
        i === fut2CurrentIndex ? v.couleur : v.couleur + '40'
    );
    
    chartFUT2 = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: variants.map(v => v.label),
            datasets: [{
                data: variants.map(v => v.valeur),
                backgroundColor: couleurs,
                borderWidth: variants.map((v, i) => i === fut2CurrentIndex ? 4 : 2),
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                const current = variants[fut2CurrentIndex];
                
                ctx.restore();
                ctx.font = "bold 2em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = current.couleur;
                
                const text = current.valeur + "%";
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

function afficherDescriptionFUT2() {
    const variants = ['positif', 'negatif'];
    const variantActuel = variants[fut2CurrentIndex];
    const desc = DESCRIPTIONS[`fut2_${variantActuel}`];
    
    const container = document.getElementById('chartFUT2').parentElement;
    
    const oldNav = container.querySelector('.gene-navigation');
    if (oldNav) oldNav.remove();
    
    const oldDesc = container.querySelector('.gene-description');
    if (oldDesc) oldDesc.remove();
    
    const navigation = document.createElement('div');
    navigation.className = 'gene-navigation';
    navigation.innerHTML = `
        <button class="btn-nav-small" onclick="changerVariantFUT2(-1)">◀</button>
        <div class="allele-info">
            <span class="allele-nom">${desc.titre.split('—')[0].trim()}</span>
            <span class="allele-pourcentage">${fut2Data[variantActuel]}%</span>
        </div>
        <button class="btn-nav-small" onclick="changerVariantFUT2(1)">▶</button>
    `;
    container.appendChild(navigation);
    
    const description = document.createElement('div');
    description.className = 'gene-description';
    description.innerHTML = `
        <h4>${desc.titre}</h4>
        <p class="soustitre">${desc.soustitre}</p>
        <p class="description-texte">${desc.description}</p>
        <div class="points">
            ${desc.points.map(p => `<p>👉 ${p}</p>`).join('')}
        </div>
    `;
    container.appendChild(description);
}

function changerVariantFUT2(direction) {
    fut2CurrentIndex = (fut2CurrentIndex + direction + 2) % 2;
    afficherGraphiqueFUT2();
    afficherDescriptionFUT2();
}

// Message dans la console
console.log(`
%c🧬 NUTRI-GÈNES - APPLICATION GÉNÉTIQUE
%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

%c⚠️  CONFIGURATION:
   1. Obtenez une clé API sur https://openrouter.ai
   2. Remplacez 'VOTRE_CLE_API_ICI' dans app.js
   3. Rechargez la page

%c🤖 Système de fallback automatique:
   L'application essaiera ces modèles dans l'ordre:
   1. arcee-ai/trinity-large-preview:free
   2. arcee-ai/trinity-mini:free
   3. tngtech/deepseek-r1t-chimera:free
   4. nvidia/nemotron-3-nano-30b-a3b:free
   5. nvidia/nemotron-nano-9b-v2:free
   6. anthropic/claude-3.5-sonnet (dernier recours)

%c🧬 Gènes analysés:
   • APOE: Métabolisme des lipides (3 variants)
   • DIO2: Fonction thyroïdienne (positif/négatif)
   • AMY1A: Digestion amidon (positif/négatif)
   • FUT2: Microbiote intestinal (positif/négatif)

%c✨ Prêt à analyser !
`, 
'color: #667eea; font-size: 18px; font-weight: bold',
'color: #666',
'color: #dc3545; font-weight: bold',
'color: #28a745',
'color: #4facfe',
'color: #667eea; font-weight: bold'
);