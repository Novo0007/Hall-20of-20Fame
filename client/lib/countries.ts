// Country data with flags and names
export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "���🇳" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "HT", name: "Haiti", flag: "🇭🇹" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲" },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹" },
  { code: "BB", name: "Barbados", flag: "🇧🇧" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸" },
  { code: "BZ", name: "Belize", flag: "🇧🇿" },
  { code: "GY", name: "Guyana", flag: "🇬🇾" },
  { code: "SR", name: "Suriname", flag: "🇸🇷" },
  { code: "GF", name: "French Guiana", flag: "🇬🇫" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮" },
  { code: "MC", name: "Monaco", flag: "🇲🇨" },
  { code: "AD", name: "Andorra", flag: "🇦🇩" },
  { code: "SM", name: "San Marino", flag: "🇸���" },
  { code: "VA", name: "Vatican City", flag: "🇻🇦" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "MD", name: "Moldova", flag: "🇲🇩" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "BY", name: "Belarus", flag: "🇧🇾" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { code: "RS", name: "Serbia", flag: "🇷🇸" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪" },
  { code: "XK", name: "Kosovo", flag: "🇽🇰" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "PS", name: "Palestine", flag: "🇵🇸" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "SY", name: "Syria", flag: "🇸🇾" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "MV", name: "Maldives", flag: "🇲🇻" },
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "BT", name: "Bhutan", flag: "🇧🇹" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲" },
  { code: "LA", name: "Laos", flag: "🇱🇦" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭" },
  { code: "BN", name: "Brunei", flag: "🇧🇳" },
  { code: "TL", name: "East Timor", flag: "🇹🇱" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬" },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯" },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "YE", name: "Yemen", flag: "🇾🇪" },
  { code: "GE", name: "Georgia", flag: "🇬🇪" },
  { code: "AM", name: "Armenia", flag: "🇦🇲" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
];

// Get country by code
export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(
    (country) => country.code.toLowerCase() === code.toLowerCase(),
  );
};

// Get popular countries for quick selection
export const getPopularCountries = (): Country[] => {
  return countries.filter((country) =>
    [
      "US",
      "GB",
      "CA",
      "AU",
      "DE",
      "FR",
      "IT",
      "ES",
      "JP",
      "KR",
      "CN",
      "IN",
      "BR",
      "MX",
      "RU",
    ].includes(country.code),
  );
};

// Auto-detect country using IP geolocation
export const detectUserCountry = async (): Promise<Country | null> => {
  try {
    // Try multiple IP geolocation services for reliability
    const services = [
      "https://ipapi.co/country/",
      "https://ipinfo.io/country",
      "https://api.country.is/",
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        if (response.ok) {
          let countryCode: string;

          if (service.includes("country.is")) {
            const data = await response.json();
            countryCode = data.country;
          } else {
            countryCode = (await response.text()).trim();
          }

          const country = getCountryByCode(countryCode);
          if (country) {
            return country;
          }
        }
      } catch (error) {
        console.warn(`Failed to detect country from ${service}:`, error);
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("Country detection failed:", error);
    return null;
  }
};

// Search countries by name
export const searchCountries = (query: string): Country[] => {
  const lowercaseQuery = query.toLowerCase();
  return countries.filter(
    (country) =>
      country.name.toLowerCase().includes(lowercaseQuery) ||
      country.code.toLowerCase().includes(lowercaseQuery),
  );
};
