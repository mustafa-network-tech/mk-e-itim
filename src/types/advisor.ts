/** Danışman akışı: her soru bir `stepKey` ile filtreye bağlanır; metin admin’den düzenlenir. */
export type AdvisorStepKey = "city" | "district" | "grade" | "subject" | "price";

export interface AdvisorQuestion {
  id: string;
  order: number;
  stepKey: AdvisorStepKey;
  /** Asistan balonunda gösterilen metin */
  prompt: string;
}
