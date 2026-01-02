# Panduan Manajemen Docker untuk Development (Node.js)

Dokumen ini berisi penjelasan perintah Docker Compose dan cara mengatur lingkungan pengembangan agar kode terupdate otomatis tanpa build ulang.

---

## 1. Penjelasan Perintah Docker Compose

### A. `docker compose up` (Standar)
Perintah ini digunakan untuk menjalankan layanan yang didefinisikan dalam file `docker-compose.yml`.
* **Cara Kerja:** Docker mengekspor image yang sudah ada. Jika image belum pernah dibuat, ia akan melakukan build otomatis.
* **Masalah:** Jika ada perubahan pada kode sumber atau `package.json`, Docker **tidak akan** memperbarui container dengan perubahan tersebut karena ia menggunakan *layer* image yang lama.

### B. `docker compose up --build` (Paksa Build)
Perintah ini memaksa Docker untuk membangun ulang image sebelum menjalankan container.
* **Cara Kerja:** Membaca ulang `Dockerfile`, menyalin kode terbaru, dan menginstal ulang dependensi.
* **Kelebihan:** Menjamin kode terbaru masuk ke dalam image.
* **Kekurangan:** Memakan waktu lama karena harus mengulang proses instalasi library.

### C. `docker compose down -v` (Pembersihan Total)
* **Kegunaan:** Menghentikan container dan menghapus network.
* **Penting:** Flag `-v` menghapus **Volumes** (termasuk database dan folder `node_modules` yang disembunyikan Docker). Gunakan ini jika Anda mengalami error "Module Not Found" setelah menginstal library baru.


---
# 🐳 Panduan Manajemen Docker untuk Development (Node.js)

Dokumen ini berisi kumpulan perintah Docker Compose dan tips agar proses pengembangan (coding) menjadi lebih cepat, efisien, dan otomatis.

---

## 1. Perintah Utama Docker Compose

### A. `docker compose up` (Standar)
* **Kegunaan:** Menjalankan layanan berdasarkan image yang sudah ada.
* **Cara Kerja:** Mencari Image di lokal. Jika ada, langsung dijalankan.
* **Kapan digunakan:** Saat Anda ingin melanjutkan coding dan tidak ada perubahan pada `package.json` atau `Dockerfile`.

### B. `docker compose up --build` (Rebuild)
* **Kegunaan:** Memaksa Docker untuk membangun ulang (build) image sebelum dijalankan.
* **Kapan digunakan:** Saat Anda menambahkan library baru (`npm install`), mengubah `Dockerfile`, atau mengubah file konfigurasi sistem.

### C. `docker compose down -v` (Reset Total)
* **Kegunaan:** Mematikan container dan menghapus **Volumes**.
* **Penting:** Gunakan ini jika database Anda korup atau Anda ingin membersihkan cache `node_modules` yang tersisa di memori Docker.

---

## 2. Perintah Debugging & Monitoring (Penting!)

### D. `docker compose logs -f [nama-service]`
* **Kegunaan:** Melihat log (error/console.log) secara real-time.
* **Contoh:** `docker compose logs -f lms-api`
* **Tips:** Sangat berguna untuk melihat mengapa aplikasi *crash* atau melihat query database yang masuk.



### E. `docker compose exec [nama-service] [perintah]`
* **Kegunaan:** Menjalankan perintah di dalam container yang sedang aktif.
* **Contoh Masuk Terminal:** `docker compose exec lms-api sh`
* **Contoh Cek File:** `docker compose exec lms-api ls -la`

### F. `docker compose restart [nama-service]`
* **Kegunaan:** Mematikan dan menyalakan ulang satu service tertentu tanpa mengganggu service lain (misal: restart API tanpa restart Database).

---

## 3. Manajemen Resource & Pembersihan

### G. `docker system df`
* **Kegunaan:** Melihat berapa banyak ruang harddisk yang dimakan oleh Docker (Images, Containers, Volumes).

### H. `docker system prune -a`
* **Kegunaan:** "Sapu Jagat" untuk menghapus semua image, container, dan network yang tidak terpakai.
* **Efek:** Mengosongkan banyak ruang penyimpanan, tapi Anda harus mendownload/build ulang image saat akan menjalankan project lagi.