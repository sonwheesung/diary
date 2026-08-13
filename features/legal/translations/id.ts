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
  sourceFingerprint: 'e1010878',
  effective: '2026-08-09',
  updated: '2026-08-11',
  intro:
    'Vivace Games (“operator”) mematuhi Undang-Undang Perlindungan Informasi Pribadi dan peraturan terkait lainnya, serta memproses data pribadi pengguna “Jogak” (“layanan”) sebagaimana dijelaskan di bawah ini. Jogak tidak mengirimkan catatan harian yang kamu tulis ke server mana pun dan, sebagai prinsip, hanya mengumpulkan informasi seminimal mungkin.',
  sections: [
    {
      h: '1. Yang tidak kami kumpulkan (kami sampaikan lebih dulu)',
      body: [
        'Operator tidak mengumpulkan informasi berikut dan tidak mengirimkannya keluar dari perangkatmu.',
        '• Judul, isi, daftar, foto, tag, dan emosi catatan — hanya disimpan di penyimpanan internal perangkatmu.',
        '• PIN, pola, atau jawaban petunjuk untuk kunci aplikasi — disimpan di penyimpanan aman perangkat hanya dalam bentuk yang tidak dapat dipulihkan (hash); aslinya tidak disimpan di mana pun.',
        '• Nama, tanggal lahir, nomor telepon, alamat, daftar kontak, lokasi, maupun catatan akses ke seluruh galeri fotomu.',
        'Foto yang kamu pilih di aplikasi hanya disalin ke folder khusus aplikasi di perangkatmu agar dapat dimasukkan ke sebuah catatan; foto tersebut tidak dikirim ke mana pun.',
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
        '※ Masuk hanya diperlukan untuk “Hubungi kami”; menulis catatan, kunci aplikasi, dan fitur lain tidak memerlukannya.',
        '※ Anak di bawah 14 tahun tidak dapat menggunakan fitur masuk.',
        'b. Informasi yang dikumpulkan otomatis saat iklan ditayangkan',
        '• Pengenal iklan (ID iklan Android), informasi perangkat dan jaringan, catatan tayangan dan klik iklan',
        '• Hal di atas dikumpulkan oleh Google (AdMob); detail dan cara menolak ada di bagian 7.',
      ],
    },
    {
      h: '3. Tujuan pemrosesan',
      body: [
        '• Menerima dan menangani pertanyaan: memeriksa apa yang kamu kirim serta menemukan dan memperbaiki kesalahan',
        '• Mengidentifikasi pengirim dan membalas: menyampaikan balasan kepada pengirim dan memungkinkanmu meninjau riwayatmu sendiri',
        '• Menayangkan iklan: menampilkan iklan kepada pengguna versi gratis dan mengukur kinerjanya',
        'Operator tidak menggunakan data pribadi untuk tujuan selain di atas, dan bila tujuannya berubah akan meminta persetujuan terlebih dahulu.',
      ],
    },
    {
      h: '4. Jangka waktu penyimpanan dan penggunaan',
      body: [
        '• Informasi akun (alamat email, Google “sub”): sampai kamu menghapus akun. Saat dihapus, kami memusnahkannya tanpa penundaan atau menjadikannya tidak dapat ditelusuri.',
        '• Isi pertanyaan: 3 tahun sejak diterima (Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik — catatan mengenai keluhan atau penyelesaian sengketa konsumen)',
        '• Data perilaku berbasis pengenal iklan: maksimal 1 tahun sejak dikumpulkan',
        'Setelah jangka waktunya lewat atau tujuannya tercapai, kami memusnahkan data tanpa penundaan.',
      ],
    },
    {
      h: '5. Pemberian kepada pihak ketiga',
      body: [
        'Operator tidak memberikan data pribadi pengguna kepada pihak ketiga.',
        'Pengecualian berlaku bila ada ketentuan khusus dalam peraturan perundang-undangan atau bila aparat penyidik memintanya sesuai prosedur dan cara yang ditetapkan undang-undang.',
      ],
    },
    {
      h: '6. Pengalihdayaan pemrosesan dan transfer ke luar negeri',
      body: [
        'Untuk menyediakan layanan, operator mengalihdayakan pemrosesan sebagai berikut, dan sebagiannya berlangsung di luar Korea.',
        '• Google LLC — Negara: Amerika Serikat. Kontak: https://support.google.com/policies/contact/general_privacy_form. Tujuan: menayangkan dan mengukur iklan (AdMob), masuk dengan akun Google. Data: pengenal iklan, informasi perangkat dan jaringan, serta saat masuk alamat email dan pengenal akun. Kapan dan bagaimana: dikirim melalui jaringan saat iklan diminta dan saat masuk. Penyimpanan: sesuai kebijakan privasi Google',
        '• Supabase Inc. — Negara: Amerika Serikat (tempat pendirian badan hukum). Kontak: privacy@supabase.com. Tujuan: menyimpan informasi pertanyaan dan akun dalam basis data. Data: informasi pada bagian 2(a). Kapan dan bagaimana: dikirim melalui jaringan saat kamu mengirim pertanyaan. Penyimpanan: jangka waktu pada bagian 4. ※ Lokasi fisik penyimpanan adalah Republik Korea (region Seoul), tetapi kami menyebutnya transfer ke luar negeri karena badan hukum yang mengoperasikan berada di luar Korea.',
        '• Vercel Inc. — Negara: Amerika Serikat. Kontak: privacy@vercel.com. Tujuan: mengoperasikan server penerima pertanyaan. Data: informasi pada bagian 2(a). Kapan dan bagaimana: dikirim melalui jaringan saat kamu mengirim pertanyaan. Penyimpanan: sampai kontrak pengalihdayaan berakhir',
        'Kamu dapat menolak transfer data pribadimu ke luar negeri. Untuk menolak transfer terkait iklan, matikan iklan yang dipersonalisasi sesuai bagian 7; untuk menolak transfer terkait pertanyaan, cukup tidak menggunakan fitur “Hubungi kami” (semua fitur lain, termasuk menulis catatan, tetap dapat digunakan).',
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
        'Selengkapnya tentang cara Google memproses data pribadi untuk iklan: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Prosedur dan cara pemusnahan',
      body: [
        'Prosedur: data pribadi yang jangka waktunya telah lewat atau tujuannya telah tercapai dimusnahkan tanpa penundaan. Bila undang-undang mewajibkan penyimpanan, data disimpan terpisah dari data lain selama jangka waktu tersebut lalu dimusnahkan.',
        'Cara: informasi berbentuk berkas elektronik dihapus permanen dengan cara teknis yang membuatnya tidak dapat dipulihkan atau direkonstruksi.',
        'Catatan, foto, dan informasi kunci yang tersimpan di perangkatmu terhapus dari perangkat saat kamu menggunakan fitur “Atur ulang semua” di aplikasi atau menghapus aplikasinya. Operator tidak memiliki informasi tersebut sehingga tidak dapat menghapusnya untukmu.',
      ],
    },
    {
      h: '9. Hak subjek data dan wali sah serta cara menggunakannya',
      body: [
        'Kamu dapat menggunakan hak berikut kapan saja.',
        '• Meminta akses ke datamu • Meminta koreksi bila ada kesalahan • Meminta penghapusan • Meminta penghentian pemrosesan • Meminta pengiriman datamu (Undang-Undang Perlindungan Informasi Pribadi, Pasal 35-2)',
        'Hak tersebut dapat digunakan secara tertulis atau melalui email ke kontak pada bagian 11, dan operator akan bertindak tanpa penundaan.',
        'Bila kamu meminta koreksi atas kesalahan dalam datamu, kami tidak akan menggunakan atau memberikan data itu sampai koreksinya selesai.',
        'Wali sah anak di bawah 14 tahun dapat menggunakan hak di atas atas nama anak tersebut.',
      ],
    },
    {
      h: '10. Langkah pengamanan',
      body: [
        '• Administratif: meminimalkan jumlah orang yang menangani data pribadi dan memberi mereka pelatihan berkala',
        '• Teknis: pengelolaan hak akses ke sistem pemrosesan, enkripsi saat transit (HTTPS), penyimpanan rahasia kunci aplikasi sebagai hash, dan penggunaan penyimpanan aman perangkat (Keystore/Keychain)',
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
        'Bila ada penambahan, penghapusan, atau perubahan isi karena perubahan peraturan, kebijakan, atau teknologi keamanan, kami akan memberitahukannya melalui pengumuman di aplikasi mulai 7 hari sebelum perubahan berlaku (30 hari sebelumnya bila perubahan itu merugikan pengguna).',
        'Perubahan yang akan berlaku diumumkan lebih dulu pada bagian “Perubahan mendatang” di akhir dokumen ini, dalam bentuk yang memungkinkan perbandingan sebelum dan sesudah.',
        'Riwayat perubahan',
        '• 2026-08-09 ditetapkan pertama kali',
        '• 2026-08-11 pengumuman perubahan mendatang — rencana penerapan langganan bulanan dan pencadangan/pemulihan (teks utama belum berubah)',
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'Sejak hari versi yang memuat langganan bulanan dan pencadangan/pemulihan dirilis',
      summary:
        'Langganan bulanan dan pencadangan/pemulihan ditambahkan. Jika kamu berlangganan, status langganan dan pengenal transaksi akan diproses; dan hanya jika kamu mengaktifkan pencadangan, salinan catatanmu yang dienkripsi di perangkatmu akan disimpan di server operator. Operator tidak dapat mendekripsi salinan itu.',
      sections: [
        {
          h: 'a. Apa yang berubah (sebelum → sesudah)',
          body: [
            'Sebelum: judul, isi, dan foto catatan tidak dikirim keluar dari perangkatmu.',
            'Sesudah: **hanya jika kamu sendiri mengaktifkan pencadangan**, salinan catatanmu yang dienkripsi di perangkatmu akan disimpan di server operator. Jika tidak kamu aktifkan, tidak satu huruf pun dikirim, sama seperti sebelumnya.',
            '⚠ Ketepatannya: operator **menyimpan salinan itu tetapi tidak dapat membacanya.** Kunci dekripsi hanya ada di perangkatmu dan pada kode pemulihan yang kamu simpan; operator tidak memilikinya.',
          ],
        },
        {
          h: 'b. Informasi tambahan yang disimpan jika kamu mengaktifkan pencadangan',
          body: [
            '• Salinan catatanmu yang terenkripsi — dalam bentuk yang tidak dapat didekripsi operator',
            '• Pengenal cadangan, waktu pencadangan, nomor generasi, dan ukuran — **informasi ini tidak dienkripsi.** Operator dapat mengetahui akun mana yang mencadangkan, kapan, dan seberapa besar.',
            '• Dasar hukum: persetujuan terpisah darimu (diambil di layar tempat kamu mengaktifkan pencadangan)',
          ],
        },
        {
          h: 'c. Jangka waktu penyimpanan',
          body: [
            '• Disimpan selama pencadangan aktif dan sampai 90 hari setelah langganan berakhir, lalu dimusnahkan otomatis.',
            '• Jika kamu menonaktifkan pencadangan, meminta penghapusan, atau menghapus akun, kami memusnahkannya tanpa penundaan tanpa menunggu 90 hari.',
            '• Cadangan yang tidak diakses selama 3 tahun atau lebih akan dimusnahkan. (Ini berlaku bila aplikasi dihapus tetapi akun tidak.)',
            '• Catatan pemusnahan (pengenal cadangan dan waktunya) disimpan 1 tahun — agar kamu dapat mengetahui “mengapa pemulihan tidak berhasil”; pengenal akun tidak disimpan bersamanya.',
            '⚠ Pemberitahuan berakhirnya langganan hanya sampai kepadamu di layar ketika kamu membuka aplikasi. Jika kamu tidak membukanya, pemberitahuan itu mungkin tidak sampai.',
          ],
        },
        {
          h: 'd. Batas hak akses',
          body: [
            'Jika kamu meminta akses ke cadanganmu, yang dapat diberikan operator hanyalah **teks terenkripsi yang tidak dapat didekripsi dan metadata pada huruf (b).** Kami tidak dapat memberikan catatanmu dalam bentuk yang terbaca manusia — operator tidak memegang kuncinya.',
            'Kamu sendiri dapat memulihkan kapan saja di aplikasi menggunakan kode pemulihanmu.',
            '⚠ Jika kamu kehilangan kode pemulihan, tidak ada cara untuk membuka cadangan itu. Operator pun tidak dapat membukanya untukmu.',
          ],
        },
        {
          h: 'e. Informasi yang disimpan jika kamu menggunakan langganan',
          body: [
            '• Status langganan — kunci hak, waktu berakhir, tenggang saat pembayaran gagal, dan apakah akan diperpanjang',
            '• Pengenal transaksi yang diterbitkan toko, pengenal produk, dan pembeda lingkungan pembayaran (produksi/uji coba)',
            '• Catatan perubahan status langganan yang dikirim layanan pembayaran (pembelian, perpanjangan, pembatalan, pengembalian dana, dsb.) beserta isi aslinya',
            '⚠ Data pembayaran seperti nomor kartu atau rekening ditangani Google Play dan tidak diteruskan ke operator. Operator hanya dapat mengetahui bahwa kamu telah membayar dan sampai kapan langganannya berlaku.',
            '• Dasar hukum: Undang-Undang Perlindungan Informasi Pribadi, Pasal 15(1)4 (diperlukan untuk melaksanakan tindakan yang diminta pengguna, yaitu memberikan hak langganan yang diajukan)',
            '• Tujuan: memastikan hak langganan (menghilangkan iklan, menggunakan pencadangan), menangani pertanyaan pembayaran dan pengembalian dana',
          ],
        },
        {
          h: 'f. Jangka waktu penyimpanan informasi langganan',
          body: [
            '• Catatan mengenai kontrak atau pembatalan, serta pembayaran dan penyediaan barang: 5 tahun (Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik, Pasal 6)',
            '• Jika kamu menghapus akun, pengenal akun (email, Google “sub”) segera dijadikan tidak dapat ditelusuri, dan catatan transaksi di atas disimpan terpisah dalam bentuk yang tidak dapat ditelusuri selama jangka waktu tersebut lalu dimusnahkan.',
            '⚠ Menghapus akun tidak otomatis membatalkan langgananmu di Google Play. Kamu harus membatalkannya sendiri di Google Play > Langganan; bila tidak, tagihan akan terus berjalan.',
          ],
        },
        {
          h: 'g. Pengalihdayaan dan transfer ke luar negeri (tambahan)',
          body: [
            '• Supabase Inc. — Negara: Amerika Serikat (tempat pendirian). Kontak: privacy@supabase.com. Tujuan: menyimpan salinan cadangan terenkripsi dan status langganan. Data: informasi pada huruf (b) dan (e). Penyimpanan: jangka waktu pada huruf (c) dan (f). ※ Lokasi fisik penyimpanan adalah Republik Korea (region Seoul).',
            '• Vercel Inc. — Negara: Amerika Serikat. Kontak: privacy@vercel.com. Tujuan: mengoperasikan server pencadangan. ※ Salinan terenkripsi dikirim langsung ke penyimpanan tanpa melewati server ini.',
            '• RevenueCat, Inc. — Negara: Amerika Serikat. Kontak: compliance@revenuecat.com. Tujuan: memverifikasi pembayaran langganan dan memeriksa statusnya. Data: pengenal akun, pengenal transaksi dan produk dari toko, informasi perangkat dan aplikasi. Kapan dan bagaimana: dikirim melalui jaringan saat membuka layar langganan dan saat membayar. Penyimpanan: sampai kontrak pengalihdayaan berakhir',
            '• Google LLC — selain transfer yang dijelaskan pada bagian 6, informasi transaksi toko diproses untuk menangani dan memverifikasi pembayaran langganan.',
            'Kamu dapat menolak transfer ke luar negeri. Jika kamu tidak mengaktifkan pencadangan dan tidak berlangganan, transfer di atas tidak terjadi, dan semua fitur lain termasuk menulis catatan tetap dapat digunakan.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'Sejak hari versi yang memuat laporan ringkasan AI dirilis',
      summary:
        'Laporan ringkasan AI ditambahkan. Hanya ketika kamu sendiri membuat laporan, isi catatanmu pada periode itu melewati server operator tanpa enkripsi dan dikirim ke penyedia AI. Operator tidak menyimpan isi tersebut; penyedia AI menyimpannya maksimal 30 hari untuk pemantauan penyalahgunaan lalu menghapusnya, dan tidak menggunakannya untuk melatih model.',
      sections: [
        {
          h: 'a. Apa yang berubah (sebelum → sesudah)',
          body: [
            'Sebelum: judul dan isi catatan tidak dikirim keluar dari perangkatmu. Bahkan dengan pencadangan aktif, keduanya dikirim hanya sebagai teks terenkripsi yang tidak dapat dibaca operator.',
            'Sesudah: **hanya ketika kamu sendiri menekan “Buat laporan”**, isi catatan pada periode itu dikirim **tanpa enkripsi** melalui server operator ke penyedia AI, lalu ringkasan dibuat.',
            '⚠ Ketepatannya: operator **tidak menyimpan** isi tersebut. Namun pada saat ringkasan dibuat, isinya memang melewati server operator — jadi kami tidak dapat mengatakan bahwa “operator tidak dapat melihatnya”. Kami menyampaikannya apa adanya, tanpa mengaburkan.',
            'Jika kamu tidak membuat laporan, pengiriman ini sama sekali tidak terjadi, dan semua fitur lain termasuk menulis catatan tetap dapat digunakan.',
          ],
        },
        {
          h: 'b. Persetujuan terpisah untuk informasi sensitif',
          body: [
            'Catatan harian dapat memuat informasi sensitif menurut Pasal 23 Undang-Undang Perlindungan Informasi Pribadi, seperti kondisi kesehatan atau kondisi kejiwaan.',
            'Karena laporan ringkasan AI memproses isi tersebut tanpa enkripsi, kami mengambil **persetujuan terpisah untuk pemrosesan informasi sensitif** saat kamu pertama kali menggunakan fitur ini. Persetujuan ini **terpisah** dari persetujuan transfer ke luar negeri pada huruf (c), dan masing-masing dapat dipilih sendiri.',
            'Jika kamu tidak menyetujuinya, kamu tetap dapat menggunakan semua fitur kecuali laporan AI.',
          ],
        },
        {
          h: 'c. Persetujuan terpisah untuk transfer ke luar negeri',
          body: [
            'Penyedia AI berada di luar Korea. Nama penyedia, negara penerima, dan kontaknya dicantumkan pada huruf ini saat fitur dirilis, dan juga ditampilkan di aplikasi sebelum persetujuan diambil.',
            '• Data yang ditransfer: judul, isi, emosi, dan tanggal catatan pada periode yang kamu minta laporannya',
            '• Tujuan: membuat laporan ringkasan',
            '• Kapan dan bagaimana: dikirim melalui jaringan saat kamu menekan “Buat laporan”',
            '• Penyimpanan: server operator **tidak menyimpannya** — hanya diproses di memori selama ringkasan dibuat lalu langsung dibuang. Penyedia AI menyimpannya **maksimal 30 hari** untuk pemantauan penyalahgunaan lalu menghapusnya, dan selama periode itu pun **tidak menggunakannya untuk melatih model.**',
            'Kamu dapat menolak transfer ke luar negeri; jika menolak, hanya laporan AI yang tidak tersedia, sedangkan fitur lain tetap berjalan.',
          ],
        },
        {
          h: 'd. Yang disimpan operator (yang bukan isi catatan)',
          body: [
            'Kami tidak menyimpan isi catatan, tetapi kami menyimpan hal berikut.',
            '• Pengenal akun yang membuat laporan, periode, jumlah kali, dan jumlah token yang dipakai — digunakan untuk penagihan dan pencegahan penyalahgunaan.',
            '• Penyimpanan: sampai tujuannya tercapai atau sampai kamu menghapus akun',
            'Teks laporan yang sudah jadi disimpan **hanya di perangkatmu**, dan bila pencadangan aktif, ikut tersimpan dalam cadangan dalam bentuk terenkripsi.',
          ],
        },
        {
          h: 'e. Hak kamu',
          body: [
            '• Laporan hanya dibuat ketika kamu sendiri membuatnya; laporan tidak pernah dibuat otomatis.',
            '• Laporan yang sudah dibuat dapat kamu hapus kapan saja di aplikasi.',
            '• Ringkasan yang dibuat AI dapat berbeda dari kenyataan dan bukan merupakan diagnosis atau saran medis maupun psikologis. Aplikasi menyediakan cara untuk melaporkan sebuah ringkasan.',
          ],
        },
      ],
    },
  ],
};
