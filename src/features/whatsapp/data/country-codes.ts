import type { CountryCode } from '../types'

// Re-export the type for convenience
export type { CountryCode } from '../types'
export type CountryCodeInfo = CountryCode

export const COUNTRY_CODES: CountryCode[] = [
  // Common countries (shown at top)
  { code: '+81', country: 'Japan', flag: '🇯🇵', format: '+81 XX XXXX XXXX' },
  { code: '+1', country: 'United States', flag: '🇺🇸', format: '+1 XXX XXX XXXX' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', format: '+44 XXXX XXXXXX' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', format: '+971 XX XXX XXXX' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', format: '+966 XX XXX XXXX' },
  { code: '+91', country: 'India', flag: '🇮🇳', format: '+91 XXXXX XXXXX' },
  { code: '+86', country: 'China', flag: '🇨🇳', format: '+86 XXX XXXX XXXX' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', format: '+82 XX XXXX XXXX' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', format: '+65 XXXX XXXX' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', format: '+61 XXX XXX XXX' },

  // Other countries (alphabetical)
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫', format: '+93 XX XXX XXXX' },
  { code: '+355', country: 'Albania', flag: '🇦🇱', format: '+355 XX XXX XXXX' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿', format: '+213 XXX XX XX XX' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩', format: '+376 XXX XXX' },
  { code: '+244', country: 'Angola', flag: '🇦🇴', format: '+244 XXX XXX XXX' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', format: '+54 XX XXXX XXXX' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲', format: '+374 XX XXX XXX' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', format: '+43 XXX XXXXXX' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', format: '+994 XX XXX XXXX' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', format: '+973 XXXX XXXX' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', format: '+880 XXXX XXXXXX' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾', format: '+375 XX XXX XXXX' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', format: '+32 XXX XX XX XX' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', format: '+55 XX XXXXX XXXX' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳', format: '+673 XXX XXXX' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬', format: '+359 XX XXX XXXX' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭', format: '+855 XX XXX XXX' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲', format: '+237 XXXX XXXX' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', format: '+1 XXX XXX XXXX' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', format: '+56 X XXXX XXXX' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', format: '+57 XXX XXX XXXX' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷', format: '+385 XX XXX XXXX' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾', format: '+357 XX XXX XXX' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿', format: '+420 XXX XXX XXX' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', format: '+45 XX XX XX XX' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', format: '+20 XX XXXX XXXX' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪', format: '+372 XXXX XXXX' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹', format: '+251 XX XXX XXXX' },
  { code: '+358', country: 'Finland', flag: '🇫🇮', format: '+358 XX XXX XXXX' },
  { code: '+33', country: 'France', flag: '🇫🇷', format: '+33 X XX XX XX XX' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪', format: '+995 XXX XX XX XX' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', format: '+49 XXX XXXXXXX' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', format: '+233 XX XXX XXXX' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', format: '+30 XXX XXX XXXX' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', format: '+852 XXXX XXXX' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺', format: '+36 XX XXX XXXX' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸', format: '+354 XXX XXXX' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', format: '+62 XXX XXXX XXXX' },
  { code: '+98', country: 'Iran', flag: '🇮🇷', format: '+98 XXX XXX XXXX' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶', format: '+964 XXX XXX XXXX' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', format: '+353 XX XXX XXXX' },
  { code: '+972', country: 'Israel', flag: '🇮🇱', format: '+972 XX XXX XXXX' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', format: '+39 XXX XXX XXXX' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', format: '+962 X XXXX XXXX' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿', format: '+7 XXX XXX XXXX' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', format: '+254 XXX XXX XXX' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', format: '+965 XXXX XXXX' },
  { code: '+856', country: 'Laos', flag: '🇱🇦', format: '+856 XX XXX XXX' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻', format: '+371 XXXX XXXX' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', format: '+961 XX XXX XXX' },
  { code: '+218', country: 'Libya', flag: '🇱🇾', format: '+218 XX XXX XXXX' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹', format: '+370 XXX XXXXX' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺', format: '+352 XXX XXX XXX' },
  { code: '+853', country: 'Macau', flag: '🇲🇴', format: '+853 XXXX XXXX' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', format: '+60 XX XXXX XXXX' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻', format: '+960 XXX XXXX' },
  { code: '+356', country: 'Malta', flag: '🇲🇹', format: '+356 XXXX XXXX' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', format: '+52 XX XXXX XXXX' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨', format: '+377 XXXX XXXX' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳', format: '+976 XXXX XXXX' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦', format: '+212 XXX XXX XXX' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲', format: '+95 XX XXX XXXX' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', format: '+977 XX XXXX XXXX' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', format: '+31 X XXXX XXXX' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', format: '+64 XX XXX XXXX' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', format: '+234 XXX XXX XXXX' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', format: '+47 XXX XX XXX' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', format: '+968 XXXX XXXX' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', format: '+92 XXX XXX XXXX' },
  { code: '+507', country: 'Panama', flag: '🇵🇦', format: '+507 XXXX XXXX' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', format: '+51 XXX XXX XXX' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', format: '+63 XXX XXX XXXX' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', format: '+48 XXX XXX XXX' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', format: '+351 XXX XXX XXX' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', format: '+974 XXXX XXXX' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', format: '+40 XXX XXX XXX' },
  { code: '+7', country: 'Russia', flag: '🇷🇺', format: '+7 XXX XXX XXXX' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼', format: '+250 XXX XXX XXX' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸', format: '+381 XX XXX XXXX' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰', format: '+421 XXX XXX XXX' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮', format: '+386 XX XXX XXX' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', format: '+27 XX XXX XXXX' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', format: '+34 XXX XXX XXX' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', format: '+94 XX XXX XXXX' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', format: '+46 XX XXX XXXX' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', format: '+41 XX XXX XXXX' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼', format: '+886 XXX XXX XXX' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', format: '+66 XX XXX XXXX' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', format: '+90 XXX XXX XXXX' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬', format: '+256 XXX XXX XXX' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦', format: '+380 XX XXX XXXX' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾', format: '+598 X XXX XXXX' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', format: '+998 XX XXX XXXX' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪', format: '+58 XXX XXX XXXX' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', format: '+84 XX XXX XXXX' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪', format: '+967 XXX XXX XXX' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲', format: '+260 XX XXX XXXX' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', format: '+263 XX XXX XXXX' },
]

// Common countries to show at top of selector
export const COMMON_COUNTRY_CODES = ['+81', '+1', '+44', '+971', '+966', '+91', '+86', '+82', '+65', '+61']

// Get country by code
export function getCountryByCode(code: string): CountryCode | undefined {
  return COUNTRY_CODES.find((c) => c.code === code)
}

// Search countries
export function searchCountries(query: string): CountryCode[] {
  const lowerQuery = query.toLowerCase()
  return COUNTRY_CODES.filter(
    (c) =>
      c.country.toLowerCase().includes(lowerQuery) ||
      c.code.includes(query)
  )
}

// Alias exports for different import styles
export const countryCodes = COUNTRY_CODES
