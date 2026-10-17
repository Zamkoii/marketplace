# United Bazaar

PROJECT: MEMBANGUN APLIKASI MARKETPLACE MULTI-VENDOR

Bertindaklah sebagai Senior Full-Stack Developer, Software Architect, UI/UX Designer, dan Database Engineer profesional.

Saya ingin membangun aplikasi marketplace multi-vendor yang terinspirasi dari fitur dan kemudahan penggunaan Shopee, tetapi memiliki desain, identitas merek, dan implementasi kode sendiri.

Aplikasi ini memungkinkan banyak penjual membuka toko, mengunggah produk, mengelola pesanan, melihat statistik penjualan, dan mengatur toko mereka masing-masing. Pembeli dapat mencari produk, memasukkannya ke keranjang, melakukan checkout, membayar, dan melacak pesanan.

Bangun aplikasi ini sebagai produk yang benar-benar berfungsi, bukan hanya mockup atau desain halaman statis.

1. TEKNOLOGI YANG DIGUNAKAN

Gunakan stack berikut sebagai pilihan utama:

Frontend: Next.js dengan App Router dan TypeScript.

Styling: Tailwind CSS.

UI Components: shadcn/ui.

Backend: Next.js server-side logic dan API yang terstruktur.

Database: PostgreSQL.

ORM: Prisma.

Authentication: sistem autentikasi yang aman dengan dukungan email dan password.

Image Storage: layanan object storage yang cocok untuk gambar produk.

Validasi: Zod.

Form Management: React Hook Form.

Charts: Recharts.

Ikon: Lucide.

Payment Gateway: siapkan integrasi yang memungkinkan penggunaan Midtrans atau Xendit di Indonesia.

Deployment: siapkan agar aplikasi dapat di-deploy ke layanan hosting yang mendukung Next.js dan PostgreSQL.

Gunakan versi package yang stabil dan saling kompatibel. Jika ada kendala teknis, jelaskan alasannya dan berikan alternatif terbaik.

2. JENIS PENGGUNA DAN HAK AKSES

Buat sistem dengan tiga jenis pengguna utama.

A. Pembeli (Buyer)

Pembeli dapat:

Mendaftar dan login.

Mengedit profil.

Menyimpan beberapa alamat pengiriman.

Melihat halaman utama marketplace.

Mencari produk berdasarkan nama atau kata kunci.

Memfilter produk berdasarkan kategori, harga, rating, dan toko.

Mengurutkan produk berdasarkan harga, popularitas, dan produk terbaru.

Melihat detail produk, foto, deskripsi, variasi, stok, dan ulasan.

Mengikuti atau memfavoritkan toko dan produk.

Menambahkan produk ke keranjang.

Membeli beberapa produk dari beberapa toko dalam satu checkout.

Memilih alamat dan metode pengiriman.

Melakukan pembayaran.

Melihat status pesanan.

Melacak pengiriman.

Mengonfirmasi penerimaan pesanan jika sesuai alur bisnis.

Memberikan rating dan ulasan untuk produk yang telah dibeli.

Mengajukan pembatalan atau pengembalian sesuai kebijakan marketplace.

Melihat riwayat transaksi.

B. Penjual (Seller)

Penjual harus memiliki dashboard toko sendiri yang terpisah dari dashboard admin dan pembeli.

Penjual dapat:

Mendaftar sebagai penjual.

Membuat toko.

Mengatur nama toko, logo, banner, deskripsi, alamat, dan informasi kontak.

Mengatur profil dan informasi pengiriman toko.

Mengunggah produk dengan banyak gambar.

Mengatur kategori produk.

Mengatur harga jual dan harga diskon.

Mengelola variasi produk seperti ukuran, warna, dan model.

Mengatur SKU dan stok setiap variasi.

Mengaktifkan atau menonaktifkan produk.

Mengelola pesanan yang masuk.

Memproses pesanan.

Mengatur status pesanan sesuai alur operasional.

Memasukkan nomor resi pengiriman.

Mengelola promo dan diskon toko.

Melihat ulasan pembeli.

Melihat performa toko.

Melihat laporan penjualan.

Melihat estimasi pendapatan dan saldo yang tersedia.

Melihat riwayat pencairan dana.

Mengatur rekening pencairan dana dengan perlindungan data yang sesuai.

Menghubungi pembeli melalui fitur komunikasi yang disediakan marketplace.

Mengunduh laporan penjualan.

C. Admin Marketplace

Admin memiliki dashboard khusus untuk mengelola seluruh marketplace.

Admin dapat:

Melihat statistik seluruh marketplace.

Mengelola akun pembeli.

Mengelola akun penjual.

Memverifikasi pengajuan toko.

Menyetujui atau menolak pendaftaran toko.

Menonaktifkan toko atau akun yang melanggar aturan.

Mengelola kategori produk.

Memoderasi produk.

Mengelola pesanan dan transaksi.

Melihat pembayaran yang berhasil, gagal, atau tertunda.

Mengelola komisi marketplace.

Mengelola pencairan dana kepada penjual.

Mengelola banner dan konten halaman utama.

Mengelola voucher dan promo marketplace.

Menangani laporan, sengketa, pembatalan, dan pengembalian dana.

Melihat laporan pendapatan dan aktivitas platform.

Mengatur konfigurasi marketplace.

Melihat audit log aktivitas administratif.

Pastikan setiap role mempunyai hak akses yang sesuai. Penjual tidak boleh melihat atau mengubah data toko milik penjual lain.

3. DASHBOARD PENJUAL

Buat dashboard penjual yang modern, profesional, responsif, dan mudah digunakan.

Gunakan sidebar di sebelah kiri, top navigation bar, notifikasi, dan area konten utama.

Menu sidebar:

Dashboard

Produk Saya

Tambah Produk

Kategori Produk

Pesanan

Pengiriman

Promo dan Diskon

Ulasan Produk

Pelanggan

Keuangan

Pencairan Dana

Analitik Penjualan

Pengaturan Toko

Bantuan

Logout

Ringkasan dashboard

Tampilkan kartu statistik:

Total penjualan.

Total pesanan.

Pesanan baru.

Pesanan yang perlu diproses.

Produk aktif.

Produk dengan stok menipis.

Produk habis.

Estimasi pendapatan bersih.

Saldo yang tersedia.

Rating toko.

Grafik dan analitik

Tampilkan:

Grafik penjualan harian, mingguan, dan bulanan.

Grafik jumlah pesanan.

Produk terlaris.

Produk dengan performa terbaik.

Produk dengan stok rendah.

Ringkasan pesanan berdasarkan status.

Perbandingan performa berdasarkan periode.

Riwayat transaksi terbaru.

Sediakan filter tanggal dan rentang waktu.

Semua angka dan grafik harus berasal dari database dan perhitungan yang benar. Jangan menggunakan angka statis yang seolah-olah merupakan data asli.

Manajemen produk

Buat tabel produk dengan:

Gambar produk.

Nama produk.

SKU.

Kategori.

Harga.

Stok.

Status produk.

Jumlah terjual.

Tanggal dibuat.

Aksi edit, lihat, dan hapus.

Sediakan pencarian, filter, pagination, konfirmasi penghapusan, serta formulir tambah dan edit produk.

Manajemen pesanan

Buat halaman pesanan dengan tab:

Semua pesanan.

Menunggu pembayaran.

Perlu diproses.

Sedang dikemas.

Dalam pengiriman.

Selesai.

Dibatalkan.

Pengembalian atau refund.

Tampilkan nomor pesanan, tanggal, nama pembeli, produk, jumlah, total, metode pengiriman, dan status.

Pastikan perubahan status mengikuti aturan bisnis yang benar dan tersimpan ke database.

Keuangan toko

Buat halaman keuangan yang menampilkan:

Total nilai pesanan.

Komisi marketplace.

Biaya transaksi yang berlaku.

Refund.

Pendapatan bersih penjual.

Saldo tertahan.

Saldo yang dapat dicairkan.

Riwayat pencairan dana.

Status pencairan dana.

Pisahkan omzet, pendapatan bersih, saldo tersedia, dan saldo tertahan. Jangan menyamakan total nilai pesanan dengan uang yang sudah diterima penjual.

4. HALAMAN MARKETPLACE UNTUK PEMBELI

Buat storefront marketplace dengan desain modern yang terinspirasi dari pola UX e-commerce populer, tetapi jangan menyalin logo, aset, atau identitas merek Shopee.

Halaman yang diperlukan:

Homepage.

Halaman kategori.

Halaman hasil pencarian.

Halaman detail produk.

Halaman toko penjual.

Keranjang belanja.

Checkout.

Halaman pembayaran.

Status pembayaran.

Daftar pesanan.

Detail pesanan.

Pelacakan pengiriman.

Wishlist.

Profil pengguna.

Daftar alamat.

Pusat notifikasi.

Halaman ulasan.

Pusat bantuan.

Halaman kebijakan dan ketentuan.

Desain homepage

Homepage harus memiliki:

Header dengan logo marketplace.

Search bar yang menonjol.

Navigasi kategori.

Banner promosi.

Kategori populer.

Produk rekomendasi.

Produk terlaris.

Produk terbaru.

Toko unggulan.

Flash sale jika fitur tersebut diaktifkan.

Footer berisi informasi dan tautan penting.

Buat desain responsif untuk desktop, tablet, dan mobile.

Pada perangkat mobile, prioritaskan navigasi yang sederhana, akses keranjang yang mudah, dan proses checkout yang ringkas.

5. SISTEM KERANJANG DAN CHECKOUT MULTI-TOKO

Marketplace harus mendukung pembelian dari beberapa toko dalam satu checkout.

Contoh:

Pembeli memilih produk dari Toko A.

Pembeli memilih produk dari Toko B.

Pembeli membayar melalui satu proses checkout.

Sistem membuat satu pesanan induk dan pesanan terpisah untuk setiap toko.

Setiap penjual hanya melihat pesanan yang berhubungan dengan tokonya.

Setiap toko dapat memproses pengiriman sesuai alur yang berlaku.

Status pengiriman setiap toko dapat berbeda.

Ringkasan pembayaran menampilkan subtotal produk, biaya pengiriman, diskon, biaya tambahan yang berlaku, dan total pembayaran.

Pastikan desain database dan logika transaksi mendukung proses ini dengan konsisten.

6. SISTEM PEMBAYARAN DAN KOMISI

Buat arsitektur pembayaran yang dapat diintegrasikan dengan payment gateway Indonesia.

Fitur yang dibutuhkan:

Pembuatan transaksi pembayaran.

Pemilihan metode pembayaran sesuai dukungan gateway.

Status menunggu pembayaran.

Status berhasil.

Status gagal.

Status kedaluwarsa.

Verifikasi notifikasi pembayaran dari gateway di server.

Penanganan webhook yang aman dan idempoten.

Pembatalan dan refund sesuai kebijakan.

Pencatatan transaksi dan audit log.

Buat sistem komisi marketplace yang dapat dikonfigurasi oleh admin.

Contoh perhitungan:

Harga produk: Rp100.000.

Komisi marketplace: 5%.

Komisi marketplace: Rp5.000.

Biaya lain, jika ada, harus dihitung secara terpisah.

Pendapatan bersih penjual dihitung berdasarkan aturan transaksi yang benar.

Angka di atas hanya contoh. Persentase komisi harus bisa diubah melalui konfigurasi admin.

Jangan menganggap dana pembayaran otomatis sudah tersedia untuk dicairkan kepada penjual. Rancang pencatatan saldo, settlement, refund, dan pencairan berdasarkan status transaksi dan kemampuan payment gateway yang digunakan.

Jangan menyimpan nomor kartu pembayaran atau data sensitif yang seharusnya ditangani oleh payment gateway.

7. SISTEM PENGIRIMAN

Siapkan arsitektur integrasi layanan pengiriman yang cocok untuk Indonesia, misalnya melalui penyedia agregator pengiriman jika tersedia.

Fitur:

Alamat asal toko.

Alamat tujuan pembeli.

Perhitungan ongkos kirim melalui penyedia layanan.

Pemilihan layanan pengiriman.

Pembuatan pengiriman.

Nomor resi.

Pelacakan status pengiriman.

Riwayat perubahan status.

Penanganan kegagalan integrasi.

Jangan membuat ongkos kirim atau status tracking seolah-olah berasal dari penyedia asli jika belum terhubung. Gunakan mock provider yang diberi label jelas untuk pengembangan.

8. DATABASE DAN RELASI DATA

Rancang skema PostgreSQL menggunakan Prisma.

Pertimbangkan entitas berikut:

User

UserProfile

Address

Store

StoreMember jika diperlukan

Category

Product

ProductImage

ProductVariant

Inventory

Cart

CartItem

Wishlist

Order

OrderItem

Payment

PaymentEvent

Shipment

ShipmentEvent

Review

Voucher

Promotion

Commission

SellerBalance atau ledger keuangan

Payout

Refund

Notification

Conversation dan Message jika fitur chat diaktifkan

AuditLog

PlatformSetting

Buat relasi, indeks, constraint, timestamp, dan aturan penghapusan data yang tepat.

Perhatikan:

Satu pengguna dapat menjadi pembeli dan mengajukan toko.

Satu toko memiliki banyak produk.

Satu checkout dapat menciptakan beberapa pesanan toko.

Setiap item pesanan menyimpan snapshot nama, harga, SKU, dan informasi produk saat transaksi dibuat.

Harga harus dihitung dan divalidasi di server.

Stok harus dikurangi secara konsisten ketika transaksi mencapai tahap yang sesuai.

Gunakan transaksi database untuk operasi kritis.

Cegah stok negatif dan pemrosesan pembayaran ganda.

Simpan nominal uang dengan tipe numerik yang sesuai, bukan floating point yang tidak aman untuk perhitungan keuangan.

9. KEAMANAN DAN PERLINDUNGAN DATA

Terapkan:

Role-based access control.

Otorisasi di server untuk setiap operasi sensitif.

Validasi input.

Password hashing yang aman.

Perlindungan terhadap akses lintas toko.

Rate limiting pada endpoint yang sensitif.

Verifikasi signature webhook.

Perlindungan terhadap manipulasi harga dan total pesanan.

Pengamanan upload gambar.

Pengelolaan secret melalui environment variables.

Audit log untuk tindakan penting.

Penanganan error tanpa membocorkan informasi sensitif.

Jangan mengandalkan penyembunyian tombol di frontend sebagai mekanisme keamanan.

10. DESAIN UI/UX

Gunakan gaya desain:

Modern.

Profesional.

Bersih.

Minimalis.

Mudah dipahami.

Konsisten.

Responsif.

Cocok untuk pasar Indonesia.

Gunakan warna utama yang dapat dikonfigurasi, misalnya oranye sebagai aksen dengan latar putih dan abu-abu muda.

Gunakan:

Sidebar dashboard.

Statistik berbentuk cards.

Tabel dengan pagination.

Grafik analitik.

Badge status.

Modal konfirmasi.

Toast notification.

Skeleton loading.

Empty state.

Error state.

Form validation.

Breadcrumb.

Dialog konfirmasi untuk tindakan penting.

Pastikan tampilan dashboard penjual berbeda dari dashboard admin dan halaman pembeli.

Jangan membuat semua halaman terlihat seperti template generik yang sama. Perhatikan hierarki visual dan pengalaman pengguna.

11. STRUKTUR KODE

Susun proyek dengan struktur yang rapi dan mudah dikembangkan.

Pisahkan:

App routes dan layouts.

UI components.

Feature modules.

Server-side services.

Data access layer.

Authentication dan authorization.

Validation schemas.

Database models.

API endpoints atau server actions.

Integrasi payment gateway.

Integrasi shipping provider.

Utility functions.

Tests.

Hindari satu file besar yang berisi seluruh aplikasi.

Gunakan TypeScript dengan tipe yang jelas dan tangani error secara konsisten.

12. DATA DEMO DAN SEEDING

Sediakan seed database yang berisi:

Akun admin demo.

Akun penjual demo.

Beberapa toko demo.

Kategori produk.

Produk dengan variasi.

Pesanan contoh.

Data analitik yang dapat dihitung dari data transaksi demo.

Data demo harus jelas dibedakan dari transaksi produksi.

Jangan menanam password produksi atau secret di dalam source code. Dokumentasikan cara membuat akun demo dengan aman.

13. TESTING

Buat pengujian untuk:

Registrasi dan login.

Hak akses admin, penjual, dan pembeli.

Pembatasan akses data antar-toko.

Pembuatan dan pengelolaan produk.

Perhitungan subtotal dan total checkout.

Checkout multi-toko.

Pengurangan stok.

Verifikasi status pembayaran.

Penanganan webhook berulang.

Perhitungan komisi.

Perhitungan saldo penjual.

Pembatalan dan refund.

Perubahan status pesanan.

Pencairan dana.

Sediakan unit test dan integration test untuk logika bisnis penting. Tambahkan end-to-end test untuk alur utama jika memungkinkan.

14. URUTAN PENGERJAAN

Jangan langsung membuat semua fitur sekaligus tanpa perencanaan.

Kerjakan secara bertahap:

Tahap 1: Analisis kebutuhan, arsitektur, pemilihan teknologi, struktur folder, dan rancangan database.

Tahap 2: Setup proyek, konfigurasi environment, database, Prisma, migrasi, dan seeding.

Tahap 3: Authentication, profil pengguna, role, dan authorization.

Tahap 4: Dashboard admin dan manajemen toko.

Tahap 5: Dashboard penjual dan CRUD produk.

Tahap 6: Homepage marketplace, pencarian, kategori, detail produk, dan halaman toko.

Tahap 7: Keranjang, checkout, dan pesanan multi-toko.

Tahap 8: Pembayaran, komisi, pencatatan keuangan, dan pengiriman.

Tahap 9: Notifikasi, ulasan, promo, dan fitur tambahan.

Tahap 10: Testing, security review, optimasi, dan deployment.

Untuk setiap tahap:

Jelaskan tujuan.

Sebutkan file yang akan dibuat atau diubah.

Implementasikan kode yang diperlukan.

Jelaskan cara menjalankannya.

Jalankan atau sarankan pengujian yang relevan.

Periksa error dan perbaiki sebelum melanjutkan.

Catat fitur yang selesai dan yang belum selesai.

Jangan mengklaim suatu fitur selesai jika baru berupa tampilan atau mock data.

15. CARA KERJA YANG SAYA INGINKAN

Mulailah dengan menganalisis kebutuhan proyek dan menyusun blueprint yang realistis.

Setelah itu, buat:

Ringkasan arsitektur sistem.

Diagram alur pengguna.

ERD atau diagram relasi database.

Struktur folder proyek.

Daftar halaman dan route.

Daftar API atau server actions.

Rencana keamanan.

Rencana implementasi bertahap.

Setelah blueprint disusun, mulai implementasi tahap pertama secara konkret.

Jika kamu memiliki akses ke terminal dan file proyek, buat atau ubah file secara langsung dan jalankan perintah yang diperlukan. Jika tidak memiliki akses tersebut, berikan kode lengkap per file beserta path dan instruksi menjalankannya.

Jangan berhenti hanya pada contoh kode atau pseudocode. Prioritaskan kode yang dapat dijalankan.

Jika ada informasi yang belum ditentukan, gunakan asumsi yang masuk akal, dokumentasikan asumsi tersebut, dan lanjutkan. Ajukan pertanyaan hanya jika jawabannya benar-benar memengaruhi keputusan arsitektur yang penting.

Target akhirnya adalah marketplace multi-vendor yang aman, responsif, terstruktur, dapat diuji, dan siap dikembangkan menuju produksi.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://united-bazaar.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5d841c40-ddb9-4a14-bacb-f3d11070ea63).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
