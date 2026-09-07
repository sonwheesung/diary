/**
 * 스토어 등록정보 문안 원본 — 여기가 정본이고 콘솔은 사본이다.
 *
 * 🔴 **왜 파일로 두나**: 콘솔에만 있으면 다음 사람이 "뭐라고 써 뒀더라"를 콘솔을 열어야 안다.
 *   LinkMemo 도 `assets/store/listing-*.md` 로 같은 규약을 쓴다.
 *
 * ⚠ **고지 문구는 §5.1 을 그대로 따른다** — 백업은 *"읽지 못한다"*, AI 는 *"저장하지 않는다"*.
 *   정반대인 두 문장이라 한 문단에 섞지 않는다.
 * ⚠ 🚫 *"아무 데이터도 나가지 않는다"* 류를 쓰지 않는다 — 광고 SDK 가 있어 거짓이 된다
 *   (Idea Repository `docs/STORE_LISTING.md` 의 금지 표현 규약).
 * ⚠ **원어민 검수 전이다** — 앱 UI 번역과 같은 상태.
 *
 * 실행: node assets/store/build-listing.mjs   → assets/store/listing.json + 길이 검사
 */
import { writeFileSync } from 'node:fs';

const L = {};
const P = (title, short, long) => ({ title, short, long });

L['en-US'] = P(
  'Jogak - Private Diary Journal',
  'One piece a day. A quiet diary for moods and photos. No sign-in. Lock included.',
  `The day is long, but one piece is enough to keep.

Jogak is a quiet diary that keeps each day as a single piece.
No setup, no sign-up - you can start writing right away.

■ Fewer taps to write
・ One tap from home opens the editor
・ Pick today's mood from 8 emotions with a single tap
・ A title only if you want one. Drop photos anywhere in the text
・ Set alignment, size, weight and color per paragraph
・ Add tags so you can find it later

■ Your diary is stored on your device
・ You can write without signing in. No account needed
・ Until you turn backup on, your diary never leaves your device

■ App lock (no subscription needed)
・ Lock with a PIN or a 3x3 pattern so no one else can open it
・ Locks the moment you leave the app, and is hidden from the recent apps preview
・ Forgot it? Recover with the hint question you set beforehand

■ Easy to revisit
・ See the days you wrote at a glance in the calendar
・ Search by title and text
・ Check your writing streak on the home screen
・ A reminder at the time you choose

■ Jogak Pro (monthly / yearly)
・ No ads
・ Encrypted backup and restore - it is encrypted on your device before upload, so we cannot read it
・ AI summary reports - weekly, monthly and yearly look-backs. Your entries pass through our server while a report is generated, and we do not store them
・ You can cancel anytime on Google Play

■ Easy on the eyes
・ Light / Dark / Follow system
・ A quiet layout with generous spacing

■ 15 languages
English, Korean, Japanese, Chinese (Simplified / Traditional), Spanish, Portuguese, French, German, Italian, Russian, Indonesian, Vietnamese, Thai, Turkish

Leave just one piece of today.`,
);

L['ja-JP'] = P(
  'Jogak - 鍵つき日記・気分の記録',
  '一日にひとかけら。気分と写真で残す静かな日記。ログイン不要、PIN・パターンロック。',
  `一日は長いけれど、残したいのはひとかけらで十分です。

Jogakは今日一日をひとつのかけらとして残す、静かな日記帳です。
複雑な設定も会員登録もなく、すぐに書きはじめられます。

■ 書くまでの手数を減らしました
・ ホームから1タップで作成画面へ
・ 今日の気分は8つの感情から1タップ
・ タイトルは書きたいときだけ。本文の途中に写真を入れられます
・ 段落ごとに配置・サイズ・太さ・文字色を選べます
・ タグをつけてあとから探しやすく

■ 日記は端末に保存されます
・ ログインしなくてもすぐ書けます。アカウントは不要です
・ バックアップをオンにするまで、日記が端末の外に出ることはありません

■ アプリロック（サブスクなしで使えます）
・ PINまたは3×3パターンでロックすれば、他の人には開けません
・ アプリを離れるとすぐロックされ、最近使用したアプリの画面でも隠れます
・ 忘れたときは、あらかじめ決めたヒントの質問で取り戻せます

■ 読み返しやすく
・ カレンダーで書いた日をひと目で
・ タイトルと本文で検索
・ 何日続けて書いたかをホームで確認
・ 決めた時刻に知らせる記録リマインダー

■ Jogak Pro（月額・年額）
・ 広告なしで使えます
・ 暗号化バックアップと復元 - 端末で暗号化してから送るので、私たちは中身を読めません
・ AI要約レポート - 週間・月間・年間のふりかえり。レポートを作る間、日記の内容は私たちのサーバーを通りますが、保存はしません
・ 解約はGoogle Playからいつでもできます

■ 目にやさしい画面
・ ライト / ダーク / システム設定に合わせる
・ 余白を広くとった静かなデザイン

■ 15言語対応
日本語、한국어、English、中文(简体・繁體)、Espanol、Portugues、Francais、Deutsch、Italiano、Русский、Bahasa Indonesia、Tieng Viet、ภาษาไทย、Turkce

今日一日、ひとかけらだけ残してみてください。`,
);

L['zh-CN'] = P(
  'Jogak - 上锁日记 · 心情记录',
  '一天一片。用心情和照片记录的安静日记。无需登录，支持 PIN 和图案锁。',
  `一天很长，但想留下的，一片就够了。

Jogak 是把每一天记成一片的安静日记本。
不用复杂设置，也不用注册，打开就能写。

■ 更少的操作
・ 首页轻点一次就进入书写页
・ 今天的心情，从 8 种情绪中轻点选择
・ 标题想写才写。可以在正文中间插入照片
・ 每个段落都能设置对齐、字号、粗细和文字颜色
・ 加上标签，之后更好找

■ 日记保存在你的设备上
・ 不登录也能直接写，不需要账号
・ 在你打开备份之前，日记不会离开设备

■ 应用锁（无需订阅）
・ 用 PIN 或 3×3 图案上锁，别人打不开
・ 离开应用立刻上锁，最近任务预览中也会遮挡
・ 忘记了？用事先设定的提示问题找回

■ 方便回看
・ 在日历里一眼看到写过的日子
・ 按标题和正文搜索
・ 在首页查看连续记录天数
・ 在你设定的时间提醒你记录

■ Jogak Pro（月度 / 年度）
・ 没有广告
・ 加密备份与恢复 - 在设备上加密后再上传，因此我们无法读取内容
・ AI 摘要报告 - 每周、每月、每年的回顾。生成报告时日记内容会经过我们的服务器，但我们不会保存
・ 随时可在 Google Play 取消订阅

■ 看着舒服的界面
・ 浅色 / 深色 / 跟随系统
・ 留白充足的安静设计

■ 支持 15 种语言
中文(简体・繁體)、한국어、English、日本語、Espanol、Portugues、Francais、Deutsch、Italiano、Русский、Bahasa Indonesia、Tieng Viet、ภาษาไทย、Turkce

今天，就留下一片吧。`,
);

L['zh-TW'] = P(
  'Jogak - 上鎖日記 · 心情記錄',
  '一天一片。用心情和照片記錄的安靜日記。免登入，支援 PIN 與圖形鎖。',
  `一天很長，但想留下的，一片就夠了。

Jogak 是把每一天記成一片的安靜日記本。
不用複雜設定，也不用註冊，打開就能寫。

■ 更少的操作
・ 首頁輕點一次就進入書寫頁
・ 今天的心情，從 8 種情緒中輕點選擇
・ 標題想寫才寫。可以在內文中間插入照片
・ 每個段落都能設定對齊、字級、粗細和文字顏色
・ 加上標籤，之後更好找

■ 日記儲存在你的裝置上
・ 不登入也能直接寫，不需要帳號
・ 在你開啟備份之前，日記不會離開裝置

■ 應用程式鎖（無需訂閱）
・ 用 PIN 或 3×3 圖形上鎖，別人打不開
・ 離開應用程式立刻上鎖，最近使用畫面中也會遮蔽
・ 忘記了？用事先設定的提示問題找回

■ 方便回顧
・ 在日曆裡一眼看到寫過的日子
・ 依標題和內文搜尋
・ 在首頁查看連續記錄天數
・ 在你設定的時間提醒你記錄

■ Jogak Pro（月費 / 年費）
・ 沒有廣告
・ 加密備份與還原 - 在裝置上加密後才上傳，因此我們無法讀取內容
・ AI 摘要報告 - 每週、每月、每年的回顧。產生報告時日記內容會經過我們的伺服器，但我們不會儲存
・ 隨時可在 Google Play 取消訂閱

■ 看著舒服的畫面
・ 淺色 / 深色 / 跟隨系統
・ 留白充足的安靜設計

■ 支援 15 種語言
中文(繁體・简体)、한국어、English、日本語、Espanol、Portugues、Francais、Deutsch、Italiano、Русский、Bahasa Indonesia、Tieng Viet、ภาษาไทย、Turkce

今天，就留下一片吧。`,
);

L['es-419'] = P(
  'Jogak - Diario privado y ánimo',
  'Un trozo al día. Diario tranquilo de ánimo y fotos. Sin cuenta. Con bloqueo.',
  `El día es largo, pero basta con guardar un trozo.

Jogak es un diario tranquilo que guarda cada día como un solo trozo.
Sin configuración ni registro: puedes empezar a escribir de inmediato.

■ Menos toques para escribir
・ Un toque desde el inicio abre el editor
・ Elige el ánimo de hoy entre 8 emociones con un solo toque
・ El título solo si quieres. Inserta fotos en cualquier parte del texto
・ Ajusta alineación, tamaño, grosor y color por párrafo
・ Añade etiquetas para encontrarlo después

■ Tu diario se guarda en tu dispositivo
・ Puedes escribir sin iniciar sesión. No necesitas cuenta
・ Hasta que actives la copia de seguridad, tu diario no sale del dispositivo

■ Bloqueo de la app (sin suscripción)
・ Bloquea con un PIN o un patrón de 3x3 para que nadie más lo abra
・ Se bloquea al salir de la app y se oculta en la vista de apps recientes
・ ¿Lo olvidaste? Recupéralo con la pregunta de pista que definiste antes

■ Fácil de releer
・ Mira de un vistazo en el calendario los días que escribiste
・ Busca por título y texto
・ Consulta tu racha de días en la pantalla de inicio
・ Un recordatorio a la hora que elijas

■ Jogak Pro (mensual / anual)
・ Sin anuncios
・ Copia de seguridad cifrada y restauración: se cifra en tu dispositivo antes de subirse, así que no podemos leerla
・ Informes con IA: repasos semanales, mensuales y anuales. Tus entradas pasan por nuestro servidor mientras se genera el informe y no las almacenamos
・ Puedes cancelar cuando quieras en Google Play

■ Cómodo para la vista
・ Claro / Oscuro / Según el sistema
・ Un diseño tranquilo con mucho espacio

■ 15 idiomas
Espanol, Korean, English, Japanese, Chinese, Portugues, Francais, Deutsch, Italiano, Русский, Bahasa Indonesia, Tieng Viet, Thai, Turkce

Deja solo un trozo de hoy.`,
);

L['pt-BR'] = P(
  'Jogak - Diário privado e humor',
  'Um pedaço por dia. Diário calmo de humor e fotos. Sem conta. Com bloqueio.',
  `O dia é longo, mas guardar um pedaço já basta.

Jogak é um diário calmo que guarda cada dia como um único pedaço.
Sem configuração nem cadastro: você já pode começar a escrever.

■ Menos toques para escrever
・ Um toque na tela inicial abre o editor
・ Escolha o humor de hoje entre 8 emoções com um toque
・ Título só se você quiser. Coloque fotos em qualquer ponto do texto
・ Defina alinhamento, tamanho, peso e cor por parágrafo
・ Adicione tags para achar depois

■ Seu diário fica no seu aparelho
・ Dá para escrever sem entrar em uma conta. Nenhum cadastro é preciso
・ Até você ativar o backup, seu diário não sai do aparelho

■ Bloqueio do app (sem assinatura)
・ Bloqueie com PIN ou padrão 3x3 para ninguém mais abrir
・ Bloqueia assim que você sai do app e fica oculto na lista de apps recentes
・ Esqueceu? Recupere com a pergunta de dica que você definiu antes

■ Fácil de reler
・ Veja no calendário os dias em que você escreveu
・ Busque por título e texto
・ Acompanhe sua sequência de dias na tela inicial
・ Um lembrete no horário que você escolher

■ Jogak Pro (mensal / anual)
・ Sem anúncios
・ Backup criptografado e restauração: é criptografado no seu aparelho antes do envio, então não conseguimos ler
・ Relatórios com IA: retrospectivas semanais, mensais e anuais. Suas entradas passam pelo nosso servidor enquanto o relatório é gerado, e não as armazenamos
・ Você pode cancelar quando quiser no Google Play

■ Confortável para os olhos
・ Claro / Escuro / Seguir o sistema
・ Um layout calmo, com bastante espaço

■ 15 idiomas
Portugues, Korean, English, Japanese, Chinese, Espanol, Francais, Deutsch, Italiano, Русский, Bahasa Indonesia, Tieng Viet, Thai, Turkce

Deixe só um pedaço de hoje.`,
);

L['fr-FR'] = P(
  'Jogak - Journal intime à code',
  'Un morceau par jour. Journal calme, humeurs et photos. Sans compte. Verrouillé.',
  `La journée est longue, mais un seul morceau suffit à garder.

Jogak est un journal calme qui garde chaque journée comme un seul morceau.
Sans réglages ni inscription : vous pouvez écrire tout de suite.

■ Moins de gestes pour écrire
・ Un appui depuis l'accueil ouvre l'éditeur
・ L'humeur du jour se choisit d'un appui parmi 8 émotions
・ Un titre seulement si vous en voulez un. Insérez des photos dans le texte
・ Alignement, taille, graisse et couleur par paragraphe
・ Ajoutez des tags pour retrouver plus tard

■ Votre journal reste sur votre appareil
・ Vous pouvez écrire sans vous connecter. Aucun compte requis
・ Tant que vous n'activez pas la sauvegarde, votre journal ne quitte pas l'appareil

■ Verrouillage de l'app (sans abonnement)
・ Verrouillez par code PIN ou schéma 3x3 pour que personne d'autre ne l'ouvre
・ Se verrouille dès que vous quittez l'app et reste masqué dans les apps récentes
・ Oublié ? Récupérez-le avec la question indice définie à l'avance

■ Facile à relire
・ Repérez d'un coup d'oeil les jours écrits dans le calendrier
・ Recherchez par titre et par texte
・ Suivez votre série de jours sur l'accueil
・ Un rappel à l'heure de votre choix

■ Jogak Pro (mensuel / annuel)
・ Sans publicité
・ Sauvegarde chiffrée et restauration : le chiffrement a lieu sur votre appareil avant l'envoi, nous ne pouvons donc pas la lire
・ Rapports IA : bilans hebdomadaires, mensuels et annuels. Vos textes passent par notre serveur pendant la génération du rapport, et nous ne les conservons pas
・ Vous pouvez résilier à tout moment sur Google Play

■ Agréable pour les yeux
・ Clair / Sombre / Suivre le système
・ Une mise en page calme et aérée

■ 15 langues
Francais, Korean, English, Japanese, Chinese, Espanol, Portugues, Deutsch, Italiano, Русский, Bahasa Indonesia, Tieng Viet, Thai, Turkce

Laissez juste un morceau d'aujourd'hui.`,
);

L['ru-RU'] = P(
  'Jogak: Личный дневник, замок',
  'Один кусочек в день. Тихий дневник настроений и фото. Без входа. С блокировкой.',
  `День длинный, но сохранить достаточно одного кусочка.

Jogak - тихий дневник, который хранит каждый день как один кусочек.
Без настроек и регистрации: можно начать писать сразу.

■ Меньше действий, чтобы написать
・ Одно касание на главном экране открывает редактор
・ Настроение дня выбирается одним касанием из 8 эмоций
・ Заголовок - только если хотите. Фото можно вставить в любое место текста
・ Выравнивание, размер, насыщенность и цвет - для каждого абзаца
・ Добавляйте теги, чтобы найти запись позже

■ Дневник хранится на вашем устройстве
・ Писать можно без входа в аккаунт. Регистрация не нужна
・ Пока вы не включите резервную копию, дневник не покидает устройство

■ Блокировка приложения (без подписки)
・ Заблокируйте PIN-кодом или графическим ключом 3x3, чтобы никто другой не открыл
・ Блокируется сразу при выходе из приложения и скрыт в списке недавних
・ Забыли? Восстановите по контрольному вопросу, который задали заранее

■ Удобно перечитывать
・ Дни с записями видны в календаре
・ Поиск по заголовку и тексту
・ Серия дней подряд видна на главном экране
・ Напоминание в выбранное вами время

■ Jogak Pro (месяц / год)
・ Без рекламы
・ Зашифрованная резервная копия и восстановление: шифрование происходит на устройстве до отправки, поэтому мы не можем её прочитать
・ Отчёты с ИИ: недельные, месячные и годовые обзоры. Ваши записи проходят через наш сервер во время создания отчёта, и мы их не храним
・ Отменить подписку можно в любой момент в Google Play

■ Комфортно для глаз
・ Светлая / Тёмная / Как в системе
・ Спокойный макет с большими отступами

■ 15 языков
Русский, Korean, English, Japanese, Chinese, Espanol, Portugues, Francais, Deutsch, Italiano, Bahasa Indonesia, Tieng Viet, Thai, Turkce

Оставьте всего один кусочек сегодняшнего дня.`,
);

L['id'] = P(
  'Jogak - Buku Harian Terkunci',
  'Satu keping tiap hari. Buku harian tenang: suasana hati dan foto. Ada kunci.',
  `Hari itu panjang, tetapi menyimpan satu keping saja sudah cukup.

Jogak adalah buku harian yang tenang, menyimpan setiap hari sebagai satu keping.
Tanpa pengaturan rumit dan tanpa pendaftaran - Anda bisa langsung menulis.

■ Lebih sedikit ketukan untuk menulis
・ Satu ketukan dari beranda membuka layar tulis
・ Pilih suasana hati hari ini dari 8 emosi dengan satu ketukan
・ Judul hanya jika Anda mau. Sisipkan foto di mana saja dalam teks
・ Atur perataan, ukuran, ketebalan, dan warna per paragraf
・ Tambahkan tag agar mudah ditemukan nanti

■ Buku harian tersimpan di perangkat Anda
・ Bisa menulis tanpa masuk akun. Tidak perlu mendaftar
・ Sampai Anda mengaktifkan cadangan, buku harian tidak keluar dari perangkat

■ Kunci aplikasi (tanpa langganan)
・ Kunci dengan PIN atau pola 3x3 agar orang lain tidak bisa membukanya
・ Terkunci begitu Anda keluar dari aplikasi, dan tersembunyi di pratinjau aplikasi terbaru
・ Lupa? Pulihkan dengan pertanyaan petunjuk yang Anda tetapkan sebelumnya

■ Mudah dibaca ulang
・ Lihat sekilas hari-hari yang Anda tulis di kalender
・ Cari berdasarkan judul dan isi
・ Lihat rentetan hari menulis di layar beranda
・ Pengingat pada waktu yang Anda pilih

■ Jogak Pro (bulanan / tahunan)
・ Tanpa iklan
・ Cadangan terenkripsi dan pemulihan - dienkripsi di perangkat Anda sebelum diunggah, sehingga kami tidak dapat membacanya
・ Laporan ringkasan AI - tinjauan mingguan, bulanan, dan tahunan. Tulisan Anda melewati server kami saat laporan dibuat, dan kami tidak menyimpannya
・ Anda dapat membatalkan kapan saja di Google Play

■ Nyaman di mata
・ Terang / Gelap / Ikuti sistem
・ Tata letak tenang dengan ruang lapang

■ 15 bahasa
Bahasa Indonesia, Korean, English, Japanese, Chinese, Espanol, Portugues, Francais, Deutsch, Italiano, Русский, Tieng Viet, Thai, Turkce

Tinggalkan satu keping saja dari hari ini.`,
);

L['vi'] = P(
  'Jogak - Nhật ký riêng có khóa',
  'Mỗi ngày một mảnh. Nhật ký yên tĩnh cho cảm xúc và ảnh. Không cần tài khoản.',
  `Một ngày thì dài, nhưng giữ lại một mảnh là đủ.

Jogak là cuốn nhật ký yên tĩnh, giữ mỗi ngày như một mảnh nhỏ.
Không cài đặt phức tạp, không đăng ký - bạn có thể viết ngay.

■ Ít thao tác hơn để viết
・ Một chạm từ màn hình chính là mở trang viết
・ Chọn tâm trạng hôm nay từ 8 cảm xúc chỉ với một chạm
・ Tiêu đề chỉ khi bạn muốn. Chèn ảnh vào bất kỳ đâu trong bài
・ Đặt căn lề, cỡ chữ, độ đậm và màu chữ cho từng đoạn
・ Thêm thẻ để sau này dễ tìm

■ Nhật ký được lưu trên thiết bị của bạn
・ Viết được mà không cần đăng nhập. Không cần tài khoản
・ Cho đến khi bạn bật sao lưu, nhật ký không rời khỏi thiết bị

■ Khóa ứng dụng (không cần đăng ký gói)
・ Khóa bằng mã PIN hoặc hình vẽ 3x3 để người khác không mở được
・ Khóa ngay khi bạn rời ứng dụng, và bị ẩn trong màn hình ứng dụng gần đây
・ Quên rồi? Lấy lại bằng câu hỏi gợi ý bạn đã đặt trước

■ Dễ đọc lại
・ Nhìn lịch là thấy ngay những ngày bạn đã viết
・ Tìm theo tiêu đề và nội dung
・ Xem chuỗi ngày viết liên tiếp trên màn hình chính
・ Nhắc nhở vào giờ bạn chọn

■ Jogak Pro (theo tháng / theo năm)
・ Không quảng cáo
・ Sao lưu mã hóa và khôi phục - được mã hóa trên thiết bị trước khi tải lên, nên chúng tôi không thể đọc nội dung
・ Báo cáo tóm tắt AI - nhìn lại theo tuần, tháng và năm. Nội dung nhật ký đi qua máy chủ của chúng tôi trong lúc tạo báo cáo, và chúng tôi không lưu lại
・ Bạn có thể hủy bất cứ lúc nào trên Google Play

■ Dễ chịu cho mắt
・ Sáng / Tối / Theo hệ thống
・ Bố cục yên tĩnh, nhiều khoảng trống

■ 15 ngôn ngữ
Tieng Viet, Korean, English, Japanese, Chinese, Espanol, Portugues, Francais, Deutsch, Italiano, Русский, Bahasa Indonesia, Thai, Turkce

Hôm nay, hãy để lại một mảnh thôi.`,
);

L['th'] = P(
  'Jogak - ไดอารี่ส่วนตัวมีล็อก',
  'วันละหนึ่งชิ้น ไดอารี่เงียบ ๆ สำหรับอารมณ์และรูปภาพ ไม่ต้องเข้าสู่ระบบ มีล็อก',
  `วันหนึ่งนั้นยาวนาน แต่เก็บไว้เพียงชิ้นเดียวก็พอแล้ว

Jogak คือไดอารี่เงียบ ๆ ที่เก็บแต่ละวันไว้เป็นหนึ่งชิ้น
ไม่ต้องตั้งค่ายุ่งยาก ไม่ต้องสมัครสมาชิก เริ่มเขียนได้ทันที

■ ลดขั้นตอนก่อนจะได้เขียน
・ แตะครั้งเดียวจากหน้าแรกก็เข้าหน้าเขียน
・ เลือกอารมณ์ของวันนี้จาก 8 อารมณ์ด้วยการแตะครั้งเดียว
・ หัวข้อใส่เมื่ออยากใส่ แทรกรูปภาพตรงไหนของเนื้อหาก็ได้
・ ตั้งการจัดวาง ขนาด ความหนา และสีตัวอักษรได้ทีละย่อหน้า
・ ใส่แท็กไว้เพื่อให้ค้นเจอภายหลัง

■ ไดอารี่ถูกเก็บไว้ในเครื่องของคุณ
・ เขียนได้โดยไม่ต้องเข้าสู่ระบบ ไม่ต้องมีบัญชี
・ จนกว่าคุณจะเปิดการสำรองข้อมูล ไดอารี่จะไม่ออกจากเครื่อง

■ ล็อกแอป (ใช้ได้โดยไม่ต้องสมัครสมาชิกแบบชำระเงิน)
・ ล็อกด้วย PIN หรือรูปแบบ 3x3 เพื่อไม่ให้คนอื่นเปิดได้
・ ล็อกทันทีที่ออกจากแอป และถูกซ่อนในหน้าแอปที่ใช้ล่าสุด
・ ลืมแล้วใช่ไหม กู้คืนด้วยคำถามใบ้ที่คุณตั้งไว้ล่วงหน้า

■ ย้อนอ่านได้ง่าย
・ ดูวันที่เขียนไว้ได้ในปฏิทินในพริบตา
・ ค้นหาจากหัวข้อและเนื้อหา
・ ดูจำนวนวันที่เขียนต่อเนื่องได้ที่หน้าแรก
・ การแจ้งเตือนให้บันทึกตามเวลาที่คุณกำหนด

■ Jogak Pro (รายเดือน / รายปี)
・ ไม่มีโฆษณา
・ การสำรองข้อมูลแบบเข้ารหัสและการกู้คืน - เข้ารหัสในเครื่องของคุณก่อนอัปโหลด เราจึงอ่านเนื้อหาไม่ได้
・ รายงานสรุปด้วย AI - ทบทวนรายสัปดาห์ รายเดือน และรายปี เนื้อหาไดอารี่จะผ่านเซิร์ฟเวอร์ของเราระหว่างสร้างรายงาน และเราไม่เก็บบันทึกไว้
・ ยกเลิกเมื่อใดก็ได้บน Google Play

■ สบายตา
・ สว่าง / มืด / ตามระบบ
・ ดีไซน์เงียบสงบ เว้นที่ว่างเยอะ

■ รองรับ 15 ภาษา
Thai, Korean, English, Japanese, Chinese, Espanol, Portugues, Francais, Deutsch, Italiano, Русский, Bahasa Indonesia, Tieng Viet, Turkce

วันนี้ ลองเก็บไว้สักชิ้นหนึ่งดูนะ`,
);

L['tr-TR'] = P(
  'Jogak - Kilitli Özel Günlük',
  'Günde bir parça. Ruh hali ve fotoğraflar için sakin bir günlük. Hesap gerekmez.',
  `Gün uzundur ama saklamak için bir parça yeter.

Jogak, her günü tek bir parça olarak saklayan sakin bir günlüktür.
Karmaşık ayar ve kayıt olmadan hemen yazmaya başlayabilirsiniz.

■ Yazmak için daha az dokunuş
・ Ana ekrandan tek dokunuşla yazma ekranı açılır
・ Bugünün ruh halini 8 duygu arasından tek dokunuşla seçin
・ Başlık yalnızca isterseniz. Metnin herhangi bir yerine fotoğraf ekleyin
・ Her paragraf için hizalama, boyut, kalınlık ve yazı rengi seçin
・ Sonradan kolay bulmak için etiket ekleyin

■ Günlüğünüz cihazınızda saklanır
・ Oturum açmadan yazabilirsiniz. Hesap gerekmez
・ Yedeklemeyi açana kadar günlüğünüz cihazdan dışarı çıkmaz

■ Uygulama kilidi (abonelik gerekmez)
・ PIN veya 3x3 desen ile kilitleyin, başkası açamasın
・ Uygulamadan çıkar çıkmaz kilitlenir ve son uygulamalar önizlemesinde gizlenir
・ Unuttunuz mu? Önceden belirlediğiniz ipucu sorusuyla geri alın

■ Yeniden okumak kolay
・ Yazdığınız günleri takvimde bir bakışta görün
・ Başlık ve içerikte arayın
・ Kaç gün üst üste yazdığınızı ana ekranda görün
・ Seçtiğiniz saatte kayıt hatırlatıcısı

■ Jogak Pro (aylık / yıllık)
・ Reklamsız
・ Şifreli yedekleme ve geri yükleme - yüklenmeden önce cihazınızda şifrelenir, bu yüzden içeriği okuyamayız
・ Yapay zeka özet raporları - haftalık, aylık ve yıllık geri dönüşler. Rapor oluşturulurken günlük içeriğiniz sunucumuzdan geçer, ancak saklamayız
・ Google Play üzerinden istediğiniz zaman iptal edebilirsiniz

■ Göze rahat
・ Açık / Koyu / Sistemi izle
・ Bol boşluklu, sakin bir tasarım

■ 15 dil
Turkce, Korean, English, Japanese, Chinese, Espanol, Portugues, Francais, Deutsch, Italiano, Русский, Bahasa Indonesia, Tieng Viet, Thai

Bugünden yalnızca bir parça bırakın.`,
);

// ── 길이 검사 — 한도를 넘으면 소리 내어 죽는다 ────────────────────────────────
const LIMITS = { title: 30, short: 80, long: 4000 };
let bad = 0;
for (const [lang, v] of Object.entries(L)) {
  const row = [];
  for (const [k, max] of Object.entries(LIMITS)) {
    const n = v[k].length;
    const over = n > max;
    if (over) bad += 1;
    row.push(`${k} ${String(n).padStart(4)}/${max}${over ? ' 🔴' : ''}`);
  }
  console.log(lang.padEnd(7), row.join(' | '));
}
writeFileSync(new URL('./listing.json', import.meta.url), JSON.stringify(L, null, 2) + '\n');
console.log(`\n언어 ${Object.keys(L).length}개 · listing.json 기록`);
if (bad > 0) {
  console.error(`\n🔴 한도 초과 ${bad}건`);
  process.exit(1);
}
