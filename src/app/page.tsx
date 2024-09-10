import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  return (
    <>
      <div className="h-screen w-full flex justify-center items-center flex-col gap-4">
        <h1 className="text-4xl font-semibold">IVAR Pneumatic sandbox</h1>
        <div className="w-96 bg-gray-100 p-4 gap-4 rounded-sm flex flex-col justify-center items-center">
          <Button asChild className="w-full">
            <Link href="/ar">AR demo</Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/ar-tasks">AR-Exercises</Link>
          </Button>
        </div>
      </div>
    </>
  )
}