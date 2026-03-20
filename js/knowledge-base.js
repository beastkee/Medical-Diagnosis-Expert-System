// ================================================================
//  KNOWLEDGE BASE — If-Then Rules for Medical Diagnosis
//  Each disease has: name, symptoms (required/optional), severity,
//  color, description, recommendations, tests.
// ================================================================
const KNOWLEDGE_BASE = [
  {
    id: "malaria",
    name: "Malaria",
    severity: "urgent",
    color: "#d85a30",
    description: "Parasitic infection transmitted by Anopheles mosquito bites. Common in sub-Saharan Africa, South Asia, and tropical regions.",
    core: ["fever","chills","sweating","headache"],
    supporting: ["nausea","vomiting","muscle_pain","fatigue","loss_of_appetite"],
    weight: { core: 2, supporting: 1 },
    tests: ["Rapid Diagnostic Test (RDT) for malaria", "Blood smear / microscopy"],
    recommendations: [
      { level: "urgent", title: "Seek immediate medical attention", text: "Malaria can be life-threatening. Patient should be evaluated at the nearest health facility urgently." },
      { level: "moderate", title: "Antimalarial treatment", text: "Artemisinin-based Combination Therapy (ACT) is the recommended first-line treatment. Do not delay." },
      { level: "mild", title: "Supportive care", text: "Ensure adequate hydration. Use fever-reducing medication (paracetamol/acetaminophen). Rest and monitor closely." }
    ]
  },
  {
    id: "flu",
    name: "Influenza (Flu)",
    severity: "moderate",
    color: "#ba7517",
    description: "Highly contagious viral respiratory illness caused by influenza viruses. Spreads rapidly especially in crowded settings.",
    core: ["fever","headache","muscle_pain","fatigue"],
    supporting: ["sore_throat","cough","runny_nose","chills","sneezing"],
    weight: { core: 2, supporting: 1 },
    tests: ["Rapid Influenza Diagnostic Test (RIDT)", "Clinical assessment"],
    recommendations: [
      { level: "moderate", title: "Rest and isolation", text: "Patient should rest at home and avoid contact with others to prevent spread. Isolation for at least 5 days from symptom onset." },
      { level: "moderate", title: "Symptomatic treatment", text: "Paracetamol or ibuprofen for fever and body pain. Stay well-hydrated with water and clear fluids." },
      { level: "mild", title: "Monitor for complications", text: "Seek medical attention if breathing difficulty, persistent high fever, or confusion develops — these may indicate pneumonia." }
    ]
  },
  {
    id: "cold",
    name: "Common Cold",
    severity: "mild",
    color: "#3b6d11",
    description: "Viral upper respiratory tract infection. Usually caused by rhinoviruses. Mild and self-limiting.",
    core: ["runny_nose","sneezing","sore_throat"],
    supporting: ["mild_fever","cough","fatigue","headache"],
    weight: { core: 2, supporting: 1 },
    tests: ["Clinical diagnosis (no specific test required)"],
    recommendations: [
      { level: "mild", title: "Self-care at home", text: "Rest, stay hydrated, and use saline nasal rinses. Cold symptoms typically resolve within 7–10 days." },
      { level: "mild", title: "Symptomatic relief", text: "Paracetamol for discomfort. Avoid antibiotics — colds are caused by viruses." }
    ]
  },
  {
    id: "typhoid",
    name: "Typhoid Fever",
    severity: "urgent",
    color: "#993c1d",
    description: "Bacterial infection caused by Salmonella typhi. Transmitted via contaminated food and water. Common in areas with poor sanitation.",
    core: ["high_fever","abdominal_pain","headache","weakness"],
    supporting: ["loss_of_appetite","constipation","diarrhea","nausea","fatigue"],
    weight: { core: 2, supporting: 1 },
    tests: ["Widal test", "Blood culture (gold standard)", "Typhoid rapid antigen test"],
    recommendations: [
      { level: "urgent", title: "Seek medical care immediately", text: "Typhoid requires antibiotic treatment. Do not delay. Patient should be seen by a healthcare professional urgently." },
      { level: "moderate", title: "Antibiotic treatment", text: "Ciprofloxacin or azithromycin are commonly used. Treatment duration is usually 7–14 days." },
      { level: "mild", title: "Hygiene and nutrition", text: "Drink only boiled or treated water. Eat soft, nutritious food. Practice good hand hygiene to prevent spread to others." }
    ]
  },
  {
    id: "pneumonia",
    name: "Pneumonia",
    severity: "urgent",
    color: "#a32d2d",
    description: "Infection that inflames air sacs in the lungs. Can be bacterial, viral, or fungal. Particularly dangerous in children and the elderly.",
    core: ["cough","difficulty_breathing","chest_pain","high_fever"],
    supporting: ["fatigue","chills","nausea","loss_of_appetite","sweating"],
    weight: { core: 2.5, supporting: 1 },
    tests: ["Chest X-ray", "Sputum culture", "Complete blood count (CBC)"],
    recommendations: [
      { level: "urgent", title: "Emergency medical attention required", text: "Pneumonia can rapidly become life-threatening. Seek emergency care, especially if breathing is laboured or oxygen levels are low." },
      { level: "urgent", title: "Antibiotic / antiviral treatment", text: "Bacterial pneumonia requires antibiotics (amoxicillin, azithromycin). Treatment must be started promptly." },
      { level: "moderate", title: "Oxygen and supportive care", text: "Ensure adequate oxygenation. Keep patient hydrated. Monitor breathing rate, oxygen saturation, and fever closely." }
    ]
  },
  {
    id: "dengue",
    name: "Dengue Fever",
    severity: "urgent",
    color: "#534ab7",
    description: "Viral infection transmitted by Aedes mosquitoes. Can progress to severe dengue (dengue haemorrhagic fever) which is life-threatening.",
    core: ["high_fever","severe_headache","joint_pain","muscle_pain"],
    supporting: ["rash","nausea","vomiting","fatigue","eye_pain"],
    weight: { core: 2, supporting: 1 },
    tests: ["NS1 Antigen test (early)", "Dengue IgM/IgG antibody test", "Complete blood count (CBC)"],
    recommendations: [
      { level: "urgent", title: "Immediate evaluation needed", text: "Dengue can progress to severe haemorrhagic dengue. Seek medical attention without delay, especially if rash or bleeding signs appear." },
      { level: "moderate", title: "Supportive treatment", text: "No specific antiviral exists. Treatment is supportive: rest, hydration with ORS, paracetamol for fever. Avoid aspirin and ibuprofen." },
      { level: "urgent", title: "Watch for danger signs", text: "Seek emergency care immediately if: severe abdominal pain, persistent vomiting, bleeding gums, blood in urine/stool, rapid breathing, or restlessness." }
    ]
  },
  {
    id: "covid",
    name: "COVID-19",
    severity: "moderate",
    color: "#185fa5",
    description: "Respiratory illness caused by SARS-CoV-2. Ranges from mild to severe. Transmission is primarily via respiratory droplets and aerosols.",
    core: ["fever","cough","fatigue"],
    supporting: ["loss_of_taste","loss_of_smell","difficulty_breathing","sore_throat","headache","muscle_pain","runny_nose"],
    weight: { core: 2, supporting: 1 },
    tests: ["Rapid Antigen Test (RAT)", "RT-PCR test"],
    recommendations: [
      { level: "moderate", title: "Isolate immediately", text: "Patient should isolate for a minimum of 5–7 days from symptom onset to prevent transmission to others." },
      { level: "moderate", title: "Monitor oxygen saturation", text: "Use a pulse oximeter if available. Seek emergency care if SpO₂ drops below 94% or breathing becomes laboured." },
      { level: "mild", title: "Supportive care", text: "Rest, hydrate, and take paracetamol for fever. Contact a healthcare provider if symptoms worsen significantly after day 5." }
    ]
  },
  {
    id: "tb",
    name: "Tuberculosis (TB)",
    severity: "urgent",
    color: "#3c3489",
    description: "Bacterial infection caused by Mycobacterium tuberculosis. Primarily affects the lungs. Spread through airborne droplets.",
    core: ["persistent_cough","night_sweats","weight_loss","fatigue"],
    supporting: ["chest_pain","blood_in_cough","fever","loss_of_appetite","weakness"],
    weight: { core: 2.5, supporting: 1 },
    tests: ["Sputum smear microscopy", "GeneXpert MTB/RIF", "Chest X-ray", "Tuberculin skin test (TST)"],
    recommendations: [
      { level: "urgent", title: "Refer to TB clinic immediately", text: "TB is a notifiable disease. Patient must be referred to a TB clinic for proper diagnosis and DOTS (Directly Observed Treatment, Short-Course)." },
      { level: "urgent", title: "Isolation precautions", text: "Patient should wear a mask and avoid crowded spaces. Improve ventilation at home. Screen close contacts." },
      { level: "moderate", title: "Complete the full treatment", text: "TB treatment is 6 months minimum. Incomplete treatment leads to drug-resistant TB. Never stop treatment early even if feeling better." }
    ]
  },
  {
    id: "cholera",
    name: "Cholera",
    severity: "urgent",
    color: "#0f6e56",
    description: "Acute diarrhoeal disease caused by Vibrio cholerae bacteria. Transmitted via contaminated water/food. Can cause fatal dehydration within hours.",
    core: ["diarrhea","vomiting","dehydration"],
    supporting: ["muscle_cramps","weakness","rapid_heartbeat","nausea"],
    weight: { core: 3, supporting: 1 },
    tests: ["Stool culture", "Rapid dipstick cholera test"],
    recommendations: [
      { level: "urgent", title: "Emergency rehydration — urgent!", text: "Cholera can cause severe dehydration leading to death within hours. Begin Oral Rehydration Solution (ORS) immediately. Severe cases need IV fluids." },
      { level: "urgent", title: "Seek medical care now", text: "Refer to the nearest health facility urgently. IV fluid replacement is critical for moderate to severe cases." },
      { level: "moderate", title: "Antibiotics and hygiene", text: "Antibiotics (doxycycline or azithromycin) reduce illness duration. Implement strict hand hygiene. Use only safe water sources." }
    ]
  },
  {
    id: "meningitis",
    name: "Meningitis",
    severity: "urgent",
    color: "#712b13",
    description: "Inflammation of the membranes surrounding the brain and spinal cord. Can be bacterial (most dangerous), viral, or fungal.",
    core: ["severe_headache","high_fever","stiff_neck"],
    supporting: ["sensitivity_to_light","nausea","vomiting","confusion","rash"],
    weight: { core: 3, supporting: 1.5 },
    tests: ["Lumbar puncture (CSF analysis)", "Blood cultures", "CT scan"],
    recommendations: [
      { level: "urgent", title: "EMERGENCY — Call for help immediately", text: "Bacterial meningitis is a life-threatening emergency. Do NOT wait. Transport patient to hospital immediately." },
      { level: "urgent", title: "Antibiotic treatment", text: "IV antibiotics (e.g., ceftriaxone) should be started as soon as possible — even before test results if meningitis is strongly suspected." },
      { level: "moderate", title: "Monitor continuously", text: "Patient needs intensive monitoring: consciousness level, vital signs, and neurological status must be assessed frequently." }
    ]
  },
  {
    id: "diabetes",
    name: "Diabetes Mellitus",
    severity: "moderate",
    color: "#854f0b",
    description: "Chronic metabolic disorder characterised by elevated blood glucose. Type 1 is autoimmune; Type 2 is lifestyle-related and more common.",
    core: ["frequent_urination","excessive_thirst","weight_loss"],
    supporting: ["fatigue","blurred_vision","slow_healing","numbness","increased_hunger"],
    weight: { core: 2, supporting: 1 },
    tests: ["Fasting Blood Glucose (FBG)", "HbA1c test", "Random Blood Glucose", "Urinalysis (glucose in urine)"],
    recommendations: [
      { level: "moderate", title: "Blood glucose testing", text: "Arrange blood glucose measurement urgently. An FBG ≥7.0 mmol/L or random glucose ≥11.1 mmol/L is diagnostic of diabetes." },
      { level: "moderate", title: "Lifestyle and dietary changes", text: "Reduce sugar and refined carbohydrate intake. Increase physical activity. Maintain healthy weight. Avoid tobacco and excessive alcohol." },
      { level: "mild", title: "Ongoing management", text: "Diabetes requires lifelong management. Regular follow-up with a healthcare provider is essential. Monitor for complications affecting eyes, kidneys, and feet." }
    ]
  },
  {
    id: "anemia",
    name: "Anaemia",
    severity: "moderate",
    color: "#444441",
    description: "Deficiency in the number or quality of red blood cells. Causes include iron deficiency, vitamin B12 deficiency, chronic disease, or blood loss.",
    core: ["fatigue","weakness","pale_skin","dizziness"],
    supporting: ["shortness_of_breath","cold_hands","headache","rapid_heartbeat","brittle_nails"],
    weight: { core: 2, supporting: 1 },
    tests: ["Full Blood Count (FBC/CBC)", "Haemoglobin level", "Serum ferritin / iron studies", "Peripheral blood smear"],
    recommendations: [
      { level: "moderate", title: "Blood test confirmation", text: "Arrange a full blood count to confirm anaemia and determine its type. Haemoglobin below 12 g/dL (women) or 13 g/dL (men) indicates anaemia." },
      { level: "moderate", title: "Iron supplementation", text: "If iron-deficiency anaemia is confirmed: oral iron tablets (ferrous sulphate) taken daily, preferably with vitamin C to enhance absorption." },
      { level: "mild", title: "Dietary improvement", text: "Increase intake of iron-rich foods: red meat, leafy greens, beans, lentils, and fortified cereals. Investigate and treat underlying cause." }
    ]
  },
  {
    id: "uti",
    name: "Urinary Tract Infection (UTI)",
    severity: "moderate",
    color: "#993556",
    description: "Bacterial infection of the urinary system. More common in women. Can range from bladder infection to kidney infection (pyelonephritis).",
    core: ["burning_urination","frequent_urination","lower_abdominal_pain"],
    supporting: ["cloudy_urine","blood_in_urine","pelvic_pain","fever","nausea"],
    weight: { core: 2.5, supporting: 1 },
    tests: ["Urine dipstick test", "Urine microscopy, culture and sensitivity (MCS)"],
    recommendations: [
      { level: "moderate", title: "Antibiotic treatment", text: "Antibiotics (e.g. nitrofurantoin, trimethoprim) are required. Treatment duration is usually 3–7 days. Complete the full course." },
      { level: "mild", title: "Hydration", text: "Drink plenty of water (at least 8 glasses per day) to help flush bacteria from the urinary tract." },
      { level: "moderate", title: "Watch for kidney involvement", text: "If fever above 38.5°C, flank/back pain, shivering, or vomiting develops — refer urgently as kidney infection (pyelonephritis) may be present." }
    ]
  },
  {
    id: "appendicitis",
    name: "Appendicitis",
    severity: "urgent",
    color: "#a32d2d",
    description: "Inflammation of the appendix. Requires urgent surgical treatment. If untreated, the appendix can rupture causing peritonitis.",
    core: ["abdominal_pain","nausea","fever"],
    supporting: ["loss_of_appetite","vomiting","abdominal_tenderness","constipation"],
    weight: { core: 3, supporting: 1 },
    tests: ["Clinical examination (Rebound tenderness)", "White cell count (WBC)", "Ultrasound abdomen", "CT scan abdomen"],
    recommendations: [
      { level: "urgent", title: "EMERGENCY — Immediate hospital referral", text: "Appendicitis requires emergency surgery. Do NOT give food or water. Transport patient to hospital immediately." },
      { level: "urgent", title: "Do NOT give pain medication or laxatives", text: "Avoid giving opioids or laxatives which can mask symptoms and delay diagnosis." },
      { level: "moderate", title: "Monitor closely during transfer", text: "Monitor vital signs during transport. Seek IV access if available. A ruptured appendix is life-threatening." }
    ]
  }
];

// ================================================================
//  SYMPTOM CATALOGUE — grouped by body system
// ================================================================
const SYMPTOM_GROUPS = [
  {
    group: "Fever & Temperature",
    symptoms: [
      { id: "fever",       label: "Fever (mild–moderate)" },
      { id: "high_fever",  label: "High fever (>38.5°C / 101°F)" },
      { id: "chills",      label: "Chills / shivering" },
      { id: "sweating",    label: "Night sweats / excessive sweating" },
      { id: "mild_fever",  label: "Mild fever (<38°C)" }
    ]
  },
  {
    group: "Head & Neurological",
    symptoms: [
      { id: "headache",           label: "Headache" },
      { id: "severe_headache",    label: "Severe / worst headache of life" },
      { id: "dizziness",          label: "Dizziness / lightheadedness" },
      { id: "confusion",          label: "Confusion / altered consciousness" },
      { id: "sensitivity_to_light", label: "Sensitivity to light" },
      { id: "stiff_neck",         label: "Stiff / painful neck" }
    ]
  },
  {
    group: "Respiratory",
    symptoms: [
      { id: "cough",               label: "Cough (general)" },
      { id: "persistent_cough",    label: "Persistent cough (>2 weeks)" },
      { id: "blood_in_cough",      label: "Blood in cough / sputum" },
      { id: "difficulty_breathing",label: "Difficulty breathing / breathlessness" },
      { id: "chest_pain",          label: "Chest pain" },
      { id: "sore_throat",         label: "Sore throat" },
      { id: "runny_nose",          label: "Runny / blocked nose" },
      { id: "sneezing",            label: "Sneezing" },
      { id: "shortness_of_breath", label: "Shortness of breath (exertional)" }
    ]
  },
  {
    group: "Gastrointestinal",
    symptoms: [
      { id: "nausea",             label: "Nausea" },
      { id: "vomiting",           label: "Vomiting" },
      { id: "diarrhea",           label: "Diarrhoea" },
      { id: "abdominal_pain",     label: "Abdominal / stomach pain" },
      { id: "lower_abdominal_pain",label:"Lower abdominal pain" },
      { id: "abdominal_tenderness",label:"Abdominal tenderness (touch-sensitive)" },
      { id: "loss_of_appetite",   label: "Loss of appetite" },
      { id: "constipation",       label: "Constipation" },
      { id: "increased_hunger",   label: "Increased hunger / never satisfied" }
    ]
  },
  {
    group: "Musculoskeletal",
    symptoms: [
      { id: "muscle_pain",  label: "Muscle pain / myalgia" },
      { id: "joint_pain",   label: "Joint pain / arthralgia" },
      { id: "muscle_cramps",label: "Muscle cramps" },
      { id: "weakness",     label: "General weakness" }
    ]
  },
  {
    group: "Skin & Eyes",
    symptoms: [
      { id: "rash",         label: "Skin rash" },
      { id: "pale_skin",    label: "Pale skin / pallor" },
      { id: "jaundice",     label: "Yellow skin / eyes (jaundice)" },
      { id: "blurred_vision",label:"Blurred vision" },
      { id: "eye_pain",     label: "Eye pain / redness" }
    ]
  },
  {
    group: "Urinary",
    symptoms: [
      { id: "frequent_urination", label: "Frequent urination" },
      { id: "burning_urination",  label: "Burning / painful urination" },
      { id: "cloudy_urine",       label: "Cloudy / dark urine" },
      { id: "blood_in_urine",     label: "Blood in urine" },
      { id: "pelvic_pain",        label: "Pelvic pain" }
    ]
  },
  {
    group: "General / Systemic",
    symptoms: [
      { id: "fatigue",          label: "Fatigue / tiredness" },
      { id: "weight_loss",      label: "Unexplained weight loss" },
      { id: "dehydration",      label: "Signs of dehydration (dry mouth, sunken eyes)" },
      { id: "rapid_heartbeat",  label: "Rapid heartbeat / palpitations" },
      { id: "cold_hands",       label: "Cold hands & feet" },
      { id: "numbness",         label: "Numbness / tingling in hands/feet" },
      { id: "slow_healing",     label: "Wounds healing slowly" },
      { id: "brittle_nails",    label: "Brittle nails / hair loss" },
      { id: "loss_of_taste",    label: "Loss of taste" },
      { id: "loss_of_smell",    label: "Loss of smell" },
      { id: "excessive_thirst", label: "Excessive thirst / always thirsty" }
    ]
  }
];
