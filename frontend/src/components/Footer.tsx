import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">SchoolBloom</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering educational institutions with comprehensive ERP solutions 
              for streamlined operations and enhanced learning experiences.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-primary p-2">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-primary p-2">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-primary p-2">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-primary p-2">
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Solutions</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Student Management</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Academic Planning</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Financial Management</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Communication Tools</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Analytics & Reports</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Training Materials</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Case Studies</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Webinars</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  123 Education Street<br />
                  Learning District, LD 12345
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-300">info@schoolbloom.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-700 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl font-bold mb-4">Stay Updated</h4>
            <p className="text-gray-300 mb-6">
              Get the latest updates on new features, educational insights, and industry trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary-dark px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 SchoolBloom. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;