import { Grid as Bridge, Shield, Zap } from "lucide-react";
import React from "react";

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Bridge className="w-8 h-8 text-[#476520]" />,
      title: "Native Bridging",
      description:
        "Direct, secure bridging between Celo and Ethereum, reducing reliance on external bridges and enhancing token transfer security.",
    },
    {
      icon: <Zap className="w-8 h-8 text-[#476520]" />,
      title: "Enhanced Performance",
      description:
        "1-second block times with 30M gas limit, delivering faster and more efficient transaction processing.",
    },
    {
      icon: <Shield className="w-8 h-8 text-[#476520]" />,
      title: "Ethereum Security",
      description:
        "Leverage Ethereum's robust security while maintaining Celo's commitment to accessibility and user experience.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {benefits.map((benefit, index) => (
        <div key={index} className="bg-white p-6 border-2 border-gray-200">
          <div className="mb-4">{benefit.icon}</div>
          <h3 className="text-xl font-semibold text-[#476520] mb-2">
            {benefit.title}
          </h3>
          <p className="text-gray-600">{benefit.description}</p>
        </div>
      ))}
    </div>
  );
};
