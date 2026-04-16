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
        const response = await fetch('../bugs.json');
        const bugs = await response.json();

        const container = document.getElementById('cards-container');

        bugs.forEach(bug => {
            let severityClass = '';

            if (bug.severity.toLowerCase() === 'critical') severityClass = 'critical';
            if (bug.severity.toLowerCase() === 'major') severityClass = 'major';
            if (bug.severity.toLowerCase() === 'minor') severityClass = 'minor';
            if (bug.severity.toLowerCase() === 'trivial') severityClass = 'trivial'

            let priorityClass = '';

            if (bug.priority.toLowerCase() === 'high') priorityClass = 'high';
            if (bug.priority.toLowerCase() === 'medium') priorityClass = 'medium';
            if (bug.priority.toLowerCase() === 'low') priorityClass = 'low';
            


            const card = document.createElement('div');
            card.classList.add('card');

            
            card.innerHTML = `
                <h3>${bug.title}</h3>
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

