// src/utils/seedFirebase.ts
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Article } from "../types";

const mockArticles: Omit<Article, "id">[] = [
  {
    title: "Đột phá mới trong công nghệ trí tuệ nhân tạo",
    subtitle:
      "Các nhà nghiên cứu phát triển mô hình AI có khả năng hiểu ngữ cảnh phức tạp",
    content: `<p>Trong một bước tiến đáng kể, các nhà khoa học tại Viện Công nghệ hàng đầu đã công bố một mô hình trí tuệ nhân tạo mới có khả năng xử lý và hiểu ngữ cảnh phức tạp với độ chính xác chưa từng có.</p>

<p>Mô hình này, được đặt tên là ContextAI, sử dụng kiến trúc transformer tiên tiến kết hợp với kỹ thuật học sâu để phân tích không chỉ nội dung văn bản mà còn cả bối cảnh xã hội, văn hóa và lịch sử xung quanh.</p>

<p>"Đây là bước ngoặt quan trọng trong lĩnh vực AI," Tiến sĩ Nguyễn Minh Tuấn, trưởng nhóm nghiên cứu, cho biết. "Chúng tôi đã vượt qua rào cản về khả năng hiểu ngữ cảnh, một trong những thách thức lớn nhất của AI."</p>

<p>Ứng dụng của công nghệ này rất rộng, từ cải thiện trợ lý ảo, nâng cao chất lượng dịch thuật máy, đến hỗ trợ chẩn đoán y tế và phân tích dữ liệu phức tạp.</p>

<p>Các chuyên gia dự đoán rằng ContextAI sẽ được tích hợp vào nhiều sản phẩm thương mại trong vòng 12-18 tháng tới, mở ra kỷ nguyên mới cho tương tác giữa con người và máy móc.</p>`,
    aiSummary:
      "Các nhà khoa học phát triển mô hình AI mới có tên ContextAI, có khả năng hiểu ngữ cảnh phức tạp với độ chính xác cao. Công nghệ này sử dụng kiến trúc transformer tiên tiến và có thể ứng dụng trong nhiều lĩnh vực từ trợ lý ảo đến y tế.",
    author: "Trần Thị Mai",
    category: "technology",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    publishedAt: new Date("2024-01-20T10:00:00Z").toISOString(),
    readTime: 5,
    tags: ["AI", "Công nghệ", "Nghiên cứu"],
    views: 15420,
  },
  {
    title: "Thị trường chứng khoán Việt Nam đạt mức cao kỷ lục",
    subtitle: "VN-Index vượt mốc 1,300 điểm lần đầu tiên trong lịch sử",
    content: `<p>Thị trường chứng khoán Việt Nam đã ghi nhận một cột mốc lịch sử khi chỉ số VN-Index vượt qua mức 1,300 điểm trong phiên giao dịch sáng nay, được thúc đẩy bởi dòng vốn ngoại mạnh mẽ và triển vọng kinh tế tích cực.</p>

<p>Phiên giao dịch chứng kiến sự tăng điểm đồng loạt ở hầu hết các nhóm ngành, với ngân hàng, bất động sản và công nghệ dẫn đầu đà tăng. Thanh khoản đạt mức cao với hơn 25,000 tỷ đồng được giao dịch.</p>

<p>"Đây là tín hiệu tích cực cho nền kinh tế Việt Nam," ông Lê Văn Hùng, Giám đốc Phân tích tại Công ty Chứng khoán ABC, nhận định. "Nhà đầu tư nước ngoài đang tăng cường đầu tư vào thị trường Việt Nam nhờ triển vọng tăng trưởng ổn định."</p>

<p>Các chuyên gia dự báo xu hướng tích cực này có thể tiếp tục trong ngắn hạn, nhưng cũng khuyến cáo nhà đầu tư cần thận trọng và đa dạng hóa danh mục đầu tư.</p>`,
    aiSummary:
      "VN-Index vượt mốc 1,300 điểm lần đầu tiên, được thúc đẩy bởi dòng vốn ngoại và triển vọng kinh tế tích cực. Thanh khoản đạt hơn 25,000 tỷ đồng với sự tăng điểm đồng loạt ở các nhóm ngành.",
    author: "Phạm Đức Anh",
    category: "business",
    imageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    publishedAt: new Date("2024-01-20T09:30:00Z").toISOString(),
    readTime: 4,
    tags: ["Chứng khoán", "Kinh tế", "Đầu tư"],
    views: 23150,
  },
  {
    title: "Đội tuyển Việt Nam giành chiến thắng ấn tượng",
    subtitle: "Thắng 3-0 trước đối thủ mạnh trong trận đấu giao hữu quốc tế",
    content: `<p>Đội tuyển bóng đá Việt Nam đã có màn trình diễn ấn tượng với chiến thắng 3-0 trước đội tuyển quốc gia xếp hạng cao hơn trong trận đấu giao hữu quốc tế tối qua tại sân vận động Mỹ Đình.</p>

<p>Trận đấu chứng kiến sự tỏa sáng của các cầu thủ trẻ, với hai bàn thắng từ tiền đạo Nguyễn Tiến Linh và một bàn từ tiền vệ Nguyễn Quang Hải. Đây là chiến thắng thuyết phục nhất của đội tuyển trong năm nay.</p>

<p>"Tôi rất tự hào về các cầu thủ," Huấn luyện viên trưởng chia sẻ sau trận. "Họ đã thể hiện tinh thần chiến đấu cao và thực hiện đúng chiến thuật đã được chuẩn bị."</p>

<p>Chiến thắng này giúp đội tuyển Việt Nam tăng 5 bậc trên bảng xếp hạng FIFA và tạo động lực lớn trước các trận đấu quan trọng sắp tới trong vòng loại World Cup.</p>`,
    aiSummary:
      "Đội tuyển Việt Nam thắng 3-0 trong trận giao hữu quốc tế với màn trình diễn ấn tượng của các cầu thủ trẻ. Chiến thắng giúp đội tuyển tăng 5 bậc trên bảng xếp hạng FIFA.",
    author: "Hoàng Minh Tuấn",
    category: "sports",
    imageUrl:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
    publishedAt: new Date("2024-01-19T22:00:00Z").toISOString(),
    readTime: 3,
    tags: ["Bóng đá", "Đội tuyển", "Thể thao"],
    views: 45230,
  },
  {
    title: "Khám phá mới về vũ trụ từ kính thiên văn James Webb",
    subtitle: "Phát hiện các thiên hà hình thành sớm hơn dự đoán 200 triệu năm",
    content: `<p>Kính thiên văn không gian James Webb đã gửi về những hình ảnh và dữ liệu đáng kinh ngạc, cho thấy các thiên hà đã hình thành sớm hơn nhiều so với những gì các nhà khoa học từng nghĩ.</p>

<p>Theo nghiên cứu mới được công bố trên tạp chí Nature, các thiên hà này đã tồn tại chỉ 200 triệu năm sau Vụ nổ Big Bang, sớm hơn 200 triệu năm so với ước tính trước đây.</p>

<p>"Đây là phát hiện đột phá," Giáo sư Sarah Johnson, nhà thiên văn học hàng đầu, cho biết. "Nó buộc chúng ta phải xem xét lại hiểu biết về quá trình hình thành thiên hà và vũ trụ sơ khai."</p>

<p>Các thiên hà này có cấu trúc phức tạp hơn dự kiến, với các ngôi sao đã phát triển và các hệ thống hành tinh đang hình thành. Điều này đặt ra nhiều câu hỏi mới về tốc độ tiến hóa của vũ trụ.</p>`,
    aiSummary:
      "Kính thiên văn James Webb phát hiện các thiên hà hình thành sớm hơn dự đoán 200 triệu năm, chỉ 200 triệu năm sau Big Bang. Phát hiện này thay đổi hiểu biết về quá trình hình thành thiên hà.",
    author: "Đỗ Thị Lan",
    category: "science",
    imageUrl:
      "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&q=80",
    publishedAt: new Date("2024-01-19T15:00:00Z").toISOString(),
    readTime: 6,
    tags: ["Vũ trụ", "Khoa học", "Thiên văn"],
    views: 18750,
  },
  {
    title: "Nghiên cứu mới về vaccine ung thư đầy hứa hẹn",
    subtitle:
      "Thử nghiệm lâm sàng cho kết quả tích cực với tỷ lệ thành công 72%",
    content: `<p>Một nghiên cứu đột phá về vaccine điều trị ung thư đã cho thấy kết quả đầy hứa hẹn trong giai đoạn thử nghiệm lâm sàng, với 72% bệnh nhân có đáp ứng tích cực.</p>

<p>Vaccine sử dụng công nghệ mRNA, tương tự như vaccine COVID-19, nhưng được thiết kế để kích hoạt hệ miễn dịch tấn công các tế bào ung thư cụ thể của từng bệnh nhân.</p>

<p>"Đây là bước tiến quan trọng trong điều trị ung thư," Tiến sĩ Nguyễn Thị Hương, trưởng nhóm nghiên cứu, giải thích. "Vaccine được cá nhân hóa dựa trên đặc điểm di truyền của khối u, giúp tăng hiệu quả điều trị."</p>

<p>Nghiên cứu tập trung vào ung thư da, phổi và đại trực tràng. Các bệnh nhân tham gia thử nghiệm cho thấy giảm kích thước khối u đáng kể và ít tác dụng phụ hơn so với hóa trị liệu truyền thống.</p>`,
    aiSummary:
      "Vaccine ung thư sử dụng công nghệ mRNA cho kết quả tích cực với 72% bệnh nhân đáp ứng tốt. Vaccine được cá nhân hóa dựa trên đặc điểm di truyền của khối u, giúp tăng hiệu quả điều trị.",
    author: "Lê Minh Khoa",
    category: "health",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    publishedAt: new Date("2024-01-19T11:00:00Z").toISOString(),
    readTime: 5,
    tags: ["Y tế", "Ung thư", "Vaccine"],
    views: 31200,
  },
];

export const seedFirebase = async (): Promise<boolean> => {
  try {
    console.log("🌱 Starting to seed Firebase...");

    // Check if articles already exist
    const articlesSnapshot = await getDocs(collection(db, "articles"));
    if (articlesSnapshot.size > 0) {
      console.log("⚠️ Articles already exist. Skipping seed...");
      return true;
    }

    // Seed articles
    let count = 0;
    for (const article of mockArticles) {
      const articleId = `article-${Date.now()}-${count}`;
      await setDoc(doc(db, "articles", articleId), {
        ...article,
        publishedAt: article.publishedAt,
      });
      console.log(
        `✅ Added article ${count + 1}/${mockArticles.length}: ${article.title}`
      );
      count++;
    }

    console.log("🎉 Firebase seeding completed successfully!");
    console.log(`📊 Total articles added: ${count}`);
    return true;
  } catch (error) {
    console.error("❌ Error seeding Firebase:", error);
    return false;
  }
};

// Helper function to clear all articles (use with caution!)
export const clearArticles = async (): Promise<boolean> => {
  try {
    console.log("🗑️ Clearing all articles...");
    const articlesSnapshot = await getDocs(collection(db, "articles"));

    const deletePromises = articlesSnapshot.docs.map((doc) => doc.ref.delete());

    await Promise.all(deletePromises);
    console.log("✅ All articles cleared!");
    return true;
  } catch (error) {
    console.error("❌ Error clearing articles:", error);
    return false;
  }
};
