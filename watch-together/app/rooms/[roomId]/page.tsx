import { Suspense } from "react";
import RoomPageContent from "./RoomPageContent";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 text-white">
          <div className="mx-auto max-w-5xl space-y-6 p-6">Loading room...</div>
        </main>
      }
    >
      <RoomPageContent params={params} />
    </Suspense>
  );
}
