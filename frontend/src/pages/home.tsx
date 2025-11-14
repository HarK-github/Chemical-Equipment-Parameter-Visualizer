import Loginform from "@/components/login";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";



export default function DocsPage() {
  return ( 
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>ChemEquip Visualizer</h1>
          <p>Analyse your data directly and seemlessly</p>
          
        </div>
      </section>
  );
}
