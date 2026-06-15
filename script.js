document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const wordsContainer = document.getElementById('wordsContainer');
    const homepageFeatures = document.getElementById('homepageFeatures');

    let vocabularyData = [];

    // Fetch the separate database file seamlessly
    fetch('dictionary.json')
        .then(response => response.json())
        .then(data => {
            vocabularyData = data;
        })
        .catch(err => console.error("Error loading dictionary database:", err));

    function renderSearchResults(results) {
        wordsContainer.innerHTML = '';
        
        if (results.length === 0) {
            wordsContainer.innerHTML = '<div class="premium-card"><p style="text-align:center; color:#888; margin:0;">क्षमस्व, कोणताही शब्द सापडला नाही. (No matching words found.)</p></div>';
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

        // If the user clears the search bar, show homepage features again and hide results
        if (text.length === 0) {
            wordsContainer.innerHTML = '';
            homepageFeatures.style.display = 'grid';
            return;
        }

        // Hide regular homepage elements when search is active
        homepageFeatures.style.display = 'none';

        // Filter through the dynamic array
        const filtered = vocabularyData.filter(item => {
            return item.word.toLowerCase().includes(text) || 
                   item.shortMeaning.toLowerCase().includes(text) ||
                   item.longDefinition.toLowerCase().includes(text);
        });

        renderSearchResults(filtered);
    });
});
