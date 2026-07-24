import Link from "next/link";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl glass">
          <Ghost className="text-neon-cyan" />
        </div>
        <h1 className="text-2xl font-bold text-white">Lost in the fleet</h1>
        <p className="mt-2 text-sm text-slate-400">
          That page or agent doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-neon-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
        >
          Back to Mission Control
        </Link>
      </div>
    </div>
  );
}
