import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Kebijakan privasi — Bahasa Indonesia.
 *
 * 🔴 **Teks bahasa Korea yang berlaku.** Ini terjemahan untuk memudahkan pembacaan; jika ada
 *   perbedaan, `legal-text.ts` (Korea) yang berlaku.
 * ⚠ **Struktur harus sama persis dengan versi Korea** — jumlah bagian dan jumlah baris di
 *   setiap bagian. `npm run check:legal` memeriksanya.
 */
export const PRIVACY_ID: LegalDoc = {
  title: 'Kebijakan Privasi Jogak',
  sourceFingerprint: '4a69870e',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Vivace Games Studio (“operator”) mematuhi Undang-Undang Perlindungan Informasi Pribadi dan peraturan terkait lainnya, serta memproses data pribadi pengguna “Jogak” (“layanan”) sebagaimana dijelaskan di bawah ini. Pada prinsipnya Jogak menyimpan catatan harian yang kamu tulis di dalam perangkatmu sendiri, dan catatanmu dikirim ke server hanya sebatas pencadangan yang kamu aktifkan sendiri serta laporan ringkasan AI yang kamu buat sendiri. Selebihnya kami hanya mengumpulkan informasi seminimal mungkin.',
  sections: [
    {
      h: '1. Kami sampaikan lebih dulu: di mana catatanmu disimpan',
      body: [
        'Catatan harian (judul, isi, daftar, foto, tag, dan emosi) disimpan di penyimpanan internal perangkatmu dan pada dasarnya tidak keluar dari perangkat itu.',
        '⚠ Namun ada dua pengecualian, dan keduanya hanya terjadi bila kamu sendiri yang memilihnya. Tidak satu pun berjalan otomatis.',
        '• Bila kamu mengaktifkan pencadangan — salinan catatanmu yang dienkripsi di perangkat disimpan di server operator. Operator tidak dapat membaca salinan itu. Rinciannya ada di bagian 2(c).',
        '• Bila kamu membuat laporan ringkasan AI — isi catatan pada periode tersebut dikirim tanpa enkripsi melalui server operator kepada penyedia AI. Operator tidak menyimpan isi itu. Rinciannya ada di bagian 2(e).',
        '⚠ Kedua kalimat di atas tidak sama. Pencadangan: kami menyimpannya tetapi tidak dapat membacanya. AI: kami membacanya tetapi tidak menyimpannya. Kami sampaikan apa adanya tanpa mengaburkannya.',
        'Informasi berikut tidak pernah kami kumpulkan dalam keadaan apa pun dan tidak kami kirim keluar dari perangkatmu.',
        '• PIN, pola, atau jawaban petunjuk untuk kunci aplikasi — disimpan di penyimpanan aman perangkat hanya dalam bentuk yang tidak dapat dipulihkan (hash); aslinya tidak disimpan di mana pun.',
        '• Nama, tanggal lahir, nomor telepon, alamat, daftar kontak, lokasi, maupun catatan akses ke seluruh galeri fotomu.',
        'Foto yang kamu pilih di aplikasi disalin ke folder khusus aplikasi di perangkatmu agar dapat dimasukkan ke sebuah catatan, dan tidak dikirim keluar bila kamu tidak mengaktifkan pencadangan. Foto tidak pernah diteruskan ke laporan ringkasan AI.',
      ],
    },
    {
      h: '2. Data pribadi yang kami kumpulkan',
      body: [
        'a. Saat kamu menggunakan “Hubungi kami” (perlu masuk)',
        '• Wajib: alamat email akun Google-mu dan pengenal unik akun sosial (Google “sub”)',
        '  — Dasar hukum: Undang-Undang Perlindungan Informasi Pribadi, Pasal 15(1)4 (diperlukan untuk melaksanakan tindakan yang diminta pengguna, yaitu membalas pertanyaannya)',
        '  — Tujuan: mengidentifikasi pengirim, mengirim balasan, dan memungkinkanmu melihat riwayat pertanyaanmu sendiri',
        '• Kategori dan isi pertanyaan',
        '• Jenis perangkat (Android/iOS) dan versi aplikasi — untuk memahami di lingkungan mana masalah terjadi',
        '※ Masuk diperlukan untuk “Hubungi kami”, langganan, pencadangan, dan laporan AI; menulis catatan, kunci aplikasi, dan fitur lainnya tidak memerlukannya.',
        '※ Saat Anda pertama kali membuka aplikasi, kami menanyakan tahun kelahiran Anda. Jika Anda belum memenuhi batas usia, fitur masuk dan pengumpulan pengidentifikasi perangkat pada huruf f di bawah sama-sama dibatasi; menulis catatan, kunci aplikasi, dan fitur lainnya tetap dapat digunakan sepenuhnya.',
        '※ Batas usia adalah 16, 14, atau 13 tahun tergantung wilayah Anda (14 tahun di Republik Korea); jika tidak dapat ditentukan, berlaku batas tertinggi. Tahun kelahiran yang Anda isikan hanya digunakan untuk penentuan ini dan tidak disimpan maupun dikirimkan.',
        'b. Informasi yang dikumpulkan otomatis saat iklan ditayangkan',
        '• Pengenal iklan (ID iklan Android), informasi perangkat dan jaringan, catatan tayangan dan klik iklan',
        '• Hal di atas dikumpulkan oleh Google (AdMob); detail dan cara menolak ada di bagian 7.',
        'c. Bila kamu mengaktifkan pencadangan (perlu berlangganan)',
        '• Salinan catatanmu yang terenkripsi — dalam bentuk yang tidak dapat didekripsi operator',
        '• Pengenal cadangan, waktu pencadangan, nomor generasi, dan ukuran — informasi ini tidak dienkripsi. Operator dapat mengetahui akun mana yang mencadangkan, kapan, dan seberapa besar.',
        '  — Dasar hukum: persetujuan terpisah darimu (diambil di layar tempat kamu mengaktifkan pencadangan)',
        '⚠ Ketepatannya: operator menyimpan salinan itu tetapi tidak dapat membacanya. Kunci dekripsi hanya ada di perangkatmu dan pada kode pemulihan yang kamu simpan; operator tidak memilikinya.',
        '⚠ Bila kamu kehilangan kode pemulihan, tidak ada cara untuk membuka cadangan itu. Operator pun tidak dapat membukanya untukmu.',
        'd. Bila kamu menggunakan langganan',
        '• Status langganan — kunci hak, waktu berakhirnya langganan, tenggang saat pembayaran gagal, dan apakah akan diperpanjang',
        '• Pengenal transaksi yang diterbitkan toko, pengenal produk, dan pembeda lingkungan pembayaran (produksi/uji coba)',
        '• Catatan perubahan status langganan yang dikirim layanan pembayaran (pembelian, perpanjangan, pembatalan, pengembalian dana, dan sebagainya) beserta isi aslinya',
        '  — Dasar hukum: Undang-Undang Perlindungan Informasi Pribadi, Pasal 15(1)4 (diperlukan untuk melaksanakan tindakan yang diminta pengguna, yaitu memberikan hak langganan yang diajukan)',
        '  — Tujuan: memastikan hak langganan (menghilangkan iklan serta menggunakan pencadangan dan laporan AI), menangani pertanyaan pembayaran dan pengembalian dana',
        '⚠ Data pembayaran seperti nomor kartu kredit atau nomor rekening ditangani Google Play dan tidak diteruskan ke operator. Operator hanya dapat mengetahui bahwa kamu telah membayar dan sampai kapan langganan itu berlaku.',
        'e. Bila kamu membuat laporan ringkasan AI (perlu berlangganan)',
        '• Yang dikirim melalui server operator kepada penyedia AI: judul, isi, emosi, dan tanggal catatan pada periode yang kamu mintakan laporannya',
        '• Yang disimpan operator: ringkasan yang dihasilkan AI, pengenal akun yang membuat laporan, periode, jumlah kali, dan jumlah token yang digunakan',
        '⚠ Ketepatannya: operator tidak menyimpan isi catatan itu sendiri. Namun ① pada saat ringkasan dibuat, isinya melewati server operator, sehingga kami tidak dapat mengatakan bahwa “operator tidak dapat melihatnya”, dan ② ringkasan yang dihasilkan kami simpan selama 90 hari. Kami sampaikan hal ini apa adanya tanpa mengaburkannya.',
        '⚠ Ringkasan ditulis berdasarkan catatanmu, sehingga isi catatan itu dapat termuat di dalamnya.',
        '• Persetujuan terpisah untuk informasi sensitif: catatan harian dapat memuat informasi sensitif seperti kondisi kesehatan atau psikologis sebagaimana dimaksud Pasal 23 Undang-Undang Perlindungan Informasi Pribadi. Karena laporan ringkasan AI memproses isi tersebut tanpa enkripsi, kami meminta persetujuan terpisah untuk pemrosesan informasi sensitif saat kamu pertama kali menggunakan fitur ini. Persetujuan ini terpisah dari persetujuan transfer ke luar negeri pada bagian 6, dan kamu dapat memilih masing-masing secara sendiri-sendiri.',
        'Meski tidak menyetujuinya, semua fitur selain laporan AI tetap dapat kamu gunakan seperti biasa. Laporan hanya dibuat ketika kamu sendiri membuatnya dan tidak pernah dibuat secara otomatis.',
        'f. Saat Anda membuka aplikasi (baik masuk maupun tidak)',
        '• Pengidentifikasi perangkat — nilai acak yang dibuat di perangkat Anda saat aplikasi pertama kali dijalankan. Ini bukan nomor seri perangkat maupun pengidentifikasi iklan, dan akan hilang bila aplikasi dihapus.',
        '  — Dasar pengumpulan: Pasal 15(1)6 Undang-Undang Perlindungan Data Pribadi (kepentingan sah untuk mengoperasikan dan meningkatkan layanan)',
        '  — Tujuan penggunaan: statistik penggunaan layanan (berapa banyak orang menggunakan aplikasi pada berapa hari)',
        '※ Nilai ini tidak dapat menunjukkan siapa Anda dan tidak dikaitkan dengan isi catatan Anda.',
        '※ Jika Anda belum memenuhi batas usia di atas, nilai ini tidak dibuat maupun dikirimkan.',
      ],
    },
    {
      h: '3. Tujuan pemrosesan',
      body: [
        '• Statistik penggunaan layanan: menghitung berapa banyak orang menggunakan aplikasi pada berapa hari, dan memakainya untuk mengoperasikan serta meningkatkan layanan',
        '• Menerima dan menangani pertanyaan: memeriksa apa yang kamu kirim serta menemukan dan memperbaiki kesalahan',
        '• Mengidentifikasi pengirim dan membalas: menyampaikan balasan kepada pengirim dan memungkinkanmu meninjau riwayatmu sendiri',
        '• Menayangkan iklan: menampilkan iklan kepada pengguna versi gratis dan mengukur kinerjanya',
        '• Pencadangan dan pemulihan: bila kamu mengaktifkannya, menyimpan salinan catatanmu yang terenkripsi dan mengembalikannya atas permintaanmu',
        '• Memastikan hak langganan: memberikan penghapusan iklan, pencadangan, dan laporan AI kepada pengguna yang telah membayar, serta menangani pertanyaan pembayaran dan pengembalian dana',
        '• Membuat laporan ringkasan AI dan meningkatkan kualitasnya: menyusun ringkasan untuk periode yang kamu minta lalu memeriksa hasilnya untuk memperbaiki kualitas',
        'Operator tidak menggunakan data pribadi untuk tujuan selain di atas, dan bila tujuannya berubah akan meminta persetujuan terlebih dahulu.',
      ],
    },
    {
      h: '4. Jangka waktu penyimpanan dan penggunaan',
      body: [
        '• Informasi akun (alamat email, Google “sub”): sampai kamu menghapus akun. Saat dihapus, kami memusnahkannya tanpa penundaan atau menjadikannya tidak dapat ditelusuri.',
        '• Isi pertanyaan: 3 tahun sejak diterima (Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik — catatan mengenai keluhan atau penyelesaian sengketa konsumen)',
        '• Data perilaku berbasis pengenal iklan: maksimal 1 tahun sejak dikumpulkan',
        '• Pengidentifikasi perangkat dan catatan hari penggunaan: 400 hari sejak hari penggunaan terakhir. Setelah itu dihapus secara otomatis.',
        '• Salinan cadangan yang terenkripsi: disimpan selama pencadangan aktif dan sampai 90 hari setelah langganan berakhir, lalu dimusnahkan otomatis. Bila kamu menonaktifkan pencadangan, meminta penghapusan, atau menghapus akun, kami memusnahkannya tanpa penundaan tanpa menunggu 90 hari. Cadangan yang tidak diakses selama 3 tahun atau lebih akan dimusnahkan (ini berlaku bila aplikasi dihapus tetapi akun tidak).',
        '• Catatan mengenai pemusnahan cadangan (pengenal cadangan dan waktu pemusnahan): 1 tahun — agar kamu dapat mengetahui “mengapa pemulihan tidak berhasil”; pengenal akun tidak disimpan bersamanya.',
        '• Ringkasan yang dihasilkan AI: 90 hari sejak dibuat. Setelah itu dihapus secara otomatis.',
        '• Catatan penggunaan laporan (pengenal akun, periode, jumlah kali, jumlah token): sampai tujuan pemrosesan tercapai atau sampai kamu menghapus akun',
        '• Catatan mengenai kontrak atau penarikan penawaran, serta pembayaran dan penyediaan barang: 5 tahun (Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik, Pasal 6)',
        'Bila kamu menghapus akun, pengenal akun (alamat email dan Google “sub”) segera dijadikan tidak dapat ditelusuri, sedangkan catatan transaksi di atas disimpan terpisah dalam bentuk yang tidak dapat ditelusuri selama jangka waktu tersebut lalu dimusnahkan.',
        '⚠ Menghapus akun tidak otomatis membatalkan langgananmu di Google Play. Pembatalan harus kamu lakukan sendiri di Google Play > Langganan; bila tidak, tagihan akan terus berjalan.',
        '⚠ Pemberitahuan tentang penghapusan cadangan setelah langganan berakhir hanya sampai kepadamu di layar ketika kamu membuka aplikasi. Bila kamu tidak membukanya, pemberitahuan itu mungkin tidak sampai.',
        'Setelah jangka waktunya lewat atau tujuannya tercapai, kami memusnahkan data tanpa penundaan.',
      ],
    },
    {
      h: '5. Pemberian kepada pihak ketiga',
      body: [
        'Operator tidak memberikan data pribadi pengguna kepada pihak ketiga.',
        'Perusahaan pada bagian 6 adalah penerima alih daya yang memproses informasi atas nama operator dan tidak menggunakannya untuk tujuan mereka sendiri. Penyedia AI tidak menggunakan isi catatan yang diterimanya untuk melatih model.',
        'Pengecualian berlaku bila ada ketentuan khusus dalam peraturan perundang-undangan atau bila aparat penyidik memintanya sesuai prosedur dan cara yang ditetapkan undang-undang.',
      ],
    },
    {
      h: '6. Pengalihdayaan pemrosesan dan transfer ke luar negeri',
      body: [
        'Untuk menyediakan layanan, operator mengalihdayakan pemrosesan sebagai berikut, dan sebagiannya berlangsung di luar Korea.',
        '• Google LLC — Negara: Amerika Serikat. Kontak: https://support.google.com/policies/contact/general_privacy_form. Tujuan: menayangkan dan mengukur iklan (AdMob), masuk dengan akun Google, serta memproses dan memverifikasi pembayaran langganan. Data: pengenal iklan, informasi perangkat dan jaringan, alamat email dan pengenal akun saat masuk, serta informasi transaksi toko. Kapan dan bagaimana: dikirim melalui jaringan saat iklan diminta, saat masuk, dan saat membayar. Penyimpanan: sesuai kebijakan privasi Google',
        '• Supabase Inc. — Negara: Amerika Serikat (tempat pendirian badan hukum). Kontak: privacy@supabase.com. Tujuan: menyimpan informasi pertanyaan dan akun dalam basis data serta menyimpan salinan cadangan terenkripsi dan status langganan. Data: informasi pada bagian 2(a), 2(c), dan 2(d). Kapan dan bagaimana: dikirim melalui jaringan saat kamu mengirim pertanyaan dan saat mencadangkan. Penyimpanan: sampai berakhirnya jangka waktu pada bagian 4. ※ Lokasi fisik penyimpanan adalah Republik Korea (region Seoul), tetapi kami menyebutnya transfer ke luar negeri karena badan hukum yang mengoperasikan berada di luar Korea.',
        '• Vercel Inc. — Negara: Amerika Serikat. Kontak: privacy@vercel.com. Tujuan: mengoperasikan server penerima pertanyaan serta server pencadangan dan AI. Data: informasi pada bagian 2(a). Kapan dan bagaimana: dikirim melalui jaringan saat kamu mengirim pertanyaan. Penyimpanan: sampai kontrak pengalihdayaan berakhir. ※ Salinan cadangan yang terenkripsi dikirim langsung ke penyimpanan tanpa melewati server ini.',
        '• RevenueCat, Inc. — Negara: Amerika Serikat. Kontak: compliance@revenuecat.com. Tujuan: memverifikasi pembayaran langganan dan memeriksa status langganan. Data: pengenal akun, pengenal transaksi dan produk dari toko, informasi perangkat dan aplikasi. Kapan dan bagaimana: dikirim melalui jaringan saat membuka layar langganan dan saat membayar. Penyimpanan: sampai kontrak pengalihdayaan berakhir',
        '• OpenAI OpCo, LLC — Negara: Amerika Serikat (1455 Third Street, San Francisco, California 94158, USA). Kontak: dpo@openai.com. Tujuan: membuat laporan ringkasan. Data: judul, isi, emosi, dan tanggal catatan pada periode yang kamu mintakan laporannya. Kapan dan bagaimana: dikirim melalui jaringan pada saat kamu menekan tombol buat laporan. Penyimpanan: server operator tidak menyimpan isi catatan — isinya hanya ditahan di memori selama ringkasan dibuat lalu langsung dibuang. Penyedia AI menyimpannya paling lama 30 hari untuk pemantauan penyalahgunaan lalu menghapusnya, dan bahkan selama periode itu tidak menggunakannya untuk melatih model.',
        '⚠ Transfer ke luar negeri untuk laporan AI merupakan persetujuan tersendiri. Saat kamu pertama kali menggunakan fitur ini, kami menampilkan keterangan di atas di dalam aplikasi lalu meminta persetujuanmu; persetujuan ini terpisah dari persetujuan informasi sensitif pada bagian 2(e).',
        'Kamu dapat menolak transfer data pribadimu ke luar negeri. Untuk menolak transfer terkait iklan, matikan iklan yang dipersonalisasi sesuai bagian 7; transfer terkait pertanyaan tidak terjadi bila kamu tidak menggunakan “Hubungi kami”. Bila kamu tidak mengaktifkan pencadangan, tidak berlangganan, dan tidak membuat laporan, transfer yang berkaitan dengannya tidak terjadi, dan semua fitur lain termasuk menulis catatan tetap dapat kamu gunakan seperti biasa.',
      ],
    },
    {
      h: '7. Pengenal iklan dan sarana pengumpulan otomatis lainnya, serta cara menolak',
      body: [
        'Layanan ini menggunakan Google AdMob untuk menayangkan iklan kepada pengguna versi gratis. AdMob dapat mengumpulkan dan menggunakan pengenal iklan untuk menayangkan iklan yang dipersonalisasi.',
        'Tujuan pengumpulan: menayangkan iklan yang dipersonalisasi, mengukur kinerja iklan, dan mencegah klik curang',
        'Cara menolak (Android): Setelan > Privasi > Iklan > “Hapus ID iklan” atau “Nonaktifkan personalisasi iklan”',
        'Cara menolak (iOS): Pengaturan > Privasi & Keamanan > Pelacakan > matikan “Izinkan App Meminta untuk Melacak”',
        'Meski kamu menolak, iklan tetap dapat muncul, tetapi berupa iklan umum yang tidak didasarkan pada minatmu.',
        'Bila kamu berlangganan, iklan tidak ditampilkan sama sekali dan pengumpulan terkait iklan di atas juga tidak terjadi.',
        'Selengkapnya tentang cara Google memproses data pribadi untuk iklan: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Prosedur dan cara pemusnahan',
      body: [
        'Prosedur: data pribadi yang jangka waktunya telah lewat atau tujuannya telah tercapai dimusnahkan tanpa penundaan. Bila undang-undang mewajibkan penyimpanan, data disimpan terpisah dari data lain selama jangka waktu tersebut lalu dimusnahkan.',
        'Cara: informasi berbentuk berkas elektronik dihapus permanen dengan cara teknis yang membuatnya tidak dapat dipulihkan atau direkonstruksi.',
        'Catatan, foto, dan informasi kunci yang tersimpan di perangkatmu terhapus dari perangkat saat kamu menggunakan fitur “Atur ulang semua” di aplikasi atau menghapus aplikasinya.',
        'Bila kamu mengaktifkan pencadangan, salinan terenkripsi yang tersimpan di server ikut dimusnahkan ketika kamu menghapusnya dari layar pencadangan di aplikasi atau ketika kamu menghapus akun. Saat akun dihapus, kami memusnahkan cadangan lebih dulu baru menghapus akunnya — sebab bila akunnya lenyap lebih dulu, tidak ada lagi orang yang berwenang menghapus cadangan itu.',
        'Bila kamu tidak mengaktifkan pencadangan, operator tidak memiliki catatan yang ada di perangkatmu sehingga tidak dapat menghapusnya untukmu.',
      ],
    },
    {
      h: '9. Hak subjek data dan wali sah serta cara menggunakannya',
      body: [
        'Kamu dapat menggunakan hak berikut kapan saja.',
        '• Meminta akses ke datamu • Meminta koreksi bila ada kesalahan • Meminta penghapusan • Meminta penghentian pemrosesan • Meminta pengiriman datamu (Undang-Undang Perlindungan Informasi Pribadi, Pasal 35-2)',
        'Hak tersebut dapat digunakan secara tertulis atau melalui email ke kontak pada bagian 11, dan operator akan bertindak tanpa penundaan.',
        'Bila kamu meminta koreksi atas kesalahan dalam datamu, kami tidak akan menggunakan atau memberikan data itu sampai koreksinya selesai.',
        '⚠ Batas hak akses terhadap cadangan: bila kamu meminta akses ke cadanganmu, yang dapat diberikan operator hanyalah teks terenkripsi yang tidak dapat didekripsi beserta metadata pada bagian 2(c). Kami tidak dapat memberikan isi catatanmu dalam bentuk yang terbaca manusia — operator tidak memegang kuncinya. Kamu sendiri dapat memulihkannya kapan saja di aplikasi dengan kode pemulihanmu.',
        'Laporan AI yang sudah jadi dapat kamu hapus kapan saja di aplikasi. Menghapusnya di aplikasi menghilangkannya dari perangkatmu, sedangkan ringkasan yang tersimpan di server dihapus otomatis setelah 90 hari. Bila kamu ingin dihapus lebih cepat, kamu dapat memintanya melalui “Hubungi kami”.',
        '⚠ Ringkasan yang dihasilkan AI dapat berbeda dari fakta dan bukan merupakan diagnosis maupun saran medis atau psikologis. Aplikasi menyediakan cara untuk melaporkan sebuah laporan.',
        'Wali sah anak di bawah 14 tahun dapat menggunakan hak di atas atas nama anak tersebut.',
      ],
    },
    {
      h: '10. Langkah pengamanan',
      body: [
        '• Administratif: meminimalkan jumlah orang yang menangani data pribadi dan memberi mereka pelatihan berkala',
        '• Teknis: pengelolaan hak akses ke sistem pemrosesan, enkripsi saat transit (HTTPS), penyimpanan rahasia kunci aplikasi sebagai hash, dan penggunaan penyimpanan aman perangkat (Keystore/Keychain)',
        '• Enkripsi ujung ke ujung untuk pencadangan: salinan cadangan dienkripsi di perangkatmu sebelum dikirim, dan kunci dekripsinya hanya ada di perangkat itu dan pada kode pemulihanmu. Server operator tidak memiliki kunci tersebut.',
        '• Fisik: server yang menyimpan data pribadi berada di pusat data penyedia cloud dalam dan luar negeri serta mengikuti kebijakan kontrol akses fisik penyedia tersebut.',
        '⚠ Fitur kunci aplikasi mencegah akses ke layar; fitur ini tidak mengenkripsi berkas catatan yang tersimpan di perangkat. Jika perangkat hilang atau diambil dan keamanan perangkat itu sendiri ditembus, isi catatan dapat terekspos.',
      ],
    },
    {
      h: '11. Penanggung jawab perlindungan data dan unit penerima permintaan akses',
      body: [
        'Operator memikul tanggung jawab menyeluruh atas pemrosesan data pribadi dan menunjuk penanggung jawab berikut untuk menangani keluhan dan pemulihan hak pengguna.',
        '• Penanggung jawab perlindungan data: Son Hwi-seong (jabatan: perwakilan)',
        '• Kontak: support@vivace-games.com',
        '• Unit penerima dan pengelola permintaan akses: sama seperti di atas',
        'Kamu dapat menyampaikan kepada penanggung jawab setiap pertanyaan, keluhan, atau permintaan pemulihan terkait perlindungan data yang muncul saat menggunakan layanan. Operator akan menjawab dan menindaklanjuti tanpa penundaan.',
      ],
    },
    {
      h: '12. Cara memperoleh pemulihan atas pelanggaran hak',
      body: [
        'Untuk memperoleh pemulihan atas pelanggaran data pribadimu, kamu dapat mengajukan penyelesaian sengketa atau konsultasi ke lembaga Korea berikut.',
        '• Komite Mediasi Sengketa Informasi Pribadi: 1833-6972 (dari Korea) / www.kopico.go.kr',
        '• Pusat Pengaduan Pelanggaran Privasi: 118 (dari Korea) / privacy.kisa.or.kr',
        '• Kejaksaan Agung, Divisi Investigasi Siber: 1301 (dari Korea) / www.spo.go.kr',
        '• Badan Kepolisian Nasional, Biro Investigasi Siber: 182 (dari Korea) / ecrm.police.go.kr',
        'Selain itu, orang yang hak atau kepentingannya dilanggar oleh keputusan atau kelalaian kepala lembaga publik atas permintaan berdasarkan Pasal 35 (akses), 36 (koreksi dan penghapusan), atau 37 (penghentian pemrosesan) Undang-Undang Perlindungan Informasi Pribadi dapat mengajukan banding administratif sesuai Undang-Undang Banding Administratif.',
      ],
    },
    {
      h: '13. Perubahan kebijakan privasi ini',
      body: [
        'Kebijakan privasi ini berlaku sejak tanggal berlakunya.',
        'Apabila terdapat penambahan, penghapusan, atau perubahan isi karena perubahan peraturan, kebijakan, atau teknologi keamanan, kami akan memberitahukan perubahan tersebut beserta tanggal berlakunya tanpa penundaan melalui pengumuman dalam aplikasi dan dokumen ini.',
        'Riwayat perubahan',
        '• 2026-08-09 ditetapkan pertama kali',
        '• 2026-08-11 pengumuman perubahan mendatang — rencana penerapan langganan bulanan dan pencadangan/pemulihan (teks utama belum berubah)',
        '• 2026-08-12 pengumuman perubahan mendatang — rencana penerapan laporan ringkasan AI (teks utama belum berubah)',
        '• 2026-08-23 revisi — kedua pengumuman di atas telah dimasukkan ke dalam teks utama. Pemrosesan yang berkaitan dengan langganan bulanan, pencadangan/pemulihan, dan laporan ringkasan AI ditambahkan ke bagian 1, 2, 3, 4, 6, 8, 9, dan 10.',
        '• 2026-09-01 perubahan — pengumpulan pengidentifikasi perangkat untuk statistik penggunaan layanan (penghitungan pengguna aktif) ditambahkan pada butir 2, 3, dan 4, serta pemberitahuan verifikasi usia pada butir 2 diperluas.',
      ],
    },
  ],
};

/**
 * Panduan penghapusan akun — Bahasa Indonesia.
 *
 * 🔴 **Teks bahasa Korea yang berlaku** (`legal-text.ts`). Aturannya sama seperti kebijakan privasi.
 *
 * ⚠ Dokumen ini memiliki URL publik tersendiri karena formulir Keamanan data Google Play
 *   mewajibkan jalur penghapusan melalui **web**: orang yang sudah menghapus aplikasinya pun
 *   tetap harus punya cara untuk mengajukan permintaan. URL itulah yang dibuka peninjau Play,
 *   sehingga dokumen ini tidak boleh hanya tersedia dalam bahasa Korea.
 *
 * ⚠ Strukturnya harus sama persis dengan versi Korea — 6 bagian (6/4/9/5/4/3 baris) dan tanpa
 *   perubahan mendatang. `npm run check:legal` memeriksanya.
 */
export const DELETE_ACCOUNT_ID: LegalDoc = {
  title: 'Jogak — Cara menghapus akunmu',
  sourceFingerprint: 'a8b0c8b9',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Halaman ini menjelaskan cara menghapus akun aplikasi Jogak beserta data yang terkait dengannya. Kamu juga dapat mengajukan permintaan lewat email bila sudah menghapus aplikasinya atau tidak dapat masuk.',
  sections: [
    {
      h: '1. Menghapus sendiri di aplikasi',
      body: [
        'Ikuti langkah berikut di aplikasi Jogak dan permintaanmu langsung diproses.',
        '① Buka aplikasi → tab [Pengaturan] di bagian bawah',
        '② Pilih [Hubungi kami]',
        '③ Jika kamu belum masuk, masuklah dengan akun Google',
        '④ Pilih [Hapus akun] di bagian paling bawah layar lalu konfirmasi',
        'Penghapusan akun tidak dapat dibatalkan.',
      ],
    },
    {
      h: '2. Meminta lewat email (bila kamu sudah menghapus aplikasinya atau tidak dapat masuk)',
      body: [
        'Kirimkan hal berikut ke support@vivace-games.com.',
        '• Subjek: Permintaan penghapusan akun Jogak',
        '• Isi: alamat email akun Google yang kamu gunakan untuk masuk ke Jogak',
        'Agar kami dapat memastikan bahwa itu memang kamu, alamat pengirim harus sama dengan alamat yang kamu pakai saat mendaftar. Setelah permintaan diterima, kami memprosesnya dan membalas dalam 7 hari kerja.',
      ],
    },
    {
      h: '3. Data yang dihapus',
      body: [
        'Saat kamu menghapus akun, informasi berikut segera dimusnahkan atau diubah menjadi bentuk yang tidak dapat ditelusuri.',
        '• Pengenal unik akun sosial (Google “sub”)',
        '• Alamat email',
        '• Keterkaitan antara riwayat pertanyaan dan akun penulisnya',
        '• Salinan catatanmu yang terenkripsi di server (bila kamu mengaktifkan pencadangan) — ikut dihapus tanpa menunggu tenggang 90 hari.',
        '• Pengenal cadangan dan catatan pencadangan (waktu, ukuran, nomor generasi)',
        '• Ringkasan laporan AI yang tersimpan di server (paling lama 90 hari) dan catatan penggunaan laporan (periode, jumlah kali, jumlah token)',
        '⚠ Saat kamu menghapus akun, kami memusnahkan cadangan lebih dulu baru menghapus akunnya — sebab bila akunnya lenyap lebih dulu, tidak ada lagi orang yang berwenang menghapus cadangan itu. Bila penghapusan cadangan gagal, penghapusan akun tidak dilanjutkan; silakan coba lagi beberapa saat kemudian.',
        '⚠ Setelah dihapus, hal ini tidak dapat dibatalkan. Meski kamu masih memegang kode pemulihan, kamu tidak akan dapat memulihkan cadangan yang ada di server.',
      ],
    },
    {
      h: '4. Data yang disimpan dan jangka waktunya',
      body: [
        'Informasi berikut disimpan sesuai peraturan perundang-undangan, dan bahkan selama jangka waktu itu hanya tersisa dalam bentuk yang tidak dapat ditelusuri kembali ke penulisnya (pseudonimisasi).',
        '• Isi pertanyaan: 3 tahun (Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik — catatan mengenai keluhan atau penyelesaian sengketa konsumen)',
        '• Catatan transaksi langganan (pengenal transaksi, produk, periode langganan, riwayat perubahan status pembayaran): 5 tahun (Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik, Pasal 6)',
        '• Catatan mengenai pemusnahan cadangan (pengenal cadangan dan waktu pemusnahan): 1 tahun — agar kamu dapat mengetahui “mengapa pemulihan tidak berhasil”; pengenal akun tidak disimpan bersamanya.',
        'Setelah jangka waktu penyimpanan lewat, kami memusnahkannya tanpa penundaan.',
      ],
    },
    {
      h: '5. Yang tertinggal di perangkatmu — menghapus akun tidak menghapusnya',
      body: [
        'Catatan Jogak (judul, isi, foto, tag, dan emosi) serta isi laporan AI disimpan di dalam perangkatmu.',
        'Karena itu, menghapus akun tidak mengubah catatan dan laporan yang ada di perangkatmu. Bila kamu ingin menghapusnya dari perangkat juga, hapus aplikasinya atau jalankan atur ulang lewat [Pengaturan] di aplikasi.',
        'Sebaliknya, bila kamu menghapus aplikasinya, catatan di perangkatmu tidak dapat dipulihkan. Pemulihan hanya mungkin bila kamu mengaktifkan pencadangan dan masih menyimpan kode pemulihanmu, dan hanya selama kamu belum menghapus akun.',
        '⚠ Bila kamu tidak mengaktifkan pencadangan, operator tidak memiliki catatan yang ada di perangkatmu sehingga tidak dapat menghapusnya maupun mengembalikannya untukmu.',
      ],
    },
    {
      h: '6. Langgananmu harus dibatalkan secara terpisah',
      body: [
        'Menghapus akun tidak otomatis membatalkan langgananmu di Google Play, dan bila tidak kamu batalkan, tagihan akan terus berjalan.',
        'Cara membatalkan: aplikasi Google Play Store > profil > Pembayaran dan langganan > Langganan (https://play.google.com/store/account/subscriptions)',
        'Pengembalian dana atas jumlah yang sudah dibayarkan mengikuti kebijakan pengembalian dana Google Play dan kebijakan pengembalian dana operator. Untuk pertanyaan, silakan hubungi alamat kontak di atas.',
      ],
    },
  ],
};

/**
 * Ketentuan penggunaan — Bahasa Indonesia.
 *
 * 🔴 **Teks bahasa Korea yang berlaku** (`legal-text.ts`). Ini terjemahan agar mudah dibaca;
 *   bila keduanya berbeda, versi Korea yang mengikat. Pasal 22 menyatakannya di dalam dokumen
 *   ini sendiri — itulah yang membuat terjemahan ini aman untuk diterbitkan.
 *
 * ⚠ **Struktur harus sama persis dengan versi Korea** — 22 pasal, jumlah baris yang sama pada
 *   setiap pasal, dan tanpa `pending`. `npm run check:legal` memeriksanya. Memecah satu kalimat
 *   Korea menjadi dua kalimat Indonesia membuat pemeriksaan gagal, dan menggabungkan dua kalimat
 *   menyembunyikan klausul yang hilang.
 *
 * ⚠ Dokumen ini ada karena **Pasal 13(2) Undang-Undang Perlindungan Konsumen dalam Perdagangan
 *   Elektronik** — pengungkapan *sebelum* kontrak ditambah pernyataan tertulis isi kontrak
 *   *sesudahnya*. Angka 5 (penarikan penawaran), 6 (pengembalian dana), 8 (keluhan dan sengketa)
 *   dan 9 (ketentuan itu sendiri beserta cara memeriksanya) tidak punya wadah lain. Setiap pasal
 *   adalah wadah bagi satu angka tertentu, jadi **sebuah pasal tidak boleh kehilangan substansi
 *   hukumnya demi terbaca lebih lancar.** Tiga yang paling berat:
 *
 *   - Pasal 12 mengulang Pasal 17(2)5 dan 17(6) secara substansi. “penyediaan konten digital
 *     telah dimulai”, “bagian ... yang disediakan secara bertahap yang belum disediakan” dan
 *     “mencantumkan fakta ini **dan pada saat yang sama** menyediakan ... sebagai produk uji
 *     coba” adalah syarat undang-undang — bila dikaburkan, pembatasannya batal.
 *   - Baris pertama Pasal 20 adalah penjaga terhadap Pasal 35 (kontrak yang merugikan konsumen).
 *     **Jangan pernah menambahkan “sejauh diizinkan hukum”** atau kalimat pembebasan sejenis:
 *     itu membalik kalimatnya menjadi persis hal yang hendak ditolaknya.
 *   - Pasal 22 adalah Pasal 36 (yurisdiksi eksklusif) — alamat **pengguna**, bukan kedudukan
 *     operator. Menyebut kedudukan operator batal demi hukum berdasarkan Pasal 35.
 *
 * ⚠ “청약철회” diterjemahkan **“penarikan penawaran”**, bukan “pembatalan langganan”. Jogak Pro
 *   memang sebuah langganan, dan Pasal 14 adalah pembatalannya — keduanya tidak boleh
 *   bertabrakan dalam satu dokumen.
 */
export const TERMS_ID: LegalDoc = {
  title: 'Ketentuan Penggunaan Jogak',
  sourceFingerprint: 'd18f02f7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'Ketentuan ini mengatur hak, kewajiban, dan tanggung jawab antara Hwiseong Games (nama merek Vivace Games Studio, selanjutnya “operator”) dan pengguna, sehubungan dengan penggunaan aplikasi seluler “Jogak” (selanjutnya “layanan”) yang disediakan operator. Mohon dibaca sebelum kamu menggunakan layanan.',
  sections: [
    {
      h: 'Pasal 1 (Tujuan dan ruang lingkup)',
      body: [
        'Ketentuan ini bertujuan mengatur syarat dan prosedur penggunaan layanan serta hak dan kewajiban operator dan pengguna.',
        'Ketentuan ini berlaku bagi seluruh pengguna layanan. Hal yang sama berlaku bila kamu hanya menulis catatan tanpa masuk ke akun.',
        'Hal yang tidak diatur dalam ketentuan ini tunduk pada peraturan perundang-undangan yang berlaku, termasuk Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik, Undang-Undang Pengaturan Syarat dan Ketentuan, dan Undang-Undang Pemajuan Industri Konten, serta pada kelaziman perdagangan.',
      ],
    },
    {
      h: 'Pasal 2 (Informasi operator)',
      body: [
        'Nama badan usaha: Hwiseong Games (nama merek Vivace Games Studio)',
        // ⚠ Ejaan yang sudah dipakai `PRIVACY_ID` bagian 11. Dua dokumen tidak boleh menyebut orang yang sama dengan cara berbeda
        'Perwakilan: Son Hwi-seong',
        'Alamat tempat usaha: 204, 2F, 22 Seongan 5-gil, Jung-gu, Ulsan, 44421, Republic of Korea',
        'Nomor telepon: +82 10-9926-0925',
        'Alamat surel: support@vivace-games.com',
        'Nomor pendaftaran usaha: 749-25-02260',
        'Nomor pendaftaran usaha penjualan jarak jauh: 2026-Ulsan Jung-gu-0170 (instansi yang menerima pendaftaran: Jung-gu, Kota Metropolitan Ulsan)',
      ],
    },
    {
      h: 'Pasal 3 (Definisi)',
      body: [
        '“Kepingan” (“jogak”) berarti satu catatan harian yang ditulis pengguna di dalam layanan.',
        '“Perangkat” berarti ponsel pintar atau terminal lain tempat pengguna memasang dan menggunakan layanan.',
        '“Jogak Pro” berarti produk langganan berulang berbayar yang menyediakan penghilangan iklan, pencadangan dan pemulihan, serta laporan ringkasan AI.',
        '“Pasar aplikasi” berarti gerai aplikasi seperti Google Play, tempat layanan didistribusikan dan pembayaran produk berbayar dilakukan.',
      ],
    },
    {
      h: 'Pasal 4 (Pemasangan dan perubahan ketentuan)',
      body: [
        'Operator memasang ketentuan ini pada layar [Pengaturan] di dalam layanan dan pada alamat di bawah ini, agar pengguna dapat memeriksanya kapan saja.',
        'https://sonwheesung.github.io/diary/terms.html',
        'Operator dapat mengubah ketentuan ini sepanjang tidak melanggar peraturan perundang-undangan yang berlaku.',
        'Saat mengubah ketentuan ini, operator menyebutkan tanggal berlaku dan alasan perubahan, lalu mengumumkannya di dalam layanan mulai 7 hari sebelum tanggal berlaku. Namun untuk perubahan yang merugikan pengguna, pengumuman dilakukan mulai 30 hari sebelum tanggal berlaku, dengan menampilkan isi sebelum dan sesudah perubahan secara berdampingan dalam bentuk yang mudah dipahami.',
        'Pengguna yang tidak menyetujui ketentuan yang diubah dapat membatalkan layanan berbayar dan berhenti menggunakan layanan sebelum tanggal berlaku. Jika kamu terus menggunakan layanan setelah tanggal berlaku yang diumumkan, kamu dianggap telah menyetujui ketentuan yang diubah.',
      ],
    },
    {
      h: 'Pasal 5 (Isi layanan)',
      body: [
        'Nama layanan yang disediakan operator adalah “Jogak”, dan jenisnya adalah aplikasi seluler (konten digital) untuk menulis dan menyimpan catatan harian.',
        'Fitur yang disediakan gratis: menulis, menyunting, menghapus, dan mencari catatan, melampirkan foto, tag, mencatat emosi, tampilan kalender, kunci aplikasi (PIN dan pola), mode gelap, banyak bahasa, membaca pengumuman, dan Hubungi kami.',
        'Fitur yang disediakan melalui produk berbayar “Jogak Pro”: penghilangan iklan, pencadangan dan pemulihan terenkripsi, serta laporan ringkasan AI.',
        'Judul, isi, foto, tag, dan emosi catatan yang ditulis pengguna hanya disimpan di dalam perangkat pengguna, dan tidak dikirim ke server operator kecuali pengguna mengaktifkan fitur pencadangan.',
        'Jika pencadangan diaktifkan, catatan dienkripsi di perangkat pengguna sebelum dikirim, dan operator tidak menyimpan kunci dekripsinya sehingga tidak dapat membaca isinya.',
        'Saat laporan ringkasan AI dibuat, isi catatan pada periode yang diminta pengguna melewati server operator dan diteruskan kepada penyedia kecerdasan buatan. Operator tidak menyimpan isi tersebut. Rinciannya tunduk pada kebijakan privasi.',
      ],
    },
    {
      h: 'Pasal 6 (Terbentuknya kontrak dan akun)',
      body: [
        'Kontrak penggunaan layanan terbentuk ketika pengguna memasang layanan, menyetujui ketentuan ini, lalu menggunakan layanan.',
        'Fitur gratis, termasuk menulis catatan, dapat digunakan tanpa akun.',
        'Hubungi kami, pembayaran produk berbayar, pencadangan dan pemulihan, serta laporan ringkasan AI memerlukan masuk dengan akun Google.',
        'Pengguna dapat menghapus akunnya kapan saja pada layar [Pengaturan] → [Hubungi kami] di dalam layanan. Cara menghapus akun serta informasi yang dihapus atau disimpan tunduk pada panduan penghapusan akun.',
      ],
    },
    {
      h: 'Pasal 7 (Harga produk berbayar dan pembayaran)',
      body: [
        'Biaya Jogak Pro adalah 3.900 won per bulan dan 29.000 won per tahun, keduanya sudah termasuk pajak pertambahan nilai.',
        'Biaya tersebut ditagihkan otomatis ke metode pembayaran pengguna yang terdaftar di pasar aplikasi, pada saat langganan dimulai dan pada setiap tanggal perpanjangan berikutnya.',
        'Tidak ada biaya lain yang harus ditanggung pengguna selain biaya tersebut. Namun biaya komunikasi data yang diperlukan untuk menggunakan layanan tunduk pada kebijakan penyedia telekomunikasi yang kamu gunakan, dan menjadi tanggunganmu.',
        'Jumlah yang benar-benar ditagihkan dapat berbeda dari jumlah di atas, tergantung kebijakan kurs dan biaya pasar aplikasi atau kebijakan harga per negara. Dalam hal itu, jumlah yang tertera di layar pembayaran yang berlaku.',
        'Bila operator menaikkan biaya, pemberitahuan diberikan lebih dahulu sesuai Pasal 4, dan harga yang dinaikkan tidak diterapkan pada periode langganan yang sudah dibayar.',
      ],
    },
    {
      h: 'Pasal 8 (Pembatasan syarat penjualan)',
      body: [
        'Layanan hanya dapat digunakan di negara tempat pasar aplikasi mengizinkan distribusi, dan pemasangan serta pembayaran hanya dapat dilakukan di negara yang ditetapkan operator sebagai tujuan distribusi.',
        'Satu langganan berbayar hanya terhubung ke satu akun pada satu waktu. Jika kamu masuk dengan akun Google lain di perangkat yang sama, langganan berpindah ke akun tersebut dan tidak dapat lagi digunakan dari akun sebelumnya.',
        'Operator dapat menetapkan batas atas jumlah pemakaian sepanjang diperlukan untuk menyediakan sebagian fitur layanan. Jumlah pembuatan laporan ringkasan AI dibatasi per periode, dan batas itu ditampilkan pada layar layanan.',
      ],
    },
    {
      h: 'Pasal 9 (Waktu dan cara penyediaan)',
      body: [
        'Jogak Pro diterapkan pada akun pengguna segera setelah pembayaran selesai, dan tidak ada proses pengiriman tersendiri.',
        'Bila pembayaran sudah selesai tetapi haknya belum diterapkan, pengguna dapat menggunakan [Pulihkan pembelian] pada layar [Langganan] di dalam layanan, atau menghubungi operator dengan cara pada Pasal 21.',
        'Periode langganan berjalan dari tanggal pembayaran sampai satu hari sebelum tanggal perpanjangan berikutnya, dan diperpanjang otomatis untuk jangka waktu yang sama bila tidak dibatalkan.',
      ],
    },
    {
      h: 'Pasal 10 (Lingkungan penggunaan)',
      body: [
        'Layanan dapat digunakan pada perangkat Android, dan memerlukan versi sistem operasi yang tertera pada halaman detail di pasar aplikasi atau versi yang lebih baru.',
        'Fitur dasar seperti menulis, melihat, dan mencari catatan dapat digunakan tanpa koneksi internet.',
        'Membaca pengumuman, Hubungi kami, masuk, pembayaran, pencadangan dan pemulihan, serta laporan ringkasan AI memerlukan koneksi internet.',
        'Bila ruang penyimpanan perangkat pengguna tidak mencukupi atau sistem operasinya berada di luar rentang yang didukung, sebagian fitur dapat tidak berfungsi sebagaimana mestinya.',
      ],
    },
    {
      h: 'Pasal 11 (Uji coba gratis dan peralihan ke berbayar)',
      body: [
        'Operator menyediakan uji coba gratis selama 7 hari untuk Jogak Pro.',
        'Ketika masa uji coba gratis berakhir, langganan beralih otomatis menjadi langganan berulang berbayar dan biaya pada Pasal 7 ditagihkan.',
        'Sebelum peralihan itu terjadi, operator menampilkan tanggal dan waktu peralihan, harga sebelum dan sesudah perubahan, serta metode pembayaran, dan meminta persetujuan pengguna; bila pengguna tidak menyetujui, pembayaran tidak dilakukan.',
        'Bila kamu tidak ingin ditagih selama uji coba gratis, batalkanlah langganan dengan cara pada Pasal 14 sebelum masa uji coba berakhir. Meski kamu membatalkannya, kamu tetap dapat menggunakan Jogak Pro sampai masa uji coba berakhir.',
      ],
    },
    {
      h: 'Pasal 12 (Penarikan penawaran)',
      body: [
        'Pengguna dapat menarik penawarannya dalam 7 hari sejak tanggal pembayaran produk berbayar, atau sejak tanggal menerima dokumen tertulis mengenai isi kontrak.',
        'Penarikan penawaran dilakukan dengan menyampaikan maksud tersebut ke kanal pertanyaan pada Pasal 21, dan operator memberitahukan hasilnya dalam 3 hari kerja sejak tanggal penerimaan.',
        'Setelah penawaran ditarik, operator mengembalikan pembayaran sesuai Pasal 13, dan hak Jogak Pro pengguna berakhir seketika.',
        'Namun, berdasarkan Pasal 17(2)5 Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik, penarikan penawaran dibatasi apabila penyediaan konten digital telah dimulai. Bahkan dalam hal itu, penarikan penawaran tetap dapat dilakukan atas bagian konten digital yang disediakan secara bertahap yang belum disediakan.',
        'Untuk menerapkan pembatasan tersebut, operator, sesuai ayat (6) pasal yang sama, mencantumkan fakta ini dan pada saat yang sama menyediakan uji coba gratis 7 hari pada Pasal 11 sebagai produk uji coba. Bila operator tidak melakukan tindakan tersebut, pengguna dapat menarik penawarannya terlepas dari pembatasan di atas.',
        'Operator tidak menuntut denda maupun ganti rugi dengan alasan pengguna menarik penawarannya.',
      ],
    },
    {
      h: 'Pasal 13 (Pengembalian dana)',
      body: [
        'Karena pembayaran produk berbayar dilakukan melalui pasar aplikasi, pengembalian dana pada prinsipnya juga diproses sesuai prosedur pengembalian dana pasar aplikasi.',
        'Pengguna dapat meminta pengembalian dana langsung kepada pasar aplikasi, atau kepada operator melalui kanal pertanyaan pada Pasal 21. Bila permintaan disampaikan kepada operator, operator menanganinya dengan berkoordinasi bersama pasar aplikasi.',
        'Operator mengembalikan dana dalam 3 hari kerja sejak tanggal menerima pernyataan penarikan penawaran atau pernyataan sejenis. Penerimaan uang secara nyata dapat memakan waktu lebih lama, tergantung jadwal pemrosesan pasar aplikasi.',
        'Bila operator menunda pengembalian dana melewati jangka waktu tersebut tanpa alasan yang sah, operator juga membayar bunga keterlambatan untuk masa keterlambatan itu, yang dihitung dengan mengalikan tingkat bunga yang ditetapkan Peraturan Pelaksanaan Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik.',
        'Bila ada masa yang sudah digunakan, operator dapat memotong jumlah yang sepadan dengan masa itu sebelum mengembalikan dana. Namun tidak ada pemotongan untuk masa ketika pengguna tidak dapat menggunakan layanan karena hal yang dapat dipersalahkan kepada operator.',
        'Tidak ada biaya tersendiri yang dikenakan untuk pengembalian dana.',
      ],
    },
    {
      h: 'Pasal 14 (Pembatalan langganan)',
      body: [
        'Pengguna dapat membatalkan langganan kapan saja. Pembatalan harus dilakukan sendiri oleh pengguna pada layar pengelolaan langganan di pasar aplikasi; operator tidak dapat membatalkannya untuk pengguna.',
        'Google Play: aplikasi Store > profil > Pembayaran dan langganan > Langganan (https://play.google.com/store/account/subscriptions)',
        'Meski kamu membatalkannya, kamu tetap dapat menggunakan Jogak Pro sampai periode langganan yang sudah dibayar berakhir, dan setelah periode itu lewat perpanjangan otomatis berhenti.',
        'Menghapus akun di layanan tidak membatalkan langganan di pasar aplikasi. Bila kamu tidak membatalkannya dengan cara di atas, terpisah dari penghapusan akun, tagihan akan terus berjalan.',
      ],
    },
    {
      h: 'Pasal 15 (Kontrak yang dibuat anak di bawah umur)',
      body: [
        'Bila anak di bawah umur membayar produk berbayar tanpa persetujuan wali sahnya, anak tersebut atau wali sahnya dapat membatalkan kontrak itu.',
        'Namun pembatalan tidak dapat dilakukan bila anak di bawah umur membayar dengan harta yang telah diizinkan wali sahnya untuk digunakan, atau bila ia memakai tipu daya sehingga dipercaya sebagai orang dewasa.',
        'Bila kamu ingin membatalkannya, silakan ajukan permintaan melalui kanal pertanyaan pada Pasal 21. Operator dapat meminta dokumen yang menunjukkan bahwa kamu adalah wali sahnya.',
      ],
    },
    {
      h: 'Pasal 16 (Kewajiban pengguna)',
      body: [
        'Pengguna wajib mematuhi peraturan perundang-undangan yang berlaku dan ketentuan ini saat menggunakan layanan.',
        'Pengguna dilarang menyalahgunakan akun orang lain, mengganggu jalannya layanan secara normal, mengakses atau mencoba mengakses layanan dengan cara selain yang ditetapkan operator, serta memanipulasi proses pembayaran produk berbayar.',
        'Pengguna wajib mengelola sendiri informasi akunnya serta kata sandi atau pola kunci aplikasinya.',
        'Pengguna wajib menyimpan dengan aman kode pemulihan yang diterbitkan saat fitur pencadangan diaktifkan. Bila kode pemulihan hilang, operator pun tidak dapat mendekripsi cadangan sehingga pemulihan menjadi tidak mungkin.',
      ],
    },
    {
      h: 'Pasal 17 (Penyimpanan data dan pencadangan)',
      body: [
        'Catatan asli yang ditulis pengguna disimpan di perangkat pengguna. Bila aplikasi dihapus atau perangkat diatur ulang, catatan di dalam perangkat tidak dapat dipulihkan.',
        'Bila fitur pencadangan diaktifkan, operator menyimpan salinan terenkripsi, dan pengguna dapat memulihkannya dengan kode pemulihan.',
        'Bahkan setelah langganan berakhir, operator menyimpan cadangan terenkripsi selama 90 hari, dan pemulihan tetap dapat digunakan selama masa itu. Setelah 90 hari lewat, cadangan dihapus.',
        'Operator tidak memiliki sarana notifikasi push, sehingga pemberitahuan mengenai rencana penghapusan di atas hanya dilakukan dengan menampilkannya di layar ketika pengguna membuka aplikasi.',
        'Bila pengguna menghapus akunnya, cadangan terenkripsi yang tersimpan di server dihapus bersama akun tanpa tenggang 90 hari.',
      ],
    },
    {
      h: 'Pasal 18 (Hak kekayaan intelektual)',
      body: [
        'Hak atas catatan yang ditulis pengguna di layanan dan foto yang dilampirkannya berada pada pengguna. Operator tidak mengklaim hak apa pun atasnya.',
        'Operator tidak menggunakan catatan pengguna untuk tujuan selain penyediaan layanan, dan tidak menggunakannya untuk keperluan iklan, statistik, maupun pelatihan kecerdasan buatan.',
        'Hak atas layanan itu sendiri serta desain, merek, dan program yang terdapat di dalamnya berada pada operator atau pada pemegang hak yang sah.',
        'Pengguna dilarang menggandakan, mendistribusikan, atau merekayasa balik layanan tanpa persetujuan operator terlebih dahulu.',
      ],
    },
    {
      h: 'Pasal 19 (Perubahan, penghentian sementara, dan pengakhiran layanan)',
      body: [
        'Operator dapat mengubah isi layanan untuk meningkatkan kualitasnya. Bila isi produk berbayar diubah dengan cara yang merugikan pengguna, pemberitahuan diberikan lebih dahulu sesuai Pasal 4.',
        'Operator dapat menghentikan penyediaan layanan untuk sementara bila ada sebab yang tidak terhindarkan seperti pemeriksaan, penggantian, atau kerusakan perangkat, maupun terputusnya komunikasi, dan dalam hal itu pemberitahuan diberikan lebih dahulu. Namun bila ada sebab tidak terhindarkan yang membuat pemberitahuan awal tidak mungkin, pemberitahuan diberikan setelahnya.',
        'Bila operator mengakhiri layanan, pemberitahuan diberikan melalui pengumuman di dalam layanan dan halaman detail di pasar aplikasi paling lambat 30 hari sebelum tanggal pengakhiran, disertai keterangan mengenai jangka waktu bagi pengguna untuk mengunduh atau memulihkan cadangannya.',
        'Saat layanan diakhiri, biaya yang sepadan dengan masa yang sudah dibayar tetapi belum digunakan dikembalikan kepada pengguna.',
      ],
    },
    {
      h: 'Pasal 20 (Tanggung jawab)',
      body: [
        'Operator memikul tanggung jawab sebagaimana ditetapkan peraturan perundang-undangan yang berlaku sehubungan dengan penyediaan layanan. Tidak satu pun ketentuan dalam dokumen ini mengecualikan atau membatasi tanggung jawab operator yang ditetapkan peraturan perundang-undangan.',
        'Operator tidak bertanggung jawab atas kerugian yang timbul dari sebab yang tidak dapat dipersalahkan kepada operator, seperti keadaan kahar, kerusakan, kehilangan, atau pengaturan ulang perangkat pengguna, maupun hilangnya kode pemulihan atau kata sandi kunci aplikasi pengguna.',
        'Laporan ringkasan AI adalah bahan rujukan yang dihasilkan kecerdasan buatan, dan bukan diagnosis atau saran medis, psikologis, maupun hukum. Operator tidak menjamin ketepatan isinya.',
        'Kerugian yang timbul dalam proses pembayaran melalui pasar aplikasi karena hal yang dapat dipersalahkan kepada pasar aplikasi tunduk pada kebijakan pasar aplikasi. Meskipun demikian, operator memberikan seluruh kerja sama yang diperlukan untuk memulihkan kerugian pengguna.',
      ],
    },
    {
      h: 'Pasal 21 (Keluhan konsumen dan penanganan sengketa)',
      body: [
        'Untuk menangani pendapat dan keluhan pengguna, operator menjalankan kanal [Pengaturan] → [Hubungi kami] di dalam layanan dan kanal surel di bawah ini.',
        'Surel: support@vivace-games.com',
        'Bila operator menilai pendapat atau keluhan yang diajukan pengguna beralasan, operator menanganinya tanpa penundaan; bila penanganannya memakan waktu, operator memberitahukan alasan dan jadwal penanganannya.',
        'Bila timbul sengketa antara operator dan pengguna, pengguna dapat mengajukan mediasi sengketa kepada lembaga berikut.',
        '• Komite Mediasi Sengketa Konsumen (Badan Konsumen Korea): 1372 (dari Korea) · https://www.kca.go.kr',
        '• Komite Mediasi Sengketa Konten: 1588-2594 · https://www.kcdrc.kr',
        '• Komite Mediasi Sengketa Transaksi Elektronik: 1661-5714 · https://www.ecmc.or.kr',
      ],
    },
    {
      h: 'Pasal 22 (Hukum yang berlaku dan yurisdiksi)',
      body: [
        'Hukum Republik Korea berlaku bagi ketentuan ini dan bagi penggunaan layanan.',
        'Gugatan mengenai sengketa yang timbul antara operator dan pengguna tunduk pada yurisdiksi eksklusif pengadilan distrik yang wilayah hukumnya meliputi alamat pengguna pada saat gugatan diajukan, sesuai Pasal 36 Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik. Bila tidak ada alamat, gugatan tunduk pada yurisdiksi eksklusif pengadilan distrik yang wilayah hukumnya meliputi tempat tinggal pengguna; dan bila alamat atau tempat tinggal pengguna tidak jelas pada saat gugatan diajukan, pengadilan yang berwenang ditentukan sesuai Undang-Undang Hukum Acara Perdata.',
        'Versi bahasa Korea dari ketentuan ini adalah versi yang mengikat. Bila terjemahan dalam bahasa lain berbeda maknanya, versi bahasa Korea yang berlaku.',
        'Ketentuan penutup: Ketentuan ini mulai berlaku pada 17 Agustus 2026.',
      ],
    },
  ],
};
