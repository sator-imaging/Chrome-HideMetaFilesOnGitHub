(function() {
  const container = document.querySelector('.react-directory') || document.body;
  let observer = null;

  // Multilingual messages
  const messages = {
    en: { popupText: 'Hidden .meta files', disableText: 'Show' },
    ja: { popupText: '.meta ファイルを非表示にしました', disableText: '表示する' },
  };
  const lang = navigator.language && navigator.language.startsWith('ja') ? 'ja' : 'en';

  let isDisabled = false; // Flag to stop hiding until page reload

  // Hide .meta files
  function hideMetaFiles() {
    if (isDisabled) return; // Do nothing if disabled

    const rows = document.querySelectorAll('.react-directory-row');
    let metaExists = false;

    rows.forEach(row => {
      const cell = row.querySelector('.react-directory-filename-cell');
      if (!cell) return;
      if (cell.innerText.endsWith('.meta')) {
        metaExists = true;
        row.style.display = 'none';
      }
    });

    const existingPopup = document.getElementById('meta-hide-popup');

    if (metaExists) {
      if (!existingPopup) showPopup();
    } else if (existingPopup) {
      existingPopup.style.opacity = '0';
      existingPopup.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => existingPopup.remove(), 300);
    }
  }

  // Show the popup
  function showPopup() {
    if (document.getElementById('meta-hide-popup')) return;

    const popup = document.createElement('div');
    popup.id = 'meta-hide-popup';
    popup.innerHTML = `
      <span>${messages[lang].popupText}</span>
      <a href="#" id="disable-meta-hide">${messages[lang].disableText}</a>
    `;
    Object.assign(popup.style, {
      position: 'fixed', bottom: '20px', left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: '#24292f', color: '#fff',
      padding: '10px 16px', borderRadius: '6px',
      fontSize: '13px', zIndex: '9999',
      display: 'flex', gap: '12px', alignItems: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      opacity: '0', transition: 'opacity 0.3s ease, transform 0.3s ease'
    });

    const link = popup.querySelector('#disable-meta-hide');
    Object.assign(link.style, { color: '#0af', textDecoration: 'none', cursor: 'pointer' });
    
    // Disable hiding on click
    link.addEventListener('click', e => {
      e.preventDefault();
      isDisabled = true; // stop hiding until reload
      document.querySelectorAll('.react-directory-row').forEach(r => r.style.display = '');
      popup.style.opacity = '0';
      popup.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => popup.remove(), 300);

      // Disconnect observer completely
      if (observer) observer.disconnect();
    });

    document.body.appendChild(popup);
    requestAnimationFrame(() => {
      popup.style.opacity = '1';
      popup.style.transform = 'translateX(-50%) translateY(0)';
    });
  }

  // Global style insertion
  const sheet = new CSSStyleSheet();
  sheet.replaceSync('span[title="Label: Private"]:before { content: "🔒"; vertical-align: text-bottom; }');
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  // Initial execution
  hideMetaFiles();

  // MutationObserver for dynamic content
  observer = new MutationObserver(hideMetaFiles);
  observer.observe(container, { childList: true, subtree: true });

})();
