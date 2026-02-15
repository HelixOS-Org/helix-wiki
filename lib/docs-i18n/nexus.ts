import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "NEXUS Intelligence",
    "header.subtitle":
      "812,000 lines of AI/ML code running in kernel space — crash prediction, anomaly detection, self-healing, quarantine, and micro-rollback. All in pure no_std Rust.",
    "header.badge": "AI/ML ENGINE",

    // Overview
    "overview.intro":
      "NEXUS is the AI brain of Helix — a full machine learning framework running inside the kernel with zero external dependencies.",

    // Module Inventory
    "inventory.intro":
      "NEXUS is organized into specialized modules, each handling a different aspect of kernel intelligence:",

    // ML Framework
    "ml.intro":
      "A complete ML framework built from scratch for no_std environments — decision trees, random forests, neural networks, k-means clustering, and online learning:",
    "ml.tree.title": "Decision Trees",
    "ml.forest.title": "Random Forests",
    "ml.nn.title": "Neural Networks",
    "ml.kmeans.title": "K-Means Clustering",
    "ml.online.title": "Online Learning",

    // Crash Prediction
    "crash.intro":
      "Predicts module failures before they happen — using historical crash patterns, resource usage trends, and behavioral anomalies:",

    // Anomaly Detection
    "anomaly.intro":
      "Statistical anomaly detection for CPU usage, memory consumption, IPC latency, and syscall patterns:",

    // Quarantine
    "quarantine.intro":
      "When a module is detected as malicious or unstable, NEXUS isolates it in a quarantine sandbox with limited resources:",

    // Roadmap
    "roadmap.intro":
      "Planned NEXUS enhancements for future versions:",
  },

  fr: {
    // PageHeader
    "header.title": "Intelligence NEXUS",
    "header.subtitle":
      "812 000 lignes de code IA/ML s'exécutant dans l'espace noyau — prédiction de crash, détection d'anomalies, auto-réparation, quarantaine et micro-rollback. Le tout en Rust pur no_std.",
    "header.badge": "MOTEUR IA/ML",

    // Overview
    "overview.intro":
      "NEXUS est le cerveau IA de Helix — un framework complet d'apprentissage automatique s'exécutant à l'intérieur du noyau sans aucune dépendance externe.",

    // Module Inventory
    "inventory.intro":
      "NEXUS est organisé en modules spécialisés, chacun gérant un aspect différent de l'intelligence du noyau :",

    // ML Framework
    "ml.intro":
      "Un framework ML complet construit de zéro pour les environnements no_std — arbres de décision, forêts aléatoires, réseaux de neurones, clustering k-means et apprentissage en ligne :",
    "ml.tree.title": "Arbres de décision",
    "ml.forest.title": "Forêts aléatoires",
    "ml.nn.title": "Réseaux de neurones",
    "ml.kmeans.title": "Clustering K-Means",
    "ml.online.title": "Apprentissage en ligne",

    // Crash Prediction
    "crash.intro":
      "Prédit les défaillances des modules avant qu'elles ne se produisent — en utilisant les schémas de crash historiques, les tendances d'utilisation des ressources et les anomalies comportementales :",

    // Anomaly Detection
    "anomaly.intro":
      "Détection statistique d'anomalies pour l'utilisation du CPU, la consommation mémoire, la latence IPC et les schémas d'appels système :",

    // Quarantine
    "quarantine.intro":
      "Lorsqu'un module est détecté comme malveillant ou instable, NEXUS l'isole dans un bac à sable de quarantaine avec des ressources limitées :",

    // Roadmap
    "roadmap.intro":
      "Améliorations NEXUS planifiées pour les versions futures :",
  },

  es: {
    "header.title": "Inteligencia NEXUS",
    "header.subtitle":
      "812.000 líneas de código IA/ML ejecutándose en espacio del kernel — predicción de fallos, detección de anomalías, auto-reparación, cuarentena y micro-rollback. Todo en Rust puro no_std.",
    "header.badge": "MOTOR IA/ML",
    "overview.intro":
      "NEXUS es el cerebro IA de Helix — un framework completo de aprendizaje automático ejecutándose dentro del kernel sin dependencias externas.",
    "inventory.intro":
      "NEXUS está organizado en módulos especializados, cada uno gestionando un aspecto diferente de la inteligencia del kernel:",
    "ml.intro":
      "Un framework ML completo construido desde cero para entornos no_std — árboles de decisión, bosques aleatorios, redes neuronales, clustering k-means y aprendizaje en línea:",
    "ml.tree.title": "Árboles de decisión",
    "ml.forest.title": "Bosques aleatorios",
    "ml.nn.title": "Redes neuronales",
    "ml.kmeans.title": "Clustering K-Means",
    "ml.online.title": "Aprendizaje en línea",
    "crash.intro":
      "Predice fallos de módulos antes de que ocurran — usando patrones de crash históricos, tendencias de uso de recursos y anomalías de comportamiento:",
    "anomaly.intro":
      "Detección estadística de anomalías para uso de CPU, consumo de memoria, latencia IPC y patrones de llamadas al sistema:",
    "quarantine.intro":
      "Cuando un módulo es detectado como malicioso o inestable, NEXUS lo aísla en un sandbox de cuarentena con recursos limitados:",
    "roadmap.intro":
      "Mejoras de NEXUS planificadas para versiones futuras:",
  },

  de: {
    "header.title": "NEXUS-Intelligenz",
    "header.subtitle":
      "812.000 Zeilen KI/ML-Code im Kernel-Space — Crash-Vorhersage, Anomalieerkennung, Selbstheilung, Quarantäne und Micro-Rollback. Alles in reinem no_std Rust.",
    "header.badge": "KI/ML-ENGINE",
    "overview.intro":
      "NEXUS ist das KI-Gehirn von Helix — ein vollständiges Machine-Learning-Framework, das im Kernel ohne externe Abhängigkeiten läuft.",
    "inventory.intro":
      "NEXUS ist in spezialisierte Module organisiert, die jeweils einen anderen Aspekt der Kernel-Intelligenz behandeln:",
    "ml.intro":
      "Ein vollständiges ML-Framework, von Grund auf für no_std-Umgebungen entwickelt — Entscheidungsbäume, Random Forests, neuronale Netze, K-Means-Clustering und Online-Lernen:",
    "ml.tree.title": "Entscheidungsbäume",
    "ml.forest.title": "Random Forests",
    "ml.nn.title": "Neuronale Netze",
    "ml.kmeans.title": "K-Means-Clustering",
    "ml.online.title": "Online-Lernen",
    "crash.intro":
      "Sagt Modulausfälle vorher, bevor sie auftreten — unter Verwendung historischer Crash-Muster, Ressourcennutzungstrends und Verhaltensanomalien:",
    "anomaly.intro":
      "Statistische Anomalieerkennung für CPU-Auslastung, Speicherverbrauch, IPC-Latenz und Syscall-Muster:",
    "quarantine.intro":
      "Wenn ein Modul als bösartig oder instabil erkannt wird, isoliert NEXUS es in einer Quarantäne-Sandbox mit begrenzten Ressourcen:",
    "roadmap.intro":
      "Geplante NEXUS-Erweiterungen für zukünftige Versionen:",
  },

  zh: {
    "header.title": "NEXUS 智能",
    "header.subtitle":
      "812,000 行 AI/ML 代码在内核空间运行——崩溃预测、异常检测、自愈、隔离和微回滚。全部使用纯 no_std Rust。",
    "header.badge": "AI/ML 引擎",
    "overview.intro":
      "NEXUS 是 Helix 的 AI 大脑——一个在内核中运行的完整机器学习框架，零外部依赖。",
    "inventory.intro":
      "NEXUS 组织为专门的模块，每个模块处理内核智能的不同方面：",
    "ml.intro":
      "一个从头构建的完整 ML 框架，适用于 no_std 环境——决策树、随机森林、神经网络、K-Means 聚类和在线学习：",
    "ml.tree.title": "决策树",
    "ml.forest.title": "随机森林",
    "ml.nn.title": "神经网络",
    "ml.kmeans.title": "K-Means 聚类",
    "ml.online.title": "在线学习",
    "crash.intro":
      "在模块故障发生之前预测——使用历史崩溃模式、资源使用趋势和行为异常：",
    "anomaly.intro":
      "CPU 使用率、内存消耗、IPC 延迟和系统调用模式的统计异常检测：",
    "quarantine.intro":
      "当检测到模块为恶意或不稳定时，NEXUS 将其隔离在资源有限的隔离沙箱中：",
    "roadmap.intro":
      "为未来版本计划的 NEXUS 增强功能：",
  },

  ja: {
    "header.title": "NEXUS インテリジェンス",
    "header.subtitle":
      "カーネル空間で実行される812,000行のAI/MLコード — クラッシュ予測、異常検出、自己修復、隔離、マイクロロールバック。すべて純粋なno_std Rustで。",
    "header.badge": "AI/MLエンジン",
    "overview.intro":
      "NEXUSはHelixのAI頭脳 — 外部依存ゼロでカーネル内部で動作する完全な機械学習フレームワークです。",
    "inventory.intro":
      "NEXUSは専門化されたモジュールに整理されており、各モジュールがカーネルインテリジェンスの異なる側面を処理します：",
    "ml.intro":
      "no_std環境のためにゼロから構築された完全なMLフレームワーク — 決定木、ランダムフォレスト、ニューラルネットワーク、K-Meansクラスタリング、オンライン学習：",
    "ml.tree.title": "決定木",
    "ml.forest.title": "ランダムフォレスト",
    "ml.nn.title": "ニューラルネットワーク",
    "ml.kmeans.title": "K-Meansクラスタリング",
    "ml.online.title": "オンライン学習",
    "crash.intro":
      "モジュール障害を発生前に予測 — 過去のクラッシュパターン、リソース使用傾向、行動異常を使用：",
    "anomaly.intro":
      "CPU使用率、メモリ消費、IPCレイテンシ、システムコールパターンの統計的異常検出：",
    "quarantine.intro":
      "モジュールが悪意あるまたは不安定と検出された場合、NEXUSはリソースが制限された隔離サンドボックスに隔離します：",
    "roadmap.intro":
      "将来のバージョンに計画されているNEXUSの強化機能：",
  },

  ko: {
    "header.title": "NEXUS 인텔리전스",
    "header.subtitle":
      "커널 공간에서 실행되는 812,000줄의 AI/ML 코드 — 크래시 예측, 이상 탐지, 자가 치유, 격리, 마이크로 롤백. 모두 순수 no_std Rust로.",
    "header.badge": "AI/ML 엔진",
    "overview.intro":
      "NEXUS는 Helix의 AI 두뇌 — 외부 의존성 없이 커널 내부에서 실행되는 완전한 머신 러닝 프레임워크입니다.",
    "inventory.intro":
      "NEXUS는 전문화된 모듈로 구성되며, 각 모듈이 커널 인텔리전스의 다른 측면을 처리합니다:",
    "ml.intro":
      "no_std 환경을 위해 처음부터 구축된 완전한 ML 프레임워크 — 결정 트리, 랜덤 포레스트, 신경망, K-Means 클러스터링, 온라인 학습:",
    "ml.tree.title": "결정 트리",
    "ml.forest.title": "랜덤 포레스트",
    "ml.nn.title": "신경망",
    "ml.kmeans.title": "K-Means 클러스터링",
    "ml.online.title": "온라인 학습",
    "crash.intro":
      "모듈 장애가 발생하기 전에 예측 — 과거 크래시 패턴, 리소스 사용 추세, 행동 이상을 활용:",
    "anomaly.intro":
      "CPU 사용률, 메모리 소비, IPC 지연, 시스템 호출 패턴에 대한 통계적 이상 탐지:",
    "quarantine.intro":
      "모듈이 악성 또는 불안정으로 감지되면 NEXUS는 제한된 리소스로 격리 샌드박스에 격리합니다:",
    "roadmap.intro":
      "향후 버전을 위해 계획된 NEXUS 개선 사항:",
  },

  pt: {
    "header.title": "Inteligência NEXUS",
    "header.subtitle":
      "812.000 linhas de código IA/ML executando no espaço do kernel — predição de falhas, detecção de anomalias, auto-reparação, quarentena e micro-rollback. Tudo em Rust puro no_std.",
    "header.badge": "MOTOR IA/ML",
    "overview.intro":
      "NEXUS é o cérebro IA do Helix — um framework completo de aprendizado de máquina executando dentro do kernel com zero dependências externas.",
    "inventory.intro":
      "NEXUS é organizado em módulos especializados, cada um lidando com um aspecto diferente da inteligência do kernel:",
    "ml.intro":
      "Um framework ML completo construído do zero para ambientes no_std — árvores de decisão, florestas aleatórias, redes neurais, clustering k-means e aprendizado online:",
    "ml.tree.title": "Árvores de decisão",
    "ml.forest.title": "Florestas aleatórias",
    "ml.nn.title": "Redes neurais",
    "ml.kmeans.title": "Clustering K-Means",
    "ml.online.title": "Aprendizado online",
    "crash.intro":
      "Prevê falhas de módulos antes que aconteçam — usando padrões históricos de crash, tendências de uso de recursos e anomalias comportamentais:",
    "anomaly.intro":
      "Detecção estatística de anomalias para uso de CPU, consumo de memória, latência IPC e padrões de chamadas de sistema:",
    "quarantine.intro":
      "Quando um módulo é detectado como malicioso ou instável, NEXUS o isola em um sandbox de quarentena com recursos limitados:",
    "roadmap.intro":
      "Melhorias do NEXUS planejadas para versões futuras:",
  },

  ru: {
    "header.title": "Интеллект NEXUS",
    "header.subtitle":
      "812 000 строк кода ИИ/МО, работающих в пространстве ядра — предсказание сбоев, обнаружение аномалий, самовосстановление, карантин и микро-откат. Всё на чистом no_std Rust.",
    "header.badge": "ДВИЖОК ИИ/МО",
    "overview.intro":
      "NEXUS — это ИИ-мозг Helix — полноценный фреймворк машинного обучения, работающий внутри ядра без внешних зависимостей.",
    "inventory.intro":
      "NEXUS организован в специализированные модули, каждый из которых отвечает за свой аспект интеллекта ядра:",
    "ml.intro":
      "Полный ML-фреймворк, построенный с нуля для no_std-сред — деревья решений, случайные леса, нейронные сети, кластеризация k-means и онлайн-обучение:",
    "ml.tree.title": "Деревья решений",
    "ml.forest.title": "Случайные леса",
    "ml.nn.title": "Нейронные сети",
    "ml.kmeans.title": "Кластеризация K-Means",
    "ml.online.title": "Онлайн-обучение",
    "crash.intro":
      "Предсказывает сбои модулей до их возникновения — используя исторические паттерны аварий, тренды использования ресурсов и поведенческие аномалии:",
    "anomaly.intro":
      "Статистическое обнаружение аномалий для использования ЦП, потребления памяти, задержки IPC и паттернов системных вызовов:",
    "quarantine.intro":
      "Когда модуль обнаружен как вредоносный или нестабильный, NEXUS изолирует его в карантинной песочнице с ограниченными ресурсами:",
    "roadmap.intro":
      "Запланированные улучшения NEXUS для будущих версий:",
  },

  ar: {
    "header.title": "ذكاء NEXUS",
    "header.subtitle":
      "812,000 سطر من كود الذكاء الاصطناعي/التعلم الآلي يعمل في مساحة النواة — التنبؤ بالأعطال، اكتشاف الشذوذ، الإصلاح الذاتي، الحجر الصحي، والتراجع الدقيق. الكل بلغة Rust خالصة no_std.",
    "header.badge": "محرك ذكاء اصطناعي",
    "overview.intro":
      "NEXUS هو الدماغ الذكي لـ Helix — إطار عمل كامل للتعلم الآلي يعمل داخل النواة بدون أي تبعيات خارجية.",
    "inventory.intro":
      "يتم تنظيم NEXUS في وحدات متخصصة، كل منها يتعامل مع جانب مختلف من ذكاء النواة:",
    "ml.intro":
      "إطار عمل ML كامل مبني من الصفر لبيئات no_std — أشجار القرار، الغابات العشوائية، الشبكات العصبية، تجميع k-means، والتعلم عبر الإنترنت:",
    "ml.tree.title": "أشجار القرار",
    "ml.forest.title": "الغابات العشوائية",
    "ml.nn.title": "الشبكات العصبية",
    "ml.kmeans.title": "تجميع K-Means",
    "ml.online.title": "التعلم عبر الإنترنت",
    "crash.intro":
      "يتنبأ بأعطال الوحدات قبل حدوثها — باستخدام أنماط الأعطال التاريخية واتجاهات استخدام الموارد والشذوذ السلوكي:",
    "anomaly.intro":
      "اكتشاف إحصائي للشذوذ في استخدام المعالج واستهلاك الذاكرة وزمن استجابة IPC وأنماط استدعاءات النظام:",
    "quarantine.intro":
      "عندما يتم اكتشاف وحدة كخبيثة أو غير مستقرة، يقوم NEXUS بعزلها في صندوق حماية حجر صحي بموارد محدودة:",
    "roadmap.intro":
      "تحسينات NEXUS المخططة للإصدارات المستقبلية:",
  },
};

export default content;
