export const metadata = { title: "Offertetool" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body
        style={{
          fontFamily: "system-ui",
          maxWidth: 980,
          margin: "40px auto",
          padding: "0 16px",
        }}
      >
        {children}
      </body>
    </html>
  );
}
