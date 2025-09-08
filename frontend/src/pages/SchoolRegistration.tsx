import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, School, User, GraduationCap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Organization {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export default function SchoolRegistration() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "", // teacher or student
    organizationId: "",
    studentId: "", // for students
    employeeId: "", // for teachers
  });

  // Fetch available schools
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3000/api/schools/organizations"
        );
        if (!response.ok) throw new Error("Failed to fetch schools");

        const data = await response.json();
        setOrganizations(data.data || []);
      } catch (err) {
        setError("Failed to load schools");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const validateEmail = (email: string, orgEmail: string) => {
    return email.endsWith(orgEmail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      const selectedOrg = organizations.find(
        (org) => org.id.toString() === formData.organizationId
      );
      if (!selectedOrg) {
        throw new Error("Please select a school");
      }

      if (!formData.role) {
        throw new Error("Please select your role (Teacher or Student)");
      }

      // Prepare registration data
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        organizationId: formData.organizationId,
        studentId: formData.role === "student" ? formData.studentId : null,
        employeeId: formData.role === "teacher" ? formData.employeeId : null,
      };

      // Mock registration - replace with actual API call
      console.log("Registration data:", registrationData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(
        `Registration submitted successfully! Your account is pending approval by ${selectedOrg.name} administrators. You will receive an email once approved.`
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "",
        organizationId: "",
        studentId: "",
        employeeId: "",
      });
    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrg = organizations.find(
    (org) => org.id.toString() === formData.organizationId
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <School className="h-6 w-6" />
            Join Your School
          </CardTitle>
          <p className="text-gray-600">
            Register with your school's email address
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Full Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* School Selection */}
            <div>
              <Label htmlFor="organization">Select Your School</Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) =>
                  setFormData({ ...formData, organizationId: value, email: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your school" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Selection */}
            <div>
              <Label>I am a:</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Teacher
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Student
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* School Email */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your.email@example.com"
                disabled={!selectedOrg}
                required
              />
            </div>

            {/* ID Field */}
            {formData.role === "student" && (
              <div>
                <Label htmlFor="studentId">Student ID (if available)</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  placeholder="e.g., STU001"
                />
              </div>
            )}

            {formData.role === "teacher" && (
              <div>
                <Label htmlFor="employeeId">Employee ID (if available)</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  placeholder="e.g., TEACH001"
                />
              </div>
            )}

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1-555-0123"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit for Approval"}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              Your registration will be reviewed by school administrators
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
