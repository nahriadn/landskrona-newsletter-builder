# 🏛️ Landskrona Stadsbibliotek – E-post & Nyhetsbrevsbyggare (Slutversion)

Ett självständigt, offline och installationsfritt drag-and-drop-verktyg för e-post och nyhetsbrev, fullt profilerat med **Landskrona stads officiella grafiska profil**, typsnitt, logotyper och integrerade **Outlook-signaturer**.

---

## 🚀 Hur personalen öppnar verktyget
1. Dubbelklicka på [`index.html`](./index.html) i valfri webbläsare (Microsoft Edge, Google Chrome eller Firefox).
2. **Ingen installation krävs:** Verktyget körs direkt lokalt från datorn eller från en gemensam nätverksmapp. Inget internetkrav för att bygga mallar.

---

## 🎨 Officiell profilering från `Landskrona DESIGN`
* **Logotyper inbäddade:**
  * **Landskrona stads liggande logotyp** (`Landskrona_liggande.png`) i sidhuvudet.
  * **Landskrona stadskrona** (`Krona_vinrod.png`) i personalens signatur och webbläsarlisten.
  * Alla logotyper är optimerade och inbäddade som säkra data-strängar så att de inte blockeras av Outlooks säkerhetsfilter.
* **Officiellt typsnitt:**
  * **Ciutadella** (Medium & Bold) inbäddat i gränssnittet och e-postmallarna.
  * Sekundärt fallback-stöd för **Euclid Circular A** och standardtypsnitt i Outlook.
* **Färgpalett:**
  * Landskrona-vinröd (`#c8102e` / `#9e0821`), kommunblå (`#004b87`) och heraldiskt guld (`#eaaa00`).
  * Familjen Helsingborg lila (`#602d8b`) för det regionala bibliotekssamarbetet.

---

## ✒️ E-postsignaturer för Outlook (App och Webbläsare)

I verktyget finns en dedikerad knapp och ett signaturblock:
* **Snabbknapp i toppen:** **"✒️ Copy Signature for Outlook"** (eller *"Kopiera Outlook-signatur"* i svenskt läge).
* **Signaturblock i sidomenyn:** Personalen kan dra in blocket **"✒️ Personal Staff Signature"** i sitt utskick eller redigera sitt namn, titel, telefonnummer och direktnummer.

### Hur personalen lägger in signaturen i Outlook:

#### 💻 I Outlook Desktop-appen:
1. Öppna verktyget och redigera namn/telefon i signaturblocket (eller använd standardmallen).
2. Klicka på **"✒️ Copy Signature for Outlook"** i verktygets toppmeny.
3. Öppna **Outlook** &rarr; klicka på **Arkiv (File)** &rarr; **Alternativ (Options)** &rarr; **E-post (Mail)** &rarr; **Signaturer (Signatures)**.
4. Skapa en ny signatur (t.ex. *"Landskrona Bibliotek"*) och klistra in med `Ctrl + V`.
5. Klicka på **Spara**! Logotypen och den röda avgränsaren förblir perfekt formaterade.

#### 🌐 I Outlook Web (Office 365 i webbläsaren):
1. Klicka på **"✒️ Copy Signature for Outlook"** i verktyget.
2. Gå till din inkorg på webben och klicka på **Kugghjulet (Inställningar)** uppe till höger.
3. Välj **E-post (Mail)** &rarr; **Skriv och svara (Compose and reply)** &rarr; **E-postsignatur**.
4. Klistra in (`Ctrl + V`) i signaturrutan och klicka på **Spara**.

---

## 📋 Översikt över funktioner i verktyget
1. **🇬🇧 EN / 🇸🇪 SV Väljare:** Växla direkt mellan engelska och svenska med krispiga SVG-flaggor.
2. **Kort-containrar:** Alla element läggs in i rena, centrerade kort med skuggor och marginaler.
3. **Fotouppladdning med autokomprimering:** Foton från datorn skalas automatiskt ner till e-postvänliga 600px JPEG så att mejlet inte klipps av i Outlook eller Gmail.
4. **Notion-stil mini-verktygsrad:** Markera text för att snabbt göra **fetstil**, *kursiv*, <u>understruken</u> eller lägga till webblänkar.
5. **Dator/Mobil-läge:** Se hur utskicket ser ut på både dator (600px) och i mobilen (375px).
6. **Ett klick till Outlook:** Klicka **"📧 Copy Email to Outlook"** och tryck `Ctrl + V` i ett tomt Outlook-mejl.
