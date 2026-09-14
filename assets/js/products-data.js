/**
 * AMAZON // ATELIER — Expanded Curated Catalog Data (16 Objects)
 * Precision engineering, architectural objects, horology & high-ticket design.
 * Includes complete faceted filter attributes: brand, category, materials, price, rating, prime.
 */

const PRODUCTS_DATA = [
  {
    id: "amzn-001",
    name: "OP-1 Field Portable Synthesizer",
    brand: "TEENAGE ENGINEERING",
    category: "Synthesizers",
    price: 1999,
    rating: 4.9,
    reviewsCount: 342,
    primeExpress: true,
    inStock: true,
    material: "Anodized Aluminum",
    tag: "CURATED FLAGSHIP",
    featured: true,
    image: "assets/images/prod-synth.jpg",
    specs: {
      "Enclosure": "Anodized Aluminum Unibody",
      "Dimensions": "288 x 102 x 29 mm",
      "Weight": "590 g",
      "Battery": "24 Hours Continuous Play",
      "Sampling": "32-bit Stereo Signal Chain"
    },
    description: "The definitive aluminum unibody workstation. 100 new features including stereo signal path throughout, 24-hour battery life, multiple tapes, and high-resolution glass flush display."
  },
  {
    id: "amzn-002",
    name: "Beoplay H95 Titanium Edition",
    brand: "BANG & OLUFSEN",
    category: "Acoustics",
    price: 999,
    rating: 4.8,
    reviewsCount: 518,
    primeExpress: true,
    inStock: true,
    material: "Brushed Titanium",
    tag: "STUDIO REFERENCE",
    featured: false,
    image: "assets/images/prod-headphones.jpg",
    specs: {
      "Drivers": "40mm Custom Titanium Drivers",
      "Materials": "Brushed Titanium & Lambskin",
      "Weight": "323 g",
      "Noise Cancelling": "Adaptive Digital ANC",
      "Battery": "38 Hours with ANC active"
    },
    description: "Engineered for 95 years of acoustic heritage. Brushed titanium folding arms, magnetic lambskin ear cushions, and rotary dial precision volume mechanics."
  },
  {
    id: "amzn-003",
    name: "M11 Monochrom Rangefinder",
    brand: "LEICA CAMERA",
    category: "Optics",
    price: 9195,
    rating: 5.0,
    reviewsCount: 84,
    primeExpress: true,
    inStock: true,
    material: "Machined Brass",
    tag: "PURE MONOCHROME",
    featured: false,
    image: "assets/images/prod-camera.jpg",
    specs: {
      "Sensor": "60MP Full-Frame BSI CMOS",
      "ISO Range": "125 to 200,000",
      "Internal Storage": "256 GB High-Speed Flash",
      "Top Plate": "Machined Solid Brass",
      "Viewfinder": "0.73x Optical Rangefinder"
    },
    description: "Pure black and white photography stripped of color filter arrays for unparalleled dynamic range, microscopic sharpness, and authentic rangefinder manual focus."
  },
  {
    id: "amzn-004",
    name: "Transparent Small Acoustic Speaker",
    brand: "TRANSPARENT SOUND",
    category: "Acoustics",
    price: 550,
    rating: 4.7,
    reviewsCount: 220,
    primeExpress: true,
    inStock: true,
    material: "Tempered Glass",
    tag: "CIRCULAR DESIGN",
    featured: false,
    image: "assets/images/prod-speaker.jpg",
    specs: {
      "Material": "Tempered Glass & Aluminum",
      "Amplifier": "Class D Active 2 x 15W",
      "Dimensions": "268 x 203 x 95 mm",
      "Connectivity": "True Wireless & AirPlay",
      "Upgradability": "Modular Replaceable Chips"
    },
    description: "Stripped of decorative clutter. Tempered glass panes showcase internal acoustic drivers, clean wiring geometry, and modular upgradeable components designed to last decades."
  },
  {
    id: "amzn-005",
    name: "BN0035 Classic Chronograph",
    brand: "BRAUN DESIGN",
    category: "Timepieces",
    price: 320,
    rating: 4.9,
    reviewsCount: 680,
    primeExpress: true,
    inStock: true,
    material: "Brushed Steel",
    tag: "DIETER RAMS LEGACY",
    featured: false,
    image: "assets/images/prod-watch.jpg",
    specs: {
      "Case": "38mm Brushed Stainless Steel",
      "Movement": "Precision Quartz Chrono",
      "Glass": "Scratch-Resistant Mineral Crystal",
      "Water Resistance": "5 ATM (50 Meters)",
      "Strap": "German Matte Calfskin"
    },
    description: "Designed in accordance with Dieter Rams' ten principles of good design. Iconic yellow stopwatch second hand, balanced sub-dials, and clean functional dial geometry."
  },
  {
    id: "amzn-006",
    name: "Model B3 Wassily Lounge Chair",
    brand: "KNOLL STUDIO",
    category: "Industrial Living",
    price: 3450,
    rating: 4.9,
    reviewsCount: 112,
    primeExpress: false,
    inStock: true,
    material: "Tubular Chrome",
    tag: "BAUHAUS 1925",
    featured: false,
    image: "assets/images/prod-chair.jpg",
    specs: {
      "Frame": "Seamless Tubular Chrome Steel",
      "Straps": "Heavy Harness Leather",
      "Dimensions": "79 x 69 x 73 cm",
      "Origin": "Handcrafted in Italy",
      "Design Year": "1925 by Marcel Breuer"
    },
    description: "A watershed moment in modern furniture design. Seamless bent tubular steel inspired by bicycle construction, suspended by taut black saddle leather straps."
  },
  {
    id: "amzn-007",
    name: "Tab T Architectural Task Lamp",
    brand: "FLOS LIGHTING",
    category: "Industrial Living",
    price: 495,
    rating: 4.8,
    reviewsCount: 194,
    primeExpress: true,
    inStock: true,
    material: "Anodized Aluminum",
    tag: "EDWARD BARBER & OSGERBY",
    featured: false,
    image: "assets/images/prod-lamp.jpg",
    specs: {
      "Material": "Die-Cast Aluminum & Porcelain",
      "Light Source": "14 LED 9W 2700K Warm White",
      "Head Rotation": "45-Degree Precision Swivel",
      "Diffuser": "PMMA Anti-Glare Optic",
      "Height": "327 mm"
    },
    description: "Minimalist folded aluminum sheet shade that rotates 45 degrees to direct clean, anti-glare light across executive workspaces without harsh shadows."
  },
  {
    id: "amzn-008",
    name: "Ratio Eight Precision Coffee Maker",
    brand: "RATIO BREWERS",
    category: "Industrial Living",
    price: 795,
    rating: 4.7,
    reviewsCount: 165,
    primeExpress: true,
    inStock: true,
    material: "Cast Aluminum",
    tag: "PRECISION EXTRACTION",
    featured: false,
    image: "assets/images/prod-coffee.jpg",
    specs: {
      "Body": "Cast Aluminum & Hand-Blown Borosilicate",
      "Carafe": "Dual-Wall Vacuum Thermal Steel",
      "Temperature": "PID Controlled 200°F Stability",
      "Capacity": "1.25 Liters (8 Cups)",
      "Cycle": "Simulated Pour-Over Bloom Sequence"
    },
    description: "Cast metal, polished hardwood accents, and laboratory-grade glass. Replaces complex manual pour-over procedures with automated sensor bloom calculations."
  },
  {
    id: "amzn-009",
    name: "Heritage Snowflake SBGA211",
    brand: "GRAND SEIKO",
    category: "Timepieces",
    price: 6200,
    rating: 5.0,
    reviewsCount: 142,
    primeExpress: true,
    inStock: true,
    material: "High-Intensity Titanium",
    tag: "SPRING DRIVE 9R65",
    featured: false,
    image: "assets/images/prod-horology.jpg",
    specs: {
      "Case": "41mm High-Intensity Titanium",
      "Movement": "Caliber 9R65 Spring Drive",
      "Accuracy": "±15 Seconds per Month",
      "Power Reserve": "72 Hours with Indicator",
      "Finishing": "Zaratsu Distortion-Free Polish"
    },
    description: "The world-renowned snowflake dial captures the windswept snow mountains of Shinshu, Japan. Seamless gliding blue-steel second hand driven by Spring Drive electro-mechanical caliber."
  },
  {
    id: "amzn-010",
    name: "Mojave Ghost Extrait de Parfum",
    brand: "BYREDO PARFUMS",
    category: "Apparel & Scent",
    price: 320,
    rating: 4.9,
    reviewsCount: 420,
    primeExpress: true,
    inStock: true,
    material: "Hand-Blown Glass",
    tag: "WOODY FLORAL",
    featured: false,
    image: "assets/images/prod-perfume.jpg",
    specs: {
      "Volume": "100 ml / 3.4 oz",
      "Concentration": "Extrait de Parfum (25% Oil)",
      "Top Notes": "Ambrette, Jamaican Nesberry",
      "Heart Notes": "Violet, Sandalwood, Magnolia",
      "Base Notes": "Chantilly Musk, Crisp Amber, Cedar"
    },
    description: "Inspired by the ghost flower of the Mojave desert that blossoms over hard-baked soils. A pale woody composition with mesmerizing notes of musky ambrette and sweet violet."
  },
  {
    id: "amzn-011",
    name: "Raw Canvas Utility Overshirt",
    brand: "ATELIER ORA",
    category: "Apparel & Scent",
    price: 420,
    rating: 4.8,
    reviewsCount: 96,
    primeExpress: true,
    inStock: true,
    material: "Heavy Duck Canvas",
    tag: "BESPOKE TAILORING",
    featured: false,
    image: "assets/images/prod-streetwear.jpg",
    specs: {
      "Fabric": "480 GSM Unbleached Cotton Canvas",
      "Hardware": "Matte Black Oxide Shank Buttons",
      "Pockets": "Dual Architectural Chest Flaps",
      "Fit": "Drop-Shoulder Boxy Silhouette",
      "Origin": "Milan Atelier Handcrafted"
    },
    description: "Cut from heavy dry-wax duck canvas that softens and molds to the wearer over decades. Finished with felled double seams and custom matte black oxide shank buttons."
  },
  {
    id: "amzn-012",
    name: "TP-7 Ultra-Portable Audio Recorder",
    brand: "TEENAGE ENGINEERING",
    category: "Synthesizers",
    price: 1499,
    rating: 4.9,
    reviewsCount: 110,
    primeExpress: true,
    inStock: true,
    material: "Anodized Aluminum",
    tag: "MOTORIZED TAPE REEL",
    featured: false,
    image: "assets/images/prod-tp7.jpg",
    specs: {
      "Tape Reel": "Motorized Touch-Sensitive Spool",
      "Internal Storage": "128 GB Audio Memory",
      "Inputs": "3 x Stereo In/Out / Headset Jack",
      "Microphone": "Internal Speech-Optimized Mic",
      "Battery": "7 Hours Continuous Recording"
    },
    description: "Field recording reimagined with an active motorized mechanical tape reel that spins under your thumb to pause, scrub, fast-forward, and scrub through live interview transcripts."
  },
  {
    id: "amzn-013",
    name: "Volo Matte Ultrasonic Diffuser",
    brand: "VITRUVI DESIGN",
    category: "Industrial Living",
    price: 180,
    rating: 4.7,
    reviewsCount: 310,
    primeExpress: true,
    inStock: true,
    material: "Hand-Crafted Ceramic",
    tag: "SPATIAL WELLNESS",
    featured: false,
    image: "assets/images/prod-wellness.jpg",
    specs: {
      "Cover": "Matte Hand-Poured Ceramic Stone",
      "Run Time": "Up to 14 Hours Continuous",
      "Coverage": "Up to 500 sq. ft.",
      "Ultrasonic": "2.5 Million Oscillations / Sec",
      "Light": "Warm Ambient Night Glow"
    },
    description: "A monolithic decorative object that doubles as an ultrasonic essential oil diffuser. Crafted from textured matte ceramic to blend seamlessly into architectural interiors."
  },
  {
    id: "amzn-014",
    name: "MA-1 Washed Olive Canvas Bomber",
    brand: "ATELIER ORA",
    category: "Apparel & Scent",
    price: 540,
    rating: 4.9,
    reviewsCount: 88,
    primeExpress: true,
    inStock: true,
    material: "Heavy Duck Canvas",
    tag: "FLIGHT SILHOUETTE",
    featured: false,
    image: "assets/images/prod-bomber.jpg",
    specs: {
      "Shell": "420 GSM Heavy Washed Duck Canvas",
      "Lining": "Quilted Japanese Cupro Twill",
      "Zipper": "Custom Riri M8 Solid Brass",
      "Collar": "Heavyweight 1x1 Wool Ribbing",
      "Insulation": "100 GSM Recycled Primaloft"
    },
    description: "Re-engineering the classic 1950s flight jacket in enzyme-washed olive duck canvas with custom Swiss Riri brass zips and heavyweight pure wool ribbing."
  },
  {
    id: "amzn-015",
    name: "Goodyear Hand-Welted Chelsea Boot",
    brand: "ATELIER ORA",
    category: "Apparel & Scent",
    price: 490,
    rating: 4.8,
    reviewsCount: 74,
    primeExpress: true,
    inStock: true,
    material: "Brushed Calf Suede",
    tag: "HERITAGE COBBLING",
    featured: false,
    image: "assets/images/prod-boots.jpg",
    specs: {
      "Upper": "French Water-Repellent Calf Suede",
      "Construction": "Goodyear 360-Degree Storm Welt",
      "Sole": "Dainite British Studded Rubber",
      "Lining": "Full Glove Leather Interior",
      "Origin": "Northamptonshire, England"
    },
    description: "Handcrafted on traditional British lasts with French water-repellent calf suede and genuine Dainite rubber studded soles. Resoleable for decades of wear."
  },
  {
    id: "amzn-016",
    name: "Double-Breasted Heavy Wool Trench",
    brand: "ATELIER ORA",
    category: "Apparel & Scent",
    price: 780,
    rating: 5.0,
    reviewsCount: 62,
    primeExpress: false,
    inStock: true,
    material: "Virgin Wool Melange",
    tag: "ARCHITECTURAL OVERCOAT",
    featured: false,
    image: "assets/images/prod-trench.jpg",
    specs: {
      "Fabric": "750 GSM Unbleached Virgin Wool Melange",
      "Buttons": "Real Buffalo Horn Hand-Carved",
      "Lapel": "Broad Peak Lapel with Throat Latch",
      "Belt": "Detachable Self-Fabric Waist Tie",
      "Length": "Extended Below-Knee Cut"
    },
    description: "Substantial 750 GSM virgin wool woven in Biella, Italy. Uncompromising drape, deep storm flaps, real buffalo horn buttons, and an architectural oversized silhouette."
  }
];

const CATEGORIES_TAXONOMY = [
  { id: "all", name: "All Objects", count: 16 },
  { id: "acoustics", name: "Acoustics & Studio Audio", count: 2 },
  { id: "optics", name: "Optics & Precision Cameras", count: 1 },
  { id: "synthesizers", name: "Synthesizers & Field Audio", count: 2 },
  { id: "living", name: "Industrial Design & Living", count: 4 },
  { id: "timepieces", name: "Horology & Chronographs", count: 2 },
  { id: "apparel", name: "Apparel & Scent", count: 5 }
];

const BRANDS_LIST = [
  "TEENAGE ENGINEERING",
  "BANG & OLUFSEN",
  "LEICA CAMERA",
  "BRAUN DESIGN",
  "KNOLL STUDIO",
  "FLOS LIGHTING",
  "TRANSPARENT SOUND",
  "RATIO BREWERS",
  "GRAND SEIKO",
  "BYREDO PARFUMS",
  "ATELIER ORA",
  "VITRUVI DESIGN"
];

const MATERIALS_LIST = [
  "Anodized Aluminum",
  "Brushed Titanium",
  "Machined Brass",
  "Tempered Glass",
  "Tubular Chrome",
  "Brushed Steel",
  "Cast Aluminum",
  "High-Intensity Titanium",
  "Hand-Blown Glass",
  "Heavy Duck Canvas",
  "Hand-Crafted Ceramic",
  "Brushed Calf Suede",
  "Virgin Wool Melange"
];
