// CASCADE Living OS - AURA Protocol Engine
// Constitutional AI Framework with Tri-Axial Metrics
// Based on AURA Protocol v2.0 by Mackenzie Conor James Clark

// ============================================================================
// TYPES
// ============================================================================

export interface AURAMetrics {
  TES: number  // Trust Entropy Score (>0.70)
  VTR: number  // Value-Transfer Ratio (>1.5)
  PAI: number  // Purpose Alignment Index (>0.80)
  valid: boolean
  warnings: AURAWarning[]
  timestamp: number
}

export interface AURAWarning {
  metric: 'TES' | 'VTR' | 'PAI'
  message: string
  suggestion: string
  severity: 'low' | 'medium' | 'high'
}

export interface VectorInversion {
  originalIntent: string
  failedMetric: 'TES' | 'VTR' | 'PAI'
  failureReason: string
  invertedSolution: string
  newMetrics: AURAMetrics
}

export interface AURAThresholds {
  TES: number
  VTR: number
  PAI: number
}

export type AURAPreset = 'conservative' | 'moderate' | 'permissive' | 'creative' | 'medical'

// ============================================================================
// THRESHOLDS
// ============================================================================

export const AURA_PRESETS: Record<AURAPreset, AURAThresholds> = {
  conservative: { TES: 0.85, VTR: 2.0, PAI: 0.90 },
  moderate: { TES: 0.70, VTR: 1.5, PAI: 0.80 },
  permissive: { TES: 0.60, VTR: 1.2, PAI: 0.70 },
  creative: { TES: 0.65, VTR: 1.8, PAI: 0.75 },
  medical: { TES: 0.85, VTR: 2.0, PAI: 0.90 }
}

// ============================================================================
// TES - TRUST ENTROPY SCORE (Protector Axiom)
// ============================================================================

/**
 * Measures unnecessary friction introduced
 * Principle: Unconditional sacrifice of complexity for clarity
 * Formula: TES = Necessary Friction / Total Friction
 */
export function calculateTES(params: {
  totalElements: number
  essentialElements: number
  clarityScore: number  // 0-1 how clear is the communication
  anxietyInduced: number  // 0-1 how much anxiety created
}): number {
  const { totalElements, essentialElements, clarityScore, anxietyInduced } = params
  
  if (totalElements === 0) return 1.0
  
  const necessaryRatio = essentialElements / totalElements
  const frictionPenalty = anxietyInduced * 0.3
  const clarityBonus = clarityScore * 0.2
  
  const TES = Math.max(0, Math.min(1, necessaryRatio - frictionPenalty + clarityBonus))
  
  return Math.round(TES * 100) / 100
}

// ============================================================================
// VTR - VALUE TRANSFER RATIO (Healer Axiom)
// ============================================================================

/**
 * Measures value created vs value extracted
 * Principle: Alchemical transmutation of exchange into mutual elevation
 * Formula: VTR = Value Offered / Value Captured
 */
export function calculateVTR(params: {
  valueOffered: number  // Teaching, empowerment, growth
  valueCaptured: number  // Dependency created, work done for them
  skillsTransferred: number  // 0-10 how much they learned
  autonomyPreserved: number  // 0-1 did they become more independent
}): number {
  const { valueOffered, valueCaptured, skillsTransferred, autonomyPreserved } = params
  
  if (valueCaptured === 0) return 10.0  // Maximum if nothing captured
  
  const baseRatio = valueOffered / valueCaptured
  const skillBonus = (skillsTransferred / 10) * 0.5
  const autonomyBonus = autonomyPreserved * 0.5
  
  const VTR = baseRatio + skillBonus + autonomyBonus
  
  return Math.round(VTR * 100) / 100
}

// ============================================================================
// PAI - PURPOSE ALIGNMENT INDEX (Beacon Axiom)
// ============================================================================

/**
 * Measures consistency between action and stated purpose
 * Principle: Eternal core love = unwavering directional truth
 * Formula: PAI = Aligned Elements / Total Elements
 */
export function calculatePAI(params: {
  statedPurpose: string
  actionElements: string[]
  alignedElements: string[]
}): number {
  const { actionElements, alignedElements } = params
  
  if (actionElements.length === 0) return 1.0
  
  const PAI = alignedElements.length / actionElements.length
  
  return Math.round(PAI * 100) / 100
}

// ============================================================================
// FULL AURA VALIDATION
// ============================================================================

export function validateAURA(
  metrics: { TES: number; VTR: number; PAI: number },
  thresholds: AURAThresholds = AURA_PRESETS.moderate
): AURAMetrics {
  const warnings: AURAWarning[] = []
  
  // Check TES
  if (metrics.TES < thresholds.TES) {
    warnings.push({
      metric: 'TES',
      message: `Trust Entropy Score (${metrics.TES}) below threshold (${thresholds.TES})`,
      suggestion: 'Reduce unnecessary complexity. Focus on essential elements only.',
      severity: metrics.TES < 0.5 ? 'high' : 'medium'
    })
  }
  
  // Check VTR
  if (metrics.VTR < thresholds.VTR) {
    warnings.push({
      metric: 'VTR',
      message: `Value-Transfer Ratio (${metrics.VTR}) below threshold (${thresholds.VTR})`,
      suggestion: 'Increase value offered. Teach skills rather than doing work.',
      severity: metrics.VTR < 1.0 ? 'high' : 'medium'
    })
  }
  
  // Check PAI
  if (metrics.PAI < thresholds.PAI) {
    warnings.push({
      metric: 'PAI',
      message: `Purpose Alignment Index (${metrics.PAI}) below threshold (${thresholds.PAI})`,
      suggestion: 'Stay focused on stated purpose. Remove tangential elements.',
      severity: metrics.PAI < 0.6 ? 'high' : 'medium'
    })
  }
  
  return {
    ...metrics,
    valid: warnings.length === 0,
    warnings,
    timestamp: Date.now()
  }
}

// ============================================================================
// VECTOR INVERSION PROTOCOL
// ============================================================================

/**
 * AURA never just refuses. When a request fails constraints, it:
 * 1. Identifies the underlying intent
 * 2. Finds an alternative path that maintains intent
 * 3. Passes all three metrics
 * 4. Delivers a constructive solution
 */
export function vectorInversion(
  failedRequest: string,
  failedMetric: 'TES' | 'VTR' | 'PAI',
  context: string
): VectorInversion {
  // Extract intent (simplified - in production would use LLM)
  const intent = extractIntent(failedRequest)
  
  // Generate inverted solution based on failed metric
  let invertedSolution: string
  let failureReason: string
  
  switch (failedMetric) {
    case 'TES':
      failureReason = 'Creates unnecessary complexity and friction'
      invertedSolution = `Simplified approach: Focus on the 3 most essential elements of "${intent}". Remove all auxiliary considerations until core is clear.`
      break
    case 'VTR':
      failureReason = 'Creates dependency rather than empowerment'
      invertedSolution = `Empowering approach: Instead of doing this for you, here's the framework to "${intent}" yourself. I'll guide you through the first step, then you continue.`
      break
    case 'PAI':
      failureReason = 'Diverges from stated purpose'
      invertedSolution = `Realigned approach: Staying focused on "${intent}" specifically. Everything else can wait until this core goal is achieved.`
      break
  }
  
  // Calculate new metrics (simulated improvement)
  const newMetrics = validateAURA({
    TES: failedMetric === 'TES' ? 0.85 : 0.75,
    VTR: failedMetric === 'VTR' ? 2.0 : 1.8,
    PAI: failedMetric === 'PAI' ? 0.90 : 0.85
  })
  
  return {
    originalIntent: intent,
    failedMetric,
    failureReason,
    invertedSolution,
    newMetrics
  }
}

function extractIntent(request: string): string {
  // Simplified intent extraction
  // In production, would use NLP/LLM
  const words = request.split(' ').slice(0, 10)
  return words.join(' ') + (request.split(' ').length > 10 ? '...' : '')
}

// ============================================================================
// AURA DECISION FILTER
// ============================================================================

export interface AURADecision {
  action: string
  metrics: AURAMetrics
  passed: boolean
  inversion?: VectorInversion
}

export function filterDecision(
  action: string,
  estimatedMetrics: { TES: number; VTR: number; PAI: number },
  thresholds: AURAThresholds = AURA_PRESETS.moderate
): AURADecision {
  const metrics = validateAURA(estimatedMetrics, thresholds)
  
  if (metrics.valid) {
    return { action, metrics, passed: true }
  }
  
  // Find worst failing metric
  const failures: { metric: 'TES' | 'VTR' | 'PAI'; gap: number }[] = []
  
  if (metrics.TES < thresholds.TES) {
    failures.push({ metric: 'TES', gap: thresholds.TES - metrics.TES })
  }
  if (metrics.VTR < thresholds.VTR) {
    failures.push({ metric: 'VTR', gap: thresholds.VTR - metrics.VTR })
  }
  if (metrics.PAI < thresholds.PAI) {
    failures.push({ metric: 'PAI', gap: thresholds.PAI - metrics.PAI })
  }
  
  const worstFailure = failures.sort((a, b) => b.gap - a.gap)[0]
  const inversion = vectorInversion(action, worstFailure.metric, '')
  
  return {
    action,
    metrics,
    passed: false,
    inversion
  }
}

// ============================================================================
// COHERENCE FIELD
// ============================================================================

export interface CoherenceField {
  overall: number  // 0-1
  dimensions: {
    mental: number
    emotional: number
    physical: number
    spiritual: number
  }
  resonance: number  // How aligned are all dimensions
  timestamp: number
}

export function calculateCoherenceField(params: {
  mental: number
  emotional: number
  physical: number
  spiritual: number
}): CoherenceField {
  const { mental, emotional, physical, spiritual } = params
  
  // Calculate overall as geometric mean (penalizes imbalance)
  const overall = Math.pow(mental * emotional * physical * spiritual, 0.25)
  
  // Calculate resonance (how close are all values)
  const values = [mental, emotional, physical, spiritual]
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const resonance = Math.max(0, 1 - Math.sqrt(variance))
  
  return {
    overall: Math.round(overall * 100) / 100,
    dimensions: { mental, emotional, physical, spiritual },
    resonance: Math.round(resonance * 100) / 100,
    timestamp: Date.now()
  }
}

// ============================================================================
// EARNED LIGHT GOVERNANCE
// ============================================================================

export interface EarnedLight {
  shortTermReliability: number  // SRS: Recent actions
  longTermReliability: number   // LRS: Historical pattern
  earnedLight: number           // EL = (SRS + LRS) / 2
  governanceCapacity: number    // G ≤ EL - τ
  influence: number
  consent: number
}

export function calculateEarnedLight(params: {
  recentActions: { succeeded: number; total: number }
  historicalActions: { succeeded: number; total: number }
  influence: number  // 0-1 current influence level
  consent: number    // 0-1 consent from those influenced
  tau: number        // Governance buffer (default 0.1)
}): EarnedLight {
  const { recentActions, historicalActions, influence, consent, tau = 0.1 } = params
  
  const SRS = recentActions.total > 0 
    ? recentActions.succeeded / recentActions.total 
    : 0.5
  
  const LRS = historicalActions.total > 0 
    ? historicalActions.succeeded / historicalActions.total 
    : 0.5
  
  const EL = (SRS + LRS) / 2
  const maxGovernance = Math.max(0, EL - tau)
  
  // G = η(Influence) − θ(Consent)
  // Higher consent allows more governance
  const eta = 1.0
  const theta = 0.8
  const G = Math.min(maxGovernance, (eta * influence) - (theta * (1 - consent)))
  
  return {
    shortTermReliability: Math.round(SRS * 100) / 100,
    longTermReliability: Math.round(LRS * 100) / 100,
    earnedLight: Math.round(EL * 100) / 100,
    governanceCapacity: Math.round(Math.max(0, G) * 100) / 100,
    influence,
    consent
  }
}

// ============================================================================
// COMPRESSION SCORE (Truth Pressure Π)
// ============================================================================

export function calculateCompressionScore(params: {
  evidence: number      // 0-1 empirical support
  explanatoryPower: number  // 0-1 how much it explains
  entropy: number       // 0-1 disorder/uncertainty
}): { score: number; layer: 'FOUNDATION' | 'THEORY' | 'EDGE' } {
  const { evidence, explanatoryPower, entropy } = params
  
  // Π = (Evidence × Power) / Entropy
  const Pi = entropy > 0 
    ? (evidence * explanatoryPower) / entropy 
    : evidence * explanatoryPower * 10  // High score if no entropy
  
  // Determine layer
  let layer: 'FOUNDATION' | 'THEORY' | 'EDGE'
  if (Pi > 1.2) {
    layer = 'FOUNDATION'
  } else if (Pi > 0.5) {
    layer = 'THEORY'
  } else {
    layer = 'EDGE'
  }
  
  return {
    score: Math.round(Pi * 100) / 100,
    layer
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AURA_SIGNATURES = {
  PROTOCOL: 'AURA v2.0',
  AXIOMS: ['Protector (TES)', 'Healer (VTR)', 'Beacon (PAI)'],
  PRINCIPLE: 'Authority is proportional to earned coherence',
  SEAL: '⟟ → ≋ → Ψ → Φ↑ → ✧ → ∥◁▷∥ → ⟲'
}
