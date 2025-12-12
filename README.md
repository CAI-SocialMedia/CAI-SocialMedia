# CAI - AI Powered Social Media Platform 🎨

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-Deploy-4285F4?style=for-the-badge&logo=google-cloud)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions)

**CAI**, yapay zeka destekli görsel üretim teknolojilerini (Generative AI) sosyal medya dinamikleriyle birleştiren, kullanıcıların hayal ettikleri görselleri metin yoluyla (text-to-image) oluşturup toplulukla paylaşabildiği full-stack bir web platformudur.

## 🚀 Proje Kapsamı ve Geliştirilen Özellikler

Bu projede modern yazılım geliştirme standartlarını uygulayarak, **Java 21** altyapısı üzerinde ölçeklenebilir ve güvenli bir sistem inşa ettik. Geliştirme sürecinde gerçekleştirdiğimiz temel çalışmalar:

### 1. Yapay Zeka Entegrasyonu & Görsel Üretim
* Kullanıcıların girdiği metinleri (prompt) işleyerek görsel üreten **Generative AI servislerini** sisteme entegre ettik.
* API yanıt sürelerini optimize etmek ve kullanıcı deneyimini artırmak için asenkron (asynchronous) işlem yapıları kurguladık.

### 2. Sosyal Medya Fonksiyonları
* Kullanıcıların ürettikleri içerikleri sergileyebileceği, diğer kullanıcılarla etkileşime girebileceği (Beğeni, Yorum, Paylaşım) dinamik bir **"Community Feed"** yapısı geliştirdik.
* Kişiselleştirilmiş profil sayfaları ve içerik arşivleme sistemini oluşturduk.

### 3. Güvenlik ve Kimlik Doğrulama
* **Spring Security** ve **JWT (JSON Web Token)** kullanarak Stateless bir kimlik doğrulama mimarisi kurduk.
* Kullanıcı verilerinin güvenliği için yetkilendirme (Authorization) katmanlarını detaylıca yapılandırdık.

### 4. DevOps ve CI/CD Süreçleri
* Uygulamanın kesintisiz yayına alınması için **GitHub Actions** üzerinde çalışan bir CI/CD pipeline'ı yazdık.
* Her kod değişikliğinde (push) otomatik build ve test süreçlerinin çalışmasını, ardından **Google Cloud Run** servisine Dockerize edilerek deploy edilmesini sağladık.
* Domain yönlendirmeleri ve SSL sertifikası yapılandırmalarını gerçekleştirerek projeyi canlı ortama taşıdık.

---

## 🛠 Kullanılan Teknolojiler

| Katman |              | Teknoloji |                   | Açıklama |

| **Backend** |         | Java 21, Spring Boot 3 |     | Ana uygulama mantığı ve REST API |
| **Frontend** |        | React.js, Tailwind CSS |     | Responsive kullanıcı arayüzü |
| **Veritabanı** |      | PostgreSQL, Firebase |       |Kullanıcı verileri ve görsel depolama |
| **Container** |       | Docker |                     |Uygulama izolasyonu |
| **Bulut & DevOps** |  | Google Cloud Platform, GitHub Actions | | Sunucu yönetimi ve otomatik dağıtım |

---

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda ayağa kaldırmak için aşağıdaki adımları izleyebilirsiniz.

### Ön Koşullar
* **Java 21 SDK**
* **Node.js 18+**
* **Docker** (Önerilen)

### Adım 1: Repoyu Klonlayın
git clone [https://github.com/CAI-SocialMedia/CAI-SocialMedia.git](https://github.com/CAI-SocialMedia/CAI-SocialMedia.git)
cd CAI-SocialMedia

Adım 2: Backend Servisini Başlatın
cd backend
# Maven wrapper ile bağımlılıkları yükleyin ve projeyi başlatın
./mvnw clean spring-boot:run

Adım 3: Frontend Arayüzünü Başlatın
cd frontend
# Paketleri yükleyin
npm install
# Uygulamayı başlatın
npm run dev

Test ve Kalite Kontrol
Geliştirme sürecinde kod kalitesini korumak için birim testlere (Unit Testing) önem verdik. Backend tarafındaki servislerin doğruluğunu test etmek için:
cd backend
./mvnw test
