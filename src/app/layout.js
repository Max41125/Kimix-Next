
import "./globals.css";



export const metadata = {
  title: "Kimix Frontend",
  description: "Chemical base",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
