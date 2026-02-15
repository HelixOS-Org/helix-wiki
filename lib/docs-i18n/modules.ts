import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "Module System",
    "header.subtitle":
      "2,559 lines across 9 files — a hot-swappable, capability-gated module framework with ABI versioning, dependency resolution, and a full lifecycle state machine.",
    "header.badge": "MODULE FRAMEWORK",

    // Philosophy
    "philosophy.intro":
      "In Helix, the core kernel provides mechanisms — the module system provides policy. Schedulers, filesystems, drivers, and security modules are all loadable/unloadable at runtime:",
    "philosophy.mechanism.title": "🔧 Mechanism (Core)",
    "philosophy.policy.title": "📋 Policy (Modules)",

    // Core Types
    "types.intro":
      "Core types used across the module system — identifiers, versions, flags, states, and errors:",

    // Module Metadata
    "metadata.intro":
      "Every module declares metadata including name, version, author, ABI compatibility, dependencies, and required capabilities:",

    // Module Trait
    "trait.intro":
      "The Module trait is the contract every module must implement — lifecycle hooks, message handling, health checks, and state serialization for hot-reload:",

    // Module Registry
    "registry.intro":
      "The ModuleRegistry manages all loaded modules — discovery, dependency resolution, loading, initialization, and unloading:",

    // define_module! Macro
    "macro.intro":
      "The define_module! macro generates boilerplate for common module patterns — metadata, trait implementation, and registration:",

    // Module Lifecycle
    "lifecycle.intro":
      "Every module follows a strict 9-state lifecycle with 12 possible transitions. The state machine prevents invalid operations and enables clean hot-reload:",

    // Example: Round-Robin Scheduler
    "example.intro":
      "A complete example showing how a scheduler module implements both the Module trait and the Scheduler trait, with hot-reload support:",
  },

  fr: {
    // PageHeader
    "header.title": "Système de modules",
    "header.subtitle":
      "2 559 lignes réparties sur 9 fichiers — un cadre de modules échangeables à chaud, contrôlé par capacités, avec versionnage ABI, résolution de dépendances et une machine à états de cycle de vie complète.",
    "header.badge": "CADRE DE MODULES",

    // Philosophy
    "philosophy.intro":
      "Dans Helix, le noyau central fournit les mécanismes — le système de modules fournit la politique. Les ordonnanceurs, systèmes de fichiers, pilotes et modules de sécurité sont tous chargeables/déchargeables à l'exécution :",
    "philosophy.mechanism.title": "🔧 Mécanisme (Noyau)",
    "philosophy.policy.title": "📋 Politique (Modules)",

    // Core Types
    "types.intro":
      "Types de base utilisés dans tout le système de modules — identifiants, versions, drapeaux, états et erreurs :",

    // Module Metadata
    "metadata.intro":
      "Chaque module déclare des métadonnées incluant le nom, la version, l'auteur, la compatibilité ABI, les dépendances et les capacités requises :",

    // Module Trait
    "trait.intro":
      "Le trait Module est le contrat que chaque module doit implémenter — hooks de cycle de vie, gestion des messages, vérifications de santé et sérialisation d'état pour le rechargement à chaud :",

    // Module Registry
    "registry.intro":
      "Le ModuleRegistry gère tous les modules chargés — découverte, résolution de dépendances, chargement, initialisation et déchargement :",

    // define_module! Macro
    "macro.intro":
      "La macro define_module! génère le code standard pour les motifs de modules courants — métadonnées, implémentation du trait et enregistrement :",

    // Module Lifecycle
    "lifecycle.intro":
      "Chaque module suit un cycle de vie strict à 9 états avec 12 transitions possibles. La machine à états empêche les opérations invalides et permet un rechargement à chaud propre :",

    // Example: Round-Robin Scheduler
    "example.intro":
      "Un exemple complet montrant comment un module d'ordonnancement implémente à la fois le trait Module et le trait Scheduler, avec prise en charge du rechargement à chaud :",
  },

  es: {
    "header.title": "Sistema de Módulos",
    "header.subtitle":
      "2.559 líneas en 9 archivos — un marco de módulos intercambiables en caliente, controlado por capacidades, con versionado ABI, resolución de dependencias y una máquina de estados de ciclo de vida completa.",
    "header.badge": "MARCO DE MÓDULOS",
    "philosophy.intro":
      "En Helix, el núcleo del kernel proporciona mecanismos — el sistema de módulos proporciona políticas. Los planificadores, sistemas de archivos, controladores y módulos de seguridad son todos cargables/descargables en tiempo de ejecución:",
    "philosophy.mechanism.title": "🔧 Mecanismo (Núcleo)",
    "philosophy.policy.title": "📋 Política (Módulos)",
    "types.intro":
      "Tipos centrales usados en todo el sistema de módulos — identificadores, versiones, banderas, estados y errores:",
    "metadata.intro":
      "Cada módulo declara metadatos incluyendo nombre, versión, autor, compatibilidad ABI, dependencias y capacidades requeridas:",
    "trait.intro":
      "El trait Module es el contrato que todo módulo debe implementar — hooks de ciclo de vida, manejo de mensajes, chequeos de salud y serialización de estado para recarga en caliente:",
    "registry.intro":
      "El ModuleRegistry gestiona todos los módulos cargados — descubrimiento, resolución de dependencias, carga, inicialización y descarga:",
    "macro.intro":
      "La macro define_module! genera el código estándar para patrones comunes de módulos — metadatos, implementación del trait y registro:",
    "lifecycle.intro":
      "Cada módulo sigue un ciclo de vida estricto de 9 estados con 12 transiciones posibles. La máquina de estados previene operaciones inválidas y permite una recarga en caliente limpia:",
    "example.intro":
      "Un ejemplo completo que muestra cómo un módulo de planificador implementa tanto el trait Module como el trait Scheduler, con soporte de recarga en caliente:",
  },

  de: {
    "header.title": "Modulsystem",
    "header.subtitle":
      "2.559 Zeilen in 9 Dateien — ein Hot-Swap-fähiges, Capability-gesteuertes Modul-Framework mit ABI-Versionierung, Abhängigkeitsauflösung und einem vollständigen Lebenszyklus-Zustandsautomaten.",
    "header.badge": "MODUL-FRAMEWORK",
    "philosophy.intro":
      "In Helix stellt der Kernel-Kern Mechanismen bereit — das Modulsystem liefert die Richtlinien. Scheduler, Dateisysteme, Treiber und Sicherheitsmodule sind alle zur Laufzeit ladbar/entladbar:",
    "philosophy.mechanism.title": "🔧 Mechanismus (Kern)",
    "philosophy.policy.title": "📋 Richtlinie (Module)",
    "types.intro":
      "Kerntypen, die im gesamten Modulsystem verwendet werden — Bezeichner, Versionen, Flags, Zustände und Fehler:",
    "metadata.intro":
      "Jedes Modul deklariert Metadaten einschließlich Name, Version, Autor, ABI-Kompatibilität, Abhängigkeiten und erforderliche Fähigkeiten:",
    "trait.intro":
      "Das Module-Trait ist der Vertrag, den jedes Modul implementieren muss — Lebenszyklus-Hooks, Nachrichtenbehandlung, Gesundheitsprüfungen und Zustandsserialisierung für Hot-Reload:",
    "registry.intro":
      "Die ModuleRegistry verwaltet alle geladenen Module — Erkennung, Abhängigkeitsauflösung, Laden, Initialisierung und Entladen:",
    "macro.intro":
      "Das define_module!-Makro generiert Boilerplate für gängige Modulmuster — Metadaten, Trait-Implementierung und Registrierung:",
    "lifecycle.intro":
      "Jedes Modul folgt einem strikten 9-Zustands-Lebenszyklus mit 12 möglichen Übergängen. Der Zustandsautomat verhindert ungültige Operationen und ermöglicht sauberes Hot-Reload:",
    "example.intro":
      "Ein vollständiges Beispiel, das zeigt, wie ein Scheduler-Modul sowohl das Module-Trait als auch das Scheduler-Trait implementiert, mit Hot-Reload-Unterstützung:",
  },

  zh: {
    "header.title": "模块系统",
    "header.subtitle":
      "9 个文件中的 2,559 行代码——一个支持热插拔、能力控制的模块框架，具有 ABI 版本控制、依赖解析和完整的生命周期状态机。",
    "header.badge": "模块框架",
    "philosophy.intro":
      "在 Helix 中，核心内核提供机制——模块系统提供策略。调度器、文件系统、驱动程序和安全模块都可以在运行时加载/卸载：",
    "philosophy.mechanism.title": "🔧 机制（核心）",
    "philosophy.policy.title": "📋 策略（模块）",
    "types.intro":
      "模块系统中使用的核心类型——标识符、版本、标志、状态和错误：",
    "metadata.intro":
      "每个模块声明元数据，包括名称、版本、作者、ABI 兼容性、依赖项和所需能力：",
    "trait.intro":
      "Module trait 是每个模块必须实现的契约——生命周期钩子、消息处理、健康检查和热重载的状态序列化：",
    "registry.intro":
      "ModuleRegistry 管理所有已加载的模块——发现、依赖解析、加载、初始化和卸载：",
    "macro.intro":
      "define_module! 宏为常见的模块模式生成样板代码——元数据、trait 实现和注册：",
    "lifecycle.intro":
      "每个模块遵循严格的 9 状态生命周期，有 12 种可能的转换。状态机防止无效操作并实现干净的热重载：",
    "example.intro":
      "一个完整的示例，展示调度器模块如何同时实现 Module trait 和 Scheduler trait，并支持热重载：",
  },

  ja: {
    "header.title": "モジュールシステム",
    "header.subtitle":
      "9ファイルにわたる2,559行 — ABI バージョニング、依存関係解決、完全なライフサイクルステートマシンを備えた、ホットスワップ可能でケイパビリティ制御のモジュールフレームワーク。",
    "header.badge": "モジュールフレームワーク",
    "philosophy.intro":
      "Helix では、コアカーネルがメカニズムを提供し、モジュールシステムがポリシーを提供します。スケジューラ、ファイルシステム、ドライバ、セキュリティモジュールはすべてランタイムでロード/アンロード可能です：",
    "philosophy.mechanism.title": "🔧 メカニズム（コア）",
    "philosophy.policy.title": "📋 ポリシー（モジュール）",
    "types.intro":
      "モジュールシステム全体で使用されるコアタイプ — 識別子、バージョン、フラグ、状態、エラー：",
    "metadata.intro":
      "各モジュールは名前、バージョン、作者、ABI互換性、依存関係、必要なケイパビリティを含むメタデータを宣言します：",
    "trait.intro":
      "Module トレイトはすべてのモジュールが実装すべき契約です — ライフサイクルフック、メッセージ処理、ヘルスチェック、ホットリロード用の状態シリアライゼーション：",
    "registry.intro":
      "ModuleRegistry はすべてのロード済みモジュールを管理します — 検出、依存関係解決、ロード、初期化、アンロード：",
    "macro.intro":
      "define_module! マクロは一般的なモジュールパターンのボイラープレートを生成します — メタデータ、トレイト実装、登録：",
    "lifecycle.intro":
      "すべてのモジュールは12の遷移が可能な厳密な9状態のライフサイクルに従います。ステートマシンは無効な操作を防ぎ、クリーンなホットリロードを可能にします：",
    "example.intro":
      "スケジューラモジュールが Module トレイトと Scheduler トレイトの両方を実装し、ホットリロードをサポートする完全な例：",
  },

  ko: {
    "header.title": "모듈 시스템",
    "header.subtitle":
      "9개 파일에 걸친 2,559줄 — ABI 버전 관리, 의존성 해결, 완전한 생명주기 상태 머신을 갖춘 핫 스왑 가능하고 기능 제어되는 모듈 프레임워크.",
    "header.badge": "모듈 프레임워크",
    "philosophy.intro":
      "Helix에서 핵심 커널은 메커니즘을 제공하고, 모듈 시스템은 정책을 제공합니다. 스케줄러, 파일시스템, 드라이버, 보안 모듈 모두 런타임에 로드/언로드 가능합니다:",
    "philosophy.mechanism.title": "🔧 메커니즘 (코어)",
    "philosophy.policy.title": "📋 정책 (모듈)",
    "types.intro":
      "모듈 시스템 전반에 사용되는 핵심 타입 — 식별자, 버전, 플래그, 상태, 오류:",
    "metadata.intro":
      "모든 모듈은 이름, 버전, 작성자, ABI 호환성, 의존성, 필요한 기능을 포함하는 메타데이터를 선언합니다:",
    "trait.intro":
      "Module 트레이트는 모든 모듈이 구현해야 하는 계약입니다 — 생명주기 훅, 메시지 처리, 상태 점검, 핫 리로드를 위한 상태 직렬화:",
    "registry.intro":
      "ModuleRegistry는 모든 로드된 모듈을 관리합니다 — 검색, 의존성 해결, 로딩, 초기화, 언로딩:",
    "macro.intro":
      "define_module! 매크로는 일반적인 모듈 패턴에 대한 보일러플레이트를 생성합니다 — 메타데이터, 트레이트 구현, 등록:",
    "lifecycle.intro":
      "모든 모듈은 12가지 전환이 가능한 엄격한 9상태 생명주기를 따릅니다. 상태 머신은 잘못된 작업을 방지하고 깨끗한 핫 리로드를 가능하게 합니다:",
    "example.intro":
      "스케줄러 모듈이 Module 트레이트와 Scheduler 트레이트를 모두 구현하고 핫 리로드를 지원하는 완전한 예제:",
  },

  pt: {
    "header.title": "Sistema de Módulos",
    "header.subtitle":
      "2.559 linhas em 9 arquivos — um framework de módulos com hot-swap, controlado por capacidades, com versionamento ABI, resolução de dependências e uma máquina de estados de ciclo de vida completa.",
    "header.badge": "FRAMEWORK DE MÓDULOS",
    "philosophy.intro":
      "No Helix, o núcleo do kernel fornece mecanismos — o sistema de módulos fornece políticas. Escalonadores, sistemas de arquivos, drivers e módulos de segurança são todos carregáveis/descarregáveis em tempo de execução:",
    "philosophy.mechanism.title": "🔧 Mecanismo (Núcleo)",
    "philosophy.policy.title": "📋 Política (Módulos)",
    "types.intro":
      "Tipos centrais usados em todo o sistema de módulos — identificadores, versões, flags, estados e erros:",
    "metadata.intro":
      "Cada módulo declara metadados incluindo nome, versão, autor, compatibilidade ABI, dependências e capacidades necessárias:",
    "trait.intro":
      "O trait Module é o contrato que todo módulo deve implementar — hooks de ciclo de vida, tratamento de mensagens, verificações de saúde e serialização de estado para hot-reload:",
    "registry.intro":
      "O ModuleRegistry gerencia todos os módulos carregados — descoberta, resolução de dependências, carregamento, inicialização e descarregamento:",
    "macro.intro":
      "A macro define_module! gera boilerplate para padrões comuns de módulos — metadados, implementação de trait e registro:",
    "lifecycle.intro":
      "Cada módulo segue um ciclo de vida rigoroso de 9 estados com 12 transições possíveis. A máquina de estados previne operações inválidas e permite hot-reload limpo:",
    "example.intro":
      "Um exemplo completo mostrando como um módulo escalonador implementa tanto o trait Module quanto o trait Scheduler, com suporte a hot-reload:",
  },

  ru: {
    "header.title": "Система модулей",
    "header.subtitle":
      "2 559 строк в 9 файлах — фреймворк модулей с горячей заменой и контролем полномочий, с версионированием ABI, разрешением зависимостей и полным конечным автоматом жизненного цикла.",
    "header.badge": "ФРЕЙМВОРК МОДУЛЕЙ",
    "philosophy.intro":
      "В Helix ядро предоставляет механизмы — система модулей предоставляет политики. Планировщики, файловые системы, драйверы и модули безопасности — все загружаемые/выгружаемые во время выполнения:",
    "philosophy.mechanism.title": "🔧 Механизм (Ядро)",
    "philosophy.policy.title": "📋 Политика (Модули)",
    "types.intro":
      "Основные типы, используемые в системе модулей — идентификаторы, версии, флаги, состояния и ошибки:",
    "metadata.intro":
      "Каждый модуль объявляет метаданные, включая имя, версию, автора, совместимость ABI, зависимости и необходимые полномочия:",
    "trait.intro":
      "Трейт Module — это контракт, который должен реализовать каждый модуль — хуки жизненного цикла, обработка сообщений, проверки здоровья и сериализация состояния для горячей перезагрузки:",
    "registry.intro":
      "ModuleRegistry управляет всеми загруженными модулями — обнаружение, разрешение зависимостей, загрузка, инициализация и выгрузка:",
    "macro.intro":
      "Макрос define_module! генерирует шаблонный код для типичных паттернов модулей — метаданные, реализация трейта и регистрация:",
    "lifecycle.intro":
      "Каждый модуль следует строгому жизненному циклу из 9 состояний с 12 возможными переходами. Конечный автомат предотвращает недопустимые операции и обеспечивает чистую горячую перезагрузку:",
    "example.intro":
      "Полный пример, показывающий, как модуль планировщика реализует оба трейта Module и Scheduler с поддержкой горячей перезагрузки:",
  },

  ar: {
    "header.title": "نظام الوحدات",
    "header.subtitle":
      "2,559 سطرًا عبر 9 ملفات — إطار وحدات قابل للتبديل أثناء التشغيل، محكوم بالقدرات، مع إصدار ABI، وحل التبعيات، وآلة حالة دورة حياة كاملة.",
    "header.badge": "إطار الوحدات",
    "philosophy.intro":
      "في Helix، يوفر نواة النظام الآليات — ونظام الوحدات يوفر السياسات. المجدولات، وأنظمة الملفات، والمشغلات، ووحدات الأمان كلها قابلة للتحميل/الإزالة أثناء التشغيل:",
    "philosophy.mechanism.title": "🔧 آلية (النواة)",
    "philosophy.policy.title": "📋 سياسة (الوحدات)",
    "types.intro":
      "أنواع أساسية مستخدمة عبر نظام الوحدات — المعرفات، الإصدارات، العلامات، الحالات، والأخطاء:",
    "metadata.intro":
      "كل وحدة تعلن بيانات وصفية تشمل الاسم، الإصدار، المؤلف، توافق ABI، التبعيات، والقدرات المطلوبة:",
    "trait.intro":
      "الـ Module trait هو العقد الذي يجب أن تنفذه كل وحدة — خطافات دورة الحياة، معالجة الرسائل، فحوصات الصحة، وتسلسل الحالة لإعادة التحميل الفوري:",
    "registry.intro":
      "يدير ModuleRegistry جميع الوحدات المحملة — الاكتشاف، حل التبعيات، التحميل، التهيئة، والإزالة:",
    "macro.intro":
      "ماكرو define_module! ينشئ الكود النمطي لأنماط الوحدات الشائعة — البيانات الوصفية، تنفيذ الـ trait، والتسجيل:",
    "lifecycle.intro":
      "كل وحدة تتبع دورة حياة صارمة من 9 حالات مع 12 انتقالًا ممكنًا. آلة الحالة تمنع العمليات غير الصالحة وتمكن إعادة التحميل الفوري النظيف:",
    "example.intro":
      "مثال كامل يوضح كيف تنفذ وحدة المجدول كلاً من الـ Module trait والـ Scheduler trait، مع دعم إعادة التحميل الفوري:",
  },
};

export default content;
