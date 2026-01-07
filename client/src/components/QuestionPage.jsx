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

  // 자기소개서 텍스트 입력
  const [resume, setResume] = useState("")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobLoading(true)
        setJobError("")

        // TODO: 백엔드 주소에 맞게 수정
        // 예: http://localhost:8000/api/job-categories
        const res = await fetch("http://localhost:3000/job-categories")

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
                  onChange={(e) => setUrl(e.target.value)}
                />
              </InputWrap>
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
              />
              <BottomRow>
                <Count>{resume.length} / 4000</Count>
                <PrimaryButton type="button">분석 시작</PrimaryButton>
              </BottomRow>
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
              <FeedbackArea />
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
  justify-content: space-between;
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

const FeedbackArea = styled.div`
  height: 260px;
  border-radius: 12px;
  background: #f3f3f3;
`
