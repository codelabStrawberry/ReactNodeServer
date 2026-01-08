import styled from "@emotion/styled";
import { useRef, useState } from "react";
import Chatbot from "../components/Chatbot";
import { startInterview } from "../api/chat";

export default function ChatPage() {
  // url 등록
  const [url, setUrl] = useState("");

  // 파일 업로드
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // 서버에서 받은 결과(프롬프트 포함)
  const [startPayload, setStartPayload] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDF 파일만 첨부할 수 있습니다.");
      e.target.value = "";
      setFileName("");
      setSelectedFile(null);
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
  };

  const handleStart = async () => {
    if (!url || !selectedFile) {
      alert("URL과 PDF 파일을 모두 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);

      const data = await startInterview({
        url,
        file: selectedFile,
        sessionId: newSessionId,
      });

      // 서버가 sessionId를 다시 내려주면 그걸 최종으로 사용(백엔드가 생성하는 구조로 바꿀 수도 있어서)
      if (data?.sessionId) setSessionId(data.sessionId);

      setStartPayload(data);
    } catch (e) {
      console.error(e);
      alert("면접 시작 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    setStartPayload(null);
    setUrl("");
    setFileName("");
    setSessionId(crypto.randomUUID());
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Container>
      <LeftWrapper>
        <LeftWrap>
          <Title>
            <Highlight>AI</Highlight> 가상면접
          </Title>

          <Form onSubmit={(e) => e.preventDefault()}>
            <UrlWrap>
              <UrlLabel>URL 입력</UrlLabel>
              <Input
                type="url"
                placeholder="채용공고 URL을 입력하세요."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </UrlWrap>

            <FileWrap>
              <FileInput
                type="file"
                accept=".pdf,application/pdf"
                ref={fileInputRef}
                onChange={handleChange}
                disabled={isLoading}
              />

              <FileLabel hasFile={!!fileName}>
                {fileName ? fileName : "자기소개서를 PDF 파일로 첨부"}
              </FileLabel>

              <UploadButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                파일 선택
              </UploadButton>
            </FileWrap>

            <BtnWrap>
              <StartButton
                type="button"
                onClick={handleStart}
                disabled={isLoading}
              >
                {isLoading ? "준비 중..." : "면접 시작"}
              </StartButton>

              <FinishButton
                type="button"
                onClick={handleFinish}
                disabled={isLoading}
              >
                면접 종료
              </FinishButton>
            </BtnWrap>
          </Form>
        </LeftWrap>
      </LeftWrapper>

      <RightWrapper>
        {/* ✅ Chatbot이 prompt/jobText/resumeText를 사용 가능 */}
        <Chatbot
          startPayload={startPayload}
          sessionId={sessionId}
          disabled={!startPayload || isLoading}
        />
      </RightWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 20px;
`;
const LeftWrapper = styled.div`
  flex: 1 1 0;
  min-width: 0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const LeftWrap = styled.div`
  width: 100%;
  max-width: 600px;
`;
const Title = styled.h1`
  margin-bottom: 1.5em;
  text-align: center;
  font-weight: 600;
`;
const Highlight = styled.span`
  color: var(--strawberry-color);
`;
const Form = styled.form`
  width: 100%;
`;
const UrlWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;
const UrlLabel = styled.span`
  flex: 2;
  font-size: 14px;
  color: #555;
`;
const Input = styled.input`
  flex: 8;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  margin-bottom: 5px;

  &:focus {
    outline: none;
    border-color: var(--strawberry-color);
  }
`;
const FileWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
`;
const FileInput = styled.input`
  display: none;
`;
const FileLabel = styled.span`
  flex: 8;
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
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const BtnWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 2em;
  margin-top: 3em;
`;
const StartButton = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  background-color: var(--strawberry-color);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);

  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const FinishButton = styled(StartButton)`
  background-color: var(--strawberry-color);
`;
const RightWrapper = styled.div`
  flex: 1 1 0;
  min-width: 0;
  padding: 10px;
`;
