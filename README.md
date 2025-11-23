# 🎨 AI Thumbnail Maker

Ứng dụng AI giúp bạn tạo ý tưởng thumbnail YouTube/TikTok cực hút mắt chỉ trong vài phút, được hỗ trợ bởi **Google Gemini AI**.

![AI Thumbnail Maker](https://img.shields.io/badge/AI-Gemini-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![Python](https://img.shields.io/badge/Python-3.8+-yellow)

## 📌 Tính năng

- ✅ **Phân tích video YouTube tự động** - Nhập URL và để AI làm việc
- ✅ **4 ý tưởng thumbnail đa dạng** - Mỗi ý tưởng có phong cách riêng
- ✅ **Gợi ý màu sắc tương phản** - Tối ưu để thu hút ánh nhìn
- ✅ **Font chữ hiện đại** - Dễ đọc, nổi bật
- ✅ **Text ngắn gọn 2-3 từ** - Tối ưu CTR (Click-Through Rate)
- ✅ **AI đề xuất ý tưởng tốt nhất** - Kèm giải thích chi tiết
- ✅ **Điểm CTR dự đoán** - Đánh giá từ 1-10 cho mỗi ý tưởng

## 🚀 Cách hoạt động

1. **Nhập URL video YouTube** vào ô input
2. **AI phân tích** tiêu đề và nội dung video
3. **Tạo 4 ý tưởng thumbnail** với:
   - Dòng chữ ngắn gọn (2-3 từ)
   - Phối màu tương phản
   - Font chữ hiện đại
   - Mô tả chi tiết
4. **Đề xuất ý tưởng tốt nhất** với lý do thuyết phục

## 📦 Cài đặt

### Yêu cầu

- Python 3.8 trở lên
- Google Gemini API Key (miễn phí tại [Google AI Studio](https://makersuite.google.com/app/apikey))
- YouTube Data API Key (tùy chọn, để lấy thêm thông tin video)

### Bước 1: Clone repository

```bash
git clone https://github.com/dong065vn/Thumbnail-Maker-pro.git
cd Thumbnail-Maker-pro
```

### Bước 2: Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### Bước 3: Cấu hình API Keys

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Mở file `.env` và thêm API keys của bạn:
   ```
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   YOUTUBE_API_KEY=your_youtube_api_key_here  # (optional)
   ```

### Bước 4: Chạy ứng dụng

```bash
python main.py
```

hoặc

```bash
uvicorn main:app --reload
```

### Bước 5: Mở trình duyệt

Truy cập: `http://localhost:8000`

## 🔑 Lấy Google Gemini API Key

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng tài khoản Google
3. Click **"Get API Key"** hoặc **"Create API Key"**
4. Copy API key và paste vào file `.env`

**Lưu ý:** Google Gemini API có gói miễn phí với giới hạn 60 requests/phút, đủ cho việc sử dụng cá nhân.

## 🔑 Lấy YouTube Data API Key (Tùy chọn)

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **YouTube Data API v3**
4. Tạo credentials (API Key)
5. Copy API key và paste vào file `.env`

**Lưu ý:** Nếu không có YouTube API Key, ứng dụng vẫn hoạt động bình thường với thông tin video được AI phân tích từ URL.

## 💡 Ví dụ sử dụng

### Input:
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Output:

**Ý tưởng 1:**
- Text: "SHOCKING!"
- Màu: Background: #FF0000, Text: #FFFFFF
- Font: Montserrat ExtraBold
- CTR Score: 9/10

**Ý tưởng 2:**
- Text: "CỰC HOT"
- Màu: Background: #FF6B00, Text: #FFFFFF
- Font: Impact
- CTR Score: 8/10

**... và 2 ý tưởng nữa**

**Đề xuất tốt nhất:** Ý tưởng số 1 vì màu đỏ tạo sự kích thích mạnh mẽ, từ "SHOCKING" gây tò mò...

## 📁 Cấu trúc dự án

```
Thumbnail-Maker-pro/
├── main.py              # FastAPI backend
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore file
├── README.md           # Tài liệu này
└── static/             # Frontend files
    ├── index.html      # Giao diện chính
    ├── styles.css      # Styling
    └── script.js       # JavaScript logic
```

## 🛠️ API Documentation

### POST `/api/analyze`

Phân tích video YouTube và tạo ý tưởng thumbnail.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "video_title": "Tiêu đề video",
  "video_description": "Mô tả video...",
  "ideas": [
    {
      "text": "TEXT NGẮN",
      "color_scheme": "Background: #FF0000, Text: #FFFFFF",
      "font_suggestion": "Montserrat Bold",
      "description": "Mô tả ý tưởng",
      "ctr_score": 8
    },
    ...
  ],
  "best_idea_index": 0,
  "recommendation_reason": "Lý do đề xuất..."
}
```

## 🎯 Ứng dụng thực tế

- **YouTubers:** Tạo thumbnail thu hút để tăng lượt xem
- **TikTokers:** Ý tưởng cover video hấp dẫn
- **Content Creators:** Tối ưu CTR cho các nền tảng video
- **Marketers:** Thiết kế thumbnail quảng cáo hiệu quả

## 🌟 Tính năng sắp tới

- [ ] Tạo hình ảnh thumbnail trực tiếp (không chỉ ý tưởng)
- [ ] Hỗ trợ TikTok và Facebook Video
- [ ] Phân tích A/B Testing cho thumbnail
- [ ] Export ý tưởng ra PDF/PNG
- [ ] Lưu lịch sử phân tích

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo Pull Request hoặc mở Issue nếu bạn có ý tưởng cải thiện.

## 📝 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🙏 Credits

- **Google Gemini AI** - Công nghệ AI mạnh mẽ
- **FastAPI** - Framework web hiện đại
- **YouTube Data API** - Dữ liệu video

## 📧 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo Issue trên GitHub.

---

**Made with ❤️ and AI**
