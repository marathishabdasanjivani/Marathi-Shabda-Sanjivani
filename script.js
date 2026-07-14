document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const searchDropdown = document.getElementById('searchDropdown');
    const entryContainer = document.getElementById('entryContainer');
    const homepageDefault = document.getElementById('homepageDefault');
    const menuBtn = document.getElementById('menuBtn');
    const sideNav = document.getElementById('sideNav');
    const menuOverlay = document.getElementById('menuOverlay');
    const cachedHomepage = homepageDefault.cloneNode(true);

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

    // --- NEW: WOTD Helper Function ---
    // This function scrambles the alphabetical order using a prime multiplier
    // so the word is "random" but stays consistent for the entire day.
    function getWOTD(offsetDays = 0) {
        if (dictionaryData.length === 0) return null;
        const now = new Date();
        now.setDate(now.getDate() - offsetDays);
        const epochDay = Math.floor(now.getTime() / 86400000);
        const randomIndex = (epochDay * 997) % dictionaryData.length;
        return dictionaryData[randomIndex];
    }
    // ---------------------------------

    function toggleMenu() {
        menuBtn.classList.toggle('active');
        sideNav.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

    // Helper to ensure Quiz Title exists with correct .section-title-badge styling
    function ensureQuizTitle(container) {
        const quizSection = container.querySelector('#quizSection');
        if (quizSection && !quizSection.querySelector('.section-title-badge')) {
            const title = document.createElement('div');
            title.className = 'section-title-badge'; 
            title.innerText = 'शब्दसंग्रह चाचणी';
            quizSection.prepend(title);
        }
    }

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
        
        // Reset Search UI when a new page is shown
        if (searchDropdown) searchDropdown.style.display = 'none';
        if (searchBar) searchBar.value = '';
    }

    function loadHomepage() {
        const homeNode = cachedHomepage.cloneNode(true);
        
        ensureQuizTitle(homeNode);

        // WOTD: Daily random word fetch logic (Updated to use randomized getWOTD)
        if (dictionaryData.length > 0) {
            const dailyWord = getWOTD(0);
            const link = homeNode.querySelector('#wotdLink');
            const def = homeNode.querySelector('#wotdDefinition');
            if (link) link.innerText = dailyWord.word;
            if (def) def.innerText = dailyWord.meanings[0].definition;
        }
        
        showPage(homeNode, null);
        initializeRoutingEvents(homeNode);
        setupQuizEngine(homeNode);
        history.pushState({ view: "home" }, "", "index.html"); 
    }

    // Quiz Engine
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
                </div>`;

        if (item.grammarInfo) {
            wordHTML += `
                <div style="margin-bottom: 1.2rem; font-size: 0.95rem; background: #f8fafc; padding: 0.8rem; border-radius: 4px;">
                    <strong style="color: var(--primary-dark);">व्याकरणिक माहिती:</strong>
                    <ul style="margin: 0.3rem 0 0 0; padding-left: 1.2rem; color: #475569;">
                        ${item.grammarInfo.forms ? `<li><strong>विविध रूपे:</strong> ${item.grammarInfo.forms}</li>` : ''}
                        ${item.grammarInfo.pronunciation ? `<li><strong>उच्चार:</strong> ${item.grammarInfo.pronunciation}</li>` : ''}
                    </ul>
                </div>`;
        }

        wordHTML += `<div style="font-weight: bold; margin-bottom: 0.5rem; color: var(--primary-dark);">अर्थ आणि उदाहरण:</div>`;
        item.meanings.forEach((m, index) => {
            if (index > 0) wordHTML += `</ol></div><div class="word-entry"><ol class="definitions-list" start="${index + 1}">`;
            else wordHTML += `<ol class="definitions-list">`;
            wordHTML += `<li><span class="definition-text">${m.definition}</span><div class="example-item">${m.example}</div></li>`;
        });
        wordHTML += `</ol></div>`;

        if (item.idioms && item.idioms.length > 0) {
            wordHTML += `
                <div class="word-entry">
                    <strong style="color: var(--primary-dark); display: block; margin-bottom: 0.5rem;">वाक्प्रचार आणि म्हणी:</strong>
                    <ul style="margin: 0; padding-left: 1.2rem;">
                        ${item.idioms.map(idm => `
                            <li style="margin-bottom: 0.8rem; font-size: 1.05rem;">
                                <strong style="color: #000;">${idm.phrase}</strong>
                                <span style="display:block; font-size: 0.95rem; color: #475569; margin: 0.2rem 0;">• अर्थ: ${idm.meaning}</span>
                                <span style="display:block; font-size: 0.95rem; color: #64748b; font-style: italic;">• उदाहरण: ${idm.example}</span>
                            </li>`).join('')}
                    </ul>
                </div>`;
        }

        if (item.etymology || item.synonyms || item.antonyms) {
            wordHTML += `<div class="word-entry" style="margin-top: 1.5rem;">`;
            if (item.etymology) wordHTML += `<div style="margin-bottom: 1.2rem; padding: 0.8rem; background: #f1f5f9; border-radius: 4px; font-size: 0.95rem; color: #475569;"><strong>व्युत्पत्ती (शब्दाचा उगम):</strong> ${item.etymology}</div>`;
            if (item.synonyms || item.antonyms) {
                wordHTML += `
                    <div style="display: flex; gap: 1.5rem; font-size: 0.95rem; border-top: 1px dashed var(--border-light); padding-top: 0.8rem;">
                        ${item.synonyms ? `<div><strong style="color: #16a34a;">समानार्थी:</strong> ${item.synonyms}</div>` : ''}
                        ${item.antonyms ? `<div><strong style="color: #dc2626;">विरुद्धार्थी:</strong> ${item.antonyms}</div>` : ''}
                    </div>`;
            }
            wordHTML += `</div>`;
        }

        showPage(wordHTML, null);
        if (pushState) history.pushState({ view: "word-detail", word: item.word }, "", `?word=${item.word}`);
    }
    
    function renderLetterPage(letter, pushState = true) {
        const matched = dictionaryData.filter(i => i.word.startsWith(letter) && !(letter === "अ" && i.word.startsWith("अं")));
        let html = `<div class="word-entry"><h2 class="headword">अक्षर: "${letter}"</h2><div class="letter-words-list-stack">`;
        matched.forEach(w => html += `<button class="word-target-btn letter-word-row-item" data-word="${w.word}">${w.word}</button>`);
        html += `</div><a href="#" id="backToGridBtn" class="section-redirect-link">← परत जा</a></div>`;
        
        showPage(html, () => {
            entryContainer.querySelectorAll('.word-target-btn').forEach(b => b.addEventListener('click', () => loadWordDetailPage(b.getAttribute('data-word'), true)));
            entryContainer.querySelector('#backToGridBtn').addEventListener('click', (e) => { e.preventDefault(); loadHomepage(); });
        });
        if (pushState) history.pushState({ view: "letter-page", letter: letter }, "", `?letter=${letter}`);
    }

    if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); loadHomepage(); });
    
    // Updated WOTD navigation (Now includes Previous Days logic)
    if (navWotd) navWotd.addEventListener('click', (e) => { 
        e.preventDefault(); 
        toggleMenu(); 
        const node = cachedHomepage.cloneNode(true); 
        
        if (dictionaryData.length > 0) {
            // Set Today's Word
            const dailyWord = getWOTD(0);
            const link = node.querySelector('#wotdLink');
            const def = node.querySelector('#wotdDefinition');
            if (link) link.innerText = dailyWord.word;
            if (def) def.innerText = dailyWord.meanings[0].definition;

            // Dynamically create the "Previous Words" section directly via JS
            let wotdSection = node.querySelector('#wordOfTheDaySection');
            if (wotdSection) {
                let prevContainer = document.createElement('div');
                prevContainer.style.marginTop = '2.5rem';
                prevContainer.style.paddingTop = '1.5rem';
                prevContainer.style.borderTop = '1px dashed var(--border-light, #e2e8f0)';
                
                let prevHTML = `<div style="font-weight: bold; margin-bottom: 1rem; color: var(--primary-dark); font-size: 1.1rem;">मागील दिवसांचे शब्द:</div><div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">`;
                
                for (let i = 1; i <= 5; i++) {
                    const pastWord = getWOTD(i);
                    if (pastWord) {
                        prevHTML += `<button class="word-target-btn letter-word-row-item" data-word="${pastWord.word}" style="font-size:0.95rem; padding:0.5rem 0.9rem; margin:0;">${pastWord.word}</button>`;
                    }
                }
                prevHTML += `</div>`;
                prevContainer.innerHTML = prevHTML;
                wotdSection.appendChild(prevContainer);
            }
        }

        showPage(node.querySelector('#wordOfTheDaySection'), () => {
            initializeRoutingEvents(entryContainer);
            // Attach click listeners to the dynamically generated Past Words buttons
            entryContainer.querySelectorAll('.word-target-btn').forEach(btn => {
                btn.addEventListener('click', () => loadWordDetailPage(btn.getAttribute('data-word'), true));
            });
        }); 
    });
    
    // Quiz navigation
    if (navQuiz) navQuiz.addEventListener('click', (e) => { 
        e.preventDefault(); 
        toggleMenu(); 
        const node = cachedHomepage.cloneNode(true); 
        ensureQuizTitle(node); 
        showPage(node.querySelector('#quizSection'), () => setupQuizEngine(entryContainer)); 
    });
    
    if (navAlphabet) navAlphabet.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); const node = cachedHomepage.cloneNode(true); showPage(node.querySelector('#alphabetSection'), () => initializeRoutingEvents(entryContainer)); });
    
    // Search Bar Logic (Restored)
    if (searchBar && searchDropdown) {
        searchBar.addEventListener('input', (e) => {
            const inputVal = e.target.value.trim().toLowerCase();
            if (inputVal.length === 0) {
                searchDropdown.innerHTML = '';
                searchDropdown.style.display = 'none';
                return;
            }
            const matches = dictionaryData.filter(item => {
                const wordLow = item.word.toLowerCase();
                if (inputVal === "अ" && wordLow.startsWith("अं")) return false;
                return wordLow.startsWith(inputVal);
            });
            if (matches.length === 0) {
                searchDropdown.innerHTML = `<div style="padding: 0.8rem; color: #64748b; font-size: 0.95rem; text-align: center;">शब्द सापडले नाहीत.</div>`;
            } else {
                searchDropdown.innerHTML = matches.map(item => `
                    <div class="dropdown-row-item" data-word="${item.word}">
                        ${item.word} <span style="font-size:0.8rem; font-weight:normal; color:#64748b; margin-left:0.5rem;">(${item.partOfSpeech})</span>
                    </div>`).join('');
            }
            searchDropdown.className = 'search-dropdown-list';
            searchDropdown.style.display = 'block';
            searchDropdown.querySelectorAll('.dropdown-row-item').forEach(row => {
                row.addEventListener('click', () => { loadWordDetailPage(row.getAttribute('data-word'), true); });
            });
        });
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });
    }

    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
            if (event.state.view === 'home') {
                loadHomepage();
            } else if (event.state.view === 'word-detail') {
                loadWordDetailPage(event.state.word, false);
            } else if (event.stat