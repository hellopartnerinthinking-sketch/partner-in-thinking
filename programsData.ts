export interface SessionInfo {
  sessionNum: string;
  duration: string;
  recommendation?: string;
  title: string;
  description: string;
}

export interface DetailedProgram {
  id: string; // slug
  title: string;
  category: "Clarity" | "Balance";
  totalDuration: string;
  sessionsCount: string;
  shortSummary: string;
  fullDescription: string;
  tailoringNotes: string[];
  sessions: SessionInfo[];
  image: string;
}

export const DETAILED_PROGRAMS: DetailedProgram[] = [
  {
    id: "focus-alignment",
    title: "Focus & Alignment",
    category: "Clarity",
    totalDuration: "3~5시간",
    sessionsCount: "1:1 (3~5회)",
    shortSummary: "에너지가 흩어진 상태에서, 무엇에 집중해야 할지 다시 정렬하는 사고 작업",
    fullDescription: "해야 할 일은 많지만 어디에 자원을 집중해야 할지 우선순위가 흐려질 때가 있습니다. 이 프로그램은 에너지가 여러 과제에 분산된 리더들을 위해, 방해 요소를 제거하고 가장 높은 성과를 만드는 핵심 과제에 집중할 수 있도록 돕는 우선순위 재정렬 프로그램입니다.",
    tailoringNotes: [
      "코칭의 핵심 주제는 고객 맞춤형으로 자유롭게 제안 및 진행될 수 있습니다.",
      "프로그램의 깊이와 실행 속도에 따라 맞춤형 1:1 밀착 코칭 세션으로 유연하게 전환 및 응용됩니다.",
      "첫 세션은 전체 그림을 정비하기 위해 가급적 대면(Offline) 진행을 제안합니다."
    ],
    sessions: [
      {
        sessionNum: "웰컴 세션",
        duration: "90~120분",
        recommendation: "얼라인먼트",
        title: "상호 신뢰 구축 및 개인별 코칭 목표 설정",
        description: "전체적인 과정의 목표를 나누고, 리더가 당면한 비즈니스 이슈에 맞추어 맞춤형 실행 계획과 세션별 목표를 설계합니다."
      },
      {
        sessionNum: "1회",
        duration: "60분",
        recommendation: "Offline 추천",
        title: "핵심 과제 도출 및 우선순위 정렬",
        description: "한정된 시간과 에너지를 어디에 집중해야 할지 파악하고, 실행 가능한 우선순위를 재설정합니다."
      },
      {
        sessionNum: "2회~5회",
        duration: "회당 60분",
        title: "1:1 맞춤 코칭 세션",
        description: "집중 몰입을 방해하는 핵심 방해요인에 대한 사전 진단 및 피드백, 실행 가능한 돌파구 구조화 및 실행 정렬, 현장 실행에 대한 피드백 순환 조향, 그리고 코칭 이후에도 스스로 작동 가능한 주도적 마인드셋 및 업무 우선순위 판단 기준 수립"
      }
    ],
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "critical-framing",
    title: "Critical Problem Framing",
    category: "Clarity",
    totalDuration: "4~6시간",
    sessionsCount: "1:1 (4~6회)",
    shortSummary: "해결보다 앞서, 문제의 정의 자체를 다시 질문하는 근본적인 사고 작업",
    fullDescription: "해결법을 찾아 열심히 노력해도 진전이 없다면, 기존의 문제 정의 자체가 어긋나 있을 수 있습니다. 이 프로그램은 눈앞의 현상 뒤에 숨겨진 구조적 원인을 찾아내고, 다각적인 관점에서 올바른 질문을 새로 정의합니다. 단순한 문제 해결을 넘어, 시야 자체를 넓혀주는 사고 전환 프로그램입니다.",
    tailoringNotes: [
      "문제가 구조 분석 단계에 있을 뿐인지 실효 액션 단계와 결집되어 있는지에 따라 프로그램 비중이 조율됩니다.",
      "고객 자원의 가용성 및 실행 진도 속도에 발맞추어 코칭 실천 위주로 유연한 일정 전환이 가능합니다.",
      "1회 및 본질 분석 단계에서는 입체감 있는 소통을 위한 대면(Offline) 진행이 탁월합니다."
    ],
    sessions: [
      {
        sessionNum: "웰컴 세션",
        duration: "90~120분",
        recommendation: "얼라인먼트",
        title: "당면 문제 정의 및 코칭 방향성 설정",
        description: "현재 가로막혀 있는 문제 현상들을 스케치하고, 세션 전반에 고려할 환경적 요소와 맞춤형 요구사항을 정리합니다."
      },
      {
        sessionNum: "1회",
        duration: "60분",
        recommendation: "Offline 추천",
        title: "문제 증상 구분 및 근본 원인 파악",
        description: "눈앞의 일시적인 증상과 진짜 원인을 구분하고, 리더로서 집중해 해결해야 하는 핵심 과제를 정리합니다."
      },
      {
        sessionNum: "2회~6회",
        duration: "회당 60분",
        title: "1:1 맞춤 코칭 세션",
        description: "맞춤형 개별 안건을 토대로 다차원 구도 분석 및 맥락 속 무의식적인 왜곡 짚어보기, 시야를 넓혀 진짜 과제를 도출하는 구조 재정의, 가장 우선순위가 높은 전략적 해결 제안 및 입체적 실행 가설 설계, 그리고 현업 전개 후 피드백 및 자가 조정 가능한 사후 평가 피드백 체계 도출"
      }
    ],
    image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "thinking-conflict",
    title: "Think Through Conflict",
    category: "Balance",
    totalDuration: "4~6시간",
    sessionsCount: "1:1 (4~6회)",
    shortSummary: "갈등 상황에서 자동적으로 반복되는 내 사고 및 반응의 고리를 통찰하는 분석",
    fullDescription: "의견 대립이나 마찰이 발생하면 감정이 앞서며 평소 익숙한 반응 패턴을 보이기 쉽습니다. 이 프로그램은 신뢰성 높은 갈등 진단 도구(TKI)를 통해 갈등 상황에서 개인의 자동 반응 유형을 이해하고, 내 일과 삶의 환경에 맞춰 갈등을 대인관계 개선과 조직 발전의 건강한 기회로 바꾸는 사고 훈련입니다.",
    tailoringNotes: [
      "실제 얽힌 인물들과의 당면 시나리오의 성격에 따라 훈련 과정의 역할 비중을 커스텀화합니다.",
      "자신의 반응 방식 성찰에 중점을 둘지, 실전 조율 대화 스킬 향상에 매진할지에 따라 유연하게 융합 적용됩니다."
    ],
    sessions: [
      {
        sessionNum: "웰컴 세션 & 1회",
        duration: "90~120분",
        recommendation: "Offline 추천",
        title: "갈등 사례 탐색 및 TKI® 유형 진단",
        description: "현재 개인과 조직 내에서 스트레스를 유발하는 갈등 상황을 확인하며 세션의 기초 방향을 세우고, 토마스-킬만(TKI) 검사를 통해 갈등 시 주로 선택하는 5가지 대처 유형과 고유한 행동 스타일을 분석합니다."
      },
      {
        sessionNum: "2회~5회",
        duration: "회당 60분",
        title: "1:1 맞춤 코칭 세션",
        description: "갈등 진단(TKI) 결과 해석을 응용한 상황별 맞춤 대안 요령 맞춤화, 실제 예민한 대립 어젠다에 대한 의사소통 가설 및 1:1 리더 돌파 화법 설계, 실제 충돌 상황에 대비한 맞춤형 대응 시나리오 롤플레잉 및 피드백, 그리고 일상 유동성 조절과 안정을 지속하기 위한 회복탄력성 습관 체계화"
      }
    ],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "relational-dynamics",
    title: "Relational Dynamics & Alignment",
    category: "Balance",
    totalDuration: "3~6시간",
    sessionsCount: "1:1 (3~6회)",
    shortSummary: "관계 속에서 작용하는 숨겨진 세밀한 대인 욕구와 내 사고 구조의 탐색",
    fullDescription: "대인관계 능력을 단지 비위를 맞추거나 임기응변 식 대화법으로 타협하는 데 안주하지 않습니다. 본 프로그램은 협업과 리더십 전반에서 발현되는 소통 스타일과 심리적 기대를 면밀하게 해석합니다. 과학적인 성향 분석(FIRO-B®)을 토대로 소속감, 통제 욕구, 정서적 개방에 대해 내가 행동하는 수치와 타인에게 바라는 수치의 차이를 비교하며, 관계 흐름을 주도적으로 돌리는 튼튼한 이정표를 설계합니다.",
    tailoringNotes: [
      "진단 영역의 초점을 비즈니스 협력 주도권, 연인 관계, 리더십 스타일 등 목적성에 부응하여 맞춤 조정이 가능합니다.",
      "이해관계자 조율 속도에 맞춰, 원인 해부와 가치 정렬 중심의 실천 비중을 유기적으로 제어해 드립니다."
    ],
    sessions: [
      {
        sessionNum: "웰컴 세션 & 1회",
        duration: "90~120분",
        recommendation: "Offline 추천",
        title: "대인관계 탐색 및 FIRO-B® 성향 분석",
        description: "업무 환경 및 일상 속 대인관계를 파악하여 주요 분석 대상을 선별하고, 과학적인 FIRO-B® 검사를 통해 내가 상대방에게 표출하는 욕구와 기대하는 욕구 간의 격차를 객관적으로 분석합니다."
      },
      {
        sessionNum: "2회~5회",
        duration: "회당 60분",
        title: "1:1 맞춤 코칭 세션",
        description: "실제 비즈니스 소통 및 관계 성향 진단(FIRO-B) 피드백, 인지적 강점 분석 및 본인 리더십 소통의 사각지대(Blind Spot) 보완, 다양한 현압 상호작용 이슈(권한 위임, 설득 등) 대응 시나리오 실습 및 1:1 맞춤 지도, 그리고 조직 흐름을 주도하는 주관을 살린 단단한 공조 모델 및 종합 조율 가이드 정립"
      }
    ],
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "core-value",
    title: "Thinking Your Core Value",
    category: "Balance",
    totalDuration: "3~5시간",
    sessionsCount: "1:1 (3~5회)",
    shortSummary: "일시적 감정과 편향을 넘어, 내면의 독립적인 핵심 축을 찾아 세우는 정렬 작업",
    fullDescription: "남들의 평가나 기대에 지쳐 흔들리는 순간, 중심을 잡아 줄 독립된 원동력을 다시 세워야 합니다. 이 프로그램은 리더 고유의 경험과 삶의 고비를 통과하며 형성된 '핵심 가치(Core Value)'를 선별하고 자신의 언어로 다듬는 과정입니다. 흉내 낸 가치가 아닌 진짜 핵심 가치를 기준으로 삼아, 중요한 선택의 순간마다 흔들림 없는 등대 역할을 하도록 돕습니다.",
    tailoringNotes: [
      "진로 전환, 새로운 도전, 주요 변화 시점 등 현재 집중적인 고민이 필요한 상황에 맞추어 세션을 구성할 수 있습니다.",
      "프로그램 완료 이후에도 스스로 중심을 잡고 가벼운 판단을 이끌어낼 수 있는 핵심 가치 가이드라인을 제공합니다."
    ],
    sessions: [
      {
        sessionNum: "웰컴 세션 & 1회",
        duration: "90~120분",
        recommendation: "Offline 추천",
        title: "생애 경험 탐색 및 핵심 동기 분석",
        description: "전체적인 고충 해결을 위한 기초 대화와 함께, 성취감을 느꼈던 피크 경험(Peak Experience)과 어려웠던 순간을 돌아보고 고유한 핵심 가치의 단초를 포착합니다."
      },
      {
        sessionNum: "2회~5회",
        duration: "회당 60분",
        title: "1:1 맞춤 코칭 세션",
        description: "고객 생애 흐름 심층 탐색을 통한 고유한 가치 키워드 규명 및 핵심 신념 정의, 커리어 전환이나 조직 내부 변수 등 현재 밀접한 이슈들을 핵심 가치 축에 투영하는 1:1 의사결정 프레임 실전 매핑, 그리고 최종 행동 가이드를 합의 정립하며 정서적 불안 상황에서도 평화를 지킬 개인 맞춤형 균형 루틴 설계"
      }
    ],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "organizational-politics",
    title: "Thinking Organizational Politics",
    category: "Clarity",
    totalDuration: "3~4시간",
    sessionsCount: "1:1 (3~4회)",
    shortSummary: "사내 역학 관계를 입체적으로 조감하고, 영향력의 품격을 끌어올리는 현실적 리더십",
    fullDescription: "조직 정치는 불필요한 견제나 눈치 게임 같은 소모적인 일이 아닙니다. 다양한 관점과 이해관계가 얽혀 발생하는 리더십의 일환입니다. 본 프로그램은 건강한 주관을 살려 조직 내 흐름과 역동을 원활히 파악하고, 각자 고유한 영향력 유형(Politics Style)을 검토하여, 회사에서 추진 중인 중요 사업이나 비전이 지지를 얻어 원활하게 진행되도록 돕는 1:1 전략 과정입니다.",
    tailoringNotes: [
      "리더 개인의 상황(인사, 조직 개편, 주요 부서 조율 등)에 밀접하게 맞춤 설계하여 진행합니다.",
      "실제 현장에서 행동으로 연결할 수 있는 현실 적합성 높은 소통 아이디어들을 함께 수립합니다."
    ],
    sessions: [
      {
        sessionNum: "웰컴 세션 & 1회",
        duration: "90~120분",
        title: "이해관계 파악 및 사회적 영향력 유형(Politics Style) 진단",
        description: "직무 환경에서 나와 연결된 주요 이해관계자의 범위를 정리하고, 업무 환경이나 소통 채널에서 발휘하는 영향력 양상과 리더 고유 스타일을 규명합니다."
      },
      {
        sessionNum: "2회~4회",
        duration: "회당 60분",
        title: "1:1 맞춤 코칭 세션",
        description: "사내 주요 의사결정자와의 영향력 지형 분석 및 관계자 매핑(Power Mapping), 정파성을 넘어선 건전한 비즈니스 우호성 확보 및 우아한 설득 방향 설계, 그리고 실제 적용 훈련을 통한 조직 역학 정렬 및 의사결정 추진력을 위한 디테일한 소통 화법 피드백"
      }
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop"
  }
];
