import { useEffect, useRef, useState } from "react"
import styled from "@emotion/styled"

export default function InterviewPage() {
  // DB에서 받아올 직무 카테고리 목록
  const [jobOptions, setJobOptions] = useState([])
  const [jobLoading, setJobLoading] = useState(false)
  const [jobError, setJobError] = useState("")

  // 직무 역할 선택
  const [job, setJob] = useState("")
  const [url, setUrl] = useState("")
  const [urlError, setUrlError] = useState("")

  // 자기소개서 pdf 파일 업로드
  const fileRef = useRef(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [fileError, setFileError] = useState("")

  // AI 질문 생성
  const [resumeText, setResumeText] = useState("")
  const [jdText, setJdText] = useState("")

  // 결과
  const [questions, setQuestions] = useState([]) // ["질문1", "질문2", ...]
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [answer, setAnswer] = useState("") // AI 예상 답변 결과 텍스트
  const [qLoading, setQLoading] = useState(false)
  const [aLoading, setALoading] = useState(false)
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobLoading(true)
        setJobError("")
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/job-categories`
        )
        if (!res.ok) throw new Error("직무 목록을 불러오지 못했습니다.")
        const data = await res.json()

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

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    if (urlError) setUrlError("")
    if (actionError) setActionError("")
  }

  const handlePickFile = () => fileRef.current?.click()

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    setFileError("")
    setResumeFile(f || null)
  }

  const validateCommon = () => {
    setActionError("")
    setUrlError("")

    if (!job) {
      setActionError("직무 역할을 선택해주세요.")
      return false
    }

    const urlText = (url || "").trim()
    if (!urlText) {
      setUrlError("채용공고 URL을 입력해주세요.")
      return false
    }
    if (!isValidHttpUrl(urlText)) {
      setActionError("URL 형식이 올바르지 않습니다.")
      return false
    }

    return true
  }

  const handleGenerateQuestions = async () => {
    if (!validateCommon()) return

    if (!resumeFile) {
      setActionError("자기소개서 PDF를 선택해주세요.")
      return
    }

    try {
      setQLoading(true)
      setActionError("")
      setQuestions([])
      setSelectedIdx(null)
      setAnswer("")

      const selected = jobOptions.find((x) => String(x.jc_code) === String(job))
      const jobName = selected?.jc_name || selected?.jc_code || ""

      const form = new FormData()
      form.append("jc_code", job)
      form.append("job_name", jobName)
      form.append("url", url.trim())
      form.append("file", resumeFile)
      form.append("n_questions", "6")

      const res = await fetch(
        `${import.meta.env.VITE_AI_URL}/interview/questions`,
        {
          method: "POST",
          body: form,
        }
      )

      const data = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(data?.detail || data?.error || "질문 생성 실패")

      console.log("jd_text length:", (data?.jd_text || "").length)
      console.log("jd_text preview:", (data?.jd_text || "").slice(0, 300))

      // questions가 배열이면 보기 좋게 줄바꿈 문자열로 변환
      const list = Array.isArray(data?.questions) ? data.questions : []

      setQuestions(list)
      setSelectedIdx(list.length ? 0 : null)
      // 백엔드 : resume_text 내려줌 (답변 생성에 사용)
      setResumeText(data?.resume_text || "")

      // (선택) jd_text도 백엔드에서 내려주면 저장
      setJdText(data?.jd_text || "")
    } catch (e) {
      setActionError(e?.message || "질문 생성 중 오류")
    } finally {
      setQLoading(false) // 이게 없으면 영원히 생성중
    }
  }

  // AI 예상 답변 생성(질문 결과 기반)
  const handleGenerateAnswer = async () => {
    if (!validateCommon()) return

    try {
      setALoading(true)
      setActionError("")
      setAnswer("")

      if (!questions.length) {
        setActionError("먼저 질문 생성이 필요합니다.")
        return
      }

      if (selectedIdx === null) {
        setActionError("답변을 생성할 질문을 선택해주세요.")
        return
      }

      if (!resumeText.trim()) {
        setActionError("질문 생성 후 다시 시도해주세요. (resume_text 없음)")
        return
      }

      const selected = jobOptions.find((x) => String(x.jc_code) === String(job))
      const jobName = selected?.jc_name || ""

      const selectedQuestion = questions[selectedIdx]

      const payload = {
        jc_code: job,
        job_name: jobName,
        url: url.trim(),
        resume_text: resumeText,
        jd_text: jdText,
        questions: [selectedQuestion],
        // questions: [selectedQuestion],
      }

      console.log("selectedIdx:", selectedIdx)
      console.log("selectedQuestion:", questions[selectedIdx])
      console.log("payload:", payload)

      const res = await fetch(
        `${import.meta.env.VITE_AI_URL}/interview/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json().catch(() => ({}))
      if (!res.ok)
        throw new Error(data?.detail || data?.error || "답변 생성 실패")

      setAnswer(data?.answer || data?.result || "")
    } catch (e) {
      setActionError(e.message || "답변 생성 중 오류")
    } finally {
      setALoading(false)
    }
  }

  return (
    <Page>
      <Shell>
        {/* LEFT */}
        <Side>
          <Card>
            <CardHeader>
              <HeaderLeft>
                <IconBox aria-hidden>🧰</IconBox>
                <CardTitle>직무 역할 선택</CardTitle>
              </HeaderLeft>
            </CardHeader>
            <CardBody>
              <Hint>지원하시는 직무 역할을 선택하세요.</Hint>
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
                <CardTitle>
                  채용공고 URL & <br />
                  자기소개서 업로드
                </CardTitle>
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

              <Spacer />

              <Hint style={{ marginTop: 8 }}>
                자기소개서 파일을 업로드 해주세요.
              </Hint>

              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <FileRow>
                <FileButton type="button" onClick={handlePickFile}>
                  📄 자기소개서 업로드
                </FileButton>
              </FileRow>

              <FileMeta>
                {resumeFile ? `선택됨: ${resumeFile.name}` : "선택된 파일 없음"}
              </FileMeta>

              {fileError && <ErrorText>{fileError}</ErrorText>}
            </CardBody>
          </Card>
        </Side>

        {/* RIGHT */}
        <Main>
          <Card>
            <CardHeader>
              <HeaderLeft>
                <IconBox aria-hidden>📝</IconBox>
                <CardTitle>AI 예상 면접 질문</CardTitle>
              </HeaderLeft>
            </CardHeader>

            <CardBody>
              <LinesBox>
                <QuestionList>
                  {questions.map((q, idx) => {
                    const active = idx === selectedIdx
                    return (
                      <QuestionItem
                        key={`${idx}-${q.slice(1, 10)}`}
                        type="button"
                        $active={active}
                        onClick={() => {
                          setSelectedIdx(idx)
                          setActionError("")
                        }}
                      >
                        <QBadge $active={active}>Q{idx + 1}</QBadge>
                        <QText $active={active}>{q}</QText>
                      </QuestionItem>
                    )
                  })}
                </QuestionList>
              </LinesBox>

              <ActionRow>
                <PrimaryButton
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={qLoading}
                >
                  {qLoading ? "생성 중..." : "질문 생성"}
                </PrimaryButton>
              </ActionRow>

              {actionError && <ErrorText>{actionError}</ErrorText>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <HeaderLeft>
                <IconBox aria-hidden>💬</IconBox>
                <CardTitle>AI 예상 답변</CardTitle>
              </HeaderLeft>
            </CardHeader>

            <CardBody>
              <AnswerBox>
                {aLoading ? (
                  <AnswerPlaceholder>답변 생성 중...</AnswerPlaceholder>
                ) : answer ? (
                  <ResultPre>{answer}</ResultPre>
                ) : (
                  <AnswerPlaceholder />
                )}
              </AnswerBox>

              <ActionRow>
                <PrimaryButton
                  type="button"
                  onClick={handleGenerateAnswer}
                  disabled={aLoading}
                >
                  {aLoading ? "생성 중..." : "답변 생성"}
                </PrimaryButton>
              </ActionRow>
            </CardBody>
          </Card>
        </Main>
      </Shell>
    </Page>
  )
}

/* ---------------- messages ---------------- */

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

/* ---------------- styles (QuestionPage와 최대한 동일 톤) ---------------- */

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

const Spacer = styled.div`
  height: 10px;
`

/* Left file upload UI */
const FileRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`

const FileButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  text-align: left;

  &:hover {
    border-color: rgba(224, 82, 105, 0.7);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const MiniIconButton = styled.button`
  width: 55px;
  height: 38px;
  border-radius: 10px;
  border: 2px solid var(--strawberry-color);
  background: var(--strawberry-color);
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;

  &:hover {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const FileMeta = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  color: #777;
`

/* Right cards */
const LinesBox = styled.div`
  height: 240px;
  border-radius: 12px;
  background: #f3f3f3;
  overflow: auto;
`

const LinesPlaceholder = styled.div`
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`

const Line = styled.div`
  height: 1px;
  background: rgba(17, 17, 17, 0.35);
  border-radius: 999px;
`

const AnswerBox = styled.div`
  height: 280px;
  border-radius: 12px;
  background: #f3f3f3;
  overflow: auto;
`

const AnswerPlaceholder = styled.div`
  height: 100%;
`

const ResultPre = styled.pre`
  margin: 0;
  padding: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.6;
  color: #222;
`

const ActionRow = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
/* ✅ Question list UI */
const QuestionList = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const QuestionItem = styled.button`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 10px;
  border: 1px solid
    ${(p) => (p.$active ? "rgba(224, 82, 105, 0.9)" : "rgba(0,0,0,0.08)")};
  background: ${(p) =>
    p.$active ? "rgba(224, 82, 105, 0.08)" : "rgba(255,255,255,0.65)"};
  cursor: pointer;
  text-align: left;

  &:hover {
    border-color: rgba(224, 82, 105, 0.7);
  }
`

const QBadge = styled.div`
  flex: none;
  min-width: 36px;
  height: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 900;
  color: ${(p) => (p.$active ? "#fff" : "rgba(224, 82, 105, 1)")};
  background: ${(p) =>
    p.$active ? "rgba(224, 82, 105, 1)" : "rgba(224, 82, 105, 0.12)"};
  border: 1px solid rgba(224, 82, 105, 0.35);
`

const QText = styled.div`
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
  color: #222;
  font-weight: ${(p) => (p.$active ? 800 : 600)};
`
