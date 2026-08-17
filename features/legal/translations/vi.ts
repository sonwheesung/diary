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
  sourceFingerprint: '0a627bd3',
  effective: '2026-08-09',
  updated: '2026-08-11',
  intro:
    'Vivace Games (“nhà vận hành”) tuân thủ Luật Bảo vệ thông tin cá nhân và các quy định liên quan, đồng thời xử lý dữ liệu cá nhân của người dùng “Jogak” (“dịch vụ”) như trình bày dưới đây. Jogak không gửi các mảnh nhật ký bạn viết đến bất kỳ máy chủ nào và về nguyên tắc chỉ thu thập lượng thông tin tối thiểu cần thiết.',
  sections: [
    {
      h: '1. Những gì chúng tôi không thu thập (nói trước)',
      body: [
        'Nhà vận hành không thu thập những thông tin sau và không truyền chúng ra khỏi thiết bị của bạn.',
        '• Tiêu đề, nội dung, danh sách, ảnh, thẻ và cảm xúc của các mảnh — chỉ được lưu trong bộ nhớ trong của thiết bị bạn.',
        '• Mã PIN, hình mở khoá hoặc câu trả lời gợi ý dùng cho khoá ứng dụng — chỉ được lưu trong vùng lưu trữ an toàn của thiết bị ở dạng không thể khôi phục (mã băm); bản gốc không được lưu ở bất kỳ đâu.',
        '• Tên, ngày sinh, số điện thoại, địa chỉ, danh bạ, vị trí, hay bất kỳ bản ghi truy cập nào vào toàn bộ thư viện ảnh của bạn.',
        'Ảnh bạn chọn trong ứng dụng chỉ được sao chép vào thư mục riêng của ứng dụng trên thiết bị để có thể chèn vào một mảnh; chúng không được truyền đi đâu cả.',
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
        '※ Đăng nhập chỉ cần cho “Liên hệ”; viết mảnh, khoá ứng dụng và các tính năng khác không cần.',
        '※ Trẻ em dưới 14 tuổi không thể dùng tính năng đăng nhập.',
        'b. Thông tin được thu thập tự động trong quá trình hiển thị quảng cáo',
        '• Mã quảng cáo (ID quảng cáo Android), thông tin thiết bị và mạng, bản ghi hiển thị và nhấp chuột',
        '• Những mục trên do Google (AdMob) thu thập; chi tiết và cách từ chối có ở mục 7.',
      ],
    },
    {
      h: '3. Mục đích xử lý',
      body: [
        '• Tiếp nhận và xử lý liên hệ: kiểm tra nội dung bạn gửi, tìm và khắc phục lỗi',
        '• Xác định người gửi và phản hồi: chuyển phản hồi tới người đã liên hệ và cho phép bạn xem lại lịch sử của mình',
        '• Hiển thị quảng cáo: cung cấp quảng cáo cho người dùng bản miễn phí và đo lường hiệu quả',
        'Nhà vận hành không dùng dữ liệu cá nhân cho mục đích khác ngoài những mục đích trên, và nếu mục đích thay đổi sẽ xin sự đồng ý trước.',
      ],
    },
    {
      h: '4. Thời hạn lưu giữ và sử dụng',
      body: [
        '• Thông tin tài khoản (email, “sub” của Google): cho đến khi bạn xoá tài khoản. Khi xoá, chúng tôi tiêu huỷ ngay hoặc chuyển sang dạng không thể truy vết.',
        '• Nội dung liên hệ: 3 năm kể từ ngày tiếp nhận (Luật Bảo vệ người tiêu dùng trong thương mại điện tử — hồ sơ về khiếu nại hoặc giải quyết tranh chấp)',
        '• Dữ liệu hành vi dựa trên mã quảng cáo: tối đa 1 năm kể từ khi thu thập',
        'Khi hết thời hạn hoặc đạt được mục đích, chúng tôi tiêu huỷ dữ liệu ngay lập tức.',
      ],
    },
    {
      h: '5. Cung cấp cho bên thứ ba',
      body: [
        'Nhà vận hành không cung cấp dữ liệu cá nhân của người dùng cho bên thứ ba.',
        'Ngoại lệ áp dụng khi pháp luật có quy định riêng hoặc khi cơ quan điều tra yêu cầu theo trình tự và hình thức luật định.',
      ],
    },
    {
      h: '6. Uỷ thác xử lý và chuyển ra nước ngoài',
      body: [
        'Để cung cấp dịch vụ, nhà vận hành uỷ thác việc xử lý như sau, và một phần diễn ra ngoài Hàn Quốc.',
        '• Google LLC — Quốc gia: Hoa Kỳ. Liên hệ: https://support.google.com/policies/contact/general_privacy_form. Mục đích: hiển thị và đo lường quảng cáo (AdMob), đăng nhập bằng tài khoản Google. Dữ liệu: mã quảng cáo, thông tin thiết bị và mạng, và khi đăng nhập là email cùng mã định danh tài khoản. Khi nào và bằng cách nào: truyền qua mạng khi yêu cầu quảng cáo và khi đăng nhập. Lưu giữ: theo chính sách quyền riêng tư của Google',
        '• Supabase Inc. — Quốc gia: Hoa Kỳ (nơi đặt pháp nhân). Liên hệ: privacy@supabase.com. Mục đích: lưu thông tin liên hệ và tài khoản trong cơ sở dữ liệu. Dữ liệu: thông tin ở mục 2(a). Khi nào và bằng cách nào: truyền qua mạng khi bạn gửi liên hệ. Lưu giữ: theo thời hạn ở mục 4. ※ Vị trí lưu trữ vật lý là Hàn Quốc (vùng Seoul), nhưng chúng tôi công bố là chuyển ra nước ngoài vì pháp nhân vận hành đặt ngoài Hàn Quốc.',
        '• Vercel Inc. — Quốc gia: Hoa Kỳ. Liên hệ: privacy@vercel.com. Mục đích: vận hành máy chủ tiếp nhận liên hệ. Dữ liệu: thông tin ở mục 2(a). Khi nào và bằng cách nào: truyền qua mạng khi bạn gửi liên hệ. Lưu giữ: cho đến khi hợp đồng uỷ thác kết thúc',
        'Bạn có thể từ chối việc chuyển dữ liệu ra nước ngoài. Để từ chối phần liên quan đến quảng cáo, hãy tắt quảng cáo cá nhân hoá theo mục 7; để từ chối phần liên quan đến liên hệ, chỉ cần không dùng tính năng “Liên hệ” (mọi tính năng khác, kể cả viết mảnh, vẫn dùng được bình thường).',
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
        'Tìm hiểu thêm về cách Google xử lý dữ liệu cá nhân cho quảng cáo: https://policies.google.com/technologies/ads',
      ],
    },
    {
      h: '8. Trình tự và cách thức tiêu huỷ',
      body: [
        'Trình tự: dữ liệu cá nhân đã hết thời hạn hoặc đã đạt mục đích sẽ bị tiêu huỷ ngay. Nếu pháp luật yêu cầu lưu giữ, dữ liệu được lưu tách biệt với dữ liệu khác trong thời hạn đó rồi mới tiêu huỷ.',
        'Cách thức: thông tin dạng tệp điện tử được xoá vĩnh viễn bằng biện pháp kỹ thuật khiến không thể khôi phục hay tái tạo.',
        'Các mảnh, ảnh và thông tin khoá được lưu trên thiết bị của bạn sẽ bị gỡ khỏi thiết bị khi bạn dùng tính năng “Đặt lại toàn bộ” trong ứng dụng hoặc gỡ cài đặt ứng dụng. Nhà vận hành không nắm giữ những thông tin này nên không thể xoá giúp bạn.',
      ],
    },
    {
      h: '9. Quyền của chủ thể dữ liệu và người đại diện hợp pháp, cùng cách thực hiện',
      body: [
        'Bạn có thể thực hiện các quyền sau bất cứ lúc nào.',
        '• Yêu cầu truy cập dữ liệu của mình • Yêu cầu chỉnh sửa khi có sai sót • Yêu cầu xoá • Yêu cầu ngừng xử lý • Yêu cầu chuyển dữ liệu của mình (Luật Bảo vệ thông tin cá nhân, Điều 35-2)',
        'Bạn có thể thực hiện bằng văn bản hoặc email theo thông tin liên hệ ở mục 11, và nhà vận hành sẽ xử lý ngay.',
        'Nếu bạn yêu cầu chỉnh sửa một sai sót trong dữ liệu, chúng tôi sẽ không sử dụng hay cung cấp dữ liệu đó cho đến khi việc chỉnh sửa hoàn tất.',
        'Người đại diện hợp pháp của trẻ dưới 14 tuổi có thể thực hiện các quyền trên thay cho trẻ.',
      ],
    },
    {
      h: '10. Biện pháp bảo đảm an toàn',
      body: [
        '• Về quản lý: giảm tối đa số người tiếp xúc với dữ liệu cá nhân và đào tạo họ định kỳ',
        '• Về kỹ thuật: quản lý quyền truy cập hệ thống xử lý, mã hoá khi truyền (HTTPS), lưu bí mật khoá ứng dụng dưới dạng mã băm và dùng vùng lưu trữ an toàn của thiết bị (Keystore/Keychain)',
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
        'Khi có bổ sung, lược bỏ hoặc sửa đổi nội dung do thay đổi pháp luật, chính sách hoặc công nghệ bảo mật, chúng tôi sẽ thông báo qua mục thông báo trong ứng dụng từ 7 ngày trước khi thay đổi có hiệu lực (30 ngày trước nếu thay đổi bất lợi cho người dùng).',
        'Những nội dung sửa đổi sắp có hiệu lực được đăng trước ở phần “Sửa đổi sắp áp dụng” ở cuối tài liệu này, theo hình thức cho phép so sánh trước và sau.',
        'Lịch sử sửa đổi',
        '• 2026-08-09 ban hành lần đầu',
        '• 2026-08-11 đăng thông báo sửa đổi sắp áp dụng — dự kiến bổ sung gói đăng ký hằng tháng và sao lưu/khôi phục (nội dung chính chưa thay đổi)',
      ],
    },
  ],
  pending: [
    {
      appliesFrom: 'Kể từ ngày phát hành phiên bản có gói đăng ký hằng tháng và sao lưu/khôi phục',
      summary:
        'Gói đăng ký hằng tháng và sao lưu/khôi phục được bổ sung. Nếu bạn đăng ký, trạng thái đăng ký và mã giao dịch sẽ được xử lý; và chỉ khi bạn bật sao lưu, bản sao nhật ký đã được mã hoá trên thiết bị của bạn mới được lưu trên máy chủ của nhà vận hành. Nhà vận hành không thể giải mã bản sao đó.',
      sections: [
        {
          h: 'a. Điều gì thay đổi (trước → sau)',
          body: [
            'Trước: tiêu đề, nội dung và ảnh của các mảnh không được truyền ra khỏi thiết bị của bạn.',
            'Sau: **chỉ khi chính bạn bật sao lưu**, bản sao nhật ký đã mã hoá trên thiết bị của bạn mới được lưu trên máy chủ của nhà vận hành. Nếu bạn không bật, sẽ không có một ký tự nào được truyền đi, giống như trước đây.',
            '⚠ Nói cho chính xác: nhà vận hành **lưu bản sao đó nhưng không thể đọc được.** Khoá giải mã chỉ tồn tại trên thiết bị của bạn và trong mã khôi phục mà bạn giữ; nhà vận hành không có khoá đó.',
          ],
        },
        {
          h: 'b. Thông tin được lưu thêm nếu bạn bật sao lưu',
          body: [
            '• Bản sao nhật ký đã mã hoá — ở dạng nhà vận hành không thể giải mã',
            '• Mã định danh bản sao lưu, thời điểm sao lưu, số thế hệ và dung lượng — **những thông tin này không được mã hoá.** Nhà vận hành có thể biết tài khoản nào đã sao lưu, vào lúc nào và dung lượng bao nhiêu.',
            '• Căn cứ thu thập: sự đồng ý riêng của bạn (được lấy ở màn hình bật sao lưu)',
          ],
        },
        {
          h: 'c. Thời hạn lưu giữ',
          body: [
            '• Được lưu trong thời gian bạn bật sao lưu và tối đa 90 ngày sau khi gói đăng ký kết thúc, sau đó tự động tiêu huỷ.',
            '• Nếu bạn tắt sao lưu, yêu cầu xoá hoặc xoá tài khoản, chúng tôi tiêu huỷ ngay mà không chờ đủ 90 ngày.',
            '• Bản sao lưu không được truy cập từ 3 năm trở lên sẽ bị tiêu huỷ. (Áp dụng cho trường hợp chỉ gỡ ứng dụng mà không xoá tài khoản.)',
            '• Bản ghi việc tiêu huỷ (mã bản sao lưu và thời điểm) được giữ 1 năm — để bạn có thể biết “vì sao không khôi phục được”; mã định danh tài khoản không được lưu kèm.',
            '⚠ Thông báo hết hạn gói đăng ký chỉ đến với bạn trên màn hình khi bạn mở ứng dụng. Nếu bạn không mở, thông báo này có thể không đến được.',
          ],
        },
        {
          h: 'd. Giới hạn của quyền truy cập',
          body: [
            'Nếu bạn yêu cầu truy cập bản sao lưu, thứ nhà vận hành có thể cung cấp chỉ là **bản mã hoá không thể giải mã và siêu dữ liệu ở điểm (b).** Chúng tôi không thể cung cấp nội dung nhật ký ở dạng con người đọc được — nhà vận hành không có khoá.',
            'Chính bạn có thể khôi phục bất cứ lúc nào trong ứng dụng bằng mã khôi phục của mình.',
            '⚠ Nếu bạn mất mã khôi phục thì không có cách nào mở được bản sao lưu. Nhà vận hành cũng không thể mở giúp bạn.',
          ],
        },
        {
          h: 'e. Thông tin được lưu nếu bạn dùng gói đăng ký',
          body: [
            '• Trạng thái đăng ký — khoá quyền lợi, thời điểm hết hạn, thời gian ân hạn khi thanh toán lỗi, có gia hạn hay không',
            '• Mã giao dịch do cửa hàng cấp, mã sản phẩm và phân biệt môi trường thanh toán (chính thức/thử nghiệm)',
            '• Bản ghi thay đổi trạng thái đăng ký do dịch vụ thanh toán gửi (mua, gia hạn, huỷ, hoàn tiền, v.v.) cùng nội dung gốc',
            '⚠ Thông tin thanh toán như số thẻ hay số tài khoản do Google Play xử lý và không được chuyển cho nhà vận hành. Nhà vận hành chỉ biết bạn đã thanh toán và gói đăng ký có hiệu lực đến khi nào.',
            '• Căn cứ thu thập: Luật Bảo vệ thông tin cá nhân, Điều 15(1)4 (cần thiết để thực hiện biện pháp theo yêu cầu của người dùng, tức là cung cấp quyền lợi đăng ký đã yêu cầu)',
            '• Mục đích: xác nhận quyền lợi đăng ký (bỏ quảng cáo, dùng sao lưu), xử lý thắc mắc thanh toán và hoàn tiền',
          ],
        },
        {
          h: 'f. Thời hạn lưu giữ thông tin liên quan đến gói đăng ký',
          body: [
            '• Hồ sơ về hợp đồng hoặc rút lại đề nghị, về thanh toán và cung ứng hàng hoá: 5 năm (Luật Bảo vệ người tiêu dùng trong thương mại điện tử, Điều 6)',
            '• Khi bạn xoá tài khoản, mã định danh tài khoản (email, “sub” của Google) sẽ được chuyển ngay sang dạng không thể truy vết, còn các hồ sơ giao dịch trên được lưu tách biệt ở dạng không truy vết được người tạo trong thời hạn nêu trên rồi mới tiêu huỷ.',
            '⚠ Xoá tài khoản không tự động huỷ gói đăng ký trên Google Play. Bạn phải tự huỷ tại Google Play > Gói đăng ký; nếu không, bạn vẫn tiếp tục bị tính phí.',
          ],
        },
        {
          h: 'g. Uỷ thác xử lý và chuyển ra nước ngoài (bổ sung)',
          body: [
            '• Supabase Inc. — Quốc gia: Hoa Kỳ (nơi đặt pháp nhân). Liên hệ: privacy@supabase.com. Mục đích: lưu bản sao lưu đã mã hoá và trạng thái đăng ký. Dữ liệu: thông tin ở điểm (b) và (e). Lưu giữ: thời hạn ở điểm (c) và (f). ※ Vị trí lưu trữ vật lý là Hàn Quốc (vùng Seoul).',
            '• Vercel Inc. — Quốc gia: Hoa Kỳ. Liên hệ: privacy@vercel.com. Mục đích: vận hành máy chủ sao lưu. ※ Bản sao đã mã hoá được gửi thẳng tới kho lưu trữ mà không đi qua máy chủ này.',
            '• RevenueCat, Inc. — Quốc gia: Hoa Kỳ. Liên hệ: compliance@revenuecat.com. Mục đích: xác minh thanh toán đăng ký và kiểm tra trạng thái. Dữ liệu: mã định danh tài khoản, mã giao dịch và mã sản phẩm của cửa hàng, thông tin thiết bị và ứng dụng. Khi nào và bằng cách nào: truyền qua mạng khi mở màn hình đăng ký và khi thanh toán. Lưu giữ: cho đến khi hợp đồng uỷ thác kết thúc',
            '• Google LLC — ngoài phần chuyển đã nêu ở mục 6, thông tin giao dịch của cửa hàng được xử lý nhằm thực hiện và xác minh thanh toán đăng ký.',
            'Bạn có thể từ chối việc chuyển ra nước ngoài. Nếu bạn không bật sao lưu và không đăng ký, những lần chuyển trên sẽ không xảy ra, và mọi tính năng khác, kể cả viết mảnh, vẫn dùng được bình thường.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'Kể từ ngày phát hành phiên bản có tính năng báo cáo tóm tắt bằng AI',
      summary:
        'Tính năng báo cáo tóm tắt bằng AI được bổ sung. Chỉ khi bạn tự tạo báo cáo, nội dung nhật ký của kỳ đó mới đi qua máy chủ của nhà vận hành ở dạng không mã hóa và được gửi tới nhà cung cấp AI. Nhà vận hành không lưu nội dung nhật ký, nhưng lưu bản tóm tắt được tạo ra trong 90 ngày để cải thiện chất lượng báo cáo. Nhà cung cấp AI lưu tối đa 30 ngày nhằm giám sát lạm dụng rồi xóa, và không dùng để huấn luyện mô hình.',
      sections: [
        {
          h: 'a. Điều gì thay đổi (trước → sau)',
          body: [
            'Trước: tiêu đề và nội dung nhật ký không được truyền ra khỏi thiết bị của bạn. Ngay cả khi bạn bật sao lưu, chúng chỉ được truyền dưới dạng bản mã mà nhà vận hành không thể đọc.',
            'Sau: **chỉ khi bạn tự nhấn Tạo báo cáo**, nội dung nhật ký của kỳ đó được gửi **ở dạng không mã hóa** qua máy chủ của nhà vận hành tới nhà cung cấp AI và bản tóm tắt được tạo ra.',
            '⚠ Nói chính xác: nhà vận hành **không lưu bản thân nội dung nhật ký.** Tuy nhiên ① tại thời điểm tạo bản tóm tắt, nội dung đi qua máy chủ của nhà vận hành nên chúng tôi không thể nói rằng "nhà vận hành không thể xem", và ② **bản tóm tắt được tạo ra sẽ được lưu 90 ngày** (xem mục d). Chúng tôi nói rõ điều này chứ không làm mờ đi.',
            'Nếu bạn không tạo báo cáo, việc truyền này hoàn toàn không xảy ra, và mọi tính năng khác kể cả viết nhật ký vẫn dùng được đầy đủ.',
          ],
        },
        {
          h: 'b. Đồng ý riêng đối với thông tin nhạy cảm',
          body: [
            'Nhật ký có thể chứa thông tin nhạy cảm như tình trạng sức khỏe hoặc tâm lý theo Điều 23 Luật Bảo vệ Thông tin Cá nhân.',
            'Vì báo cáo tóm tắt bằng AI xử lý nội dung đó ở dạng không mã hóa, chúng tôi lấy **sự đồng ý riêng cho việc xử lý thông tin nhạy cảm** khi bạn dùng tính năng lần đầu. Sự đồng ý này **tách biệt** với đồng ý chuyển ra nước ngoài ở mục (c), và bạn có thể chọn riêng từng mục.',
            'Dù không đồng ý, mọi tính năng ngoài báo cáo AI vẫn dùng được đầy đủ.',
          ],
        },
        {
          h: 'c. Đồng ý riêng đối với việc chuyển ra nước ngoài',
          body: [
            'Nhà cung cấp AI đặt ở ngoài Hàn Quốc. Tên nhà cung cấp, quốc gia tiếp nhận và thông tin liên hệ sẽ được ghi cụ thể tại mục này khi tính năng ra mắt, và cũng được hiển thị trong ứng dụng trước khi lấy sự đồng ý.',
            '• Hạng mục chuyển: tiêu đề, nội dung, cảm xúc và ngày viết của các mục trong kỳ bạn yêu cầu báo cáo',
            '• Mục đích: tạo báo cáo tóm tắt',
            '• Thời điểm và cách thức: truyền qua mạng khi bạn nhấn Tạo báo cáo',
            '• Thời gian lưu giữ: máy chủ của nhà vận hành **không lưu các hạng mục được chuyển (nội dung nhật ký)** — chúng chỉ nằm trong bộ nhớ khi bản tóm tắt đang được tạo rồi bị hủy. Việc lưu bản tóm tắt được tạo ra ghi riêng ở mục (d). Nhà cung cấp AI lưu **tối đa 30 ngày** để giám sát lạm dụng rồi xóa, và ngay cả trong thời gian đó **cũng không dùng để huấn luyện mô hình.**',
            'Bạn có thể từ chối việc chuyển ra nước ngoài; khi đó chỉ báo cáo AI không dùng được, mọi tính năng khác vẫn dùng được đầy đủ.',
          ],
        },
        {
          h: 'd. Nhà vận hành lưu những gì',
          body: [
            'Chúng tôi không lưu nội dung nhật ký (tiêu đề và nội dung). Chúng tôi lưu những mục sau.',
            '• **Bản tóm tắt do AI tạo ra** — được lưu để kiểm tra và cải thiện chất lượng báo cáo. Thời gian lưu giữ: **90 ngày kể từ ngày tạo**, sau đó tự động xóa.',
            '• Định danh tài khoản đã tạo báo cáo, kỳ, số lần và số token đã dùng — dùng cho việc thanh toán và ngăn chặn lạm dụng. Thời gian lưu giữ: đến khi đạt mục đích hoặc đến khi bạn xóa tài khoản',
            '⚠ Bản tóm tắt được viết dựa trên nhật ký của bạn nên có thể chứa nội dung nhật ký. Chúng tôi nói rõ điều này chứ không làm mờ đi.',
            'Báo cáo hoàn thành cũng được lưu **trên thiết bị của bạn**, và nếu bạn đã bật sao lưu thì được đưa vào bản sao lưu ở dạng mã hóa.',
          ],
        },
        {
          h: 'e. Quyền của bạn',
          body: [
            '• Báo cáo chỉ được tạo khi bạn tự tạo; không bao giờ được tạo tự động.',
            '• Bạn có thể xóa báo cáo đã tạo bất cứ lúc nào trong ứng dụng.',
            '• Khi xóa trong ứng dụng, báo cáo biến mất khỏi thiết bị; bản tóm tắt lưu trên máy chủ của nhà vận hành sẽ tự động xóa sau 90 ngày. Nếu muốn xóa sớm hơn, bạn có thể yêu cầu qua mục Liên hệ.',
            '• Bản tóm tắt do AI tạo ra có thể khác với sự thật và không phải là chẩn đoán hay lời khuyên y tế, tâm lý. Ứng dụng cung cấp cách báo cáo một bản tóm tắt.',
          ],
        },
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
 * ⚠ Cấu trúc phải khớp chính xác với bản tiếng Hàn — 5 mục (6/4/4/3/3 dòng) cùng hai phần
 *   sửa đổi sắp áp dụng. `npm run check:legal` sẽ kiểm tra.
 */
export const DELETE_ACCOUNT_VI: LegalDoc = {
  title: 'Jogak — Cách xoá tài khoản của bạn',
  sourceFingerprint: 'a6b3a8b5',
  effective: '2026-08-10',
  updated: '2026-08-10',
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
      ],
    },
    {
      h: '4. Dữ liệu được lưu giữ và thời hạn',
      body: [
        'Những thông tin sau được lưu giữ theo quy định của pháp luật, và ngay trong thời hạn đó cũng chỉ tồn tại ở dạng không thể truy vết ra người tạo (giả danh hoá).',
        '• Nội dung liên hệ: 3 năm (Luật Bảo vệ người tiêu dùng trong thương mại điện tử — hồ sơ về khiếu nại hoặc giải quyết tranh chấp của người tiêu dùng)',
        'Khi hết thời hạn lưu giữ, chúng tôi tiêu huỷ ngay lập tức.',
      ],
    },
    {
      h: '5. Những gì không bị xoá — các mảnh nhật ký trên thiết bị',
      body: [
        'Các mảnh nhật ký của Jogak (tiêu đề, nội dung, ảnh, thẻ, cảm xúc) chỉ được lưu bên trong thiết bị của bạn và không được truyền tới máy chủ của nhà vận hành.',
        'Vì vậy, dù bạn xoá tài khoản thì các mảnh trên thiết bị vẫn còn nguyên. Nếu muốn xoá cả những mảnh đó, hãy gỡ cài đặt ứng dụng hoặc thực hiện đặt lại trong [Cài đặt] của ứng dụng.',
        'Ngược lại, nếu bạn gỡ cài đặt ứng dụng thì các mảnh trên thiết bị không thể khôi phục được.',
      ],
    },
  ],
  pending: [
    {
      appliesFrom: 'Kể từ ngày phát hành phiên bản có gói đăng ký hằng tháng và sao lưu/khôi phục',
      summary:
        'Nếu bạn đã bật sao lưu, việc xoá tài khoản cũng xoá luôn bản sao lưu đã mã hoá trên máy chủ. Hồ sơ giao dịch gói đăng ký được lưu giữ theo pháp luật ở dạng không thể truy vết.',
      sections: [
        {
          h: 'a. Dữ liệu bị xoá thêm',
          body: [
            '• Bản sao nhật ký đã mã hoá lưu trên máy chủ — bị xoá cùng lúc khi bạn xoá tài khoản. Chúng tôi không chờ hết 90 ngày ân hạn.',
            '• Mã định danh bản sao lưu và các bản ghi sao lưu (thời điểm, dung lượng, số thế hệ)',
            '⚠ Đã xoá thì không thể hoàn tác. Dù bạn còn giữ mã khôi phục, bạn cũng không thể khôi phục được nữa.',
            '⚠ Các mảnh trên thiết bị của bạn vẫn còn nguyên. Thứ bị xoá chỉ là bản sao trên máy chủ.',
          ],
        },
        {
          h: 'b. Dữ liệu được lưu giữ thêm và thời hạn',
          body: [
            '• Hồ sơ giao dịch gói đăng ký (mã giao dịch, sản phẩm, kỳ hạn đăng ký, lịch sử thay đổi trạng thái thanh toán): 5 năm (Luật Bảo vệ người tiêu dùng trong thương mại điện tử, Điều 6)',
            '• Bản ghi về việc tiêu huỷ bản sao lưu (mã bản sao lưu và thời điểm tiêu huỷ): 1 năm — để bạn có thể biết “vì sao không khôi phục được”; mã định danh tài khoản không được lưu kèm.',
            'Ngay trong thời hạn lưu giữ, những bản ghi trên cũng chỉ tồn tại ở dạng không thể truy vết ra người tạo.',
          ],
        },
        {
          h: 'c. Bạn phải tự huỷ gói đăng ký',
          body: [
            'Xoá tài khoản không tự động huỷ gói đăng ký trên Google Play, và nếu bạn không huỷ thì vẫn tiếp tục bị tính phí.',
            'Cách huỷ: ứng dụng Google Play Store > hồ sơ > Thanh toán và gói đăng ký > Gói đăng ký (https://play.google.com/store/account/subscriptions)',
            'Việc hoàn tiền cho khoản đã thanh toán tuân theo chính sách hoàn tiền của Google Play và chính sách hoàn tiền của nhà vận hành. Bạn có thể liên hệ theo địa chỉ dưới đây.',
          ],
        },
      ],
    },
    {
      appliesFrom: 'Kể từ ngày phát hành phiên bản có tính năng báo cáo tóm tắt bằng AI',
      summary:
        'Nội dung báo cáo AI được lưu trên thiết bị của bạn. Trên máy chủ, bản tóm tắt báo cáo được lưu tối đa 90 ngày để kiểm tra chất lượng và bị xoá cùng với bản ghi sử dụng khi bạn xoá tài khoản.',
      sections: [
        {
          h: 'a. Với báo cáo AI thì những gì bị xoá',
          body: [
            '• Bản ghi sử dụng báo cáo lưu trên máy chủ (mã định danh tài khoản, kỳ, số lần, số token) — bị xoá cùng lúc khi bạn xoá tài khoản.',
            '• Bản tóm tắt báo cáo đang lưu trên máy chủ (tối đa 90 ngày) — bị xoá cùng lúc khi bạn xoá tài khoản. Nội dung nhật ký gốc không được lưu nên không có gì để xoá.',
            '⚠ Nội dung báo cáo cũng được lưu trên thiết bị của bạn nên vẫn còn nguyên sau khi bạn xoá tài khoản. Nếu muốn xoá, hãy xoá báo cáo trong ứng dụng hoặc gỡ cài đặt ứng dụng.',
            '• Nếu bạn đã bật sao lưu thì báo cáo cũng được mã hoá và nằm trong bản sao lưu, và sẽ bị xoá khi bản sao lưu bị xoá.',
          ],
        },
      ],
    },
  ],
};
