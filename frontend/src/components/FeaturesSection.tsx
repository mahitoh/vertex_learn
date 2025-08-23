import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  DollarSign,
  Users,
  BookOpen,
  BarChart3,
  Calendar,
  Shield,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Academic Management",
    description:
      "Comprehensive course management, student performance tracking, exam scheduling, and attendance monitoring with detailed analytics.",
  },
  {
    icon: DollarSign,
    title: "Financial Oversight",
    description:
      "Tuition fee management, expense tracking, marketing campaign analytics, and comprehensive financial reporting with PDF generation.",
  },
  {
    icon: Users,
    title: "HR & Administration",
    description:
      "Employee management, payroll processing, leave request handling, asset tracking, and performance monitoring with notifications.",
  },
  {
    icon: BookOpen,
    title: "Course Planning",
    description:
      "Curriculum development, course scheduling, credit management, and instructor assignment with automated conflict detection.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Real-time dashboards for grades, attendance, financial metrics, and campaign ROI with interactive charts and reports.",
  },
  {
    icon: Calendar,
    title: "Exam Management",
    description:
      "Automated exam scheduling, result publication, grade management, and transcript generation with PDF export capabilities.",
  },
  {
    icon: FileText,
    title: "Document Management",
    description:
      "Invoice generation, receipt creation, expense reports, and financial summaries with automated PDF generation.",
  },
  {
    icon: Shield,
    title: "Role-Based Security",
    description:
      "JWT authentication, role-based access control for Admins, Students, and Staff with secure API endpoints.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Comprehensive Management Solutions
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Streamline your institution's operations with integrated Academic, Financial, and HR tools designed for modern educational institutions.
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-4xl mx-auto">
            Simplify daily tasks with seamless management of schedules, finances, and staff, empowering your school to focus on excellence and growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-background rounded-xl overflow-hidden h-full flex flex-col group"
            >
              <CardHeader className="text-center pb-4 pt-6">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20">
                  <feature.icon className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow flex items-center justify-center">
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
