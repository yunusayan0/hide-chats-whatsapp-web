const STORAGE_KEYS = [
  'masterToggle', 
  'blurProfile', 
  'blurNames', 
  'blurLastMsg', 
  'blurMessages', 
  'blurMedia',
  'language'
];

const CLASS_MAP = {
  blurProfile: 'privacy-blur-profile',
  blurNames: 'privacy-blur-names',
  blurLastMsg: 'privacy-blur-lastmsg',
  blurMessages: 'privacy-blur-messages',
  blurMedia: 'privacy-blur-media'
};

let currentLang = 'en';

/**
 * Yerel dil dosyalarını yükler ve UI'yi günceller
 * Loads local message files and updates the UI
 */
async function applyLanguage(lang) {
  currentLang = lang;
  
  try {
    // _locales klasöründen ilgili dil dosyasını çek / Fetch the language file from _locales
    const response = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
    if (!response.ok) throw new Error("Language file not found");
    
    const data = await response.json();
    
    // Her bir ID için mesajı uygula / Apply the message for each ID
    Object.keys(data).forEach(key => {
      if (key === 'extensionName') {
        document.title = data[key].message;
        return;
      }
      const el = document.getElementById(key);
      if (el) el.textContent = data[key].message;
    });

    // Seçim kutusunu güncelle / Update the select box
    const langSelect = document.getElementById('langSelect');
    if (langSelect) langSelect.value = lang;
    
  } catch (error) {
    console.error("Language load error:", error);
    // Hata durumunda İngilizceye dön / Fallback to English
    if (lang !== 'en') applyLanguage('en');
  }
}

// UI öğelerini yerel depolama verileriyle senkronize et / Sync UI checkboxes with saved storage
chrome.storage.local.get(STORAGE_KEYS, (data) => {
  const browserLang = chrome.i18n.getUILanguage().replace('-', '_').split('_')[0];
  const supportedLangs = ['tr', 'en', 'es', 'de', 'fr', 'it', 'pt', 'ru', 'ar', 'hi', 'zh_CN', 'zh_TW', 'ja', 'ko', 'nl', 'pl', 'sv', 'sk', 'uk', 'id', 'th', 'vi'];
  
  // zh_CN ve zh_TW gibi özel durumlar için tam kodu kontrol et / Check full code for special cases like zh_CN/TW
  const fullBrowserLang = chrome.i18n.getUILanguage().replace('-', '_');
  let targetLang = data.language;
  
  if (!targetLang) {
    if (supportedLangs.includes(fullBrowserLang)) targetLang = fullBrowserLang;
    else if (supportedLangs.includes(browserLang)) targetLang = browserLang;
    else targetLang = 'en';
  }
  
  applyLanguage(targetLang);

  STORAGE_KEYS.forEach(key => {
    if (key === 'language') return;
    const el = document.getElementById(key);
    if (el) {
      el.checked = data[key] !== false; // Varsayılan olarak açık / Active by default
    }
  });
});

// Ayarları kaydet ve aktif WhatsApp sekmesini bilgilendir / Update storage and notify tab on change
function saveSettings() {
  const settings = { language: currentLang };
  STORAGE_KEYS.forEach(key => {
    if (key === 'language') return;
    const el = document.getElementById(key);
    if (el) settings[key] = el.checked;
  });

  chrome.storage.local.set(settings, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Ayarları WhatsApp sekmesine anında uygula / Apply settings directly to the active tab
      if (tabs[0]?.url?.includes("web.whatsapp.com")) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: applySettingsToPage,
          args: [settings, CLASS_MAP]
        }).catch(err => console.error("Scripting error:", err));
      }
    });
  });
}

// WhatsApp sayfa kapsamında çalıştırılan işlev (Context: WhatsApp Page)
function applySettingsToPage(settings, classMap) {
  const master = settings.masterToggle ?? true;
  const body = document.body;
  
  if (!master) {
    body.classList.remove(...Object.values(classMap));
    return;
  }

  Object.entries(classMap).forEach(([prop, className]) => {
    if (settings[prop] !== false) {
      body.classList.add(className);
    } else {
      body.classList.remove(className);
    }
  });
}

// Tüm UI anahtarlarına olay dinleyici bağla / Bind event listeners to all UI switches
STORAGE_KEYS.forEach(key => {
  if (key === 'language') return;
  const el = document.getElementById(key);
  el?.addEventListener('change', saveSettings);
});

// Dil seçim kutusu olay dinleyicisi / Language selector event listener
document.getElementById('langSelect')?.addEventListener('change', (e) => {
  applyLanguage(e.target.value);
  saveSettings();
});
