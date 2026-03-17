# Hide Chats for WhatsApp Web 🛡️

Toplu taşımada, ofiste veya okulda WhatsApp Web kullanırken "arkandaki meraklı gözlerden" sıkıldıysan bu eklenti tam sana göre. Mesajlarını, isimleri ve medyayı bulanıklaştırarak ekranını sadece senin okuyabileceğin bir hale getirir.

Sade, sistemi yormayan ve tamamen gizlilik odaklı bir araçtır.

## ✨ Neler Sunuyor?

- **Küresel Dil Desteği:** Türkçe ve İngilizce dahil 20'den fazla dil seçeneğiyle dünyanın her yerinden kullanıcılar için hazırlandı.
- **Kişiselleştirilmiş Bulanıklaştırma:** Kişi isimlerini, son mesajları, profil fotoğraflarını ve sohbet içeriklerini ayrı ayrı kontrol edebilirsin.
- **Akıllı Hover Efekti:** Merak ettiğin bir içeriğin üzerine farenle gelmen yeterli; bulanıklık anında çözülür, fareyi çektiğinde tekrar gizlenir.
- **Hafif ve Hızlı:** Saf (Vanilla) JS ve CSS kullanıldığı için tarayıcıyı veya WhatsApp'ın performansını kesinlikle etkilemez.

## 🚀 Nasıl Kurulur? (Setup)

Eklentiyi tarayıcına **Developer Mode** üzerinden eklemek için şu adımları izle:

1. Bu depoyu bilgisayarına indir ve bir klasöre çıkart.
2. Tarayıcında eklenti yönetim sayfasını aç (Firefox için `about:debugging`, Chrome için `chrome://extensions`).
3. **"Geçici Eklenti Yükle"** (veya Paketlenmemiş eklenti yükle) butonuna tıkla.
4. Klasörün içindeki `manifest.json` dosyasını seç ve kullanmaya başla!

## 🛠️ İşin Mutfağı (Tech Stack)

- **JavaScript (Web Extensions API):** Ayarların yönetimi ve sayfa elementlerine müdahale (DOM manipülasyonu) için kullanıldı.
- **CSS:** Performanslı blur efektleri ve akıcı görsel geçişler için optimize edildi.
- **Storage API:** Tercihlerinin tarayıcı kapansa bile hatırlanmasını sağlar.

---
**Geliştiren:** [Yunus Ayan](https://yunusayan.com)