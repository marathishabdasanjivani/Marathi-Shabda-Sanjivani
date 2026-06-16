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

    // Open/Close on hamburger button click
    menuBtn.addEventListener('click', toggleMenu);

    // Close menu instantly when clicking the background overlay (LHS background)
    menuOverlay.addEventListener('click', toggleMenu);

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
});