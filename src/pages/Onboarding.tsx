import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  GraduationCap,
  CalendarIcon,
  Upload,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const STREAMS = [
  "Engineering",
  "Medical",
  "Arts",
  "Commerce",
  "Science",
  "Law",
  "Management",
  "Other",
];

const INDIAN_STATES = [
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Gujarat",
  "Rajasthan",
  "West Bengal",
];

const step1Schema = z.object({
  fullName: z.string().min(2),
  dob: z.date(),
  gender: z.string().min(1),
});

const step2Schema = z.object({
  educationLevel: z.string().min(1),
  stream: z.string().min(1),
  institution: z.string().min(2),
  marks: z.coerce.number().min(0).max(100),
  category: z.string().min(1),
  income: z.coerce.number().min(0),
  state: z.string().min(1),
  disability: z.boolean(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
  });

  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    setTimeout(() => {
      toast({
        title: "Profile Saved (Demo Mode)",
        description: "MongoDB backend will be connected soon.",
      });
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 1000);
  };

  const progressValue = (step / 3) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-primary" />
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
          <Progress value={progressValue} className="mt-3 h-2" />
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <Form {...step1Form}>
              <form
                onSubmit={step1Form.handleSubmit(() => setStep(2))}
                className="space-y-4"
              >
                <FormField
                  control={step1Form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          )}

          {step === 2 && (
            <Form {...step2Form}>
              <form
                onSubmit={step2Form.handleSubmit(() => setStep(3))}
                className="space-y-4"
              >
                <Button type="button" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button type="submit" className="w-full">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                )}

                <input type="file" onChange={handleAvatarChange} />
              </div>

              <Button
                className="w-full"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Complete Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;