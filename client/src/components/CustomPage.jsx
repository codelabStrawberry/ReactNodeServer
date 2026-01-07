// CustomPage.jsx
import { useId, useMemo, useState } from "react";
import styled from "@emotion/styled";

const SAMPLE_JOBS = [
  {
    id: "job-1",
    title: "시니어 프론트엔드 개발자",
    company: "스트로베리",
    location: "서울 금천구",
    exp: "5년 이상",
    badges: ["BEST", "신규 공고"],
    skills: ["React", "TypeScript", "Node.js", "AWS"],
  },
  {
    id: "job-2",
    title: "백엔드 개발자",
    company: "Strawberry AI",
    location: "서울 성동구",
    exp: "3년 이상",
    badges: ["BEST"],
    skills: ["Python", "FastAPI", "MySQL", "Redis"],
  },
];

function UploadBox({ fileName, onPick }) {
  const inputId = useId();

  return (
    <Panel>
      <PanelTitle>
        당신의 <Pink>커리어</Pink>를 <Pink>AI</Pink>에게 보여주세요
      </PanelTitle>

      <UploadRow>
        <FileName title={fileName || "선택된 파일 없음"}>
          <FileIcon aria-hidden="true">📄</FileIcon>
          {fileName || "자기소개서 업로드"}
        </FileName>

        <UploadLabel htmlFor={inputId} aria-label="파일 업로드">
          <UploadIcon aria-hidden="true">⬆</UploadIcon>
        </UploadLabel>

        <HiddenFile
          id={inputId}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => onPick(e.target.files?.[0] || null)}
        />
      </UploadRow>
    </Panel>
  );
}

function FiltersBox({ value, onChange }) {
  return (
    <Panel>
      <PanelTitle>
        <Pink>조건</Pink>을 선택해 주세요
      </PanelTitle>

      <FiltersGrid>
        <Select
          value={value.jobGroup}
          onChange={(e) => onChange({ ...value, jobGroup: e.target.value })}
        >
          <option value="">직업별</option>
          <option value="dev">개발</option>
          <option value="design">디자인</option>
          <option value="pm">PM</option>
        </Select>

        <Select
          value={value.role}
          onChange={(e) => onChange({ ...value, role: e.target.value })}
        >
          <option value="">직무, 직업</option>
          <option value="frontend">프론트엔드</option>
          <option value="backend">백엔드</option>
          <option value="data">데이터</option>
        </Select>

        <Select
          value={value.employmentType}
          onChange={(e) =>
            onChange({ ...value, employmentType: e.target.value })
          }
        >
          <option value="">고용 형태</option>
          <option value="fulltime">정규직</option>
          <option value="contract">계약직</option>
          <option value="intern">인턴</option>
        </Select>

        <Select
          value={value.region}
          onChange={(e) => onChange({ ...value, region: e.target.value })}
        >
          <option value="">지역</option>
          <option value="seoul">서울</option>
          <option value="gyeonggi">경기</option>
          <option value="remote">원격</option>
        </Select>
      </FiltersGrid>
    </Panel>
  );
}

function JobCard({ job, empty = false }) {
  if (empty) {
    return (
      <JobCardWrap aria-hidden="true" data-empty="true">
        <EmptyBox />
      </JobCardWrap>
    );
  }

  return (
    <JobCardWrap>
      <JobTop>
        <JobTitle>{job.title}</JobTitle>

        <BadgeRow>
          {job.badges?.map((b) => (
            <Badge key={b} data-variant={b === "BEST" ? "best" : "urgent"}>
              {b}
            </Badge>
          ))}
        </BadgeRow>
      </JobTop>

      <Company>{job.company}</Company>

      <MetaList>
        <MetaLine>
          <MetaIcon aria-hidden="true">📍</MetaIcon>
          <MetaText>{job.location}</MetaText>
        </MetaLine>
        <MetaLine>
          <MetaIcon aria-hidden="true">🗓️</MetaIcon>
          <MetaText>{job.exp}</MetaText>
        </MetaLine>
      </MetaList>

      <SkillsRow>
        {job.skills?.map((s) => (
          <SkillChip key={s}>{s}</SkillChip>
        ))}
      </SkillsRow>

      <CardActions>
        <DetailBtn type="button">상세보기</DetailBtn>
      </CardActions>
    </JobCardWrap>
  );
}

export default function CustomPage() {
  const [pickedFile, setPickedFile] = useState(null);
  const [filters, setFilters] = useState({
    jobGroup: "",
    role: "",
    employmentType: "",
    region: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const gridItems = useMemo(() => {
    const base = [...jobs];
    while (base.length < 6) base.push(null);
    return base.slice(0, 6);
  }, [jobs]);

  const onSearch = async () => {
    setHasSearched(true);
    setIsLoading(true);

    // TODO: API 연동 자리 (지금은 샘플)
    await new Promise((r) => setTimeout(r, 600));
    setJobs(SAMPLE_JOBS);

    setIsLoading(false);
  };

  return (
    <Wrap>
      <Container>
        <Title>
          <b>자기소개서&이력서</b>를 업로드하여 <br />
          자신에게 맞는 채용 공고를 찾아보세요!
        </Title>

        <HeroBox>
          <HeroCols>
            <UploadBox
              fileName={pickedFile?.name}
              onPick={(f) => setPickedFile(f)}
            />
            <Divider aria-hidden="true" />
            <FiltersBox value={filters} onChange={setFilters} />
          </HeroCols>

          <CtaRow>
            <CtaBtn type="button" onClick={onSearch}>
              {isLoading ? "찾는 중..." : "공고 찾기"}
            </CtaBtn>
          </CtaRow>
        </HeroBox>

        {hasSearched && (
          <>
            <SectionDivider>
              <Line aria-hidden="true" />
              <DividerText>
                이력서·자소서를 바탕으로 공고를 <b>매칭</b>했어요.
              </DividerText>
              <Line aria-hidden="true" />
            </SectionDivider>

            <ResultsGrid aria-busy={isLoading}>
              {gridItems.map((job, idx) =>
                job ? (
                  <JobCard key={job.id} job={job} />
                ) : (
                  <JobCard key={`empty-${idx}`} empty />
                )
              )}
            </ResultsGrid>

            {!isLoading && jobs.length === 0 && (
              <EmptyText>조건을 바꿔서 다시 찾아보세요.</EmptyText>
            )}
          </>
        )}
      </Container>
    </Wrap>
  );
}

/* =========================
   Styles
========================= */

const Wrap = styled.main`
  width: 100%;
  padding: 20px 0 56px;
  background: var(--bg);
`;

const Container = styled.div`
  width: min(var(--container-w), calc(100% - 32px));
  margin: 0 auto;
`;

const Title = styled.h1`
  margin: 0 0 18px;
  text-align: center;
  font-size: 20px;
  line-height: 1.55;
  letter-spacing: -0.02em;
  font-weight: 900;
  color: #0f172a;

  b {
    color: var(--strawberry-color);
    font-weight: 900;
  }
`;

const HeroBox = styled.section`
  background: #f7f7f8;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 26px 28px 22px;
`;

const HeroCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 28px;
  align-items: center;
  min-height: 150px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap: 18px;
  }
`;

const Divider = styled.div`
  width: 1px;
  align-self: stretch;
  background: #d1d5db;

  @media (max-width: 980px) {
    display: none;
  }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const PanelTitle = styled.h2`
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.2px;
  color: #111827;
  text-align: center;
`;

const Pink = styled.span`
  color: var(--strawberry-color);
`;

const UploadRow = styled.div`
  width: 320px;
  height: 34px;
  display: grid;
  grid-template-columns: 1fr 34px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  overflow: hidden;

  @media (max-width: 420px) {
    width: 100%;
  }
`;

const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  font-size: 12px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileIcon = styled.span`
  font-size: 13px;
  line-height: 1;
`;

const UploadLabel = styled.label`
  display: grid;
  place-items: center;
  cursor: pointer;
  background: var(--strawberry-color);
  color: #ffffff;

  &:hover {
    filter: brightness(0.98);
  }
`;

const UploadIcon = styled.span`
  font-size: 14px;
`;

const HiddenFile = styled.input`
  display: none;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 110px);
  gap: 10px;
  justify-content: center;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: min(520px, 100%);
  }
`;

const Select = styled.select`
  height: 30px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  padding: 0 10px;
  font-size: 12px;
  color: #374151;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: rgba(224, 82, 105, 0.6);
    box-shadow: 0 0 0 3px rgba(224, 82, 105, 0.12);
  }
`;

const CtaRow = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 18px;
`;

const CtaBtn = styled.button`
  height: 34px;
  width: 130px;
  border-radius: 6px;

  border: 1px solid rgba(224, 82, 105, 0.35);
  background: var(--strawberry-color);
  color: #ffffff;
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    filter: brightness(0.98);
  }
`;

const SectionDivider = styled.div`
  margin: 22px 0 16px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 14px;
  align-items: center;
`;

const Line = styled.div`
  height: 1px;
  background: var(--border);
`;

const DividerText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #374151;
  letter-spacing: -0.1px;

  b {
    color: var(--strawberry-color);
    font-weight: 900;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

/* ===== 카드(스샷 스타일) ===== */
const JobCardWrap = styled.article`
  border-radius: 12px;
  border: 2px solid rgba(224, 82, 105, 0.85);
  background: #ffffff;
  padding: 14px 14px 12px;
  min-height: 150px;

  &[data-empty="true"] {
    border-style: solid;
  }
`;

const JobTop = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: start;
`;

const JobTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.2px;
  color: #111827;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 6px;
`;

const Badge = styled.span`
  height: 20px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid transparent;
  line-height: 1;

  &[data-variant="best"] {
    background: rgba(20, 184, 166, 0.18);
    color: #0f766e;
  }

  &[data-variant="urgent"] {
    background: rgba(224, 82, 105, 0.14);
    color: var(--strawberry-color);
  }
`;

const Company = styled.div`
  margin-top: 10px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 800;
`;

const MetaList = styled.div`
  margin-top: 10px;
  display: grid;
  gap: 6px;
`;

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MetaIcon = styled.span`
  font-size: 12px;
  color: #6b7280;
  line-height: 1;
`;

const MetaText = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
`;

const SkillsRow = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SkillChip = styled.span`
  height: 20px;
  padding: 0 9px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  font-weight: 800;
`;

const CardActions = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
`;

const DetailBtn = styled.button`
  height: 26px;
  padding: 0 12px;
  border-radius: 8px;

  border: 1px solid rgba(224, 82, 105, 0.35);
  background: var(--strawberry-color);
  color: #ffffff;

  font-weight: 900;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    filter: brightness(0.98);
  }
`;

/* empty */
const EmptyBox = styled.div`
  width: 100%;
  height: 100%;
  min-height: 120px;
  border-radius: 12px;
  background: linear-gradient(90deg, #ffffff, #fafafa, #ffffff);
  border: 1px dashed rgba(224, 82, 105, 0.35);
  opacity: 0.9;
`;

const EmptyText = styled.p`
  margin: 14px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
`;
