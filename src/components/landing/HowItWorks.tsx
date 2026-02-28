import { motion } from "framer-motion";
import { UserPlus, SearchCheck, Send } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and fill in your academic details, category, and preferences.",
  },
  {
    icon: SearchCheck,
    title: "Get Matched",
    description: "Our smart engine matches you with scholarships you're eligible for.",
  },
  {
    icon: Send,
    title: "Apply & Track",
    description: "Apply in one click, upload documents, and track your application status.",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-secondary/50 py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
          <p className="mt-3 text-muted-foreground">Three simple steps to your next scholarship</p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <step.icon className="h-8 w-8" />
              </div>
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 font-display text-6xl font-bold text-primary/5">
                {i + 1}
              </span>
              <h3 className="font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
