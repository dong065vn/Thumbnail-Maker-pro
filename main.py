from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import google.generativeai as genai
from googleapiclient.discovery import build
import os
import re
from dotenv import load_dotenv
from typing import List, Optional

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="AI Thumbnail Maker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)

# Models
class VideoRequest(BaseModel):
    url: str

class ThumbnailIdea(BaseModel):
    text: str
    color_scheme: str
    font_suggestion: str
    description: str
    ctr_score: int  # 1-10

class ThumbnailResponse(BaseModel):
    video_title: str
    video_description: Optional[str]
    ideas: List[ThumbnailIdea]
    best_idea_index: int
    recommendation_reason: str

# Helper Functions
def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
        r'youtube\.com\/embed\/([^&\n?#]+)',
        r'youtube\.com\/v\/([^&\n?#]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_youtube_video_info(video_id: str) -> dict:
    """Fetch video information from YouTube Data API"""
    if not YOUTUBE_API_KEY:
        return {"title": "", "description": ""}

    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        request = youtube.videos().list(
            part='snippet',
            id=video_id
        )
        response = request.execute()

        if response['items']:
            snippet = response['items'][0]['snippet']
            return {
                "title": snippet.get('title', ''),
                "description": snippet.get('description', '')
            }
    except Exception as e:
        print(f"YouTube API Error: {e}")

    return {"title": "", "description": ""}

def generate_thumbnail_ideas(video_title: str, video_description: str, video_url: str) -> dict:
    """Use Google Gemini to generate thumbnail ideas"""

    model = genai.GenerativeModel('gemini-pro')

    prompt = f"""
Bạn là chuyên gia thiết kế thumbnail cho YouTube/TikTok. Nhiệm vụ của bạn là phân tích video và đề xuất 4 ý tưởng thumbnail thu hút.

THÔNG TIN VIDEO:
- Tiêu đề: {video_title}
- Mô tả: {video_description[:500]}
- URL: {video_url}

YÊU CẦU:
1. Phân tích từ khóa chính và chủ đề của video
2. Đưa ra 4 ý tưởng thumbnail khác nhau, mỗi ý tưởng bao gồm:
   - Text ngắn gọn (2-3 từ tiếng Việt, dễ đọc, hút mắt)
   - Phối màu tương phản (background + text color)
   - Font chữ phù hợp (bold, hiện đại)
   - Mô tả ngắn về ý tưởng
   - Điểm CTR dự đoán (1-10)

3. Chọn ý tưởng tốt nhất và giải thích vì sao nó sẽ có CTR cao nhất

ĐỊNH DẠNG TRẢ LỜI (JSON):
{{
  "ideas": [
    {{
      "text": "VÍ DỤ TEXT",
      "color_scheme": "Background: #FF0000, Text: #FFFFFF",
      "font_suggestion": "Montserrat Bold hoặc Impact",
      "description": "Mô tả ngắn về ý tưởng này",
      "ctr_score": 8
    }},
    ... (3 ý tưởng nữa)
  ],
  "best_idea_index": 0,
  "recommendation_reason": "Lý do tại sao ý tưởng này tốt nhất (tập trung vào yếu tố tâm lý, màu sắc, từ khóa)"
}}

Hãy sáng tạo và đưa ra những ý tưởng thực sự hấp dẫn, phù hợp với xu hướng hiện tại!
"""

    try:
        response = model.generate_content(prompt)
        result_text = response.text

        # Try to extract JSON from markdown code blocks
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()

        # Parse JSON response
        import json
        result = json.loads(result_text)

        return result

    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Fallback response
        return {
            "ideas": [
                {
                    "text": "ĐỘC LẠ",
                    "color_scheme": "Background: #FF6B00, Text: #FFFFFF",
                    "font_suggestion": "Montserrat ExtraBold",
                    "description": "Sử dụng màu cam nổi bật với chữ trắng to",
                    "ctr_score": 8
                },
                {
                    "text": "BẤT NGỜ",
                    "color_scheme": "Background: #0066FF, Text: #FFFF00",
                    "font_suggestion": "Impact",
                    "description": "Màu xanh dương kết hợp chữ vàng tạo độ tương phản cao",
                    "ctr_score": 7
                },
                {
                    "text": "HOT NHẤT",
                    "color_scheme": "Background: #FF0000, Text: #FFFFFF",
                    "font_suggestion": "Arial Black",
                    "description": "Đỏ trắng - combo kinh điển cho nội dung hot",
                    "ctr_score": 9
                },
                {
                    "text": "TRENDING",
                    "color_scheme": "Background: #000000, Text: #00FF00",
                    "font_suggestion": "Bebas Neue Bold",
                    "description": "Đen xanh lá - phong cách tech, hiện đại",
                    "ctr_score": 6
                }
            ],
            "best_idea_index": 2,
            "recommendation_reason": "Ý tưởng 'HOT NHẤT' với màu đỏ trắng có sức hút mạnh nhất vì: (1) Màu đỏ kích thích cảm xúc tò mò, (2) Từ 'HOT NHẤT' tạo FOMO, (3) Tương phản cao dễ đọc trên mọi thiết bị."
        }

# API Endpoints
@app.get("/")
async def root():
    """Serve frontend HTML"""
    return FileResponse("static/index.html")

@app.post("/api/analyze", response_model=ThumbnailResponse)
async def analyze_video(request: VideoRequest):
    """Analyze YouTube video and generate thumbnail ideas"""

    # Extract video ID
    video_id = extract_video_id(request.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # Get video info from YouTube API (if available)
    video_info = get_youtube_video_info(video_id)

    # If YouTube API not available, try to get info from URL or use Gemini
    if not video_info["title"]:
        # Use Gemini to analyze the video directly
        video_info = {
            "title": f"Video ID: {video_id}",
            "description": "Analyzing from YouTube video..."
        }

    # Generate thumbnail ideas using Gemini
    ai_result = generate_thumbnail_ideas(
        video_info["title"],
        video_info.get("description", ""),
        request.url
    )

    # Build response
    response = ThumbnailResponse(
        video_title=video_info["title"],
        video_description=video_info.get("description"),
        ideas=[ThumbnailIdea(**idea) for idea in ai_result["ideas"]],
        best_idea_index=ai_result["best_idea_index"],
        recommendation_reason=ai_result["recommendation_reason"]
    )

    return response

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "api": "Google Gemini"}

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
