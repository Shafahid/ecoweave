"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Button from "@/components/ui/Button"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

interface Testimonial {
  image: string
  name: string
  username: string
  text: string
  social: string
}

interface TestimonialsProps {
  testimonials: Testimonial[]
  className?: string
  title?: string
  description?: string
  maxDisplayed?: number
}

export function Testimonials({
  testimonials,
  className,
  title = "Trusted by Industry Leaders",
  description = "See what textile manufacturers and compliance officers are saying about EcoWeave.",
  maxDisplayed = 6,
}: TestimonialsProps) {
  const [showAll, setShowAll] = useState(false)

  const openInNewTab = (url: string) => {
    window.open(url, "_blank")?.focus()
  }

  return (
    <div className={cn("py-20 px-6 relative overflow-hidden", className)}>
     
     
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center mb-16">
          <div className="inline-block mb-6">
            <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">Client Stories</span>
          </div>
          <h2 className="text-center text-5xl font-bold mb-5 bg-gradient-to-r from-[#06963b] via-[#0c5326] to-[#004737] bg-clip-text text-transparent tracking-tight" >
            {title}
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#004737]/40 to-transparent mx-auto mb-6"></div>
          <p className="text-center text-xl text-[#2d5f4f]/80 max-w-2xl font-light leading-relaxed">
            {description.split("<br />").map((line, i) => (
              <span key={i}>
                {line}
                {i !== description.split("<br />").length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        <div className="relative">
          <div
            className={cn(
              "flex justify-center gap-6 flex-wrap",
              !showAll &&
                testimonials.length > maxDisplayed &&
                "max-h-[900px] overflow-hidden",
            )}
          >
            {testimonials
              .slice(0, showAll ? undefined : maxDisplayed)
              .map((testimonial, index) => (
                <Card
                  key={index}
                  className="w-90 h-auto p-7 relative bg-[#f9f9f9]  transition-all duration-300 border border-[#004737]/40 rounded-lg cursor-pointer hover:shadow-lg"
                >
                  {/* Accent bar that reveals on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#004737] to-[#2d5f4f] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex items-center mb-5">
                    <div className="relative">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        className="rounded-full ring-2 ring-[#004737]/20 group-hover:ring-[#004737]/40 transition-all duration-300"
                      />
                    </div>
                    <div className="flex flex-col pl-4">
                      <span className="font-semibold text-lg text-[#004737]" >
                        {testimonial.name}
                      </span>
                      <span className="text-sm text-[#2d5f4f]/70 font-light">
                        {testimonial.username}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-700 font-light leading-relaxed">
                      "{testimonial.text}"
                    </p>
                  </div>
                  
                </Card>
              ))}
          </div>

          {testimonials.length > maxDisplayed && !showAll && (
            <>
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#ffffff] to-transparent pointer-events-none" />
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
                <Button variant="primary" className="rounded-full" size="lg" onClick={() => setShowAll(true)}>
                  Load More Stories
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
