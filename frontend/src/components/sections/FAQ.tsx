'use client';

import React from 'react';
import { faqs } from '@/lib/content';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};

const faqVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function FAQ() {
  return (
    <section id="faq" className="flex flex-col items-center justify-center px-4 py-16 scroll-mt-28 sm:px-6 sm:py-20">
      <motion.div
        className="inline-block mb-10"
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          FAQ
        </span>
      </motion.div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <motion.div
          className="mt-0 max-w-xl text-center lg:mt-3 lg:text-left"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight bg-gradient-to-r from-[#06963b] via-[#0c5326] to-[#004737] bg-clip-text text-transparent sm:text-4xl">
            Have Questions? We have you covered.
          </h2>
          <p className="text-base text-foreground/70 sm:text-lg">
            Everything you need to know about EcoWeave
          </p>
        </motion.div>

        <div className="w-full max-w-3xl space-y-3">
          {faqs.map((faq, index) => (
            <motion.details
              key={index}
              className="group border-b border-border overflow-hidden"
              variants={faqVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4 text-base font-semibold transition-colors hover:text-primary sm:px-6 sm:text-lg">
                {faq.question}
                <span className="shrink-0 text-primary transition-transform group-open:rotate-90">+</span>
              </summary>
              <motion.div
                className="px-4 pb-5 text-sm text-foreground/70 sm:px-6 sm:pb-6 sm:text-base"
                variants={faqVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {faq.answer}
              </motion.div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}
