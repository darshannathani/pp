import { pricingPlans } from "@/_constants/landing/pricingPlans";
import PricingCard from "./PricingCard";

export function Pricing() {
  return (
    <section id="landingPricing" className="px-4 py-24 bg-gradient-to-b from-gray-50 to-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Subscription models designed for your business
          </h2>
          <p className="max-w-2xl mx-auto mt-6 text-xl text-gray-500">
            Here at Uplift, we focus on markets where technology, innovation,
            and capital unlock long-term value and drive economic growth, with
            accessible pricing options to fit your budget.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 mt-24 md:grid-cols-2 lg:grid-cols-4 justify-items-center">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
