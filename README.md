# 40-ISLEMLI-HESAP-MAKINESI

Dosyalar birbirinden bağımsız olarak düzenlenmiştir:
- `index.html`, CSS ve JavaScript dosyalarını `<link>` ve `<script>` etiketleri ile çağırır.
- Tüm stiller `index.css` içinde, tüm hesaplama ve buton etkileşimleri `index.js` içinde yer alır.

---

## 🚀 Kurulum ve Çalıştırma

Proje herhangi bir bağımlılık veya sunucu gerektirmez. Doğrudan tarayıcıda çalışır.

### 1️⃣ Depoyu Kopyalayın veya Dosyaları Oluşturun

Bu repoyu klonlayın veya yukarıdaki üç dosyayı (`index.html`, `index.css`, `index.js`) aynı klasöre manuel olarak kaydedin.

### 2️⃣ Visual Studio Code'da Açın

VS Code'da klasörü açın. `index.html` dosyasına sağ tıklayıp **"Open with Live Server"** seçeneğini kullanabilirsiniz (Live Server eklentisi yüklü ise) veya doğrudan dosyaya çift tıklayarak varsayılan tarayıcınızda açabilirsiniz.

### 3️⃣ Hemen Kullanmaya Başlayın

Hesap makinesi açıldığında ekranda **0** değerini göreceksiniz. Butonlara tıklayarak veya klavyenizi kullanarak işlem yapabilirsiniz.

---

## 🕹️ Kullanım Kılavuzu

### 📟 Ekran Bölümü

- **Üst satır (gri):** Girilen işlem ifadesi (örn. `12 + 5 * sin(30)`)
- **Büyük yazı:** Anlık sonuç veya girilen sayı
- **Durum çubuğu:** Açı modu (`DEG` / `RAD`) ve bellek dolu göstergesi (`M`)

### 🔘 Buton Kategorileri

| Renk / Sınıf | Açıklama |
|--------------|----------|
| **Koyu mavi** | Sayılar ve sabitler (0-9, . , π, e) |
| **Açık mavi** | Operatörler (+, −, ×, ÷, mod, ^) |
| **Mor / Gri** | Mühendislik fonksiyonları (sin, log, √, x² vb.) |
| **Kırmızımsı** | Temizleme işlemleri (C, AC, ⌫) |
| **Yeşilimsi** | Bellek tuşları (MC, MR, M+, M-) |
| **Mavi (geniş)** | Eşittir (`=`) |

### 📐 Açı Modu Değiştirme

`RAD` butonuna tıklayarak trigonometrik hesaplamalar için **Radyan** ve **Derece** modları arasında geçiş yapabilirsiniz. Aktif mod ekranın sol üst köşesinde gösterilir.

### 💾 Bellek Kullanımı

- `M+` : Ekrandaki sayıyı belleğe ekler.
- `M-` : Ekrandaki sayıyı bellekten çıkarır.
- `MR` : Bellekteki değeri ekrana getirir.
- `MC` : Belleği sıfırlar.

Bellekte bir değer varsa `M` göstergesi parlak görünür.

### ⌨️ Klavye Kısayolları

| Tuş | İşlev |
|-----|-------|
| `0-9` | Rakam girişi |
| `.` | Ondalık nokta |
| `+`, `-`, `*`, `/` | Dört işlem operatörleri |
| `Enter` veya `=` | Eşittir |
| `Backspace` | Son karakteri sil |
| `Escape` | Tümünü temizle (`AC`) |
| `%` | Yüzde hesapla |

---

## ⚙️ Özelleştirme

### Tema Renklerini Değiştirme

`index.css` dosyasındaki renk değişkenlerini (doğrudan sınıf tanımları içinde) değiştirerek hesap makinesinin görünümünü kolayca kişiselleştirebilirsiniz.

Örneğin arka plan rengini değiştirmek için:

```css
body {
    background: linear-gradient(145deg, #1a1e2c 0%, #2a2f42 100%);
}
