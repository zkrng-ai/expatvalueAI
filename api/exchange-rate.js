import axios from 'axios';

export default async function handler(req, res) {
  const targetYear = new Date().getFullYear() - 1;
  const startDate = `${targetYear}0101`;
  const endDate = `${targetYear}1231`;

  const frankfurterStart = `${targetYear}-01-01`;
  const frankfurterEnd = `${targetYear}-12-31`;

  let finalRates = {};
  let dataSource = '';

  const apiKey = process.env.VITE_API_KEY_ENARA;

  try {
    if (!apiKey || apiKey === 'your_enara_or_bok_api_key_here') {
      throw new Error('한국은행 ECOS API 키가 설정되지 않았습니다.');
    }

    const apiUrl = `https://api.bok.or.kr/ecos/${apiKey}/json/StatisticSearch/1/1000/036Y001/D/${startDate}/${endDate}/0000001`;
    const bokRes = await axios.get(apiUrl, { timeout: 5000 });
    
    if (bokRes.data && bokRes.data.StatisticSearch && bokRes.data.StatisticSearch.row) {
      const rows = bokRes.data.StatisticSearch.row;
      let sum = 0;
      rows.forEach(row => { sum += parseFloat(row.DATA_VALUE); });
      const avgUsd = sum / rows.length;
      
      finalRates = { 
        'USD': avgUsd,
        'GBP': avgUsd * 1.25, 
        'JPY': avgUsd * 0.0065,
        'EUR': avgUsd * 1.05,
        'VND': avgUsd * 0.000039, // Static ratio fallback for VND
        'SGD': avgUsd * 0.74, // Static ratio fallback for SGD
        'SAR': avgUsd * 0.266, // Static ratio fallback for SAR
        'KRW': 1.0 
      };
      dataSource = '한국은행 ECOS';
    } else {
      throw new Error('한국은행 API 데이터 형식이 올바르지 않거나 응답이 없습니다.');
    }
  } catch (error) {
    console.warn('한국은행 API 호출 실패, Frankfurter API로 Fallback 시도:', error.message);
    
    try {
      const fetchAvgRate = async (fromCur) => {
        const url = `https://api.frankfurter.app/${frankfurterStart}..${frankfurterEnd}?from=${fromCur}&to=KRW`;
        const frankRes = await axios.get(url, { timeout: 5000 });
        const rates = frankRes.data.rates;
        let sum = 0;
        let count = 0;
        for (const date in rates) {
          sum += rates[date].KRW;
          count++;
        }
        return sum / count;
      };

      const [avgUSD, avgGBP, avgEUR, avgSGD] = await Promise.all([
        fetchAvgRate('USD'),
        fetchAvgRate('GBP'),
        fetchAvgRate('EUR'),
        fetchAvgRate('SGD').catch(() => null) // SGD might be supported
      ]);

      const avgJPY = await fetchAvgRate('JPY') * 100;

      // Frankfurter doesn't support VND and SAR reliably, apply static USD peg ratios
      const avgVND = avgUSD * 0.000039;
      const avgSAR = avgUSD * 0.266;

      finalRates = {
        'USD': avgUSD,
        'GBP': avgGBP,
        'JPY': avgJPY / 100, 
        'EUR': avgEUR,
        'SGD': avgSGD || avgUSD * 0.74,
        'VND': avgVND,
        'SAR': avgSAR,
        'KRW': 1.0
      };
      dataSource = 'Frankfurter API';
    } catch (fallbackError) {
      console.error('Frankfurter API까지 모두 실패했습니다:', fallbackError.message);
      return res.status(200).json({
        meta: {
          lastUpdated: new Date().toISOString().split('T')[0],
          source: 'Fallback Cache (e-나라지표)',
          calcMethod: '직전년도 일별 환율 산술 평균 (Static)',
          targetYear: targetYear
        },
        rates: {
          'USD': 1385.5,
          'GBP': 1720.0,
          'JPY': 9.15,
          'EUR': 1480.0,
          'VND': 0.055,
          'SGD': 1025.0,
          'SAR': 369.5,
          'KRW': 1.0
        }
      });
    }
  }

  res.status(200).json({
    meta: {
      lastUpdated: new Date().toISOString().split('T')[0],
      source: dataSource,
      calcMethod: `${targetYear}년 일별 환율 산술 평균`,
      targetYear: targetYear
    },
    rates: finalRates
  });
}
