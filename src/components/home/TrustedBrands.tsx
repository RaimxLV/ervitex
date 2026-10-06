const brands = [
  "Stanley/Stella", "Craft", "Clique", "ProJob", "Cutter & Buck",
  "Elevate", "Roly", "Russell", "Beechfield Brands", "Malfini",
  "Prezentmateriāli",
];

const TrustedBrands = () => {
  return (
    <section className="border-y border-border bg-background py-7 md:py-12">
      <div className="container">
        {/* Scrolling brand logos (text-based, monochrome) */}
        <div className="overflow-hidden">
          <div className="flex animate-scroll-left whitespace-nowrap">
            {[...Array(3)].map((_, setIdx) => (
              <div key={setIdx} className="flex shrink-0">
                {brands.map((brand, i) => (
                  <div
                    key={`${setIdx}-${i}`}
                    className="mx-6 flex items-center md:mx-10"
                  >
                    <span className="font-heading text-lg font-bold uppercase text-muted-foreground/40 transition-colors duration-300 hover:text-foreground md:text-xl">
                      {brand}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBrands;
