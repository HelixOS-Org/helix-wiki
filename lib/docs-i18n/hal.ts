import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "Hardware Abstraction Layer",
    "header.subtitle":
      "64,718 lines across 137 files — a unified trait-based abstraction over x86_64, AArch64, and RISC-V 64, covering CPU, MMU, interrupts, firmware, KASLR, and ELF relocation.",
    "header.badge": "HAL",

    // Core HAL Trait
    "hal.intro":
      "The master abstraction. Every architecture backend implements this single trait with its associated types. The kernel never touches hardware directly — it goes through the HAL:",
    "hal.features":
      "Feature flags: x86_64 (default), aarch64, riscv64, debug_reloc, validation, tlb_stats, percpu",

    // CPU Abstraction
    "cpu.intro":
      "Full CPU lifecycle management — context switching, feature detection, topology discovery, and FPU/SIMD state:",

    // MMU & Page Tables
    "mmu.intro":
      "Full virtual memory management with page flags, multi-level page tables, and TLB control. The PageFlags bitflags cover all common page attributes across architectures:",

    // Interrupt Controller
    "interrupts.intro":
      "Unified interrupt controller trait covering APIC, GIC, and PLIC — plus IPI delivery and exception classification:",

    // Firmware Interface
    "firmware.intro":
      "Abstraction over platform firmware — ACPI tables, power management, and system information:",

    // KASLR
    "kaslr.intro":
      "Kernel Address Space Layout Randomization — 847 lines of entropy collection, address randomization, and kernel relocation. Supports nokaslr and kaslr_entropy=N kernel command-line arguments:",

    // ELF Relocation Engine
    "relocation.intro":
      "Full ELF64 relocation support for Position-Independent Executables (PIE). Handles all x86_64 relocation types including GOT and PLT entries — 1,193 lines with comprehensive error handling:",

    // Architecture Backends
    "backends.intro":
      "Each architecture provides a complete implementation of the HAL traits — here's what each backend includes:",
  },

  fr: {
    // PageHeader
    "header.title": "Couche d'abstraction matérielle",
    "header.subtitle":
      "64 718 lignes réparties sur 137 fichiers — une abstraction unifiée basée sur des traits couvrant x86_64, AArch64 et RISC-V 64, incluant CPU, MMU, interruptions, firmware, KASLR et relocation ELF.",
    "header.badge": "HAL",

    // Core HAL Trait
    "hal.intro":
      "L'abstraction maîtresse. Chaque backend d'architecture implémente ce trait unique avec ses types associés. Le noyau ne touche jamais le matériel directement — il passe par le HAL :",
    "hal.features":
      "Drapeaux de fonctionnalités : x86_64 (par défaut), aarch64, riscv64, debug_reloc, validation, tlb_stats, percpu",

    // CPU Abstraction
    "cpu.intro":
      "Gestion complète du cycle de vie du CPU — changement de contexte, détection de fonctionnalités, découverte de topologie et état FPU/SIMD :",

    // MMU & Page Tables
    "mmu.intro":
      "Gestion complète de la mémoire virtuelle avec drapeaux de pages, tables de pages multi-niveaux et contrôle TLB. Les bitflags PageFlags couvrent tous les attributs de page courants à travers les architectures :",

    // Interrupt Controller
    "interrupts.intro":
      "Trait de contrôleur d'interruptions unifié couvrant APIC, GIC et PLIC — plus la livraison IPI et la classification des exceptions :",

    // Firmware Interface
    "firmware.intro":
      "Abstraction du firmware de la plateforme — tables ACPI, gestion de l'alimentation et informations système :",

    // KASLR
    "kaslr.intro":
      "Randomisation de l'espace d'adressage du noyau (KASLR) — 847 lignes de collecte d'entropie, randomisation d'adresses et relocation du noyau. Prend en charge les arguments de ligne de commande du noyau nokaslr et kaslr_entropy=N :",

    // ELF Relocation Engine
    "relocation.intro":
      "Support complet de relocation ELF64 pour les exécutables indépendants de la position (PIE). Gère tous les types de relocation x86_64 y compris les entrées GOT et PLT — 1 193 lignes avec une gestion d'erreurs complète :",

    // Architecture Backends
    "backends.intro":
      "Chaque architecture fournit une implémentation complète des traits HAL — voici ce que chaque backend inclut :",
  },

  es: {
    "header.title": "Capa de Abstracción de Hardware",
    "header.subtitle":
      "64.718 líneas en 137 archivos — una abstracción unificada basada en traits sobre x86_64, AArch64 y RISC-V 64, cubriendo CPU, MMU, interrupciones, firmware, KASLR y reubicación ELF.",
    "header.badge": "HAL",
    "hal.intro":
      "La abstracción maestra. Cada backend de arquitectura implementa este único trait con sus tipos asociados. El kernel nunca toca el hardware directamente — pasa por el HAL:",
    "hal.features":
      "Flags de características: x86_64 (predeterminado), aarch64, riscv64, debug_reloc, validation, tlb_stats, percpu",
    "cpu.intro":
      "Gestión completa del ciclo de vida del CPU — cambio de contexto, detección de características, descubrimiento de topología y estado FPU/SIMD:",
    "mmu.intro":
      "Gestión completa de memoria virtual con flags de página, tablas de páginas multinivel y control TLB. Los bitflags PageFlags cubren todos los atributos de página comunes entre arquitecturas:",
    "interrupts.intro":
      "Trait de controlador de interrupciones unificado que cubre APIC, GIC y PLIC — más entrega de IPI y clasificación de excepciones:",
    "firmware.intro":
      "Abstracción sobre firmware de plataforma — tablas ACPI, gestión de energía e información del sistema:",
    "kaslr.intro":
      "Aleatorización del espacio de direcciones del kernel (KASLR) — 847 líneas de recopilación de entropía, aleatorización de direcciones y reubicación del kernel. Soporta argumentos de línea de comandos nokaslr y kaslr_entropy=N:",
    "relocation.intro":
      "Soporte completo de reubicación ELF64 para ejecutables independientes de posición (PIE). Maneja todos los tipos de reubicación x86_64 incluyendo entradas GOT y PLT — 1.193 líneas con manejo de errores exhaustivo:",
    "backends.intro":
      "Cada arquitectura proporciona una implementación completa de los traits HAL — esto es lo que incluye cada backend:",
  },

  de: {
    "header.title": "Hardware-Abstraktionsschicht",
    "header.subtitle":
      "64.718 Zeilen in 137 Dateien — eine einheitliche Trait-basierte Abstraktion über x86_64, AArch64 und RISC-V 64, die CPU, MMU, Interrupts, Firmware, KASLR und ELF-Relokation abdeckt.",
    "header.badge": "HAL",
    "hal.intro":
      "Die Master-Abstraktion. Jedes Architektur-Backend implementiert dieses einzelne Trait mit seinen assoziierten Typen. Der Kernel greift nie direkt auf Hardware zu — er geht über den HAL:",
    "hal.features":
      "Feature-Flags: x86_64 (Standard), aarch64, riscv64, debug_reloc, validation, tlb_stats, percpu",
    "cpu.intro":
      "Vollständiges CPU-Lebenszyklusmanagement — Kontextwechsel, Feature-Erkennung, Topologieerkennung und FPU/SIMD-Zustand:",
    "mmu.intro":
      "Vollständige virtuelle Speicherverwaltung mit Seiten-Flags, mehrstufigen Seitentabellen und TLB-Steuerung. Die PageFlags-Bitflags decken alle gängigen Seitenattribute über Architekturen hinweg ab:",
    "interrupts.intro":
      "Einheitliches Interrupt-Controller-Trait, das APIC, GIC und PLIC abdeckt — plus IPI-Zustellung und Ausnahme-Klassifizierung:",
    "firmware.intro":
      "Abstraktion über Plattform-Firmware — ACPI-Tabellen, Energieverwaltung und Systeminformationen:",
    "kaslr.intro":
      "Kernel Address Space Layout Randomization — 847 Zeilen für Entropiesammlung, Adress-Randomisierung und Kernel-Relokation. Unterstützt die Kernel-Kommandozeilenargumente nokaslr und kaslr_entropy=N:",
    "relocation.intro":
      "Vollständige ELF64-Relokationsunterstützung für positionsunabhängige Executables (PIE). Behandelt alle x86_64-Relokationstypen einschließlich GOT- und PLT-Einträge — 1.193 Zeilen mit umfassender Fehlerbehandlung:",
    "backends.intro":
      "Jede Architektur bietet eine vollständige Implementierung der HAL-Traits — hier ist, was jedes Backend umfasst:",
  },

  zh: {
    "header.title": "硬件抽象层",
    "header.subtitle":
      "137 个文件中的 64,718 行代码——基于统一 trait 的抽象，覆盖 x86_64、AArch64 和 RISC-V 64，涵盖 CPU、MMU、中断、固件、KASLR 和 ELF 重定位。",
    "header.badge": "HAL",
    "hal.intro":
      "主抽象。每个架构后端使用其关联类型实现此单一 trait。内核从不直接接触硬件——它通过 HAL：",
    "hal.features":
      "特性标志：x86_64（默认）、aarch64、riscv64、debug_reloc、validation、tlb_stats、percpu",
    "cpu.intro":
      "完整的 CPU 生命周期管理——上下文切换、特性检测、拓扑发现和 FPU/SIMD 状态：",
    "mmu.intro":
      "完整的虚拟内存管理，包含页标志、多级页表和 TLB 控制。PageFlags 位标志覆盖所有架构的常见页属性：",
    "interrupts.intro":
      "统一的中断控制器 trait，覆盖 APIC、GIC 和 PLIC——加上 IPI 传递和异常分类：",
    "firmware.intro":
      "平台固件抽象——ACPI 表、电源管理和系统信息：",
    "kaslr.intro":
      "内核地址空间布局随机化——847 行熵收集、地址随机化和内核重定位代码。支持 nokaslr 和 kaslr_entropy=N 内核命令行参数：",
    "relocation.intro":
      "完整的 ELF64 重定位支持，用于位置无关可执行文件（PIE）。处理所有 x86_64 重定位类型，包括 GOT 和 PLT 条目——1,193 行代码，具有全面的错误处理：",
    "backends.intro":
      "每个架构提供 HAL trait 的完整实现——以下是每个后端包含的内容：",
  },

  ja: {
    "header.title": "ハードウェア抽象化レイヤー",
    "header.subtitle":
      "137ファイルにわたる64,718行 — x86_64、AArch64、RISC-V 64 を統一されたトレイトベースの抽象化で網羅。CPU、MMU、割り込み、ファームウェア、KASLR、ELF再配置をカバー。",
    "header.badge": "HAL",
    "hal.intro":
      "マスター抽象化。すべてのアーキテクチャバックエンドが関連型とともにこの単一トレイトを実装します。カーネルはハードウェアに直接触れません — HAL を経由します：",
    "hal.features":
      "フィーチャーフラグ：x86_64（デフォルト）、aarch64、riscv64、debug_reloc、validation、tlb_stats、percpu",
    "cpu.intro":
      "完全な CPU ライフサイクル管理 — コンテキストスイッチ、機能検出、トポロジー探索、FPU/SIMD ステート：",
    "mmu.intro":
      "ページフラグ、マルチレベルページテーブル、TLB 制御による完全な仮想メモリ管理。PageFlags ビットフラグはアーキテクチャ間の共通ページ属性をすべてカバー：",
    "interrupts.intro":
      "APIC、GIC、PLIC をカバーする統一割り込みコントローラートレイト — IPI 配信と例外分類を含む：",
    "firmware.intro":
      "プラットフォームファームウェアの抽象化 — ACPI テーブル、電源管理、システム情報：",
    "kaslr.intro":
      "カーネルアドレス空間レイアウトランダム化 — 847行のエントロピー収集、アドレスランダム化、カーネル再配置。nokaslr および kaslr_entropy=N カーネルコマンドライン引数をサポート：",
    "relocation.intro":
      "位置独立実行ファイル（PIE）のための完全な ELF64 再配置サポート。GOT および PLT エントリを含むすべての x86_64 再配置タイプを処理 — 1,193行の包括的なエラーハンドリング：",
    "backends.intro":
      "各アーキテクチャは HAL トレイトの完全な実装を提供します — 各バックエンドに含まれるものは以下の通り：",
  },

  ko: {
    "header.title": "하드웨어 추상화 계층",
    "header.subtitle":
      "137개 파일에 걸친 64,718줄 — x86_64, AArch64, RISC-V 64에 대한 통합 트레이트 기반 추상화로 CPU, MMU, 인터럽트, 펌웨어, KASLR, ELF 재배치를 커버.",
    "header.badge": "HAL",
    "hal.intro":
      "마스터 추상화. 모든 아키텍처 백엔드가 연관 타입과 함께 이 단일 트레이트를 구현합니다. 커널은 하드웨어에 직접 접근하지 않습니다 — HAL을 통합니다:",
    "hal.features":
      "피처 플래그: x86_64 (기본), aarch64, riscv64, debug_reloc, validation, tlb_stats, percpu",
    "cpu.intro":
      "완전한 CPU 생명주기 관리 — 컨텍스트 스위칭, 기능 감지, 토폴로지 탐색, FPU/SIMD 상태:",
    "mmu.intro":
      "페이지 플래그, 다단계 페이지 테이블, TLB 제어를 갖춘 완전한 가상 메모리 관리. PageFlags 비트플래그는 아키텍처 전반의 모든 공통 페이지 속성을 커버:",
    "interrupts.intro":
      "APIC, GIC, PLIC을 커버하는 통합 인터럽트 컨트롤러 트레이트 — IPI 전달 및 예외 분류 포함:",
    "firmware.intro":
      "플랫폼 펌웨어 추상화 — ACPI 테이블, 전원 관리, 시스템 정보:",
    "kaslr.intro":
      "커널 주소 공간 레이아웃 랜덤화 — 847줄의 엔트로피 수집, 주소 랜덤화, 커널 재배치. nokaslr 및 kaslr_entropy=N 커널 명령줄 인수 지원:",
    "relocation.intro":
      "위치 독립 실행 파일(PIE)을 위한 완전한 ELF64 재배치 지원. GOT 및 PLT 항목을 포함한 모든 x86_64 재배치 유형 처리 — 포괄적인 오류 처리를 갖춘 1,193줄:",
    "backends.intro":
      "각 아키텍처는 HAL 트레이트의 완전한 구현을 제공합니다 — 각 백엔드에 포함된 내용:",
  },

  pt: {
    "header.title": "Camada de Abstração de Hardware",
    "header.subtitle":
      "64.718 linhas em 137 arquivos — uma abstração unificada baseada em traits sobre x86_64, AArch64 e RISC-V 64, cobrindo CPU, MMU, interrupções, firmware, KASLR e realocação ELF.",
    "header.badge": "HAL",
    "hal.intro":
      "A abstração mestre. Cada backend de arquitetura implementa este único trait com seus tipos associados. O kernel nunca toca o hardware diretamente — ele passa pelo HAL:",
    "hal.features":
      "Feature flags: x86_64 (padrão), aarch64, riscv64, debug_reloc, validation, tlb_stats, percpu",
    "cpu.intro":
      "Gerenciamento completo do ciclo de vida da CPU — troca de contexto, detecção de recursos, descoberta de topologia e estado FPU/SIMD:",
    "mmu.intro":
      "Gerenciamento completo de memória virtual com flags de página, tabelas de páginas multinível e controle TLB. Os bitflags PageFlags cobrem todos os atributos de página comuns entre arquiteturas:",
    "interrupts.intro":
      "Trait unificado de controlador de interrupções cobrindo APIC, GIC e PLIC — mais entrega de IPI e classificação de exceções:",
    "firmware.intro":
      "Abstração sobre firmware da plataforma — tabelas ACPI, gerenciamento de energia e informações do sistema:",
    "kaslr.intro":
      "Aleatorização do Layout do Espaço de Endereços do Kernel — 847 linhas de coleta de entropia, aleatorização de endereços e realocação do kernel. Suporta argumentos de linha de comando nokaslr e kaslr_entropy=N:",
    "relocation.intro":
      "Suporte completo de realocação ELF64 para Executáveis Independentes de Posição (PIE). Trata todos os tipos de realocação x86_64 incluindo entradas GOT e PLT — 1.193 linhas com tratamento abrangente de erros:",
    "backends.intro":
      "Cada arquitetura fornece uma implementação completa dos traits HAL — aqui está o que cada backend inclui:",
  },

  ru: {
    "header.title": "Уровень аппаратной абстракции",
    "header.subtitle":
      "64 718 строк в 137 файлах — единая абстракция на основе трейтов для x86_64, AArch64 и RISC-V 64, охватывающая CPU, MMU, прерывания, прошивку, KASLR и ELF-релокацию.",
    "header.badge": "HAL",
    "hal.intro":
      "Мастер-абстракция. Каждый архитектурный бэкенд реализует этот единственный трейт с ассоциированными типами. Ядро никогда не обращается к оборудованию напрямую — оно действует через HAL:",
    "hal.features":
      "Флаги функций: x86_64 (по умолчанию), aarch64, riscv64, debug_reloc, validation, tlb_stats, percpu",
    "cpu.intro":
      "Полное управление жизненным циклом CPU — переключение контекста, обнаружение функций, обнаружение топологии и состояние FPU/SIMD:",
    "mmu.intro":
      "Полное управление виртуальной памятью с флагами страниц, многоуровневыми таблицами страниц и управлением TLB. Битовые флаги PageFlags покрывают все общие атрибуты страниц для всех архитектур:",
    "interrupts.intro":
      "Единый трейт контроллера прерываний, охватывающий APIC, GIC и PLIC — плюс доставка IPI и классификация исключений:",
    "firmware.intro":
      "Абстракция над прошивкой платформы — таблицы ACPI, управление питанием и информация о системе:",
    "kaslr.intro":
      "Рандомизация размещения адресного пространства ядра — 847 строк сбора энтропии, рандомизации адресов и перемещения ядра. Поддерживает аргументы командной строки ядра nokaslr и kaslr_entropy=N:",
    "relocation.intro":
      "Полная поддержка ELF64-релокации для позиционно-независимых исполняемых файлов (PIE). Обрабатывает все типы релокаций x86_64, включая записи GOT и PLT — 1 193 строки с комплексной обработкой ошибок:",
    "backends.intro":
      "Каждая архитектура предоставляет полную реализацию трейтов HAL — вот что включает каждый бэкенд:",
  },

  ar: {
    "header.title": "طبقة تجريد الأجهزة",
    "header.subtitle":
      "64,718 سطرًا عبر 137 ملفًا — تجريد موحد قائم على الـ trait يغطي x86_64 و AArch64 و RISC-V 64، ويشمل CPU و MMU والمقاطعات والبرامج الثابتة و KASLR وإعادة توزيع ELF.",
    "header.badge": "HAL",
    "hal.intro":
      "التجريد الرئيسي. كل واجهة معمارية تنفذ هذا الـ trait الوحيد مع أنواعه المرتبطة. النواة لا تلمس العتاد مباشرة أبدًا — بل تمر عبر HAL:",
    "hal.features":
      "علامات الميزات: x86_64 (افتراضي)، aarch64، riscv64، debug_reloc، validation، tlb_stats، percpu",
    "cpu.intro":
      "إدارة كاملة لدورة حياة وحدة المعالجة المركزية — تبديل السياق، اكتشاف الميزات، اكتشاف الطوبولوجيا، وحالة FPU/SIMD:",
    "mmu.intro":
      "إدارة كاملة للذاكرة الافتراضية مع علامات الصفحات، وجداول صفحات متعددة المستويات، والتحكم في TLB. تغطي علامات بت PageFlags جميع خصائص الصفحات الشائعة عبر البنيات:",
    "interrupts.intro":
      "trait موحد لمتحكم المقاطعات يغطي APIC و GIC و PLIC — بالإضافة إلى تسليم IPI وتصنيف الاستثناءات:",
    "firmware.intro":
      "تجريد البرامج الثابتة للمنصة — جداول ACPI، وإدارة الطاقة، ومعلومات النظام:",
    "kaslr.intro":
      "عشوائية تخطيط مساحة عناوين النواة — 847 سطرًا من جمع الإنتروبيا، وعشوائية العناوين، وإعادة توزيع النواة. يدعم وسائط سطر أوامر النواة nokaslr و kaslr_entropy=N:",
    "relocation.intro":
      "دعم كامل لإعادة توزيع ELF64 للملفات التنفيذية المستقلة عن الموضع (PIE). يعالج جميع أنواع إعادة التوزيع لـ x86_64 بما في ذلك مدخلات GOT و PLT — 1,193 سطرًا مع معالجة شاملة للأخطاء:",
    "backends.intro":
      "توفر كل بنية تنفيذًا كاملاً لسمات HAL — إليك ما يتضمنه كل backend:",
  },
};

export default content;
