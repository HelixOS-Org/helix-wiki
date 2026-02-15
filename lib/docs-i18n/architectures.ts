import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "CPU Architectures",
    "header.subtitle":
      "Three architecture backends — x86_64 (30K LoC), AArch64 (18K LoC), and RISC-V 64 (13K LoC) — sharing a unified HAL trait with architecture-specific optimizations.",
    "header.badge": "MULTI-ARCH",

    // Comparison
    "comparison.intro":
      "Side-by-side comparison of architecture support:",

    // x86_64
    "x86.intro":
      "Primary architecture with full feature support — 30,000+ lines covering APIC, SMP, 5-level paging, and TSC calibration:",

    // AArch64
    "aarch64.intro":
      "ARM 64-bit support with GICv2/v3, PSCI power management, and exception level handling:",

    // RISC-V 64
    "riscv.intro":
      "RISC-V 64-bit support with SBI runtime, PLIC/CLINT interrupt controllers, and Sv39/48/57 paging:",

    // Unified HAL
    "unified.intro":
      "All architectures implement the same HAL trait — enabling architecture-agnostic kernel code:",
  },

  fr: {
    // PageHeader
    "header.title": "Architectures CPU",
    "header.subtitle":
      "Trois backends d'architecture — x86_64 (30K lignes), AArch64 (18K lignes) et RISC-V 64 (13K lignes) — partageant un trait HAL unifié avec des optimisations spécifiques à chaque architecture.",
    "header.badge": "MULTI-ARCH",

    // Comparison
    "comparison.intro":
      "Comparaison côte à côte du support des architectures :",

    // x86_64
    "x86.intro":
      "Architecture principale avec support complet des fonctionnalités — plus de 30 000 lignes couvrant APIC, SMP, pagination à 5 niveaux et calibration TSC :",

    // AArch64
    "aarch64.intro":
      "Support ARM 64 bits avec GICv2/v3, gestion de l'alimentation PSCI et gestion des niveaux d'exception :",

    // RISC-V 64
    "riscv.intro":
      "Support RISC-V 64 bits avec runtime SBI, contrôleurs d'interruptions PLIC/CLINT et pagination Sv39/48/57 :",

    // Unified HAL
    "unified.intro":
      "Toutes les architectures implémentent le même trait HAL — permettant un code noyau agnostique de l'architecture :",
  },

  es: {
    "header.title": "Arquitecturas de CPU",
    "header.subtitle":
      "Tres backends de arquitectura — x86_64 (30K líneas), AArch64 (18K líneas) y RISC-V 64 (13K líneas) — compartiendo un trait HAL unificado con optimizaciones específicas por arquitectura.",
    "header.badge": "MULTI-ARCH",
    "comparison.intro":
      "Comparación lado a lado del soporte de arquitecturas:",
    "x86.intro":
      "Arquitectura principal con soporte completo de características — más de 30.000 líneas cubriendo APIC, SMP, paginación de 5 niveles y calibración TSC:",
    "aarch64.intro":
      "Soporte ARM de 64 bits con GICv2/v3, gestión de energía PSCI y manejo de niveles de excepción:",
    "riscv.intro":
      "Soporte RISC-V de 64 bits con runtime SBI, controladores de interrupciones PLIC/CLINT y paginación Sv39/48/57:",
    "unified.intro":
      "Todas las arquitecturas implementan el mismo trait HAL — permitiendo código del kernel agnóstico a la arquitectura:",
  },

  de: {
    "header.title": "CPU-Architekturen",
    "header.subtitle":
      "Drei Architektur-Backends — x86_64 (30K Zeilen), AArch64 (18K Zeilen) und RISC-V 64 (13K Zeilen) — mit einem einheitlichen HAL-Trait und architekturspezifischen Optimierungen.",
    "header.badge": "MULTI-ARCH",
    "comparison.intro":
      "Nebeneinander-Vergleich der Architekturunterstützung:",
    "x86.intro":
      "Primäre Architektur mit vollem Feature-Support — über 30.000 Zeilen für APIC, SMP, 5-Level-Paging und TSC-Kalibrierung:",
    "aarch64.intro":
      "ARM 64-Bit-Unterstützung mit GICv2/v3, PSCI-Energieverwaltung und Exception-Level-Handling:",
    "riscv.intro":
      "RISC-V 64-Bit-Unterstützung mit SBI-Runtime, PLIC/CLINT-Interrupt-Controllern und Sv39/48/57-Paging:",
    "unified.intro":
      "Alle Architekturen implementieren denselben HAL-Trait — ermöglicht architekturunabhängigen Kernel-Code:",
  },

  zh: {
    "header.title": "CPU 架构",
    "header.subtitle":
      "三个架构后端——x86_64（30K 行）、AArch64（18K 行）和 RISC-V 64（13K 行）——共享统一的 HAL trait，具有架构特定的优化。",
    "header.badge": "多架构",
    "comparison.intro":
      "架构支持的并排比较：",
    "x86.intro":
      "主要架构，具有完整的功能支持——30,000+ 行代码涵盖 APIC、SMP、5 级分页和 TSC 校准：",
    "aarch64.intro":
      "ARM 64 位支持，包括 GICv2/v3、PSCI 电源管理和异常级别处理：",
    "riscv.intro":
      "RISC-V 64 位支持，包括 SBI 运行时、PLIC/CLINT 中断控制器和 Sv39/48/57 分页：",
    "unified.intro":
      "所有架构实现相同的 HAL trait——使内核代码与架构无关：",
  },

  ja: {
    "header.title": "CPUアーキテクチャ",
    "header.subtitle":
      "3つのアーキテクチャバックエンド — x86_64（30K行）、AArch64（18K行）、RISC-V 64（13K行） — アーキテクチャ固有の最適化を持つ統一されたHALトレイトを共有。",
    "header.badge": "マルチアーキテクチャ",
    "comparison.intro":
      "アーキテクチャサポートの並列比較：",
    "x86.intro":
      "完全な機能サポートを備えたプライマリアーキテクチャ — APIC、SMP、5レベルページング、TSCキャリブレーションをカバーする30,000行以上：",
    "aarch64.intro":
      "GICv2/v3、PSCI電源管理、例外レベル処理を備えたARM 64ビットサポート：",
    "riscv.intro":
      "SBIランタイム、PLIC/CLINT割り込みコントローラー、Sv39/48/57ページングを備えたRISC-V 64ビットサポート：",
    "unified.intro":
      "すべてのアーキテクチャが同じHALトレイトを実装 — アーキテクチャに依存しないカーネルコードを実現：",
  },

  ko: {
    "header.title": "CPU 아키텍처",
    "header.subtitle":
      "세 가지 아키텍처 백엔드 — x86_64(30K줄), AArch64(18K줄), RISC-V 64(13K줄) — 아키텍처별 최적화를 갖춘 통합 HAL 트레이트를 공유.",
    "header.badge": "멀티 아키텍처",
    "comparison.intro":
      "아키텍처 지원의 병렬 비교:",
    "x86.intro":
      "완전한 기능 지원을 갖춘 기본 아키텍처 — APIC, SMP, 5단계 페이징, TSC 교정을 다루는 30,000줄 이상:",
    "aarch64.intro":
      "GICv2/v3, PSCI 전원 관리, 예외 레벨 처리를 갖춘 ARM 64비트 지원:",
    "riscv.intro":
      "SBI 런타임, PLIC/CLINT 인터럽트 컨트롤러, Sv39/48/57 페이징을 갖춘 RISC-V 64비트 지원:",
    "unified.intro":
      "모든 아키텍처가 동일한 HAL 트레이트를 구현 — 아키텍처에 구애받지 않는 커널 코드 가능:",
  },

  pt: {
    "header.title": "Arquiteturas de CPU",
    "header.subtitle":
      "Três backends de arquitetura — x86_64 (30K linhas), AArch64 (18K linhas) e RISC-V 64 (13K linhas) — compartilhando um trait HAL unificado com otimizações específicas por arquitetura.",
    "header.badge": "MULTI-ARCH",
    "comparison.intro":
      "Comparação lado a lado do suporte a arquiteturas:",
    "x86.intro":
      "Arquitetura principal com suporte completo de funcionalidades — mais de 30.000 linhas cobrindo APIC, SMP, paginação de 5 níveis e calibração TSC:",
    "aarch64.intro":
      "Suporte ARM de 64 bits com GICv2/v3, gerenciamento de energia PSCI e tratamento de nível de exceção:",
    "riscv.intro":
      "Suporte RISC-V de 64 bits com runtime SBI, controladores de interrupção PLIC/CLINT e paginação Sv39/48/57:",
    "unified.intro":
      "Todas as arquiteturas implementam o mesmo trait HAL — permitindo código do kernel agnóstico à arquitetura:",
  },

  ru: {
    "header.title": "Архитектуры ЦП",
    "header.subtitle":
      "Три архитектурных бэкенда — x86_64 (30K строк), AArch64 (18K строк) и RISC-V 64 (13K строк) — использующие единый HAL-трейт с архитектурно-специфичными оптимизациями.",
    "header.badge": "МУЛЬТИ-АРХИТЕКТУРА",
    "comparison.intro":
      "Сравнение поддержки архитектур бок о бок:",
    "x86.intro":
      "Основная архитектура с полной поддержкой функций — более 30 000 строк, охватывающих APIC, SMP, 5-уровневую страничную организацию и калибровку TSC:",
    "aarch64.intro":
      "Поддержка ARM 64-бит с GICv2/v3, управлением питанием PSCI и обработкой уровней исключений:",
    "riscv.intro":
      "Поддержка RISC-V 64-бит с SBI-средой выполнения, контроллерами прерываний PLIC/CLINT и страничной организацией Sv39/48/57:",
    "unified.intro":
      "Все архитектуры реализуют один и тот же HAL-трейт — обеспечивая архитектурно-независимый код ядра:",
  },

  ar: {
    "header.title": "معماريات المعالج",
    "header.subtitle":
      "ثلاث واجهات خلفية للمعمارية — x86_64 (30 ألف سطر)، AArch64 (18 ألف سطر)، و RISC-V 64 (13 ألف سطر) — تتشارك سمة HAL موحدة مع تحسينات خاصة بكل معمارية.",
    "header.badge": "متعدد المعماريات",
    "comparison.intro":
      "مقارنة جنبًا إلى جنب لدعم المعماريات:",
    "x86.intro":
      "المعمارية الأساسية مع دعم كامل للميزات — أكثر من 30,000 سطر تغطي APIC، SMP، الترحيل بـ 5 مستويات، ومعايرة TSC:",
    "aarch64.intro":
      "دعم ARM 64 بت مع GICv2/v3، إدارة الطاقة PSCI، ومعالجة مستويات الاستثناء:",
    "riscv.intro":
      "دعم RISC-V 64 بت مع بيئة تشغيل SBI، متحكمات المقاطعة PLIC/CLINT، والترحيل Sv39/48/57:",
    "unified.intro":
      "جميع المعماريات تنفذ نفس سمة HAL — مما يتيح كود نواة مستقل عن المعمارية:",
  },
};

export default content;
