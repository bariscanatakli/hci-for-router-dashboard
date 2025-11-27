# AGENTS.md — Router Dashboard Project (HCI + Next.js)

Bu dosya, projede **multi-agent pipeline**’ı tanımlar.  
Ana aktörler:

- **Copilot** (IDE içi inline kod asistanı)
- **Codex / ChatGPT (GPT-5.1 Thinking)** (mimari + planlayıcı + yüksek seviye codegen)

Amaç: Router Dashboard projesini, HCI prensiplerine uygun, modüler ve sürdürülebilir şekilde geliştirmek.

---

## 0. Proje Özeti

**Hedef:**  
Next.js + TypeScript + Tailwind + Shadcn UI ile, HCI odaklı bir **Router Management Dashboard** geliştirmek.

**Ana Modüller:**

- Dashboard (Overview)
- Devices (Cihaz Yönetimi)
- Wi-Fi Management
- Security / Firewall
- Performance Monitoring
- System / Firmware
- Advanced Settings

**Temel HCI İlkeleri:**

- Düşük bilişsel yük
- Görev odaklı akışlar (task-based UX)
- Net görsel hiyerarşi (card-based layout)
- Nielsen heuristics uyumu
- Responsive, performanslı arayüz

---

## 1. Agent Rolleri

Bu repoda **iki ana agent** varsayılır:

1. **PLANNER & ARCHITECT Agent (Codex / ChatGPT)**
2. **IMPLEMENTER Agent (GitHub Copilot / IDE Copilot)**

Ek olarak, Codex tarafında alt-roller:

- **REVIEWER Agent**
- **TESTER Agent**
- **DOCS Agent**
- **CONTINUOUS IMPROVER** (Shneiderman/heuristic döngü)

### 1.1. PLANNER & ARCHITECT (Codex / ChatGPT)

Sorumluluklar:

- Genel mimari tasarım, klasör yapısı, modülerleşme
- Roadmap ve task breakdown üretimi/güncellenmesi
- HCI gereksinimlerini teknik tasarıma dönüştürme
- Komple dosya iskeletleri, boilerplate’ler üretme
- Complex komponentlerin ilk versiyonlarını yazma
- API sözleşmelerini ve tipleri tanımlama

Girdi:

- `ROADMAP.md`
- `AGENTS.md`
- Kullanıcı prompt’ları (yüksek seviye)

Çıktı:

- Dosya yapısı önerileri
- Komple component/route iskeletleri
- Design system tanımları
- HCI kararlarının teknik karşılığı

---

### 1.2. IMPLEMENTER (GitHub Copilot)

Sorumluluklar:

- PLANNER’ın verdiği iskelet ve tasarımları detaylandırmak
- Inline kod tamamlama, ufak refactor, hata düzeltme
- TypeScript tiplerini düzeltmek
- Styling detaylarını doldurmak
- Küçük testler ve helper fonksiyonlar üretmek

Girdi:

- Mevcut kod üzerinde yapılan değişiklikler
- Yorum satırları ve TODO’lar
- Fonksiyon/komponent imzaları

Çıktı:

- Detaylı implementasyon
- Ufak test ve refactor’ler
- Kod kalitesini yükselten öneriler

---

### 1.3. REVIEWER (Codex / ChatGPT)

Sorumluluklar:

- PR diff’lerini incelemek
- HCI uyumu, kod okunabilirliği, mimari tutarlılık değerlendirmesi
- Refactor ve iyileştirme önerileri
- Naming, component ayrışması, prop tasarımı geri bildirimi

Aktif bulgular (çözülecek sırada):

- [x] S3: GuidedTour highlight kutusu geniş/büyük hedeflerde ortalanmadığı için hedefin sadece sol üstü parlıyor; highlight dikdörtgenini hedefin merkezine oturtacak şekilde yeniden hesapla. (src/components/auth/GuidedTour.tsx)
- [x] S7/S3: GuidedTour açıkken arka plan etkileşimleri ve scroll tamamen açık kalıyor (pointer-events-none, focus trap yok); tur modunda sayfayı inert hâle getir, odağı bubble içinde kilitle ve kapatınca önceki odağı geri ver. (src/components/auth/GuidedTour.tsx)
- [x] S2/S3: Performance grafikleri (BandwidthChart, LatencyChart) sadece mouse hover ile değer gösteriyor, barlar odaklanabilir değil; klavye erişilebilirliği için tabIndex/onFocus, ok tuşlarıyla gezinme ve aria-live özetleri ekle. (src/components/performance/BandwidthChart.tsx, src/components/performance/LatencyChart.tsx)
- [x] S3/S4: Wi‑Fi sayfasında (basic + expert) kaydetme/geri alma işlemleri için daha güçlü geri bildirim (saving, success, error) ve inline status chip ekle.
- [x] S3/S4: Security save akışı için “Saving…” göstergesi ve son kaydetme zamanı çipi ekle; hata durumunda belirgin uyarı göster.
- [x] S3: PortForwardWizard ve Devices tablo boş/edge state’lerine CTA + yönlendirici metin ekle (örn. ilk kural ekle, filtreleri temizle).

Topbar / Navbar TODO’ları (Shneiderman odaklı):
- [x] Bildirim menüsü (S3 geri bildirim) — mock feed + durum ikonları
- [x] Arama alanı (S2 kısayol, S8 hafıza) — hızlı link/suggestion ve küçük ekran erişimi
- [x] “Network stable” durumu (S3 geri bildirim) — açılır detaylı bağlantı sağlığı
- [x] “Live Monitor” aksiyonu (S7 kontrol) — ilgili sayfaya geçiş veya modal
- [x] Settings ikonu (S7 kontrol) — System/Settings sayfasına bağlantı

Shneiderman 8 Altın Kural aksiyon listesi:
- [x] S1 Tutarlılık: Mobilde hızlı nav butonu/CTA eklendi (Topbar nav menüsü içinde “Go to Dashboard”).
- [x] S2 Kısayollar: Cmd/Ctrl+K ile arama açılıyor; odak/blur yönetimi ve kompakt öneri paneli.
- [x] S3 Geri bildirim: Topbar aksiyonlarına toast/feedback eklendi (bildirim, network status, live monitor, settings).
- [x] S4 Diyalog kapanışı: Device detail dialog aksiyonlarında kısa teyit mesajı gösteriliyor.
- [x] S5 Hata önleme: Wi‑Fi formunda SSID/şifre doğrulaması ve inline hatalar; Port forward’da IP/port doğrulaması ve inline hatalar.
- [x] S6 Geri alınabilirlik: Port forward silme için Undo eklendi.
- [x] S7 Kullanıcı kontrolü: Settings/Live Monitor linkleri belirgin, network badge detay dropdown, mobil nav erişimi güçlendirildi.
- [x] S8 Hafıza yükü: Arama paneli sadeleştirildi, öneriler kısa etiketlerle gösteriliyor.

Yeni TODO’lar:
- [x] Destructive aksiyonlarda onay modalı (ör. port forward silme, reboot vb.) + başarı/hata geri bildirimi.
- [x] UI bileşenlerine “i” hover yardım rozetleri ekle; tooltip içinde ne yaptığı ve `data-hci` etiketiyle hangi HCI öğesi olduğu belirtilecek.
- [x] Topbar’a kullanıcı menüsü (signed-in, logout) taşı, sayfa içi banner’ı temizle; Guided Tour tetikleyicisini Topbar’da tut.
- [x] Arama panelinde Dashboard/Dashboard overview tekrarını gider.
- [x] Varsayılan kimlik bilgilerini admin/admin yap; giriş sonrası şifre değiştirme uyarısı + modal ekle, Skip sonrası sayfa uyarısını göster.

---

### 1.4. TESTER (Codex / ChatGPT)

Sorumluluklar:

- Jest/RTL test iskeletleri yazmak
- Önemli komponentler için scenario-based testler önermek
- HCI açısından kritik akışlar için test case listesi üretmek

---

### 1.5. DOCS Agent (Codex / ChatGPT)

Sorumluluklar:

- `README.md`, `ARCHITECTURE.md`, `API_SPEC.md`, `DESIGN_DECISIONS.md` dokümanlarını yazmak ve güncellemek
- HCI raporu ve UX kararlarını belgelemek
- Developer onboarding rehberi oluşturmak

---

## 2. Multi-Agent Pipeline

Bu pipeline, Copilot ve Codex’in **birlikte, sırayla** çalışması için tasarlanmıştır.

### 2.0. Shneiderman 8 altın kurala dayalı sürekli iyileştirme döngüsü (Continuous Improver)

Amaç: Her iterasyonda UI/UX ve kodu Shneiderman’ın 8 kuralına göre iyileştirip PR’a hazır hale getirmek.

Kural referansları (kısa):
1) Tutarlılık
2) Sık kullanılan işlemler için kısayol
3) Bilgilendirici geri bildirim
4) Diyalog kapanışı/akış sonlandırma
5) Hata önleme ve basit hata mesajı
6) Geri alınabilirlik (undo/iptal)
7) Kullanıcı kontrolü (locus of control)
8) Kısa süreli hafıza yükünü azaltma

Döngü adımları:
1. **Review (REVIEWER)**: Son değişiklikleri Shneiderman + Nielsen heuristics ile tarar; bulguları “Aktif bulgular” altına kural etiketi (S1..S8) ve öncelik ile ekler.
2. **Plan (PLANNER)**: Bulguları “Quick fix” (≤30 dk) ve “Deep fix” (>30 dk) olarak ayırır; etki/efor notu düşer.
3. **Implement (IMPLEMENTER)**: Önce quick, sonra deep fixes. UI değişimlerinde kural referansını kısa yorumla belirt (örn: `// S8: hafıza yükünü azalt`).
4. **Self-test (TESTER)**: `npm run lint` + hızlı UI checklist (odak görünür mü, boş/bozuk state var mı, geri bildirim var mı).
5. **Docs (DOCS)**: AGENTS.md “Aktif bulgular” güncelle; gerekiyorsa DESIGN_DECISIONS.md veya README.md’ye kısa not ekle.
6. **Branch & Commit**: `git checkout -b hci-improve/<slug>`; commit mesajı `chore(hci): <slug>` veya `feat(hci): <slug>`.
7. **PR Hazırlığı**: `git push -u origin hci-improve/<slug>`; PR açıklamasında kural referansları ve test özeti.
8. **Loop**: PR sonrası yeniden Review aşamasına dön.

Komut şablonu (manuel tetik):
- `git checkout -b hci-improve/<slug>`
- `npm run lint`
- `git commit -am "chore(hci): <slug>"`
- `git push -u origin hci-improve/<slug>`

### 2.1. Feature Pipeline (Yeni Özellik)

1. **PLAN (Codex – PLANNER)**

   - Kullanıcı: “Bu feature için plan çıkar” şeklinde Codex’e prompt verir.
   - Çıktılar:
     - Task breakdown (Markdown checklist)
     - Dosya/route/component isimleri
     - Gerekirse API sözleşmesi (endpoint + tipler)

2. **SCAFFOLD (Codex – PLANNER/ARCHITECT)**

   - Yeni feature için:
     - Boş page/route component’i
     - Temel layout
     - TypeScript interface/typelar
   - Üretilen kod commit edilebilir kalitede olur, fakat detaya girmez.

3. **IMPLEMENT (Copilot – IMPLEMENTER)**

   - Geliştirici IDE’de:
     - Copilot ile boş fonksiyonları doldurur
     - UI ayrıntılarını, küçük state yönetimini yazar
     - Tailwind class’larını detaylandırır
   - Geliştirici, gerektiğinde inline prompt’lar ile Copilot’u yönlendirir.

4. **REVIEW (Codex – REVIEWER)**

   - PR diff veya dosya blokları Codex’e verilir.
   - Codex:
     - HCI tutarlılığı
     - Component decomposition
     - Naming
     - Potansiyel bug / edge case’leri işaretler.

5. **TEST (Codex – TESTER + Copilot)**

   - Codex test iskeletlerini ve senaryoları üretir.
   - Copilot bu iskeletler üzerinden daha fazla test doldurur.
   - Çalıştırma geliştirici tarafından yapılır (`npm test`, `npm run lint` vb).

6. **DOCS (Codex – DOCS)**
   - Önemli feature’lar için:
     - `DESIGN_DECISIONS.md` içine kısa not
     - `API_SPEC.md` güncellemesi (eğer yeni endpoint varsa)
     - UX/HCI notları (özellikle kritik akışlar için)

---

## 3. Dosya ve Modül Organizasyonu

Önerilen temel yapı:

```txt
src/
  app/
    (routes)
    dashboard/
      page.tsx
    devices/
      page.tsx
    wifi/
      page.tsx
    security/
      page.tsx
    performance/
      page.tsx
    system/
      page.tsx
    layout.tsx
  components/
    ui/           # shadcn-ui bileşenleri
    layout/
      Sidebar.tsx
      Topbar.tsx
    dashboard/
      InternetStatusCard.tsx
      WifiStatusCard.tsx
      DevicesSummaryCard.tsx
      SystemHealthCard.tsx
      BandwidthMiniChart.tsx
    devices/
      DeviceTable.tsx
      DeviceRow.tsx
      DeviceDetailDialog.tsx
    wifi/
      WifiForm.tsx
      GuestWifiToggle.tsx
    security/
      FirewallLevelSlider.tsx
      PortForwardWizard.tsx
    performance/
      BandwidthChart.tsx
      LatencyChart.tsx
    system/
      FirmwareCard.tsx
      RebootCard.tsx
  lib/
    api/
      client.ts
      system.ts
      wifi.ts
      devices.ts
      performance.ts
      security.ts
    types/
      system.ts
      wifi.ts
      devices.ts
      performance.ts
      security.ts
  hooks/
    useDevices.ts
    useWifi.ts
    useSystemInfo.ts
  store/
    devicesStore.ts
    uiStore.ts
```
