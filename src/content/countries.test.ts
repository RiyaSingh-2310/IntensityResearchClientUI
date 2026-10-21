import assert from 'node:assert/strict'
import { countryCodeForName } from './countries'

assert.equal(countryCodeForName('India'), 'IN')
assert.equal(countryCodeForName('Germany'), 'DE')
assert.equal(countryCodeForName('United States'), 'US')
assert.equal(countryCodeForName('Côte d’Ivoire'), 'CI')
assert.equal(countryCodeForName('Democratic Republic of the Congo'), 'CD')
assert.equal(countryCodeForName('Republic of the Congo'), 'CG')
assert.equal(countryCodeForName('State of Palestine'), 'PS')
assert.equal(countryCodeForName('Holy See/Vatican City'), 'VA')
assert.equal(countryCodeForName(''), undefined)

console.log('country code tests passed')
