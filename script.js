document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const entryContainer = document.getElementById('entryContainer');
    const homepageDefault = document.getElementById('homepageDefault');
    const menuBtn = document.getElementById('menuBtn');
    const sideNav = document.getElementById('sideNav');
    const menuOverlay = document.getElementById('menuOverlay');

    let dictionaryData = [];

    // Toggles side navigation open/close and transforms hamburger icon
    function toggleMenu() {
        menuBtn.classList.toggle('active');
        sideNav.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    }

    menuBtn.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);
    window.toggleMenu = toggleMenu;

    // Pull local text database JSON asynchronously 
    fetch('dictionary.json')
        .then(res => res.json())
        .then(data => { dictionaryData = data; })
        .catch(err => console.error("Database initialization error:", err));

    function renderOxfordLayout(matches) {
        entryContainer.innerHTML = '';

        if(matches.length === 0) {
            entryContainer.innerHTML = '<div class="word-entry"><p style="text-align:center; color:#64748b;">कोणतेही निकाल सापडले नाहीत. (No results found)</p></div>';
            return;
        }

        matches.forEach(item => {
            let entryHTML = `
                <div class="word-entry">
                    <div class="entry-header">
                        <h2 class="headword">${item.word}</h2>
                        <span class="pos">${item.partOfSpeech}</span>
                    </div>
                    <ol class="definitions-list">
            `;

            item.meanings.forEach((m, index) => {
                entryHTML += `
                    <li>
                        <span class="definition-text">${m.definition}</span>
                        <div class="example-item">${m.example}</div>
                    </li>
                `;
                
                if(index === 0 && item.meanings.length > 1) {
                    entryHTML += `</ol><div class="ad-placeholder">इन-लाइन जाहिरात (Content Ad Slot)</div><ol class="definitions-list" start="2">`;
                }
            });

            entryHTML += `</ol></div>`;
            entryContainer.innerHTML += entryHTML;
        });
    }

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

    // --- LIVE SYSTEM: IN-MEMORY MCQ INTERACTIVE QUIZ ENGINE ---
    const quizDatabase = [
        { q: "१. 'इत्यंभूत' या शब्दाचा अचूक अर्थ कोणता?", o: ["किंचित", "सविस्तर / तपशीलवार", "विस्तृत", "अपूर्ण"], a: 1 },
        { q: "२. 'ईषत' या शब्दाचा योग्य वापर ओळखा:", o: ["ईषत अभ्यासक्रम", "ईषत माहिती", "ईषत गारवा", "ईषत इतिहास"], a: 2 },
        { q: "३. 'सविस्तर' या शब्दाचा खालीलपैकी विरुद्धार्थी शब्द कोणता?", o: ["इत्यंभूत", "थोडक्यात", "विस्तृत", "स्पष्ट"], a: 1 },
        { q: "४. 'विस्तृत' चा समानार्थी इंग्रजी शब्द निवडा:", o: ["Slightly", "In-depth", "Vast / Extensive", "Brief"], a: 2 },
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
        if (currentQuestionIndex < quizDatabase.length - 1) {
            actionBtn.className = 'quiz-next-btn';
            actionBtn.innerText = 'पुढील प्रश्न →';
            actionBtn.addEventListener('click', () => {
                currentQuestionIndex++;
                loadQuestion();
            });
        } else {
            actionBtn.className = 'quiz-next-btn';
            actionBtn.style.backgroundColor = '#22c55e';
            actionBtn.innerText = 'चाचणी पूर्ण करा';
            actionBtn.addEventListener('click', displayQuizSummary);
        }
        actionWrapper.appendChild(actionBtn);
    }

    function displayQuizSummary() {
        questionBox.innerText = `चाचणी पूर्ण झाली! तुमचा एकूण निकाल: ${userScore}/५`;
        optionsContainer.innerHTML = '';
        actionWrapper.innerHTML = `<a href="#" class="section-redirect-link" style="display:block; text-align:center;">→ अधिक सराव प्रश्न सोडवा (See More Quizzes)</a>`;
    }

    // Launch Quiz Game
    loadQuestion();
});