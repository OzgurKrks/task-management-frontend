# Görev Yönetim Sistemi

Bu proje, kullanıcıların projeler oluşturup bu projeler altında görevler atayabileceği, takip edebileceği ve yönetebileceği, modern bir görev yönetim sisteminin backend API'sini içermektedir.

## 🚀 Demo

Uygulamanın canlı demo versiyonuna aşağıdaki bağlantıdan erişebilirsiniz:
**[https://task-management-frontend-three-ashen.vercel.app/](https://task-management-frontend-three-ashen.vercel.app/)**

## 🌟 Özellikler

- **Kullanıcı Yönetimi**: Kayıt, giriş ve kullanıcı profil yönetimi
- **Proje Yönetimi**: Proje oluşturma, okuma, güncelleme ve silme işlemleri
- **Görev Yönetimi**: Projeler altında görev oluşturma ve yönetme
- **Bildirim Sistemi**: Görev atamaları ve güncellemeleri için bildirimler
- **Gerçek Zamanlı Güncellemeler**: Socket.io ile gerçek zamanlı veri akışı
- **Rol Tabanlı Yetkilendirme**: Admin, developer gibi farklı kullanıcı rolleri
- **RESTful API**: Modern ve standartlara uygun API tasarımı

## 🚀 Başlangıç

### Gereksinimler

- Node.js (v14.0.0 veya üzeri)
- npm veya yarn

### Kurulum

1. Projeyi klonlayın:

   ```bash
   git clone https://github.com/your-username/task-management-frontend.git
   cd task-management-frontend
   ```

2. Bağımlılıkları yükleyin:

   ```bash
   npm install
   # veya
   yarn install
   ```

3. Uygulamayı geliştirme modunda başlatın:

   ```bash
   npm run dev
   # veya
   yarn dev
   ```

## 📱 Nasıl Kullanılır

### 1. Hesap Oluşturma ve Giriş

- Sağ üst köşedeki "Kaydol" butonuna tıklayarak yeni bir hesap oluşturun.
- Mevcut hesabınız varsa "Giriş Yap" seçeneğini kullanabilirsiniz.
- Rol seçimi ile (Geliştirici, Yönetici veya Admin) uygun yetkilere sahip olabilirsiniz.

### 2. Görevleri Yönetme

- Ana panoda (Dashboard) tüm projelerinizi ve görevlerinizi görüntüleyebilirsiniz.
- "Yeni Görev" butonuna tıklayarak yeni görevler oluşturabilirsiniz.
- Her göreve öncelik atayabilir, açıklama ekleyebilir ve ekip üyelerine atayabilirsiniz.

### 3. Proje Yönetimi

- "Projeler" sekmesinden projelerinizi görüntüleyebilir ve yönetebilirsiniz.
- Yeni projeler oluşturabilir ve mevcut projeleri düzenleyebilirsiniz.
- Proje detaylarını görüntüleyebilir ve proje içindeki görevleri takip edebilirsiniz.

## 🛠️ Teknolojiler

- **Next.js**: Hızlı ve SEO dostu bir React framework'ü
- **TypeScript**: Tip güvenliği sağlar
- **Redux**: Uygulama durumu yönetimi
- **Tailwind CSS**: Modern ve duyarlı tasarım için
- **Axios**: API istekleri için
- **Heroicons**: Simgeler
