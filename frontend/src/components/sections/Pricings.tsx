'use client';

import React from 'react';
import { pricingTiers } from '@/lib/content';
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
    },
  },
};

export default function Pricings() {
  return (
    <section id="pricing" className="py-20 px-6 scroll-mt-28">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <div className="inline-block mb-6">
            <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
              Flexible pricing plans
            </span>
          </div>
          <motion.h2
            variants={headerVariants}
            className="text-5xl font-bold bg-gradient-to-r from-[#06963b] via-[#0c5326] to-[#004737] bg-clip-text text-transparent mb-4"
          >
            The perfect plan for any textile facility
          </motion.h2>
          <motion.p
            variants={headerVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Our plans are designed to streamline your compliance workflow. Choose from scalable pricing solutions that grow with your manufacturing needs.
          </motion.p>
        </motion.div>
        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={index}
              className={`rounded-2xl p-8 relative transition-all flex flex-col ${
                tier.highlighted 
                  ? 'bg-linear-to-br from-emerald-800 to-emerald-900 text-white shadow-xl transform' 
                  : 'bg-[#F7F7F7] hover:shadow-lg shadow-sm/5'
              }`}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Icon */}
              <div className="mb-6">
                {index === 0 && (
                  <svg className={`w-12 h-12 ${tier.highlighted ? 'text-green-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {index === 1 && (
                  <svg className={`w-12 h-12 ${tier.highlighted ? 'text-green-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {index === 2 && (
                  <svg className={`w-12 h-12 ${tier.highlighted ? 'text-green-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
              </div>

              {/* Tier Name */}
              <h3 className={`text-3xl font-regular mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {tier.name}{tier.highlighted && <span className="text-green-200 text-xl -mt-2"> (Recommended)</span>}
              </h3>
              
              {/* Description */}
              <p className={`text-sm min-h-[4.5rem] border-b pb-6 mb-6 ${tier.highlighted ? 'text-green-100' : 'text-gray-600'}`}>
                {tier.description}
              </p>
              
              {/* Price */}
              <div className="mb-8">
                <span className={`text-4xl font-bold ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {tier.price}
                </span>
                {tier.price !== 'Contact Us' && tier.price !== 'Custom' && (
                  <span className={`text-sm ml-2 ${tier.highlighted ? 'text-green-200' : 'text-gray-500'}`}>
                    per month
                  </span>
                )}
              </div>
              
              {/* Features List */}
              <ul className="space-y-4 mb-8 grow">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg 
                      className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? 'text-green-300' : 'text-green-600'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${tier.highlighted ? 'text-green-50' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <button
                className={`w-full py-3.5 rounded-full font-medium transition-all ${
                  tier.highlighted
                    ? 'bg-white text-emerald-800 hover:bg-green-50 shadow-lg'
                    : 'bg-linear-to-r from-green-800 to-emerald-700 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>

      
      </div>
    </section>
  );
}
