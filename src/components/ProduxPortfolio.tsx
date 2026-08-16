"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  gridClass: string;
}

const projects: Project[] = [
  {
    id: "payy",
    title: "Payy Network",
    description: "Stablecoin payments that feel familiar, not foreign.",
    tags: ["creative direction", "visual identity", "motion", "web design"],
    image: "/images/produx/Payy.webp",
    gridClass: "col-span-12 lg:col-span-7",
  },
  {
    id: "gather",
    title: "Gather AI",
    description: "first telco run entirely on AI, powering hundreds of brands from one intelligent core",
    tags: ["creative direction", "visual identity", "website"],
    image: "/images/produx/GatherAI.webp",
    gridClass: "col-span-12 lg:col-span-4 lg:col-start-9 lg:mt-auto h-fit",
  },
  {
    id: "jurni",
    title: "Jurni AI",
    description: "Jurni is an AI funnel engine that turns a prompt into a live, high-converting landing experience in minutes.",
    tags: ["creative direction", "visual identity", "motion", "website"],
    image: "/images/produx/JurniAI.webp",
    gridClass: "col-span-12 lg:col-span-10 lg:col-start-2",
  },
  {
    id: "parker",
    title: "Parker AI",
    description: "Parker is an AI creative strategist that thinks, researches, and structures work like a senior partner. Clear briefs, sharp angles, and sourced notes inside Slack",
    tags: ["creative direction", "visual identity", "motion"],
    image: "/images/produx/parkerAI.webp",
    gridClass: "col-span-12 lg:col-span-4 h-fit",
  },
  {
    id: "nolana",
    title: "Nolana AI",
    description: "AI-native agentic OS for financial services operations",
    tags: ["creative direction", "visual identity", "motion", "website"],
    image: "/images/produx/NolanaAI.webp",
    gridClass: "col-span-12 lg:col-span-7 lg:col-start-6",
  },
];

export default function ProduxPortfolio() {
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  return (
    <section
      className="bg-[#0B0B0C] text-[#F2F2F2] pb-[11.67vh] select-none relative overflow-visible"
      id="cases"
    >
      {/* Header section (Aligned to default swiss-grid) */}
      <div className="swiss-grid pt-[16.6vh] max-lg:pt-[11.7vh] max-sm:pt-[6.86vh] pb-[6vh] flex items-end justify-between">
        <div className="col-span-6 overflow-hidden text-left">
          <motion.h2
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1] }}
            className="font-headline text-[clamp(2.5rem,4.5vw,4.8rem)] font-semibold leading-[1.05] text-[#F2F2F2] text-left"
          >
            Selected<br />projects
          </motion.h2>
        </div>

        <div className="col-span-6 flex justify-end">
          <Link href="/cases" className="group flex flex-col items-end">
            <div className="projects-sections-see-all-link font-sans text-[clamp(0.8rem,1vw,1.1rem)] font-bold uppercase tracking-wider text-[#F2F2F2] flex items-center gap-[0.4vw] mb-[0.5vh] transition-colors duration-200 hover:text-white">
              <span>view all works</span>
            </div>
            <div className="bg-[#F2F2F2] h-px w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-[13.67vh] pt-[5vh] max-lg:gap-[6.5vh]">
        
        {/* Row 1: Payy & Gather */}
        <div className="swiss-grid">
          {projects.slice(0, 2).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              hoveredProjectId={hoveredProjectId}
              setHoveredProjectId={setHoveredProjectId}
            />
          ))}
        </div>

        {/* Row 2: Jurni (Centred wide card) */}
        <div className="swiss-grid">
          {projects.slice(2, 3).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              hoveredProjectId={hoveredProjectId}
              setHoveredProjectId={setHoveredProjectId}
            />
          ))}
        </div>

        {/* Row 3: Parker & Nolana */}
        <div className="swiss-grid">
          {projects.slice(3, 5).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              hoveredProjectId={hoveredProjectId}
              setHoveredProjectId={setHoveredProjectId}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: Project;
  hoveredProjectId: string | null;
  setHoveredProjectId: (id: string | null) => void;
}

function ProjectCard({
  project,
  hoveredProjectId,
  setHoveredProjectId,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isInactive = hoveredProjectId !== null && hoveredProjectId !== project.id;

  return (
    <motion.div
      className={`group/main flex flex-col gap-[1.67vw] max-lg:gap-[3.074vw] max-sm:gap-[1.5vh] cursor-pointer ${project.gridClass}`}
      onMouseEnter={() => {
        setIsHovered(true);
        setHoveredProjectId(project.id);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredProjectId(null);
      }}
      initial="initial"
      animate={{
        opacity: isInactive ? 0.35 : 1,
        scale: isInactive ? 0.98 : 1,
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Project Image Wrapper */}
      <div className="relative w-full overflow-hidden select-none">
        <div className="relative w-full overflow-hidden h-[48.8vh]">
          
          {/* Main Image (Always sharp, zoom on hover) */}
          <motion.div
            initial={{ scale: 1.025 }}
            animate={{
              scale: isHovered ? 1.08 : 1.025,
            }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 w-full h-[110%] -top-[5%] will-change-transform"
          >
            <img
              src={project.image}
              alt={project.title}
              draggable={false}
              className="w-full h-full object-cover display-block"
            />
          </motion.div>

        </div>

        {/* Hover tags in the bottom right of the image */}
        <div className="pointer-events-none absolute right-0 bottom-0 m-[1.39vw] flex gap-[0.41vw] max-sm:hidden">
          {project.tags.map((tag, idx) => (
            <motion.div
              key={tag}
              initial={{ y: "1.95vh", opacity: 0, filter: "blur(4px)" }}
              animate={{
                y: isHovered ? 0 : "1.95vh",
                opacity: isHovered ? 1 : 0,
                filter: isHovered ? "blur(0px)" : "blur(4px)",
              }}
              transition={{
                duration: 0.4,
                ease: [0.25, 1, 0.5, 1],
                delay: isHovered ? idx * 0.05 : 0,
              }}
              className="font-sans text-[clamp(0.65rem,0.8vw,0.9rem)] font-bold border border-white/5 bg-black/45 px-3 py-1.5 uppercase backdrop-blur-md text-[#F2F2F2] rounded-none select-none"
            >
              {tag}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Title & Description section below image */}
      <div className="project-info-trigger relative flex w-full max-sm:flex-col max-sm:gap-[2.5vw] justify-between text-left">
        
        {/* Left Side: Pointer dot + Title + Description text */}
        <div className="flex items-start text-left w-full">
          {/* Custom square pointer before the text */}
          <motion.div
            animate={{
              width: isHovered ? 0 : 8,
              marginRight: isHovered ? 0 : "0.73vw",
              opacity: isHovered ? 0 : 1,
              borderWidth: isHovered ? 0 : 1,
            }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="project-pointer my-[1.1vh] h-2 border border-[#434343] max-sm:hidden shrink-0 mt-[1.3vh] overflow-hidden"
          />
          
          <div className="flex flex-col gap-[0.73vw] max-lg:gap-[1.02vw] max-sm:gap-[3.48vw] text-left w-full">
            {/* Title reveal */}
            <h3 className="font-headline text-[clamp(1.5rem,1.9vw,2.1rem)] font-semibold leading-tight text-[#F2F2F2] text-left no-invert">
              <motion.span
                initial={{ y: "30%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
                className="inline-block"
              >
                {project.title}
              </motion.span>
            </h3>

            {/* Subtitle description reveal */}
            <div className="text-[#8E8E93] font-sans text-[clamp(0.75rem,0.9vw,1rem)] leading-[1.3] max-w-[28vw] max-lg:max-w-[40vw] max-sm:max-w-none text-left">
              <motion.span
                initial={{ y: "20%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
                className="inline-block"
              >
                {project.description}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Right Side: Hover arrow & "Смотреть проект" text reveal */}
        <div className="relative self-start shrink-0 mt-[1vh] max-sm:hidden select-none">
          <div className="flex items-center py-[0.39vh] gap-1.5 justify-end">
            
            {/* White scale-in block with rotating arrow */}
            <motion.div
              initial={{ width: 0, scale: 0, opacity: 0 }}
              animate={{
                width: isHovered ? 24 : 0,
                scale: isHovered ? 1 : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="grid h-6 w-6 place-items-center overflow-hidden bg-[#F2F2F2] rounded-none shrink-0"
            >
              <motion.div
                initial={{ rotate: 180, x: -8 }}
                animate={{
                  rotate: isHovered ? -45 : 180,
                  x: isHovered ? 0 : -8,
                }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className="aspect-square h-[0.7rem] text-black flex items-center justify-center shrink-0"
              >
                <svg className="h-full w-full" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.48676 7.09893L2.47624 7.08841L5.75973 3.79718L2.47624 0.505641L2.48676 0.495117L4.13315 0.495117L7.42871 3.79687L4.13315 7.09831L2.48676 7.09893Z" fill="black"></path>
                  <path d="M0.000152588 3.24707L5.77783 3.24707L5.77783 4.34745L0.00015254 4.34745L0.000152588 3.24707Z" fill="black"></path>
                </svg>
              </motion.div>
            </motion.div>

            {/* Смотреть проект staggered text reveal */}
            <div className="flex">
              {"Смотреть проект".split("").map((char, idx) => (
                <span key={idx} className="inline-block overflow-hidden">
                  <motion.span
                    initial={{ x: "-110%", opacity: 0 }}
                    animate={{
                      x: isHovered ? 0 : "-110%",
                      opacity: isHovered ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.25, 1, 0.5, 1],
                      delay: isHovered ? idx * 0.02 : 0,
                    }}
                    className="text-[#F2F2F2] font-sans text-[clamp(0.7rem,0.8vw,0.9rem)] font-bold leading-none uppercase inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                </span>
              ))}
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}
