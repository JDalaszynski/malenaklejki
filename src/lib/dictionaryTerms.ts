import {
  Scissors,
  Layers,
  Spline,
  PenTool,
  Droplets,
  Waves,
  StickyNote,
  Sticker,
  Printer,
  Palette,
  Monitor,
  FileImage,
  Shapes,
  Square,
  Eraser,
  Camera,
  Tag,
  ShieldCheck,
} from "lucide-react";

/**
 * Jedno źródło prawdy dla słownika pojęć (`/slownik-naklejek`) - zarówno widoczny
 * glosariusz, jak i schemat `DefinedTermSet` (JSON-LD) na tej stronie ORAZ
 * `mentions` w schemacie `Article`/`BlogPosting` artykułów na blogu (P4.2.6,
 * `blog-agent/plan.md`) czerpią z tej samej tablicy. `def` to czysty tekst - ten
 * sam string zasila render i schemat, więc definicje nie mogą się rozjechać.
 *
 * `slug` musi być stabilny (to fragment URL `/slownik-naklejek#<slug>` używany
 * jako `@id` DefinedTerm) - nie zmieniaj go bez potrzeby, bo psuje to wsteczne
 * odnośniki z artykułów.
 *
 * `matchTerms` to fraz(y), po których `findMentionedTerms()` rozpoznaje wystąpienie
 * pojęcia w treści artykułu (dopasowanie tekstowe, bez kontekstu semantycznego -
 * stąd krótkie i jednoznaczne frazy, nie pełne nazwy z dopiskami w nawiasie).
 */
export type Term = {
  icon: React.ElementType;
  slug: string;
  name: string;
  def: string;
  href?: string;
  linkLabel?: string;
  matchTerms?: string[];
};

export type TermGroup = {
  id: string;
  heading: string;
  intro: string;
  terms: Term[];
  images?: { src: string; alt: string }[];
};

export const DICTIONARY_URL = "https://www.malenaklejki.pl/slownik-naklejek";

export const GLOSSARY: TermGroup[] = [
  {
    id: "ciecie",
    heading: "Rodzaje cięcia i kształt naklejek",
    intro:
      "Od sposobu cięcia zależy, czy naklejka ma kształt Twojej grafiki, czy zostaje na prostokątnym arkuszu. To najczęściej mylone pojęcia przy zamawianiu.",
    terms: [
      {
        icon: Scissors,
        slug: "die-cut",
        name: "Die-cut (cięcie po obrysie, wykrój)",
        def: "Die-cut to naklejka wycięta dokładnie po obrysie grafiki - bez marginesu i bez prostokątnego tła. Ploter prowadzi ostrze wzdłuż konturu motywu (mówi się też o wykroju po kształcie grafiki), więc naklejka przybiera kształt sylwetki, logo czy napisu. Efekt wygląda jak profesjonalny merch dopasowany na miarę do projektu.",
        href: "/naklejki-die-cut",
        linkLabel: "Zamów naklejki die-cut",
        matchTerms: ["die-cut", "die cut", "wykrój", "wykroje"],
      },
      {
        icon: Layers,
        slug: "kiss-cut",
        name: "Kiss-cut",
        def: "Kiss-cut to cięcie tylko przez wierzchnią warstwę folii, bez przecinania papieru podkładowego. Naklejka ma kształt grafiki, ale zostaje na całym prostokątnym arkuszu, z którego odklejasz ją pojedynczo. Sprawdza się przy masowym naklejaniu, na przykład etykiet na słoiki.",
        href: "/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych",
        linkLabel: "Die-cut vs kiss-cut",
        matchTerms: ["kiss-cut", "kiss cut"],
      },
      {
        icon: Spline,
        slug: "linia-ciecia",
        name: "Linia cięcia (kontur, cut line)",
        def: "Linia cięcia to ścieżka, wzdłuż której ploter tnie folię i która wyznacza granicę naklejki. Przy cięciu po obrysie biegnie dokładnie po krawędzi grafiki. W kreatorze kontur powstaje automatycznie po wgraniu pliku, bez rysowania go ręcznie w Photoshopie.",
        matchTerms: ["linia cięcia", "cut line"],
      },
      {
        icon: PenTool,
        slug: "wykrojnik",
        name: "Wykrojnik (matryca tnąca)",
        def: "Wykrojnik to metalowa forma z nożem w kształcie wzoru, którą w tradycyjnym druku wykrawa się naklejki. Przy druku cyfrowym od 1 sztuki zastępuje go ploter tnący sterowany linią cięcia, dzięki czemu nie płacisz za osobną matrycę dla każdego kształtu.",
        matchTerms: ["wykrojnik", "matryca tnąca"],
      },
    ],
    images: [
      {
        src: "/landing/slownik-naklejek/die-cut-naklejka-ciecie-po-obrysie-kontur.jpg",
        alt: "Naklejka die-cut wycięta po obrysie z widocznym białym konturem - motyw Świat Naklejek Atlas na ekranie telefonu i jako gotowa naklejka cięta po linii cięcia.",
      },
      {
        src: "/landing/slownik-naklejek/naklejka-die-cut-z-widoczna-linia-ciecia.jpg",
        alt: "Naklejka die-cut z rekinem wycięta dokładnie po obrysie grafiki - wyraźna linia cięcia (kontur) wokół motywu na trwałej folii winylowej.",
      },
    ],
  },
  {
    id: "materialy",
    heading: "Materiał, folia i wykończenie naklejek",
    intro:
      "Z czego zrobiona jest naklejka i co decyduje o jej trwałości. W MałeNaklejki rdzeniem oferty jest folia winylowa odporna na wodę, UV i zadrapania.",
    terms: [
      {
        icon: Droplets,
        slug: "folia-winylowa",
        name: "Folia winylowa (winyl)",
        def: "Folia winylowa to trwałe tworzywo, na którym drukujemy naklejki zamiast papieru. Jest odporna na wodę, promieniowanie UV i zadrapania, ma mocny klej i nie zostawia śladów po odklejeniu. To rdzeń oferty MałeNaklejki - wszystkie naklejki powstają na tej samej folii.",
        href: "/naklejki-foliowe",
        linkLabel: "Naklejki foliowe",
        matchTerms: ["folia winylowa", "folii winylowej", "folię winylową"],
      },
      {
        icon: Waves,
        slug: "naklejki-wodoodporne",
        name: "Naklejki wodoodporne",
        def: "Naklejki wodoodporne to naklejki, których nadruk nie rozmywa się ani nie odchodzi od kontaktu z wodą - dzięki drukowi na folii winylowej, a nie na papierze. Odporność obejmuje wodę, promieniowanie UV i zadrapania. Wyjątkiem jest zmywarka - wysoka temperatura i długi cykl mogą podważyć krawędź kleju, dlatego naklejone naczynia myjemy ręcznie.",
        href: "/blog/naklejki-wodoodporne-i-winylowe-jaka-folia-i-jak-dlugo-wytrzyma",
        linkLabel: "Ile wytrzymują naklejki wodoodporne",
        matchTerms: ["naklejki wodoodporne", "naklejka wodoodporna", "wodoodporność"],
      },
      {
        icon: StickyNote,
        slug: "papier-podkladowy",
        name: "Papier podkładowy (liner)",
        def: "Papier podkładowy to spodnia warstwa, z której odklejasz gotową naklejkę, i która chroni klej do momentu naklejenia. Przy cięciu kiss-cut cały komplet naklejek zostaje na jednym prostokątnym podkładzie, a przy die-cut podkład jest przycięty do kształtu naklejki.",
        matchTerms: ["papier podkładowy", "liner"],
      },
      {
        icon: Sticker,
        slug: "klej",
        name: "Klej (warstwa klejąca)",
        def: "Klej to warstwa pod folią, która utrzymuje naklejkę na powierzchni. W naklejkach MałeNaklejki jest mocny, dobrze trzyma na gładkich powierzchniach i po odklejeniu nie zostawia śladów. Nie jest jednak przystosowany do wielokrotnego przeklejania.",
        matchTerms: ["mocny klej", "warstwa klejąca"],
      },
      {
        icon: ShieldCheck,
        slug: "naklejki-latwo-usuwalne",
        name: "Naklejki łatwo usuwalne (bez śladów)",
        def: "Folia z mocnym klejem, która gwarantuje niezwykle trwałe przyleganie na gładkich powierzchniach, ale po podważeniu schodzi w jednym kawałku bez zostawiania trudnych do zmycia śladów. Ważne: nie oznacza to 'kleju repozycjonowalnego' - raz naklejona naklejka nie nadaje się do wielokrotnego przyklejania.",
        matchTerms: ["bez śladów", "nie zostawia śladów"],
      },
      {
        icon: Layers,
        slug: "laminat",
        name: "Laminat",
        def: "Laminat to dodatkowa przezroczysta warstwa ochronna, którą w niektórych technologiach nakłada się na wydruk dla większej odporności i połysku. W naklejkach MałeNaklejki odporność na wodę, promieniowanie UV i zadrapania zapewnia trwała folia winylowa, na której drukujemy.",
        matchTerms: ["laminat"],
      },
    ],
  },
  {
    id: "kolory",
    heading: "Druk, rozdzielczość i kolory",
    intro:
      "Pojęcia, które decydują o ostrości i wierności kolorów wydruku. Naklejki MałeNaklejki drukujemy w rozdzielczości 300 DPI w pełnym kolorze.",
    terms: [
      {
        icon: Printer,
        slug: "dpi",
        name: "DPI (rozdzielczość druku, 300 DPI)",
        def: "DPI (dots per inch) to liczba punktów druku na cal - im wyższa, tym ostrzejszy i bardziej szczegółowy wydruk. Naklejki MałeNaklejki drukujemy w 300 DPI. Dla małych naklejek poniżej 5 cm warto przygotować plik właśnie w 300 DPI, żeby krawędzie i detale były wyraźne.",
        matchTerms: ["300 dpi", "dpi"],
      },
      {
        icon: Palette,
        slug: "cmyk",
        name: "CMYK",
        def: "CMYK to tryb kolorów używany w druku, oparty na czterech farbach: cyjan, magenta, żółty i czarny. Pliki przygotowane w CMYK najwierniej oddają kolory na wydruku. Jeśli wgrasz plik w RGB, zostanie przeliczony na CMYK, co może lekko zmienić najbardziej jaskrawe odcienie.",
        matchTerms: ["cmyk"],
      },
      {
        icon: Monitor,
        slug: "rgb",
        name: "RGB",
        def: "RGB to tryb kolorów ekranów, oparty na świetle czerwonym, zielonym i niebieskim. Grafika z telefonu czy monitora jest zwykle w RGB. Przy druku kolory RGB są konwertowane na CMYK, dlatego bardzo intensywne neony na wydruku mogą wyglądać nieco spokojniej niż na ekranie.",
        matchTerms: ["rgb"],
      },
    ],
  },
  {
    id: "pliki",
    heading: "Pliki graficzne i format arkusza",
    intro:
      "Jak przygotować grafikę i co dzieje się z nią w kreatorze. Dobry plik to najkrótsza droga do ostrej naklejki wyciętej dokładnie po obrysie.",
    terms: [
      {
        icon: FileImage,
        slug: "png-kanal-alfa",
        name: "PNG i kanał alfa (przezroczyste tło)",
        def: "PNG to format pliku, który zapisuje przezroczystość dzięki tak zwanemu kanałowi alfa. Grafika PNG z przezroczystym tłem to najlepszy materiał do cięcia po obrysie - kreator od razu rozpoznaje kontur motywu i nie musi zgadywać, gdzie kończy się tło.",
        matchTerms: ["kanał alfa", "przezroczyste tło"],
      },
      {
        icon: Shapes,
        slug: "wektor-i-raster",
        name: "Wektor i raster",
        def: "Raster (JPG, PNG) to obraz zbudowany z pikseli - zbyt mocno powiększony zaczyna się rozmywać. Wektor (SVG, PDF) opisuje kształty matematycznie, więc skaluje się bez utraty jakości. Do naklejek nadają się oba formaty, ale przy dużym powiększeniu grafiki wektorowe dają najostrzejsze krawędzie.",
        matchTerms: ["plik wektorowy", "grafika rastrowa"],
      },
      {
        icon: Square,
        slug: "arkusz-a4",
        name: "Arkusz A4",
        def: "Arkusz A4 (21 x 29,7 cm) to jednostka rozliczeniowa w MałeNaklejki. Płacisz stałe 49,00 zł brutto za cały arkusz, niezależnie od tego, czy umieścisz na nim jedną dużą naklejkę do 19 cm, czy kilkadziesiąt małych. Nie ma minimalnego nakładu - zamówisz nawet jeden arkusz.",
        matchTerms: ["arkusz a4", "arkusza a4"],
      },
      {
        icon: Eraser,
        slug: "usuwanie-tla",
        name: "Automatyczne usuwanie tła",
        def: "Usuwanie tła to oddzielenie głównego motywu od reszty zdjęcia, żeby naklejka nie miała prostokątnego tła. W kreatorze dzieje się to automatycznie po wgraniu zdjęcia - system odcina tło i wyznacza kontur do cięcia, bez Photoshopa i bez ręcznego wycinania.",
        matchTerms: ["usuwanie tła", "usuwa tło", "usunie tło"],
      },
    ],
    images: [
      {
        src: "/landing/slownik-naklejek/arkusz-a4-z-naklejkami-kiss-cut.jpg",
        alt: "Arkusz A4 z kilkunastoma naklejkami w stylu boho wyciętymi metodą kiss-cut - cały komplet na jednym podkładzie, obok podgląd arkusza w telefonie.",
      },
    ],
  },
  {
    id: "potoczne",
    heading: "Słownik potoczny: wlepki, fotonaklejki, etykiety",
    intro:
      "Nazwy, które klienci stosują zamiennie ze słowem naklejka. Warto wiedzieć, co dokładnie kryje się pod każdą z nich.",
    terms: [
      {
        icon: Sticker,
        slug: "wlepka-vlepka",
        name: "Wlepka / vlepka",
        def: "Wlepka (pisana też fonetycznie jako \"vlepka\") to potoczna nazwa naklejki, popularna wśród twórców, w kulturze skate i street oraz w środowisku kibicowskim. Zwykle chodzi o niewielką naklejkę z autorską grafiką lub logo, rozdawaną fanom, kibicom albo naklejaną na laptopa, deskorolkę czy notes.",
        href: "/blog/wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci",
        linkLabel: "Wlepki dla twórców",
        matchTerms: ["wlepka", "wlepki", "vlepka", "vlepki"],
      },
      {
        icon: Camera,
        slug: "fotonaklejka",
        name: "Fotonaklejka",
        def: "Fotonaklejka to naklejka zrobiona z własnego zdjęcia - pupila, rodziny, wakacji czy rysunku dziecka. Zdjęcie trafia do kreatora, system usuwa tło i wycina motyw po obrysie, a wydruk powstaje na trwałej folii winylowej.",
        href: "/fotonaklejki",
        linkLabel: "Fotonaklejki ze zdjęcia",
        matchTerms: ["fotonaklejka", "fotonaklejki"],
      },
      {
        icon: Tag,
        slug: "naklejka-a-etykieta",
        name: "Naklejka a etykieta",
        def: "Naklejka to szerokie pojęcie, obejmujące grafiki ozdobne, reklamowe i informacyjne. Etykieta to naklejka o funkcji informacyjnej - z nazwą produktu, składem czy logo na słoiku lub butelce. Powstają tak samo, na tej samej folii winylowej, a różni je przeznaczenie.",
        href: "/naklejki-dla-firm",
        linkLabel: "Naklejki dla firm",
        matchTerms: ["etykieta", "etykiety"],
      },
    ],
    images: [
      {
        src: "/landing/slownik-naklejek/wlepka-die-cut-na-etui-telefonu.jpg",
        alt: "Wlepka die-cut z kwiatkiem naklejona na etui telefonu - mała autorska naklejka wycięta po obrysie na trwałej folii winylowej.",
      },
    ],
  },
];

export const ALL_TERMS: Term[] = GLOSSARY.flatMap((g) => g.terms);

/**
 * Dopasowuje pojęcia ze słownika do treści artykułu (tytuł + markdown), żeby
 * zasilić `mentions` w schemacie `Article`/`BlogPosting` (P4.2.6). Dopasowanie
 * jest czysto tekstowe (case-insensitive substring po `matchTerms`), bez analizy
 * semantycznej - stąd limit `max`, żeby nie zalać schematu przypadkowymi trafieniami
 * w długich artykułach.
 */
export function findMentionedTerms(text: string, max = 6): Term[] {
  const haystack = text.toLowerCase();
  const matches: Term[] = [];
  for (const term of ALL_TERMS) {
    const needles = term.matchTerms ?? [term.name.split(" (")[0].toLowerCase()];
    if (needles.some((needle) => haystack.includes(needle.toLowerCase()))) {
      matches.push(term);
      if (matches.length >= max) break;
    }
  }
  return matches;
}
