import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState, useEffect } from "react";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import heroClassroom from "@/assets/hero-classroom.jpg";
import heroAdmin from "@/assets/hero-admin.jpg";
import heroLiabrary from "@/assets/hero_liabrary.jpg";
import heroCode from "@/assets/code.jpg";

const slides = [
  {
    image: heroDashboard,
    title: "Complete School Management Solution",
    subtitle:
      "Streamline your educational institution with our comprehensive ERP system",
    description:
      "Manage students, staff, finances, and operations all in one powerful platform.",
  },
  {
    image: heroClassroom,
    title: "Enhance Learning Experience",
    subtitle: "Connect teachers, students, and parents seamlessly",
    description:
      "Digital classrooms, assignment tracking, and real-time communication tools.",
  },
  {
    image: heroAdmin,
    title: "Data-Driven Decisions",
    subtitle: "Advanced analytics and reporting for educational excellence",
    description:
      "Make informed decisions with comprehensive insights and automated reports.",
  },
  {
    image: heroCode,
    title: "Data-Driven Decisionsj",
    subtitle: "Advanced analytics and reporting for educational excellence",
    description:
      "Make informed decisions with comprehensive insights and automated reports.",
  },
  {
    image: heroLiabrary,
    title: "Data-Driven Decisions",
    subtitle: "Advanced analytics and reporting for educational excellence",
    description:
      "Make informed decisions with comprehensive insights and automated reports.",
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-200 animate-fade-in">
            {slides[currentSlide].subtitle}
          </p>
          <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto animate-fade-in">
            {slides[currentSlide].description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-dark text-lg px-8 py-4"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-primary text-lg px-8 py-4"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
};

export default HeroSection;
