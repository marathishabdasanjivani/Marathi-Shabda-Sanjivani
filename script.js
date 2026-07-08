document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const searchDropdown = document.getElementById('searchDropdown');
    const entryContainer = document.getElementById('entryContainer');
    const homepageDefault = document.getElementById('homepageDefault');
    const menuBtn = document.getElementById('menuBtn');
    const sideNav = document.getElementById('sideNav');
    const menuOverlay = document.getElementById('menuOverlay');
    const siteBrandGroup = document.getElementById('siteBrandGroup');

    // Navigation and Footer Elements
    const navHome = document.getElementById('navHome');
    const navAlphabet = document.getElementById('navAlphabet');
    const navQuiz = document.getElementById('navQuiz');
    const navWotd = document.getElementById('navWotd');
    const navPrivacy = document.getElementById('navPrivacy');
    const navTerms = document.getElementById('navTerms');
    const navAbout = document.getElementById('navAbout');
    
    const footerPrivacy = document.getElementById('footerPrivacy');
    const footerTerms = document.getElementById('footerTerms');
    const footerAbout = document.getElementById('footerAbout');

    let dictionaryData = [];
    const cachedHomepage = homepageDefault.cloneNode(true);

    function toggleMenu() {
        menuBtn.classList.toggle('active');
        sideNav.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

    function loadPrivacyPolicy(e) {
        e.preventDefault();
        if (sideNav.classList.contains('open')) toggleMenu();
        fetch('/privacy.html').then(r => r.text()).then(data => {
            const doc = new DOMParser().parseFromString(data, 'text/html');
            entryContainer.innerHTML = doc.querySelector('.main-layout').innerHTML;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState({ view: "privacy" }, "");
        });
    }

    // Navigation Attachments
    if (navPrivacy) navPrivacy.addEventListener('click', loadPrivacyPolicy);
    if (navTerms) navTerms.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); fetch('/terms.html').then(r => r.text()).then(d => { entryContainer.innerHTML = new DOMParser().parseFromString(d, 'text/html').querySelector('.main-layout').innerHTML; }); });
    if (navAbout) navAbout.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); fetch('/about.html').then(r => r.text()).then(d => { entryContainer.innerHTML = new DOMParser().parseFromString(d, 'text/html').querySelector('.main-layout').innerHTML; }); });
    if (footerPrivacy) footerPrivacy.addEventListener('click', loadPrivacyPolicy);
    if (footerTerms) footerTerms.addEventListener('click', (e) => { e.preventDefault(); fetch('/terms.html').then(r => r.text()).then(d => { entryContainer.innerHTML = new DOMParser().parseFromString(d, 'text/html').querySelector('.main-layout').innerHTML; }); });
    if (footerAbout) footerAbout.addEventListener('click', (e) => { e.preventDefault(); fetch('/about.html').then(r => r.text()).then(d => { entryContainer.innerHTML = new DOMParser().parseFromString(d, 'text/html').querySelector('.main-layout').innerHTML; }); });

    fetch('dictionary.json')
        .then(res => res.json())
        .then(data => { 
            dictionaryData = data.sort((a, b) => a.word.localeCompare(b.word, 'mr')); 
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('word')) loadWordDetailPage(urlParams.get('word'), false);
            else loadHomepage();
        });

    function showPage(elementHTML, onRenderCallback = null) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        entryContainer.innerHTML = '';
        if (typeof elementHTML === 'string') entryContainer.innerHTML = elementHTML;
        else entryContainer.appendChild(elementHTML);
        if (onRenderCallback) onRenderCallback();
    }

    function loadHomepage() {
        const homeNode = cachedHomepage.cloneNode(true);
        
        // WOTD: Daily random word fetch logic
        if (dictionaryData.length > 0) {
            const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
            const dailyWord = dictionaryData[dayOfYear % dictionaryData.length];
            const link = homeNode.querySelector('#wotdLink');
            const def = homeNode.querySelector('#wotdDefinition');
            if (link) link.innerText = dailyWord.word;
            if (def) def.innerText = dailyWord.meanings[0].definition; // Plain text, no examples
        }
        
        showPage(homeNode, null);
        initializeRoutingEvents(homeNode);
        setupQuizEngine(homeNode);
        history.pushState({ view: "home" }, "", "index.html"); 
    }

    // Quiz Engine: Fetches from quiz.json
    function setupQuizEngine(rootContext) {
        const questionBox = rootContext.querySelector('#quizQuestionBox');
        if(!questionBox) return;

        fetch('quiz.json')
            .then(res => res.json())
            .then(quizDatabase => {
                let currentQuestionIndex = 0;
                let userScore = 0;
                let hasAnsweredCurrent = false;

                const progressText = rootContext.querySelector('#quizProgress');
                const scoreText = rootContext.querySelector('#quizScore');
                const optionsContainer = rootContext.querySelector('#quizOptionsContainer');
                const actionWrapper = rootContext.querySelector('#quizActionWrapper');

                function loadQuestion() {
                    hasAnsweredCurrent = false;
                    actionWrapper.innerHTML = '';
                    optionsContainer.innerHTML = '';
                    let currentQ = quizDatabase[currentQuestionIndex];
                    if (progressText) progressText.innerText = `प्रश्न ${currentQuestionIndex + 1}/५`;
                    questionBox.innerText = currentQ.q;
                    currentQ.o.forEach((option, index) => {
                        const button = document.createElement('button');
                        button.className = 'quiz-opt-btn';
                        button.innerText = option;
                        button.addEventListener('click', () => {
                            if (hasAnsweredCurrent) return;
                            hasAnsweredCurrent = true;
                            if (index === currentQ.a) {
                                button.classList.add('correct-flash');
                                userScore++;
                                if (scoreText) scoreText.innerText = `गुण: ${userScore}`;
                            } else {
                                button.classList.add('wrong-flash');
                                optionsContainer.getElementsByClassName('quiz-opt-btn')[currentQ.a].classList.add('correct-flash');
                            }
                            const actionBtn = document.createElement('button');
                            actionBtn.className = 'quiz-next-btn';
                            if (currentQuestionIndex < quizDatabase.length - 1) {
                                actionBtn.innerText = 'पुढील प्रश्न →';
                                actionBtn.addEventListener('click', () => { currentQuestionIndex++; loadQuestion(); });
                            } else {
                                actionBtn.style.backgroundColor = '#22c55e';
                                actionBtn.innerText = 'चाचणी पूर्ण करा';
                                actionBtn.addEventListener('click', () => {
                                    questionBox.innerText = `चाचणी पूर्ण झाली! तुमचा एकूण निकाल: ${userScore}/५`;
                                    optionsContainer.innerHTML = '';
                                    actionWrapper.innerHTML = `<a href="#" class="section-redirect-link">→ पुन्हा प्रयत्न करा</a>`;
                                    actionWrapper.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); setupQuizEngine(rootContext); });
                                });
                            }
                            actionWrapper.appendChild(actionBtn);
                        });
                        optionsContainer.appendChild(button);
                    });
                }
                loadQuestion();
            });
    }

    function initializeRoutingEvents(context) {
        context.querySelectorAll('.alphabet-container span').forEach(box => {
            box.style.cursor = 'pointer';
            box.addEventListener('click', () => renderLetterPage(box.innerText.trim(), true));
        });
        const wotdLink = context.querySelector('#wotdLink');
        if(wotdLink) wotdLink.addEventListener('click', () => loadWordDetailPage(wotdLink.innerText.trim(), true));
    }

    function loadWordDetailPage(wordName, pushState = true) {
        const item = dictionaryData.find(w => w.word.trim().toLowerCase() === wordName.trim().toLowerCase());
        if(!item) return;

        let wordHTML = `
            <div class="word-entry">
                <div class="entry-header">
                    <h2 class="headword">${item.word}</h2>
                    <span class="pos">${item.partOfSpeech}</span>
                </div>
                <div style="font-weight: bold; margin-bottom: 0.5rem; color: var(--primary-dark);">अर्थ आणि उदाहरण:</div>
                <ol class="definitions-list">
                    ${item.meanings.map(m => `<li><span class="definition-text">${m.definition}</span><div class="example-item">${m.example}</div></li>`).join('')}
                </ol>
            </div>`;
        showPage(wordHTML, null);
        if (pushState) history.pushState({ view: "word-detail", word: item.word }, "", `?word=${item.word}`);
    }

    function renderLetterPage(letter, pushState = true) {
        const matched = dictionaryData.filter(i => i.word.startsWith(letter) && !(letter === "अ" && i.word.startsWith("अं")));
        let html = `<div class="word-entry"><h2 class="headword">अक्षर: "${letter}"</h2><div class="letter-words-list-stack">`;
        matched.forEach(w => html += `<button class="word-target-btn letter-word-row-item" data-word="${w.word}">${w.word}</button>`);
        html += `</div><a href="#" id="backToGridBtn" class="section-redirect-link">← परत जा</a></div>`;
        showPage(html, () => {
            entryContainer.querySelectorAll('.word-target-btn').forEach(b => b.addEventListener('click', () => loadWordDetailPage(b.getAttribute('data-word'))));
            entryContainer.querySelector('#backToGridBtn').addEventListener('click', (e) => { e.preventDefault(); loadHomepage(); });
        });
    }

    if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); loadHomepage(); });
    if (navWotd) navWotd.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); const node = cachedHomepage.cloneNode(true); showPage(node.querySelector('#wordOfTheDaySection'), null); });
    if (navQuiz) navQuiz.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); const node = cachedHomepage.cloneNode(true); showPage(node.querySelector('#quizSection'), () => setupQuizEngine(entryContainer)); });
    if (navAlphabet) navAlphabet.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); const node = cachedHomepage.cloneNode(true); showPage(node.querySelector('#alphabetSection'), () => initializeRoutingEvents(entryContainer)); });
});
