import styled from "@emotion/styled";
import { useRef, useState } from "react";

export default function ResumePage() {
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const [fileName1, setFileName1] = useState("");
  const [fileName2, setFileName2] = useState("");

  const [url, setUrl] = useState("");

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDF 파일만 첨부할 수 있습니다.");
      e.target.value = "";
      return;
    }

    setFileName1(file.name);
  };

  const handleCoverLetterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDF 파일만 첨부할 수 있습니다.");
      e.target.value = "";
      return;
    }

    setFileName2(file.name);
  };

  const [job, setJob] = useState("");

  return (
    <Container>
      <InputWrapper>
        <Title>
          이력서 & 자기소개서 <Highlight>첨삭 서비스</Highlight>
        </Title>
        <Content>
          지원하는 채용 공고를 기반으로 이력서와 자기소개서의 강점과 약점을
          정확하게 분석하여, 합격률을 높이는 맞춤형 피드백을 제공합니다.
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
                {fileName1 || "이력서 업로드"}
              </FileLabel>
              <UploadButton
                type="button"
                onClick={() => fileInputRef1.current.click()}
              >
                파일 선택
              </UploadButton>
              <FileInput
                type="file"
                accept=".pdf,application/pdf"
                ref={fileInputRef2}
                onChange={handleCoverLetterChange}
              />

              <FileLabel hasFile={!!fileName2}>
                {fileName2 || "자기소개서 업로드"}
              </FileLabel>
              <UploadButton
                type="button"
                onClick={() => fileInputRef2.current.click()}
              >
                파일 선택
              </UploadButton>
              <ListWrap>
                <ListLabel>직무 역할 선택</ListLabel>
                <Select value={job} onChange={(e) => setJob(e.target.value)}>
                  <option value="">선택하세요</option>
                  <option value="weak">111</option>
                  <option value="normal">222</option>
                  <option value="strong">333</option>
                </Select>
              </ListWrap>
            </InputBox>
            <Input
              type="url"
              placeholder="채용공고 URL을 입력하세요."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <SubmitButton>분석하기</SubmitButton>
          </FormBox>
        </FormWrap>
      </InputWrapper>
      <ThumbWrapper>
        <ThumbLeft></ThumbLeft>
        <ThumbRight></ThumbRight>
      </ThumbWrapper>
      <FeedbackWrapper>
        <FeedTitle>
          종합 피드백 <Highlight>요약</Highlight>
        </FeedTitle>
        <FeedContent></FeedContent>
      </FeedbackWrapper>
    </Container>
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
const FeedContent = styled.div``;
