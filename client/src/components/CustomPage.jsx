// CustomPage.jsx
import { useEffect, useId, useMemo, useState } from "react";
import styled from "@emotion/styled";

function UploadBox({ fileName, onPick }) {
  const inputId = useId();

  return (
    <Panel>
      <PanelTitle data-align="to-box">
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

function FiltersBox({ value, onChange, options, loading }) {
  return (
    <Panel>
      <PanelTitle data-align="to-box">
        <Pink>조건</Pink>을 선택해 주세요
      </PanelTitle>

      <FiltersCenter>
        <FiltersRow>
          <Select
            value={value.jc_code}
            onChange={(e) =>
              onChange({
                ...value,
                jc_code: e.target.value,
              })
            }
            disabled={loading}
          >
            <option value="">{loading ? "불러오는 중..." : "직업별"}</option>
            {(options.categories || []).map((c) => (
              <option key={c.jc_code} value={c.jc_code}>
                {c.jc_name}
              </option>
            ))}
          </Select>

          <Input
            type="text"
            placeholder="기술을 입력해 주세요."
            value={value.tech_text ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                tech_text: e.target.value,
              })
            }
            disabled={loading}
          />

          <Input
            type="text"
            placeholder="매칭 키워드"
            value={value.role_text ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                role_text: e.target.value,
              })
            }
            disabled={loading}
          />
        </FiltersRow>
      </FiltersCenter>
    </Panel>
  );
}

function JobCard({ job }) {
  const title = job.title ?? job.jp_title ?? job.job_title ?? "제목 없음";
  const company =
    job.company ?? job.jp_company ?? job.job_company ?? job.company_name ?? "회사";
  const location = job.location ?? job.jp_location ?? job.job_location ?? "지역";
  const exp = job.exp ?? job.jp_exp ?? job.job_exp ?? "경력";

  const skillsRaw = job.skills ?? job.jp_skills ?? job.job_tech ?? [];
  const skills = Array.isArray(skillsRaw)
    ? skillsRaw
    : String(skillsRaw ?? "")
        .split(/[,|\/]/)
        .map((s) => s.trim())
        .filter(Boolean);

  const onOpen = () => {
    const url = job.url ?? job.jp_url ?? job.job_url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <JobCardWrap>
      <JobTop>
        {/* ✅ 타이틀에 아이콘 추가 */}
        <JobTitle>
          <TitleRow>
            <TitleIcon aria-hidden="true">💼</TitleIcon>
            <TitleText>{title}</TitleText>
          </TitleRow>
        </JobTitle>

        <BadgeRow>
          {job.badges?.map((b) => (
            <Badge key={b} data-variant={b === "BEST" ? "best" : "urgent"}>
              {b}
            </Badge>
          ))}
        </BadgeRow>
      </JobTop>

      <Company>{company}</Company>

      {/* ✅ 지역/경력 영역은 "공간은 유지" + "화면에서만 숨김" */}
      <MetaList data-hidden="true" aria-hidden="true">
        <MetaLine>
          <MetaIcon aria-hidden="true">📍</MetaIcon>
          <MetaText>{location}</MetaText>
        </MetaLine>
        <MetaLine>
          <MetaIcon aria-hidden="true">🗓️</MetaIcon>
          <MetaText>{exp}</MetaText>
        </MetaLine>
      </MetaList>

      {Array.isArray(skills) && skills.length > 0 && (
        <SkillsRow>
          {skills.map((s) => (
            <SkillChip key={s}>{s}</SkillChip>
          ))}
        </SkillsRow>
      )}

      <CardActions>
        <DetailBtn type="button" onClick={onOpen}>
          상세보기
        </DetailBtn>
      </CardActions>
    </JobCardWrap>
  );
}

export default function CustomPage() {
  const [pickedFile, setPickedFile] = useState(null);

  const [filters, setFilters] = useState({
    jc_code: "",
    tech_text: "",
    role_text: "",
  });

  const [options, setOptions] = useState({
    categories: [],
  });

  const [optLoading, setOptLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const visibleJobs = useMemo(() => jobs.slice(0, 4), [jobs]);
  const showResults = hasSearched;

  const API_BASE = "http://localhost:3000";

  const fetchJson = async (path, init = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...init,
    });

    const text = await res.text().catch(() => "");
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data?.message || text || `Request failed: ${res.status}`);
    }

    return data;
  };

  const normalizeCategories = (data) => {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data
        .map((s) => String(s ?? "").trim())
        .filter(Boolean)
        .map((s) => ({ jc_code: s, jc_name: s }));
    }

    const raw =
      data.categories ??
      data.jobCats ??
      data.job_cats ??
      data.jobcats ??
      data.job_categories ??
      null;

    if (!raw) return [];

    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object") {
      const first = raw[0];
      if ("jc_code" in first && "jc_name" in first) return raw;

      if ("job_cat" in first) {
        return raw
          .map((r) => String(r.job_cat ?? "").trim())
          .filter(Boolean)
          .map((s) => ({ jc_code: s, jc_name: s }));
      }
    }

    if (Array.isArray(raw)) {
      return raw
        .map((s) => String(s ?? "").trim())
        .filter(Boolean)
        .map((s) => ({ jc_code: s, jc_name: s }));
    }

    return [];
  };

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      setOptLoading(true);
      try {
        const data = await fetchJson("/api/custom/jobs");
        if (ignore) return;

        setOptions({
          categories: normalizeCategories(data),
        });
      } catch (e) {
        console.error("jobs categories fetch failed:", e);
        if (!ignore) setOptions({ categories: [] });
      } finally {
        if (!ignore) setOptLoading(false);
      }
    };

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const onSearch = async () => {
    setHasSearched(true);

    if (!filters.jc_code) {
      alert("직업별을 선택해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const selected = (options.categories || []).find(
        (c) => String(c.jc_code) === String(filters.jc_code)
      );
      const jobCatName = selected?.jc_name || "";

      if (!jobCatName) {
        alert("직업별 매핑이 안 됐어요. job_categories 데이터를 확인해 주세요.");
        return;
      }

      const data = await fetchJson("/api/custom/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_cat: jobCatName,
          role_text: filters.role_text ?? "",
          tech_text: filters.tech_text ?? "",
          limit: 4,
        }),
      });

      const list = data.jobs ?? data.postings ?? data.results ?? data.items ?? [];
      setJobs(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("match failed:", e);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrap>
      <Container>
        <Title>
          <b>자기소개서</b>를 업로드하여 <br />
          자신에게 맞는 채용 공고를 찾아보세요!
        </Title>

        <HeroBox>
          <HeroCols>
            <UploadBox
              fileName={pickedFile?.name}
              onPick={(f) => setPickedFile(f)}
            />
            <Divider aria-hidden="true" />
            <FiltersBox
              value={filters}
              onChange={setFilters}
              options={options}
              loading={optLoading}
            />
          </HeroCols>

          <CtaRow>
            <CtaBtn type="button" onClick={onSearch} disabled={isLoading}>
              {isLoading ? "찾는 중..." : "공고 찾기"}
            </CtaBtn>
          </CtaRow>
        </HeroBox>

        {showResults && (
          <>
            <SectionDivider>
              <Line aria-hidden="true" />
              <DividerText>
                자기소개서·조건을 바탕으로 공고를 <b>매칭</b>했어요.
              </DividerText>
              <Line aria-hidden="true" />
            </SectionDivider>

            {isLoading ? (
              <LoadingText>공고를 찾는 중이에요...</LoadingText>
            ) : visibleJobs.length > 0 ? (
              <ResultsGrid>
                {visibleJobs.map((job, idx) => (
                  <JobCard
                    key={
                      job.id ??
                      job.jp_id ??
                      job.recruit_id ??
                      job.job_url ??
                      `${job.title ?? job.jp_title ?? "job"}-${idx}`
                    }
                    job={job}
                  />
                ))}
              </ResultsGrid>
            ) : (
              <EmptyText>조건을 바꿔서 다시 찾아보세요.</EmptyText>
            )}
          </>
        )}
      </Container>
    </Wrap>
  );
}

// ===================== CSS

const PANEL_W = 460;
const CONTAINER_W = 1100;

const Wrap = styled.main`
  width: 100%;
  padding: 20px 0 56px;
  background: var(--bg);
`;

const Container = styled.div`
  width: min(${CONTAINER_W}px, calc(100% - 32px));
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
  margin-bottom: 100px;
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

  width: ${PANEL_W}px;
  text-align: center;

  @media (max-width: 520px) {
    width: 100%;
  }
`;

const Pink = styled.span`
  color: var(--strawberry-color);
`;

const UploadRow = styled.div`
  width: ${PANEL_W}px;
  height: 34px;
  display: grid;
  grid-template-columns: 1fr 34px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  overflow: hidden;

  @media (max-width: 520px) {
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

const FiltersCenter = styled.div`
  width: ${PANEL_W}px;
  display: flex;
  justify-content: center;

  @media (max-width: 520px) {
    width: 100%;
  }
`;

const FiltersRow = styled.div`
  width: ${PANEL_W}px;
  display: flex;
  gap: 10px;
  align-items: center;

  @media (max-width: 520px) {
    width: 100%;
    gap: 8px;
  }
`;

const Select = styled.select`
  height: 34px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  padding: 0 10px;
  font-size: 12px;
  color: #374151;
  outline: none;
  cursor: pointer;

  flex: 1;
  min-width: 0;

  &:focus {
    border-color: rgba(224, 82, 105, 0.6);
    box-shadow: 0 0 0 3px rgba(224, 82, 105, 0.12);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  height: 34px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  padding: 0 10px;
  font-size: 12px;
  color: #374151;
  outline: none;

  flex: 1;
  min-width: 0;

  &:focus {
    border-color: rgba(224, 82, 105, 0.6);
    box-shadow: 0 0 0 3px rgba(224, 82, 105, 0.12);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SectionDivider = styled.div`
  margin: 22px 0 40px;
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
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.15px;

  b {
    color: var(--strawberry-color);
    font-weight: 900;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const JobCardWrap = styled.article`
  border-radius: 12px;
  border: 2px solid rgba(224, 82, 105, 0.85);
  background: #ffffff;
  padding: 14px 14px 12px;
  min-height: 150px;
  box-sizing: border-box;
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

const TitleRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const TitleIcon = styled.span`
  font-size: 16px;
  line-height: 1;
  transform: translateY(1px);
`;

const TitleText = styled.span`
  display: inline-block;
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

  /* ✅ 원래 2줄 높이만큼 항상 확보 (환경별 line-height 차이로 줄어드는 것 방지) */
  min-height: 38px;

  &[data-hidden="true"] {
    opacity: 0;
    pointer-events: none;
  }
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

const LoadingText = styled.p`
  margin: 18px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
`;

const EmptyText = styled.p`
  margin: 18px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
`;
