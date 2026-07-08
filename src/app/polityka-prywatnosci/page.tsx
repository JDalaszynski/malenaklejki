import { DocLayout, DocSection } from "@/components/layout/DocLayout";
import Link from "next/link";
import { Building2, Mail, Phone, ShieldCheck, Database, Landmark, UserCheck, Eye } from "lucide-react";

export const metadata = {
  title: "Polityka Prywatności - MałeNaklejki",
  alternates: {
    canonical: "/polityka-prywatnosci",
  },
};

export default function PrivacyPolicyPage() {
  const sections: DocSection[] = [
    {
      id: "postanowienia-ogolne",
      title: "§ 1. Postanowienia ogólne",
      searchText: `Właścicielem serwisu oraz Administratorem Danych Osobowych jest: Firma Jakub Dalaszyński NIP 6972414844 REGON 544772342 Adres e-mail kontakt@malenaklejki.pl Telefon 695527166 zwany dalej Administratorem. Administrator przykłada ogromną wagę do ochrony prywatności RODO ustawa o ochronie danych osobowych.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Właścicielem serwisu oraz Administratorem Danych Osobowych jest:
          </p>
          <div className="bg-muted/40 border border-border/80 p-5 rounded-2xl my-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold not-prose shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Building2 className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Administrator / Firma</p>
                <p className="text-foreground font-black text-sm">Jakub Dalaszyński</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">NIP / REGON</p>
                <p className="text-foreground font-black text-sm">NIP: 6972414844 / REGON: 544772342</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Mail className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Adres e-mail</p>
                <a href="mailto:kontakt@malenaklejki.pl" className="text-primary hover:underline font-black text-sm">
                  kontakt@malenaklejki.pl
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Phone className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Telefon kontaktowy</p>
                <a href="tel:+48695527166" className="text-primary hover:underline font-black text-sm">
                  +48 695 527 166
                </a>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-bold italic mt-2">
            Zwanym dalej <strong>„Administratorem”</strong>.
          </p>
          <p>
            2. Administrator przykłada ogromną wagę do ochrony prywatności i poufności danych osobowych użytkowników korzystających z serwisu MałeNaklejki. Dane osobowe są przetwarzane zgodnie z przepisami Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz ustawy o ochronie danych osobowych.
          </p>
        </div>
      ),
    },
    {
      id: "cele-przetwarzania",
      title: "§ 2. Rodzaj, cele i podstawy prawne przetwarzania danych",
      searchText: `Realizacja zamówień art 6 ust 1 lit b RODO imię nazwisko adres e-mail numer telefonu adres dostawy ulica kod pocztowy miasto kraj dane do faktury NIP nazwa firmy adres. Obsługa płatności Przelewy24. Przetwarzanie grafik Firebase Storage Google Cloud EMEA Limited UE kontur cięcia linia cięcia. Obowiązki prawne podatkowo-księgowe art 6 ust 1 lit c RODO faktura księgowość. Ustalenie dochodzenie obrona przed roszczeniami art 6 ust 1 lit f RODO. Analiza statystyki ruchu na stronie Google Analytics 4 Vercel Analytics zgoda art 6 ust 1 lit a RODO.`,
      content: (
        <div className="space-y-6">
          <p>Przetwarzamy dane osobowe użytkowników w następujących celach:</p>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-card border border-border/80 p-5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-bold text-xs">1</span>
                </div>
                <h4 className="font-black text-foreground text-sm">Realizacja zamówień (art. 6 ust. 1 lit. b RODO)</h4>
              </div>
              <ul className="text-sm space-y-1 pl-9">
                <li><strong className="text-primary">Zakres danych:</strong> imię, nazwisko, adres e-mail, numer telefonu, adres dostawy (ulica, kod pocztowy, miasto, kraj), dane do faktury (NIP, nazwa firmy, adres).</li>
                <li><strong className="text-primary">Cel:</strong> przyjęcie zamówienia, weryfikacja płatności, produkcja spersonalizowanych naklejek oraz dostawa pod wskazany adres.</li>
              </ul>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-bold text-xs">2</span>
                </div>
                <h4 className="font-black text-foreground text-sm">Obsługa płatności (art. 6 ust. 1 lit. b RODO)</h4>
              </div>
              <p className="text-sm pl-9">
                Płatności online realizowane są przez zewnętrznego operatora <strong>Przelewy24</strong>. Administrator nie przechowuje i nie ma bezpośredniego dostępu do danych kart płatniczych ani haseł bankowych.
              </p>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-bold text-xs">3</span>
                </div>
                <h4 className="font-black text-foreground text-sm">Przetwarzanie grafik użytkownika (art. 6 ust. 1 lit. b RODO)</h4>
              </div>
              <p className="text-sm pl-9">
                Wgrywane przez Klienta grafiki są zapisywane w chmurze <strong>Firebase Storage</strong> (serwery Google w UE). Pliki te są używane wyłącznie do wyznaczenia linii cięcia, edycji obrazu w kreatorze oraz wydrukowania zamówionych naklejek.
              </p>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-bold text-xs">4</span>
                </div>
                <h4 className="font-black text-foreground text-sm">Obowiązki prawne i podatkowo-księgowe (art. 6 ust. 1 lit. c RODO)</h4>
              </div>
              <p className="text-sm pl-9">
                <strong className="text-primary">Cel:</strong> wystawianie faktur, prowadzenie księgowości oraz przechowywanie dokumentacji podatkowej zgodnie z prawem polskim.
              </p>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-bold text-xs">5</span>
                </div>
                <h4 className="font-black text-foreground text-sm">Ustalenie, dochodzenie i obrona przed roszczeniami (art. 6 ust. 1 lit. f RODO)</h4>
              </div>
              <p className="text-sm pl-9">
                <strong className="text-primary">Cel:</strong> prawnie uzasadniony interes Administratora polegający na ochronie własnych praw.
              </p>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-primary font-bold text-xs">6</span>
                </div>
                <h4 className="font-black text-foreground text-sm">Analiza ruchu i statystyki (art. 6 ust. 1 lit. a RODO - dobrowolna zgoda)</h4>
              </div>
              <ul className="text-sm space-y-1 pl-9">
                <li><strong className="text-primary">Zakres danych:</strong> identyfikator online (Client ID), adres IP, przybliżona lokalizacja geograficzna, parametry techniczne urządzenia i przeglądarki, zachowanie w serwisie.</li>
                <li><strong className="text-primary">Cel:</strong> badanie ruchu na stronie, optymalizacja kreatora naklejek pod kątem użyteczności oraz weryfikacja skuteczności działań marketingowych przy użyciu narzędzi Google Analytics 4 oraz Vercel Analytics.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "okres-przechowywania",
      title: "§ 3. Okres przechowywania danych",
      searchText: `realizacja umowy przedawnienie roszczeń 6 lat okres wymagany przepisami prawa podatkowego 5 lat. pliki graficzne projekty naklejek automatycznie usuwane 30 dni od zrealizowania zamówienia reklamacji. dane analityczne pliki cookies Polityka Cookies.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Dane związane z realizacją zamówienia przechowywane są przez okres niezbędny do realizacji umowy, a po tym czasie przez okres przedawnienia roszczeń (co do zasady 6 lat) oraz okres wymagany przepisami prawa podatkowego (5 lat od końca roku podatkowego).
          </p>
          <p>
            2. Pliki graficzne (projekty naklejek) wgrane przez użytkownika są automatycznie usuwane lub archiwizowane do usunięcia w okresie 30 dni od momentu zrealizowania zamówienia, chyba że przechowywanie jest konieczne do obsługi ewentualnych reklamacji.
          </p>
          <p>
            3. Dane przetwarzane w celach analitycznych lub technicznych (w tym pliki cookies) przechowywane są zgodnie z czasem ich wygaśnięcia zapisanym w plikach cookies (szczegóły w Polityce Cookies).
          </p>
        </div>
      ),
    },
    {
      id: "odbiorcy-danych",
      title: "§ 4. Odbiorcy danych osobowych",
      searchText: `odbiorcy danych osobowych podmioty trzecie. Firebase Google Cloud EMEA Limited bezpieczne przechowywanie danych bazy Storage. Przelewy24 PayPro SA obsługa płatności. InPost sp z o o etykiety nadawcze wysyłka kurier. księgowość informatyczne. Google Analytics 4 Google Ireland Limited Vercel Inc.`,
      content: (
        <div className="space-y-4">
          <p>W celu prawidłowego działania serwisu i realizacji zamówień dane osobowe mogą być przekazywane zaufanym podmiotom trzecim:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/40 border border-border/80 p-4 rounded-2xl flex gap-3">
              <Database className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground text-sm">Firebase (Google)</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Bezpieczne przechowywanie danych w bazie danych oraz projektów graficznych w chmurze Storage (serwery w UE).
                </p>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/80 p-4 rounded-2xl flex gap-3">
              <Landmark className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground text-sm">Przelewy24 (PayPro SA)</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Bezpieczne procesowanie transakcji płatniczych, przelewów internetowych, BLIK oraz kart płatniczych.
                </p>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/80 p-4 rounded-2xl flex gap-3">
              <UserCheck className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground text-sm">InPost & Kurierzy</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Firmy spedycyjne odpowiedzialne za generowanie etykiet przewozowych oraz fizyczną dostawę paczki.
                </p>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/80 p-4 rounded-2xl flex gap-3">
              <Eye className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground text-sm">Partnerzy operacyjni</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Podmioty świadczące dla nas certyfikowane usługi księgowe, prawne oraz wsparcie IT.
                </p>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/80 p-4 rounded-2xl flex gap-3">
              <Database className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground text-sm">Google Ireland Limited</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Dostawca usług analitycznych Google Analytics 4. Dane przesyłane są w sposób w pełni zgodny z mechanizmem Google Consent Mode V2.
                </p>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/80 p-4 rounded-2xl flex gap-3">
              <Database className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground text-sm">Vercel Inc.</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Dostawca usług hostingowych oraz anonimowego narzędzia do statystyk i analityki wydajnościowej Vercel Analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "prawa-osob",
      title: "§ 5. Prawa osób, których dane dotyczą",
      searchText: `Prawa osób których dane dotyczą. dostęp do danych kopia sprostowanie usunięcie prawo do bycia zapomnianym ograniczenie przetwarzania przenoszenie sprzeciw cofnięcie zgody skarga do UODO Prezesa Urzędu Ochrony Danych Osobowych. kontakt mailowy kontakt@malenaklejki.pl.`,
      content: (
        <div className="space-y-4">
          <p>Każdej osobie, której dane przetwarzamy, przysługuje prawo do:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm font-semibold pl-4 list-disc text-primary">
            <li>
              <span className="text-foreground font-medium">Dostępu do swoich danych oraz otrzymania ich kopii</span>
            </li>
            <li>
              <span className="text-foreground font-medium">Sprostowania (poprawiania) swoich danych</span>
            </li>
            <li>
              <span className="text-foreground font-medium">Usunięcia danych („prawo do bycia zapomnianym”)</span>
            </li>
            <li>
              <span className="text-foreground font-medium">Ograniczenia przetwarzania danych</span>
            </li>
            <li>
              <span className="text-foreground font-medium">Przenoszenia swoich danych osobowych</span>
            </li>
            <li>
              <span className="text-foreground font-medium">Wniesienia sprzeciwu wobec przetwarzania</span>
            </li>
            <li>
              <span className="text-foreground font-medium">Cofnięcia zgody w dowolnym momencie</span>
            </li>
            <li>
              <span className="text-foreground font-medium">Wniesienia skargi do Prezesa UODO</span>
            </li>
          </ul>
          <p className="mt-4 pt-2">
            W celu realizacji swoich praw prosimy o kontakt pod adresem:{" "}
            <a href="mailto:kontakt@malenaklejki.pl" className="text-primary hover:underline font-bold">
              kontakt@malenaklejki.pl
            </a>.
          </p>
        </div>
      ),
    },
    {
      id: "cookies-profilowanie",
      title: "§ 6. Pliki Cookies i Profilowanie",
      searchText: `pliki cookies ciasteczka koszyk sesja użytkownika Polityka Cookies. nie stosuje zautomatyzowanego podejmowania decyzji profilowanie.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Serwis wykorzystuje pliki cookies (ciasteczka) w celu zapewnienia prawidłowego działania (np. przechowywanie koszyka, sesja użytkownika), analizy ruchu oraz dopasowania treści.
          </p>
          <p>
            2. Szczegółowe informacje o rodzajach stosowanych plików cookies, ich celach oraz metodach zarządzania nimi (w tym wycofania zgody) znajdują się w dedykowanej{" "}
            <Link href="/pliki-cookies" className="text-primary font-bold hover:underline">
              Polityce Cookies
            </Link>.
          </p>
          <p>
            3. Serwis nie stosuje zautomatyzowanego podejmowania decyzji, w tym profilowania wywołującego skutki prawne dla użytkowników.
          </p>
        </div>
      ),
    },
  ];

  return (
    <DocLayout
      title="Polityka Prywatności"
      description="Zasady przetwarzania i ochrony danych osobowych użytkowników korzystających z serwisu MałeNaklejki."
      lastUpdated="14 czerwca 2026 r."
      activeTab="polityka-prywatnosci"
      sections={sections}
    />
  );
}
