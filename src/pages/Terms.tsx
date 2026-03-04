import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10 max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground">
          By using ScholarHub, you agree to use the platform lawfully and provide accurate information.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Acceptable Use</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Do not misuse the platform, APIs, or uploaded resources.</li>
            <li>Do not upload harmful, illegal, or misleading content.</li>
            <li>Respect account security and keep your credentials private.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Scholarship Information</h2>
          <p className="text-muted-foreground">
            Scholarship listings are provided for informational purposes. Users should verify details,
            deadlines, and eligibility from official sources before applying.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Limitation of Liability</h2>
          <p className="text-muted-foreground">
            ScholarHub is not responsible for third-party scholarship decisions, external site changes,
            or missed deadlines due to inaccurate user-provided data.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
