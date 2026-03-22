// ================================================================
//  APPLICATION — UI rendering, state, and navigation
//  Matches the element IDs and CSS classes in index.html
// ================================================================

// ---- STATE ----
let selectedSymptoms = new Set();
let customSymptoms    = [];   // { id, label } for user-typed symptoms
let currentStep       = 1;
let unitMode          = 'metric';
let patFlags          = { pregnant: false, lactating: false };
let chronicSelected   = new Set();
let lastResults       = [];   // last runInferenceEngine output
let testResults       = {};   // { testLabel: 'positive'|'negative'|'inconclusive' }

// First-aid state
let faCurrentType     = null; // FA_TYPES entry currently shown
let faSelectedItems   = new Set();
let voiceSpeaking     = false;
let speechUtterance   = null;

// Category-specific symptom filtering (default: all symptoms).
const CATEGORY_SYMPTOM_ALLOWLIST = {
  neonate: new Set([
    'fever','high_fever','mild_fever','chills','sweating','fatigue','weakness','dehydration',
    'cough','difficulty_breathing','runny_nose','sore_throat','wheezing',
    'vomiting','diarrhea','abdominal_pain','nausea','loss_of_appetite',
    'jaundice','rash','headache','confusion','rapid_heartbeat'
  ]),
  infant: new Set([
    'fever','high_fever','mild_fever','chills','fatigue','weakness','dehydration',
    'cough','difficulty_breathing','runny_nose','sore_throat','wheezing','chest_pain',
    'vomiting','diarrhea','abdominal_pain','nausea','loss_of_appetite',
    'rash','headache','confusion','rapid_heartbeat'
  ]),
  child: new Set([
    'fever','high_fever','mild_fever','chills','sweating','fatigue','weakness','dehydration',
    'cough','difficulty_breathing','runny_nose','sore_throat','wheezing','chest_pain',
    'vomiting','diarrhea','abdominal_pain','nausea','loss_of_appetite','constipation',
    'rash','headache','severe_headache','stiff_neck','confusion','muscle_pain','joint_pain','rapid_heartbeat'
  ]),
  adolescent: new Set([
    'fever','high_fever','mild_fever','chills','sweating','fatigue','weakness','dehydration',
    'cough','persistent_cough','difficulty_breathing','runny_nose','sore_throat','wheezing','chest_pain','shortness_of_breath',
    'vomiting','diarrhea','abdominal_pain','lower_abdominal_pain','nausea','loss_of_appetite','constipation',
    'headache','severe_headache','stiff_neck','dizziness','confusion','muscle_pain','joint_pain','rash','rapid_heartbeat','weight_loss',
    'pelvic_pain','vaginal_discharge','abnormal_bleeding','painful_menses','scrotal_pain','testicular_swelling','groin_pain'
  ]),
  pregnant: new Set([
    'fever','high_fever','mild_fever','chills','fatigue','weakness','dizziness','headache','severe_headache',
    'cough','difficulty_breathing','chest_pain','shortness_of_breath',
    'nausea','vomiting','abdominal_pain','lower_abdominal_pain','loss_of_appetite','constipation','heartburn',
    'burning_urination','frequent_urination','cloudy_urine','blood_in_urine','pelvic_pain',
    'leg_swelling','high_blood_pressure','rapid_heartbeat','dehydration','rash'
  ]),
  lactating: new Set([
    'fever','high_fever','mild_fever','fatigue','weakness','headache',
    'cough','sore_throat','runny_nose','difficulty_breathing',
    'nausea','vomiting','abdominal_pain','loss_of_appetite','diarrhea',
    'burning_urination','frequent_urination','pelvic_pain','cloudy_urine',
    'rapid_heartbeat','dehydration','rash'
  ]),
  elderly: new Set([
    'fever','high_fever','mild_fever','chills','fatigue','weakness','dehydration','weight_loss',
    'cough','persistent_cough','difficulty_breathing','shortness_of_breath','chest_pain','blood_in_cough','wheezing',
    'headache','severe_headache','dizziness','confusion','stiff_neck',
    'abdominal_pain','nausea','vomiting','diarrhea','constipation','loss_of_appetite',
    'burning_urination','frequent_urination','blood_in_urine','flank_pain','dark_urine',
    'leg_swelling','high_blood_pressure','rapid_heartbeat','pale_skin','blurred_vision','jaundice','urinary_retention'
  ])
};

const CUSTOM_SYMPTOM_MAP = {
  'breathless': 'difficulty_breathing',
  'breathlessness': 'difficulty_breathing',
  'difficulty breathing': 'difficulty_breathing',
  'shortness of breath': 'shortness_of_breath',
  'sob': 'shortness_of_breath',
  'temperature': 'fever',
  'hot body': 'fever',
  'high temperature': 'high_fever',
  'throwing up': 'vomiting',
  'loose stool': 'diarrhea',
  'loose stools': 'diarrhea',
  'stomach ache': 'abdominal_pain',
  'belly pain': 'abdominal_pain',
  'tummy pain': 'abdominal_pain',
  'chest tightness': 'chest_tightness',
  'burning urine': 'burning_urination',
  'painful urination': 'burning_urination',
  'pain when urinating': 'burning_urination',
  'passing urine frequently': 'frequent_urination',
  'frequent pee': 'frequent_urination',
  'body weakness': 'weakness',
  'body pains': 'muscle_pain',
  'joint pains': 'joint_pain',
  'loss of appetite': 'loss_of_appetite',
  'not eating': 'loss_of_appetite',
  'yellow eyes': 'jaundice',
  'yellow skin': 'jaundice',
  'swollen legs': 'leg_swelling',
  'palpitations': 'rapid_heartbeat',
  'heart racing': 'rapid_heartbeat',
  'faint': 'dizziness',
  'light headed': 'dizziness',
  'vaginal discharge': 'vaginal_discharge',
  'abnormal discharge': 'vaginal_discharge',
  'discharge': 'vaginal_discharge',
  'spotting': 'abnormal_bleeding',
  'abnormal bleeding': 'abnormal_bleeding',
  'painful periods': 'painful_menses',
  'period pain': 'painful_menses',
  'menstrual cramps': 'painful_menses',
  'testicular pain': 'scrotal_pain',
  'scrotal pain': 'scrotal_pain',
  'swollen testicle': 'testicular_swelling',
  'groin pain': 'groin_pain',
  'urine retention': 'urinary_retention',
  'cant urinate': 'urinary_retention',
  'difficulty urinating': 'urinary_retention',
  'weak urine stream': 'urinary_retention'
};

// ================================================================
//  CHRONIC CONDITIONS catalogue
// ================================================================
const CHRONIC_CONDITIONS = [
  { id: 'diabetes',       label: 'Diabetes' },
  { id: 'hypertension',   label: 'Hypertension' },
  { id: 'asthma',         label: 'Asthma / COPD' },
  { id: 'hiv',            label: 'HIV / Immunocompromised' },
  { id: 'heart_disease',  label: 'Heart Disease' },
  { id: 'kidney_disease', label: 'Kidney Disease' },
  { id: 'liver_disease',  label: 'Liver Disease' },
  { id: 'cancer',         label: 'Cancer' },
  { id: 'tb_hx',          label: 'Previous TB' },
  { id: 'malaria_hx',     label: 'History of Malaria' },
];

// ================================================================
//  CONTEXT WARNINGS (pregnancy / pediatric / elderly / lactation)
// ================================================================
const DISEASE_CONTEXT_WARNINGS = {
  default: {
    pediatrics: [
      { level: 'moderate', text: 'Paediatric safety: use weight-based dosing only and reassess hydration frequently.' }
    ],
    pregnancy: [
      { level: 'moderate', text: 'Pregnancy safety: verify maternal-fetal medication safety before treatment.' }
    ],
    lactation: [
      { level: 'mild', text: 'Breastfeeding caution: confirm compatibility of medicines with lactation.' }
    ],
    elderly: [
      { level: 'moderate', text: 'Elderly caution: higher adverse-effect risk; start low and monitor closely.' }
    ]
  },
  malaria: {
    pregnancy: [
      { level: 'urgent', text: 'Pregnancy warning: malaria in pregnancy can rapidly become severe; urgent supervised treatment is required.' }
    ],
    pediatrics: [
      { level: 'urgent', text: 'Paediatric warning: children can decompensate quickly with malaria; monitor for dehydration and altered consciousness.' }
    ]
  },
  pneumonia: {
    pregnancy: [
      { level: 'urgent', text: 'Pregnancy warning: respiratory compromise threatens both mother and fetus; maintain low threshold for referral.' }
    ],
    pediatrics: [
      { level: 'urgent', text: 'Paediatric warning: rapid breathing/chest indrawing are red flags; urgent care is needed.' }
    ],
    elderly: [
      { level: 'urgent', text: 'Elderly warning: higher risk of hypoxia and sepsis; early escalation is recommended.' }
    ]
  },
  dengue: {
    pregnancy: [
      { level: 'urgent', text: 'Pregnancy warning: monitor closely for bleeding and shock signs; avoid NSAIDs unless clinically advised.' }
    ]
  },
  uti: {
    pregnancy: [
      { level: 'urgent', text: 'Pregnancy warning: untreated UTI may progress to pyelonephritis and obstetric complications; treat promptly.' }
    ]
  },
  appendicitis: {
    pregnancy: [
      { level: 'urgent', text: 'Pregnancy warning: abdominal findings may be atypical; urgent surgical review is required.' }
    ],
    pediatrics: [
      { level: 'urgent', text: 'Paediatric warning: perforation risk is higher with delay; urgent referral is required.' }
    ]
  },
  asthma_exacerbation: {
    pregnancy: [
      { level: 'urgent', text: 'Pregnancy warning: uncontrolled asthma reduces fetal oxygenation; prioritize rapid stabilization.' }
    ],
    pediatrics: [
      { level: 'moderate', text: 'Paediatric caution: do not use adult inhaler doses; use age/weight-appropriate protocols.' }
    ]
  },
  hypertension: {
    pregnancy: [
      { level: 'urgent', text: 'Pregnancy warning: consider hypertensive disorders of pregnancy (e.g., preeclampsia); urgent obstetric review if severe symptoms.' }
    ],
    elderly: [
      { level: 'moderate', text: 'Elderly caution: avoid over-aggressive BP reduction to reduce fall and perfusion risk.' }
    ]
  },
  diabetes: {
    pregnancy: [
      { level: 'moderate', text: 'Pregnancy caution: evaluate for gestational diabetes pathways and tighter glucose targets.' }
    ],
    pediatrics: [
      { level: 'moderate', text: 'Paediatric caution: assess for type 1 diabetes and diabetic ketoacidosis red flags.' }
    ]
  }
};

function getPatientContextGroups() {
  const category = (document.getElementById('cat-select') || {}).value || '';
  return {
    isPediatric: ['neonate', 'infant', 'child', 'adolescent'].includes(category),
    isElderly: category === 'elderly',
    isPregnant: !!patFlags.pregnant || category === 'pregnant',
    isLactating: !!patFlags.lactating || category === 'lactating'
  };
}

function getDiseaseWarnings(diseaseId) {
  const ctx = getPatientContextGroups();
  const byDisease = DISEASE_CONTEXT_WARNINGS[diseaseId] || {};
  const byDefault = DISEASE_CONTEXT_WARNINGS.default;
  let items = [];

  if (ctx.isPregnant) {
    items = items.concat(byDisease.pregnancy || byDefault.pregnancy || []);
  }
  if (ctx.isLactating) {
    items = items.concat(byDisease.lactation || byDefault.lactation || []);
  }
  if (ctx.isPediatric) {
    items = items.concat(byDisease.pediatrics || byDefault.pediatrics || []);
  }
  if (ctx.isElderly) {
    items = items.concat(byDisease.elderly || byDefault.elderly || []);
  }
  return items;
}

// ================================================================
//  FIRST AID data
// ================================================================
const FA_TYPES = [
  {
    id: 'cardiac', label: 'Cardiac Arrest', icon: '\u{1FAC0}',
    items: ['AED (Defibrillator)', 'CPR mask / face shield', 'Latex gloves', 'Phone / someone to call EMS'],
    steps: [
      { num:1, text:'Check for dangers — ensure the scene is safe for you and the patient.', sub:'', level:'normal' },
      { num:2, text:'Check responsiveness — tap shoulders firmly and shout "Are you okay?"', sub:'', level:'normal' },
      { num:3, text:'Call emergency services immediately (999 / 112 / 911) or send someone to call. Put phone on speaker.', sub:'Note the time collapse was observed.', level:'critical' },
      { num:4, text:'Begin chest compressions — heel of hand on centre of chest, arms straight, push hard and fast.', sub:'100–120 compressions per minute, at least 5 cm deep. Allow full chest recoil.', level:'critical' },
      { num:5, text:'Give rescue breaths (30:2) — tilt head back, lift chin, pinch nose, give 2 breaths of 1 second each.', sub:'Hands-only CPR (no breaths) is still effective if you are untrained or unwilling.', level:'normal' },
      { num:6, text:'If AED is available — turn it on, follow audio/visual prompts. Apply pads as shown. Do not stop CPR until prompted.', sub:'Resume CPR immediately after each shock. Minimise interruptions.', level:'warning' },
      { num:7, text:'Continue CPR until: EMS take over, the person shows signs of life, or you are physically unable to continue.', sub:'', level:'normal' },
    ]
  },
  {
    id: 'choking', label: 'Choking', icon: '\uD83E\uDD27',
    items: ['Knowledge of Heimlich manoeuvre', 'Phone for EMS'],
    steps: [
      { num:1, text:'Ask "Are you choking?" — if the person can cough forcefully or speak, encourage coughing. Do not interfere.', sub:'', level:'normal' },
      { num:2, text:'If they cannot breathe, cough effectively, or speak — call emergency services immediately.', sub:'', level:'critical' },
      { num:3, text:'Give up to 5 firm back blows — lean person forward, support chest, strike firmly between shoulder blades with heel of hand.', sub:'', level:'normal' },
      { num:4, text:'Give up to 5 abdominal thrusts (Heimlich) — stand behind, fist above navel, cover with other hand, pull sharply inward and upward.', sub:'For pregnant or obese persons: use chest thrusts instead.', level:'warning' },
      { num:5, text:'Alternate 5 back blows and 5 abdominal thrusts until the object dislodges or the person loses consciousness.', sub:'', level:'normal' },
      { num:6, text:'If the person becomes unconscious — lower carefully to the floor, call EMS, start CPR. Look in mouth before rescue breaths; remove visible object only.', sub:'', level:'critical' },
    ]
  },
  {
    id: 'bleeding', label: 'Severe Bleeding', icon: '\uD83E\uDE79',
    items: ['Clean cloth / gauze pads', 'Pressure bandage', 'Latex gloves', 'Tourniquet (for limb injuries)'],
    steps: [
      { num:1, text:'Protect yourself — wear gloves or use a barrier before touching blood if possible.', sub:'', level:'normal' },
      { num:2, text:'Call emergency services if bleeding is severe, from a large wound, or is not slowing.', sub:'', level:'critical' },
      { num:3, text:'Apply direct pressure — press a clean cloth or gauze firmly onto the wound continuously.', sub:'If cloth becomes soaked, add more material on top — do not remove the first layer.', level:'critical' },
      { num:4, text:'Elevate the injured area above heart level if possible, while maintaining pressure.', sub:'', level:'normal' },
      { num:5, text:'For limb bleeding that will not stop — apply a tourniquet 5–7 cm above the wound, NOT on a joint. Tighten until bleeding stops. Record the time.', sub:'Do NOT loosen or remove once applied. Write the time on the skin.', level:'warning' },
      { num:6, text:'Monitor for shock: pale/cold/clammy skin, rapid weak pulse, rapid breathing, confusion.', sub:'If shocked: lay flat, raise legs (if no spinal injury), keep warm. No food or water.', level:'normal' },
    ]
  },
  {
    id: 'burns', label: 'Burns', icon: '\uD83D\uDD25',
    items: ['Running cool water', 'Cling film / clean non-fluffy wrap', 'Paracetamol for pain', 'First aid kit'],
    steps: [
      { num:1, text:'Remove from danger — stop the burning. Remove burning or hot clothing/jewellery not stuck to skin.', sub:'', level:'critical' },
      { num:2, text:'Cool the burn — run cool (NOT cold or icy) running water over the burn for at least 20 minutes.', sub:'Do NOT use ice, butter, toothpaste, oil, or any other substance on the burn.', level:'critical' },
      { num:3, text:'Cover loosely with cling film or clean non-fluffy material. Do not wrap tightly or use adhesive dressings directly on the burn.', sub:'', level:'normal' },
      { num:4, text:'For severe burns (large area, face, hands, feet, genitals, joints, deep/charred) — call emergency services.', sub:'Chemical and electrical burns always require emergency care.', level:'critical' },
      { num:5, text:'Give paracetamol or ibuprofen for pain if the person is conscious and can swallow.', sub:'', level:'normal' },
      { num:6, text:'Keep the person warm. Watch for inhalation injury: hoarse voice, stridor, singed nose hairs.', sub:'Do not give food or drink if burns are severe — surgery may be needed.', level:'warning' },
    ]
  },
  {
    id: 'fracture', label: 'Broken Bone', icon: '\uD83E\uDDB4',
    items: ['Splinting material (rigid)', 'Bandages / sling', 'Ice pack', 'Pain relief'],
    steps: [
      { num:1, text:'If spinal, neck, or pelvic injury is suspected — do NOT move the person. Call emergency services.', sub:'', level:'critical' },
      { num:2, text:'Immobilise the injured limb in the position found. Do NOT try to straighten the bone.', sub:'', level:'normal' },
      { num:3, text:'Splint: apply padding and a rigid splint extending beyond the joints above and below the break.', sub:'Check circulation, sensation, and movement before and after splinting.', level:'normal' },
      { num:4, text:'For arm/wrist injuries — apply a sling to support against the body after splinting.', sub:'', level:'normal' },
      { num:5, text:'Apply an ice pack wrapped in cloth — 20 minutes on, 20 off. Do not apply ice directly to skin.', sub:'', level:'normal' },
      { num:6, text:'All suspected fractures need X-ray and professional assessment. Open fractures are a medical emergency.', sub:'', level:'warning' },
    ]
  },
  {
    id: 'stroke', label: 'Stroke', icon: '\uD83E\uDE78',
    items: ['Phone for EMS', 'Watch / timer', 'Safe space for the person'],
    steps: [
      { num:1, text:'FAST: Face drooping? Arm weakness? Speech difficulty? Time to call emergency services!', sub:'Note the EXACT time symptoms started — critical for treatment decisions.', level:'critical' },
      { num:2, text:'Call emergency services (999 / 112 / 911) IMMEDIATELY. Say "suspected stroke."', sub:'"Time is Brain" — every minute of delay means more brain damage.', level:'critical' },
      { num:3, text:'Keep the person calm and lying with head and shoulders slightly elevated.', sub:'', level:'normal' },
      { num:4, text:'Do NOT give food, water, or medication — the person may not be able to swallow safely.', sub:'', level:'warning' },
      { num:5, text:'If unconscious but breathing — recovery position (on their side). Monitor breathing continuously.', sub:'', level:'normal' },
      { num:6, text:'If breathing stops — begin CPR and continue until emergency services arrive.', sub:'', level:'critical' },
    ]
  },
  {
    id: 'anaphylaxis', label: 'Anaphylaxis', icon: '\uD83C\uDF21\uFE0F',
    items: ['Adrenaline auto-injector (EpiPen)', 'Antihistamine (cetirizine / Benadryl)', 'Phone for EMS'],
    steps: [
      { num:1, text:'Recognise: sudden throat/tongue swelling, difficulty breathing, hives, rapid weak pulse, vomiting, collapse.', sub:'', level:'critical' },
      { num:2, text:'Call emergency services immediately.', sub:'', level:'critical' },
      { num:3, text:'Administer adrenaline (EpiPen) into the outer mid-thigh. Hold for 10 seconds. Can be given through clothing.', sub:'Second dose after 5–15 min if no improvement and EMS has not arrived.', level:'critical' },
      { num:4, text:'Lay person flat and raise their legs — unless unconscious, vomiting, or having breathing difficulty.', sub:'If breathing difficulty: sit up. If unconscious: recovery position.', level:'normal' },
      { num:5, text:'Antihistamine if available and person can swallow — supplementary only, NOT a substitute for adrenaline.', sub:'', level:'normal' },
      { num:6, text:'Monitor continuously. Be ready for CPR. Hospital mandatory even after EpiPen — biphasic reactions can occur.', sub:'', level:'warning' },
    ]
  },
  {
    id: 'seizure', label: 'Seizure', icon: '\u26A1',
    items: ['Soft cushion / padding', 'Phone for EMS', 'Watch / timer'],
    steps: [
      { num:1, text:'Time the seizure — call EMS if > 5 min, if another follows, or person does not regain consciousness.', sub:'Also call if: first seizure, injury occurred, breathing difficulty afterwards.', level:'warning' },
      { num:2, text:'Protect from injury — clear hard/sharp objects. Place something soft under their head. Do NOT restrain.', sub:'', level:'normal' },
      { num:3, text:'Do NOT put anything in the mouth — they cannot swallow their tongue. This is dangerous.', sub:'', level:'critical' },
      { num:4, text:'When convulsions stop — roll into recovery position and check breathing.', sub:'', level:'normal' },
      { num:5, text:'Stay with the person — they may be confused (postictal state) for several minutes. Reassure calmly.', sub:'', level:'normal' },
      { num:6, text:'All new/first-time seizures require medical evaluation to determine the cause.', sub:'', level:'normal' },
    ]
  },
  {
    id: 'drowning', label: 'Drowning', icon: '\uD83C\uDF0A',
    items: ['Flotation device / rope / stick', 'Phone for EMS', 'Blankets for warmth'],
    steps: [
      { num:1, text:'Do NOT enter the water unless trained in water rescue. Reach, throw, or wade — do not swim to them.', sub:'Throw a rope, life ring, or extend a long stick/towel.', level:'critical' },
      { num:2, text:'Call emergency services immediately.', sub:'', level:'critical' },
      { num:3, text:'Once safely out of water — check responsiveness and breathing.', sub:'', level:'normal' },
      { num:4, text:'If not breathing — begin CPR. For drowning, start with 5 rescue breaths before chest compressions.', sub:'Continue 30:2 CPR until EMS arrives or clear signs of life.', level:'critical' },
      { num:5, text:'Keep warm — remove wet clothing and cover with blankets. Drowning can cause hypothermia.', sub:'', level:'normal' },
      { num:6, text:'All drowning victims must go to hospital — secondary drowning can occur hours later.', sub:'', level:'warning' },
    ]
  },
  {
    id: 'poisoning', label: 'Poisoning', icon: '\u2620\uFE0F',
    items: ['Phone for Poison Control / EMS', 'Container or label of the substance', 'Water (for skin/eye exposure)'],
    steps: [
      { num:1, text:'Do NOT induce vomiting unless specifically told to by Poison Control or EMS.', sub:'Vomiting worsens injury from caustic substances (acid, bleach, etc.).', level:'critical' },
      { num:2, text:'Call Poison Control or emergency services. Have the substance container ready.', sub:'Describe: what, how much, when, and the person\'s age/weight.', level:'critical' },
      { num:3, text:'If ingested and conscious — rinse mouth with water. Follow Poison Control instructions.', sub:'', level:'normal' },
      { num:4, text:'If skin contact — remove contaminated clothing. Flush skin with water for 15–20 minutes.', sub:'', level:'normal' },
      { num:5, text:'If eye exposure — flush eye with clean water for at least 20 minutes, holding the eye open.', sub:'', level:'normal' },
      { num:6, text:'Monitor for: difficulty breathing, seizures, loss of consciousness. Begin CPR if needed.', sub:'', level:'warning' },
    ]
  },
  {
    id: 'diabetic_emergency', label: 'Diabetic Crisis', icon: '\uD83C\uDF6C',
    items: ['Glucose tablets / fruit juice / regular fizzy drink', 'Glucagon injection kit (if available)', 'Phone for EMS'],
    steps: [
      { num:1, text:'Identify LOW blood sugar — signs: shaking, sweating, confusion, pale/clammy skin, rapid heartbeat.', sub:'If unsure: treat as LOW. Giving sugar unnecessarily is far less dangerous than withholding it.', level:'normal' },
      { num:2, text:'If conscious and can swallow — give 15–20 g fast sugar: 3-4 glucose tablets, 150 ml juice, or 150 ml regular fizzy drink.', sub:'', level:'critical' },
      { num:3, text:'Wait 15 minutes, reassess. Repeat if still symptomatic. Follow with a snack or meal once improved.', sub:'', level:'normal' },
      { num:4, text:'If unconscious or cannot swallow — do NOT give food/drink. Call EMS immediately.', sub:'If trained and glucagon kit available — administer per kit instructions.', level:'critical' },
      { num:5, text:'Recovery position if unconscious. Monitor breathing. Begin CPR if needed.', sub:'', level:'normal' },
      { num:6, text:'All severe hypoglycaemic episodes need medical evaluation. Identify the cause.', sub:'', level:'normal' },
    ]
  },
  {
    id: 'eye_injury', label: 'Eye Injury', icon: '\uD83D\uDC41\uFE0F',
    items: ['Clean water / eyewash station', 'Eye pad / sterile dressing', 'Phone for EMS (chemicals)'],
    steps: [
      { num:1, text:'Do NOT rub the eye — this worsens most eye injuries.', sub:'', level:'critical' },
      { num:2, text:'Foreign body: flush gently with clean water for 10–15 min. If embedded — cover (no pressure) and seek emergency care.', sub:'', level:'normal' },
      { num:3, text:'Chemical splash: flush with water for at least 20 minutes, holding eye open. Remove contact lenses. Call EMS.', sub:'', level:'critical' },
      { num:4, text:'Blunt trauma: cover with sterile pad (no pressure). Apply ice pack over pad for swelling.', sub:'', level:'normal' },
      { num:5, text:'Penetrating injury: do NOT remove any object. Cover with a paper cup (no pressure). Emergency care immediately.', sub:'', level:'critical' },
      { num:6, text:'All significant eye injuries need urgent ophthalmology. Sudden vision loss is always an emergency.', sub:'', level:'warning' },
    ]
  },
];

// ================================================================
//  UNIT TOGGLE
// ================================================================
function setU(mode) {
  unitMode = mode;
  document.getElementById('u-metric').classList.toggle('active', mode === 'metric');
  document.getElementById('u-imperial').classList.toggle('active', mode === 'imperial');
  const wth = document.getElementById('wth');
  if (wth) wth.textContent = mode === 'metric' ? 'kg' : 'lb';
}

// ================================================================
//  MODE TOGGLE
// ================================================================
function setMode(mode) {
  const isDx = mode === 'dx';
  document.getElementById('dx-mode').style.display = isDx ? '' : 'none';
  document.getElementById('fa-mode').style.display  = isDx ? 'none' : '';
  document.getElementById('btn-dx').classList.toggle('active', isDx);
  document.getElementById('btn-fa').classList.toggle('active', !isDx);
  if (!isDx) renderFA();
}

function toggleKBPanel() {
  const hidden = document.body.classList.toggle('kb-hidden');
  const btn = document.getElementById('kb-toggle');
  if (!btn) return;
  btn.textContent = hidden ? 'Show Knowledge Base' : 'Hide Knowledge Base';
  btn.classList.toggle('active', !hidden);
}

// ================================================================
//  PATIENT CATEGORY
// ================================================================
function selCat(value) {
  const banner  = document.getElementById('cat-banner');
  const pregrow = document.getElementById('pregrow');
  const configs = {
    neonate:    { cls:'neo',  icon:'\uD83C\uDF7C', text:'Newborn (0–28 days) — drug doses and normal ranges differ significantly. Use neonatal-specific references.' },
    infant:     { cls:'ped',  icon:'\uD83D\uDC76', text:'Infant (1–12 months) — paediatric dosing and weight-based calculations apply.' },
    child:      { cls:'ped',  icon:'\uD83E\uDDD2', text:'Child (1–12 years) — paediatric dosing required. Use weight-based dosing where possible.' },
    adolescent: { cls:'ped',  icon:'\uD83E\uDDD1', text:'Adolescent (13–17 years) — approaching adult dosing; confirm by weight.' },
    elderly:    { cls:'eld',  icon:'\uD83D\uDC74', text:'Elderly (65+ years) — increased polypharmacy risk. Start with lower doses.' },
    pregnant:   { cls:'preg', icon:'\uD83E\uDD30', text:'Pregnant — many medications contraindicated. Confirm safety before prescribing.' },
    lactating:  { cls:'preg', icon:'\uD83E\uDD31', text:'Breastfeeding — drug transfer to breast milk must be considered.' },
  };
  if (value && configs[value]) {
    const c = configs[value];
    banner.className = 'cat-banner ' + c.cls;
    banner.innerHTML = '<span>' + c.icon + '</span><span>' + c.text + '</span>';
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
  const showPreg = ['pregnant','lactating','adult','adolescent','elderly'].includes(value);
  if (pregrow) pregrow.style.display = showPreg ? '' : 'none';
  if (value === 'pregnant')  { patFlags.pregnant = true;  updToggleRow('tpreg', true); }
  if (value === 'lactating') { patFlags.lactating = true; updToggleRow('tlact', true); }
  if (value !== 'pregnant')  { patFlags.pregnant = false; updToggleRow('tpreg', false); }
  if (value !== 'lactating') { patFlags.lactating = false; updToggleRow('tlact', false); }
  enforceCategorySymptomSelection();
  renderSymptoms();
}

function togF(flag) {
  patFlags[flag] = !patFlags[flag];
  if (flag === 'pregnant')  updToggleRow('tpreg', patFlags.pregnant);
  if (flag === 'lactating') updToggleRow('tlact', patFlags.lactating);
}

function updToggleRow(id, on) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('on', on);
}

// ================================================================
//  AGE HINT
// ================================================================
function updAge() {
  const age  = parseFloat(document.getElementById('page').value);
  const hint = document.getElementById('ageh');
  if (!hint) return;
  if (isNaN(age) || age < 0) { hint.textContent = ''; return; }
  // 0.077 years ≈ 28 days (newborn threshold)
  if (age < 0.077)      hint.textContent = 'Newborn (0–28 days)';
  else if (age < 1)     hint.textContent = 'Infant (<1 year)';
  else if (age < 13)    hint.textContent = 'Child';
  else if (age < 18)    hint.textContent = 'Adolescent';
  else if (age < 65)    hint.textContent = 'Adult';
  else                  hint.textContent = 'Elderly (65+)';
}

// ================================================================
//  STEP NAVIGATION
// ================================================================
function goStep(n) {
  if (n === 3 && selectedSymptoms.size === 0 && customSymptoms.length === 0) {
    const sw = document.getElementById('swarn');
    if (sw) sw.style.display = 'inline';
    return;
  }
  for (let i = 1; i <= 4; i++) {
    const s = document.getElementById('s' + i);
    const t = document.getElementById('t' + i);
    if (s) s.classList.toggle('active', i === n);
    if (t) {
      t.classList.remove('active', 'done');
      if (i === n)    t.classList.add('active');
      else if (i < n) t.classList.add('done');
    }
  }
  currentStep = n;
  if (n === 2) renderSymptoms();
  if (n === 4) buildReport();
}

// ================================================================
//  RENDER KNOWLEDGE BASE
// ================================================================
function renderKB() {
  const panel = document.getElementById('kb-panel');
  const kbc   = document.getElementById('kbc');
  if (!panel) return;
  const sevLabel  = { urgent:'Urgent', moderate:'Moderate', mild:'Mild' };
  const dotColors = { urgent:'#d85a30', moderate:'#ba7517', mild:'#3b6d11' };
  let html = '';
  KNOWLEDGE_BASE.forEach(function(d) {
    const allSyms = d.core.concat(d.supporting);
    const shown   = allSyms.slice(0, 5).map(symLabel).join(', ');
    html += '<div class="kb-disease" onclick="previewDisease(\'' + d.id + '\')">' +
      '<div class="kb-dot" style="background:' + dotColors[d.severity] + '"></div>' +
      '<div>' +
      '<div class="kb-name">' + d.name + '<span class="sev-badge sev-' + d.severity + '">' + sevLabel[d.severity] + '</span></div>' +
      '<div class="kb-syms">' + shown + (allSyms.length > 5 ? ' +' + (allSyms.length - 5) + ' more' : '') + '</div>' +
      '</div></div>';
  });
  panel.innerHTML = html;
  if (kbc) kbc.textContent = KNOWLEDGE_BASE.length;
}

function previewDisease(id) {
  const d = KNOWLEDGE_BASE.find(function(x) { return x.id === id; });
  if (!d) return;
  alert(d.name + '\n\n' + d.description + '\n\nRequired symptoms:\n• ' + d.core.map(symLabel).join('\n• ') + '\n\nSupporting symptoms:\n• ' + d.supporting.map(symLabel).join('\n• '));
}

// ================================================================
//  RENDER CHRONIC CONDITIONS GRID
// ================================================================
function renderChronicGrid() {
  const grid = document.getElementById('chron-grid');
  if (!grid) return;
  let html = '';
  CHRONIC_CONDITIONS.forEach(function(c) {
    html += '<div class="toggle-row' + (chronicSelected.has(c.id) ? ' on' : '') + '" onclick="togChronic(\'' + c.id + '\')">' +
      '<div class="tdot"></div><span class="toggle-label">' + c.label + '</span></div>';
  });
  grid.innerHTML = html;
}

function togChronic(id) {
  if (chronicSelected.has(id)) chronicSelected.delete(id);
  else chronicSelected.add(id);
  renderChronicGrid();
}

// ================================================================
//  RENDER SYMPTOM CHIPS
// ================================================================
function renderSymptoms() {
  const container = document.getElementById('sym-groups');
  if (!container) return;
  const category = (document.getElementById('cat-select') || {}).value || '';
  const allowed = CATEGORY_SYMPTOM_ALLOWLIST[category] || null;
  const seen = new Set();
  let html = '';
  SYMPTOM_GROUPS.forEach(function(g) {
    const unique = g.symptoms.filter(function(s) {
      if (allowed && !allowed.has(s.id)) return false;
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
    if (unique.length === 0) return;
    html += '<div class="sym-group"><div class="sgt">' + g.group + '</div><div class="chip-group">';
    unique.forEach(function(s) {
      html += '<button class="chip' + (selectedSymptoms.has(s.id) ? ' on' : '') + '" onclick="toggleSym(\'' + s.id + '\')">' + s.label + '</button>';
    });
    html += '</div></div>';
  });
  container.innerHTML = html;
  updateSelDisplay();
}

function toggleSym(id) {
  if (selectedSymptoms.has(id)) selectedSymptoms.delete(id);
  else selectedSymptoms.add(id);
  renderSymptoms();
}

function updateSelDisplay() {
  const seld  = document.getElementById('seld');
  const scnt  = document.getElementById('scnt');
  const swarn = document.getElementById('swarn');
  const total = selectedSymptoms.size + customSymptoms.filter(function(c) { return !c.mappedId; }).length;
  if (scnt)  scnt.textContent = total + ' selected';
  if (swarn) swarn.style.display = 'none';
  if (!seld) return;
  if (total === 0) {
    seld.innerHTML = '<span class="eh">Tap symptoms below</span>';
    return;
  }
  const tags = Array.from(selectedSymptoms).map(function(id) {
    return '<span class="sel-tag">' + symLabel(id) + '</span>';
  }).concat(customSymptoms.map(function(c) {
    if (c.mappedId) {
      return '<span class="sel-tag">' + c.label + ' -> ' + symLabel(c.mappedId) + '</span>';
    }
    return '<span class="sel-tag">' + c.label + '</span>';
  }));
  seld.innerHTML = tags.join('');
}

function mapCustomSymptomToKnownId(value) {
  const norm = value.toLowerCase().trim().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
  if (!norm) return null;
  if (CUSTOM_SYMPTOM_MAP[norm]) return CUSTOM_SYMPTOM_MAP[norm];

  const allSymptoms = SYMPTOM_GROUPS.flatMap(function(g) { return g.symptoms; });
  const exact = allSymptoms.find(function(s) {
    return s.label.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() === norm;
  });
  if (exact) return exact.id;

  const fuzzy = allSymptoms.find(function(s) {
    const lbl = s.label.toLowerCase();
    return norm.includes(lbl) || lbl.includes(norm);
  });
  return fuzzy ? fuzzy.id : null;
}

function enforceCategorySymptomSelection() {
  const category = (document.getElementById('cat-select') || {}).value || '';
  const allowed = CATEGORY_SYMPTOM_ALLOWLIST[category] || null;
  if (!allowed) return;
  selectedSymptoms = new Set(Array.from(selectedSymptoms).filter(function(id) { return allowed.has(id); }));
}

function getEffectiveSymptomIds() {
  const category = (document.getElementById('cat-select') || {}).value || '';
  const allowed = CATEGORY_SYMPTOM_ALLOWLIST[category] || null;
  const ids = new Set(Array.from(selectedSymptoms));
  customSymptoms.forEach(function(c) {
    if (!c.mappedId) return;
    if (allowed && !allowed.has(c.mappedId)) return;
    ids.add(c.mappedId);
  });
  return Array.from(ids);
}

function addCS() {
  const input = document.getElementById('csi');
  const disp  = document.getElementById('csd');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  const id = 'custom_' + Date.now();
  const mappedId = mapCustomSymptomToKnownId(val);
  if (mappedId) selectedSymptoms.add(mappedId);
  customSymptoms.push({ id: id, label: val, mappedId: mappedId });
  input.value = '';
  if (disp) {
    const shown = mappedId ? (val + ' -> ' + symLabel(mappedId)) : val;
    disp.innerHTML += '<span class="chip on" style="cursor:default">' + shown + '</span>';
  }
  renderSymptoms();
  updateSelDisplay();
}

function clrSym() {
  selectedSymptoms.clear();
  customSymptoms = [];
  const disp = document.getElementById('csd');
  if (disp) disp.innerHTML = '';
  renderSymptoms();
}

// ================================================================
//  HELPER — symptom label lookup
// ================================================================
function symLabel(id) {
  for (let i = 0; i < SYMPTOM_GROUPS.length; i++) {
    const g = SYMPTOM_GROUPS[i];
    for (let j = 0; j < g.symptoms.length; j++) {
      if (g.symptoms[j].id === id) return g.symptoms[j].label;
    }
  }
  return id.replace(/_/g, ' ');
}

// ================================================================
//  RUN DIAGNOSIS (Pass 1)
// ================================================================
function runDx() {
  const total = selectedSymptoms.size + customSymptoms.length;
  if (total === 0) {
    const sw = document.getElementById('swarn');
    if (sw) sw.style.display = 'inline';
    return;
  }
  const allIds = getEffectiveSymptomIds();
  if (allIds.length === 0) {
    alert('Typed symptoms could not be mapped to known clinical symptoms yet. Please pick at least one symptom chip.');
    return;
  }
  const category = (document.getElementById('cat-select') || {}).value || '';
  const sex = (document.getElementById('psex') || {}).value || '';
  lastResults  = runInferenceEngine(allIds, {
    category: category,
    sex: sex,
    flags: Object.assign({}, patFlags),
    chronic: Array.from(chronicSelected)
  });
  testResults  = {};
  renderResults(lastResults);
  goStep(3);
}

// ================================================================
//  RENDER RESULTS
// ================================================================
function renderResults(results) {
  const area = document.getElementById('res-area');
  if (!area) return;
  const name   = (document.getElementById('pname')   || {}).value || '';
  const age    = (document.getElementById('page')    || {}).value || '';
  const sex    = (document.getElementById('psex')    || {}).value || '';
  const dur    = (document.getElementById('pdur')    || {}).value || '';
  const clinic = (document.getElementById('pclinic') || {}).value || '';
  const total  = selectedSymptoms.size + customSymptoms.length;
  const allLabels = Array.from(selectedSymptoms).map(symLabel).concat(customSymptoms.map(function(c) { return c.label; }));

  let html = '<div class="pat-summary"><strong>' + (name || 'Patient') + '</strong>';
  if (age)    html += ' \u00B7 Age ' + age;
  if (sex && sex !== 'Select') html += ' \u00B7 ' + sex;
  if (dur)    html += ' \u00B7 ' + dur;
  if (clinic) html += ' \u00B7 ' + clinic;
  if (patFlags.pregnant)  html += ' \u00B7 <span style="color:#7a3070">\uD83E\uDD30 Pregnant</span>';
  if (patFlags.lactating) html += ' \u00B7 <span style="color:#7a3070">\uD83E\uDD31 Lactating</span>';
  html += '<br><span style="font-size:11px;opacity:.75">' + total + ' symptom(s): ' + allLabels.join(', ') + '</span></div>';

  if (results.length === 0) {
    html += '<div class="nm">\uD83D\uDD0D <strong>No clear match found.</strong><br><br>The entered symptoms do not match any condition with sufficient confidence. Please verify symptoms or consult a healthcare professional.</div>';
    area.innerHTML = html;
    renderTestSection([]);
    return;
  }

  const rankLabel = ['Most Likely', 'Possible', 'Also Consider', 'Low Probability'];
  const sevColor  = { urgent:'var(--red)', moderate:'var(--amber)', mild:'var(--green)' };
  results.forEach(function(r, i) {
    const pct = Math.round(r.confidence * 100);
    const sev = r.disease.severity;
    const isPrimary = i === 0;
    const ctxWarnings = getDiseaseWarnings(r.disease.id);
    html += '<div class="diag-card ' + (isPrimary ? 'diag-primary' : 'diag-secondary') + '">' +
      '<div class="diag-rank">' + (rankLabel[i] || 'Possible') + ' \u00B7 <span style="color:' + sevColor[sev] + '">' + sev.charAt(0).toUpperCase() + sev.slice(1) + ' severity</span></div>' +
      '<div class="diag-name">' + r.disease.name + '</div>' +
      '<div class="conf-wrap"><div class="conf-bar" style="width:' + pct + '%"></div></div>' +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:7px">Confidence: <strong>' + pct + '%</strong> \u00B7 ' + r.coreMatched.length + ' core + ' + r.supMatched.length + ' supporting matched</div>' +
      '<div style="margin-bottom:7px">' +
      r.coreMatched.map(function(s) { return '<span class="match-chip">' + symLabel(s) + ' \u2605</span>'; }).join('') +
      r.supMatched.map(function(s) { return '<span class="match-chip">' + symLabel(s) + '</span>'; }).join('') +
      '</div>' +
      '<div style="font-size:12px;color:var(--muted);font-style:italic;margin-bottom:8px">' + r.disease.description + '</div>' +
      (ctxWarnings.length ?
        '<div class="ctx-warn"><div class="ctx-warn-h">Context Safety Notes</div>' +
        ctxWarnings.map(function(w) { return '<div class="ctx-warn-i ctx-' + w.level + '">' + w.text + '</div>'; }).join('') +
        '</div>' : '') +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--hint);margin-bottom:4px">Recommended Tests</div>' +
      '<div style="font-size:12px;color:var(--muted)">' + r.disease.tests.map(function(t) { return '\u2022 ' + t; }).join('<br>') + '</div>' +
      '</div>';
  });

  const top = results[0];
  html += '<div class="sdiv"></div><div class="sh">Recommendations \u2014 Based on: ' + top.disease.name + '</div>';
  top.disease.recommendations.forEach(function(rec) {
    html += '<div class="rec-card rec-' + rec.level + '"><div class="rec-title">' + rec.title + '</div><div class="rec-text">' + rec.text + '</div></div>';
  });
  if (top.disease.severity === 'urgent') {
    html += '<div class="ub"><div class="ub-t">\u26A0 Urgent \u2014 Do not delay seeking care</div><div class="ub-b">This condition is classified as URGENT. Refer to a healthcare facility as soon as possible.</div></div>';
  }
  area.innerHTML = html;
  renderTestSection(results);
}

// ================================================================
//  TEST RESULTS SECTION (Pass 2)
// ================================================================
function renderTestSection(results) {
  const sec  = document.getElementById('test-sec');
  const list = document.getElementById('test-list');
  if (!sec || !list) return;
  if (results.length === 0) { sec.style.display = 'none'; return; }
  const tests = results[0].disease.tests;
  if (!tests || tests.length === 0) { sec.style.display = 'none'; return; }
  let html = '';
  tests.forEach(function(t, idx) {
    const cur = testResults[t] || '';
    html += '<div class="test-entry" data-test-idx="' + idx + '">' +
      '<div class="ten">' + t + '</div>' +
      '<div class="test-options">' +
      '<button class="test-opt' + (cur==='positive'?' positive':'') + '" onclick="setTestByIdx(' + idx + ',\'positive\')">Positive</button>' +
      '<button class="test-opt' + (cur==='negative'?' negative':'') + '" onclick="setTestByIdx(' + idx + ',\'negative\')">Negative</button>' +
      '<button class="test-opt' + (cur==='inconclusive'?' inconclusive':'') + '" onclick="setTestByIdx(' + idx + ',\'inconclusive\')">Inconclusive</button>' +
      '</div></div>';
  });
  list.innerHTML = html;
  sec.style.display = '';
}

function setTest(test, result) {
  testResults[test] = result;
  renderTestSection(lastResults);
}

function setTestByIdx(idx, result) {
  const tests = lastResults.length > 0 ? lastResults[0].disease.tests : [];
  if (idx >= 0 && idx < tests.length) {
    testResults[tests[idx]] = result;
  }
  renderTestSection(lastResults);
}

function runP2() {
  if (lastResults.length === 0) return;
  let pos = 0, neg = 0, inc = 0;
  lastResults[0].disease.tests.forEach(function(t) {
    if (testResults[t] === 'positive')     pos++;
    if (testResults[t] === 'negative')     neg++;
    if (testResults[t] === 'inconclusive') inc++;
  });
  const adj = lastResults.map(function(r, i) {
    let mult = 1.0;
    if (i === 0) { mult += 0.15 * pos; mult -= 0.25 * neg; }
    return Object.assign({}, r, { confidence: Math.min(1, Math.max(0, r.confidence * mult)) });
  });
  adj.sort(function(a,b) { return b.confidence - a.confidence; });
  const area = document.getElementById('res-area');
  if (area) {
    const note = document.createElement('div');
    note.style.cssText = 'background:var(--teal-l);border:1px solid var(--border2);border-radius:9px;padding:9px 13px;margin-bottom:11px;font-size:12px;color:var(--teal-d)';
    note.innerHTML = '<strong>Pass 2 applied</strong> \u2014 ' + pos + ' positive, ' + neg + ' negative, ' + inc + ' inconclusive result(s) incorporated.';
    area.prepend(note);
  }
  lastResults = adj;
  renderResults(adj);
}

// ================================================================
//  REPORT
// ================================================================
function buildReport() {
  const preview = document.getElementById('rpt-preview');
  if (!preview) return;
  const name   = (document.getElementById('pname')   || {}).value || 'Unknown';
  const age    = (document.getElementById('page')    || {}).value || '\u2014';
  const sex    = (document.getElementById('psex')    || {}).value || '\u2014';
  const dur    = (document.getElementById('pdur')    || {}).value || '\u2014';
  const clinic = (document.getElementById('pclinic') || {}).value || '\u2014';
  const setting= (document.getElementById('pset')    || {}).value || '\u2014';
  const notes  = (document.getElementById('pnotes')  || {}).value || '';
  const wt     = (document.getElementById('pwt')     || {}).value || '';
  const date   = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  const allLabels = Array.from(selectedSymptoms).map(symLabel).concat(customSymptoms.map(function(c) { return c.label; }));
  const top    = lastResults[0];

  let html = '<div class="sh">Report Preview</div><div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:16px 18px;">' +
    '<div style="font-size:18px;font-weight:700;color:var(--teal-d);margin-bottom:2px">MedExpert Clinical Report</div>' +
    '<div style="font-size:11px;color:var(--hint);margin-bottom:13px">Generated: ' + date + '</div>' +
    '<div class="sdiv"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;font-size:12px;margin-bottom:12px">' +
    '<div><span style="color:var(--hint)">Patient: </span><strong>' + name + '</strong></div>' +
    '<div><span style="color:var(--hint)">Age: </span>' + age + '</div>' +
    '<div><span style="color:var(--hint)">Sex: </span>' + sex + '</div>' +
    '<div><span style="color:var(--hint)">Duration: </span>' + dur + '</div>' +
    '<div><span style="color:var(--hint)">Clinic: </span>' + clinic + '</div>' +
    '<div><span style="color:var(--hint)">Setting: </span>' + setting + '</div>' +
    (wt ? '<div><span style="color:var(--hint)">Weight: </span>' + wt + ' ' + (unitMode === 'metric' ? 'kg' : 'lb') + '</div>' : '') +
    (patFlags.pregnant  ? '<div><span style="color:#7a3070">\uD83E\uDD30 Pregnant</span></div>'  : '') +
    (patFlags.lactating ? '<div><span style="color:#7a3070">\uD83E\uDD31 Lactating</span></div>' : '') +
    '</div>';
  if (chronicSelected.size) {
    const chLabels = Array.from(chronicSelected).map(function(id) {
      const c = CHRONIC_CONDITIONS.find(function(x) { return x.id === id; });
      return c ? c.label : id;
    });
    html += '<div style="font-size:12px;margin-bottom:12px"><span style="color:var(--hint)">Chronic conditions: </span>' + chLabels.join(', ') + '</div>';
  }
  html += '<div style="font-size:12px;margin-bottom:12px"><span style="color:var(--hint)">Presenting symptoms: </span>' + (allLabels.join(', ') || '\u2014') + '</div></div>';

  if (!top) {
    html += '<div class="nm" style="margin-top:13px">No diagnosis results to report.</div>';
    preview.innerHTML = html;
    return;
  }

  html += '<div class="sh" style="margin-top:14px">Diagnoses</div>';
  lastResults.forEach(function(r, i) {
    const pct = Math.round(r.confidence * 100);
    html += '<div class="diag-card ' + (i===0?'diag-primary':'diag-secondary') + '" style="margin-bottom:9px">' +
      '<div class="diag-rank">' + (i===0?'Most Likely':'Possible') + ' \u00B7 ' + r.disease.severity.charAt(0).toUpperCase()+r.disease.severity.slice(1) + ' severity</div>' +
      '<div class="diag-name">' + r.disease.name + '</div>' +
      '<div class="conf-wrap"><div class="conf-bar" style="width:' + pct + '%"></div></div>' +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:5px">Confidence: ' + pct + '%</div></div>';
  });
  html += '<div class="sh" style="margin-top:14px">Recommendations</div>';
  top.disease.recommendations.forEach(function(rec) {
    html += '<div class="rec-card rec-' + rec.level + '"><div class="rec-title">' + rec.title + '</div><div class="rec-text">' + rec.text + '</div></div>';
  });
  html += '<div class="sh" style="margin-top:14px">Tests Ordered</div><div style="font-size:13px;color:var(--muted)">' + top.disease.tests.map(function(x) { return '\u2022 ' + x; }).join('<br>') + '</div>';
  if (notes) html += '<div class="sh" style="margin-top:14px">Notes</div><div style="font-size:13px;color:var(--muted)">' + notes + '</div>';
  html += '<div style="margin-top:20px;border-top:1px solid var(--border);padding-top:12px;font-size:10px;color:var(--hint)">\u26A0 This report is generated by an AI-assisted clinical decision support tool. It is not a substitute for professional medical advice. Always consult a qualified healthcare professional.</div>';
  preview.innerHTML = html;
  buildPrintArea(name, age, sex, dur, clinic, date, allLabels, top);
}

function buildPrintArea(name, age, sex, dur, clinic, date, allLabels, top) {
  const pa = document.getElementById('parea');
  if (!pa || !top) return;
  const pct = Math.round(top.confidence * 100);
  pa.innerHTML = '<div class="pr-hdr"><div class="pr-title">MedExpert \u2014 Clinical Report</div><div style="font-size:11px;color:#666">' + date + '</div></div>' +
    '<div class="pr-grid"><div><span class="pr-lbl">Patient: </span><strong>' + name + '</strong></div>' +
    '<div><span class="pr-lbl">Age: </span>' + age + '</div>' +
    '<div><span class="pr-lbl">Sex: </span>' + sex + '</div>' +
    '<div><span class="pr-lbl">Duration: </span>' + dur + '</div>' +
    '<div><span class="pr-lbl">Clinic: </span>' + clinic + '</div></div>' +
    '<div style="font-size:12px;margin-bottom:10px"><span class="pr-lbl">Symptoms: </span>' + allLabels.join(', ') + '</div>' +
    '<div class="pr-diag"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#085041;margin-bottom:3px">Most Likely Diagnosis \u2014 ' + pct + '% confidence</div>' +
    '<div class="pr-dname">' + top.disease.name + '</div>' +
    '<div style="font-size:12px;color:#4a6058;font-style:italic;margin-top:5px">' + top.disease.description + '</div></div>' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#7a9b8e;margin-bottom:6px">Recommendations</div>' +
    top.disease.recommendations.map(function(r) {
      return '<div class="pr-drug"><div class="pr-ddn">' + r.title + '</div><div style="font-size:12px;color:#4a6058;margin-top:3px">' + r.text + '</div></div>';
    }).join('') +
    '<div class="pr-sign"><div style="font-size:12px;font-weight:700;margin-bottom:14px">Clinician Sign-off</div>' +
    '<div class="pr-sline"></div><div style="font-size:11px;color:#666">Signature</div>' +
    '<div class="pr-sline" style="margin-top:18px"></div><div style="font-size:11px;color:#666">Printed Name &amp; Designation</div></div>' +
    '<div class="pr-disc">\u26A0 Computer-generated clinical decision support only. Not a medical diagnosis or prescription. All decisions must be made by a licensed healthcare professional.</div>';
}

function doPrint() {
  buildReport();
  window.print();
}

function doWA() {
  const top  = lastResults[0];
  const name = (document.getElementById('pname')||{}).value || 'Patient';
  if (!top) { alert('No diagnosis to share yet.'); return; }
  const msg = 'MedExpert Report\nPatient: ' + name + '\nMost Likely: ' + top.disease.name + ' (' + Math.round(top.confidence*100) + '%)\nSeverity: ' + top.disease.severity + '\n\nThis is clinical decision support only — consult a healthcare professional.';
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

function doShare() {
  const top  = lastResults[0];
  const name = (document.getElementById('pname')||{}).value || 'Patient';
  const text = top
    ? 'MedExpert: ' + name + ' \u2014 Most likely: ' + top.disease.name + ' (' + Math.round(top.confidence*100) + '% confidence, ' + top.disease.severity + ' severity).'
    : 'MedExpert \u2014 Medical Diagnosis Expert System';
  if (navigator.share) {
    navigator.share({ title: 'MedExpert Report', text: text, url: window.location.href }).catch(function(){});
  } else {
    navigator.clipboard.writeText(text)
      .then(function() { alert('Report summary copied to clipboard.'); })
      .catch(function() { alert(text); });
  }
}

// ================================================================
//  FIRST AID MODE
// ================================================================
function renderFA() {
  const grid = document.getElementById('fa-grid');
  if (!grid) return;
  let html = '';
  FA_TYPES.forEach(function(t) {
    html += '<div class="fa-btn" onclick="faSelectType(\'' + t.id + '\')">' +
      '<div class="fa-icon">' + t.icon + '</div>' +
      '<div class="fa-label">' + t.label + '</div></div>';
  });
  grid.innerHTML = html;
}

function faSelectType(id) {
  faCurrentType   = FA_TYPES.find(function(t) { return t.id === id; });
  faSelectedItems = new Set();
  if (!faCurrentType) return;
  document.getElementById('fa-s1').style.display  = 'none';
  document.getElementById('fa-s2').style.display  = '';
  document.getElementById('fa-title').textContent = faCurrentType.icon + ' ' + faCurrentType.label;
  document.getElementById('fa-steps').innerHTML   = '';
  document.getElementById('fa-voice').style.display   = 'none';
  document.getElementById('fa-handoff').style.display = 'none';
  const grid = document.getElementById('items-grid');
  let html = '';
  faCurrentType.items.forEach(function(item, idx) {
    html += '<div class="item-btn" onclick="faToggleItemByIdx(' + idx + ')">' +
      '<div class="item-label">' + item + '</div></div>';
  });
  grid.innerHTML = html;
}

function faToggleItemByIdx(idx) {
  if (!faCurrentType || idx < 0 || idx >= faCurrentType.items.length) return;
  const item = faCurrentType.items[idx];
  if (faSelectedItems.has(item)) faSelectedItems.delete(item);
  else faSelectedItems.add(item);
  const grid = document.getElementById('items-grid');
  if (!grid) return;
  const btns = grid.querySelectorAll('.item-btn');
  faCurrentType.items.forEach(function(itm, i) {
    if (btns[i]) btns[i].classList.toggle('on', faSelectedItems.has(itm));
  });
}

function faToggleItem(item) {
  if (!faCurrentType) return;
  const idx = faCurrentType.items.indexOf(item);
  if (idx !== -1) faToggleItemByIdx(idx);
}

function faAll() {
  if (!faCurrentType) return;
  faCurrentType.items.forEach(function(item) { faSelectedItems.add(item); });
  const grid = document.getElementById('items-grid');
  if (grid) grid.querySelectorAll('.item-btn').forEach(function(btn) { btn.classList.add('on'); });
}

function showFASteps() {
  if (!faCurrentType) return;
  const stepsDiv = document.getElementById('fa-steps');
  if (!stepsDiv) return;
  let html = '';
  faCurrentType.steps.forEach(function(step) {
    const cls = step.level === 'critical' ? ' critical' : (step.level === 'warning' ? ' warning' : '');
    html += '<div class="fa-step' + cls + '">' +
      '<div class="fa-sn">' + step.num + '</div>' +
      '<div><div class="fa-step-text">' + step.text + '</div>' +
      (step.sub ? '<div class="fa-step-sub">' + step.sub + '</div>' : '') +
      '</div></div>';
  });
  stepsDiv.innerHTML = html;
  const voiceDiv = document.getElementById('fa-voice');
  if (voiceDiv) voiceDiv.style.display = (typeof window !== 'undefined' && 'speechSynthesis' in window) ? '' : 'none';
  const handoff = document.getElementById('fa-handoff');
  if (handoff) handoff.style.display = '';
}

function faBack() {
  if (voiceSpeaking) togVoice();
  document.getElementById('fa-s1').style.display = '';
  document.getElementById('fa-s2').style.display = 'none';
  faCurrentType = null;
}

// ================================================================
//  TEXT-TO-SPEECH
// ================================================================
function togVoice() {
  const btn = document.getElementById('vbtn');
  if (!('speechSynthesis' in window) || !faCurrentType) return;
  if (voiceSpeaking) {
    window.speechSynthesis.cancel();
    voiceSpeaking = false;
    if (btn) { btn.classList.remove('speaking'); btn.textContent = '\uD83D\uDD0A Read Steps Aloud (Offline)'; }
    return;
  }
  const text = faCurrentType.steps.map(function(s) { return 'Step ' + s.num + ': ' + s.text + '. ' + s.sub; }).join(' ');
  speechUtterance = new SpeechSynthesisUtterance(text);
  speechUtterance.onend = function() {
    voiceSpeaking = false;
    if (btn) { btn.classList.remove('speaking'); btn.textContent = '\uD83D\uDD0A Read Steps Aloud (Offline)'; }
  };
  window.speechSynthesis.speak(speechUtterance);
  voiceSpeaking = true;
  if (btn) { btn.classList.add('speaking'); btn.textContent = '\u23F9 Stop Reading'; }
}

// ================================================================
//  RESET
// ================================================================
function resetAll() {
  selectedSymptoms.clear();
  customSymptoms  = [];
  chronicSelected.clear();
  patFlags        = { pregnant: false, lactating: false };
  lastResults     = [];
  testResults     = {};
  ['pname','pclinic','page','pwt','pnotes','csi'].forEach(function(id) {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  ['psex','pdur','pset','cat-select'].forEach(function(id) {
    const el = document.getElementById(id); if (el) el.selectedIndex = 0;
  });
  const banner = document.getElementById('cat-banner');
  if (banner) banner.style.display = 'none';
  const pregrow = document.getElementById('pregrow');
  if (pregrow) pregrow.style.display = 'none';
  const csd = document.getElementById('csd');
  if (csd) csd.innerHTML = '';
  const resArea = document.getElementById('res-area');
  if (resArea) resArea.innerHTML = '';
  renderChronicGrid();
  goStep(1);
}

// ================================================================
//  INIT
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
  renderKB();
  renderChronicGrid();
  renderSymptoms();
  setU('metric');
  const btn = document.getElementById('kb-toggle');
  if (btn) {
    const hidden = document.body.classList.contains('kb-hidden');
    btn.textContent = hidden ? 'Show Knowledge Base' : 'Hide Knowledge Base';
    btn.classList.toggle('active', !hidden);
  }
});
