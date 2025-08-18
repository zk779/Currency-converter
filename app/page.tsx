"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowRightLeft,
  TrendingUp,
  Globe,
  Zap,
  Shield,
  RefreshCw,
  Star,
  Activity,
  Heart,
  History,
  Calculator,
  ChevronUp,
  ChevronDown,
  Clock,
  DollarSign,
  Moon,
  Sun,
  Search,
} from "lucide-react"

interface ExchangeRates {
  [key: string]: number
}

interface ApiResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  conversion_rates: ExchangeRates
}

interface PairConversionResult {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  target_code: string
  conversion_rate: number
  conversion_result: number
}

interface ConversionHistory {
  id: string
  amount: string
  fromCurrency: string
  toCurrency: string
  result: number
  rate: number
  timestamp: Date
}

interface FavoritePair {
  from: string
  to: string
  name: string
}

const allCurrencies = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "PKR", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "AFN", name: "Afghan Afghani", flag: "🇦🇫" },
  { code: "ALL", name: "Albanian Lek", flag: "🇦🇱" },
  { code: "AMD", name: "Armenian Dram", flag: "🇦🇲" },
  { code: "ANG", name: "Netherlands Antillean Guilder", flag: "🇳🇱" },
  { code: "AOA", name: "Angolan Kwanza", flag: "🇦🇴" },
  { code: "ARS", name: "Argentine Peso", flag: "🇦🇷" },
  { code: "AWG", name: "Aruban Florin", flag: "🇦🇼" },
  { code: "AZN", name: "Azerbaijani Manat", flag: "🇦🇿" },
  { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark", flag: "🇧🇦" },
  { code: "BBD", name: "Barbadian Dollar", flag: "🇧🇧" },
  { code: "BDT", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "BGN", name: "Bulgarian Lev", flag: "🇧🇬" },
  { code: "BHD", name: "Bahraini Dinar", flag: "🇧🇭" },
  { code: "BIF", name: "Burundian Franc", flag: "🇧🇮" },
  { code: "BMD", name: "Bermudan Dollar", flag: "🇧🇲" },
  { code: "BND", name: "Brunei Dollar", flag: "🇧🇳" },
  { code: "BOB", name: "Bolivian Boliviano", flag: "🇧🇴" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "BSD", name: "Bahamian Dollar", flag: "🇧🇸" },
  { code: "BTN", name: "Bhutanese Ngultrum", flag: "🇧🇹" },
  { code: "BWP", name: "Botswanan Pula", flag: "🇧🇼" },
  { code: "BYN", name: "Belarusian Ruble", flag: "🇧🇾" },
  { code: "BZD", name: "Belize Dollar", flag: "🇧🇿" },
  { code: "CDF", name: "Congolese Franc", flag: "🇨🇩" },
  { code: "CLP", name: "Chilean Peso", flag: "🇨🇱" },
  { code: "COP", name: "Colombian Peso", flag: "🇨🇴" },
  { code: "CRC", name: "Costa Rican Colón", flag: "🇨🇷" },
  { code: "CUP", name: "Cuban Peso", flag: "🇨🇺" },
  { code: "CVE", name: "Cape Verdean Escudo", flag: "🇨🇻" },
  { code: "CZK", name: "Czech Republic Koruna", flag: "🇨🇿" },
  { code: "DJF", name: "Djiboutian Franc", flag: "🇩🇯" },
  { code: "DKK", name: "Danish Krone", flag: "🇩🇰" },
  { code: "DOP", name: "Dominican Peso", flag: "🇩🇴" },
  { code: "DZD", name: "Algerian Dinar", flag: "🇩🇿" },
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬" },
  { code: "ERN", name: "Eritrean Nakfa", flag: "🇪🇷" },
  { code: "ETB", name: "Ethiopian Birr", flag: "🇪🇹" },
  { code: "FJD", name: "Fijian Dollar", flag: "🇫🇯" },
  { code: "FKP", name: "Falkland Islands Pound", flag: "🇫🇰" },
  { code: "FOK", name: "Faroese Króna", flag: "🇫🇴" },
  { code: "GEL", name: "Georgian Lari", flag: "🇬🇪" },
  { code: "GGP", name: "Guernsey Pound", flag: "🇬🇬" },
  { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "GIP", name: "Gibraltar Pound", flag: "🇬🇮" },
  { code: "GMD", name: "Gambian Dalasi", flag: "🇬🇲" },
  { code: "GNF", name: "Guinean Franc", flag: "🇬🇳" },
  { code: "GTQ", name: "Guatemalan Quetzal", flag: "🇬🇹" },
  { code: "GYD", name: "Guyanaese Dollar", flag: "🇬🇾" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "HNL", name: "Honduran Lempira", flag: "🇭🇳" },
  { code: "HRK", name: "Croatian Kuna", flag: "🇭🇷" },
  { code: "HTG", name: "Haitian Gourde", flag: "🇭🇹" },
  { code: "HUF", name: "Hungarian Forint", flag: "🇭🇺" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "ILS", name: "Israeli New Sheqel", flag: "🇮🇱" },
  { code: "IMP", name: "Manx pound", flag: "🇮🇲" },
  { code: "IQD", name: "Iraqi Dinar", flag: "🇮🇶" },
  { code: "IRR", name: "Iranian Rial", flag: "🇮🇷" },
  { code: "ISK", name: "Icelandic Króna", flag: "🇮🇸" },
  { code: "JEP", name: "Jersey Pound", flag: "🇯🇪" },
  { code: "JMD", name: "Jamaican Dollar", flag: "🇯🇲" },
  { code: "JOD", name: "Jordanian Dinar", flag: "🇯🇴" },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪" },
  { code: "KGS", name: "Kyrgystani Som", flag: "🇰🇬" },
  { code: "KHR", name: "Cambodian Riel", flag: "🇰🇭" },
  { code: "KID", name: "Kiribati Dollar", flag: "🇰🇮" },
  { code: "KMF", name: "Comorian Franc", flag: "🇰🇲" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷" },
  { code: "KWD", name: "Kuwaiti Dinar", flag: "🇰🇼" },
  { code: "KYD", name: "Cayman Islands Dollar", flag: "🇰🇾" },
  { code: "KZT", name: "Kazakhstani Tenge", flag: "🇰🇿" },
  { code: "LAK", name: "Laotian Kip", flag: "🇱🇦" },
  { code: "LBP", name: "Lebanese Pound", flag: "🇱🇧" },
  { code: "LKR", name: "Sri Lankan Rupee", flag: "🇱🇰" },
  { code: "LRD", name: "Liberian Dollar", flag: "🇱🇷" },
  { code: "LSL", name: "Lesotho Loti", flag: "🇱🇸" },
  { code: "LYD", name: "Libyan Dinar", flag: "🇱🇾" },
  { code: "MAD", name: "Moroccan Dirham", flag: "🇲🇦" },
  { code: "MDL", name: "Moldovan Leu", flag: "🇲🇩" },
  { code: "MGA", name: "Malagasy Ariary", flag: "🇲🇬" },
  { code: "MKD", name: "Macedonian Denar", flag: "🇲🇰" },
  { code: "MMK", name: "Myanma Kyat", flag: "🇲🇲" },
  { code: "MNT", name: "Mongolian Tugrik", flag: "🇲🇳" },
  { code: "MOP", name: "Macanese Pataca", flag: "🇲🇴" },
  { code: "MRU", name: "Mauritanian Ouguiya", flag: "🇲🇷" },
  { code: "MUR", name: "Mauritian Rupee", flag: "🇲🇺" },
  { code: "MVR", name: "Maldivian Rufiyaa", flag: "🇲🇻" },
  { code: "MWK", name: "Malawian Kwacha", flag: "🇲🇼" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "MZN", name: "Mozambican Metical", flag: "🇲🇿" },
  { code: "NAD", name: "Namibian Dollar", flag: "🇳🇦" },
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "NIO", name: "Nicaraguan Córdoba", flag: "🇳🇮" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "NPR", name: "Nepalese Rupee", flag: "🇳🇵" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "OMR", name: "Omani Rial", flag: "🇴🇲" },
  { code: "PAB", name: "Panamanian Balboa", flag: "🇵🇦" },
  { code: "PEN", name: "Peruvian Nuevo Sol", flag: "🇵🇪" },
  { code: "PGK", name: "Papua New Guinean Kina", flag: "🇵🇬" },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "PLN", name: "Polish Zloty", flag: "🇵🇱" },
  { code: "PYG", name: "Paraguayan Guarani", flag: "🇵🇾" },
  { code: "QAR", name: "Qatari Rial", flag: "🇶🇦" },
  { code: "RON", name: "Romanian Leu", flag: "🇷🇴" },
  { code: "RSD", name: "Serbian Dinar", flag: "🇷🇸" },
  { code: "RUB", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "RWF", name: "Rwandan Franc", flag: "🇷🇼" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "SBD", name: "Solomon Islands Dollar", flag: "🇸🇧" },
  { code: "SCR", name: "Seychellois Rupee", flag: "🇸🇨" },
  { code: "SDG", name: "Sudanese Pound", flag: "🇸🇩" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "SHP", name: "Saint Helena Pound", flag: "🇸🇭" },
  { code: "SLE", name: "Sierra Leonean Leone", flag: "🇸🇱" },
  { code: "SLL", name: "Sierra Leonean Leone (Old)", flag: "🇸🇱" },
  { code: "SOS", name: "Somali Shilling", flag: "🇸🇴" },
  { code: "SRD", name: "Surinamese Dollar", flag: "🇸🇷" },
  { code: "SSP", name: "South Sudanese Pound", flag: "🇸🇸" },
  { code: "STN", name: "São Tomé and Príncipe Dobra", flag: "🇸🇹" },
  { code: "SYP", name: "Syrian Pound", flag: "🇸🇾" },
  { code: "SZL", name: "Swazi Lilangeni", flag: "🇸🇿" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭" },
  { code: "TJS", name: "Tajikistani Somoni", flag: "🇹🇯" },
  { code: "TMT", name: "Turkmenistani Manat", flag: "🇹🇲" },
  { code: "TND", name: "Tunisian Dinar", flag: "🇹🇳" },
  { code: "TOP", name: "Tongan Paʻanga", flag: "🇹🇴" },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "TTD", name: "Trinidad and Tobago Dollar", flag: "🇹🇹" },
  { code: "TVD", name: "Tuvaluan Dollar", flag: "🇹🇻" },
  { code: "TWD", name: "New Taiwan Dollar", flag: "🇹🇼" },
  { code: "TZS", name: "Tanzanian Shilling", flag: "🇹🇿" },
  { code: "UAH", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  { code: "UGX", name: "Ugandan Shilling", flag: "🇺🇬" },
  { code: "UYU", name: "Uruguayan Peso", flag: "🇺🇾" },
  { code: "UZS", name: "Uzbekistan Som", flag: "🇺🇿" },
  { code: "VES", name: "Venezuelan Bolívar", flag: "🇻🇪" },
  { code: "VND", name: "Vietnamese Dong", flag: "🇻🇳" },
  { code: "VUV", name: "Vanuatu Vatu", flag: "🇻🇺" },
  { code: "WST", name: "Samoan Tala", flag: "🇼🇸" },
  { code: "XAF", name: "CFA Franc BEAC", flag: "🌍" },
  { code: "XCD", name: "East Caribbean Dollar", flag: "🏝️" },
  { code: "XCG", name: "Caribbean Guilder", flag: "🏝️" },
  { code: "XDR", name: "Special Drawing Rights", flag: "🏛️" },
  { code: "XOF", name: "CFA Franc BCEAO", flag: "🌍" },
  { code: "XPF", name: "CFP Franc", flag: "🏝️" },
  { code: "YER", name: "Yemeni Rial", flag: "🇾🇪" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
  { code: "ZMW", name: "Zambian Kwacha", flag: "🇿🇲" },
  { code: "ZWL", name: "Zimbabwean Dollar", flag: "🇿🇼" },
]

const popularPairs = [
  { from: "USD", to: "EUR", name: "USD to EUR" },
  { from: "USD", to: "GBP", name: "USD to GBP" },
  { from: "USD", to: "JPY", name: "USD to JPY" },
  { from: "USD", to: "PKR", name: "USD to PKR" },
  { from: "EUR", to: "USD", name: "EUR to USD" },
  { from: "EUR", to: "GBP", name: "EUR to GBP" },
  { from: "GBP", to: "USD", name: "GBP to USD" },
  { from: "GBP", to: "EUR", name: "GBP to EUR" },
  { from: "USD", to: "CAD", name: "USD to CAD" },
  { from: "USD", to: "AUD", name: "USD to AUD" },
  { from: "USD", to: "CHF", name: "USD to CHF" },
  { from: "USD", to: "CNY", name: "USD to CNY" },
]

const popularCurrencies = allCurrencies.slice(0, 10) // Keep first 10 as popular

// API Key - Use environment variable in production
const API_KEY = "098e0d7f479d16ba37988dbe"

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("1")
  const [fromCurrency, setFromCurrency] = useState<string>("USD")
  const [toCurrency, setToCurrency] = useState<string>("PKR")
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({})
  const [conversionResult, setConversionResult] = useState<PairConversionResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"converter" | "rates" | "history" | "favorites">("converter")
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])
  const [favoritePairs, setFavoritePairs] = useState<FavoritePair[]>([
    { from: "USD", to: "EUR", name: "USD to EUR" },
    { from: "USD", to: "GBP", name: "USD to GBP" },
    { from: "USD", to: "JPY", name: "USD to JPY" },
  ])
  const [previousRates, setPreviousRates] = useState<ExchangeRates>({})
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [currencySearch, setCurrencySearch] = useState<string>("")

  // Debounced amount for smoother UX
  const debouncedAmount = useDebounce(amount, 500)

  const filteredCurrencies = allCurrencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      currency.name.toLowerCase().includes(currencySearch.toLowerCase()),
  )

  const fetchExchangeRates = async (baseCurrency = "USD") => {
    setRefreshing(true)
    setError(null)
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`)
      if (!response.ok) throw new Error("Failed to fetch rates")

      const data: ApiResponse = await response.json()

      if (data.result === "success") {
        setPreviousRates(exchangeRates)
        setExchangeRates(data.conversion_rates)
        setLastUpdated(new Date(data.time_last_update_utc).toLocaleTimeString())
      } else {
        throw new Error("API returned error: " + data.result)
      }
    } catch (err) {
      console.error("Error fetching exchange rates:", err)
      setError("Failed to load exchange rates. Please try again later.")
    } finally {
      setRefreshing(false)
    }
  }

  const convertCurrency = useCallback(async () => {
    if (!debouncedAmount || isNaN(Number(debouncedAmount)) || !fromCurrency || !toCurrency) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}/${debouncedAmount}`,
      )
      if (!response.ok) throw new Error("Conversion failed")

      const data: PairConversionResult = await response.json()

      if (data.result === "success") {
        setConversionResult(data)

        const newHistoryItem: ConversionHistory = {
          id: Date.now().toString(),
          amount: debouncedAmount,
          fromCurrency,
          toCurrency,
          result: data.conversion_result,
          rate: data.conversion_rate,
          timestamp: new Date(),
        }
        setConversionHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]) // Keep last 10
      } else {
        throw new Error("Conversion API error")
      }
    } catch (err) {
      console.error("Error converting currency:", err)
      setError("Conversion failed. Check your network or try again.")
    } finally {
      setLoading(false)
    }
  }, [debouncedAmount, fromCurrency, toCurrency])

  // Swap currencies
  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    // Optionally reset amount
    // setAmount("1")
  }

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchExchangeRates();
    const interval = setInterval(() => fetchExchangeRates(fromCurrency), 60000);
    return () => clearInterval(interval);
  }, [fromCurrency]);

  // Auto-convert on valid input change
  useEffect(() => {
    convertCurrency()
  }, [convertCurrency])

  const quickAmountSet = (value: string) => {
    setAmount(value)
  }

  const addToFavorites = (from: string, to: string) => {
    const newFavorite: FavoritePair = {
      from,
      to,
      name: `${from} to ${to}`,
    }
    setFavoritePairs((prev) => [...prev, newFavorite])
  }

  const removeFromFavorites = (from: string, to: string) => {
    setFavoritePairs((prev) => prev.filter((fav) => !(fav.from === from && fav.to === to)))
  }

  const isFavorite = (from: string, to: string) => {
    return favoritePairs.some((fav) => fav.from === from && fav.to === to)
  }

  const getTrend = (currency: string) => {
    const current = exchangeRates[currency]
    const previous = previousRates[currency]
    if (!current || !previous) return null
    return current > previous ? "up" : current < previous ? "down" : "same"
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-700 to-gray-700 shadow-xl backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-tight">CurrencyFlow</h1>
                <p className="text-blue-100 text-sm">Professional Exchange Rates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-white hover:bg-white/20 transition-all duration-200"
              >
                {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDarkMode ? "Light" : "Dark"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchExchangeRates(fromCurrency)}
                disabled={refreshing}
                className="text-white hover:bg-white/20 transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Activity className="w-3 h-3 mr-1" />
                Live Rates
              </Badge>
              {lastUpdated && (
                <div className="text-right text-xs text-blue-100">
                  <div>Updated: {lastUpdated}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-violet-900/30 px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Trusted by 10,000+ users worldwide
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6 leading-tight">
            Real-Time Currency
            <br />
            Conversion
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get live exchange rates and convert between 150+ currencies with professional-grade accuracy and
            lightning-fast performance.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-5xl mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-2 p-2 bg-card/60 backdrop-blur-sm rounded-2xl border border-border">
            {[
              { id: "converter", label: "Converter", icon: Calculator },
              { id: "rates", label: "Live Rates", icon: TrendingUp },
              { id: "history", label: "History", icon: History },
              { id: "favorites", label: "Favorites", icon: Heart },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-indigo-700 text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>



        {activeTab === "converter" && (
          <Card className="max-w-7xl mx-auto mb-12 bg-card/90 backdrop-blur-sm shadow-2xl border border-border rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 via-indigo-700/10 to-blue-500/10 p-1">
              <CardHeader className="text-center pb-6 bg-card rounded-3xl">
                <CardTitle className="text-3xl font-serif text-foreground">Currency Converter</CardTitle>
                <p className="text-muted-foreground">Convert any amount between world currencies</p>
              </CardHeader>
            </div>
            <CardContent className="space-y-8 p-8 bg-card">
              {/* Amount Input with Quick Buttons */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="any"
                  className="text-3xl h-16 text-center font-bold border-2 border-border rounded-2xl focus:border-primary focus:ring-primary/20 transition-all duration-200"
                />
                {/* Quick Amount Buttons */}
                <div className="flex justify-center space-x-2">
                  {["1", "10", "100", "1000", "10000"].map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      onClick={() => quickAmountSet(value)}
                      className="rounded-xl border-border hover:border-primary hover:bg-primary/10 transition-colors"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 items-end">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground uppercase tracking-wide">From</label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="h-14 border-2 border-border rounded-2xl text-lg font-medium hover:border-primary transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl max-h-80">
                      <div className="p-2 border-b border-border">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search currencies..."
                            value={currencySearch}
                            onChange={(e) => setCurrencySearch(e.target.value)}
                            className="pl-10 h-10 border-border rounded-xl"
                          />
                        </div>
                      </div>
                      {filteredCurrencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code} className="text-base py-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{currency.flag}</span>
                            <span className="font-semibold">{currency.code}</span>
                            <span className="text-muted-foreground">- {currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swapCurrencies}
                    className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-700 border-0 text-white hover:from-blue-600 hover:to-indigo-800 hover:scale-110 transition-all duration-200 shadow-lg"
                  >
                    <ArrowRightLeft className="w-6 h-6" />
                  </Button>
                  {/* Favorite Toggle Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      isFavorite(fromCurrency, toCurrency)
                        ? removeFromFavorites(fromCurrency, toCurrency)
                        : addToFavorites(fromCurrency, toCurrency)
                    }
                    className={`h-14 w-14 rounded-2xl border-2 transition-all duration-200 ${isFavorite(fromCurrency, toCurrency)
                      ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                      : "border-border text-muted-foreground hover:border-red-400 hover:text-red-500"
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(fromCurrency, toCurrency) ? "fill-current" : ""}`} />
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground uppercase tracking-wide">To</label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="h-14 border-2 border-border rounded-2xl text-lg font-medium hover:border-primary transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl max-h-80">
                      <div className="p-2 border-b border-border">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search currencies..."
                            value={currencySearch}
                            onChange={(e) => setCurrencySearch(e.target.value)}
                            className="pl-10 h-10 border-border rounded-xl"
                          />
                        </div>
                      </div>
                      {filteredCurrencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code} className="text-base py-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{currency.flag}</span>
                            <span className="font-semibold">{currency.code}</span>
                            <span className="text-muted-foreground">- {currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {conversionResult && !loading && (
                <div className="text-center p-8 bg-gradient-to-r from-blue-100 via-indigo-100 to-gray-300 dark:from-blue-900/20 dark:via-violet-900/20 dark:to-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent mb-3">
                    {conversionResult.conversion_result.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}{" "}
                    {conversionResult.target_code}
                  </div>
                  <div className="text-lg text-muted-foreground mb-2">
                    1 {conversionResult.base_code} = {conversionResult.conversion_rate.toFixed(6)}{" "}
                    {conversionResult.target_code}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Updated: {new Date(conversionResult.time_last_update_utc).toLocaleString()}
                  </div>
                </div>
              )}

              <Button
                onClick={convertCurrency}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-800 to-blue-700 text-white font-bold text-xl rounded-2xl hover:from-blue-700 hover:via-indigo-800 hover:to-blue-800 hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Converting...</span>
                  </div>
                ) : (
                  "Convert Currency"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "rates" && (
          <Card className="max-w-5xl mx-auto mb-12 bg-card/90 backdrop-blur-sm shadow-xl rounded-3xl border border-border">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span>Live Exchange Rates</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                >
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCurrencies.slice(1, 25).map((currency) => {
                  const rate = exchangeRates[currency.code]
                  const trend = getTrend(currency.code)
                  return (
                    <div
                      key={currency.code}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted rounded-2xl border border-border hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{currency.flag}</span>
                        <div>
                          <div className="font-bold text-foreground">USD/{currency.code}</div>
                          <div className="text-sm text-muted-foreground">{currency.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">
                            {rate ? rate.toFixed(4) : "—"}
                          </span>
                          {trend && trend !== "same" && (
                            <div
                              className={`p-1 rounded-full ${trend === "up" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                            >
                              {trend === "up" ? (
                                <ChevronUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            isFavorite("USD", currency.code)
                              ? removeFromFavorites("USD", currency.code)
                              : addToFavorites("USD", currency.code)
                          }
                          className="mt-1 h-6 px-2 text-xs"
                        >
                          <Heart
                            className={`w-3 h-3 ${isFavorite("USD", currency.code) ? "fill-current text-red-500" : "text-muted-foreground"}`}
                          />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  className="rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 bg-transparent"
                >
                  View All {allCurrencies.length - 25} More Currencies
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "history" && (
          <Card className="max-w-5xl mx-auto mb-12 bg-card/90 backdrop-blur-sm shadow-xl rounded-3xl border border-border">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <span>Conversion History</span>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  {conversionHistory.length} conversions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conversionHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg">No conversion history yet</p>
                  <p className="text-sm">Your recent conversions will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversionHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted rounded-2xl border border-border hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">
                            {item.amount} {item.fromCurrency} →{" "}
                            {item.result.toLocaleString(undefined, { maximumFractionDigits: 2 })} {item.toCurrency}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Rate: 1 {item.fromCurrency} = {item.rate.toFixed(6)} {item.toCurrency}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">{item.timestamp.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "favorites" && (
          <Card className="max-w-5xl mx-auto mb-12 bg-card/90 backdrop-blur-sm shadow-xl rounded-3xl border border-border">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span>Favorite Currency Pairs</span>
                <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                  {favoritePairs.length} favorites
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoritePairs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg">No favorite pairs yet</p>
                  <p className="text-sm">Add currency pairs to your favorites for quick access</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {favoritePairs.map((pair, index) => {
                    const rate = exchangeRates[pair.to]
                    const fromCurrency = popularCurrencies.find((c) => c.code === pair.from)
                    const toCurrency = popularCurrencies.find((c) => c.code === pair.to)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-800 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-xl">{fromCurrency?.flag}</span>
                            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xl">{toCurrency?.flag}</span>
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{pair.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {fromCurrency?.name} to {toCurrency?.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">
                            {rate ? rate.toFixed(4) : "—"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromFavorites(pair.from, pair.to)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}


        <div className="max-w-5xl mx-auto mb-12">
          <Card className="bg-card/90 backdrop-blur-sm shadow-xl rounded-3xl border border-border">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span>Popular Currency Pairs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {popularPairs.map((pair, index) => {
                  const rate = exchangeRates[pair.to]
                  const fromCurrency = allCurrencies.find((c) => c.code === pair.from)
                  const toCurrency = allCurrencies.find((c) => c.code === pair.to)
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => {
                        setFromCurrency(pair.from)
                        setToCurrency(pair.to)
                        setActiveTab("converter")
                      }}
                      className="h-auto p-4 flex flex-col items-center space-y-2 border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 rounded-2xl"
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">{fromCurrency?.flag}</span>
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                        <span className="text-lg">{toCurrency?.flag}</span>
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        {pair.from}/{pair.to}
                      </div>
                      <div className="text-xs text-muted-foreground">{rate ? rate.toFixed(4) : "—"}</div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {[
            {
              icon: Zap,
              title: "Real-Time Rates",
              desc: "Live exchange rates updated every minute from reliable financial sources with millisecond precision.",
            },
            {
              icon: Shield,
              title: "Secure & Reliable",
              desc: "Professional-grade API with bank-level security, SSL encryption, and 99.9% uptime guarantee.",
            },
            {
              icon: Globe,
              title: "150+ Currencies",
              desc: "Complete support for all major world currencies, cryptocurrencies, and emerging market rates.",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="text-center bg-card/90 backdrop-blur-sm shadow-xl rounded-3xl border border-border hover:shadow-2xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed px-4">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="font-serif font-bold text-2xl">CurrencyFlow</span>
            </div>
            <p className="text-gray-300 mb-6 text-lg">Professional currency conversion with live exchange rates</p>
            <Separator className="my-6 bg-gray-700" />
            <div className="flex flex-wrap justify-center gap-6 text-gray-300 mb-6">
              {["Terms", "Privacy", "API Docs", "Support"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="hover:text-blue-400 transition-colors font-medium text-sm md:text-base"
                >
                  {link}
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 CurrencyFlow. All rights reserved. Built with precision and care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Custom hook for debouncing input
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
