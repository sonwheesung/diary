import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Gizlilik politikası — Türkçe.
 *
 * 🔴 **Korece metin esastır.** Bu, okuma kolaylığı için hazırlanmış bir çeviridir; farklılık
 *   hâlinde `legal-text.ts` (Korece) geçerlidir.
 * ⚠ **Yapı Korece ile birebir aynı olmalıdır** — aynı bölüm sayısı ve her bölümde aynı satır
 *   sayısı. `npm run check:legal` bunu denetler.
 */
export const PRIVACY_TR: LegalDoc = {
  title: 'Jogak Gizlilik Politikası',
  sourceFingerprint: '0a627bd3',
  effective: '2026-08-09',
  updated: '2026-08-11',
  intro:
    'Vivace Games (“işletmeci”), Kişisel Bilgilerin Korunması Kanunu ile ilgili diğer mevzuata uyar ve “Jogak” (“hizmet”) kullanıcılarının kişisel verilerini aşağıda belirtildiği şekilde işler. Jogak, yazdığın günlük kayıtlarını hiçbir sunucuya göndermez ve ilke olarak yalnızca gereken en az bilgiyi toplar.',
  sections: [
    {
      h: '1. Toplamadıklarımız (önce bunu söylüyoruz)',
      body: [
        'İşletmeci aşağıdaki bilgileri toplamaz ve cihazının dışına aktarmaz.',
        '• Kayıtların başlıkları, metni, listeleri, fotoğrafları, etiketleri ve duyguları — yalnızca cihazının dâhilî depolamasında tutulur.',
        '• Uygulama kilidinde kullanılan PIN, desen veya ipucu yanıtı — cihazın güvenli depolamasında yalnızca geri döndürülemez biçimde (özet/hash) tutulur; aslı hiçbir yerde saklanmaz.',
        '• Adın, doğum tarihin, telefon numaran, adresin, rehberin, konumun veya tüm fotoğraf kitaplığına erişime dair herhangi bir kayıt.',
        'Uygulamada seçtiğin fotoğraflar, yalnızca bir kayda eklenebilmesi için cihazındaki uygulamaya ait klasöre kopyalanır; hiçbir yere aktarılmaz.',
      ],
    },
    {
      h: '2. Topladığımız kişisel veriler',
      body: [
        'a. “İletişim” özelliğini kullandığında (giriş gerekir)',
        '• Zorunlu: Google hesabının e-posta adresi ve sosyal hesabın benzersiz kimliği (Google “sub”)',
        '  — Hukuki dayanak: Kişisel Bilgilerin Korunması Kanunu md. 15(1)4 (kullanıcının talebi üzerine alınacak önlemlerin, yani sorusuna yanıt verilmesinin yerine getirilmesi için gerekli olması)',
        '  — Amaç: gönderen kişiyi belirlemek, yanıtı iletmek ve kendi başvuru geçmişini görüntülemeni sağlamak',
        '• Başvurunun kategorisi ve içeriği',
        '• Cihaz türü (Android/iOS) ve uygulama sürümü — sorunun hangi ortamda oluştuğunu anlamak için',
        '※ Giriş yalnızca “İletişim” için gereklidir; kayıt yazma, uygulama kilidi ve diğer özellikler giriş gerektirmez.',
        '※ 14 yaşından küçük çocuklar giriş özelliğini kullanamaz.',
        'b. Reklam gösterimi sırasında otomatik olarak toplanan bilgiler',
        '• Reklam kimliği (Android reklam kimliği), cihaz ve ağ bilgileri, reklam gösterim ve tıklama kayıtları',
        '• Yukarıdakiler Google (AdMob) tarafından toplanır; ayrıntılar ve reddetme yolu 7. bölümdedir.',
      ],
    },
    {
      h: '3. İşleme amaçları',
      body: [
        '• Başvuruların alınması ve ele alınması: gönderdiğin içeriği incelemek, hataları tespit edip düzeltmek',
        '• Gönderenin belirlenmesi ve yanıt: başvuran kişiye yanıtı ulaştırmak ve kendi geçmişini yeniden görüntülemesini sağlamak',
        '• Reklam gösterimi: ücretsiz sürümü kullananlara reklam sunmak ve reklam performansını ölçmek',
        'İşletmeci kişisel verileri yukarıdaki amaçlar dışında kullanmaz; amaç değişirse önceden onay alır.',
      ],
    },
    {
      h: '4. Saklama ve kullanım süreleri',
      body: [
        '• Hesap bilgileri (e-posta adresi, Google “sub”): hesabını silene kadar. Sildiğinde gecikmeksizin imha eder veya izi sürülemez hâle getiririz.',
        '• Başvuru içeriği: alındığı tarihten itibaren 3 yıl (Elektronik Ticarette Tüketicinin Korunması Kanunu — tüketici şikâyetleri veya uyuşmazlık çözümüne ilişkin kayıtlar)',
        '• Reklam kimliğine dayalı davranışsal veriler: toplandığı tarihten itibaren en fazla 1 yıl',
        'Süre dolduğunda veya amaç gerçekleştiğinde verileri gecikmeksizin imha ederiz.',
      ],
    },
    {
      h: '5. Üçüncü kişilere aktarım',
      body: [
        'İşletmeci kullanıcıların kişisel verilerini üçüncü kişilere aktarmaz.',
        'Mevzuatta özel bir hüküm bulunması veya soruşturma makamının kanunda öngörülen usul ve biçimde talepte bulunması hâlleri bunun dışındadır.',
      ],
    },
    {
      h: '6. İşlemenin dışarıya verilmesi ve yurt dışına aktarım',
      body: [
        'Hizmeti sunabilmek için işletmeci, işlemeyi aşağıdaki şekilde dışarıya verir ve bir kısmı Kore dışında gerçekleşir.',
        '• Google LLC — Ülke: ABD. İletişim: https://support.google.com/policies/contact/general_privacy_form. Amaç: reklam gösterimi ve ölçümü (AdMob), Google hesabıyla giriş. Veriler: reklam kimliği, cihaz ve ağ bilgileri ve girişte e-posta adresi ile hesap kimliği. Ne zaman ve nasıl: reklam istendiğinde ve giriş yapıldığında ağ üzerinden iletilir. Saklama: Google’ın gizlilik politikasına göre',
        '• Supabase Inc. — Ülke: ABD (tüzel kişiliğin bulunduğu yer). İletişim: privacy@supabase.com. Amaç: başvuru ve hesap bilgilerini veritabanında saklamak. Veriler: 2(a) bölümündeki bilgiler. Ne zaman ve nasıl: başvuru gönderildiğinde ağ üzerinden iletilir. Saklama: 4. bölümdeki süreler. ※ Fiziksel saklama yeri Kore Cumhuriyeti’dir (Seul bölgesi); ancak işleten şirket Kore dışında bulunduğundan yurt dışına aktarım olarak bildiriyoruz.',
        '• Vercel Inc. — Ülke: ABD. İletişim: privacy@vercel.com. Amaç: başvuruları alan sunucuyu işletmek. Veriler: 2(a) bölümündeki bilgiler. Ne zaman ve nasıl: başvuru gönderildiğinde ağ üzerinden iletilir. Saklama: hizmet sözleşmesi sona erene kadar',
        'Kişisel verilerinin yurt dışına aktarılmasını reddedebilirsin. Reklamla ilgili aktarımı reddetmek için 7. bölümdeki yöntemle kişiselleştirilmiş reklamları kapat; başvuruyla ilgili aktarımı reddetmek içinse “İletişim” özelliğini kullanmaman yeterlidir (kayıt yazma dâhil diğer tüm özellikler aynen kullanılabilir).',
      ],
    },
    {
      h: '7. Reklam kimlikleri ve diğer otomatik toplama araçları ile reddetme yolları',
      body: [
        'Hizmet, ücretsiz sürümü kullananlara reklam göstermek için Google AdMob kullanır. AdMob, kişiselleştirilmiş reklam sunmak amacıyla reklam kimliğini toplayabilir ve kullanabilir.',
        'Toplama amacı: kişiselleştirilmiş reklam sunmak, reklam performansını ölçmek ve hileli tıklamayı önlemek',
        'Reddetme (Android): Ayarlar > Gizlilik > Reklamlar > “Reklam kimliğini sil” veya “Reklam kişiselleştirmeyi kapat”',
        'Reddetme (iOS): Ayarlar > Gizlilik ve Güvenlik > İzleme > “Uygulamaların İzleme İzni İstemesine İzin Ver” seçeneğini kapat',
        'Reddetsen de reklamlar görünmeye devam edebilir; ancak bunlar ilgi alanlarına dayanmayan genel reklamlar olur.',
        'Google’ın reklam amacıyla kişisel verileri nasıl işlediğine dair ayrıntı: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. İmha usulü ve yöntemi',
      body: [
        'Usul: süresi dolan veya amacı gerçekleşen kişisel veriler gecikmeksizin imha edilir. Mevzuat saklamayı gerektiriyorsa, bu süre boyunca diğer verilerden ayrı tutulur ve ardından imha edilir.',
        'Yöntem: elektronik dosya biçimindeki bilgiler, kurtarılmasını veya yeniden oluşturulmasını olanaksız kılan teknik yöntemlerle kalıcı olarak silinir.',
        'Cihazında saklanan kayıtlar, fotoğraflar ve kilit bilgileri, uygulamadaki “Her şeyi sıfırla” özelliğini kullandığında veya uygulamayı sildiğinde cihazdan kaldırılır. İşletmeci bu bilgilere sahip olmadığından senin adına silemez.',
      ],
    },
    {
      h: '9. İlgili kişinin ve yasal temsilcinin hakları ile bunların kullanımı',
      body: [
        'Aşağıdaki hakları istediğin zaman kullanabilirsin.',
        '• Verilerine erişim talep etme • Hata varsa düzeltme talep etme • Silme talep etme • İşlemenin durdurulmasını talep etme • Verilerinin aktarılmasını talep etme (Kişisel Bilgilerin Korunması Kanunu md. 35-2)',
        'Bu hakları 11. bölümdeki iletişim adresi üzerinden yazılı olarak veya e-postayla kullanabilirsin; işletmeci gecikmeksizin işlem yapar.',
        'Verilerindeki bir hatanın düzeltilmesini talep edersen, düzeltme tamamlanana kadar o veriyi kullanmaz ve aktarmayız.',
        '14 yaşından küçük bir çocuğun yasal temsilcisi, yukarıdaki hakları çocuk adına kullanabilir.',
      ],
    },
    {
      h: '10. Güvenliğin sağlanmasına yönelik önlemler',
      body: [
        '• İdari: kişisel verilerle ilgilenen kişi sayısını en aza indirmek ve onlara düzenli eğitim vermek',
        '• Teknik: işleme sistemine erişim yetkilerinin yönetimi, aktarım sırasında şifreleme (HTTPS), uygulama kilidi sırrının özet olarak saklanması ve cihazın güvenli depolamasının (Keystore/Keychain) kullanılması',
        '• Fiziksel: kişisel verilerin bulunduğu sunucular yurt içi ve yurt dışı bulut sağlayıcılarının veri merkezlerinde yer alır ve bu sağlayıcıların fiziksel erişim denetimi politikalarına tabidir.',
        '⚠ Uygulama kilidi ekrana erişimi engeller; cihazda saklanan günlük dosyalarının kendisini şifrelemez. Cihaz kaybolur veya ele geçirilir ve cihazın kendi güvenliği aşılırsa kayıtların içeriği açığa çıkabilir.',
      ],
    },
    {
      h: '11. Veri koruma sorumlusu ile erişim taleplerini alan ve işleyen birim',
      body: [
        'İşletmeci, kişisel verilerin işlenmesine ilişkin işlerin genel sorumluluğunu üstlenir ve kullanıcıların şikâyetleri ile zararın giderilmesi taleplerini karşılamak üzere aşağıdaki veri koruma sorumlusunu görevlendirir.',
        '• Veri koruma sorumlusu: Son Hwi-seong (görevi: temsilci)',
        '• İletişim: support@vivace-games.com',
        '• Erişim taleplerini alan ve işleyen birim: yukarıdakiyle aynı',
        'Hizmeti kullanırken doğan her türlü veri koruma sorusunu, şikâyetini veya zararın giderilmesi talebini veri koruma sorumlusuna iletebilirsin. İşletmeci gecikmeksizin yanıtlar ve gereğini yapar.',
      ],
    },
    {
      h: '12. Hak ihlallerinde başvuru yolları',
      body: [
        'Kişisel verilerinin ihlali nedeniyle giderim almak için aşağıdaki Kore kurumlarına uyuşmazlık çözümü veya danışma başvurusu yapabilirsin.',
        '• Kişisel Bilgi Uyuşmazlıkları Arabuluculuk Kurulu: 1833-6972 (Kore’den) / www.kopico.go.kr',
        '• Gizlilik İhlali İhbar Merkezi: 118 (Kore’den) / privacy.kisa.or.kr',
        '• Yüksek Savcılık, Siber Soruşturma Dairesi: 1301 (Kore’den) / www.spo.go.kr',
        '• Ulusal Polis Teşkilatı, Siber Soruşturma Bürosu: 182 (Kore’den) / ecrm.police.go.kr',
        'Ayrıca, Kişisel Bilgilerin Korunması Kanunu’nun 35. (erişim), 36. (düzeltme ve silme) veya 37. (işlemenin durdurulması) maddeleri uyarınca yapılan bir talep hakkında kamu kurumu yöneticisinin işlemi ya da işlem yapmaması nedeniyle hakları veya menfaatleri ihlal edilen kişi, İdari İtiraz Kanunu’nun öngördüğü şekilde idari itirazda bulunabilir.',
      ],
    },
    {
      h: '13. Bu gizlilik politikasındaki değişiklikler',
      body: [
        'Bu gizlilik politikası yürürlük tarihinden itibaren uygulanır.',
        'Mevzuat, politika veya güvenlik teknolojisindeki değişiklikler nedeniyle içerik eklenir, çıkarılır veya değiştirilirse, değişikliğin yürürlüğe girmesinden 7 gün önce (kullanıcılar aleyhine olan değişikliklerde 30 gün önce) uygulama içi duyurularla bildiririz.',
        'Yürürlüğe girmesi planlanan değişiklikler, öncesi ve sonrası karşılaştırılabilecek biçimde bu belgenin sonundaki “Yaklaşan değişiklikler” bölümünde önceden yayımlanır.',
        'Değişiklik geçmişi',
        '• 2026-08-09 ilk kez yürürlüğe kondu',
        '• 2026-08-11 yaklaşan değişiklik yayımlandı — aylık abonelik ödemesi ile yedekleme/geri yükleme getirilmesi planlanıyor (ana metin henüz değişmedi)',
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'Aylık abonelik ile yedekleme/geri yüklemeyi içeren sürümün yayımlandığı günden itibaren',
      summary:
        'Aylık abonelik ile yedekleme/geri yükleme ekleniyor. Abone olursan abonelik durumu ve işlem kimliği işlenir; ve yalnızca yedeklemeyi açarsan, kayıtlarının cihazında şifrelenmiş bir kopyası işletmecinin sunucusunda saklanır. İşletmeci bu kopyanın şifresini çözemez.',
      sections: [
        {
          h: 'a. Ne değişiyor (öncesi → sonrası)',
          body: [
            'Öncesi: kayıtlarının başlıkları, metni ve fotoğrafları cihazının dışına aktarılmaz.',
            'Sonrası: **yalnızca yedeklemeyi kendin açarsan**, kayıtlarının cihazında şifrelenmiş bir kopyası işletmecinin sunucusunda saklanır. Açmazsan, eskisi gibi tek bir karakter bile aktarılmaz.',
            '⚠ Tam olarak: işletmeci bu kopyayı **saklar ama okuyamaz.** Şifre çözme anahtarı yalnızca cihazında ve senin sakladığın kurtarma kodunda bulunur; işletmecide yoktur.',
          ],
        },
        {
          h: 'b. Yedeklemeyi açarsan ek olarak saklanan bilgiler',
          body: [
            '• Kayıtlarının şifrelenmiş bir kopyası — işletmecinin çözemeyeceği bir biçimde',
            '• Yedek kimliği, yedekleme zamanı, kuşak numarası ve boyut — **bu bilgiler şifrelenmez.** İşletmeci hangi hesabın ne zaman ve ne kadar yedeklediğini bilebilir.',
            '• Toplama dayanağı: senin ayrı onayın (yedeklemeyi açtığın ekranda alınır)',
          ],
        },
        {
          h: 'c. Saklama süresi',
          body: [
            '• Yedekleme açık kaldığı sürece ve abonelik bittikten sonra 90 güne kadar saklanır, ardından otomatik olarak imha edilir.',
            '• Yedeklemeyi kapatırsan, silinmesini istersen veya hesabını silersen, 90 günü beklemeden gecikmeksizin imha ederiz.',
            '• 3 yıl veya daha uzun süre erişilmeyen yedekler imha edilir. (Uygulamayı silip hesabını silmeyenler için geçerlidir.)',
            '• İmha kaydı (yedek kimliği ve imha zamanı) 1 yıl saklanır — “geri yükleme neden çalışmıyor” sorusunu yanıtlayabilmen için; hesap kimliği bununla birlikte saklanmaz.',
            '⚠ Aboneliğin sona erdiği bildirimi sana yalnızca uygulamayı açtığında ekranda ulaşır. Uygulamayı açmazsan bu bildirim sana ulaşmayabilir.',
          ],
        },
        {
          h: 'd. Erişim hakkının sınırları',
          body: [
            'Yedeğine erişim talep edersen, işletmecinin verebileceği tek şey **şifresi çözülemeyen metin ile (b) bendindeki üst verilerdir.** Kayıtlarını insanın okuyabileceği biçimde veremeyiz — işletmecide anahtar yoktur.',
            'Kendin, kurtarma kodunla istediğin zaman uygulamada geri yükleyebilirsin.',
            '⚠ Kurtarma kodunu kaybedersen yedeği açmanın hiçbir yolu yoktur. İşletmeci de senin için açamaz.',
          ],
        },
        {
          h: 'e. Abonelik kullanırsan saklanan bilgiler',
          body: [
            '• Abonelik durumu — hak anahtarı, bitiş zamanı, ödeme başarısızlığında tanınan süre, yenilenip yenilenmeyeceği',
            '• Mağazanın verdiği işlem kimliği, ürün kimliği ve ödeme ortamının (canlı/test) ayrımı',
            '• Ödeme hizmetinin gönderdiği abonelik durumu değişikliği kayıtları (satın alma, yenileme, iptal, iade vb.) ve bunların özgün içeriği',
            '⚠ Kredi kartı veya hesap numarası gibi ödeme bilgilerini Google Play işler ve işletmeciye iletilmez. İşletmeci yalnızca ödeme yaptığını ve aboneliğin ne zamana kadar geçerli olduğunu bilebilir.',
            '• Toplama dayanağı: Kişisel Bilgilerin Korunması Kanunu md. 15(1)4 (kullanıcının talebi üzerine alınacak önlemlerin, yani başvurduğun abonelik hakkının sağlanmasının yerine getirilmesi için gerekli olması)',
            '• Amaç: abonelik hakkını doğrulamak (reklamların kaldırılması, yedeklemenin kullanımı), ödeme sorularını ve iadeleri ele almak',
          ],
        },
        {
          h: 'f. Abonelikle ilgili bilgilerin saklama süresi',
          body: [
            '• Sözleşme veya cayma ile ödeme ve malların sağlanmasına ilişkin kayıtlar: 5 yıl (Elektronik Ticarette Tüketicinin Korunması Kanunu md. 6)',
            '• Hesabını silersen hesap kimlikleri (e-posta, Google “sub”) gecikmeksizin izi sürülemez hâle getirilir; yukarıdaki işlem kayıtları ise yazarına ulaşılamayacak biçimde, belirtilen süre boyunca ayrı saklanır ve ardından imha edilir.',
            '⚠ Hesabını silmek Google Play aboneliğini kendiliğinden iptal etmez. İptali Google Play > Abonelikler bölümünden kendin yapmalısın; yapmazsan ücretlendirilmeye devam edersin.',
          ],
        },
        {
          h: 'g. İşlemenin dışarıya verilmesi ve yurt dışına aktarım (ek)',
          body: [
            '• Supabase Inc. — Ülke: ABD (tüzel kişiliğin yeri). İletişim: privacy@supabase.com. Amaç: şifrelenmiş yedek kopyasını ve abonelik durumunu saklamak. Veriler: yukarıdaki (b) ve (e) bentlerindeki bilgiler. Saklama: (c) ve (f) bentlerindeki süreler. ※ Fiziksel saklama yeri Kore Cumhuriyeti’dir (Seul bölgesi).',
            '• Vercel Inc. — Ülke: ABD. İletişim: privacy@vercel.com. Amaç: yedekleme sunucusunu işletmek. ※ Şifrelenmiş kopya bu sunucudan geçmeden doğrudan depolamaya gönderilir.',
            '• RevenueCat, Inc. — Ülke: ABD. İletişim: compliance@revenuecat.com. Amaç: abonelik ödemelerini doğrulamak ve abonelik durumunu denetlemek. Veriler: hesap kimliği, mağaza işlem ve ürün kimlikleri, cihaz ve uygulama bilgileri. Ne zaman ve nasıl: abonelik ekranına girildiğinde ve ödeme yapıldığında ağ üzerinden iletilir. Saklama: hizmet sözleşmesi sona erene kadar',
            '• Google LLC — yukarıdaki 6. bölümde belirtilen aktarıma ek olarak, abonelik ödemelerinin işlenmesi ve doğrulanması amacıyla mağaza işlem bilgileri işlenir.',
            'Yurt dışına aktarımı reddedebilirsin. Yedeklemeyi açmaz ve abone olmazsan yukarıdaki aktarımlar gerçekleşmez; kayıt yazma dâhil diğer tüm özellikler aynen kullanılabilir.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'Yapay zekâ özet raporlarını içeren sürümün yayımlandığı günden itibaren',
      summary:
        'Yapay zekâ özet raporları ekleniyor. Yalnızca raporu kendin oluşturduğunda, o döneme ait günlük içeriği şifrelenmemiş hâlde işletmecinin sunucusundan geçerek yapay zekâ sağlayıcısına gönderilir. İşletmeci günlük içeriğini saklamaz, ancak rapor kalitesini iyileştirmek için oluşturulan özeti 90 gün saklar. Yapay zekâ sağlayıcısı kötüye kullanım denetimi için en fazla 30 gün saklar, sonra siler ve model eğitiminde kullanmaz.',
      sections: [
        {
          h: 'a. Ne değişiyor (öncesi → sonrası)',
          body: [
            'Öncesi: günlüklerin başlığı ve metni cihazının dışına aktarılmaz. Yedeklemeyi açmış olsan bile yalnızca işletmecinin okuyamayacağı şifreli metin olarak aktarılır.',
            'Sonrası: **yalnızca Rapor oluştur’a kendin bastığında**, o döneme ait günlük içeriği **şifrelenmemiş hâlde** işletmecinin sunucusu üzerinden yapay zekâ sağlayıcısına gönderilir ve bir özet oluşturulur.',
            '⚠ Tam olarak: işletmeci **günlük içeriğinin kendisini saklamaz.** Ancak ① özet oluşturulduğu anda içerik işletmecinin sunucusundan geçtiği için sana "işletmeci göremez" diyemeyiz ve ② **oluşturulan özet 90 gün saklanır** (aşağıdaki d bendine bakınız). Bunu bulanıklaştırmadan açıkça belirtiyoruz.',
            'Rapor oluşturmazsan bu aktarım hiç gerçekleşmez ve günlük yazma dâhil diğer tüm özellikler eksiksiz kullanılabilir.',
          ],
        },
        {
          h: 'b. Hassas bilgiler için ayrı rıza',
          body: [
            'Bir günlük, Kişisel Bilgilerin Korunması Kanunu’nun 23. maddesi anlamında sağlık veya ruhsal durum gibi hassas bilgiler içerebilir.',
            'Yapay zekâ özet raporları bu içeriği şifrelenmemiş hâlde işlediğinden, özelliği ilk kez kullandığında **hassas bilgilerin işlenmesine ilişkin ayrı bir rıza** alırız. Bu rıza, (c) bendindeki yurt dışına aktarım rızasından **ayrıdır** ve her birini ayrı ayrı seçebilirsin.',
            'Rıza vermesen de yapay zekâ raporları dışındaki tüm özellikler eksiksiz kullanılabilir.',
          ],
        },
        {
          h: 'c. Yurt dışına aktarım için ayrı rıza',
          body: [
            'Yapay zekâ sağlayıcısı Kore dışında bulunmaktadır. Sağlayıcının adı, alıcı ülke ve iletişim bilgileri özellik yayımlandığında bu bentte somut olarak belirtilecek ve rıza alınmadan önce uygulama içinde de gösterilecektir.',
            '• Aktarılan veriler: rapor istediğin döneme ait kayıtların başlığı, metni, duygusu ve tarihi',
            '• Amaç: özet raporu oluşturmak',
            '• Zaman ve yöntem: Rapor oluştur’a bastığında ağ üzerinden aktarılır',
            '• Saklama süresi: işletmecinin sunucusu **aktarılan verileri (günlük içeriğini) saklamaz** — yalnızca özet oluşturulurken bellekte tutulur ve ardından atılır. Oluşturulan özetin saklanması (d) bendinde ayrıca belirtilmiştir. Yapay zekâ sağlayıcısı bunları kötüye kullanım denetimi için **en fazla 30 gün** saklar ve sonra siler; bu süre boyunca da **model eğitiminde kullanmaz.**',
            'Yurt dışına aktarımı reddedebilirsin; reddedersen yalnızca yapay zekâ raporları kullanılamaz, diğer tüm özellikler eksiksiz kullanılabilir.',
          ],
        },
        {
          h: 'd. İşletmecinin sakladıkları',
          body: [
            'Günlük içeriğini (başlık ve metin) saklamayız. Aşağıdakileri saklarız.',
            '• **Yapay zekânın oluşturduğu özet** — rapor kalitesini kontrol etmek ve iyileştirmek için saklanır. Saklama süresi: **oluşturulduğu günden itibaren 90 gün**, ardından otomatik olarak silinir.',
            '• Raporu oluşturan hesabın tanımlayıcısı, dönem, kaç kez oluşturulduğu ve kullanılan jeton sayısı — ücretlendirme ve kötüye kullanımın önlenmesi için kullanılır. Saklama süresi: amaç gerçekleşene kadar ya da hesabını silene kadar',
            '⚠ Özet, senin günlüğün temel alınarak yazıldığı için içinde günlük içeriği yer alabilir. Bunu bulanıklaştırmadan açıkça belirtiyoruz.',
            'Tamamlanan rapor **cihazında da** saklanır ve yedeklemeyi açtıysan şifrelenmiş olarak yedeğe dâhil edilir.',
          ],
        },
        {
          h: 'e. Haklarınız',
          body: [
            '• Raporlar yalnızca sen oluşturduğunda üretilir; asla otomatik olarak oluşturulmaz.',
            '• Oluşturduğun bir raporu uygulamada istediğin zaman silebilirsin.',
            '• Uygulamada sildiğinde cihazından kaybolur; işletmecinin sunucusunda saklanan özet 90 gün sonra otomatik olarak silinir. Daha erken silinmesini istersen Bize ulaşın üzerinden talep edebilirsin.',
            '• Yapay zekânın oluşturduğu özetler gerçeklerden farklı olabilir ve tıbbi ya da psikolojik bir teşhis veya tavsiye değildir. Uygulama, bir özeti bildirmen için bir yol sunar.',
          ],
        },
      ],
    },
  ],
};

/**
 * Hesap silme kılavuzu — Türkçe.
 *
 * 🔴 **Korece metin esastır** (`legal-text.ts`). Gizlilik politikasındaki kuralın aynısı
 *   geçerlidir: farklılık hâlinde Korece metin bağlayıcıdır.
 *
 * ⚠ Bu belgenin **kendine ait bir genel URL’si** vardır; çünkü Google Play’in “Veri güvenliği”
 *   formu silme için bir **web yolu** ister: uygulamayı çoktan kaldırmış olan birinin de talepte
 *   bulunabilmesi gerekir. Play inceleme uzmanlarının açtığı adres budur — bu yüzden yalnızca
 *   Korece kalamaz.
 *
 * ⚠ **Yapı Korece ile birebir aynı olmalıdır** — 5 bölüm (6/4/4/3/3 satır) ve iki yaklaşan
 *   değişiklik. `npm run check:legal` bunu denetler. Sessizce düşen bir hüküm, burada
 *   gerçekten önem taşıyan tek hatadır.
 */
export const DELETE_ACCOUNT_TR: LegalDoc = {
  title: 'Jogak — Hesabını nasıl silersin',
  sourceFingerprint: 'a6b3a8b5',
  effective: '2026-08-10',
  updated: '2026-08-10',
  intro:
    'Bu sayfada Jogak uygulamasındaki hesabını ve onunla ilgili verileri nasıl sileceğin anlatılıyor. Uygulamayı zaten sildiysen ya da giriş yapamıyorsan e-postayla da talepte bulunabilirsin.',
  sections: [
    {
      h: '1. Uygulamadan kendin silme',
      body: [
        'Jogak uygulamasında aşağıdaki adımları izlersen işlem hemen gerçekleşir.',
        '① Uygulamayı aç → alttaki [Ayarlar] sekmesi',
        '② [İletişim] seçeneğini seç',
        '③ Giriş yapmadıysan Google hesabınla giriş yap',
        '④ Ekranın en altındaki [Hesabı sil] seçeneğini seçip onayla',
        'Hesap silme işlemi geri alınamaz.',
      ],
    },
    {
      h: '2. E-postayla talep etme (uygulamayı sildiysen ya da giriş yapamıyorsan)',
      body: [
        'Aşağıdakileri support@vivace-games.com adresine gönder.',
        '• Konu: Jogak hesap silme talebi',
        '• İçerik: Jogak’a giriş yaparken kullandığın Google hesabının e-posta adresi',
        'Kimliğini doğrulayabilmemiz için yazdığın adres ile kayıt olurken kullandığın adresin aynı olması gerekir. Talebi aldıktan sonra 7 iş günü içinde işleme alır ve sana yanıt veririz.',
      ],
    },
    {
      h: '3. Silinen veriler',
      body: [
        'Hesabını sildiğinde aşağıdaki bilgiler gecikmeksizin imha edilir veya izi sürülemez hâle getirilir.',
        '• Sosyal hesabın benzersiz kimliği (Google “sub”)',
        '• E-posta adresi',
        '• Başvurular ile bunları yazan hesap arasındaki bağlantı',
      ],
    },
    {
      h: '4. Saklanan veriler ve süreleri',
      body: [
        'Aşağıdaki bilgiler mevzuat gereği saklanır ve saklama süresi boyunca da yalnızca yazarına ulaşılamayacak biçimde (takma adlaştırılmış olarak) kalır.',
        '• Başvuru içeriği: 3 yıl (Elektronik Ticarette Tüketicinin Korunması Kanunu — tüketici şikâyetleri veya uyuşmazlık çözümüne ilişkin kayıtlar)',
        'Saklama süresi dolduğunda gecikmeksizin imha ederiz.',
      ],
    },
    {
      h: '5. Silinmeyenler — cihazındaki kayıtlar',
      body: [
        'Jogak’taki kayıtlar (başlık, metin, fotoğraflar, etiketler, duygular) yalnızca cihazının içinde saklanır ve işletmecinin sunucularına aktarılmaz.',
        'Bu nedenle hesabını silsen de cihazındaki kayıtlar olduğu gibi kalır. Kayıtları da silmek istersen uygulamayı sil ya da uygulamanın [Ayarlar] bölümünden sıfırlama yap.',
        'Bunun tersine, uygulamayı silersen cihazdaki kayıtlar geri getirilemez.',
      ],
    },
  ],
  pending: [
    {
      appliesFrom:
        'Aylık abonelik ile yedekleme/geri yüklemeyi içeren sürümün yayımlandığı günden itibaren',
      summary:
        'Yedeklemeyi açtıysan, hesabını sildiğinde sunucuda saklanan şifrelenmiş yedek de birlikte silinir. Abonelik işlem kayıtları mevzuat gereği takma adlaştırılarak saklanır.',
      sections: [
        {
          h: 'a. Ek olarak silinen veriler',
          body: [
            '• Sunucuda saklanan, kayıtlarının şifrelenmiş kopyası — hesabınla birlikte silinir. 90 günlük süreyi beklemeyiz.',
            '• Yedek kimliği ve yedekleme kayıtları (zaman, boyut, kuşak numarası)',
            '⚠ Silindikten sonra geri alınamaz. Kurtarma kodun elinde olsa bile geri yükleme yapamazsın.',
            '⚠ Cihazındaki kayıtlar olduğu gibi kalır. Silinen yalnızca sunucudaki kopyadır.',
          ],
        },
        {
          h: 'b. Ek olarak saklanan veriler ve süreleri',
          body: [
            '• Abonelik işlem kayıtları (işlem kimliği, ürün, abonelik süresi, ödeme durumu değişikliği geçmişi): 5 yıl (Elektronik Ticarette Tüketicinin Korunması Kanunu md. 6)',
            '• Bir yedeğin imha edildiğine dair kayıt (yedek kimliği ve imha zamanı): 1 yıl — “geri yükleme neden çalışmıyor” sorusunu yanıtlayabilmen için; hesap kimliği bununla birlikte saklanmaz.',
            'Yukarıdaki kayıtlar saklama süresi boyunca da yalnızca yazarına ulaşılamayacak biçimde kalır.',
          ],
        },
        {
          h: 'c. Aboneliği ayrıca iptal etmelisin',
          body: [
            'Hesabını silsen de Google Play aboneliğin kendiliğinden iptal olmaz; iptal etmezsen ücretlendirilmeye devam edersin.',
            'İptal: Google Play Store uygulaması > profil > Ödemeler ve abonelikler > Abonelikler (https://play.google.com/store/account/subscriptions)',
            'Ödenmiş tutarların iadesi, Google Play’in iade politikası ile işletmecinin iade politikasına tabidir. Sorularını aşağıdaki iletişim adresine iletebilirsin.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'Yapay zekâ özet raporlarını içeren sürümün yayımlandığı günden itibaren',
      summary:
        'Yapay zekâ raporlarının metni cihazında saklanır. Sunucuda, kalite denetimi için rapor özetleri en fazla 90 gün saklanır ve hesabını sildiğinde kullanım kayıtlarıyla birlikte silinir.',
      sections: [
        {
          h: 'a. Yapay zekâ raporlarında neler silinir',
          body: [
            '• Sunucuda kalan rapor kullanım kayıtları (hesap kimliği, dönem, kaç kez oluşturulduğu, jeton sayısı) — hesabınla birlikte silinir.',
            '• Sunucuda saklanan rapor özetleri (en fazla 90 gün) — hesabınla birlikte silinir. Günlük metninin kendisi saklanmadığı için orada silinecek bir şey yoktur.',
            '⚠ Rapor metni cihazında da saklandığından hesabını silsen bile cihazda kalır. Kaldırmak istersen uygulamadan raporları sil ya da uygulamayı sil.',
            '• Yedeklemeyi açtıysan raporlar da şifrelenmiş olarak yedeğe dâhildir ve yedek silindiğinde birlikte silinir.',
          ],
        },
      ],
    },
  ],
};

/**
 * Kullanım koşulları — Türkçe.
 *
 * 🔴 **Korece metin esastır** (`legal-text.ts`). Bu, okuma kolaylığı için hazırlanmış bir
 *   çeviridir; farklılık hâlinde Korece geçerlidir. 22. madde bunu belgenin kendi içinde
 *   söyler — çeviriyi yayımlamayı güvenli kılan da budur.
 *
 * ⚠ **Yapı Korece ile birebir aynı olmalıdır** — 22 madde, her maddede aynı satır sayısı ve
 *   `pending` yok. `npm run check:legal` bunu denetler. Bir Korece cümleyi iki Türkçe cümleye
 *   bölmek denetimi düşürür; iki cümleyi birleştirmek ise düşen bir hükmü gizler.
 *
 * ⚠ Bu belge, Kore’nin **Elektronik Ticarette Tüketicinin Korunması Kanunu’nun 13. maddesinin
 *   2. fıkrası** nedeniyle vardır — sözleşmeden *önce* bilgilendirme ve *sonra* sözleşme
 *   içeriğinin yazılı olarak verilmesi. 5. bent (cayma), 6. bent (iade), 8. bent (şikâyetler ve
 *   uyuşmazlıklar) ve 9. bent (koşulların kendisi ve nasıl görülebileceği) için başka bir kap
 *   yoktur. Her madde belirli bir bendin kabıdır; bu yüzden **bir madde, daha akıcı okunsun
 *   diye hukuki özünü yitiremez.** En ağır basan üçü:
 *
 *   - 12. madde, 17. maddenin 2. fıkrasının 5. bendi ile 6. fıkrasını özü itibarıyla birebir
 *     yineler. “dijital içeriğin sunulmasına başlanmışsa”, “bölümler hâlinde sunulan dijital
 *     içeriğin henüz sunulmamış bölümü” ve “bu hususu belirtmekle birlikte **aynı anda** …
 *     deneme amaçlı ürün olarak sunar” kanuni koşullardır — bulanıklaştırılırsa sınırlama
 *     geçersiz olur.
 *   - 20. maddenin ilk satırı, 35. maddeye (tüketici aleyhine sözleşmeler) karşı güvencedir.
 *     **Asla “kanunun izin verdiği azami ölçüde” gibi** sorumsuzluk kalıpları eklenmemelidir:
 *     bu, tam da böyle bir şeyi reddetmek için yazılmış cümleyi tersine çevirir.
 *   - 22. madde, 36. maddedir (kesin yetki) — **kullanıcının** adresi, asla işletmecinin
 *     merkezi değil. İşletmecinin merkezini yazmak 35. madde uyarınca geçersizdir.
 *
 * ⚠ “청약철회” burada **“cayma”** olarak karşılanmıştır, “iptal” olarak değil. Jogak Pro zaten
 *   bir aboneliktir ve 14. madde onun iptalidir; bu iki hukuki yol tek belgede birbirine
 *   karışmamalıdır.
 */
export const TERMS_TR: LegalDoc = {
  title: 'Jogak Kullanım Koşulları',
  sourceFingerprint: '898aa8d7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'Bu koşullar, Hwiseong Games’in (marka: Vivace Games, “işletmeci”) sunduğu “Jogak” adlı mobil uygulamanın (“hizmet”) kullanımına ilişkin olarak işletmeci ile kullanıcı arasındaki hakları, yükümlülükleri ve sorumlulukları belirler. Hizmeti kullanmadan önce lütfen bunları oku.',
  sections: [
    {
      h: 'Madde 1 (Amaç ve kapsam)',
      body: [
        'Bu koşulların amacı, hizmetin kullanım şartlarını ve usullerini, işletmeci ile kullanıcının hak ve yükümlülüklerini belirlemektir.',
        'Bu koşullar hizmeti kullanan bütün kullanıcılara uygulanır. Giriş yapmadan yalnızca günlük yazdığında da aynı şekilde uygulanır.',
        'Bu koşullarda düzenlenmeyen konularda, Elektronik Ticarette Tüketicinin Korunması Kanunu, Genel İşlem Koşullarının Düzenlenmesi Hakkında Kanun ve İçerik Endüstrisinin Teşviki Hakkında Kanun başta olmak üzere ilgili mevzuat ile ticari teamüller uygulanır.',
      ],
    },
    {
      h: 'Madde 2 (İşletmeci bilgileri)',
      body: [
        'Unvan: Hwiseong Games (marka: Vivace Games)',
        // ⚠ `PRIVACY_TR` 11. bölümde kullanılan yazım. İki belge aynı kişiyi farklı adlandıramaz.
        'Temsilci: Son Hwi-seong',
        'İşyeri adresi: 204, 2F, 22 Seongan 5-gil, Jung-gu, Ulsan, 44421, Republic of Korea',
        'Telefon: +82 10-9926-0925',
        'E-posta adresi: support@vivace-games.com',
        'İşletme kayıt numarası: 749-25-02260',
        'Mesafeli satış işletmesi bildirim numarası: 2026-Ulsan Jung-gu-0170 (bildirimi alan kurum: Ulsan Büyükşehir Jung-gu İlçesi)',
      ],
    },
    {
      h: 'Madde 3 (Tanımlar)',
      body: [
        '“Parça” (“jogak”), kullanıcının hizmette yazdığı tek bir günlük kaydını ifade eder.',
        '“Cihaz”, kullanıcının hizmeti kurup kullandığı akıllı telefon gibi bir uç birimi ifade eder.',
        '“Jogak Pro”, reklamların kaldırılmasını, yedekleme ve geri yüklemeyi ve yapay zekâ özet raporlarını sunan, düzenli ödemeli ücretli ürünü ifade eder.',
        '“Açık pazar”, hizmetin dağıtıldığı ve ücretli ürünlerin ödemesinin yapıldığı Google Play gibi bir uygulama mağazasını ifade eder.',
      ],
    },
    {
      h: 'Madde 4 (Koşulların yayımlanması ve değiştirilmesi)',
      body: [
        'İşletmeci bu koşulları, kullanıcıların istedikleri zaman inceleyebilmesi için hizmet içindeki [Ayarlar] ekranında ve aşağıdaki adreste yayımlar.',
        'https://sonwheesung.github.io/diary/terms.html',
        'İşletmeci, ilgili mevzuata aykırı olmayacak ölçüde bu koşulları değiştirebilir.',
        'Koşulları değiştirirken işletmeci, yürürlük tarihini ve değişiklik gerekçesini belirterek yürürlük tarihinden 7 gün önce hizmet içinde duyuru yapar. Ancak kullanıcılar aleyhine olan değişikliklerde duyuru yürürlük tarihinden 30 gün önce yapılır ve değişiklik öncesi ile sonrası kolay anlaşılır biçimde karşılaştırmalı olarak gösterilir.',
        'Değişen koşulları kabul etmiyorsan, yürürlük tarihinden önce ücretli hizmetleri iptal edip kullanmayı bırakabilirsin. Duyurulan yürürlük tarihinden sonra hizmeti kullanmaya devam edersen değişen koşulları kabul etmiş sayılırsın.',
      ],
    },
    {
      h: 'Madde 5 (Hizmetin içeriği)',
      body: [
        'İşletmecinin sunduğu hizmetin adı “Jogak”, türü ise günlük yazmaya ve saklamaya yarayan bir mobil uygulamadır (dijital içerik).',
        'Ücretsiz sunulan özellikler: günlük yazma, düzenleme, silme ve arama, fotoğraf ekleme, etiketler, duygu kaydı, takvim görünümü, uygulama kilidi (PIN ve desen), koyu mod, çoklu dil, duyuruların okunması, iletişim.',
        '“Jogak Pro” adlı ücretli ürünle sunulan özellikler: reklamların kaldırılması, şifrelenmiş yedekleme ve geri yükleme, yapay zekâ özet raporları.',
        'Yazdığın kayıtların başlığı, metni, fotoğrafları, etiketleri ve duyguları yalnızca cihazının içinde saklanır ve yedekleme özelliğini açmadığın sürece işletmecinin sunucularına aktarılmaz.',
        'Yedeklemeyi açarsan kayıtlar cihazında şifrelendikten sonra aktarılır; işletmeci şifre çözme anahtarını saklamadığından içeriklerini okuyamaz.',
        'Yapay zekâ özet raporu oluşturulurken, istediğin döneme ait günlük metni işletmecinin sunucusundan geçerek yapay zekâ sağlayıcısına iletilir. İşletmeci bu metni saklamaz. Ayrıntılar gizlilik politikasına tabidir.',
      ],
    },
    {
      h: 'Madde 6 (Sözleşmenin kurulması ve hesap)',
      body: [
        'Hizmet kullanım sözleşmesi, hizmeti kurup bu koşulları kabul ettikten sonra hizmeti kullanmanla kurulur.',
        'Günlük yazmak dâhil ücretsiz özellikler hesap olmadan kullanılabilir.',
        'İletişim, ücretli ürünlerin ödemesi, yedekleme ve geri yükleme ile yapay zekâ özet raporları Google hesabıyla giriş yapmayı gerektirir.',
        'Hesabını istediğin zaman hizmet içindeki [Ayarlar] → [İletişim] ekranından silebilirsin. Silme yöntemi ile hangi bilgilerin silineceği veya saklanacağı hesap silme kılavuzuna tabidir.',
      ],
    },
    {
      h: 'Madde 7 (Ücretli ürünlerin fiyatı ve ödeme)',
      body: [
        'Jogak Pro’nun ücreti aylık 3.900 KRW ve yıllık 29.000 KRW olup her iki tutara da katma değer vergisi dâhildir.',
        'Ücret, açık pazara kayıtlı ödeme yönteminden otomatik olarak tahsil edilir; tahsilat aboneliğin başladığı anda ve sonrasında her yenileme tarihinde gerçekleşir.',
        'Ücret dışında ödemen gereken ek bir masraf yoktur. Ancak hizmeti kullanmak için gereken veri iletişim ücretleri, abonesi olduğun operatörün politikasına tabidir ve sana aittir.',
        'Açık pazarın kur ve komisyon politikaları ya da ülkeye göre fiyatlandırması nedeniyle fiilen tahsil edilen tutar yukarıdaki tutarlardan farklı olabilir. Bu durumda ödeme ekranında gösterilen tutar geçerlidir.',
        'İşletmeci ücreti artırırsa 4. madde uyarınca önceden duyurur; hâlihazırda ödenmiş abonelik dönemine artırılmış fiyat uygulanmaz.',
      ],
    },
    {
      h: 'Madde 8 (Satış koşullarına ilişkin sınırlamalar)',
      body: [
        'Hizmet yalnızca açık pazarın dağıtımına izin verdiği ülkelerde kullanılabilir; kurulum ve ödeme yalnızca işletmecinin belirlediği dağıtım ülkelerinde mümkündür.',
        'Bir ücretli abonelik aynı anda yalnızca tek bir hesaba bağlıdır. Aynı cihazda başka bir Google hesabıyla giriş yaparsan abonelik o hesaba geçer ve önceki hesaptan kullanılamaz hâle gelir.',
        'İşletmeci, hizmetin bazı özelliklerini sunabilmek için gereken ölçüde kullanım sayısına üst sınır koyabilir. Oluşturulabilecek yapay zekâ özet raporlarının sayısı dönem başına sınırlıdır ve bu sınırlar hizmet ekranlarında gösterilir.',
      ],
    },
    {
      h: 'Madde 9 (Sunum zamanı ve yöntemi)',
      body: [
        'Jogak Pro, ödeme tamamlanır tamamlanmaz hesabına tanımlanır; ayrı bir teslimat süreci yoktur.',
        'Ödeme tamamlandığı hâlde hak tanımlanmadıysa, hizmet içindeki [Abonelik] ekranında [Satın alımları geri yükle] seçeneğini kullanabilir ya da 21. maddedeki yolla işletmeciye başvurabilirsin.',
        'Abonelik dönemi, ödeme gününden bir sonraki yenileme gününün bir önceki gününe kadar sürer ve iptal edilmezse aynı süre kadar kendiliğinden yenilenir.',
      ],
    },
    {
      h: 'Madde 10 (Kullanım ortamı)',
      body: [
        'Hizmet Android cihazlarda kullanılabilir ve açık pazardaki ayrıntı sayfasında belirtilen işletim sistemi sürümünü veya üstünü gerektirir.',
        'Günlük yazma, görüntüleme ve arama gibi temel özellikler internet bağlantısı olmadan kullanılabilir.',
        'Duyuruların okunması, iletişim, giriş, ödeme, yedekleme ve geri yükleme ile yapay zekâ özet raporları internet bağlantısı gerektirir.',
        'Cihazının depolama alanı yetersizse veya işletim sistemi desteklenen aralığın dışındaysa bazı özellikler düzgün çalışmayabilir.',
      ],
    },
    {
      h: 'Madde 11 (Ücretsiz deneme ve ücretli aboneliğe geçiş)',
      body: [
        'İşletmeci Jogak Pro için 7 günlük ücretsiz deneme sunar.',
        'Ücretsiz deneme süresi bittiğinde kendiliğinden düzenli ödemeli ücretli aboneliğe geçilir ve 7. maddedeki ücret tahsil edilir.',
        'İşletmeci, geçiş gerçekleşmeden önce geçiş tarih ve saatini, değişiklik öncesi ve sonrası fiyatı ve ödeme yöntemini gösterir ve onayını alır; onay vermezsen ödeme yapılmaz.',
        'Ücretsiz deneme sırasında ücret tahsil edilmesini istemiyorsan, deneme süresi bitmeden 14. maddedeki yolla aboneliği iptal et. İptal etsen de deneme süresi bitene kadar Jogak Pro’yu kullanmaya devam edebilirsin.',
      ],
    },
    {
      h: 'Madde 12 (Cayma)',
      body: [
        'Ücretli ürünün ödeme tarihinden ya da sözleşme içeriğine ilişkin yazılı belgeyi aldığın tarihten itibaren 7 gün içinde cayabilirsin.',
        'Cayma, 21. maddedeki başvuru kanalına bu yöndeki iradeni bildirmek suretiyle yapılır; işletmeci, başvurunun alındığı tarihten itibaren 3 iş günü içinde sonucu sana bildirir.',
        'Cayma gerçekleştiğinde işletmeci 13. madde uyarınca bedeli iade eder ve Jogak Pro kullanım hakkın derhâl sona erer.',
        'Ancak Elektronik Ticarette Tüketicinin Korunması Kanunu’nun 17. maddesinin 2. fıkrasının 5. bendi uyarınca, dijital içeriğin sunulmasına başlanmışsa cayma hakkı sınırlanır. Bu durumda dahi, bölümler hâlinde sunulan dijital içeriğin henüz sunulmamış bölümü bakımından cayma hakkı kullanılabilir.',
        'İşletmeci bu sınırlamayı uygulayabilmek için, aynı maddenin 6. fıkrası uyarınca bu hususu belirtmekle birlikte aynı anda 11. maddedeki 7 günlük ücretsiz denemeyi deneme amaçlı ürün olarak sunar. İşletmeci bu önlemleri almamışsa yukarıdaki sınırlamaya rağmen cayabilirsin.',
        'İşletmeci, caymanı gerekçe göstererek cezai şart veya tazminat talep etmez.',
      ],
    },
    {
      h: 'Madde 13 (İade)',
      body: [
        'Ücretli ürünlerin ödemesi açık pazar üzerinden yapıldığından, iade de kural olarak açık pazarın iade usulüne göre yürütülür.',
        'İadeyi doğrudan açık pazardan isteyebilir ya da 21. maddedeki başvuru kanalıyla işletmeciden talep edebilirsin. İşletmeciden talep edersen, işletmeci bunu açık pazarla görüşerek yürütür.',
        'İşletmeci, cayma ve benzeri bir irade beyanını aldığı tarihten itibaren 3 iş günü içinde bedeli iade eder. Paranın fiilen eline geçmesi, açık pazarın işlem takvimine bağlı olarak daha uzun sürebilir.',
        'İşletmeci haklı bir sebep olmaksızın iadeyi bu sürenin ötesine sarkıtırsa, gecikme süresi için Elektronik Ticarette Tüketicinin Korunması Kanunu’nun Uygulama Yönetmeliği’nde öngörülen oran uygulanarak hesaplanan gecikme faizini de öder.',
        'Kullanılmış bir süre varsa işletmeci o süreye karşılık gelen tutarı düşerek iade edebilir. Ancak işletmeciye yüklenebilen nedenlerle hizmeti kullanamadığın süre düşülmez.',
        'İade için ayrıca bir ücret alınmaz.',
      ],
    },
    {
      h: 'Madde 14 (Aboneliğin iptali)',
      body: [
        'Aboneliği istediğin zaman iptal edebilirsin. İptali açık pazarın abonelik yönetimi ekranından kendin yapmalısın; işletmeci senin yerine iptal edemez.',
        'Google Play: Store uygulaması > profil > Ödemeler ve abonelikler > Abonelikler (https://play.google.com/store/account/subscriptions)',
        'İptal etsen de ödemesi yapılmış abonelik dönemi bitene kadar Jogak Pro’yu kullanmaya devam edebilirsin; bu dönem geçtiğinde otomatik yenileme durur.',
        'Hizmetten hesabını silmen açık pazardaki aboneliği iptal etmez. Hesap silmeden ayrı olarak yukarıdaki yolla iptal etmezsen ücretlendirilmeye devam edersin.',
      ],
    },
    {
      h: 'Madde 15 (Küçüklerin sözleşmeleri)',
      body: [
        'Bir küçük, yasal temsilcisinin onayı olmadan ücretli bir ürün için ödeme yapmışsa, küçüğün kendisi veya yasal temsilcisi bu sözleşmeyi geçersiz kılabilir.',
        'Ancak küçük, yasal temsilcisinin tasarrufuna izin verdiği malvarlığıyla ödeme yapmışsa ya da hile ile ergin olduğuna inandırmışsa sözleşme geçersiz kılınamaz.',
        'Sözleşmeyi geçersiz kılmak istiyorsan 21. maddedeki başvuru kanalından talepte bulun. İşletmeci, yasal temsilci olduğunu gösteren belgeleri isteyebilir.',
      ],
    },
    {
      h: 'Madde 16 (Kullanıcının yükümlülükleri)',
      body: [
        'Kullanıcı, hizmeti kullanırken ilgili mevzuata ve bu koşullara uymak zorundadır.',
        'Kullanıcı; başkasının hesabını ele geçiremez, hizmetin olağan işleyişini engelleyemez, işletmecinin belirlediği yöntem dışında hizmete erişemez veya erişmeye teşebbüs edemez ve ücretli ürünlerin ödeme sürecini manipüle edemez.',
        'Kullanıcı, kendi hesap bilgilerini ve uygulama kilidinin PIN’ini ya da desenini kendisi korumakla yükümlüdür.',
        'Kullanıcı, yedekleme özelliğini açtığında verilen kurtarma kodunu güvenli biçimde saklamakla yükümlüdür. Kurtarma kodu kaybedilirse işletmeci de yedeğin şifresini çözemez ve geri yükleme olanaksız hâle gelir.',
      ],
    },
    {
      h: 'Madde 17 (Verilerin saklanması ve yedekleme)',
      body: [
        'Yazdığın kayıtların aslı cihazında saklanır. Uygulamayı silersen ya da cihazı sıfırlarsan cihazdaki kayıtlar geri getirilemez.',
        'Yedekleme özelliği açıksa işletmeci şifrelenmiş bir kopya saklar ve bunu kurtarma kodunla geri yükleyebilirsin.',
        'Abonelik bittikten sonra da işletmeci şifrelenmiş yedeği 90 gün saklar ve bu süre boyunca geri yükleme kullanılabilir olmayı sürdürür. 90 gün geçtiğinde yedek silinir.',
        'İşletmecinin anlık bildirim (push) aracı bulunmadığından, yukarıdaki silme planına ilişkin bilgilendirme yalnızca uygulamayı açtığında ekranda gösterilerek yapılır.',
        'Hesabını silersen sunucuda saklanan şifrelenmiş yedek, 90 günlük süre beklenmeden hesapla birlikte silinir.',
      ],
    },
    {
      h: 'Madde 18 (Fikrî mülkiyet)',
      body: [
        'Hizmette yazdığın günlükler ile eklediğin fotoğraflar üzerindeki haklar sana aittir. İşletmeci bunlar üzerinde hiçbir hak iddia etmez.',
        'İşletmeci, kullanıcıların günlüklerini hizmetin sunulması dışındaki amaçlarla kullanmaz; reklam, istatistik veya yapay zekâ eğitimi amacıyla da kullanmaz.',
        'Hizmetin kendisi ile hizmette yer alan tasarım, marka ve programlar üzerindeki haklar işletmeciye veya hak sahiplerine aittir.',
        'Kullanıcı, işletmecinin önceden onayı olmadan hizmeti çoğaltamaz, dağıtamaz veya tersine mühendisliğe tabi tutamaz.',
      ],
    },
    {
      h: 'Madde 19 (Hizmetin değiştirilmesi, durdurulması ve sonlandırılması)',
      body: [
        'İşletmeci hizmetin niteliğini artırmak için hizmetin içeriğini değiştirebilir. Ücretli ürünün içeriği kullanıcılar aleyhine değiştirilirse 4. madde uyarınca önceden duyurulur.',
        'İşletmeci; donanımın bakımı, değiştirilmesi veya arızalanması, iletişimin kesilmesi gibi zorunlu sebeplerin varlığı hâlinde hizmetin sunumunu geçici olarak durdurabilir ve bu durumda önceden duyuru yapar. Ancak önceden duyurmayı olanaksız kılan zorunlu sebepler varsa duyuru sonradan yapılır.',
        'İşletmeci hizmeti sonlandırırsa, sonlandırma tarihinden en az 30 gün önce hizmet içi duyurular ve açık pazardaki ayrıntı sayfası aracılığıyla bildirir ve kullanıcıların yedeklerini indirebileceği ya da geri yükleyebileceği süreyi de birlikte duyurur.',
        'Hizmet sonlandığında, ödemesi yapılmış ancak kullanılmamış döneme karşılık gelen ücret kullanıcıya iade edilir.',
      ],
    },
    {
      h: 'Madde 20 (Sorumluluk)',
      body: [
        'İşletmeci, hizmetin sunulmasıyla ilgili olarak ilgili mevzuatın öngördüğü sorumluluğu taşır. Bu koşulların hiçbir hükmü, işletmecinin kanunla öngörülmüş sorumluluğunu ortadan kaldırmaz veya sınırlamaz.',
        'İşletmeci; doğal afet, kullanıcının cihazının arızalanması, kaybolması veya sıfırlanması, kullanıcının kurtarma kodunu ya da uygulama kilidi sırrını kaybetmesi gibi kendisine yüklenemeyen nedenlerden doğan zararlardan sorumlu değildir.',
        'Yapay zekâ özet raporu, yapay zekânın ürettiği bir başvuru materyalidir; tıbbi, psikolojik veya hukuki bir teşhis ya da tavsiye değildir. İşletmeci içeriğinin doğruluğunu garanti etmez.',
        'Açık pazar üzerinden yapılan ödeme sürecinde açık pazara yüklenebilen nedenlerle doğan zararlar açık pazarın politikasına tabidir. Bununla birlikte işletmeci, kullanıcının zararının giderilmesi için gereken her türlü iş birliğini gösterir.',
      ],
    },
    {
      h: 'Madde 21 (Tüketici şikâyetleri ve uyuşmazlıkların çözümü)',
      body: [
        'İşletmeci, kullanıcıların görüş ve şikâyetlerini ele almak için hizmet içindeki [Ayarlar] → [İletişim] kanalını ve aşağıdaki e-posta kanalını işletir.',
        'E-posta: support@vivace-games.com',
        'İşletmeci, kullanıcının ilettiği görüş veya şikâyeti haklı bulursa gecikmeksizin işleme alır; işlem zaman alacaksa gerekçesini ve işlem takvimini bildirir.',
        'İşletmeci ile kullanıcı arasında uyuşmazlık doğarsa kullanıcı aşağıdaki kurumlara uyuşmazlık çözümü başvurusu yapabilir.',
        '• Tüketici Uyuşmazlıkları Arabuluculuk Kurulu (Kore Tüketici Kurumu): 1372 (Kore’den) · https://www.kca.go.kr',
        '• İçerik Uyuşmazlıkları Arabuluculuk Kurulu: 1588-2594 · https://www.kcdrc.kr',
        '• Elektronik Ticaret Uyuşmazlıkları Arabuluculuk Kurulu: 1661-5714 · https://www.ecmc.or.kr',
      ],
    },
    {
      h: 'Madde 22 (Uygulanacak hukuk ve yetkili mahkeme)',
      body: [
        'Bu koşullara ve hizmetin kullanımına Kore Cumhuriyeti hukuku uygulanır.',
        'İşletmeci ile kullanıcı arasında doğan uyuşmazlıklara ilişkin davalarda, Elektronik Ticarette Tüketicinin Korunması Kanunu’nun 36. maddesi uyarınca, dava açıldığı tarihteki kullanıcı adresinin bağlı olduğu bölge mahkemesi kesin yetkilidir. Adres yoksa oturma yerinin bağlı olduğu bölge mahkemesi kesin yetkilidir; dava açıldığı tarihte kullanıcının adresi veya oturma yeri belirlenemiyorsa yetkili mahkeme Medeni Usul Kanunu’na göre belirlenir.',
        'Bu koşulların Korece metni esastır. Başka bir dile yapılan çeviri anlam bakımından farklılık gösterirse Korece metin üstün tutulur.',
        'Ek hüküm: Bu koşullar 17 Ağustos 2026 tarihinde yürürlüğe girer.',
      ],
    },
  ],
};
