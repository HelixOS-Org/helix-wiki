import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "Lumina GPU Engine",
    "header.subtitle":
      "197,000 lines across 14 sub-crates — a complete GPU graphics engine with shader compilation (GLSL → IR → SPIR-V), render pipeline, material system, and GPU memory management.",
    "header.badge": "GPU ENGINE",

    // Overview
    "overview.intro":
      "Lumina is Helix's GPU graphics stack — an independent workspace of 14 crates covering every aspect of GPU-accelerated rendering.",

    // Crate Inventory
    "inventory.intro":
      "The 14 sub-crates and their responsibilities:",

    // Handles
    "handles.intro":
      "Type-safe GPU resource handles with generation tracking — prevents use-after-free and dangling references:",

    // Math
    "math.intro":
      "Complete linear algebra library for graphics — vectors, matrices, quaternions, transforms, and AABB collision:",

    // Pipeline
    "pipeline.intro":
      "The render pipeline manages the complete frame submission lifecycle:",

    // Render Graph
    "rendergraph.intro":
      "A directed acyclic graph of render passes — automatic resource barrier insertion, pass ordering, and dead-pass elimination:",

    // Shaders
    "shaders.intro":
      "Multi-stage shader compilation: GLSL source → AST → IR → optimization → SPIR-V binary:",

    // Magma
    "magma.intro":
      "Magma is the GPU hardware abstraction layer — 17,000 lines across 7 crates providing a vendor-neutral GPU interface:",
  },

  fr: {
    // PageHeader
    "header.title": "Moteur GPU Lumina",
    "header.subtitle":
      "197 000 lignes réparties sur 14 sous-crates — un moteur graphique GPU complet avec compilation de shaders (GLSL → IR → SPIR-V), pipeline de rendu, système de matériaux et gestion de la mémoire GPU.",
    "header.badge": "MOTEUR GPU",

    // Overview
    "overview.intro":
      "Lumina est la pile graphique GPU de Helix — un espace de travail indépendant de 14 crates couvrant chaque aspect du rendu accéléré par GPU.",

    // Crate Inventory
    "inventory.intro":
      "Les 14 sous-crates et leurs responsabilités :",

    // Handles
    "handles.intro":
      "Handles de ressources GPU type-safe avec suivi de génération — prévient les use-after-free et les références pendantes :",

    // Math
    "math.intro":
      "Bibliothèque complète d'algèbre linéaire pour le graphisme — vecteurs, matrices, quaternions, transformations et collision AABB :",

    // Pipeline
    "pipeline.intro":
      "Le pipeline de rendu gère le cycle de vie complet de soumission de frames :",

    // Render Graph
    "rendergraph.intro":
      "Un graphe acyclique dirigé de passes de rendu — insertion automatique de barrières de ressources, ordonnancement des passes et élimination des passes mortes :",

    // Shaders
    "shaders.intro":
      "Compilation de shaders en plusieurs étapes : source GLSL → AST → IR → optimisation → binaire SPIR-V :",

    // Magma
    "magma.intro":
      "Magma est la couche d'abstraction matérielle GPU — 17 000 lignes réparties sur 7 crates fournissant une interface GPU neutre vis-à-vis du fabricant :",
  },

  es: {
    "header.title": "Motor GPU Lumina",
    "header.subtitle":
      "197.000 líneas en 14 sub-crates — un motor gráfico GPU completo con compilación de shaders (GLSL → IR → SPIR-V), pipeline de renderizado, sistema de materiales y gestión de memoria GPU.",
    "header.badge": "MOTOR GPU",
    "overview.intro":
      "Lumina es la pila gráfica GPU de Helix — un workspace independiente de 14 crates que cubre cada aspecto del renderizado acelerado por GPU.",
    "inventory.intro":
      "Los 14 sub-crates y sus responsabilidades:",
    "handles.intro":
      "Handles de recursos GPU con tipado seguro y seguimiento de generación — previene use-after-free y referencias colgantes:",
    "math.intro":
      "Biblioteca completa de álgebra lineal para gráficos — vectores, matrices, cuaterniones, transformaciones y colisión AABB:",
    "pipeline.intro":
      "El pipeline de renderizado gestiona el ciclo de vida completo de envío de frames:",
    "rendergraph.intro":
      "Un grafo acíclico dirigido de pasadas de renderizado — inserción automática de barreras de recursos, ordenamiento de pasadas y eliminación de pasadas muertas:",
    "shaders.intro":
      "Compilación de shaders en múltiples etapas: fuente GLSL → AST → IR → optimización → binario SPIR-V:",
    "magma.intro":
      "Magma es la capa de abstracción de hardware GPU — 17.000 líneas en 7 crates proporcionando una interfaz GPU neutral al fabricante:",
  },

  de: {
    "header.title": "Lumina GPU-Engine",
    "header.subtitle":
      "197.000 Zeilen in 14 Sub-Crates — eine vollständige GPU-Grafik-Engine mit Shader-Kompilierung (GLSL → IR → SPIR-V), Render-Pipeline, Materialsystem und GPU-Speicherverwaltung.",
    "header.badge": "GPU-ENGINE",
    "overview.intro":
      "Lumina ist der GPU-Grafik-Stack von Helix — ein unabhängiger Workspace mit 14 Crates, der jeden Aspekt des GPU-beschleunigten Renderings abdeckt.",
    "inventory.intro":
      "Die 14 Sub-Crates und ihre Zuständigkeiten:",
    "handles.intro":
      "Typsichere GPU-Ressourcen-Handles mit Generationsverfolgung — verhindert Use-after-free und hängende Referenzen:",
    "math.intro":
      "Vollständige lineare Algebra-Bibliothek für Grafik — Vektoren, Matrizen, Quaternionen, Transformationen und AABB-Kollision:",
    "pipeline.intro":
      "Die Render-Pipeline verwaltet den vollständigen Frame-Submission-Lebenszyklus:",
    "rendergraph.intro":
      "Ein gerichteter azyklischer Graph von Render-Passes — automatische Ressourcenbarrieren-Einfügung, Pass-Sortierung und Dead-Pass-Eliminierung:",
    "shaders.intro":
      "Mehrstufige Shader-Kompilierung: GLSL-Quelle → AST → IR → Optimierung → SPIR-V-Binär:",
    "magma.intro":
      "Magma ist die GPU-Hardware-Abstraktionsschicht — 17.000 Zeilen in 7 Crates, die eine herstellerneutrale GPU-Schnittstelle bereitstellen:",
  },

  zh: {
    "header.title": "Lumina GPU 引擎",
    "header.subtitle":
      "14 个子 crate 共 197,000 行——完整的 GPU 图形引擎，包括着色器编译（GLSL → IR → SPIR-V）、渲染管线、材质系统和 GPU 内存管理。",
    "header.badge": "GPU 引擎",
    "overview.intro":
      "Lumina 是 Helix 的 GPU 图形栈——一个由 14 个 crate 组成的独立工作空间，涵盖 GPU 加速渲染的各个方面。",
    "inventory.intro":
      "14 个子 crate 及其职责：",
    "handles.intro":
      "带有代数跟踪的类型安全 GPU 资源句柄——防止释放后使用和悬空引用：",
    "math.intro":
      "用于图形的完整线性代数库——向量、矩阵、四元数、变换和 AABB 碰撞：",
    "pipeline.intro":
      "渲染管线管理完整的帧提交生命周期：",
    "rendergraph.intro":
      "渲染通道的有向无环图——自动资源屏障插入、通道排序和死通道消除：",
    "shaders.intro":
      "多阶段着色器编译：GLSL 源码 → AST → IR → 优化 → SPIR-V 二进制：",
    "magma.intro":
      "Magma 是 GPU 硬件抽象层——7 个 crate 共 17,000 行，提供厂商中立的 GPU 接口：",
  },

  ja: {
    "header.title": "Lumina GPUエンジン",
    "header.subtitle":
      "14のサブクレートにわたる197,000行 — シェーダーコンパイル（GLSL → IR → SPIR-V）、レンダーパイプライン、マテリアルシステム、GPU メモリ管理を備えた完全なGPUグラフィックスエンジン。",
    "header.badge": "GPUエンジン",
    "overview.intro":
      "LuminaはHelixのGPUグラフィックススタック — GPU高速レンダリングのあらゆる側面をカバーする14クレートの独立したワークスペースです。",
    "inventory.intro":
      "14のサブクレートとその責務：",
    "handles.intro":
      "世代追跡付きの型安全なGPUリソースハンドル — use-after-freeとダングリング参照を防止：",
    "math.intro":
      "グラフィックス用の完全な線形代数ライブラリ — ベクトル、行列、クォータニオン、変換、AABB衝突：",
    "pipeline.intro":
      "レンダーパイプラインは完全なフレーム送信ライフサイクルを管理します：",
    "rendergraph.intro":
      "レンダーパスの有向非巡回グラフ — 自動リソースバリア挿入、パス順序付け、デッドパス除去：",
    "shaders.intro":
      "多段階シェーダーコンパイル：GLSLソース → AST → IR → 最適化 → SPIR-Vバイナリ：",
    "magma.intro":
      "MagmaはGPUハードウェア抽象化レイヤー — 7クレートにわたる17,000行で、ベンダー中立のGPUインターフェースを提供：",
  },

  ko: {
    "header.title": "Lumina GPU 엔진",
    "header.subtitle":
      "14개의 하위 크레이트에 걸친 197,000줄 — 셰이더 컴파일(GLSL → IR → SPIR-V), 렌더 파이프라인, 머티리얼 시스템, GPU 메모리 관리를 갖춘 완전한 GPU 그래픽 엔진.",
    "header.badge": "GPU 엔진",
    "overview.intro":
      "Lumina는 Helix의 GPU 그래픽 스택 — GPU 가속 렌더링의 모든 측면을 다루는 14개 크레이트의 독립 워크스페이스입니다.",
    "inventory.intro":
      "14개 하위 크레이트와 그 책임:",
    "handles.intro":
      "세대 추적이 있는 타입 안전 GPU 리소스 핸들 — use-after-free 및 댕글링 참조 방지:",
    "math.intro":
      "그래픽을 위한 완전한 선형대수 라이브러리 — 벡터, 행렬, 쿼터니언, 변환, AABB 충돌:",
    "pipeline.intro":
      "렌더 파이프라인은 완전한 프레임 제출 생명주기를 관리합니다:",
    "rendergraph.intro":
      "렌더 패스의 방향성 비순환 그래프 — 자동 리소스 배리어 삽입, 패스 순서 지정, 데드 패스 제거:",
    "shaders.intro":
      "다단계 셰이더 컴파일: GLSL 소스 → AST → IR → 최적화 → SPIR-V 바이너리:",
    "magma.intro":
      "Magma는 GPU 하드웨어 추상화 레이어 — 7개 크레이트에 걸친 17,000줄로 벤더 중립적 GPU 인터페이스 제공:",
  },

  pt: {
    "header.title": "Motor GPU Lumina",
    "header.subtitle":
      "197.000 linhas em 14 sub-crates — um motor gráfico GPU completo com compilação de shaders (GLSL → IR → SPIR-V), pipeline de renderização, sistema de materiais e gerenciamento de memória GPU.",
    "header.badge": "MOTOR GPU",
    "overview.intro":
      "Lumina é a pilha gráfica GPU do Helix — um workspace independente de 14 crates cobrindo cada aspecto da renderização acelerada por GPU.",
    "inventory.intro":
      "Os 14 sub-crates e suas responsabilidades:",
    "handles.intro":
      "Handles de recursos GPU com tipagem segura e rastreamento de geração — previne use-after-free e referências pendentes:",
    "math.intro":
      "Biblioteca completa de álgebra linear para gráficos — vetores, matrizes, quatérnios, transformações e colisão AABB:",
    "pipeline.intro":
      "O pipeline de renderização gerencia o ciclo de vida completo de submissão de frames:",
    "rendergraph.intro":
      "Um grafo acíclico direcionado de passes de renderização — inserção automática de barreiras de recursos, ordenação de passes e eliminação de passes mortos:",
    "shaders.intro":
      "Compilação de shaders em múltiplos estágios: fonte GLSL → AST → IR → otimização → binário SPIR-V:",
    "magma.intro":
      "Magma é a camada de abstração de hardware GPU — 17.000 linhas em 7 crates fornecendo uma interface GPU neutra em relação ao fabricante:",
  },

  ru: {
    "header.title": "GPU-движок Lumina",
    "header.subtitle":
      "197 000 строк в 14 под-крейтах — полный GPU-графический движок с компиляцией шейдеров (GLSL → IR → SPIR-V), пайплайном рендеринга, системой материалов и управлением GPU-памятью.",
    "header.badge": "GPU-ДВИЖОК",
    "overview.intro":
      "Lumina — это GPU-графический стек Helix — независимое рабочее пространство из 14 крейтов, охватывающее каждый аспект GPU-ускоренного рендеринга.",
    "inventory.intro":
      "14 под-крейтов и их зоны ответственности:",
    "handles.intro":
      "Типобезопасные дескрипторы GPU-ресурсов с отслеживанием поколений — предотвращает use-after-free и висячие ссылки:",
    "math.intro":
      "Полная библиотека линейной алгебры для графики — векторы, матрицы, кватернионы, преобразования и коллизии AABB:",
    "pipeline.intro":
      "Пайплайн рендеринга управляет полным жизненным циклом отправки кадров:",
    "rendergraph.intro":
      "Направленный ациклический граф проходов рендеринга — автоматическая вставка ресурсных барьеров, упорядочивание проходов и устранение мёртвых проходов:",
    "shaders.intro":
      "Многоэтапная компиляция шейдеров: исходный код GLSL → AST → IR → оптимизация → бинарный SPIR-V:",
    "magma.intro":
      "Magma — это слой аппаратной абстракции GPU — 17 000 строк в 7 крейтах, предоставляющих вендор-нейтральный интерфейс GPU:",
  },

  ar: {
    "header.title": "محرك GPU لومينا",
    "header.subtitle":
      "197,000 سطر عبر 14 حزمة فرعية — محرك رسومات GPU كامل مع تجميع الظلال (GLSL → IR → SPIR-V)، خط أنابيب العرض، نظام المواد، وإدارة ذاكرة GPU.",
    "header.badge": "محرك GPU",
    "overview.intro":
      "لومينا هي مكدس رسومات GPU لـ Helix — مساحة عمل مستقلة من 14 حزمة تغطي كل جانب من جوانب العرض المسرّع بـ GPU.",
    "inventory.intro":
      "الحزم الفرعية الـ 14 ومسؤولياتها:",
    "handles.intro":
      "مقابض موارد GPU آمنة النوع مع تتبع الأجيال — يمنع الاستخدام بعد التحرير والمراجع المعلقة:",
    "math.intro":
      "مكتبة جبر خطي كاملة للرسومات — المتجهات، المصفوفات، الرباعيات، التحويلات، وتصادم AABB:",
    "pipeline.intro":
      "يدير خط أنابيب العرض دورة حياة إرسال الإطارات الكاملة:",
    "rendergraph.intro":
      "رسم بياني موجه غير دوري لمراحل العرض — إدراج تلقائي لحواجز الموارد، ترتيب المراحل، وإزالة المراحل الميتة:",
    "shaders.intro":
      "تجميع متعدد المراحل للظلال: مصدر GLSL → AST → IR → تحسين → ثنائي SPIR-V:",
    "magma.intro":
      "ماجما هي طبقة تجريد أجهزة GPU — 17,000 سطر عبر 7 حزم توفر واجهة GPU محايدة تجاه الشركة المصنعة:",
  },
};

export default content;
