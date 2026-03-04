import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  FileDown,
  CheckCircle2,
  XCircle,
  Loader2,
  GraduationCap,
  MapPin,
  Tag,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/landing/Navbar";
import ShareButtons from "@/components/ShareButtons";
import { useScholarship, useScholarships } from "@/hooks/useScholarships";
import { useAuth } from "@/hooks/useAuth";
import {
  saveScholarship,
  unsaveScholarship,
  checkSaved,
  createApplication,
} from "@/lib/api";
import { exportScholarshipPDF } from "@/lib/pdf";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/useI18n";

const ScholarshipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useScholarship(id || "");
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [isSaved, setIsSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const scholarship = data?.data;

  // Check if saved
  useEffect(() => {
    if (id && isAuthenticated) {
      checkSaved(Number(id))
        .then((res) => setIsSaved(res.saved))
        .catch(() => {});
    }
  }, [id, isAuthenticated]);

  // Fetch similar scholarships
  const { data: similarData } = useScholarships({
    type: scholarship?.type,
    education_level: scholarship?.education_level || undefined,
    limit: 4,
  });
  const similar = (similarData?.data ?? []).filter((s) => s.id !== Number(id));

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please log in", description: "You need to log in to save scholarships", variant: "destructive" });
      return;
    }
    try {
      if (isSaved) {
        await unsaveScholarship(Number(id));
        setIsSaved(false);
        toast({ title: "Removed from saved" });
      } else {
        await saveScholarship(Number(id));
        setIsSaved(true);
        toast({ title: "Scholarship saved!" });
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    }
  };

  const handleTrack = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please log in", variant: "destructive" });
      return;
    }
    try {
      await createApplication(Number(id), "interested");
      toast({ title: "Added to your applications", description: "Track it from your dashboard" });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !scholarship) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <p className="text-destructive text-lg">Scholarship not found</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/scholarships">Back to Scholarships</Link>
          </Button>
        </div>
      </div>
    );
  }

  const daysLeft = scholarship.deadline
    ? differenceInDays(new Date(scholarship.deadline), new Date())
    : null;

  const deadlineColor =
    daysLeft !== null && daysLeft <= 7
      ? "text-red-600 bg-red-50"
      : daysLeft !== null && daysLeft <= 30
      ? "text-yellow-600 bg-yellow-50"
      : "text-green-600 bg-green-50";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6 max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/scholarships">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Scholarships
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">{scholarship.name}</h1>
            <p className="mt-1 text-muted-foreground">{scholarship.provider}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize">{scholarship.type}</Badge>
              {scholarship.education_level && <Badge variant="outline">{scholarship.education_level}</Badge>}
              {scholarship.category && <Badge variant="outline" className="capitalize">{scholarship.category}</Badge>}
              {scholarship.state && (
                <Badge variant="outline">
                  <MapPin className="mr-1 h-3 w-3" /> {scholarship.state}
                </Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant={isSaved ? "secondary" : "outline"} size="sm" onClick={handleSave}>
              {isSaved ? <BookmarkCheck className="mr-1 h-4 w-4" /> : <Bookmark className="mr-1 h-4 w-4" />}
              {isSaved ? t("detail.unsave") : t("detail.save")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowShare(!showShare)}>
              <Share2 className="mr-1 h-4 w-4" /> {t("detail.share")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportScholarshipPDF(scholarship)}>
              <FileDown className="mr-1 h-4 w-4" /> {t("detail.export")}
            </Button>
          </div>
        </div>

        {/* Share buttons */}
        {showShare && (
          <div className="mt-3">
            <ShareButtons
              title={scholarship.name}
              url={window.location.href}
              description={`Check out this scholarship: ${scholarship.name} - ₹${Number(scholarship.amount).toLocaleString("en-IN")}`}
            />
          </div>
        )}

        <Separator className="my-6" />

        {/* Key info cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <IndianRupee className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xl font-bold">₹{Number(scholarship.amount).toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground">{t("common.amount")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                {scholarship.deadline ? (
                  <>
                    <p className="text-lg font-bold">{format(new Date(scholarship.deadline), "dd MMM yyyy")}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${deadlineColor}`}>
                      {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} days left` : "Expired"}
                    </span>
                  </>
                ) : (
                  <p className="text-lg font-bold">No deadline</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Tag className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold capitalize">{scholarship.type}</p>
                <p className="text-xs text-muted-foreground">{t("common.type")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {scholarship.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{scholarship.description}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Eligibility */}
          {scholarship.eligibility_criteria && scholarship.eligibility_criteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {t("detail.eligibility")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scholarship.eligibility_criteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Documents required */}
          {scholarship.documents_required && scholarship.documents_required.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileDown className="h-4 w-4 text-primary" />
                  {t("detail.documents")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scholarship.documents_required.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 mb-8">
          {scholarship.official_url && (
            <Button asChild size="lg">
              <a href={scholarship.official_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> {t("detail.apply")}
              </a>
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={handleTrack}>
            <GraduationCap className="mr-2 h-4 w-4" /> Track Application
          </Button>
        </div>

        {/* Similar scholarships */}
        {similar.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{t("detail.similar")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {similar.slice(0, 4).map((s) => (
                <Link
                  key={s.id}
                  to={`/scholarship/${s.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{s.provider}</p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="font-semibold">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                        <Badge variant="outline" className="text-xs">{s.type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipDetail;
