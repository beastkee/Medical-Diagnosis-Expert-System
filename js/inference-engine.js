// ================================================================
//  INFERENCE ENGINE
//  Weighted scoring: core match = 2-3 pts, supporting = 1 pt
//  Penalty if 0 core symptoms matched
// ================================================================
function runInferenceEngine(symptoms) {
  const symSet = new Set(symptoms);
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
