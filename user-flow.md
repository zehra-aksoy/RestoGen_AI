# 🚀 RestoGen-AI: Kullanıcı Yolculuğu (User Flow)

Bu belge, restoran yöneticisinin uygulama içerisindeki etkileşim adımlarını tanımlar.

## 1. Onboarding (İlk Karşılama)
* **Giriş:** Kullanıcı uygulamayı ilk kez açtığında onboarding ekranı devreye alındı.
* **Veri Girişi:** Restoran kapasitesi, günlük ortalama müşteri ve temel tercihler bu aşamada kayıt edildi.
* **Tamamlama:** Bilgiler sisteme işlendi ve kullanıcı doğrudan Dashboard'a yönlendirildi.

## 2. Akıllı Dashboard (Komuta Merkezi)
* **Otomatik Analiz:** Dashboard açıldığında sistem arka planda sessiz bir yapay zeka analizi başlattı.
* **Hava Durumu:** Konum bazlı anlık hava durumu verileri ana ekrana yansıtıldı.
* **Hazırlık Tavsiyesi:** Hava durumu ve kapasite verileri işlenerek "Beklenen Müşteri Sayısı" tahmini gerçekleştirildi.

## 3. Sipariş ve Envanter Yönetimi
* **Sipariş Girişi:** Dashboard veya Menü sayfasından sipariş ekleme işlemleri sağlandı.
* **Global Senkronizasyon:** Bir sayfada yapılan değişikliklerin diğer tüm sayfalarda anında güncellenmesi sağlandı.
* **Kalıcılık:** Verilerin tarayıcı hafızasında saklanmasıyla sayfa yenilense dahi veri kaybı önlendi.

## 4. İş Akışı Otomasyonu (n8n)
* **Veri Akışları:** Tekrarlayan mutfak görevleri ve raporlama süreçleri n8n senaryoları ile otomatikleştirildi.
* **Entegrasyon:** Farklı servisler arasındaki veri transferi n8n iş akışları üzerinden yürütüldü.

## 5. Risk ve Gelen Müşteri Analizi
* **Risk Formu:** Etkinlik veya ekstrem hava durumu gibi özel durumlar sisteme girildi.
* **Dinamik Güncelleme:** Risk analizi sonuçlandığında hazırlık tavsiyelerinin otomatik olarak güncellenmesi sağlandı.
