import Navbar from '@/components/Navbar';
import { Hero, Teams, Locations, Footer } from '@/components/Sections';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 selection:bg-pink-100 selection:text-pink-600 overflow-x-hidden">
      <Navbar />
      <Hero />
      
      {/* Quote Section */}
      <section className="py-24 md:py-32 bg-zinc-50 px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none text-black">
            “Love of beauty is taste. <br className="hidden md:block"/>The creation of beauty is art”
            <span className="block mt-6 md:mt-8 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-pink-600">— Ralph Waldo Emerson</span>
          </blockquote>
        </div>
      </section>

      <Teams />
      <Locations />
      <Footer />
    </main>
  );
}
