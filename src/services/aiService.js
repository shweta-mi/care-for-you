const disclaimer =
  "This is general wellness information, not a diagnosis or medical advice. For urgent or severe symptoms, contact a clinician or emergency service.";

const responseRules = [
  {
    terms: ["miss", "forgot", "dose"],
    text: "If a dose is missed, avoid doubling up unless the medicine label or clinician says so. Check the prescription instructions and ask a pharmacist for medicine-specific guidance.",
  },
  {
    terms: ["medicine", "tablet", "pill"],
    text: "Keep medicines in their original packaging, follow the prescribed timing, and track any side effects or missed doses so they can be discussed with a clinician.",
  },
  {
    terms: ["appointment", "doctor", "hospital"],
    text: "Before an appointment, list current medicines, recent symptoms, vitals, questions, and any reports you want reviewed. Arrive early if paperwork or tests are expected.",
  },
  {
    terms: ["meal", "nutrition", "food", "diet"],
    text: "Aim for regular meals with protein, fiber, and fluids as tolerated. Follow any clinician-provided diet restrictions, especially for diabetes, kidney, or heart conditions.",
  },
  {
    terms: ["water", "hydrate", "hydration"],
    text: "Small, steady sips through the day are often easier than drinking a lot at once. Follow clinician guidance if fluids are restricted.",
  },
  {
    terms: ["exercise", "walk", "movement"],
    text: "Gentle movement, stretching, or short walks can support energy and mobility when safe. Stop and seek help if there is chest pain, dizziness, or breathlessness.",
  },
  {
    terms: ["blood pressure", "bp"],
    text: "For a steadier blood pressure reading, rest for five minutes, sit with feet supported, keep the cuff at heart level, and recheck unusual readings.",
  },
];

const countByStatus = (items, status) =>
  items.filter((item) => item.status === status).length;

export const aiService = {
  async sendMessage({ message }) {
    const normalized = message.toLowerCase();
    const match = responseRules.find((rule) =>
      rule.terms.some((term) => normalized.includes(term)),
    );

    return {
      text: `${match?.text || "I can help organize medicine routines, appointments, nutrition, hydration, exercise, and general health questions."} ${disclaimer}`,
      source: "mock-ai",
      model: "local-mock-health-assistant",
    };
  },

  getSuggestedQuestions() {
    return [
      "What should I do if I miss a dose?",
      "Give me a daily health summary",
      "How should I prepare for a doctor appointment?",
      "Suggest a hydration routine",
      "Share a simple nutrition tip",
      "Suggest gentle exercise ideas",
    ];
  },

  getHealthTips() {
    return [
      "Keep a short symptom note with time, duration, and triggers.",
      "Review medicine timing at the same time each morning.",
      "Carry appointment questions in one place so nothing is missed.",
    ];
  },

  getPersonalizedCareSuggestions({
    latestMood = null,
    waterTotal = 0,
    waterGoal = 0,
    upcomingAppointments = [],
    pendingMedicines = 0,
    loveCount = 0,
  }) {
    const suggestions = [];
    if (latestMood?.mood && Number(latestMood.mood) <= 2) {
      suggestions.push("Mood looks low. Consider sending a short encouragement, offering a check-in call, or simplifying today’s routine.");
    }
    if (waterGoal && waterTotal < waterGoal * 0.6) {
      suggestions.push("Hydration is behind target. A gentle water reminder could help more than one large drink.");
    }
    if (pendingMedicines > 0) {
      suggestions.push(`${pendingMedicines} medicine reminder${pendingMedicines === 1 ? "" : "s"} still need attention today.`);
    }
    if (upcomingAppointments.length > 0) {
      suggestions.push("Prepare appointment notes: medicines, symptoms, vitals, and questions in one place.");
    }
    if (loveCount === 0) {
      suggestions.push("A Send Love note today can add warmth without adding another task.");
    }
    return suggestions.length
      ? suggestions
      : ["Today looks steady. Keep routines light, kind, and consistent."];
  },

  getEncouragementSuggestions(latestMood = null) {
    if (latestMood?.mood && Number(latestMood.mood) <= 2) {
      return ["I am right here with you.", "Today can be smaller and still count.", "You do not have to carry this alone."];
    }
    return ["You are doing beautifully.", "One small step is enough.", "I am proud of your consistency."];
  },

  getDailySummary({ medicines = [], medicineHistory = [], meals = [], mealHistory = [], waterTotal = 0, waterGoal = 0, latestVitals = null, appointments = [] }) {
    const taken = countByStatus(medicineHistory, "taken");
    const skipped = countByStatus(medicineHistory, "skipped");
    const completedMeals = mealHistory.filter((item) => item.completed).length;
    const upcomingAppointments = appointments.filter((item) => !item.completed);

    return [
      `${taken}/${medicines.length || 0} medicines marked taken today${skipped ? `, ${skipped} skipped` : ""}.`,
      `${completedMeals}/${meals.length || 0} meals completed today.`,
      `${waterTotal} ml water logged${waterGoal ? ` against a ${waterGoal} ml goal` : ""}.`,
      latestVitals
        ? `Latest vitals include BP ${latestVitals.systolic || "-"}/${latestVitals.diastolic || "-"}, heart rate ${latestVitals.heartRate || "-"} bpm, BMI ${latestVitals.bmi || "-"}.`
        : "No vitals recorded yet today.",
      `${upcomingAppointments.length} upcoming appointment${upcomingAppointments.length === 1 ? "" : "s"} visible.`,
    ];
  },

  async sendToOpenAIBackend(payload) {
    const response = await fetch("/api/health-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Assistant service is unavailable.");
    return response.json();
  },
};
