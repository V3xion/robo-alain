export const Footer = () => {
  return (
    <footer className="bg-[#0a1c44] text-white/90 py-5">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
        <p>© {new Date().getFullYear()} Robo Al Ain. All rights reserved.</p>
        <p>We Accept: Card • Cash • Wallet</p>
      </div>
    </footer>
  );
};
