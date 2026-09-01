import type { LegalDoc } from '@/features/legal/legal-text';

/**
 * Chính sách quyền riêng tư — tiếng Việt.
 *
 * 🔴 **Bản tiếng Hàn có hiệu lực ưu tiên.** Đây là bản dịch để dễ đọc; nếu có khác biệt,
 *   `legal-text.ts` (tiếng Hàn) được áp dụng.
 * ⚠ **Cấu trúc phải khớp chính xác với bản tiếng Hàn** — cùng số mục và số dòng trong mỗi mục.
 *   `npm run check:legal` sẽ kiểm tra.
 */
export const PRIVACY_VI: LegalDoc = {
  title: 'Chính sách quyền riêng tư của Jogak',
  sourceFingerprint: '4a69870e',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Vivace Games Studio (“nhà vận hành”) tuân thủ Luật Bảo vệ thông tin cá nhân và các quy định liên quan, đồng thời xử lý dữ liệu cá nhân của người dùng “Jogak” (“dịch vụ”) như trình bày dưới đây. Về nguyên tắc, Jogak giữ các mảnh nhật ký bạn viết ngay trong thiết bị của bạn; nhật ký chỉ được truyền lên máy chủ trong phạm vi bản sao lưu do chính bạn bật và báo cáo tóm tắt bằng AI do chính bạn tạo. Ngoài ra, chúng tôi chỉ thu thập lượng thông tin tối thiểu.',
  sections: [
    {
      h: '1. Trước hết, xin nói rõ nhật ký của bạn được lưu ở đâu',
      body: [
        'Các mảnh nhật ký (tiêu đề, nội dung, danh sách, ảnh, thẻ và cảm xúc) được lưu trong bộ nhớ trong của thiết bị bạn và về cơ bản không ra khỏi thiết bị đó.',
        '⚠ Tuy nhiên có hai ngoại lệ, và cả hai chỉ xảy ra khi chính bạn lựa chọn. Không điều nào diễn ra tự động.',
        '• Khi bạn bật sao lưu — bản sao nhật ký đã được mã hoá trên thiết bị sẽ được lưu trên máy chủ của nhà vận hành. Nhà vận hành không thể đọc bản sao đó. Chi tiết ở mục 2(c).',
        '• Khi bạn tạo báo cáo tóm tắt bằng AI — nội dung nhật ký của kỳ đó đi qua máy chủ của nhà vận hành ở dạng không mã hoá rồi được gửi tới nhà cung cấp AI. Nhà vận hành không lưu nội dung đó. Chi tiết ở mục 2(e).',
        '⚠ Hai câu trên khác nhau. Với sao lưu, chúng tôi lưu nhưng không đọc được; với AI, chúng tôi đọc nhưng không lưu. Chúng tôi nói rõ điều này chứ không làm mờ đi.',
        'Trong mọi trường hợp, nhà vận hành không thu thập những thông tin sau và không truyền chúng ra khỏi thiết bị của bạn.',
        '• Mã PIN, hình mở khoá hoặc câu trả lời gợi ý dùng cho khoá ứng dụng — chỉ được lưu trong vùng lưu trữ an toàn của thiết bị ở dạng không thể khôi phục (mã băm); bản gốc không được lưu ở bất kỳ đâu.',
        '• Tên, ngày sinh, số điện thoại, địa chỉ, danh bạ, vị trí, hay bất kỳ bản ghi truy cập nào vào toàn bộ thư viện ảnh của bạn.',
        'Ảnh bạn chọn trong ứng dụng được sao chép vào thư mục riêng của ứng dụng trên thiết bị để có thể chèn vào một mảnh, và nếu bạn không bật sao lưu thì chúng không được truyền ra ngoài. Ảnh không bao giờ được gửi kèm trong báo cáo tóm tắt bằng AI.',
      ],
    },
    {
      h: '2. Dữ liệu cá nhân chúng tôi thu thập',
      body: [
        'a. Khi bạn dùng “Liên hệ” (cần đăng nhập)',
        '• Bắt buộc: địa chỉ email của tài khoản Google và mã định danh duy nhất của tài khoản mạng xã hội (“sub” của Google)',
        '  — Căn cứ pháp lý: Luật Bảo vệ thông tin cá nhân, Điều 15(1)4 (cần thiết để thực hiện biện pháp theo yêu cầu của người dùng, tức là trả lời câu hỏi của họ)',
        '  — Mục đích: xác định người gửi, gửi phản hồi và cho phép bạn xem lại lịch sử liên hệ của mình',
        '• Phân loại và nội dung liên hệ',
        '• Loại thiết bị (Android/iOS) và phiên bản ứng dụng — để hiểu sự cố xảy ra trong môi trường nào',
        '※ Đăng nhập cần cho “Liên hệ”, gói đăng ký, sao lưu và báo cáo AI; viết mảnh, khoá ứng dụng và các tính năng khác thì không cần.',
        '※ Khi bạn mở ứng dụng lần đầu, chúng tôi hỏi năm sinh của bạn. Nếu chưa đạt ngưỡng tuổi, cả tính năng đăng nhập lẫn việc thu thập mã định danh thiết bị ở điểm f dưới đây đều bị hạn chế; viết nhật ký, khóa ứng dụng và mọi tính năng khác vẫn dùng được đầy đủ.',
        '※ Ngưỡng tuổi là 16, 14 hoặc 13 tùy theo khu vực của bạn (14 tại Hàn Quốc); nếu không thể xác định, áp dụng ngưỡng cao nhất. Năm sinh bạn cung cấp chỉ dùng cho việc xác định này và không được lưu trữ hay truyền đi.',
        'b. Thông tin được thu thập tự động trong quá trình hiển thị quảng cáo',
        '• Mã quảng cáo (ID quảng cáo Android), thông tin thiết bị và mạng, bản ghi hiển thị và nhấp chuột',
        '• Những mục trên do Google (AdMob) thu thập; chi tiết và cách từ chối có ở mục 7.',
        'c. Khi bạn bật sao lưu (cần gói đăng ký)',
        '• Bản sao nhật ký đã mã hoá — ở dạng nhà vận hành không thể giải mã',
        '• Mã định danh bản sao lưu, thời điểm sao lưu, số thế hệ và dung lượng — những thông tin này không được mã hoá. Nhà vận hành có thể biết tài khoản nào đã sao lưu, vào lúc nào và dung lượng bao nhiêu.',
        '  — Căn cứ thu thập: sự đồng ý riêng của bạn (được lấy ở màn hình bật sao lưu)',
        '⚠ Nói cho chính xác: nhà vận hành lưu bản sao đó nhưng không thể đọc được. Khoá giải mã chỉ tồn tại trên thiết bị của bạn và trong mã khôi phục mà bạn giữ; nhà vận hành không có khoá đó.',
        '⚠ Nếu bạn mất mã khôi phục thì không có cách nào mở được bản sao lưu. Nhà vận hành cũng không thể mở giúp bạn.',
        'd. Khi bạn dùng gói đăng ký',
        '• Trạng thái đăng ký — khoá quyền lợi, thời điểm hết hạn, thời gian ân hạn khi thanh toán lỗi, có gia hạn hay không',
        '• Mã giao dịch do cửa hàng cấp, mã sản phẩm và phân biệt môi trường thanh toán (chính thức/thử nghiệm)',
        '• Bản ghi thay đổi trạng thái đăng ký do dịch vụ thanh toán gửi (mua, gia hạn, huỷ, hoàn tiền, v.v.) cùng nội dung gốc',
        '  — Căn cứ thu thập: Luật Bảo vệ thông tin cá nhân, Điều 15(1)4 (cần thiết để thực hiện biện pháp theo yêu cầu của người dùng, tức là cung cấp quyền lợi đăng ký đã yêu cầu)',
        '  — Mục đích: xác nhận quyền lợi đăng ký (bỏ quảng cáo, dùng sao lưu và báo cáo AI), xử lý thắc mắc thanh toán và hoàn tiền',
        '⚠ Thông tin thanh toán như số thẻ hay số tài khoản do Google Play xử lý và không được chuyển cho nhà vận hành. Nhà vận hành chỉ biết bạn đã thanh toán và gói đăng ký có hiệu lực đến khi nào.',
        'e. Khi bạn tạo báo cáo tóm tắt bằng AI (cần gói đăng ký)',
        '• Những gì đi qua máy chủ của nhà vận hành tới nhà cung cấp AI: tiêu đề, nội dung, cảm xúc và ngày viết của các mảnh trong kỳ bạn yêu cầu báo cáo',
        '• Những gì nhà vận hành lưu: bản tóm tắt do AI tạo ra, mã định danh tài khoản đã tạo báo cáo, kỳ, số lần và số token đã dùng',
        '⚠ Nói cho chính xác: nhà vận hành không lưu bản thân nội dung nhật ký. Tuy nhiên ① tại thời điểm tạo bản tóm tắt, nội dung đi qua máy chủ của nhà vận hành nên chúng tôi không thể nói rằng “nhà vận hành không thể xem”, và ② bản tóm tắt được tạo ra sẽ được lưu 90 ngày. Chúng tôi nói rõ điều này chứ không làm mờ đi.',
        '⚠ Bản tóm tắt được viết dựa trên nhật ký của bạn nên có thể chứa nội dung nhật ký.',
        '• Đồng ý riêng đối với thông tin nhạy cảm: nhật ký có thể chứa thông tin nhạy cảm như tình trạng sức khoẻ hoặc tâm lý theo Điều 23 Luật Bảo vệ thông tin cá nhân. Vì báo cáo tóm tắt bằng AI xử lý nội dung đó ở dạng không mã hoá, chúng tôi lấy sự đồng ý riêng cho việc xử lý thông tin nhạy cảm khi bạn dùng tính năng lần đầu. Sự đồng ý này tách biệt với đồng ý chuyển ra nước ngoài ở mục 6, và bạn có thể chọn riêng từng mục.',
        'Dù không đồng ý, bạn vẫn dùng được đầy đủ mọi tính năng ngoài báo cáo AI. Báo cáo chỉ được tạo khi chính bạn tạo và không bao giờ được tạo tự động.',
        'f. Khi bạn mở ứng dụng (dù có đăng nhập hay không)',
        '• Mã định danh thiết bị — một giá trị ngẫu nhiên được tạo trên thiết bị của bạn khi ứng dụng chạy lần đầu. Đây không phải số sê-ri thiết bị hay mã định danh quảng cáo, và sẽ biến mất khi bạn gỡ ứng dụng.',
        '  — Căn cứ thu thập: Điều 15(1)6 Luật Bảo vệ Thông tin Cá nhân (lợi ích chính đáng trong việc vận hành và cải thiện dịch vụ)',
        '  — Mục đích sử dụng: thống kê sử dụng dịch vụ (bao nhiêu người dùng ứng dụng trong bao nhiêu ngày)',
        '※ Giá trị này không cho biết bạn là ai và không được liên kết với nội dung nhật ký của bạn.',
        '※ Nếu bạn chưa đạt ngưỡng tuổi nêu trên, giá trị này không được tạo ra và cũng không được truyền đi.',
      ],
    },
    {
      h: '3. Mục đích xử lý',
      body: [
        '• Thống kê sử dụng dịch vụ: đếm bao nhiêu người dùng ứng dụng trong bao nhiêu ngày và dùng số liệu đó để vận hành, cải thiện dịch vụ',
        '• Tiếp nhận và xử lý liên hệ: kiểm tra nội dung bạn gửi, tìm và khắc phục lỗi',
        '• Xác định người gửi và phản hồi: chuyển phản hồi tới người đã liên hệ và cho phép bạn xem lại lịch sử của mình',
        '• Hiển thị quảng cáo: cung cấp quảng cáo cho người dùng bản miễn phí và đo lường hiệu quả',
        '• Sao lưu và khôi phục: khi bạn bật tính năng này, lưu giữ bản sao nhật ký đã mã hoá và trả lại cho bạn theo yêu cầu',
        '• Xác nhận quyền lợi đăng ký: cung cấp việc bỏ quảng cáo, sao lưu và báo cáo AI cho người đã thanh toán, đồng thời xử lý thắc mắc thanh toán và hoàn tiền',
        '• Tạo báo cáo tóm tắt bằng AI và cải thiện chất lượng: soạn bản tóm tắt cho kỳ bạn yêu cầu rồi kiểm tra kết quả để nâng cao chất lượng',
        'Nhà vận hành không dùng dữ liệu cá nhân cho mục đích khác ngoài những mục đích trên, và nếu mục đích thay đổi sẽ xin sự đồng ý trước.',
      ],
    },
    {
      h: '4. Thời hạn lưu giữ và sử dụng',
      body: [
        '• Thông tin tài khoản (email, “sub” của Google): cho đến khi bạn xoá tài khoản. Khi xoá, chúng tôi tiêu huỷ ngay hoặc chuyển sang dạng không thể truy vết.',
        '• Nội dung liên hệ: 3 năm kể từ ngày tiếp nhận (Luật Bảo vệ người tiêu dùng trong thương mại điện tử — hồ sơ về khiếu nại hoặc giải quyết tranh chấp)',
        '• Dữ liệu hành vi dựa trên mã quảng cáo: tối đa 1 năm kể từ khi thu thập',
        '• Mã định danh thiết bị và bản ghi ngày sử dụng: 400 ngày kể từ ngày sử dụng cuối cùng. Sau đó sẽ tự động bị xóa.',
        '• Bản sao lưu đã mã hoá: được lưu trong thời gian bạn bật sao lưu và tối đa 90 ngày sau khi gói đăng ký kết thúc, sau đó tự động tiêu huỷ. Nếu bạn tắt sao lưu, yêu cầu xoá hoặc xoá tài khoản, chúng tôi tiêu huỷ ngay mà không chờ đủ 90 ngày. Bản sao lưu không được truy cập từ 3 năm trở lên sẽ bị tiêu huỷ (áp dụng cho trường hợp chỉ gỡ ứng dụng mà không xoá tài khoản).',
        '• Bản ghi về việc tiêu huỷ bản sao lưu (mã bản sao lưu và thời điểm tiêu huỷ): 1 năm — để bạn có thể biết “vì sao không khôi phục được”; mã định danh tài khoản không được lưu kèm.',
        '• Bản tóm tắt do AI tạo ra: 90 ngày kể từ ngày tạo. Sau đó tự động bị xoá.',
        '• Bản ghi sử dụng báo cáo (mã định danh tài khoản, kỳ, số lần, số token): đến khi đạt được mục đích xử lý hoặc đến khi bạn xoá tài khoản',
        '• Hồ sơ về hợp đồng hoặc rút lại đề nghị, về thanh toán và cung ứng hàng hoá: 5 năm (Luật Bảo vệ người tiêu dùng trong thương mại điện tử, Điều 6)',
        'Khi bạn xoá tài khoản, mã định danh tài khoản (email và “sub” của Google) được chuyển ngay sang dạng không thể truy vết, còn các hồ sơ giao dịch trên được lưu tách biệt ở dạng không truy vết được người tạo trong thời hạn nêu trên rồi mới tiêu huỷ.',
        '⚠ Xoá tài khoản không tự động huỷ gói đăng ký trên Google Play. Bạn phải tự huỷ tại Google Play > Gói đăng ký; nếu không, bạn vẫn tiếp tục bị tính phí.',
        '⚠ Thông báo về việc xoá bản sao lưu sau khi gói đăng ký hết hạn chỉ đến với bạn trên màn hình khi bạn mở ứng dụng. Nếu bạn không mở, thông báo này có thể không đến được.',
        'Khi hết thời hạn hoặc đạt được mục đích, chúng tôi tiêu huỷ dữ liệu ngay lập tức.',
      ],
    },
    {
      h: '5. Cung cấp cho bên thứ ba',
      body: [
        'Nhà vận hành không cung cấp dữ liệu cá nhân của người dùng cho bên thứ ba.',
        'Các doanh nghiệp nêu ở mục 6 là bên nhận uỷ thác xử lý thông tin thay cho nhà vận hành và không sử dụng thông tin đó cho mục đích riêng của họ. Nhà cung cấp AI không dùng nội dung nhật ký nhận được để huấn luyện mô hình.',
        'Ngoại lệ áp dụng khi pháp luật có quy định riêng hoặc khi cơ quan điều tra yêu cầu theo trình tự và hình thức luật định.',
      ],
    },
    {
      h: '6. Uỷ thác xử lý và chuyển ra nước ngoài',
      body: [
        'Để cung cấp dịch vụ, nhà vận hành uỷ thác việc xử lý như sau, và một phần diễn ra ngoài Hàn Quốc.',
        '• Google LLC — Quốc gia: Hoa Kỳ. Liên hệ: https://support.google.com/policies/contact/general_privacy_form. Mục đích: hiển thị và đo lường quảng cáo (AdMob), đăng nhập bằng tài khoản Google, xử lý và xác minh thanh toán gói đăng ký. Dữ liệu: mã quảng cáo, thông tin thiết bị và mạng, email cùng mã định danh tài khoản khi đăng nhập, thông tin giao dịch của cửa hàng. Khi nào và bằng cách nào: truyền qua mạng khi yêu cầu quảng cáo, khi đăng nhập và khi thanh toán. Lưu giữ: theo chính sách quyền riêng tư của Google',
        '• Supabase Inc. — Quốc gia: Hoa Kỳ (nơi đặt pháp nhân). Liên hệ: privacy@supabase.com. Mục đích: lưu thông tin liên hệ và tài khoản trong cơ sở dữ liệu, lưu bản sao lưu đã mã hoá và trạng thái đăng ký. Dữ liệu: thông tin ở mục 2(a), 2(c) và 2(d). Khi nào và bằng cách nào: truyền qua mạng khi bạn gửi liên hệ và khi sao lưu. Lưu giữ: đến hết thời hạn ở mục 4. ※ Vị trí lưu trữ vật lý là Hàn Quốc (vùng Seoul), nhưng chúng tôi công bố là chuyển ra nước ngoài vì pháp nhân vận hành đặt ngoài Hàn Quốc.',
        '• Vercel Inc. — Quốc gia: Hoa Kỳ. Liên hệ: privacy@vercel.com. Mục đích: vận hành máy chủ tiếp nhận liên hệ cùng máy chủ sao lưu và AI. Dữ liệu: thông tin ở mục 2(a). Khi nào và bằng cách nào: truyền qua mạng khi bạn gửi liên hệ. Lưu giữ: cho đến khi hợp đồng uỷ thác kết thúc. ※ Bản sao lưu đã mã hoá được gửi thẳng tới kho lưu trữ mà không đi qua máy chủ này.',
        '• RevenueCat, Inc. — Quốc gia: Hoa Kỳ. Liên hệ: compliance@revenuecat.com. Mục đích: xác minh thanh toán đăng ký và kiểm tra trạng thái đăng ký. Dữ liệu: mã định danh tài khoản, mã giao dịch và mã sản phẩm của cửa hàng, thông tin thiết bị và ứng dụng. Khi nào và bằng cách nào: truyền qua mạng khi mở màn hình đăng ký và khi thanh toán. Lưu giữ: cho đến khi hợp đồng uỷ thác kết thúc',
        '• OpenAI OpCo, LLC — Quốc gia: Hoa Kỳ (1455 Third Street, San Francisco, California 94158, USA). Liên hệ: dpo@openai.com. Mục đích: tạo báo cáo tóm tắt. Dữ liệu: tiêu đề, nội dung, cảm xúc và ngày viết của các mảnh trong kỳ bạn yêu cầu báo cáo. Khi nào và bằng cách nào: truyền qua mạng vào lúc bạn nhấn nút tạo báo cáo. Lưu giữ: máy chủ của nhà vận hành không lưu nội dung nhật ký — nội dung chỉ nằm trong bộ nhớ trong lúc bản tóm tắt đang được tạo rồi bị huỷ ngay. Nhà cung cấp AI lưu tối đa 30 ngày nhằm giám sát lạm dụng rồi xoá, và ngay cả trong thời gian đó cũng không dùng để huấn luyện mô hình.',
        '⚠ Việc chuyển ra nước ngoài phục vụ báo cáo AI là một sự đồng ý riêng. Khi bạn dùng tính năng lần đầu, chúng tôi hiển thị nội dung như trên ngay trong ứng dụng rồi xin sự đồng ý của bạn; sự đồng ý này tách biệt với đồng ý về thông tin nhạy cảm ở mục 2(e).',
        'Bạn có thể từ chối việc chuyển dữ liệu ra nước ngoài. Để từ chối phần liên quan đến quảng cáo, hãy tắt quảng cáo cá nhân hoá theo mục 7; phần liên quan đến liên hệ sẽ không phát sinh nếu bạn không dùng tính năng “Liên hệ”. Nếu bạn không bật sao lưu, không đăng ký và không tạo báo cáo thì những lần chuyển liên quan sẽ không xảy ra, và mọi tính năng khác kể cả viết mảnh vẫn dùng được bình thường.',
      ],
    },
    {
      h: '7. Mã quảng cáo và các phương tiện thu thập tự động khác, cùng cách từ chối',
      body: [
        'Dịch vụ dùng Google AdMob để hiển thị quảng cáo cho người dùng bản miễn phí. AdMob có thể thu thập và sử dụng mã quảng cáo nhằm cung cấp quảng cáo cá nhân hoá.',
        'Mục đích thu thập: cung cấp quảng cáo cá nhân hoá, đo lường hiệu quả quảng cáo, ngăn nhấp chuột gian lận',
        'Cách từ chối (Android): Cài đặt > Quyền riêng tư > Quảng cáo > “Xoá ID quảng cáo” hoặc “Tắt cá nhân hoá quảng cáo”',
        'Cách từ chối (iOS): Cài đặt > Quyền riêng tư & Bảo mật > Theo dõi > tắt “Cho phép Ứng dụng Yêu cầu Theo dõi”',
        'Dù bạn từ chối, quảng cáo vẫn có thể tiếp tục hiển thị, nhưng là quảng cáo chung không dựa trên sở thích của bạn.',
        'Nếu bạn đăng ký gói trả phí thì quảng cáo không hiển thị nữa, và việc thu thập liên quan đến quảng cáo nêu trên cũng không phát sinh.',
        'Tìm hiểu thêm về cách Google xử lý dữ liệu cá nhân cho quảng cáo: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Trình tự và cách thức tiêu huỷ',
      body: [
        'Trình tự: dữ liệu cá nhân đã hết thời hạn hoặc đã đạt mục đích sẽ bị tiêu huỷ ngay. Nếu pháp luật yêu cầu lưu giữ, dữ liệu được lưu tách biệt với dữ liệu khác trong thời hạn đó rồi mới tiêu huỷ.',
        'Cách thức: thông tin dạng tệp điện tử được xoá vĩnh viễn bằng biện pháp kỹ thuật khiến không thể khôi phục hay tái tạo.',
        'Các mảnh, ảnh và thông tin khoá được lưu trên thiết bị của bạn sẽ bị gỡ khỏi thiết bị khi bạn dùng tính năng “Đặt lại toàn bộ” trong ứng dụng hoặc gỡ cài đặt ứng dụng.',
        'Nếu bạn đã bật sao lưu, bản sao đã mã hoá lưu trên máy chủ sẽ bị tiêu huỷ khi bạn xoá nó ở màn hình sao lưu trong ứng dụng hoặc khi bạn xoá tài khoản. Khi xoá tài khoản, chúng tôi tiêu huỷ bản sao lưu trước rồi mới xoá tài khoản — vì nếu tài khoản biến mất trước thì không còn ai có quyền xoá bản sao lưu đó nữa.',
        'Nếu bạn không bật sao lưu, nhà vận hành không nắm giữ các mảnh trên thiết bị của bạn nên không thể xoá giúp bạn.',
      ],
    },
    {
      h: '9. Quyền của chủ thể dữ liệu và người đại diện hợp pháp, cùng cách thực hiện',
      body: [
        'Bạn có thể thực hiện các quyền sau bất cứ lúc nào.',
        '• Yêu cầu truy cập dữ liệu của mình • Yêu cầu chỉnh sửa khi có sai sót • Yêu cầu xoá • Yêu cầu ngừng xử lý • Yêu cầu chuyển dữ liệu của mình (Luật Bảo vệ thông tin cá nhân, Điều 35-2)',
        'Bạn có thể thực hiện bằng văn bản hoặc email theo thông tin liên hệ ở mục 11, và nhà vận hành sẽ xử lý ngay.',
        'Nếu bạn yêu cầu chỉnh sửa một sai sót trong dữ liệu, chúng tôi sẽ không sử dụng hay cung cấp dữ liệu đó cho đến khi việc chỉnh sửa hoàn tất.',
        '⚠ Giới hạn của quyền truy cập đối với bản sao lưu: nếu bạn yêu cầu truy cập bản sao lưu, thứ nhà vận hành có thể cung cấp chỉ là bản mã hoá không thể giải mã cùng siêu dữ liệu ở mục 2(c). Chúng tôi không thể cung cấp nội dung nhật ký ở dạng con người đọc được — nhà vận hành không có khoá. Chính bạn có thể khôi phục bất cứ lúc nào trong ứng dụng bằng mã khôi phục của mình.',
        'Bạn có thể xoá báo cáo AI đã tạo bất cứ lúc nào trong ứng dụng. Khi xoá trong ứng dụng, báo cáo biến mất khỏi thiết bị, còn bản tóm tắt lưu trên máy chủ sẽ tự động xoá sau 90 ngày. Nếu muốn xoá sớm hơn, bạn có thể yêu cầu qua mục “Liên hệ”.',
        '⚠ Bản tóm tắt do AI tạo ra có thể khác với sự thật và không phải là chẩn đoán hay lời khuyên y tế, tâm lý. Ứng dụng cung cấp cách báo cáo một bản tóm tắt.',
        'Người đại diện hợp pháp của trẻ dưới 14 tuổi có thể thực hiện các quyền trên thay cho trẻ.',
      ],
    },
    {
      h: '10. Biện pháp bảo đảm an toàn',
      body: [
        '• Về quản lý: giảm tối đa số người tiếp xúc với dữ liệu cá nhân và đào tạo họ định kỳ',
        '• Về kỹ thuật: quản lý quyền truy cập hệ thống xử lý, mã hoá khi truyền (HTTPS), lưu bí mật khoá ứng dụng dưới dạng mã băm và dùng vùng lưu trữ an toàn của thiết bị (Keystore/Keychain)',
        '• Mã hoá đầu cuối cho bản sao lưu: bản sao lưu được mã hoá ngay trên thiết bị của bạn rồi mới truyền đi, và khoá giải mã chỉ tồn tại trên thiết bị đó cùng trong mã khôi phục của bạn. Máy chủ của nhà vận hành không có khoá này.',
        '• Về vật lý: máy chủ chứa dữ liệu cá nhân đặt tại trung tâm dữ liệu của các nhà cung cấp đám mây trong và ngoài nước, tuân theo chính sách kiểm soát ra vào của họ.',
        '⚠ Tính năng khoá ứng dụng chỉ chặn truy cập vào màn hình; nó không mã hoá bản thân tệp nhật ký lưu trên thiết bị. Nếu thiết bị bị mất hoặc bị lấy và bảo mật của chính thiết bị bị vô hiệu hoá, nội dung các mảnh có thể bị lộ.',
      ],
    },
    {
      h: '11. Người phụ trách bảo vệ dữ liệu và bộ phận tiếp nhận yêu cầu truy cập',
      body: [
        'Nhà vận hành chịu trách nhiệm chung về công việc xử lý dữ liệu cá nhân và chỉ định người phụ trách sau để giải quyết khiếu nại và yêu cầu khắc phục của người dùng.',
        '• Người phụ trách bảo vệ dữ liệu: Son Hwi-seong (chức vụ: người đại diện)',
        '• Liên hệ: support@vivace-games.com',
        '• Bộ phận tiếp nhận và xử lý yêu cầu truy cập: như trên',
        'Bạn có thể gửi tới người phụ trách mọi câu hỏi, khiếu nại hay yêu cầu khắc phục liên quan đến bảo vệ dữ liệu phát sinh khi dùng dịch vụ. Nhà vận hành sẽ trả lời và xử lý ngay.',
      ],
    },
    {
      h: '12. Cách yêu cầu khắc phục khi quyền lợi bị xâm phạm',
      body: [
        'Để được khắc phục khi dữ liệu cá nhân bị xâm phạm, bạn có thể đề nghị các cơ quan Hàn Quốc sau giải quyết tranh chấp hoặc tư vấn.',
        '• Uỷ ban Hoà giải tranh chấp thông tin cá nhân: 1833-6972 (từ Hàn Quốc) / www.kopico.go.kr',
        '• Trung tâm Tiếp nhận tố giác xâm phạm quyền riêng tư: 118 (từ Hàn Quốc) / privacy.kisa.or.kr',
        '• Viện Kiểm sát tối cao, Ban Điều tra mạng: 1301 (từ Hàn Quốc) / www.spo.go.kr',
        '• Cơ quan Cảnh sát quốc gia, Cục Điều tra mạng: 182 (từ Hàn Quốc) / ecrm.police.go.kr',
        'Ngoài ra, người bị xâm phạm quyền hoặc lợi ích do quyết định hoặc sự không hành động của người đứng đầu cơ quan công quyền đối với yêu cầu theo Điều 35 (truy cập), Điều 36 (chỉnh sửa và xoá) hoặc Điều 37 (ngừng xử lý) của Luật Bảo vệ thông tin cá nhân có thể khiếu nại hành chính theo Luật Khiếu nại hành chính.',
      ],
    },
    {
      h: '13. Thay đổi chính sách quyền riêng tư này',
      body: [
        'Chính sách này áp dụng kể từ ngày có hiệu lực.',
        'Khi có nội dung được bổ sung, xóa bỏ hoặc sửa đổi do thay đổi của pháp luật, chính sách hoặc công nghệ bảo mật, chúng tôi sẽ thông báo không chậm trễ về nội dung thay đổi và ngày có hiệu lực qua thông báo trong ứng dụng và tài liệu này.',
        'Lịch sử sửa đổi',
        '• 2026-08-09 ban hành lần đầu',
        '• 2026-08-11 đăng thông báo sửa đổi sắp áp dụng — dự kiến bổ sung gói đăng ký hằng tháng và sao lưu/khôi phục (nội dung chính chưa thay đổi)',
        '• 2026-08-12 đăng thông báo sửa đổi sắp áp dụng — dự kiến bổ sung tính năng báo cáo tóm tắt bằng AI (nội dung chính chưa thay đổi)',
        '• 2026-08-23 sửa đổi — hai thông báo trên đã được đưa vào nội dung chính. Việc xử lý liên quan đến gói đăng ký hằng tháng, sao lưu/khôi phục và báo cáo tóm tắt bằng AI được bổ sung vào các mục 1, 2, 3, 4, 6, 8, 9 và 10.',
        '• 2026-09-01 sửa đổi — đã bổ sung vào mục 2, 3 và 4 việc thu thập mã định danh thiết bị phục vụ thống kê sử dụng dịch vụ (đếm người dùng hoạt động), và mở rộng thông báo xác minh độ tuổi tại mục 2.',
      ],
    },
  ],
};

/**
 * Hướng dẫn xoá tài khoản — tiếng Việt.
 *
 * 🔴 **Bản tiếng Hàn có hiệu lực ưu tiên** (`legal-text.ts`). Cùng quy tắc với chính sách
 *   quyền riêng tư.
 *
 * ⚠ Tài liệu này có URL công khai riêng vì biểu mẫu An toàn dữ liệu của Google Play yêu cầu
 *   một lối xoá tài khoản trên **web**: người đã gỡ ứng dụng vẫn phải có cách để yêu cầu.
 *   Đó chính là URL mà người thẩm định của Play mở ra, nên nó không thể chỉ có tiếng Hàn.
 *
 * ⚠ Cấu trúc phải khớp chính xác với bản tiếng Hàn — 6 mục (6/4/9/5/4/3 dòng) và không có phần
 *   sửa đổi sắp áp dụng. `npm run check:legal` sẽ kiểm tra.
 */
export const DELETE_ACCOUNT_VI: LegalDoc = {
  title: 'Jogak — Cách xoá tài khoản của bạn',
  sourceFingerprint: 'a8b0c8b9',
  effective: '2026-08-23',
  updated: '2026-08-23',
  intro:
    'Trang này hướng dẫn cách xoá tài khoản của ứng dụng Jogak và dữ liệu liên quan. Ngay cả khi bạn đã gỡ ứng dụng hoặc không thể đăng nhập, bạn vẫn có thể yêu cầu qua email.',
  sections: [
    {
      h: '1. Tự xoá trong ứng dụng',
      body: [
        'Nếu bạn làm theo các bước sau trong ứng dụng Jogak, yêu cầu sẽ được xử lý ngay lập tức.',
        '① Mở ứng dụng → thẻ [Cài đặt] ở dưới cùng',
        '② Chọn [Liên hệ]',
        '③ Nếu bạn chưa đăng nhập, hãy đăng nhập bằng tài khoản Google',
        '④ Chọn [Xoá tài khoản] ở dưới cùng màn hình rồi xác nhận',
        'Việc xoá tài khoản không thể hoàn tác.',
      ],
    },
    {
      h: '2. Yêu cầu qua email (khi bạn đã gỡ ứng dụng hoặc không thể đăng nhập)',
      body: [
        'Xin gửi nội dung sau tới support@vivace-games.com.',
        '• Tiêu đề: Yêu cầu xoá tài khoản Jogak',
        '• Nội dung: địa chỉ email của tài khoản Google mà bạn đã dùng để đăng nhập Jogak',
        'Để xác minh danh tính, địa chỉ bạn gửi đi phải trùng với địa chỉ bạn đã dùng khi đăng ký. Sau khi tiếp nhận, chúng tôi sẽ xử lý và hồi âm trong vòng 7 ngày làm việc.',
      ],
    },
    {
      h: '3. Dữ liệu bị xoá',
      body: [
        'Khi bạn xoá tài khoản, những thông tin sau bị tiêu huỷ ngay hoặc được chuyển sang dạng không thể truy vết.',
        '• Mã định danh duy nhất của tài khoản mạng xã hội (“sub” của Google)',
        '• Địa chỉ email',
        '• Mối liên kết giữa lịch sử liên hệ và tài khoản của người gửi',
        '• Bản sao nhật ký đã mã hoá lưu trên máy chủ (nếu bạn đã bật sao lưu) — bị xoá cùng lúc mà không chờ hết 90 ngày ân hạn.',
        '• Mã định danh bản sao lưu và các bản ghi sao lưu (thời điểm, dung lượng, số thế hệ)',
        '• Bản tóm tắt báo cáo AI đang lưu trên máy chủ (tối đa 90 ngày) và bản ghi sử dụng báo cáo (kỳ, số lần, số token)',
        '⚠ Khi bạn xoá tài khoản, chúng tôi tiêu huỷ bản sao lưu trước rồi mới xoá tài khoản — vì nếu tài khoản biến mất trước thì không còn ai có quyền xoá bản sao lưu đó nữa. Nếu việc xoá bản sao lưu thất bại, việc xoá tài khoản sẽ không được tiến hành; xin bạn thử lại sau ít phút.',
        '⚠ Đã xoá thì không thể hoàn tác. Dù bạn còn giữ mã khôi phục, bạn cũng không thể khôi phục bản sao lưu trên máy chủ được nữa.',
      ],
    },
    {
      h: '4. Dữ liệu được lưu giữ và thời hạn',
      body: [
        'Những thông tin sau được lưu giữ theo quy định của pháp luật, và ngay trong thời hạn đó cũng chỉ tồn tại ở dạng không thể truy vết ra người tạo (giả danh hoá).',
        '• Nội dung liên hệ: 3 năm (Luật Bảo vệ người tiêu dùng trong thương mại điện tử — hồ sơ về khiếu nại hoặc giải quyết tranh chấp của người tiêu dùng)',
        '• Hồ sơ giao dịch gói đăng ký (mã giao dịch, sản phẩm, kỳ hạn đăng ký, lịch sử thay đổi trạng thái thanh toán): 5 năm (Luật Bảo vệ người tiêu dùng trong thương mại điện tử, Điều 6)',
        '• Bản ghi về việc tiêu huỷ bản sao lưu (mã bản sao lưu và thời điểm tiêu huỷ): 1 năm — để bạn có thể biết “vì sao không khôi phục được”; mã định danh tài khoản không được lưu kèm.',
        'Khi hết thời hạn lưu giữ, chúng tôi tiêu huỷ ngay lập tức.',
      ],
    },
    {
      h: '5. Những gì còn lại trên thiết bị — xoá tài khoản không xoá được chúng',
      body: [
        'Các mảnh nhật ký của Jogak (tiêu đề, nội dung, ảnh, thẻ, cảm xúc) và nội dung báo cáo AI được lưu bên trong thiết bị của bạn.',
        'Vì vậy, dù bạn xoá tài khoản thì các mảnh và báo cáo trên thiết bị vẫn còn nguyên. Nếu muốn xoá cả trên thiết bị, hãy gỡ cài đặt ứng dụng hoặc thực hiện đặt lại trong [Cài đặt] của ứng dụng.',
        'Ngược lại, nếu bạn gỡ cài đặt ứng dụng thì các mảnh trên thiết bị không thể khôi phục được. Chỉ khi bạn đã bật sao lưu và còn giữ mã khôi phục, và chỉ khi bạn chưa xoá tài khoản, bạn mới có thể lấy lại chúng.',
        '⚠ Nếu bạn không bật sao lưu, nhà vận hành không nắm giữ các mảnh trên thiết bị của bạn nên không thể xoá giúp bạn, cũng không thể trả lại cho bạn.',
      ],
    },
    {
      h: '6. Bạn phải tự huỷ gói đăng ký',
      body: [
        'Xoá tài khoản không tự động huỷ gói đăng ký trên Google Play, và nếu bạn không huỷ thì vẫn tiếp tục bị tính phí.',
        'Cách huỷ: ứng dụng Google Play Store > hồ sơ > Thanh toán và gói đăng ký > Gói đăng ký (https://play.google.com/store/account/subscriptions)',
        'Việc hoàn tiền cho khoản đã thanh toán tuân theo chính sách hoàn tiền của Google Play và chính sách hoàn tiền của nhà vận hành. Bạn có thể liên hệ theo địa chỉ nêu ở trên.',
      ],
    },
  ],
};

/**
 * Điều khoản sử dụng — tiếng Việt.
 *
 * 🔴 **Bản tiếng Hàn có hiệu lực ưu tiên** (`legal-text.ts`). Đây là bản dịch để dễ đọc; nếu hai
 *   bản khác nhau, bản tiếng Hàn được áp dụng. Điều 22 đã nói rõ điều đó ngay trong tài liệu,
 *   và chính điều đó khiến việc công bố bản dịch này là an toàn.
 *
 * ⚠ **Cấu trúc phải khớp chính xác với bản tiếng Hàn** — 22 điều, cùng số dòng trong mỗi điều,
 *   và không có `pending`. `npm run check:legal` sẽ kiểm tra. Tách một câu tiếng Hàn thành hai
 *   câu tiếng Việt sẽ khiến kiểm tra thất bại, còn gộp hai câu lại sẽ giấu mất một khoản bị rơi.
 *
 * ⚠ Tài liệu này tồn tại là vì **Điều 13(2) Luật Bảo vệ người tiêu dùng trong thương mại điện
 *   tử** — thông tin *trước* khi giao kết cộng với văn bản về nội dung hợp đồng *sau* khi giao
 *   kết. Các khoản 5 (rút lại đề nghị), 6 (hoàn tiền), 8 (khiếu nại và tranh chấp) và 9 (bản
 *   điều khoản cùng cách kiểm tra nó) không có chỗ nào khác để đặt. Mỗi điều là chiếc bình chứa
 *   một khoản cụ thể, nên **một điều không được đánh mất nội dung pháp lý của nó chỉ để đọc cho
 *   trôi chảy hơn.** Ba điều nặng nhất:
 *
 *   - Điều 12 nhắc lại về mặt nội dung Điều 17(2)5 và 17(6). “việc cung ứng nội dung số đã bắt
 *     đầu”, “phần chưa được cung ứng trong nội dung số được cung ứng thành nhiều lần” và “nêu rõ
 *     sự việc này **đồng thời** cung cấp ... làm sản phẩm dùng thử” là các điều kiện luật định —
 *     làm mờ chúng thì hạn chế trở nên vô hiệu.
 *   - Dòng đầu Điều 20 là tấm chắn trước Điều 35 (hợp đồng bất lợi cho người tiêu dùng).
 *     **Tuyệt đối không thêm “trong phạm vi tối đa pháp luật cho phép”** hay câu miễn trừ tương
 *     tự: điều đó lật ngược câu văn thành đúng thứ mà nó được viết ra để từ chối.
 *   - Điều 22 chính là Điều 36 (thẩm quyền riêng biệt) — địa chỉ của **người dùng**, không bao
 *     giờ là trụ sở của nhà vận hành. Ghi trụ sở của nhà vận hành sẽ vô hiệu theo Điều 35.
 *
 * ⚠ “청약철회” được dịch là **“rút lại đề nghị”**, không phải “huỷ gói đăng ký”. Jogak Pro đúng là
 *   một gói đăng ký, và Điều 14 mới là việc huỷ nó — hai khái niệm không được trùng nhau trong
 *   cùng một tài liệu.
 */
export const TERMS_VI: LegalDoc = {
  title: 'Điều khoản sử dụng Jogak',
  sourceFingerprint: 'd18f02f7',
  effective: '2026-08-17',
  updated: '2026-08-17',
  intro:
    'Bản điều khoản này quy định quyền, nghĩa vụ và trách nhiệm giữa Hwiseong Games (tên thương hiệu Vivace Games Studio, sau đây gọi là “nhà vận hành”) và người dùng, liên quan đến việc sử dụng ứng dụng di động “Jogak” (sau đây gọi là “dịch vụ”) do nhà vận hành cung cấp. Xin bạn đọc trước khi sử dụng dịch vụ.',
  sections: [
    {
      h: 'Điều 1 (Mục đích và phạm vi áp dụng)',
      body: [
        'Bản điều khoản này nhằm quy định điều kiện, thủ tục sử dụng dịch vụ cùng quyền và nghĩa vụ của nhà vận hành và người dùng.',
        'Bản điều khoản này áp dụng cho mọi người dùng dịch vụ. Trường hợp bạn chỉ viết mảnh nhật ký mà không đăng nhập cũng như vậy.',
        'Những vấn đề không được quy định trong bản điều khoản này sẽ theo pháp luật có liên quan như Luật Bảo vệ người tiêu dùng trong thương mại điện tử, Luật Điều chỉnh điều khoản giao dịch chung, Luật Xúc tiến ngành công nghiệp nội dung, và theo tập quán thương mại.',
      ],
    },
    {
      h: 'Điều 2 (Thông tin nhà vận hành)',
      body: [
        'Tên doanh nghiệp: Hwiseong Games (tên thương hiệu Vivace Games Studio)',
        // ⚠ Đây là cách viết mà `PRIVACY_VI` mục 11 đang dùng. Hai tài liệu không được gọi cùng một người theo hai cách
        'Người đại diện: Son Hwi-seong',
        'Địa chỉ trụ sở kinh doanh: 204, 2F, 22 Seongan 5-gil, Jung-gu, Ulsan, 44421, Republic of Korea',
        'Số điện thoại: +82 10-9926-0925',
        'Địa chỉ thư điện tử: support@vivace-games.com',
        'Mã số đăng ký kinh doanh: 749-25-02260',
        'Số đăng ký kinh doanh bán hàng qua phương tiện điện tử: 2026-Ulsan Jung-gu-0170 (cơ quan tiếp nhận đăng ký: Quận Jung, Thành phố Ulsan)',
      ],
    },
    {
      h: 'Điều 3 (Định nghĩa thuật ngữ)',
      body: [
        '“Mảnh” (“jogak”) là một bản ghi nhật ký mà người dùng viết trong dịch vụ.',
        '“Thiết bị” là điện thoại thông minh hoặc thiết bị đầu cuối khác mà người dùng cài đặt và sử dụng dịch vụ.',
        '“Jogak Pro” là sản phẩm thanh toán định kỳ có phí, cung cấp việc bỏ quảng cáo, sao lưu và khôi phục, cùng báo cáo tóm tắt bằng AI.',
        '“Chợ ứng dụng” là nền tảng phân phối ứng dụng như Google Play, nơi dịch vụ được phát hành và việc thanh toán sản phẩm có phí được thực hiện.',
      ],
    },
    {
      h: 'Điều 4 (Đăng tải và sửa đổi điều khoản)',
      body: [
        'Nhà vận hành đăng bản điều khoản này trên màn hình [Cài đặt] trong dịch vụ và tại địa chỉ dưới đây, để người dùng có thể xem bất cứ lúc nào.',
        'https://sonwheesung.github.io/diary/terms.html',
        'Nhà vận hành có thể sửa đổi bản điều khoản này trong phạm vi không vi phạm pháp luật có liên quan.',
        'Khi sửa đổi bản điều khoản này, nhà vận hành nêu rõ ngày áp dụng và lý do sửa đổi, đồng thời thông báo trong dịch vụ từ 7 ngày trước ngày áp dụng. Tuy nhiên, với sửa đổi bất lợi cho người dùng, thông báo được đưa ra từ 30 ngày trước ngày áp dụng và trình bày nội dung trước và sau khi sửa đổi cạnh nhau theo cách dễ hiểu.',
        'Người dùng không đồng ý với điều khoản sửa đổi có thể huỷ dịch vụ có phí và ngừng sử dụng dịch vụ trước ngày áp dụng. Nếu bạn tiếp tục sử dụng dịch vụ sau ngày áp dụng đã thông báo, bạn được xem là đã đồng ý với điều khoản sửa đổi.',
      ],
    },
    {
      h: 'Điều 5 (Nội dung dịch vụ)',
      body: [
        'Tên dịch vụ mà nhà vận hành cung cấp là “Jogak”, thuộc loại ứng dụng di động (nội dung số) dùng để viết và lưu giữ nhật ký.',
        'Các tính năng cung cấp miễn phí: viết, sửa, xoá và tìm kiếm mảnh nhật ký, đính kèm ảnh, thẻ, ghi cảm xúc, xem lịch, khoá ứng dụng (mã PIN và hình mở khoá), chế độ tối, đa ngôn ngữ, xem thông báo và Liên hệ.',
        'Các tính năng cung cấp qua sản phẩm có phí “Jogak Pro”: bỏ quảng cáo, sao lưu và khôi phục có mã hoá, báo cáo tóm tắt bằng AI.',
        'Tiêu đề, nội dung, ảnh, thẻ và cảm xúc của các mảnh nhật ký người dùng viết chỉ được lưu bên trong thiết bị của người dùng, và không được truyền tới máy chủ của nhà vận hành trừ khi người dùng bật tính năng sao lưu.',
        'Nếu bật sao lưu, các mảnh nhật ký được mã hoá ngay trên thiết bị của người dùng rồi mới truyền đi, và nhà vận hành không giữ khoá giải mã nên không thể đọc được nội dung đó.',
        'Khi tạo báo cáo tóm tắt bằng AI, nội dung nhật ký của kỳ mà người dùng yêu cầu sẽ đi qua máy chủ của nhà vận hành và được chuyển tới nhà cung cấp trí tuệ nhân tạo. Nhà vận hành không lưu nội dung đó. Chi tiết theo chính sách quyền riêng tư.',
      ],
    },
    {
      h: 'Điều 6 (Giao kết hợp đồng và tài khoản)',
      body: [
        'Hợp đồng sử dụng dịch vụ được giao kết khi người dùng cài đặt dịch vụ, đồng ý với bản điều khoản này rồi sử dụng dịch vụ.',
        'Các tính năng miễn phí, kể cả viết mảnh nhật ký, có thể dùng mà không cần tài khoản.',
        'Liên hệ, thanh toán sản phẩm có phí, sao lưu và khôi phục, cùng báo cáo tóm tắt bằng AI đều cần đăng nhập bằng tài khoản Google.',
        'Người dùng có thể xoá tài khoản bất cứ lúc nào tại màn hình [Cài đặt] → [Liên hệ] trong dịch vụ. Cách xoá tài khoản cùng những thông tin bị xoá hoặc được lưu giữ theo Hướng dẫn xoá tài khoản.',
      ],
    },
    {
      h: 'Điều 7 (Giá sản phẩm có phí và việc thanh toán)',
      body: [
        'Phí của Jogak Pro là 3.900 won mỗi tháng và 29.000 won mỗi năm, cả hai đều đã bao gồm thuế giá trị gia tăng.',
        'Phí được tự động thu qua phương thức thanh toán của người dùng đã đăng ký tại chợ ứng dụng, vào thời điểm bắt đầu gói đăng ký và vào mỗi ngày gia hạn sau đó.',
        'Ngoài khoản phí trên, người dùng không phải chịu thêm chi phí nào. Tuy nhiên, cước dữ liệu cần thiết để sử dụng dịch vụ theo chính sách của nhà mạng mà bạn đã đăng ký và do bạn chi trả.',
        'Số tiền thực tế bị tính có thể khác với các mức trên tuỳ theo chính sách tỷ giá, phí hoặc chính sách giá theo quốc gia của chợ ứng dụng. Trong trường hợp đó, số tiền hiển thị trên màn hình thanh toán được ưu tiên.',
        'Nếu nhà vận hành tăng phí, việc thông báo trước được thực hiện theo Điều 4, và mức giá tăng không áp dụng cho kỳ đăng ký đã thanh toán.',
      ],
    },
    {
      h: 'Điều 8 (Hạn chế về điều kiện bán hàng)',
      body: [
        'Dịch vụ chỉ có thể sử dụng tại những quốc gia mà chợ ứng dụng cho phép phân phối, và việc cài đặt cũng như thanh toán chỉ thực hiện được tại những quốc gia mà nhà vận hành đã chọn để phân phối.',
        'Một gói đăng ký có phí chỉ gắn với một tài khoản tại cùng một thời điểm. Nếu bạn đăng nhập bằng tài khoản Google khác trên cùng thiết bị, gói đăng ký sẽ chuyển sang tài khoản đó và không dùng được ở tài khoản trước nữa.',
        'Nhà vận hành có thể đặt giới hạn số lần sử dụng trong phạm vi cần thiết để cung cấp một số tính năng của dịch vụ. Số lần tạo báo cáo tóm tắt bằng AI bị giới hạn theo từng kỳ, và nội dung giới hạn đó được hiển thị trên màn hình dịch vụ.',
      ],
    },
    {
      h: 'Điều 9 (Thời điểm và cách thức cung ứng)',
      body: [
        'Jogak Pro được áp dụng vào tài khoản của người dùng ngay khi thanh toán hoàn tất, và không có thủ tục giao hàng riêng.',
        'Nếu đã thanh toán xong mà quyền lợi chưa được áp dụng, người dùng có thể dùng [Khôi phục giao dịch mua] trên màn hình [Gói đăng ký] trong dịch vụ, hoặc liên hệ nhà vận hành theo cách nêu tại Điều 21.',
        'Kỳ đăng ký kéo dài từ ngày thanh toán đến ngày liền trước ngày gia hạn kế tiếp, và sẽ tự động gia hạn với độ dài kỳ như cũ nếu không được huỷ.',
      ],
    },
    {
      h: 'Điều 10 (Môi trường sử dụng)',
      body: [
        'Dịch vụ có thể dùng trên thiết bị Android, và yêu cầu phiên bản hệ điều hành từ mức ghi trên trang chi tiết của chợ ứng dụng trở lên.',
        'Các tính năng cơ bản như viết, xem và tìm kiếm mảnh nhật ký có thể dùng mà không cần kết nối internet.',
        'Xem thông báo, Liên hệ, đăng nhập, thanh toán, sao lưu và khôi phục, cùng báo cáo tóm tắt bằng AI đều cần kết nối internet.',
        'Nếu thiết bị của người dùng thiếu dung lượng lưu trữ hoặc hệ điều hành nằm ngoài phạm vi được hỗ trợ, một số tính năng có thể không hoạt động bình thường.',
      ],
    },
    {
      h: 'Điều 11 (Dùng thử miễn phí và chuyển sang trả phí)',
      body: [
        'Nhà vận hành cung cấp 7 ngày dùng thử miễn phí đối với Jogak Pro.',
        'Khi thời gian dùng thử miễn phí kết thúc, gói sẽ tự động chuyển sang thanh toán định kỳ có phí và khoản phí tại Điều 7 sẽ được tính.',
        'Trước khi việc chuyển đổi diễn ra, nhà vận hành hiển thị thời điểm chuyển đổi, mức giá trước và sau khi thay đổi cùng phương thức thanh toán, và xin sự đồng ý của người dùng; nếu người dùng không đồng ý thì việc thanh toán không được tiến hành.',
        'Nếu bạn không muốn bị tính phí trong thời gian dùng thử miễn phí, xin hãy huỷ gói đăng ký theo cách nêu tại Điều 14 trước khi thời gian dùng thử kết thúc. Dù bạn huỷ, bạn vẫn có thể tiếp tục dùng Jogak Pro cho đến hết thời gian dùng thử.',
      ],
    },
    {
      h: 'Điều 12 (Rút lại đề nghị)',
      body: [
        'Người dùng có thể rút lại đề nghị của mình trong vòng 7 ngày kể từ ngày thanh toán sản phẩm có phí, hoặc kể từ ngày nhận được văn bản về nội dung hợp đồng.',
        'Việc rút lại đề nghị được thực hiện bằng cách bày tỏ ý định đó tới kênh liên hệ tại Điều 21, và nhà vận hành thông báo kết quả xử lý trong vòng 3 ngày làm việc kể từ ngày tiếp nhận.',
        'Khi đề nghị đã được rút lại, nhà vận hành hoàn trả tiền theo Điều 13, và quyền dùng Jogak Pro của người dùng chấm dứt ngay lập tức.',
        'Tuy nhiên, theo Điều 17(2)5 Luật Bảo vệ người tiêu dùng trong thương mại điện tử, việc rút lại đề nghị bị hạn chế khi việc cung ứng nội dung số đã bắt đầu. Ngay cả trong trường hợp đó, người dùng vẫn có thể rút lại đề nghị đối với phần chưa được cung ứng trong nội dung số được cung ứng thành nhiều lần.',
        'Để áp dụng hạn chế nêu trên, theo khoản 6 của cùng điều luật, nhà vận hành nêu rõ sự việc này đồng thời cung cấp 7 ngày dùng thử miễn phí tại Điều 11 làm sản phẩm dùng thử. Nếu nhà vận hành không thực hiện các biện pháp đó, người dùng vẫn có thể rút lại đề nghị bất kể hạn chế nêu trên.',
        'Nhà vận hành không đòi tiền phạt vi phạm hay bồi thường thiệt hại với lý do người dùng rút lại đề nghị.',
      ],
    },
    {
      h: 'Điều 13 (Hoàn tiền)',
      body: [
        'Vì việc thanh toán sản phẩm có phí được thực hiện qua chợ ứng dụng nên về nguyên tắc việc hoàn tiền cũng được xử lý theo quy trình hoàn tiền của chợ ứng dụng.',
        'Người dùng có thể yêu cầu hoàn tiền trực tiếp với chợ ứng dụng, hoặc yêu cầu nhà vận hành qua kênh liên hệ tại Điều 21. Nếu yêu cầu được gửi tới nhà vận hành, nhà vận hành sẽ phối hợp với chợ ứng dụng để xử lý.',
        'Nhà vận hành hoàn trả tiền trong vòng 3 ngày làm việc kể từ ngày nhận được ý định rút lại đề nghị hoặc ý định tương tự. Thời gian tiền thực sự về tài khoản có thể lâu hơn tuỳ lịch xử lý của chợ ứng dụng.',
        'Nếu nhà vận hành chậm hoàn tiền quá thời hạn nêu trên mà không có lý do chính đáng, nhà vận hành còn trả thêm lãi chậm trả cho khoảng thời gian chậm đó, tính bằng cách nhân với mức lãi suất do Nghị định thi hành Luật Bảo vệ người tiêu dùng trong thương mại điện tử quy định.',
        'Nếu đã có khoảng thời gian sử dụng, nhà vận hành có thể khấu trừ số tiền tương ứng với khoảng thời gian đó rồi mới hoàn trả. Tuy nhiên, khoảng thời gian người dùng không sử dụng được dịch vụ do lỗi của nhà vận hành thì không bị khấu trừ.',
        'Không có khoản phí riêng nào khi hoàn tiền.',
      ],
    },
    {
      h: 'Điều 14 (Huỷ gói đăng ký)',
      body: [
        'Người dùng có thể huỷ gói đăng ký bất cứ lúc nào. Việc huỷ phải do chính người dùng thực hiện trên màn hình quản lý gói đăng ký của chợ ứng dụng; nhà vận hành không thể huỷ thay.',
        'Google Play: ứng dụng Store > hồ sơ > Thanh toán và gói đăng ký > Gói đăng ký (https://play.google.com/store/account/subscriptions)',
        'Dù bạn đã huỷ, bạn vẫn có thể tiếp tục dùng Jogak Pro cho đến hết kỳ đăng ký đã thanh toán, và sau kỳ đó việc tự động gia hạn sẽ dừng lại.',
        'Việc xoá tài khoản trong dịch vụ không huỷ gói đăng ký ở chợ ứng dụng. Nếu bạn không huỷ theo cách trên, tách biệt với việc xoá tài khoản, bạn sẽ vẫn tiếp tục bị tính phí.',
      ],
    },
    {
      h: 'Điều 15 (Hợp đồng của người chưa thành niên)',
      body: [
        'Nếu người chưa thành niên thanh toán sản phẩm có phí mà không có sự đồng ý của người đại diện hợp pháp, chính người chưa thành niên đó hoặc người đại diện hợp pháp có thể huỷ bỏ hợp đồng.',
        'Tuy nhiên, không thể huỷ bỏ nếu người chưa thành niên đã thanh toán bằng tài sản mà người đại diện hợp pháp cho phép định đoạt, hoặc đã dùng thủ đoạn gian dối khiến người khác tin rằng mình đã thành niên.',
        'Nếu bạn muốn huỷ bỏ, xin gửi yêu cầu qua kênh liên hệ tại Điều 21. Nhà vận hành có thể yêu cầu tài liệu chứng minh bạn là người đại diện hợp pháp.',
      ],
    },
    {
      h: 'Điều 16 (Nghĩa vụ của người dùng)',
      body: [
        'Người dùng phải tuân thủ pháp luật có liên quan và bản điều khoản này khi sử dụng dịch vụ.',
        'Người dùng không được mạo dụng tài khoản của người khác, cản trở hoạt động bình thường của dịch vụ, truy cập hoặc tìm cách truy cập dịch vụ bằng cách thức không do nhà vận hành quy định, hay can thiệp vào quy trình thanh toán sản phẩm có phí.',
        'Người dùng phải tự quản lý thông tin tài khoản cùng mật khẩu hoặc hình mở khoá của khoá ứng dụng.',
        'Người dùng phải cất giữ an toàn mã khôi phục được cấp khi bật tính năng sao lưu. Nếu mất mã khôi phục thì nhà vận hành cũng không thể giải mã bản sao lưu nên việc khôi phục là không thể.',
      ],
    },
    {
      h: 'Điều 17 (Lưu giữ dữ liệu và sao lưu)',
      body: [
        'Bản gốc các mảnh nhật ký người dùng viết được lưu trên thiết bị của người dùng. Nếu gỡ cài đặt ứng dụng hoặc đặt lại thiết bị thì các mảnh nhật ký bên trong thiết bị không thể khôi phục được.',
        'Nếu đã bật tính năng sao lưu, nhà vận hành giữ một bản sao đã mã hoá, và người dùng có thể khôi phục bằng mã khôi phục của mình.',
        'Ngay cả sau khi gói đăng ký kết thúc, nhà vận hành vẫn giữ bản sao lưu đã mã hoá trong 90 ngày, và trong thời gian đó việc khôi phục vẫn dùng được. Sau khi 90 ngày trôi qua, bản sao lưu bị xoá.',
        'Nhà vận hành không có phương tiện thông báo đẩy, nên việc báo trước về dự định xoá nêu trên chỉ được thực hiện bằng cách hiển thị trên màn hình khi người dùng mở ứng dụng.',
        'Nếu người dùng xoá tài khoản, bản sao lưu đã mã hoá lưu trên máy chủ sẽ bị xoá cùng tài khoản mà không có 90 ngày ân hạn.',
      ],
    },
    {
      h: 'Điều 18 (Quyền sở hữu trí tuệ)',
      body: [
        'Quyền đối với các mảnh nhật ký người dùng viết trong dịch vụ và ảnh người dùng đính kèm thuộc về người dùng. Nhà vận hành không yêu sách bất kỳ quyền nào đối với chúng.',
        'Nhà vận hành không sử dụng nhật ký của người dùng cho mục đích nào khác ngoài việc cung cấp dịch vụ, và không dùng cho mục đích quảng cáo, thống kê hay huấn luyện trí tuệ nhân tạo.',
        'Quyền đối với bản thân dịch vụ và đối với thiết kế, nhãn hiệu, chương trình có trong dịch vụ thuộc về nhà vận hành hoặc người có quyền hợp pháp.',
        'Người dùng không được sao chép, phân phối hay dịch ngược dịch vụ khi chưa có sự đồng ý trước của nhà vận hành.',
      ],
    },
    {
      h: 'Điều 19 (Thay đổi, tạm ngừng và chấm dứt dịch vụ)',
      body: [
        'Nhà vận hành có thể thay đổi nội dung dịch vụ nhằm nâng cao chất lượng. Trường hợp thay đổi nội dung sản phẩm có phí theo hướng bất lợi cho người dùng, việc thông báo trước được thực hiện theo Điều 4.',
        'Nhà vận hành có thể tạm ngừng cung cấp dịch vụ khi có lý do bất khả kháng như kiểm tra, thay thế, hỏng hóc thiết bị hay gián đoạn liên lạc, và khi đó sẽ thông báo trước. Tuy nhiên, nếu có lý do bất khả kháng khiến không thể thông báo trước thì sẽ thông báo sau.',
        'Trường hợp nhà vận hành chấm dứt dịch vụ, việc thông báo được thực hiện qua thông báo trong dịch vụ và trang chi tiết của chợ ứng dụng chậm nhất 30 ngày trước ngày chấm dứt, đồng thời nêu rõ khoảng thời gian người dùng có thể tải về hoặc khôi phục bản sao lưu.',
        'Khi dịch vụ chấm dứt, khoản phí tương ứng với thời gian đã thanh toán nhưng chưa sử dụng sẽ được hoàn lại cho người dùng.',
      ],
    },
    {
      h: 'Điều 20 (Trách nhiệm)',
      body: [
        'Nhà vận hành chịu trách nhiệm theo pháp luật có liên quan trong việc cung cấp dịch vụ. Không một điều khoản nào trong bản điều khoản này loại trừ hay giới hạn trách nhiệm của nhà vận hành do pháp luật quy định.',
        'Nhà vận hành không chịu trách nhiệm về thiệt hại phát sinh từ những nguyên nhân không do lỗi của nhà vận hành, như thiên tai, hỏng hóc, mất mát hay việc đặt lại thiết bị của người dùng, hoặc việc người dùng làm mất mã khôi phục hay mật khẩu khoá ứng dụng.',
        'Báo cáo tóm tắt bằng AI là tài liệu tham khảo do trí tuệ nhân tạo tạo ra, không phải chẩn đoán hay lời khuyên về y tế, tâm lý hoặc pháp lý. Nhà vận hành không bảo đảm tính chính xác của nội dung đó.',
        'Thiệt hại phát sinh trong quá trình thanh toán qua chợ ứng dụng do lỗi của chợ ứng dụng sẽ theo chính sách của chợ ứng dụng. Tuy vậy, nhà vận hành vẫn dành mọi sự hợp tác cần thiết để khắc phục thiệt hại cho người dùng.',
      ],
    },
    {
      h: 'Điều 21 (Khiếu nại của người tiêu dùng và xử lý tranh chấp)',
      body: [
        'Để xử lý ý kiến và khiếu nại của người dùng, nhà vận hành duy trì kênh [Cài đặt] → [Liên hệ] trong dịch vụ và kênh thư điện tử dưới đây.',
        'Thư điện tử: support@vivace-games.com',
        'Khi nhà vận hành nhận thấy ý kiến hay khiếu nại của người dùng là chính đáng, nhà vận hành xử lý ngay; nếu việc xử lý cần thời gian thì sẽ báo cho người dùng lý do và lịch xử lý.',
        'Khi phát sinh tranh chấp giữa nhà vận hành và người dùng, người dùng có thể đề nghị các cơ quan sau hoà giải tranh chấp.',
        '• Uỷ ban Hoà giải tranh chấp tiêu dùng (Cơ quan Người tiêu dùng Hàn Quốc): 1372 (từ Hàn Quốc) · https://www.kca.go.kr',
        '• Uỷ ban Hoà giải tranh chấp nội dung: 1588-2594 · https://www.kcdrc.kr',
        '• Uỷ ban Hoà giải tranh chấp giao dịch điện tử: 1661-5714 · https://www.ecmc.or.kr',
      ],
    },
    {
      h: 'Điều 22 (Luật áp dụng và thẩm quyền)',
      body: [
        'Luật của Đại Hàn Dân Quốc được áp dụng đối với bản điều khoản này và việc sử dụng dịch vụ.',
        'Vụ kiện về tranh chấp phát sinh giữa nhà vận hành và người dùng thuộc thẩm quyền riêng biệt của toà án cấp quận nơi có địa chỉ của người dùng tại thời điểm khởi kiện, theo Điều 36 Luật Bảo vệ người tiêu dùng trong thương mại điện tử. Nếu không có địa chỉ thì thuộc thẩm quyền riêng biệt của toà án cấp quận nơi người dùng cư trú; và nếu tại thời điểm khởi kiện không rõ địa chỉ hay nơi cư trú của người dùng thì toà án có thẩm quyền được xác định theo Luật Tố tụng dân sự.',
        'Bản tiếng Hàn của bản điều khoản này là bản chính thức. Nếu bản dịch sang ngôn ngữ khác có nghĩa khác biệt thì bản tiếng Hàn được ưu tiên áp dụng.',
        'Điều khoản thi hành: Bản điều khoản này có hiệu lực từ ngày 17 tháng 8 năm 2026.',
      ],
    },
  ],
};
