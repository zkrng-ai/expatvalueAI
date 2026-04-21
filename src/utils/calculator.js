export const ANNUAL_SI_MAP = {
  2026: {
    single: [
      { bound: 50000000, pct: 50.0 },
      { bound: 100000000, pct: 44.56 },
      { bound: 150000000, pct: 40.0 },
      { bound: 200000000, pct: 35.0 }
    ],
    family: [
      { bound: 50000000, pct: 57.5 },
      { bound: 100000000, pct: 51.15 },
      { bound: 150000000, pct: 46.0 },
      { bound: 200000000, pct: 40.25 }
    ]
  }
};

/**
 * 현재 활성화된 연도의 특정 가족 타입에 대한 SI 곡선을 반환
 */
export const getActiveCurve = (familyType = 'single', year = new Date().getFullYear(), customSiMap = {}) => {
  const activeYearMap = customSiMap[year] || ANNUAL_SI_MAP[year] || ANNUAL_SI_MAP[2026];
  return activeYearMap[familyType] || activeYearMap['single'];
};

/**
 * Spendable Income (SI) 보간법 계산 (MERCER 모델 기반 선형 보간, Pure Function)
 * @param {number} baseSalary 기본연봉
 * @param {string} familyType 가족 구성 타입 ('single' | 'family')
 * @param {number} year 연도 (기본값: 현재 연도)
 * @param {object} customSiMap 관리자 커스텀 SI 데이터
 * @returns {number} 적용된 SI 퍼센티지 (%)
 */
export const calculateSIPercentage = (baseSalary, familyType = 'single', year = new Date().getFullYear(), customSiMap = {}) => {
  const curve = getActiveCurve(familyType, year, customSiMap);

  if (!baseSalary || baseSalary <= curve[0].bound) return curve[0].pct;
  if (baseSalary >= curve[curve.length - 1].bound) return curve[curve.length - 1].pct;

  let lowerBound, upperBound, lowerPct, upperPct;

  for (let i = 0; i < curve.length - 1; i++) {
    if (baseSalary >= curve[i].bound && baseSalary < curve[i + 1].bound) {
      lowerBound = curve[i].bound;
      upperBound = curve[i + 1].bound;
      lowerPct = curve[i].pct;
      upperPct = curve[i + 1].pct;
      break;
    }
  }

  const ratio = (baseSalary - lowerBound) / (upperBound - lowerBound);
  return lowerPct - (ratio * (lowerPct - upperPct));
};

/**
 * 미 국무부 원본 데이터를 바탕으로 서울을 기준점(100)으로 변환하는 순수 함수
 * @param {number} rawCol Host 도시의 원본 Index (워싱턴=100 기준)
 * @param {number} seoulBase 서울의 원본 Index (워싱턴=100 기준)
 * @returns {number} 변환된 상대적 COL Index (%)
 */
export const calculateAdjustedCol = (rawCol, seoulBase) => {
  if (!rawCol || !seoulBase) return 100.00;
  return (rawCol / seoulBase) * 100;
};
