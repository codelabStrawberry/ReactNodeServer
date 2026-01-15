import styled from "@emotion/styled";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

import axios from "axios";
import Markdown from "react-markdown";

export default function TrendPage() {
  const SARAMIN_CATEGORY = {
    "0": "직업 선택",
    "16": "기획·전략",
    "14": "마케팅·홍보·조사",
    "3": "회계·세무·재무",
    "5": "인사·노무·HRD",
    "4": "총무·법무·사무",
    "2": "IT개발·데이터",
    "15": "디자인",
    "8": "영업·판매·무역",
    "21": "고객상담·TM",
    "18": "구매·자재·물류",
    "12": "상품기획·MD",
    "7": "운전·운송·배송",
    "10": "서비스",
    "11": "생산",
    "22": "건설·건축",
    "6": "의료",
    "9": "연구·R&D",
    "19": "교육",
    "13": "미디어·문화·스포츠",
    "17": "금융·보험",
    "20": "공공·복지",
  };
  
  const [selectedJob, setSelectedJob] = useState("0");
  const [jobfit, setJobfit] = useState("");
  const [career, setCareer] = useState("");
  const [isLoadingJobfit, setIsLoadingJobfit] = useState(false);
  const [isLoadingCareer, setIsLoadingCareer] = useState(false);

  useEffect(() => {
    if (selectedJob == "0") {
      setJobfit("");
      setIsLoadingJobfit(false);
      return;
    };

    const fetchJobTrend = async () => {
      setIsLoadingJobfit(true);
      setJobfit("");
        try {
          const jobName = SARAMIN_CATEGORY[selectedJob];
          const res = await axios.post(`${import.meta.env.VITE_AI_URL}/trend/jobfit`, { job_cat: jobName });
          console.log("Job trend response:", res.data);
          if (res.data.error) {
            setJobfit(`트렌드 분석 실패: ${res.data.error}`);
          }
          else if (!res.data.jobfit) {
            setJobfit("트렌드 분석 결과가 없습니다.");
          }
          else {
            setJobfit(res.data.jobfit);
          }
        }
        catch (error) {
          console.log("Error fetching job trend:", error);
        }

      setIsLoadingJobfit(false);
    };

    fetchJobTrend();
  }, [selectedJob]);

  useEffect(() => {
    if (selectedJob == "0") {
      setCareer("");
      setIsLoadingCareer(false);
      return;
    };

    const fetchCareerStrategy = async () => {
      setIsLoadingCareer(true);
      setCareer("");
        try {
          const jobName = SARAMIN_CATEGORY[selectedJob];
          const res = await axios.post(`${import.meta.env.VITE_AI_URL}/trend/career_advice`, { job_cat: jobName });
          console.log("Career strategy response:", res.data);
          setCareer(res.data.career);
        } catch (error) {
          console.log("Error fetching career strategy:", error);
        }
        setIsLoadingCareer(false);
      };

    fetchCareerStrategy();    
  }, [selectedJob]);


  const handleJobChange = (e) => {
    setSelectedJob(e.target.value);
  }

  return (
    <Container>
      <TitleWrapper>
        <Title>
          <Highlight>취업 트렌드</Highlight> 분석
        </Title>
        <Description>
          내 직군에 필요한 역량을 최신 트렌드로 업데이트하고, 다음 준비를 더 정확하게 설계하세요.
        </Description>
      </TitleWrapper>
      <JobAnalysis>
        <SelectWrap>
          <JobSelect value={selectedJob} onChange={handleJobChange}>
            {Object.entries(SARAMIN_CATEGORY).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </JobSelect>
        </SelectWrap>
        <ChartWrapper>
          <JobChartTitle>직군별 핵심 스킬</JobChartTitle>
          <JobTrendChart>
            {/* 그래프 컴포넌트가 여기에 들어갑니다. */}
            {selectedJob === "0" && <Placeholder>직군을 선택하여 최신 트렌드를 확인하세요.</Placeholder>}
            {isLoadingJobfit && <p>{SARAMIN_CATEGORY[selectedJob]} 데이터 분석 중...</p>}

            {!isLoadingJobfit && typeof jobfit === "string" && <p>{jobfit}</p>}

            {!isLoadingJobfit && typeof jobfit !== "string" && (
              <StyledTable>
                <thead>
                  <tr>
                    <th>핵심 스킬</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobfit.map((item, index) => (
                    <tr key={index}>
                      <td className="keyword">{item.keyword}</td>
                      <td className="score-cell">
                        <ScoreBarWrapper>
                          <ScoreBar score={item.score} />
                        </ScoreBarWrapper>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            )}

          </JobTrendChart>
        </ChartWrapper>
      </JobAnalysis>
      <CareerWrapper>
        <CareerTitle>
          트렌드에 앞서가는 <Highlight>커리어 전략</Highlight> 추천
        </CareerTitle>
        <CareerContext>
          {/* 커리어 전략 추천 컴포넌트가 여기에 들어갑니다. */}
          {selectedJob === "0" && <Placeholder>직군을 선택하여 커리어 전략을 확인하세요.</Placeholder>}
          {selectedJob !== "0" && isLoadingCareer && <p>선택한 직군: {SARAMIN_CATEGORY[selectedJob]}에 맞춘 커리어 전략 분석 중...</p>}
          {!isLoadingCareer && career && (
            <MarkdownWrapper>
              <ReactMarkdown>{career}</ReactMarkdown>
            </MarkdownWrapper>
          )}
        </CareerContext>
      </CareerWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  margin: 0 4em;
  flex-direction: column;
`;

const TitleWrapper = styled.div`
  margin-top: 4em;
`;
const Title = styled.h1`
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
`;

const Highlight = styled.span`
  color: var(--strawberry-color);
`;

const Description = styled.p`
  color: var(--muted);
`;

const JobAnalysis = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 4em;
`;

const SelectWrap = styled.div`
  width: 50%;
`;

const JobSelect = styled.select`
  width: 300px;
  padding: 0.5em 1em;
  border-radius: 0.25em;
`;

const ChartWrapper = styled.div`
  width: 50%;
  height: 400px
`;

const JobChartTitle = styled.h2`
  font-size: 1.5em;
  margin-bottom: 1em;
  font-weight: 600;
`;

const JobTrendChart = styled.div`

`;

const Placeholder = styled.div`

`;

const CareerWrapper = styled.div`

`;

const CareerTitle = styled.h1`
  font-size: 2.25em;
  font-weight: bold;
  text-align: center;
  margin-top: 4em;
`;

const CareerContext = styled.div`
  min-height: 400px;
  display: flex;
  flex-direction: column;
  margin-top: 2em;
  padding: 2em;
  text-align: center;
  justify-content: center;
  border: 2px solid var(--strawberry-color);
  border-radius: 0.5em;
`;

const MarkdownWrapper = styled.div`
  text-align: left;
  line-height: 1.6;
  color: #333;

  h1, h2, h3 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    color: var(--strawberry-color);
  }

  ul, ol {
    margin-bottom: 1em;
    padding-left: 1.5em;
  }

  li {
    margin-bottom: 0.5em;
  }

  p {
    margin-bottom: 1em;
  }

  strong {
    color: var(--strawberry-color);
    font-weight: bold;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);

  th, td {
    padding: 18px 20px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #fafafa;
    font-weight: 600;
    color: #666;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .keyword {
    font-weight: 600;
    color: #333;
    width: 30%; 
    white-space: nowrap;
  }
  
  .score-cell {
    width: 70%;
  }
`;

const ScoreBarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ScoreBar = styled.div`
  height: 12px;
  background-color: #eee;
  border-radius: 6px;
  flex-grow: 1;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    /* 점수에 따라 너비 결정 (score * 10%) */
    width: ${props => (props.score / 10) * 100}%;
    background-color: var(--strawberry-color);
    border-radius: 6px;
    transition: width 0.8s cubic-bezier(0.1, 0.5, 0.5, 1);
  }
`;

const ScoreText = styled.span`
  font-size: 0.9em;
  color: #888;
  min-width: 45px;
`;