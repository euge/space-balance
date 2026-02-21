import InteractivePieChart from "@/components/interactive-pie-chart"

export default function Page() {
  return (
    <main className="min-h-svh flex items-center justify-center bg-background py-8 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-foreground text-center mb-6 text-balance">
          Space Balance
        </h1>
        <InteractivePieChart />
      </div>
    </main>
  )
}
