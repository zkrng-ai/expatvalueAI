export const CITY_CURRENCY_MAP = {
  '뉴욕': 'USD', 
  '로스앤젤레스': 'USD', 
  '시카고': 'USD', 
  '워싱턴 D.C.': 'USD',
  '런던': 'GBP', 
  '도쿄': 'JPY', 
  '베를린': 'EUR', 
  '서울': 'KRW', 
  '부산': 'KRW'
};

export const FALLBACK_EXCHANGE_RATES = {
  meta: {
    lastUpdated: '2026-01-01',
    source: 'Fallback Cache (e-나라지표)',
    calcMethod: '직전년도 일별 환율 산술 평균 (Fallback)'
  },
  rates: {
    'USD': 1385.5,
    'GBP': 1720.0,
    'JPY': 9.15,
    'EUR': 1480.0,
    'KRW': 1.0
  }
};
