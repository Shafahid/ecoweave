'use client';

import Image from 'next/image';
import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
    },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
    },
  },
};

const featureVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
    },
  },
};

function Feature2() {
  return (
    <section id="features" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl space-y-16 md:space-y-24">
        <motion.div
          className="mb-12 text-center md:mb-20"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div
            variants={badgeVariants}
            className="inline-block mb-6"
          >
            <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200 mb-6">
              Platform Features
            </span>
          </motion.div>
            <motion.h2
            variants={headerVariants}
            className="mb-5 text-3xl font-bold tracking-tight bg-gradient-to-r from-[#06963b] via-[#0c5326] to-[#004737] bg-clip-text text-transparent sm:text-4xl md:text-5xl"
            >
            Turn Data Into Compliance Intelligence
            </motion.h2>
          <div className="mx-auto mb-6 h-0.5 w-24 bg-linear-to-r from-transparent via-[#004737]/40 to-transparent" />
          <motion.p
            variants={headerVariants}
            className="mx-auto max-w-2xl text-base leading-relaxed font-light text-[#2d5f4f]/80 sm:text-lg md:text-xl"
          >
            AI-powered risk scoring and forensic validation to prevent pollution and protect profits.
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:gap-12 lg:grid-cols-2"
          variants={featureVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="w-full" variants={imageVariants}>
            <Image
              src="/feature1.png"
              alt="Predict High-Risk Batches"
              width={560}
              height={640}
              className="mx-auto h-auto w-full max-w-xl rounded-2xl transition-shadow duration-300 hover:shadow-lg"
            />
          </motion.div>

          <div className="max-w-xl">
            <motion.h3
              variants={featureVariants}
              className="mb-5 text-2xl font-bold leading-tight tracking-tighter text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl"
            >
              Predict <span className="text-[#004737]">High-Risk Batches</span> Before They Discharge
            </motion.h3>
            <motion.p
              variants={featureVariants}
              className="text-base leading-relaxed text-gray-600 sm:text-lg"
            >
              Our AI analyzes historical data to identify patterns and predict which batches are likely to discharge high levels of pollutants, allowing you to take proactive measures.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:gap-12 lg:grid-cols-2"
          variants={featureVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="order-1 w-full lg:order-2" variants={imageVariants}>
            <Image
              src="/feature3.png"
              alt="Money-First Alerts"
              width={560}
              height={640}
              className="mx-auto h-auto w-full max-w-xl rounded-2xl transition-shadow duration-300 hover:shadow-lg"
            />
          </motion.div>

          <div className="order-2 max-w-xl lg:order-1">
            <motion.h3
              variants={featureVariants}
              className="mb-5 text-2xl font-bold leading-tight tracking-tighter text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl"
            >
              Send <span className="text-[#004737]">Money-First Alerts</span> Only When It Matters
            </motion.h3>
            <motion.p
              variants={featureVariants}
              className="mb-4 text-base leading-relaxed text-gray-600 sm:text-lg"
            >
              Instead of generic reminders, EcoWeave sends shift-specific alerts that show the financial logic clearly: estimated loss if ETP is bypassed vs cost to run ETP, so teams act fast to protect production and exports.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:gap-12 lg:grid-cols-2"
          variants={featureVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="w-full" variants={imageVariants}>
            <Image
              src="/feature2.png"
              alt="Forensic Verification"
              width={560}
              height={640}
              className="mx-auto h-auto w-full max-w-xl rounded-2xl transition-shadow duration-300 hover:shadow-lg"
            />
          </motion.div>

          <div className="max-w-xl">
            <motion.h3
              variants={featureVariants}
              className="mb-5 text-2xl font-bold leading-tight tracking-tighter text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl"
            >
              Turn Data Into <span className="text-[#004737]">Audit-Ready Evidence</span> Automatically
            </motion.h3>
            <motion.p
              variants={featureVariants}
              className="mb-6 text-base leading-relaxed text-gray-600 sm:text-lg"
            >
              EcoWeave cross-checks production - chemical invoices - electricity to flag inconsistencies, then generates buyer/regulator-friendly compliance reports with evidence trails and anomaly summaries.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-2.5 sm:gap-3"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {['Triangulation checks', 'Evidence trail', 'Monthly compliance pack'].map(
                (item, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="cursor-default rounded-lg border border-[#004737]/20 bg-[#004737]/5 px-3 py-1.5 text-xs font-medium text-[#004737] transition-all duration-300 hover:border-[#004737]/40 hover:bg-[#004737]/10 sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {item}
                  </motion.span>
                )
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Feature2;
