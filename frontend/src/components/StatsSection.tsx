import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, Clock, Star } from "lucide-react";

const stats = [
  {
    icon: CheckCircle,
    number: "500+",
    label: "Schools Trust Us",
    description: "Educational institutions worldwide"
  },
  {
    icon: TrendingUp,
    number: "40%",
    label: "Efficiency Increase",
    description: "Average productivity improvement"
  },
  {
    icon: Clock,
    number: "24/7",
    label: "Support Available",
    description: "Round-the-clock assistance"
  },
  {
    icon: Star,
    number: "4.9/5",
    label: "Customer Rating",
    description: "Based on 1000+ reviews"
  }
];

const benefits = [
  "Reduce administrative workload by up to 60%",
  "Improve parent-teacher communication",
  "Streamline fee collection and financial reporting",
  "Enhance student academic tracking",
  "Automate attendance and grading processes",
  "Generate comprehensive performance analytics"
];

const StatsSection = () => {
  return (
    <section id="benefits" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-card">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-accent" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Transform Your School Operations
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of educational institutions that have revolutionized 
              their management processes with our comprehensive ERP solution.
            </p>
            
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary-dark">
                Schedule Demo
              </Button>
              <Button size="lg" variant="outline">
                View Case Studies
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-hero rounded-2xl p-8 text-white shadow-elegant">
              <h3 className="text-2xl font-bold mb-6">Ready to Get Started?</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>Full training included</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>24/7 support</span>
                </div>
              </div>
              <Button size="lg" variant="secondary" className="w-full">
                Start Your Free Trial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;