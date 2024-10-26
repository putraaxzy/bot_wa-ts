# 📚 WhatsApp Class Schedule Notifier

Selamat datang di proyek **WhatsApp Class Schedule Notifier**! Alat inovatif ini mengotomatiskan pemberitahuan jadwal kelas harian melalui WhatsApp, lengkap dengan kutipan motivasi untuk menginspirasi siswa sebelum setiap pelajaran. Dengan sistem ini, pengguna dapat dengan mudah mengelola jadwal mereka dan menerima pengingat tepat waktu langsung di chat WhatsApp, meningkatkan produktivitas dan memastikan kesiapan untuk setiap kelas.

## 🚀 Fitur

- **Pemberitahuan Jadwal Otomatis**: Dapatkan pengingat sebelum setiap kelas dimulai, sehingga Anda tidak akan melewatkan pelajaran.
- **Kutipan Motivasi**: Mulailah hari Anda dengan kutipan inspiratif yang dikirimkan bersama pelajaran pertama setiap pagi.
- **Integrasi WhatsApp**: Mengirim pesan secara langsung menggunakan pustaka whatsapp-web.js ke chat yang ditentukan.
- **Manajemen Jadwal yang Mudah**: Struktur fleksibel untuk menambah dan mengedit jadwal kelas dengan mudah.
- **Penanganan Kesalahan**: Logging yang kuat dan penanganan kesalahan untuk memastikan operasi yang lancar dan cepat dalam pemecahan masalah.

## 📋 Persyaratan

Untuk memulai, pastikan Anda memiliki hal-hal berikut:

- Node.js dan npm terinstal di mesin Anda.
- Akun WhatsApp untuk akses web.
- Pustaka whatsapp-web.js
- Koneksi internet untuk pemindaian QR code dan permintaan API.

## ⚙️ Instalasi

1. Kloning repositori ini:
   git clone https://github.com/putraaxzy/bot_wa-ts
   cd bot_wa-ts

2. Instal dependensi:
   npm install

3. Konfigurasi kunci API Anda: Tambahkan kunci API Google Gemini Anda di file index.ts

## 🛠️ Penggunaan

### Edit Jadwal
Sesuaikan objek lessons di index.ts untuk mencocokkan jadwal kelas Anda.

### Jalankan Aplikasi
Mulai aplikasi dengan:
npm start

### Autentikasi
QR code akan ditampilkan di terminal. Pindai menggunakan WhatsApp untuk melakukan autentikasi.

### Pemberitahuan
Bot akan secara otomatis mengirimkan pemberitahuan untuk setiap kelas berdasarkan jadwal Anda.

## 📅 Contoh Pengaturan Jadwal

Sesuaikan index.ts Anda dengan jadwal Anda sendiri:

```typescript
const lessons: LessonSchedule = {
    Monday: [
        { subject: 'RPL', startTime: '07:00', endTime: '09:40', teacher: 'Pak Mift' },
        // Kelas tambahan...
    ],
    // Hari lainnya dalam seminggu...
};
```

## 🗂️ Struktur Kode

- Kelas ScheduleManager: Mengelola penjadwalan dan pengiriman pesan.
- Fungsi sendMessage: Mengirim pesan melalui WhatsApp.
- Fungsi scheduleAllLessons: Menjadwalkan pengingat untuk setiap pelajaran.

## 🛠️ Pemecahan Masalah

- Pastikan QR code WhatsApp dipindai untuk setiap sesi baru.
- Verifikasi bahwa versi Node.js dan npm Anda memenuhi persyaratan.

## 👨‍💻 Dibuat oleh

Wibowo Yunanto Sri Saputra
Absen 14, Kelas XI RPL

---

Jelajahi dan kontribusikan pada proyek ini! Masukan dan saran Anda selalu diterima. Selamat coding! 🎉