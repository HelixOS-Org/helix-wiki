import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "Device Drivers",
    "header.subtitle":
      "Module-based driver architecture with Magma GPU abstraction — drivers are hot-swappable kernel modules following the ModuleTrait lifecycle.",
    "header.badge": "DRIVERS",

    // Architecture
    "arch.intro":
      "Drivers in Helix are kernel modules — they implement ModuleTrait and register with the device subsystem:",

    // Magma
    "magma.intro":
      "Magma is the GPU abstraction layer — 7 crates providing command buffers, memory management, synchronization, and compute pipelines:",

    // GPU Init
    "gpu.intro":
      "GPU initialization follows a strict sequence — device discovery, feature negotiation, memory setup, and command queue creation:",

    // Command Pipeline
    "pipeline.intro":
      "The command buffer pipeline stages from recording through submission to completion:",

    // Planned Drivers
    "planned.intro":
      "Drivers planned for future development:",

    // Writing Drivers
    "writing.intro":
      "How to create a new driver module for Helix:",
  },

  fr: {
    // PageHeader
    "header.title": "Pilotes de périphériques",
    "header.subtitle":
      "Architecture de pilotes basée sur des modules avec abstraction GPU Magma — les pilotes sont des modules noyau échangeables à chaud suivant le cycle de vie ModuleTrait.",
    "header.badge": "PILOTES",

    // Architecture
    "arch.intro":
      "Les pilotes dans Helix sont des modules noyau — ils implémentent ModuleTrait et s'enregistrent auprès du sous-système de périphériques :",

    // Magma
    "magma.intro":
      "Magma est la couche d'abstraction GPU — 7 crates fournissant des tampons de commandes, la gestion de la mémoire, la synchronisation et les pipelines de calcul :",

    // GPU Init
    "gpu.intro":
      "L'initialisation du GPU suit une séquence stricte — découverte du périphérique, négociation des fonctionnalités, configuration de la mémoire et création de la file de commandes :",

    // Command Pipeline
    "pipeline.intro":
      "Les étapes du pipeline de tampons de commandes de l'enregistrement à la soumission jusqu'à l'achèvement :",

    // Planned Drivers
    "planned.intro":
      "Pilotes prévus pour le développement futur :",

    // Writing Drivers
    "writing.intro":
      "Comment créer un nouveau module pilote pour Helix :",
  },

  es: {
    "header.title": "Controladores de dispositivos",
    "header.subtitle":
      "Arquitectura de controladores basada en módulos con abstracción GPU Magma — los controladores son módulos del kernel intercambiables en caliente siguiendo el ciclo de vida ModuleTrait.",
    "header.badge": "CONTROLADORES",
    "arch.intro":
      "Los controladores en Helix son módulos del kernel — implementan ModuleTrait y se registran con el subsistema de dispositivos:",
    "magma.intro":
      "Magma es la capa de abstracción GPU — 7 crates que proporcionan buffers de comandos, gestión de memoria, sincronización y pipelines de cómputo:",
    "gpu.intro":
      "La inicialización de GPU sigue una secuencia estricta — descubrimiento de dispositivos, negociación de características, configuración de memoria y creación de la cola de comandos:",
    "pipeline.intro":
      "Las etapas del pipeline de buffers de comandos desde la grabación hasta el envío y la finalización:",
    "planned.intro":
      "Controladores planificados para desarrollo futuro:",
    "writing.intro":
      "Cómo crear un nuevo módulo controlador para Helix:",
  },

  de: {
    "header.title": "Gerätetreiber",
    "header.subtitle":
      "Modulbasierte Treiberarchitektur mit Magma-GPU-Abstraktion — Treiber sind Hot-Swap-fähige Kernel-Module, die dem ModuleTrait-Lebenszyklus folgen.",
    "header.badge": "TREIBER",
    "arch.intro":
      "Treiber in Helix sind Kernel-Module — sie implementieren ModuleTrait und registrieren sich beim Geräte-Subsystem:",
    "magma.intro":
      "Magma ist die GPU-Abstraktionsschicht — 7 Crates, die Befehlspuffer, Speicherverwaltung, Synchronisation und Compute-Pipelines bereitstellen:",
    "gpu.intro":
      "Die GPU-Initialisierung folgt einer strikten Sequenz — Geräteerkennung, Feature-Aushandlung, Speichereinrichtung und Befehlswarteschlangerstellung:",
    "pipeline.intro":
      "Die Befehlspuffer-Pipeline-Stufen von der Aufzeichnung über die Übermittlung bis zur Fertigstellung:",
    "planned.intro":
      "Treiber, die für zukünftige Entwicklung geplant sind:",
    "writing.intro":
      "Wie man ein neues Treibermodul für Helix erstellt:",
  },

  zh: {
    "header.title": "设备驱动程序",
    "header.subtitle":
      "基于模块的驱动架构，配合 Magma GPU 抽象——驱动是遵循 ModuleTrait 生命周期的热插拔内核模块。",
    "header.badge": "驱动",
    "arch.intro":
      "Helix 中的驱动是内核模块——它们实现 ModuleTrait 并注册到设备子系统：",
    "magma.intro":
      "Magma 是 GPU 抽象层——7 个 crate 提供命令缓冲区、内存管理、同步和计算管线：",
    "gpu.intro":
      "GPU 初始化遵循严格的序列——设备发现、功能协商、内存设置和命令队列创建：",
    "pipeline.intro":
      "命令缓冲区管线从录制到提交再到完成的各个阶段：",
    "planned.intro":
      "计划在未来开发的驱动：",
    "writing.intro":
      "如何为 Helix 创建新的驱动模块：",
  },

  ja: {
    "header.title": "デバイスドライバー",
    "header.subtitle":
      "Magma GPU抽象を備えたモジュールベースのドライバーアーキテクチャ — ドライバーはModuleTraitライフサイクルに従うホットスワップ可能なカーネルモジュールです。",
    "header.badge": "ドライバー",
    "arch.intro":
      "Helixのドライバーはカーネルモジュール — ModuleTraitを実装しデバイスサブシステムに登録します：",
    "magma.intro":
      "MagmaはGPU抽象化レイヤー — 7クレートがコマンドバッファ、メモリ管理、同期、コンピュートパイプラインを提供：",
    "gpu.intro":
      "GPU初期化は厳密なシーケンスに従います — デバイス検出、機能ネゴシエーション、メモリセットアップ、コマンドキュー作成：",
    "pipeline.intro":
      "コマンドバッファパイプラインの記録から送信、完了までのステージ：",
    "planned.intro":
      "将来の開発で予定されているドライバー：",
    "writing.intro":
      "Helix用の新しいドライバーモジュールの作成方法：",
  },

  ko: {
    "header.title": "디바이스 드라이버",
    "header.subtitle":
      "Magma GPU 추상화를 갖춘 모듈 기반 드라이버 아키텍처 — 드라이버는 ModuleTrait 생명주기를 따르는 핫스왑 가능한 커널 모듈입니다.",
    "header.badge": "드라이버",
    "arch.intro":
      "Helix의 드라이버는 커널 모듈 — ModuleTrait를 구현하고 디바이스 서브시스템에 등록합니다:",
    "magma.intro":
      "Magma는 GPU 추상화 레이어 — 7개 크레이트가 커맨드 버퍼, 메모리 관리, 동기화, 컴퓨트 파이프라인을 제공:",
    "gpu.intro":
      "GPU 초기화는 엄격한 순서를 따릅니다 — 디바이스 발견, 기능 협상, 메모리 설정, 커맨드 큐 생성:",
    "pipeline.intro":
      "커맨드 버퍼 파이프라인의 기록에서 제출, 완료까지의 단계:",
    "planned.intro":
      "향후 개발이 계획된 드라이버:",
    "writing.intro":
      "Helix를 위한 새 드라이버 모듈을 만드는 방법:",
  },

  pt: {
    "header.title": "Drivers de dispositivos",
    "header.subtitle":
      "Arquitetura de drivers baseada em módulos com abstração GPU Magma — drivers são módulos do kernel com hot-swap seguindo o ciclo de vida ModuleTrait.",
    "header.badge": "DRIVERS",
    "arch.intro":
      "Drivers no Helix são módulos do kernel — implementam ModuleTrait e se registram no subsistema de dispositivos:",
    "magma.intro":
      "Magma é a camada de abstração GPU — 7 crates fornecendo buffers de comando, gerenciamento de memória, sincronização e pipelines de computação:",
    "gpu.intro":
      "A inicialização da GPU segue uma sequência rigorosa — descoberta de dispositivos, negociação de recursos, configuração de memória e criação da fila de comandos:",
    "pipeline.intro":
      "Os estágios do pipeline de buffers de comando da gravação até a submissão e conclusão:",
    "planned.intro":
      "Drivers planejados para desenvolvimento futuro:",
    "writing.intro":
      "Como criar um novo módulo de driver para o Helix:",
  },

  ru: {
    "header.title": "Драйверы устройств",
    "header.subtitle":
      "Модульная архитектура драйверов с абстракцией GPU Magma — драйверы являются горячезаменяемыми модулями ядра, следующими жизненному циклу ModuleTrait.",
    "header.badge": "ДРАЙВЕРЫ",
    "arch.intro":
      "Драйверы в Helix — это модули ядра — они реализуют ModuleTrait и регистрируются в подсистеме устройств:",
    "magma.intro":
      "Magma — это слой абстракции GPU — 7 крейтов, предоставляющих командные буферы, управление памятью, синхронизацию и вычислительные пайплайны:",
    "gpu.intro":
      "Инициализация GPU следует строгой последовательности — обнаружение устройств, согласование возможностей, настройка памяти и создание очереди команд:",
    "pipeline.intro":
      "Этапы пайплайна командного буфера от записи через отправку до завершения:",
    "planned.intro":
      "Драйверы, запланированные для будущей разработки:",
    "writing.intro":
      "Как создать новый модуль драйвера для Helix:",
  },

  ar: {
    "header.title": "تعريفات الأجهزة",
    "header.subtitle":
      "بنية تعريفات قائمة على الوحدات مع تجريد GPU ماجما — التعريفات هي وحدات نواة قابلة للتبديل السريع تتبع دورة حياة ModuleTrait.",
    "header.badge": "التعريفات",
    "arch.intro":
      "التعريفات في Helix هي وحدات نواة — تنفذ ModuleTrait وتسجل لدى النظام الفرعي للأجهزة:",
    "magma.intro":
      "ماجما هي طبقة تجريد GPU — 7 حزم توفر مخازن الأوامر، إدارة الذاكرة، المزامنة، وخطوط أنابيب الحوسبة:",
    "gpu.intro":
      "تتبع تهيئة GPU تسلسلاً صارمًا — اكتشاف الجهاز، التفاوض على الميزات، إعداد الذاكرة، وإنشاء طابور الأوامر:",
    "pipeline.intro":
      "مراحل خط أنابيب مخازن الأوامر من التسجيل عبر الإرسال حتى الإكمال:",
    "planned.intro":
      "تعريفات مخطط تطويرها مستقبلاً:",
    "writing.intro":
      "كيفية إنشاء وحدة تعريف جديدة لـ Helix:",
  },
};

export default content;
