# 💡 RestoGen AI

## 🎯 Problem
Profesyonel mutfaklarda hava durumu, yerel etkinlikler ve anlık stok durumunun doğru analiz edilememesi nedeniyle devasa boyutlarda gıda israfı (over-prep) yaşanıyor. Pazardaki mevcut israf önleyici çözümler ise binlerce dolarlık akıllı tartılar veya özel kameralar gerektirdiği için KOBİ'ler ve standart yemekhaneler için ulaşılmaz bir maliyet yaratıyor.

## 🚀 Çözüm
RestoGen AI, ekstra hiçbir donanıma ihtiyaç duymadan mutfak yönetimini dijitalleştiren akıllı bir operasyon asistanıdır. Google Gemini 2.5 Flash'ın analiz yeteneklerini kullanarak; anlık hava durumu, restoran kapasitesi, dış riskler (etkinlik iptalleri vb.) ve dolaptaki stok durumunu saniyeler içinde sentezler. Şeflere sadece veri sunmakla kalmaz; net bir "Beklenen Müşteri" tahmini, madde madde iş emirleri ve artan malzemeler için "Sıfır Atık" (Zero-Waste) tarifleri üreterek israfı daha oluşmadan önler.

## 📺 Canlı Demo
* **Yayın Linki:** https://[proje-adin].vercel.app
* **Demo Video:** https://loom.com/share/[video-id]

## 🛠️ Kullanılan Teknolojiler
* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
* **Yapay Zeka:** Google Gemini API
* **Otomasyon:** n8n (Arka plan iş akışları ve veri senkronizasyonu)
* **State Yönetimi:** Custom Hooks & Window Event API (Gerçek zamanlı senkronizasyon)
* **Dış API'ler:** Open-Meteo API (Konum bazlı anlık hava durumu)

---

## 📌 Uygulama Nasıl Kullanılır? (Canlı Test Adımları)
RestoGen AI'nin yeteneklerini canlı link üzerinden test etmek için sırasıyla şu adımları izleyebilirsiniz:

1. **Akıllı Dashboard'u İnceleyin:** Uygulamayı açtığınızda sistem otomatik olarak konum bazlı hava durumunu çeker ve arka planda AI modelini çalıştırır. Ekranda anında hesaplanmış "Beklenen Müşteri" sayısını göreceksiniz.
2. **Yapay Zeka Hazırlık Tavsiyelerini Okuyun:** Dashboard üzerindeki "Hazırlık Tavsiyesi" listesine göz atın. AI, o anki hava durumu ve envanterinize göre mutfak ekibine özel "Çorbayı artır, salatayı azalt" gibi net talimatlar verecektir.
3. **Risk Analizini Test Edin:** Dış etkenleri simüle etmek için "Risk Analizi" sekmesine gidin. Forma örneğin "Yakındaki maç iptal oldu" veya "Fırtına uyarısı" yazıp gönderin. AI'ın müşteri hedefini ve iş emirlerini o anki kriz durumuna göre nasıl güncellediğini izleyin.
4. **Gerçek Zamanlı Senkronizasyonu Görün:** Envanter veya Menü sayfasına giderek yeni bir ürün ekleyin. Sayfayı yenilemeden Dashboard'a döndüğünüzde, verilerin ve AI analizinin anında güncellendiğini fark edeceksiniz.

---

## 💻 Geliştiriciler İçin: Nasıl Kurulur?
Projeyi kendi yerel ortamınızda (localhost) çalıştırmak ve kodları incelemek için aşağıdaki adımları izleyebilirsiniz:

**1. Repoyu Klonlayın:**
```bash
git clone [https://github.com/](https://github.com/)[kullanici-adin]/restogen-ai.git
cd restogen-ai
```

**2. Bağımlılıkları Yükleyin:**
```bash
npm install
```

**3. Çevre Değişkenlerini (ENV) Ayarlayın:**
Projenin ana dizininde bir `.env.local` dosyası oluşturun ve aşağıdaki anahtarları kendi API bilgilerinizle doldurun:
```env
NEXT_PUBLIC_GEMINI_API_KEY=senin_gemini_api_anahtarin
NEXT_PUBLIC_N8N_WEBHOOK_URL=senin_n8n_webhook_adresin
```

**4. Projeyi Başlatın:**
```bash
npm run dev
```
Tarayıcınızda `http://localhost:3000` adresine giderek uygulamayı görüntüleyebilirsiniz.

**5. (Opsiyonel) n8n Otomasyonunu Kurun:**
Proje içindeki `agents/restogen-workflow.json` dosyasını kendi n8n arayüzünüze "Import" ederek arka plan otomasyonlarını aktif hale getirebilirsiniz.
