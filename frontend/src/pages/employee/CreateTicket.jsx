import React, { useEffect, useState } from "react";
import { createTicket } from "../../services/tickets";
import { listCategories } from "../../services/categories";

export default function CreateTicketPage() {
  const [categories, setCategories] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [categoryId, setCategoryId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    listCategories()
      .then((r) => setCategories(r.categories || []))
      .catch(() => setCategories([]));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await createTicket({
        subject: subject.trim(),
        description: description.trim(),
        priority,
        categoryId: categoryId || null,
      });
      setMsg({ type: "success", text: `Ticket created (#${res.ticket.ticketNumber}).` });
      setSubject("");
      setDescription("");
      setPriority("LOW");
      setCategoryId("");
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.error || "Failed to create ticket" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Ticket</h1>
      <div className="card p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {msg && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {msg.text}
            </div>
          )}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input-field"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-field"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-primary py-2.5 px-4">
            {busy ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}
