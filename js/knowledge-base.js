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
  },
  {
    id: "gastroenteritis",
    name: "Acute Gastroenteritis",
    severity: "moderate",
    color: "#1a7d74",
    description: "Inflammation of the stomach and intestines, commonly caused by viral or bacterial infection. Main risk is dehydration.",
    core: ["diarrhea","vomiting","abdominal_pain"],
    supporting: ["nausea","fever","dehydration","muscle_cramps","weakness"],
    weight: { core: 2.2, supporting: 1 },
    tests: ["Stool microscopy/culture (if severe)", "Serum electrolytes", "Clinical dehydration assessment"],
    recommendations: [
      { level: "moderate", title: "Rehydrate aggressively", text: "Start oral rehydration solution (ORS) immediately. Use frequent small sips if vomiting is present." },
      { level: "moderate", title: "Monitor dehydration danger signs", text: "Escalate care if reduced urine, sunken eyes, lethargy, persistent vomiting, or inability to drink develops." },
      { level: "mild", title: "Diet and hygiene", text: "Resume light diet as tolerated and maintain strict hand hygiene to reduce transmission." }
    ]
  },
  {
    id: "asthma_exacerbation",
    name: "Asthma Exacerbation",
    severity: "urgent",
    color: "#1260a8",
    description: "Acute worsening of airway inflammation and bronchospasm. Severe attacks can lead to respiratory failure.",
    core: ["difficulty_breathing","wheezing","chest_tightness","cough"],
    supporting: ["fatigue","rapid_heartbeat","chest_pain"],
    weight: { core: 2.6, supporting: 1 },
    tests: ["Peak Expiratory Flow (PEF)", "Pulse oximetry", "Arterial blood gas (if severe)"],
    recommendations: [
      { level: "urgent", title: "Immediate bronchodilator therapy", text: "Administer inhaled short-acting beta-agonist promptly (e.g., salbutamol/albuterol)." },
      { level: "urgent", title: "Emergency referral if severe", text: "If speech is limited, oxygen saturation is low, or symptoms persist after reliever treatment, refer urgently." },
      { level: "moderate", title: "Trigger control and follow-up", text: "Review inhaler technique, adherence, and triggers. Arrange follow-up to optimize long-term control." }
    ]
  },
  {
    id: "hepatitis",
    name: "Acute Hepatitis",
    severity: "urgent",
    color: "#8a6b12",
    description: "Inflammation of the liver due to viral, toxic, or drug-related causes. Requires laboratory evaluation and monitoring.",
    core: ["jaundice","fatigue","loss_of_appetite"],
    supporting: ["nausea","vomiting","abdominal_pain","weakness","dark_urine"],
    weight: { core: 2.4, supporting: 1 },
    tests: ["Liver function tests (ALT/AST, bilirubin)", "Hepatitis serology", "Coagulation profile (INR)"],
    recommendations: [
      { level: "urgent", title: "Prompt medical assessment", text: "Refer for urgent evaluation to identify cause and assess severity of liver injury." },
      { level: "moderate", title: "Avoid hepatotoxic substances", text: "Avoid alcohol and unnecessary medications, especially high-dose acetaminophen/paracetamol." },
      { level: "moderate", title: "Hydration and monitoring", text: "Monitor for red flags such as confusion, bleeding tendency, severe vomiting, or worsening jaundice." }
    ]
  },
  {
    id: "hypertension",
    name: "Hypertension (Symptomatic)",
    severity: "moderate",
    color: "#8a3a2a",
    description: "Persistently elevated blood pressure; may be asymptomatic or present with headache, dizziness, and visual symptoms.",
    core: ["high_blood_pressure","headache","dizziness"],
    supporting: ["blurred_vision","chest_pain","rapid_heartbeat","fatigue"],
    weight: { core: 2.3, supporting: 1 },
    tests: ["Repeated blood pressure measurements", "Renal profile", "ECG"],
    recommendations: [
      { level: "moderate", title: "Confirm blood pressure readings", text: "Repeat BP measurements after rest and use appropriate cuff size before confirming diagnosis." },
      { level: "moderate", title: "Assess for end-organ symptoms", text: "Urgently escalate if severe chest pain, neurologic deficits, or visual loss develops." },
      { level: "mild", title: "Lifestyle modification", text: "Reduce salt intake, maintain healthy weight, increase activity, and avoid tobacco use." }
    ]
  },
  {
    id: "heart_failure",
    name: "Heart Failure (Possible Decompensation)",
    severity: "urgent",
    color: "#9b2d2d",
    description: "Failure of the heart to pump effectively, causing fluid congestion and reduced tissue perfusion.",
    core: ["shortness_of_breath","fatigue","leg_swelling"],
    supporting: ["rapid_heartbeat","chest_pain","weakness","cough"],
    weight: { core: 2.7, supporting: 1 },
    tests: ["Chest X-ray", "ECG", "Echocardiography", "BNP/NT-proBNP"],
    recommendations: [
      { level: "urgent", title: "Urgent cardiovascular assessment", text: "Patients with breathlessness at rest, cyanosis, or severe edema need urgent medical evaluation." },
      { level: "moderate", title: "Fluid and salt review", text: "Review fluid intake and dietary sodium; monitor daily weight if possible." },
      { level: "moderate", title: "Medication optimization", text: "A clinician should review and optimize diuretics and guideline-directed therapy." }
    ]
  },
  {
    id: "migraine",
    name: "Migraine",
    severity: "mild",
    color: "#4d58a8",
    description: "Primary headache disorder characterized by recurrent throbbing headaches often with nausea and light sensitivity.",
    core: ["severe_headache","sensitivity_to_light","nausea"],
    supporting: ["vomiting","dizziness","blurred_vision"],
    weight: { core: 2.1, supporting: 1 },
    tests: ["Clinical diagnosis", "Neuroimaging if red flags are present"],
    recommendations: [
      { level: "mild", title: "Acute symptom control", text: "Use early analgesia and rest in a dark, quiet room." },
      { level: "moderate", title: "Screen for warning signs", text: "Urgently evaluate if sudden worst headache, focal deficits, fever, or neck stiffness occurs." },
      { level: "mild", title: "Trigger management", text: "Track common triggers such as sleep deprivation, stress, dehydration, or specific foods." }
    ]
  },
  {
    id: "measles",
    name: "Measles",
    severity: "urgent",
    color: "#b25512",
    description: "Highly contagious viral illness with fever, cough, coryza, conjunctival irritation, and characteristic rash.",
    core: ["high_fever","rash","cough","runny_nose"],
    supporting: ["sore_throat","fatigue","eye_pain","loss_of_appetite"],
    weight: { core: 2.4, supporting: 1 },
    tests: ["Measles IgM serology", "PCR where available", "Clinical case definition"],
    recommendations: [
      { level: "urgent", title: "Isolate immediately", text: "Measles spreads rapidly. Isolate patient and notify relevant public health channels per local policy." },
      { level: "moderate", title: "Supportive management", text: "Hydration, antipyretics, and close monitoring for complications like pneumonia or encephalitis." },
      { level: "moderate", title: "Assess contact immunization status", text: "Review vaccination status of close contacts and provide guidance per local protocols." }
    ]
  },
  {
    id: "peptic_ulcer",
    name: "Peptic Ulcer Disease",
    severity: "moderate",
    color: "#7a4f1f",
    description: "Ulceration in the stomach or duodenum, commonly associated with H. pylori infection or NSAID use.",
    core: ["epigastric_pain","nausea","heartburn"],
    supporting: ["abdominal_pain","bloating","loss_of_appetite","vomiting"],
    weight: { core: 2.2, supporting: 1 },
    tests: ["H. pylori stool antigen or urea breath test", "Upper GI endoscopy (if alarm features)"] ,
    recommendations: [
      { level: "moderate", title: "Acid suppression", text: "Consider proton pump inhibitor therapy under clinician guidance." },
      { level: "moderate", title: "Identify and treat H. pylori", text: "Where confirmed, eradication therapy is recommended by a clinician." },
      { level: "urgent", title: "Escalate for bleeding signs", text: "Urgently refer if vomiting blood, black stools, severe persistent pain, or syncope is present." }
    ]
  },
  {
    id: "kidney_stone",
    name: "Renal Colic (Kidney Stone)",
    severity: "moderate",
    color: "#5d4aa3",
    description: "Painful urinary tract stone disease, often presenting with flank pain, nausea, and blood in urine.",
    core: ["flank_pain","blood_in_urine","nausea"],
    supporting: ["vomiting","frequent_urination","burning_urination","lower_abdominal_pain"],
    weight: { core: 2.3, supporting: 1 },
    tests: ["Urinalysis", "Renal ultrasound", "Non-contrast CT KUB (when available)"],
    recommendations: [
      { level: "moderate", title: "Pain and hydration management", text: "Provide analgesia and oral hydration if tolerated; monitor urine output." },
      { level: "urgent", title: "Urgent referral criteria", text: "Refer urgently if fever, anuria, persistent vomiting, or uncontrolled pain is present." },
      { level: "mild", title: "Follow-up and prevention", text: "Advise adequate fluid intake and follow-up for recurrence prevention." }
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
      { id: "chest_tightness",     label: "Chest tightness" },
      { id: "wheezing",            label: "Wheezing" },
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
      { id: "epigastric_pain",     label: "Upper central abdominal (epigastric) pain" },
      { id: "heartburn",           label: "Heartburn / acid reflux" },
      { id: "bloating",            label: "Abdominal bloating" },
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
      { id: "dark_urine",          label: "Dark urine (tea-colored)" },
      { id: "blood_in_urine",     label: "Blood in urine" },
      { id: "flank_pain",          label: "Flank / side pain" },
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
      { id: "high_blood_pressure",label:"Known high blood pressure reading" },
      { id: "leg_swelling",      label: "Leg / ankle swelling" },
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
