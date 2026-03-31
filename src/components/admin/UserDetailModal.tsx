import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  User as UserIcon,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { fetchAdminUserDetail, type UserDetailResponse } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface UserDetailModalProps {
  userId: number | null;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ userId, userName, isOpen, onClose }: UserDetailModalProps) {
  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUserDetail = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetchAdminUserDetail(userId);
      setData(res.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetail();
    }
  }, [isOpen, userId, loadUserDetail]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    return (bytes / 1024).toFixed(2) + " KB";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{userName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
              <TabsTrigger value="saved" className="text-xs sm:text-sm">Saved</TabsTrigger>
              <TabsTrigger value="applications" className="text-xs sm:text-sm">Apps</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs sm:text-sm">Timeline</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">Docs</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* User Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Account Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {data.user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <Badge variant={data.user.role === "admin" ? "default" : "secondary"}>
                        {data.user.role}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email Verified</p>
                      <p className="font-medium flex items-center gap-2">
                        {data.user.email_verified === true ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            Not Verified
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(data.user.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Saved Scholarships</span>
                      <Badge variant="outline">{data.stats.total_saved}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Applications</span>
                      <Badge variant="outline">{data.stats.total_applications}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Documents Uploaded</span>
                      <Badge variant="outline">{data.stats.total_documents}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Unread Notifications</span>
                      <Badge variant="outline">{data.stats.unread_notifications}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-4">
              {data.profile ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Education Level</p>
                      <p className="font-medium">{data.profile.education_level || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{data.profile.category || "General"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stream</p>
                      <p className="font-medium">{data.profile.stream || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="font-medium">{data.profile.state || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Institution</p>
                      <p className="font-medium">{data.profile.institution || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-medium">{data.profile.country || "India"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{data.profile.gender || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">
                        {data.profile.dob ? formatDate(data.profile.dob) : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Marks/CGPA</p>
                      <p className="font-medium">{data.profile.marks || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Family Income</p>
                      <p className="font-medium">
                        {data.profile.family_income ? `₹${data.profile.family_income.toLocaleString()}` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Disability Status</p>
                      <Badge variant={data.profile.disability ? "destructive" : "outline"}>
                        {data.profile.disability ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Preferred Language</p>
                      <p className="font-medium">{data.profile.preferred_language}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No profile information yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* SAVED SCHOLARSHIPS TAB */}
            <TabsContent value="saved" className="space-y-4">
              {data.saved_scholarships.length > 0 ? (
                <div className="space-y-3">
                  {data.saved_scholarships.map((sch) => (
                    <Card key={sch.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{sch.name}</p>
                            <p className="text-sm text-muted-foreground">{sch.provider}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary">₹{sch.amount.toLocaleString()}</Badge>
                              <Badge variant="outline">{formatDate(sch.deadline)}</Badge>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            Saved: {formatDate(sch.saved_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No saved scholarships</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* APPLICATIONS TAB */}
            <TabsContent value="applications" className="space-y-4">
              {data.applications.length > 0 ? (
                <div className="space-y-3">
                  {data.applications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{app.name}</p>
                            <p className="text-sm text-muted-foreground">{app.provider}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge
                                variant={
                                  app.status === "accepted"
                                    ? "default"
                                    : app.status === "rejected"
                                      ? "destructive"
                                      : "outline"
                                }
                              >
                                {app.status.replace("_", " ")}
                              </Badge>
                              <Badge variant="secondary">₹{app.amount.toLocaleString()}</Badge>
                            </div>
                            {app.notes && (
                              <p className="text-xs text-muted-foreground mt-2">Note: {app.notes}</p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>Applied: {formatDate(app.created_at)}</p>
                            <p>Updated: {formatDate(app.updated_at)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No applications</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TIMELINE TAB */}
            <TabsContent value="timeline" className="space-y-4">
              {data.timeline.length > 0 ? (
                <div className="space-y-4">
                  {data.timeline.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <div className="w-0.5 h-8 bg-border mt-2" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium capitalize">{event.status.replace("_", " ")}</p>
                            <p className="text-sm text-muted-foreground">{event.scholarship_name}</p>
                            {event.note && (
                              <p className="text-sm mt-2 text-muted-foreground">Note: {event.note}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(event.created_at)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No timeline events</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* DOCUMENTS TAB */}
            <TabsContent value="documents" className="space-y-4">
              {data.documents.length > 0 ? (
                <div className="space-y-3">
                  {data.documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{doc.name}</p>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {doc.doc_type && (
                                  <Badge variant="outline" className="text-xs">{doc.doc_type}</Badge>
                                )}
                                {doc.file_size && (
                                  <Badge variant="secondary" className="text-xs">
                                    {formatSize(doc.file_size)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(doc.created_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No documents uploaded</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
