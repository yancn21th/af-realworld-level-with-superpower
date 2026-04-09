import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-footer-bg mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Link to="/" className="font-display text-lg font-semibold text-white">conduit</Link>
            <p className="mt-2 font-sans text-nav text-white/50">A place to share your knowledge.</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Link to="/" className="font-sans text-nav text-white/80 hover:text-white transition-colors">Home</Link>
            <Link to="/login" className="font-sans text-nav text-white/80 hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="font-sans text-nav text-white/80 hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="font-sans text-[12px] text-white/40">
            An interactive learning project from{' '}
            <a href="https://thinkster.io" className="text-white/60 hover:text-white/80 underline underline-offset-2">Thinkster</a>.
            Code &amp; design licensed under MIT.
          </p>
        </div>
      </div>
    </footer>
  );
}
