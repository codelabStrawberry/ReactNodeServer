// FeaturesSection.jsx
import styled from "@emotion/styled";

function FeatureCard({ title, desc, iconText }) {
  // 아이콘이 비어있을 때 기본 아이콘(선택)
  const safeIcon = iconText && iconText.trim() ? iconText : "✨";

  return (
    <Card>
      <IconWrap>
        <IconText aria-hidden="true">{safeIcon}</IconText>
      </IconWrap>
      <CardTitle>{title}</CardTitle>
      <CardDesc>{desc}</CardDesc>
    </Card>
  );
}

const FEATURES = [
  {
    title: "취업 트렌드 분석",
    desc:
      "AI로 취업 시장 동향과 기술 요구 사항을 분석하여,\n직군별로 많이 채용하고 있는 스킬 및 역량 분석.",
    iconText: "📈",
  },
  {
    title: "서류 분석",
    desc:
      "이력서와 자기소개서를 AI로 분석하여 합격률을 높이는\n맞춤형 피드백을 제공합니다.",
    iconText: "📝",
  },
  {
    title: "서류 피드백",
    desc:
      "자기소개서 텍스트를 AI가 진단 및 분석하여\n직무, 채용공고에 맞는 최적의 AI 코칭 피드백을 제안합니다.",
    iconText: "🧠",
  },
  {
    title: "예상 면접 질문",
    desc:
      "AI가 직무에 특화된 예상 면접 질문을 제공하고,\n답변 가이드를 통해 완벽한 면접을 준비합니다.",
    iconText: "💬",
  },
  {
    title: "맞춤 채용 공고",
    desc:
      "수많은 채용 공고 중 사용자의 이력서와 자소서를 기반으로\n가장 적합한 직무를 AI가 찾아 추천합니다.",
    iconText: "🔎",
  },
  {
    title: "AI 면접 챗봇",
    desc:
      "AI 챗봇과 모의 면접을 통해 실제 감각을 익히고,\n즉각적인 피드백으로 역량을 보완합니다.",
    iconText: "🤖",
  },
];

export default function FeaturesSection() {
  return (
    <Wrap>
      <Container>
        <Title>
          <Highlight>Strawberry AI</Highlight>의 주요 기능
        </Title>

        <Subtitle>
          딸기는 타이밍이 생명인 것처럼,{" "}
          <InlineHighlight>Strawberry AI</InlineHighlight>는 지금 가장 많이 요구되는
          역량과 표현을 공고별로 섬세하게 분석해
          <br />
          당신의 서류를 업데이트하고, 면접에서는 그 역량을 증명하는 답변 구조까지
          훈련시켜
          <br />
          <Quote>'나에게 맞는 자리'</Quote>로 가장 정확하고 빠르게 가는 전략을 제시합니다.
        </Subtitle>

        <Grid>
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </Grid>
      </Container>
    </Wrap>
  );
}





// css

const Wrap = styled.section`
  width: 100%;
  min-height: 640px;
  background: #ffffffff;
  border-radius: 0px;
  padding-top: 12px;
`;

const Container = styled.div`
  width: min(1100px, calc(100% - 48px));
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 14px;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #111827;

  @media (max-width: 640px) {
    font-size: 26px;
  }
`;

const Highlight = styled.span`
  color: var(--strawberry-color);
`;

const Subtitle = styled.p`
  margin: 0 auto 40px;
  max-width: 880px;
  font-size: 15px;
  line-height: 1.9;
  color: #4b5563;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const InlineHighlight = styled.span`
  color: var(--strawberry-color);
  font-weight: 700;
`;

const Quote = styled.span`
  color: var(--strawberry-color);
  font-weight: 800;
`;


const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 340px);
  gap: 14px;
  margin-top: 22px;
  justify-content: center;
  justify-items: center;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 340px);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  width: 340px;
  height: 190px;

  background: #ffffffff;
  border-radius: 8px;
  box-shadow: 0px 2px 4px #00000012, 0px 0px 0px #171a1f00;

  text-align: left;
  padding: 18px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #ffe8ee;
  margin-bottom: 10px;
`;

const IconText = styled.span`
  font-size: 18px;
  line-height: 1;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.2px;
`;

const CardDesc = styled.p`
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: #6b7280;
  white-space: pre-line;
`;
