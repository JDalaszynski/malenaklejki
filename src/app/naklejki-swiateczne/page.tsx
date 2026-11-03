import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ThemeLanding, type ThemeContent } from "@/components/catalog/ThemeLanding";
import { inlineLinkClass, panelClass } from "@/components/catalog/blocks";
import { getCatalogSheetsByCategory } from "@/lib/sheets/public";
import { EDIT_CTA_LABEL, SITE_URL, formatPrice, type Faq } from "@/lib/sheets/schema";
import { SHEET_PRICE, SHIPPING_PRICE, type CatalogSheet } from "@/lib/sheets/types";
import { SITE_OPEN_GRAPH } from "@/lib/siteMetadata";
import { getDesignsNoun } from "@/lib/utils/polish";

/**
 * Strona tematyczna `/naklejki-swiateczne` (etap 2 `landing-agent/strategia-gotowe-zestawy.md`).
 *
 * Rozdział intencji (§4.1): ta strona obsługuje gotowe zestawy („gotowe wzory",
 * „gotowe zestawy"), bez fraz „na zamówienie / z własnym nadrukiem" w tytule i H1.
 * Personalizacja (imiona, własne zdjęcia, etykiety od zera) zostaje w hubie
 * `/blog/naklejki-swiateczne-i-etykiety-na-prezenty`, do którego odsyła sekcja
 * o naklejkach z imieniem i zdjęciem. Fakty wyłącznie z `blog-agent/facts.md`.
 */

const PATH = "/naklejki-swiateczne";
const CATEGORY = "Święta";
const TITLE = `Naklejki świąteczne - gotowe zestawy na folii, ${SHEET_PRICE} zł`;
const DESCRIPTION = `Gotowe naklejki świąteczne, bożonarodzeniowe i zimowe na prezenty, słoiki i do planera. Arkusz A4 z folii winylowej za ${formatPrice(SHEET_PRICE)} brutto, z opcją zmiany.`;
const UPDATED = { label: "2 listopada 2026", iso: "2026-11-02T00:00:00+01:00" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    ...SITE_OPEN_GRAPH,
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

function stickerRange(sheets: CatalogSheet[]): string {
  const counts = sheets.map((sheet) => sheet.stickerCount);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  return min === max ? `${min}` : `od ${min} do ${max}`;
}

function buildFaqs(sheets: CatalogSheet[]): Faq[] {
  const range = stickerRange(sheets);

  return [
    {
      q: "Gdzie kupić gotowe naklejki świąteczne na folii winylowej?",
      a: `Gotowe zestawy naklejek świątecznych i zimowych kupisz w MałeNaklejki (malenaklejki.pl). Każdy zestaw to jeden arkusz A4 z ${range} wyciętymi naklejkami za ${formatPrice(
        SHEET_PRICE
      )} brutto, drukowany w Polsce na folii winylowej odpornej na wodę i promieniowanie UV. Zestaw zamawiasz od razu do koszyka albo otwierasz w kreatorze, żeby go dopasować. Produkcja trwa 4-5 dni robocze, a dostawa do paczkomatu InPost kosztuje ${formatPrice(
        SHIPPING_PRICE
      )}.`,
    },
    {
      q: "Czy naklejki świąteczne i zimowe są wodoodporne?",
      a: "Tak. Wszystkie gotowe zestawy drukujemy na białej folii winylowej o subtelnym połysku, odpornej na wodę i promieniowanie UV. Bez obaw nakleisz je na butelkę chłodzoną w lodówce, słoik z konfiturą, bidon, pudełko prezentowe czy laptop. Folia nie nadaje się do zmywarki - oklejone naczynia i butelki myj ręcznie.",
    },
    {
      q: "Jak dodać imię lub własne zdjęcie do gotowego zestawu świątecznego?",
      a: `Kliknij „${EDIT_CTA_LABEL}” przy wybranym wzorze. Zestaw otworzy się w kreatorze arkusza A4: usuń kilka gotowych naklejek, żeby zwolnić miejsce, i wgraj zdjęcie z telefonu (kreator sam usunie tło i wyznaczy linię cięcia) albo gotowy obrazek z imieniem przygotowany wcześniej w zewnętrznym generatorze obrazów AI (np. ChatGPT, Gemini, Midjourney) lub w darmowym programie (Canva, Word, PowerPoint). Kreator nie ma edytora tekstu. Cena zestawu po zmianach nadal wynosi ${formatPrice(
        SHEET_PRICE
      )} brutto.`,
    },
    {
      q: "Czy naklejki na prezenty dobrze trzymają się papieru pakowego i pudełek?",
      a: "Tak. Mocny klej trzyma się gładkiego papieru pakowego, torebek prezentowych, tekturowych pudełek, kopert, szkła i plastiku. Naklejkę przyklej od razu w docelowym miejscu, bo drugi raz jej nie przykleisz. Z twardych, gładkich powierzchni (np. laptopa, słoika czy kubka) odkleisz ją później bez śladów kleju. Naklejki są przeznaczone na opakowania i przedmioty - nigdy bezpośrednio na jedzenie ani na skórę.",
    },
    {
      q: "Ile trwa produkcja naklejek bożonarodzeniowych przed świętami?",
      a: `Produkcja w Polsce zajmuje 4-5 dni robocze od opłacenia zamówienia, po czym nadajemy paczkę do wybranego paczkomatu InPost (${formatPrice(
        SHIPPING_PRICE
      )}). W grudniu ruch w paczkomatach jest większy niż zwykle, dlatego świąteczne zestawy warto zamówić z zapasem czasu.`,
    },
    {
      q: "Czy w jednym zamówieniu połączę gotowe naklejki świąteczne i własny arkusz?",
      a: `Tak. Do jednego koszyka włożysz dowolną liczbę gotowych zestawów (np. naklejki bożonarodzeniowe i naklejki zimowe) oraz własne arkusze ułożone od zera w kreatorze. Każdy arkusz A4 kosztuje stałe ${formatPrice(
        SHEET_PRICE
      )} brutto bez minimalnego nakładu, a za wysyłkę do paczkomatu (${formatPrice(
        SHIPPING_PRICE
      )}) płacisz tylko raz za całą paczkę.`,
    },
    {
      q: "Czy gotowy zestaw naklejek świątecznych można zwrócić?",
      a: "Gotowy zestaw zamówiony prosto z katalogu, bez żadnych zmian w kreatorze, możesz zwrócić w ciągu 14 dni od odbioru. Zestaw zmodyfikowany w kreatorze oraz arkusze z własnych zdjęć i grafik powstają według indywidualnej specyfikacji klienta, dlatego nie podlegają zwrotowi.",
    },
  ];
}

export default async function NaklejkiSwiatecznePage() {
  const sheets = await getCatalogSheetsByCategory(CATEGORY);
  if (sheets.length === 0) notFound();

  const range = stickerRange(sheets);
  const oneSetTotal = SHEET_PRICE + SHIPPING_PRICE;
  const twoSetsTotal = SHEET_PRICE * 2 + SHIPPING_PRICE;
  const threeSetsTotal = SHEET_PRICE * 3 + SHIPPING_PRICE;

  const content: ThemeContent = {
    path: PATH,
    name: "Naklejki świąteczne",
    badge: "Gotowe wzory na Boże Narodzenie i zimę",
    h1: "Naklejki świąteczne - gotowe zestawy",
    intro: (
      <p>
        MałeNaklejki sprzedaje gotowe zestawy <strong>naklejek świątecznych</strong> i{" "}
        <strong>zimowych</strong> w formacie A4: <strong>{sheets.length} {getDesignsNoun(sheets.length)}</strong>{" "}
        ({range} wyciętych naklejek na arkuszu), drukowane w Polsce na{" "}
        <strong>folii winylowej odpornej na wodę i promieniowanie UV</strong>. Każdy zestaw kosztuje stałe{" "}
        <strong>{formatPrice(SHEET_PRICE)} brutto</strong>, produkcja trwa <strong>4-5 dni robocze</strong>,
        a gotowe <strong>naklejki bożonarodzeniowe</strong> i <strong>naklejki na prezenty</strong> zamówisz
        od ręki do paczkomatu ({formatPrice(SHIPPING_PRICE)}) albo najpierw zmienisz w kreatorze - usuniesz
        wybrane motywy i dołożysz własne zdjęcie lub imię.
      </p>
    ),
    gridHeading: "Gotowe zestawy naklejek świątecznych i zimowych",
    sections: [
      {
        id: "imie-i-zdjecie",
        heading: "Naklejki świąteczne z imieniem i własnym zdjęciem",
        body: (
          <>
            <p>
              Gotowe wzory dają Ci od ręki pierniki, renifery, śnieżynki i zimowe zwierzaki bez szukania
              plików. Jeśli oprócz nich chcesz podpisać paczki pod choinką imionami bliskich („Dla Mamy”,
              „Dla Dziadka”, „Od Mikołaja”) albo zrobić prezent ze zdjęcia pupila czy wnuków, masz dwie
              proste drogi w tym samym zamówieniu.
            </p>
            <p>
              Pierwsza: kliknij „{EDIT_CTA_LABEL}” przy wybranym zestawie, usuń kilka motywów z arkusza A4
              i wgraj na wolne miejsce własne zdjęcie (kreator sam usunie tło i wyznaczy linię cięcia po
              obrysie) albo gotową grafikę z napisem przygotowaną wcześniej w zewnętrznym generatorze
              obrazów AI (ChatGPT, Gemini, Midjourney) lub w darmowym programie (Canva, Word, PowerPoint -
              sam kreator służy do układania arkusza i nie ma edytora tekstu). Druga: zostaw gotowy zestaw
              w całości i dołóż do koszyka osobny arkusz z personalizacją - oba przyjadą w jednej paczce.
            </p>
            <p>
              Rozmiary etykiet „Dla / Od”, pomysły na podpisy i przelicznik sztuk na arkuszu A4 zebraliśmy
              w poradniku{" "}
              <Link
                href="/blog/naklejki-swiateczne-i-etykiety-na-prezenty"
                className={inlineLinkClass}
              >
                naklejki świąteczne i etykiety na prezenty z własnym nadrukiem
              </Link>
              , a same naklejki wycinane z fotografii z telefonu opisuje strona{" "}
              <Link href="/fotonaklejki" className={inlineLinkClass}>
                fotonaklejki
              </Link>
              .
            </p>
          </>
        ),
      },
      {
        id: "rachunek",
        heading: "1, 2 lub 3 zestawy w jednej paczce - koszt z dostawą",
        body: (
          <>
            <p>
              Cena zestawu jest stała ({formatPrice(SHEET_PRICE)} brutto za arkusz A4), a dostawa do
              paczkomatu InPost ({formatPrice(SHIPPING_PRICE)}) nalicza się raz na całe zamówienie. W jednej
              przesyłce wygodnie połączysz np. gotowe <strong>naklejki bożonarodzeniowe</strong> na paczki,{" "}
              <strong>naklejki zimowe</strong> ze śnieżynkami i osobny arkusz z imionami dla rodziny:
            </p>
            <div className={`${panelClass} overflow-x-auto`}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-black uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Zawartość paczki</th>
                    <th className="px-4 py-3">Zestawy A4</th>
                    <th className="px-4 py-3">Paczkomat</th>
                    <th className="px-4 py-3">Razem brutto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-semibold text-foreground">
                  <tr>
                    <td className="px-4 py-3">1 gotowy zestaw świąteczny</td>
                    <td className="px-4 py-3">{formatPrice(SHEET_PRICE)}</td>
                    <td className="px-4 py-3">{formatPrice(SHIPPING_PRICE)}</td>
                    <td className="px-4 py-3 font-black text-primary">{formatPrice(oneSetTotal)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">2 zestawy (np. gotowy świąteczny + własny z imionami)</td>
                    <td className="px-4 py-3">{formatPrice(SHEET_PRICE * 2)}</td>
                    <td className="px-4 py-3">{formatPrice(SHIPPING_PRICE)}</td>
                    <td className="px-4 py-3 font-black text-primary">{formatPrice(twoSetsTotal)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">3 zestawy (np. bożonarodzeniowy + zimowy + ze zdjęciami)</td>
                    <td className="px-4 py-3">{formatPrice(SHEET_PRICE * 3)}</td>
                    <td className="px-4 py-3">{formatPrice(SHIPPING_PRICE)}</td>
                    <td className="px-4 py-3 font-black text-primary">{formatPrice(threeSetsTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ),
      },
    ],
    uses: {
      heading: "Gdzie sprawdzą się gotowe naklejki świąteczne i zimowe",
      items: [
        {
          title: "Naklejki na prezenty, torebki i koperty",
          text: (
            <p>
              Zamiast papierowych zawieszek, które odpadają w torbie, zaklejasz papier pakowy, tekturowe
              pudełko albo kopertę z życzeniami jedną winylową naklejką z piernikiem, choinką czy
              reniferem. Klej łapie od razu gładki papier, karton i foliowe opakowania - przyklej naklejkę
              w docelowym miejscu za pierwszym razem, bo drugi raz jej nie przykleisz.
            </p>
          ),
        },
        {
          title: "Słoiki z piernikami, konfitury i domowe nalewki",
          text: (
            <p>
              Świąteczny motyw na zakrętce, puszce z ciastkami czy butelce zamienia domowy wyrób w gotowy
              upominek. Folia znosi wilgoć z lodówki i opłukanie pod kranem (myj ręcznie, bez zmywarki;
              naklejaj wyłącznie na opakowanie, nigdy bezpośrednio na jedzenie). Jeśli potrzebujesz opisów
              smaków i roczników, zobacz też{" "}
              <Link href="/etykiety-na-sloiki" className={inlineLinkClass}>
                etykiety na słoiki
              </Link>{" "}
              oraz poradnik o{" "}
              <Link
                href="/blog/naklejki-na-nalewki-domowe-jak-ozdobic-butelki-na-nalewki"
                className={inlineLinkClass}
              >
                naklejkach na nalewki domowe
              </Link>
              .
            </p>
          ),
        },
        {
          title: "Grudniowy planer, dziennik i kalendarz adwentowy",
          text: (
            <p>
              <strong>Naklejki zimowe</strong> ze śnieżynkami, kubkiem kakao, kominkiem i leśnymi motywami
              pasują do grudniowych rozkładówek w bullet journalu, świątecznych kartek DIY oraz torebek
              i pudełek kalendarza adwentowego. Każda naklejka na arkuszu A4 jest już wycięta po obrysie,
              więc odklejasz ją od podkładu bez wycinania nożyczkami.
            </p>
          ),
        },
        {
          title: "Mikołajki, bidony, zeszyty i laptop",
          text: (
            <p>
              Zestawy z reniferkami, pingwinami i bałwankami sprawdzą się jako drobny dodatek do paczek
              mikołajkowych w klasie lub przedszkolu. Dzieci mogą nakleić je na gładki bidon, śniadaniówkę,
              zeszyt albo etui - więcej o właściwościach materiału znajdziesz na stronie{" "}
              <Link href="/naklejki-foliowe" className={inlineLinkClass}>
                naklejki foliowe
              </Link>
              . Naklejki są przeznaczone na gładkie przedmioty i opakowania, nie na ubrania ani na skórę.
            </p>
          ),
        },
      ],
    },
    faqs: buildFaqs(sheets),
    faqHeading: "Naklejki świąteczne - pytania i odpowiedzi",
    updated: UPDATED,
  };

  return <ThemeLanding content={content} sheets={sheets} />;
}

