import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [feedback, setFeedback] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setFeedback(`Thank you, ${form.name}! I’ll get back to you soon.`);
      setForm({ name: "", email: "", message: "" });
    } else {
      setFeedback("Please fill in all fields.");
    }
  };

  return (
    <section id="contact">
      <h2 className="text-2xl font-bold text-blue-900 dark:text-cyan-300 mb-4">Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          id="name"
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
        />
        <input
          id="email"
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
        />
        <textarea
          id="message"
          placeholder="Your Message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
        />
        <button
          type="submit"
          className="bg-blue-900 dark:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          Send
        </button>
      </form>
      {feedback && (
        <p className={`mt-4 ${feedback.startsWith("Thank") ? "text-green-500" : "text-red-500"}`}>
          {feedback}
        </p>
      )}
    </section>
  );
};

export default Contact;
