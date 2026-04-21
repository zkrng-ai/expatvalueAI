export const CITY_CURRENCY_MAP = {
  '워싱턴 D.C.': 'USD',
  '뉴욕': 'USD', 
  '로스앤젤레스': 'USD', 
  '샌프란시스코': 'USD',
  '프랑크푸르트': 'EUR',
  '런던': 'GBP', 
  '도쿄': 'JPY', 
  '하노이': 'VND',
  '싱가포르': 'SGD',
  '리야드': 'SAR',
  '서울': 'KRW'
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
    'VND': 0.055, // 1 VND = 0.055 KRW
    'SGD': 1025.0, // 1 SGD = 1025.0 KRW
    'SAR': 369.5, // 1 SAR = 369.5 KRW
    'KRW': 1.0
  }
};
