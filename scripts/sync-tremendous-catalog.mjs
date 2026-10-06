#!/usr/bin/env node
/**
 * Builds src/content/tremendousCatalog.json from Tremendous' public catalog.
 *
 * Tremendous does not send CORS headers for the catalog and its product API needs a secret key,
 * so the browser cannot read either directly. This script runs before every build instead
 * (`npm run catalog:sync`, also wired to `prebuild`).
 *
 * Nothing about the selection is hand-picked:
 *   - popularity, product names, images, and categories come from tremendous.com/catalog
 *     (the data behind its "Most popular" sort);
 *   - per-country availability, currencies, and approval restrictions come from the catalog file.
 * Regional editions of one brand ("Uber", "Uber UK", "Uber Japan") become a single option whose
 * variants are resolved per recipient country, so a brand never appears twice.
 *
 * If either download fails, the previously generated file is kept so offline builds still work.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const CATALOG_PAGE_URL = 'https://www.tremendous.com/catalog/'
const CATALOG_FILE_URL = 'https://api.tremendous.com/catalog-file.csv'
const OUTPUT = fileURLToPath(new URL('../src/content/tremendousCatalog.json', import.meta.url))

/** How many of the most popular eligible brands to offer. */
const MAX_OPTIONS = 20
/**
 * A brand counts as international when Tremendous delivers it in at least two currencies, or to at
 * least this many countries (single-currency rewards such as Virtual Visa). This keeps out brands
 * that only reach one market and its territories (US, Puerto Rico, Guam, ...).
 */
const MIN_COUNTRIES = 10
/** Products that can only be redeemed in these countries are never offered (panel policy). */
const EXCLUDED_LOCAL_MARKETS = new Set(['IN'])

/** Tremendous categories the panel can pay out, and the Intensity API method each is filed under. */
const CATEGORIES = {
  visa: { category: 'digital', paymentMethod: 'Gift Card' },
  merchant_cards: { category: 'gift-card', paymentMethod: 'Gift Card' },
  paypal: { category: 'cash', paymentMethod: 'Paypal' },
  bank: { category: 'cash', paymentMethod: 'Cash' },
  international_bank: { category: 'cash', paymentMethod: 'Cash' },
}

/** Public /settings flags that can switch a brand off. */
const SETTING_FLAGS = { amazon: 'amazon_enabled', flipkart: 'flipkart_enabled' }

/** Tremendous country names that Intl.DisplayNames does not resolve on its own. */
const COUNTRY_ALIASES = {
  usa: 'US',
  uae: 'AE',
  'bosnia and herzegowina': 'BA',
  bonaire: 'BQ',
  'brunei darussalam': 'BN',
  'cape verde': 'CV',
  'cocos keeling islands': 'CC',
  congo: 'CG',
  'congo democratic peoples republic': 'CD',
  'cote divoire': 'CI',
  'croatia local name hrvatska': 'HR',
  curacao: 'CW',
  'czech republic': 'CZ',
  'hong kong': 'HK',
  'saint kitts and nevis': 'KN',
  'saint lucia': 'LC',
  'saint vincent and the grenadines': 'VC',
  'south georgia and the south sandwich islands': 'GS',
  'falkland islands malvinas': 'FK',
  'georgia sakartvelo': 'GE',
  'heard and mc donald islands': 'HM',
  'jersey island': 'JE',
  'lao peoples democratic republic': 'LA',
  macau: 'MO',
  'macedonia the former yugoslav republic of': 'MK',
  'micronesia federated states of': 'FM',
  'moldova republic of': 'MD',
  'palestinian territories': 'PS',
  pitcairn: 'PN',
  reunion: 'RE',
  'saint barthelemy': 'BL',
  'saint martin': 'MF',
  'south korea': 'KR',
  'st helena': 'SH',
  'st pierre and miquelon': 'PM',
  'svalbard and jan mayen islands': 'SJ',
  'tanzania united republic of': 'TZ',
  turkey: 'TR',
  'us minor outlying islands': 'UM',
  'vatican city state holy see': 'VA',
  'virgin islands british': 'VG',
  'virgin islands us': 'VI',
  'wallis and futuna islands': 'WF',
}

/** Words that mark a regional edition of a brand rather than a different product. */
const REGION_WORDS = ['uk', 'usa', 'uae', 'international', 'intl', 'global', 'worldwide']

function normalize(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildCountryLookup() {
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
  const lookup = new Map(Object.entries(COUNTRY_ALIASES))
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (const first of letters) {
    for (const second of letters) {
      const code = first + second
      // Skip deprecated aliases such as DD (→ DE) so they never shadow the current code.
      if (new Intl.Locale(`und-${code}`).region !== code) continue
      const name = regionNames.of(code)
      if (name && name !== code && !lookup.has(normalize(name))) lookup.set(normalize(name), code)
    }
  }
  return lookup
}

const countryLookup = buildCountryLookup()
const countryCodes = new Set(countryLookup.values())
const currencyCodes = new Set(Intl.supportedValuesOf('currency'))
const regionPhrases = new Set([...countryLookup.keys(), ...REGION_WORDS])

/** "Uber UK " → "Uber", "Bank Transfer (EUR)" → "Bank Transfer", "Amazon.co.uk" stays as is. */
function brandName(productName) {
  const words = productName
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+[-–—]\s+.*$/, '')
    .replace(/[®™]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
  while (words.length > 1) {
    const last = words[words.length - 1]
    if (/^[A-Z]{2,3}$/.test(last) && (countryCodes.has(last) || currencyCodes.has(last) || last === 'UK' || last === 'USA')) {
      words.pop()
      continue
    }
    let stripped = false
    for (let size = Math.min(4, words.length - 1); size >= 1; size -= 1) {
      if (regionPhrases.has(normalize(words.slice(-size).join(' ')))) {
        words.splice(-size)
        stripped = true
        break
      }
    }
    if (!stripped) break
  }
  return words.join(' ')
}

/** Storefront domains of one brand (Amazon.com, Amazon.co.uk, Amazon.jp) share a family. */
const DOMAIN_SUFFIX = /\.[a-z]{2,3}(?:\.[a-z]{2})?$/i

function familyKey(name) {
  return normalize(name.replace(DOMAIN_SUFFIX, '')).replace(/ /g, '-')
}

/** Minimal RFC 4180 parser — the catalog quotes fields that contain commas. */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += char
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [header, ...body] = rows
  return body.filter((cells) => cells.length === header.length).map((cells) => Object.fromEntries(header.map((key, i) => [key, cells[i]])))
}

/** Product records embedded in the catalog page's React Server Components payload. */
function parseCatalogPage(html) {
  const chunks = []
  for (const match of html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) {
    try {
      chunks.push(JSON.parse(match[1]))
    } catch {
      // Ignore chunks that are not plain strings.
    }
  }
  const payload = chunks.join('')
  const products = new Map()
  for (const match of payload.matchAll(/\{"category":"[a-z_]+","countries":\[[^\]]*\][^{}]*?"popularity_score":[\d.]+[^{}]*\}/g)) {
    try {
      const product = JSON.parse(match[0])
      if (product.id && product.name) products.set(product.id, product)
    } catch {
      // Skip records that are cut by a chunk boundary.
    }
  }
  return products
}

/** Unrestricted country → currency offers per product ID. */
function availabilityByProduct(rows) {
  const unmapped = new Set()
  const offers = new Map()
  for (const row of rows) {
    if (row.Restrictions?.trim()) continue
    const country = countryLookup.get(normalize(row.Country))
    if (!country) {
      unmapped.add(row.Country)
      continue
    }
    const product = offers.get(row.ID) ?? new Map()
    if (!product.has(country)) product.set(country, row.Currency)
    offers.set(row.ID, product)
  }
  if (unmapped.size) console.warn(`[tremendous] Unmapped country names skipped: ${[...unmapped].join(', ')}`)
  return offers
}

function buildCatalog(pageProducts, offersById) {
  const families = new Map()
  for (const product of pageProducts.values()) {
    const config = CATEGORIES[product.category]
    const offers = offersById.get(product.id)
    if (!config || !offers?.size) continue
    const countries = [...offers.keys()]
    if (countries.every((country) => EXCLUDED_LOCAL_MARKETS.has(country))) continue

    const name = brandName(product.name.trim())
    const key = familyKey(name)
    const family = families.get(key) ?? { key, config, popularity: 0, countries: new Set(), currencies: new Set(), variants: [] }
    family.popularity = Math.max(family.popularity, product.popularity_score)
    countries.forEach((country) => family.countries.add(country))
    offers.forEach((currency) => family.currencies.add(currency))
    const byCurrency = new Map()
    for (const [country, currency] of offers) byCurrency.set(currency, [...(byCurrency.get(currency) ?? []), country])
    family.variants.push({
      productId: product.id,
      productName: product.name.trim(),
      name,
      image: product.card_image_path,
      popularity: product.popularity_score,
      offers: [...byCurrency].map(([currency, list]) => ({ currency, countries: list.sort() })),
    })
    families.set(key, family)
  }

  return [...families.values()]
    .filter((family) => family.currencies.size >= 2 || family.countries.size >= MIN_COUNTRIES)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, MAX_OPTIONS)
    .map((family) => {
      const variants = family.variants.sort((a, b) => b.popularity - a.popularity)
      const storefronts = new Set(variants.map((variant) => variant.name.toLowerCase()))
      const name = storefronts.size > 1 ? variants[0].name.replace(DOMAIN_SUFFIX, '') : variants[0].name
      // Storefronts (Amazon.co.uk) keep their own name; other regional editions show the brand.
      const variantName = (variant) => (DOMAIN_SUFFIX.test(variant.name) ? variant.name : name)
      return {
        key: family.key,
        name,
        category: family.config.category,
        paymentMethod: family.config.paymentMethod,
        ...(SETTING_FLAGS[family.key] ? { setting: SETTING_FLAGS[family.key] } : {}),
        popularity: family.popularity,
        variants: variants.map(({ popularity: _score, ...variant }) => ({ ...variant, name: variantName(variant) })),
      }
    })
}

async function download(url, label) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (intensity-research catalog sync)' },
    signal: AbortSignal.timeout(60_000),
  })
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status}`)
  return response.text()
}

function keepPrevious(reason) {
  if (existsSync(OUTPUT)) {
    const previous = JSON.parse(readFileSync(OUTPUT, 'utf8'))
    console.warn(`[tremendous] ${reason}; keeping catalog synced at ${previous.syncedAt}.`)
    process.exit(0)
  }
  console.error(`[tremendous] ${reason} and no previous catalog exists.`)
  process.exit(1)
}

async function main() {
  let page
  let file
  try {
    ;[page, file] = await Promise.all([download(CATALOG_PAGE_URL, 'catalog page'), download(CATALOG_FILE_URL, 'catalog file')])
  } catch (error) {
    keepPrevious(`Catalog download failed (${error instanceof Error ? error.message : String(error)})`)
  }

  const pageProducts = parseCatalogPage(page)
  if (pageProducts.size < 100) keepPrevious(`Only ${pageProducts.size} products found on the catalog page`)

  const options = buildCatalog(pageProducts, availabilityByProduct(parseCsv(file)))
  if (!options.length) keepPrevious('No eligible products found in the catalog')

  const catalog = {
    source: { popularity: CATALOG_PAGE_URL, availability: CATALOG_FILE_URL },
    syncedAt: new Date().toISOString(),
    selection: {
      maxOptions: MAX_OPTIONS,
      international: `2+ currencies or ${MIN_COUNTRIES}+ countries`,
      excludedLocalMarkets: [...EXCLUDED_LOCAL_MARKETS],
    },
    options,
  }
  writeFileSync(OUTPUT, `${JSON.stringify(catalog, null, 2)}\n`)
  const countries = new Set(options.flatMap((option) => option.variants.flatMap((variant) => variant.offers.flatMap((offer) => offer.countries))))
  console.log(`[tremendous] ${options.length} of ${pageProducts.size} products' brands selected, deliverable to ${countries.size} countries → ${OUTPUT}`)
  for (const option of options) console.log(`  ${option.popularity.toFixed(2)}  ${option.name} (${option.variants.length} variant${option.variants.length === 1 ? '' : 's'})`)
}

await main()
