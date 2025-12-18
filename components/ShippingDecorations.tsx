import React from 'react';
import { Truck, Package, ClipboardList, Container } from 'lucide-react';

const ShippingDecorations: React.FC = () => {
  // Generate bulbs for the lights
  const bulbs = Array.from({ length: 40 });
  const colors = ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#a855f7']; // Red, Green, Gold, Blue, Purple

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* Top Left - Rope / Knot */}
      <div className="absolute top-4 left-4 opacity-80">
          <svg width="60" height="60" viewBox="0 0 100 100">
             <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="#8B4513" strokeWidth="8" strokeLinecap="round" />
             <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="#DEB887" strokeWidth="2" strokeLinecap="round" />
             <circle cx="20" cy="50" r="5" fill="#CD5C5C" />
             <circle cx="80" cy="50" r="5" fill="#CD5C5C" />
          </svg>
      </div>

      {/* Top Right - Rope / Knot */}
      <div className="absolute top-4 right-4 opacity-80 transform scale-x-[-1]">
          <svg width="60" height="60" viewBox="0 0 100 100">
             <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="#8B4513" strokeWidth="8" strokeLinecap="round" />
             <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="#DEB887" strokeWidth="2" strokeLinecap="round" />
             <circle cx="20" cy="50" r="5" fill="#CD5C5C" />
             <circle cx="80" cy="50" r="5" fill="#CD5C5C" />
          </svg>
      </div>

      {/* Bottom Left - Rope / Knot */}
      <div className="absolute bottom-4 left-4 opacity-80 transform scale-y-[-1]">
          <svg width="60" height="60" viewBox="0 0 100 100">
             <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="#8B4513" strokeWidth="8" strokeLinecap="round" />
             <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="#DEB887" strokeWidth="2" strokeLinecap="round" />
             <circle cx="20" cy="50" r="5" fill="#CD5C5C" />
             <circle cx="80" cy="50" r="5" fill="#CD5C5C" />
          </svg>
      </div>

      {/* Bottom Right - Rope / Knot */}
      <div className="absolute bottom-4 right-4 opacity-80 transform rotate-180">
          <svg width="60" height="60" viewBox="0 0 100 100">
             <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="#8B4513" strokeWidth="8" strokeLinecap="round" />
             <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="#DEB887" strokeWidth="2" strokeLinecap="round" />
             <circle cx="20" cy="50" r="5" fill="#CD5C5C" />
             <circle cx="80" cy="50" r="5" fill="#CD5C5C" />
          </svg>
      </div>

      {/* Floating Background Icons - Faded */}
      {/* Moved Truck higher for mobile (top-10% vs top-20%) */}
      <div className="absolute top-[10%] left-[5%] md:top-[20%] md:left-[10%] opacity-20 transform -rotate-12">
          <Truck size={80} className="text-[#8B4513]" />
      </div>
      <div className="absolute bottom-[20%] right-[10%] opacity-20 transform rotate-12">
          <Container size={80} className="text-[#8B4513]" />
      </div>
      <div className="absolute top-[40%] right-[5%] opacity-10 transform -rotate-45">
          <Package size={60} className="text-[#228B22]" />
      </div>
      <div className="absolute bottom-[30%] left-[5%] opacity-10 transform rotate-45">
          <ClipboardList size={60} className="text-[#8B0000]" />
      </div>

      {/* Christmas Lights */}
      <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden flex items-start justify-between px-2 z-10">
         {/* The Wire */}
         <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#1a202c] shadow-sm translate-y-2"></div>
         
         {bulbs.map((_, i) => {
             const color = colors[i % colors.length];
             return (
                 <div 
                    key={i} 
                    className="relative flex flex-col items-center group"
                    style={{ flex: 1 }}
                 >
                     {/* Socket */}
                     <div className="w-2 h-3 bg-gray-800 rounded-sm z-10 translate-y-1"></div>
                     {/* Bulb */}
                     <div 
                        className="w-4 h-6 rounded-full mt-[-2px] animate-pulse"
                        style={{
                            backgroundColor: color,
                            boxShadow: `0 0 15px ${color}`,
                            animationDuration: `${1.5 + Math.random()}s`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                     />
                 </div>
             );
         })}
      </div>

    </div>
  );
};

export default ShippingDecorations;