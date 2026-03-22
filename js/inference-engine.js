// ================================================================
//  INFERENCE ENGINE
//  Weighted scoring: core match = 2-3 pts, supporting = 1 pt
//  Penalty if 0 core symptoms matched
// ================================================================
function runInferenceEngine(symptoms, context = {}) {
  const symSet = new Set(symptoms);
  const category = context.category || "";
  const chronic = context.chronic || [];
  const flags = context.flags || {};

  const categoryBoosts = {
    neonate: { pneumonia: 1.08, meningitis: 1.1 },
    infant: { pneumonia: 1.08, measles: 1.06 },
    child: { measles: 1.08, appendicitis: 1.03 },
    elderly: { pneumonia: 1.12, heart_failure: 1.12, tb: 1.07 },
    pregnant: { uti: 1.08, anemia: 1.07, hypertension: 1.06 },
    lactating: { anemia: 1.05 }
  };

  const chronicBoosts = {
    diabetes: { uti: 1.08, pneumonia: 1.05, heart_failure: 1.05 },
    hypertension: { heart_failure: 1.1 },
    asthma: { asthma_exacerbation: 1.18, pneumonia: 1.06 },
    heart_disease: { heart_failure: 1.16 },
    kidney_disease: { hypertension: 1.08, anemia: 1.05 },
    hiv: { tb: 1.16, pneumonia: 1.1 }
  };

  const urgentFlags = new Set([
    "difficulty_breathing",
    "confusion",
    "blood_in_cough",
    "severe_headache",
    "stiff_neck",
    "high_fever"
  ]);

  const redFlagHits = Array.from(symSet).filter(s => urgentFlags.has(s)).length;

  let scores = KNOWLEDGE_BASE.map(disease => {
    let score = 0;
    let maxScore = 0;
    let coreMatched = [];
    let supMatched = [];

    disease.core.forEach(s => {
      maxScore += disease.weight.core;
      if (symSet.has(s)) { score += disease.weight.core; coreMatched.push(s); }
    });
    disease.supporting.forEach(s => {
      maxScore += disease.weight.supporting;
      if (symSet.has(s)) { score += disease.weight.supporting; supMatched.push(s); }
    });

    // Must match at least 1 core symptom OR 2+ supporting
    if (coreMatched.length === 0 && supMatched.length < 2) return null;
    if (coreMatched.length === 0) score *= 0.4;

    // Contextual weighting by patient profile.
    const catMult = (categoryBoosts[category] && categoryBoosts[category][disease.id]) || 1;
    const chronicMult = chronic.reduce((mult, c) => {
      const boost = chronicBoosts[c] && chronicBoosts[c][disease.id];
      return boost ? mult * boost : mult;
    }, 1);

    let flagMult = 1;
    if (flags.pregnant && (disease.id === "uti" || disease.id === "anemia" || disease.id === "hypertension")) {
      flagMult *= 1.06;
    }
    if (flags.lactating && disease.id === "anemia") {
      flagMult *= 1.04;
    }

    // If danger symptoms are present, slightly prioritize urgent conditions.
    let urgencyMult = 1;
    if (disease.severity === "urgent" && redFlagHits > 0) {
      urgencyMult += Math.min(0.15, redFlagHits * 0.04);
    }

    score *= catMult * chronicMult * flagMult * urgencyMult;

    const confidence = maxScore > 0 ? (score / maxScore) : 0;
    const absScore = score;

    return {
      disease,
      confidence,
      absScore,
      coreMatched,
      supMatched,
      totalMatched: coreMatched.length + supMatched.length
    };
  }).filter(Boolean);

  scores.sort((a, b) => b.absScore - a.absScore || b.confidence - a.confidence);
  return scores.slice(0, 4);
}
