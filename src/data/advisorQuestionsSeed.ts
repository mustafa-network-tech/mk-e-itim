import type { AdvisorQuestion } from "@/types/advisor";

export const advisorQuestionsSeed: AdvisorQuestion[] = [
  {
    id: "q-city",
    order: 1,
    stepKey: "city",
    prompt:
      "Merhaba, ben eğitim danışmanınızım. Önce şunu öğreneyim: hangi şehirde kurs veya dershane arıyorsunuz? Lütfen şehir adını yazın.",
  },
  {
    id: "q-district",
    order: 2,
    stepKey: "district",
    prompt: "Teşekkürler. Bu şehirde hangi ilçeyi düşünüyorsunuz? Aşağıdan seçin.",
  },
  {
    id: "q-grade",
    order: 3,
    stepKey: "grade",
    prompt: "Hangi sınıf düzeyi için arama yapıyorsunuz? Aşağıdaki seçeneklerden birini seçin.",
  },
  {
    id: "q-subject",
    order: 4,
    stepKey: "subject",
    prompt:
      "Belirli bir ders veya branş önceliğiniz var mı? Varsa seçin; yoksa «Atla» ile devam edebilirsiniz.",
  },
  {
    id: "q-price",
    order: 5,
    stepKey: "price",
    prompt: "Son olarak aylık bütçe aralığınız hangisine yakın? Bir seçenek seçin.",
  },
];
