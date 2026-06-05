// Central content source for the Yale Helix homepage.
// Copy is preserved from the original site with light hygiene (typo fixes,
// sentence case, no em-dashes, no exclamation marks).

export const NAV_LINKS = [
  { label: "What we do", href: "#what-we-do" },
  { label: "Timeline", href: "#timeline" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Team", href: "#team" },
  { label: "Fellows", href: "#fellows" },
  { label: "Contact", href: "#contact" },
] as const;

export const HERO = {
  title: "Yale Helix",
  subtitle: "Healthcare and biotech startup incubator",
  mission:
    "Helix is Yale's only undergraduate-run incubator. We bring together some of Yale's most talented, motivated, and ambitious students to challenge real-world problems in software, healthcare, and biotech. We seek students from all backgrounds, across software engineering, finance, biology, and the liberal arts. Students join rising startups in long-term working relationships. From full-stack development and researching biologics to marketing, UI/UX, and raising capital, students make a real impact while building skills, connections, and achievements.",
};

export const FEATURES_LINES = ["Connecting", "Visionary Startups", "And College Talent", "At Yale"];

// "What We Do" services ride the rotating helix rungs.
export type Service = { title: string; body: string };

export const SERVICES: Service[] = [
  {
    title: "Software Engineering",
    body: "From ideation to prototypes and product building, students in software help build the full tech stack of a real-world product, with the mentorship of a close-knit startup team.",
  },
  {
    title: "Business Research",
    body: "Research on competitors, incumbents, and business models, or the cutting edge of new science, to position startups for successful funding rounds and market entry.",
  },
  {
    title: "Marketing, Design, and UI/UX",
    body: "Students create a distinct visual identity and online presence that communicate startups to VCs, investors, and potential partners.",
  },
  {
    title: "Clinical and Healthcare Research",
    body: "Work directly in a lab on biologics or medical devices. Conduct literature research on clinical and patient outcomes. Help bring the next generation of therapeutics to market.",
  },
];

export const STATS: { value: number; suffix?: string; label: string; sublabel: string }[] = [
  { value: 10, label: "Years operating", sublabel: "since 2016" },
  { value: 62, label: "Selected startups", sublabel: "since Helix's founding" },
  { value: 32000, suffix: "+", label: "Hours of support", sublabel: "provided in the last year" },
  { value: 247, label: "Yale students", sublabel: "paired with startups through Helix" },
];

export type TimelineItem = {
  date: string;
  event: string;
  body?: string;
  location?: string;
  details?: string[];
};

export type Startup = {
  name: string;
  image: string;
  category: "software" | "therapeutics";
  blurbs: string[];
  link?: string;
};

export const PORTFOLIO: Startup[] = [
  {
    name: "Lucid.Care",
    image: "/assets/img/masonry-portfolio/lucidcare-optimized.png",
    category: "software",
    blurbs: [
      "Digital labwork and longitudinal tracking for behavioral health.",
      "Venture-backed by Forum Ventures.",
      "Winner of the National Institute on Drug Abuse Challenge, 2023 Start and SUD Startup.",
      "Winner of the American Psychiatric Association pitch competition at the 2024 Psychiatric Innovation Lab.",
    ],
    link: "https://lucid.care/",
  },
  {
    name: "CTRLTrial",
    image: "/assets/img/masonry-portfolio/ctrltrial-optimized.png",
    category: "software",
    blurbs: [
      "Accelerating clinical trial recruitment with AI.",
      "$1.3 million raised to date, with pilot partnerships with Yale New Haven Health, Pfizer, and Eli Lilly.",
      "Winner of the 2020 Rothberg Catalyzer $15,000 prize.",
      "Winner of the 2022 Yale CBIT Hit Play $1K award.",
    ],
    link: "https://www.ctrltrial.com/",
  },
  {
    name: "Fulcrum Care",
    image: "/assets/img/masonry-portfolio/fulcrum-care2-optimized.png",
    category: "software",
    blurbs: [
      "Tech-enabled dental care improving access for individuals with complex needs.",
      "2025 Startup Yale Thorne Prize winner.",
      "Winner of the Dwight Hall Audience Choice $2,000 award.",
    ],
    link: "https://www.getfulcrumcare.com/",
  },
  {
    name: "UpKeep Care",
    image: "/assets/img/masonry-portfolio/upkeepcare-optimized.png",
    category: "software",
    blurbs: [
      "AI-powered care and social services platform for elderly adults.",
      "Rita Wilson Seed Grant recipient.",
      "Winner of the 2024 Startup Yale Thorne Healthcare Innovation Prize.",
      "Partnered with 211 United Way.",
    ],
    link: "https://www.upkeepcare.org/",
  },
  {
    name: "EnlighteN",
    image: "/assets/img/masonry-portfolio/enlighten-optimized.png",
    category: "therapeutics",
    blurbs: [
      "Naloxone sensory injector for opioid overdose detection and reversal.",
      "Winner of the Rothberg Catalyzer Fund and $10K from the NIH.",
    ],
    link: "https://medium.com/tsai-city/kickstarting-healthcare-innovation-with-the-rothberg-catalyzer-prototype-fund-6f5a1f37c5c2",
  },
  {
    name: "Ceidon Therapeutics",
    image: "/assets/img/masonry-portfolio/ceidon-optimized.png",
    category: "therapeutics",
    blurbs: [
      "Calcium-targeting oncology therapeutic.",
      "2024 Yale Innovation Summit Biotech ePoster Award winner.",
    ],
    link: "https://drive.google.com/file/d/12IUlcfpuW_ZvuLNukURd-9_ejSuzUh4Y/view",
  },
  {
    name: "Luminous",
    image: "/assets/img/masonry-portfolio/luminous-optimized.png",
    category: "therapeutics",
    blurbs: ["Smart hospital supply rooms.", "Winner of the $30K Bioscience Pipeline."],
  },
  {
    name: "EpiTET Therapeutics",
    image: "/assets/img/masonry-portfolio/epitet-optimized.png",
    category: "therapeutics",
    blurbs: [
      "First-in-class therapeutic for endometriosis.",
      "2024 National Nucleate Venture Prize recipient.",
      "Winner of the BioLabs Golden Ticket.",
      "Selected by the Blavatnik Fund for Innovation at Yale in 2022.",
    ],
    link: "https://www.epitettx.com/",
  },
];

// Co-Presidents keep photos; everyone else is listed by name only.
export const CO_PRESIDENTS = [
  { name: "Maya Kulesza", image: "/assets/img/team/maya-optimized.jpeg" },
  { name: "Rohan Suri", image: "/assets/img/team/rohan-optimized.jpg" },
];

export const EXEC_BOARD = [
  "Gautham Ramshankar",
  "Justin Xie",
  "Kate Choi",
  "William Wakefield",
  "Marcus Lee",
  "Atreya Manaswi",
  "Antara Bajaj",
  "Giulio Sotti",
  "Irene Sun",
];

export const ADVISORY_BOARD = [
  { name: "Jorge Torres", title: "JD, Tsai CITY Entrepreneurial Advisor" },
  { name: "Howard P. Forman", title: "MD, MBA" },
  { name: "David Rosenthal", title: "MD, Venture Partner at AlleyCorp" },
];

export const FOOTER = {
  address: ["17 Prospect St", "New Haven, CT 06511"],
  email: "admin@yalehelix.org",
};
