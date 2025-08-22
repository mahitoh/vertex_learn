import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  Shield,
  MessageSquare,
  GraduationCap
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Complete student lifecycle management from admission to graduation with detailed profiles and academic tracking."
  },
  {
    icon: GraduationCap,
    title: "Academic Planning",
    description: "Curriculum management, course scheduling, and academic calendar with automated conflict detection."
  },
  {
    icon: DollarSign,
    title: "Financial Management",
    description: "Fee collection, payroll processing, budgeting, and comprehensive financial reporting and analytics."
  },
  {
    icon: Calendar,
    title: "Scheduling System",
    description: "Automated timetable generation, room allocation, and resource management with conflict resolution."
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Real-time dashboards, performance analytics, and customizable reports for data-driven decisions."
  },
  {
    icon: MessageSquare,
    title: "Communication Hub",
    description: "Integrated messaging system connecting teachers, students, parents, and administrators seamlessly."
  },
  {
    icon: BookOpen,
    title: "Library Management",
    description: "Digital catalog, book tracking, fine management, and integrated research resources."
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Role-based access control, data encryption, and compliance with educational privacy standards."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Comprehensive School Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to run your educational institution efficiently, 
            from student enrollment to graduation and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;