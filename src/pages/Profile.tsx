import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  User,
  GraduationCap,
  MapPin,
  IndianRupee,
  Save,
  Loader2,
  ArrowLeft,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/landing/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import {
  fetchProfile,
  updateProfile,
  sendVerifyOtp,
  verifyEmail,
  fetchEducationHistory,
  fetchEligibleScholarships,
  type UserProfile,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { getEducationLevelDirection, getBackwardWarningMessage } from "@/lib/profileUtils";

const EDUCATION_LEVELS = [
  { value: "10th", label: "10th Standard" },
  { value: "12th", label: "12th Standard" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "phd", label: "PhD" },
];

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "obc", label: "OBC" },
  { value: "sc", label: "SC" },
  { value: "st", label: "ST" },
  { value: "ews", label: "EWS" },
];

const STREAMS = ["Engineering", "Medical", "Arts", "Commerce", "Science", "Law", "Management", "Other"];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
];

// Age limits for each education level
const AGE_LIMITS = {
  "10th": { min: 14, max: 17 },
  "12th": { min: 16, max: 19 },
  "undergraduate": { min: 17, max: 23 },
  "postgraduate": { min: 23, max: 26 },
  "phd": { min: 26, max: 45 },
};

// Minimum passing percentage for each education level (SCHOOL)
const PASSING_PERCENTAGE = {
  "10th": 35,
  "12th": 35,
};

// Minimum passing CGPA for each education level (COLLEGE - out of 10)
const PASSING_CGPA = {
  "undergraduate": 5.0,
  "postgraduate": 5.0,
  "phd": 5.0,
};

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [form, setForm] = useState({
    education_level: "",
    category: "",
    stream: "",
    state: "",
    institution: "",
    marks: "",
    family_income: "",
    gender: "",
    dob: "",
    disability: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentEducationLevel, setCurrentEducationLevel] = useState<string | null>(null);
  const [showBackwardWarning, setShowBackwardWarning] = useState(false);
  const [pendingFormUpdate, setPendingFormUpdate] = useState<typeof form | null>(null);
  const [educationHistory, setEducationHistory] = useState<Array<{
    education_level: string;
    changed_from: string | null;
    changed_at: string;
  }> | null>(null);
  const [eligibleScholarships, setEligibleScholarships] = useState<any[]>([]);
  const [showEligibleScholarships, setShowEligibleScholarships] = useState(false);

  // Calculate age from DOB
  const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (form.dob && form.education_level) {
      const age = calculateAge(form.dob);
      const limits = AGE_LIMITS[form.education_level as keyof typeof AGE_LIMITS];
      if (limits) {
        if (age < limits.min || age > limits.max) {
          newErrors.dob = `Age should be between ${limits.min} to ${limits.max} years for ${
            form.education_level === "10th" ? "10th Standard" :
            form.education_level === "12th" ? "12th Standard" :
            form.education_level === "undergraduate" ? "Undergraduate" :
            form.education_level === "postgraduate" ? "Postgraduate" :
            "PhD"
          }`;
        }
      }
    }

    if (form.marks && form.education_level) {
      const marks = Number(form.marks);
      const isSchoolLevel = form.education_level === "10th" || form.education_level === "12th";
      
      if (isSchoolLevel) {
        // Validation for school level (Percentage: 0-100)
        if (isNaN(marks) || marks < 0 || marks > 100) {
          newErrors.marks = "Percentage must be between 0 and 100";
        } else {
          const passingPercentage = PASSING_PERCENTAGE[form.education_level as keyof typeof PASSING_PERCENTAGE];
          if (passingPercentage && marks < passingPercentage) {
            const levelLabel = form.education_level === "10th" ? "10th Standard" : "12th Standard";
            newErrors.marks = `You failed - minimum passing percentage for ${levelLabel} is ${passingPercentage}%`;
          }
        }
      } else {
        // Validation for college level (CGPA: 0-10)
        if (isNaN(marks) || marks < 0 || marks > 10) {
          newErrors.marks = "CGPA must be between 0 and 10";
        } else {
          const passingCGPA = PASSING_CGPA[form.education_level as keyof typeof PASSING_CGPA];
          if (passingCGPA && marks < passingCGPA) {
            const levelLabel = 
              form.education_level === "undergraduate" ? "Undergraduate" :
              form.education_level === "postgraduate" ? "Postgraduate" :
              "PhD";
            newErrors.marks = `You failed - minimum passing CGPA for ${levelLabel} is ${passingCGPA}`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchProfile()
      .then((res) => {
        const p = res.data;
        if (p) {
          setEmailVerified(!!p.email_verified);
          setCurrentEducationLevel(p.education_level || null);
          setForm({
            education_level: p.education_level || "",
            category: p.category || "",
            stream: p.stream || "",
            state: p.state || "",
            institution: p.institution || "",
            marks: p.marks?.toString() || "",
            family_income: p.family_income?.toString() || "",
            gender: p.gender || "",
            dob: p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
            disability: p.disability || false,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load education history on mount
  useEffect(() => {
    fetchEducationHistory()
      .then((res) => {
        if (res && res.data) {
          setEducationHistory(res.data);
        }
      })
      .catch(() => {
        // Silently fail - education history is optional
      });
  }, []);

  const handleSave = async () => {
    if (!validateForm()) {
      toast({ title: "Validation Error", description: "Please fix the errors before saving", variant: "destructive" });
      return;
    }

    // Check for backward education level movement
    if (form.education_level && currentEducationLevel && form.education_level !== currentEducationLevel) {
      const direction = getEducationLevelDirection(currentEducationLevel, form.education_level);
      if (direction.isBackward) {
        // Show warning dialog
        setPendingFormUpdate(form);
        setShowBackwardWarning(true);
        return;
      }
    }

    // Proceed with saving
    await performSave();
  };

  const performSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        education_level: form.education_level || null,
        category: form.category || null,
        stream: form.stream || null,
        state: form.state || null,
        institution: form.institution || null,
        marks: form.marks ? Number(form.marks) : null,
        family_income: form.family_income ? Number(form.family_income) : null,
        gender: form.gender || null,
        dob: form.dob || null,
        disability: form.disability,
      } as Parameters<typeof updateProfile>[0]);

      // Update the current education level after successful save
      if (form.education_level) {
        setCurrentEducationLevel(form.education_level);
      }

      // Fetch updated education history
      try {
        const historyRes = await fetchEducationHistory();
        if (historyRes && historyRes.data) {
          setEducationHistory(historyRes.data);
        }
      } catch {
        // Continue even if history fetch fails
      }

      // Fetch recalculated eligible scholarships
      try {
        const scholarshipsRes = await fetchEligibleScholarships();
        if (scholarshipsRes && scholarshipsRes.data) {
          setEligibleScholarships(scholarshipsRes.data);
          setShowEligibleScholarships(true);

          toast({
            title: "Profile updated successfully!",
            description: `Scholarships recalculated based on your profile. ${scholarshipsRes.data.length} scholarship${scholarshipsRes.data.length !== 1 ? 's' : ''} match your updated profile.`,
          });
        } else {
          toast({
            title: "Profile saved successfully!",
            description: "Your profile has been updated.",
          });
        }
      } catch {
        toast({
          title: "Profile saved successfully!",
          description: "Your profile has been updated. Check the dashboard for scholarship recommendations.",
        });
      }

      setShowBackwardWarning(false);
      setPendingFormUpdate(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Validation Error")) {
        toast({ title: "Validation Error", description: err.message, variant: "destructive" });
      } else {
        toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      const res = await sendVerifyOtp();
      setOtpSent(true);
      // Auto-fill OTP in dev mode so user doesn't have to check console/toast
      if (res._dev_otp) {
        setOtp(res._dev_otp);
        toast({ title: "OTP auto-filled (dev mode)", description: `OTP: ${res._dev_otp}` });
      } else {
        toast({ title: "OTP sent!", description: "Check your email inbox" });
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyEmail(otp);
      setEmailVerified(true);
      toast({ title: "Email verified!" });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("profile.subtitle")}</p>

        {/* How it works info card */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-primary" /> How your profile helps you
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li><strong>Smart Recommendations</strong> — We match scholarships to your education level, category, state &amp; stream</li>
              <li><strong>Eligibility Check</strong> — See instantly whether you qualify for each scholarship</li>
              <li><strong>Application Readiness</strong> — Know which documents you'll need before applying</li>
            </ul>
          </CardContent>
        </Card>

        {/* Email verification */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-sm">{user?.email}</span>
              {emailVerified ? (
                <Badge className="bg-green-100 text-green-700">
                  <Shield className="mr-1 h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="destructive">Not Verified</Badge>
              )}
            </div>
            {!emailVerified && (
              <div className="mt-3 flex gap-2">
                {!otpSent ? (
                  <Button size="sm" onClick={handleSendOtp}>Send Verification OTP</Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-40"
                    />
                    <Button size="sm" onClick={handleVerify} disabled={verifying}>
                      {verifying && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Verify
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => {
                    setForm({ ...form, dob: e.target.value });
                    setErrors({ ...errors, dob: "" });
                  }}
                  className={errors.dob ? "border-red-500" : ""}
                />
                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.disability}
                onCheckedChange={(v) => setForm({ ...form, disability: v })}
              />
              <Label>Person with Disability</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Education Level</Label>
                <Select value={form.education_level} onValueChange={(v) => setForm({ ...form, education_level: v })}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stream</Label>
                <Select value={form.stream} onValueChange={(v) => setForm({ ...form, stream: v })}>
                  <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                  <SelectContent>
                    {STREAMS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Institution</Label>
                <Input
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  placeholder="College / School name"
                />
              </div>
              <div>
                <Label>
                  {form.education_level === "10th" || form.education_level === "12th" 
                    ? "Percentage" 
                    : form.education_level 
                    ? "CGPA (Cumulative GPA)" 
                    : "Marks / Percentage"}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.marks}
                  onChange={(e) => {
                    setForm({ ...form, marks: e.target.value });
                    setErrors({ ...errors, marks: "" });
                  }}
                  placeholder={
                    form.education_level === "10th" || form.education_level === "12th" 
                      ? "e.g., 85 (0-100)" 
                      : form.education_level 
                      ? "e.g., 8.5 (0-10)" 
                      : "Select education level first"
                  }
                  className={errors.marks ? "border-red-500" : ""}
                />
                {!errors.marks && form.education_level && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.education_level === "10th" || form.education_level === "12th" 
                      ? "Enter your percentage (Minimum pass: 35%)" 
                      : `Enter your CGPA on 10-point scale (Minimum pass: ${PASSING_CGPA[form.education_level as keyof typeof PASSING_CGPA]})`}
                  </p>
                )}
                {errors.marks && <p className="text-red-500 text-sm mt-1">{errors.marks}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location & Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>State</Label>
                <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" /> Annual Family Income
              </Label>
              <Input
                type="number"
                value={form.family_income}
                onChange={(e) => setForm({ ...form, family_income: e.target.value })}
                placeholder="e.g., 300000"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {t("profile.save")}
          </Button>
        </div>

        {/* Backward Education Level Warning Dialog */}
        <AlertDialog open={showBackwardWarning} onOpenChange={setShowBackwardWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Moving Backward in Education Level
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {currentEducationLevel && form.education_level
                  ? getBackwardWarningMessage(currentEducationLevel, form.education_level)
                  : "Are you sure about this change?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={performSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Eligible Scholarships Dialog */}
        <Dialog open={showEligibleScholarships} onOpenChange={setShowEligibleScholarships}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Scholarships Now Available for You
              </DialogTitle>
              <DialogDescription>
                Based on your updated profile, {eligibleScholarships.length} scholarship{eligibleScholarships.length !== 1 ? 's' : ''} match your qualifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {eligibleScholarships && eligibleScholarships.length > 0 ? (
                eligibleScholarships.map((scholarship: any) => (
                  <Card key={scholarship.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{scholarship.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{scholarship.description}</p>
                          {scholarship.award_amount && (
                            <div className="mt-3 flex items-center gap-1 text-green-600 font-semibold">
                              <IndianRupee className="h-4 w-4" />
                              {new Intl.NumberFormat("en-IN").format(scholarship.award_amount)}
                            </div>
                          )}
                        </div>
                        <Badge className="bg-green-100 text-green-800 whitespace-nowrap">
                          <Star className="h-3 w-3 mr-1" /> Matching
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No new scholarships available at this time.</p>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEligibleScholarships(false)} className="flex-1">
                Close
              </Button>
              <Button onClick={() => {
                setShowEligibleScholarships(false);
                navigate("/scholarships");
              }} className="flex-1">
                View All Scholarships
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;
