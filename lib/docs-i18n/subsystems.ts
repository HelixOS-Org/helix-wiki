import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "Subsystems",
    "header.subtitle":
      "Seven subsystems bridge the gap between the core TCB and the module layer — memory, execution, DIS scheduling, init framework, relocation, userspace, and early boot.",
    "header.badge": "SUBSYSTEM SERVICES",

    // Memory Subsystem
    "memory.intro":
      "Physical frame allocation + virtual address space mapping — 2,047 lines across 12 files. The subsystem only provides mechanisms; allocation policy lives in pluggable modules.",
    "memory.errors.title": "Error Types & Primitives",
    "memory.physical.title": "Physical Allocator",
    "memory.virtual.title": "Virtual Memory Manager",
    "memory.heap.title": "Kernel Heap Allocators",

    // Execution Subsystem
    "execution.intro":
      "Thread and process lifecycle management — 2,150 lines across 14 files. Defines the structures that DIS schedules:",
    "execution.scheduler.title": "Scheduler Trait",

    // DIS — Dynamic Intent Scheduler
    "dis.intro":
      "Helix's crown jewel — 11,573 lines across 11 files. DIS doesn't schedule threads by priority alone; it understands task intent and adapts in real time. Tasks declare what they want to do, and DIS finds the optimal scheduling strategy:",
    "dis.core.title": "DIS Scheduler Core",
    "dis.mapping.title": "Intent-to-Timeslice Mapping",
    "dis.modules.title": "DIS Modules",

    // Init Framework
    "init.intro":
      "DAG-based initialization system — 17,673 lines across 23 files. Supports up to 512 subsystems with 64-level dependency depth, topological sort, and automatic rollback on failure:",
    "init.dag.title": "Init Task DAG",
    "init.builtins.title": "14 Built-in Subsystem Inits",

    // Relocation Subsystem
    "relocation.intro":
      "PIE/KASLR relocation engine — 4,093 lines across 12 files. Handles the full lifecycle from ELF parsing to runtime relocation:",

    // Userspace Subsystem
    "userspace.intro":
      "ELF loader, process runtime, and a built-in shell — 3,407 lines across 7 files:",
    "userspace.modules.title": "Userspace Modules",

    // Early Boot Subsystem
    "earlyboot.intro":
      "The first code that runs after the bootloader — 23,802 lines across 33 files. Handles the transition from bootloader to kernel, including per-architecture hardware initialization:",
    "earlyboot.perarch.title": "Per-Architecture Early Boot",
  },

  fr: {
    // PageHeader
    "header.title": "Sous-systèmes",
    "header.subtitle":
      "Sept sous-systèmes comblent le fossé entre le TCB central et la couche de modules — mémoire, exécution, ordonnancement DIS, cadre d'initialisation, relocalisation, espace utilisateur et démarrage précoce.",
    "header.badge": "SERVICES DE SOUS-SYSTÈME",

    // Memory Subsystem
    "memory.intro":
      "Allocation de cadres physiques + mappage d'espace d'adresses virtuel — 2 047 lignes réparties sur 12 fichiers. Le sous-système ne fournit que des mécanismes ; la politique d'allocation réside dans des modules enfichables.",
    "memory.errors.title": "Types d'erreurs et primitives",
    "memory.physical.title": "Allocateur physique",
    "memory.virtual.title": "Gestionnaire de mémoire virtuelle",
    "memory.heap.title": "Allocateurs de tas du noyau",

    // Execution Subsystem
    "execution.intro":
      "Gestion du cycle de vie des threads et des processus — 2 150 lignes réparties sur 14 fichiers. Définit les structures que DIS ordonnance :",
    "execution.scheduler.title": "Trait de l'ordonnanceur",

    // DIS — Dynamic Intent Scheduler
    "dis.intro":
      "Le joyau de la couronne de Helix — 11 573 lignes réparties sur 11 fichiers. DIS n'ordonnance pas les threads uniquement par priorité ; il comprend l'intention des tâches et s'adapte en temps réel. Les tâches déclarent ce qu'elles veulent faire, et DIS trouve la stratégie d'ordonnancement optimale :",
    "dis.core.title": "Cœur de l'ordonnanceur DIS",
    "dis.mapping.title": "Mappage intention-vers-tranche de temps",
    "dis.modules.title": "Modules DIS",

    // Init Framework
    "init.intro":
      "Système d'initialisation basé sur un DAG — 17 673 lignes réparties sur 23 fichiers. Prend en charge jusqu'à 512 sous-systèmes avec une profondeur de dépendance de 64 niveaux, un tri topologique et un retour automatique en cas d'échec :",
    "init.dag.title": "DAG des tâches d'initialisation",
    "init.builtins.title": "14 initialisations de sous-systèmes intégrées",

    // Relocation Subsystem
    "relocation.intro":
      "Moteur de relocalisation PIE/KASLR — 4 093 lignes réparties sur 12 fichiers. Gère le cycle de vie complet de l'analyse ELF à la relocalisation à l'exécution :",

    // Userspace Subsystem
    "userspace.intro":
      "Chargeur ELF, environnement d'exécution de processus et un shell intégré — 3 407 lignes réparties sur 7 fichiers :",
    "userspace.modules.title": "Modules d'espace utilisateur",

    // Early Boot Subsystem
    "earlyboot.intro":
      "Le premier code qui s'exécute après le chargeur d'amorçage — 23 802 lignes réparties sur 33 fichiers. Gère la transition du chargeur d'amorçage vers le noyau, y compris l'initialisation matérielle par architecture :",
    "earlyboot.perarch.title": "Démarrage précoce par architecture",
  },

  es: {
    "header.title": "Subsistemas",
    "header.subtitle":
      "Siete subsistemas cierran la brecha entre el TCB central y la capa de módulos — memoria, ejecución, planificación DIS, marco de inicialización, reubicación, espacio de usuario y arranque temprano.",
    "header.badge": "SERVICIOS DE SUBSISTEMA",
    "memory.intro":
      "Asignación de marcos físicos + mapeo de espacio de direcciones virtuales — 2.047 líneas en 12 archivos. El subsistema solo proporciona mecanismos; la política de asignación reside en módulos conectables.",
    "execution.intro":
      "Gestión del ciclo de vida de hilos y procesos — 2.150 líneas en 14 archivos. Define las estructuras que DIS planifica:",
    "dis.intro":
      "La joya de la corona de Helix — 11.573 líneas en 11 archivos. DIS no planifica hilos solo por prioridad; entiende la intención de la tarea y se adapta en tiempo real:",
    "init.intro":
      "Sistema de inicialización basado en DAG — 17.673 líneas en 23 archivos. Soporta hasta 512 subsistemas con 64 niveles de profundidad de dependencia, ordenamiento topológico y rollback automático en caso de fallo:",
    "relocation.intro":
      "Motor de reubicación PIE/KASLR — 4.093 líneas en 12 archivos. Maneja el ciclo de vida completo desde el análisis ELF hasta la reubicación en tiempo de ejecución:",
    "userspace.intro":
      "Cargador ELF, entorno de ejecución de procesos y un shell integrado — 3.407 líneas en 7 archivos:",
    "earlyboot.intro":
      "El primer código que se ejecuta después del cargador de arranque — 23.802 líneas en 33 archivos. Maneja la transición del cargador de arranque al kernel, incluyendo la inicialización de hardware por arquitectura:",
  },

  de: {
    "header.title": "Subsysteme",
    "header.subtitle":
      "Sieben Subsysteme überbrücken die Lücke zwischen dem zentralen TCB und der Modulschicht — Speicher, Ausführung, DIS-Scheduling, Init-Framework, Relokation, Userspace und Early Boot.",
    "header.badge": "SUBSYSTEM-DIENSTE",
    "memory.intro":
      "Physische Frame-Allokation + virtuelle Adressraumzuordnung — 2.047 Zeilen in 12 Dateien. Das Subsystem stellt nur Mechanismen bereit; die Allokationsrichtlinie liegt in steckbaren Modulen.",
    "execution.intro":
      "Thread- und Prozess-Lebenszyklusverwaltung — 2.150 Zeilen in 14 Dateien. Definiert die Strukturen, die DIS plant:",
    "dis.intro":
      "Das Kronjuwel von Helix — 11.573 Zeilen in 11 Dateien. DIS plant Threads nicht nur nach Priorität; es versteht die Aufgabenintention und passt sich in Echtzeit an:",
    "init.intro":
      "DAG-basiertes Initialisierungssystem — 17.673 Zeilen in 23 Dateien. Unterstützt bis zu 512 Subsysteme mit 64 Abhängigkeitsebenen, topologischer Sortierung und automatischem Rollback bei Fehler:",
    "relocation.intro":
      "PIE/KASLR-Relokationsengine — 4.093 Zeilen in 12 Dateien. Verwaltet den gesamten Lebenszyklus vom ELF-Parsing bis zur Laufzeit-Relokation:",
    "userspace.intro":
      "ELF-Loader, Prozess-Laufzeitumgebung und eine eingebaute Shell — 3.407 Zeilen in 7 Dateien:",
    "earlyboot.intro":
      "Der erste Code, der nach dem Bootloader ausgeführt wird — 23.802 Zeilen in 33 Dateien. Verwaltet den Übergang vom Bootloader zum Kernel, einschließlich architekturspezifischer Hardware-Initialisierung:",
  },

  zh: {
    "header.title": "子系统",
    "header.subtitle":
      "七个子系统弥合了核心 TCB 与模块层之间的差距——内存、执行、DIS 调度、初始化框架、重定位、用户空间和早期引导。",
    "header.badge": "子系统服务",
    "memory.intro":
      "物理帧分配 + 虚拟地址空间映射——12 个文件中的 2,047 行代码。子系统只提供机制；分配策略存在于可插拔模块中。",
    "execution.intro":
      "线程和进程生命周期管理——14 个文件中的 2,150 行代码。定义 DIS 调度的结构：",
    "dis.intro":
      "Helix 的皇冠明珠——11 个文件中的 11,573 行代码。DIS 不仅按优先级调度线程；它理解任务意图并实时适应：",
    "init.intro":
      "基于 DAG 的初始化系统——23 个文件中的 17,673 行代码。支持多达 512 个子系统，64 级依赖深度，拓扑排序和失败时自动回滚：",
    "relocation.intro":
      "PIE/KASLR 重定位引擎——12 个文件中的 4,093 行代码。处理从 ELF 解析到运行时重定位的完整生命周期：",
    "userspace.intro":
      "ELF 加载器、进程运行时和内置 shell——7 个文件中的 3,407 行代码：",
    "earlyboot.intro":
      "引导加载程序之后运行的第一段代码——33 个文件中的 23,802 行代码。处理从引导加载程序到内核的转换，包括每种架构的硬件初始化：",
  },

  ja: {
    "header.title": "サブシステム",
    "header.subtitle":
      "7つのサブシステムがコア TCB とモジュール層の間のギャップを埋めます — メモリ、実行、DIS スケジューリング、init フレームワーク、リロケーション、ユーザースペース、アーリーブート。",
    "header.badge": "サブシステムサービス",
    "memory.intro":
      "物理フレーム割り当て + 仮想アドレス空間マッピング — 12 ファイルにわたる 2,047 行。サブシステムはメカニズムのみを提供し、割り当てポリシーはプラグイン可能なモジュールに存在します。",
    "execution.intro":
      "スレッドとプロセスのライフサイクル管理 — 14 ファイルにわたる 2,150 行。DIS がスケジュールする構造を定義します：",
    "dis.intro":
      "Helix の至宝 — 11 ファイルにわたる 11,573 行。DIS は優先度だけでスレッドをスケジュールしません。タスクの意図を理解し、リアルタイムで適応します：",
    "init.intro":
      "DAG ベースの初期化システム — 23 ファイルにわたる 17,673 行。512 サブシステム、64 レベルの依存関係深度、トポロジカルソート、障害時の自動ロールバックをサポート：",
    "relocation.intro":
      "PIE/KASLR リロケーションエンジン — 12 ファイルにわたる 4,093 行。ELF 解析からランタイムリロケーションまでの完全なライフサイクルを処理：",
    "userspace.intro":
      "ELF ローダー、プロセスランタイム、組み込みシェル — 7 ファイルにわたる 3,407 行：",
    "earlyboot.intro":
      "ブートローダーの後に実行される最初のコード — 33 ファイルにわたる 23,802 行。ブートローダーからカーネルへの移行を処理し、アーキテクチャごとのハードウェア初期化を含みます：",
  },

  ko: {
    "header.title": "서브시스템",
    "header.subtitle":
      "7개의 서브시스템이 핵심 TCB와 모듈 계층 사이의 간극을 메웁니다 — 메모리, 실행, DIS 스케줄링, init 프레임워크, 재배치, 유저스페이스, 얼리 부트.",
    "header.badge": "서브시스템 서비스",
    "memory.intro":
      "물리 프레임 할당 + 가상 주소 공간 매핑 — 12개 파일에 걸친 2,047줄. 서브시스템은 메커니즘만 제공하며, 할당 정책은 플러그인 가능한 모듈에 존재합니다.",
    "execution.intro":
      "스레드 및 프로세스 생명주기 관리 — 14개 파일에 걸친 2,150줄. DIS가 스케줄링하는 구조를 정의합니다:",
    "dis.intro":
      "Helix의 왕관 보석 — 11개 파일에 걸친 11,573줄. DIS는 우선순위만으로 스레드를 스케줄링하지 않습니다. 작업 의도를 이해하고 실시간으로 적응합니다:",
    "init.intro":
      "DAG 기반 초기화 시스템 — 23개 파일에 걸친 17,673줄. 512개 서브시스템, 64단계 의존성 깊이, 위상 정렬, 실패 시 자동 롤백 지원:",
    "relocation.intro":
      "PIE/KASLR 재배치 엔진 — 12개 파일에 걸친 4,093줄. ELF 파싱에서 런타임 재배치까지 전체 생명주기를 처리합니다:",
    "userspace.intro":
      "ELF 로더, 프로세스 런타임, 내장 셸 — 7개 파일에 걸친 3,407줄:",
    "earlyboot.intro":
      "부트로더 이후 실행되는 첫 번째 코드 — 33개 파일에 걸친 23,802줄. 아키텍처별 하드웨어 초기화를 포함한 부트로더에서 커널로의 전환을 처리합니다:",
  },

  pt: {
    "header.title": "Subsistemas",
    "header.subtitle":
      "Sete subsistemas conectam o TCB central à camada de módulos — memória, execução, agendamento DIS, framework de inicialização, relocação, espaço de usuário e boot inicial.",
    "header.badge": "SERVIÇOS DE SUBSISTEMA",
    "memory.intro":
      "Alocação de quadros físicos + mapeamento de espaço de endereçamento virtual — 2.047 linhas em 12 arquivos. O subsistema apenas fornece mecanismos; a política de alocação reside em módulos plugáveis.",
    "execution.intro":
      "Gerenciamento do ciclo de vida de threads e processos — 2.150 linhas em 14 arquivos. Define as estruturas que o DIS agenda:",
    "dis.intro":
      "A joia da coroa do Helix — 11.573 linhas em 11 arquivos. O DIS não agenda threads apenas por prioridade; ele entende a intenção da tarefa e se adapta em tempo real:",
    "init.intro":
      "Sistema de inicialização baseado em DAG — 17.673 linhas em 23 arquivos. Suporta até 512 subsistemas com 64 níveis de profundidade de dependência, ordenação topológica e rollback automático em caso de falha:",
    "relocation.intro":
      "Motor de relocação PIE/KASLR — 4.093 linhas em 12 arquivos. Gerencia o ciclo de vida completo desde a análise ELF até a relocação em tempo de execução:",
    "userspace.intro":
      "Carregador ELF, runtime de processos e um shell integrado — 3.407 linhas em 7 arquivos:",
    "earlyboot.intro":
      "O primeiro código que executa após o bootloader — 23.802 linhas em 33 arquivos. Gerencia a transição do bootloader para o kernel, incluindo inicialização de hardware por arquitetura:",
  },

  ru: {
    "header.title": "Подсистемы",
    "header.subtitle":
      "Семь подсистем связывают ядро TCB со слоем модулей — память, выполнение, планирование DIS, фреймворк инициализации, релокация, пользовательское пространство и ранняя загрузка.",
    "header.badge": "СЛУЖБЫ ПОДСИСТЕМ",
    "memory.intro":
      "Выделение физических фреймов + отображение виртуального адресного пространства — 2 047 строк в 12 файлах. Подсистема предоставляет только механизмы; политика выделения находится в подключаемых модулях.",
    "execution.intro":
      "Управление жизненным циклом потоков и процессов — 2 150 строк в 14 файлах. Определяет структуры, которые планирует DIS:",
    "dis.intro":
      "Жемчужина Helix — 11 573 строки в 11 файлах. DIS планирует потоки не только по приоритету; он понимает намерение задачи и адаптируется в реальном времени:",
    "init.intro":
      "Система инициализации на основе DAG — 17 673 строки в 23 файлах. Поддерживает до 512 подсистем с 64 уровнями глубины зависимостей, топологической сортировкой и автоматическим откатом при сбое:",
    "relocation.intro":
      "Движок релокации PIE/KASLR — 4 093 строки в 12 файлах. Обрабатывает полный жизненный цикл от разбора ELF до релокации во время выполнения:",
    "userspace.intro":
      "Загрузчик ELF, среда выполнения процессов и встроенная оболочка — 3 407 строк в 7 файлах:",
    "earlyboot.intro":
      "Первый код, выполняемый после загрузчика — 23 802 строки в 33 файлах. Обрабатывает переход от загрузчика к ядру, включая инициализацию оборудования для каждой архитектуры:",
  },

  ar: {
    "header.title": "الأنظمة الفرعية",
    "header.subtitle":
      "سبعة أنظمة فرعية تسد الفجوة بين TCB الأساسي وطبقة الوحدات — الذاكرة، التنفيذ، جدولة DIS، إطار التهيئة، إعادة التوطين، مساحة المستخدم، والإقلاع المبكر.",
    "header.badge": "خدمات الأنظمة الفرعية",
    "memory.intro":
      "تخصيص الإطارات الفيزيائية + ربط مساحة العناوين الافتراضية — 2,047 سطرًا عبر 12 ملفًا. النظام الفرعي يوفر الآليات فقط؛ سياسة التخصيص موجودة في وحدات قابلة للتوصيل.",
    "execution.intro":
      "إدارة دورة حياة الخيوط والعمليات — 2,150 سطرًا عبر 14 ملفًا. يحدد الهياكل التي يجدولها DIS:",
    "dis.intro":
      "جوهرة تاج Helix — 11,573 سطرًا عبر 11 ملفًا. لا يجدول DIS الخيوط حسب الأولوية فقط؛ بل يفهم نية المهمة ويتكيف في الوقت الفعلي:",
    "init.intro":
      "نظام تهيئة قائم على DAG — 17,673 سطرًا عبر 23 ملفًا. يدعم حتى 512 نظامًا فرعيًا بعمق تبعية من 64 مستوى، وترتيب طوبولوجي، وتراجع تلقائي عند الفشل:",
    "relocation.intro":
      "محرك إعادة التوطين PIE/KASLR — 4,093 سطرًا عبر 12 ملفًا. يتعامل مع دورة الحياة الكاملة من تحليل ELF إلى إعادة التوطين أثناء التشغيل:",
    "userspace.intro":
      "محمل ELF، بيئة تشغيل العمليات، وقشرة مدمجة — 3,407 سطرًا عبر 7 ملفات:",
    "earlyboot.intro":
      "أول كود يتم تنفيذه بعد محمل الإقلاع — 23,802 سطرًا عبر 33 ملفًا. يدير الانتقال من محمل الإقلاع إلى النواة، بما في ذلك تهيئة العتاد لكل بنية:",
  },
};

export default content;
