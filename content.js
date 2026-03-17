const STORAGE_KEYS = [
  'masterToggle', 
  'blurProfile', 
  'blurNames', 
  'blurLastMsg', 
  'blurMessages', 
  'blurMedia'
];

const CLASS_MAP = {
  blurProfile: 'privacy-blur-profile',
  blurNames: 'privacy-blur-names',
  blurLastMsg: 'privacy-blur-lastmsg',
  blurMessages: 'privacy-blur-messages',
  blurMedia: 'privacy-blur-media'
};

let currentSettings = {};
let isApplying = false;

// Ayarları yerel depolamadan al ve sınıfları güncelle / Fetch settings and update classes
function updateSettings() {
  chrome.storage.local.get(STORAGE_KEYS, (data) => {
    currentSettings = data;
    applyAllClasses();
  });
}

// Ayarlara göre bulanıklık sınıflarını body etiketine uygula / Apply blur classes based on settings
function applyAllClasses() {
  if (isApplying) return; // Sonsuz döngüyü engelle / Prevent recursive loops
  isApplying = true;

  const master = currentSettings.masterToggle ?? true;
  const body = document.body;

  if (!body) {
    isApplying = false;
    return;
  }

  // Genel koruma kapalıysa tüm sınıfları kaldır / Remove all classes if master is off
  if (!master) {
    const classesToRemove = Object.values(CLASS_MAP).filter(cls => body.classList.contains(cls));
    if (classesToRemove.length > 0) {
      body.classList.remove(...classesToRemove);
    }
    isApplying = false;
    return;
  }

  // Bireysel gizlilik sınıflarını ayarla / Toggle individual privacy classes
  Object.entries(CLASS_MAP).forEach(([prop, className]) => {
    const shouldBlur = currentSettings[prop] ?? true;
    const isBlurred = body.classList.contains(className);

    if (shouldBlur && !isBlurred) {
      body.classList.add(className);
    } else if (!shouldBlur && isBlurred) {
      body.classList.remove(className);
    }
  });

  isApplying = false;
}

// Sayfa yüklendiğinde ilk senkronizasyonu yap / Initial sync on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateSettings);
} else {
  updateSettings();
}

// Popup'tan gelen ayar değişikliklerini dinle / Listen for settings changes from popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    updateSettings();
  }
});

// WhatsApp (React) sınıfları dinamik olarak silerse geri uygula / Re-apply if classes are removed
const observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      applyAllClasses();
      break;
    }
  }
});

// Body etiketi hazır olduğunda gözlemciyi başlat / Start observer when body is ready
const bodyWaitInterval = setInterval(() => {
  if (document.body) {
    clearInterval(bodyWaitInterval);
    observer.observe(document.body, { attributes: true });
    updateSettings();
  }
}, 100);

// Sekmeye geri dönüldüğünde ayarları tazele / Refresh settings on window focus
window.addEventListener('focus', () => {
  setTimeout(updateSettings, 500);
});
