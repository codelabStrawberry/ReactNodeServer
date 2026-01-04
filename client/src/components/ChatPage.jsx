import styled from "@emotion/styled";
import { useRef, useState } from "react";
import Chatbot from "./Chatbot";

export default function ChatPage() {
  // url 등록
  const [url, setUrl] = useState("");

  // 파일 업로드
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDF 파일만 첨부할 수 있습니다.");
      e.target.value = "";
      setFileName("");
      return;
    }
    setFileName(file.name);
  };

  // 압박 강도
  const [level, setLevel] = useState("");

  return (
    <Container>
      <LeftWrapper>
        <LeftWrap>
          <Title>
            <Highlight>AI</Highlight> 가상면접
          </Title>
          <Form>
            <UrlWrap>
              <UrlLabel>URL 입력</UrlLabel>
              <Input
                type="url"
                placeholder="채용공고 URL을 입력하세요."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </UrlWrap>
            <FileWrap>
              <FileInput
                type="file"
                accept=".pdf,application/pdf"
                ref={fileInputRef}
                onChange={handleChange}
              />
              <FileLabel hasFile={!!fileName}>
                {fileName
                  ? fileName
                  : "이력서와 자기소개서를 하나의 PDF 파일로 첨부"}
              </FileLabel>
              <UploadButton
                type="button"
                onClick={() => fileInputRef.current.click()}
              >
                파일 선택
              </UploadButton>
            </FileWrap>
            <ListWrap>
              <ListLabel>면접 강도</ListLabel>
              <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">선택하세요</option>
                <option value="weak">약하게</option>
                <option value="normal">보통</option>
                <option value="strong">강하게</option>
              </Select>
            </ListWrap>
            <BtnWrap>
              <StartButton>면접 시작</StartButton>
              <FinishButton>면접 종료</FinishButton>
            </BtnWrap>
          </Form>
        </LeftWrap>
      </LeftWrapper>
      <RightWrapper>
        <Chatbot />
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
  flex: 0;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
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
`;
const ListWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 50px;
`;

const ListLabel = styled.label`
  flex: 2;
  width: 100%;
  font-size: 14px;
  color: #555;
`;

const Select = styled.select`
  flex: 8;
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
const BtnWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 2em;
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
`;
const FinishButton = styled.button`
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
`;
const RightWrapper = styled.div`
  flex: 1 1 0;
  min-width: 0;
  padding: 10px;
`;
