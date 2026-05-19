(function () {
    var STORAGE_KEY = 'forum_popup_dismissed';
    var FORUM_URL   = 'https://square.tprod.space/'; // <-- вставь ссылку на форум

    if (localStorage.getItem(STORAGE_KEY)) return;

    function closePopup() {
        var overlay = document.getElementById('forum-popup-overlay');
        if (!overlay) return;
        overlay.classList.add('hiding');
        overlay.addEventListener('animationend', function () {
            overlay.remove();
        }, { once: true });
        localStorage.setItem(STORAGE_KEY, '1');
    }

    function buildPopup() {
        var overlay = document.createElement('div');
        overlay.id = 'forum-popup-overlay';

        overlay.innerHTML = [
            '<div id="forum-popup-card">',
            '  <div class="popup-glow"></div>',
            '  <div class="popup-accent-bar"></div>',
            '  <div class="popup-body">',

            '    <div class="popup-badge">',
            '      <span class="badge-dot"></span>',
            '      Спецпроект',
            '    </div>',

            '    <h2 class="popup-title">Форум<br>креативных индустрий</h2>',

            '    <div class="popup-location">',
            '      <i class="fa-solid fa-location-dot"></i>',
            '      Нижний Новгород',
            '    </div>',

            '    <div class="popup-divider"></div>',

            '    <p class="popup-description">',
            '      Этот инструмент создан <strong>при поддержке</strong> Форума креативных индустрий &mdash;',
            '      пространства, где встречаются идеи, люди и возможности.',
            '    </p>',

            '    <p class="popup-tagline">',
            '      Дизайн, музыка, кино, архитектура, технологии&nbsp;&mdash; всё это здесь.',
            '    </p>',

            '    <div class="popup-actions">',
            '      <a href="' + FORUM_URL + '" target="_blank" rel="noopener" class="popup-cta-btn" id="popup-forum-link">',
            '        Перейти на форум',
            '        <i class="fa-solid fa-arrow-right"></i>',
            '      </a>',
            '      <button class="popup-close-btn" id="popup-dismiss-btn">',
            '        Закрыть и не показывать снова',
            '      </button>',
            '    </div>',

            '    <div class="popup-footer">',
            '      Нажав «Перейти», вы перейдёте на внешний ресурс в новой вкладке.',
            '    </div>',

            '  </div>',
            '</div>'
        ].join('\n');

        document.body.appendChild(overlay);

        document.getElementById('popup-dismiss-btn').addEventListener('click', closePopup);

        document.getElementById('popup-forum-link').addEventListener('click', function () {
            localStorage.setItem(STORAGE_KEY, '1');
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closePopup();
        });

        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', handler);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildPopup);
    } else {
        buildPopup();
    }
})();
