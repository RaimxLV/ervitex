import { motion } from "framer-motion";

const GoogleMapEmbed = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-sm border border-border"
    >
      <iframe
        title="Ervitex Location - Braslas 29, Rīga"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1088.5!2d24.1545!3d56.9575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46eecfb0e1d3c5c1%3A0x8c8e6d7b5b7d3e0a!2sBraslas%20iela%2029%2C%20Vidzemes%20priek%C5%A1pils%C4%93ta%2C%20R%C4%ABga%2C%20LV-1084!5e0!3m2!1slv!2slv!4v1700000000000!5m2!1slv!2slv"
        width="100%"
        height="400"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full"
      />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-sm bg-primary/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
        <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-wider text-primary-foreground">ERVITEX</p>
          <p className="text-[10px] text-primary-foreground/60">Braslas Biznesa Centrs, Ieeja D, 2. stāvs</p>
        </div>
      </div>
    </motion.div>
  );
};

export default GoogleMapEmbed;
