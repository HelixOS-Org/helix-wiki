import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "Benchmarks",
    "header.subtitle":
      "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",

    // Suite
    "suite.intro":
      "The benchmark suite measures the performance of critical kernel operations:",

    // Config
    "config.intro":
      "Benchmark configuration and feature flags:",

    // Scheduler
    "scheduler.intro":
      "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",

    // Memory
    "memory.intro":
      "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",

    // Statistics
    "stats.intro":
      "Statistical analysis applied to all benchmark results:",

    // Running
    "running.intro":
      "How to run the benchmark suite:",
  },

  fr: {
    // PageHeader
    "header.title": "Benchmarks",
    "header.subtitle":
      "Suite de mesure de performance pour les composants du noyau — latence de l'ordonnanceur, débit d'allocation mémoire, bande passante IPC et surcharge des appels système avec analyse statistique.",
    "header.badge": "PERFORMANCE",

    // Suite
    "suite.intro":
      "La suite de benchmarks mesure la performance des opérations critiques du noyau :",

    // Config
    "config.intro":
      "Configuration des benchmarks et drapeaux de fonctionnalités :",

    // Scheduler
    "scheduler.intro":
      "Benchmarks de performance de l'ordonnanceur — latence de changement de contexte, création de threads et ordonnancement par priorité :",

    // Memory
    "memory.intro":
      "Benchmarks de l'allocateur mémoire — allocation, désallocation, fragmentation et débit :",

    // Statistics
    "stats.intro":
      "Analyse statistique appliquée à tous les résultats de benchmarks :",

    // Running
    "running.intro":
      "Comment exécuter la suite de benchmarks :",
  },

  es: {
    "header.title": "Benchmarks",
    "header.subtitle":
      "Suite de medición de rendimiento para componentes del kernel — latencia del planificador, rendimiento de asignación de memoria, ancho de banda IPC y sobrecarga de llamadas al sistema con análisis estadístico.",
    "header.badge": "RENDIMIENTO",
    "suite.intro":
      "La suite de benchmarks mide el rendimiento de las operaciones críticas del kernel:",
    "config.intro":
      "Configuración de benchmarks y flags de características:",
    "scheduler.intro":
      "Benchmarks de rendimiento del planificador — latencia de cambio de contexto, creación de hilos y planificación por prioridad:",
    "memory.intro":
      "Benchmarks del asignador de memoria — asignación, desasignación, fragmentación y rendimiento:",
    "stats.intro":
      "Análisis estadístico aplicado a todos los resultados de benchmarks:",
    "running.intro":
      "Cómo ejecutar la suite de benchmarks:",
  },

  de: {
    "header.title": "Benchmarks",
    "header.subtitle":
      "Performance-Messsuite für Kernel-Komponenten — Scheduler-Latenz, Speicherallokationsdurchsatz, IPC-Bandbreite und Syscall-Overhead mit statistischer Analyse.",
    "header.badge": "LEISTUNG",
    "suite.intro":
      "Die Benchmark-Suite misst die Performance kritischer Kernel-Operationen:",
    "config.intro":
      "Benchmark-Konfiguration und Feature-Flags:",
    "scheduler.intro":
      "Scheduler-Performance-Benchmarks — Kontextwechsel-Latenz, Thread-Erstellung und Prioritätsplanung:",
    "memory.intro":
      "Speicherallokator-Benchmarks — Allokation, Deallokation, Fragmentierung und Durchsatz:",
    "stats.intro":
      "Statistische Analyse, angewendet auf alle Benchmark-Ergebnisse:",
    "running.intro":
      "So führen Sie die Benchmark-Suite aus:",
  },

  zh: {
    "header.title": "基准测试",
    "header.subtitle":
      "内核组件的性能测量套件——调度器延迟、内存分配吞吐量、IPC 带宽和系统调用开销，附带统计分析。",
    "header.badge": "性能",
    "suite.intro":
      "基准测试套件测量关键内核操作的性能：",
    "config.intro":
      "基准测试配置和功能标志：",
    "scheduler.intro":
      "调度器性能基准测试——上下文切换延迟、线程创建和优先级调度：",
    "memory.intro":
      "内存分配器基准测试——分配、释放、碎片化和吞吐量：",
    "stats.intro":
      "应用于所有基准测试结果的统计分析：",
    "running.intro":
      "如何运行基准测试套件：",
  },

  ja: {
    "header.title": "ベンチマーク",
    "header.subtitle":
      "カーネルコンポーネントのパフォーマンス測定スイート — スケジューラーレイテンシ、メモリ割り当てスループット、IPC帯域幅、統計分析付きシステムコールオーバーヘッド。",
    "header.badge": "パフォーマンス",
    "suite.intro":
      "ベンチマークスイートは重要なカーネル操作のパフォーマンスを測定します：",
    "config.intro":
      "ベンチマーク設定と機能フラグ：",
    "scheduler.intro":
      "スケジューラーパフォーマンスベンチマーク — コンテキストスイッチレイテンシ、スレッド作成、優先度スケジューリング：",
    "memory.intro":
      "メモリアロケーターベンチマーク — 割り当て、解放、フラグメンテーション、スループット：",
    "stats.intro":
      "すべてのベンチマーク結果に適用される統計分析：",
    "running.intro":
      "ベンチマークスイートの実行方法：",
  },

  ko: {
    "header.title": "벤치마크",
    "header.subtitle":
      "커널 컴포넌트를 위한 성능 측정 스위트 — 스케줄러 지연, 메모리 할당 처리량, IPC 대역폭, 통계 분석이 포함된 시스템 호출 오버헤드.",
    "header.badge": "성능",
    "suite.intro":
      "벤치마크 스위트는 중요한 커널 작업의 성능을 측정합니다:",
    "config.intro":
      "벤치마크 구성 및 기능 플래그:",
    "scheduler.intro":
      "스케줄러 성능 벤치마크 — 컨텍스트 스위치 지연, 스레드 생성, 우선순위 스케줄링:",
    "memory.intro":
      "메모리 할당기 벤치마크 — 할당, 해제, 단편화, 처리량:",
    "stats.intro":
      "모든 벤치마크 결과에 적용되는 통계 분석:",
    "running.intro":
      "벤치마크 스위트를 실행하는 방법:",
  },

  pt: {
    "header.title": "Benchmarks",
    "header.subtitle":
      "Suite de medição de desempenho para componentes do kernel — latência do escalonador, throughput de alocação de memória, largura de banda IPC e overhead de chamadas de sistema com análise estatística.",
    "header.badge": "DESEMPENHO",
    "suite.intro":
      "A suite de benchmarks mede o desempenho de operações críticas do kernel:",
    "config.intro":
      "Configuração de benchmarks e flags de funcionalidades:",
    "scheduler.intro":
      "Benchmarks de desempenho do escalonador — latência de troca de contexto, criação de threads e escalonamento por prioridade:",
    "memory.intro":
      "Benchmarks do alocador de memória — alocação, desalocação, fragmentação e throughput:",
    "stats.intro":
      "Análise estatística aplicada a todos os resultados de benchmarks:",
    "running.intro":
      "Como executar a suite de benchmarks:",
  },

  ru: {
    "header.title": "Бенчмарки",
    "header.subtitle":
      "Набор измерения производительности для компонентов ядра — задержка планировщика, пропускная способность выделения памяти, пропускная способность IPC и накладные расходы системных вызовов со статистическим анализом.",
    "header.badge": "ПРОИЗВОДИТЕЛЬНОСТЬ",
    "suite.intro":
      "Набор бенчмарков измеряет производительность критических операций ядра:",
    "config.intro":
      "Конфигурация бенчмарков и флаги функций:",
    "scheduler.intro":
      "Бенчмарки производительности планировщика — задержка переключения контекста, создание потоков и приоритетное планирование:",
    "memory.intro":
      "Бенчмарки аллокатора памяти — выделение, освобождение, фрагментация и пропускная способность:",
    "stats.intro":
      "Статистический анализ, применяемый ко всем результатам бенчмарков:",
    "running.intro":
      "Как запустить набор бенчмарков:",
  },

  ar: {
    "header.title": "اختبارات الأداء",
    "header.subtitle":
      "مجموعة قياس الأداء لمكونات النواة — زمن استجابة المجدول، إنتاجية تخصيص الذاكرة، عرض نطاق IPC، وحمل استدعاءات النظام مع تحليل إحصائي.",
    "header.badge": "الأداء",
    "suite.intro":
      "تقيس مجموعة اختبارات الأداء أداء عمليات النواة الحرجة:",
    "config.intro":
      "تكوين اختبارات الأداء وأعلام الميزات:",
    "scheduler.intro":
      "اختبارات أداء المجدول — زمن استجابة تبديل السياق، إنشاء الخيوط، والجدولة حسب الأولوية:",
    "memory.intro":
      "اختبارات أداء مخصص الذاكرة — التخصيص، إلغاء التخصيص، التجزئة، والإنتاجية:",
    "stats.intro":
      "التحليل الإحصائي المطبق على جميع نتائج اختبارات الأداء:",
    "running.intro":
      "كيفية تشغيل مجموعة اختبارات الأداء:",
  },
};

export default content;
