'use strict';
/* Settings for the backend teammate. This file is public: no secrets here. */
window.IMV_CONFIG = {
  API_BASE: '',                                   // e.g. 'https://api.yourdomain.co.za'. Empty = demo mode (nothing is sent anywhere)
  ENDPOINTS: { voter: '/session/voter', verify: '/session/verify', ballot: '/ballot', cast: '/ballot/cast' },
  WEBSITE_URL: 'https://youthjsm.github.io/Independent-Mandate/',
  IDLE_SECONDS: 120,                              // booth resets after this long with no touch
  RECEIPT_SECONDS: 45,                            // receipt screen returns to start after this long
  DEMO_OTP: '482910',                             // demo mode only
  DEMO: {                                         // sample data (fictional); the backend replaces this
    voter: { name: 'T. Mokoena', idMasked: '900101 ••••• 89', municipality: 'City of Johannesburg (Metro, 2 ballots)', ward: 'Ward 42', vd: '32840192', phoneLast4: '4821' },
    ward: [
      { id: 'w1', name: 'KHUMALO, Sipho', party: 'Party Alpha (PA)', acr: 'PA' },
      { id: 'w2', name: 'MOKOENA, Lerato', party: 'Independent Candidate', acr: 'IND' },
      { id: 'w3', name: 'NAIDOO, Priya', party: 'Party Beta (PB)', acr: 'PB' },
      { id: 'w4', name: 'VAN DER MERWE, Johan', party: 'Party Gamma (PG)', acr: 'PG' }
    ],
    pr: [
      { id: 'p1', name: 'PARTY ALPHA (PA)', acr: 'PA' }, { id: 'p2', name: 'PARTY BETA (PB)', acr: 'PB' },
      { id: 'p3', name: 'PARTY GAMMA (PG)', acr: 'PG' }, { id: 'p4', name: 'PARTY DELTA (PD)', acr: 'PD' }
    ]                                             // optional per item: photo / logo image URLs
  }
};
