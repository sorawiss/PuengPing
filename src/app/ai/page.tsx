import { AiMatchPanel } from "@/components/ai-match-panel";

export default function AiPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mt-auto">
        <AiMatchPanel />
      </div>
    </main>
  );
}
