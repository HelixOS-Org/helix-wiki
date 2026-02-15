import type { DocContent } from "./index";

const content: DocContent = {
  en: {
    "header.title": "OS Builder Profiles",
    "header.subtitle": "Build profiles define which modules, linker scripts, and configuration are bundled into a bootable Helix image — from minimal test kernels to full-featured desktop systems.",
    "header.badge": "PROFILES",
    "how.intro": "Profiles are the bridge between the modular kernel and a bootable image. Each profile selects which modules to include, which linker script to use, and how to configure the kernel:",
    "available.intro": "Seven profiles covering different deployment targets:",
    "config.intro": "Profiles are configured through helix.toml — a declarative configuration file:",
    "creating.intro": "How to create a new custom profile from scratch:",
    "selection.intro": "Profiles select modules from a curated list of implementations:",
    "linker.intro": "Each profile may provide its own linker script, or inherit from the common base:",
  },
  fr: {
    "header.title": "Profils OS Builder",
    "header.subtitle": "Les profils de build définissent quels modules, scripts de liaison et configurations sont intégrés dans une image Helix amorçable — des noyaux de test minimaux aux systèmes de bureau complets.",
    "header.badge": "PROFILS",
    "how.intro": "Les profils font le pont entre le noyau modulaire et une image amorçable. Chaque profil sélectionne les modules à inclure, le script de liaison à utiliser et la configuration du noyau :",
    "available.intro": "Sept profils couvrant différentes cibles de déploiement :",
    "config.intro": "Les profils sont configurés via helix.toml — un fichier de configuration déclaratif :",
    "creating.intro": "Comment créer un nouveau profil personnalisé à partir de zéro :",
    "selection.intro": "Les profils sélectionnent des modules parmi une liste d'implémentations disponibles :",
    "linker.intro": "Chaque profil peut fournir son propre script de liaison, ou hériter de la base commune :",
  },
  es: {
    "header.title": "Perfiles OS Builder",
    "header.subtitle": "Los perfiles de compilación definen qué módulos, scripts de enlace y configuración se incluyen en una imagen Helix arrancable — desde kernels de prueba mínimos hasta sistemas de escritorio completos.",
    "header.badge": "PERFILES",
  },
  de: {
    "header.title": "OS-Builder-Profile",
    "header.subtitle": "Build-Profile definieren, welche Module, Linker-Skripte und Konfigurationen in ein bootfähiges Helix-Image gebündelt werden — von minimalen Test-Kernels bis zu voll ausgestatteten Desktop-Systemen.",
    "header.badge": "PROFILE",
  },
  zh: {
    "header.title": "OS 构建配置文件",
    "header.subtitle": "构建配置文件定义哪些模块、链接器脚本和配置被打包到可启动的 Helix 映像中 — 从最小测试内核到功能齐全的桌面系统。",
    "header.badge": "配置文件",
  },
  ja: {
    "header.title": "OSビルダープロファイル",
    "header.subtitle": "ビルドプロファイルは、ブート可能なHelixイメージにバンドルするモジュール、リンカースクリプト、構成を定義します — 最小テストカーネルからフル機能デスクトップシステムまで。",
    "header.badge": "プロファイル",
  },
  ko: {
    "header.title": "OS 빌더 프로파일",
    "header.subtitle": "빌드 프로파일은 부팅 가능한 Helix 이미지에 번들되는 모듈, 링커 스크립트 및 구성을 정의합니다 — 최소 테스트 커널부터 전체 기능 데스크톱 시스템까지.",
    "header.badge": "프로파일",
  },
  pt: {
    "header.title": "Perfis OS Builder",
    "header.subtitle": "Perfis de build definem quais módulos, scripts de linker e configurações são empacotados em uma imagem Helix inicializável — de kernels de teste mínimos a sistemas desktop completos.",
    "header.badge": "PERFIS",
  },
  ru: {
    "header.title": "Профили OS Builder",
    "header.subtitle": "Профили сборки определяют, какие модули, скрипты компоновщика и конфигурации включаются в загрузочный образ Helix — от минимальных тестовых ядер до полнофункциональных настольных систем.",
    "header.badge": "ПРОФИЛИ",
  },
  ar: {
    "header.title": "ملفات تعريف بناء نظام التشغيل",
    "header.subtitle": "تحدد ملفات تعريف البناء الوحدات وسكربتات الربط والتكوين المضمنة في صورة Helix قابلة للتشغيل — من نوى الاختبار الحد الأدنى إلى أنظمة سطح المكتب الكاملة.",
    "header.badge": "ملفات التعريف",
  },
};

export default content;
