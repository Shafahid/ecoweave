'use client';

import { Testimonials } from "@/components/ui/testimonials";
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const testimonials = [
  {
    text: 'EcoWeave helped us identify hidden pollution patterns that saved our factory from a $2M penalty. The AI-driven insights are remarkably accurate and actionable.',
    name: 'Rahman Ahmed',
    username: 'Compliance Director, Bengal Textiles',
    social: 'https://linkedin.com'
  },
  {
    text: 'Before EcoWeave, we were reactive. Now we predict and prevent pollution incidents before they happen. Our audit scores improved by 40% in six months.',
    name: 'Ayesha Khatun',
    username: 'Factory Manager, Dhaka Garments Ltd',
    social: 'https://linkedin.com'
  },
  {
    text: 'The forensic risk analysis is a game-changer. We now have data-backed evidence for our sustainability claims that buyers actually trust.',
    name: 'Kamal Hassan',
    username: 'CEO, Sustainable Fabrics International',
    social: 'https://linkedin.com'
  },
  {
    text: 'EcoWeave transformed our compliance process from a cost center to a competitive advantage. Buyers now prefer working with us because of our data transparency.',
    name: 'Sharmila Das',
    username: 'Operations Head, Green Threads',
    social: 'https://linkedin.com'
  },
  {
    text: 'The real-time alerts prevented what could have been a catastrophic wastewater incident. EcoWeave paid for itself in the first month.',
    name: 'Farhan Malik',
    username: 'Environmental Manager, Chittagong Mills',
    social: 'https://linkedin.com'
  },
  {
    text: 'As an auditor, I recommend EcoWeave to all our clients. The platform makes compliance verification faster and more reliable than any tool I\'ve used.',
    name: 'Nadia Islam',
    username: 'Lead Auditor, Bangladesh Standards Bureau',
    social: 'https://linkedin.com'
  },
  {
    text: 'The batch tracing feature is brilliant. When a buyer questioned our compliance, we provided forensic evidence within hours. They increased our order volume by 30%.',
    name: 'Imran Chowdhury',
    username: 'Quality Manager, Export Textiles BD',
    social: 'https://linkedin.com'
  },
  {
    text: 'EcoWeave gave us visibility into hidden risks across our supply chain. We caught issues at upstream suppliers before they became our liability.',
    name: 'Fatima Rahman',
    username: 'Supply Chain Director, Fashion Forward BD',
    social: 'https://linkedin.com'
  },
  {
    text: 'The platform is intuitive even for our less tech-savvy team members. Alert notifications are clear and the recommended actions are always practical.',
    name: 'Tariq Ali',
    username: 'Production Supervisor, Sylhet Dyeing',
    social: 'https://linkedin.com'
  },
  {
    text: 'We reduced our chemical waste by 25% in the first quarter using EcoWeave\'s optimization insights. Compliance met profitability.',
    name: 'Meera Begum',
    username: 'Sustainability Lead, Eco Mills Group',
    social: 'https://linkedin.com'
  },
  {
    text: 'International buyers now view us as a low-risk partner. EcoWeave\'s reporting gave us credibility that competitors struggle to match.',
    name: 'Samir Hossain',
    username: 'Export Director, Global Garments',
    social: 'https://linkedin.com'
  },
  {
    text: 'The ROI was immediate. We avoided a major fine and secured premium pricing from European buyers who value our transparent compliance data.',
    name: 'Laila Khan',
    username: 'Managing Director, Premium Fabrics Ltd',
    social: 'https://linkedin.com'
  }
].map((testimonial, index) => ({
  ...testimonial,
  // Deterministic avatar IDs keep images stable and avoid hydration mismatch.
  image: `https://i.pravatar.cc/160?img=${((index * 17 + 11) % 70) + 1}`,
}));

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};

export default function TestimonialsSection() {
  return (
    <motion.section
      id="testimonials"
      className="scroll-mt-28"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={headerVariants}
    >
      <Testimonials 
        testimonials={testimonials}
        title="Trusted by Industry Leaders"
        description="See what textile manufacturers and compliance officers are saying about EcoWeave."
        maxDisplayed={6}
      />
    </motion.section>
  )
}

