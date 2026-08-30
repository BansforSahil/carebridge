export interface HealthTopic {
  id: string;
  title: string;
  description: string;
  keyPoints: string[];
  preventionInfo: string;
  safetyInfo?: string;
  sources: string[];
}

export const HEALTH_TOPICS: HealthTopic[] = [
  {
    id: "preventive-care",
    title: "Preventive Care",
    description: "Routine healthcare that includes screenings, check-ups, and patient counseling to prevent illnesses, disease, or other health problems.",
    keyPoints: [
      "Regular health check-ups can detect problems early.",
      "Screenings are available for various age groups.",
      "Talk to your doctor about your family medical history."
    ],
    preventionInfo: "Schedule an annual wellness visit with a primary care provider.",
    sources: ["World Health Organization", "Local Health Department"]
  },
  {
    id: "vaccination",
    title: "Vaccination",
    description: "Understand immunization and how vaccines help your immune system fight infections.",
    keyPoints: [
      "Vaccines are safe and highly effective.",
      "They protect individuals and communities (herd immunity).",
      "Keep track of vaccination schedules for children and adults."
    ],
    preventionInfo: "Follow the recommended immunization schedule provided by health authorities.",
    safetyInfo: "If you have a compromised immune system, consult a healthcare provider before receiving live vaccines.",
    sources: ["CDC", "World Health Organization"]
  },
  {
    id: "nutrition",
    title: "Nutrition",
    description: "Practical awareness for maintaining a healthy and balanced diet.",
    keyPoints: [
      "Consume a variety of foods including fruits, vegetables, and whole grains.",
      "Limit intake of processed foods, salt, and added sugars.",
      "Stay hydrated by drinking plenty of water."
    ],
    preventionInfo: "Plan meals ahead and read nutritional labels.",
    sources: ["Dietary Guidelines"]
  },
  {
    id: "maternal-health",
    title: "Maternal Health",
    description: "Preventive guidance for health during pregnancy, childbirth, and the postpartum period.",
    keyPoints: [
      "Prenatal care is crucial for the health of both mother and baby.",
      "Maintain a nutritious diet and take prescribed supplements.",
      "Attend all scheduled medical appointments."
    ],
    preventionInfo: "Seek regular check-ups with an obstetrician or midwife.",
    safetyInfo: "Seek immediate medical attention for severe pain, bleeding, or reduced fetal movement.",
    sources: ["Maternal Health Organizations"]
  },
  {
    id: "child-health",
    title: "Child Health",
    description: "Information on monitoring and supporting healthy development in children.",
    keyPoints: [
      "Monitor developmental milestones.",
      "Ensure proper nutrition and physical activity.",
      "Keep up with pediatric visits and vaccinations."
    ],
    preventionInfo: "Create a safe home environment and establish healthy routines.",
    sources: ["Pediatric Associations"]
  },
  {
    id: "hygiene",
    title: "Hygiene",
    description: "Practices that help maintain health and prevent the spread of diseases.",
    keyPoints: [
      "Wash hands frequently with soap and water.",
      "Maintain oral hygiene by brushing twice a day.",
      "Ensure safe food preparation practices."
    ],
    preventionInfo: "Carry hand sanitizer and avoid touching your face with unwashed hands.",
    sources: ["Health Guidelines"]
  },
  {
    id: "mental-wellbeing",
    title: "Mental Wellbeing",
    description: "Awareness of mental health, managing stress, and seeking help when needed.",
    keyPoints: [
      "Mental health is as important as physical health.",
      "Practice stress management techniques like mindfulness.",
      "Stay connected with supportive friends and family."
    ],
    preventionInfo: "Take breaks when stressed and maintain a healthy work-life balance.",
    safetyInfo: "If you are in distress, reach out to a mental health helpline or professional immediately.",
    sources: ["Mental Health Foundations"]
  },
  {
    id: "chronic-disease",
    title: "Chronic Disease Awareness",
    description: "Information on managing conditions like diabetes, hypertension, and asthma.",
    keyPoints: [
      "Understand your condition and follow your treatment plan.",
      "Monitor symptoms and attend regular check-ups.",
      "Adopt lifestyle changes recommended by your provider."
    ],
    preventionInfo: "Maintain a healthy lifestyle to reduce the risk of developing chronic diseases.",
    sources: ["Chronic Disease Centers"]
  }
];
