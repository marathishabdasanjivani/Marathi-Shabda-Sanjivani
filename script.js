// Your initial database of words
const vocabularyData = [
    { word: "इत्यंभूत", meaning: "Detailed / In-depth", example: "त्याने मला घटनेची इत्यंभूत माहिती दिली." },
    { word: "ईषत", meaning: "Slightly / A little", example: "आज हवेत ईषत गारवा आहे." },
    { word: "सविस्तर", meaning: "In detail / Elaborately", example: "हा मुद्दा सविस्तर समजून घ्या." },
    { word: "विस्तृत", meaning: "Vast / Extensive", example: "हा एक विस्तृत अभ्यासक्रम आहे." }
];

// SAFETY SHIELD: Forces the app to wait until the screen elements exist
document.addEventListener('DOMContentLoaded', () => {
    
    const searchBar = document.getElementById('searchBar');
    const wordsContainer = document.getElementById('wordsContainer');

    // Function to render cards on screen
    function renderWords(words) {
        wordsContainer.innerHTML = '';
        
        if(words.length === 0) {
            wordsContainer.innerHTML = '<p style="text-align:center; color:#888;">No matching words found.</p>';
            return;
        }

        words.forEach(item => {
            wordsContainer.innerHTML += `
                <div class="word-card">
                    <h2>${item.word}</h2>
                    <p class="meaning"><strong>Meaning:</strong> ${item.meaning}</p>
                    <p class="example"><strong>Example:</strong> ${item.example}</p>
                </div>
            `;
        });
    }

    // Watch what user types
    searchBar.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase();
        const filtered = vocabularyData.filter(item => {
            return item.word.toLowerCase().includes(text) || 
                   item.meaning.toLowerCase().includes(text);
        });
        renderWords(filtered);
    });

    // Show all words initially
    renderWords(vocabularyData);

});
