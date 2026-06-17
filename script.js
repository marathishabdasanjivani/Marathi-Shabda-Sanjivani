document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const entryContainer = document.getElementById('entryContainer');
    const homepageDefault = document.getElementById('homepageDefault');
    const menuBtn = document.getElementById('menuBtn');
    const sideNav = document.getElementById('sideNav');
    const menuOverlay = document.getElementById('menuOverlay');

    // Menu View Interactivity
    function toggleMenu() {
        menuBtn.classList.toggle('active');
        sideNav.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    }
    menuBtn.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);
    window.toggleMenu = toggleMenu;

    // --- PHASE 1: MOBILE IN-MEMORY QUIZ DATABASE & LOGIC ---
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
        if (hasAnsweredCurrent) return; // Prevent multiple clicks
        hasAnsweredCurrent = true;

        const currentQ = quizDatabase[currentQuestionIndex];
        const allOptionButtons = optionsContainer.getElementsByClassName('quiz-opt-btn');

        if (selectedIndex === currentQ.a) {
            clickedButton.classList.add('correct-flash');
            userScore++;
            scoreText.innerText = `गुण: ${userScore}`;
        } else {
            clickedButton.classList.add('wrong-flash');
            // Show the user where the right answer was
            allOptionButtons[currentQ.a].classList.add('correct-flash');
        }

        // Show navigation action triggers
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

    // Initialize Quiz System
    loadQuestion();

    // --- ALPHABET ROUTING INITIALIZATION PLACEHOLDER ---
    const alphabetSpans = document.querySelectorAll('.alphabet-row span');
    alphabetSpans.forEach(span => {
        span.addEventListener('click', () => {
            alert(`Phase 2 मध्ये '${span.innerText}' अक्षराची शब्दसूची जोडली जाईल.`);
        });
    });
});