import Link from "next/link";

export function RightSidebar() {
  return (
    <aside className="hidden xl:block">
      <div className="rounded-lg border border-[#D9DDE1] bg-white p-4">
        <h2 className="text-sm font-semibold text-[#1D2226]">Profile Tools</h2>

        <div className="mt-4 space-y-3">
          <Link href="/resume" className="block text-sm text-[#0A66C2] hover:underline">
            Build your resume
          </Link>

          <Link href="/profile/share" className="block text-sm text-[#0A66C2] hover:underline">
            Share your profile
          </Link>

          <Link href="/network" className="block text-sm text-[#0A66C2] hover:underline">
            Grow your network
          </Link>
        </div>
      </div>
    </aside>
  );
}
