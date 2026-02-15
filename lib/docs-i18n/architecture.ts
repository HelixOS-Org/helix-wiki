import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "Architecture",
    "header.subtitle":
      "Helix follows a strict layered architecture where each layer only depends on the one below it. 1.37 million lines of Rust across ~3,300 files — zero external C dependencies, pure no_std.",
    "header.badge": "DESIGN PHILOSOPHY",

    // Layer Stack
    "layers.intro":
      "The kernel is composed of five major layers. Each layer is a separate crate (or group of crates) in the Cargo workspace, with clear dependency boundaries. The golden rule: mechanism, not policy. The core kernel never decides what to do — it only provides the tools for modules to decide.",
    "layers.tcb.title": "🔒 Trusted Computing Base",
    "layers.tcb.desc":
      "Only the Core crate (~6,400 lines) is trusted. It defines IPC, syscall dispatch, the orchestrator trait, and event routing — but never implements scheduling policies, allocation strategies, or filesystem logic.",
    "layers.hotswap.title": "🔌 Hot-Swappable Everything",
    "layers.hotswap.desc":
      "Schedulers, memory allocators, and even filesystem drivers can be replaced at runtime via the hot-reload system. Modules save state → new version loads → state is restored — zero downtime.",
    "layers.ai.title": "🧠 AI-Integrated",
    "layers.ai.desc":
      "NEXUS (812K lines) provides crash prediction, anomaly detection, self-healing, and ML-based optimization. The kernel doesn't just run — it learns.",
    "layers.multiarch.title": "🏗️ Multi-Architecture",
    "layers.multiarch.desc":
      "x86_64 (primary, APIC/IOAPIC/x2APIC), AArch64 (GICv2/v3, PSCI), RISC-V 64 (PLIC/CLINT, SBI). Same HAL trait — different backends.",

    // Workspace Structure
    "workspace.intro":
      "The project is a Cargo workspace with 15 active member crates and 2 excluded (graphics workspace + boot/src):",
    "workspace.deps.title": "Workspace Dependencies",
    "workspace.deps.intro":
      "All crates share pinned dependency versions through the workspace — ensuring consistency and reproducibility:",

    // Crate Dependency Graph
    "deps.intro":
      'Each arrow means "depends on". The boot layer is at the bottom; modules at the top. The TCB (core) has minimal dependencies:',
    "deps.caption":
      "Separate workspaces shown at bottom — Lumina (graphics) and HelixFS are independent crate trees.",

    // Project Metrics
    "metrics.intro": "Lines of code measured across all member crates:",
    "metrics.total": "Total: ~1,370,000 lines of Rust across ~3,300 files",
    "metrics.total.desc":
      'Zero external C dependencies. Pure no_std Rust with panic = "abort". No standard library, no libc, no allocator by default.',

    // Build Profiles
    "profiles.intro":
      "Six Cargo profiles cover every build scenario:",

    // Toolchain & Targets
    "toolchain.intro":
      "Helix requires Rust nightly for unstable features like abi_x86_interrupt, naked_functions, and alloc_error_handler:",

    // Linker Scripts
    "linker.intro":
      "Each profile provides a linker script controlling the kernel memory layout. The higher-half kernel maps at 0xFFFFFFFF80000000 (-2 GiB):",

    // Boot Sequence
    "boot.intro":
      "The build pipeline is a 12-step process orchestrated by scripts/build.sh (874 lines). At runtime, the kernel executes an 8-stage hardware initialization:",
    "boot.minimal.intro":
      "The profiles/minimal crate demonstrates the full boot-to-demo flow — parsing Multiboot2 info, initializing a 4 MB bump-allocated heap, and launching demo subsystems:",
  },

  fr: {
    // PageHeader
    "header.title": "Architecture",
    "header.subtitle":
      "Helix suit une architecture en couches stricte où chaque couche ne dépend que de celle en dessous. 1,37 million de lignes de Rust réparties sur ~3 300 fichiers — zéro dépendance externe en C, pur no_std.",
    "header.badge": "PHILOSOPHIE DE CONCEPTION",

    // Layer Stack
    "layers.intro":
      "Le noyau est composé de cinq couches majeures. Chaque couche est une crate séparée (ou un groupe de crates) dans le workspace Cargo, avec des frontières de dépendance claires. La règle d'or : le mécanisme, pas la politique. Le noyau central ne décide jamais quoi faire — il fournit uniquement les outils pour que les modules décident.",
    "layers.tcb.title": "🔒 Base de calcul de confiance",
    "layers.tcb.desc":
      "Seule la crate Core (~6 400 lignes) est de confiance. Elle définit l'IPC, la dispatch des appels système, le trait d'orchestrateur et le routage d'événements — mais n'implémente jamais de politiques d'ordonnancement, de stratégies d'allocation ou de logique de système de fichiers.",
    "layers.hotswap.title": "🔌 Tout est remplaçable à chaud",
    "layers.hotswap.desc":
      "Les ordonnanceurs, les allocateurs mémoire et même les pilotes de systèmes de fichiers peuvent être remplacés à l'exécution via le système de rechargement à chaud. Les modules sauvegardent leur état → la nouvelle version se charge → l'état est restauré — aucun temps d'arrêt.",
    "layers.ai.title": "🧠 Intégration IA",
    "layers.ai.desc":
      "NEXUS (812K lignes) fournit la prédiction de pannes, la détection d'anomalies, l'auto-réparation et l'optimisation basée sur le ML. Le noyau ne se contente pas de fonctionner — il apprend.",
    "layers.multiarch.title": "🏗️ Multi-Architecture",
    "layers.multiarch.desc":
      "x86_64 (principal, APIC/IOAPIC/x2APIC), AArch64 (GICv2/v3, PSCI), RISC-V 64 (PLIC/CLINT, SBI). Même trait HAL — différents backends.",

    // Workspace Structure
    "workspace.intro":
      "Le projet est un workspace Cargo avec 15 crates membres actives et 2 exclues (workspace graphique + boot/src) :",
    "workspace.deps.title": "Dépendances du workspace",
    "workspace.deps.intro":
      "Toutes les crates partagent des versions de dépendances épinglées via le workspace — garantissant cohérence et reproductibilité :",

    // Crate Dependency Graph
    "deps.intro":
      "Chaque flèche signifie « dépend de ». La couche de démarrage est en bas ; les modules en haut. Le TCB (core) a un minimum de dépendances :",
    "deps.caption":
      "Workspaces séparés affichés en bas — Lumina (graphique) et HelixFS sont des arbres de crates indépendants.",

    // Project Metrics
    "metrics.intro":
      "Lignes de code mesurées à travers toutes les crates membres :",
    "metrics.total":
      "Total : ~1 370 000 lignes de Rust réparties sur ~3 300 fichiers",
    "metrics.total.desc":
      "Zéro dépendance externe en C. Rust no_std pur avec panic = \"abort\". Aucune bibliothèque standard, aucun libc, aucun allocateur par défaut.",

    // Build Profiles
    "profiles.intro":
      "Six profils Cargo couvrent chaque scénario de compilation :",

    // Toolchain & Targets
    "toolchain.intro":
      "Helix nécessite Rust nightly pour des fonctionnalités instables comme abi_x86_interrupt, naked_functions et alloc_error_handler :",

    // Linker Scripts
    "linker.intro":
      "Chaque profil fournit un script de liaison contrôlant l'agencement mémoire du noyau. Le noyau en demi supérieure est mappé à 0xFFFFFFFF80000000 (-2 Gio) :",

    // Boot Sequence
    "boot.intro":
      "Le pipeline de compilation est un processus en 12 étapes orchestré par scripts/build.sh (874 lignes). À l'exécution, le noyau effectue une initialisation matérielle en 8 étapes :",
    "boot.minimal.intro":
      "La crate profiles/minimal démontre le flux complet du démarrage à la démo — analyse des informations Multiboot2, initialisation d'un tas de 4 Mo alloué par bump, et lancement des sous-systèmes de démonstration :",
  },

  es: {
    "header.title": "Arquitectura",
    "header.subtitle":
      "Helix sigue una arquitectura en capas estricta donde cada capa solo depende de la inferior. 1,37 millones de líneas de Rust en ~3.300 archivos — cero dependencias externas en C, puro no_std.",
    "header.badge": "FILOSOFÍA DE DISEÑO",
    "layers.intro":
      "El kernel se compone de cinco capas principales. Cada capa es un crate separado (o grupo de crates) en el workspace de Cargo, con límites de dependencia claros. La regla de oro: mecanismo, no política.",
    "layers.tcb.title": "🔒 Base de cómputo confiable",
    "layers.hotswap.title": "🔌 Todo es intercambiable en caliente",
    "layers.ai.title": "🧠 Integración con IA",
    "layers.multiarch.title": "🏗️ Multi-Arquitectura",
    "workspace.intro":
      "El proyecto es un workspace de Cargo con 15 crates miembros activos y 2 excluidos (workspace gráfico + boot/src):",
    "workspace.deps.title": "Dependencias del workspace",
    "deps.intro":
      "Cada flecha significa \"depende de\". La capa de arranque está abajo; los módulos arriba. El TCB (core) tiene dependencias mínimas:",
    "deps.caption":
      "Workspaces separados mostrados abajo — Lumina (gráficos) y HelixFS son árboles de crates independientes.",
    "metrics.intro":
      "Líneas de código medidas a través de todos los crates miembros:",
    "metrics.total":
      "Total: ~1.370.000 líneas de Rust en ~3.300 archivos",
    "profiles.intro":
      "Seis perfiles de Cargo cubren cada escenario de compilación:",
    "toolchain.intro":
      "Helix requiere Rust nightly para características inestables como abi_x86_interrupt, naked_functions y alloc_error_handler:",
    "linker.intro":
      "Cada perfil proporciona un script de enlace que controla la disposición de memoria del kernel. El kernel de mitad superior se mapea en 0xFFFFFFFF80000000 (-2 GiB):",
    "boot.intro":
      "El pipeline de compilación es un proceso de 12 pasos orquestado por scripts/build.sh (874 líneas). En tiempo de ejecución, el kernel ejecuta una inicialización de hardware en 8 etapas:",
    "boot.minimal.intro":
      "El crate profiles/minimal demuestra el flujo completo de arranque a demo — analizando la información Multiboot2, inicializando un heap de 4 MB con asignación bump, y lanzando subsistemas de demostración:",
  },

  de: {
    "header.title": "Architektur",
    "header.subtitle":
      "Helix folgt einer strikten Schichtenarchitektur, bei der jede Schicht nur von der darunterliegenden abhängt. 1,37 Millionen Zeilen Rust in ~3.300 Dateien — null externe C-Abhängigkeiten, reines no_std.",
    "header.badge": "DESIGNPHILOSOPHIE",
    "layers.intro":
      "Der Kernel besteht aus fünf Hauptschichten. Jede Schicht ist ein separates Crate (oder eine Gruppe von Crates) im Cargo-Workspace mit klaren Abhängigkeitsgrenzen. Die goldene Regel: Mechanismus, nicht Politik.",
    "layers.tcb.title": "🔒 Vertrauenswürdige Rechenbasis",
    "layers.hotswap.title": "🔌 Alles ist im laufenden Betrieb austauschbar",
    "layers.ai.title": "🧠 KI-integriert",
    "layers.multiarch.title": "🏗️ Multi-Architektur",
    "workspace.intro":
      "Das Projekt ist ein Cargo-Workspace mit 15 aktiven Member-Crates und 2 ausgeschlossenen (Grafik-Workspace + boot/src):",
    "workspace.deps.title": "Workspace-Abhängigkeiten",
    "deps.intro":
      "Jeder Pfeil bedeutet 'hängt ab von'. Die Boot-Schicht ist unten; Module oben. Der TCB (core) hat minimale Abhängigkeiten:",
    "deps.caption":
      "Separate Workspaces unten dargestellt — Lumina (Grafik) und HelixFS sind unabhängige Crate-Bäume.",
    "metrics.intro":
      "Codezeilen gemessen über alle Member-Crates:",
    "metrics.total":
      "Gesamt: ~1.370.000 Zeilen Rust in ~3.300 Dateien",
    "profiles.intro":
      "Sechs Cargo-Profile decken jedes Build-Szenario ab:",
    "toolchain.intro":
      "Helix erfordert Rust nightly für instabile Features wie abi_x86_interrupt, naked_functions und alloc_error_handler:",
    "linker.intro":
      "Jedes Profil stellt ein Linker-Skript bereit, das das Kernel-Speicherlayout steuert. Der Higher-Half-Kernel wird bei 0xFFFFFFFF80000000 (-2 GiB) gemappt:",
    "boot.intro":
      "Die Build-Pipeline ist ein 12-Schritte-Prozess, orchestriert durch scripts/build.sh (874 Zeilen). Zur Laufzeit führt der Kernel eine 8-stufige Hardware-Initialisierung durch:",
    "boot.minimal.intro":
      "Das profiles/minimal-Crate demonstriert den vollständigen Boot-to-Demo-Ablauf — Parsen der Multiboot2-Informationen, Initialisierung eines 4 MB Bump-Heap und Start der Demo-Subsysteme:",
  },

  zh: {
    "header.title": "架构",
    "header.subtitle":
      "Helix 遵循严格的分层架构，每层仅依赖其下层。跨 ~3,300 个文件共 137 万行 Rust 代码——零外部 C 依赖，纯 no_std。",
    "header.badge": "设计哲学",
    "layers.intro":
      "内核由五个主要层组成。每层是 Cargo 工作空间中一个独立的 crate（或一组 crate），具有清晰的依赖边界。黄金法则：机制，而非策略。",
    "layers.tcb.title": "🔒 可信计算基",
    "layers.hotswap.title": "🔌 一切皆可热替换",
    "layers.ai.title": "🧠 AI 集成",
    "layers.multiarch.title": "🏗️ 多架构",
    "workspace.intro":
      "该项目是一个 Cargo 工作空间，包含 15 个活跃成员 crate 和 2 个排除项（图形工作空间 + boot/src）：",
    "workspace.deps.title": "工作空间依赖",
    "deps.intro":
      "每个箭头表示'依赖于'。引导层在底部；模块在顶部。TCB（core）具有最少的依赖：",
    "deps.caption":
      "底部显示独立工作空间——Lumina（图形）和 HelixFS 是独立的 crate 树。",
    "metrics.intro": "跨所有成员 crate 测量的代码行数：",
    "metrics.total": "总计：约 1,370,000 行 Rust 代码，横跨约 3,300 个文件",
    "profiles.intro": "六个 Cargo 配置文件涵盖每种构建场景：",
    "toolchain.intro":
      "Helix 需要 Rust nightly 以支持不稳定特性，如 abi_x86_interrupt、naked_functions 和 alloc_error_handler：",
    "linker.intro":
      "每个配置文件提供一个链接器脚本，控制内核内存布局。高半核映射在 0xFFFFFFFF80000000（-2 GiB）：",
    "boot.intro":
      "构建流水线是一个由 scripts/build.sh（874 行）编排的 12 步流程。运行时，内核执行 8 阶段硬件初始化：",
    "boot.minimal.intro":
      "profiles/minimal crate 演示了从启动到演示的完整流程——解析 Multiboot2 信息、初始化 4 MB bump 分配堆并启动演示子系统：",
  },

  ja: {
    "header.title": "アーキテクチャ",
    "header.subtitle":
      "Helix は各層がその下の層にのみ依存する厳密なレイヤードアーキテクチャに従います。~3,300 ファイルにわたる 137 万行の Rust — 外部 C 依存ゼロ、純粋な no_std。",
    "header.badge": "設計哲学",
    "layers.intro":
      "カーネルは 5 つの主要レイヤーで構成されています。各レイヤーは Cargo ワークスペース内の独立したクレート（またはクレートグループ）で、明確な依存関係の境界を持ちます。黄金律：メカニズムであり、ポリシーではない。",
    "layers.tcb.title": "🔒 信頼できるコンピューティングベース",
    "layers.hotswap.title": "🔌 すべてがホットスワップ可能",
    "layers.ai.title": "🧠 AI 統合",
    "layers.multiarch.title": "🏗️ マルチアーキテクチャ",
    "workspace.intro":
      "プロジェクトは 15 のアクティブメンバークレートと 2 つの除外（グラフィックスワークスペース + boot/src）を持つ Cargo ワークスペースです：",
    "workspace.deps.title": "ワークスペース依存関係",
    "deps.intro":
      "各矢印は「依存する」を意味します。ブートレイヤーが最下部、モジュールが最上部です。TCB（core）は最小限の依存関係を持ちます：",
    "deps.caption":
      "下部に独立したワークスペースが表示されています — Lumina（グラフィックス）と HelixFS は独立したクレートツリーです。",
    "metrics.intro": "全メンバークレートにわたるコード行数：",
    "metrics.total": "合計：~3,300 ファイルにわたる約 1,370,000 行の Rust",
    "profiles.intro": "6 つの Cargo プロファイルがすべてのビルドシナリオをカバー：",
    "toolchain.intro":
      "Helix は abi_x86_interrupt、naked_functions、alloc_error_handler などの不安定な機能のために Rust nightly が必要です：",
    "linker.intro":
      "各プロファイルはカーネルメモリレイアウトを制御するリンカースクリプトを提供します。ハイヤーハーフカーネルは 0xFFFFFFFF80000000（-2 GiB）にマップされます：",
    "boot.intro":
      "ビルドパイプラインは scripts/build.sh（874行）によって編成される 12 ステップのプロセスです。実行時、カーネルは 8 段階のハードウェア初期化を実行します：",
    "boot.minimal.intro":
      "profiles/minimal クレートは、Multiboot2 情報の解析、4 MB バンプアロケートヒープの初期化、デモサブシステムの起動という、起動からデモまでの完全なフローを示します：",
  },

  ko: {
    "header.title": "아키텍처",
    "header.subtitle":
      "Helix는 각 계층이 아래 계층에만 의존하는 엄격한 계층 아키텍처를 따릅니다. ~3,300개 파일에 걸쳐 137만 줄의 Rust — 외부 C 의존성 없음, 순수 no_std.",
    "header.badge": "설계 철학",
    "layers.intro":
      "커널은 5개의 주요 계층으로 구성됩니다. 각 계층은 Cargo 워크스페이스에서 명확한 의존성 경계를 가진 별도의 크레이트(또는 크레이트 그룹)입니다. 황금률: 정책이 아닌 메커니즘.",
    "layers.tcb.title": "🔒 신뢰 컴퓨팅 기반",
    "layers.hotswap.title": "🔌 모든 것이 핫스왑 가능",
    "layers.ai.title": "🧠 AI 통합",
    "layers.multiarch.title": "🏗️ 멀티 아키텍처",
    "workspace.intro":
      "이 프로젝트는 15개의 활성 멤버 크레이트와 2개의 제외(그래픽 워크스페이스 + boot/src)가 있는 Cargo 워크스페이스입니다:",
    "workspace.deps.title": "워크스페이스 의존성",
    "deps.intro":
      "각 화살표는 \"의존함\"을 의미합니다. 부팅 계층이 하단에, 모듈이 상단에 있습니다. TCB(core)는 최소한의 의존성을 갖습니다:",
    "deps.caption":
      "하단에 별도의 워크스페이스가 표시됩니다 — Lumina(그래픽)와 HelixFS는 독립적인 크레이트 트리입니다.",
    "metrics.intro": "모든 멤버 크레이트에 걸쳐 측정된 코드 줄 수:",
    "metrics.total": "총계: ~3,300개 파일에 걸쳐 약 1,370,000줄의 Rust",
    "profiles.intro": "6개의 Cargo 프로필이 모든 빌드 시나리오를 커버합니다:",
    "toolchain.intro":
      "Helix는 abi_x86_interrupt, naked_functions, alloc_error_handler와 같은 불안정 기능을 위해 Rust nightly가 필요합니다:",
    "linker.intro":
      "각 프로필은 커널 메모리 레이아웃을 제어하는 링커 스크립트를 제공합니다. 상위 절반 커널은 0xFFFFFFFF80000000(-2 GiB)에 매핑됩니다:",
    "boot.intro":
      "빌드 파이프라인은 scripts/build.sh(874줄)에 의해 조율되는 12단계 프로세스입니다. 런타임에 커널은 8단계 하드웨어 초기화를 실행합니다:",
    "boot.minimal.intro":
      "profiles/minimal 크레이트는 Multiboot2 정보 파싱, 4 MB 범프 할당 힙 초기화, 데모 서브시스템 실행 등 부팅부터 데모까지의 전체 흐름을 보여줍니다:",
  },

  pt: {
    "header.title": "Arquitetura",
    "header.subtitle":
      "O Helix segue uma arquitetura em camadas rigorosa onde cada camada depende apenas da inferior. 1,37 milhão de linhas de Rust em ~3.300 arquivos — zero dependências externas em C, puro no_std.",
    "header.badge": "FILOSOFIA DE DESIGN",
    "layers.intro":
      "O kernel é composto por cinco camadas principais. Cada camada é um crate separado (ou grupo de crates) no workspace do Cargo, com limites de dependência claros. A regra de ouro: mecanismo, não política.",
    "layers.tcb.title": "🔒 Base de Computação Confiável",
    "layers.hotswap.title": "🔌 Tudo é substituível a quente",
    "layers.ai.title": "🧠 Integração com IA",
    "layers.multiarch.title": "🏗️ Multi-Arquitetura",
    "workspace.intro":
      "O projeto é um workspace Cargo com 15 crates membros ativos e 2 excluídos (workspace gráfico + boot/src):",
    "workspace.deps.title": "Dependências do workspace",
    "deps.intro":
      "Cada seta significa \"depende de\". A camada de boot está na base; módulos no topo. O TCB (core) tem dependências mínimas:",
    "deps.caption":
      "Workspaces separados exibidos na base — Lumina (gráficos) e HelixFS são árvores de crates independentes.",
    "metrics.intro":
      "Linhas de código medidas em todos os crates membros:",
    "metrics.total":
      "Total: ~1.370.000 linhas de Rust em ~3.300 arquivos",
    "profiles.intro":
      "Seis perfis Cargo cobrem cada cenário de compilação:",
    "toolchain.intro":
      "O Helix requer Rust nightly para recursos instáveis como abi_x86_interrupt, naked_functions e alloc_error_handler:",
    "linker.intro":
      "Cada perfil fornece um script de linker controlando o layout de memória do kernel. O kernel de metade superior é mapeado em 0xFFFFFFFF80000000 (-2 GiB):",
    "boot.intro":
      "O pipeline de compilação é um processo de 12 etapas orquestrado por scripts/build.sh (874 linhas). Em tempo de execução, o kernel executa uma inicialização de hardware em 8 estágios:",
    "boot.minimal.intro":
      "O crate profiles/minimal demonstra o fluxo completo de boot-a-demo — parseando informações Multiboot2, inicializando um heap de 4 MB com alocação bump e lançando subsistemas de demonstração:",
  },

  ru: {
    "header.title": "Архитектура",
    "header.subtitle":
      "Helix следует строгой многоуровневой архитектуре, где каждый уровень зависит только от нижележащего. 1,37 миллиона строк Rust в ~3 300 файлах — ноль внешних зависимостей на C, чистый no_std.",
    "header.badge": "ФИЛОСОФИЯ ПРОЕКТИРОВАНИЯ",
    "layers.intro":
      "Ядро состоит из пяти основных уровней. Каждый уровень — отдельный крейт (или группа крейтов) в рабочем пространстве Cargo с чёткими границами зависимостей. Золотое правило: механизм, а не политика.",
    "layers.tcb.title": "🔒 Доверенная вычислительная база",
    "layers.hotswap.title": "🔌 Горячая замена всего",
    "layers.ai.title": "🧠 Интеграция с ИИ",
    "layers.multiarch.title": "🏗️ Мультиархитектурность",
    "workspace.intro":
      "Проект представляет собой рабочее пространство Cargo с 15 активными крейтами и 2 исключёнными (графическое пространство + boot/src):",
    "workspace.deps.title": "Зависимости рабочего пространства",
    "deps.intro":
      "Каждая стрелка означает «зависит от». Загрузочный уровень внизу; модули вверху. TCB (core) имеет минимальные зависимости:",
    "deps.caption":
      "Отдельные рабочие пространства показаны внизу — Lumina (графика) и HelixFS — независимые деревья крейтов.",
    "metrics.intro":
      "Строки кода, измеренные по всем крейтам-членам:",
    "metrics.total":
      "Итого: ~1 370 000 строк Rust в ~3 300 файлах",
    "profiles.intro":
      "Шесть профилей Cargo покрывают каждый сценарий сборки:",
    "toolchain.intro":
      "Helix требует Rust nightly для нестабильных функций, таких как abi_x86_interrupt, naked_functions и alloc_error_handler:",
    "linker.intro":
      "Каждый профиль предоставляет скрипт компоновщика, управляющий размещением памяти ядра. Ядро верхней половины отображается по адресу 0xFFFFFFFF80000000 (-2 ГиБ):",
    "boot.intro":
      "Конвейер сборки — это 12-шаговый процесс, управляемый scripts/build.sh (874 строки). Во время выполнения ядро выполняет 8-этапную инициализацию оборудования:",
    "boot.minimal.intro":
      "Крейт profiles/minimal демонстрирует полный поток от загрузки до демонстрации — разбор информации Multiboot2, инициализация 4 МБ кучи с bump-аллокацией и запуск демонстрационных подсистем:",
  },

  ar: {
    "header.title": "الهندسة المعمارية",
    "header.subtitle":
      "يتبع Helix بنية طبقية صارمة حيث تعتمد كل طبقة فقط على التي تحتها. 1.37 مليون سطر من Rust عبر ~3,300 ملف — صفر تبعيات خارجية بلغة C، no_std نقي.",
    "header.badge": "فلسفة التصميم",
    "layers.intro":
      "يتكون النواة من خمس طبقات رئيسية. كل طبقة هي crate منفصل (أو مجموعة crates) في مساحة عمل Cargo، مع حدود تبعية واضحة. القاعدة الذهبية: الآلية، وليس السياسة.",
    "layers.tcb.title": "🔒 قاعدة الحوسبة الموثوقة",
    "layers.hotswap.title": "🔌 كل شيء قابل للتبديل أثناء التشغيل",
    "layers.ai.title": "🧠 مُدمج مع الذكاء الاصطناعي",
    "layers.multiarch.title": "🏗️ متعدد البنيات",
    "workspace.intro":
      "المشروع هو مساحة عمل Cargo تحتوي على 15 crate عضو نشط و2 مستبعدين (مساحة عمل الرسومات + boot/src):",
    "workspace.deps.title": "تبعيات مساحة العمل",
    "deps.intro":
      "كل سهم يعني \"يعتمد على\". طبقة الإقلاع في الأسفل؛ الوحدات في الأعلى. TCB (core) لديه تبعيات دنيا:",
    "deps.caption":
      "مساحات عمل منفصلة معروضة في الأسفل — Lumina (الرسومات) و HelixFS هي أشجار crate مستقلة.",
    "metrics.intro":
      "أسطر الكود المقاسة عبر جميع crates الأعضاء:",
    "metrics.total":
      "الإجمالي: ~1,370,000 سطر من Rust عبر ~3,300 ملف",
    "profiles.intro":
      "ستة ملفات تعريف Cargo تغطي كل سيناريو بناء:",
    "toolchain.intro":
      "يتطلب Helix نسخة Rust nightly للميزات غير المستقرة مثل abi_x86_interrupt و naked_functions و alloc_error_handler:",
    "linker.intro":
      "يوفر كل ملف تعريف برنامج نصي للرابط يتحكم في تخطيط ذاكرة النواة. نواة النصف العلوي تُربط عند 0xFFFFFFFF80000000 (-2 جيبي بايت):",
    "boot.intro":
      "خط أنابيب البناء هو عملية من 12 خطوة منسقة بواسطة scripts/build.sh (874 سطرًا). أثناء التشغيل، تنفذ النواة تهيئة أجهزة من 8 مراحل:",
    "boot.minimal.intro":
      "يُظهر crate profiles/minimal التدفق الكامل من الإقلاع إلى العرض التوضيحي — تحليل معلومات Multiboot2، وتهيئة كومة 4 ميجابايت بتخصيص bump، وإطلاق الأنظمة الفرعية التوضيحية:",
  },
};

export default content;
