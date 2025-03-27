
import React from 'react';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card mt-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary font-bold text-2xl">Learniverse</span>
            </div>
            
            <p className="text-muted-foreground max-w-md mb-6">
              The premier Web3 learn-to-earn platform, revolutionizing education through 
              blockchain technology and innovative reward mechanisms.
            </p>
            
            <div className="flex space-x-4">
              {["#", "#", "#", "#"].map((link, i) => (
                <a 
                  key={i} 
                  href={link} 
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                  aria-label={`Social media link ${i + 1}`}
                >
                  <div className="w-5 h-5 bg-foreground/40 rounded-sm" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-3">
              {["Features", "How it Works", "Pricing", "Roadmap"].map((item, i) => (
                <li key={i}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              {["About", "Blog", "Careers", "Contact", "Press"].map((item, i) => (
                <li key={i}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Learniverse. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            {["Terms", "Privacy", "Cookies"].map((item, i) => (
              <a 
                key={i} 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
