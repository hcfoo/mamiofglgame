import "./globals.css";

export const metadata = {
  title: "Mami of GL",
  description: "Catch the GL stars and collect zodiac energy"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="luxeBg" aria-hidden="true" />
        <div className="luxeGrain" aria-hidden="true" />
        <div className="appShell">
          <div className="appFrame">{children}</div>
        </div>
      </body>
    </html>
  );
}
