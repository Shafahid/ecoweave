import Image from "next/image";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface Footer2Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer2 = ({
  logo = {
    src: "/logo/logo4.png",
    alt: "EcoWeave Logo",
    title: "EcoWeave",
    url: "/",
  },
  tagline = "AI-driven forensic risk platform making textile pollution financially irrational.",
  menuItems = [
    {
      title: "Product",
      links: [
        { text: "Features", url: "/" },
        { text: "How It Works", url: "/#how-it-works" },
        { text: "Pricing", url: "/pricing" },
        { text: "Sample Report", url: "#" },
        { text: "Services", url: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About Us", url: "#" },
        { text: "Resources", url: "#" },
        { text: "Blog", url: "#" },
        { text: "Careers", url: "#" },
        { text: "Contact", url: "mailto:info@ecoweave.ai" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Help Center", url: "#" },
        { text: "Documentation", url: "#" },
        { text: "Case Studies", url: "#" },
        { text: "API", url: "#" },
      ],
    },
    {
      title: "Social",
      links: [
        { text: "Twitter", url: "#" },
        { text: "LinkedIn", url: "#" },
        { text: "GitHub", url: "#" },
      ],
    },
  ],
  copyright = "© 2026 EcoWeave. All rights reserved.",
  bottomLinks = [
    { text: "Terms and Conditions", url: "#" },
    { text: "Privacy Policy", url: "#" },
  ],
}: Footer2Props) => {
  return (
    <section className="py-20 relative overflow-hidden text-[#004737]">
    
      
      <div className="container mx-auto px-6 relative z-10">
        <footer>
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-6 lg:gap-8 max-w-7xl mx-auto">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-3 lg:justify-start mb-4">
                <a href={logo.url} className="flex items-center gap-3 group">
                  <Image
                    src= "/logo/logo3.png"
                    alt={logo.alt}
                    title={logo.title}
                    width={40}
                    height={40}
                    className="transition-all duration-300"
                  />
                  <p className="text-2xl font-bold text-gray-800" >
                    {logo.title}
                  </p>
                </a>
              </div>
              <p className="font-light leading-5 max-w-sm text-gray-600">
                {tagline}
              </p>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-5 font-bold  text-sm uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-light  hover:text-white transition-colors duration-200"
                    >
                      <a href={link.url} className="hover:translate-x-0.5 inline-block transition-transform text-gray-700">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-col justify-between gap-4 border-t border-black/10 pt-8 text-sm font-light  md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-6">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="hover:text-white transition-colors duration-200">
                  <a href={link.url}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer2 };
