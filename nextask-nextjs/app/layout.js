import "./globals.css";

export const metadata = {
  title: "NexTask - AI Powered Task Manager",
  description: "Next.js port of the NexTask application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
