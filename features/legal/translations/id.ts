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
  sourceFingerprint: '0a627bd3',
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
        'Laporan ringkasan AI ditambahkan. Hanya ketika Anda sendiri membuat laporan, isi diari untuk periode tersebut melewati server operator tanpa enkripsi dan dikirim ke penyedia AI. Operator tidak menyimpan isi diari, tetapi menyimpan ringkasan yang dihasilkan selama 90 hari untuk meningkatkan kualitas laporan. Penyedia AI menyimpannya paling lama 30 hari untuk pemantauan penyalahgunaan, lalu menghapusnya, dan tidak menggunakannya untuk melatih model.',
      sections: [
        {
          h: 'a. Apa yang berubah (sebelum → sesudah)',
          body: [
            'Sebelum: judul dan isi diari tidak dikirim keluar dari perangkat Anda. Meskipun Anda mengaktifkan pencadangan, keduanya hanya dikirim sebagai teks terenkripsi yang tidak dapat dibaca operator.',
            'Sesudah: **hanya ketika Anda sendiri menekan Buat laporan**, isi diari untuk periode tersebut dikirim **tanpa enkripsi** melalui server operator ke penyedia AI, lalu ringkasan dibuat.',
            '⚠ Secara tepat: operator **tidak menyimpan isi diari itu sendiri.** Namun ① pada saat ringkasan dibuat, isinya melewati server operator, sehingga kami tidak dapat mengatakan bahwa "operator tidak dapat melihatnya", dan ② **ringkasan yang dihasilkan disimpan selama 90 hari** (lihat huruf d). Kami menyampaikannya apa adanya tanpa mengaburkannya.',
            'Jika Anda tidak membuat laporan, pengiriman ini sama sekali tidak terjadi, dan semua fitur lain termasuk menulis diari tetap dapat digunakan sepenuhnya.',
          ],
        },
        {
          h: 'b. Persetujuan terpisah untuk informasi sensitif',
          body: [
            'Diari dapat memuat informasi sensitif seperti kondisi kesehatan atau psikologis sebagaimana dimaksud Pasal 23 Undang-Undang Perlindungan Informasi Pribadi.',
            'Karena laporan ringkasan AI memproses isi tersebut tanpa enkripsi, kami meminta **persetujuan terpisah untuk pemrosesan informasi sensitif** saat Anda pertama kali menggunakan fitur ini. Persetujuan ini **terpisah** dari persetujuan transfer ke luar negeri pada huruf (c), dan Anda dapat memilih masing-masing secara terpisah.',
            'Meski tidak menyetujui, semua fitur selain laporan AI tetap dapat digunakan sepenuhnya.',
          ],
        },
        {
          h: 'c. Persetujuan terpisah untuk transfer ke luar negeri',
          body: [
            'Penyedia AI berlokasi di luar Korea. Nama penyedia, negara penerima, dan kontaknya akan dicantumkan secara spesifik pada huruf ini saat fitur dirilis, dan juga ditampilkan di aplikasi sebelum persetujuan diambil.',
            '• Item yang ditransfer: judul, isi, emosi, dan tanggal entri pada periode yang Anda mintakan laporannya',
            '• Tujuan: membuat laporan ringkasan',
            '• Waktu dan cara: dikirim melalui jaringan saat Anda menekan Buat laporan',
            '• Masa penyimpanan: server operator **tidak menyimpan item yang ditransfer (isi diari)** — hanya ditahan di memori selama ringkasan dibuat lalu dibuang. Penyimpanan ringkasan yang dihasilkan dicantumkan terpisah pada huruf (d). Penyedia AI menyimpannya **paling lama 30 hari** untuk pemantauan penyalahgunaan lalu menghapusnya, dan bahkan selama periode itu **tidak menggunakannya untuk melatih model.**',
            'Anda dapat menolak transfer ke luar negeri; jika menolak, hanya laporan AI yang tidak tersedia dan semua fitur lain tetap dapat digunakan sepenuhnya.',
          ],
        },
        {
          h: 'd. Apa yang disimpan operator',
          body: [
            'Kami tidak menyimpan isi diari (judul dan teks). Kami menyimpan hal berikut.',
            '• **Ringkasan yang dihasilkan AI** — disimpan untuk memeriksa dan meningkatkan kualitas laporan. Masa penyimpanan: **90 hari sejak hari dibuat**, setelah itu dihapus otomatis.',
            '• Pengenal akun yang membuat laporan, periode, jumlah kali, dan jumlah token yang digunakan — dipakai untuk penagihan dan pencegahan penyalahgunaan. Masa penyimpanan: sampai tujuan tercapai atau sampai Anda menghapus akun',
            '⚠ Ringkasan ditulis berdasarkan diari Anda, sehingga isi diari dapat termuat di dalamnya. Kami menyampaikannya apa adanya tanpa mengaburkannya.',
            'Laporan yang selesai juga disimpan **di perangkat Anda**, dan jika pencadangan aktif, disertakan dalam cadangan dalam bentuk terenkripsi.',
          ],
        },
        {
          h: 'e. Hak Anda',
          body: [
            '• Laporan hanya dibuat ketika Anda sendiri membuatnya; tidak pernah dibuat otomatis.',
            '• Anda dapat menghapus laporan yang telah Anda buat kapan saja di aplikasi.',
            '• Menghapusnya di aplikasi akan menghilangkannya dari perangkat Anda; ringkasan yang disimpan di server operator dihapus otomatis setelah 90 hari. Jika ingin dihapus lebih cepat, Anda dapat memintanya melalui Hubungi kami.',
            '• Ringkasan yang dihasilkan AI dapat berbeda dari fakta dan bukan merupakan diagnosis atau saran medis maupun psikologis. Aplikasi menyediakan cara untuk melaporkan sebuah ringkasan.',
          ],
        },
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
 * ⚠ Strukturnya harus sama persis dengan versi Korea — 5 bagian (6/4/4/3/3 baris) ditambah
 *   dua perubahan mendatang. `npm run check:legal` memeriksanya.
 */
export const DELETE_ACCOUNT_ID: LegalDoc = {
  title: 'Jogak — Cara menghapus akunmu',
  sourceFingerprint: 'a6b3a8b5',
  effective: '2026-08-10',
  updated: '2026-08-10',
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
      ],
    },
    {
      h: '4. Data yang disimpan dan jangka waktunya',
      body: [
        'Informasi berikut disimpan sesuai peraturan perundang-undangan, dan bahkan selama jangka waktu itu hanya tersisa dalam bentuk yang tidak dapat ditelusuri kembali ke penulisnya (pseudonimisasi).',
        '• Isi pertanyaan: 3 tahun (Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik — catatan mengenai keluhan atau penyelesaian sengketa konsumen)',
        'Setelah jangka waktu penyimpanan lewat, kami memusnahkannya tanpa penundaan.',
      ],
    },
    {
      h: '5. Yang tidak ikut dihapus — catatan di perangkatmu',
      body: [
        'Catatan Jogak (judul, isi, foto, tag, dan emosi) hanya disimpan di dalam perangkatmu dan tidak dikirim ke server operator.',
        'Karena itu, menghapus akun tidak mengubah catatan yang ada di perangkatmu. Bila kamu ingin menghapus catatannya juga, hapus aplikasinya atau jalankan atur ulang lewat [Pengaturan] di aplikasi.',
        'Sebaliknya, bila kamu menghapus aplikasinya, catatan di perangkatmu tidak dapat dipulihkan.',
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'Sejak hari versi yang memuat langganan bulanan dan pencadangan/pemulihan dirilis',
      summary:
        'Bila kamu mengaktifkan pencadangan, menghapus akun juga menghapus cadangan terenkripsi yang tersimpan di server. Catatan transaksi langganan disimpan sesuai peraturan perundang-undangan dalam bentuk yang tidak dapat ditelusuri.',
      sections: [
        {
          h: 'a. Data yang dihapus sebagai tambahan',
          body: [
            '• Salinan catatanmu yang terenkripsi di server — dihapus bersamaan saat kamu menghapus akun. Kami tidak menunggu tenggang 90 hari.',
            '• Pengenal cadangan dan catatan pencadangan (waktu, ukuran, nomor generasi)',
            '⚠ Setelah dihapus, hal ini tidak dapat dibatalkan. Meski kamu masih memegang kode pemulihan, kamu tidak akan dapat memulihkannya.',
            '⚠ Catatan di perangkatmu tetap utuh. Yang dihapus hanyalah salinan di server.',
          ],
        },
        {
          h: 'b. Data yang disimpan sebagai tambahan dan jangka waktunya',
          body: [
            '• Catatan transaksi langganan (pengenal transaksi, produk, periode langganan, riwayat perubahan status pembayaran): 5 tahun (Undang-Undang Perlindungan Konsumen dalam Perdagangan Elektronik, Pasal 6)',
            '• Catatan mengenai pemusnahan cadangan (pengenal cadangan dan waktu pemusnahan): 1 tahun — agar kamu dapat mengetahui “mengapa pemulihan tidak berhasil”; pengenal akun tidak disimpan bersamanya.',
            'Catatan di atas pun, selama jangka waktu penyimpanannya, hanya tersisa dalam bentuk yang tidak dapat ditelusuri kembali ke penulisnya.',
          ],
        },
        {
          h: 'c. Langgananmu harus dibatalkan secara terpisah',
          body: [
            'Menghapus akun tidak otomatis membatalkan langgananmu di Google Play, dan bila tidak kamu batalkan, tagihan akan terus berjalan.',
            'Cara membatalkan: aplikasi Google Play Store > profil > Pembayaran dan langganan > Langganan (https://play.google.com/store/account/subscriptions)',
            'Pengembalian dana atas jumlah yang sudah dibayarkan mengikuti kebijakan pengembalian dana Google Play dan kebijakan pengembalian dana operator. Untuk pertanyaan, silakan hubungi alamat di bawah ini.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'Sejak hari versi yang memuat laporan ringkasan AI dirilis',
      summary:
        'Isi laporan AI disimpan di perangkatmu. Di server, ringkasan laporan disimpan paling lama 90 hari untuk pemeriksaan kualitas, dan dihapus bersama catatan penggunaanmu saat kamu menghapus akun.',
      sections: [
        {
          h: 'a. Apa yang dihapus terkait laporan AI',
          body: [
            '• Catatan penggunaan laporan yang tersimpan di server (pengenal akun, periode, jumlah kali, jumlah token) — dihapus bersamaan saat kamu menghapus akun.',
            '• Ringkasan laporan yang tersimpan di server (paling lama 90 hari) — dihapus bersamaan saat kamu menghapus akun. Isi catatan aslinya tidak pernah disimpan sehingga tidak ada yang perlu dihapus.',
            '⚠ Isi laporan juga tersimpan di perangkatmu, sehingga tetap ada di sana meski kamu menghapus akun. Untuk menghapusnya, hapus laporan di aplikasi atau hapus aplikasinya.',
            '• Bila kamu mengaktifkan pencadangan, laporan juga disertakan dalam cadangan dalam bentuk terenkripsi dan ikut terhapus ketika cadangan dihapus.',
          ],
        },
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
  sourceFingerprint: '898aa8d7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'Ketentuan ini mengatur hak, kewajiban, dan tanggung jawab antara Hwiseong Games (nama merek Vivace Games, selanjutnya “operator”) dan pengguna, sehubungan dengan penggunaan aplikasi seluler “Jogak” (selanjutnya “layanan”) yang disediakan operator. Mohon dibaca sebelum kamu menggunakan layanan.',
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
        'Nama badan usaha: Hwiseong Games (nama merek Vivace Games)',
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
