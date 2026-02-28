import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CalendarDays, IndianRupee, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";

const deadlineColor = (deadline: string) => {
  const days = differenceInDays(new Date(deadline), new Date());
  if (days <= 7) return "bg-scholar-danger/10 text-scholar-danger";
  if (days <= 30) return "bg-scholar-warning/10 text-scholar-warning";
  return "bg-scholar-success/10 text-scholar-success";
};

const FeaturedScholarships = () => {
  const { data: scholarships, isLoading } = useQuery({
    queryKey: ["featured-scholarships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("is_featured", true)
        .gte("deadline", new Date().toISOString().split("T")[0])
        .order("deadline", { ascending: true })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">Featured Scholarships</h2>
          <p className="mt-3 text-muted-foreground">Handpicked opportunities you don't want to miss</p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : scholarships && scholarships.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="group h-full transition-shadow hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                          {s.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{s.provider}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 capitalize">
                        {s.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="font-semibold">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${deadlineColor(s.deadline)}`}>
                        {format(new Date(s.deadline), "dd MMM yyyy")}
                      </span>
                    </div>
                    {s.eligibility_criteria && s.eligibility_criteria.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {s.eligibility_criteria.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                      <Link to={`/scholarships/${s.id}`}>
                        View Details <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>Scholarships coming soon! Check back later.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/scholarships" className="gap-2">
              Browse All Scholarships <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedScholarships;
