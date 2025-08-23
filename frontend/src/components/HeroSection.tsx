import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState, useEffect } from "react";
import heroLiabrary from "@/assets/hero_liabrary.jpg";
import heroCode from "@/assets/code.jpg";
import heroSchool1 from "@/assets/school1.jpg";
import heroSchool2 from "@/assets/school2.jpg";

const slides = [
  {
    image: heroCode,
    title: "Comprehensive HR Solutions",
    subtitle: "Enhance staff and resource management",
    description:
      "Automate payroll, manage employee records, and streamline leave requests with integrated HR tools.",
  },
  {
    image: heroLiabrary,
    title: "Streamlined Academic Management",
    subtitle: "Optimize course planning and student performance",
    description:
      "Effortlessly manage schedules, grades, and attendance with real-time updates for educators and students.",
  },
  {
    image: heroSchool1,
    title: "Efficient Financial Oversight",
    subtitle: "Simplify budgeting and fee collection",
    description:
      "Track expenses, generate invoices, and analyze financial trends to ensure fiscal health for your institution.",
  },
  {
    image: heroSchool2,
    title: "Powerful Analytics Dashboard",
    subtitle: "Unlock data-driven insights",
    description:
      "Access detailed reports and visualizations to monitor performance and drive strategic decisions across all departments.",
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
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 animate-fade-in">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-gray-200 animate-fade-in">
            {slides[currentSlide].subtitle}
          </p>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-300 max-w-2xl mx-auto animate-fade-in">
            {slides[currentSlide].description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-16 sm:mb-20 mt-6 sm:mt-8">
            <Button
              size="default"
              className="bg-primary hover:bg-primary-dark text-sm sm:text-base px-4 sm:px-6 py-2 w-full sm:w-auto order-2 sm:order-1"
            >
              Start Free Trial
            </Button>
            <Button
              size="default"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-primary text-sm sm:text-base px-4 sm:px-6 py-2 w-full sm:w-auto order-1 sm:order-2"
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mb-6 sm:mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
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
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
    </section>
  );
};

export default HeroSection;
