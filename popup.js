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

let currentLang = 'tr';

/**
 * Yerel dil dosyalarını yükler ve UI'yi günceller
 * Loads local message files and updates the UI
 */
async function applyLanguage(lang) {
  currentLang = lang;
  
  try {
    // _locales klasöründen ilgili dil dosyasını çek / Fetch the language file from _locales
    const response = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
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

    // Buton aktiflik durumu / Toggle active button state
    document.getElementById('langTR').classList.toggle('active', lang === 'tr');
    document.getElementById('langEN').classList.toggle('active', lang === 'en');
    
  } catch (error) {
    console.error("Language load error:", error);
  }
}

// UI öğelerini yerel depolama verileriyle senkronize et / Sync UI checkboxes with saved storage
chrome.storage.local.get(STORAGE_KEYS, (data) => {
  // Kayıtlı dil yoksa tarayıcı dilini kontrol et / Check browser language if no saved lang
  const browserLang = chrome.i18n.getUILanguage().split('-')[0];
  const targetLang = data.language || (['tr', 'en'].includes(browserLang) ? browserLang : 'en');
  
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

// Dil butonları / Language buttons
document.getElementById('langTR').addEventListener('click', () => {
  applyLanguage('tr');
  saveSettings();
});

document.getElementById('langEN').addEventListener('click', () => {
  applyLanguage('en');
  saveSettings();
});
