import { title } from "@/components/primitives";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

export default function DocsPage() {
  return (
    <section>
      {/* Hero Section with Background */}
      <div
        className="absolute inset-0 z-0 w-[100vw] h-[80vh] sm:h-[60h]"
        style={{
          background: "#020617",
          backgroundImage: `
        linear-gradient(to right, rgba(71,85,105,0.15) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(71,85,105,0.15) 1px, transparent 1px),
        radial-gradient(circle at 50% 60%, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.05) 40%, transparent 70%)
      `,
          backgroundSize: "40px 40px, 40px 40px, 100% 100%",
        }}
      />
      
        
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white max-w-lg mx-auto pt-[15vh] animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className={title({ color: "violet", size: "lg" })}>
            ChemEquip Visualizer
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Analyze your chemical equipment data directly and seamlessly with our advanced visualization tools.
          </p>
           
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              color="primary" 
              size="lg"
              className="px-8 py-6 text-lg font-semibold transform hover:scale-105 transition-transform duration-300"
              as={Link}
              href="/login"
            >
              Login
            </Button>
            <Button 
              variant="bordered" 
              size="lg"
              className="px-8 py-6 text-lg font-semibold border-white text-white hover:bg-white/10 transition-all duration-300"
              as={Link}
              href="/register"
            >
              Register
            </Button>
          </div>
        </div>
      </div>
 
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to visualize and analyze chemical equipment data efficiently
            </p>
          </div>
        </div>
      </div>


      {/* Stats Section */}
      <div className="relative z-10 py-16 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                Analyse csv files
              </div>
              <div className="text-gray-400 mt-2">Features</div>
            </div>
            <div className="text-white transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CSV Files
              </div>
              <div className="text-gray-400 mt-2">Support</div>
            </div>
            <div className="text-white transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Professional
              </div>
              <div className="text-gray-400 mt-2">Users</div>
            </div>
            <div className="text-white transform hover:scale-110 transition-transform duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-gray-400 mt-2">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 py-16 px-4 animate-slide-up">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Visualize Your Chemical Equipment Data?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start using ChemEquip Visualizer to analyze and optimize chemical equipment performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              color="primary" 
              size="lg"
              className="px-8 py-6 text-lg font-semibold transform hover:scale-105 transition-transform duration-300"
            >
              Login
            </Button>
            <Button 
              variant="bordered" 
              size="lg"
              className="px-8 py-6 text-lg font-semibold border-gray-600 text-white hover:bg-white/10 transition-all duration-300"
            >
              Register
            </Button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </section>
  );
}