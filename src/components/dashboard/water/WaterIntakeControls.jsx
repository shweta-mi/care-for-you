import { useState } from "react";
import { Field, PrimaryButton } from "../../ui";

export default function WaterIntakeControls({ onAdd }) {
  const [customAmount, setCustomAmount] = useState("");
  const amounts = [250, 500, 750, 1000];

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap gap-3">
        {amounts.map((amount) => (
          <PrimaryButton
            key={amount}
            onClick={() => onAdd(amount)}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            + {amount === 1000 ? "1 L" : `${amount} ml`}
          </PrimaryButton>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onAdd(customAmount);
          setCustomAmount("");
        }}
        className="grid gap-3 sm:grid-cols-[1fr_auto]"
      >
        <Field
          label="Custom amount"
          type="number"
          min="1"
          step="50"
          value={customAmount}
          onChange={(event) => setCustomAmount(event.target.value)}
          placeholder="Amount in ml"
        />
        <PrimaryButton type="submit" className="self-end bg-cyan-500 hover:bg-cyan-600">
          Add custom
        </PrimaryButton>
      </form>
    </div>
  );
}
