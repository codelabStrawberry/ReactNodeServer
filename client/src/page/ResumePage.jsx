import styled from "@emotion/styled";
import { useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { createPortal } from "react-dom";

const SARAMIN_CATEGORIES = {
  16: "기획·전략",
  14: "마케팅·홍보·조사",
  3: "회계·세무·재무",
  5: "인사·노무·HRD",
  4: "총무·법무·사무",
  2: "IT개발·데이터",
  15: "디자인",
  8: "영업·판매·무역",
  21: "고객상담·TM",
  18: "구매·자재·물류",
  12: "상품기획·MD",
  7: "운전·운송·배송",
  10: "서비스",
  11: "생산",
  22: "건설·건축",
  6: "의료",
  9: "연구·R&D",
  19: "교육",
  13: "미디어·문화·스포츠",
  17: "금융·보험",
  20: "공공·복지",
};

function LoadingOverlay({ isLoading }) {
  if (!isLoading) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999, // iframe 위로
      }}
    >
      <div
        style={{
          padding: "24px",
          backgroundColor: "white",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #3b82f6",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ fontSize: "16px", fontWeight: "500" }}>
          분석 중입니다. 잠시만 기다려주세요...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default function ResumePage() {
  const fileInputRef1 = useRef(null);

  const [fileName1, setFileName1] = useState("");

  const [job, setJob] = useState("");
  const [url, setUrl] = useState("");

  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [categoryKey, setCategoryKey] = useState("");
  const [categoryText, setCategoryText] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDF 파일만 첨부할 수 있습니다.");
      e.target.value = "";
      return;
    }

    setCoverLetterFile(file);
    setFileName1(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCategoryChange = (e) => {
    const key = e.target.value;
    setCategoryKey(key);
    setCategoryText(SARAMIN_CATEGORIES[key] || "");
  };

  /** 서버 전송 */
  const handleSubmit = async () => {
    if (!categoryKey || !coverLetterFile) {
      alert("직무와 자기소개서를 모두 입력해주세요.");
      return;
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      console.log("URL이 유효해서 formData에 추가되었습니다:", url);
    } else {
      alert("URL이 http:// 또는 https://로 시작하지 않습니다:");
      return;
    }
    const formData = new FormData();
    formData.append("job", categoryKey);
    formData.append("url", url);
    formData.append("coverLetter", coverLetterFile);

    setIsLoading(true);

    // 잠깐 렌더링 기회를 주기 위해 Promise.resolve().then(...) 활용
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_AI_URL}/jobfit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("분석 결과:", res.data.response.answer);
      // ⭐ 핵심
      setAnalysisResult(res.data.response.answer);
    } catch (err) {
      console.error(err);
      alert("서버 전송 실패");
    } finally {
      setIsLoading(false); // 🔹 로딩 종료
    }
  };

  return (
    <>
      <Container>
        <InputWrapper>
          <Title>
            이력서 & 자기소개서 <Highlight>첨삭 서비스</Highlight>
          </Title>
          <Content>
            지원하는 채용 공고를 기반으로 자기소개서의 강점과 약점을 정확하게
            분석하여, 합격률을 높이는 맞춤형 피드백을 제공합니다.
          </Content>
          <FormWrap>
            <FormBox>
              <InputBox>
                <FileInput
                  type="file"
                  accept=".pdf,application/pdf"
                  ref={fileInputRef1}
                  onChange={handleResumeChange}
                />

                <FileLabel hasFile={!!fileName1}>
                  {fileName1 || "자기소개서 업로드"}
                </FileLabel>
                <UploadButton
                  type="button"
                  onClick={() => fileInputRef1.current.click()}
                >
                  파일 선택
                </UploadButton>
                <ListWrap>
                  <ListLabel>직무 역할 선택</ListLabel>
                  <Select value={categoryKey} onChange={handleCategoryChange}>
                    <option value="">선택하세요</option>
                    {Object.entries(SARAMIN_CATEGORIES).map(([key, text]) => (
                      <option key={key} value={key}>
                        {text}
                      </option>
                    ))}
                  </Select>
                </ListWrap>
              </InputBox>
              <Input
                type="url"
                placeholder="채용공고 URL을 입력하세요."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <SubmitButton onClick={handleSubmit}>분석하기</SubmitButton>
            </FormBox>
          </FormWrap>
        </InputWrapper>
        {/* PDF 미리보기 */}
        {previewUrl && (
          <PreviewWrapper>
            <PreviewTitle>자기소개서 미리보기</PreviewTitle>
            <PreviewFrame src={previewUrl} />
          </PreviewWrapper>
        )}
        {/* 종합 피드백 */}
        {analysisResult && (
          <FeedbackWrapper>
            <FeedTitle>
              종합 피드백 <Highlight>요약</Highlight>
            </FeedTitle>
            <FeedContent>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisResult}
              </ReactMarkdown>
            </FeedContent>
          </FeedbackWrapper>
        )}
      </Container>
      <LoadingOverlay isLoading={isLoading} />
    </>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const InputWrapper = styled.div`
  margin-top: 3em;
`;

const Title = styled.h1`
  font-size: 3em;
  text-align: center;
  font-weight: 600;
`;
const Highlight = styled.span`
  color: var(--strawberry-color);
`;
const Content = styled.div`
  text-align: center;
`;
const FormWrap = styled.div`
  display: flex;
  margin-top: 50px;
  margin-bottom: 50px;
`;
const FormBox = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: auto;
`;
const InputBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;
const FileInput = styled.input`
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  display: none;
`;
const FileLabel = styled.span`
  flex: 6;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ hasFile }) => (hasFile ? "#333" : "#555")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const UploadButton = styled.button`
  flex: 2;
  padding: 8px 14px;
  border-radius: 8px;
  background-color: var(--strawberry-color);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }
`;
const ListWrap = styled.div`
  flex: 6;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ListLabel = styled.label`
  flex: 4;
  width: 100%;
  font-size: 14px;
  color: #555;
`;
const Select = styled.select`
  flex: 6;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  color: #555;
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--strawberry-color);
  }
`;
const Input = styled.input`
  width: 91%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  margin-bottom: 5px;
  margin-right: 10px;

  &:focus {
    outline: none;
    border-color: var(--strawberry-color);
  }
`;
const SubmitButton = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  background-color: var(--strawberry-color);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }
`;
const ThumbWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 50px;
  background: #f9f9f9ff;
  padding: 50px 120px 50px 120px;
`;
const ThumbLeft = styled.div`
  flex: 1;
  height: 600px;
  border: 2px solid var(--strawberry-color);
  background: #fff;

  border-radius: 12px;
`;
const ThumbRight = styled.div`
  flex: 1;
  height: 600px;
  border: 2px solid var(--strawberry-color);
  background: #fff;

  border-radius: 12px;
`;

const FeedbackWrapper = styled.div`
  padding: 20px 20px;
  border: 2px solid var(--strawberry-color);
  border-radius: 12px;
  margin-top: 50px;
  margin-left: 120px;
  margin-right: 120px;
`;
const FeedTitle = styled.h2`
  position: relative;

  &::after {
    content: "";
    display: block;
    width: 100%; /* 글자 길이만큼 */
    height: 3px; /* 밑줄 두께 */
    background-color: var(--strawberry-color);
    margin-top: 6px; /* 글자와 간격 */
  }
`;

const PreviewWrapper = styled.div`
  margin: 50px 120px;
`;

const PreviewTitle = styled.h2`
  margin-bottom: 10px;
`;

const PreviewFrame = styled.iframe`
  width: 100%;
  height: 600px;
  border: 2px solid var(--strawberry-color);
  border-radius: 12px;
`;

const FeedContent = styled.div`
  margin-top: 20px;
  line-height: 1.8;
  font-size: 15px;
  color: #333;

  h1,
  h2,
  h3 {
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: 600;
  }

  strong {
    color: var(--strawberry-color);
    font-weight: 600;
  }

  ul {
    padding-left: 20px;
    margin: 10px 0;
  }

  li {
    margin-bottom: 6px;
  }

  p {
    margin-bottom: 10px;
  }
`;
