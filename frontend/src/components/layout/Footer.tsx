import React from 'react';
import { Footer2 } from '@/components/ui/Footer2';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerData = {
    logo: {
      src: "/logo/logo2.png",
      alt: "EcoWeave Logo",
      title: "EcoWeave",
      url: "/",
    },
    tagline: "AI-driven forensic risk platform making textile pollution financially irrational in Bangladesh.",
    menuItems: [
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
          { text: "Support", url: "#" },
        ],
      },
      {
        title: "Location",
        links: [
          { text: "Dhaka, Bangladesh", url: "#" },
          { text: "info@ecoweave.ai", url: "mailto:info@ecoweave.ai" },
        ],
      },
    ],
    copyright: `© ${currentYear} EcoWeave. All rights reserved.`,
    bottomLinks: [
      { text: "Terms of Service", url: "#" },
      { text: "Privacy Policy", url: "#" },
    ],
  };

  return <Footer2 {...footerData} />;
}
