import dynamic from "next/dynamic";

const KanbanBoard = dynamic(
  // para previnir erros de SSR e usar localStorage
  () => {
    return import("@/components/KanbanBoard");
  },
  { ssr: false }
);

export default function Home() {
  return (
    <div className="flex flex-col bg-slate-950">
      <div className="flex flex-col justify-center items-center pt-16 ">
        <p className=" text-6xl text-white font-bold">
          <span className="text-teal-400">my</span>Kanban
        </p>
      </div>

      <KanbanBoard />
    </div>
  );
}
