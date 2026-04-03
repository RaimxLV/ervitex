import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const ContactPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    setForm({ name: "", email: "", company: "", phone: "", message: "" });
  };

  return (
    <Layout>
      <section className="bg-primary py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-4xl font-bold text-primary-foreground md:text-5xl">Contact Us</h1>
            <p className="mt-4 max-w-lg text-lg text-primary-foreground/70">
              Ready to start your next project? Get in touch for a personalized quote.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">Get in Touch</h2>
              <p className="mt-2 text-muted-foreground">We respond to all inquiries within one business day.</p>
            </div>

            <div className="space-y-5">
              {[
                { icon: <Phone className="h-5 w-5" />, label: "Phone", value: "+371 678 18282", href: "tel:+37167818282" },
                { icon: <Mail className="h-5 w-5" />, label: "Email", value: "info@ervitex.lv", href: "mailto:info@ervitex.lv" },
                { icon: <MapPin className="h-5 w-5" />, label: "Address", value: "Rīga, Latvia" },
                { icon: <Clock className="h-5 w-5" />, label: "Hours", value: "Mon–Fri: 9:00–18:00" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-foreground hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full Name *</label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Company</label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+371..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Message *</label>
                <Textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project, quantities, and timeline..." />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
