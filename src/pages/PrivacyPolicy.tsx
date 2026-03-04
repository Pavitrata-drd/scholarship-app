import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10 max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">
          ScholarHub collects only the information needed to provide scholarship discovery, recommendations,
          saved items, application tracking, and account management.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Account information such as name, email, and password hash.</li>
            <li>Profile details you provide for scholarship matching.</li>
            <li>Saved scholarships, applications, and uploaded documents.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">How We Use Data</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>To personalize recommendations and improve search/filter relevance.</li>
            <li>To enable notifications, reminders, and application tracking features.</li>
            <li>To maintain security, prevent misuse, and support platform reliability.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Your Controls</h2>
          <p className="text-muted-foreground">
            You can update your profile data from the Profile page and remove saved records from your dashboard.
            Contact support for account/data deletion requests.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
