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
  sourceFingerprint: 'e1010878',
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
        'Yapay zekâ özet raporları ekleniyor. Yalnızca raporu kendin oluşturduğunda, o döneme ait günlük içeriğin şifrelenmemiş hâlde işletmecinin sunucusundan geçerek yapay zekâ sağlayıcısına iletilir. İşletmeci bu içeriği saklamaz; yapay zekâ sağlayıcısı kötüye kullanımı izlemek için en fazla 30 gün saklar, sonra siler ve model eğitiminde kullanmaz.',
      sections: [
        {
          h: 'a. Ne değişiyor (öncesi → sonrası)',
          body: [
            'Öncesi: kayıtların başlıkları ve metni cihazının dışına aktarılmaz. Yedeklemeyi açmış olsan bile, yalnızca işletmecinin okuyamadığı şifreli metin olarak aktarılır.',
            'Sonrası: **yalnızca “Rapor oluştur”a kendin dokunduğunda**, o döneme ait günlük içeriği **şifrelenmemiş** hâlde işletmecinin sunucusu üzerinden yapay zekâ sağlayıcısına gönderilir ve bir özet üretilir.',
            '⚠ Tam olarak: işletmeci bu içeriği **saklamaz.** Ancak özet yazılırken içerik işletmecinin sunucusundan geçer — bu yüzden “işletmeci göremez” diyemeyiz. Bunu bulanıklaştırmadan olduğu gibi bildiriyoruz.',
            'Rapor oluşturmazsan bu aktarım hiç gerçekleşmez; kayıt yazma dâhil diğer tüm özellikler aynen kullanılabilir.',
          ],
        },
        {
          h: 'b. Hassas bilgiler için ayrı onay',
          body: [
            'Günlükler, Kişisel Bilgilerin Korunması Kanunu’nun 23. maddesi anlamında sağlık veya ruh hâli gibi hassas bilgiler içerebilir.',
            'Yapay zekâ özet raporları bu içeriği şifrelenmemiş hâlde işlediğinden, özelliği ilk kez kullandığında **hassas bilgilerin işlenmesine ilişkin ayrı bir onay** alırız. Bu onay, aşağıdaki (c) bendindeki yurt dışına aktarım onayından **bağımsızdır** ve her biri ayrı ayrı seçilebilir.',
            'Onay vermesen de yapay zekâ raporları dışındaki tüm özellikleri kullanmaya devam edebilirsin.',
          ],
        },
        {
          h: 'c. Yurt dışına aktarım için ayrı onay',
          body: [
            'Yapay zekâ sağlayıcısı Kore dışında bulunur. Sağlayıcının adı, alıcı ülke ve iletişim bilgileri, özellik yayımlandığında bu bentte somut olarak belirtilir ve onay alınmadan önce uygulama içinde de gösterilir.',
            '• Aktarılan veriler: rapor istediğin döneme ait kayıtların başlığı, metni, duygusu ve tarihi',
            '• Amaç: özet raporun oluşturulması',
            '• Ne zaman ve nasıl: “Rapor oluştur”a dokunduğunda ağ üzerinden iletilir',
            '• Saklama: işletmecinin sunucusu **saklamaz** — özet yazılırken yalnızca bellekte tutar ve hemen ardından atar. Yapay zekâ sağlayıcısı kötüye kullanımı izlemek için **en fazla 30 gün** saklar ve sonra siler; bu süre içinde de **model eğitiminde kullanmaz.**',
            'Yurt dışına aktarımı reddedebilirsin; reddedersen yalnızca yapay zekâ raporları kullanılamaz, diğer tüm özellikler çalışmaya devam eder.',
          ],
        },
        {
          h: 'd. İşletmecinin sakladıkları (günlük içeriği olmayanlar)',
          body: [
            'Günlük içeriğini saklamayız, ancak aşağıdakileri saklarız.',
            '• Raporu oluşturan hesabın kimliği, dönem, kaç kez oluşturulduğu ve kullanılan jeton sayısı — ücretlendirme ve kötüye kullanımın önlenmesi için kullanılır.',
            '• Saklama: amaç gerçekleşene kadar veya hesabını silene kadar',
            'Tamamlanmış raporun metni **yalnızca cihazında** saklanır ve yedeklemeyi açtıysan şifreli olarak yedeğe dâhil edilir.',
          ],
        },
        {
          h: 'e. Haklarınız',
          body: [
            '• Raporlar yalnızca sen oluşturduğunda üretilir; hiçbir zaman kendiliğinden oluşturulmaz.',
            '• Oluşturduğun bir raporu uygulamada istediğin zaman silebilirsin.',
            '• Yapay zekânın ürettiği özetler gerçeklerden farklı olabilir ve tıbbi ya da psikolojik bir teşhis veya tavsiye değildir. Uygulama, bir özeti bildirmen için bir yol sunar.',
          ],
        },
      ],
    },
  ],
};
