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
    title: "Herald",
    url: "https://github.com/dvdawg/herald",
    description: "An improved news source combined with an academic paper-reading engine.",
    image: "/assets/projects/thumbnails/herald.jpg",
    imagePosition: "center top",
    imageClass: "",
    year: "2025",
  },
  {
    title: "MING Diode",
    url: "/assets/projects/ming_pres.pdf",
    description: "The Matched-pair Inverting Nonlinear Generator: A custom nonlinear diode.",
    image: "/assets/projects/thumbnails/MING.png",
    imagePosition: "center top",
    imageClass: "",
    year: "2026",
  },
  {
    title: "Quantum cryptographic algorithms",
    url: "https://github.com/gheustace/quantumalg",
    description: "An implementation of a homomorphic certified deletion scheme with quantum computing at berkeley",
    image: "/assets/projects/thumbnails/certifieddel.jpeg",
    imagePosition: "center top",
    imageClass: "",
    year: "2024",
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
];
