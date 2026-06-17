document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const entryContainer = document.getElementById('entryContainer');
    const homepageDefault = document.getElementById('homepageDefault');
    const menuBtn = document.getElementById('menuBtn');
    const sideNav = document.getElementById('sideNav');
    const menuOverlay = document.getElementById('menuOverlay');

    let dictionaryData = [];

    // नॅव्हिगेशन मेनू चालू/बंद करणे
    function toggleMenu() {
        menuBtn.classList.toggle('active');
        sideNav.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    }

    menuBtn.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);
    window.toggleMenu = toggleMenu;

    // JSON डेटाबेस मिळवणे
    fetch('dictionary.json')
        .then(res => res.json())
        .then(data => { dictionaryData = data; })
        .catch(err => console.error("डेटाबेस लोड करताना त्रुटी आली:", err));

    // प्रगत शब्द प्रदर्शन रचना (Oxford-Style Layout for Detailed Entry)
    function renderOxfordLayout(matches) {
        entryContainer.innerHTML = '';

        if(matches.length === 0) {
            entryContainer.innerHTML = '<div class="word-entry"><p style="text-align:center; color:#64748b;">शोधलेले शब्द सापडले नाहीत.</p></div>';
            return;
        }

        matches.forEach(item => {
            let entryHTML = `
                <div class="word-entry">
                    <!-- मुख्य शब्द आणि जात -->
                    <div class="entry-header">
                        <h2 class="headword">${item.word}</h2>
                        <span class="pos">${item.partOfSpeech}</span>
                    </div>
            `;

            // १. व्याकरणिक माहिती विभाग (असल्यास)
            if (item.grammarInfo) {
                entryHTML += `
                    <div style="margin-bottom: 1.2rem; font-size: 0.95rem; background: #f8fafc; padding: 0.8rem; border-radius: 4px;">
                        <strong style="color: var(--primary-dark);">व्याकरणिक माहिती:</strong>
                        <ul style="margin: 0.3rem 0 0 0; padding-left: 1.2rem; color: #475569;">
                            ${item.grammarInfo.forms ? `<li><strong>विविध रूपे:</strong> ${item.grammarInfo.forms}</li>` : ''}
                            ${item.grammarInfo.pronunciation ? `<li><strong>उच्चार:</strong> ${item.grammarInfo.pronunciation}</li>` : ''}
                        </ul>
                    </div>
                `;
            }

            // २. अर्थ आणि उदाहरणे सूची
            entryHTML += `<div style="font-weight: bold; margin-bottom: 0.5rem; color: var(--primary-dark);">अर्थ आणि उदाहरणे:</div>`;
            entryHTML += `<ol class="definitions-list">`;
            item.meanings.forEach((m, index) => {
                entryHTML += `
                    <li>
                        <span class="definition-text">${m.definition}</span>
                        <div class="example-item">${m.example}</div>
                    </li>
                `;
                
                // पहिल्या अर्थानंतर जाहिरात स्लॉट
                if(index === 0 && item.meanings.length > 1) {
                    entryHTML += `</ol><div class="ad-placeholder">जाहिरात जागा</div><ol class="definitions-list" start="2">`;
                }
            });
            entryHTML += `</ol>`;

            // ३. वाक्प्रचार आणि म्हणी (असल्यास)
            if (item.idioms && item.idioms.length > 0) {
                entryHTML += `
                    <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
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

            // ४. व्युत्पत्ती / शब्दाचा उगम (असल्यास)
            if (item.etymology) {
                entryHTML += `
                    <div style="margin-top: 1.5rem; padding: 0.8rem; background: #f1f5f9; border-radius: 4px; font-size: 0.95rem; color: #475569;">
                        <strong>व्युत्पत्ती (शब्दाचा उगम):</strong> ${item.etymology}
                    </div>
                `;
            }

            // ५. समानार्थी आणि विरुद्धार्थी शब्द (असल्यास)
            if (item.synonyms || item.antonyms) {
                entryHTML += `
                    <div style="margin-top: 1.2rem; display: flex; gap: 1.5rem; font-size: 0.95rem; border-top: 1px dashed var(--border-light); padding-top: 0.8rem;">
                        ${item.synonyms ? `<div><strong style="color: #16a34a;">समानार्थी:</strong> ${item.synonyms}</div>` : ''}
                        ${item.antonyms ? `<div><strong style="color: #dc2626;">विरुद्धार्थी:</strong> ${item.antonyms}</div>` : ''}
                    </div>
                `;
            }

            entryHTML += `</div>`;
            entryContainer.innerHTML += entryHTML;
        });
    }

    // सर्च इनपुट इव्हेंट
    searchBar.addEventListener('input', (e) => {
        const inputVal = e.target.value.trim().toLowerCase();

        if(inputVal.length === 0) {
            entryContainer.innerHTML = '';
            entryContainer.appendChild(homepageDefault);
            return;
        }

        const exactMatches = dictionaryData.filter(item => {
            return item.word.toLowerCase().includes(inputVal);
        });

        renderOxfordLayout(exactMatches);
    });

    // --- शब्दसंग्रह चाचणी प्रणाली (मराठीत) ---
    const quizDatabase = [
        { q: "१. 'इत्यंभूत' या शब्दाचा अचूक अर्थ कोणता?", o: ["किंचित", "सविस्तर / तपशीलवार", "विस्तृत", "अपूर्ण"], a: 1 },
        { q: "२. 'ईषत' या शब्दाचा योग्य वापर ओळखा:", o: ["ईषत अभ्यासक्रम", "ईषत माहिती", "ईषत गारवा", "ईषत इतिहास"], a: 2 },
        { q: "३. 'सविस्तर' या शब्दाचा खालीलपैकी विरुद्धार्थी शब्द कोणता?", o: ["इत्यंभूत", "थोडक्यात", "विस्तृत", "स्पष्ट"], a: 1 },
        { q: "४. 'विस्तृत' या शब्दाचा योग्य समानार्थी पर्याय निवडा:", o: ["किंचित", "सखोल / सविस्तर", "विशाल / अफाट", "थोडक्यात"], a: 2 },
        { q: "५. मराठी शब्दसंग्रहात 'गारवा' हे कोणत्या प्रकारचे नाम आहे?", o: ["भाववाचक नाम", "विशेषनाम", "सामान्यनाम", "सर्वनाम"], a: 0 }
    ];

    let currentQuestionIndex = 0;
    let userScore = 0;
    let hasAnsweredCurrent = false;

    const progressText = document.getElementById('quizProgress');
    const scoreText = document.getElementById('quizScore');
    const questionBox = document.getElementById('quizQuestionBox');
    const optionsContainer = document.getElementById('quizOptionsContainer');
    const actionWrapper = document.getElementById('quizActionWrapper');

    function loadQuestion() {
        hasAnsweredCurrent = false;
        actionWrapper.innerHTML = '';
        optionsContainer.innerHTML = '';
        
        let currentQ = quizDatabase[currentQuestionIndex];
        progressText.innerText = `प्रश्न ${currentQuestionIndex + 1}/५`;
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
            scoreText.innerText = `गुण: ${userScore}`;
        } else {
            clickedButton.classList.add('wrong-flash');
            allOptionButtons[currentQ.a].classList.add('correct-flash');
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
        actionWrapper.innerHTML = `<a href="#" class="section-redirect-link" style="display:block; text-align:center;">→ अधिक सराव प्रश्न सोडवा</a>`;
    }

    loadQuestion();
});