import { useEffect, useState } from "react"
import styled from "@emotion/styled"

export default function QuestionPage() {
  // DB에서 받아올 직무 카테고리 목록
  const [jobOptions, setJobOptions] = useState([])
  const [jobLoading, setJobLoading] = useState(false)
  const [jobError, setJobError] = useState("")

  // 직무 역할 선택
  const [job, setJob] = useState("")

  // 채용 공고 URL 입력
  const [url, setUrl] = useState("")
  const [urlError, setUrlError] = useState("")

  // 자기소개서 텍스트 입력
  const [resume, setResume] = useState("")

  // 업로드 상태/결과
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadedId, setUploadedId] = useState(null)

  // 분석 시작
  const [feedback, setFeedback] = useState("")
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobLoading(true)
        setJobError("")

        // TODO: 백엔드 주소에 맞게 수정
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/job-categories`
        )

        if (!res.ok) throw new Error("직무 목록을 불러오지 못했습니다.")
        const data = await res.json()

        // data: [{id, code, name}, ...] 기대
        setJobOptions(Array.isArray(data) ? data : [])
      } catch (e) {
        setJobError(e.message || "직무 목록 로딩 실패")
        setJobOptions([])
      } finally {
        setJobLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // 업로드 버튼 클릭 핸들러 (job_resume 테이블 INSERT)
  const handleUpload = async () => {
    try {
      setUploadError("")
      setUploadedId(null)

      if (!job) return setUploadError("직무 역할을 선택해주세요.")
      const text = resume.trim()
      if (text.length < 200)
        return setUploadError("자기소개서는 최소 200자 이상 입력해주세요.")
      if (text.length > 4000)
        return setUploadError("최대 4000자까지 입력 가능합니다.")

      setUploadLoading(true)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/job-resumes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 세션 쓰면 유지하는 게 안전
        body: JSON.stringify({
          jc_code: job,
          jrs_text: text,
          jrs_type: "text",
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) return setUploadError(data?.error || "업로드 실패")

      setUploadedId(data?.jrs_id ?? null)
    } catch (e) {
      setUploadError(e.message || "업로드 중 오류")
    } finally {
      setUploadLoading(false)
    }
  }

  // 채용공고 URL 형식 체크 (http/https만 허용)
  const isValidHttpUrl = (value) => {
    const v = (value || "").trim()
    if (!v) return false
    try {
      const u = new URL(v)
      return u.protocol === "http:" || u.protocol === "https:"
    } catch {
      return false
    }
  }

  const canAnalyze =
    !!job &&
    resume.trim().length >= 200 &&
    resume.trim().length <= 4000 &&
    isValidHttpUrl(url)

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    if (urlError) setUrlError("")
    if (actionError) setActionError("")
  }

  // 분석 시작 버튼 클릭 핸들러 ()
  const handleAnalyze = async () => {
    try {
      setActionError("")
      setUrlError("")
      setFeedback("")

      // validation
      if (!job) return setActionError("직무 역할을 선택해주세요")

      const urlText = (url || "").trim()

      if (!urlText) {
        setUrlError("채용공고 URL을 입력해주세요")
        return
      }
      if (!isValidHttpUrl(urlText)) {
        setActionError("채용공고 URL 형식이 올바르지 않습니다.")
        return
      }

      const text = resume.trim()
      if (text.length < 200)
        return setActionError("자기소개서는 최소 200자 이상 입력해주세요.")
      if (text.length > 4000)
        return setActionError("최대 4000자까지 입력 가능합니다.")

      setAnalysisLoading(true)

      // 직무명(선택) - jobOptions에서 찾아서 같이 보냄
      const selected = jobOptions.find((x) => String(x.jc_code) === String(job))
      const jobName = selected?.jc_name || null

      const res = await fetch(`${import.meta.env.VITE_AI_URL}/resume/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 세션/쿠키 안 쓰면 credentials 없어도 됨
        credentials: "include",
        body: JSON.stringify({
          jc_code: job,
          job_name: jobName,
          url: urlText,
          resume_text: text,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok)
        return setActionError(data?.detail || data?.error || "분석 실패")

      setFeedback(data.feedback || "")
    } catch (e) {
      setActionError(e.message || "분석 중 오류가 발생했습니다.")
    } finally {
      setAnalysisLoading(false)
    }
  }

  return (
    <Page>
      <Shell>
        <Side>
          <Card>
            <CardHeader>
              <HeaderLeft>
                <IconBox aria-hidden>💼</IconBox>
                <CardTitle>직무 역할 선택</CardTitle>
              </HeaderLeft>
            </CardHeader>

            <CardBody>
              <Hint>지원하시는 직무 역할을 선택하세요.</Hint>
              {/* <Select value={job} onChange={(e) => setJob(e.target.value)}>
                <option value="">선택하세요</option>
                <option value="">기획·전략</option>
                <option value="">마케팅·홍보·조사</option>
                <option value="">회계·세무·재무</option>
                <option value="">인사·노무·HRD</option>
                <option value="">총무·법무·사무</option>
                <option value="">IT개발·데이터</option>
                <option value="">디자인</option>
                <option value="">영업·판매·무역</option>
                <option value="">고객상담·TM</option>
                <option value="">구매·자재·물류</option>
                <option value="">상품기획·MD</option>
                <option value="">운전·운송·배송</option>
                <option value="">서비스</option>
                <option value="">생산</option>
                <option value="">건설·건축</option>
                <option value="">의료</option>
                <option value="">연구·R&D</option>
                <option value="">교육</option>
                <option value="">미디어·문화·스포츠</option>
                <option value="">금융·보험</option>
                <option value="">공공·복지</option>
              </Select> */}
              <Select
                value={job}
                onChange={(e) => setJob(e.target.value)}
                disabled={jobLoading}
              >
                <option value="">
                  {jobLoading ? "불러오는 중..." : "직무 역할 선택"}
                </option>

                {jobOptions.map((opt) => (
                  <option key={String(opt.jc_code)} value={opt.jc_code}>
                    {opt.jc_name}
                  </option>
                ))}
              </Select>

              {jobError && <ErrorText>{jobError}</ErrorText>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <HeaderLeft>
                <IconBox aria-hidden>🔗</IconBox>
                <CardTitle>채용공고 URL 입력</CardTitle>
              </HeaderLeft>
            </CardHeader>

            <CardBody>
              <Hint>채용공고 URL을 넣어주세요.</Hint>
              <InputWrap>
                <InputIcon aria-hidden>🔗</InputIcon>
                <Input
                  type="url"
                  placeholder="채용공고 URL"
                  value={url}
                  onChange={handleUrlChange}
                />
              </InputWrap>

              {urlError && <ErrorText>{urlError}</ErrorText>}
            </CardBody>
          </Card>
        </Side>

        <Main>
          {/* 자기소개서 진단, 피드백 부분*/}
          <Card>
            <CardHeader>
              <HeaderLeft>
                <IconBox aria-hidden>📄</IconBox>
                <CardTitle>자기소개서 진단</CardTitle>
              </HeaderLeft>
            </CardHeader>

            <CardBody>
              <Hint>
                자기소개서를 입력해주세요
                <br />
                최소 <b>200자</b> 이상 최대 <b>4000자</b>까지 입력해주셔야 진단
                가능합니다.
              </Hint>

              <Textarea
                placeholder="여기에 자기소개서를 입력하세요."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                disabled={uploadLoading}
              />
              <BottomRow>
                <Count>{resume.length} / 4000</Count>

                {/* 업로드 버튼에 onClick 연결 */}
                <UploadButton
                  type="button"
                  onClick={handleUpload}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? "업로드 중..." : "업로드"}
                </UploadButton>
                <PrimaryButton
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analysisLoading}
                  title={
                    !canAnalyze
                      ? "직무 선택, 채용공고 URL, 자기소개서(200~4000자)를 모두 입력해주세요."
                      : ""
                  }
                >
                  {analysisLoading ? "분석 중..." : "분석 시작"}
                </PrimaryButton>
              </BottomRow>
              {/* 업로드 에러/성공 표시 */}
              {uploadError && <ErrorText>{uploadError}</ErrorText>}
              {uploadedId && (
                <SuccessText>업로드 완료! (id: {uploadedId})</SuccessText>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <HeaderLeft>
                <IconBox aria-hidden>🧠</IconBox>
                <CardTitle>AI 코칭 피드백</CardTitle>
              </HeaderLeft>
            </CardHeader>

            <CardBody>
              <Hint>
                AI가 자기소개서 진단 후 피드백을 제공해주는 공간입니다.
              </Hint>
              <FeedbackArea>
                {analysisLoading ? (
                  <FeedbackText>분석 중입니다...</FeedbackText>
                ) : actionError ? (
                  <FeedbackError>{actionError}</FeedbackError>
                ) : feedback ? (
                  <FeedbackText>{feedback}</FeedbackText>
                ) : (
                  <FeedbackPlaceholder>
                    여기에 AI 피드백이 표시됩니다.
                  </FeedbackPlaceholder>
                )}
              </FeedbackArea>
            </CardBody>
          </Card>
        </Main>
      </Shell>
    </Page>
  )
}

const ErrorText = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: #d63b52;
`

const SuccessText = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: #1a7f37;
`

/* ---------------- styles ---------------- */

const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  background: White;
  padding: 24px 14px;
`

const Shell = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Card = styled.section`
  background: #fff;
  border: 2px solid var(--strawberry-color);
  border-radius: 14px;
  overflow: hidden;
`

const CardHeader = styled.header`
  padding: 14px 16px;
  border-bottom: 2px solid var(--strawberry-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const IconBox = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(224, 82, 105, 0.35);
  background: rgba(224, 82, 105, 0.06);
  font-size: 15px;
`

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #111;
`

const CardBody = styled.div`
  padding: 16px;
`

const Hint = styled.p`
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #555;
  line-height: 1.45;
`

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
  color: #333;
  background: #fff;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--strawberry-color);
  }
`

const InputWrap = styled.div`
  position: relative;
`

const InputIcon = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.6;
`

const Input = styled.input`
  width: 100%;
  padding: 10px 12px 10px 34px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--strawberry-color);
  }
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 280px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #f3f3f3;
  resize: none;
  font-size: 14px;
  line-height: 1.5;

  &:focus {
    outline: 2px solid rgba(224, 82, 105, 0.35);
    background: #f6f6f6;
  }
`

const BottomRow = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`

const Count = styled.span`
  font-size: 12px;
  color: #777;
`

const PrimaryButton = styled.button`
  padding: 9px 14px;
  border-radius: 10px;
  background: var(--strawberry-color);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;

  &:hover {
    opacity: 0.92;
  }
`

const UploadButton = styled.button`
  padding: 9px 14px;
  border-radius: 10px;
  background: var(--strawberry-color);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  margin-left: auto;

  &:hover {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const FeedbackArea = styled.div`
  height: 260px;
  border-radius: 12px;
  background: #f3f3f3;
  overflow: auto; /* 내용 길면 스크롤 */
`

const FeedbackText = styled.pre`
  margin: 0;
  padding: 12px;
  white-space: pre-wrap; /* 줄바꿈 유지 */
  word-break: break-word;
  font-size: 13px;
  line-height: 1.6;
  color: #222;
`

const FeedbackPlaceholder = styled.p`
  margin: 0;
  padding: 12px;
  font-size: 13px;
  color: #888;
`

const FeedbackError = styled.p`
  margin: 0;
  padding: 12px;
  font-size: 13px;
  color: #d63b52;
  font-weight: 700;
`
