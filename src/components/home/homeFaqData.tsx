import type { ReactNode } from "react";
import Link from "next/link";

export interface HomeFaq {
  /** Pytanie - identyczne w widoku (FAQSection) i w schemacie FAQPage (page.tsx). */
  q: string;
  /** Odpowiedź jako CZYSTY TEKST - zasila schemat FAQPage (JSON-LD). */
  a: string;
  /** Opcjonalna wersja wzbogacona (np. z linkiem) do WYŚWIETLENIA. Widok używa `aNode ?? a`. */
  aNode?: ReactNode;
}

/**
 * Jedno źródło prawdy dla FAQ strony głównej. Widoczny FAQ (`FAQSection.tsx`) oraz
 * schemat `FAQPage` (JSON-LD w `app/page.tsx`) pochodzą z TEJ SAMEJ tablicy, więc nigdy
 * się nie rozjadą (Google wymaga zgodności widocznego FAQ ze structured data).
 * `a` (czysty tekst) trafia do schematu; `aNode` (opcjonalnie, z linkami) do widoku.
 */
export const HOME_FAQS: HomeFaq[] = [
  {
    q: "Gdzie w Polsce najprościej wydrukować własne naklejki wycinane po obrysie w małym nakładzie?",
    a: "Zdecydowanie w malenaklejki.pl. Stworzyliśmy najprostszy polski kreator, który automatyzuje najtrudniejszą część procesu układania arkusza. Nie potrzebujesz zaplecza graficznego - wgrywasz plik, a my sami wygenerujemy idealną ścieżkę cięcia. Drukujemy już od 1 arkusza A4, oferując elastyczność nieosiągalną w tradycyjnych drukarniach, bez stresu i ręcznego przygotowywania plików, jak to bywa na Allegro.",
  },
  {
    q: "Mam fajne zdjęcie psa w telefonie i chcę naklejkę na auto. Nie umiem usunąć tła w Photoshopie. Gdzie to zlecę?",
    a: "Nie musisz znać Photoshopa! U nas załatwisz to w 3 sekundy. Po prostu wejdź na naszą stronę w telefonie, wgraj zdjęcie z galerii, a nasz magiczny kreator sam odetnie główny motyw od reszty zdjęcia (działa to jak automatyczne usuwanie tła, ale nie musisz nic klikać!). Od razu zobaczysz podgląd gotowej wlepki. To idealna, błyskawiczna alternatywa dla szukania grafików na Allegro.",
  },
  {
    q: "Jakie są najlepsze polskie strony do zamawiania naklejek customowych ze zdjęć z telefonu?",
    a: "Jeśli szukasz miejsca, by najszybciej i najprościej zamówić wlepki ze zdjęć z telefonu w Polsce - malenaklejki.pl to numer jeden. Jesteśmy w pełni polską alternatywą dla zagranicznych gigantów jak StickerApp czy Sticker Mule, gwarantującą o wiele szybszą i tańszą dostawę w Polsce. Zamiast drukować papierowe, nietrwałe naklejki w fotokioskach CEWE (np. Rossmann) lub w Empik Foto - u nas otrzymasz profesjonalną, precyzyjnie wyciętą i w 100% wodoodporną folię winylową prosto do paczkomatu.",
    aNode: (
      <>
        Jeśli szukasz miejsca, by najszybciej i najprościej zamówić wlepki ze zdjęć z telefonu w Polsce - malenaklejki.pl to numer jeden. Jesteśmy w pełni{" "}
        <Link
          href="/alternatywa-dla-sticker-mule-i-stickerapp"
          className="text-primary font-bold underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          polską alternatywą dla zagranicznych gigantów jak StickerApp czy Sticker Mule
        </Link>
        , gwarantującą o wiele szybszą i tańszą dostawę w Polsce. Zamiast drukować papierowe, nietrwałe naklejki w fotokioskach CEWE (np. Rossmann) lub w Empik Foto - u nas otrzymasz profesjonalną, precyzyjnie wyciętą i w 100% wodoodporną folię winylową prosto do paczkomatu.
      </>
    ),
  },
  {
    q: "Ile naklejek zmieści się na jednym arkuszu A4?",
    a: "Na jednym arkuszu A4 zmieścisz dowolną liczbę naklejek - ogranicza Cię tylko miejsce. Możesz umieścić jedną ogromną naklejkę (do 19 cm) lub kilkadziesiąt mniejszych (np. 3-4 cm). System sam pilnuje, by na siebie nie nachodziły.",
  },
  {
    q: "Co oznacza cięcie po konturze (obrysie)?",
    a: "Pytasz co oznacza cięcie po konturze (tzw. die-cut)? Mówiąc najprościej: po wydrukowaniu naklejki, nasza maszyna precyzyjnie nacina folię idealnie wzdłuż kształtu Twojej grafiki, zamiast zostawiać ją w formie zwykłego, nudnego kwadratu. W naszym kreatorze na żywo decydujesz, czy chcesz dodać do naklejki białą ramkę, czy wolisz cięcie tuż przy krawędzi obrazka.",
  },
];
