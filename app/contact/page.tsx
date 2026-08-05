import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact — GIMMIE SICK VIS",
  description: "Get in touch about the site, a dive spot, or a data source worth adding.",
};

export default function Contact() {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-ttl">Contact</span>
      </div>
      <div className="panel-bd">
        <ContactForm />
      </div>
    </div>
  );
}
