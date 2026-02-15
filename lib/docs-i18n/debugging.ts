import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "Debugging",
    "header.subtitle":
      "Comprehensive debugging toolkit — serial console, QEMU integration, GDB remote debugging, crash analysis, memory debugging, and binary inspection tools.",
    "header.badge": "DEBUG TOOLKIT",

    // Debug Build
    "debug_build.intro":
      "Enable debug symbols and assertions for development builds:",

    // Serial Console
    "serial.intro":
      "The kernel provides print macros that output through the serial port:",

    // QEMU
    "qemu.intro":
      "QEMU flags for effective kernel debugging:",

    // GDB
    "gdb.intro":
      "Remote GDB debugging over QEMU's built-in GDB server:",

    // Crash Analysis
    "crash.intro":
      "Analyzing kernel panics and exception frames:",

    // Memory Debugging
    "memory_debug.intro":
      "Memory debugging techniques — poison values, guard pages, leak tracking, and page table dumps:",

    // Tools
    "tools.intro":
      "Binary analysis tools for the kernel image:",
  },

  fr: {
    // PageHeader
    "header.title": "Débogage",
    "header.subtitle":
      "Boîte à outils de débogage complète — console série, intégration QEMU, débogage distant GDB, analyse de crash, débogage mémoire et outils d'inspection binaire.",
    "header.badge": "OUTILS DE DÉBOGAGE",

    // Debug Build
    "debug_build.intro":
      "Activer les symboles de débogage et les assertions pour les builds de développement :",

    // Serial Console
    "serial.intro":
      "Le noyau fournit des macros d'impression qui sortent via le port série :",

    // QEMU
    "qemu.intro":
      "Drapeaux QEMU pour un débogage efficace du noyau :",

    // GDB
    "gdb.intro":
      "Débogage distant GDB via le serveur GDB intégré de QEMU :",

    // Crash Analysis
    "crash.intro":
      "Analyse des paniques du noyau et des cadres d'exception :",

    // Memory Debugging
    "memory_debug.intro":
      "Techniques de débogage mémoire — valeurs empoisonnées, pages de garde, suivi des fuites et dumps de tables de pages :",

    // Tools
    "tools.intro":
      "Outils d'analyse binaire pour l'image du noyau :",
  },

  es: {
    "header.title": "Depuración",
    "header.subtitle":
      "Kit de herramientas de depuración completo — consola serie, integración QEMU, depuración remota GDB, análisis de fallos, depuración de memoria y herramientas de inspección binaria.",
    "header.badge": "HERRAMIENTAS DE DEPURACIÓN",
    "debug_build.intro":
      "Habilitar símbolos de depuración y aserciones para builds de desarrollo:",
    "serial.intro":
      "El kernel proporciona macros de impresión que envían la salida a través del puerto serie:",
    "qemu.intro":
      "Flags de QEMU para depuración efectiva del kernel:",
    "gdb.intro":
      "Depuración remota GDB a través del servidor GDB integrado de QEMU:",
    "crash.intro":
      "Análisis de pánicos del kernel y marcos de excepción:",
    "memory_debug.intro":
      "Técnicas de depuración de memoria — valores envenenados, páginas de guarda, seguimiento de fugas y volcados de tablas de páginas:",
    "tools.intro":
      "Herramientas de análisis binario para la imagen del kernel:",
  },

  de: {
    "header.title": "Debugging",
    "header.subtitle":
      "Umfassendes Debugging-Toolkit — serielle Konsole, QEMU-Integration, GDB-Remote-Debugging, Crash-Analyse, Speicher-Debugging und binäre Inspektionstools.",
    "header.badge": "DEBUG-TOOLKIT",
    "debug_build.intro":
      "Debug-Symbole und Assertions für Entwicklungs-Builds aktivieren:",
    "serial.intro":
      "Der Kernel bietet Print-Makros, die über den seriellen Port ausgeben:",
    "qemu.intro":
      "QEMU-Flags für effektives Kernel-Debugging:",
    "gdb.intro":
      "Remote-GDB-Debugging über QEMUs integrierten GDB-Server:",
    "crash.intro":
      "Analyse von Kernel-Panics und Ausnahme-Frames:",
    "memory_debug.intro":
      "Speicher-Debugging-Techniken — Poison-Werte, Guard-Pages, Leak-Tracking und Seitentabellen-Dumps:",
    "tools.intro":
      "Binäranalyse-Tools für das Kernel-Image:",
  },

  zh: {
    "header.title": "调试",
    "header.subtitle":
      "全面的调试工具包——串行控制台、QEMU 集成、GDB 远程调试、崩溃分析、内存调试和二进制检查工具。",
    "header.badge": "调试工具包",
    "debug_build.intro":
      "为开发构建启用调试符号和断言：",
    "serial.intro":
      "内核提供通过串行端口输出的打印宏：",
    "qemu.intro":
      "用于高效内核调试的 QEMU 标志：",
    "gdb.intro":
      "通过 QEMU 内置 GDB 服务器进行远程 GDB 调试：",
    "crash.intro":
      "分析内核 panic 和异常帧：",
    "memory_debug.intro":
      "内存调试技术——毒值、守护页、泄漏跟踪和页表转储：",
    "tools.intro":
      "内核映像的二进制分析工具：",
  },

  ja: {
    "header.title": "デバッグ",
    "header.subtitle":
      "包括的なデバッグツールキット — シリアルコンソール、QEMU統合、GDBリモートデバッグ、クラッシュ分析、メモリデバッグ、バイナリ検査ツール。",
    "header.badge": "デバッグツールキット",
    "debug_build.intro":
      "開発ビルドのデバッグシンボルとアサーションを有効にする：",
    "serial.intro":
      "カーネルはシリアルポートを通じて出力するプリントマクロを提供します：",
    "qemu.intro":
      "効果的なカーネルデバッグのためのQEMUフラグ：",
    "gdb.intro":
      "QEMUの内蔵GDBサーバーを介したリモートGDBデバッグ：",
    "crash.intro":
      "カーネルパニックと例外フレームの分析：",
    "memory_debug.intro":
      "メモリデバッグ技法 — ポイズン値、ガードページ、リーク追跡、ページテーブルダンプ：",
    "tools.intro":
      "カーネルイメージのバイナリ分析ツール：",
  },

  ko: {
    "header.title": "디버깅",
    "header.subtitle":
      "종합적인 디버깅 툴킷 — 시리얼 콘솔, QEMU 통합, GDB 원격 디버깅, 크래시 분석, 메모리 디버깅, 바이너리 검사 도구.",
    "header.badge": "디버그 툴킷",
    "debug_build.intro":
      "개발 빌드에 디버그 심볼과 어설션 활성화:",
    "serial.intro":
      "커널은 시리얼 포트를 통해 출력하는 프린트 매크로를 제공합니다:",
    "qemu.intro":
      "효과적인 커널 디버깅을 위한 QEMU 플래그:",
    "gdb.intro":
      "QEMU 내장 GDB 서버를 통한 원격 GDB 디버깅:",
    "crash.intro":
      "커널 패닉 및 예외 프레임 분석:",
    "memory_debug.intro":
      "메모리 디버깅 기법 — 포이즌 값, 가드 페이지, 누수 추적, 페이지 테이블 덤프:",
    "tools.intro":
      "커널 이미지를 위한 바이너리 분석 도구:",
  },

  pt: {
    "header.title": "Depuração",
    "header.subtitle":
      "Kit de ferramentas de depuração abrangente — console serial, integração QEMU, depuração remota GDB, análise de falhas, depuração de memória e ferramentas de inspeção binária.",
    "header.badge": "KIT DE DEPURAÇÃO",
    "debug_build.intro":
      "Habilitar símbolos de depuração e asserções para builds de desenvolvimento:",
    "serial.intro":
      "O kernel fornece macros de impressão que enviam saída pelo porta serial:",
    "qemu.intro":
      "Flags do QEMU para depuração eficaz do kernel:",
    "gdb.intro":
      "Depuração remota GDB pelo servidor GDB integrado do QEMU:",
    "crash.intro":
      "Análise de panics do kernel e frames de exceção:",
    "memory_debug.intro":
      "Técnicas de depuração de memória — valores envenenados, páginas de guarda, rastreamento de vazamentos e dumps de tabelas de páginas:",
    "tools.intro":
      "Ferramentas de análise binária para a imagem do kernel:",
  },

  ru: {
    "header.title": "Отладка",
    "header.subtitle":
      "Комплексный набор инструментов отладки — последовательная консоль, интеграция с QEMU, удалённая отладка GDB, анализ аварий, отладка памяти и инструменты бинарного анализа.",
    "header.badge": "ИНСТРУМЕНТЫ ОТЛАДКИ",
    "debug_build.intro":
      "Включение отладочных символов и утверждений для сборок разработки:",
    "serial.intro":
      "Ядро предоставляет макросы печати, выводящие данные через последовательный порт:",
    "qemu.intro":
      "Флаги QEMU для эффективной отладки ядра:",
    "gdb.intro":
      "Удалённая отладка GDB через встроенный GDB-сервер QEMU:",
    "crash.intro":
      "Анализ паник ядра и фреймов исключений:",
    "memory_debug.intro":
      "Методы отладки памяти — отравленные значения, охранные страницы, отслеживание утечек и дампы таблиц страниц:",
    "tools.intro":
      "Инструменты бинарного анализа для образа ядра:",
  },

  ar: {
    "header.title": "التصحيح",
    "header.subtitle":
      "مجموعة أدوات تصحيح شاملة — وحدة التحكم التسلسلية، تكامل QEMU، تصحيح GDB عن بُعد، تحليل الأعطال، تصحيح الذاكرة، وأدوات فحص الثنائيات.",
    "header.badge": "أدوات التصحيح",
    "debug_build.intro":
      "تمكين رموز التصحيح والتأكيدات لبناءات التطوير:",
    "serial.intro":
      "توفر النواة وحدات ماكرو للطباعة تُخرج عبر المنفذ التسلسلي:",
    "qemu.intro":
      "أعلام QEMU لتصحيح النواة الفعال:",
    "gdb.intro":
      "تصحيح GDB عن بُعد عبر خادم GDB المدمج في QEMU:",
    "crash.intro":
      "تحليل حالات ذعر النواة وإطارات الاستثناء:",
    "memory_debug.intro":
      "تقنيات تصحيح الذاكرة — القيم المسمومة، صفحات الحماية، تتبع التسريبات، وتفريغ جداول الصفحات:",
    "tools.intro":
      "أدوات تحليل ثنائي لصورة النواة:",
  },
};

export default content;
