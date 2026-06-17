document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const wordsContainer = document.getElementById('wordsContainer');
    const homepageFeatures = document.getElementById('homepageFeatures');
    const menuBtn = document.getElementById('menuBtn');
    const sideNav = document.getElementById('sideNav');
    const menuOverlay = document.getElementById('menuOverlay');

    let vocabularyData = [];

    // Smooth Menu Toggle Operations
    function toggleMenu() {
        menuBtn.classList.toggle('active');
        sideNav.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    }
    menuBtn.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);
    window.toggleMenu = toggleMenu;

    // Fetch vocabulary text data
    fetch('dictionary.json')
        .then(response => response.json())
        .then(data => { vocabularyData = data; })
        .catch(err => console.error("Error loading library profiles:", err));

    // Dynamic Live Search Rendering
    function renderSearchResults(results) {
        wordsContainer.innerHTML = '';
        if (results.length === 0) {
            wordsContainer.innerHTML = '<div class="premium-card"><p style="text-align:center; color:#888; margin:0;">क्षमस्व, कोणताही शब्द सापडला नाही. (No words found)</p></div>';
            return;
        }
        results.forEach(item => {
            wordsContainer.innerHTML += `
                <div class="premium-card">
                    <h2>${item.word}</h2>
                    <span class="tag">${item.partOfSpeech} | ${item.shortMeaning}</span>
                    <p class="long-def">${item.longDefinition}</p>
                    <div class="ex-box"><strong>उदा.</strong> ${item.example}</div>
                </div>
            `;
        });
    }

    searchBar.addEventListener('input', (e) => {
        const text = e.target.value.trim().toLowerCase();
        if (text.length === 0) {
            wordsContainer.innerHTML = '';
            homepageFeatures.style.display = 'flex';
            return;
        }
        homepageFeatures.style.display = 'none';
        const filtered = vocabularyData.filter(item => {
            return item.word.toLowerCase().includes(text) || item.shortMeaning.toLowerCase().includes(text);
        });
        renderSearchResults(filtered);
    });

    // --- MINI QUIZ MANAGEMENT LOOP ---
    const quizDatabase = [
        { q: "१. 'इत्यंभूत' या शब्दाचा अचूक अर्थ कोणता?", o: ["किंचित", "सविस्तर / तपशीलवार", "विस्तृत", "अपूर्ण"], a: 1 },
        { q: "२. 'ईषत' या शब्दाचा योग्य वापर ओळखा:", o: ["ईषत अभ्यासक्रम", "ईषत माहिती", "ईषत गारवा", "ईषत इतिहास"], a: 2 },
        { q: "३. 'सविस्तर' या शब्दाचा विरुद्धार्थी शब्द कोणता?", o: ["इत्यंभूत", "थोडक्यात", "विस्तृत", "स्पष्ट"], a: 1 },
        { q: "४. 'विस्तृत' चा समानार्थी इंग्रजी शब्द निवडा:", o: ["Slightly", "In-depth", "Vast / Extensive", "Brief"], a: 2 },
        { q: "५. मराठी शब्दसंग्रहात 'गारवा' हे कोणत्या प्रकारचे नाम आहे?", o: ["भाववाचक नाम", "विशेषनाम", "सामान्यनाम", "सर्वनाम"], a: 0 }
    ];

    let currentQuestionIndex = 0;
    let userScore = 0;
    let hasAnswered = false;

    const progressText = document.getElementById('quizProgress');
    const scoreText = document.getElementById('quizScore');
    const questionBox = document.getElementById('quizQuestionBox');
    const optionsContainer = document.getElementById('quizOptionsContainer');
    const actionWrapper = document.getElementById('quizActionWrapper');

    function loadQuestion() {
        hasAnswered = false;
        actionWrapper.innerHTML = '';
        optionsContainer.innerHTML = '';
        
        let currentQ = quizDatabase[currentQuestionIndex];
        progressText.innerText = `प्रश्न ${currentQuestionIndex + 1}/५`;
        questionBox.innerText = currentQ.q;

        currentQ.o.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'quiz-opt-btn';
            button.innerText = option;
            button.addEventListener('click', () => {
                if (hasAnswered) return;
                hasAnswered = true;
                if (index === currentQ.a) {
                    button.classList.add('correct-flash');
                    userScore++;
                    scoreText.innerText = `गुण: ${userScore}`;
                } else {
                    button.classList.add('wrong-flash');
                    optionsContainer.getElementsByClassName('quiz-opt-btn')[currentQ.a].classList.add('correct-flash');
                }
                
                const nextBtn = document.createElement('button');
                nextBtn.className = 'quiz-next-btn';
                if (currentQuestionIndex < quizDatabase.length - 1) {
                    nextBtn.innerText = 'पुढील प्रश्न →';
                    nextBtn.addEventListener('click', () => { currentQuestionIndex++; loadQuestion(); });
                } else {
                    nextBtn.innerText = 'पूर्ण करा';
                    nextBtn.addEventListener('click', () => {
                        questionBox.innerText = `चाचणी पूर्ण झाली! निकाल: ${userScore}/५`;
                        optionsContainer.innerHTML = '';
                        actionWrapper.innerHTML = `<a href="#" class="section-redirect-link">→ अधिक सराव प्रश्न सोडवा (See More Quizzes)</a>`;
                    });
                }
                actionWrapper.appendChild(nextBtn);
            });
            optionsContainer.appendChild(button);
        });
    }
    loadQuestion();
});