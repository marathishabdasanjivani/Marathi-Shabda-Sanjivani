// Premium Dictionary Data Matrix Context
const dictionaryData = {
    "अळणी": {
        word: "अळणी",
        pos: "विशेषण",
        definitions: [
            "[खाद्यपदार्थांविषयी] ज्या जेवणात किंवा पदार्थात मीठ घातलेले नाही किंवा मिठाचे प्रमाण अत्यंत कमी आहे असा पदार्थ.",
            "ज्या गोष्टीमध्ये कसलाही रस, गोडी किंवा उत्साह उरलेला नाही अशी स्थिती; मिळमिळीत."
        ],
        vakyaprachar: "अळणी जीवन जगणे (उत्साहाशिवाय आयुष्य कंठणे)."
    },
    "इत्यंभूत": {
        word: "इत्यंभूत",
        pos: "विशेषण / क्रियाविशेषण",
        definitions: [
            "सुरुवातीपासून शेवटपर्यंत सविस्तर; काहीही न गाळता जसे घडले तसे हुबेहूब (Detailed / A to Z).",
            "एखाद्या प्रकरणाची किंवा प्रसंगाची संपूर्ण सत्य माहिती असणे."
        ],
        vakyaprachar: "इत्यंभूत माहिती काढणे (मूळापासून सर्व गुप्त किंवा उघड माहिती मिळवणे)."
    },
    "ईषत": {
        word: "ईषत",
        pos: "विशेषण / क्रियाविशेषण",
        definitions: [
            "अतिशय थोडे; किंचित किंवा अल्प प्रमाणात (Slightly / Minimal).",
            "प्रमाण किंवा हालचालींमधील अत्यंत सूक्ष्म फरक दर्शवणारे रूप."
        ],
        vakyaprachar: "ईषत हास्य करणे (गालातल्या गालात अगदी थोडेसे हसणे)."
    }
};

// Application Global Nodes Selector
const entryContainer = document.getElementById('entryContainer');
const homepageDefault = document.getElementById('homepageDefault');
const searchBar = document.getElementById('searchBar');
const searchDropdown = document.getElementById('searchDropdown');
const menuBtn = document.getElementById('menuBtn');
const sideNav = document.getElementById('sideNav');
const menuOverlay = document.getElementById('menuOverlay');

// Navigation Anchors
const navHome = document.getElementById('navHome');
const navAlphabet = document.getElementById('navAlphabet');
const navWotd = document.getElementById('navWotd');
const navQuiz = document.getElementById('navQuiz');

// Component Links
const wotdLink = document.getElementById('wotdLink');
const viewAllWotdLink = document.getElementById('viewAllWotdLink');

// --- 1. Premium Intercept Routing & Browser Back Engine ---
function navigateToView(viewHtml, pushState = true) {
    entryContainer.innerHTML = viewHtml;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (pushState) {
        // Push a state token so clicking 'Back' stays on our app instead of exiting
        history.pushState({ isWordPage: true }, "");
    }
}

function restoreHomepage() {
    entryContainer.innerHTML = '';
    entryContainer.appendChild(homepageDefault);
    searchBar.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global Browser Back Button Event Handler
window.addEventListener('popstate', function(event) {
    // Whenever the browser's native back button is hit, safely slide back to homepage
    restoreHomepage();
});

// Primary Home Nav Links
navHome.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); restoreHomepage(); });
document.getElementById('siteBrandGroup').addEventListener('click', () => { restoreHomepage(); });

// Quick Routing Handlers for Home Modules
if (wotdLink) {
    wotdLink.addEventListener('click', () => { renderWordPage("अळणी"); });
}
if (viewAllWotdLink) {
    viewAllWotdLink.addEventListener('click', (e) => { e.preventDefault(); scrollIntoSection('wordOfTheDaySection'); });
}
if (navWotd) {
    navWotd.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); scrollIntoSection('wordOfTheDaySection'); });
}
if (navAlphabet) {
    navAlphabet.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); scrollIntoSection('alphabetSection'); });
}
if (navQuiz) {
    navQuiz.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); scrollIntoSection('quizSection'); });
}

function scrollIntoSection(id) {
    restoreHomepage();
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
}

// --- 2. Word Entry Layout Engine (With Interspersed Ad Slots) ---
function renderWordPage(wordKey) {
    const data = dictionaryData[wordKey];
    if (!data) return;

    // Headword Structure
    let htmlContent = `
        <div class="word-page-view">
            <button class="back-btn-primary" id="backToHomeBtn">← मुख्य पृष्ठावर जा</button>
            
            <div class="ad-placeholder banner-ad">जाहिरात जागा (Ad Slot)</div>

            <div class="word-card-hero">
                <div class="entry-header" style="border-bottom: 2px solid var(--accent-gold); padding-bottom: 0.5rem;">
                    <h2 class="headword" style="font-size: 2.2rem; color: #0f172a;">${data.word}</h2>
                    <span class="pos">${data.pos}</span>
                </div>
    `;

    // Definition 1 + Ad Slot Sandwich Setup
    if (data.definitions && data.definitions[0]) {
        htmlContent += `
            <div class="definition-block">
                <span class="def-counter">अर्थ १</span>
                <p class="definition-text">${data.definitions[0]}</p>
                <div class="line-metric-box">
                    <span class="metric-label">समानार्थी:</span> <span class="metric-value">माहिती नाही</span>
                </div>
                <div class="line-metric-box">
                    <span class="metric-label">सहसंबंधी:</span> <span class="metric-value">माहिती नाही</span>
                </div>
            </div>
            </div> <!-- End of Primary Hero Card containing Def 1 -->
            
            <div class="ad-placeholder banner-ad">जाहिरात जागा (Ad Slot)</div>
        `;
    }

    // Definition 2 + Ad Slot Sandwich Setup
    if (data.definitions && data.definitions[1]) {
        htmlContent += `
            <div class="word-card-hero" style="margin-top: 1rem;">
            <div class="definition-block">
                <span class="def-counter">अर्थ २</span>
                <p class="definition-text">${data.definitions[1]}</p>
                <div class="line-metric-box">
                    <span class="metric-label">समानार्थी:</span> <span class="metric-value">माहिती नाही</span>
                </div>
                <div class="line-metric-box">
                    <span class="metric-label">सहसंबंधी:</span> <span class="metric-value">माहिती नाही</span>
                </div>
            </div>
            </div>
            
            <div class="ad-placeholder banner-ad">जाहिरात जागा (Ad Slot)</div>
        `;
    }

    // Definition 3 Placeholder Support + Ad Slot Sandwich Setup
    if (data.definitions && data.definitions[2]) {
        htmlContent += `
            <div class="word-card-hero" style="margin-top: 1rem;">
            <div class="definition-block">
                <span class="def-counter">अर्थ ३</span>
                <p class="definition-text">${data.definitions[2]}</p>
                <div class="line-metric-box">
                    <span class="metric-label">समानार्थी:</span> <span class="metric-value">माहिती नाही</span>
                </div>
                <div class="line-metric-box">
                    <span class="metric-label">सहसंबंधी:</span> <span class="metric-value">माहिती नाही</span>
                </div>
            </div>
            </div>
            
            <div class="ad-placeholder banner-ad">जाहिरात जागा (Ad Slot)</div>
        `;
    }

    // Vakyaprachar Block at base
    if (data.vakyaprachar) {
        htmlContent += `
            <div class="word-card-hero" style="margin-top: 1rem; border-left: 4px solid var(--accent-gold);">
                <div class="vakyaprachar-container">
                    <h3 style="font-size: 1.15rem; color: #1e293b; margin-bottom: 0.4rem;">वाक्यांत उपयोग / वाक्यप्रचार:</h3>
                    <p class="vakyaprachar-text" style="font-style: italic; color: #475569; font-size: 1.05rem;">"${data.vakyaprachar}"</p>
                </div>
            </div>
        `;
    }

    htmlContent += `</div>`; // Close overall view block

    // Push into DOM view frame
    navigateToView(htmlContent, true);

    // Setup direct internal back button trigger
    document.getElementById('backToHomeBtn').addEventListener('click', () => {
        history.back(); // This triggers our window popstate listener perfectly
    });
}

// --- 3. Live Suggestion & Search Infrastructure ---
searchBar.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (!val) {
        searchDropdown.style.display = 'none';
        return;
    }

    const matches = Object.keys(dictionaryData).filter(key => key.includes(val));
    if (matches.length === 0) {
        searchDropdown.innerHTML = `<div class="dropdown-item static-text">शब्द सापडला नाही</div>`;
    } else {
        searchDropdown.innerHTML = matches.map(m => `<div class="dropdown-item trigger-action" data-word="${m}">${m}</div>`).join('');
    }
    searchDropdown.style.display = 'block';
});

searchDropdown.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('trigger-action')) {
        const word = target.getAttribute('data-word');
        searchDropdown.style.display = 'none';
        renderWordPage(word);
    }
});

document.addEventListener('click', (e) => {
    if (!searchBar.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.style.display = 'none';
    }
});

// Alphabet Grid Direct Link Execution Runtime Wiring
document.querySelectorAll('.alphabet-row span').forEach(chip => {
    chip.addEventListener('click', () => {
        const char = chip.textContent.trim();
        searchBar.value = char;
        searchBar.focus();
        searchBar.dispatchEvent(new Event('input'));
    });
});

// --- 4. Sidebar Draw Mechanics ---
function openMenu() {
    sideNav.classList.add('active');
    menuOverlay.classList.add('active');
    menuBtn.classList.add('open');
}
function closeMenu() {
    sideNav.classList.remove('active');
    menuOverlay.classList.remove('active');
    menuBtn.classList.remove('open');
}
menuBtn.addEventListener('click', () => {
    if (sideNav.classList.contains('active')) closeMenu();
    else openMenu();
});
menuOverlay.addEventListener('click', closeMenu);

// --- 5. Interactive Gamified Quiz Runtime Code ---
const quizData = [
    { q: "सविस्तर माहिती गोळा करणे या अर्थाचा अचूक शब्द कोणता?", o: ["ईषत", "इत्यंभूत", "अळणी", "विस्तृत"], a: "इत्यंभूत" },
    { q: "'अळणी' या शब्दाचा अन्नपदार्थाव्यतिरिक्त दुसरा अर्थ काय?", o: ["गोड", "तिखट", "मिळमिळीत / नीरस", "कडू"], a: "मिळमिळीत / नीरस" },
    { q: "अगदी किंचित किंवा सूक्ष्म प्रमाणात या अर्थासाठी कोणता शब्द वापरतात?", o: ["ईषत", "साविस्तर", "भरपूर", "अळणी"], a: "ईषत" }
];
let currentQuizIdx = 0;
let score = 0;

function initQuizModule() {
    const qBox = document.getElementById('quizQuestionBox');
    const optsBox = document.getElementById('quizOptionsContainer');
    const prog = document.getElementById('quizProgress');
    const scoreBox = document.getElementById('quizScore');
    const footer = document.getElementById('quizActionWrapper');

    if (!qBox || !optsBox) return;

    if (currentQuizIdx >= quizData.length) {
        prog.textContent = "चाचणी पूर्ण!";
        qBox.textContent = `अभिनंदन! तुम्ही ३ पैकी ${score} गुण मिळवले आहेत.`;
        optsBox.innerHTML = '';
        footer.innerHTML = `<button class="back-btn-primary" onclick="resetQuizApp()" style="margin-top:0.5rem; width:100%;">पुन्हा प्रयत्न करा</button>`;
        return;
    }

    const currentItem = quizData[currentQuizIdx];
    prog.textContent = `प्रश्न ${currentQuizIdx + 1}/${quizData.length}`;
    scoreBox.textContent = `गुण: ${score}`;
    qBox.textContent = currentItem.q;
    footer.innerHTML = '';

    optsBox.innerHTML = currentItem.o.map(opt => `
        <button class="quiz-opt-row" onclick="evaluateQuizAnswer(this, '${opt}')">${opt}</button>
    `).join('');
}

window.evaluateQuizAnswer = function(element, chosenOption) {
    const currentItem = quizData[currentQuizIdx];
    const allButtons = document.querySelectorAll('.quiz-opt-row');
    allButtons.forEach(btn => btn.disabled = true);

    if (chosenOption === currentItem.a) {
        element.style.background = "#d1fae5";
        element.style.borderColor = "#10b981";
        score++;
    } else {
        element.style.background = "#fee2e2";
        element.style.borderColor = "#ef4444";
        allButtons.forEach(btn => {
            if (btn.textContent.trim() === currentItem.a) {
                btn.style.background = "#d1fae5";
                btn.style.borderColor = "#10b981";
            }
        });
    }

    const footer = document.getElementById('quizActionWrapper');
    footer.innerHTML = `<button class="back-btn-primary" onclick="advanceQuizSequence()" style="margin-top:0.5rem; width:100%;">पुढील प्रश्न →</button>`;
};

window.advanceQuizSequence = function() {
    currentQuizIdx++;
    initQuizModule();
};

window.resetQuizApp = function() {
    currentQuizIdx = 0;
    score = 0;
    initQuizModule();
};

// Fire Quiz Engine on load window
document.addEventListener("DOMContentLoaded", () => {
    initQuizModule();
});
