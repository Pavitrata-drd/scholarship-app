import { motion } from "framer-motion";
import { BookOpen, Users, IndianRupee } from "lucide-react";

const stats = [
  { icon: BookOpen, label: "Total Scholarships", value: "500+" },
  { icon: Users, label: "Students Helped", value: "10,000+" },
  { icon: IndianRupee, label: "Funding Available", value: "₹50 Cr+" },
];

const StatsBar = () => {
  return (
    <section className="border-y bg-card py-10">
      <div className="container grid grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display text-3xl font-bold text-foreground">{stat.value}</span>
            <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;
