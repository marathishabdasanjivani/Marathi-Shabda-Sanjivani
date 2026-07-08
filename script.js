document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const searchDropdown = document.getElementById('searchDropdown');
    const entryContainer = document.getElementById('entryContainer');
    const homepageDefault = document.getElementById('homepageDefault');
    const menuBtn = document.getElementById('menuBtn');
    const sideNav = document.getElementById('sideNav');
    const menuOverlay = document.getElementById('menuOverlay');

    // Navigation Elements
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

    // --- Core Loading ---
    fetch('dictionary.json')
        .then(res => res.json())
        .then(data => { 
            dictionaryData = data.sort((a, b) => a.word.localeCompare(b.word, 'mr')); 
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('word')) loadWordDetailPage(urlParams.get('word'));
            else loadHomepage();
        });

    function showPage(elementHTML, onRenderCallback = null) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        entryContainer.innerHTML = '';
        if (typeof elementHTML === 'string') entryContainer.innerHTML = elementHTML;
        else entryContainer.appendChild(elementHTML);
        if (onRenderCallback) onRenderCallback();
        if (searchDropdown) searchDropdown.style.display = 'none';
        if (searchBar) searchBar.value = '';
    }

    function loadHomepage() {
        const homeNode = cachedHomepage.cloneNode(true);
        
        // --- Daily WOTD Logic (First definition and example only) ---
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const dailyWord = dictionaryData[dayOfYear % dictionaryData.length];
        
        homeNode.querySelector('#wotdLink').innerText = dailyWord.word;
        // Show first definition and example
        const firstMeaning = dailyWord.meanings[0];
        homeNode.querySelector('#wotdDefinition').innerHTML = `
            <strong>${firstMeaning.definition}</strong><br>
            <em style="color:#64748b;">${firstMeaning.example || ''}</em>
        `;
        
        showPage(homeNode, null);
        initializeRoutingEvents(homeNode);
        setupQuizEngine(homeNode);
    }

    // --- Detail Page Logic (Shows EVERYTHING) ---
    function loadWordDetailPage(wordName) {
        const item = dictionaryData.find(w => w.word.trim().toLowerCase() === wordName.trim().toLowerCase());
        if(!item) return;

        let meaningsHtml = item.meanings.map((m, index) => `
            <li>
                <strong>${index + 1}. ${m.definition}</strong><br>
                <em style="color:#64748b;">${m.example || ''}</em>
            </li>
        `).join('');

        let html = `
            <div class="word-entry">
                <div class="entry-header">
                    <h2>${item.word}</h2>
                    <span>${item.partOfSpeech}</span>
                </div>
                <div style="font-weight:bold; margin-bottom:0.5rem;">अर्थ व उदाहरणे:</div>
                <ol class="definitions-list">${meaningsHtml}</ol>
                <a href="#" id="backToHomeBtn" class="section-redirect-link">← मुख्य पृष्ठावर परत जा</a>
            </div>`;
        
        showPage(html, () => {
            document.getElementById('backToHomeBtn').addEventListener('click', (e) => { e.preventDefault(); loadHomepage(); });
        });
    }

    // --- Quiz Engine ---
    function setupQuizEngine(rootContext) {
        const questionBox = rootContext.querySelector('#quizQuestionBox');
        if(!questionBox) return;

        fetch('quiz.json')
            .then(res => res.json())
            .then(allQuestions => {
                let currentSet = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 5);
                let currentIdx = 0;
                let userScore = 0;
                let hasAnswered = false;

                const progress = rootContext.querySelector('#quizProgress');
                const score = rootContext.querySelector('#quizScore');
                const options = rootContext.querySelector('#quizOptionsContainer');
                const action = rootContext.querySelector('#quizActionWrapper');

                function renderQ() {
                    hasAnswered = false;
                    action.innerHTML = '';
                    options.innerHTML = '';
                    progress.innerText = `प्रश्न ${currentIdx + 1}/५`;
                    questionBox.innerText = currentSet[currentIdx].q;
                    currentSet[currentIdx].o.forEach((opt, i) => {
                        const btn = document.createElement('button');
                        btn.className = 'quiz-opt-btn';
                        btn.innerText = opt;
                        btn.addEventListener('click', () => {
                            if(hasAnswered) return;
                            hasAnswered = true;
                            if(i === currentSet[currentIdx].a) {
                                btn.classList.add('correct-flash');
                                userScore++;
                                score.innerText = `गुण: ${userScore}`;
                            } else {
                                btn.classList.add('wrong-flash');
                                options.getElementsByClassName('quiz-opt-btn')[currentSet[currentIdx].a].classList.add('correct-flash');
                            }
                            
                            const nextBtn = document.createElement('button');
                            nextBtn.className = 'quiz-next-btn';
                            if(currentIdx < 4) {
                                nextBtn.innerText = 'पुढील प्रश्न →';
                                nextBtn.addEventListener('click', () => { currentIdx++; renderQ(); });
                            } else {
                                nextBtn.innerText = 'पुढील ५ प्रश्न घ्या →';
                                nextBtn.style.backgroundColor = '#22c55e';
                                nextBtn.addEventListener('click', () => setupQuizEngine(rootContext));
                            }
                            action.appendChild(nextBtn);
                        });
                        options.appendChild(btn);
                    });
                }
                renderQ();
            });
    }

    // --- Navigation Helper Events ---
    function initializeRoutingEvents(context) {
        context.querySelectorAll('.alphabet-container span').forEach(box => box.addEventListener('click', () => renderLetterPage(box.innerText.trim())));
        const wotdLink = context.querySelector('#wotdLink');
        if(wotdLink) wotdLink.addEventListener('click', () => loadWordDetailPage(wotdLink.innerText.trim()));
    }

    function renderLetterPage(letter) {
        const matched = dictionaryData.filter(i => i.word.startsWith(letter) && !(letter === "अ" && i.word.startsWith("अं")));
        let html = `<div class="word-entry"><h2 class="headword">अक्षर: "${letter}"</h2><div class="letter-words-list-stack">`;
        matched.forEach(w => html += `<button class="word-target-btn letter-word-row-item" data-word="${w.word}">${w.word}</button>`);
        html += `</div><a href="#" id="backToGridBtn" class="section-redirect-link">← परत जा</a></div>`;
        showPage(html, () => {
            entryContainer.querySelectorAll('.word-target-btn').forEach(b => b.addEventListener('click', () => loadWordDetailPage(b.getAttribute('data-word'))));
            entryContainer.querySelector('#backToGridBtn').addEventListener('click', (e) => { e.preventDefault(); loadHomepage(); });
        });
    }

    // Standard Nav Attachments
    if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); loadHomepage(); });
    if (navWotd) navWotd.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); const item = dictionaryData[Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000) % dictionaryData.length]; loadWordDetailPage(item.word); });
    if (navQuiz) navQuiz.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); const node = cachedHomepage.cloneNode(true); showPage(node.querySelector('#quizSection'), () => setupQuizEngine(entryContainer)); });
    if (navAlphabet) navAlphabet.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); const node = cachedHomepage.cloneNode(true); showPage(node.querySelector('#alphabetSection'), () => initializeRoutingEvents(entryContainer)); });
    
    // Privacy/About pages... (kept your existing logic)
});
