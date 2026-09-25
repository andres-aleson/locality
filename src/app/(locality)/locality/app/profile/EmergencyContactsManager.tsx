"use client";

import { useState, type FormEvent } from "react";
import { addEmergencyContact, deleteEmergencyContact } from "@/lib/locality/actions";
import type { EmergencyContact } from "@/lib/locality/types";

export function EmergencyContactsManager({ initialContacts }: { initialContacts: EmergencyContact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setPending(true);
    try {
      await addEmergencyContact({ name: name.trim(), phone: phone.trim(), relationship: relationship.trim() });
      setContacts((prev) => [
        ...prev,
        { id: `pending-${Date.now()}`, name: name.trim(), phone: phone.trim(), relationship: relationship.trim() },
      ]);
      setName("");
      setPhone("");
      setRelationship("");
      setShowForm(false);
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteEmergencyContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Emergency contacts</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400"
          >
            + Add
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Shown when you tap the emergency contact button on a ride — pick anyone to call instantly.
      </p>

      {contacts.length === 0 && !showForm && (
        <p className="text-sm text-slate-400 dark:text-slate-500">None added yet.</p>
      )}

      {contacts.length > 0 && (
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm dark:bg-slate-900"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-50">{contact.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {contact.relationship ? `${contact.relationship} · ` : ""}
                  {contact.phone}
                </p>
              </div>
              <button
                onClick={() => handleDelete(contact.id)}
                disabled={deletingId === contact.id}
                className="text-xs font-semibold text-rose-600 disabled:opacity-40 dark:text-rose-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="flex flex-col gap-2.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <input
            type="text"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            placeholder="Relationship (e.g. Spouse, Sister)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <div className="mt-1 flex gap-2">
            <button
              type="submit"
              disabled={!name.trim() || !phone.trim() || pending}
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
