/**
 * Spendable Income (SI) 보간법 계산 (MERCER 모델 기반 선형 보간, Pure Function)
 * @param {number} baseSalary 기본연봉
 * @returns {number} 적용된 SI 퍼센티지 (%)
 */
export const calculateSIPercentage = (baseSalary) => {
  if (!baseSalary || baseSalary <= 50000000) return 50.0;
  if (baseSalary >= 200000000) return 35.0;

  let lowerBound, upperBound, lowerPct, upperPct;

  if (baseSalary < 100000000) {
    lowerBound = 50000000; upperBound = 100000000;
    lowerPct = 50.0; upperPct = 44.56;
  } else if (baseSalary < 150000000) {
    lowerBound = 100000000; upperBound = 150000000;
    lowerPct = 44.56; upperPct = 40.0;
  } else {
    lowerBound = 150000000; upperBound = 200000000;
    lowerPct = 40.0; upperPct = 35.0;
  }

  const ratio = (baseSalary - lowerBound) / (upperBound - lowerBound);
  return lowerPct - (ratio * (lowerPct - upperPct));
};

/**
 * 가족 구성에 따른 SI 가산액 계산 (Pure Function)
 * @param {number} baseSIAmount 단신 SI 금액
 * @param {string} familyType 가족 구성 타입 ('single' | 'family')
 * @returns {number} 최종 가산된 SI 금액
 */
export const calculateFamilySIAmount = (baseSIAmount, familyType) => {
  const familyMultiplier = familyType === 'family' ? 1.15 : 1.0;
  return baseSIAmount * familyMultiplier;
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
