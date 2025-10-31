import { useMemo, useState } from 'react';
import { calculateSalary } from './utils/salaryCalculator';
import type { BonusEntry, SalaryBreakdown, SalaryInput } from './types/salary';
import { useConfig } from './hooks/useConfig';
import { formatCurrency } from './utils/format';
import {
  getTranslation,
  supportedLanguages,
  type SupportedLanguage,
  type Translations
} from './i18n';

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const emptyBonus = (): BonusEntry => ({
  id: createId(),
  month: 6,
  type: 'amount',
  value: 0,
  description: ''
});

const defaultInput: SalaryInput = {
  baseMonthlyGross: 4500,
  taxClass: 'I',
  churchTax: false,
  solidarityTax: true,
  includeVoluntaryInsurance: false,
  months: 12,
  bonuses: [],
  homeOfficeDaysPerYear: 50,
  commuteDaysPerMonth: 10,
  commuteDistanceKm: 15,
  hasChildren: false
};

function BonusList({
  bonuses,
  onChange,
  onRemove,
  t
}: {
  bonuses: BonusEntry[];
  onChange: (bonus: BonusEntry) => void;
  onRemove: (id: string) => void;
  t: Translations;
}) {
  if (bonuses.length === 0) {
    return <p>{t.bonusEmpty}</p>;
  }

  return (
    <div className="bonus-list">
      {bonuses.map((bonus) => (
        <div className="bonus-item" key={bonus.id}>
          <label className="field-group">
            <span>{t.bonusMonth}</span>
            <select
              value={bonus.month}
              onChange={(event) =>
                onChange({ ...bonus, month: Number.parseInt(event.target.value, 10) })
              }
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <label className="field-group">
            <span>{t.bonusType}</span>
            <select
              value={bonus.type}
              onChange={(event) =>
                onChange({ ...bonus, type: event.target.value as BonusEntry['type'] })
              }
            >
              <option value="amount">{t.bonusTypeAmount}</option>
              <option value="percent">{t.bonusTypePercent}</option>
            </select>
          </label>
          <label className="field-group">
            <span>{bonus.type === 'amount' ? t.bonusValueAmount : t.bonusValuePercent}</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={bonus.value}
              onChange={(event) => onChange({ ...bonus, value: Number(event.target.value) })}
            />
          </label>
          <label className="field-group">
            <span>{t.bonusDescriptionLabel}</span>
            <input
              type="text"
              value={bonus.description ?? ''}
              onChange={(event) => onChange({ ...bonus, description: event.target.value })}
            />
          </label>
          <button type="button" className="button danger" onClick={() => onRemove(bonus.id)}>
            {t.bonusRemove}
          </button>
        </div>
      ))}
    </div>
  );
}

function ResultView({
  input,
  currency,
  t
}: {
  input: SalaryBreakdown;
  currency: string;
  t: Translations;
}) {
  const social = input.socialContributions;

  return (
    <div className="result-card">
      <h2>{t.resultsHeading}</h2>
      <div className="results-grid">
        <div className="result-tile">
          <h3>{t.netPerMonth}</h3>
          <p>{formatCurrency(input.monthlyNet, currency)}</p>
        </div>
        <div className="result-tile">
          <h3>{t.netPerYear}</h3>
          <p>{formatCurrency(input.annualNet, currency)}</p>
        </div>
        <div className="result-tile">
          <h3>{t.totalDeductions}</h3>
          <p>{formatCurrency(input.totalDeductions, currency)}</p>
        </div>
      </div>

      <h3 style={{ marginTop: '2rem' }}>{t.breakdownHeading}</h3>
      <table className="breakdown-table">
        <tbody>
          <tr>
            <th>{t.annualGross}</th>
            <td>{formatCurrency(input.annualGross, currency)}</td>
          </tr>
          <tr>
            <th>{t.annualBonuses}</th>
            <td>{formatCurrency(input.annualBonuses, currency)}</td>
          </tr>
          <tr>
            <th>{t.taxableIncome}</th>
            <td>{formatCurrency(input.taxableIncome, currency)}</td>
          </tr>
          <tr>
            <th>{t.incomeTax}</th>
            <td>{formatCurrency(input.incomeTax, currency)}</td>
          </tr>
          <tr>
            <th>{t.solidarityTax}</th>
            <td>{formatCurrency(input.solidarityTax, currency)}</td>
          </tr>
          <tr>
            <th>{t.churchTax}</th>
            <td>{formatCurrency(input.churchTax, currency)}</td>
          </tr>
          <tr>
            <th>{t.healthInsurance}</th>
            <td>{formatCurrency(social.health, currency)}</td>
          </tr>
          <tr>
            <th>{t.pensionInsurance}</th>
            <td>{formatCurrency(social.pension, currency)}</td>
          </tr>
          <tr>
            <th>{t.unemploymentInsurance}</th>
            <td>{formatCurrency(social.unemployment, currency)}</td>
          </tr>
          <tr>
            <th>{t.longTermCareInsurance}</th>
            <td>{formatCurrency(social.longTermCare, currency)}</td>
          </tr>
          <tr>
            <th>{t.voluntaryInsurance}</th>
            <td>{formatCurrency(social.voluntary, currency)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ConfigError({
  message,
  onRetry,
  t
}: {
  message: string;
  onRetry: () => void;
  t: Translations;
}) {
  return (
    <div className="result-card">
      <h2>{t.configErrorHeading}</h2>
      <p>{message}</p>
      <button type="button" className="button" onClick={onRetry}>
        {t.retry}
      </button>
    </div>
  );
}

function App() {
  const { config, loading, error, refresh } = useConfig();
  const [salaryInput, setSalaryInput] = useState<SalaryInput>(defaultInput);
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const [bonuses, setBonuses] = useState<BonusEntry[]>([]);

  const effectiveInput = useMemo<SalaryInput>(
    () => ({
      ...salaryInput,
      bonuses
    }),
    [salaryInput, bonuses]
  );

  const result = useMemo(() => {
    if (!config) {
      return null;
    }
    const selectedTaxClass = config.taxClasses[effectiveInput.taxClass as string];
    if (!selectedTaxClass) {
      return null;
    }
    return calculateSalary(effectiveInput, config);
  }, [config, effectiveInput]);

  const onBonusChange = (updated: BonusEntry) => {
    setBonuses((current) => current.map((bonus) => (bonus.id === updated.id ? updated : bonus)));
  };

  const onBonusRemove = (id: string) => {
    setBonuses((current) => current.filter((bonus) => bonus.id !== id));
  };

  const onBonusAdd = () => {
    setBonuses((current) => [...current, emptyBonus()]);
  };

  const translation = useMemo(() => getTranslation(language), [language]);

  return (
    <div className="app-container">
      <header>
        <div className="header-row">
          <div>
            <h1>{translation.appTitle}</h1>
            <p>{translation.appSubtitle}</p>
          </div>
          <label className="language-select">
            <span>{translation.languageLabel}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {getTranslation(lang).languageName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main>
        <section className="form-card">
          <h2>{translation.inputsHeading}</h2>
          <div className="form-grid">
            <label className="field-group">
              <span>{translation.baseGrossLabel}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={salaryInput.baseMonthlyGross}
                onChange={(event) =>
                  setSalaryInput((prev) => ({
                    ...prev,
                    baseMonthlyGross: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label className="field-group">
              <span>{translation.monthsPaidLabel}</span>
              <input
                type="number"
                min="1"
                max="12"
                value={salaryInput.months}
                onChange={(event) =>
                  setSalaryInput((prev) => ({
                    ...prev,
                    months: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label className="field-group">
              <span>{translation.taxClassLabel}</span>
              <select
                value={salaryInput.taxClass}
                onChange={(event) =>
                  setSalaryInput((prev) => ({
                    ...prev,
                    taxClass: event.target.value as SalaryInput['taxClass']
                  }))
                }
              >
                {config &&
                  Object.entries(config.taxClasses).map(([key, value]) => (
                    <option key={key} value={key}>
                      {key} – {value.label}
                    </option>
                  ))}
              </select>
            </label>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="church-tax"
                checked={salaryInput.churchTax}
                onChange={(event) =>
                  setSalaryInput((prev) => ({ ...prev, churchTax: event.target.checked }))
                }
              />
              <label htmlFor="church-tax">{translation.churchTaxLabel}</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="solidarity-tax"
                checked={salaryInput.solidarityTax}
                onChange={(event) =>
                  setSalaryInput((prev) => ({ ...prev, solidarityTax: event.target.checked }))
                }
              />
              <label htmlFor="solidarity-tax">{translation.solidarityTaxLabel}</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="voluntary-insurance"
                checked={salaryInput.includeVoluntaryInsurance}
                onChange={(event) =>
                  setSalaryInput((prev) => ({
                    ...prev,
                    includeVoluntaryInsurance: event.target.checked
                  }))
                }
              />
              <label htmlFor="voluntary-insurance">{translation.voluntaryInsuranceLabel}</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="has-children"
                checked={salaryInput.hasChildren}
                onChange={(event) =>
                  setSalaryInput((prev) => ({
                    ...prev,
                    hasChildren: event.target.checked
                  }))
                }
              />
              <label htmlFor="has-children">{translation.hasChildrenLabel}</label>
            </div>

            <label className="field-group">
              <span>{translation.homeOfficeDaysLabel}</span>
              <input
                type="number"
                min="0"
                value={salaryInput.homeOfficeDaysPerYear}
                onChange={(event) =>
                  setSalaryInput((prev) => ({
                    ...prev,
                    homeOfficeDaysPerYear: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label className="field-group">
              <span>{translation.commuteDistanceLabel}</span>
              <input
                type="number"
                min="0"
                value={salaryInput.commuteDistanceKm}
                onChange={(event) =>
                  setSalaryInput((prev) => ({
                    ...prev,
                    commuteDistanceKm: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label className="field-group">
              <span>{translation.commuteDaysLabel}</span>
              <input
                type="number"
                min="0"
                max="31"
                value={salaryInput.commuteDaysPerMonth}
                onChange={(event) =>
                  setSalaryInput((prev) => ({
                    ...prev,
                    commuteDaysPerMonth: Number(event.target.value)
                  }))
                }
              />
            </label>
          </div>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{translation.bonusesHeading}</h3>
              <button type="button" className="button" onClick={onBonusAdd}>
                {translation.addBonus}
              </button>
            </div>
            <p style={{ marginTop: 0 }}>{translation.bonusDescription}</p>
            <BonusList
              bonuses={bonuses}
              onChange={onBonusChange}
              onRemove={onBonusRemove}
              t={translation}
            />
          </section>
        </section>

        {loading && <div className="result-card">{translation.loadingConfig}</div>}

        {!loading && error && <ConfigError message={error} onRetry={refresh} t={translation} />}

        {!loading && !error && config && result && (
          <ResultView input={result} currency={config.meta.currency} t={translation} />
        )}

        {!loading && !error && config && !result && (
          <div className="result-card">
            <p>{translation.invalidTaxClass}</p>
          </div>
        )}
      </main>
      <footer style={{ textAlign: 'center', marginTop: '2rem', color: '#475569' }}>
        {translation.footerNote.beforeLink}
        <code>{translation.footerNote.linkLabel}</code>
        {translation.footerNote.afterLink}
      </footer>
    </div>
  );
}

export default App;
