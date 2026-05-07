/* =========================================================
   Mother Day Gift – main logic (pure front‑end)
   ========================================================= */

// ---------- 1. Petal animation ----------
(function initPetals() {
    const canvas = document.getElementById('petal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const petals = [];
    const COUNT = 30;
    for (let i = 0; i < COUNT; i++) {
        petals.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 6 + 4,
            speed: Math.random() * 1 + 0.5,
            sway: Math.random() * 2 - 1,
            alpha: Math.random() * 0.5 + 0.3
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => {
            p.y += p.speed;
            p.x += p.sway;
            if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,183,197,${p.alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
})();

// ---------- 2. Clock ----------
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const el = document.getElementById('clock');
    if (el) el.textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);

// ---------- 3. Navigation ----------
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.section;
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
            if (sec.id === target) sec.classList.add('active');
        });
    });
});

// ---------- 4. Blessings ----------
const BLESSINGS = [
    "愿你的每一天都如春风般温柔。",
    "爱与被爱，是世界上最美的礼物。",
    "微笑是最好的装饰品，愿你笑口常开。",
    "愿你拥有星光般的梦想，照亮前行的路。",
    "生活因你而绚烂，愿幸福永相随。",
    "你笑起来真好看，像春天的花一样。",
    "妈妈，你是我心中永远的女神。",
    "有你在的地方，就是家。"
];
const MOTHER_DAY_BLESSING = "亲爱的妈妈，感谢您无私的爱与陪伴，母亲节快乐！";

function isMothersDay() {
    const d = new Date();
    if (d.getMonth() !== 4) return false; // May = 4
    const day = d.getDate();
    const dow = d.getDay(); // 0 Sunday
    return dow === 0 && day >= 8 && day <= 14;
}

function showBlessing() {
    const el = document.getElementById('blessing-text');
    if (!el) return;
    if (isMothersDay()) {
        el.textContent = MOTHER_DAY_BLESSING;
    } else {
        el.textContent = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
    }
}
showBlessing();

const changeBtn = document.getElementById('change-blessing');
if (changeBtn) changeBtn.addEventListener('click', showBlessing);

// ---------- 5. Health Reminders ----------
function initReminders() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

    const remindersList = JSON.parse(localStorage.getItem('momReminders') || '[]');
    const listEl = document.getElementById('reminders-list');
    const activeBox = document.getElementById('active-reminders');

    function renderList() {
        if (!listEl) return;
        listEl.innerHTML = remindersList.map((r, i) => `<li>${r.label} - 每${r.minutes}分钟 <button onclick="removeReminder(${i})">移除</button></li>`).join('');
        if (activeBox) activeBox.style.display = remindersList.length ? 'block' : 'none';
    }

    // Expose for button onclick
    window.removeReminder = function(idx) {
        remindersList.splice(idx, 1);
        localStorage.setItem('momReminders', JSON.stringify(remindersList));
        renderList();
    };

    document.querySelectorAll('.remind-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            if (!minutes) return;
            const item = {
                label: btn.parentElement.querySelector('span').textContent.trim(),
                minutes: minutes,
                last: Date.now()
            };
            remindersList.push(item);
            localStorage.setItem('momReminders', JSON.stringify(remindersList));
            renderList();
            alert('已设置提醒！');
        });
    });

    const clearAll = document.getElementById('clear-all');
    if (clearAll) {
        clearAll.addEventListener('click', () => {
            remindersList.length = 0;
            localStorage.setItem('momReminders', JSON.stringify(remindersList));
            renderList();
        });
    }

    // Check reminders every 30 seconds
    setInterval(() => {
        const now = Date.now();
        remindersList.forEach((r, idx) => {
            if (now - r.last >= r.minutes * 60000) {
                r.last = now;
                if (Notification.permission === 'granted') {
                    new Notification('健康提醒', { body: r.label, icon: '💖' });
                } else {
                    alert(`提醒：${r.label}`);
                }
            }
        });
        localStorage.setItem('momReminders', JSON.stringify(remindersList));
    }, 30000);

    renderList();
}
initReminders();

// ---------- 6. Letter to Mom ----------
function initLetter() {
    const textarea = document.getElementById('letter-content');
    const saveBtn = document.getElementById('save-letter');
    const clearBtn = document.getElementById('clear-letter');
    const msg = document.getElementById('save-msg');

    // Load saved
    const saved = localStorage.getItem('momLetter');
    if (saved && textarea) textarea.value = saved;

    if (saveBtn && textarea) {
        saveBtn.addEventListener('click', () => {
            localStorage.setItem('momLetter', textarea.value);
            if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 2000); }
        });
    }
    if (clearBtn && textarea) {
        clearBtn.addEventListener('click', () => {
            if (confirm('确定清空信件吗？')) {
                textarea.value = '';
                localStorage.removeItem('momLetter');
            }
        });
    }
}
initLetter();

// ---------- 7. Photo Album ----------
function initAlbum() {
    const albumGrid = document.getElementById('album-grid');
    if (!albumGrid) return;

    // 相册照片
    const albumData = [
        { src: 'images/mom1.jpg', thumb: 'images/mom1.jpg', caption: '' },
        { src: 'images/mom2.jpg', thumb: 'images/mom2.jpg', caption: '' }
    ];

    function render() {
        albumGrid.innerHTML = albumData.map((item, idx) => `
            <div class="album-item" data-idx="${idx}">
                <img src="${item.thumb}" alt="${item.caption}" loading="lazy">
                            </div>
        `).join('');

        // Click to open viewer
        albumGrid.querySelectorAll('.album-item').forEach(el => {
            el.addEventListener('click', () => {
                openViewer(parseInt(el.dataset.idx));
            });
        });
    }

    // Viewer
    const viewer = document.getElementById('photo-viewer');
    const viewerImg = document.getElementById('viewer-img');
    const viewerCaption = document.getElementById('viewer-caption');
    const closeBtn = viewer ? viewer.querySelector('.viewer-close') : null;
    const prevBtn = viewer ? viewer.querySelector('.viewer-prev') : null;
    const nextBtn = viewer ? viewer.querySelector('.viewer-next') : null;
    let currentIdx = 0;

    function openViewer(idx) {
        if (!viewer) return;
        currentIdx = idx;
        showInViewer();
        viewer.style.display = 'flex';
    }

    function showInViewer() {
        const item = albumData[currentIdx];
        if (viewerImg) viewerImg.src = item.src;
        if (viewerCaption) viewerCaption.textContent = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', () => { viewer.style.display = 'none'; });
    if (prevBtn) prevBtn.addEventListener('click', () => {
        currentIdx = (currentIdx - 1 + albumData.length) % albumData.length;
        showInViewer();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        currentIdx = (currentIdx + 1) % albumData.length;
        showInViewer();
    });

    render();
}
initAlbum();

// ---------- 8. Background Music ----------
(function initMusic() {
    const toggle = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    if (!toggle || !audio) return;
    let playing = false;
    toggle.addEventListener('click', () => {
        if (playing) {
            audio.pause();
            toggle.querySelector('i').classList.remove('fa-pause');
            toggle.querySelector('i').classList.add('fa-music');
        } else {
            audio.play().catch(() => {});
            toggle.querySelector('i').classList.remove('fa-music');
            toggle.querySelector('i').classList.add('fa-pause');
        }
        playing = !playing;
    });
})();
