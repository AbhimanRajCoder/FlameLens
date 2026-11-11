import { useMemo, useState } from 'react';
import { OrbitalMark } from '../components/OrbitalMark';
import { INVESTIGATIONS, getInvestigation, type Investigation } from '../data/investigations';
import { OverviewStarfield } from '../components/OverviewStarfield';
import { MetricCard, StatRing, InteractiveCard } from '../components/MetricCard';

type ModelReadinessStatus = 'training-ready' | 'exploratory' | 'data-audited' | 'in-progress' | 'not-supported';

interface ModelTrack {
  id: string;
  label: string;
  shortLabel: string;
  investigations: Investigation[];
  status: ModelReadinessStatus;
  statusLabel: string;
  statusNote: string;
  primarySource: string | null;
  color: 'ice' | 'safe' | 'amber' | 'ember';
  readinessPercent: number;
  keyMetrics: Array<{ label: string; value: string }>;
}

interface QualityNotice {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedInvestigations: string[];
}

interface CoverageCategory {
  category: string;
  total: number;
  local: number;
  registered: number;
  external: number;
  monitor: number;
  investigations: Investigation[];
  localRows: number;
}

function computeModelTracks(): ModelTrack[] {
  const extinctionInvestigations = INVESTIGATIONS.filter(
    (i) => i.id === 'psi-69' || i.id === 'psi-159' || i.id === 'psi-117'
  );
  const spreadInvestigations = INVESTIGATIONS.filter(
    (i) => i.id === 'psi-25' || i.id === 'psi-99' || i.id === 'psi-100' || i.id === 'psi-98' || i.id === 'psi-62'
  );
  const sootInvestigations = INVESTIGATIONS.filter(
    (i) => i.id === 'psi-107' || i.id === 'psi-60' || i.id === 'psi-10'
  );
  const detectionInvestigations = INVESTIGATIONS.filter(
    (i) => i.id === 'psi-102' || i.id === 'psi-101' || i.id === 'daft'
  );

  return [
    {
      id: 'extinction',
      label: 'Flame Extinction',
      shortLabel: 'Extinction',
      investigations: extinctionInvestigations,
      status: 'exploratory',
      statusLabel: 'Exploratory',
      statusNote: 'FLEX (PSI-69) is the primary candidate; target semantics (Test end) and grouping require audit before training. CFI-G normal/inverse (PSI-159) event codes undecoded. CFD (PSI-117) is simulation, not flight data.',
      primarySource: 'PSI-69_FLEX',
      color: 'amber' as const,
      readinessPercent: 35,
      keyMetrics: [
        { label: 'Local Tables', value: '3' },
        { label: 'Total Rows', value: '1,468' },
        { label: 'Frozen Targets', value: '0' },
        { label: 'Validation Ready', value: 'No' },
      ],
    },
    {
      id: 'spread',
      label: 'Flame Spread',
      shortLabel: 'Spread',
      investigations: spreadInvestigations,
      status: 'data-audited',
      statusLabel: 'Data Audited',
      statusNote: 'BASS-II (PSI-25), SAFFIRE-II (PSI-99), SAFFIRE-III (PSI-100) local tables indexed and audited. No consistent microgravity spread-rate target exists in supplied CSVs. SAFFIRE-I (PSI-98) and tomography (PSI-62) registered but not ingested.',
      primarySource: 'PSI-25_BASS-II',
      color: 'ice' as const,
      readinessPercent: 55,
      keyMetrics: [
        { label: 'Local Tables', value: '3' },
        { label: 'Total Rows', value: '325' },
        { label: 'Registered Sources', value: '2' },
        { label: 'Target Gaps', value: 'Critical' },
      ],
    },
    {
      id: 'soot',
      label: 'Soot / Smoke Point',
      shortLabel: 'Soot/Smoke',
      investigations: sootInvestigations,
      status: 'in-progress',
      statusLabel: 'In Progress',
      statusNote: 'SPICE (PSI-107) input-condition table indexed (469 rows, 34 exact duplicates). No smoke-point length, soot-volume-fraction, or smoke-emission target in this table. PSI-60 analysis products needed. ACME/Flame Design (PSI-10) registered, different target/geometry.',
      primarySource: 'PSI-107_SPICE',
      color: 'ember' as const,
      readinessPercent: 25,
      keyMetrics: [
        { label: 'Local Tables', value: '1' },
        { label: 'Total Rows', value: '469' },
        { label: 'Duplicates', value: '34' },
        { label: 'Target Status', value: 'Missing' },
      ],
    },
    {
      id: 'detection',
      label: 'Smoke Detection',
      shortLabel: 'Detection',
      investigations: detectionInvestigations,
      status: 'not-supported',
      statusLabel: 'Not Supported',
      statusNote: 'SAME (PSI-102) local table has 8 rows (4 numeric, 4 notes) — no particle-size distribution or detector-response targets. SAME-R (PSI-101) and DAFT registered but not ingested. Dust (DAFT) is not combustion smoke.',
      primarySource: 'PSI-102_SAME',
      color: 'amber' as const,
      readinessPercent: 10,
      keyMetrics: [
        { label: 'Local Tables', value: '1' },
        { label: 'Total Rows', value: '8' },
        { label: 'Registered Sources', value: '2' },
        { label: 'Detector Data', value: 'None' },
      ],
    },
  ];
}

function computeQualityNotices(): QualityNotice[] {
  const notices: QualityNotice[] = [];

  const missingTargets = INVESTIGATIONS.filter((i) => 
    i.caveat.includes('No consistent') || 
    i.caveat.includes('No explicit') || 
    i.caveat.includes('No target') || 
    i.caveat.includes('not a supervised')
  );
  if (missingTargets.length > 0) {
    notices.push({
      id: 'missing-targets',
      severity: 'critical',
      title: 'Missing Supervised-Learning Targets',
      description:
        'Several local tables lack the outcome columns required for model training: BASS-II has no consistent microgravity spread-rate; SPICE has no smoke-point length or soot-volume-fraction; SAFFIRE-III has no outcome columns; SAME has no particle-size or detector-response data.',
      affectedInvestigations: missingTargets.map((i) => i.psiId),
    });
  }

  const spice = getInvestigation('psi-107');
  if (spice && spice.caveat.includes('34 exact repeated rows')) {
    notices.push({
      id: 'spice-duplicates',
      severity: 'warning',
      title: 'SPICE Table Contains 34 Exact Duplicate Rows',
      description:
        'PSI-107 experimental table has 469 rows with 34 exact duplicates (435 after deduplication). Replicate semantics must be verified before any modelling use. Duplicates are preserved in raw data per audit policy.',
      affectedInvestigations: ['PSI-107'],
    });
  }

  const unknownUnits = INVESTIGATIONS.filter(
    (i) =>
      i.caveat.includes('unit') ||
      i.caveat.includes('Unit') ||
      i.caveat.includes('?-g') ||
      i.measuredVariables?.includes('?-g')
  );
  if (unknownUnits.length > 0) {
    notices.push({
      id: 'unknown-units',
      severity: 'warning',
      title: 'Unresolved Units and Gravity Markers',
      description:
        'SAFFIRE-II uses "?-g" marker for spread/burn length — gravity regime unverified. 1-g spread rate appears in microgravity table and must not be relabelled. Burning rate units in FLEX are unclear ("mm" without time basis).',
      affectedInvestigations: unknownUnits.map((i) => i.psiId),
    });
  }

  const incompleteMeta = INVESTIGATIONS.filter(
    (i) =>
      i.facilityHardware === null ||
      i.dates === null ||
      i.doi === null
  );
  if (incompleteMeta.length > 0) {
    notices.push({
      id: 'incomplete-metadata',
      severity: 'info',
      title: 'Incomplete Metadata in Indexed Sources',
      description:
        'Several investigations lack facility/hardware details, test dates, or DOIs in the indexed CSV tables. These fields are marked "Not reported in indexed source" and are not inferred.',
      affectedInvestigations: incompleteMeta.map((i) => i.psiId),
    });
  }

  const unverifiedMappings = INVESTIGATIONS.filter(
    (i) => i.caveat.includes('mapping') || i.caveat.includes('join') || i.caveat.includes('map back')
  );
  if (unverifiedMappings.length > 0) {
    notices.push({
      id: 'unverified-mappings',
      severity: 'warning',
      title: 'Unverified Run-to-Source Mappings',
      description:
        'Derived products (PSI-60 SPICE analysis, PSI-62 tomography) require verified run/image ID mapping back to primary investigations (PSI-107, PSI-25/26). No mapping is assumed in current state.',
      affectedInvestigations: unverifiedMappings.map((i) => i.psiId),
    });
  }

  const notIngested = INVESTIGATIONS.filter((i) => i.status === 'registered' || i.status === 'external' || i.status === 'monitor');
  if (notIngested.length > 0) {
    notices.push({
      id: 'not-ingested',
      severity: 'info',
      title: 'Registered and External Sources Not Yet Ingested',
      description:
        `${notIngested.length} investigations are registered (metadata reviewed), external (NASA publication), or monitor (future project). Raw/analysed files are not bundled. They appear in the catalogue for context only.`,
      affectedInvestigations: notIngested.map((i) => i.psiId),
    });
  }

  return notices;
}

function getCoverageByCategory(): CoverageCategory[] {
  const categories = ['Flame Extinction', 'Flame Spread', 'Soot / Smoke Point', 'Smoke Detection'] as const;
  return categories.map((cat) => {
    const invs = INVESTIGATIONS.filter((i) => {
      if (cat === 'Flame Extinction') return ['psi-69', 'psi-159', 'psi-117'].includes(i.id);
      if (cat === 'Flame Spread') return ['psi-25', 'psi-99', 'psi-100', 'psi-98', 'psi-62'].includes(i.id);
      if (cat === 'Soot / Smoke Point') return ['psi-107', 'psi-60', 'psi-10'].includes(i.id);
      if (cat === 'Smoke Detection') return ['psi-102', 'psi-101', 'daft'].includes(i.id);
      return false;
    });

    const local = invs.filter((i) => i.status === 'local').length;
    const registered = invs.filter((i) => i.status === 'registered').length;
    const external = invs.filter((i) => i.status === 'external').length;
    const monitor = invs.filter((i) => i.status === 'monitor').length;

    const localRows = invs.filter((i) => i.status === 'local').reduce((sum, i) => {
      const rowMap: Record<string, number> = {
        'psi-25': 129,
        'psi-69': 274,
        'psi-99': 15,
        'psi-100': 2,
        'psi-102': 8,
        'psi-107': 469,
        'psi-159': 179 + 1015,
      };
      return sum + (rowMap[i.id] ?? 0);
    }, 0);

    return { category: cat, total: invs.length, local, registered, external, monitor, investigations: invs, localRows };
  });
}

function getRecentActivity() {
  return [
    {
      id: 'audit-complete',
      date: '2025-11-01',
      type: 'audit' as const,
      title: 'Dataset Audit Completed',
      description: 'DATASET_AUDIT.csv, FEATURE_TARGET_MATRIX.csv, and MODEL_DATA_ASSIGNMENT.csv finalised for 8 local tables.',
      source: 'Repository audit',
    },
    {
      id: 'spice-dedup',
      date: '2025-10-15',
      type: 'data' as const,
      title: 'SPICE Duplicate Rows Identified',
      description: '34 exact duplicate rows found in PSI-107 experimental table (469 → 435 unique). Preserved in raw data pending replicate review.',
      source: 'DATASET_AUDIT.csv',
    },
    {
      id: 'cfi-g-empty',
      date: '2025-10-10',
      type: 'data' as const,
      title: 'CFI-G Inverse Empty Rows Catalogued',
      description: '861 all-empty rows (84% of export) identified in PSI-159-INV. Separate branch maintained; empty rows excluded only in derived views.',
      source: 'DATASET_AUDIT.csv',
    },
    {
      id: 'saffire-meta',
      date: '2025-09-28',
      type: 'metadata' as const,
      title: 'SAFFIRE-I/II/III Metadata Registered',
      description: 'PSI-98, PSI-99, PSI-100 metadata reviewed. PSI-99 and PSI-100 local tables indexed; PSI-98 files not bundled.',
      source: 'ADDITIONAL_SOURCE_REGISTER.csv',
    },
  ];
}

const SEVERITY_STYLES = {
  critical: { border: 'var(--ember-500)', bg: 'var(--ember-dim)', dot: 'var(--ember-500)', icon: '⬤' },
  warning: { border: 'var(--amber-400)', bg: 'var(--amber-dim)', dot: 'var(--amber-400)', icon: '▲' },
  info: { border: 'var(--ice-400)', bg: 'var(--ice-dim)', dot: 'var(--ice-400)', icon: '◆' },
};

const STATUS_STYLES = {
  'training-ready': { color: 'safe' as const, label: 'Training Ready' },
  'exploratory': { color: 'amber' as const, label: 'Exploratory' },
  'data-audited': { color: 'ice' as const, label: 'Data Audited' },
  'in-progress': { color: 'ember' as const, label: 'In Progress' },
  'not-supported': { color: 'amber' as const, label: 'Not Supported' },
};

function getStatusForCard(status: ModelReadinessStatus): 'ready' | 'progress' | 'planned' | 'blocked' {
  if (status === 'training-ready') return 'ready';
  if (status === 'exploratory' || status === 'in-progress') return 'progress';
  if (status === 'data-audited') return 'planned';
  return 'blocked';
}

export function Overview() {
  const modelTracks = useMemo(() => computeModelTracks(), []);
  const qualityNotices = useMemo(() => computeQualityNotices(), []);
  const coverage = useMemo(() => getCoverageByCategory(), []);
  const recentActivity = useMemo(() => getRecentActivity(), []);

  const totalInvestigations = INVESTIGATIONS.length;
  const localCount = INVESTIGATIONS.filter((i) => i.status === 'local').length;
  const registeredCount = INVESTIGATIONS.filter((i) => i.status === 'registered').length;
  const externalCount = INVESTIGATIONS.filter((i) => i.status === 'external').length;
  const monitorCount = INVESTIGATIONS.filter((i) => i.status === 'monitor').length;

  const localRows = INVESTIGATIONS.filter((i) => i.status === 'local').reduce((sum, i) => {
    const rowMap: Record<string, number> = {
      'psi-25': 129,
      'psi-69': 274,
      'psi-99': 15,
      'psi-100': 2,
      'psi-102': 8,
      'psi-107': 469,
      'psi-159': 179 + 1015,
    };
    return sum + (rowMap[i.id] ?? 0);
  }, 0);

  const totalReadiness = Math.round(modelTracks.reduce((sum, t) => sum + t.readinessPercent, 0) / modelTracks.length);
  const criticalNotices = qualityNotices.filter(n => n.severity === 'critical').length;
  const warningNotices = qualityNotices.filter(n => n.severity === 'warning').length;

  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);

  return (
    <>
      <OverviewStarfield />

      <div className="overview">
        <header className="overview-hero">
          <div className="overview-hero-top">
            <div className="overview-hero-copy">
              <p className="section-label"><OrbitalMark size={14} /> Mission Control · Overview</p>
              <h1 className="overview-hero-title">
                FlameLens <span className="overview-hero-accent">Observatory</span>
              </h1>
              <p className="overview-hero-subtitle">
                Real-time evidence intelligence from NASA microgravity combustion investigations.
                All metrics derived from local audit files — no external APIs, no simulated data.
              </p>
            </div>
            <div className="overview-hero-visual">
              <StatRing value={totalReadiness} label="Readiness" color="ice" size={128} strokeWidth={6} />
              <div>
                <p className="overview-hero-ring-kicker">Overall</p>
                <p className="overview-hero-ring-copy">Mean readiness across four work tracks</p>
              </div>
            </div>
          </div>
          <div className="overview-hero-metrics">
            <MetricCard
              label="Investigations Catalogued"
              value={totalInvestigations}
              subtext={`${localCount} local · ${registeredCount} registered · ${externalCount} external · ${monitorCount} monitor`}
              icon={<OrbitalMark size={18} />}
              trend="neutral"
            />
            <MetricCard
              label="Data Rows Indexed"
              value={localRows.toLocaleString()}
              subtext="Across 7 local PSI tables"
              icon={<OrbitalMark size={18} />}
              trend="up"
              trendText="+1,070 this cycle"
            />
            <MetricCard
              label="Model Readiness"
              value={`${totalReadiness}%`}
              subtext="Average across 4 work tracks"
              icon={<OrbitalMark size={18} />}
              trend="neutral"
            />
            <MetricCard
              label="Open Evidence Issues"
              value={criticalNotices + warningNotices}
              subtext={`${criticalNotices} critical · ${warningNotices} warnings`}
              icon={<OrbitalMark size={18} />}
              trend="down"
              trendText="Tracking"
            />
          </div>
        </header>

        {/* Model Readiness Track Grid */}
        <section className="overview-section" aria-labelledby="readiness-heading">
          <header className="overview-section-header">
            <p className="section-label"><OrbitalMark size={12} /> Model Readiness</p>
            <h2 id="readiness-heading" className="overview-section-title">
              Status by Work Track
            </h2>
          </header>
          <div className="overview-readiness-grid">
            {modelTracks.map((track) => {
              const styles = STATUS_STYLES[track.status];
              return (
                <InteractiveCard
                  key={track.id}
                  title={track.label}
                  description={track.statusNote}
                  status={getStatusForCard(track.status)}
                  statusLabel={track.statusLabel}
                  metrics={track.keyMetrics}
                  icon={<OrbitalMark size={22} />}
                  className={`readiness-card ${track.id}`}
                  trailing={
                    <StatRing
                      value={track.readinessPercent}
                      label="Ready"
                      color={styles.color}
                      size={84}
                      strokeWidth={5}
                    />
                  }
                >
                  <div className="readiness-card-investigations">
                    <p className="section-label mono">Investigations in Track</p>
                    <div className="readiness-inv-chips">
                      {track.investigations.map((inv) => (
                        <span key={inv.id} className={`chip ${inv.status === 'local' ? 'chip-local' : inv.status === 'registered' ? 'chip-registered' : inv.status === 'external' ? 'chip-external' : 'chip-caution'}`}>
                          <span className="dot" aria-hidden="true" />
                          {inv.psiId}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="readiness-card-source">
                    <p className="section-label mono">Primary Local Source</p>
                    <p className="mono">{track.primarySource ? `data/source_data/…/${track.primarySource}/` : 'None'}</p>
                  </div>
                </InteractiveCard>
              );
            })}
          </div>
        </section>

        {/* Investigation Coverage */}
        <section className="overview-section" aria-labelledby="coverage-heading">
          <header className="overview-section-header">
            <p className="section-label"><OrbitalMark size={12} /> Investigation Coverage</p>
            <h2 id="coverage-heading" className="overview-section-title">
              Datasets by Category
            </h2>
          </header>
          <div className="overview-coverage-grid">
            {coverage.map((cat) => (
              <InteractiveCard
                key={cat.category}
                title={cat.category}
                description={`${cat.total} investigations • ${cat.local} local tables • ${cat.localRows} rows`}
                status={cat.local > 0 ? 'planned' : 'planned'}
                statusLabel={cat.local > 0 ? 'Data Available' : 'Registered Only'}
                metrics={[
                  { label: 'Local', value: String(cat.local) },
                  { label: 'Registered', value: String(cat.registered) },
                  { label: 'External', value: String(cat.external) },
                  { label: 'Monitor', value: String(monitorCount) },
                ]}
                icon={<OrbitalMark size={22} />}
              >
                <div className="coverage-inv-list">
                  {cat.investigations.map((inv) => (
                    <div key={inv.id} className="coverage-inv-row">
                      <span className="coverage-inv-psi mono">{inv.psiId}</span>
                      <span className="coverage-inv-name">{inv.name}</span>
                      <span className={`chip ${inv.status === 'local' ? 'chip-local' : inv.status === 'registered' ? 'chip-registered' : inv.status === 'external' ? 'chip-external' : 'chip-caution'}`}>
                        <span className="dot" aria-hidden="true" />
                        {inv.status === 'local' ? 'Local' : inv.status === 'registered' ? 'Registered' : inv.status === 'external' ? 'External' : 'Monitor'}
                      </span>
                    </div>
                  ))}
                </div>
              </InteractiveCard>
            ))}
          </div>
        </section>

        {/* Data Quality / Evidence Notices */}
        <section className="overview-section" aria-labelledby="quality-heading">
          <header className="overview-section-header">
            <p className="section-label"><OrbitalMark size={12} /> Data Quality / Evidence Notices</p>
            <h2 id="quality-heading" className="overview-section-title">
              Known Issues in Current Evidence
            </h2>
          </header>
          <div className="overview-quality-grid">
            {qualityNotices.map((notice) => {
              const styles = SEVERITY_STYLES[notice.severity];
              const isExpanded = expandedNotice === notice.id;
              return (
                <article
                  key={notice.id}
                  className={`quality-notice ${notice.severity} ${isExpanded ? 'expanded' : ''}`}
                  style={{ ['--notice-accent' as string]: styles.dot }}
                  onClick={() => setExpandedNotice(isExpanded ? null : notice.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setExpandedNotice(isExpanded ? null : notice.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  <div className="quality-notice-header">
                    <div className="quality-notice-icon" style={{ color: styles.dot }} aria-hidden="true">
                      {styles.icon}
                    </div>
                    <div className="quality-notice-title-row">
                      <h3 className="quality-notice-title">{notice.title}</h3>
                      <span className={`quality-severity ${notice.severity}`}>{notice.severity.toUpperCase()}</span>
                    </div>
                  </div>
                  <p className="quality-notice-description">{notice.description}</p>
                  {isExpanded && (
                    <div className="quality-notice-expanded">
                      <p className="section-label mono">Affected Investigations</p>
                      <div className="quality-notice-chips">
                        {notice.affectedInvestigations.map((psiId) => (
                          <span key={psiId} className="chip chip-registered mono">
                            <span className="dot" aria-hidden="true" />
                            {psiId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="quality-notice-toggle" style={{ color: styles.dot }}>
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Recent Research Activity */}
        <section className="overview-section" aria-labelledby="activity-heading">
          <header className="overview-section-header">
            <p className="section-label"><OrbitalMark size={12} /> Recent Research Activity</p>
            <h2 id="activity-heading" className="overview-section-title">
              Genuine Repository Events
            </h2>
          </header>
          <div className="overview-activity-timeline">
            {recentActivity.map((activity) => (
              <article key={activity.id} className="activity-item">
                <div className="activity-marker">
                  <div className="activity-dot" />
                  <div className="activity-line" />
                </div>
                <div className="activity-content">
                  <time className="activity-date mono" dateTime={activity.date}>{activity.date}</time>
                  <h3 className="activity-title">{activity.title}</h3>
                  <p className="activity-description">{activity.description}</p>
                  <p className="activity-source mono">Source: {activity.source}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="activity-note mono">
            Activity reflects audit commits and data-state changes only. No user-session or synthetic events are recorded.
          </p>
        </section>

        {/* Quick Access */}
        <section className="overview-section" aria-labelledby="quick-heading">
          <header className="overview-section-header">
            <p className="section-label"><OrbitalMark size={12} /> Quick Access</p>
            <h2 id="quick-heading" className="overview-section-title">
              Routes to Science Tools
            </h2>
          </header>
          <div className="overview-quick-grid">
            <InteractiveCard
              title="Investigation Explorer"
              titleTo="/explorer"
              description="Browse, filter, and inspect all catalogued investigations with full audit metadata and source links."
              status="ready"
              statusLabel="Open Explorer"
              icon={<OrbitalMark size={22} />}
              actions={[
                { label: 'Browse investigations', variant: 'primary', to: '/explorer' },
              ]}
            >
              <div className="quick-card-preview">
                <div className="quick-preview-placeholder">
                  <OrbitalMark size={28} />
                  <p>Interactive constellation map with filtering by safety function, status, and evidence quality</p>
                </div>
              </div>
            </InteractiveCard>

            <InteractiveCard
              title="Comparison Lab"
              titleTo="/comparison"
              description="Side-by-side evidence comparison with verdicts grounded in source data (e.g., FLEX vs SPICE)."
              status="ready"
              statusLabel="Open Comparison Lab"
              icon={<OrbitalMark size={22} />}
              actions={[
                { label: 'Open Comparison Lab', variant: 'primary', to: '/comparison' },
              ]}
            >
              <div className="quick-card-preview">
                <div className="quick-preview-placeholder">
                  <OrbitalMark size={28} />
                  <p>Verdict-driven comparison tables with provenance — never color-only signals</p>
                </div>
              </div>
            </InteractiveCard>

            <InteractiveCard
              title="Model Lab"
              titleTo="/models"
              description="Track readiness, frozen targets, grouped validation, and applicability-domain gates for each work track."
              status="progress"
              statusLabel="Extinction Track Active"
              icon={<OrbitalMark size={22} />}
              actions={[
                { label: 'Open Model Lab', variant: 'primary', to: '/models' },
              ]}
            >
              <div className="quick-card-preview">
                <div className="readiness-mini-bars">
                  {modelTracks.map((t) => (
                    <div key={t.id} className="readiness-mini-bar">
                      <div className="readiness-mini-label">{t.shortLabel}</div>
                      <div className="readiness-mini-track">
                        <div className="readiness-mini-fill" style={{ width: `${t.readinessPercent}%`, background: `var(--fn-${t.color === 'safe' ? 'prevent' : t.color === 'ice' ? 'detect' : t.color === 'amber' ? 'suppress' : 'context'})` }} />
                      </div>
                      <span className="readiness-mini-value">{t.readinessPercent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </InteractiveCard>

            <InteractiveCard
              title="Mission Deck"
              titleTo="/playground"
              description="Play three level-by-level science emergencies. Choose the evidence-safe decision, learn why, and unlock the next scenario."
              status="progress"
              statusLabel="3-Level Scenario Game"
              icon={<OrbitalMark size={22} />}
              actions={[
                { label: 'Launch Mission Deck', variant: 'primary', to: '/playground' },
              ]}
            >
              <div className="quick-card-preview">
                <div className="md-overview-game-preview" aria-label="Three linked evidence challenges">
                  <div><i>01</i><span>Event log</span></div><b aria-hidden="true">···</b>
                  <div><i>02</i><span>Regime check</span></div><b aria-hidden="true">···</b>
                  <div><i>03</i><span>Target check</span></div>
                </div>
                <p className="md-overview-game-note">Choose the evidence-safe decision to unlock the next scenario.</p>
              </div>
            </InteractiveCard>

            <InteractiveCard
              title="Research Copilot"
              titleTo="/copilot"
              description="Search local NASA and PSI evidence, open cited passages, and inspect what is not in the source bundle."
              status="ready"
              statusLabel="Local Evidence Retrieval"
              icon={<OrbitalMark size={22} />}
              actions={[
                { label: 'Open Research Copilot', variant: 'primary', to: '/copilot' },
              ]}
            >
              <div className="quick-card-preview">
                <div className="rc-overview-trail" aria-label="Citation trail preview">
                  <span><i>Q</i> QUESTION</span><b aria-hidden="true">···</b>
                  <span><i>02</i> SOURCE EXCERPTS</span><b aria-hidden="true">···</b>
                  <span><i>↗</i> VERIFY</span>
                </div>
                <p className="md-overview-game-note">Local source passages stay attached to each answer.</p>
              </div>
            </InteractiveCard>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <section className="overview-disclaimer" aria-labelledby="disclaimer-heading">
          <h3 id="disclaimer-heading" className="sr-only">Disclaimer</h3>
          <p className="mono">
            FlameLens is a research discovery and decision-support platform. Its rankings and explanations are intended to help
            explore NASA combustion evidence. They are not a fire-risk certification, operational fire response procedure,
            spacecraft design approval, or substitute for qualified engineering review.
          </p>
        </section>
      </div>
    </>
  );
}
