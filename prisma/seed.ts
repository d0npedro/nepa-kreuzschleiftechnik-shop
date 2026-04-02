import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categories = [
  { name: "Honleisten", slug: "honleisten" },
  { name: "Honwerkzeuge", slug: "honwerkzeuge" },
  { name: "Schleifmittel", slug: "schleifmittel" },
  { name: "Diamantwerkzeuge", slug: "diamantwerkzeuge" },
  { name: "Ersatzteile", slug: "ersatzteile" },
  { name: "Zubehör", slug: "zubehoer" },
];

// ---------------------------------------------------------------------------
// Machines
// ---------------------------------------------------------------------------
const machines = [
  // Sunnen
  {
    manufacturer: "Sunnen",
    name: "MBB-1660",
    slug: "sunnen-mbb-1660",
    description:
      "Vertikale Honmaschine für mittlere Bohrungsdurchmesser. Bewährtes Arbeitspferd in der Serienfertigung.",
  },
  {
    manufacturer: "Sunnen",
    name: "MBC-1804",
    slug: "sunnen-mbc-1804",
    description:
      "Kompakte Honmaschine mit automatischer Zustellung, geeignet für Werkstatt- und Kleinserienbearbeitung.",
  },
  {
    manufacturer: "Sunnen",
    name: "SV-10",
    slug: "sunnen-sv-10",
    description:
      "Vertikale Präzisions-Honmaschine für enge Toleranzen und hohe Oberflächengüte.",
  },
  {
    manufacturer: "Sunnen",
    name: "ML-2000",
    slug: "sunnen-ml-2000",
    description:
      "Hochleistungs-Honmaschine mit CNC-Steuerung für Großserienproduktion.",
  },
  // Gehring
  {
    manufacturer: "Gehring",
    name: "1Z-500",
    slug: "gehring-1z-500",
    description:
      "Einspindlige Honmaschine für Bohrungen bis 500 mm Länge. Hohe Wiederholgenauigkeit.",
  },
  {
    manufacturer: "Gehring",
    name: "2Z-800",
    slug: "gehring-2z-800",
    description:
      "Zweispindlige Honmaschine für parallele Bearbeitung. Optimiert für Zylinderbohrungen.",
  },
  // Nagel
  {
    manufacturer: "Nagel",
    name: "ECO 20",
    slug: "nagel-eco-20",
    description:
      "Wirtschaftliche Honmaschine für kleinere Durchmesser. Ideal für Hydraulik- und Pneumatikkomponenten.",
  },
  {
    manufacturer: "Nagel",
    name: "ECO 40",
    slug: "nagel-eco-40",
    description:
      "Vielseitige Honmaschine für mittlere bis große Bohrungen mit automatischem Messsteuerung.",
  },
  // Kadia
  {
    manufacturer: "Kadia",
    name: "LH 63",
    slug: "kadia-lh-63",
    description:
      "Langhub-Honmaschine für Durchmesser bis 63 mm. Spezialisiert auf Ventilführungen und Buchsen.",
  },
  {
    manufacturer: "Kadia",
    name: "LH 80",
    slug: "kadia-lh-80",
    description:
      "Langhub-Honmaschine für Durchmesser bis 80 mm. Einsatz in der Motorenbearbeitung.",
  },
  // Delapena
  {
    manufacturer: "Delapena",
    name: "Speedhone",
    slug: "delapena-speedhone",
    description:
      "Schnelllauf-Honmaschine mit hoher Abtragsrate. Für Vorbearbeitung und schnelle Materialabtragung.",
  },
  {
    manufacturer: "Delapena",
    name: "Superhone",
    slug: "delapena-superhone",
    description:
      "Hochpräzisions-Honmaschine für Endbearbeitung. Erreicht Oberflächengüten bis Ra 0,05 µm.",
  },
];

// ---------------------------------------------------------------------------
// Products — keyed by category slug for later lookup
// ---------------------------------------------------------------------------
interface ProductSeed {
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categorySlug: string;
  images: string[];
  pdfUrl?: string;
  isUsed: boolean;
  isB2BOnly: boolean;
  /** Machine slugs this product is compatible with */
  machineSlugs: string[];
}

const products: ProductSeed[] = [
  // ---- Honleisten --------------------------------------------------------
  {
    sku: "NEPA-HL-001",
    name: "CBN-Honleiste 75 mm",
    slug: "cbn-honleiste-75mm",
    description:
      "Kubisches Bornitrid-Honleiste, 75 mm Arbeitslänge, Körnung B126. Hervorragende Standzeit bei der Bearbeitung von gehärtetem Stahl und Gusseisen. Geeignet für Durchmesser 40–80 mm.",
    price: 189.0,
    stock: 45,
    categorySlug: "honleisten",
    images: ["/images/products/sunnen-werkzeuge.jpg"],
    pdfUrl: "/docs/technisches-datenblatt-cbn-honleiste-75.pdf",
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [
      "sunnen-mbb-1660",
      "sunnen-mbc-1804",
      "gehring-1z-500",
      "nagel-eco-40",
      "kadia-lh-63",
      "kadia-lh-80",
    ],
  },
  {
    sku: "NEPA-HL-002",
    name: "Diamant-Honleiste 50 mm",
    slug: "diamant-honleiste-50mm",
    description:
      "Diamant-Honleiste mit metallischer Bindung, 50 mm Arbeitslänge, Körnung D91. Für die Feinbearbeitung von Aluminium-Silizium-Legierungen und Keramik.",
    price: 245.0,
    stock: 30,
    categorySlug: "honleisten",
    images: ["/images/products/powerhone-v.jpg"],
    pdfUrl: "/docs/technisches-datenblatt-diamant-honleiste-50.pdf",
    isUsed: false,
    isB2BOnly: true,
    machineSlugs: [
      "sunnen-sv-10",
      "sunnen-ml-2000",
      "gehring-2z-800",
      "nagel-eco-20",
      "nagel-eco-40",
      "delapena-superhone",
    ],
  },
  {
    sku: "NEPA-HL-003",
    name: "Siliziumkarbid-Honleiste 100 mm",
    slug: "sic-honleiste-100mm",
    description:
      "Siliziumkarbid-Honleiste, 100 mm Arbeitslänge, Körnung 280. Universell einsetzbar für Grauguss und Stahl. Wirtschaftliche Standardlösung für die Vorbearbeitung.",
    price: 78.5,
    stock: 85,
    categorySlug: "honleisten",
    images: ["/images/products/ultrahone-h.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [
      "sunnen-mbb-1660",
      "sunnen-mbc-1804",
      "gehring-1z-500",
      "gehring-2z-800",
      "nagel-eco-20",
      "nagel-eco-40",
      "delapena-speedhone",
    ],
  },
  {
    sku: "NEPA-HL-004",
    name: "Korund-Honleiste 60 mm (gebraucht)",
    slug: "korund-honleiste-60mm-gebraucht",
    description:
      "Gebrauchte Korund-Honleiste, 60 mm Arbeitslänge, Körnung 220. Noch ca. 70 % Reststandzeit. Geprüft und vermessen.",
    price: 35.0,
    stock: 12,
    categorySlug: "honleisten",
    images: ["/images/products/versahone-h.jpg"],
    isUsed: true,
    isB2BOnly: false,
    machineSlugs: [
      "sunnen-mbc-1804",
      "nagel-eco-20",
      "kadia-lh-63",
      "delapena-speedhone",
    ],
  },

  // ---- Honwerkzeuge ------------------------------------------------------
  {
    sku: "NEPA-HW-001",
    name: "Einlippen-Honwerkzeug Ø 25–40 mm",
    slug: "einlippen-honwerkzeug-25-40mm",
    description:
      "Einlippen-Honwerkzeug mit einstellbarer Zustellung für Bohrungsdurchmesser 25–40 mm. Präzisionsgeschliffener Werkzeugkörper aus gehärtetem Werkzeugstahl.",
    price: 320.0,
    stock: 18,
    categorySlug: "honwerkzeuge",
    images: ["/images/products/powerhone-h.jpg"],
    pdfUrl: "/docs/technisches-datenblatt-einlippen-25-40.pdf",
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [
      "sunnen-mbb-1660",
      "sunnen-mbc-1804",
      "sunnen-sv-10",
      "gehring-1z-500",
      "nagel-eco-20",
      "kadia-lh-63",
    ],
  },
  {
    sku: "NEPA-HW-002",
    name: "Mehrleisten-Honwerkzeug Ø 50–80 mm",
    slug: "mehrleisten-honwerkzeug-50-80mm",
    description:
      "Mehrleisten-Honwerkzeug mit 4 Leisten für Bohrungsdurchmesser 50–80 mm. Gleichmäßige Anpresskraft durch Federausgleich. Für Kreuzschliff-Oberflächenstruktur.",
    price: 485.0,
    stock: 10,
    categorySlug: "honwerkzeuge",
    images: ["/images/products/ultrahone-v.jpg"],
    pdfUrl: "/docs/technisches-datenblatt-mehrleisten-50-80.pdf",
    isUsed: false,
    isB2BOnly: true,
    machineSlugs: [
      "sunnen-ml-2000",
      "gehring-1z-500",
      "gehring-2z-800",
      "nagel-eco-40",
      "kadia-lh-80",
      "delapena-superhone",
    ],
  },
  {
    sku: "NEPA-HW-003",
    name: "Plateau-Honwerkzeug Ø 60–100 mm",
    slug: "plateau-honwerkzeug-60-100mm",
    description:
      "Spezial-Honwerkzeug für Plateau-Honen (Glatt-Rau-Struktur). Erzeugt definierte Ölhaltevolumen in Zylinderlaufbahnen. 6-Leisten-Ausführung.",
    price: 498.0,
    stock: 8,
    categorySlug: "honwerkzeuge",
    images: ["/images/products/versahone-v.jpg"],
    isUsed: false,
    isB2BOnly: true,
    machineSlugs: [
      "sunnen-ml-2000",
      "gehring-2z-800",
      "nagel-eco-40",
      "kadia-lh-80",
      "delapena-superhone",
    ],
  },
  {
    sku: "NEPA-HW-004",
    name: "Kurzhub-Honwerkzeug Ø 8–15 mm",
    slug: "kurzhub-honwerkzeug-8-15mm",
    description:
      "Kompaktes Kurzhub-Honwerkzeug für kleine Bohrungen 8–15 mm. Ideal für Ventilführungen, Hydraulikventile und Einspritzkomponenten.",
    price: 215.0,
    stock: 22,
    categorySlug: "honwerkzeuge",
    images: ["/images/products/rotoblast.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [
      "sunnen-sv-10",
      "nagel-eco-20",
      "kadia-lh-63",
      "delapena-speedhone",
    ],
  },

  // ---- Schleifmittel -----------------------------------------------------
  {
    sku: "NEPA-SM-001",
    name: "Honöl NEPA CUT 32",
    slug: "honoel-nepa-cut-32",
    description:
      "Hochleistungs-Honöl mit EP-Additiven, Viskosität 32 mm²/s bei 40 °C. Für alle gängigen Honverfahren auf Stahl und Gusseisen. 20-Liter-Kanister.",
    price: 89.0,
    stock: 60,
    categorySlug: "schleifmittel",
    images: ["/images/products/tunclean.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [],
  },
  {
    sku: "NEPA-SM-002",
    name: "Diamantpaste 6 µm, 10 g Spritze",
    slug: "diamantpaste-6um-10g",
    description:
      "Polykristalline Diamantpaste, 6 µm Korngröße, wasserbasiert. Für die Feinst- und Spiegelbearbeitung. Gleichmäßige Kornverteilung für kratzfreie Oberflächen.",
    price: 42.5,
    stock: 100,
    categorySlug: "schleifmittel",
    images: ["/images/products/cleanex.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [],
  },
  {
    sku: "NEPA-SM-003",
    name: "Schleifleinen-Rolle K400, 50 m",
    slug: "schleifleinen-rolle-k400-50m",
    description:
      "Gewebeschleifleinen auf Baumwollbasis, Körnung 400. Für die manuelle Nachbearbeitung von Honoberflächen und allgemeine Schleifarbeiten. Breite 50 mm.",
    price: 28.9,
    stock: 75,
    categorySlug: "schleifmittel",
    images: ["/images/products/ac200.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [],
  },
  {
    sku: "NEPA-SM-004",
    name: "Läpp-Paste Siliziumkarbid K600, 500 g",
    slug: "laepp-paste-sic-k600-500g",
    description:
      "Siliziumkarbid-Läpppaste der Körnung 600 in ölgebundener Formulierung. Für das Einläppen von Ventilsitzen, Flanschen und Dichtflächen. 500 g Dose.",
    price: 36.0,
    stock: 50,
    categorySlug: "schleifmittel",
    images: ["/images/products/cleanex-n.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [],
  },

  // ---- Diamantwerkzeuge --------------------------------------------------
  {
    sku: "NEPA-DW-001",
    name: "Diamant-Abrichtstift 1,0 ct",
    slug: "diamant-abrichtstift-1ct",
    description:
      "Einkristall-Diamant-Abrichtstift, 1,0 Karat, Messing-Schaft Ø 10 mm. Zum Abrichten von konventionellen Schleifscheiben. Spitzenwinkel 70°.",
    price: 165.0,
    stock: 25,
    categorySlug: "diamantwerkzeuge",
    images: ["/images/products/ae-gauges.jpg"],
    pdfUrl: "/docs/technisches-datenblatt-abrichtstift-1ct.pdf",
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [],
  },
  {
    sku: "NEPA-DW-002",
    name: "Diamant-Honahle Ø 4 mm",
    slug: "diamant-honahle-4mm",
    description:
      "Diamant-beschichtete Honahle, Ø 4 mm, Arbeitslänge 30 mm. Körnung D64. Für die Präzisionsbearbeitung von Kleinstbohrungen in Hartmetall und Keramik.",
    price: 125.0,
    stock: 35,
    categorySlug: "diamantwerkzeuge",
    images: ["/images/products/amc-rund.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: ["sunnen-sv-10", "nagel-eco-20", "kadia-lh-63"],
  },
  {
    sku: "NEPA-DW-003",
    name: "PKD-Honleiste 80 mm",
    slug: "pkd-honleiste-80mm",
    description:
      "Polykristalliner Diamant-Honleiste, 80 mm Arbeitslänge. Extrem hohe Standzeit bei der Bearbeitung von Al-Si-Legierungen und MMC-Werkstoffen. Galvanische Bindung.",
    price: 395.0,
    stock: 15,
    categorySlug: "diamantwerkzeuge",
    images: ["/images/products/amc-motor.jpg"],
    pdfUrl: "/docs/technisches-datenblatt-pkd-honleiste-80.pdf",
    isUsed: false,
    isB2BOnly: true,
    machineSlugs: [
      "sunnen-ml-2000",
      "gehring-2z-800",
      "nagel-eco-40",
      "delapena-superhone",
    ],
  },
  {
    sku: "NEPA-DW-004",
    name: "Diamant-Schleifstift zylindrisch Ø 6 mm (gebraucht)",
    slug: "diamant-schleifstift-6mm-gebraucht",
    description:
      "Gebrauchter zylindrischer Diamant-Schleifstift, Ø 6 mm, Schaft Ø 3 mm. Restbelag ca. 60 %. Für leichte Nachbearbeitung und Entgratung.",
    price: 45.0,
    stock: 8,
    categorySlug: "diamantwerkzeuge",
    images: ["/images/products/reinigung-vorher.jpg"],
    isUsed: true,
    isB2BOnly: false,
    machineSlugs: [],
  },

  // ---- Ersatzteile -------------------------------------------------------
  {
    sku: "NEPA-ET-001",
    name: "Zustellkegel für Sunnen MBB/MBC",
    slug: "zustellkegel-sunnen-mbb-mbc",
    description:
      "Original-kompatibler Zustellkegel (Mandrel Wedge) für Sunnen MBB-1660 und MBC-1804. Gehärteter Werkzeugstahl, geschliffen auf ±0,002 mm.",
    price: 68.0,
    stock: 40,
    categorySlug: "ersatzteile",
    images: ["/images/machines/sunnen-mbc1805g.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: ["sunnen-mbb-1660", "sunnen-mbc-1804"],
  },
  {
    sku: "NEPA-ET-002",
    name: "Spindelaufnahme HSK-A63 für Gehring",
    slug: "spindelaufnahme-hsk-a63-gehring",
    description:
      "HSK-A63-Spindelaufnahme, kompatibel mit Gehring 1Z-500 und 2Z-800. Wuchtgüte G2.5 bei 25.000 min⁻¹. Wiederholgenauigkeit < 3 µm.",
    price: 285.0,
    stock: 12,
    categorySlug: "ersatzteile",
    images: ["/images/machines/sunnen-ah222g.jpg"],
    pdfUrl: "/docs/technisches-datenblatt-hsk-a63.pdf",
    isUsed: false,
    isB2BOnly: true,
    machineSlugs: ["gehring-1z-500", "gehring-2z-800"],
  },
  {
    sku: "NEPA-ET-003",
    name: "Druckfeder-Satz für Nagel ECO (6 Stück)",
    slug: "druckfeder-satz-nagel-eco-6st",
    description:
      "Satz mit 6 Druckfedern für die Leistenanpressung in Nagel ECO 20 und ECO 40 Honwerkzeugen. Federkraft kalibriert auf 15 N ±0,5 N.",
    price: 22.5,
    stock: 65,
    categorySlug: "ersatzteile",
    images: ["/images/machines/sunnen-lbb1710a.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: ["nagel-eco-20", "nagel-eco-40"],
  },
  {
    sku: "NEPA-ET-004",
    name: "Führungsleiste Bronze für Kadia LH",
    slug: "fuehrungsleiste-bronze-kadia-lh",
    description:
      "Bronze-Führungsleiste für Kadia LH 63 und LH 80 Honwerkzeuge. Selbstschmierende Legierung CuSn8P. Nachschliff möglich.",
    price: 55.0,
    stock: 30,
    categorySlug: "ersatzteile",
    images: ["/images/machines/sunnen-werkzeuge-klein.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: ["kadia-lh-63", "kadia-lh-80"],
  },

  // ---- Zubehör -----------------------------------------------------------
  {
    sku: "NEPA-ZB-001",
    name: "Oberflächenrauheits-Vergleichsmuster Ra 0,2–3,2",
    slug: "oberflaechenrauheits-vergleichsmuster",
    description:
      "Vergleichsmuster-Set für Oberflächenrauheit nach DIN EN ISO 4287. Stufen: Ra 0,2 / 0,4 / 0,8 / 1,6 / 3,2 µm. Geschliffene und gehonte Referenzflächen.",
    price: 145.0,
    stock: 20,
    categorySlug: "zubehoer",
    images: ["/images/products/multiclean.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [],
  },
  {
    sku: "NEPA-ZB-002",
    name: "Innenmessschraube 50–75 mm",
    slug: "innenmessschraube-50-75mm",
    description:
      "Dreipunkt-Innenmessschraube, Messbereich 50–75 mm, Auflösung 0,001 mm. Mit Einstellring und Etui. Für die Qualitätskontrolle nach dem Honen.",
    price: 189.0,
    stock: 15,
    categorySlug: "zubehoer",
    images: ["/images/products/mobilclean.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [],
  },
  {
    sku: "NEPA-ZB-003",
    name: "Kühlmittel-Mischanlage 60 L",
    slug: "kuehlmittel-mischanlage-60l",
    description:
      "Kompakte Kühlmittel-Mischanlage mit 60-Liter-Behälter, Umwälzpumpe und Partikelfilter. Für die saubere Versorgung von Honmaschinen mit Schneidöl.",
    price: 420.0,
    stock: 5,
    categorySlug: "zubehoer",
    images: ["/images/products/comboclean.jpg"],
    isUsed: false,
    isB2BOnly: true,
    machineSlugs: [],
  },
  {
    sku: "NEPA-ZB-004",
    name: "Magnetfilter-Einsatz für Honöl",
    slug: "magnetfilter-einsatz-honoel",
    description:
      "Hochleistungs-Magnetfilter-Einsatz zur Entfernung von ferromagnetischen Partikeln aus dem Honöl-Kreislauf. Neodym-Magnete, Filterfeinheit < 5 µm.",
    price: 75.0,
    stock: 35,
    categorySlug: "zubehoer",
    images: ["/images/products/sprayclean.jpg"],
    isUsed: false,
    isB2BOnly: false,
    machineSlugs: [],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("🌱 NEPA Kreuzschleiftechnik — Datenbank-Seed gestartet ...\n");

  // ---------- clean up (order matters because of FK constraints) ----------
  console.log("🗑  Lösche bestehende Daten ...");
  await prisma.$transaction([
    prisma.productMachine.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.inventoryLog.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.machine.deleteMany(),
    prisma.category.deleteMany(),
  ]);
  console.log("   Bestehende Daten gelöscht.\n");

  // ---------- categories --------------------------------------------------
  console.log("📂 Erstelle Kategorien ...");
  const createdCategories = await prisma.$transaction(
    categories.map((c) =>
      prisma.category.create({ data: c })
    )
  );
  const categoryMap = new Map(createdCategories.map((c) => [c.slug, c.id]));
  console.log(`   ${createdCategories.length} Kategorien erstellt.\n`);

  // ---------- machines ----------------------------------------------------
  console.log("🏭 Erstelle Maschinen ...");
  const createdMachines = await prisma.$transaction(
    machines.map((m) =>
      prisma.machine.create({ data: m })
    )
  );
  const machineMap = new Map(createdMachines.map((m) => [m.slug, m.id]));
  console.log(`   ${createdMachines.length} Maschinen erstellt.\n`);

  // ---------- products + compatibilities ----------------------------------
  console.log("📦 Erstelle Produkte und Maschinenkompatibilitäten ...");

  let productCount = 0;
  let compatCount = 0;

  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`   ⚠ Kategorie "${p.categorySlug}" nicht gefunden für SKU ${p.sku} — übersprungen.`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        categoryId,
        images: p.images,
        pdfUrl: p.pdfUrl ?? null,
        isUsed: p.isUsed,
        isB2BOnly: p.isB2BOnly,
      },
    });
    productCount++;

    // machine compatibilities
    if (p.machineSlugs.length > 0) {
      const machineLinks = p.machineSlugs
        .map((slug) => {
          const machineId = machineMap.get(slug);
          if (!machineId) {
            console.warn(`   ⚠ Maschine "${slug}" nicht gefunden für SKU ${p.sku} — übersprungen.`);
            return null;
          }
          return { productId: product.id, machineId };
        })
        .filter((link): link is { productId: string; machineId: string } => link !== null);

      if (machineLinks.length > 0) {
        await prisma.productMachine.createMany({ data: machineLinks });
        compatCount += machineLinks.length;
      }
    }
  }

  console.log(`   ${productCount} Produkte erstellt.`);
  console.log(`   ${compatCount} Maschinenkompatibilitäten erstellt.\n`);

  // ---------- summary -----------------------------------------------------
  console.log("✅ Seed abgeschlossen!");
  console.log("   Zusammenfassung:");
  console.log(`     Kategorien:          ${createdCategories.length}`);
  console.log(`     Maschinen:           ${createdMachines.length}`);
  console.log(`     Produkte:            ${productCount}`);
  console.log(`     Kompatibilitäten:    ${compatCount}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed fehlgeschlagen:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
