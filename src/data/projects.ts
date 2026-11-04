export interface Project {
  title: string;
  url: string;
  description: string;
  image: string;
  imagePosition: string;
  imageClass: string;
  year: string;
}

export const projects: Project[] = [
  {
    title: "QuICK-experiment",
    url: "https://github.com/dvdawg/QuICK-exp",
    description: "A superconducting qubit measurement workflow for RFSoC QICK boards.",
    image: "/assets/projects/thumbnails/quick.png",
    imagePosition: "left",
    imageClass: "",
    year: "2026",
  },
  {
    title: "SpeedyF",
    url: "https://github.com/dvdawg/speedyf",
    description: "An improved desktop PDF viewer with a focus on lightweight, fast performance and various convenience features for viewing academic papers.",
    image: "/assets/projects/thumbnails/speedyf.png",
    imagePosition: "center",
    imageClass: "!h-[calc(100%-6rem)]",
    year: "2026",
  },
  {
    title: "MING Diode",
    url: "/assets/projects/ming_pres.pdf",
    description: "The Matched-pair Inverting Nonlinear Generator (MING) diode. A Chua-style diode with a piecewise-linear I-V characteristic using matched JFET behavior, op-amp signal conditioning, and bias networks to create a tunable nonlinear port.",
    image: "/assets/projects/thumbnails/MING.png",
    imagePosition: "center top",
    imageClass: "",
    year: "2026",
  },
  {
    title: "Herald",
    url: "https://github.com/dvdawg/herald",
    description: "An improved news source combined with an academic paper-reading engine.",
    image: "/assets/projects/thumbnails/herald.jpg",
    imagePosition: "center top",
    imageClass: "",
    year: "2025",
  },
  {
    title: "Buckit",
    url: "https://github.com/dvdawg/buckit",
    description: "An intelligent social bucket list app. Built during CalHacks 12.0.",
    image: "/assets/projects/thumbnails/buckit.png",
    imagePosition: "center top",
    imageClass: "",
    year: "2025",
  },
  {
    title: "Certified Deletion Circuits",
    url: "https://github.com/gheustace/quantumalg",
    description: "An implementation of a homomorphic certified deletion scheme with quantum computing at Berkeley.",
    image: "/assets/projects/thumbnails/certifieddel.jpeg",
    imagePosition: "center top",
    imageClass: "",
    year: "2024",
  },
];
