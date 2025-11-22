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

1) Shadcn token’ları tanımsız: `bg-primary`, `text-primary-foreground`, `ring-ring` vs. `globals.css` içinde renk teması yok; buton/switch odak + renkleri bozuk. Çözüm: Tailwind 4 `@theme` ile temel renk/semantic token seti ekle.
2) Kök rota boş: `/` yalnızca “Home” döndürüyor; sidebar’da aktif state yok. Çözüm: `/dashboard`’a redirect veya aynı içeriği render et.
3) Switch state hatalı: Wi‑Fi kartındaki ve Security sayfasındaki Switch’ler sabit `checked` ile render ediliyor, handler yok; kullanıcı tıklasa da değişmez ve React uyarı verir. Çözüm: State’e bağla veya `disabled/readOnly` yapıp açıklama ekle.

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
