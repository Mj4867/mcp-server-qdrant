import { notFound } from "next/navigation";
import { AGENTS, getAgent } from "@/lib/agents";
import { ChatBox } from "@/components/ChatBox";

export function generateStaticParams() {
  return AGENTS.map((a) => ({ slug: a.slug }));
}

export default function AgentPage({ params }: { params: { slug: string } }) {
  const agent = getAgent(params.slug);
  if (!agent) notFound();

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:py-6">
      <div className="min-h-0 flex-1">
        <ChatBox agent={agent} />
      </div>
    </div>
  );
}
