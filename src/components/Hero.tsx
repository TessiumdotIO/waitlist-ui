"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { motion } from "framer-motion"

const Hero = () => {
  const [userCount, setUserCount] = useState<number>(1200)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  // Initialize Supabase client
  const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!)

  // Scroll functions
  const scrollToFeatures = () => {
    const featuresElement = document.getElementById("features")
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToWaitlist = () => {
    const waitlistElement = document.getElementById("waitlist")
    if (waitlistElement) {
      waitlistElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Fetch user count from the database
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const { data, count, error } = await supabase.from("waitlist").select("*", { count: "exact" })

        if (error) {
          console.error("Error fetching user count:", error)
        } else if (count !== null) {
          setUserCount(count)
        }
      } catch (error) {
        console.error("Error fetching user count:", error)
      }
    }

    fetchUserCount()
  }, [])

  // Custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }

      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`
        cursorRef.current.style.top = `${e.clientY}px`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden"
    >
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 rounded-full border-2 border-primary pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block"
      />

      {/* Particle background */}
      <div className="absolute inset-0 -z-10">
        <ShootingStarsBackground />
      </div>

      {/* Background elements */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* Mobile background images */}
      <div className="absolute inset-0 -z-10 md:hidden opacity-20">
        <div className="absolute inset-0 flex items-center justify-center">
          <FloatingImages isMobile={true} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              Reimagining Web3 Education & Mass Adoption
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Onboard, Evolve & <span className="text-accent">Earn </span>
              in the Web3 Ecosystem
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Tessium is poised to become the premier infrastructure where knowledge acquisition translates to valuable
              growth and rewards.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-4 font-medium h-auto" onClick={scrollToWaitlist}>
                Join Waitlist
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted border border-background" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{userCount}+</span> users already on the waitlist
              </p>
            </div>
          </motion.div>
        </div>

        <div className="order-1 md:order-2 relative hidden md:block">
          <FloatingImages isMobile={false} />
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  )
}

// Floating Web3 images component
const FloatingImages = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <div className={`relative ${isMobile ? "h-full w-full" : "h-[500px] w-full"}`}>
      {/* <motion.div
        className="absolute"
        style={{
          top: "10%",
          left: "20%",
          zIndex: 3,
        }}
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        <HoverableImage src="/8.png" alt="Blockchain" width={180} height={180} />
      </motion.div> */}

      <motion.div
        className="absolute"
        style={{
          top: "30%",
          right: "15%",
          zIndex: 2,
        }}
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 0.5,
        }}
      >
        <HoverableImage src="/32.png" alt="Crypto Wallet" width={400} height={400} />
      </motion.div>

      {/* <motion.div
        className="absolute"
        style={{
          bottom: "15%",
          left: "30%",
          zIndex: 1,
        }}
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 1,
        }}
      >
        <HoverableImage src="/8.png" alt="NFT" width={300} height={300} />
      </motion.div> */}
{/* 
      <motion.div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          zIndex: 4,
        }}
        animate={{
          y: [0, -10, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 0.2,
        }}
      >
        <HoverableImage src="/12.png" alt="DeFi" width={180} height={180} />
      </motion.div> */}
    </div>
  )
}

// Hoverable image component with transparent background
const HoverableImage = ({
  src,
  alt,
  width,
  height,
}: {
  src: string
  alt: string
  width: number
  height: number
}) => {
  return (
    <motion.div
      className="relative"
      whileHover={{
        scale: 1.1,
        filter: "drop-shadow(0 0 15px rgba(120, 120, 255, 0.6))",
      }}
      transition={{ duration: 0.3 }}
    >
      <img src={src || "/placeholder.svg"} alt={alt} width={width} height={height} className="object-contain" />
    </motion.div>
  )
}

// Shooting stars background component
const ShootingStarsBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Star properties
    interface Star {
      x: number
      y: number
      radius: number
      color: string
      velocity: number
    }

    // Shooting star properties
    interface ShootingStar {
      x: number
      y: number
      length: number
      speed: number
      size: number
      color: string
      trail: Array<{ x: number; y: number }>
      opacity: number
      active: boolean
    }

    // Create stars
    const stars: Star[] = []
    const shootingStars: ShootingStar[] = []
    const maxShootingStars = 15

    // Initialize background stars
    for (let i = 0; i < 150; i++) {
      const radius = Math.random() * 1.2 // Slightly smaller
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        color: `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.3})`, // Reduced brightness
        velocity: Math.random() * 0.05,
      })
    }

    // Create a shooting star
    const createShootingStar = (): ShootingStar => {
      // Start from left side with random angle
      const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8
      return {
        x: Math.random() * canvas.width * 0.3,
        y: Math.random() * canvas.height * 0.5,
        length: Math.floor(Math.random() * 80) + 50,
        speed: Math.random() * 2 + 3, // Reduced from (8 + 10) to (3 + 4)
        size: Math.random() * 1.5 + 0.5, // Slightly reduced size
        color: `rgba(255, 255, 255, 0.8)`, // Reduced opacity from 1 to 0.8
        trail: [],
        opacity: 0.5, // Reduced from 1 to 0.7
        active: true,
      }
    }

    // Initialize shooting stars with staggered start times
    for (let i = 0; i < maxShootingStars; i++) {
      const star = createShootingStar()
      star.active = false
      setTimeout(() => {
        star.active = true
      }, Math.random() * 15000) // Stagger start times
      shootingStars.push(star)
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background stars
      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.fill()

        // Twinkle effect
        star.radius = Math.max(0.1, star.radius + Math.sin(Date.now() * star.velocity) * 0.1)
      })

      // Update and draw shooting stars
      shootingStars.forEach((star) => {
        if (!star.active) return

        // Move the star
        star.x += star.speed
        star.y += star.speed * 0.3

        // Store position for trail
        star.trail.unshift({ x: star.x, y: star.y })

        // Limit trail length
        if (star.trail.length > star.length) {
          star.trail.pop()
        }

        // Draw trail
        if (star.trail.length > 1) {
          ctx.beginPath()
          ctx.moveTo(star.trail[0].x, star.trail[0].y)

          // Create gradient for trail
          const gradient = ctx.createLinearGradient(
            star.trail[0].x,
            star.trail[0].y,
            star.trail[star.trail.length - 1].x,
            star.trail[star.trail.length - 1].y,
          )
          gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.8})`) // Reduced brightness
          gradient.addColorStop(0.3, `rgba(155, 176, 255, ${star.opacity * 0.6})`) // Reduced brightness
          gradient.addColorStop(1, `rgba(121, 176, 255, 0)`)

          ctx.strokeStyle = gradient
          ctx.lineWidth = star.size

          // Draw smooth curve through trail points
          for (let i = 1; i < star.trail.length; i++) {
            ctx.lineTo(star.trail[i].x, star.trail[i].y)
          }

          ctx.stroke()

          // Draw star head
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.9})` // Reduced brightness
          ctx.fill()
        }

        // Reset if off screen
        if (star.x > canvas.width || star.y > canvas.height) {
          const newStar = createShootingStar()
          Object.assign(star, newStar)
          star.active = false
          setTimeout(() => {
            star.active = true
          }, Math.random() * 3000)
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

export default Hero

