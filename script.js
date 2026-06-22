document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const searchDropdown = document.getElementById('searchDropdown');
    const entryContainer = document.getElementById('entryContainer');
    const homepageDefault = document.getElementById('homepageDefault');
    const menuBtn = document.getElementById('menuBtn');
    const sideNav = document.getElementById('sideNav');
    const menuOverlay = document.getElementById('menuOverlay');
    const siteBrandGroup = document.getElementById('siteBrandGroup');

    // Sidebar Links
    const navHome = document.getElementById('navHome');
    const navAlphabet = document.getElementById('navAlphabet');
    const navQuiz = document.getElementById('navQuiz');
    const navWotd = document.getElementById('navWotd');

    let dictionaryData = [];
    // Keep track of the current viewed letter for accurate back-navigation targeting
    let currentActiveLetter = null;

    // Clone templates to keep homepage state cached safely in memory
    const cachedHomepage = homepageDefault.cloneNode(true);

    function toggleMenu() {
        menuBtn.classList.toggle('active');
        sideNav.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

    // Load Database Array
    fetch('dictionary.json')
        .then(res => res.json())
        .then(data => { 
            dictionaryData = data; 
            initializeRoutingEvents(document); // Init first page
            setupQuizEngine(document); 
        })
        .catch(err => console.error("डेटाबेस लोड करताना त्रुटी आली:", err));

    // --- Dynamic Routing Control System ---
    function showPage(elementHTML, onRenderCallback = null, pageStateObj = null) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        entryContainer.innerHTML = '';
        
        if (typeof elementHTML === 'string') {
            entryContainer.innerHTML = elementHTML;
        } else {
            entryContainer.appendChild(elementHTML);
        }

        if (onRenderCallback) onRenderCallback();
        if (searchDropdown) searchDropdown.style.display = 'none';
        if (searchBar) searchBar.value = '';

        // Safely push state info history sequence if custom object is attached
        if (pageStateObj) {
            history.pushState(pageStateObj, "");
        }
    }

    function loadHomepage(pushState = true) {
        currentActiveLetter = null;
        const homeNode = cachedHomepage.cloneNode(true);
        showPage(homeNode, null, pushState ? { view: "home" } : null);
        initializeRoutingEvents(homeNode);
        setupQuizEngine(homeNode);
    }

    // Monitor back actions universally using custom window state pop listener tags
    window.addEventListener('popstate', (event) => {
        if (!event.state || event.state.view === "home") {
            loadHomepage(false);
        } else if (event.state.view === "alphabet-list") {
            // Re-render the exact letter list instead of breaking back to home view loop
            renderLetterPage(event.state.letter, false);
        } else if (event.state.view === "word-detail") {
            loadWordDetailPage(event.state.word, false);
        }
    });

    // Baseline historical stack state setup
    history.replaceState({ view: "home" }, "");

    if (siteBrandGroup) siteBrandGroup.addEventListener('click', () => loadHomepage(true));
    if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); loadHomepage(true); });

    // Handle specific standalone component paths
    if (navWotd) {
        navWotd.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
            const node = cachedHomepage.cloneNode(true);
            const section = node.querySelector('#wordOfTheDaySection');
            showPage(section, null, { view: "wotd-isolated" });
            initializeRoutingEvents(entryContainer);
        });
    }

    if (navQuiz) {
        navQuiz.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
            const node = cachedHomepage.cloneNode(true);
            const section = node.querySelector('#quizSection');
            showPage(section, () => { setupQuizEngine(entryContainer); }, { view: "quiz-isolated" });
        });
    }

    if (navAlphabet) {
        navAlphabet.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
            const node = cachedHomepage.cloneNode(true);
            const section = node.querySelector('#alphabetSection');
            showPage(section, () => { initializeRoutingEvents(entryContainer); }, { view: "alphabet-grid" });
        });
    }

    // Wire up events for embedded elements dynamically
    function initializeRoutingEvents(context) {
        // Alphabet Letter Selection Page Handler
        const letterBoxes = context.querySelectorAll('.alphabet-container span');
        letterBoxes.forEach(box => {
            box.style.cursor = 'pointer';
            box.addEventListener('click', () => {
                const selectedLetter = box.innerText.trim();
                renderLetterPage(selectedLetter, true);
            });
        });

        // WOTD text links
        const wotdLink = context.querySelector('#wotdLink');
        if(wotdLink) {
            wotdLink.addEventListener('click', () => { loadWordDetailPage(wotdLink.innerText.trim(), true); });
        }
        const viewAllWotdLink = context.querySelector('#viewAllWotdLink');
        if(viewAllWotdLink) {
            viewAllWotdLink.addEventListener('click', (e) => {
                e.preventDefault();
                const node = cachedHomepage.cloneNode(true);
                showPage(node.querySelector('#wordOfTheDaySection'), () => { initializeRoutingEvents(entryContainer); }, { view: "wotd-section-view" });
            });
        }
    }

    // --- Page 1: Standalone Alphabet Letter Category Page ---
    function renderLetterPage(letter, pushState = true) {
        currentActiveLetter = letter;
        
        // Matches only words that strictly start with the requested letter
        const matchedWords = dictionaryData.filter(item => {
            const wordStr = item.word.trim();
            // Match strict start and guard against separate distinct vowels like checking 'अ' vs 'अं'
            if (letter === "अ" && wordStr.startsWith("अं")) return false;
            return wordStr.startsWith(letter);
        });
        
        // Sort the matched list alphabetically in Marathi
        matchedWords.sort((a, b) => a.word.localeCompare(b.word, 'mr'));
        
        let letterPageHTML = `
            <div class="word-entry">
                <h2 class="headword entry-letter-title">अक्षर सूची: "${letter}"</h2>
        `;

        if (matchedWords.length === 0) {
            letterPageHTML += `<p style="color: #64748b; margin-top: 1.5rem;">या अक्षराचे शब्द अजून उपलब्ध नाहीत.</p>`;
        } else {
            letterPageHTML += `<div class="letter-words-list-stack">`;
            matchedWords.forEach(w => {
                letterPageHTML += `<button class="word-target-btn letter-word-row-item" data-word="${w.word}">${w.word}</button>`;
            });
            letterPageHTML += `</div>`;
        }

        letterPageHTML += `
                <a href="#" id="backToGridBtn" class="section-redirect-link" style="display: inline-block; margin-top: 2rem;">← मुख्य सूचीकडे परत जा</a>
            </div>
        `;

        showPage(letterPageHTML, () => {
            // Bind navigation click triggers to buttons
            entryContainer.querySelectorAll('.word-target-btn').forEach(btn => {
                btn.addEventListener('click', () => { loadWordDetailPage(btn.getAttribute('data-word'), true); });
            });
            entryContainer.querySelector('#backToGridBtn').addEventListener('click', (e) => {
                e.preventDefault();
                loadHomepage(true);
            });
        }, pushState ? { view: "alphabet-list", letter: letter } : null);
    }

    // --- Page 2: Standalone Full Word Detail Page ---
    function loadWordDetailPage(wordName, pushState = true) {
        const item = dictionaryData.find(w => w.word.trim().toLowerCase() === wordName.trim().toLowerCase());
        if(!item) return;

        // Word View Ad Format Layout: Search Bar -> Ad Slot -> Word and first definition
        let wordHTML = `
            <div class="ad-placeholder banner-ad">जाहिरात जागा (Ad Slot)</div>
            <div class="word-entry">
                <div class="entry-header">
                    <h2 class="headword">${item.word}</h2>
                    <span class="pos">${item.partOfSpeech}</span>
                </div>
        `;

        if (item.grammarInfo) {
            wordHTML += `
                <div style="margin-bottom: 1.2rem; font-size: 0.95rem; background: #f8fafc; padding: 0.8rem; border-radius: 4px;">
                    <strong style="color: var(--primary-dark);">व्याकरणिक माहिती:</strong>
                    <ul style="margin: 0.3rem 0 0 0; padding-left: 1.2rem; color: #475569;">
                        ${item.grammarInfo.forms ? `<li><strong>विविध रूपे:</strong> ${item.grammarInfo.forms}</li>` : ''}
                        ${item.grammarInfo.pronunciation ? `<li><strong>उच्चार:</strong> ${item.grammarInfo.pronunciation}</li>` : ''}
                    </ul>
                </div>
            `;
        }

        wordHTML += `<div style="font-weight: bold; margin-bottom: 0.5rem; color: var(--primary-dark);">अर्थ आणि उदाहरणे:</div>`;
        
        // Loop over the definitions to insert an ad slot between each one as a separator
        item.meanings.forEach((m, index) => {
            if (index > 0) {
                wordHTML += `</ol></div><div class="ad-placeholder banner-ad">जाहिरात जागा (Ad Slot)</div><div class="word-entry"><ol class="definitions-list" start="${index + 1}">`;
            } else {
                wordHTML += `<ol class="definitions-list">`;
            }
            
            wordHTML += `
                <li>
                    <span class="definition-text">${m.definition}</span>
                    <div class="example-item">${m.example}</div>
                </li>
            `;
        });
        wordHTML += `</ol></div>`;

        // Add separator ad slot before Vakyaprachar/Idioms section if it exists
        if (item.idioms && item.idioms.length > 0) {
            wordHTML += `
                <div class="ad-placeholder banner-ad">जाहिरात जागा (Ad Slot)</div>
                <div class="word-entry">
                    <strong style="color: var(--primary-dark); display: block; margin-bottom: 0.5rem;">वाक्प्रचार आणि म्हणी:</strong>
                    <ul style="margin: 0; padding-left: 1.2rem;">
                        ${item.idioms.map(idm => `
                            <li style="margin-bottom: 0.8rem; font-size: 1.05rem;">
                                <strong style="color: #000;">${idm.phrase}</strong>
                                <span style="display:block; font-size: 0.95rem; color: #475569; margin: 0.2rem 0;">• अर्थ: ${idm.meaning}</span>
                                <span style="display:block; font-size: 0.95rem; color: #64748b; font-style: italic;">• उदाहरण: ${idm.example}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (item.etymology || item.synonyms || item.antonyms) {
            wordHTML += `<div class="word-entry" style="margin-top: 1.5rem;">`;
            if (item.etymology) {
                wordHTML += `
                    <div style="margin-bottom: 1.2rem; padding: 0.8rem; background: #f1f5f9; border-radius: 4px; font-size: 0.95rem; color: #475569;">
                        <strong>व्युत्पत्ती (शब्दाचा उगम):</strong> ${item.etymology}
                    </div>
                `;
            }

            if (item.synonyms || item.antonyms) {
                wordHTML += `
                    <div style="display: flex; gap: 1.5rem; font-size: 0.95rem; border-top: 1px dashed var(--border-light); padding-top: 0.8rem;">
                        ${item.synonyms ? `<div><strong style="color: #16a34a;">समानार्थी:</strong> ${item.synonyms}</div>` : ''}
                        ${item.antonyms ? `<div><strong style="color: #dc2626;">विरुद्धार्थी:</strong> ${item.antonyms}</div>` : ''}
                    </div>
                `;
            }
            wordHTML += `</div>`;
        }

        showPage(wordHTML, null, pushState ? { view: "word-detail", word: wordName } : null);
    }

    // --- Search Dropdown Engine Hook ---
    if (searchBar && searchDropdown) {
        searchBar.addEventListener('input', (e) => {
            const inputVal = e.target.value.trim().toLowerCase();

            if (inputVal.length === 0) {
                searchDropdown.innerHTML = '';
                searchDropdown.style.display = 'none';
                return;
            }

            // Strictly filter using startsWith, separate distinct vowels like 'अ' vs 'अं'
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
                    </div>
                `).join('');
            }

            // Sync structural class name from CSS
            searchDropdown.className = 'search-dropdown-list';
            searchDropdown.style.display = 'block';

            searchDropdown.querySelectorAll('.dropdown-row-item').forEach(row => {
                row.addEventListener('click', () => {
                    loadWordDetailPage(row.getAttribute('data-word'), true);
                });
            });
        });

        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });
    }

    // --- Quiz Engine Instance Factory ---
    function setupQuizEngine(rootContext) {
        const quizDatabase = [
            { 
                q: "१. खालीलपैकी कुठला शब्द 'कमी मीठ किंवा मीठ नसलेले जेवण' हा अर्थ दर्शवण्यासाठी अगदी अचूक बसेल?\n\n“भाजीत मीठ टाकायला विसरल्यामुळे, आजचे जेवण सर्वांनाच ________ वाटले.”", 
                o: ["(अ) अळणी", "(ब) आर्तहाक", "(क) इत्यंभूत", "(ड) ईषत"], 
                a: 0 
            },
            { 
                q: "२. खालीलपैकी कुठला शब्द संकटात किंवा तीव्र वेदनेत मारलेल्या हाकेला दर्शवण्यासाठी वापरला जातो?\n\n“संकटात सापडलेल्या त्या पाखराने दिलेली ________ ऐकून, शिकारीसुद्धा क्षणभर थांबला.”", 
                o: ["(अ) अळणी", "(ब) आर्तहाक", "(क) इत्यंभूत", "(ड) ईषत"], 
                a: 1 
            },
            { 
                q: "३. खालीलपैकी कुठला शब्द 'सुरुवातीपासून शेवटपर्यंत सविस्तर' या अर्थासाठी वापरला जातो?\n\n“पोलिसांनी चोराला पकडल्यानंतर, त्याने गुन्ह्याची ________ माहिती त्यांना दिली.”", 
                o: ["(अ) अळणी", "(ब) आर्तहाक", "(क) इत्यंभूत", "(ड) ईषत"], 
                a: 2 
            },
            { 
                q: "४. खालीलपैकी कुठला शब्द 'किंचित किंवा अगदी थोडेसे' हा अर्थ स्पष्ट करण्यासाठी योग्य ठरेल?\n\n“त्याच्या त्या गंभीर चेहऱ्यावर अचानक उमललेले ________ हास्य बरेच काही सांगून गेले.”", 
                o: ["(अ) अळणी", "(ब) आर्तहाक", "(क) इत्यंभूत", "(ड) ईषत"], 
                a: 3 
            },
            { 
                q: "५. खालीलपैकी कुठला शब्द 'जाणीवपूर्वक केलेले दुर्लक्ष किंवा हेळसांड' या अर्थाला पूर्ण करतो?\n\n“रात्रंदिवस मेहनत करूनही समाजाकडून होणारी आपली ________ पाहून त्या कलाकाराचे मन खिन्न झाले.”", 
                o: ["(अ) उपेक्षा", "(ब) ऊरभरून", "(क) एकटाकी", "(ड) ऐनमेळ"], 
                a: 0 
            }
        ];

        let currentQuestionIndex = 0;
        let userScore = 0;
        let hasAnsweredCurrent = false;

        const progressText = rootContext.querySelector('#quizProgress');
        const scoreText = rootContext.querySelector('#quizScore');
        const questionBox = rootContext.querySelector('#quizQuestionBox');
        const optionsContainer = rootContext.querySelector('#quizOptionsContainer');
        const actionWrapper = rootContext.querySelector('#quizActionWrapper');

        if(!questionBox) return;

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
                button.addEventListener('click', () => handleOptionSelection(index, button));
                optionsContainer.appendChild(button);
            });
        }

        function handleOptionSelection(selectedIndex, clickedButton) {
            if (hasAnsweredCurrent) return;
            hasAnsweredCurrent = true;

            const currentQ = quizDatabase[currentQuestionIndex];
            const allOptionButtons = optionsContainer.getElementsByClassName('quiz-opt-btn');

            if (selectedIndex === currentQ.a) {
                clickedButton.classList.add('correct-flash');
                userScore++;
                if (scoreText) scoreText.innerText = `गुण: ${userScore}`;
            } else {
                clickedButton.classList.add('wrong-flash');
                if (allOptionButtons[currentQ.a]) allOptionButtons[currentQ.a].classList.add('correct-flash');
            }

            const actionBtn = document.createElement('button');
            actionBtn.className = 'quiz-next-btn';
            if (currentQuestionIndex < quizDatabase.length - 1) {
                actionBtn.innerText = 'पुढील प्रश्न →';
                actionBtn.addEventListener('click', () => {
                    currentQuestionIndex++;
                    loadQuestion();
                });
            } else {
                actionBtn.style.backgroundColor = '#22c55e';
                actionBtn.innerText = 'चाचणी पूर्ण करा';
                actionBtn.addEventListener('click', displayQuizSummary);
            }
            actionWrapper.appendChild(actionBtn);
        }

        function displayQuizSummary() {
            questionBox.innerText = `चाचणी पूर्ण झाली! तुमचा एकूण निकाल: ${userScore}/५`;
            optionsContainer.innerHTML = '';
            actionWrapper.innerHTML = `<a href="#" id="retryQuizBtn" class="section-redirect-link" style="display:block; text-align:center;">→ पुन्हा प्रयत्न करा</a>`;
            rootContext.querySelector('#retryQuizBtn').addEventListener('click', (e) => {
                e.preventDefault();
                setupQuizEngine(rootContext);
            });
        }

        loadQuestion();
    }
});
