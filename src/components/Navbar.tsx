import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <Link href="/" className="text-3xl font-black tracking-tighter uppercase leading-none">
          Flaconi<span className="text-pink-600">.</span>
        </Link>
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
          <Link href="#about" className="hover:text-black transition-colors">About Us</Link>
          <Link href="#teams" className="hover:text-black transition-colors">Our Teams</Link>
          <Link href="#locations" className="hover:text-black transition-colors">Locations</Link>
          <Link href="#life" className="hover:text-black transition-colors">Life at Flaconi</Link>
          <Link href="#hire" className="hover:text-black transition-colors">How We Hire</Link>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Link href="#jobs" className="bg-black text-white px-10 py-3 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-pink-600 transition-all shadow-xl shadow-black/5">
          Jobs
        </Link>
        <div className="flex gap-3 text-[10px] font-black border-l pl-6 border-gray-100">
          <span className="text-pink-600 cursor-pointer">EN</span>
          <span className="text-gray-300 hover:text-black cursor-pointer transition-colors">DE</span>
        </div>
      </div>
    </nav>
  );
}
