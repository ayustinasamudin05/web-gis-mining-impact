# WebGIS Area Rawan Dampak Pertambangan - Kabupaten Konawe Selatan

Aplikasi Sistem Informasi Geografis (WebGIS) ini dikembangkan untuk memetakan dan menganalisis area rawan dampak pertambangan menggunakan algoritma Random Forest, Google Earth Engine, dan Leaflet.js. 

<img width="1917" height="917" alt="image" src="https://github.com/user-attachments/assets/e89f8383-105f-4f18-9a76-751d016f98ae" />

> **🎥 Video Demonstrasi:** [Masukkan Tautan YouTube/Google Drive Video Anda Di Sini]  

---

## 💻 Panduan Menjalankan Aplikasi di Lingkungan Lokal (Localhost)

Aplikasi ini menggunakan arsitektur hibrida (*PHP/MySQL* untuk antarmuka web dan *Node.js* untuk *Backend API* pemrosesan spasial). Ikuti langkah-langkah di bawah ini untuk menguji coba aplikasi secara langsung di komputer Anda.

### Prasyarat Instalasi
Sebelum memulai, pastikan perangkat Anda sudah terinstal perangkat lunak berikut:
1. **XAMPP** (disarankan versi dengan PHP 7.4 atau 8.x)
2. **Node.js** (disarankan versi LTS)
3. **Web Browser** modern (Chrome / Edge / Firefox)

### Langkah 1: Persiapan File dan XAMPP
1. Unduh (Download ZIP) atau *clone* repositori ini.
2. Ekstrak folder proyek dan ubah nama folder menjadi `bismillah_skripsi` (jika berbeda).
3. Pindahkan folder `bismillah_skripsi` ke dalam direktori XAMPP Anda, tepatnya di folder `htdocs` (umumnya berada di `C:\xampp\htdocs\`).
4. Buka aplikasi **XAMPP Control Panel**.
5. Klik tombol **Start** pada modul **Apache** dan **MySQL**.

### Langkah 2: Konfigurasi Database MySQL
1. Buka web browser dan akses `http://localhost/phpmyadmin`.
2. Buat database baru dengan nama: `gis_db`.
3. Pilih database `gis_db` tersebut, lalu klik tab **Import**.
4. Klik *Choose File*, arahkan ke file `gis_db.sql` yang berada di dalam folder `database/` pada proyek ini.
5. Klik **Import** (atau Go) dan tunggu hingga proses selesai.

### Langkah 3: Menjalankan Backend API (Node.js)
1. Buka *Command Prompt* (CMD) atau *Terminal*.
2. Arahkan direktori terminal ke folder proyek Anda. Anda bisa mengetikkan perintah:
   `cd C:\xampp\htdocs\bismillah_skripsi`
3. Instal semua dependensi pustaka yang dibutuhkan dengan mengetikkan perintah berikut lalu tekan Enter:
   `npm install`
4. Setelah instalasi selesai, jalankan server API dengan perintah:
   `npm start` *(atau `node server.js`)*
5. **Penting:** Biarkan jendela *Terminal* ini tetap terbuka selama Anda menguji aplikasi. Jika ditutup, koneksi ke peta dan API akan terputus.

### Langkah 4: Mengakses Aplikasi
1. Buka *tab* baru pada web browser Anda.
2. Akses tautan berikut: `http://localhost/bismillah_skripsi`
3. Aplikasi WebGIS siap diuji coba (termasuk fitur pencarian dan keterangan *popup* kerawanan pada peta).

---
*Dikembangkan oleh Ayustina Samudin - 2026*
