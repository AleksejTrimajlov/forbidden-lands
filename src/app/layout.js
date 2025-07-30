export const metadata = {
  title: "Календарь",
  description:
    "В Запретных Землях время измеряется не часами, а кровью и потом",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
