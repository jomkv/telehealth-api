import { PrismaClient } from 'generated/prisma/client';
import { ENV_VARS } from 'src/shared/env-variables';
import { InferenceClient } from '@huggingface/inference';

async function embedText(text: string): Promise<number[]> {
  const apiKey = ENV_VARS.hfKey();
  if (!apiKey) {
    throw new Error('HF_KEY missing. Set env var before seeding.');
  }

  const client = new InferenceClient(apiKey);

  const output = await client.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: text,
    provider: 'hf-inference',
  });

  if (!Array.isArray(output)) {
    throw new Error('Embedding output unexpected.');
  }

  return output as number[];
}

const specializations = [
  {
    label: 'General Practice',
    description:
      'Handles a wide range of everyday health concerns including fever, cough, colds, fatigue, headaches, and minor infections. The first point of contact for most patients, and can refer to specialists when needed. Suitable for routine check-ups, general wellness concerns, and non-emergency conditions.',
  },
  {
    label: 'Internal Medicine',
    description:
      'Focuses on the prevention, diagnosis, and treatment of complex or chronic adult illnesses affecting multiple organ systems. Commonly seen conditions include hypertension, diabetes, anemia, and unexplained weight loss. Best consulted when symptoms are persistent, systemic, or involve multiple body systems.',
  },
  {
    label: 'Cardiology',
    description:
      'Specializes in conditions affecting the heart and blood vessels. Patients typically present with chest pain, palpitations, shortness of breath, high blood pressure, irregular heartbeat, or a history of heart attack. Also handles long-term management of heart failure and coronary artery disease.',
  },
  {
    label: 'Dermatology',
    description:
      'Treats conditions of the skin, hair, and nails. Common concerns include acne, rashes, eczema, psoriasis, fungal infections, hair loss, unusual moles, and skin allergies. Also handles cosmetic skin concerns and skin cancer screening.',
  },
  {
    label: 'Pediatrics',
    description:
      'Provides medical care for infants, children, and adolescents up to 18 years old. Handles childhood illnesses, growth and development monitoring, vaccinations, and behavioral concerns. Parents typically consult for fever, feeding issues, developmental delays, or recurring infections in children.',
  },
  {
    label: 'Obstetrics & Gynecology',
    description:
      'Covers female reproductive health, pregnancy, and childbirth. Patients seek consultation for menstrual irregularities, pelvic pain, vaginal discharge, fertility concerns, prenatal care, and menopausal symptoms. Also handles routine pap smears, family planning, and gynecological infections.',
  },
  {
    label: 'Orthopedics',
    description:
      'Diagnoses and treats conditions involving bones, joints, muscles, ligaments, and tendons. Common complaints include back pain, knee pain, fractures, sports injuries, arthritis, and joint stiffness. Handles both surgical and non-surgical management of musculoskeletal problems.',
  },
  {
    label: 'Ear, Nose & Throat (ENT)',
    description:
      'Specializes in conditions affecting the ears, nose, throat, and related structures of the head and neck. Frequently consulted for hearing loss, ear infections, sinusitis, nasal congestion, sore throat, tonsil problems, hoarseness, and vertigo.',
  },
  {
    label: 'Ophthalmology',
    description:
      'Focuses on the health of the eyes and visual system. Patients commonly present with blurry vision, eye pain, redness, dryness, floaters, cataracts, glaucoma, or eye infections. Also handles prescription of corrective lenses and eye surgery.',
  },
  {
    label: 'Psychiatry',
    description:
      'Addresses mental, emotional, and behavioral health conditions. Commonly treated conditions include depression, anxiety, panic attacks, bipolar disorder, schizophrenia, PTSD, OCD, and insomnia. Provides diagnosis, therapy guidance, and psychiatric medication management.',
  },
  {
    label: 'Neurology',
    description:
      "Handles disorders of the brain, spinal cord, and nervous system. Patients typically present with persistent headaches, migraines, dizziness, numbness or tingling, seizures, memory problems, tremors, or weakness in limbs. Also manages conditions like stroke, Parkinson's disease, and epilepsy.",
  },
  {
    label: 'Pulmonology',
    description:
      'Specializes in diseases of the lungs and respiratory system. Commonly consulted for chronic cough, asthma, shortness of breath, recurring pneumonia, tuberculosis, sleep apnea, and COPD. Best suited for patients with persistent or worsening breathing difficulties.',
  },
  {
    label: 'Gastroenterology',
    description:
      'Focuses on the digestive system including the stomach, intestines, liver, and pancreas. Common complaints include abdominal pain, bloating, acid reflux, diarrhea, constipation, blood in stool, nausea, and difficulty swallowing. Also handles liver disease and colorectal screening.',
  },
  {
    label: 'Endocrinology',
    description:
      'Treats hormonal imbalances and disorders of the endocrine system. Commonly managed conditions include diabetes, thyroid disorders (hypothyroidism, hyperthyroidism), PCOS, adrenal issues, and osteoporosis. Patients often present with unexplained weight changes, fatigue, excessive thirst, or irregular periods.',
  },
  {
    label: 'Urology',
    description:
      'Handles conditions of the urinary tract in both men and women, as well as the male reproductive system. Common concerns include urinary tract infections, kidney stones, frequent urination, blood in urine, erectile dysfunction, and prostate issues. Also manages bladder and kidney conditions.',
  },
  {
    label: 'Nephrology',
    description:
      'Specializes in kidney function and kidney-related diseases. Patients typically present with swelling in the legs, foamy urine, reduced urine output, high blood pressure linked to kidney issues, or chronic kidney disease. Also manages patients on dialysis.',
  },
  {
    label: 'Oncology',
    description:
      'Focuses on the diagnosis and treatment of cancer. Patients may present with unexplained lumps, persistent fatigue, unintentional weight loss, abnormal bleeding, or have received a recent cancer diagnosis. Handles chemotherapy, cancer staging, and coordination of cancer care.',
  },
  {
    label: 'Rheumatology',
    description:
      'Diagnoses and manages autoimmune and inflammatory conditions affecting joints, muscles, and connective tissues. Commonly treated conditions include rheumatoid arthritis, lupus, gout, fibromyalgia, and ankylosing spondylitis. Patients often present with joint swelling, morning stiffness, and chronic pain.',
  },
  {
    label: 'Infectious Disease',
    description:
      "Specializes in complex or difficult-to-treat infections caused by bacteria, viruses, fungi, or parasites. Consulted for persistent fevers of unknown origin, HIV management, hepatitis, dengue complications, tuberculosis, and infections that don't respond to standard treatment.",
  },
  {
    label: 'Hematology',
    description:
      'Focuses on blood disorders and diseases of the blood-forming organs. Common conditions include anemia, clotting disorders, leukemia, lymphoma, and low platelet counts. Patients often present with unusual bruising, prolonged bleeding, extreme fatigue, or abnormal blood test results.',
  },
  {
    label: 'Physical Medicine & Rehabilitation',
    description:
      'Helps patients recover function and manage pain after injury, surgery, or illness. Commonly handles stroke recovery, post-fracture rehabilitation, chronic back and neck pain, sports injuries, and nerve damage. Focuses on restoring mobility and quality of life through non-surgical approaches.',
  },
  {
    label: 'Allergy & Immunology',
    description:
      'Diagnoses and treats allergic conditions and immune system disorders. Patients present with food allergies, drug allergies, allergic rhinitis, hives, asthma triggered by allergens, recurring infections, or suspected immune deficiencies. Handles allergy testing and immunotherapy.',
  },
  {
    label: 'Surgery',
    description:
      'Manages conditions that may require surgical intervention, as well as pre-operative and post-operative care. Patients consult for abdominal pain that may indicate appendicitis or hernia, suspicious lumps or masses, wound concerns, and follow-up care after procedures. Telehealth consultations are suitable for initial assessment, surgical clearance, and post-op monitoring.',
  },
  {
    label: 'Family Medicine',
    description:
      'Provides comprehensive and continuous care for patients of all ages, addressing a broad range of physical, mental, and preventive health needs. Commonly handles chronic disease management, lifestyle-related conditions, routine health maintenance, and coordination of specialist referrals. Ideal for patients seeking a primary care physician who manages their overall health long-term.',
  },
  {
    label: 'Geriatrics',
    description:
      'Specializes in the healthcare of elderly patients, typically those 60 years and older. Addresses age-related conditions such as dementia, falls, frailty, polypharmacy, incontinence, and mobility issues. Particularly well-suited for telehealth as elderly patients often benefit from remote consultations that reduce the burden of travel.',
  },
];

export async function seedSpecializations(prisma: PrismaClient) {
  for (const specialization of specializations) {
    const embedding = await embedText(
      `${specialization.label}. ${specialization.description}`,
    );

    await prisma.specialization.upsert({
      where: { label: specialization.label },
      update: {
        description: specialization.description,
        embedding,
      },
      create: {
        label: specialization.label,
        description: specialization.description,
        embedding,
      },
    });
  }
}
