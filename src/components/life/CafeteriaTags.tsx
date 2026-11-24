import { Banknote, CreditCard } from "lucide-react";
import payPayIcon from "../../assets/utility/PayPay.svg";
import {
  cafeteriaCategoryClass,
  paymentLabels,
  paymentMethods,
  type CafeteriaCategory,
  type PaymentMethod,
} from "./mockCafeterias";
import "../../styles/utility/Tags.css";
import "../../styles/utility/ComingSoon.css";
import "../../styles/life/Cafeteria.css";

type CafeteriaCategoryBadgeProps = {
  category: CafeteriaCategory;
};

export function CafeteriaCategoryBadge({ category }: CafeteriaCategoryBadgeProps) {
  return (
    <span className={`tag cafeteriaCategoryBadge ${cafeteriaCategoryClass[category]}`}>
      {category}
    </span>
  );
}

function PaymentIcon({ method }: { method: PaymentMethod }) {
  if (method === "cash") return <Banknote aria-hidden="true" />;
  if (method === "credit") return <CreditCard aria-hidden="true" />;
  return <img src={payPayIcon} alt="" />;
}

type PaymentIconsProps = {
  payments: Record<PaymentMethod, boolean>;
  showUnavailable?: boolean;
};

export function PaymentIcons({ payments, showUnavailable = false }: PaymentIconsProps) {
  const methods = paymentMethods.filter((method) => showUnavailable || payments[method]);

  return (
    <div className="cafeteriaPayments">
      {methods.map((method) => {
        const available = payments[method];
        const status = `${paymentLabels[method]}${available ? "可" : "不可"}`;
        return (
          <span
            className={`cafeteriaPayment${available ? "" : " isUnavailable"}`}
            role="img"
            aria-label={status}
            tabIndex={0}
            key={method}
          >
            <PaymentIcon method={method} />
            <span className="comingSoonTip" aria-hidden="true">
              {status}
            </span>
          </span>
        );
      })}
    </div>
  );
}
