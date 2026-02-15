import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "Core Kernel",
    "header.subtitle":
      "The Trusted Computing Base — 6,397 lines across 25 files. Orchestration, IPC, syscalls, interrupts, self-healing, hot-reload, and a capability broker.",
    "header.badge": "TCB",

    // Module Map
    "map.intro":
      "The core crate is organized into 7 modules with strict separation of concerns:",

    // Kernel Types
    "types.intro":
      "Fundamental types shared by every subsystem. These are the building blocks:",

    // KernelComponent Trait
    "component.intro":
      "Every kernel component implements this trait — providing a uniform lifecycle, health monitoring, and statistics interface:",

    // Orchestrator
    "orchestrator.intro":
      "The orchestrator manages subsystem lifecycle, dependency ordering, and capability brokering. It's the heart of the kernel — but only defines mechanisms, not policies:",
    "orchestrator.lifecycle.title": "Lifecycle Manager",
    "orchestrator.capability.title": "Capability Broker",
    "orchestrator.capability.intro":
      "Fine-grained access control with recursive revocation — capabilities propagate through a tree, and revoking a parent automatically revokes all children:",
    "orchestrator.resource.title": "Resource Broker",

    // Syscall Framework
    "syscalls.intro":
      "A 512-entry dispatch table with a 6-argument calling convention matching Linux errno semantics. Pre/post hooks enable tracing, security auditing, and performance profiling without modifying handlers:",
    "syscalls.hooks.title": "Hook System",
    "syscalls.validation.title": "Argument Validation",

    // IPC
    "ipc.intro":
      "Three IPC primitives, each designed for a different communication pattern. All are lock-free or use minimal spinning:",
    "ipc.channels.title": "1. Channels — Bounded MPSC Ring Buffers",
    "ipc.eventbus.title": "2. Event Bus — Pub/Sub with Priority",
    "ipc.router.title": "3. Message Router — Request/Response",

    // Self-Heal & Hot-Reload
    "selfheal.intro":
      "Two systems work together to keep the kernel running even when modules crash — the self-healing manager monitors health and triggers recovery, while hot-reload performs live module replacement:",
    "selfheal.manager.title": "Self-Healing Manager",
    "selfheal.hotreload.title": "Hot-Reload System",
    "selfheal.example.title": "Example: Live Scheduler Swap",

    // Interrupt Infrastructure
    "interrupts.intro":
      "A 256-entry interrupt dispatch table with routing modes, exception handling, and default handlers for common faults:",

    // Debug Console
    "debug.intro":
      "Kernel-space print macros that route through the debug console — supporting serial output and framebuffer rendering:",

    // Panic Handler
    "panic.intro":
      "Custom panic handling with configurable actions — the kernel never just crashes silently:",
  },

  fr: {
    // PageHeader
    "header.title": "Noyau central",
    "header.subtitle":
      "La base de calcul de confiance — 6 397 lignes réparties sur 25 fichiers. Orchestration, IPC, appels système, interruptions, auto-réparation, rechargement à chaud et courtier de capacités.",
    "header.badge": "TCB",

    // Module Map
    "map.intro":
      "La crate core est organisée en 7 modules avec une séparation stricte des préoccupations :",

    // Kernel Types
    "types.intro":
      "Types fondamentaux partagés par chaque sous-système. Ce sont les briques de base :",

    // KernelComponent Trait
    "component.intro":
      "Chaque composant du noyau implémente ce trait — fournissant un cycle de vie uniforme, une surveillance de santé et une interface de statistiques :",

    // Orchestrator
    "orchestrator.intro":
      "L'orchestrateur gère le cycle de vie des sous-systèmes, l'ordre des dépendances et le courtage de capacités. C'est le cœur du noyau — mais il ne définit que des mécanismes, pas des politiques :",
    "orchestrator.lifecycle.title": "Gestionnaire de cycle de vie",
    "orchestrator.capability.title": "Courtier de capacités",
    "orchestrator.capability.intro":
      "Contrôle d'accès à granularité fine avec révocation récursive — les capacités se propagent à travers un arbre, et révoquer un parent révoque automatiquement tous les enfants :",
    "orchestrator.resource.title": "Courtier de ressources",

    // Syscall Framework
    "syscalls.intro":
      "Une table de dispatch de 512 entrées avec une convention d'appel à 6 arguments conforme à la sémantique errno de Linux. Les hooks pré/post permettent le traçage, l'audit de sécurité et le profilage de performances sans modifier les gestionnaires :",
    "syscalls.hooks.title": "Système de hooks",
    "syscalls.validation.title": "Validation des arguments",

    // IPC
    "ipc.intro":
      "Trois primitives IPC, chacune conçue pour un modèle de communication différent. Toutes sont sans verrou ou utilisent un spinning minimal :",
    "ipc.channels.title": "1. Canaux — Tampons circulaires MPSC bornés",
    "ipc.eventbus.title": "2. Bus d'événements — Pub/Sub avec priorité",
    "ipc.router.title": "3. Routeur de messages — Requête/Réponse",

    // Self-Heal & Hot-Reload
    "selfheal.intro":
      "Deux systèmes travaillent ensemble pour maintenir le noyau en fonctionnement même lorsque des modules plantent — le gestionnaire d'auto-réparation surveille la santé et déclenche la récupération, tandis que le rechargement à chaud effectue le remplacement de modules en direct :",
    "selfheal.manager.title": "Gestionnaire d'auto-réparation",
    "selfheal.hotreload.title": "Système de rechargement à chaud",
    "selfheal.example.title": "Exemple : Remplacement d'ordonnanceur en direct",

    // Interrupt Infrastructure
    "interrupts.intro":
      "Une table de dispatch d'interruptions de 256 entrées avec des modes de routage, la gestion des exceptions et des gestionnaires par défaut pour les défauts courants :",

    // Debug Console
    "debug.intro":
      "Macros d'impression en espace noyau qui transitent par la console de débogage — prenant en charge la sortie série et le rendu par framebuffer :",

    // Panic Handler
    "panic.intro":
      "Gestion de panique personnalisée avec des actions configurables — le noyau ne plante jamais silencieusement :",
  },

  es: {
    "header.title": "Núcleo del Kernel",
    "header.subtitle":
      "La Base de Cómputo Confiable — 6.397 líneas en 25 archivos. Orquestación, IPC, llamadas al sistema, interrupciones, auto-reparación, recarga en caliente y un intermediario de capacidades.",
    "header.badge": "TCB",
    "map.intro":
      "El crate core está organizado en 7 módulos con una separación estricta de responsabilidades:",
    "types.intro":
      "Tipos fundamentales compartidos por cada subsistema. Son los componentes básicos:",
    "component.intro":
      "Cada componente del kernel implementa este trait — proporcionando un ciclo de vida uniforme, monitoreo de salud e interfaz de estadísticas:",
    "orchestrator.intro":
      "El orquestador gestiona el ciclo de vida de los subsistemas, el orden de dependencias y el intermediario de capacidades. Es el corazón del kernel — pero solo define mecanismos, no políticas:",
    "orchestrator.lifecycle.title": "Gestor de ciclo de vida",
    "orchestrator.capability.title": "Intermediario de capacidades",
    "orchestrator.resource.title": "Intermediario de recursos",
    "syscalls.intro":
      "Una tabla de despacho de 512 entradas con una convención de llamada de 6 argumentos que coincide con la semántica errno de Linux. Los hooks pre/post permiten trazado, auditoría de seguridad y perfilado de rendimiento sin modificar los manejadores:",
    "syscalls.hooks.title": "Sistema de hooks",
    "syscalls.validation.title": "Validación de argumentos",
    "ipc.intro":
      "Tres primitivas IPC, cada una diseñada para un patrón de comunicación diferente. Todas son sin bloqueo o usan spinning mínimo:",
    "ipc.channels.title": "1. Canales — Buffers circulares MPSC acotados",
    "ipc.eventbus.title": "2. Bus de eventos — Pub/Sub con prioridad",
    "ipc.router.title": "3. Enrutador de mensajes — Solicitud/Respuesta",
    "selfheal.intro":
      "Dos sistemas trabajan juntos para mantener el kernel funcionando incluso cuando los módulos fallan — el gestor de auto-reparación monitorea la salud y activa la recuperación, mientras la recarga en caliente realiza el reemplazo de módulos en vivo:",
    "selfheal.manager.title": "Gestor de auto-reparación",
    "selfheal.hotreload.title": "Sistema de recarga en caliente",
    "selfheal.example.title": "Ejemplo: Intercambio de planificador en vivo",
    "interrupts.intro":
      "Una tabla de despacho de interrupciones de 256 entradas con modos de enrutamiento, manejo de excepciones y manejadores predeterminados para fallos comunes:",
    "debug.intro":
      "Macros de impresión en espacio del kernel que se enrutan a través de la consola de depuración — soportando salida serie y renderizado por framebuffer:",
    "panic.intro":
      "Manejo de pánico personalizado con acciones configurables — el kernel nunca se bloquea silenciosamente:",
  },

  de: {
    "header.title": "Kernel-Kern",
    "header.subtitle":
      "Die vertrauenswürdige Rechenbasis — 6.397 Zeilen in 25 Dateien. Orchestrierung, IPC, Systemaufrufe, Interrupts, Selbstheilung, Hot-Reload und ein Capability-Broker.",
    "header.badge": "TCB",
    "map.intro":
      "Das Core-Crate ist in 7 Module mit strikter Trennung der Zuständigkeiten organisiert:",
    "types.intro":
      "Grundlegende Typen, die von jedem Subsystem geteilt werden. Dies sind die Bausteine:",
    "component.intro":
      "Jede Kernel-Komponente implementiert dieses Trait — bietet einen einheitlichen Lebenszyklus, Gesundheitsüberwachung und Statistik-Schnittstelle:",
    "orchestrator.intro":
      "Der Orchestrator verwaltet den Lebenszyklus der Subsysteme, die Abhängigkeitsreihenfolge und das Capability-Brokering. Er ist das Herz des Kernels — definiert aber nur Mechanismen, keine Richtlinien:",
    "orchestrator.lifecycle.title": "Lebenszyklusmanager",
    "orchestrator.capability.title": "Capability-Broker",
    "orchestrator.resource.title": "Ressourcen-Broker",
    "syscalls.intro":
      "Eine 512-Einträge-Dispatch-Tabelle mit einer 6-Argument-Aufrufkonvention, die der Linux-errno-Semantik entspricht. Pre/Post-Hooks ermöglichen Tracing, Sicherheitsauditing und Performance-Profiling ohne Handler-Modifikation:",
    "syscalls.hooks.title": "Hook-System",
    "syscalls.validation.title": "Argumentvalidierung",
    "ipc.intro":
      "Drei IPC-Primitive, jeweils für ein anderes Kommunikationsmuster konzipiert. Alle sind lock-frei oder verwenden minimales Spinning:",
    "ipc.channels.title": "1. Kanäle — Begrenzte MPSC-Ringpuffer",
    "ipc.eventbus.title": "2. Event-Bus — Pub/Sub mit Priorität",
    "ipc.router.title": "3. Nachrichten-Router — Anfrage/Antwort",
    "selfheal.intro":
      "Zwei Systeme arbeiten zusammen, um den Kernel auch bei Modul-Abstürzen am Laufen zu halten — der Selbstheilungsmanager überwacht die Gesundheit und löst Wiederherstellung aus, während Hot-Reload den Live-Modulaustausch durchführt:",
    "selfheal.manager.title": "Selbstheilungsmanager",
    "selfheal.hotreload.title": "Hot-Reload-System",
    "selfheal.example.title": "Beispiel: Live-Scheduler-Tausch",
    "interrupts.intro":
      "Eine 256-Einträge-Interrupt-Dispatch-Tabelle mit Routing-Modi, Ausnahmebehandlung und Standard-Handlern für häufige Fehler:",
    "debug.intro":
      "Kernel-Space-Print-Makros, die über die Debug-Konsole geleitet werden — mit Unterstützung für serielle Ausgabe und Framebuffer-Rendering:",
    "panic.intro":
      "Benutzerdefinierte Panikbehandlung mit konfigurierbaren Aktionen — der Kernel stürzt nie stillschweigend ab:",
  },

  zh: {
    "header.title": "内核核心",
    "header.subtitle":
      "可信计算基——25 个文件中的 6,397 行代码。编排、IPC、系统调用、中断、自愈、热重载和能力代理。",
    "header.badge": "TCB",
    "map.intro":
      "core crate 组织为 7 个模块，具有严格的关注点分离：",
    "types.intro":
      "每个子系统共享的基本类型。这些是构建基块：",
    "component.intro":
      "每个内核组件都实现此 trait——提供统一的生命周期、健康监控和统计接口：",
    "orchestrator.intro":
      "编排器管理子系统生命周期、依赖排序和能力代理。它是内核的核心——但只定义机制，不定义策略：",
    "orchestrator.lifecycle.title": "生命周期管理器",
    "orchestrator.capability.title": "能力代理",
    "orchestrator.resource.title": "资源代理",
    "syscalls.intro":
      "一个 512 条目的分发表，采用 6 参数调用约定，匹配 Linux errno 语义。前置/后置钩子支持追踪、安全审计和性能分析，无需修改处理程序：",
    "syscalls.hooks.title": "钩子系统",
    "syscalls.validation.title": "参数验证",
    "ipc.intro":
      "三种 IPC 原语，各自为不同的通信模式设计。全部无锁或使用最少自旋：",
    "ipc.channels.title": "1. 通道——有界 MPSC 环形缓冲区",
    "ipc.eventbus.title": "2. 事件总线——带优先级的发布/订阅",
    "ipc.router.title": "3. 消息路由器——请求/响应",
    "selfheal.intro":
      "两个系统协同工作，即使模块崩溃也能保持内核运行——自愈管理器监控健康状况并触发恢复，热重载执行实时模块替换：",
    "selfheal.manager.title": "自愈管理器",
    "selfheal.hotreload.title": "热重载系统",
    "selfheal.example.title": "示例：实时调度器交换",
    "interrupts.intro":
      "一个 256 条目的中断分发表，具有路由模式、异常处理和常见故障的默认处理程序：",
    "debug.intro":
      "通过调试控制台路由的内核空间打印宏——支持串行输出和帧缓冲渲染：",
    "panic.intro":
      "带可配置操作的自定义 panic 处理——内核永远不会静默崩溃：",
  },

  ja: {
    "header.title": "カーネルコア",
    "header.subtitle":
      "信頼できるコンピューティングベース — 25ファイルにわたる6,397行。オーケストレーション、IPC、システムコール、割り込み、自己修復、ホットリロード、ケイパビリティブローカー。",
    "header.badge": "TCB",
    "map.intro":
      "core クレートは厳密な関心の分離を持つ7つのモジュールに整理されています：",
    "types.intro":
      "すべてのサブシステムで共有される基本型。これらは構成要素です：",
    "component.intro":
      "すべてのカーネルコンポーネントがこのトレイトを実装し、統一されたライフサイクル、ヘルスモニタリング、統計インターフェースを提供します：",
    "orchestrator.intro":
      "オーケストレーターはサブシステムのライフサイクル、依存関係の順序付け、ケイパビリティブローカリングを管理します。カーネルの心臓部ですが、メカニズムのみを定義し、ポリシーは定義しません：",
    "orchestrator.lifecycle.title": "ライフサイクルマネージャー",
    "orchestrator.capability.title": "ケイパビリティブローカー",
    "orchestrator.resource.title": "リソースブローカー",
    "syscalls.intro":
      "Linux errno セマンティクスに一致する6引数の呼び出し規約を持つ512エントリのディスパッチテーブル。プレ/ポストフックにより、ハンドラーを変更せずにトレース、セキュリティ監査、パフォーマンスプロファイリングが可能です：",
    "syscalls.hooks.title": "フックシステム",
    "syscalls.validation.title": "引数の検証",
    "ipc.intro":
      "3つのIPC プリミティブ、それぞれ異なる通信パターン用に設計されています。すべてロックフリーまたは最小限のスピニングを使用：",
    "ipc.channels.title": "1. チャネル — 有界MPSCリングバッファ",
    "ipc.eventbus.title": "2. イベントバス — 優先度付きPub/Sub",
    "ipc.router.title": "3. メッセージルーター — リクエスト/レスポンス",
    "selfheal.intro":
      "2つのシステムが連携して、モジュールがクラッシュしてもカーネルを稼働させ続けます — 自己修復マネージャーがヘルスを監視して回復をトリガーし、ホットリロードがライブモジュール置換を実行します：",
    "selfheal.manager.title": "自己修復マネージャー",
    "selfheal.hotreload.title": "ホットリロードシステム",
    "selfheal.example.title": "例：ライブスケジューラスワップ",
    "interrupts.intro":
      "ルーティングモード、例外処理、一般的なフォルトのデフォルトハンドラーを備えた256エントリの割り込みディスパッチテーブル：",
    "debug.intro":
      "デバッグコンソールを経由するカーネル空間のプリントマクロ — シリアル出力とフレームバッファレンダリングをサポート：",
    "panic.intro":
      "設定可能なアクションを持つカスタムパニックハンドリング — カーネルはサイレントにクラッシュすることはありません：",
  },

  ko: {
    "header.title": "커널 코어",
    "header.subtitle":
      "신뢰 컴퓨팅 기반 — 25개 파일에 걸친 6,397줄. 오케스트레이션, IPC, 시스템 호출, 인터럽트, 자가 치유, 핫 리로드, 그리고 기능 브로커.",
    "header.badge": "TCB",
    "map.intro":
      "core 크레이트는 엄격한 관심사 분리를 가진 7개 모듈로 구성됩니다:",
    "types.intro":
      "모든 서브시스템이 공유하는 기본 타입. 이것이 빌딩 블록입니다:",
    "component.intro":
      "모든 커널 컴포넌트가 이 트레이트를 구현합니다 — 통일된 생명주기, 상태 모니터링 및 통계 인터페이스를 제공합니다:",
    "orchestrator.intro":
      "오케스트레이터는 서브시스템 생명주기, 의존성 순서 및 기능 브로커링을 관리합니다. 커널의 심장부이지만 메커니즘만 정의하고 정책은 정의하지 않습니다:",
    "orchestrator.lifecycle.title": "생명주기 관리자",
    "orchestrator.capability.title": "기능 브로커",
    "orchestrator.resource.title": "리소스 브로커",
    "syscalls.intro":
      "Linux errno 의미론과 일치하는 6인자 호출 규약의 512항목 디스패치 테이블. 전/후 훅으로 핸들러 수정 없이 추적, 보안 감사, 성능 프로파일링이 가능합니다:",
    "syscalls.hooks.title": "훅 시스템",
    "syscalls.validation.title": "인자 검증",
    "ipc.intro":
      "세 가지 IPC 프리미티브, 각각 다른 통신 패턴을 위해 설계되었습니다. 모두 락 프리이거나 최소한의 스피닝을 사용합니다:",
    "ipc.channels.title": "1. 채널 — 유한 MPSC 링 버퍼",
    "ipc.eventbus.title": "2. 이벤트 버스 — 우선순위 Pub/Sub",
    "ipc.router.title": "3. 메시지 라우터 — 요청/응답",
    "selfheal.intro":
      "두 시스템이 협력하여 모듈이 충돌해도 커널이 계속 실행되도록 합니다 — 자가 치유 관리자가 상태를 모니터링하고 복구를 트리거하며, 핫 리로드가 실시간 모듈 교체를 수행합니다:",
    "selfheal.manager.title": "자가 치유 관리자",
    "selfheal.hotreload.title": "핫 리로드 시스템",
    "selfheal.example.title": "예시: 실시간 스케줄러 교체",
    "interrupts.intro":
      "라우팅 모드, 예외 처리, 일반적인 결함에 대한 기본 핸들러를 갖춘 256항목 인터럽트 디스패치 테이블:",
    "debug.intro":
      "디버그 콘솔을 통해 라우팅되는 커널 공간 프린트 매크로 — 시리얼 출력과 프레임버퍼 렌더링 지원:",
    "panic.intro":
      "구성 가능한 동작의 커스텀 패닉 처리 — 커널은 절대 조용히 충돌하지 않습니다:",
  },

  pt: {
    "header.title": "Núcleo do Kernel",
    "header.subtitle":
      "A Base de Computação Confiável — 6.397 linhas em 25 arquivos. Orquestração, IPC, chamadas de sistema, interrupções, auto-reparação, hot-reload e um corretor de capacidades.",
    "header.badge": "TCB",
    "map.intro":
      "O crate core é organizado em 7 módulos com separação rigorosa de responsabilidades:",
    "types.intro":
      "Tipos fundamentais compartilhados por cada subsistema. Estes são os blocos de construção:",
    "component.intro":
      "Todo componente do kernel implementa este trait — fornecendo um ciclo de vida uniforme, monitoramento de saúde e interface de estatísticas:",
    "orchestrator.intro":
      "O orquestrador gerencia o ciclo de vida dos subsistemas, ordenação de dependências e intermediação de capacidades. É o coração do kernel — mas define apenas mecanismos, não políticas:",
    "orchestrator.lifecycle.title": "Gerenciador de ciclo de vida",
    "orchestrator.capability.title": "Corretor de capacidades",
    "orchestrator.resource.title": "Corretor de recursos",
    "syscalls.intro":
      "Uma tabela de despacho de 512 entradas com uma convenção de chamada de 6 argumentos correspondendo à semântica errno do Linux. Hooks pré/pós permitem rastreamento, auditoria de segurança e perfilamento de desempenho sem modificar handlers:",
    "syscalls.hooks.title": "Sistema de hooks",
    "syscalls.validation.title": "Validação de argumentos",
    "ipc.intro":
      "Três primitivas IPC, cada uma projetada para um padrão de comunicação diferente. Todas são lock-free ou usam spinning mínimo:",
    "ipc.channels.title": "1. Canais — Buffers circulares MPSC limitados",
    "ipc.eventbus.title": "2. Barramento de eventos — Pub/Sub com prioridade",
    "ipc.router.title": "3. Roteador de mensagens — Requisição/Resposta",
    "selfheal.intro":
      "Dois sistemas trabalham juntos para manter o kernel funcionando mesmo quando módulos falham — o gerenciador de auto-reparação monitora a saúde e aciona recuperação, enquanto o hot-reload realiza substituição de módulos ao vivo:",
    "selfheal.manager.title": "Gerenciador de auto-reparação",
    "selfheal.hotreload.title": "Sistema de hot-reload",
    "selfheal.example.title": "Exemplo: Troca de escalonador ao vivo",
    "interrupts.intro":
      "Uma tabela de despacho de interrupções de 256 entradas com modos de roteamento, tratamento de exceções e handlers padrão para falhas comuns:",
    "debug.intro":
      "Macros de impressão em espaço do kernel roteadas pelo console de depuração — suportando saída serial e renderização por framebuffer:",
    "panic.intro":
      "Tratamento de pânico personalizado com ações configuráveis — o kernel nunca falha silenciosamente:",
  },

  ru: {
    "header.title": "Ядро",
    "header.subtitle":
      "Доверенная вычислительная база — 6 397 строк в 25 файлах. Оркестрация, IPC, системные вызовы, прерывания, самовосстановление, горячая перезагрузка и брокер полномочий.",
    "header.badge": "TCB",
    "map.intro":
      "Крейт core организован в 7 модулей со строгим разделением ответственности:",
    "types.intro":
      "Фундаментальные типы, разделяемые каждой подсистемой. Это строительные блоки:",
    "component.intro":
      "Каждый компонент ядра реализует этот трейт — обеспечивая единый жизненный цикл, мониторинг здоровья и интерфейс статистики:",
    "orchestrator.intro":
      "Оркестратор управляет жизненным циклом подсистем, порядком зависимостей и брокерством полномочий. Это сердце ядра — но определяет только механизмы, а не политики:",
    "orchestrator.lifecycle.title": "Менеджер жизненного цикла",
    "orchestrator.capability.title": "Брокер полномочий",
    "orchestrator.resource.title": "Брокер ресурсов",
    "syscalls.intro":
      "Таблица диспетчеризации на 512 записей с соглашением о вызовах на 6 аргументов, совпадающим с семантикой errno Linux. Хуки до/после позволяют отслеживание, аудит безопасности и профилирование производительности без модификации обработчиков:",
    "syscalls.hooks.title": "Система хуков",
    "syscalls.validation.title": "Валидация аргументов",
    "ipc.intro":
      "Три примитива IPC, каждый из которых предназначен для своего шаблона связи. Все безблокировочные или используют минимальное вращение:",
    "ipc.channels.title": "1. Каналы — Ограниченные кольцевые буферы MPSC",
    "ipc.eventbus.title": "2. Шина событий — Pub/Sub с приоритетом",
    "ipc.router.title": "3. Маршрутизатор сообщений — Запрос/Ответ",
    "selfheal.intro":
      "Две системы работают вместе, чтобы ядро продолжало работать даже при сбоях модулей — менеджер самовосстановления следит за здоровьем и запускает восстановление, а горячая перезагрузка выполняет замену модулей в реальном времени:",
    "selfheal.manager.title": "Менеджер самовосстановления",
    "selfheal.hotreload.title": "Система горячей перезагрузки",
    "selfheal.example.title": "Пример: Замена планировщика на лету",
    "interrupts.intro":
      "Таблица диспетчеризации прерываний на 256 записей с режимами маршрутизации, обработкой исключений и обработчиками по умолчанию для распространённых сбоев:",
    "debug.intro":
      "Макросы печати в пространстве ядра, направляемые через консоль отладки — поддерживают последовательный вывод и рендеринг через фреймбуфер:",
    "panic.intro":
      "Пользовательская обработка паники с настраиваемыми действиями — ядро никогда не падает молча:",
  },

  ar: {
    "header.title": "نواة النظام",
    "header.subtitle":
      "قاعدة الحوسبة الموثوقة — 6,397 سطرًا عبر 25 ملفًا. التنسيق، IPC، استدعاءات النظام، المقاطعات، الإصلاح الذاتي، إعادة التحميل الفوري، ووسيط القدرات.",
    "header.badge": "TCB",
    "map.intro":
      "يتم تنظيم crate core في 7 وحدات مع فصل صارم للمسؤوليات:",
    "types.intro":
      "الأنواع الأساسية المشتركة بين كل نظام فرعي. هذه هي اللبنات الأساسية:",
    "component.intro":
      "كل مكون من مكونات النواة ينفذ هذا الـ trait — يوفر دورة حياة موحدة، ومراقبة الصحة، وواجهة الإحصائيات:",
    "orchestrator.intro":
      "يدير المنسق دورة حياة الأنظمة الفرعية، وترتيب التبعيات، ووساطة القدرات. إنه قلب النواة — لكنه يحدد الآليات فقط، وليس السياسات:",
    "orchestrator.lifecycle.title": "مدير دورة الحياة",
    "orchestrator.capability.title": "وسيط القدرات",
    "orchestrator.resource.title": "وسيط الموارد",
    "syscalls.intro":
      "جدول إرسال من 512 مدخلاً مع اتفاقية استدعاء من 6 وسائط تتوافق مع دلالات errno في Linux. تمكّن الخطافات القبلية/البعدية التتبع، وتدقيق الأمان، وتحليل الأداء دون تعديل المعالجات:",
    "syscalls.hooks.title": "نظام الخطافات",
    "syscalls.validation.title": "التحقق من الوسائط",
    "ipc.intro":
      "ثلاثة بدائيات IPC، كل منها مصمم لنمط اتصال مختلف. جميعها خالية من الأقفال أو تستخدم دورانًا أدنى:",
    "ipc.channels.title": "1. القنوات — مخازن حلقية MPSC محدودة",
    "ipc.eventbus.title": "2. ناقل الأحداث — نشر/اشتراك مع أولوية",
    "ipc.router.title": "3. موجه الرسائل — طلب/استجابة",
    "selfheal.intro":
      "يعمل نظامان معًا للحفاظ على تشغيل النواة حتى عند تعطل الوحدات — يراقب مدير الإصلاح الذاتي الصحة ويطلق الاستعادة، بينما تقوم إعادة التحميل الفوري باستبدال الوحدات مباشرة:",
    "selfheal.manager.title": "مدير الإصلاح الذاتي",
    "selfheal.hotreload.title": "نظام إعادة التحميل الفوري",
    "selfheal.example.title": "مثال: تبديل المجدول أثناء التشغيل",
    "interrupts.intro":
      "جدول إرسال مقاطعات من 256 مدخلاً مع أوضاع التوجيه، ومعالجة الاستثناءات، ومعالجات افتراضية للأعطال الشائعة:",
    "debug.intro":
      "وحدات ماكرو للطباعة في مساحة النواة توجَّه عبر وحدة التحكم في التصحيح — تدعم المخرجات التسلسلية وعرض ذاكرة الإطار:",
    "panic.intro":
      "معالجة ذعر مخصصة مع إجراءات قابلة للتكوين — النواة لا تتعطل أبدًا بصمت:",
  },
};

export default content;
