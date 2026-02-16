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
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
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
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
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
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
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
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
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
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
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
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
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
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  zh: {
    "header.title": "基准测试",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  ja: {
    "header.title": "ベンチマーク",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  ko: {
    "header.title": "벤치마크",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  hi: {
    "header.title": "बेंचमार्क",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  it: {
    "header.title": "Benchmark",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  nl: {
    "header.title": "Benchmarks",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  pl: {
    "header.title": "Benchmarki",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  sv: {
    "header.title": "Prestandatester",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  tr: {
    "header.title": "Karşılaştırmalar",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  uk: {
    "header.title": "Бенчмарки",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  th: {
    "header.title": "เบนช์มาร์ก",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  vi: {
    "header.title": "Benchmark",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  id: {
    "header.title": "Benchmark",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  cs: {
    "header.title": "Benchmarky",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  ro: {
    "header.title": "Benchmark-uri",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  hu: {
    "header.title": "Teljesítménytesztek",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  el: {
    "header.title": "Δοκιμές Απόδοσης",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  he: {
    "header.title": "מדדי ביצועים",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  bn: {
    "header.title": "বেঞ্চমার্ক",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  ms: {
    "header.title": "Penanda Aras",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  fi: {
    "header.title": "Suorituskykytestit",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  da: {
    "header.title": "Ydelsestest",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
  no: {
    "header.title": "Ytelsestester",
    "header.subtitle": "Performance measurement suite for kernel components — scheduler latency, memory allocation throughput, IPC bandwidth, and syscall overhead with statistical analysis.",
    "header.badge": "PERFORMANCE",
    "suite.intro": "The benchmark suite measures the performance of critical kernel operations:",
    "config.intro": "Benchmark configuration and feature flags:",
    "scheduler.intro": "Scheduler performance benchmarks — context switch latency, thread creation, and priority scheduling:",
    "memory.intro": "Memory allocator benchmarks — allocation, deallocation, fragmentation, and throughput:",
    "stats.intro": "Statistical analysis applied to all benchmark results:",
    "running.intro": "How to run the benchmark suite:",
    "section.suite": "Suite Architecture",
    "section.config": "Configuration",
    "section.scheduler": "Scheduler Benchmarks",
    "section.memory": "Memory Benchmarks",
    "section.stats": "Statistical Analysis",
    "section.running": "Running Benchmarks",
  },
};

export default content;
