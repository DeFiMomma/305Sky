"use client";

import { useState, useTransition } from "react";
import { createWorkOrder } from "@/app/actions";
import { lookupTail, type TailLookup } from "./lookup";

export function NewWorkOrderForm({ customers }: { customers: { id: number; name: string }[] }) {
  const [tail, setTail] = useState("");
  const [found, setFound] = useState<TailLookup | null>(null);
  const [looking, startLookup] = useTransition();
  const [customerId, setCustomerId] = useState("");
  const [newCustomer, setNewCustomer] = useState(false);

  function lookup() {
    if (!tail.trim()) return;
    startLookup(async () => {
      const r = await lookupTail(tail);
      setFound(r);
      if (r.aircraft?.customerId) setCustomerId(String(r.aircraft.customerId));
    });
  }

  const ac = found?.aircraft;
  return (
    <form action={createWorkOrder} className="space-y-5">
      <section className="card p-5">
        <h2 className="mb-4 font-semibold">Aircraft</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label" htmlFor="tailNumber">Tail number</label>
            <input
              id="tailNumber"
              name="tailNumber"
              required
              value={tail}
              onChange={(e) => {
                setTail(e.target.value.toUpperCase());
                setFound(null);
              }}
              onBlur={lookup}
              placeholder="N604XT"
              className="input text-lg font-semibold uppercase"
            />
          </div>
          <button type="button" onClick={lookup} className="btn-secondary self-end" disabled={looking}>
            {looking ? "Looking up…" : "Look up"}
          </button>
        </div>
        {found ? (
          <p className={`mt-2 text-sm ${ac ? "text-green-700" : "text-gray-600"}`}>{found.message}</p>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field name="year" label="Year" defaultValue={ac?.year ?? ""} key={`y${ac?.id}`} />
          <Field name="make" label="Make" defaultValue={ac?.make ?? ""} key={`m${ac?.id}`} />
          <Field name="model" label="Model" defaultValue={ac?.model ?? ""} key={`o${ac?.id}`} />
          <Field name="serialNumber" label="Serial #" defaultValue={ac?.serialNumber ?? ""} key={`s${ac?.id}`} />
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Customer</h2>
          <button type="button" className="text-sm text-gray-600 underline" onClick={() => setNewCustomer(!newCustomer)}>
            {newCustomer ? "Pick existing customer" : "+ New customer"}
          </button>
        </div>
        {newCustomer ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="newCustomerName" label="Company / owner name" required />
            <Field name="newCustomerContact" label="Contact person" />
            <Field name="newCustomerEmail" label="Email" type="email" />
            <Field name="newCustomerPhone" label="Phone" />
          </div>
        ) : (
          <select name="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input">
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-semibold">Work</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Field name="title" label="Title" placeholder="Annual inspection" required />
          </div>
          <Field name="customerReference" label="Customer W/O # (optional)" />
        </div>
        <div className="mt-3">
          <label className="label" htmlFor="discrepancies">Squawks / discrepancies — one per line</label>
          <textarea
            id="discrepancies"
            name="discrepancies"
            rows={5}
            className="input"
            placeholder={"Left main tire worn\nWing boot needs PRC L/H & R/H\nCabin light inop at flap 20-45"}
          />
          <p className="mt-1 text-xs text-gray-500">Each line becomes a task. More can be added once the inspection starts.</p>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="aog" className="size-4" /> Aircraft on ground (AOG)
        </label>
      </section>

      <div className="flex justify-end gap-2">
        <button type="submit" className="btn-primary">Open work order</button>
      </div>
    </form>
  );
}

function Field(props: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="label" htmlFor={props.name}>{label}</label>
      <input id={props.name} className="input" {...rest} />
    </div>
  );
}
