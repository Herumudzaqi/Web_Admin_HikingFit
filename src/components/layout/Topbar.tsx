import React from 'react';

const Topbar: React.FC = () => {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 backdrop-blur-md bg-surface/80 shadow-sm flex items-center justify-between px-lg z-40">
      <div className="flex items-center gap-4">
        {/* Search on left */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-64 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant" 
          />
        </div>
        <h1 className="font-headline-md text-headline-md font-bold text-primary md:hidden">HikingFit</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-primary hover:bg-surface-container-high transition-all rounded-full active:opacity-80">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-primary hover:bg-surface-container-high transition-all rounded-full active:opacity-80">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuChVJc6kclVAd7W12v48hBJoZTlQd45fl0P3XXiuFBbHTWtHr3OYOFoaxsX1SYY5dQPW5Sna1ufhGg5IgyZqu4rn8hArubmYqkRS8ucgd9fmscWxech4hE_sKmMsrcx39IN99UX3ZcFqt_EzCYTPq2aAIflDwCyykouM1BoBN6ahZb4mdWF1m5o79qk8kn02o7Eopr2qUA5RS8T6iXVROo0Pf11JJFhgNFtl0NlhXOgT90oYvSlyox4sLAwRMV9hUSem1dYMFfiZKw" 
            alt="Admin Profile" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
