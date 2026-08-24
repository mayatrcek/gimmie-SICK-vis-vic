import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact — GIMMIE SICK VIS",
  description: "Get in touch about the site, a dive spot, or a data source worth adding.",
};

export default function Contact() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <h1 className="panel-ttl">Contact</h1>
      </div>
      <div className="panel-bd">
        <ContactForm />
      </div>
    </div>
  );
}
