export const Hero = () => (
  <section className="pt-24 md:pt-40 pb-16 md:pb-24 px-6 md:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
    <div className="flex-1 space-y-8 md:space-y-10">
      <div className="space-y-4">
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-pink-600 bg-pink-50 px-4 py-2 rounded-full inline-block">Beauty-Tech & E-commerce</span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.9] text-black">
          flaconi <br/> <span className="text-gray-200">Careers</span>
        </h1>
      </div>
      <p className="text-2xl md:text-3xl font-bold leading-tight max-w-xl text-black">
        We don’t just sell beauty products — we engineer beautiful shopping experiences.
      </p>
      <div className="space-y-6 text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl font-medium">
        <p>Since 2011, flaconi has blended dynamic tech innovation with the world of premium beauty. Based in Berlin, we are a leading player in the industry, driven by around 700 colleagues from over 60 nations.</p>
        <p className="font-bold text-black italic text-xl md:text-2xl uppercase tracking-tighter">#WeCommerce</p>
      </div>
      <button className="w-full md:w-auto bg-black text-white px-12 py-5 text-sm font-black uppercase tracking-[0.2em] hover:bg-pink-600 transition-all transform hover:-translate-y-2 shadow-2xl shadow-black/10">
        Join our success story
      </button>
    </div>
    <div className="flex-1 w-full bg-gray-100 aspect-[4/5] rounded-[30px] md:rounded-[40px] flex items-center justify-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/20 to-transparent group-hover:opacity-40 transition-opacity"></div>
      <div className="text-center space-y-4 scale-75 md:scale-90 group-hover:scale-100 transition-transform duration-700">
        <span className="text-gray-300 font-black text-6xl md:text-8xl uppercase tracking-tighter block opacity-30">BEAUTY</span>
        <span className="text-gray-300 font-black text-6xl md:text-8xl uppercase tracking-tighter block opacity-30">TECH</span>
      </div>
    </div>
  </section>
);

export const Teams = () => (
  <section id="teams" className="py-24 md:py-32 bg-zinc-950 text-white px-6 md:px-8">
    <div className="max-w-7xl mx-auto space-y-16 md:space-y-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/10 pb-12 md:pb-16">
        <div className="max-w-2xl space-y-6">
          <h2 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tighter">Meet the People <br className="hidden md:block"/>Behind Beauty Tech.</h2>
          <p className="text-lg md:text-xl text-zinc-400 font-medium"> United by our vision and shared goals, we leverage our unique perspectives daily to revolutionize the beauty tech industry.</p>
        </div>
        <button className="w-full md:w-auto border border-pink-600 text-pink-600 px-10 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-pink-600 hover:text-white transition-all">
          Explore Teams
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {[
          { title: 'Engineering & Tech', desc: 'The backbone of our platform.' },
          { title: 'Marketing & Comms', desc: 'Crafting the beauty story.' },
          { title: 'Data & Analytics', desc: 'Insight-driven commerce.' },
          { title: 'Creative & Design', desc: 'Visual excellence defined.' },
          { title: 'Logistics (Polarstern)', desc: '28,000m² of innovation.' },
          { title: 'Retail (Concept Store)', desc: 'Where beauty meets the street.' }
        ].map((team, i) => (
          <div key={i} className="aspect-square bg-zinc-900/50 hover:bg-pink-600 transition-all duration-500 p-8 md:p-12 flex flex-col justify-between group cursor-pointer border border-white/5">
            <span className="text-zinc-700 font-black text-3xl md:text-4xl group-hover:text-white/20">0{i+1}</span>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-black uppercase leading-tight group-hover:translate-x-2 transition-transform">{team.title}</h3>
              <p className="text-zinc-500 text-xs md:text-sm group-hover:text-white/80 transition-colors font-medium">{team.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const Locations = () => (
  <section id="locations" className="py-24 md:py-32 px-6 md:px-8 max-w-7xl mx-auto">
    <div className="text-center space-y-6 mb-16 md:mb-24">
      <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Locations</h2>
      <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto italic font-serif leading-relaxed">Three unique spaces, one unified vision of beauty and technology.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
      {[
        { name: 'Headquarters', sub: '"The Benjamin"', location: 'Berlin-Charlottenburg', desc: 'Our modern, seven-story HQ designed for success, collaboration, and creativity.' },
        { name: 'Logistics Center', sub: '"Polarstern"', location: 'Halle (Saale)', desc: 'Our 28,000 m² high-tech facility where logistics and innovation come to life.' },
        { name: 'Concept Store', sub: 'The Experience Hub', location: 'Berlin-Mitte', desc: 'Our flagship retail space and hair salon offering a holistic beauty journey.' }
      ].map((loc, i) => (
        <div key={i} className="group space-y-8 md:space-y-10">
          <div className="h-[300px] md:h-[450px] bg-gray-50 rounded-[30px] md:rounded-[40px] overflow-hidden group-hover:rounded-[20px] transition-all duration-700 relative">
            <div className="absolute inset-0 bg-black/5 group-hover:bg-pink-600/10 transition-colors"></div>
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-black/50 backdrop-blur-md px-4 py-2 rounded-full">Discover Facility</span>
            </div>
          </div>
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-4">
               <h3 className="text-2xl md:text-3xl font-black uppercase">{loc.name}</h3>
               <div className="h-px flex-1 bg-gray-100"></div>
            </div>
            <p className="text-pink-600 font-black text-[10px] md:text-xs tracking-[0.3em] uppercase">{loc.sub}</p>
            <p className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest">{loc.location}</p>
            <p className="text-gray-500 leading-relaxed font-medium text-base md:text-lg pt-2 md:pt-4">{loc.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const Footer = () => (
  <footer className="bg-white border-t border-gray-100 pt-24 md:pt-32 pb-12 px-6 md:px-8">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16 md:gap-24 pb-16 md:pb-24 border-b border-gray-100">
      <div className="space-y-8 md:space-y-10 max-w-md">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Flaconi<span className="text-pink-600">.</span></h2>
        <p className="text-lg md:text-xl text-gray-500 font-medium">Defining the future of beauty tech since 2011. Join our 700+ strong community of commerce pioneers.</p>
        <div className="flex gap-4">
          {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-50 border border-gray-100 hover:bg-pink-600 hover:border-pink-600 transition-all cursor-pointer"></div>)}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16 lg:gap-32 w-full lg:w-auto">
        {[
          { title: 'Company', links: ['About Us', 'Teams', 'Locations', 'Culture'] },
          { title: 'Legal', links: ['Privacy Policy', 'Impressum', 'AGB', 'Contact'] },
          { title: 'Career', links: ['How We Hire', 'Job Listings', 'LinkedIn', 'Instagram'] }
        ].map((col, i) => (
          <div key={i} className="space-y-6 md:space-y-8">
            <h4 className="font-black uppercase text-[9px] md:text-[10px] tracking-[0.4em] text-gray-300">{col.title}</h4>
            <ul className="space-y-3 md:space-y-4">
              {col.links.map((link, j) => (
                <li key={j} className="text-xs md:text-sm font-bold text-gray-500 hover:text-pink-600 cursor-pointer transition-colors uppercase tracking-widest leading-none">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
      <div className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">
        © 2026 Flaconi GmbH. All rights reserved. 
      </div>
      <div className="flex gap-6 md:gap-8 text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
        <span>Data Privacy</span>
        <span>Cookie Settings</span>
      </div>
    </div>
  </footer>
);
