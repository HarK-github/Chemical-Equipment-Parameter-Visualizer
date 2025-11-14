import { title } from "@/components/primitives";

export default function DocsPage() {
  return (
    <section>
      
      <div
        className="absolute inset-0 z-0 w-[100vw] h-[50vh]"
        style={{
          background: "#020617",
          backgroundImage: `
        linear-gradient(to right, rgba(71,85,105,0.15) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(71,85,105,0.15) 1px, transparent 1px),
        radial-gradient(circle at 50% 60%, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.05) 40%, transparent 70%)
      `,
          backgroundSize: "40px 40px, 40px 40px, 100% 100%",
        }}
      > 
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white max-w-lg mx-auto  pt-[20vh]">
        <h1 className={title()}>ChemEquip Visualizer</h1>
        <p className="mt-4 text-lg">
          Analyze your data directly and seamlessly.
        </p>
      </div>
      </div>

    </section>
  );
}
