import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Polityka Prywatności - MałeNaklejki",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full prose dark:prose-invert text-justify leading-relaxed">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-foreground">Polityka Prywatności</h1>
        <p className="text-xs text-muted-foreground mb-10 text-center font-bold">Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}</p>

        <h2>§ 1. Postanowienia ogólne</h2>
        <ol>
          <li>
            Właścicielem serwisu oraz Administratorem Danych Osobowych jest:
            <div className="bg-card border border-border/60 p-4 rounded-2xl my-4 space-y-1 text-sm font-semibold not-prose">
              <p>Firma: <span className="text-primary font-bold">Jakub Dalaszyński</span></p>
              <p>NIP: <span className="text-primary font-bold">6972414844</span></p>
              <p>REGON: <span className="text-primary font-bold">544772342</span></p>
              <p>Adres e-mail: <span className="text-primary font-bold">kontakt@malenaklejki.pl</span></p>
              <p>Telefon: <span className="text-primary font-bold">695527166</span></p>
            </div>
            zwany dalej <strong>„Administratorem”</strong>.
          </li>
          <li>Administrator przykłada ogromną wagę do ochrony prywatności i poufności danych osobowych użytkowników korzystających z serwisu MałeNaklejki. Dane osobowe są przetwarzane zgodnie z przepisami Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz ustawy o ochronie danych osobowych.</li>
        </ol>

        <h2>§ 2. Rodzaj, cele i podstawy prawne przetwarzania danych</h2>
        <p>Przetwarzamy dane osobowe użytkowników w następujących celach:</p>
        <ol>
          <li>
            <strong>Realizacja zamówień (art. 6 ust. 1 lit. b RODO):</strong>
            <ul>
              <li>Zakres danych: imię, nazwisko, adres e-mail, numer telefonu, adres dostawy (ulica, kod pocztowy, miasto, kraj), ewentualnie dane do faktury (NIP, nazwa firmy, adres).</li>
              <li>Cel: przyjęcie zamówienia, weryfikacja płatności, produkcja spersonalizowanych naklejek oraz dostawa pod wskazany adres.</li>
            </ul>
          </li>
          <li>
            <strong>Obsługa płatności (art. 6 ust. 1 lit. b RODO):</strong>
            <ul>
              <li>Płatności online realizowane są przez zewnętrznego operatora <strong>Stripe</strong>. Administrator nie przechowuje i nie ma bezpośredniego dostępu do danych kart płatniczych ani haseł bankowych.</li>
            </ul>
          </li>
          <li>
            <strong>Przetwarzanie grafik użytkownika (art. 6 ust. 1 lit. b RODO):</strong>
            <ul>
              <li>Wgrywane przez Klienta grafiki są zapisywane w chmurze <strong>Firebase Storage</strong> (serwery Google w UE). Pliki te są używane wyłącznie do wyznaczenia linii cięcia, edycji obrazu w kreatorze oraz wydrukowania zamówionych naklejek.</li>
            </ul>
          </li>
          <li>
            <strong>Wypełnienie obowiązków prawnych i podatkowo-księgowych (art. 6 ust. 1 lit. c RODO):</strong>
            <ul>
              <li>Cel: wystawianie faktur, prowadzenie księgowości oraz przechowywanie dokumentacji podatkowej zgodnie z prawem polskim.</li>
            </ul>
          </li>
          <li>
            <strong>Ustalenie, dochodzenie i obrona przed roszczeniami (art. 6 ust. 1 lit. f RODO):</strong>
            <ul>
              <li>Cel: prawnie uzasadniony interes Administratora polegający na ochronie własnych praw.</li>
            </ul>
          </li>
        </ol>

        <h2>§ 3. Okres przechowywania danych</h2>
        <ol>
          <li>Dane związane z realizacją zamówienia przechowywane są przez okres niezbędny do realizacji umowy, a po tym czasie przez okres przedawnienia roszczeń (co do zasady 6 lat) oraz okres wymagany przepisami prawa podatkowego (5 lat od końca roku podatkowego).</li>
          <li>Pliki graficzne (projekty naklejek) wgrane przez użytkownika są automatycznie usuwane lub archiwizowane do usunięcia w okresie 30 dni od momentu zrealizowania zamówienia, chyba że przechowywanie jest konieczne do obsługi ewentualnych reklamacji.</li>
          <li>Dane przetwarzane w celach analitycznych lub technicznych (w tym pliki cookies) przechowywane są zgodnie z czasem ich wygaśnięcia zapisanym w plikach cookies (szczegóły w Polityce Cookies).</li>
        </ol>

        <h2>§ 4. Odbiorcy danych osobowych</h2>
        <p>W celu prawidłowego działania serwisu i realizacji zamówień dane osobowe mogą być przekazywane zaufanym podmiotom trzecim:</p>
        <ul>
          <li><strong>Firebase (Google Cloud EMEA Limited)</strong> – w celu bezpiecznego przechowywania danych w bazie oraz plików graficznych w Storage.</li>
          <li><strong>Stripe Payments Europe, Ltd.</strong> – w celu bezpiecznej obsługi płatności elektronicznych.</li>
          <li><strong>InPost sp. z o.o.</strong> oraz inne firmy kurierskie/spedycyjne – w celu wygenerowania etykiety nadawczej i dostarczenia przesyłki.</li>
          <li>Podmioty świadczące usługi księgowe, prawne i informatyczne dla Administratora.</li>
        </ul>

        <h2>§ 5. Prawa osób, których dane dotyczą</h2>
        <p>Każdej osobie, której dane przetwarzamy, przysługuje prawo do:</p>
        <ul>
          <li>Dostępu do swoich danych osobowych oraz otrzymania ich kopii.</li>
          <li>Sprostowania (poprawiania) swoich danych.</li>
          <li>Usunięcia danych („prawo do bycia zapomnianym”) – o ile nie zachodzą inne podstawy prawne wykluczające to prawo (np. obowiązek przechowywania dokumentów księgowych).</li>
          <li>Ograniczenia przetwarzania danych.</li>
          <li>Przenoszenia danych.</li>
          <li>Wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie.</li>
          <li>Cofnięcia zgody w dowolnym momencie (jeśli przetwarzanie odbywało się na podstawie zgody).</li>
          <li>Wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO), jeśli uzna, że przetwarzanie jej danych narusza RODO.</li>
        </ul>
        <p>W celu realizacji swoich praw prosimy o kontakt pod adresem: <strong>kontakt@malenaklejki.pl</strong>.</p>

        <h2>§ 6. Pliki Cookies i Profilowanie</h2>
        <ol>
          <li>Serwis wykorzystuje pliki cookies (ciasteczka) w celu zapewnienia prawidłowego działania (np. przechowywanie koszyka, sesja użytkownika), analizy ruchu oraz dopasowania treści.</li>
          <li>Szczegółowe informacje o rodzajach stosowanych plików cookies, ich celach oraz metodach zarządzania nimi (w tym wycofania zgody) znajdują się w dedykowanej <Link href="/pliki-cookies" className="text-primary font-bold hover:underline">Polityce Cookies</Link>.</li>
          <li>Serwis nie stosuje zautomatyzowanego podejmowania decyzji, w tym profilowania wywołującego skutki prawne dla użytkowników.</li>
        </ol>
      </main>

      <Footer />
    </div>
  );
}
