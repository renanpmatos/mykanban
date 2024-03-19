import KanbanBoard from "@/components/KanbanBoard";

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center items-center pt-16 bg-slate-950">
        <p className=" text-6xl text-white font-bold">
          <span className="text-teal-400">my</span>Kanban
        </p>
      </div>

      <KanbanBoard />
    </div>
  );
}
