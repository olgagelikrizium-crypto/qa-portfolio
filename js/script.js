function toggleMenu() {
    const menu = document.getElementById("menu");
    const burger = document.querySelector(".burger");

    const isActive = menu.classList.toggle("active");
    burger.classList.toggle("active");

    burger.setAttribute("aria-expanded", isActive);
}

function goBack() {
    window.history.back();
}
function loadBug() {
    const params = new URLSearchParams(window.location.search);
    const bugId = params.get('id');

    if (!bugId) {return;}

    fetch('../bugs.json')
        .then(res => res.json())
        .then(data => {
            /*const bug = data.find(b => b.id == bugId);*/
            const currentIndex = data.findIndex(b => b.id === bugId);
            const bug = data[currentIndex];

            if (!bug) {
                document.getElementById('title').innerText = "Bug not found";
                return;
            }

            document.getElementById('title').innerText = bug.title;
            document.getElementById('context').innerText = bug.context;

            document.getElementById('meta').innerHTML = `
                <span class="badge date">${bug.date}</span>
                <span class="badge id">ID: ${bug.id}</span>
                <span class="badge type">${bug.type}</span>
                <span class="badge badge-${bug.severity.toLowerCase()}">${bug.severity}</span>
                <span class="badge badge-${bug.priority.toLowerCase()}">${bug.priority}</span>
                
            `;

            document.getElementById('environment').innerHTML = `
                <h3>Environment</h3>
                <ul>${bug.environment?.map(i => `<li>${i}</li>`).join('') || ''}</ul>
            `;

            document.getElementById('steps').innerHTML = `
                <h3>Steps to Reproduce</h3>
                <ol>${bug.steps?.map(i => `<li>${i}</li>`).join('')}</ol>
            `;

            document.getElementById('actual').innerHTML = `
                <h3>Actual Result</h3>
                <p>${bug.actual}</p>
            `;

            document.getElementById('expected').innerHTML = `
                <h3>Expected Result</h3>
                <p>${bug.expected}</p>
            `;

            document.getElementById('comments').innerHTML = `
                <h3>Comments</h3>
                <p>${bug.comments}</p>
            `;

            if (bug.evidence && typeof bug.evidence === "string" && bug.evidence.trim() !== "") {
                document.getElementById('evidence').innerHTML = `
                    <h3>Evidence</h3>
                    <video controls width="100%">
                        <source src="${bug.evidence}" type="video/mp4">
                    </video>
                `;
            } else {
                document.getElementById('evidence').innerHTML = `
                    <h3>Evidence</h3>
                    <div class="video-placeholder">
                        <p><strong>Note:</strong></p>
                        <p>${bug.note}</p>
                    </div>
                `;
            }
        
               


            // ПУНКТЫ 3 и 4: Логика кнопок навигации
    const prevBtn = document.getElementById('prev-bug');
    const nextBtn = document.getElementById('next-bug');

    // Настройка кнопки "Назад"
    if (currentIndex > 0) {
        const prevBug = data[currentIndex - 1];
        prevBtn.href = `bug.html?id=${prevBug.id}`;
        prevBtn.style.visibility = 'visible';
    } else {
        prevBtn.style.visibility = 'hidden'; // Прячем на первом баге
    }

    // Настройка кнопки "Вперед"
    if (currentIndex < data.length - 1) {
        const nextBug = data[currentIndex + 1];
        nextBtn.href = `bug.html?id=${nextBug.id}`;
        nextBtn.style.visibility = 'visible';
    } else {
        nextBtn.style.visibility = 'hidden'; // Прячем на последнем баге
    }

    
            document.getElementById('loading').style.display = 'none';
        });
}



loadBug();

//*CARDS*//
async function loadBugs() {
    try {
        const response = await fetch('bugs.json');
        let bugs = await response.json();

        const container = document.getElementById('cards-container');
        container.innerHTML = '';

        // Получаем выбранный проект
const selectedProject = document.getElementById('projectFilter')?.value;
const selectedSeverity = document.getElementById('severityFilter')?.value;

// Фильтрация по project
if (selectedProject) {
    bugs = bugs.filter(bug => bug.project === selectedProject);
}

// Фильтрация по severity
if (selectedSeverity) {
    bugs = bugs.filter(bug => bug.severity === selectedSeverity);
}

        bugs.forEach(bug => {
            let severityClass = '';

            if (bug.severity.toLowerCase() === 'critical') severityClass = 'critical';
            if (bug.severity.toLowerCase() === 'major') severityClass = 'major';
            if (bug.severity.toLowerCase() === 'minor') severityClass = 'minor';
            if (bug.severity.toLowerCase() === 'trivial') severityClass = 'trivial';

            let priorityClass = '';

            if (bug.priority.toLowerCase() === 'high') priorityClass = 'high';
            if (bug.priority.toLowerCase() === 'medium') priorityClass = 'medium';
            if (bug.priority.toLowerCase() === 'low') priorityClass = 'low';

            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <h3>${bug.title}</h3>
                <p><strong>Project:</strong> ${bug.project || 'Not specified'}</p>
                <p><strong>Type:</strong><span class="badge type">${bug.type}</span></p>
                <p><strong>Severity:</strong> <span class="badge badge-${severityClass}">${bug.severity}</span></p>
                <p><strong>Priority:</strong> <span class="badge badge-${priorityClass}">${bug.priority}</span></p>
                <p>${bug.context}</p>
                <a href="bugs/bug.html?id=${bug.id}" class="btn">View Details</a>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading bugs:', error);
    }
}    

document.addEventListener('DOMContentLoaded', loadBugs);
document.addEventListener('DOMContentLoaded', () => {
    // 1. Обработка бургер-меню (есть на всех страницах)
    const burgerBtn = document.querySelector('.burger');
    if (burgerBtn) {
        burgerBtn.addEventListener('click', toggleMenu);
    }

    // 2. Обработка поиска (только на странице каталога)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', searchCatalog);
    }
});

async function loadCertificates() {
    try {
        const response = await fetch('certificates.json'); // Путь к новому файлу
        const certs = await response.json();
        const container = document.getElementById('certificate-container'); // Исправь опечатку в HTML (sertificate -> certificate)

        certs.forEach(cert => {
            const card = document.createElement('div');
            card.classList.add('card'); // Используем готовые стили карточек [5]

            card.innerHTML = `
                <img src="${cert.image}" alt="Certificate for ${cert.title}" class="cert-preview">
                <h3>${cert.title}</h3>
                <p><strong>Issued by:</strong> ${cert.issuer}</p>
                <p>${cert.description}</p>
                <a href="achievements/course.html?id=${cert.id}" class="btn">More Details</a>
            `;
            container.appendChild(card);
        });
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Error loading certificates:', error);
    }
}

// Запускаем загрузку, если мы на странице достижений
if (document.getElementById('certificate-container')) {
    document.addEventListener('DOMContentLoaded', loadCertificates);
}
// =========================
// QA AUDIO CATALOG
// =========================

async function loadCatalog() {
    try {
        const response = await fetch('data/catalog-index.json');
        const data = await response.json();

        const container = document.getElementById('category-container');

        if (!container) return;

        container.innerHTML = '';

        data.categories.forEach(category => {
            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <h3>${category.title}</h3>
                <p>${category.questions} lessons</p>
                <p>${category.description}</p>
                <a href="audio-category.html?category=${category.id}" class="btn">Open Category →</a>
            `;

            container.appendChild(card);
        });

        document.getElementById('loading').style.display = 'none';

    } catch (error) {
        console.error('Error loading catalog:', error);
    }
}



// =========================
// SEARCH IN AUDIO CATALOG
// =========================

function searchCatalog() {
    const input = document.getElementById('searchInput');

    if (!input) return;

    const filter = input.value.toLowerCase();
    const cards = document.querySelectorAll('#category-container .card');

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();

        if (text.includes(filter)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}



// =========================
// LOAD CATEGORY QUESTIONS
// =========================

async function loadCategory() {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('category');

    if (!categoryId) return;

    try {
        const response = await fetch(`data/${categoryId}.json`);
        const data = await response.json();

        const container = document.getElementById('questions-container');

        if (!container) return;

        document.getElementById('category-title').innerText = data.category;
        document.getElementById('category-description').innerText = data.description;

        container.innerHTML = '';

        data.questions.forEach(question => {
            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <h3>${question.title}</h3>
                <p><strong>Duration:</strong> ${question.duration}</p>
                <p><strong>Status:</strong> ${question.status}</p>
                <p><strong>Keywords:</strong> ${question.keywords.join(', ')}</p>
                <a href="audio-lesson.html?category=${categoryId}&id=${question.id}" class="btn">Open Lesson →</a>
            `;

            container.appendChild(card);
        });

        document.getElementById('loading').style.display = 'none';

    } catch (error) {
        console.error('Error loading category:', error);
    }
}



// =========================
// PAGE AUTO DETECTION
// =========================

if (document.getElementById('category-container')) {
    document.addEventListener('DOMContentLoaded', loadCatalog);
}

if (document.getElementById('questions-container')) {
            document.addEventListener('DOMContentLoaded', loadCategory);
}
// =========================
// LOAD AUDIO LESSON
// =========================

async function loadLesson() {
    const params = new URLSearchParams(window.location.search);

    const categoryId = params.get('category');
    const lessonId = parseInt(params.get('id'));

    if (!categoryId || !lessonId) return;

    try {
        const response = await fetch(`data/${categoryId}.json`);
        const data = await response.json();

        const lesson = data.questions.find(q => q.id === lessonId);

        if (!lesson) {
            document.getElementById('lesson-title').innerText = 'Lesson not found';
            return;
        }

        // TITLE
        document.getElementById('lesson-title').innerText = lesson.title;
        document.getElementById('sidebar-duration').innerText = `Duration: ${lesson.duration}`;

        // AUDIO
        const audioSource = document.getElementById('audio-source');
        const audioPlayer = document.getElementById('lesson-audio');

        audioSource.src = lesson.audio;
        audioPlayer.load();

        // DEFAULT KEYWORDS
        const keywordsContainer = document.getElementById('lesson-keywords');

        if (lesson.keywords) {
            keywordsContainer.innerHTML = lesson.keywords
                .map(keyword => `<span class="badge type">${keyword}</span>`)
                .join(' ');
        }

        // ELEMENTS
        const transcriptContainer = document.getElementById('lesson-transcript');
        const practiceContainer = document.getElementById('practice-questions');

        // LOAD TRANSCRIPT FILE
        if (lesson.transcript_file) {
            try {
                const transcriptResponse = await fetch(lesson.transcript_file);
                const transcriptData = await transcriptResponse.json();

                // VOCABULARY
if (transcriptData.vocabulary && transcriptData.vocabulary.length > 0) {
    keywordsContainer.innerHTML = transcriptData.vocabulary
        .map(word => `
            <div class="vocab-card">
                <h3>${word.term}</h3>
                <p>${word.definition}</p>
            </div>
        `)
        .join('');

                }
// TIMESTAMPS
const timestampsContainer = document.getElementById('lesson-timestamps');

if (transcriptData.timestamps && transcriptData.timestamps.length > 0) {
    timestampsContainer.innerHTML = transcriptData.timestamps
        .map(item => `<p><strong>${item.time}</strong> — ${item.label}</p>`)
        .join('');
} else {
    timestampsContainer.innerHTML = '<p>No timestamps available.</p>';
}
                // TRANSCRIPT
                if (transcriptData.transcript && transcriptData.transcript.length > 0) {
                    transcriptContainer.innerHTML = transcriptData.transcript.map(item => `
                        <div class="transcript-block">

                            <p class="timestamp"><strong>${item.time}</strong></p>

                            <div class="transcript-columns">

                                <div class="transcript-en">
                                    <h3>English</h3>
                                    <p>${item.en}</p>
                                </div>

                                <div class="transcript-ru">
                                    <h3>Russian</h3>
                                    <p>${item.ru}</p>
                                </div>

                            </div>
                        </div>
                    `).join('');
                } else {
                    transcriptContainer.innerHTML = `
                        <div class="card">
                            <p>Transcript coming soon...</p>
                        </div>
                    `;
                }

                // PRACTICE QUESTIONS
                if (transcriptData.practice_questions && transcriptData.practice_questions.length > 0) {
                    practiceContainer.innerHTML = `
                        <ul>
                            ${transcriptData.practice_questions.map(q => `<li>${q}</li>`).join('')}
                        </ul>
                    `;
                } else {
                    practiceContainer.innerHTML = `
                        <div class="card">
                            <p>Practice questions coming soon...</p>
                        </div>
                    `;
                }

            } catch (error) {
                console.error('Error loading transcript file:', error);

                transcriptContainer.innerHTML = `
                    <div class="card">
                        <p>Transcript loading failed.</p>
                    </div>
                `;
            }
        }

        document.getElementById('loading').style.display = 'none';

    } catch (error) {
        console.error('Error loading lesson:', error);
    }
}
// =========================
// PAGE AUTO DETECTION
// =========================

if (document.getElementById('lesson-title')) {
    document.addEventListener('DOMContentLoaded', loadLesson);
}