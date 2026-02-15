import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    // PageHeader
    "header.title": "HelixFS",
    "header.subtitle":
      "A custom 64-bit filesystem with B+Tree indexing, copy-on-write snapshots, ACID transactions, and Merkle integrity — 42,800 lines of pure no_std Rust with zero external dependencies.",
    "header.badge": "FILESYSTEM",

    // Constants & Layout
    "constants.intro":
      "Core constants that define the HelixFS geometry — block size, maximum file size, and naming limits:",

    // On-Disk Layout
    "layout.intro":
      "The on-disk layout organizes blocks into a superblock, block group descriptors, block and inode bitmaps, inode table, and data blocks:",

    // Inodes & Extents
    "inodes.intro":
      "Each inode is 256 bytes and tracks file metadata, permissions, timestamps, and up to 12 direct extent pointers:",

    // POSIX API
    "posix.intro":
      "HelixFS provides a full POSIX-compatible API through the VFS layer — open, read, write, seek, stat, mkdir, unlink, and more:",

    // Copy-on-Write
    "cow.intro":
      "Copy-on-Write enables instant snapshots — when a block is modified, the original is preserved and a new block is written. This provides atomic updates and snapshot isolation:",

    // Journal
    "journal.intro":
      "Write-ahead logging ensures crash consistency — every metadata change is first recorded in the journal before being applied to the filesystem:",

    // B+Tree Index
    "btree.intro":
      "Directory lookups and extent searches use B+Tree indexing for O(log n) performance — much faster than linear scans for large directories:",

    // ARC Cache
    "arc.intro":
      "The ARC (Adaptive Replacement Cache) balances between recency and frequency, outperforming LRU for real-world workloads:",

    // Feature Summary
    "features.intro":
      "Summary of HelixFS capabilities and design decisions:",
  },

  fr: {
    // PageHeader
    "header.title": "HelixFS",
    "header.subtitle":
      "Un système de fichiers 64 bits personnalisé avec indexation B+Tree, instantanés en copie sur écriture, transactions ACID et intégrité Merkle — 42 800 lignes de Rust no_std pur sans aucune dépendance externe.",
    "header.badge": "SYSTÈME DE FICHIERS",

    // Constants & Layout
    "constants.intro":
      "Constantes de base qui définissent la géométrie de HelixFS — taille de bloc, taille maximale de fichier et limites de nommage :",

    // On-Disk Layout
    "layout.intro":
      "La disposition sur disque organise les blocs en un superbloc, des descripteurs de groupes de blocs, des bitmaps de blocs et d'inodes, une table d'inodes et des blocs de données :",

    // Inodes & Extents
    "inodes.intro":
      "Chaque inode fait 256 octets et suit les métadonnées du fichier, les permissions, les horodatages et jusqu'à 12 pointeurs d'extensions directs :",

    // POSIX API
    "posix.intro":
      "HelixFS fournit une API entièrement compatible POSIX via la couche VFS — open, read, write, seek, stat, mkdir, unlink et plus encore :",

    // Copy-on-Write
    "cow.intro":
      "La copie sur écriture permet des instantanés instantanés — lorsqu'un bloc est modifié, l'original est préservé et un nouveau bloc est écrit. Cela offre des mises à jour atomiques et une isolation des instantanés :",

    // Journal
    "journal.intro":
      "La journalisation en écriture anticipée garantit la cohérence en cas de crash — chaque modification de métadonnées est d'abord enregistrée dans le journal avant d'être appliquée au système de fichiers :",

    // B+Tree Index
    "btree.intro":
      "Les recherches de répertoires et d'extensions utilisent l'indexation B+Tree pour des performances en O(log n) — beaucoup plus rapide que les balayages linéaires pour les grands répertoires :",

    // ARC Cache
    "arc.intro":
      "Le cache ARC (Adaptive Replacement Cache) équilibre entre récence et fréquence, surpassant le LRU pour les charges de travail réelles :",

    // Feature Summary
    "features.intro":
      "Résumé des fonctionnalités et des choix de conception de HelixFS :",
  },

  es: {
    "header.title": "HelixFS",
    "header.subtitle":
      "Un sistema de archivos personalizado de 64 bits con indexación B+Tree, instantáneas de copia en escritura, transacciones ACID e integridad Merkle — 42.800 líneas de Rust no_std puro sin dependencias externas.",
    "header.badge": "SISTEMA DE ARCHIVOS",
    "constants.intro":
      "Constantes centrales que definen la geometría de HelixFS — tamaño de bloque, tamaño máximo de archivo y límites de nomenclatura:",
    "layout.intro":
      "La disposición en disco organiza bloques en un superbloque, descriptores de grupos de bloques, bitmaps de bloques e inodos, tabla de inodos y bloques de datos:",
    "inodes.intro":
      "Cada inodo tiene 256 bytes y rastrea metadatos del archivo, permisos, marcas de tiempo y hasta 12 punteros de extensiones directas:",
    "posix.intro":
      "HelixFS proporciona una API compatible con POSIX a través de la capa VFS — open, read, write, seek, stat, mkdir, unlink y más:",
    "cow.intro":
      "La copia en escritura permite instantáneas instantáneas — cuando un bloque se modifica, el original se preserva y se escribe un nuevo bloque. Esto proporciona actualizaciones atómicas y aislamiento de instantáneas:",
    "journal.intro":
      "El registro anticipado garantiza la consistencia ante fallos — cada cambio de metadatos se registra primero en el journal antes de aplicarse al sistema de archivos:",
    "btree.intro":
      "Las búsquedas de directorios y extensiones usan indexación B+Tree para rendimiento O(log n) — mucho más rápido que escaneos lineales para directorios grandes:",
    "arc.intro":
      "El caché ARC (Adaptive Replacement Cache) equilibra entre recencia y frecuencia, superando al LRU para cargas de trabajo reales:",
    "features.intro":
      "Resumen de las capacidades y decisiones de diseño de HelixFS:",
  },

  de: {
    "header.title": "HelixFS",
    "header.subtitle":
      "Ein maßgeschneidertes 64-Bit-Dateisystem mit B+Tree-Indizierung, Copy-on-Write-Snapshots, ACID-Transaktionen und Merkle-Integrität — 42.800 Zeilen reines no_std Rust ohne externe Abhängigkeiten.",
    "header.badge": "DATEISYSTEM",
    "constants.intro":
      "Kernkonstanten, die die HelixFS-Geometrie definieren — Blockgröße, maximale Dateigröße und Namensbeschränkungen:",
    "layout.intro":
      "Das On-Disk-Layout organisiert Blöcke in einen Superblock, Blockgruppen-Deskriptoren, Block- und Inode-Bitmaps, Inode-Tabelle und Datenblöcke:",
    "inodes.intro":
      "Jeder Inode ist 256 Bytes groß und verfolgt Dateimetadaten, Berechtigungen, Zeitstempel und bis zu 12 direkte Extent-Zeiger:",
    "posix.intro":
      "HelixFS bietet eine vollständige POSIX-kompatible API über die VFS-Schicht — open, read, write, seek, stat, mkdir, unlink und mehr:",
    "cow.intro":
      "Copy-on-Write ermöglicht sofortige Snapshots — wenn ein Block geändert wird, bleibt das Original erhalten und ein neuer Block wird geschrieben. Dies bietet atomare Updates und Snapshot-Isolation:",
    "journal.intro":
      "Write-Ahead-Logging gewährleistet Crash-Konsistenz — jede Metadatenänderung wird zuerst im Journal aufgezeichnet, bevor sie auf das Dateisystem angewendet wird:",
    "btree.intro":
      "Verzeichnissuchen und Extent-Suchen verwenden B+Tree-Indizierung für O(log n)-Leistung — viel schneller als lineare Scans für große Verzeichnisse:",
    "arc.intro":
      "Der ARC (Adaptive Replacement Cache) balanciert zwischen Aktualität und Häufigkeit und übertrifft LRU für reale Arbeitslasten:",
    "features.intro":
      "Zusammenfassung der HelixFS-Funktionen und Designentscheidungen:",
  },

  zh: {
    "header.title": "HelixFS",
    "header.subtitle":
      "一个自定义的 64 位文件系统，具有 B+Tree 索引、写时复制快照、ACID 事务和 Merkle 完整性——42,800 行纯 no_std Rust 代码，零外部依赖。",
    "header.badge": "文件系统",
    "constants.intro":
      "定义 HelixFS 几何结构的核心常量——块大小、最大文件大小和命名限制：",
    "layout.intro":
      "磁盘布局将块组织为超级块、块组描述符、块和 inode 位图、inode 表和数据块：",
    "inodes.intro":
      "每个 inode 为 256 字节，跟踪文件元数据、权限、时间戳和最多 12 个直接 extent 指针：",
    "posix.intro":
      "HelixFS 通过 VFS 层提供完全 POSIX 兼容的 API——open、read、write、seek、stat、mkdir、unlink 等：",
    "cow.intro":
      "写时复制实现即时快照——当块被修改时，原始块被保留，写入新块。这提供了原子更新和快照隔离：",
    "journal.intro":
      "预写日志确保崩溃一致性——每次元数据更改首先记录在日志中，然后再应用于文件系统：",
    "btree.intro":
      "目录查找和 extent 搜索使用 B+Tree 索引实现 O(log n) 性能——对于大型目录比线性扫描快得多：",
    "arc.intro":
      "ARC（自适应替换缓存）在最近性和频率之间取得平衡，在真实工作负载中优于 LRU：",
    "features.intro":
      "HelixFS 功能和设计决策摘要：",
  },

  ja: {
    "header.title": "HelixFS",
    "header.subtitle":
      "B+Tree インデックス、コピーオンライトスナップショット、ACID トランザクション、Merkle 整合性を備えたカスタム 64 ビットファイルシステム — 外部依存ゼロの純粋な no_std Rust で 42,800 行。",
    "header.badge": "ファイルシステム",
    "constants.intro":
      "HelixFS のジオメトリを定義するコア定数 — ブロックサイズ、最大ファイルサイズ、命名制限：",
    "layout.intro":
      "ディスク上のレイアウトは、ブロックをスーパーブロック、ブロックグループディスクリプタ、ブロックおよび inode ビットマップ、inode テーブル、データブロックに整理します：",
    "inodes.intro":
      "各 inode は 256 バイトで、ファイルメタデータ、パーミッション、タイムスタンプ、最大 12 個の直接 extent ポインタを追跡します：",
    "posix.intro":
      "HelixFS は VFS レイヤーを通じて完全な POSIX 互換 API を提供します — open、read、write、seek、stat、mkdir、unlink など：",
    "cow.intro":
      "コピーオンライトにより即座のスナップショットが可能 — ブロックが変更されると元のブロックが保持され、新しいブロックが書き込まれます。これによりアトミックな更新とスナップショット分離が実現されます：",
    "journal.intro":
      "先行書き込みログによりクラッシュ整合性が確保されます — すべてのメタデータ変更はファイルシステムに適用される前にまずジャーナルに記録されます：",
    "btree.intro":
      "ディレクトリ検索と extent 検索は B+Tree インデックスを使用して O(log n) パフォーマンスを実現 — 大規模ディレクトリの線形スキャンよりはるかに高速：",
    "arc.intro":
      "ARC（適応型置換キャッシュ）は最近性と頻度のバランスを取り、実際のワークロードで LRU を上回ります：",
    "features.intro":
      "HelixFS の機能と設計上の決定のまとめ：",
  },

  ko: {
    "header.title": "HelixFS",
    "header.subtitle":
      "B+Tree 인덱싱, 기록 중 복사 스냅샷, ACID 트랜잭션, Merkle 무결성을 갖춘 커스텀 64비트 파일시스템 — 외부 의존성 없는 순수 no_std Rust로 42,800줄.",
    "header.badge": "파일시스템",
    "constants.intro":
      "HelixFS 기하 구조를 정의하는 핵심 상수 — 블록 크기, 최대 파일 크기, 이름 제한:",
    "layout.intro":
      "디스크 레이아웃은 블록을 슈퍼블록, 블록 그룹 디스크립터, 블록 및 inode 비트맵, inode 테이블, 데이터 블록으로 구성합니다:",
    "inodes.intro":
      "각 inode는 256바이트이며 파일 메타데이터, 권한, 타임스탬프, 최대 12개의 직접 extent 포인터를 추적합니다:",
    "posix.intro":
      "HelixFS는 VFS 계층을 통해 완전한 POSIX 호환 API를 제공합니다 — open, read, write, seek, stat, mkdir, unlink 등:",
    "cow.intro":
      "기록 중 복사로 즉각적인 스냅샷이 가능합니다 — 블록이 수정되면 원본이 보존되고 새 블록이 기록됩니다. 이는 원자적 업데이트와 스냅샷 격리를 제공합니다:",
    "journal.intro":
      "선행 기록 로깅이 충돌 일관성을 보장합니다 — 모든 메타데이터 변경은 파일시스템에 적용되기 전에 먼저 저널에 기록됩니다:",
    "btree.intro":
      "디렉토리 조회와 extent 검색은 B+Tree 인덱싱을 사용하여 O(log n) 성능을 달성합니다 — 대규모 디렉토리에서 선형 스캔보다 훨씬 빠릅니다:",
    "arc.intro":
      "ARC(적응형 교체 캐시)는 최신성과 빈도 사이의 균형을 맞추어 실제 워크로드에서 LRU를 능가합니다:",
    "features.intro":
      "HelixFS 기능 및 설계 결정 요약:",
  },

  pt: {
    "header.title": "HelixFS",
    "header.subtitle":
      "Um sistema de arquivos personalizado de 64 bits com indexação B+Tree, snapshots copy-on-write, transações ACID e integridade Merkle — 42.800 linhas de Rust no_std puro sem dependências externas.",
    "header.badge": "SISTEMA DE ARQUIVOS",
    "constants.intro":
      "Constantes centrais que definem a geometria do HelixFS — tamanho de bloco, tamanho máximo de arquivo e limites de nomenclatura:",
    "layout.intro":
      "O layout em disco organiza blocos em um superbloco, descritores de grupo de blocos, bitmaps de blocos e inodes, tabela de inodes e blocos de dados:",
    "inodes.intro":
      "Cada inode tem 256 bytes e rastreia metadados do arquivo, permissões, timestamps e até 12 ponteiros de extensão diretos:",
    "posix.intro":
      "O HelixFS fornece uma API totalmente compatível com POSIX através da camada VFS — open, read, write, seek, stat, mkdir, unlink e mais:",
    "cow.intro":
      "Copy-on-Write permite snapshots instantâneos — quando um bloco é modificado, o original é preservado e um novo bloco é escrito. Isso fornece atualizações atômicas e isolamento de snapshots:",
    "journal.intro":
      "O registro antecipado garante consistência em caso de falha — cada alteração de metadados é primeiro registrada no journal antes de ser aplicada ao sistema de arquivos:",
    "btree.intro":
      "Buscas de diretórios e extensões usam indexação B+Tree para desempenho O(log n) — muito mais rápido que varreduras lineares para diretórios grandes:",
    "arc.intro":
      "O ARC (Adaptive Replacement Cache) equilibra entre recência e frequência, superando o LRU para cargas de trabalho reais:",
    "features.intro":
      "Resumo das capacidades e decisões de design do HelixFS:",
  },

  ru: {
    "header.title": "HelixFS",
    "header.subtitle":
      "Пользовательская 64-битная файловая система с индексацией B+Tree, снимками с копированием при записи, транзакциями ACID и целостностью Merkle — 42 800 строк чистого no_std Rust без внешних зависимостей.",
    "header.badge": "ФАЙЛОВАЯ СИСТЕМА",
    "constants.intro":
      "Основные константы, определяющие геометрию HelixFS — размер блока, максимальный размер файла и ограничения именования:",
    "layout.intro":
      "Дисковая разметка организует блоки в суперблок, дескрипторы групп блоков, битовые карты блоков и inode, таблицу inode и блоки данных:",
    "inodes.intro":
      "Каждый inode занимает 256 байт и отслеживает метаданные файла, разрешения, временные метки и до 12 прямых указателей экстентов:",
    "posix.intro":
      "HelixFS предоставляет полностью POSIX-совместимый API через слой VFS — open, read, write, seek, stat, mkdir, unlink и другие:",
    "cow.intro":
      "Копирование при записи обеспечивает мгновенные снимки — при изменении блока оригинал сохраняется, а записывается новый блок. Это обеспечивает атомарные обновления и изоляцию снимков:",
    "journal.intro":
      "Журналирование с упреждающей записью обеспечивает согласованность при сбоях — каждое изменение метаданных сначала записывается в журнал, а затем применяется к файловой системе:",
    "btree.intro":
      "Поиск по каталогам и экстентам использует индексацию B+Tree для производительности O(log n) — намного быстрее линейного сканирования для больших каталогов:",
    "arc.intro":
      "ARC (адаптивный кэш замещения) балансирует между недавностью и частотой, превосходя LRU для реальных рабочих нагрузок:",
    "features.intro":
      "Обзор возможностей и проектных решений HelixFS:",
  },

  ar: {
    "header.title": "HelixFS",
    "header.subtitle":
      "نظام ملفات مخصص 64 بت مع فهرسة B+Tree، ولقطات النسخ عند الكتابة، ومعاملات ACID، وسلامة Merkle — 42,800 سطر من Rust no_std خالص بدون أي تبعيات خارجية.",
    "header.badge": "نظام الملفات",
    "constants.intro":
      "الثوابت الأساسية التي تحدد هندسة HelixFS — حجم الكتلة، الحد الأقصى لحجم الملف، وقيود التسمية:",
    "layout.intro":
      "التخطيط على القرص ينظم الكتل في كتلة فائقة، وواصفات مجموعات الكتل، وخرائط بت الكتل وعقد الفهرس، وجدول عقد الفهرس، وكتل البيانات:",
    "inodes.intro":
      "كل عقدة فهرس بحجم 256 بايت وتتتبع بيانات الملف الوصفية، والأذونات، والطوابع الزمنية، وحتى 12 مؤشر مدى مباشر:",
    "posix.intro":
      "يوفر HelixFS واجهة API متوافقة بالكامل مع POSIX من خلال طبقة VFS — open، read، write، seek، stat، mkdir، unlink والمزيد:",
    "cow.intro":
      "النسخ عند الكتابة يتيح لقطات فورية — عندما يتم تعديل كتلة، يتم الحفاظ على الأصل وكتابة كتلة جديدة. هذا يوفر تحديثات ذرية وعزل اللقطات:",
    "journal.intro":
      "التسجيل المسبق يضمن تناسق البيانات عند الأعطال — كل تغيير في البيانات الوصفية يتم تسجيله أولاً في السجل قبل تطبيقه على نظام الملفات:",
    "btree.intro":
      "عمليات البحث في الدلائل والمديات تستخدم فهرسة B+Tree لأداء O(log n) — أسرع بكثير من المسح الخطي للدلائل الكبيرة:",
    "arc.intro":
      "ذاكرة التخزين المؤقت ARC (التخزين المؤقت للاستبدال التكيفي) توازن بين الحداثة والتكرار، متفوقة على LRU لأحمال العمل الواقعية:",
    "features.intro":
      "ملخص قدرات HelixFS وقرارات التصميم:",
  },
};

export default content;
